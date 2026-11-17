-- 0022: WhatsApp bot — vínculo de conta e rascunhos de notícias
-- Paralelo ao bot do Telegram (0011), mas usando número de telefone como identidade.
set lock_timeout = '5s';

-- ─── profiles: telefone WhatsApp ────────────────────────────────────
alter table public.profiles add column if not exists whatsapp_phone text;
create unique index if not exists profiles_whatsapp_phone_key
  on public.profiles (whatsapp_phone);

-- ─── noticias: ref exclusiva por mensagem WhatsApp ──────────────────
alter table public.noticias add column if not exists whatsapp_message_ref text;
create unique index if not exists noticias_whatsapp_message_ref_key
  on public.noticias (whatsapp_message_ref);

-- atualiza o check de origem para incluir 'whatsapp'
alter table public.noticias drop constraint if exists noticias_origem_check;
alter table public.noticias add constraint noticias_origem_check
  check (origem in ('manual', 'telegram', 'whatsapp'));

-- ─── WhatsApp: tabelas de vínculo ───────────────────────────────────
create table if not exists public.whatsapp_codigos_vinculo (
  codigo      text      primary key,
  profile_id  uuid      not null references public.profiles(id) on delete cascade,
  expira_em   timestamptz not null
);
alter table public.whatsapp_codigos_vinculo enable row level security;

-- Bloqueio de 1 h após 5 tentativas erradas (mesmo padrão do Telegram).
create table if not exists public.whatsapp_tentativas_vinculo (
  whatsapp_phone  text  primary key,
  falhas          int   not null default 0,
  bloqueado_ate   timestamptz
);
alter table public.whatsapp_tentativas_vinculo enable row level security;

-- ─── Funções RPC ────────────────────────────────────────────────────
create or replace function public.gerar_codigo_whatsapp() returns text
language plpgsql security definer set search_path = public as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea;
  v text;
begin
  if not public.is_staff() then
    raise exception 'Sem permissão.';
  end if;
  delete from public.whatsapp_codigos_vinculo
   where profile_id = auth.uid() or expira_em < now();
  loop
    bytes := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    v := '';
    for i in 0..7 loop
      v := v || substr(alfabeto, (get_byte(bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (
      select 1 from public.whatsapp_codigos_vinculo where codigo = v
    );
  end loop;
  insert into public.whatsapp_codigos_vinculo (codigo, profile_id, expira_em)
  values (v, auth.uid(), now() + interval '10 minutes');
  return v;
end $$;

create or replace function public.desvincular_whatsapp() returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set whatsapp_phone = null where id = auth.uid();
end $$;

revoke all on function public.gerar_codigo_whatsapp() from public, anon;
revoke all on function public.desvincular_whatsapp()  from public, anon;
grant execute on function public.gerar_codigo_whatsapp() to authenticated;
grant execute on function public.desvincular_whatsapp()  to authenticated;
