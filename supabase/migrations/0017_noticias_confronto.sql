-- 0017: times do jogo ("FLAMENGO x PALMEIRAS") para o cabeçalho das notícias em vídeo.
set lock_timeout = '5s';
alter table public.noticias add column if not exists confronto text;
alter table public.noticias drop constraint if exists noticias_confronto_check;
alter table public.noticias add constraint noticias_confronto_check check (confronto is null or length(confronto) <= 60);
