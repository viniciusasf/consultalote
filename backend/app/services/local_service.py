from typing import List, Optional

from app.models.auth import LocalCreate, LocalUpdate
from app.repositories.auth_base import LocalRepository


class LocalService:
    def __init__(self, repository: LocalRepository):
        self.repository = repository

    def list_all(self) -> List[dict]:
        return self.repository.list_all()

    def get_by_id(self, local_id: str) -> Optional[dict]:
        return self.repository.get_by_id(local_id)

    def create(self, data: LocalCreate) -> dict:
        return self.repository.create(data)

    def update(self, local_id: str, data: LocalUpdate) -> Optional[dict]:
        return self.repository.update(local_id, data)

    def delete(self, local_id: str) -> None:
        self.repository.delete(local_id)
