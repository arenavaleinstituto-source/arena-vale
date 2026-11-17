-- 0021: cargo delegado, colunas e triggers na tabela jogos.
-- O delegado é criado pelo coordenador para registrar o placar ao vivo de um jogo específico.
-- Ao finalizar o jogo, o perfil do delegado é automaticamente rebaixado para 'autenticado'.

-- 1) novo cargo
alter type user_role add value if not exists 'delegado';

-- 2) novas colunas em jogos
alter table public.jogos
  add column if not exists delegado_id uuid references public.profiles(id) on delete set null,
  add column if not exists nome_casa_custom text check (char_length(nome_casa_custom) <= 80),
  add column if not exists nome_visitante_custom text check (char_length(nome_visitante_custom) <= 80);

create index if not exists idx_jogos_delegado on public.jogos(delegado_id);

-- 3) função auxiliar de RLS
create or replace function public.is_delegado_do_jogo(p_jogo_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.jogos
    where id = p_jogo_id and delegado_id = auth.uid()
  );
$$;

-- 4) refazer política de update em jogos (inclui delegado)
drop policy if exists jogos_atualiza on public.jogos;
create policy jogos_atualiza on public.jogos for update
  using (
    public.is_staff()
    or public.is_moderador_do_campeonato(campeonato_id)
    or public.is_delegado_do_jogo(id)
  )
  with check (
    public.is_staff()
    or public.is_moderador_do_campeonato(campeonato_id)
    or public.is_delegado_do_jogo(id)
  );

-- 5) atualizar trigger que protege campos estruturais:
--    não-staff não pode mudar delegado_id nem os campos de equipe/data
create or replace function public.moderador_so_resultado()
returns trigger language plpgsql as $$
begin
  if public.is_staff()
     or current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;
  if new.data is distinct from old.data
     or new.local is distinct from old.local
     or new.time_casa_id is distinct from old.time_casa_id
     or new.time_visitante_id is distinct from old.time_visitante_id
     or new.campeonato_id is distinct from old.campeonato_id
     or new.fase is distinct from old.fase
     or new.rodada is distinct from old.rodada
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

-- 6) trigger que bloqueia o delegado ao finalizar o jogo
create or replace function public.bloquear_delegado_ao_finalizar()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'finalizado'
     and (old.status is distinct from 'finalizado')
     and new.delegado_id is not null then
    update public.profiles set role = 'autenticado' where id = new.delegado_id;
  end if;
  return new;
end;
$$;
drop trigger if exists tr_bloquear_delegado_ao_finalizar on public.jogos;
create trigger tr_bloquear_delegado_ao_finalizar
  after update of status on public.jogos
  for each row execute function public.bloquear_delegado_ao_finalizar();

notify pgrst, 'reload schema';
