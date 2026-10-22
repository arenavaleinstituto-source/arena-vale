-- ====================================================================
-- ARENA VALE — Noticias e Atletas em Destaque (saindo do localStorage)
-- ====================================================================
-- Rode com:  supabase db push
-- ====================================================================

-- NOTICIAS
create table if not exists public.noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text not null,
  categoria text not null,
  tag text not null,
  imagem_url text,
  ordem int not null default 0,
  ativo boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_noticias_ativo_ordem on public.noticias(ativo, ordem);

-- ATLETAS EM DESTAQUE
create table if not exists public.atletas_destaque (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  modalidade text not null,
  equipe text not null,
  destaque_texto text not null,
  imagem_url text,
  ordem int not null default 0,
  ativo boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_atletas_destaque_ativo_ordem on public.atletas_destaque(ativo, ordem);

-- updated_at automatico (reaproveitando a funcao que ja existe em 0001_init.sql)
create trigger tr_noticias_updated before update on public.noticias for each row execute function public.set_updated_at();
create trigger tr_atletas_destaque_updated before update on public.atletas_destaque for each row execute function public.set_updated_at();

-- ====================================================================
-- ROW LEVEL SECURITY — mesmo padrao de patrocinadores (leitura publica, escrita so coordenador)
-- ====================================================================
alter table public.noticias enable row level security;
alter table public.atletas_destaque enable row level security;

create policy "noticias_read_all" on public.noticias for select using (true);
create policy "noticias_write_coord" on public.noticias for all using (public.is_coordenador());

create policy "atletas_destaque_read_all" on public.atletas_destaque for select using (true);
create policy "atletas_destaque_write_coord" on public.atletas_destaque for all using (public.is_coordenador());

-- ====================================================================
-- FIM — script idempotente
-- ====================================================================
