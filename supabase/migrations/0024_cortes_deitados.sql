-- 0024 — Cortes (Shorts) publicados deitados no YouTube.
-- Alguns vídeos horizontais foram publicados girados de lado dentro de um quadro vertical.
-- O YouTube não diz quais são: a coordenação marca no painel e o site gira o vídeo para a posição certa.
-- Idempotente: pode rodar mais de uma vez.

create table if not exists public.cortes_posicao (
  video_id text primary key,
  giro smallint not null check (giro in (-90, 90)),   -- -90 = girar para a esquerda; 90 = para a direita
  atualizado_por uuid default auth.uid() references public.profiles(id) on delete set null,
  atualizado_em timestamptz not null default now()
);
alter table public.cortes_posicao enable row level security;

drop policy if exists cortes_posicao_leitura on public.cortes_posicao;
create policy cortes_posicao_leitura on public.cortes_posicao for select using (true);
drop policy if exists cortes_posicao_staff on public.cortes_posicao;
create policy cortes_posicao_staff on public.cortes_posicao for all
  using (public.is_staff())
  with check (public.is_staff());

grant select on public.cortes_posicao to anon, authenticated;
grant insert, update, delete on public.cortes_posicao to authenticated;
