from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Consulta de Lotes Resort API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Supabase (fonte de dados principal)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # URL de exportação da planilha Google Sheets (usada só pelo script de importação)
    SPREADSHEET_ID: str = "1QDz2tiAKs_9YoAsFh1WMHj9UF8IyKhl4lifvdJLW6AM"
    @property
    def SPREADSHEET_CSV_URL(self) -> str:
        return f"https://docs.google.com/spreadsheets/d/{self.SPREADSHEET_ID}/export?format=csv"

    # Tempo de cache em segundos (ex: 15 minutos = 900s)
    CACHE_TTL_SECONDS: int = 900

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

    # Autenticação (Master/Corretor)
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24h; sem refresh token, expira -> loga de novo
    MASTER_PASSWORD_HASH: str = ""  # gerado por backend/scripts/hash_password.py

    # Local padrão usado pelos scripts de reimportação quando --local não é informado
    DEFAULT_LOCAL_NOME: str = "SANTA BARBARA RESORT RESIDENCE"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

@lru_cache()
def get_settings() -> Settings:
    return Settings()
