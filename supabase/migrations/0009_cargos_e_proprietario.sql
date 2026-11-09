-- ====================================================================
-- ARENA VALE — 0009: cargos, proprietário escondido, limite de coordenadores
-- ====================================================================
-- Idempotente. Regras (spec, seção 5):
--  • O proprietário fica guardado como `coordenador` em `profiles` (aparece
--    como "Coordenador" para todos). A marca de dono fica na tabela
--    `proprietario`, que só o próprio dono consegue ler.
--  • Limite de coordenadores (contando o dono) em
--    `proprietario.limite_coordenadores` (padrão 3).
--  • Ninguém muda o próprio cargo; o cargo só muda por `definir_cargo()`.
-- ====================================================================

-- 1) Marca secreta do dono ------------------------------------------------
create table if not exists public.proprietario (
  profile_id uuid primary key references public.profiles(id) on delete restrict,
  limite_coordenadores int not null default 3 check (limite_coordenadores >= 1),
  modo_video text not null default 'guardar_arquivo' check (modo_video in ('guardar_arquivo', 'so_link')),
  dias_validade_video int not null default 30 check (dias_validade_video > 0),
  created_at timestamptz not null default now()
);
create unique index if not exists proprietario_uma_linha on public.proprietario ((true));

alter table public.proprietario enable row level security;
drop policy if exists "proprietario_le_a_propria_linha" on public.proprietario;
create policy "proprietario_le_a_propria_linha" on public.proprietario
  for select using (profile_id = auth.uid());

-- 2) Funções de cargo -------------------------------------------------------
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'coordenador');
$$;

-- Compatibilidade com políticas e código antigos: coordenador = staff (inclui o dono).
create or replace function public.is_coordenador()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_staff();
$$;

create or replace function public.is_proprietario()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.proprietario where profile_id = auth.uid());
$$;

create or replace function public.cargo_atual()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 3) Converte o dono atual (role 'proprietario' → coordenador + marca) -------
insert into public.proprietario (profile_id)
select id from public.profiles where role = 'proprietario' order by created_at limit 1
on conflict do nothing;

-- 4) Limite de coordenadores (substitui o "coordenador único") ---------------
drop trigger if exists tr_guard_single_coordenador on public.profiles;
drop function if exists public.guard_single_coordenador();

create or replace function public.guard_coordenadores()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  limite int;
  outros int;
begin
  if new.role = 'coordenador' and (tg_op = 'INSERT' or old.role is distinct from 'coordenador') then
    select coalesce((select limite_coordenadores from public.proprietario limit 1), 3) into limite;
    select count(*) into outros from public.profiles where role = 'coordenador' and id <> new.id;
    if outros + 1 > limite then
      raise exception 'Limite de % coordenadores atingido.', limite;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tr_guard_coordenadores on public.profiles;
create trigger tr_guard_coordenadores
  before insert or update of role on public.profiles
  for each row execute function public.guard_coordenadores();

update public.profiles set role = 'coordenador' where role = 'proprietario';

-- 5) Ninguém muda o próprio cargo ------------------------------------------
create or replace function public.proteger_cargo()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role
     and coalesce(current_setting('arena.permitir_cargo', true), '') <> 'on'
     and coalesce(auth.role(), '') <> 'service_role'
     and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'O cargo só pode ser alterado pela coordenação.';
  end if;
  return new;
end;
$$;

drop trigger if exists tr_proteger_cargo on public.profiles;
create trigger tr_proteger_cargo
  before update of role on public.profiles
  for each row execute function public.proteger_cargo();

-- 6) Mudança de cargo pela hierarquia --------------------------------------
create or replace function public.definir_cargo(perfil uuid, cargo public.user_role)
returns void language plpgsql security definer set search_path = public as $$
declare
  cargo_alvo public.user_role;
  alvo_e_dono boolean;
  sou_dono boolean := public.is_proprietario();
begin
  if not public.is_staff() then
    raise exception 'Só a coordenação altera cargos.';
  end if;
  if cargo = 'proprietario' then
    raise exception 'Cargo inválido.';
  end if;

  select role into cargo_alvo from public.profiles where id = perfil;
  if not found then
    raise exception 'Usuário não encontrado.';
  end if;
  select exists (select 1 from public.proprietario where profile_id = perfil) into alvo_e_dono;

  if alvo_e_dono then
    raise exception 'Ninguém altera o cargo do proprietário.';
  end if;
  if not sou_dono then
    if cargo = 'coordenador' then
      raise exception 'Só o proprietário define coordenadores.';
    end if;
    if cargo_alvo = 'coordenador' then
      raise exception 'Só o proprietário altera coordenadores.';
    end if;
  end if;

  perform set_config('arena.permitir_cargo', 'on', true);
  update public.profiles set role = cargo where id = perfil;
  perform set_config('arena.permitir_cargo', 'off', true);
end;
$$;

create or replace function public.definir_limite_coordenadores(n int, remover uuid[] default '{}')
returns void language plpgsql security definer set search_path = public as $$
declare
  dono uuid;
  atuais int;
begin
  select profile_id into dono from public.proprietario limit 1;
  if dono is null or dono <> auth.uid() then
    raise exception 'Só o proprietário altera o limite de coordenadores.';
  end if;
  if n is null or n < 1 then
    raise exception 'O limite mínimo é 1 coordenador.';
  end if;
  if dono = any (coalesce(remover, '{}')) then
    raise exception 'O proprietário não pode ser removido da coordenação.';
  end if;

  perform set_config('arena.permitir_cargo', 'on', true);
  update public.profiles set role = 'autenticado'
   where id = any (coalesce(remover, '{}')) and role = 'coordenador';
  perform set_config('arena.permitir_cargo', 'off', true);

  select count(*) into atuais from public.profiles where role = 'coordenador';
  if atuais > n then
    raise exception 'Escolha quem deixa de ser coordenador antes de baixar o limite para %.', n;
  end if;

  update public.proprietario set limite_coordenadores = n where profile_id = dono;
end;
$$;

revoke execute on function public.definir_cargo(uuid, public.user_role) from anon;
revoke execute on function public.definir_limite_coordenadores(int, uuid[]) from anon;
