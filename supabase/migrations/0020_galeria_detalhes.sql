-- 0020: detalhes do álbum (competição, local, placar, descrição, fotógrafo) e rascunho.
-- O álbum nasce como rascunho (ativo = false) e só aparece no site depois de "Publicar".
-- publicado_em separa "rascunho" (nunca publicado) de "escondido" (já foi publicado).

alter table public.galeria_albuns
  add column if not exists competicao text check (char_length(competicao) <= 120),
  add column if not exists local text check (char_length(local) <= 120),
  add column if not exists placar text check (char_length(placar) <= 40),
  add column if not exists descricao text check (char_length(descricao) <= 600),
  add column if not exists fotografo text check (char_length(fotografo) <= 80),
  add column if not exists publicado_em timestamptz;

update public.galeria_albuns set publicado_em = created_at where ativo and publicado_em is null;

alter table public.galeria_albuns alter column ativo set default false;

notify pgrst, 'reload schema';
