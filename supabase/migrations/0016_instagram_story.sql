-- 0016: Story automático no Instagram.
set lock_timeout = '5s';

-- Chave do Instagram (renovada sozinha a cada semana). Só o servidor (service role) lê e grava.
create table if not exists public.instagram_conta (
  id text primary key default 'main' check (id = 'main'),
  ig_user_id text not null,
  token text not null,
  token_env_hash text,
  renovado_em timestamptz not null default now()
);
alter table public.instagram_conta enable row level security;
revoke all on public.instagram_conta from anon, authenticated;

-- Situação do Story de cada notícia.
alter table public.noticias add column if not exists story_status text;
alter table public.noticias add column if not exists story_container_id text;
alter table public.noticias add column if not exists story_erro text;
alter table public.noticias add column if not exists story_em timestamptz;
alter table public.noticias drop constraint if exists noticias_story_status_check;
alter table public.noticias add constraint noticias_story_status_check check (story_status in ('processando', 'publicado', 'erro'));
