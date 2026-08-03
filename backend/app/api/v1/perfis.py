from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import require_master
from app.models.auth import PerfilCreate, PerfilOut, PerfilUpdate
from app.repositories.supabase_auth_repo import SupabasePerfilRepository
from app.services.perfil_service import PerfilService

router = APIRouter(prefix="/perfis", tags=["Admin • Perfis"], dependencies=[Depends(require_master)])


def get_perfil_service() -> PerfilService:
    return PerfilService(SupabasePerfilRepository())


@router.get("", response_model=List[PerfilOut])
def list_perfis(service: PerfilService = Depends(get_perfil_service)):
    return service.list_all()


@router.post("", response_model=PerfilOut, status_code=status.HTTP_201_CREATED)
def create_perfil(data: PerfilCreate, service: PerfilService = Depends(get_perfil_service)):
    return service.create(data)


@router.put("/{perfil_id}", response_model=PerfilOut)
def update_perfil(perfil_id: str, data: PerfilUpdate, service: PerfilService = Depends(get_perfil_service)):
    try:
        result = service.update(perfil_id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil não encontrado")
    return result


@router.delete("/{perfil_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_perfil(perfil_id: str, service: PerfilService = Depends(get_perfil_service)):
    try:
        service.delete(perfil_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
