from typing import Optional
from pydantic import BaseModel, Field


class TokenClaims(BaseModel):
    sub: str
    role: str  # 'master' | 'corretor'
    local_id: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    local_id: Optional[str] = None
    local_nome: Optional[str] = None


class MeResponse(BaseModel):
    role: str
    local_id: Optional[str] = None
    local_nome: Optional[str] = None


class LoginMasterRequest(BaseModel):
    senha: str


class LoginCorretorRequest(BaseModel):
    local_id: str
    senha: str


# --- Locais ---

class LocalPublic(BaseModel):
    """Versão exposta publicamente (tela de login) — nunca inclui senha_hash."""
    id: str
    nome: str


class LocalOut(BaseModel):
    id: str
    nome: str
    tem_senha: bool = Field(description="Indica se a senha do local já foi configurada")


class LocalCreate(BaseModel):
    nome: str
    senha: Optional[str] = None


class LocalUpdate(BaseModel):
    nome: Optional[str] = None
    senha: Optional[str] = None


# --- Perfis ---

class PerfilOut(BaseModel):
    id: str
    nome: str


class PerfilCreate(BaseModel):
    nome: str


class PerfilUpdate(BaseModel):
    nome: str


# --- Usuarios ---

class UsuarioOut(BaseModel):
    id: str
    nome_login: str
    sobrenome: Optional[str] = None
    local_id: str
    perfil_id: str


class UsuarioCreate(BaseModel):
    nome_login: str
    sobrenome: Optional[str] = None
    local_id: str
    perfil_id: str


class UsuarioUpdate(BaseModel):
    nome_login: Optional[str] = None
    sobrenome: Optional[str] = None
    local_id: Optional[str] = None
    perfil_id: Optional[str] = None
