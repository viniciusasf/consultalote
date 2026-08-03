from typing import Optional
from app.repositories.base import LoteRepository
from app.models.lote import Lote, LoteFilterParams, LoteListResponse

class LoteService:
    def __init__(self, repository: LoteRepository):
        self.repository = repository

    def list_lotes(self, filters: LoteFilterParams) -> LoteListResponse:
        items, filtered_count = self.repository.get_lotes_filtered(filters)
        total = self.repository.count_all(local_id=filters.local_id)
        glebas, quadras = self.repository.get_filter_options(local_id=filters.local_id)

        return LoteListResponse(
            total=total,
            count=filtered_count,
            glebas_disponiveis=glebas,
            quadras_disponiveis=quadras,
            items=items
        )

    def get_lote_by_id(self, id_lote: str) -> Optional[Lote]:
        return self.repository.get_lote_by_id(id_lote)
