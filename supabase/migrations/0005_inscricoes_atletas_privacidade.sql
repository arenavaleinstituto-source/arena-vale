-- Privacidade de inscrições de equipes e atletas menores.
create table if not exists public.solicitacoes_inscricao (
 id uuid primary key default gen_random_uuid(),
 equipe_nome text not null,
 equipe_sigla varchar(4),
 cidade text,
 responsavel_nome text not null,
 responsavel_cpf text not null,
 responsavel_email text not null,
 responsavel_telefone text not null,
 categoria text not null,
 campeonato_id uuid references public.campeonatos(id) on delete set null,
 atletas jsonb not null default '[]'::jsonb,
 fotos_paths text[] not null default '{}',
 autorizacao_responsavel boolean not null default false,
 status inscricao_status not null default 'pendente',
 created_at timestamptz not null default now(),
 constraint solicitacoes_autorizacao_check check (autorizacao_responsavel = true),
 constraint solicitacoes_atletas_array_check check (jsonb_typeof(atletas) = 'array')
);
alter table public.solicitacoes_inscricao add column if not exists equipe_sigla varchar(4);
alter table public.solicitacoes_inscricao add column if not exists cidade text;
alter table public.solicitacoes_inscricao enable row level security;
create policy "solicitacoes_public_insert" on public.solicitacoes_inscricao for insert to anon, authenticated with check (autorizacao_responsavel = true);
create policy "solicitacoes_staff_read" on public.solicitacoes_inscricao for select to authenticated using (public.is_coordenador() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'moderador'));
create policy "solicitacoes_staff_update" on public.solicitacoes_inscricao for update to authenticated using (public.is_coordenador() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'moderador')) with check (true);
insert into storage.buckets (id, name, public) values ('atletas-privado', 'atletas-privado', false) on conflict (id) do update set public = false;
create policy "atletas_private_read_staff" on storage.objects for select to authenticated using (bucket_id = 'atletas-privado' and (public.is_coordenador() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'moderador')));
create policy "atletas_private_insert_authenticated" on storage.objects for insert to authenticated with check (bucket_id = 'atletas-privado');
create policy "atletas_private_delete_staff" on storage.objects for delete to authenticated using (bucket_id = 'atletas-privado' and public.is_coordenador());
