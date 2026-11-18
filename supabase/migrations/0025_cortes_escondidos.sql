-- 0025 — A coordenação pode esconder um corte (Short) do site, pelo painel.
-- Idempotente: pode rodar mais de uma vez.

alter table public.cortes_posicao add column if not exists escondido boolean not null default false;
alter table public.cortes_posicao alter column giro drop not null;
alter table public.cortes_posicao drop constraint if exists cortes_posicao_giro_check;
alter table public.cortes_posicao add constraint cortes_posicao_giro_check check (giro is null or giro in (-90, 90));

notify pgrst, 'reload schema';
