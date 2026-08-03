import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.v1.lotes import router as lotes_router
from app.api.v1.auth import router as auth_router
from app.api.v1.locais import router as locais_router
from app.api.v1.perfis import router as perfis_router
from app.api.v1.usuarios import router as usuarios_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Checagem de conectividade com o Supabase ao iniciar o servidor."""
    from app.repositories.supabase_repo import SupabaseLoteRepository
    import logging
    logger = logging.getLogger("uvicorn.error")
    try:
        logger.info("🔄 Verificando conexão com o Supabase...")
        repo = SupabaseLoteRepository()
        loop = asyncio.get_event_loop()
        total = await loop.run_in_executor(None, repo.count_all)
        logger.info(f"✅ Supabase conectado: {total} lotes disponíveis.")
    except Exception as e:
        logger.warning(f"⚠️  Falha ao conectar no Supabase: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configuração de CORS para permitir acesso do frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rotas v1
app.include_router(lotes_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(locais_router, prefix=settings.API_V1_STR)
app.include_router(perfis_router, prefix=settings.API_V1_STR)
app.include_router(usuarios_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }
