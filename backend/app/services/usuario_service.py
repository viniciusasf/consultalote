from typing import List, Optional

from app.models.auth import UsuarioCreate, UsuarioUpdate
from app.repositories.auth_base import UsuarioRepository


class UsuarioService:
    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def list_all(self) -> List[dict]:
        return self.repository.list_all()

    def get_by_id(self, usuario_id: str) -> Optional[dict]:
        return self.repository.get_by_id(usuario_id)

    def create(self, data: UsuarioCreate) -> dict:
        return self.repository.create(data)

    def update(self, usuario_id: str, data: UsuarioUpdate) -> Optional[dict]:
        return self.repository.update(usuario_id, data)

    def delete(self, usuario_id: str) -> None:
        self.repository.delete(usuario_id)
