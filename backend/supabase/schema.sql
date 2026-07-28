-- Rode este script uma vez no SQL Editor do Supabase (Project > SQL Editor > New query).
-- ATENÇÃO: substitui uma tabela "lotes" pré-existente (import bruto da planilha,
-- com colunas de texto tipo "R$ 388,15") pelo schema limpo usado pela API.
-- Isso apaga os dados atuais da tabela; eles serão repopulados pelo script de importação.
drop table if exists lotes;

create table if not exists lotes (
  id text primary key,
  ordem integer,
  quadra text not null,
  lote text not null,
  gleba text,
  tamanho_categoria numeric,
  area_m2 numeric not null,
  preco_m2 numeric,
  valor_base numeric,
  preco_vista numeric not null,
  preco_financiado_180x numeric,
  valor_parcela_180x numeric,
  entrada_5pct numeric,
  corretagem_6pct numeric,
  iptu_mensal numeric,
  disponivel boolean not null default true
);

create index if not exists idx_lotes_gleba on lotes (gleba);
create index if not exists idx_lotes_quadra on lotes (quadra);
create index if not exists idx_lotes_tamanho_categoria on lotes (tamanho_categoria);
create index if not exists idx_lotes_area_m2 on lotes (area_m2);
create index if not exists idx_lotes_preco_vista on lotes (preco_vista);
create index if not exists idx_lotes_quadra_ordem on lotes (quadra, ordem);
