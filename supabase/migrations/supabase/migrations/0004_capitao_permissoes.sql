alter type user_role
add value if not exists 'capitao';

create table if not exists public.time_capitaes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  time_id uuid not null references public.times(id) on delete cascade,
  appointed_at timestamptz not null default now(),
  unique (profile_id, time_id)
);

alter table public.time_capitaes enable row level security;

create or replace function public.is_capitao_of(time_uuid uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.time_capitaes
    where profile_id = auth.uid()
    and time_id = time_uuid
  );
$$;

create policy "capitao_read_self"
on public.time_capitaes
for select
using (
  profile_id = auth.uid()
  or public.is_coordenador()
);

create policy "capitao_write_coord"
on public.time_capitaes
for all
using (public.is_coordenador())
with check (public.is_coordenador());

create policy "jogador_write_capitao"
on public.jogadores
for all
using (
  public.is_coordenador()
  or (
    time_id is not null
    and public.is_capitao_of(time_id)
  )
)
with check (
  public.is_coordenador()
  or (
    time_id is not null
    and public.is_capitao_of(time_id)
  )
);

create policy "jogos_update_capitao"
on public.jogos
for update
using (
  public.is_coordenador()
  or public.is_capitao_of(time_casa_id)
  or public.is_capitao_of(time_visitante_id)
);

create policy "eventos_write_capitao"
on public.eventos_jogo
for all
using (
  public.is_coordenador()
  or exists (
    select 1
    from public.jogos j
    where j.id = jogo_id
    and (
      public.is_capitao_of(j.time_casa_id)
      or public.is_capitao_of(j.time_visitante_id)
    )
  )
);
