import time
import io
import pandas as pd
import requests
from typing import List, Optional
from app.models.lote import Lote
from app.core.config import get_settings
from app.repositories.lote_dataframe_parser import parse_lotes_dataframe

class GoogleSheetsLoteRepository:
    """
    Leitor da planilha do Google Sheets, usado apenas pelo script de importação
    (backend/scripts/migrate_sheets_to_supabase.py) para popular o Supabase.
    Não implementa LoteRepository — a API roda sobre SupabaseLoteRepository.
    Possui suporte a cache em memória com TTL e parsing resiliente de cabeçalhos.
    """

    def __init__(self):
        self.settings = get_settings()
        self._cached_lotes: Optional[List[Lote]] = None
        self._last_fetch_timestamp: float = 0.0

    def _fetch_from_google_sheets(self) -> List[Lote]:
        url = self.settings.SPREADSHEET_CSV_URL
        response = requests.get(url, timeout=15)
        response.raise_for_status()

        # Usar io.StringIO para ler o conteúdo CSV retornado
        csv_data = response.content.decode('utf-8')
        df = pd.read_csv(io.StringIO(csv_data))

        return parse_lotes_dataframe(df)

    def get_all_lotes(self) -> List[Lote]:
        now = time.time()
        # Verificar se o cache é válido
        if (
            self._cached_lotes is not None
            and (now - self._last_fetch_timestamp) < self.settings.CACHE_TTL_SECONDS
        ):
            return self._cached_lotes

        try:
            lotes = self._fetch_from_google_sheets()
            self._cached_lotes = lotes
            self._last_fetch_timestamp = now
            return lotes
        except Exception as e:
            # Caso ocorra falha na conexão e exista cache prévio, retorna cache estático de fallback
            if self._cached_lotes is not None:
                return self._cached_lotes
            raise RuntimeError(f"Erro ao obter dados da planilha Google Sheets: {str(e)}")

    def get_lote_by_id(self, id_lote: str) -> Optional[Lote]:
        all_lotes = self.get_all_lotes()
        for lote in all_lotes:
            if lote.id.lower() == id_lote.lower():
                return lote
        return None
