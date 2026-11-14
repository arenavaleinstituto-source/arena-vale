-- IDs de Shorts/Cortes que a coordenação quer ocultar do site (sem apagar do YouTube).
create table if not exists public.cortes_ocultos (
  video_id  text        primary key,
  oculto_em timestamptz not null default now()
);

alter table public.cortes_ocultos enable row level security;

-- Qualquer visitante pode ler (necessário para filtrar na home sem cookies).
create policy cortes_ocultos_ler on public.cortes_ocultos
  for select using (true);

-- Só a coordenação pode ocultar.
create policy cortes_ocultos_inserir on public.cortes_ocultos
  for insert to authenticated
  with check (public.is_staff());

-- Só a coordenação pode revelar.
create policy cortes_ocultos_apagar on public.cortes_ocultos
  for delete to authenticated
  using (public.is_staff());

notify pgrst, 'reload schema';
