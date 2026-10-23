-- ====================================================================
-- ARENA VALE — Conteudo inicial de Noticias (texto real, sem Em Breve)
-- ====================================================================
-- Rode com:  supabase db push  (ou cole direto no SQL Editor do Supabase)
-- Script idempotente: pode rodar mais de uma vez sem duplicar
--
-- Obs: a tabela atletas_destaque fica vazia de proposito por enquanto.
-- Enquanto nao tiver atletas reais cadastrados, o site mostra os 3
-- exemplos ja prontos que existem no codigo (fallback automatico) --
-- fica melhor do que inventar nomes genericos aqui.
-- ====================================================================

insert into public.noticias (titulo, descricao, categoria, tag, ordem, ativo)
select * from (values
  (
    'ARENA VALE FECHA PARCERIA OFICIAL COM A ACADESF',
    'A Arena Vale firma parceria institucional com a ACADESF para fortalecer o desenvolvimento do esporte amador na regiao do Vale, unindo estrutura, arbitragem e visibilidade para clubes e atletas locais.',
    'PARCERIA',
    'OFICIAL',
    1,
    true
  ),
  (
    'INSCRICOES ABERTAS PARA A TEMPORADA 2026',
    'Estao abertas as inscricoes de equipes para o Circuito de Futsal, a Copa de Futebol 7, a Liga de Basquete e o Torneio de Volei da temporada 2026. Times interessados podem garantir vaga diretamente pelo WhatsApp oficial.',
    'CAMPEONATOS',
    'INSCRICOES ABERTAS',
    2,
    true
  ),
  (
    'TV ARENA VALE AMPLIA COBERTURA DAS TRANSMISSOES',
    'A partir desta temporada, a TV Arena Vale passa a transmitir um numero maior de partidas ao vivo, com cobertura tecnica dedicada para Futsal, Futebol 7, Basquete e Volei direto do canal oficial no YouTube.',
    'BROADCAST',
    'NOVIDADE',
    3,
    true
  )
) as v(titulo, descricao, categoria, tag, ordem, ativo)
where not exists (
  select 1 from public.noticias n where n.titulo = v.titulo
);

-- ====================================================================
-- FIM
-- ====================================================================
