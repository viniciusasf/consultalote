-- Migração aditiva para o banco Supabase JÁ EM PRODUÇÃO (com os 3850 lotes
-- já importados). Nunca dá "drop table" — ao contrário de schema.sql (que é
-- para projetos novos/vazios), este script só cria e faz backfill.
--
-- Rode uma vez no SQL Editor do Supabase. É idempotente: pode rodar de novo
-- sem efeito colateral se já tiver sido aplicado (usa "if not exists" e
-- "on conflict do nothing" em tudo).

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

-- Local-semente. senha_hash fica NULL até o Master configurá-la pela tela de
-- admin (login de corretor nesse local retorna 401 "Local ainda não
-- configurado" enquanto isso não acontecer — nunca 500).
insert into locais (nome) values ('SANTA BARBARA RESORT RESIDENCE')
  on conflict (nome) do nothing;

-- Usuário-semente (diretório apenas — login de Master não depende desta
-- linha, é sempre via MASTER_PASSWORD_HASH no backend/.env).
insert into usuarios (nome_login, sobrenome, local_id, perfil_id)
select 'Vinicius', 'Ferreira', l.id, p.id
from locais l, perfis p
where l.nome = 'SANTA BARBARA RESORT RESIDENCE' and p.nome = 'master'
  and not exists (
    select 1 from usuarios u where u.nome_login = 'Vinicius' and u.sobrenome = 'Ferreira'
  );

-- Vincula todos os lotes já existentes ao local-semente.
alter table lotes add column if not exists local_id uuid references locais(id);

update lotes
set local_id = (select id from locais where nome = 'SANTA BARBARA RESORT RESIDENCE')
where local_id is null;

alter table lotes alter column local_id set not null;

create index if not exists idx_lotes_local_id on lotes (local_id);

-- Conferência pós-migração (deve retornar 0):
-- select count(*) from lotes where local_id is null;
