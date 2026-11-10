-- 0015: modalidades editáveis pela coordenação (antes eram 4 fixas no código e no banco).
set lock_timeout = '5s';

create table if not exists public.modalidades (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 40),
  nome text not null check (length(btrim(nome)) between 2 and 40),
  frase text,
  ordem int not null default 100,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.modalidades enable row level security;
drop policy if exists modalidades_leitura on public.modalidades;
create policy modalidades_leitura on public.modalidades for select using (ativo or public.is_staff());
drop policy if exists modalidades_staff on public.modalidades;
create policy modalidades_staff on public.modalidades for all using (public.is_staff()) with check (public.is_staff());

insert into public.modalidades (slug, nome, frase, ordem) values
  ('futsal', 'Futsal', 'O palco do futsal é aqui.', 1),
  ('futebol7', 'Futebol 7', 'O palco do futebol 7 é aqui.', 2),
  ('basquete', 'Basquete', 'O palco do basquete é aqui.', 3),
  ('volei', 'Vôlei', 'O palco do vôlei é aqui.', 4)
on conflict (slug) do nothing;

-- As listas fixas viram ligação com a tabela (renomear o identificador atualiza tudo; apagar limpa).
alter table public.campeonatos drop constraint if exists campeonatos_modalidade_check;
alter table public.campeonatos drop constraint if exists campeonatos_modalidade_fk;
alter table public.campeonatos add constraint campeonatos_modalidade_fk
  foreign key (modalidade) references public.modalidades(slug) on update cascade on delete set null;

alter table public.noticias drop constraint if exists noticias_modalidade_check;
alter table public.noticias drop constraint if exists noticias_modalidade_fk;
alter table public.noticias add constraint noticias_modalidade_fk
  foreign key (modalidade) references public.modalidades(slug) on update cascade on delete set null;
