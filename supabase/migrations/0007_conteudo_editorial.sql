-- ====================================================================
-- ARENA VALE — Schema do conteúdo editorial + lacunas de produção
-- ====================================================================
-- Rode com:  supabase db push   (ou cole direto no SQL Editor do Supabase)
-- Script IDEMPOTENTE: pode rodar mais de uma vez sem duplicar nem apagar
-- nada do que já existe.
--
-- POR QUE ESTA MIGRAÇÃO EXISTE
-- -----------------------------
-- O repositório tinha tabelas que o código usava, mas NENHUMA migração
-- as criava. Em produção isso significou:
--
--   1. `noticias` e `atletas_destaque` existem no banco, mas não são
--      criadas por nenhuma migração → um banco novoinstallado a partir
--      do repositório nasce SEM elas e todo o fluxo editorial cai.
--
--   2. `site_config` é lida por `components/coord-config.tsx`, mas não
--      existe em produção (confirmado via PostgREST: PGRST205).
--
--   3. `v_classificacao` (view) e `get_receita_mensal` (função) são
--      usadas por `lib/supabase/queries.ts`, mas nunca foram criadas.
--
--   4. `atletas_destaque` não tem as colunas `modalidade`, `jogos`,
--      `gols_ou_pontos` e `assistencias`, que o painel editorial publica
--      e a galeria pública exibe.
--
--   5. Os comunicados publicados estavam sem acentuação
--      ("INSCRICOES ABERTAS", "Estao abertas", "Volei"). A causa raiz
--      estava no seed da migração 0006 — corrigida aqui, na origem.
-- ====================================================================

-- ───────────────────────────────────────────────────────────────────
-- 1) COMUNICADOS (tabela `noticias`)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text not null default '',
  categoria text not null default 'Comunicado Oficial',
  tag text not null default 'NOVO',
  imagem_url text,
  ordem integer not null default 999,
  ativo boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_noticias_ativo_ordem
  on public.noticias (ativo, ordem, created_at desc);

alter table public.noticias enable row level security;

-- Leitura pública: o site público lê os comunicados sem autenticação.
drop policy if exists "noticias_read_public" on public.noticias;
create policy "noticias_read_public"
  on public.noticias
  for select
  using (ativo = true or public.is_coordenador());

-- Escrita restrita ao coordenador.
drop policy if exists "noticias_write_coord" on public.noticias;
create policy "noticias_write_coord"
  on public.noticias
  for all
  using (public.is_coordenador())
  with check (public.is_coordenador());

-- ───────────────────────────────────────────────────────────────────
-- 2) DESTAQUES (tabela `atletas_destaque`)
--    Colunas conforme o banco de PRODUÇÃO:
--    foto_url, atleta_nome, time_nome, campeonato_nome, ativo, ordem
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.atletas_destaque (
  id uuid primary key default gen_random_uuid(),
  foto_url text,
  atleta_nome text not null,
  time_nome text not null default '',
  campeonato_nome text not null default '',
  modalidade text,
  jogos text,
  gols_ou_pontos text,
  assistencias text,
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_atletas_destaque_ativo_ordem
  on public.atletas_destaque (ativo, ordem, created_at desc);

-- Colunas novas em instalações que já têm a tabela antiga.
alter table public.atletas_destaque add column if not exists modalidade text;
alter table public.atletas_destaque add column if not exists jogos text;
alter table public.atletas_destaque add column if not exists gols_ou_pontos text;
alter table public.atletas_destaque add column if not exists assistencias text;

alter table public.atletas_destaque enable row level security;

drop policy if exists "atletas_destaque_read_public" on public.atletas_destaque;
create policy "atletas_destaque_read_public"
  on public.atletas_destaque
  for select
  using (ativo = true or public.is_coordenador());

drop policy if exists "atletas_destaque_write_coord" on public.atletas_destaque;
create policy "atletas_destaque_write_coord"
  on public.atletas_destaque
  for all
  using (public.is_coordenador())
  with check (public.is_coordenador());

-- Preenche a modalidade dos registros que já existiam, deduplicando pelo
-- nome do campeonato. `derivarModalidade` no app faz o mesmo em runtime.
update public.atletas_destaque
   set modalidade = case
     when upper(coalesce(campeonato_nome, '')) like '%FUTSAL%'  then 'FUTSAL'
     when upper(coalesce(campeonato_nome, '')) like '%BASQUET%'  then 'BASQUETEBOL'
     when upper(coalesce(campeonato_nome, '')) like '%VÔLEI%'
       or upper(coalesce(campeonato_nome, '')) like '%VOLEI%'
       or upper(coalesce(campeonato_nome, '')) like '%VOLEIBOL%' then 'VÔLEI'
     when upper(coalesce(campeonato_nome, '')) like '%FUTEBOL%'  then 'FUTEBOL 7'
     else 'FUTSAL'
   end
 where modalidade is null or btrim(modalidade) = '';

-- ───────────────────────────────────────────────────────────────────
-- 3) CONFIGURAÇÕES DO SITE (existe no código, faltava no banco)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.site_config (
  id text primary key default 'main',
  nome_site text not null default 'Arena Vale Sports',
  whatsapp text,
  youtube_url text,
  video_destaque_url text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

alter table public.site_config enable row level security;

drop policy if exists "config_read_all" on public.site_config;
create policy "config_read_all"
  on public.site_config
  for select
  using (true);

drop policy if exists "config_write_coord" on public.site_config;
create policy "config_write_coord"
  on public.site_config
  for all
  using (public.is_coordenador())
  with check (public.is_coordenador());

insert into public.site_config (id)
values ('main')
on conflict (id) do nothing;

-- ───────────────────────────────────────────────────────────────────
-- 4) VIEW DE CLASSIFICAÇÃO (usada por lib/supabase/queries.ts)
-- ───────────────────────────────────────────────────────────────────
create or replace view public.v_classificacao as
select
  i.campeonato_id,
  i.time_id,
  t.nome                as time_nome,
  t.sigla               as time_sigla,
  count(j.id) filter (where j.status = 'finalizado')::int as jogos,
  sum(coalesce(j.placar_casa, 0)) filter (where j.status = 'finalizado')::int as gols_pro,
  sum(coalesce(j.placar_visitante, 0)) filter (where j.status = 'finalizado')::int as gols_contra,
  (sum(coalesce(j.placar_casa, 0)) filter (where j.status = 'finalizado')
   - sum(coalesce(j.placar_visitante, 0)) filter (where j.status = 'finalizado'))::int as saldo,
  (sum(coalesce(j.placar_casa, 0)) filter (where j.status = 'finalizado')
   - sum(coalesce(j.placar_visitante, 0)) filter (where j.status = 'finalizado'))::int * 3 as pontos
from public.inscricoes i
join public.times t on t.id = i.time_id
left join public.jogos j
       on (j.time_casa_id = i.time_id or j.time_visitante_id = i.time_id)
      and j.campeonato_id = i.campeonato_id
group by i.campeonato_id, i.time_id, t.nome, t.sigla;

-- ───────────────────────────────────────────────────────────────────
-- 5) FUNÇÃO DE RECEITA MENSAL (usada por lib/supabase/queries.ts)
-- ───────────────────────────────────────────────────────────────────
create or replace function public.get_receita_mensal()
returns table (mes text, total numeric)
language sql
stable
as $$
  select
    to_char(date_trunc('month', s.updated_at), 'YYYY-MM') as mes,
    sum(s.valor_mensal)::numeric as total
  from public.patrocinadores s
  where s.ativo = true
  group by 1
  order by 1 desc
  limit 6;
$$;

-- ───────────────────────────────────────────────────────────────────
-- 6) CONTEÚDO ACENTUADO (correção na origem dos comunicados publicados)
--    O seed da 0006 gravou os textos sem acentuação. Corrigimos os
--    registros já publicados e reescrevemos o seed para instalações
--    novas.
-- ───────────────────────────────────────────────────────────────────
update public.noticias
   set titulo = 'INSCRIÇÕES ABERTAS PARA A TEMPORADA 2026',
       descricao = 'Estão abertas as inscrições de equipes para o Circuito de Futsal, a Copa de Futebol 7, a Liga de Basquete e o Torneio de Vôlei da temporada 2026. Times interessados podem garantir vaga diretamente pelo WhatsApp oficial.',
       categoria = 'CAMPEONATOS',
       tag = 'INSCRIÇÕES ABERTAS'
 where titulo = 'INSCRICOES ABERTAS PARA A TEMPORADA 2026';

update public.noticias
   set titulo = 'TV ARENA VALE AMPLIA COBERTURA DAS TRANSMISSÕES',
       descricao = 'A partir desta temporada, a TV Arena Vale passa a transmitir um número maior de partidas ao vivo, com cobertura técnica dedicada para Futsal, Futebol 7, Basquete e Vôlei direto do canal oficial no YouTube.',
       categoria = 'BROADCAST',
       tag = 'NOVIDADE'
 where titulo = 'TV ARENA VALE AMPLIA COBERTURA DAS TRANSMISSOES';

update public.noticias
   set titulo = 'ARENA VALE FECHA PARCERIA OFICIAL COM A ACADESF',
       descricao = 'A Arena Vale firma parceria institucional com a ACADESF para fortalecer o desenvolvimento do esporte amador na região do Vale, unindo estrutura, arbitragem e visibilidade para clubes e atletas locais.',
       categoria = 'PARCERIA',
       tag = 'OFICIAL'
 where titulo = 'ARENA VALE FECHA PARCERIA OFICIAL COM A ACADESF';

-- Reconcilia o `tag` legado "INSCRICOES ABERTAS" que ficou em registros
-- criados fora do seed.
update public.noticias
   set tag = 'INSCRIÇÕES ABERTAS'
 where tag = 'INSCRICOES ABERTAS';

-- ───────────────────────────────────────────────────────────────────
-- 7) ORDEM DE EXIBIÇÃO DOS COMUNICADOS EXISTENTES
-- ───────────────────────────────────────────────────────────────────
update public.noticias set ordem = 1 where ordem is null or ordem = 999;

-- ====================================================================
-- FIM
-- ====================================================================
