from typing import List, Optional, Tuple

from postgrest.exceptions import APIError
from supabase import create_client, Client

from app.core.config import get_settings
from app.core.security import hash_password
from app.models.auth import (
    LocalCreate, LocalUpdate,
    PerfilCreate, PerfilUpdate,
    UsuarioCreate, UsuarioUpdate,
)
from app.repositories.auth_base import LocalRepository, PerfilRepository, UsuarioRepository

FK_VIOLATION = "23503"


def _client() -> Client:
    settings = get_settings()
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


class SupabaseLocalRepository(LocalRepository):
    TABLE = "locais"

    def __init__(self):
        self.client = _client()

    def list_public(self) -> List[Tuple[str, str]]:
        result = self.client.table(self.TABLE).select("id,nome").order("nome").execute()
        return [(row["id"], row["nome"]) for row in result.data]

    def list_all(self) -> List[dict]:
        result = self.client.table(self.TABLE).select("id,nome,senha_hash").order("nome").execute()
        return [
            {"id": row["id"], "nome": row["nome"], "tem_senha": bool(row.get("senha_hash"))}
            for row in result.data
        ]

    def get_by_id(self, local_id: str) -> Optional[dict]:
        result = self.client.table(self.TABLE).select("id,nome,senha_hash").eq("id", local_id).limit(1).execute()
        if not result.data:
            return None
        row = result.data[0]
        return {"id": row["id"], "nome": row["nome"], "tem_senha": bool(row.get("senha_hash"))}

    def get_senha_hash(self, local_id: str) -> Optional[str]:
        result = self.client.table(self.TABLE).select("senha_hash").eq("id", local_id).limit(1).execute()
        if not result.data:
            return None
        return result.data[0].get("senha_hash")

    def create(self, data: LocalCreate) -> dict:
        payload = {"nome": data.nome}
        if data.senha:
            payload["senha_hash"] = hash_password(data.senha)
        result = self.client.table(self.TABLE).insert(payload).execute()
        row = result.data[0]
        return {"id": row["id"], "nome": row["nome"], "tem_senha": bool(row.get("senha_hash"))}

    def update(self, local_id: str, data: LocalUpdate) -> Optional[dict]:
        payload = {}
        if data.nome is not None:
            payload["nome"] = data.nome
        if data.senha:
            payload["senha_hash"] = hash_password(data.senha)
        if not payload:
            return self.get_by_id(local_id)
        result = self.client.table(self.TABLE).update(payload).eq("id", local_id).execute()
        if not result.data:
            return None
        row = result.data[0]
        return {"id": row["id"], "nome": row["nome"], "tem_senha": bool(row.get("senha_hash"))}

    def delete(self, local_id: str) -> None:
        try:
            self.client.table(self.TABLE).delete().eq("id", local_id).execute()
        except APIError as e:
            if e.code == FK_VIOLATION:
                raise ValueError("Local ainda possui usuários ou lotes vinculados") from e
            raise


class SupabasePerfilRepository(PerfilRepository):
    TABLE = "perfis"

    def __init__(self):
        self.client = _client()

    def list_all(self) -> List[dict]:
        result = self.client.table(self.TABLE).select("id,nome").order("nome").execute()
        return result.data

    def get_by_id(self, perfil_id: str) -> Optional[dict]:
        result = self.client.table(self.TABLE).select("id,nome").eq("id", perfil_id).limit(1).execute()
        return result.data[0] if result.data else None

    def create(self, data: PerfilCreate) -> dict:
        result = self.client.table(self.TABLE).insert({"nome": data.nome}).execute()
        return result.data[0]

    def update(self, perfil_id: str, data: PerfilUpdate) -> Optional[dict]:
        existente = self.get_by_id(perfil_id)
        if existente and existente["nome"] in self.SEED_NOMES:
            raise ValueError("Não é possível renomear um perfil padrão do sistema")
        result = self.client.table(self.TABLE).update({"nome": data.nome}).eq("id", perfil_id).execute()
        return result.data[0] if result.data else None

    def delete(self, perfil_id: str) -> None:
        existente = self.get_by_id(perfil_id)
        if existente and existente["nome"] in self.SEED_NOMES:
            raise ValueError(f"O perfil '{existente['nome']}' é padrão do sistema e não pode ser excluído")
        try:
            self.client.table(self.TABLE).delete().eq("id", perfil_id).execute()
        except APIError as e:
            if e.code == FK_VIOLATION:
                raise ValueError("Perfil ainda possui usuários vinculados") from e
            raise


class SupabaseUsuarioRepository(UsuarioRepository):
    TABLE = "usuarios"

    def __init__(self):
        self.client = _client()

    def list_all(self) -> List[dict]:
        result = self.client.table(self.TABLE).select("*").order("nome_login").execute()
        return result.data

    def get_by_id(self, usuario_id: str) -> Optional[dict]:
        result = self.client.table(self.TABLE).select("*").eq("id", usuario_id).limit(1).execute()
        return result.data[0] if result.data else None

    def create(self, data: UsuarioCreate) -> dict:
        result = self.client.table(self.TABLE).insert(data.model_dump()).execute()
        return result.data[0]

    def update(self, usuario_id: str, data: UsuarioUpdate) -> Optional[dict]:
        payload = {k: v for k, v in data.model_dump().items() if v is not None}
        if not payload:
            return self.get_by_id(usuario_id)
        result = self.client.table(self.TABLE).update(payload).eq("id", usuario_id).execute()
        return result.data[0] if result.data else None

    def delete(self, usuario_id: str) -> None:
        self.client.table(self.TABLE).delete().eq("id", usuario_id).execute()
