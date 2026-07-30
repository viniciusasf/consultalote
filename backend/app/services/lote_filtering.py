from typing import List, Tuple
from app.models.lote import Lote, LoteFilterParams


def filter_and_sort_lotes(lotes: List[Lote], filters: LoteFilterParams) -> List[Lote]:
    """Filtragem/ordenação em memória. Usada por repositórios que não delegam ao SQL
    (ex: mocks de teste), espelhando o que o SupabaseLoteRepository faz via query."""
    filtered = lotes

    if filters.q:
        query = filters.q.strip().lower()
        filtered = [
            l for l in filtered
            if query in l.lote.lower()
            or query in l.quadra.lower()
            or query in l.id.lower()
            or (query.isdigit() and l.tamanho_categoria == int(query))
        ]

    if filters.gleba:
        filtered = [l for l in filtered if l.gleba.lower() == filters.gleba.strip().lower()]

    if filters.quadra:
        filtered = [l for l in filtered if l.quadra.lower() == filters.quadra.strip().lower()]

    if filters.tamanho_categoria is not None:
        filtered = [l for l in filtered if l.tamanho_categoria == filters.tamanho_categoria]

    if filters.area_min is not None:
        filtered = [l for l in filtered if l.area_m2 >= filters.area_min]
    if filters.area_max is not None:
        filtered = [l for l in filtered if l.area_m2 <= filters.area_max]

    if filters.preco_min is not None:
        filtered = [l for l in filtered if l.preco_vista >= filters.preco_min]
    if filters.preco_max is not None:
        filtered = [l for l in filtered if l.preco_vista <= filters.preco_max]

    if filters.order_by == "preco_asc":
        filtered = sorted(filtered, key=lambda l: l.preco_vista)
    elif filters.order_by == "preco_desc":
        filtered = sorted(filtered, key=lambda l: l.preco_vista, reverse=True)
    elif filters.order_by == "area_asc":
        filtered = sorted(filtered, key=lambda l: l.area_m2)
    elif filters.order_by == "area_desc":
        filtered = sorted(filtered, key=lambda l: l.area_m2, reverse=True)
    elif filters.order_by == "lote_asc":
        filtered = sorted(filtered, key=lambda l: (l.quadra, l.ordem or 0))

    return filtered


def filter_options(lotes: List[Lote]) -> Tuple[List[str], List[str]]:
    glebas = sorted({l.gleba for l in lotes if l.gleba})
    quadras = sorted({l.quadra for l in lotes if l.quadra})
    return glebas, quadras
