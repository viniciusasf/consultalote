r"""
Processo manual de reimportação completa: apaga todos os lotes da tabela
"lotes" no Supabase e importa do zero os dados de um arquivo Excel local
(.xlsx/.xls).

Mesma lógica de resync_sheets_to_supabase.py, trocando a fonte (Google
Sheets) por um arquivo Excel no disco.

Segurança:
  - Lê o Excel ANTES de apagar qualquer coisa. Se a leitura falhar ou vier
    com poucos lotes (< MIN_LOTES_ESPERADOS), o script aborta sem tocar no
    Supabase.
  - Pede confirmação digitada ("SIM") antes de apagar, a menos que rode
    com --yes.
  - Se falhar DEPOIS de apagar e ANTES de terminar a reimportação, a
    tabela pode ficar parcialmente vazia — rode o script de novo para
    completar (idempotente, usa upsert).

Pré-requisitos:
  - backend/supabase/schema.sql já executado no projeto Supabase.
  - backend/.env com SUPABASE_URL e SUPABASE_KEY preenchidos.
  - Dependência "openpyxl" instalada (necessária para o pandas ler .xlsx).

Uso:
  cd backend
  ..\.venv\Scripts\python.exe scripts\resync_excel_to_supabase.py caminho\para\planilha.xlsx
  ..\.venv\Scripts\python.exe scripts\resync_excel_to_supabase.py caminho\para\planilha.xlsx --yes
  ..\.venv\Scripts\python.exe scripts\resync_excel_to_supabase.py caminho\para\planilha.xlsx --sheet "Lotes"
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from supabase import create_client
from app.repositories.excel_lotes import ExcelLoteRepository
from app.core.config import get_settings

BATCH_SIZE = 500
TABLE = "lotes"
MIN_LOTES_ESPERADOS = 100


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("arquivo", help="Caminho do arquivo Excel (.xlsx/.xls) a importar")
    parser.add_argument(
        "--sheet", default=0,
        help="Nome ou índice da aba a ler (padrão: primeira aba)",
    )
    parser.add_argument(
        "--yes", action="store_true",
        help="Não pedir confirmação antes de apagar os dados atuais do Supabase",
    )
    args = parser.parse_args()

    excel_path = Path(args.arquivo)
    if not excel_path.is_file():
        raise SystemExit(f"Arquivo não encontrado: {excel_path}")

    settings = get_settings()
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise SystemExit("SUPABASE_URL / SUPABASE_KEY não configurados em backend/.env")

    # Se --sheet vier como número (ex: "0", "1"), converte para índice inteiro
    sheet_name = int(args.sheet) if str(args.sheet).isdigit() else args.sheet

    print(f"Lendo lotes do arquivo Excel '{excel_path}'...")
    lotes = ExcelLoteRepository(str(excel_path), sheet_name=sheet_name).get_all_lotes()
    print(f"{len(lotes)} lotes lidos do Excel.")

    if len(lotes) < MIN_LOTES_ESPERADOS:
        raise SystemExit(
            f"Abortado: apenas {len(lotes)} lotes foram lidos do Excel "
            f"(esperado pelo menos {MIN_LOTES_ESPERADOS}). Isso pode indicar "
            "aba errada, planilha vazia ou cabeçalhos não reconhecidos. "
            "A tabela do Supabase NÃO foi apagada."
        )

    if not args.yes:
        resposta = input(
            f"Isso vai APAGAR todos os lotes da tabela '{TABLE}' no Supabase e "
            f"reimportar {len(lotes)} lotes lidos agora do Excel.\n"
            "Digite SIM para confirmar: "
        )
        if resposta.strip().upper() != "SIM":
            raise SystemExit("Cancelado.")

    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    print(f"Apagando dados atuais da tabela '{TABLE}'...")
    client.table(TABLE).delete().neq("id", "").execute()

    print("Importando lotes do Excel...")
    rows = [lote.model_dump() for lote in lotes]
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        client.table(TABLE).upsert(batch, on_conflict="id").execute()
        print(f"  ...{min(i + BATCH_SIZE, len(rows))}/{len(rows)} importados")

    print(f"Reimportação concluída: {len(rows)} lotes na tabela '{TABLE}'.")


if __name__ == "__main__":
    main()
