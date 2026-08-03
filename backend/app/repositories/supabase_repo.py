import re
from typing import List, Optional, Tuple
from supabase import create_client, Client
from app.repositories.base import LoteRepository
from app.models.lote import Lote, LoteFilterParams
from app.core.config import get_settings

TABLE = "lotes"

# PostgREST limita o nº de linhas retornadas por requisição (db-max-rows,
# tipicamente 1000) independente do que for pedido. Sem paginar via .range(),
# qualquer tabela com mais linhas que esse limite tem o resultado truncado
# silenciosamente na ordem física/default — foi o que escondia as Glebas 2 e 3
# (a tabela tem 3850 lotes, acima do limite de 1000).
_PAGE_SIZE = 1000

# Caracteres que têm significado especial no filtro or_() do PostgREST
_OR_FILTER_UNSAFE_CHARS = re.compile(r"[,()]")

# Usado para extrair o número de buscas como "Item #1081" ou "1081"
_NON_DIGITS = re.compile(r"\D")

_ORDER_COLUMNS = {
    "preco_asc": ("valor_base", False),
    "preco_desc": ("valor_base", True),
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

    def count_all(self, local_id: Optional[str] = None) -> int:
        query = self.client.table(TABLE).select("id", count="exact", head=True)
        if local_id:
            query = query.eq("local_id", local_id)
        result = query.execute()
        return result.count or 0

    def _fetch_all_rows(self, build_query) -> Tuple[List[dict], int]:
        """Percorre todas as páginas de uma query via .range(), já que o
        PostgREST trunca silenciosamente para no máx. ~1000 linhas por
        requisição (db-max-rows) quando isso não é feito explicitamente."""
        rows: List[dict] = []
        total = 0
        offset = 0
        while True:
            result = build_query().range(offset, offset + _PAGE_SIZE - 1).execute()
            if offset == 0:
                total = result.count or 0
            rows.extend(result.data)
            if len(result.data) < _PAGE_SIZE:
                break
            offset += _PAGE_SIZE
        return rows, total

    def get_filter_options(self, local_id: Optional[str] = None) -> Tuple[List[str], List[str]]:
        def build_query():
            query = self.client.table(TABLE).select("gleba,quadra", count="exact")
            if local_id:
                query = query.eq("local_id", local_id)
            return query

        rows, _ = self._fetch_all_rows(build_query)
        glebas = sorted({row["gleba"] for row in rows if row.get("gleba")})
        quadras = sorted({row["quadra"] for row in rows if row.get("quadra")})
        return glebas, quadras

    def get_lotes_filtered(self, filters: LoteFilterParams) -> Tuple[List[Lote], int]:
        def build_query():
            query = self.client.table(TABLE).select("*", count="exact")

            if filters.local_id:
                query = query.eq("local_id", filters.local_id)

            if filters.q:
                q = _OR_FILTER_UNSAFE_CHARS.sub("", filters.q.strip())
                if q:
                    or_conditions = [f"lote.ilike.%{q}%", f"quadra.ilike.%{q}%", f"id.ilike.%{q}%"]
                    if q.isdigit():
                        # tamanho_categoria é numeric no banco: PostgREST não aceita
                        # cast (::text) dentro do or_(), então comparamos por igualdade.
                        or_conditions.append(f"tamanho_categoria.eq.{int(q)}")
                    # Permite buscar pelo "Item #1081" exibido no modal de detalhes,
                    # digitando só o número ou o texto completo com o "#".
                    digitos = _NON_DIGITS.sub("", q)
                    if digitos:
                        or_conditions.append(f"ordem.eq.{int(digitos)}")
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

            return query

        rows, total = self._fetch_all_rows(build_query)
        items = [Lote(**row) for row in rows]
        return items, total
