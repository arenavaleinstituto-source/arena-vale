alter table public.time_moderadores
add column if not exists campeonato_id uuid
references public.campeonatos(id)
on delete set null;
