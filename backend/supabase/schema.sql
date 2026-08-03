-- Rode este script uma vez no SQL Editor do Supabase (Project > SQL Editor > New query),
-- SOMENTE em um projeto Supabase novo/vazio.
-- ATENÇÃO: dá "drop table" em "lotes" (e nas tabelas de auth abaixo) — isso apaga
-- os dados atuais; eles serão repopulados pelos scripts de importação.
-- Se o banco já está em produção com dados (ex: lotes já importados), use
-- backend/supabase/migration_auth.sql em vez deste arquivo — aquele é aditivo e
-- nunca apaga nada.
drop table if exists lotes;
drop table if exists usuarios;
drop table if exists locais;
drop table if exists perfis;

create extension if not exists pgcrypto;

create table if not exists perfis (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique -- 'master' | 'corretor'
);
insert into perfis (nome) values ('master'), ('corretor')
  on conflict (nome) do nothing;

create table if not exists locais (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  senha_hash text, -- bcrypt; nulo até o Master definir a senha do local pela tela de admin
  created_at timestamptz not null default now()
);

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nome_login text not null,
  sobrenome text,
  local_id uuid not null references locais(id),
  perfil_id uuid not null references perfis(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_usuarios_local_id on usuarios (local_id);
create index if not exists idx_usuarios_perfil_id on usuarios (perfil_id);

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
  disponivel boolean not null default true,
  local_id uuid not null references locais(id)
);

create index if not exists idx_lotes_gleba on lotes (gleba);
create index if not exists idx_lotes_quadra on lotes (quadra);
create index if not exists idx_lotes_tamanho_categoria on lotes (tamanho_categoria);
create index if not exists idx_lotes_area_m2 on lotes (area_m2);
create index if not exists idx_lotes_preco_vista on lotes (preco_vista);
create index if not exists idx_lotes_quadra_ordem on lotes (quadra, ordem);
create index if not exists idx_lotes_local_id on lotes (local_id);

-- Local-semente: os scripts de reimportação usam este nome por padrão (settings.DEFAULT_LOCAL_NOME)
insert into locais (nome) values ('SANTA BARBARA RESORT RESIDENCE')
  on conflict (nome) do nothing;
