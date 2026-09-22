-- ====================================================================
-- ARENA VALE SPORTS — Schema inicial completo + RLS Policies
-- ====================================================================
-- Rode com:  supabase db push
-- ====================================================================

-- ===== ENUMS =====
create type user_role as enum ('anonimo', 'autenticado', 'moderador', 'coordenador');
create type campeonato_status as enum ('em_andamento', 'fase_grupos', 'mata_mata', 'finalizado', 'cancelado');
create type jogo_status as enum ('agendado', 'ao_vivo', 'finalizado', 'adiado', 'cancelado');
create type inscricao_status as enum ('pendente', 'aprovada', 'recusada', 'cancelada');
create type sumula_status as enum ('rascunho', 'pendente_assinatura', 'validada', 'contestada');
create type evento_tipo as enum ('gol', 'cartao_amarelo', 'cartao_vermelho', 'substituicao', 'inicio', 'fim');

-- ====================================================================
-- TABELAS
-- ====================================================================

-- Perfis (extensão do auth.users do Supabase)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'autenticado',
  phone text,
  avatar_url text,
  cpf text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_role on public.profiles(role);

-- Coordenadores podem ser apenas 1 (constraint via trigger — ver final)
create table public.coordenadores (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  appointed_at timestamptz not null default now(),
  appointed_by uuid references public.profiles(id)
);

-- Campeonatos
create table public.campeonatos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ano int not null,
  categoria text,
  formato text default 'pontos_corridos',
  status campeonato_status not null default 'em_andamento',
  data_inicio date,
  data_fim date,
  logo_url text,
  descricao text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index idx_campeonatos_ano on public.campeonatos(ano);
create index idx_campeonatos_status on public.campeonatos(status);

-- Times
create table public.times (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  sigla varchar(4) not null,
  escudo_url text,
  escudo_cor text default '#c9a338',
  cidade text,
  fundacao date,
  responsavel_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index idx_times_cidade on public.times(cidade);

-- Inscrições (time ↔ campeonato)
create table public.inscricoes (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid not null references public.campeonatos(id) on delete cascade,
  time_id uuid not null references public.times(id) on delete cascade,
  categoria text,
  valor_pago numeric(10,2),
  status inscricao_status not null default 'pendente',
  submitted_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  unique (campeonato_id, time_id)
);

-- Moderadores por time
create table public.time_moderadores (
  id uuid primary key default gen_random_uuid(),
  time_id uuid not null references public.times(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  username text not null unique,
  password_hash text not null,
  appointed_at timestamptz not null default now(),
  unique (time_id, profile_id)
);

-- Jogadores
create table public.jogadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text unique,
  data_nascimento date,
  posicao text,
  numero_camisa int,
  time_id uuid references public.times(id) on delete set null,
  foto_url text,
  created_at timestamptz not null default now()
);
create index idx_jogadores_time on public.jogadores(time_id);

-- Jogos
create table public.jogos (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid not null references public.campeonatos(id) on delete cascade,
  fase text default 'fase_grupos',
  rodada int,
  data timestamp not null,
  local text,
  time_casa_id uuid not null references public.times(id),
  time_visitante_id uuid not null references public.times(id),
  placar_casa int default 0,
  placar_visitante int default 0,
  placar_casa_1t int,
  placar_visitante_1t int,
  status jogo_status not null default 'agendado',
  arbitro text,
  created_at timestamptz not null default now(),
  check (time_casa_id <> time_visitante_id)
);
create index idx_jogos_campeonato on public.jogos(campeonato_id);
create index idx_jogos_status on public.jogos(status);
create index idx_jogos_data on public.jogos(data);

-- Eventos do jogo
create table public.eventos_jogo (
  id uuid primary key default gen_random_uuid(),
  jogo_id uuid not null references public.jogos(id) on delete cascade,
  tipo evento_tipo not null,
  minuto int not null,
  jogador_id uuid references public.jogadores(id),
  time_id uuid references public.times(id),
  observacao text,
  created_at timestamptz not null default now()
);
create index idx_eventos_jogo on public.eventos_jogo(jogo_id);

-- Súmulas (registro oficial)
create table public.sumulas (
  id uuid primary key default gen_random_uuid(),
  jogo_id uuid not null unique references public.jogos(id) on delete cascade,
  hash_conteudo text not null,  -- SHA-256 imutável
  status sumula_status not null default 'rascunho',
  arbitro_nome text,
  arbitro_assinatura_url text,
  capitão_casa_nome text,
  capitão_casa_assinatura_url text,
  capitão_visitante_nome text,
  capitão_visitante_assinatura_url text,
  observacoes text,
  criada_por uuid references public.profiles(id),
  validada_por uuid references public.profiles(id),
  validada_em timestamptz,
  created_at timestamptz not null default now()
);

-- Transmissões
create table public.transmissoes (
  id uuid primary key default gen_random_uuid(),
  jogo_id uuid not null unique references public.jogos(id) on delete cascade,
  plataforma text not null,  -- youtube, twitch, livepeer
  url text not null,
  embed_url text,
  viewers int default 0,
  status text default 'offline',
  started_at timestamptz,
  ended_at timestamptz
);

-- Patrocinadores
create table public.patrocinadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cota text not null,                 -- master, ouro, prata, bronze, apoio
  valor_mensal numeric(10,2) not null,
  logo_url text,
  logo_initials text,
  logo_cor text default '#c9a338',
  categoria text,
  descricao text,
  site_url text,
  ativo boolean not null default true,
  vigencia_inicio date,
  vigencia_fim date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notificações
create table public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  destinatario_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  mensagem text not null,
  link text,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notificacoes_dest on public.notificacoes(destinatario_id, lida);

-- Financeiro
create table public.financeiro_movimentacoes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,    -- receita, despesa
  categoria text not null,
  descricao text not null,
  valor numeric(10,2) not null,
  campeonato_id uuid references public.campeonatos(id),
  time_id uuid references public.times(id),
  patrocinador_id uuid references public.patrocinadores(id),
  data date not null default current_date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ====================================================================
-- FUNCTIONS & TRIGGERS
-- ====================================================================

-- Profile auto-create on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Coordenador único (só pode haver 1)
create or replace function public.guard_single_coordenador()
returns trigger
language plpgsql
as $$
declare cnt int;
begin
  if new.role = 'coordenador' then
    select count(*) into cnt from public.profiles where role = 'coordenador' and id <> new.id;
    if cnt > 0 then
      raise exception 'Já existe um coordenador cadastrado. Transfira o cargo antes de promover outro usuário.';
    end if;
  end if;
  return new;
end;
$$;
create trigger tr_guard_single_coordenador
  before insert or update of role on public.profiles
  for each row execute function public.guard_single_coordenador();

-- Updated at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger tr_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger tr_patrocinadores_updated before update on public.patrocinadores for each row execute function public.set_updated_at();

-- ====================================================================
-- ROW LEVEL SECURITY (RBAC via policies)
-- ====================================================================
alter table public.profiles enable row level security;
alter table public.coordenadores enable row level security;
alter table public.campeonatos enable row level security;
alter table public.times enable row level security;
alter table public.inscricoes enable row level security;
alter table public.time_moderadores enable row level security;
alter table public.jogadores enable row level security;
alter table public.jogos enable row level security;
alter table public.eventos_jogo enable row level security;
alter table public.sumulas enable row level security;
alter table public.transmissoes enable row level security;
alter table public.patrocinadores enable row level security;
alter table public.notificacoes enable row level security;
alter table public.financeiro_movimentacoes enable row level security;

-- Helper: get current user's role
create or replace function public.current_role()
returns user_role
language sql stable security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_coordenador()
returns boolean language sql stable security definer as $$
  select coalesce(public.current_role() = 'coordenador', false);
$$;

create or replace function public.is_moderador_of(time_uuid uuid)
returns boolean language sql stable security definer as $$
  select exists(
    select 1 from public.time_moderadores
    where profile_id = auth.uid() and time_id = time_uuid
  ) or public.is_coordenador();
$$;

-- PROFILES
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_self" on public.profiles for update using (id = auth.uid());
-- Coordenador pode editar qualquer profile
create policy "profiles_update_coord" on public.profiles for update using (public.is_coordenador());

-- CAMPEONATOS
create policy "camp_read_all" on public.campeonatos for select using (true);
create policy "camp_write_coord" on public.campeonatos for all using (public.is_coordenador());

-- TIMES
create policy "times_read_all" on public.times for select using (true);
create policy "times_write_mod" on public.times for update using (
  public.is_coordenador() or public.is_moderador_of(id)
);
create policy "times_insert_coord" on public.times for insert with check (public.is_coordenador());

-- INSCRIÇÕES
create policy "insc_read_all" on public.inscricoes for select using (true);
create policy "insc_insert_anyone" on public.inscricoes for insert with check (true);  -- signup pode inscrever
create policy "insc_update_coord" on public.inscricoes for update using (public.is_coordenador());

-- TIME_MODERADORES
create policy "mod_read_all" on public.time_moderadores for select using (true);
create policy "mod_write_coord" on public.time_moderadores for all using (public.is_coordenador());

-- JOGADORES
create policy "jog_read_all" on public.jogadores for select using (true);
create policy "jog_write_mod" on public.jogadores for all using (
  public.is_coordenador() or (time_id is not null and public.is_moderador_of(time_id))
);

-- JOGOS (leitura pública, escrita só coordenador)
create policy "jogos_read_all" on public.jogos for select using (true);
create policy "jogos_write_coord" on public.jogos for all using (public.is_coordenador());
-- Moderador pode atualizar placar/resultado do seu time (lançamento de súmula)
create policy "jogos_update_mod" on public.jogos for update using (
  public.is_coordenador() or public.is_moderador_of(time_casa_id) or public.is_moderador_of(time_visitante_id)
);

-- EVENTOS_JOGO
create policy "ev_read_all" on public.eventos_jogo for select using (true);
create policy "ev_write_mod" on public.eventos_jogo for all using (
  public.is_coordenador()
  or exists(select 1 from public.jogos j where j.id = jogo_id and (public.is_moderador_of(j.time_casa_id) or public.is_moderador_of(j.time_visitante_id)))
);

-- SÚMULAS
create policy "sum_read_validated_or_participant" on public.sumulas for select using (
  status = 'validada'
  or public.is_coordenador()
  or criada_por = auth.uid()
);
create policy "sum_insert_mod" on public.sumulas for insert with check (
  public.is_coordenador() or criada_por = auth.uid()
);
create policy "sum_update_owner" on public.sumulas for update using (
  public.is_coordenador() or criada_por = auth.uid()
);

-- TRANSMISSÕES
create policy "trans_read_all" on public.transmissoes for select using (true);
create policy "trans_write_coord" on public.transmissoes for all using (public.is_coordenador());

-- PATROCINADORES (públicos para leitura)
create policy "patro_read_all" on public.patrocinadores for select using (true);
create policy "patro_write_coord" on public.patrocinadores for all using (public.is_coordenador());

-- NOTIFICAÇÕES (só vê as próprias)
create policy "notif_self" on public.notificacoes for all using (destinatario_id = auth.uid());

-- FINANCEIRO (somente coordenador)
create policy "fin_coord_only" on public.financeiro_movimentacoes for all using (public.is_coordenador());

-- ====================================================================
-- VIEWS ÚTEIS
-- ====================================================================

-- Classificação agregada
create or replace view public.v_classificacao as
select
  j.campeonato_id,
  t.id as time_id,
  t.nome as time_nome,
  t.sigla as time_sigla,
  t.escudo_cor,
  sum(
    case when j.time_casa_id = t.id then
      case
        when j.placar_casa > j.placar_visitante then 3
        when j.placar_casa = j.placar_visitante then 1
        else 0
      end
    when j.time_visitante_id = t.id then
      case
        when j.placar_visitante > j.placar_casa then 3
        when j.placar_visitante = j.placar_casa then 1
        else 0
      end
    else 0 end
  )::int as pontos,
  count(j.id)::int as jogos,
  sum(case when j.time_casa_id = t.id and j.placar_casa > j.placar_visitante then 1
           when j.time_visitante_id = t.id and j.placar_visitante > j.placar_casa then 1
           else 0 end)::int as vitorias,
  sum(case when (j.time_casa_id = t.id or j.time_visitante_id = t.id) and j.placar_casa = j.placar_visitante then 1
           else 0 end)::int as empates,
  sum(case when j.time_casa_id = t.id and j.placar_casa < j.placar_visitante then 1
           when j.time_visitante_id = t.id and j.placar_visitante < j.placar_casa then 1
           else 0 end)::int as derrotas,
  sum(case when j.time_casa_id = t.id then j.placar_casa
           when j.time_visitante_id = t.id then j.placar_visitante
           else 0 end)::int as gols_pro,
  sum(case when j.time_casa_id = t.id then j.placar_visitante
           when j.time_visitante_id = t.id then j.placar_casa
           else 0 end)::int as gols_contra
from public.times t
cross join public.jogos j
where j.status = 'finalizado' and (j.time_casa_id = t.id or j.time_visitante_id = t.id)
group by j.campeonato_id, t.id, t.nome, t.sigla, t.escudo_cor;

-- ====================================================================
-- FIM — script idempotente (rode quantas vezes quiser)
-- ====================================================================
