from typing import List, Optional

from app.models.auth import PerfilCreate, PerfilUpdate
from app.repositories.auth_base import PerfilRepository


class PerfilService:
    def __init__(self, repository: PerfilRepository):
        self.repository = repository

    def list_all(self) -> List[dict]:
        return self.repository.list_all()

    def get_by_id(self, perfil_id: str) -> Optional[dict]:
        return self.repository.get_by_id(perfil_id)

    def create(self, data: PerfilCreate) -> dict:
        return self.repository.create(data)

    def update(self, perfil_id: str, data: PerfilUpdate) -> Optional[dict]:
        return self.repository.update(perfil_id, data)

    def delete(self, perfil_id: str) -> None:
        self.repository.delete(perfil_id)
