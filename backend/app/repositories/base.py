from abc import ABC, abstractmethod
from typing import List, Optional, Tuple
from app.models.lote import Lote, LoteFilterParams

class LoteRepository(ABC):
    """
    Interface abstrata do Repositório de Lotes.
    Garante que qualquer implementação (Supabase, mock de testes, etc.)
    siga o mesmo contrato sem impactar os serviços e a API REST.
    """

    @abstractmethod
    def get_lote_by_id(self, id_lote: str) -> Optional[Lote]:
        """Retorna um lote específico por seu ID único."""
        pass

    @abstractmethod
    def count_all(self) -> int:
        """Retorna a quantidade total de lotes cadastrados, sem aplicar filtros."""
        pass

    @abstractmethod
    def get_lotes_filtered(self, filters: LoteFilterParams) -> Tuple[List[Lote], int]:
        """Retorna (itens filtrados/ordenados conforme filters, quantidade filtrada)."""
        pass

    @abstractmethod
    def get_filter_options(self) -> Tuple[List[str], List[str]]:
        """Retorna (glebas_disponiveis, quadras_disponiveis) ordenadas."""
        pass
