-- 0019: galeria de fotos dos jogos e eventos (Fase 4A, spec seção 4.1).
-- Álbuns e fotos públicos quando ativos; escrita só da coordenação.
-- telegram_estado guarda o modo do robô por pessoa (só a service role).

create table if not exists public.galeria_albuns (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(titulo) between 3 and 80),
  data date not null,
  origem text check (origem in ('jogos', 'agenda')),
  jogo_ref uuid,
  capa_url text,
  ativo boolean not null default true,
  criado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index if not exists galeria_albuns_um_por_jogo
  on public.galeria_albuns (origem, jogo_ref) where jogo_ref is not null;
create index if not exists galeria_albuns_data_idx on public.galeria_albuns (data desc, created_at desc);

create table if not exists public.galeria_fotos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.galeria_albuns(id) on delete cascade,
  url text not null,
  miniatura_url text not null,
  largura int not null,
  altura int not null,
  enviado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists galeria_fotos_album_idx on public.galeria_fotos (album_id, created_at);

alter table public.galeria_albuns enable row level security;
alter table public.galeria_fotos enable row level security;

drop policy if exists galeria_albuns_leitura on public.galeria_albuns;
create policy galeria_albuns_leitura on public.galeria_albuns for select using (ativo or public.is_staff());
drop policy if exists galeria_albuns_staff on public.galeria_albuns;
create policy galeria_albuns_staff on public.galeria_albuns for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists galeria_fotos_leitura on public.galeria_fotos;
create policy galeria_fotos_leitura on public.galeria_fotos for select using (
  public.is_staff() or exists (select 1 from public.galeria_albuns a where a.id = album_id and a.ativo)
);
drop policy if exists galeria_fotos_staff on public.galeria_fotos;
create policy galeria_fotos_staff on public.galeria_fotos for all
  using (public.is_staff()) with check (public.is_staff());

create table if not exists public.telegram_estado (
  telegram_user_id bigint primary key,
  modo text not null default 'noticias' check (modo in ('noticias', 'galeria', 'nome_evento')),
  album_id uuid references public.galeria_albuns(id) on delete set null,
  expira_em timestamptz,
  ultimo_grupo text
);
alter table public.telegram_estado enable row level security;
revoke all on public.telegram_estado from anon, authenticated;

-- Storage: bucket público "galeria" (10 MB, só imagens). O link direto da foto é público;
-- listar a pasta é só do staff, para não vazar fotos de álbum escondido.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('galeria', 'galeria', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists galeria_midia_leitura on storage.objects;
create policy galeria_midia_leitura on storage.objects for select to authenticated
  using (bucket_id = 'galeria' and public.is_staff());
drop policy if exists galeria_midia_staff_insert on storage.objects;
create policy galeria_midia_staff_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'galeria' and public.is_staff());
drop policy if exists galeria_midia_staff_update on storage.objects;
create policy galeria_midia_staff_update on storage.objects for update to authenticated
  using (bucket_id = 'galeria' and public.is_staff()) with check (bucket_id = 'galeria' and public.is_staff());
drop policy if exists galeria_midia_staff_delete on storage.objects;
create policy galeria_midia_staff_delete on storage.objects for delete to authenticated
  using (bucket_id = 'galeria' and public.is_staff());

notify pgrst, 'reload schema';
