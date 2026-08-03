from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import require_master
from app.models.auth import LocalCreate, LocalOut, LocalUpdate
from app.repositories.supabase_auth_repo import SupabaseLocalRepository
from app.services.local_service import LocalService

router = APIRouter(prefix="/locais", tags=["Admin • Locais"], dependencies=[Depends(require_master)])


def get_local_service() -> LocalService:
    return LocalService(SupabaseLocalRepository())


@router.get("", response_model=List[LocalOut])
def list_locais(service: LocalService = Depends(get_local_service)):
    return service.list_all()


@router.post("", response_model=LocalOut, status_code=status.HTTP_201_CREATED)
def create_local(data: LocalCreate, service: LocalService = Depends(get_local_service)):
    return service.create(data)


@router.put("/{local_id}", response_model=LocalOut)
def update_local(local_id: str, data: LocalUpdate, service: LocalService = Depends(get_local_service)):
    result = service.update(local_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Local não encontrado")
    return result


@router.delete("/{local_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_local(local_id: str, service: LocalService = Depends(get_local_service)):
    try:
        service.delete(local_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
