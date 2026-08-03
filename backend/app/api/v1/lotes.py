from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from app.models.lote import LoteFilterParams, LoteListResponse, Lote
from app.models.auth import TokenClaims
from app.core.security import get_current_claims
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
    local_id: Optional[str] = Query(None, description="Filtro por Local (ignorado para o perfil Corretor)"),
    gleba: Optional[str] = Query(None, description="Filtro por Gleba"),
    quadra: Optional[str] = Query(None, description="Filtro por Quadra"),
    area_min: Optional[float] = Query(None, description="Área mínima (m²)"),
    area_max: Optional[float] = Query(None, description="Área máxima (m²)"),
    preco_min: Optional[float] = Query(None, description="Preço mínimo (R$)"),
    preco_max: Optional[float] = Query(None, description="Preço máximo (R$)"),
    tamanho_categoria: Optional[float] = Query(None, description="Tamanho do Lote (ex: 300, 400)"),
    order_by: Optional[str] = Query("preco_asc", description="Ordenação (preco_asc, preco_desc, area_asc, area_desc, lote_asc)"),
    claims: TokenClaims = Depends(get_current_claims),
    service: LoteService = Depends(get_lote_service)
):
    filters = LoteFilterParams(
        q=q,
        local_id=local_id,
        gleba=gleba,
        quadra=quadra,
        area_min=area_min,
        area_max=area_max,
        preco_min=preco_min,
        preco_max=preco_max,
        tamanho_categoria=tamanho_categoria,
        order_by=order_by
    )
    if claims.role == "corretor":
        # Nunca confiar no local_id vindo da query string — sempre o do token verificado.
        filters.local_id = claims.local_id
    return service.list_lotes(filters)

@router.get("/{id_lote}", response_model=Lote, summary="Obter detalhes de um lote por ID")
def get_lote_by_id(
    id_lote: str,
    claims: TokenClaims = Depends(get_current_claims),
    service: LoteService = Depends(get_lote_service)
):
    lote = service.get_lote_by_id(id_lote)
    if not lote:
        raise HTTPException(status_code=404, detail="Lote não encontrado")
    if claims.role == "corretor" and lote.local_id != claims.local_id:
        # 404, não 403: não confirma nem que o ID existe em outro Local.
        raise HTTPException(status_code=404, detail="Lote não encontrado")
    return lote
