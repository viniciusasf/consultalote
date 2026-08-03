"""Helpers compartilhados pelos scripts de importação/reimportação de lotes."""


def resolve_local_id(client, nome: str) -> str:
    """Resolve o nome de um Local para seu id. Aborta com erro claro se não
    encontrado — falha rápido, antes de tocar em qualquer lote (evita deixar
    um local_id inválido/None passar e quebrar no meio do upsert contra a
    constraint NOT NULL/FK da coluna lotes.local_id)."""
    result = client.table("locais").select("id").ilike("nome", nome.strip()).limit(1).execute()
    if not result.data:
        raise SystemExit(
            f"Local '{nome}' não encontrado na tabela 'locais'. "
            "Cadastre-o antes (tela de admin ou INSERT direto) e tente de novo."
        )
    return result.data[0]["id"]
