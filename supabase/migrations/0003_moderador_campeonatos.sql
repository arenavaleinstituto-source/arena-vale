create table public.moderador_campeonatos (
  id uuid primary key default gen_random_uuid(),
  moderador_id uuid not null references public.time_moderadores(id) on delete cascade,
  campeonato_id uuid not null references public.campeonatos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (moderador_id, campeonato_id)
);

alter table public.moderador_campeonatos enable row level security;

create policy "moderador_campeonato_read"
on public.moderador_campeonatos
for select
using (
  public.is_coordenador()
  or exists (
    select 1
    from public.time_moderadores tm
    where tm.id = moderador_id
    and tm.profile_id = auth.uid()
  )
);

create policy "moderador_campeonato_write_coord"
on public.moderador_campeonatos
for all
using (public.is_coordenador())
with check (public.is_coordenador());
