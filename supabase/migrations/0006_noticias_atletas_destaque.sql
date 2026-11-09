-- ====================================================================
-- ARENA VALE — Tabelas e conteúdo inicial de Comunicados e Destaques
-- ====================================================================
-- Rode com:  supabase db push  (ou cole direto no SQL Editor do Supabase)
-- Script idempotente: pode rodar mais de uma vez sem duplicar
--
-- CORREÇÃO: esta migração ANTES apenas fazia INSERT em `noticias` e
-- `atletas_destaque`, mas NENHUMA migração criava essas tabelas. Em uma
-- instalação nova a partir do repositório, o INSERT falhava com
-- "relation public.noticias does not exist" e TODO o fluxo editorial
-- (Home, mural /noticias, galeria /atletasdestaques, painéis) ficava
-- sem tabela. Agora o DDL vem ANTES do seed.
--
-- O texto do seed é gravado COM acentuação. A versão anterior gravava
-- "INSCRICOES ABERTAS", "Estao abertas" e "Volei", o que obrigava cada
-- tela a corrigir o texto na mão (e só a Home fazia isso).
-- ====================================================================

-- ───────────────────────────────────────────────────────────────────
-- COMUNICADOS
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

-- ───────────────────────────────────────────────────────────────────
-- DESTAQUES (atletas em destaque)
-- Colunas alinhadas ao banco de produção:
--   foto_url, atleta_nome, time_nome, campeonato_nome, ativo, ordem
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

-- ───────────────────────────────────────────────────────────────────
-- CONTEÚDO INICIAL DE COMUNICADOS (texto real, com acentuação)
-- ───────────────────────────────────────────────────────────────────
insert into public.noticias (titulo, descricao, categoria, tag, ordem, ativo)
select * from (values
  (
    'ARENA VALE FECHA PARCERIA OFICIAL COM A ACADESF',
    'A Arena Vale firma parceria institucional com a ACADESF para fortalecer o desenvolvimento do esporte amador na região do Vale, unindo estrutura, arbitragem e visibilidade para clubes e atletas locais.',
    'PARCERIA',
    'OFICIAL',
    1,
    true
  ),
  (
    'INSCRIÇÕES ABERTAS PARA A TEMPORADA 2026',
    'Estão abertas as inscrições de equipes para o Circuito de Futsal, a Copa de Futebol 7, a Liga de Basquete e o Torneio de Vôlei da temporada 2026. Times interessados podem garantir vaga diretamente pelo WhatsApp oficial.',
    'CAMPEONATOS',
    'INSCRIÇÕES ABERTAS',
    2,
    true
  ),
  (
    'TV ARENA VALE AMPLIA COBERTURA DAS TRANSMISSÕES',
    'A partir desta temporada, a TV Arena Vale passa a transmitir um número maior de partidas ao vivo, com cobertura técnica dedicada para Futsal, Futebol 7, Basquete e Vôlei direto do canal oficial no YouTube.',
    'BROADCAST',
    'NOVIDADE',
    3,
    true
  )
) as v(titulo, descricao, categoria, tag, ordem, ativo)
where not exists (
  select 1 from public.noticias n where n.titulo = v.titulo
);

-- ====================================================================
-- FIM
-- ====================================================================
