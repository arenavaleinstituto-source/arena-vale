-- ====================================================================
-- 0011 — Mídia esportiva (spec Fase 3, seção 13)
--
-- Não apaga políticas existentes: só cria as dos objetos novos.
-- Idempotente: pode rodar mais de uma vez.
-- ====================================================================
set lock_timeout = '5s';

-- ─── site_config ────────────────────────────────────────────────────
alter table public.site_config add column if not exists capa_url text;
alter table public.site_config add column if not exists youtube_channel_id text not null default 'UCBTQ97bWA6VqK2a6qv80dIg';
alter table public.site_config add column if not exists youtube_handle text not null default '@TVArenaVale';
alter table public.site_config add column if not exists instagram_url text default 'https://www.instagram.com/arenavaleoficial';
alter table public.site_config add column if not exists ao_vivo_manual boolean not null default false;
alter table public.site_config add column if not exists ao_vivo_link text;

-- ─── campeonatos.modalidade ─────────────────────────────────────────
alter table public.campeonatos add column if not exists modalidade text;
alter table public.campeonatos drop constraint if exists campeonatos_modalidade_check;
alter table public.campeonatos add constraint campeonatos_modalidade_check
  check (modalidade is null or modalidade in ('futsal', 'futebol7', 'basquete', 'volei'));

-- ─── videos_externos (vídeos do Instagram cadastrados pela coordenação) ─
create table if not exists public.videos_externos (
  id uuid primary key default gen_random_uuid(),
  plataforma text not null default 'instagram' check (plataforma in ('instagram', 'outro')),
  link text not null check (link like 'https://%'),
  titulo text not null,
  capa_url text not null,
  publicado_em timestamptz not null default now(),
  ativo boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.videos_externos enable row level security;
drop policy if exists videos_externos_leitura on public.videos_externos;
create policy videos_externos_leitura on public.videos_externos for select using (ativo or public.is_staff());
drop policy if exists videos_externos_staff on public.videos_externos;
create policy videos_externos_staff on public.videos_externos for all using (public.is_staff()) with check (public.is_staff());

-- ─── noticias: catálogo em cartazes + Telegram ──────────────────────
alter table public.noticias add column if not exists aba text not null default 'arena';
alter table public.noticias add column if not exists destaque boolean not null default false;
alter table public.noticias add column if not exists tipo_midia text not null default 'foto';
alter table public.noticias add column if not exists video_url text;
alter table public.noticias add column if not exists video_expira_em timestamptz;
alter table public.noticias add column if not exists video_link text;
alter table public.noticias add column if not exists video_servico text;
alter table public.noticias add column if not exists status text not null default 'rascunho';
alter table public.noticias add column if not exists publicado_em timestamptz;
alter table public.noticias add column if not exists fonte text;
alter table public.noticias add column if not exists origem text not null default 'manual';
alter table public.noticias add column if not exists telegram_message_ref text;
alter table public.noticias add column if not exists modalidade text;
alter table public.noticias add column if not exists enquadramento text;

-- dados existentes: categorias antigas → novas (sem diferenciar maiúsculas); o resto → 'geral'; ativas → publicadas
update public.noticias set categoria = 'campeonatos' where lower(btrim(categoria)) = 'campeonatos';
update public.noticias set categoria = 'bastidores' where lower(btrim(categoria)) = 'bastidores';
update public.noticias set categoria = 'projeto_social' where lower(btrim(categoria)) in ('projeto social', 'projeto_social');
update public.noticias set categoria = 'geral'
 where categoria is null or categoria not in ('geral', 'campeonatos', 'bastidores', 'projeto_social');
update public.noticias set status = 'publicado', publicado_em = coalesce(publicado_em, created_at)
 where ativo = true and status = 'rascunho' and publicado_em is null;
alter table public.noticias alter column categoria set default 'geral';

alter table public.noticias drop constraint if exists noticias_aba_check;
alter table public.noticias add constraint noticias_aba_check check (aba in ('arena', 'mundo'));
alter table public.noticias drop constraint if exists noticias_categoria_check;
alter table public.noticias add constraint noticias_categoria_check
  check (categoria in ('geral', 'campeonatos', 'bastidores', 'projeto_social'));
alter table public.noticias drop constraint if exists noticias_tipo_midia_check;
alter table public.noticias add constraint noticias_tipo_midia_check check (tipo_midia in ('foto', 'video'));
alter table public.noticias drop constraint if exists noticias_video_link_check;
alter table public.noticias add constraint noticias_video_link_check check (video_link is null or video_link like 'https://%');
alter table public.noticias drop constraint if exists noticias_video_servico_check;
alter table public.noticias add constraint noticias_video_servico_check
  check (video_servico is null or video_servico in ('youtube', 'instagram', 'x', 'tiktok', 'facebook', 'telegram', 'outro'));
alter table public.noticias drop constraint if exists noticias_status_check;
alter table public.noticias add constraint noticias_status_check check (status in ('rascunho', 'publicado'));
alter table public.noticias drop constraint if exists noticias_origem_check;
alter table public.noticias add constraint noticias_origem_check check (origem in ('manual', 'telegram'));
alter table public.noticias drop constraint if exists noticias_modalidade_check;
alter table public.noticias add constraint noticias_modalidade_check
  check (modalidade is null or modalidade in ('futsal', 'futebol7', 'basquete', 'volei'));
create unique index if not exists noticias_telegram_message_ref_key on public.noticias (telegram_message_ref);
create index if not exists idx_noticias_publicadas on public.noticias (aba, status, publicado_em desc);

-- `ativo` segue o status: a política noticias_leitura (0010) continua certa.
create or replace function public.noticias_sincroniza() returns trigger
language plpgsql set search_path = public as $$
begin
  new.ativo := (new.status = 'publicado');
  if new.status = 'publicado' and new.publicado_em is null then
    new.publicado_em := now();
  end if;
  return new;
end $$;
drop trigger if exists noticias_sincroniza on public.noticias;
create trigger noticias_sincroniza before insert or update on public.noticias
  for each row execute function public.noticias_sincroniza();

-- ─── Telegram: vínculo da conta ─────────────────────────────────────
alter table public.profiles add column if not exists telegram_user_id bigint;
create unique index if not exists profiles_telegram_user_id_key on public.profiles (telegram_user_id);

create table if not exists public.telegram_codigos_vinculo (
  codigo text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  expira_em timestamptz not null
);
alter table public.telegram_codigos_vinculo enable row level security;  -- sem políticas: só a service role

-- Tentativas erradas de /vincular por conta do Telegram (bloqueio de 1 h após 5 erros).
create table if not exists public.telegram_tentativas_vinculo (
  telegram_user_id bigint primary key,
  falhas int not null default 0,
  bloqueado_ate timestamptz
);
alter table public.telegram_tentativas_vinculo enable row level security;  -- sem políticas: só a service role

-- Código de 8 caracteres (32^8 ≈ 1 trilhão), sorteado com o gerador seguro do gen_random_uuid().
create or replace function public.gerar_codigo_telegram() returns text
language plpgsql security definer set search_path = public as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea;
  v text;
begin
  if not public.is_staff() then
    raise exception 'Sem permissão.';
  end if;
  delete from public.telegram_codigos_vinculo where profile_id = auth.uid() or expira_em < now();
  loop
    bytes := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    v := '';
    for i in 0..7 loop
      v := v || substr(alfabeto, (get_byte(bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.telegram_codigos_vinculo where codigo = v);
  end loop;
  insert into public.telegram_codigos_vinculo (codigo, profile_id, expira_em)
  values (v, auth.uid(), now() + interval '10 minutes');
  return v;
end $$;

create or replace function public.desvincular_telegram() returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set telegram_user_id = null where id = auth.uid();
end $$;

-- Modo de vídeo (tabela proprietario é secreta): só o que o editor precisa.
create or replace function public.modo_video_atual() returns table (modo text, dias int)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then
    raise exception 'Sem permissão.';
  end if;
  return query
    select coalesce((select p.modo_video from public.proprietario p limit 1), 'guardar_arquivo'),
           coalesce((select p.dias_validade_video from public.proprietario p limit 1), 30);
end $$;

revoke all on function public.gerar_codigo_telegram() from public, anon;
revoke all on function public.desvincular_telegram() from public, anon;
revoke all on function public.modo_video_atual() from public, anon;
grant execute on function public.gerar_codigo_telegram() to authenticated;
grant execute on function public.desvincular_telegram() to authenticated;
grant execute on function public.modo_video_atual() to authenticated;

-- ─── agenda_jogos (existe só em produção; aqui para o banco de testes) ─
create table if not exists public.agenda_jogos (
  id uuid primary key default gen_random_uuid(),
  modalidade text,
  fase text,
  equipe_casa text not null,
  equipe_fora text not null,
  data_hora timestamptz not null,
  local text,
  status text default 'Agendado',
  created_at timestamptz not null default now()
);
alter table public.agenda_jogos enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agenda_jogos' and policyname = 'agenda_jogos_leitura') then
    create policy agenda_jogos_leitura on public.agenda_jogos for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agenda_jogos' and policyname = 'agenda_jogos_staff') then
    create policy agenda_jogos_staff on public.agenda_jogos for all using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- correção de dado: a marca é só ARENA VALE
update public.agenda_jogos set local = regexp_replace(local, 'arena vale sports?', 'Arena Vale', 'gi') where local ~* 'arena vale sports?';

-- ─── Storage: bucket público "noticias" (fotos, cartazes, vídeos) ───
insert into storage.buckets (id, name, public, file_size_limit)
values ('noticias', 'noticias', true, 20971520)
on conflict (id) do nothing;

drop policy if exists noticias_midia_leitura on storage.objects;
create policy noticias_midia_leitura on storage.objects for select using (bucket_id = 'noticias');
drop policy if exists noticias_midia_staff_insert on storage.objects;
create policy noticias_midia_staff_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'noticias' and public.is_staff());
drop policy if exists noticias_midia_staff_update on storage.objects;
create policy noticias_midia_staff_update on storage.objects for update to authenticated
  using (bucket_id = 'noticias' and public.is_staff()) with check (bucket_id = 'noticias' and public.is_staff());
drop policy if exists noticias_midia_staff_delete on storage.objects;
create policy noticias_midia_staff_delete on storage.objects for delete to authenticated
  using (bucket_id = 'noticias' and public.is_staff());
