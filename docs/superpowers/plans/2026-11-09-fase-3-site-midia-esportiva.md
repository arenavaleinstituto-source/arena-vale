# Fase 3 — Site no modelo de mídia esportiva — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O site inteiro e os painéis da equipe no visual de mídia esportiva aprovado na prévia, com YouTube, agenda unificada, modalidades, notícias em cartazes, Esporte Mundial alimentado pelo bot do Telegram e vídeos do Instagram.

**Architecture:**
- **Visual em um lugar só.** Os tokens do spec (seção 3) entram em `app/globals.css` e `tailwind.config.ts`. **As cores antigas são remapeadas para os valores novos** (`bg`, `surface`, `primary` etc. passam a ser preto, grafite e vermelho), e assim as páginas e painéis legados mudam de cara sem reescrever cada um. Os componentes novos usam os nomes `av-*`.
- **Dados no servidor.** Toda leitura pública fica em `lib/midia/*`, em funções puras testáveis mais um adaptador fino do Supabase ou `fetch`. As páginas são Server Components com `revalidate = 60`.
- **Banco.** Uma migração só, `0011_midia_esportiva.sql`, que **não apaga políticas existentes**. A coluna `noticias.ativo` continua existindo e é mantida por um trigger (`ativo = status = 'publicado'`), para que a política `noticias_leitura` da 0010 continue certa sem ser recriada.

**Tech Stack:** Next 16 (App Router, `proxy.ts`), React 19, Tailwind 3, `next/font/google` (Saira, Barlow, Barlow Condensed), Supabase (Postgres, RLS, Storage), Vitest + Testing Library, Vercel Cron.

**Spec:** `docs/superpowers/specs/2026-11-09-fase-3-site-midia-esportiva-design.md`. Ele herda as seções 4.1 a 4.5 de `docs/superpowers/specs/2026-11-08-arena-vale-organizacao-noticias-permissoes-design.md`, que também precisa ser lido.

**Prévia visual (fonte da verdade do layout):** `docs/superpowers/specs/2026-11-09-fase-3-previa-home.html`, copiada na Task 1. Cada componente da home reproduz o bloco correspondente da prévia: classes, textos, espaçamentos e cores.

**Decisões tomadas aqui (o executor não reabre):**
- **Rotas antigas viram redirecionamentos 308** em `next.config.mjs`:
  - `/campeonatos` → `/modalidades`;
  - `/tv` → `/ao-vivo`;
  - `/atletas` → `/atletasdestaques`.

  O menu aponta direto para `/atletasdestaques`. As páginas `app/campeonatos` e `app/tv` são apagadas.
- **Painel:** as abas do `CoordShell` são lidas e gravadas em `?aba=<id>`. As rotas `/painel/noticias`, `/painel/tv`, `/painel/campeonatos` e `/painel/atletasdestaques` redirecionam para `/coordenador?aba=noticias|aovivo|campeonatos|destaques`. O link de edição de uma notícia é `/coordenador?aba=noticias&editar=<id>`.
- **Modalidade das notícias:** coluna nova `noticias.modalidade` (mesmos 4 valores, nula = sem modalidade). Ela substitui a ideia de "tag da modalidade" do spec 8.
- **Categorias:** `noticias.categoria` passa a aceitar só `geral`, `campeonatos`, `bastidores` e `projeto_social`. Os valores antigos migram para `geral`. `lib/content/vocabulario.ts` acompanha a mudança.
- **Horário de `jogos.data`:** a coluna é `timestamp` sem fuso. Ela é lida como horário de Brasília (`-03:00`). `agenda_jogos.data_hora` já vem com fuso.
- **`agenda_jogos`:** existe só em produção. A 0011 a cria com `create table if not exists`, com as colunas de produção (`id`, `modalidade`, `fase`, `equipe_casa`, `equipe_fora`, `data_hora`, `local`, `status`, `created_at`). As políticas só são criadas se ainda não existirem em `pg_policies`.
- **Bucket `noticias`:** é novo, público, e tem escrita só para `is_staff()`. O bucket antigo `noticias-capas` continua servindo as capas antigas.

## Global Constraints

- **A marca é sempre "ARENA VALE".** Nenhum texto, `alt`, metadado ou dado novo contém "Sports" ou "Sport". Um teste falha se o texto renderizado da home tiver `/sports?\b/i`.
- **O proprietário nunca aparece como "Proprietário"** na interface. A área dele continua em 3 toques no logo, com 404 para os outros.
- **Nenhuma permissão da Fase 2 muda.** Os testes de `tests/db/` da Fase 2 (46) continuam verdes.
- **Tokens:**
  - `--preto #0b0b0c`
  - `--grafite #141417`
  - `--grafite-2 #1d1d22`
  - `--linha #2a2a30`
  - `--branco #f4f4f5`
  - `--cinza #a1a1aa`
  - `--vermelho #e50914`
  - `--amarelo #facc15`, usado **só** em ao vivo, transmissão e pendente
- **Forma:** raios de 14 a 28 px; botões em pílula; títulos de seção centralizados e em caixa alta.
- **Menu principal, nesta ordem:**
  - Início `/`
  - Ao Vivo `/ao-vivo`, com ponto vermelho
  - Notícias do Vale `/noticias`
  - Esporte Mundial `/noticias?aba=mundo`
  - Agenda `/agenda`
  - Modalidades `/modalidades`
  - Projeto Social `/projetosocial`
  - Atletas Destaques `/atletasdestaques`

  À direita ficam **Anuncie** (`/patrocinio`) e **Entrar**. Tudo em uma linha; no celular, o menu rola para o lado e o Entrar vira só o ícone.
- **Rodapé:** logo de 64 px de altura, slogan "O palco do esporte é aqui.", botões WhatsApp (`https://wa.me/5547988444404`), Instagram (`https://www.instagram.com/arenavaleoficial`) e YouTube (`https://www.youtube.com/@TVArenaVale`), "CNPJ: 40.694.741/0001-34", "© 2026 ARENA VALE · Mídia Esportiva. Todos os direitos reservados.", e os links Sobre a ARENA VALE (`/sobre`) · Política de Privacidade (`/privacidade`) · Termos de Uso (`/termos`). Tudo centralizado, **sem linha de menu**. O WhatsApp e o Instagram vêm do `site_config` quando preenchidos.
- **YouTube:** canal `UCBTQ97bWA6VqK2a6qv80dIg`, handle `@TVArenaVale`, feed `https://www.youtube.com/feeds/videos.xml?channel_id=<id>`, player ao vivo `https://www.youtube-nocookie.com/embed/live_stream?channel=<id>`, botão "▶ Assista ao vivo" → `https://www.youtube.com/@TVArenaVale/live` em nova aba.
- **Testes de banco só no projeto TESTES** (`npm run test:db`). Nada aponta para `cpvmfpxxrdpvfbonwynr`.
- **Nunca imprimir chaves.** Variáveis novas:
  - `TELEGRAM_BOT_TOKEN` e `TELEGRAM_WEBHOOK_SECRET`;
  - `CRON_SECRET`.

  `SUPABASE_SERVICE_ROLE_KEY` já existe. Nenhuma das quatro aparece em código cliente.
- **Textos** em pt-BR. **Commits** terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Verificação de fim de task:**
  - `npm run typecheck`;
  - `npm test`;
  - `npm run lint`, sem erros novos;
  - nas tasks que mexem no banco, também `npm run test:db`.
- **No fim de cada parte (3A–3D):**
  - rodar `npm run build`;
  - fazer `git push origin organizacao`, que atualiza a prévia da Vercel.

## Review Focus

1. **Feed do YouTube fora do ar, lento ou com XML quebrado:** a home e `/videos` abrem normalmente; o bloco mostra "Veja no canal" com link, sem erro 500. Teste na Task 3.
2. **O canal está ao vivo na hora em que a página é gerada, e depois sai do ar:** o estado não pode ficar preso por mais de 2 min (cache de 120 s). Com "ao vivo manual" marcado, o player aparece mesmo sem detecção. Teste na Task 3.
3. **Nenhum jogo futuro nas duas tabelas, ou só jogos passados:** a agenda mostra "Nenhum jogo agendado — volte em breve." e o Ao Vivo mostra "Próxima transmissão a definir", sem contagem regressiva negativa. Teste na Task 4.
4. **Notícia publicada sem cartaz** (notícias antigas): o cartaz usa `/og-banner.jpg` e o layout 2:3 não quebra. Teste na Task 12.
5. **Menu "Entrar" no celular:** abre e fecha por toque, fecha com Esc e ao tocar fora, e o painel de login não fica escondido atrás do cabeçalho com `backdrop-filter`, porque é renderizado num portal no `body`. Teste na Task 6.

---

## Parte 3A — Base visual, cabeçalho, rodapé e página inicial

### Task 1: Tokens, fontes e a prévia no repositório

**Files:**
- Create: `docs/superpowers/specs/2026-11-09-fase-3-previa-home.html`. É uma cópia de `nova-home.tpl.html` do scratchpad da sessão, **sem** as imagens embutidas, mantendo os marcadores `__LOGO__` e `__CAPA__`.
- Modify: `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx`
- Test: `lib/ui/tokens.test.ts`

**Interfaces:**
- Produces:
  - **Classes Tailwind:** `bg-av-preto`, `bg-av-grafite`, `bg-av-grafite-2`, `border-av-linha`, `text-av-branco`, `text-av-cinza`, `bg-av-vermelho`, `text-av-vermelho`, `text-av-amarelo`.
  - **Fontes:** `font-display` (Saira), `font-sans` (Barlow), `font-rotulo` (Barlow Condensed).
  - **Classes globais** em `@layer components`:
    - `.faixa` e `.faixa-alt`: seção com `py-16`, alternando preto e grafite;
    - `.titulo-secao`: centralizado, caixa alta, Saira 800;
    - `.btn-forte`: pílula vermelha;
    - `.btn-leve`: pílula com borda.
  - **`.btn-primary` e `.btn-outline`** continuam existindo, agora em vermelho e branco.
  - **`lib/ui/tokens.ts`:** exporta `TOKENS` com os 8 valores do spec.

- [ ] **Step 1: Write the failing test.** `lib/ui/tokens.test.ts`:
  - `TOKENS` é igual a `{ preto:'#0b0b0c', grafite:'#141417', grafite2:'#1d1d22', linha:'#2a2a30', branco:'#f4f4f5', cinza:'#a1a1aa', vermelho:'#e50914', amarelo:'#facc15' }`;
  - o arquivo `app/globals.css`, lido com `fs`, contém `--vermelho: #e50914` e **não** contém `#f5d76e`.
- [ ] **Step 2: Run.** `npx vitest run lib/ui/tokens.test.ts`. Expected: FAIL (o módulo não existe).
- [ ] **Step 3: Implement.**
  - **`tailwind.config.ts`:**
    - remapear `bg`, `bg-deep`, `bg-alt`, `surface.*`, `primary.*`, `accent` e `border` para os tokens: bg = preto, surface = grafite/grafite-2, primary = vermelho, accent = vermelho, border = linha;
    - adicionar `av.*`;
    - `fontFamily`: `display`, `sans` e `rotulo` apontando para as variáveis CSS do `next/font`.
  - **`app/globals.css`:** troca o `:root` antigo pelos tokens e mantém os nomes antigos como apelidos (`--primary: var(--vermelho)` etc.). O fundo do `body` fica `var(--preto)`, sem gradientes azuis.
  - **`app/layout.tsx`:**
    - carrega as três fontes com `next/font/google` (`Saira` com `axes: ['wdth']`, `Barlow` 400/600/700, `Barlow_Condensed` 600/700);
    - troca `bg-[#070b13]` por `bg-av-preto`;
    - cria o `lib/ui/tokens.ts`.
- [ ] **Step 4: Run.** `npx vitest run lib/ui/tokens.test.ts && npm run typecheck`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat(visual): tokens da mídia esportiva e fontes Saira/Barlow`

### Task 2: Migração 0011 e testes de banco

**Files:**
- Create: `supabase/migrations/0011_midia_esportiva.sql`, `tests/db/midia.test.ts`

**Interfaces:**
- Produces (schema):
  - **`site_config`** ganha colunas:
    - `capa_url text`;
    - `youtube_channel_id text not null default 'UCBTQ97bWA6VqK2a6qv80dIg'`;
    - `youtube_handle text not null default '@TVArenaVale'`;
    - `instagram_url text default 'https://www.instagram.com/arenavaleoficial'`;
    - `ao_vivo_manual boolean not null default false`;
    - `ao_vivo_link text`.
  - **`campeonatos.modalidade text`**, com `check (modalidade in ('futsal','futebol7','basquete','volei'))` e nulo permitido.
  - **`videos_externos`:**
    - `id uuid pk`;
    - `plataforma text check in ('instagram','outro')`;
    - `link text not null check (link like 'https://%')`;
    - `titulo text not null`;
    - `capa_url text not null`;
    - `publicado_em timestamptz default now()`;
    - `ativo boolean default true`;
    - `created_by uuid references profiles on delete set null`;
    - `created_at`.

    RLS: `select using (ativo or is_staff())` e `all using/with check (is_staff())`.
  - **`noticias`** ganha:
    - `aba text not null default 'arena' check in ('arena','mundo')`;
    - `destaque boolean default false`;
    - `tipo_midia text default 'foto' check in ('foto','video')`;
    - `video_url`, `video_expira_em timestamptz`, `video_link` (check `null or like 'https://%'`);
    - `video_servico text check in ('youtube','instagram','x','tiktok','facebook','telegram','outro')`;
    - `status text not null default 'rascunho' check in ('rascunho','publicado')`;
    - `publicado_em timestamptz`;
    - `fonte text`;
    - `origem text not null default 'manual' check in ('manual','telegram')`;
    - `telegram_message_ref text unique`;
    - `modalidade text` (mesmo check de campeonatos).

    **Dados existentes:**
    - `categoria`: tudo o que não estiver em (`geral`, `campeonatos`, `bastidores`, `projeto_social`) vira `geral`; depois entra o check e o default `geral`;
    - status: `ativo = true` vira `publicado`, com `publicado_em = created_at`.

    **Trigger `noticias_sincroniza`** (before insert/update):
    - faz `ativo := (status = 'publicado')`;
    - preenche `publicado_em := now()` quando passa a `publicado` e está nulo.
  - **`profiles.telegram_user_id bigint unique`.**
  - **Tabela `telegram_codigos_vinculo`:**
    - colunas `codigo text pk`, `profile_id uuid not null references profiles on delete cascade`, `expira_em timestamptz not null`;
    - RLS ligado e **sem políticas**: só a service role acessa.
  - **RPC `gerar_codigo_telegram() returns text`** (security definer):
    - exige `is_staff()`, ou erro `Sem permissão.`;
    - apaga os códigos anteriores do usuário;
    - grava um código de 6 dígitos com validade de 10 min e o devolve.
  - **RPC `desvincular_telegram() returns void`**: zera o `telegram_user_id` do próprio usuário.
  - **RPC `modo_video_atual() returns table(modo text, dias int)`** (security definer, exige `is_staff()`): lê `proprietario.modo_video` e `dias_validade_video`, para o editor saber o modo sem expor quem é o dono.
  - **`noticias.enquadramento text`** (ex.: `'50% 30%'`, nulo = centro), usado pelo `Cartaz` como `object-position`.
  - **`agenda_jogos`:** `create table if not exists` (decisão acima) + RLS + as políticas `agenda_jogos_leitura` e `agenda_jogos_staff`, criadas só se ausentes.
  - **Dados:** `update agenda_jogos set local = 'Arena Vale' where local ilike '%arena vale sport%'`.
  - **Storage:**
    - bucket `noticias` público (`insert … on conflict do nothing`), com `file_size_limit` de 20 MB;
    - políticas `noticias_midia_leitura` (select público) e `noticias_midia_staff` (insert/update/delete com `is_staff()`), cada uma com `drop policy if exists` próprio.
  - **Topo do arquivo:** `set lock_timeout '5s'`.
  - **Tudo idempotente:** `if not exists` / `drop … if exists` só nos objetos criados aqui.

- [ ] **Step 1: Write the failing tests.** `tests/db/midia.test.ts`, usando `criarUsuario`, `clienteComo`, `visitante` e `admin` de `tests/db/fixtures.ts`:
  - `visitante lê só videos_externos ativos`: o admin insere um ativo e um inativo; o visitante lê 1;
  - `só a coordenação escreve em videos_externos`: o moderador recebe erro de RLS e o coordenador consegue;
  - `campeonatos.modalidade aceita só os 4 valores`: com o admin, `'futsal'` passa e `'handebol'` falha com o código `23514`;
  - `noticia publicada fica ativa e ganha publicado_em`: a linha nasce como rascunho com `ativo=false`; um update para `publicado` deixa `ativo=true` e `publicado_em` preenchido;
  - `visitante não lê rascunho`;
  - `telegram_message_ref é único`: um segundo insert com o mesmo ref dá `23505`;
  - `gerar_codigo_telegram`: o coordenador recebe um código com `/^\d{6}$/`; o capitão recebe o erro `Sem permissão.`; o visitante não lê `telegram_codigos_vinculo` (0 linhas ou erro);
  - `site_config tem os padrões do YouTube`: `youtube_channel_id = 'UCBTQ97bWA6VqK2a6qv80dIg'`;
  - `modo_video_atual`: o coordenador recebe `{ modo: 'guardar_arquivo', dias: 30 }` (com a linha do dono criada por `criarUsuario('coordenador', { dono: true })`); o capitão recebe erro;
  - `agenda: local Arena Vale Sports vira Arena Vale`: insere com o admin, roda o mesmo `update` da migração por `pg` e confere. Isso fica num helper `corrigirLocalAgenda()` dentro do teste, que executa a linha copiada da 0011.
- [ ] **Step 2: Run.** `npm run test:db`. Expected: os novos falham (colunas e tabelas não existem) e os 46 antigos passam.
- [ ] **Step 3: Write `0011_midia_esportiva.sql`** conforme as Interfaces.
- [ ] **Step 4: Run.** `npm run test:db`. Expected: tudo PASS (46 + novos).
- [ ] **Step 5: Gerar os arquivos do dono**, fora do repo, em `ARENA VALE/`:
  - `supabase-FASE3-1-checagem.sql`: só `select`s que listam as colunas e políticas que a 0011 cria e mostram se já existem;
  - `supabase-FASE3-2-aplicar.sql`: o conteúdo da 0011 entre `begin;` e `commit;`.

  **Não aplicar em produção agora** (isso é a Task 17).
- [ ] **Step 6: Commit.** `feat(banco): migração 0011 — mídia esportiva, vídeos externos, notícias e Telegram`

### Task 3: YouTube — vídeos e ao vivo

**Files:**
- Create: `lib/midia/youtube.ts`, `lib/midia/youtube.test.ts`, `lib/midia/__amostras__/feed-tvarenavale.xml` (baixado uma vez do feed real com `curl`), `lib/midia/config.ts`, `lib/midia/config.test.ts`

**Interfaces:**
- Produces:
  - `type VideoYT = { id: string; titulo: string; publicadoEm: string; capa: string; link: string }`. A capa é `https://i.ytimg.com/vi/<id>/hqdefault.jpg`; o link é `https://www.youtube.com/watch?v=<id>`.
  - `parsearFeed(xml: string): VideoYT[]`. Faz o parse com regex sobre `<entry>` (`yt:videoId`, `title`, `published`) e desfaz as entidades HTML. XML inválido ou vazio devolve `[]`.
  - `buscarVideosYT(channelId: string, f?: typeof fetch): Promise<VideoYT[]>`. Usa `fetch(feed, { next: { revalidate: 1800 } })` com `AbortSignal.timeout(4000)`. Qualquer erro devolve `[]`.
  - `detectarAoVivo(html: string): boolean`. Procura `"isLiveNow":true`.
  - `estaAoVivo(channelId: string, f?: typeof fetch): Promise<boolean>`. Busca `https://www.youtube.com/channel/<id>/live` com `revalidate: 120` e timeout de 4 s; em erro, `false`.
  - `embedAoVivo(channelId: string): string`.
  - `type ConfigSite = { whatsapp: string; instagramUrl: string; youtubeChannelId: string; youtubeHandle: string; capaUrl: string; aoVivoManual: boolean; aoVivoLink: string | null }`.
  - `CONFIG_PADRAO: ConfigSite`. Valores: whatsapp `5547988444404`, capa `/fundo-arena.jpg`, mais os valores do canal e do Instagram já citados.
  - `mapearConfig(row: Record<string, unknown> | null): ConfigSite`. Campo vazio ou nulo usa o padrão.
  - `lerConfigSite(): Promise<ConfigSite>`. Usa `createPublicClient()` e `select('*').eq('id','main').maybeSingle()`; em erro, `CONFIG_PADRAO`.
  - `linkAssistirAoVivo(c: ConfigSite): string`. Com `aoVivoManual && aoVivoLink`, devolve o `aoVivoLink`; senão, `https://www.youtube.com/${c.youtubeHandle}/live`.

- [ ] **Step 1: Write the failing tests:**
  - `parsearFeed(amostra)` devolve ≥ 1 vídeo, e o primeiro tem `id` de 11 caracteres e `capa` terminando em `/hqdefault.jpg`;
  - `parsearFeed('')` e `parsearFeed('<html>nada')` devolvem `[]`;
  - `buscarVideosYT` com um fetch falso que rejeita devolve `[]`; com status 500, devolve `[]`;
  - `detectarAoVivo('…"isLiveNow":true…')` é `true`; sem a chave, `false`;
  - `estaAoVivo` com fetch que rejeita devolve `false`;
  - `mapearConfig(null)` é igual a `CONFIG_PADRAO`; `mapearConfig({ whatsapp: '' })` mantém o padrão;
  - `linkAssistirAoVivo({...CONFIG_PADRAO, aoVivoManual:true, aoVivoLink:'https://youtu.be/x'})` devolve `'https://youtu.be/x'`; sem o manual, devolve `'https://www.youtube.com/@TVArenaVale/live'`.
- [ ] **Step 2: Run.** `npx vitest run lib/midia`. Expected: FAIL.
- [ ] **Step 3: Implement** conforme as Interfaces.
- [ ] **Step 4: Run.** `npx vitest run lib/midia`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat(midia): feed do YouTube, detecção de ao vivo e config do site`

### Task 4: Agenda unificada

**Files:**
- Create: `lib/midia/agenda.ts`, `lib/midia/agenda.test.ts`

**Interfaces:**
- Produces:
  - `type ItemAgenda = { id: string; origem: 'jogos'|'agenda'; modalidade: string | null; fase: string | null; casa: string; fora: string; dataHora: string; local: string | null; transmissao: boolean }`, com `dataHora` em ISO e fuso.
  - `deAgendaJogos(row): ItemAgenda`. Tem `transmissao: true` e troca o local "Arena Vale Sports" (qualquer caixa) por "Arena Vale".
  - `deJogos(row: { id; data; fase; local; casa:{nome}; fora:{nome}; campeonato:{modalidade}; transmissoes: unknown[] }): ItemAgenda`. Lê a `data` sem fuso como `-03:00` e põe `transmissao` = `transmissoes.length > 0`.
  - `juntarAgenda(jogos: ItemAgenda[], agenda: ItemAgenda[], agora: Date, limite = 6): ItemAgenda[]`:
    - remove os itens com `dataHora < agora`;
    - remove de `agenda` os que casam com algum item de `jogos`: os mesmos dois times em qualquer ordem, comparando o nome normalizado (minúsculas, sem acento, sem espaços extras), e `|Δt| ≤ 3600 s`;
    - quando há casamento, o item de `jogos` herda `transmissao: true`;
    - ordena por `dataHora` crescente e corta no limite.
  - `buscarAgenda(limite = 6): Promise<ItemAgenda[]>`. Faz as duas consultas com `createPublicClient()`; em erro de uma delas, usa só a outra.
  - `proximaTransmissao(itens: ItemAgenda[]): ItemAgenda | null`. Devolve o primeiro com `transmissao`.

- [ ] **Step 1: Write the failing tests:**
  - **duplicata casada:** o jogo `Água Verde × Vila Nova` às 19:00 e a agenda `vila nova × agua verde` às 19:40 dão 1 item, com origem `jogos` e `transmissao: true`;
  - **horários distantes** (Δ = 2 h) mantêm os 2;
  - **ordem:** os itens saem por data crescente, e o limite de 6 corta o 7º;
  - **passados:** só jogos passados dão `[]`; `proximaTransmissao([])` dá `null`;
  - **fuso:** `deJogos` com `data: '2026-11-15T19:00:00'` dá `dataHora` igual a `new Date('2026-11-15T19:00:00-03:00').toISOString()`;
  - **local antigo:** `deAgendaJogos` com `local: 'Arena Vale Sports'` dá `local: 'Arena Vale'`.
- [ ] **Step 2: Run.** `npx vitest run lib/midia/agenda.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.** A consulta de `jogos` é `select('id,data,fase,local,casa:time_casa_id(nome),fora:time_visitante_id(nome),campeonato:campeonato_id(modalidade),transmissoes(id)')` com `.eq('status','agendado').gte('data', <agora em -03:00 sem fuso>)`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat(midia): agenda única com jogos e agenda de transmissões`

### Task 5: Peças visuais compartilhadas — Faixa, Cartaz e Fileira

**Files:**
- Create: `components/midia/Faixa.tsx`, `components/midia/Cartaz.tsx`, `components/midia/Fileira.tsx`, `components/midia/midia.test.tsx`

**Interfaces:**
- Produces:
  - `<Faixa id?: string; titulo: string; subtitulo?: string; alt?: boolean; verTodos?: { href: string; rotulo?: string }; children>`. A section usa `.faixa` ou `.faixa-alt`, e o `h2.titulo-secao` fica centralizado. O link "Ver todos →" usa o rótulo padrão `Ver todos →`.
  - `<Cartaz href; titulo; imagem: string | null; selo: string; chapeu?: string; novo?: boolean; video?: boolean; externo?: boolean>`:
    - link 2:3 com `rounded-[14px]`;
    - imagem nula usa `/og-banner.jpg`;
    - selo "AV" vermelho mais o `selo` no canto superior esquerdo;
    - "NOVO" no canto superior direito quando `novo`;
    - ícone ▶ quando `video`;
    - `externo` abre em nova aba com `rel="noopener noreferrer"`.
  - `<Fileira rotulo: string; children>`. É client: um trilho com `scroll-snap`, mais os botões ‹ › com `aria-label="Anterior <rotulo>"` e `"Próximo <rotulo>"`, que rolam 80% da largura. No celular os botões ficam escondidos.

- [ ] **Step 1: Write the failing tests:**
  - um `Cartaz` com `imagem={null}` renderiza um `img` com `src` contendo `og-banner.jpg`, `alt` igual ao título, e o link com o `href` dado;
  - com `novo` aparece o texto `NOVO`; sem `novo`, não aparece;
  - com `externo`, o link tem `target="_blank"`;
  - `Faixa` renderiza `heading` de nível 2 com o título, e o link "Ver todos →" quando há `verTodos`;
  - os botões da `Fileira` existem com os `aria-label` esperados.
- [ ] **Step 2: Run.** `npx vitest run components/midia`. Expected: FAIL.
- [ ] **Step 3: Implement**, reproduzindo as classes `.cartaz`, `.trilho` e `.cab` da prévia.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat(midia): Faixa, Cartaz 2:3 e Fileira com setas`

### Task 6: Cabeçalho novo com menu Entrar, e rodapé

**Files:**
- Create: `lib/midia/menu.ts`, `components/SiteFooter.tsx`, `components/SiteFooter.test.tsx`
- Modify: `components/SiteHeader.tsx`, `components/SiteHeader.test.tsx`, `components/auth/EntrarEquipe.tsx`, `components/auth/EntrarEquipe.test.tsx`, `components/auth/FormEntrarEquipe.tsx`, `app/layout.tsx`

**Interfaces:**
- Consumes: `lerConfigSite` (Task 3), `LogoSecreto`, `FormEntrarEquipe`, `destinoPorCargo`.
- Produces:
  - `MENU_PRINCIPAL: { rotulo: string; href: string; vivo?: boolean }[]`, com os 8 itens da Global Constraints, nessa ordem.
  - `CARGOS_ENTRAR = ['Coordenação','Moderador','Capitão'] as const`.
  - `FormEntrarEquipe` ganha a prop opcional `rotuloCargo?: string`. Quando dada, aparece acima do título como `Área da equipe · <rotuloCargo>`. O destino continua vindo de `destinoPorCargo`.
  - `EntrarEquipe`, para o visitante:
    - o botão "Entrar" (`aria-haspopup="menu"`) abre um menu "ÁREA DA EQUIPE" com as 3 opções (`role="menuitem"`);
    - cada opção fecha o menu e abre o painel lateral, num portal no `body`, com `rotuloCargo`;
    - Esc e clique fora fecham.

    Logado, continua o avatar da Fase 2.
  - `SiteFooter({ whatsapp, instagramUrl }: { whatsapp: string; instagramUrl: string })`. Fica escondido nas rotas de equipe, pela mesma regra do `SiteHeader`. O `app/layout.tsx` é async, lê `lerConfigSite()` e passa os valores.

- [ ] **Step 1: Write the failing tests:**
  - **SiteHeader:** os links do `nav[aria-label="Menu principal"]` têm exatamente os 8 rótulos, em ordem; não há link "Vídeos" nem "Sobre"; "Anuncie" leva a `/patrocinio`.
  - **EntrarEquipe** (com o `fake-supabase`, sem sessão):
    - clicar em "Entrar" mostra 3 `menuitem`;
    - clicar em "Moderador" mostra o diálogo com o texto `Área da equipe · Moderador` e o campo E-mail;
    - Esc fecha;
    - o menu aberto e um clique em `document.body` fecham o menu;
    - **após login como capitão, o redirecionamento vai para o destino de `destinoPorCargo('capitao')`, mesmo tendo clicado em "Coordenação".**
  - **SiteFooter:**
    - contém `CNPJ: 40.694.741/0001-34`;
    - os links WhatsApp (`href` começando com `https://wa.me/5547988444404`), Instagram e YouTube (`https://www.youtube.com/@TVArenaVale`);
    - os links `/sobre`, `/privacidade` e `/termos`;
    - não contém `nav` de menu.
  - **Marca:** `document.body.textContent` do cabeçalho + rodapé não casa com `/sports?\b/i`.
- [ ] **Step 2: Run.** `npx vitest run components/SiteHeader.test.tsx components/SiteFooter.test.tsx components/auth`. Expected: os novos falham.
- [ ] **Step 3: Implement**, seguindo `.topo`, `.menu`, `.entrar`, `.menu-entrar`, `.login` e `.rodape`/`.rod` da prévia. O cabeçalho fica em linha única: logo, menu (`flex-1`, `overflow-x-auto`) e Anuncie + Entrar.
- [ ] **Step 4: Run.** `npm test`. Expected: tudo PASS, incluindo os testes antigos de `auth/` ajustados.
- [ ] **Step 5: Commit.** `feat(cabecalho): menu da mídia esportiva, Entrar com cargos e rodapé novo`

### Task 7: Página inicial com os blocos da prévia

**Files:**
- Create:
  - `components/home/Banner.tsx`
  - `components/home/AoVivo.tsx`
  - `components/home/AgendaArena.tsx`
  - `components/home/UltimosVideos.tsx`
  - `components/home/Modalidades.tsx`
  - `components/home/ProjetoSocialHome.tsx`
  - `components/home/AtletasDestaques.tsx`
  - `components/home/ParaMarcas.tsx`
  - `components/home/home.test.tsx`
  - `lib/midia/modalidades.ts`
- Modify: `app/page.tsx`, reescrito. O conteúdo antigo sai; o texto do projeto social é preservado no componente novo.

**Interfaces:**
- Consumes: Tasks 3–6, `buscarDestaques` (`lib/content/destaques.ts`).
- Produces:
  - `MODALIDADES_SITE: { slug: 'futsal'|'futebol7'|'basquete'|'volei'; nome: string; frase: string }[]`. Os nomes são Futsal, Futebol 7, Basquete e Vôlei; a frase é `O palco do <nome> é aqui.`.
  - `modalidadePorSlug(slug: string)`.
  - `<Banner capaUrl: string>`, com os textos exatos da prévia:
    - "ARENA VALE" e "Mídia Esportiva";
    - o h1 com "O PALCO DO" em branco, "ESPORTE" em `text-av-vermelho` e "É AQUI." em branco;
    - o subtítulo terminando em "…histórias de quem vive o esporte.";
    - sem botões.
  - `<AoVivo aoVivo: boolean; embed: string; linkAssistir: string; proxima: ItemAgenda | null>`:
    - ao vivo: um `iframe` com `title="Transmissão ao vivo ARENA VALE"`;
    - fora do ar: "Próxima transmissão" com contagem regressiva, num componente client `Contagem` que nunca fica negativo e mostra "Começando agora" ao zerar. Sem próxima, mostra "Próxima transmissão a definir";
    - sempre o botão "▶ Assista ao vivo" com `target="_blank"`.
  - `<AgendaArena itens: ItemAgenda[]>`. Mostra o selo "Transmissão" em amarelo; com a lista vazia, "Nenhum jogo agendado — volte em breve.".
  - `<UltimosVideos videos: VideoYT[]; externos: VideoExterno[]; channelUrl: string>`. Os 8 mais recentes juntos, por data. Lista vazia mostra "Veja no canal" com o link. `VideoExterno` vem da Task 11; até lá, o tipo fica em `lib/midia/videos-externos.ts` com `buscarVideosExternos()` retornando `[]`, e a Task 11 completa.
  - Os blocos 3 e 4 ("Agora na Arena" e "Esporte Mundial") entram na Task 12. Nesta task, `app/page.tsx` deixa os dois espaços com um `TODO(Task 12)` e não os renderiza.
  - **Ordem na home:** Banner, Ao Vivo, [Agora na Arena], [Esporte Mundial], Agenda, Últimos vídeos, Modalidades, Projeto Social, Atletas Destaques, Para marcas.
  - **Leitura em paralelo** com `Promise.all`, e `export const revalidate = 60`.

- [ ] **Step 1: Write the failing tests** (`home.test.tsx`, renderizando cada componente com dados falsos):
  - **Banner:** o `h1` contém "O PALCO DO", "ESPORTE" (num `span` com a classe `text-av-vermelho`) e "É AQUI."; não há `button` nem link dentro do banner;
  - **AoVivo:**
    - com `aoVivo=true` há um iframe com `src` contendo `live_stream?channel=`;
    - com `aoVivo=false` e `proxima=null` aparece "Próxima transmissão a definir";
    - o link "▶ Assista ao vivo" tem `target="_blank"`;
  - **AgendaArena** com `[]` mostra "Nenhum jogo agendado — volte em breve.";
  - **UltimosVideos** com `[]` e `[]` mostra o link "Veja no canal";
  - **Modalidades:** 4 links para `/modalidades/futsal|futebol7|basquete|volei`;
  - **ParaMarcas:** contém "Coloque sua marca no" e o botão "Falar com a ARENA VALE", e **não** contém "Naming da transmissão";
  - **Contagem** com uma data no passado mostra "Começando agora".
- [ ] **Step 2: Run.** `npx vitest run components/home`. Expected: FAIL.
- [ ] **Step 3: Implement** cada bloco a partir da prévia. Em `app/page.tsx`, cada busca tem seu próprio `catch` que devolve o vazio do bloco, para que a página nunca quebre.
- [ ] **Step 4: Run.** `npm test && npm run typecheck && npm run build`. Expected: PASS, com `/` gerado.
- [ ] **Step 5: Verificar no navegador.** Rodar `npm run dev`, abrir `http://localhost:3000` e comparar lado a lado com a prévia em 1400 px e 390 px (screenshot headless do Edge, como na sessão de prévia). Corrigir as diferenças.
- [ ] **Step 6: Commit e push.** `feat(home): página inicial de mídia esportiva` e depois `git push origin organizacao`. Avisar o dono do link da prévia da Vercel (fim da parte 3A).

## Parte 3B — Páginas

### Task 8: Ao Vivo, Modalidades e redirecionamentos

**Files:**
- Create: `app/ao-vivo/page.tsx`, `app/modalidades/page.tsx`, `app/modalidades/[slug]/page.tsx`, `lib/midia/campeonatos.ts`, `lib/midia/campeonatos.test.ts`
- Modify: `next.config.mjs` (`async redirects()`), `app/sitemap.ts`
- Delete: `app/campeonatos/`, `app/tv/`

**Interfaces:**
- Consumes: `AoVivo`, `AgendaArena`, `Faixa`, `modalidadePorSlug`, `buscarAgenda`.
- Produces:
  - `filtrarPorModalidade(itens: ItemAgenda[], slug: string): ItemAgenda[]`. Compara o `normalizarModalidade(item.modalidade)` de `lib/content/vocabulario.ts` com o nome do slug, sem acento e sem caixa.
  - `buscarCampeonatosDaModalidade(slug): Promise<{ id: string; nome: string; classificacao: LinhaClassificacao[] }[]>`. Lê `campeonatos.modalidade = slug` e a `v_classificacao` de cada um.
  - **`/modalidades/[slug]`:**
    - `generateStaticParams` com os 4 slugs;
    - slug inválido → `notFound()`;
    - blocos: banner da modalidade, próximos jogos, campeonatos com tabela e notícias (`modalidade = slug`, que ficam vazias até a Task 12).
  - **`/ao-vivo`:** o `AoVivo` mais a agenda só com `transmissao`.
  - **Redirects 308:** `/campeonatos`→`/modalidades`, `/tv`→`/ao-vivo`, `/atletas`→`/atletasdestaques`, `/painel/noticias`→`/coordenador?aba=noticias`, `/painel/tv`→`/coordenador?aba=aovivo`, `/painel/campeonatos`→`/coordenador?aba=campeonatos`, `/painel/atletasdestaques`→`/coordenador?aba=destaques`. As páginas `app/painel/{noticias,tv,campeonatos,atletasdestaques}` são apagadas.

- [ ] **Step 1: Write the failing tests:**
  - `filtrarPorModalidade` com itens "Futsal", "FUTSAL" e "Futebol 7": o slug `futsal` dá 2 e `futebol7` dá 1;
  - `next.config.mjs`, importado no teste, tem `redirects()` contendo `{ source: '/tv', destination: '/ao-vivo', permanent: true }` e o de `/campeonatos`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** `npm test && npm run build`. Expected: PASS, com `/modalidades/futsal` etc. no build.
- [ ] **Step 5: Commit.** `feat(paginas): Ao Vivo, Modalidades e redirecionamentos das rotas antigas`

### Task 9: Projeto Social, Sobre e Vídeos

**Files:**
- Create: `app/sobre/page.tsx`, `app/videos/page.tsx`, `components/midia/FiltroVideos.tsx`, `components/midia/FiltroVideos.test.tsx`
- Modify: `app/projetosocial/page.tsx`, `components/ProjetoSocialFocus.tsx` (só o visual)

**Interfaces:**
- Consumes: `buscarVideosYT`, `buscarVideosExternos`, `Faixa`, `Cartaz`, `Fileira`.
- Produces:
  - **`/projetosocial`:** mantém **todo** o texto atual da página e do `ProjetoSocialFocus`: título, texto, 4 números, 3 iniciativas, apoio pelo WhatsApp com mensagem pronta, cotas e CNPJ. Também:
    - os 3 botões em `btn-forte` vermelho: Apoiar, Cotas e "Inscrever criança / atleta" (→ `/inscricao`);
    - a fileira "Resultados dos projetos", ligada na Task 12.

    Antes de editar, copiar os textos atuais para o teste.
  - **`/sobre`:** manifesto, essência, missão e pilares, com os textos do bloco "Sobre" da prévia e do PDF do dono já resumidos na spec. Também os contatos e as redes (os mesmos links do rodapé).
  - **`<FiltroVideos videos: ItemVideo[]>`** (client): botões "Todos", "YouTube" e "Instagram" com `aria-pressed`, filtrando uma grade de `Cartaz` com `externo`.
  - **`type ItemVideo = { id; titulo; capa; link; plataforma: 'youtube'|'instagram'|'outro'; data: string }`.**

- [ ] **Step 1: Write the failing tests:**
  - `FiltroVideos` com 2 do YouTube e 1 do Instagram: "Instagram" mostra 1 cartaz e "Todos" mostra 3;
  - o teste de `/projetosocial`, renderizando a página, contém os trechos de texto copiados da versão atual (título, os 3 títulos das iniciativas e "40.694.741/0001-34") e o link para `/inscricao`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** `npm test && npm run build`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat(paginas): Projeto Social completo, Sobre e Vídeos`

### Task 10: Visual novo nas demais páginas públicas

**Files:**
- Modify (só o visual, o conteúdo fica igual):
  - `app/agenda/page.tsx` e `app/agenda/layout.tsx`, que passam a usar `buscarAgenda(50)` e o `AgendaArena`;
  - `app/atletasdestaques/*`, `app/patrocinio/*`, `app/(public)/sumula/*`, `app/inscricao/page.tsx`, `app/(auth)/login/page.tsx`, `app/criar-senha/page.tsx`, `app/privacidade/page.tsx`, `app/termos/page.tsx`, `app/links/page.tsx`, `app/not-found.tsx`, `app/acesso-negado/page.tsx`.
- Delete: `components/Header.tsx`, `components/nav.tsx` e `components/AgendaJogos.tsx`, se não sobrar nenhum import (conferir com Grep).
- Test: `tests/marca.test.ts`

**Interfaces:**
- Consumes: `Faixa`, as classes `av-*`, `.btn-forte` e `.btn-leve`.

- [ ] **Step 1: Write the failing test.** `tests/marca.test.ts` percorre os arquivos `app/**/*.tsx`, `components/**/*.tsx` e `lib/**/*.ts` (menos os testes) e falha se algum contiver:
  - `/arena vale sports?\b/i`;
  - as cores antigas `#f5d76e`, `#0c1f4a` ou `#08163a`.

  Ele lista os arquivos culpados.
- [ ] **Step 2: Run.** `npx vitest run tests/marca.test.ts`. Expected: FAIL, listando os arquivos legados.
- [ ] **Step 3: Implement.** Em cada página, trocar o cabeçalho próprio por `Faixa` ou `.titulo-secao` e as cores fixas antigas pelas `av-*`. Os títulos ficam centralizados e em caixa alta.
- [ ] **Step 4: Run.** `npm test && npm run build`. Rodar `npm run dev` e abrir cada página em 390 px e 1400 px. Expected: PASS; nenhuma página com rolagem horizontal.
- [ ] **Step 5: Commit e push.** `feat(visual): demais páginas no visual novo` e depois `git push origin organizacao` (fim da parte 3B).

## Parte 3C — Notícias, Esporte Mundial e o bot do Telegram

### Task 11: Regras de notícias e vídeos externos (lib)

**Files:**
- Create: `lib/midia/noticias.ts`, `lib/midia/noticias.test.ts`, `lib/midia/links.ts`, `lib/midia/links.test.ts`, `lib/midia/videos-externos.ts` (completa o da Task 7), `lib/midia/videos-externos.test.ts`
- Modify: `lib/content/vocabulario.ts` (categorias `geral|campeonatos|bastidores|projeto_social`, rótulos "Geral", "Campeonatos", "Bastidores", "Projeto Social"), `lib/content/noticias.ts` e `lib/content/tipos.ts` (as colunas novas no `Noticia`)

**Interfaces:**
- Produces:
  - `servicoDoLink(url: string): 'youtube'|'instagram'|'x'|'tiktok'|'facebook'|'telegram'|'outro'`. Hosts: `youtube.com`, `youtu.be`, `instagram.com`, `x.com`, `twitter.com`, `tiktok.com`, `facebook.com`, `fb.watch`, `t.me`.
  - `idYoutube(url: string): string | null`. Aceita `watch?v=`, `youtu.be/`, `shorts/`, `embed/` e `live/`.
  - `primeiroLinkDeVideo(texto: string): string | null`. Devolve o primeiro `https?://` cujo serviço não seja `outro`.
  - `validarLinkInstagram(url: string): boolean`. Exige `https:`, o host `instagram.com` ou `www.instagram.com`, e o caminho começando com `/p/`, `/reel/` ou `/tv/`.
  - `type ModoReproducao = { tipo: 'arquivo'; src: string } | { tipo: 'youtube'; embed: string } | { tipo: 'link'; href: string; servico: string } | { tipo: 'foto' }`.
  - `modoReproducao(n: NoticiaMidia): ModoReproducao`. Segue a ordem da seção 4.5 do spec anterior; o embed é `https://www.youtube-nocookie.com/embed/<id>`.
  - `ehNova(publicadoEm: string | null, agora: Date): boolean`. Verdadeiro por menos de 48 h.
  - `faltasParaPublicar(n: NoticiaMidia, modoVideo: 'guardar_arquivo'|'so_link'): string[]`. Mensagens exatas:
    - `'Falta o título.'`;
    - `'Falta o cartaz.'`;
    - `'Falta o vídeo: envie o arquivo ou cole o link.'` (modo `guardar_arquivo`, vídeo sem os dois);
    - `'Cole o link do vídeo para publicar'` (modo `so_link`, vídeo sem link).
  - `type NoticiaMidia = Noticia & { aba: 'arena'|'mundo'; destaque: boolean; tipo_midia: 'foto'|'video'; video_url: string|null; video_link: string|null; video_servico: string|null; status: 'rascunho'|'publicado'; publicado_em: string|null; fonte: string|null; origem: 'manual'|'telegram'; modalidade: string|null }`.
  - `montarFileiras(ns: NoticiaMidia[], aba: 'arena'|'mundo'): { titulo: string; itens: NoticiaMidia[] }[]`. Fileiras em ordem: Destaques, Mais recentes, Campeonatos, Bastidores e Projeto Social (este só em `arena`). Cada uma tem até 20 itens, e as vazias são omitidas.
  - `buscarNoticiasPublicadas(o: { aba?: 'arena'|'mundo'; categoria?: string; modalidade?: string; limite?: number }): Promise<NoticiaMidia[]>`. Ordena por `publicado_em desc`; em erro, `[]`.
  - `buscarNoticia(id: string): Promise<NoticiaMidia | null>`.
  - `type VideoExterno = { id; titulo; link; capa_url; plataforma; publicado_em }`.
  - `buscarVideosExternos(limite = 20): Promise<VideoExterno[]>`.
  - `faltasVideoExterno(v: { link; titulo; capa_url }): string[]`. Mensagens:
    - `'Cole um link https:// do Instagram (post, reel ou tv).'`;
    - `'Falta o título.'`;
    - `'Falta a capa.'`.

- [ ] **Step 1: Write the failing tests:**
  - `idYoutube` nas 5 formas devolve `dQw4w9WgXcQ`; um link do Instagram devolve `null`;
  - `servicoDoLink('https://fb.watch/x')` é `'facebook'`;
  - `primeiroLinkDeVideo('veja https://site.com e https://youtu.be/dQw4w9WgXcQ')` devolve o link do youtu.be;
  - `validarLinkInstagram`:
    - `true` para `https://www.instagram.com/reel/abc/`;
    - `false` para `http://instagram.com/p/x`, `https://instagram.com.evil.com/p/x` e `https://www.instagram.com/arenavaleoficial`;
  - `modoReproducao`, os 4 casos em ordem: arquivo vence o youtube, youtube vence o link, link do instagram dá `link`, e o vazio dá `foto`;
  - `ehNova` a 47 h dá `true` e a 49 h dá `false`;
  - `faltasParaPublicar`:
    - a notícia de vídeo sem nada no modo `so_link` dá exatamente `['Cole o link do vídeo para publicar']`, quando já tem título e cartaz;
    - sem título e sem cartaz dá as duas mensagens;
  - `montarFileiras`:
    - na aba `mundo` nunca há "Projeto Social";
    - a fileira vazia é omitida;
    - 25 itens são cortados em 20.
- [ ] **Step 2: Run.** `npx vitest run lib/midia`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** `npm test && npm run typecheck`. Expected: PASS. O typecheck pega usos antigos das categorias; ajustar os callers.
- [ ] **Step 5: Commit.** `feat(noticias): regras de reprodução, publicação, fileiras e links de vídeo`

### Task 12: Páginas de notícias e cartazes na home

**Files:**
- Create: `components/midia/BannerDestaque.tsx`, `components/midia/PlayerNoticia.tsx`, `components/midia/noticias-ui.test.tsx`
- Modify: `app/noticias/page.tsx`, `app/noticias/[id]/page.tsx`, `app/page.tsx` (blocos 3 e 4), `app/projetosocial/page.tsx` ("Resultados dos projetos"), `app/modalidades/[slug]/page.tsx` (notícias)
- Delete: `components/CartaoComunicado.tsx`, se ficar sem uso

**Interfaces:**
- Consumes: Task 11, `Cartaz`, `Fileira`, `Faixa`.
- Produces:
  - **`/noticias`:**
    - abas "Notícias do Vale" (`/noticias`) e "Esporte Mundial" (`/noticias?aba=mundo`), com `aria-current="page"` na ativa;
    - o banner de destaque e as fileiras;
    - `searchParams` é uma Promise no Next 16, e precisa de `await`.
  - **`<BannerDestaque n: NoticiaMidia>`:**
    - com arquivo: `<video muted loop playsInline autoPlay poster>`, só sem `prefers-reduced-motion` e sem `navigator.connection.saveData` (client);
    - senão, o cartaz com zoom lento desligado por `motion-reduce:`;
    - botão "▶ Assistir" ou "Ver".
  - **`<PlayerNoticia n>`:** um `<video controls>`, um iframe do YouTube, ou o cartaz grande com o link "▶ Assistir no <Serviço>" em nova aba, conforme `modoReproducao`.
  - **`/noticias/[id]`:** o player ou a foto, o título, o texto, a "Fonte: <fonte>" e a fileira "Mais da mesma categoria". Sem notícia publicada, `notFound()`.
  - **Home:** "Agora na Arena" (aba `arena`, 12) e "Esporte Mundial" (aba `mundo`, 12). Abaixo do Esporte Mundial fica o fluxo "Telegram → Bot → Rascunho → Coordenação publica", copiado da prévia. Fileira vazia mostra "Em breve as primeiras notícias.".
  - **No `Cartaz`:** o selo é "VÍDEO" ou "FOTO" conforme `modoReproducao(n).tipo !== 'foto'`, e `novo` vem de `ehNova`.

- [ ] **Step 1: Write the failing tests:**
  - **`PlayerNoticia`:**
    - com `video_url` há um elemento `video` com `controls`;
    - só com o link do YouTube há um iframe com `src` contendo `youtube-nocookie.com/embed/dQw4w9WgXcQ`;
    - só com o link do Instagram há o link "▶ Assistir no Instagram" com `target="_blank"`;
  - **`BannerDestaque`** com `matchMedia('(prefers-reduced-motion: reduce)')` verdadeiro **não** renderiza `video`;
  - **Cartaz de notícia** com `imagem_url: null` usa `og-banner.jpg` (Review Focus 4).
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** `npm test && npm run build`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat(noticias): catálogo em cartazes, Esporte Mundial e leitura da notícia`

### Task 13: Bot do Telegram, vinculação e rotina de vídeos

**Files:**
- Create:
  - `lib/telegram/extrair.ts` e `lib/telegram/extrair.test.ts`;
  - `lib/telegram/__amostras__/` (updates JSON: foto, vídeo, vídeo grande, texto com link do YouTube, canal público, álbum, `/vincular`);
  - `lib/telegram/api.ts`;
  - `app/api/telegram/route.ts` e `app/api/telegram/route.test.ts`;
  - `app/api/cron/videos/route.ts` e `app/api/cron/videos/route.test.ts`;
  - `vercel.json`.
- Modify: `README.md` (passo a passo do bot: BotFather, variáveis, `setWebhook` com o comando pronto, `/vincular`)

**Interfaces:**
- Consumes: `primeiroLinkDeVideo`, `servicoDoLink` (Task 11), `createAdminClient`, `proprietario.modo_video` e `dias_validade_video` (0009).
- Produces:
  - `type RascunhoTelegram = { ref: string; titulo: string; descricao: string; tipo_midia: 'foto'|'video'; fotoFileId: string|null; videoFileId: string|null; videoTamanho: number|null; thumbFileId: string|null; video_link: string|null; fonte: string|null; mediaGroupId: string|null }`.
  - `extrairRascunho(msg: TgMessage): RascunhoTelegram`:
    - `ref` é `chat_id:message_id`;
    - o título é a primeira linha não vazia, com até 120 caracteres; sem texto, `'Notícia do Telegram'`;
    - a descrição é o resto;
    - a foto é o maior `photo[]`;
    - o vídeo vem de `video`, `animation` ou de um `document` com `mime_type` começando por `video/`;
    - o `video_link` é o `primeiroLinkDeVideo` do texto ou, para um canal público, `https://t.me/<username>/<message_id>`;
    - a fonte é o `forward_origin` (`chat.title`, `sender_user` com nome e sobrenome, `sender_user_name` ou `chat.username`).
  - `comandoVincular(texto: string): string | null`. Para `/vincular 123456`, devolve `'123456'`.
  - `respostaRascunho(r: RascunhoTelegram, modo: 'guardar_arquivo'|'so_link', guardouVideo: boolean, erroMidia: boolean, link: string): string`. Gera exatamente as mensagens da seção 4.4 do spec anterior, terminando com o link do editor.
  - **`POST /api/telegram`:**
    1. Valida o `X-Telegram-Bot-Api-Secret-Token` contra `TELEGRAM_WEBHOOK_SECRET`. Diferente ou ausente → 401.
    2. Trata `/vincular`: procura o código válido em `telegram_codigos_vinculo`, grava `profiles.telegram_user_id`, apaga o código e responde "Telegram vinculado ✅". Com código inválido ou vencido: "Código inválido ou vencido. Gere outro no painel.".
    3. Procura o perfil por `telegram_user_id` e confere que `role = 'coordenador'`. Senão, responde "Você não tem permissão para criar notícias." e devolve 200.
    4. Ignora as mensagens seguintes do mesmo `media_group_id` já registrado (`telegram_message_ref` do tipo `grupo:<media_group_id>` grava o primeiro).
    5. Baixa a mídia com `getFile`: até 20 MB e, no caso do vídeo, só no modo `guardar_arquivo`. Envia ao bucket `noticias` como `telegram/<ref>.<ext>` e preenche `video_expira_em = now + dias_validade_video`.
    6. Insere a notícia com `status 'rascunho'`, `origem 'telegram'`, `aba 'mundo'` e `created_by = <perfil>`. Conflito de `telegram_message_ref` → ignora e devolve 200.
    7. Responde com `respostaRascunho`. Sempre devolve 200 para o Telegram, menos no 401.
  - **`GET /api/cron/videos`:**
    - exige `Authorization: Bearer ${CRON_SECRET}`, senão 401;
    - apaga do bucket os `video_url` com `video_expira_em < now()`;
    - zera `video_url` e `video_expira_em`;
    - devolve `{ removidos: number }`.
  - **`vercel.json`:** `{ "crons": [{ "path": "/api/cron/videos", "schedule": "0 6 * * *" }] }`.

- [ ] **Step 1: Write the failing tests:**
  - **`extrairRascunho`**, para cada amostra:
    - foto: `tipo_midia 'foto'` e `fotoFileId` do maior;
    - vídeo: `tipo_midia 'video'`;
    - texto com YouTube: `video_link` do YouTube e `tipo_midia 'video'`;
    - canal público: `video_link` igual a `https://t.me/<user>/<id>`;
    - um título de 200 caracteres sai com 120;
  - **`comandoVincular`:** `'/vincular 123456'` dá `'123456'` e `'/vincular abc'` dá `null`;
  - **`respostaRascunho`:**
    - vídeo grande com link → `'Rascunho criado ✅ — vídeo grande demais para guardar, vai tocar pelo link original.'`, mais o link;
    - modo `so_link` sem link → `'Rascunho criado ✅ — falta o link do vídeo. Cole no painel antes de publicar.'`;
  - **rota do Telegram**, com `createAdminClient` mockado por `vi.mock`:
    - sem o cabeçalho do segredo → 401, sem chamar o banco;
    - um remetente sem vínculo → 200, e a resposta enviada é "Você não tem permissão para criar notícias.";
  - **rota do cron:** sem o Bearer certo → 401.
- [ ] **Step 2: Run.** `npx vitest run lib/telegram app/api`. Expected: FAIL.
- [ ] **Step 3: Implement.** `lib/telegram/api.ts` usa `fetch` para `https://api.telegram.org/bot<token>/<método>`, e o token vem só de `process.env`.
- [ ] **Step 4: Run.** `npm test && npm run build`. Expected: PASS.
- [ ] **Step 5: Commit e push.** `feat(telegram): bot cria rascunhos do Esporte Mundial; rotina apaga vídeos vencidos` e depois `git push origin organizacao` (fim da parte 3C).

## Parte 3D — Painéis no visual novo

### Task 14: CoordShell novo — abas, Visão geral e Configurações

**Files:**
- Modify: `components/coord-shell.tsx` (cabeçalho e abas lidas de `?aba=`), `components/coord-config.tsx` (campos novos), `lib/supabase/queries.ts` (`getDashboardStats` com `videos`)
- Create: `components/painel/abas.ts`, `components/painel/abas.test.ts`, `components/painel/AbaAoVivo.tsx`, `components/coord-config.test.tsx`

**Interfaces:**
- Produces:
  - `ABAS_COORD: { id: string; rotulo: string }[]`, nesta ordem:
    - `visao` Visão geral
    - `aovivo` Ao Vivo
    - `noticias` Notícias
    - `videos` Vídeos
    - `jogos` Agenda e jogos
    - `campeonatos` Campeonatos
    - `inscricoes` Inscrições
    - `sumulas` Súmulas
    - `moderadores` Moderadores
    - `capitaes` Capitães
    - `patrocinadores` Patrocinadores
    - `destaques` Atletas destaque
    - `config` Configurações
  - `abaValida(v: string | null): string`. Um id desconhecido vira `'visao'`.
  - **O `CoordShell`:**
    - tem um cabeçalho preto com o logo, "PAINEL DA COORDENAÇÃO" e o botão "Ver o site" (`/`);
    - as abas são pílulas com rolagem lateral;
    - trocar de aba faz `router.replace('?aba=<id>')`.
  - **Visão geral:** os cartões Campeonatos, Equipes, Jogos e Vídeos no canal, com o texto "Para conhecimento da equipe — não aparece no site." (os números que saíram da home).
  - **`AbaAoVivo`:** o interruptor "Estamos ao vivo agora", o campo do link da live (`https://`) e o estado atual da detecção (`estaAoVivo`, por uma rota server).
  - **`CoordConfig`** grava em `site_config`:
    - `capa_url`: upload no bucket `noticias`, `config/capa-<timestamp>.jpg`;
    - `youtube_channel_id`, que precisa casar `/^UC[\w-]{22}$/`;
    - `youtube_handle`, que precisa começar com `@`;
    - `whatsapp`, só dígitos e de 12 a 13 caracteres;
    - `instagram_url`, `https://`.

    Um valor inválido bloqueia o salvamento com a mensagem do campo.
  - **Aba `campeonatos`:** o formulário de campeonato (o legado de `/painel/campeonatos`, movido para `components/coord-campeonatos.tsx`) ganha o select Modalidade, com os 4 valores e "—".
  - **Aba `destaques`:** usa `app/(coord)/coordenador/atletasdestaques/gestao-atletas-client.tsx`.

- [ ] **Step 1: Write the failing tests:**
  - `abaValida('xyz')` dá `'visao'` e `abaValida('noticias')` dá `'noticias'`; `ABAS_COORD` tem 13 itens, em ordem;
  - `CoordConfig` com o `fake-supabase`: um `youtube_channel_id = 'abc'` mostra "ID do canal inválido (começa com UC e tem 24 caracteres)." e não chama o `update`; o WhatsApp `'(47) 98844-4404'` é salvo como `'47988444404'` com um aviso para incluir o 55 (e `'5547988444404'` é aceito).
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** `npm test && npm run build`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat(painel): coordenação no visual novo, abas por URL, Ao Vivo e Configurações`

### Task 15: Painel — Notícias (editor) e Vídeos do Instagram

**Files:**
- Create: `components/painel/AbaNoticias.tsx`, `components/painel/EditorNoticia.tsx`, `components/painel/AbaVideos.tsx`, `components/painel/VincularTelegram.tsx`, `components/painel/noticias-painel.test.tsx`, `lib/ui/imagem.ts` (reduz a imagem para ≤ 1200 px em JPEG via `canvas`)
- Modify: `components/coord-shell.tsx` (liga as abas)

**Interfaces:**
- Consumes: `faltasParaPublicar`, `servicoDoLink`, `idYoutube`, `faltasVideoExterno`, `Cartaz`, `gerar_codigo_telegram` e `desvincular_telegram` (RPCs), `rpc('modo_video_atual')` e `noticias.enquadramento` (Task 2).
- Produces:
  - **`AbaNoticias`:**
    - lista com filtros (aba, categoria, status) e o botão em destaque "Rascunhos do Telegram (<n>)", com `origem=telegram` e `status=rascunho`;
    - `?editar=<id>` abre o editor.
  - **`EditorNoticia`**, com os campos do spec anterior, 4.3:
    - tipo, cartaz (upload e enquadramento por arraste, guardado como `object-position`), arquivo de vídeo (até 20 MB, "Remover vídeo"), link, título, texto, aba, categoria, modalidade, destaque e fonte;
    - a prévia do `Cartaz`;
    - o lembrete "Reescreva com suas palavras e cite a fonte" quando `origem='telegram'`;
    - "Usar a imagem do YouTube" quando há um link do YouTube e falta cartaz;
    - a captura de quadro do vídeo por `canvas`;
    - os botões **Salvar rascunho**, **Publicar** (bloqueado, mostrando a lista de `faltasParaPublicar`) e **Despublicar**.
  - **`AbaVideos`:** a lista de `videos_externos`, mais o formulário com link, título e capa (upload). "Publicar" usa `faltasVideoExterno` e o liga/desliga mexe em `ativo`.
  - **`VincularTelegram`:**
    - "Vincular Telegram" mostra o código e a instrução `Envie /vincular <código> para o bot`;
    - "Desvincular" aparece quando já está vinculado.
  - O `Cartaz` (Task 5) ganha a prop opcional `enquadramento?: string | null`, aplicada como `object-position`.

- [ ] **Step 1: Write the failing tests:**
  - `EditorNoticia` com uma notícia de vídeo sem link e sem arquivo, no modo `so_link`: "Publicar" mostra "Cole o link do vídeo para publicar" e não chama o `update`;
  - com o título e o cartaz preenchidos numa foto, "Publicar" chama o `update` com `status: 'publicado'`;
  - um rascunho do Telegram mostra o lembrete da fonte;
  - `AbaVideos` com o link `https://www.instagram.com/arenavaleoficial` mostra a mensagem de link inválido.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** `npm test && npm run build && npm run test:db`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat(painel): editor de notícias, rascunhos do Telegram e vídeos do Instagram`

### Task 16: Moderador, capitão e proprietário no visual novo

**Files:**
- Modify: `app/(coord)/moderador/page.tsx`, `app/(coord)/capitao/page.tsx`, `app/(coord)/proprietario/page.tsx`, `components/painel/CabecalhoEquipe.tsx`, `components/moderador/ResultadosCampeonato.tsx`, `components/capitao/MinhaEquipe.tsx`, `components/capitao-elenco.tsx`, `components/proprietario/GestaoCoordenadores.tsx` (**só classes**, nenhuma consulta muda)

**Interfaces:**
- **`CabecalhoEquipe`:** preto, com o logo, o título do painel em caixa alta e o botão "Ver o site". Na área do dono, mantém "← Voltar ao site" e "Painel da coordenação →".

- [ ] **Step 1: Write the failing test.** Em `components/painel/CabecalhoEquipe.test.tsx`: existe o link "Ver o site" para `/`, e o texto não contém "Proprietário".
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** Rodar `git diff --stat` e conferir que só mudaram `className` e textos de cabeçalho: nenhuma linha com `.from(`, `.rpc(` ou `.update(` alterada.
- [ ] **Step 4: Run.** `npm test && npm run test:db && npm run build`. Expected: PASS (os 46 da Fase 2 incluídos).
- [ ] **Step 5: Commit e push.** `feat(painel): moderador, capitão e proprietário no visual novo` e depois `git push origin organizacao` (fim da parte 3D).

## Parte 3E — Revisão, banco oficial e site no ar

### Task 17: Revisão final, aplicação em produção e merge

**Files:**
- Create: `scripts/fumaca.ts` (busca cada página pública e confere o status 200)
- Modify: `package.json` (script `fumaca`)

- [ ] **Step 1: Teste de fumaça.**
  - Adicionar a `package.json` o script `"fumaca": "tsx scripts/fumaca.ts"`, que recebe a URL base e lista as rotas: `/`, `/ao-vivo`, `/noticias`, `/noticias?aba=mundo`, `/agenda`, `/modalidades`, `/modalidades/futsal`, `/videos`, `/projetosocial`, `/atletasdestaques`, `/sobre`, `/patrocinio`, `/sumula`, `/inscricao`, `/login`, `/privacidade`, `/termos` e `/links`.
  - Ele espera 200 em todas, 308 em `/tv` e `/campeonatos`, e 404 em `/proprietario` sem login.
  - **Rodar duas vezes:** `npm run build && npm start` com o `.env.test.local` (banco de TESTES), e de novo com o `.env.local` (oficial, só leitura). Expected: tudo OK nos dois.
- [ ] **Step 2: Revisão independente.** Usar a skill superpowers:requesting-code-review, com um revisor (opus) sobre `git diff main...organizacao`.
  - Focos: RLS das tabelas novas, a rota do Telegram (segredo, service role, injeção no título), o cron, os 5 itens do Review Focus, "Sports" e "Proprietário" na interface.
  - Corrigir cada achado com um teste RED→GREEN.
- [ ] **Step 3: Atualizar a CFG** (memória `ponto-cfg`) antes de mexer em produção.
- [ ] **Step 4: Banco oficial.** O dono roda, no SQL Editor do projeto oficial, primeiro `supabase-FASE3-1-checagem.sql` e depois `supabase-FASE3-2-aplicar.sql`, guiado passo a passo com prints. Depois disso, conferir pela API:
  - `site_config.youtube_channel_id`;
  - nenhuma linha de `agenda_jogos` com `local ilike '%sports%'`;
  - o visitante não lê rascunhos.
- [ ] **Step 5: Variáveis na Vercel**, para Production e Preview: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` e `CRON_SECRET`. O dono cola os valores; eles nunca passam pelo chat. Em seguida, o BotFather e o `setWebhook` seguindo o README, e o `/vincular` do dono.
- [ ] **Step 6: Aprovação do dono** no site de teste: login de cada cargo (coordenação, moderador, capitão) abrindo o painel certo; encaminhar uma mensagem ao bot e ver o rascunho no painel.
- [ ] **Step 7: Merge.** Somente com o "pode publicar" explícito do dono: `git switch main && git merge --no-ff organizacao && git push origin main`. Conferir `https://arena-vale.vercel.app` com `npm run fumaca -- https://arena-vale.vercel.app`.
- [ ] **Step 8: Atualizar a CFG de novo** e a memória `projeto-arena-vale` (Fase 3 no ar).
