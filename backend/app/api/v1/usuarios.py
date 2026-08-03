from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from postgrest.exceptions import APIError

from app.core.security import require_master
from app.models.auth import UsuarioCreate, UsuarioOut, UsuarioUpdate
from app.repositories.supabase_auth_repo import SupabaseUsuarioRepository
from app.services.usuario_service import UsuarioService

router = APIRouter(prefix="/usuarios", tags=["Admin • Usuários"], dependencies=[Depends(require_master)])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(SupabaseUsuarioRepository())


@router.get("", response_model=List[UsuarioOut])
def list_usuarios(service: UsuarioService = Depends(get_usuario_service)):
    return service.list_all()


@router.post("", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def create_usuario(data: UsuarioCreate, service: UsuarioService = Depends(get_usuario_service)):
    try:
        return service.create(data)
    except APIError as e:
        # local_id/perfil_id inexistente (violação de FK) vira 409, não 500
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{usuario_id}", response_model=UsuarioOut)
def update_usuario(usuario_id: str, data: UsuarioUpdate, service: UsuarioService = Depends(get_usuario_service)):
    result = service.update(usuario_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    return result


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(usuario_id: str, service: UsuarioService = Depends(get_usuario_service)):
    service.delete(usuario_id)
