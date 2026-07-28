from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from app.models.lote import LoteFilterParams, LoteListResponse, Lote
from app.services.lote_service import LoteService
from app.repositories.supabase_repo import SupabaseLoteRepository

router = APIRouter(prefix="/lotes", tags=["Lotes"])

# Injeção de dependência para obter a instância do serviço
def get_lote_service() -> LoteService:
    repository = SupabaseLoteRepository()
    return LoteService(repository)

@router.get("", response_model=LoteListResponse, summary="Listar e filtrar lotes disponíveis")
def list_lotes(
    q: Optional[str] = Query(None, description="Busca por número do lote ou quadra"),
    gleba: Optional[str] = Query(None, description="Filtro por Gleba"),
    quadra: Optional[str] = Query(None, description="Filtro por Quadra"),
    area_min: Optional[float] = Query(None, description="Área mínima (m²)"),
    area_max: Optional[float] = Query(None, description="Área máxima (m²)"),
    preco_min: Optional[float] = Query(None, description="Preço mínimo (R$)"),
    preco_max: Optional[float] = Query(None, description="Preço máximo (R$)"),
    tamanho_categoria: Optional[float] = Query(None, description="Tamanho do Lote (ex: 300, 400)"),
    order_by: Optional[str] = Query("preco_asc", description="Ordenação (preco_asc, preco_desc, area_asc, area_desc, lote_asc)"),
    service: LoteService = Depends(get_lote_service)
):
    filters = LoteFilterParams(
        q=q,
        gleba=gleba,
        quadra=quadra,
        area_min=area_min,
        area_max=area_max,
        preco_min=preco_min,
        preco_max=preco_max,
        tamanho_categoria=tamanho_categoria,
        order_by=order_by
    )
    return service.list_lotes(filters)

@router.get("/{id_lote}", response_model=Lote, summary="Obter detalhes de um lote por ID")
def get_lote_by_id(
    id_lote: str,
    service: LoteService = Depends(get_lote_service)
):
    lote = service.get_lote_by_id(id_lote)
    if not lote:
        raise HTTPException(status_code=404, detail="Lote não encontrado")
    return lote
