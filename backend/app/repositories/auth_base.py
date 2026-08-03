from abc import ABC, abstractmethod
from typing import List, Optional, Tuple

from app.models.auth import (
    LocalCreate, LocalUpdate,
    PerfilCreate, PerfilUpdate,
    UsuarioCreate, UsuarioUpdate,
)


class LocalRepository(ABC):
    @abstractmethod
    def list_public(self) -> List[Tuple[str, str]]:
        """Retorna [(id, nome), ...] de todos os locais, para o dropdown de login."""
        pass

    @abstractmethod
    def list_all(self) -> List[dict]:
        """Retorna todos os locais com metadados de admin (sem expor senha_hash em texto)."""
        pass

    @abstractmethod
    def get_by_id(self, local_id: str) -> Optional[dict]:
        pass

    @abstractmethod
    def get_senha_hash(self, local_id: str) -> Optional[str]:
        pass

    @abstractmethod
    def create(self, data: LocalCreate) -> dict:
        pass

    @abstractmethod
    def update(self, local_id: str, data: LocalUpdate) -> Optional[dict]:
        pass

    @abstractmethod
    def delete(self, local_id: str) -> None:
        """Deve levantar ValueError se houver usuários/lotes vinculados (violação de FK)."""
        pass


class PerfilRepository(ABC):
    SEED_NOMES = ("master", "corretor")

    @abstractmethod
    def list_all(self) -> List[dict]:
        pass

    @abstractmethod
    def get_by_id(self, perfil_id: str) -> Optional[dict]:
        pass

    @abstractmethod
    def create(self, data: PerfilCreate) -> dict:
        pass

    @abstractmethod
    def update(self, perfil_id: str, data: PerfilUpdate) -> Optional[dict]:
        pass

    @abstractmethod
    def delete(self, perfil_id: str) -> None:
        """Deve levantar ValueError se for um perfil-semente ou se houver usuários vinculados."""
        pass


class UsuarioRepository(ABC):
    @abstractmethod
    def list_all(self) -> List[dict]:
        pass

    @abstractmethod
    def get_by_id(self, usuario_id: str) -> Optional[dict]:
        pass

    @abstractmethod
    def create(self, data: UsuarioCreate) -> dict:
        pass

    @abstractmethod
    def update(self, usuario_id: str, data: UsuarioUpdate) -> Optional[dict]:
        pass

    @abstractmethod
    def delete(self, usuario_id: str) -> None:
        pass
