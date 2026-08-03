from typing import List, Tuple

from app.core.config import get_settings
from app.core.security import create_access_token, verify_password
from app.models.auth import LoginCorretorRequest, LoginMasterRequest, TokenResponse
from app.repositories.auth_base import LocalRepository


class AuthService:
    def __init__(self, local_repository: LocalRepository):
        self.local_repository = local_repository

    def login_master(self, req: LoginMasterRequest) -> TokenResponse:
        settings = get_settings()
        if not verify_password(req.senha, settings.MASTER_PASSWORD_HASH):
            raise PermissionError("Senha de Master incorreta")
        token = create_access_token(role="master", local_id=None)
        return TokenResponse(access_token=token, role="master")

    def login_corretor(self, req: LoginCorretorRequest) -> TokenResponse:
        local = self.local_repository.get_by_id(req.local_id)
        if not local:
            raise PermissionError("Local não encontrado")
        senha_hash = self.local_repository.get_senha_hash(req.local_id)
        if not senha_hash:
            raise PermissionError("Local ainda não configurado (sem senha definida)")
        if not verify_password(req.senha, senha_hash):
            raise PermissionError("Senha do Local incorreta")
        token = create_access_token(role="corretor", local_id=local["id"], sub=local["id"])
        return TokenResponse(
            access_token=token, role="corretor", local_id=local["id"], local_nome=local["nome"]
        )

    def list_locais_publico(self) -> List[Tuple[str, str]]:
        return self.local_repository.list_public()
