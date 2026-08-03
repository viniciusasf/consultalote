"""
Importa (ou ressincroniza) os lotes da planilha Google Sheets para a tabela
"lotes" do Supabase. Idempotente: usa upsert por "id", pode ser reexecutado
a qualquer momento para atualizar o Supabase com o conteúdo atual da planilha.

Pré-requisitos:
  - backend/supabase/schema.sql já executado no projeto Supabase.
  - backend/.env com SUPABASE_URL e SUPABASE_KEY preenchidos.

Uso:
  cd backend
  ..\\.venv\\Scripts\\python.exe scripts\\migrate_sheets_to_supabase.py
  ..\\.venv\\Scripts\\python.exe scripts\\migrate_sheets_to_supabase.py --local "Outro Local"
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


def main():
    settings = get_settings()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--local", default=settings.DEFAULT_LOCAL_NOME,
        help=f"Nome do Local de destino (padrão: '{settings.DEFAULT_LOCAL_NOME}')",
    )
    args = parser.parse_args()

    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise SystemExit("SUPABASE_URL / SUPABASE_KEY não configurados em backend/.env")

    print("Lendo lotes da planilha Google Sheets...")
    lotes = GoogleSheetsLoteRepository().get_all_lotes()
    print(f"{len(lotes)} lotes lidos da planilha.")

    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    local_id = resolve_local_id(client, args.local)

    rows = [lote.model_dump() for lote in lotes]
    for row in rows:
        row["local_id"] = local_id

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        client.table(TABLE).upsert(batch, on_conflict="id").execute()
        print(f"  ...{min(i + BATCH_SIZE, len(rows))}/{len(rows)} enviados")

    print(f"Migração concluída: {len(rows)} lotes upsertados na tabela '{TABLE}'.")


if __name__ == "__main__":
    main()
