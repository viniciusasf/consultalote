from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_claims
from app.models.auth import (
    LocalPublic, LoginCorretorRequest, LoginMasterRequest, MeResponse, TokenClaims, TokenResponse,
)
from app.repositories.supabase_auth_repo import SupabaseLocalRepository
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticação"])


def get_auth_service() -> AuthService:
    return AuthService(SupabaseLocalRepository())


@router.get("/locais", response_model=List[LocalPublic], summary="Lista pública de locais (dropdown de login)")
def list_locais_publico(service: AuthService = Depends(get_auth_service)):
    return [LocalPublic(id=id_, nome=nome) for id_, nome in service.list_locais_publico()]


@router.post("/login/master", response_model=TokenResponse, summary="Login do perfil Master")
def login_master(req: LoginMasterRequest, service: AuthService = Depends(get_auth_service)):
    try:
        return service.login_master(req)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/login/corretor", response_model=TokenResponse, summary="Login do perfil Corretor (Local + senha)")
def login_corretor(req: LoginCorretorRequest, service: AuthService = Depends(get_auth_service)):
    try:
        return service.login_corretor(req)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=MeResponse, summary="Dados da sessão atual")
def me(claims: TokenClaims = Depends(get_current_claims), service: AuthService = Depends(get_auth_service)):
    local_nome = None
    if claims.local_id:
        locais = dict(service.list_locais_publico())
        local_nome = locais.get(claims.local_id)
    return MeResponse(role=claims.role, local_id=claims.local_id, local_nome=local_nome)
