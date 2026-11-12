-- 0018: ao despublicar, a notícia perde a data de publicação; ao publicar de novo,
-- ganha a data do momento (o selo "NOVO" volta). Editar uma notícia publicada não muda a data.
create or replace function public.noticias_sincroniza() returns trigger
language plpgsql set search_path = public as $$
begin
  new.ativo := (new.status = 'publicado');
  if new.status = 'publicado' then
    if new.publicado_em is null then
      new.publicado_em := now();
    end if;
  else
    new.publicado_em := null;
  end if;
  return new;
end $$;
