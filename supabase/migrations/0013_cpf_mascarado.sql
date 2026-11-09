-- ====================================================================
-- 0013 — CPF mascarado para o público (elenco das equipes e súmula)
--
-- O banco calcula "529..." a partir do CPF completo; o público lê só essa
-- coluna. O CPF completo continua bloqueado (0012).
-- ====================================================================
set lock_timeout = '5s';

alter table public.jogadores add column if not exists cpf_mascarado text
  generated always as (
    case when length(regexp_replace(coalesce(cpf, ''), '[^0-9]', '', 'g')) = 11
         then left(regexp_replace(cpf, '[^0-9]', '', 'g'), 3) || '...'
    end
  ) stored;

grant select (cpf_mascarado) on public.jogadores to anon, authenticated;
