-- ====================================================================
-- 0023 — Campeonatos: aba própria, formas de disputa, elenco por campeonato,
-- escudo do time, até 3 moderadores e correção de jogo encerrado.
-- Spec: docs/superpowers/specs/2026-11-17-campeonatos-design.md (4.3, 4.5, 4.6, 4.6a)
-- Idempotente: pode rodar mais de uma vez.
-- ====================================================================
set lock_timeout = '5s';

-- ─── 1) campeonatos ─────────────────────────────────────────────────
alter table public.campeonatos add column if not exists slug text;
alter table public.campeonatos add column if not exists regulamento jsonb;
alter table public.campeonatos add column if not exists visivel boolean not null default false;
alter table public.campeonatos add column if not exists ordem_sorteio jsonb not null default '{}';
alter table public.campeonatos add column if not exists fases_destravadas text[] not null default '{}';

-- Mesma regra de lib/campeonatos/texto.ts (slugCampeonato).
create or replace function public.slug_campeonato(p_nome text, p_ano int)
returns text language sql immutable set search_path = public as $$
  with b as (
    select trim(both '-' from regexp_replace(
      lower(translate(coalesce(p_nome, ''),
        'áàâãäåéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÅÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
        'aaaaaaeeeeiiiiooooouuuucnaaaaaaeeeeiiiiooooouuuucn')),
      '[^a-z0-9]+', '-', 'g')) as s
  )
  select case
    when s = '' then p_ano::text
    when s = p_ano::text or s like '%-' || p_ano::text then s
    else s || '-' || p_ano::text
  end from b;
$$;

-- Primeiro endereço livre: base, base-2, base-3…
create or replace function public.slug_livre(p_base text, p_ignorar uuid default null)
returns text language plpgsql stable set search_path = public as $$
declare
  candidato text := p_base;
  n int := 1;
begin
  while exists (select 1 from public.campeonatos where slug = candidato and (p_ignorar is null or id <> p_ignorar)) loop
    n := n + 1;
    candidato := p_base || '-' || n;
  end loop;
  return candidato;
end $$;

-- Campeonatos que já existem: continuam no site e ganham endereço (só na 1ª aplicação).
do $$
declare r record;
begin
  update public.campeonatos set visivel = true where slug is null;
  for r in select id, nome, ano from public.campeonatos where slug is null order by created_at, id loop
    update public.campeonatos set slug = public.slug_livre(public.slug_campeonato(r.nome, r.ano), r.id) where id = r.id;
  end loop;
end $$;

create unique index if not exists campeonatos_slug_key on public.campeonatos (slug);

-- Campeonato novo sem endereço recebe um sozinho.
create or replace function public.preencher_slug_campeonato()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.slug is null or btrim(new.slug) = '' then
    new.slug := public.slug_livre(public.slug_campeonato(new.nome, new.ano), new.id);
  end if;
  return new;
end $$;
drop trigger if exists tr_preencher_slug_campeonato on public.campeonatos;
create trigger tr_preencher_slug_campeonato
  before insert on public.campeonatos
  for each row execute function public.preencher_slug_campeonato();

-- ─── 2) jogos ───────────────────────────────────────────────────────
alter table public.jogos alter column time_casa_id drop not null;
alter table public.jogos alter column time_visitante_id drop not null;
alter table public.jogos alter column data drop not null;
alter table public.jogos add column if not exists grupo text;
alter table public.jogos add column if not exists ordem int;
alter table public.jogos add column if not exists vaga_casa jsonb;
alter table public.jogos add column if not exists vaga_visitante jsonb;
alter table public.jogos add column if not exists vaga_manual boolean not null default false;
alter table public.jogos add column if not exists jogo_volta_de uuid references public.jogos(id) on delete set null;
alter table public.jogos add column if not exists penaltis_casa int;
alter table public.jogos add column if not exists penaltis_visitante int;
alter table public.jogos add column if not exists wo text;
alter table public.jogos add column if not exists parciais jsonb;
alter table public.jogos drop constraint if exists jogos_wo_check;
alter table public.jogos add constraint jogos_wo_check check (wo in ('casa', 'visitante'));
create unique index if not exists jogos_campeonato_ordem_key on public.jogos (campeonato_id, ordem) where ordem is not null;

-- ─── 3) times ───────────────────────────────────────────────────────
alter table public.times add column if not exists cadastrado_por uuid references public.profiles(id) default auth.uid();
-- O dourado antigo não é mais cor da marca: time sem cor usa o vermelho no escudo padrão.
alter table public.times alter column escudo_cor set default null;
update public.times set escudo_cor = null where lower(escudo_cor) = '#c9a338';

-- ─── 3a) correções de jogo encerrado (só a coordenação lê) ───────────
create table if not exists public.correcoes_jogo (
  id uuid primary key default gen_random_uuid(),
  jogo_id uuid not null references public.jogos(id) on delete cascade,
  corrigido_por uuid references public.profiles(id) on delete set null,
  corrigido_em timestamptz not null default now(),
  antes jsonb not null,
  depois jsonb not null
);
create index if not exists idx_correcoes_jogo on public.correcoes_jogo (jogo_id, corrigido_em desc);
alter table public.correcoes_jogo enable row level security;

-- ─── 4) elenco por campeonato ───────────────────────────────────────
create table if not exists public.inscricao_atletas (
  id uuid primary key default gen_random_uuid(),
  inscricao_id uuid not null references public.inscricoes(id) on delete cascade,
  campeonato_id uuid not null references public.campeonatos(id) on delete cascade,
  jogador_id uuid not null references public.jogadores(id) on delete cascade,
  numero_camisa int,
  posicao text,
  created_at timestamptz not null default now(),
  unique (campeonato_id, jogador_id)
);
create index if not exists idx_inscricao_atletas_inscricao on public.inscricao_atletas (inscricao_id);
alter table public.inscricao_atletas enable row level security;

create or replace function public.preencher_campeonato_do_elenco()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select i.campeonato_id into new.campeonato_id from public.inscricoes i where i.id = new.inscricao_id;
  if new.campeonato_id is null then
    raise exception 'Inscrição não encontrada.';
  end if;
  return new;
end $$;
drop trigger if exists tr_preencher_campeonato_do_elenco on public.inscricao_atletas;
create trigger tr_preencher_campeonato_do_elenco
  before insert or update on public.inscricao_atletas
  for each row execute function public.preencher_campeonato_do_elenco();

-- ─── 5) funções ─────────────────────────────────────────────────────
-- O delegado só age enquanto tem o cargo: ao finalizar ele é rebaixado e perde o acesso.
create or replace function public.is_delegado_do_jogo(p_jogo_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.cargo_atual() = 'delegado'
     and exists (select 1 from public.jogos where id = p_jogo_id and delegado_id = auth.uid());
$$;

create or replace function public.campeonato_publico(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select visivel from public.campeonatos where id = c), false);
$$;

create or replace function public.pode_editar_campeonato(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_staff() or public.is_moderador_do_campeonato(c);
$$;

create or replace function public.pode_mexer_inscricao(i uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.inscricoes x
     where x.id = i
       and (public.is_staff() or public.is_moderador_do_campeonato(x.campeonato_id) or public.is_capitao_do_time(x.time_id)));
$$;

create or replace function public.pode_trocar_escudo(t uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_capitao_do_time(t);
$$;

-- Moderador edita nome/sigla do time que cadastrou só enquanto o time joga apenas nos campeonatos dele.
create or replace function public.pode_editar_time_cadastrado(t uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.cargo_atual() = 'moderador'
     and exists (select 1 from public.times where id = t and cadastrado_por = auth.uid())
     and not exists (
       select 1 from public.inscricoes i
        where i.time_id = t and not public.is_moderador_do_campeonato(i.campeonato_id));
$$;

create or replace function public.criar_campeonato(p_nome text, p_ano int, p_modalidade text default null, p_categoria text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  cargo public.user_role := public.cargo_atual();
  novo uuid;
begin
  if cargo is null or cargo not in ('moderador', 'coordenador') then
    raise exception 'Sem permissão para criar campeonato.';
  end if;
  if coalesce(btrim(p_nome), '') = '' then
    raise exception 'Informe o nome do campeonato.';
  end if;
  insert into public.campeonatos (nome, ano, modalidade, categoria, visivel, created_by)
  values (btrim(p_nome), p_ano, nullif(btrim(coalesce(p_modalidade, '')), ''), nullif(btrim(coalesce(p_categoria, '')), ''), false, auth.uid())
  returning id into novo;
  if cargo = 'moderador' then
    insert into public.campeonato_moderadores (profile_id, campeonato_id) values (auth.uid(), novo);
  end if;
  return novo;
end $$;

create or replace function public.inscrever_atleta(
  p_inscricao uuid, p_cpf text, p_nome text,
  p_posicao text default null, p_numero int default null, p_foto_url text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  insc record;
  v_cpf text;
  v_jogador uuid;
  v_time text;
  v_id uuid;
begin
  select i.id, i.campeonato_id, i.time_id into insc from public.inscricoes i where i.id = p_inscricao;
  if not found then
    raise exception 'Inscrição não encontrada.';
  end if;
  if not (public.is_staff() or public.is_moderador_do_campeonato(insc.campeonato_id) or public.is_capitao_do_time(insc.time_id)) then
    raise exception 'Sem permissão.';
  end if;
  v_cpf := regexp_replace(coalesce(p_cpf, ''), '[^0-9]', '', 'g');
  if length(v_cpf) <> 11 then
    raise exception 'CPF inválido. Confira os números.';
  end if;

  select j.id into v_jogador from public.jogadores j
   where regexp_replace(coalesce(j.cpf, ''), '[^0-9]', '', 'g') = v_cpf
   limit 1;
  if v_jogador is null then
    if coalesce(btrim(p_nome), '') = '' then
      raise exception 'Informe o nome completo do atleta.';
    end if;
    insert into public.jogadores (nome, cpf, posicao, numero_camisa, foto_url, time_id)
    values (btrim(p_nome), v_cpf, nullif(btrim(coalesce(p_posicao, '')), ''), p_numero, p_foto_url, insc.time_id)
    returning id into v_jogador;
  end if;

  -- Vale quem inscreveu primeiro.
  select t.nome into v_time
    from public.inscricao_atletas ia
    join public.inscricoes i on i.id = ia.inscricao_id
    join public.times t on t.id = i.time_id
   where ia.campeonato_id = insc.campeonato_id and ia.jogador_id = v_jogador;
  if found then
    raise exception 'Este atleta já está inscrito neste campeonato pelo time %.', v_time;
  end if;

  begin
    insert into public.inscricao_atletas (inscricao_id, campeonato_id, jogador_id, numero_camisa, posicao)
    values (p_inscricao, insc.campeonato_id, v_jogador, p_numero, nullif(btrim(coalesce(p_posicao, '')), ''))
    returning id into v_id;
  exception when unique_violation then
    select t.nome into v_time
      from public.inscricao_atletas ia
      join public.inscricoes i on i.id = ia.inscricao_id
      join public.times t on t.id = i.time_id
     where ia.campeonato_id = insc.campeonato_id and ia.jogador_id = v_jogador;
    raise exception 'Este atleta já está inscrito neste campeonato pelo time %.', v_time;
  end;
  return v_id;
end $$;

create or replace function public.copiar_elenco(p_destino uuid, p_origem uuid)
returns int language plpgsql security definer set search_path = public as $$
declare
  destino record;
  origem record;
  copiados int;
begin
  select i.id, i.campeonato_id, i.time_id into destino from public.inscricoes i where i.id = p_destino;
  select i.id, i.campeonato_id, i.time_id into origem from public.inscricoes i where i.id = p_origem;
  if destino.id is null or origem.id is null then
    raise exception 'Inscrição não encontrada.';
  end if;
  if not (public.is_staff() or public.is_moderador_do_campeonato(destino.campeonato_id) or public.is_capitao_do_time(destino.time_id)) then
    raise exception 'Sem permissão.';
  end if;
  if destino.time_id is distinct from origem.time_id then
    raise exception 'Só dá para copiar o elenco do mesmo time.';
  end if;
  insert into public.inscricao_atletas (inscricao_id, campeonato_id, jogador_id, numero_camisa, posicao)
  select p_destino, destino.campeonato_id, ia.jogador_id, ia.numero_camisa, ia.posicao
    from public.inscricao_atletas ia
   where ia.inscricao_id = p_origem
  on conflict (campeonato_id, jogador_id) do nothing;
  get diagnostics copiados = row_count;
  return copiados;
end $$;

-- As funções usadas nas políticas também são chamadas pelo visitante (anon).
revoke all on function public.campeonato_publico(uuid) from public, anon;
revoke all on function public.pode_editar_campeonato(uuid) from public, anon;
revoke all on function public.pode_mexer_inscricao(uuid) from public, anon;
revoke all on function public.pode_trocar_escudo(uuid) from public, anon;
revoke all on function public.pode_editar_time_cadastrado(uuid) from public, anon;
revoke all on function public.criar_campeonato(text, int, text, text) from public, anon;
revoke all on function public.inscrever_atleta(uuid, text, text, text, int, text) from public, anon;
revoke all on function public.copiar_elenco(uuid, uuid) from public, anon;
grant execute on function public.campeonato_publico(uuid) to anon, authenticated;
grant execute on function public.pode_editar_campeonato(uuid) to anon, authenticated;
grant execute on function public.pode_mexer_inscricao(uuid) to anon, authenticated;
grant execute on function public.pode_trocar_escudo(uuid) to anon, authenticated;
grant execute on function public.pode_editar_time_cadastrado(uuid) to anon, authenticated;
grant execute on function public.criar_campeonato(text, int, text, text) to authenticated;
grant execute on function public.inscrever_atleta(uuid, text, text, text, int, text) to authenticated;
grant execute on function public.copiar_elenco(uuid, uuid) to authenticated;

-- ─── 6) políticas ───────────────────────────────────────────────────
-- campeonatos: o público vê só os liberados; a equipe do campeonato vê os seus.
drop policy if exists campeonatos_leitura on public.campeonatos;
create policy campeonatos_leitura on public.campeonatos for select using (
  visivel
  or public.pode_editar_campeonato(id)
  or exists (select 1 from public.time_capitaes tc where tc.profile_id = auth.uid() and tc.campeonato_id = campeonatos.id)
);
drop policy if exists campeonatos_moderador_atualiza on public.campeonatos;
create policy campeonatos_moderador_atualiza on public.campeonatos for update
  using (public.is_moderador_do_campeonato(id))
  with check (public.is_moderador_do_campeonato(id));

-- jogos
drop policy if exists jogos_leitura on public.jogos;
create policy jogos_leitura on public.jogos for select using (
  public.campeonato_publico(campeonato_id)
  or public.pode_editar_campeonato(campeonato_id)
  or delegado_id = auth.uid()
);
drop policy if exists jogos_insere_staff on public.jogos;
create policy jogos_insere_staff on public.jogos for insert with check (public.pode_editar_campeonato(campeonato_id));
drop policy if exists jogos_apaga_staff on public.jogos;
create policy jogos_apaga_staff on public.jogos for delete using (public.pode_editar_campeonato(campeonato_id));

-- inscrições
drop policy if exists inscricoes_insere_staff on public.inscricoes;
create policy inscricoes_insere_staff on public.inscricoes for insert with check (public.pode_editar_campeonato(campeonato_id));
drop policy if exists inscricoes_atualiza_staff on public.inscricoes;
create policy inscricoes_atualiza_staff on public.inscricoes for update
  using (public.pode_editar_campeonato(campeonato_id))
  with check (public.pode_editar_campeonato(campeonato_id));
drop policy if exists inscricoes_apaga_staff on public.inscricoes;
create policy inscricoes_apaga_staff on public.inscricoes for delete using (public.pode_editar_campeonato(campeonato_id));

-- times
drop policy if exists times_insere_staff on public.times;
create policy times_insere_staff on public.times for insert with check (
  public.is_staff() or (public.cargo_atual() = 'moderador' and cadastrado_por = auth.uid())
);
drop policy if exists times_atualiza on public.times;
create policy times_atualiza on public.times for update
  using (public.is_staff() or public.is_capitao_do_time(id) or public.pode_editar_time_cadastrado(id))
  with check (public.is_staff() or public.is_capitao_do_time(id) or public.pode_editar_time_cadastrado(id));

-- correções: só a coordenação lê; só o trigger grava.
drop policy if exists correcoes_jogo_leitura on public.correcoes_jogo;
create policy correcoes_jogo_leitura on public.correcoes_jogo for select using (public.is_staff());

-- elenco por campeonato: leitura pública; inclusão pelas funções; ajuste e remoção pela equipe do time/campeonato.
drop policy if exists inscricao_atletas_leitura on public.inscricao_atletas;
create policy inscricao_atletas_leitura on public.inscricao_atletas for select using (true);
drop policy if exists inscricao_atletas_atualiza on public.inscricao_atletas;
create policy inscricao_atletas_atualiza on public.inscricao_atletas for update
  using (public.pode_mexer_inscricao(inscricao_id))
  with check (public.pode_mexer_inscricao(inscricao_id));
drop policy if exists inscricao_atletas_apaga on public.inscricao_atletas;
create policy inscricao_atletas_apaga on public.inscricao_atletas for delete using (public.pode_mexer_inscricao(inscricao_id));

-- ─── 7) triggers ────────────────────────────────────────────────────
create or replace function public.proteger_campeonato()
returns trigger language plpgsql set search_path = public as $$
begin
  if public.is_staff() or current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;
  if new.visivel is distinct from old.visivel
     or new.slug is distinct from old.slug
     or new.fases_destravadas is distinct from old.fases_destravadas
     or new.created_by is distinct from old.created_by then
    raise exception 'Só a ARENA VALE muda isso.';
  end if;
  return new;
end $$;
drop trigger if exists tr_proteger_campeonato on public.campeonatos;
create trigger tr_proteger_campeonato
  before update on public.campeonatos
  for each row execute function public.proteger_campeonato();

-- O moderador do campeonato muda tudo no jogo, menos o delegado e o campeonato;
-- o delegado só lança placar e status.
create or replace function public.moderador_so_resultado()
returns trigger language plpgsql as $$
begin
  if public.is_staff()
     or current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;
  if public.is_moderador_do_campeonato(old.campeonato_id) then
    if new.delegado_id is distinct from old.delegado_id
       or new.campeonato_id is distinct from old.campeonato_id then
      raise exception 'Apenas a coordenação altera dados estruturais do jogo.';
    end if;
    return new;
  end if;
  if new.data is distinct from old.data
     or new.local is distinct from old.local
     or new.time_casa_id is distinct from old.time_casa_id
     or new.time_visitante_id is distinct from old.time_visitante_id
     or new.campeonato_id is distinct from old.campeonato_id
     or new.fase is distinct from old.fase
     or new.rodada is distinct from old.rodada
     or new.grupo is distinct from old.grupo
     or new.ordem is distinct from old.ordem
     or new.vaga_casa is distinct from old.vaga_casa
     or new.vaga_visitante is distinct from old.vaga_visitante
     or new.vaga_manual is distinct from old.vaga_manual
     or new.jogo_volta_de is distinct from old.jogo_volta_de
     or new.delegado_id is distinct from old.delegado_id then
    raise exception 'Apenas a coordenação altera dados estruturais do jogo.';
  end if;
  return new;
end;
$$;
drop trigger if exists tr_moderador_so_resultado on public.jogos;
create trigger tr_moderador_so_resultado
  before update on public.jogos
  for each row execute function public.moderador_so_resultado();

create or replace function public.limite_moderadores()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform 1 from public.campeonatos where id = new.campeonato_id for update;
  if (select count(*) from public.campeonato_moderadores where campeonato_id = new.campeonato_id) >= 3 then
    raise exception 'Este campeonato já tem 3 moderadores.';
  end if;
  return new;
end $$;
drop trigger if exists tr_limite_moderadores on public.campeonato_moderadores;
create trigger tr_limite_moderadores
  before insert on public.campeonato_moderadores
  for each row execute function public.limite_moderadores();

create or replace function public.marcar_correcao()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status = 'finalizado' and (
       new.placar_casa is distinct from old.placar_casa
    or new.placar_visitante is distinct from old.placar_visitante
    or new.penaltis_casa is distinct from old.penaltis_casa
    or new.penaltis_visitante is distinct from old.penaltis_visitante
    or new.wo is distinct from old.wo
    or new.parciais is distinct from old.parciais) then
    insert into public.correcoes_jogo (jogo_id, corrigido_por, antes, depois)
    values (
      new.id,
      auth.uid(),
      jsonb_build_object('placar_casa', old.placar_casa, 'placar_visitante', old.placar_visitante,
        'penaltis_casa', old.penaltis_casa, 'penaltis_visitante', old.penaltis_visitante, 'wo', old.wo, 'parciais', old.parciais),
      jsonb_build_object('placar_casa', new.placar_casa, 'placar_visitante', new.placar_visitante,
        'penaltis_casa', new.penaltis_casa, 'penaltis_visitante', new.penaltis_visitante, 'wo', new.wo, 'parciais', new.parciais));
  end if;
  return new;
end $$;
drop trigger if exists tr_marcar_correcao on public.jogos;
create trigger tr_marcar_correcao
  after update on public.jogos
  for each row execute function public.marcar_correcao();

create or replace function public.proteger_escudo_time()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.escudo_url := null;
    new.escudo_cor := null;
    return new;
  end if;
  if (new.escudo_url is distinct from old.escudo_url or new.escudo_cor is distinct from old.escudo_cor)
     and not public.is_capitao_do_time(old.id) then
    raise exception 'Só o capitão do time troca o escudo.';
  end if;
  return new;
end $$;
drop trigger if exists tr_proteger_escudo_time on public.times;
create trigger tr_proteger_escudo_time
  before insert or update on public.times
  for each row execute function public.proteger_escudo_time();

-- ─── 8) classificação antiga respeita quem pode ver cada jogo ───────
alter view if exists public.v_classificacao set (security_invoker = true);

-- ─── 9) escudos (só a service role grava) ───────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('campeonatos', 'campeonatos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- ─── 10) elenco dos campeonatos que já existem (só na 1ª aplicação) ─
do $$
begin
  if not exists (select 1 from public.inscricao_atletas) then
    insert into public.inscricao_atletas (inscricao_id, campeonato_id, jogador_id, numero_camisa, posicao)
    select i.id, i.campeonato_id, j.id, j.numero_camisa, j.posicao
      from public.inscricoes i
      join public.jogadores j on j.time_id = i.time_id
     order by i.submitted_at, i.id
    on conflict (campeonato_id, jogador_id) do nothing;
  end if;
end $$;

notify pgrst, 'reload schema';

-- Casos para a coordenação conferir.
select 'mais de 3 moderadores' as caso, c.nome as campeonato, count(*)::text as detalhe
  from public.campeonato_moderadores cm
  join public.campeonatos c on c.id = cm.campeonato_id
 group by c.id, c.nome
having count(*) > 3;
