create table public.site_config (
  id text primary key default 'main',
  nome_site text not null default 'Arena Vale Sports',
  whatsapp text,
  youtube_url text,
  video_destaque_url text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

alter table public.site_config enable row level security;

create policy "config_read_all"
on public.site_config
for select
using (true);

create policy "config_write_coord"
on public.site_config
for all
using (public.is_coordenador())
with check (public.is_coordenador());

insert into public.site_config (id)
values ('main')
on conflict (id) do nothing;

