-- Arena Vale — permite até 3 coordenadores (antes: só 1).
-- A Fase 2 substitui esta regra pelo limite ajustável na área do proprietário.
create or replace function public.guard_single_coordenador()
returns trigger
language plpgsql
as $$
declare cnt int;
begin
  if new.role = 'coordenador' then
    select count(*) into cnt from public.profiles where role = 'coordenador' and id <> new.id;
    if cnt >= 3 then
      raise exception 'Limite de 3 coordenadores atingido.';
    end if;
  end if;
  return new;
end;
$$;
