import jwt
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import get_settings
from app.core.security import (
    create_access_token, decode_access_token, get_current_claims, hash_password, verify_password,
)
from app.models.auth import TokenClaims
from app.models.lote import Lote
from app.repositories.auth_base import LocalRepository
from app.repositories.base import LoteRepository
from app.services.auth_service import AuthService
from app.services.lote_service import LoteService
from app.services.lote_filtering import filter_and_sort_lotes, filter_options
from app.api.v1.auth import get_auth_service
from app.api.v1.lotes import get_lote_service

client = TestClient(app)

LOCAL_A = "local-a"
LOCAL_B = "local-b"


class FakeLocalRepository(LocalRepository):
    """Repositório de Locais em memória, para testar login sem tocar no Supabase."""

    def __init__(self):
        self._locais = {
            LOCAL_A: {"id": LOCAL_A, "nome": "Local A", "senha_hash": hash_password("senhaA")},
            LOCAL_B: {"id": LOCAL_B, "nome": "Local B", "senha_hash": hash_password("senhaB")},
        }

    def list_public(self):
        return [(l["id"], l["nome"]) for l in self._locais.values()]

    def list_all(self):
        return [{"id": l["id"], "nome": l["nome"], "tem_senha": bool(l.get("senha_hash"))} for l in self._locais.values()]

    def get_by_id(self, local_id):
        return self._locais.get(local_id)

    def get_senha_hash(self, local_id):
        local = self._locais.get(local_id)
        return local.get("senha_hash") if local else None

    def create(self, data):
        raise NotImplementedError

    def update(self, local_id, data):
        raise NotImplementedError

    def delete(self, local_id):
        raise NotImplementedError


class TwoLocalMockLoteRepository(LoteRepository):
    """Um lote em cada Local — usado para provar que o isolamento por local_id
    realmente bloqueia acesso cruzado, inclusive via manipulação da query string."""

    def __init__(self):
        self.lotes = [
            Lote(id="lote-a1", quadra="AA", lote="1", gleba="1", area_m2=300, preco_vista=100000, valor_base=100000, local_id=LOCAL_A),
            Lote(id="lote-b1", quadra="BB", lote="1", gleba="1", area_m2=300, preco_vista=100000, valor_base=100000, local_id=LOCAL_B),
        ]

    def get_lote_by_id(self, id_lote):
        for l in self.lotes:
            if l.id == id_lote:
                return l
        return None

    def count_all(self, local_id=None):
        if local_id:
            return len([l for l in self.lotes if l.local_id == local_id])
        return len(self.lotes)

    def get_lotes_filtered(self, filters):
        items = filter_and_sort_lotes(self.lotes, filters)
        return items, len(items)

    def get_filter_options(self, local_id=None):
        lotes = [l for l in self.lotes if l.local_id == local_id] if local_id else self.lotes
        return filter_options(lotes)


@pytest.fixture(autouse=True)
def isolate_dependency_overrides():
    """test_lotes.py define um override global (sessão Master) em app.dependency_overrides
    no nível do módulo — como `app` é um singleton importado por todos os testes, isso
    vazaria para cá. Isola cada teste deste módulo com seu próprio estado limpo."""
    saved = app.dependency_overrides.copy()
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()
    app.dependency_overrides.update(saved)


# --- security.py: funções puras ---

def test_hash_and_verify_password_roundtrip():
    hashed = hash_password("minhasenha123")
    assert verify_password("minhasenha123", hashed) is True
    assert verify_password("senhaerrada", hashed) is False


def test_verify_password_none_or_malformed_hash_never_raises():
    assert verify_password("qualquer", None) is False
    assert verify_password("qualquer", "") is False
    assert verify_password("qualquer", "isso-nao-e-um-hash-bcrypt") is False


def test_create_and_decode_access_token_roundtrip():
    token = create_access_token(role="corretor", local_id=LOCAL_A)
    claims = decode_access_token(token)
    assert claims.role == "corretor"
    assert claims.local_id == LOCAL_A


def test_decode_expired_token_raises_401():
    import datetime
    settings = get_settings()
    now = datetime.datetime.now(datetime.timezone.utc)
    expired_payload = {
        "sub": "master", "role": "master", "local_id": None,
        "iat": now - datetime.timedelta(hours=2),
        "exp": now - datetime.timedelta(hours=1),
    }
    expired_token = jwt.encode(expired_payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token(expired_token)
    assert exc_info.value.status_code == 401


# --- endpoints de login ---

def test_login_master_success(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "MASTER_PASSWORD_HASH", hash_password("adminsenha"))
    resp = client.post("/api/v1/auth/login/master", json={"senha": "adminsenha"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["role"] == "master"
    assert body["access_token"]


def test_login_master_wrong_password(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "MASTER_PASSWORD_HASH", hash_password("adminsenha"))
    resp = client.post("/api/v1/auth/login/master", json={"senha": "errada"})
    assert resp.status_code == 401


def test_login_corretor_success_wrong_password_and_unknown_local():
    app.dependency_overrides[get_auth_service] = lambda: AuthService(FakeLocalRepository())

    ok = client.post("/api/v1/auth/login/corretor", json={"local_id": LOCAL_A, "senha": "senhaA"})
    assert ok.status_code == 200
    assert ok.json()["role"] == "corretor"
    assert ok.json()["local_id"] == LOCAL_A

    wrong = client.post("/api/v1/auth/login/corretor", json={"local_id": LOCAL_A, "senha": "errada"})
    assert wrong.status_code == 401

    unknown = client.post("/api/v1/auth/login/corretor", json={"local_id": "nao-existe", "senha": "x"})
    assert unknown.status_code == 401


def test_list_lotes_requires_authentication():
    resp = client.get("/api/v1/lotes")
    assert resp.status_code == 401


# --- teste crítico de segurança: isolamento por Local ---

def test_corretor_cannot_see_other_local_lotes_via_query_param():
    app.dependency_overrides[get_current_claims] = lambda: TokenClaims(sub=LOCAL_A, role="corretor", local_id=LOCAL_A)
    app.dependency_overrides[get_lote_service] = lambda: LoteService(TwoLocalMockLoteRepository())

    # Corretor do Local A tenta manipular a query string para ver o Local B
    resp = client.get("/api/v1/lotes", params={"local_id": LOCAL_B})
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1  # não vaza a contagem do outro local
    assert len(body["items"]) == 1
    assert all(item["local_id"] == LOCAL_A for item in body["items"])


def test_corretor_cannot_fetch_other_local_lote_by_id():
    app.dependency_overrides[get_current_claims] = lambda: TokenClaims(sub=LOCAL_A, role="corretor", local_id=LOCAL_A)
    app.dependency_overrides[get_lote_service] = lambda: LoteService(TwoLocalMockLoteRepository())

    resp = client.get("/api/v1/lotes/lote-b1")
    assert resp.status_code == 404


def test_master_sees_all_locais():
    app.dependency_overrides[get_current_claims] = lambda: TokenClaims(sub="master", role="master", local_id=None)
    app.dependency_overrides[get_lote_service] = lambda: LoteService(TwoLocalMockLoteRepository())

    resp = client.get("/api/v1/lotes")
    assert resp.status_code == 200
    assert resp.json()["total"] == 2
