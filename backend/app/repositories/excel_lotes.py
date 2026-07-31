import pandas as pd
from typing import List
from app.models.lote import Lote
from app.repositories.lote_dataframe_parser import parse_lotes_dataframe


class ExcelLoteRepository:
    """
    Leitor de planilha Excel local (.xlsx/.xls), usado apenas pelo script de
    reimportação manual (backend/scripts/resync_excel_to_supabase.py).
    Reaproveita o mesmo parser de colunas do GoogleSheetsLoteRepository.
    """

    def __init__(self, file_path: str, sheet_name=0):
        self.file_path = file_path
        self.sheet_name = sheet_name

    def get_all_lotes(self) -> List[Lote]:
        df = pd.read_excel(self.file_path, sheet_name=self.sheet_name)
        return parse_lotes_dataframe(df)
