r"""
Processo manual de reimportação completa: apaga todos os lotes da tabela
"lotes" no Supabase e importa do zero os dados atuais da planilha Google
Sheets.

Diferença para migrate_sheets_to_supabase.py: aquele script só faz upsert
(atualiza/insere), então um lote removido da planilha continuaria no
Supabase para sempre. Este script apaga tudo antes de reimportar, então a
tabela sempre fica igual ao conteúdo atual da planilha — inclusive lotes
excluídos.

Ative manualmente sempre que a planilha for atualizada (não há data fixa
de atualização, então não roda em agendamento automático).

Segurança:
  - Lê a planilha ANTES de apagar qualquer coisa. Se a leitura falhar ou
    vier com poucos lotes (< MIN_LOTES_ESPERADOS), o script aborta sem
    tocar no Supabase.
  - Pede confirmação digitada ("SIM") antes de apagar, a menos que rode
    com --yes.
  - Se falhar DEPOIS de apagar e ANTES de terminar a reimportação, a
    tabela pode ficar parcialmente vazia — rode o script de novo para
    completar (idempotente, usa upsert).

Pré-requisitos:
  - backend/supabase/schema.sql já executado no projeto Supabase.
  - backend/.env com SUPABASE_URL, SUPABASE_KEY e SPREADSHEET_CSV_URL
    preenchidos.

Uso:
  cd backend
  ..\.venv\Scripts\python.exe scripts\resync_sheets_to_supabase.py
  ..\.venv\Scripts\python.exe scripts\resync_sheets_to_supabase.py --local "SANTA BARBARA RESORT RESIDENCE" --yes
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from supabase import create_client
from app.repositories.google_sheets import GoogleSheetsLoteRepository
from app.core.config import get_settings
from scripts._common import resolve_local_id

BATCH_SIZE = 500
TABLE = "lotes"
MIN_LOTES_ESPERADOS = 100


def main():
    settings = get_settings()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--local", default=settings.DEFAULT_LOCAL_NOME,
        help=f"Nome do Local de destino (padrão: '{settings.DEFAULT_LOCAL_NOME}')",
    )
    parser.add_argument(
        "--yes", action="store_true",
        help="Não pedir confirmação antes de apagar os dados atuais do Supabase",
    )
    args = parser.parse_args()

    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise SystemExit("SUPABASE_URL / SUPABASE_KEY não configurados em backend/.env")

    print("Lendo lotes da planilha Google Sheets...")
    lotes = GoogleSheetsLoteRepository().get_all_lotes()
    print(f"{len(lotes)} lotes lidos da planilha.")

    if len(lotes) < MIN_LOTES_ESPERADOS:
        raise SystemExit(
            f"Abortado: apenas {len(lotes)} lotes foram lidos da planilha "
            f"(esperado pelo menos {MIN_LOTES_ESPERADOS}). Isso pode indicar "
            "falha na leitura do CSV (link expirado, planilha vazia, etc). "
            "A tabela do Supabase NÃO foi apagada."
        )

    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    local_id = resolve_local_id(client, args.local)

    if not args.yes:
        resposta = input(
            f"Isso vai APAGAR todos os lotes do Local '{args.local}' na tabela "
            f"'{TABLE}' no Supabase (lotes de outros Locais não são afetados) e "
            f"reimportar {len(lotes)} lotes lidos agora da planilha.\n"
            "Digite SIM para confirmar: "
        )
        if resposta.strip().upper() != "SIM":
            raise SystemExit("Cancelado.")

    print(f"Apagando lotes atuais do Local '{args.local}' na tabela '{TABLE}'...")
    client.table(TABLE).delete().eq("local_id", local_id).execute()

    print("Importando lotes da planilha...")
    rows = [lote.model_dump() for lote in lotes]
    for row in rows:
        row["local_id"] = local_id
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        client.table(TABLE).upsert(batch, on_conflict="id").execute()
        print(f"  ...{min(i + BATCH_SIZE, len(rows))}/{len(rows)} importados")

    print(f"Reimportação concluída: {len(rows)} lotes na tabela '{TABLE}' (Local '{args.local}').")


if __name__ == "__main__":
    main()
