import re
from typing import List, Optional, Tuple
from supabase import create_client, Client
from app.repositories.base import LoteRepository
from app.models.lote import Lote, LoteFilterParams
from app.core.config import get_settings

TABLE = "lotes"

# Caracteres que têm significado especial no filtro or_() do PostgREST
_OR_FILTER_UNSAFE_CHARS = re.compile(r"[,()]")

_ORDER_COLUMNS = {
    "preco_asc": ("preco_vista", False),
    "preco_desc": ("preco_vista", True),
    "area_asc": ("area_m2", False),
    "area_desc": ("area_m2", True),
    "lote_asc": ("quadra", False),
}


class SupabaseLoteRepository(LoteRepository):
    """
    Implementação concreta do LoteRepository que lê/filtra os dados na tabela
    "lotes" do Supabase (Postgres via PostgREST), delegando filtro e ordenação
    ao banco para aproveitar os índices criados em backend/supabase/schema.sql.
    """

    def __init__(self):
        settings = get_settings()
        self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    def get_lote_by_id(self, id_lote: str) -> Optional[Lote]:
        result = (
            self.client.table(TABLE)
            .select("*")
            .ilike("id", id_lote)
            .limit(1)
            .execute()
        )
        if not result.data:
            return None
        return Lote(**result.data[0])

    def count_all(self) -> int:
        result = self.client.table(TABLE).select("id", count="exact", head=True).execute()
        return result.count or 0

    def get_filter_options(self) -> Tuple[List[str], List[str]]:
        result = self.client.table(TABLE).select("gleba,quadra").execute()
        glebas = sorted({row["gleba"] for row in result.data if row.get("gleba")})
        quadras = sorted({row["quadra"] for row in result.data if row.get("quadra")})
        return glebas, quadras

    def get_lotes_filtered(self, filters: LoteFilterParams) -> Tuple[List[Lote], int]:
        query = self.client.table(TABLE).select("*", count="exact")

        if filters.q:
            q = _OR_FILTER_UNSAFE_CHARS.sub("", filters.q.strip())
            if q:
                or_conditions = [f"lote.ilike.%{q}%", f"quadra.ilike.%{q}%", f"id.ilike.%{q}%"]
                if q.isdigit():
                    # tamanho_categoria é numeric no banco: PostgREST não aceita
                    # cast (::text) dentro do or_(), então comparamos por igualdade.
                    or_conditions.append(f"tamanho_categoria.eq.{int(q)}")
                query = query.or_(",".join(or_conditions))

        if filters.gleba:
            query = query.ilike("gleba", filters.gleba.strip())

        if filters.quadra:
            query = query.ilike("quadra", filters.quadra.strip())

        if filters.tamanho_categoria is not None:
            query = query.eq("tamanho_categoria", filters.tamanho_categoria)

        if filters.area_min is not None:
            query = query.gte("area_m2", filters.area_min)
        if filters.area_max is not None:
            query = query.lte("area_m2", filters.area_max)

        if filters.preco_min is not None:
            query = query.gte("preco_vista", filters.preco_min)
        if filters.preco_max is not None:
            query = query.lte("preco_vista", filters.preco_max)

        column, desc = _ORDER_COLUMNS.get(filters.order_by, _ORDER_COLUMNS["preco_asc"])
        query = query.order(column, desc=desc)
        if filters.order_by == "lote_asc":
            query = query.order("ordem", desc=False)

        result = query.execute()
        items = [Lote(**row) for row in result.data]
        return items, result.count or 0
