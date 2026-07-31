import pandas as pd
from typing import List, Optional
from app.models.lote import Lote


def _clean_currency(val) -> Optional[float]:
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


def _clean_float(val) -> Optional[float]:
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


def _clean_int(val) -> Optional[int]:
    f_val = _clean_float(val)
    return int(f_val) if f_val is not None else None


def _clean_str(val) -> str:
    if pd.isna(val) or val is None:
        return ""
    return str(val).strip()


def parse_lotes_dataframe(df: pd.DataFrame) -> List[Lote]:
    """Converte um DataFrame (planilha lida de CSV, Google Sheets ou Excel) na
    lista de Lote esperada pelo Supabase. Mapeamento de cabeçalhos resiliente
    (normaliza para maiúsculas e aceita nomes alternativos de coluna)."""
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
        quadra = _clean_str(row[col_quad]) if col_quad else ""
        num_lote = _clean_str(row[col_lote]) if col_lote else ""

        # Descartar linhas sem quadra ou lote
        if not quadra or not num_lote:
            continue

        ordem = _clean_int(row[col_ord]) if col_ord else index + 1
        area_m2 = _clean_float(row[col_area]) if col_area else 0.0
        preco_vista = _clean_currency(row[col_preco_1x]) if col_preco_1x else 0.0
        gleba = _clean_str(row[col_gleba]) if col_gleba else "1"

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
            tamanho_categoria=_clean_float(row[col_tamanho]) if col_tamanho else None,
            area_m2=area_m2,
            preco_m2=_clean_currency(row[col_preco_m2]) if col_preco_m2 else None,
            valor_base=_clean_currency(row[col_valor_base]) if col_valor_base else None,
            preco_vista=preco_vista if preco_vista > 0 else (area_m2 * 300.0),
            preco_financiado_180x=_clean_currency(row[col_preco_180x]) if col_preco_180x else None,
            valor_parcela_180x=_clean_currency(row[col_parcela_180x]) if col_parcela_180x else None,
            entrada_5pct=_clean_currency(row[col_entrada]) if col_entrada else None,
            corretagem_6pct=_clean_currency(row[col_corretagem]) if col_corretagem else None,
            iptu_mensal=_clean_currency(row[col_iptu]) if col_iptu else None,
            disponivel=True
        )
        lotes.append(lote_obj)

    return lotes
