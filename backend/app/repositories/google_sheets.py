import time
import io
import pandas as pd
import requests
from typing import List, Optional
from app.models.lote import Lote
from app.core.config import get_settings

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

    def _clean_currency(self, val) -> Optional[float]:
        if pd.isna(val) or val is None:
            return None
        val_str = str(val).replace('R$', '').replace(' ', '').strip()
        if not val_str:
            return None
        # Trata formato brasileiro 145.812,43 -> 145812.43
        val_str = val_str.replace('.', '').replace(',', '.')
        try:
            return float(val_str)
        except ValueError:
            return None

    def _clean_float(self, val) -> Optional[float]:
        if pd.isna(val) or val is None:
            return None
        val_str = str(val).replace(' ', '').strip()
        if not val_str:
            return None
        val_str = val_str.replace('.', '').replace(',', '.')
        try:
            return float(val_str)
        except ValueError:
            return None

    def _clean_int(self, val) -> Optional[int]:
        f_val = self._clean_float(val)
        return int(f_val) if f_val is not None else None

    def _clean_str(self, val) -> str:
        if pd.isna(val) or val is None:
            return ""
        return str(val).strip()

    def _fetch_from_google_sheets(self) -> List[Lote]:
        url = self.settings.SPREADSHEET_CSV_URL
        response = requests.get(url, timeout=15)
        response.raise_for_status()

        # Usar io.StringIO para ler o conteúdo CSV retornado
        csv_data = response.content.decode('utf-8')
        df = pd.read_csv(io.StringIO(csv_data))

        # Mapeamento resiliente de cabeçalhos (normalizando para maiúsculas e sem espaços extras)
        col_map = {str(col).strip().upper(): col for col in df.columns}

        def get_col(possible_names: List[str]):
            for name in possible_names:
                name_upper = name.strip().upper()
                if name_upper in col_map:
                    return col_map[name_upper]
            return None

        col_ord = get_col(["ORD", "ORDEM"])
        col_quad = get_col(["QUAD", "QUADRA"])
        col_lote = get_col(["LOTE", "NUMERO_LOTE"])
        col_gleba = get_col(["GLEBA"])
        col_tamanho = get_col(["TAMANHO LOTE", "TAMANHO_LOTE", "CATEGORIA"])
        col_area = get_col(["AREA_M2", "AREA", "AREA (M2)"])
        col_preco_m2 = get_col(["R$_POR_M2", "PRECO_M2", "VALOR_M2"])
        col_valor_base = get_col(["VALOR_BASE", "PRECO_BASE"])
        col_preco_1x = get_col(["PRECO_LOTE_1X", "PRECO_A_VISTA", "VALOR_A_VISTA"])
        col_preco_180x = get_col(["PRECO_LOTE_180X", "PRECO_FINANCIADO"])
        col_parcela_180x = get_col(["VALOR_PARCELA_180X", "PARCELA_180X"])
        col_entrada = get_col(["ENTRADA_5PCT", "ENTRADA"])
        col_corretagem = get_col(["CORRETAGEM_6PCT", "CORRETAGEM"])
        col_iptu = get_col(["IPTU_MENSAL", "IPTU"])

        lotes: List[Lote] = []

        for index, row in df.iterrows():
            quadra = self._clean_str(row[col_quad]) if col_quad else ""
            num_lote = self._clean_str(row[col_lote]) if col_lote else ""

            # Descartar linhas sem quadra ou lote
            if not quadra or not num_lote:
                continue

            ordem = self._clean_int(row[col_ord]) if col_ord else index + 1
            area_m2 = self._clean_float(row[col_area]) if col_area else 0.0
            preco_vista = self._clean_currency(row[col_preco_1x]) if col_preco_1x else 0.0
            gleba = self._clean_str(row[col_gleba]) if col_gleba else "1"

            # Gerar ID único estável (ex: Q-IZ-G-1-L-17). A mesma combinação de
            # quadra+lote se repete em glebas diferentes na planilha, então a
            # gleba entra na chave para o ID ser realmente único.
            id_lote = f"Q-{quadra}-G-{gleba}-L-{num_lote}".replace(" ", "")

            lote_obj = Lote(
                id=id_lote,
                ordem=ordem,
                quadra=quadra,
                lote=num_lote,
                gleba=gleba,
                tamanho_categoria=self._clean_float(row[col_tamanho]) if col_tamanho else None,
                area_m2=area_m2,
                preco_m2=self._clean_currency(row[col_preco_m2]) if col_preco_m2 else None,
                valor_base=self._clean_currency(row[col_valor_base]) if col_valor_base else None,
                preco_vista=preco_vista if preco_vista > 0 else (area_m2 * 300.0),
                preco_financiado_180x=self._clean_currency(row[col_preco_180x]) if col_preco_180x else None,
                valor_parcela_180x=self._clean_currency(row[col_parcela_180x]) if col_parcela_180x else None,
                entrada_5pct=self._clean_currency(row[col_entrada]) if col_entrada else None,
                corretagem_6pct=self._clean_currency(row[col_corretagem]) if col_corretagem else None,
                iptu_mensal=self._clean_currency(row[col_iptu]) if col_iptu else None,
                disponivel=True
            )
            lotes.append(lote_obj)

        return lotes

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
