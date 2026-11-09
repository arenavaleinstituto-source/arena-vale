-- ====================================================================
-- 0012 — Atletas: CPF protegido (LGPD) e fotos por equipe
--
-- - Ninguém lê `jogadores.cpf` pela API (nem visitante, nem logado). A
--   coordenação e o capitão do time leem os CPFs pela função cpfs_do_time().
-- - Pasta pública "atletas-fotos": cada capitão só envia/apaga fotos na pasta
--   da própria equipe (<time_id>/arquivo); a coordenação, em qualquer uma.
-- Idempotente. Não apaga políticas de outras tabelas.
-- ====================================================================
set lock_timeout = '5s';

-- ─── CPF fora da leitura pública ────────────────────────────────────
-- Privilégio por coluna: tira o SELECT da tabela inteira e devolve só nas
-- colunas sem dado pessoal sensível. INSERT/UPDATE/DELETE seguem pelas
-- políticas da 0010 (coordenação ou capitão do time).
revoke select on public.jogadores from anon, authenticated;
grant select (id, nome, data_nascimento, posicao, numero_camisa, time_id, foto_url, created_at)
  on public.jogadores to anon, authenticated;

create or replace function public.cpfs_do_time(t uuid) returns table (id uuid, cpf text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (public.is_staff() or public.is_capitao_do_time(t)) then
    raise exception 'Sem permissão.';
  end if;
  return query select j.id, j.cpf from public.jogadores j where j.time_id = t;
end $$;
revoke all on function public.cpfs_do_time(uuid) from public, anon;
grant execute on function public.cpfs_do_time(uuid) to authenticated;

-- ─── Fotos dos atletas ──────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('atletas-fotos', 'atletas-fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- A pasta é o id da equipe; texto inválido não vira erro (devolve nulo).
create or replace function public.pode_mexer_foto_atleta(caminho text) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare pasta text := split_part(caminho, '/', 1);
begin
  if public.is_staff() then return true; end if;
  if pasta !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return false; end if;
  return public.is_capitao_do_time(pasta::uuid);
end $$;
revoke all on function public.pode_mexer_foto_atleta(text) from public, anon;
grant execute on function public.pode_mexer_foto_atleta(text) to authenticated;

drop policy if exists atletas_fotos_leitura on storage.objects;
create policy atletas_fotos_leitura on storage.objects for select using (bucket_id = 'atletas-fotos');
drop policy if exists atletas_fotos_envio on storage.objects;
create policy atletas_fotos_envio on storage.objects for insert to authenticated
  with check (bucket_id = 'atletas-fotos' and public.pode_mexer_foto_atleta(name));
drop policy if exists atletas_fotos_troca on storage.objects;
create policy atletas_fotos_troca on storage.objects for update to authenticated
  using (bucket_id = 'atletas-fotos' and public.pode_mexer_foto_atleta(name))
  with check (bucket_id = 'atletas-fotos' and public.pode_mexer_foto_atleta(name));
drop policy if exists atletas_fotos_apaga on storage.objects;
create policy atletas_fotos_apaga on storage.objects for delete to authenticated
  using (bucket_id = 'atletas-fotos' and public.pode_mexer_foto_atleta(name));
