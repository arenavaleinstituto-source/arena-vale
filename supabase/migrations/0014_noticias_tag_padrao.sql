-- 0014: a coluna antiga noticias.tag (não usada pelo site novo) é obrigatória
-- e sem valor padrão no banco oficial, o que impedia o bot e o editor novo de
-- gravar notícias. Ela ganha o padrão 'NOVO' e deixa de ser obrigatória.
alter table public.noticias alter column tag set default 'NOVO';
alter table public.noticias alter column tag drop not null;
