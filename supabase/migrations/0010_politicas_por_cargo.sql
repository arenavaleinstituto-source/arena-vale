-- ====================================================================
-- ARENA VALE — 0010: políticas de acesso por cargo (spec, seção 5)
-- ====================================================================
-- Idempotente. Começa APAGANDO todas as políticas das tabelas públicas —
-- o banco de produção tem políticas criadas fora do repositório e políticas
-- de RLS se somam (OR): uma política antiga "aberta" anularia as novas.
--
--  proprietário/coordenador (staff) → tudo
--  moderador → resultados, eventos e súmulas dos SEUS campeonatos
--  capitão   → a própria equipe e os jogadores dela
--  visitante → leitura do que é público
-- ====================================================================

-- 1) Zera as políticas e liga o RLS em todas as tabelas públicas ------------
do $$
declare r record;
begin
  for r in select tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end $$;

-- 2) Moderador por campeonato ----------------------------------------------
create table if not exists public.campeonato_moderadores (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  campeonato_id uuid not null references public.campeonatos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, campeonato_id)
);
alter table public.campeonato_moderadores enable row level security;

-- vínculos antigos (moderador por time + campeonato) continuam valendo
insert into public.campeonato_moderadores (profile_id, campeonato_id)
select distinct profile_id, campeonato_id from public.time_moderadores where campeonato_id is not null
on conflict do nothing;

-- 3) Capitão convidado por campeonato (a equipe chega depois) ---------------
alter table public.time_capitaes add column if not exists campeonato_id uuid references public.campeonatos(id) on delete cascade;
alter table public.time_capitaes alter column time_id drop not null;
update public.time_capitaes tc
   set campeonato_id = (select i.campeonato_id from public.inscricoes i where i.time_id = tc.time_id order by i.submitted_at desc limit 1)
 where tc.campeonato_id is null and tc.time_id is not null;
create unique index if not exists time_capitaes_um_por_campeonato
  on public.time_capitaes (profile_id, campeonato_id) where campeonato_id is not null;

-- 4) Funções de vínculo ----------------------------------------------------
create or replace function public.is_moderador_do_campeonato(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.campeonato_moderadores where profile_id = auth.uid() and campeonato_id = c);
$$;

create or replace function public.is_moderador_do_jogo(j uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.jogos g
      join public.campeonato_moderadores cm on cm.campeonato_id = g.campeonato_id
     where g.id = j and cm.profile_id = auth.uid());
$$;

create or replace function public.is_capitao_do_time(t uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.time_capitaes where profile_id = auth.uid() and time_id = t);
$$;

-- 5) Capitão cadastra a própria equipe ---------------------------------------
create or replace function public.criar_minha_equipe(campeonato uuid, nome text, sigla text, escudo_url text default null)
returns uuid language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
declare
  convite record;
  novo_time uuid;
begin
  select tc.id, tc.time_id into convite
    from public.time_capitaes tc
   where tc.profile_id = auth.uid() and tc.campeonato_id = campeonato;
  if not found then
    raise exception 'Você não foi convidado como capitão neste campeonato.';
  end if;
  if convite.time_id is not null then
    raise exception 'Você já cadastrou sua equipe neste campeonato.';
  end if;
  if coalesce(btrim(nome), '') = '' or coalesce(btrim(sigla), '') = '' then
    raise exception 'Informe o nome e a sigla da equipe.';
  end if;

  insert into public.times (nome, sigla, escudo_url, responsavel_id)
  values (btrim(nome), upper(left(btrim(sigla), 4)), escudo_url, auth.uid())
  returning id into novo_time;

  insert into public.inscricoes (campeonato_id, time_id, status)
  values (campeonato, novo_time, 'pendente');

  update public.time_capitaes set time_id = novo_time where id = convite.id;
  return novo_time;
end;
$$;
revoke execute on function public.criar_minha_equipe(uuid, text, text, text) from anon;

-- 6) Moderador só mexe em resultado ----------------------------------------
create or replace function public.moderador_so_resultado()
returns trigger language plpgsql as $$
begin
  if public.is_staff()
     or coalesce(auth.role(), '') = 'service_role'
     or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;
  if new.data is distinct from old.data
     or new.local is distinct from old.local
     or new.time_casa_id is distinct from old.time_casa_id
     or new.time_visitante_id is distinct from old.time_visitante_id
     or new.campeonato_id is distinct from old.campeonato_id
     or new.fase is distinct from old.fase
     or new.rodada is distinct from old.rodada then
    raise exception 'Moderador só lança resultados.';
  end if;
  return new;
end;
$$;
drop trigger if exists tr_moderador_so_resultado on public.jogos;
create trigger tr_moderador_so_resultado
  before update on public.jogos
  for each row execute function public.moderador_so_resultado();

-- 7) Políticas ----------------------------------------------------------------
-- profiles (o cargo é protegido pelo trigger da 0009)
create policy profiles_leitura on public.profiles for select using (true);
create policy profiles_proprio on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_staff on public.profiles for update using (public.is_staff()) with check (public.is_staff());

-- marca do dono
create policy proprietario_le_a_propria_linha on public.proprietario for select using (profile_id = auth.uid());

-- conteúdo e configuração: leitura pública, escrita da coordenação
create policy campeonatos_leitura on public.campeonatos for select using (true);
create policy campeonatos_staff on public.campeonatos for all using (public.is_staff()) with check (public.is_staff());
create policy transmissoes_leitura on public.transmissoes for select using (true);
create policy transmissoes_staff on public.transmissoes for all using (public.is_staff()) with check (public.is_staff());
create policy patrocinadores_leitura on public.patrocinadores for select using (true);
create policy patrocinadores_staff on public.patrocinadores for all using (public.is_staff()) with check (public.is_staff());
create policy site_config_leitura on public.site_config for select using (true);
create policy site_config_staff on public.site_config for all using (public.is_staff()) with check (public.is_staff());
create policy coordenadores_leitura on public.coordenadores for select using (true);
create policy coordenadores_staff on public.coordenadores for all using (public.is_staff()) with check (public.is_staff());
create policy noticias_leitura on public.noticias for select using (ativo = true or public.is_staff());
create policy noticias_staff on public.noticias for all using (public.is_staff()) with check (public.is_staff());
create policy atletas_destaque_leitura on public.atletas_destaque for select using (ativo = true or public.is_staff());
create policy atletas_destaque_staff on public.atletas_destaque for all using (public.is_staff()) with check (public.is_staff());

do $$
begin
  if to_regclass('public.agenda_jogos') is not null then
    execute 'create policy agenda_jogos_leitura on public.agenda_jogos for select using (true)';
    execute 'create policy agenda_jogos_staff on public.agenda_jogos for all using (public.is_staff()) with check (public.is_staff())';
  end if;
end $$;

-- times: coordenação; capitão edita o próprio
create policy times_leitura on public.times for select using (true);
create policy times_insere_staff on public.times for insert with check (public.is_staff());
create policy times_atualiza on public.times for update
  using (public.is_staff() or public.is_capitao_do_time(id))
  with check (public.is_staff() or public.is_capitao_do_time(id));
create policy times_apaga_staff on public.times for delete using (public.is_staff());

-- inscrições: formulário público insere; coordenação aprova
create policy inscricoes_leitura on public.inscricoes for select using (true);
create policy inscricoes_insere on public.inscricoes for insert with check (true);
create policy inscricoes_atualiza_staff on public.inscricoes for update using (public.is_staff()) with check (public.is_staff());
create policy inscricoes_apaga_staff on public.inscricoes for delete using (public.is_staff());

-- vínculos de moderador e capitão
create policy campeonato_moderadores_leitura on public.campeonato_moderadores for select using (public.is_staff() or profile_id = auth.uid());
create policy campeonato_moderadores_staff on public.campeonato_moderadores for all using (public.is_staff()) with check (public.is_staff());
create policy time_capitaes_leitura on public.time_capitaes for select using (public.is_staff() or profile_id = auth.uid());
create policy time_capitaes_staff on public.time_capitaes for all using (public.is_staff()) with check (public.is_staff());
create policy time_moderadores_staff on public.time_moderadores for all using (public.is_staff()) with check (public.is_staff());

-- jogadores: coordenação ou capitão do time
create policy jogadores_leitura on public.jogadores for select using (true);
create policy jogadores_escrita on public.jogadores for all
  using (public.is_staff() or (time_id is not null and public.is_capitao_do_time(time_id)))
  with check (public.is_staff() or (time_id is not null and public.is_capitao_do_time(time_id)));

-- jogos: coordenação monta a tabela; moderador do campeonato lança resultado
create policy jogos_leitura on public.jogos for select using (true);
create policy jogos_insere_staff on public.jogos for insert with check (public.is_staff());
create policy jogos_apaga_staff on public.jogos for delete using (public.is_staff());
create policy jogos_atualiza on public.jogos for update
  using (public.is_staff() or public.is_moderador_do_campeonato(campeonato_id))
  with check (public.is_staff() or public.is_moderador_do_campeonato(campeonato_id));

-- eventos e súmulas: coordenação ou moderador do campeonato do jogo
create policy eventos_leitura on public.eventos_jogo for select using (true);
create policy eventos_escrita on public.eventos_jogo for all
  using (public.is_staff() or public.is_moderador_do_jogo(jogo_id))
  with check (public.is_staff() or public.is_moderador_do_jogo(jogo_id));
create policy sumulas_leitura on public.sumulas for select
  using (status = 'validada' or public.is_staff() or public.is_moderador_do_jogo(jogo_id));
create policy sumulas_escrita on public.sumulas for all
  using (public.is_staff() or public.is_moderador_do_jogo(jogo_id))
  with check (public.is_staff() or public.is_moderador_do_jogo(jogo_id));

-- financeiro: só coordenação
create policy financeiro_staff on public.financeiro_movimentacoes for all using (public.is_staff()) with check (public.is_staff());

-- notificações: só o destinatário
create policy notificacoes_proprias on public.notificacoes for all
  using (destinatario_id = auth.uid()) with check (destinatario_id = auth.uid());

-- solicitações de inscrição de atletas (formulário público)
create policy solicitacoes_insere on public.solicitacoes_inscricao for insert to anon, authenticated
  with check (autorizacao_responsavel = true);
create policy solicitacoes_leitura on public.solicitacoes_inscricao for select to authenticated
  using (public.is_staff() or public.cargo_atual() = 'moderador');
create policy solicitacoes_atualiza on public.solicitacoes_inscricao for update to authenticated
  using (public.is_staff() or public.cargo_atual() = 'moderador')
  with check (public.is_staff() or public.cargo_atual() = 'moderador');

-- 8) Classificação calculada pelos resultados ---------------------------------
drop view if exists public.v_classificacao;
create view public.v_classificacao as
with lados as (
  select campeonato_id, time_casa_id as time_id,
         coalesce(placar_casa, 0) as gp, coalesce(placar_visitante, 0) as gc
    from public.jogos where status = 'finalizado'
  union all
  select campeonato_id, time_visitante_id,
         coalesce(placar_visitante, 0), coalesce(placar_casa, 0)
    from public.jogos where status = 'finalizado'
)
select
  i.campeonato_id,
  i.time_id,
  t.nome  as time_nome,
  t.sigla as time_sigla,
  count(l.time_id)::int                                   as jogos,
  (count(*) filter (where l.gp > l.gc))::int              as vitorias,
  (count(*) filter (where l.gp = l.gc))::int              as empates,
  (count(*) filter (where l.gp < l.gc))::int              as derrotas,
  coalesce(sum(l.gp), 0)::int                             as gols_pro,
  coalesce(sum(l.gc), 0)::int                             as gols_contra,
  (coalesce(sum(l.gp), 0) - coalesce(sum(l.gc), 0))::int  as saldo,
  (3 * count(*) filter (where l.gp > l.gc)
     + count(*) filter (where l.gp = l.gc))::int          as pontos
from public.inscricoes i
join public.times t on t.id = i.time_id
left join lados l on l.campeonato_id = i.campeonato_id and l.time_id = i.time_id
group by i.campeonato_id, i.time_id, t.nome, t.sigla;

grant select on public.v_classificacao to anon, authenticated;
