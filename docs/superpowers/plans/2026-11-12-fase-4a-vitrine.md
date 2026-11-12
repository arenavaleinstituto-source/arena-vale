# Fase 4A — Vitrine: plano de implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para seguir este plano tarefa por tarefa. Os passos usam caixas de seleção (`- [ ]`).

**Objetivo:** adicionar ao site o Hoje na Arena (com Lembrar e sininho), os Cortes do YouTube, o conserto dos Últimos vídeos, a Galeria (pelo painel e pelo robô) e o modo parceiro do robô.

**Arquitetura:**
- Segue os padrões que já existem: funções puras em `lib/midia/*`, buscas no servidor em `*-busca.ts` com `seguro()`, e o robô por "portas" (`PortasBot`), testável sem rede.
- As imagens são tratadas pelo sharp em `lib/imagem/*`.
- O banco recebe a migração 0019. O SQL do dono é gerado a partir dela e validado no banco de testes.

**Tecnologia:** Next.js 16 App Router, Supabase (RLS + Storage), sharp, Vitest/jsdom, YouTube Data API v3, Telegram Bot API.

**Spec:** `docs/superpowers/specs/2026-11-12-fase-4a-vitrine-design.md`

## Regras gerais

- A marca é sempre "ARENA VALE". Nunca escrever "Sports" ou "Sport".
- O dono nunca aparece como "Proprietário" nas telas.
- Os textos de tela são em português do Brasil.
- Segredos (`YOUTUBE_API_KEY`, tokens) nunca são impressos nem vão para o git. O dono cola as chaves na Vercel e no `.env.local`.
- Os testes de banco rodam só no banco TESTES (`npm run test:db`). Nunca no oficial `cpvmfpxxrdpvfbonwynr`.
- O SQL do dono não tem comentários e começa com `begin;` e termina com `commit;`. Ele é rodado duas vezes no banco de testes, dentro de uma transação, antes de ser entregue.
- Sempre conferir o código de saída do `npm test`. Parar o servidor da porta 3100 antes do build e, se o build cair, rodar `rm -rf .next` e repetir.
- Publicação: commit na `organizacao`, depois `merge --no-ff` na `main`, push e conferência no www.arenavale.com.br. Ao final, a `organizacao` volta a ficar igual à `main`.
- Toda busca nova usa `seguro()` ou try/catch e devolve vazio em caso de falha. Uma fonte fora do ar nunca derruba a página.
- Fuso de "hoje": America/Sao_Paulo (UTC−3, sem horário de verão).

## Pontos de atenção da revisão

1. **Jogo perto da meia-noite:** um jogo às 23h30 de Brasília é "hoje", embora seja amanhã em UTC. `separarHoje` tem teste para isso.
2. **Nome de time com vírgula, ponto e vírgula ou acento no `.ics`:** tudo precisa ser escapado e em UTF-8. `gerarIcs` tem teste com "São José, B; C".
3. **Foto que chega como "arquivo" ou em álbum do Telegram no modo galeria:** precisa ir para a galeria e receber uma resposta só por álbum. O teste fica na tarefa 10.
4. **Foto vertical do celular com EXIF de rotação:** não pode ficar deitada. `prepararFotoGaleria` tem teste com orientação 6.
5. **Álbum escondido acessado pelo link direto:** precisa dar 404 e o visitante não pode ler as fotos dele. Há teste de banco e teste da página.

---

### Tarefa 1: Separar "hoje" e "próximos" na agenda

**Arquivos:**
- Alterar `lib/midia/agenda.ts`
- Teste: `lib/midia/agenda.test.ts`

**Interfaces:**
- Produz:
  - `separarHoje(itens: ItemAgenda[], agora: Date, maxProximos = 6): { hoje: ItemAgenda[]; proximos: ItemAgenda[] }`;
  - `buscarHojeNaArena(): Promise<{ hoje: ItemAgenda[]; proximos: ItemAgenda[] }>`.

- [ ] **Passo 1: testes que falham** (`describe('separarHoje')`, AGORA = 2026-11-15T20:00:00-03:00):
  - jogo das 19h30 de hoje (começou há 30 min) → `hoje`;
  - jogo das 16h59 de hoje (há mais de 3 h) → fora das duas listas;
  - jogo de hoje às 23h30 (`2026-11-16T02:30:00Z`) → `hoje`;
  - jogo de amanhã às 10h → `proximos`;
  - 8 jogos futuros → `proximos.length === 6`;
  - o resultado vem ordenado por `dataHora`.
- [ ] **Passo 2:** `npx vitest run lib/midia/agenda.test.ts` → FALHA, `separarHoje is not a function`.
- [ ] **Passo 3: implementar `separarHoje`.** Para comparar o dia: `new Date(t - 3h).toISOString().slice(0,10)`.
- [ ] **Passo 4: implementar `buscarHojeNaArena`.** Mesmas consultas de `buscarAgenda`, com início em `agora − 3h` e `limit(50)`, seguidas de `separarHoje(..., agora)`. Refatorar as consultas para uma função interna `buscarItens(desde: Date)`, usada pelas duas.
- [ ] **Passo 5:** os testes passam. Commit `feat(agenda): separa jogos de hoje e próximos`.

### Tarefa 2: Lembrete (`.ics` e Google Agenda)

**Arquivos:**
- Criar `lib/midia/lembrete.ts` e `app/api/lembrete/route.ts`
- Testes: `lib/midia/lembrete.test.ts` e `app/api/lembrete/route.test.ts`

**Interfaces:**
- Consome: `ItemAgenda`.
- Produz:
  - `gerarIcs(item: ItemAgenda, baseUrl: string): string`;
  - `linkGoogleAgenda(item: ItemAgenda, baseUrl: string): string`;
  - `buscarItemAgenda(origem: 'jogos' | 'agenda', id: string): Promise<ItemAgenda | null>`, em `lib/midia/agenda.ts`.

- [ ] **Passo 1: testes que falham.** `gerarIcs` com casa "São José, B; C" e fora "Vila\\Nova":
  - contém `BEGIN:VCALENDAR`, `BEGIN:VEVENT`, `SUMMARY:São José\, B\; C x Vila\\\\Nova — ARENA VALE`;
  - `DTSTART` e `DTEND` em UTC, no formato `YYYYMMDDTHHMMSSZ`, com duração de 2 h;
  - `BEGIN:VALARM`, `TRIGGER:-PT30M` e `ACTION:DISPLAY`;
  - `DESCRIPTION` com `${baseUrl}/ao-vivo`;
  - linhas separadas por `\r\n`;
  - `UID` igual a `${origem}-${id}@arenavale.com.br`.

  `linkGoogleAgenda`:
  - começa com `https://calendar.google.com/calendar/render?action=TEMPLATE`;
  - `dates=<inicio>/<fim>`;
  - `text` codificado.

  Rota:
  - `GET ?origem=agenda&id=<uuid>`, com `buscarItemAgenda` mockado devolvendo um item → 200, `content-type` contém `text/calendar` e `content-disposition` contém `attachment`;
  - item inexistente → 404;
  - `origem=xyz` → 400.
- [ ] **Passo 2:** rodar → FALHA.
- [ ] **Passo 3: implementar.**
  - Escape do texto: `\` vira `\\`, `;` vira `\;`, `,` vira `\,` e quebra de linha vira `\n`.
  - `buscarItemAgenda` consulta uma linha pelo id na tabela da origem, com os mesmos selects e conversores (`deJogos` e `deAgendaJogos`).
  - A rota usa `export const dynamic = 'force-dynamic'` e valida o id com uma regex de uuid.
- [ ] **Passo 4:** os testes passam. Commit `feat(agenda): lembrete .ics e Google Agenda`.

### Tarefa 3: Tela do Hoje na Arena e botões dos jogos (publicação 1)

**Arquivos:**
- Criar `components/home/HojeNaArena.tsx` e `components/midia/BotoesJogo.tsx`
- Alterar:
  - `components/home/AgendaArena.tsx`, para que `ListaAgenda` mostre `BotoesJogo` e o selo HOJE;
  - `app/page.tsx`;
  - `app/agenda/page.tsx`;
  - `app/midia.css`
- Testes: `components/home/home.test.tsx` e `components/midia/BotoesJogo.test.tsx`

**Interfaces:**
- Consome: `buscarHojeNaArena`, `linkGoogleAgenda`, `config.youtubeHandle`.
- Produz:
  - `BotoesJogo({ item, baseUrl, youtubeHandle, albumId? }: { item: ItemAgenda; baseUrl: string; youtubeHandle: string; albumId?: string | null })` (client);
  - `HojeNaArena({ hoje, proximos, baseUrl, youtubeHandle, albuns })`, onde `albuns: Record<string, string>` mapeia `"origem-id"` para `albumId` (fica `{}` até a tarefa 9);
  - `ListaAgenda({ itens, baseUrl, youtubeHandle, albuns, hoje? })`.

- [ ] **Passo 1: testes que falham.**
  - `HojeNaArena` com 1 jogo hoje e 2 próximos:
    - título "Hoje na Arena";
    - selo "HOJE" uma vez;
    - subtítulo "Próximos dias".
  - Sem `hoje`: mostra o texto "Hoje não tem jogo na Arena — veja os próximos".
  - Sem nada: "Nenhum jogo agendado — volte em breve.".
  - `BotoesJogo`:
    - o botão "Lembrar" tem `aria-expanded=false`; ao clicar, aparecem os links "Google Agenda" (href começa com `https://calendar.google.com`) e "Agenda do celular" (href `/api/lembrete?origem=…&id=…`);
    - Esc fecha;
    - o link "Ativar o sininho" aponta para `https://www.youtube.com/@TVArenaVale?sub_confirmation=1`, abre em `_blank` e tem `rel` com `noopener`;
    - com `albumId`, aparece o link "Ver fotos" para `/galeria/<id>`.
- [ ] **Passo 2:** rodar → FALHA.
- [ ] **Passo 3: implementar.**
  - Os cartões de `/agenda` usam `ListaAgenda` com os botões.
  - Na home, `<AgendaArena>` é trocado por `<HojeNaArena>`, alimentado por `seguro(buscarHojeNaArena(), {hoje:[],proximos:[]})`.
  - O `resumoAgenda` do AoVivo continua usando `buscarAgenda`.
  - `baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.arenavale.com.br'`.
  - CSS:
    - `.jogo .hoje`: selo vermelho;
    - `.botoes-jogo`: flex com gap de 8px;
    - `.menu-lembrar`: absoluto, com o mesmo visual de `.menu-entrar`.
- [ ] **Passo 4:**
  - `npm test` com saída 0;
  - `npx tsc --noEmit`;
  - `npx eslint` nos arquivos alterados;
  - `npm run build` sem erro.
- [ ] **Passo 5: conferência visual.** `next start -p 3100` e captura de tela de celular (390x844, emulação CDP como no `cel.mjs` do scratchpad) da home e da `/agenda`, com o menu Lembrar aberto.
- [ ] **Passo 6:**
  - commit `feat(home): Hoje na Arena com Lembrar e sininho`;
  - publicar (regras gerais);
  - conferir na produção que `/api/lembrete` de um jogo real devolve 200 com `text/calendar`.

### Tarefa 4: YouTube pela API oficial

**Arquivos:**
- Alterar `lib/midia/youtube.ts`
- Teste: `lib/midia/youtube.test.ts`

**Interfaces:**
- Produz:
  - `playlistsDoCanal(channelId: string): { videos: string; lives: string; shorts: string }`, que troca `UC` por `UULF`, `UULV` e `UUSH`;
  - `parsearPlaylistItems(json: unknown): VideoYT[]`;
  - `buscarListaYT(playlistId: string, limite: number, f?: typeof fetch): Promise<VideoYT[]>`;
  - `buscarVideosYT(channelId, f?)`, com a mesma assinatura de hoje;
  - `buscarCortesYT(channelId: string, limite = 12, f?: typeof fetch): Promise<VideoYT[]>`.

- [ ] **Passo 1: testes que falham.**
  - `playlistsDoCanal('UCBTQ97bWA6VqK2a6qv80dIg').shorts === 'UUSHBTQ97bWA6VqK2a6qv80dIg'`.
  - `parsearPlaylistItems`, com itens de `snippet.resourceId.videoId`, `title`, `publishedAt` e `thumbnails`:
    - descarta "Private video" e "Deleted video";
    - remove as hashtags do título;
    - a capa é `https://i.ytimg.com/vi/<id>/hqdefault.jpg`.
  - `buscarListaYT`:
    - com `process.env.YOUTUBE_API_KEY` definido e um fetch falso, a URL contém `playlistItems?part=snippet&maxResults=12&playlistId=UUSH…&key=`;
    - sem chave → `[]` e o fetch não é chamado;
    - resposta 403 → `[]`.
  - `buscarVideosYT`:
    - com chave, junta UULF e UULV ordenados por data, do mais novo ao mais antigo, e corta em 15;
    - sem chave, usa o RSS, como no teste atual.
- [ ] **Passo 2:** rodar → FALHA.
- [ ] **Passo 3: implementar.** `next: { revalidate: 1800 }` e `signal: AbortSignal.timeout(4000)`. A chave é lida em `process.env.YOUTUBE_API_KEY` no momento da chamada.
- [ ] **Passo 4:** os testes passam. Commit `feat(youtube): API oficial para vídeos, lives e Shorts`.

### Tarefa 5: Fileira de Cortes e player (publicação 2)

**Arquivos:**
- Criar `components/home/Cortes.tsx` e `components/midia/PlayerCorte.tsx`
- Alterar `app/page.tsx` e `app/midia.css`
- Teste: `components/home/Cortes.test.tsx`

**Interfaces:**
- Consome: `buscarCortesYT`, `Fileira`.
- Produz: `Cortes({ cortes }: { cortes: VideoYT[] })` (client) e `PlayerCorte({ video, aoFechar })`.

- [ ] **Passo 1: testes que falham.**
  - Lista vazia → nada é renderizado.
  - 3 cortes:
    - aparece o título "Cortes";
    - há 3 botões com o nome do vídeo.
  - Clique abre o diálogo:
    - `role=dialog` e `aria-modal=true`;
    - `iframe src` igual a `https://www.youtube-nocookie.com/embed/<id>?autoplay=1&playsinline=1`;
    - `document.body.style.overflow === 'hidden'`.
  - Esc fecha e devolve o foco ao botão. ✕ fecha. Clique no fundo fecha.
- [ ] **Passo 2:** rodar → FALHA.
- [ ] **Passo 3: implementar.**
  - Cartões 9:16, classe `.corte`, com largura de 168px no celular e 200px a partir de 860px.
  - O player usa um portal no `document.body`.
  - Na home, a fileira entra logo depois de `HojeNaArena`, com `seguro(buscarCortesYT(config.youtubeChannelId), [])`.
- [ ] **Passo 4: verificações.** Testes, tsc, eslint e build.
- [ ] **Passo 5: chave do YouTube (ação do dono).** Antes de publicar, passar ao dono o passo a passo, em linguagem simples, com um passo por mensagem se ele preferir:
  1. Entrar em `console.cloud.google.com` com o e-mail da Arena.
  2. Criar o projeto "ARENA VALE Site".
  3. Ativar a "YouTube Data API v3".
  4. Criar a credencial "Chave de API" e restringi-la à "YouTube Data API v3".
  5. Colar a chave na Vercel como `YOUTUBE_API_KEY` (Produção) e no `.env.local`.
  6. Reimplantar.

  Conferir localmente que `buscarCortesYT` devolve mais de 0 itens, sem imprimir a chave.
- [ ] **Passo 6:**
  - commit `feat(home): fileira de Cortes com player`;
  - publicar;
  - conferir na produção que a home contém `i.ytimg.com/vi/` (vídeos e cortes).

### Tarefa 6: Banco da galeria (migração 0019)

**Arquivos:**
- Criar `supabase/migrations/0019_galeria.sql` e `tests/db/galeria.test.ts`
- Gerar `../supabase-FASE4-1-galeria.sql`

**Interfaces:**
- Produz:
  - as tabelas `galeria_albuns`, `galeria_fotos` e `telegram_estado`, como na spec §4.1, **mais a coluna `telegram_estado.ultimo_grupo text null`**, usada na tarefa 10;
  - o bucket `galeria`.

- [ ] **Passo 1: testes de banco que falham.**
  - O visitante:
    - lê um álbum ativo e as fotos dele;
    - não lê álbum com `ativo=false` nem as fotos dele;
    - não consegue inserir em `galeria_albuns` (erro).
  - O coordenador insere um álbum e uma foto.
  - Um segundo álbum com a mesma origem e o mesmo `jogo_ref` → violação de unicidade (23505).
  - O título com 2 caracteres → erro de check.
  - Em `telegram_estado`, o visitante e o authenticated recebem erro de permissão (42501), e o admin lê.
  - `storage.buckets` tem `galeria` com `allowed_mime_types` = `{image/jpeg,image/png,image/webp}` e `file_size_limit` = 10485760.
- [ ] **Passo 2:** `npm run test:db` → FALHA.
- [ ] **Passo 3: escrever a 0019.**
  - Idempotente (`if not exists`, `drop policy if exists`).
  - Políticas:
    - leitura de `galeria_albuns`: `ativo or is_staff()`;
    - leitura de `galeria_fotos`: `exists(album ativo) or is_staff()`;
    - escrita: `is_staff()`.
  - `telegram_estado` com RLS ativo e `revoke all ... from anon, authenticated`.
  - Políticas do storage `galeria`: leitura pública e escrita pelo staff, como as de `noticias` na 0011.
- [ ] **Passo 4:** `npm run test:db` com saída 0.
- [ ] **Passo 5: SQL do dono.**
  - Gerar com `{ echo "begin;"; grep -v '^--' supabase/migrations/0019_galeria.sql; echo "commit;"; } > ../supabase-FASE4-1-galeria.sql`.
  - Validar rodando duas vezes no banco de testes, com `pg`, sem erro.
- [ ] **Passo 6:** commit `feat(db): galeria de fotos (0019)`. Pedir ao dono que rode `supabase-FASE4-1-galeria.sql` no oficial e conferir pela API só de leitura que as tabelas existem.

### Tarefa 7: Preparo das fotos e buscas da galeria

**Arquivos:**
- Criar:
  - `lib/imagem/galeria.ts`;
  - `lib/midia/galeria.ts` (tipos e funções puras);
  - `lib/midia/galeria-busca.ts` (servidor)
- Testes: `lib/imagem/galeria.test.ts` e `lib/midia/galeria.test.ts`

**Interfaces:**
- Consome: `carimbarLogo`.
- Produz:
  - `prepararFotoGaleria(bytes: Uint8Array): Promise<{ grande: Uint8Array; miniatura: Uint8Array; largura: number; altura: number }>`;
  - os tipos `AlbumGaleria = { id; titulo; data; origem: 'jogos'|'agenda'|null; jogoRef: string|null; capaUrl: string|null; ativo: boolean; totalFotos: number }` e `FotoGaleria = { id; albumId; url; miniaturaUrl; largura; altura }`;
  - `buscarAlbuns(limite: number, antesDe?: string): Promise<AlbumGaleria[]>`, só os ativos com pelo menos 1 foto, ordenados por `data desc, created_at desc`;
  - `buscarAlbum(id: string): Promise<{ album: AlbumGaleria; fotos: FotoGaleria[] } | null>`;
  - `albunsDosJogos(): Promise<Record<string, string>>`, que mapeia `"origem-jogoRef"` para `id`;
  - `jogosRecentes(dias: number, agora?: Date): Promise<ItemAgenda[]>`, com os jogos de `hoje − dias` até o fim de hoje, das duas fontes, ordenados do mais recente ao mais antigo, até 8 (no `lib/midia/agenda.ts`);
  - `rotuloJogo(item: ItemAgenda): string`, no formato `"Casa x Fora · 15/11"`.
- [ ] **Passo 1: testes que falham.**
  - `prepararFotoGaleria`, com um JPEG de 4000x3000 gerado pelo sharp e EXIF `orientation: 6`:
    - a grande sai com 1500x2000 (vertical);
    - a miniatura tem 600 px no lado maior;
    - as duas são JPEG.
  - Uma imagem PNG de 800x600 não é ampliada.
  - `rotuloJogo` dá `"Real x Sede · 20/11"`.
  - As buscas sem as tabelas, com o cliente devolvendo erro, retornam `[]`, `null` e `{}`.
- [ ] **Passo 2:** rodar → FALHA.
- [ ] **Passo 3: implementar.** Usar `sharp(bytes).rotate()`, `resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })`, depois `carimbarLogo`, só na grande, e `jpeg({ quality: 85 })`.
- [ ] **Passo 4:** os testes passam. Commit `feat(galeria): preparo das fotos e buscas`.

### Tarefa 8: Envio pelo painel (aba Galeria)

**Arquivos:**
- Criar:
  - `app/api/galeria/foto/route.ts`, `app/api/galeria/baixar/route.ts`;
  - `components/painel/AbaGaleria.tsx`;
  - `lib/imagem/reduzir-no-navegador.ts`
- Alterar `components/painel/abas.ts` (acrescentar `{ id: 'galeria', rotulo: 'Galeria' }` depois de `noticias`) e `components/coord-shell.tsx`
- Testes: as rotas (`route.test.ts`), `components/painel/AbaGaleria.test.tsx` e `components/painel/abas.test.ts`

**Interfaces:**
- Consome: `prepararFotoGaleria`, `jogosRecentes(7)`, `rotuloJogo`.
- Produz:
  - `POST /api/galeria/foto` (multipart `album_id`, `arquivo`): `{ ok: true, foto: FotoGaleria }` / 401 / 403 / 400 / 500;
  - `GET /api/galeria/baixar?id=<foto>`: faz streaming da foto grande com `Content-Disposition: attachment; filename="arena-vale-<id>.jpg"`, e responde 404 se a foto ou o álbum estiver escondido;
  - `reduzirNoNavegador(arquivo: File, lado = 2400, qualidade = 0.9): Promise<Blob>`.
- [ ] **Passo 1: testes que falham.**
  - Rota da foto:
    - sem login → 401;
    - role `capitao` → 403;
    - sem arquivo → 400;
    - coordenador com JPEG → 200;
    - `upload` é chamado com `<album>/<uuid>.jpg` e `-m.jpg`;
    - o insert recebe `enviado_por`;
    - se o álbum não tem `capa_url`, ele é atualizado com a URL da foto.
  - `AbaGaleria`, com o Supabase falso:
    - "Novo álbum" lista os jogos recentes e a opção "Evento";
    - "Evento" sem nome mostra "Escreva o nome do evento";
    - ao enviar 3 arquivos com o fetch falso (o 2º falha), aparece "3 de 3" e "1 foto não foi enviada", com o botão "Tentar de novo";
    - "Esconder" faz update de `ativo=false`;
    - "Apagar" na foto apaga a linha e os dois arquivos do storage;
    - "Usar como capa" faz update de `capa_url`.
  - `abas.test`: a ordem das abas inclui `galeria` depois de `noticias`.
- [ ] **Passo 2:** rodar → FALHA.
- [ ] **Passo 3: implementar.**
  - A rota da foto usa `createClient` para o login e o cargo (igual a `app/api/instagram/story/route.ts`) e `createAdminClient` para o storage e o insert. `maxDuration = 60`.
  - `reduzirNoNavegador` usa `createImageBitmap` com `imageOrientation: 'from-image'`, depois canvas e `toBlob('image/jpeg')`.
  - O envio é feito um arquivo por vez.
  - Os botões usam as classes `btn-forte` e `btn-leve`.
- [ ] **Passo 4:** testes, tsc, eslint e build. Commit `feat(painel): aba Galeria com envio de fotos`.

### Tarefa 9: Páginas públicas, home, menu e "Ver fotos" (publicação 3)

**Arquivos:**
- Criar:
  - `app/galeria/page.tsx`, `app/galeria/[id]/page.tsx`;
  - `components/galeria/GradeAlbuns.tsx`, `components/galeria/Visualizador.tsx` (client);
  - `components/home/FotosDosJogos.tsx`
- Alterar:
  - `lib/midia/menu.ts` (acrescentar `{ rotulo: 'Galeria', href: '/galeria' }` no fim);
  - `components/SiteHeader.test.tsx` e os testes de menu;
  - `app/page.tsx` (fileira depois de UltimosVideos e `albuns` no HojeNaArena);
  - `app/agenda/page.tsx` (`albuns`);
  - `app/sitemap.ts`;
  - `app/midia.css`
- Testes: `components/galeria/galeria.test.tsx`

**Interfaces:**
- Consome: `buscarAlbuns`, `buscarAlbum`, `albunsDosJogos`.
- Produz: `Visualizador({ fotos, inicial, aoFechar })`.
- [ ] **Passo 1: testes que falham.**
  - `GradeAlbuns` mostra título, data no formato "15/11/2026" e "12 fotos". Com 1 foto, o texto fica "1 foto".
  - Página do álbum: com `buscarAlbum` mockado devolvendo `null`, chama `notFound`.
  - `Visualizador`:
    - abre na foto inicial e mostra "3 / 5";
    - a seta → avança e a seta ← volta (nas pontas não passa do limite);
    - Esc chama `aoFechar`;
    - o link "Baixar" aponta para `/api/galeria/baixar?id=<foto>`.
  - `FotosDosJogos` com lista vazia não renderiza nada.
  - O menu tem 9 itens e o último é "Galeria".
- [ ] **Passo 2:** rodar → FALHA.
- [ ] **Passo 3: implementar.**
  - `revalidate = 60` e `dynamicParams = true`.
  - O deslizar no Visualizador usa `pointerdown` e `pointerup` com limiar de 50px.
  - O sitemap acrescenta `/galeria` e os álbuns, com `seguro`.
- [ ] **Passo 4:**
  - testes, tsc, eslint e build;
  - capturas de tela de celular de `/galeria` e de um álbum com o visualizador aberto, usando um álbum criado no banco de TESTES;
  - para o build local apontar para o banco de testes, usar `.env.test.local` só na captura e voltar depois. Se for complicado, conferir na produção depois de publicar.
- [ ] **Passo 5:**
  - commit `feat(galeria): páginas públicas, home e menu`;
  - publicar;
  - pedir ao dono para criar um álbum de teste pelo painel com 3 fotos e conferir `/galeria` na produção.

### Tarefa 10: Galeria pelo robô do Telegram (`/fotos`)

**Arquivos:**
- Criar `lib/telegram/galeria.ts`
- Alterar:
  - `lib/telegram/processar.ts` (encaminhar para o modo galeria antes da notícia);
  - `lib/telegram/extrair.ts` (os tipos `TgCallbackQuery` e `TgMessage.document`);
  - `lib/telegram/portas.ts`;
  - `app/api/telegram/route.ts`
- Criar `scripts/telegram/configurar.mjs`, que roda `setMyCommands` e `setWebhook` lendo o `.env.local` e sem imprimir segredos.
- Teste: `lib/telegram/galeria.test.ts`

**Interfaces:**
- Consome: `jogosRecentes(3)`, `rotuloJogo`, `prepararFotoGaleria`, `PortasBot`.
- Produz:
  - `PortasBot` ganha:
    - `lerEstado(telegramId: number): Promise<EstadoBot>`;
    - `gravarEstado(telegramId: number, e: EstadoBot): Promise<void>`;
    - `jogosRecentes(): Promise<ItemAgenda[]>`;
    - `albumDoJogo(origem: 'jogos'|'agenda', jogoRef: string, titulo: string, data: string, perfilId: string): Promise<{ id: string; titulo: string }>`, que cria o álbum ou devolve o existente;
    - `criarAlbumEvento(titulo: string, data: string, perfilId: string): Promise<{ id: string; titulo: string }>`;
    - `guardarFotoGaleria(albumId: string, bytes: Uint8Array, perfilId: string): Promise<void>`;
    - `enviarBotoes(chatId: number, texto: string, botoes: { texto: string; dados: string }[][]): Promise<void>`;
    - `responderBotao(callbackId: string): Promise<void>`;
    - `galeriaAtiva(): Promise<boolean>`, que dá `false` quando a tabela não existe.
  - `EstadoBot = { modo: 'noticias' | 'galeria' | 'nome_evento'; albumId: string | null; albumTitulo?: string | null; expiraEm: string | null; ultimoGrupo?: string | null }`. Estado vencido é tratado como `noticias`.
  - `tratarGaleria(update: unknown, perfil, p: PortasBot, origem: string, agora: Date): Promise<boolean>`: devolve `true` quando o update foi consumido pela galeria.

- [ ] **Passo 1: testes que falham** (portas falsas):
  - **`/fotos` de coordenador:** `enviarBotoes` com a pergunta "De qual jogo são as fotos?". Cada jogo vira uma linha `{texto: 'Real x Sede · 20/11', dados: 'g:a:<id>'}`, e a última linha tem "Outro evento" (`g:outro`) e "Cancelar" (`g:cancelar`).
  - **`/fotos` sem a galeria ativa:** responde "A galeria ainda não foi ativada".
  - **Callback `g:a:<id>`:**
    - chama `albumDoJogo`;
    - grava `{modo:'galeria', albumId, expiraEm: agora+30min}`;
    - envia "Pode mandar as fotos 📸 (envie /pronto quando terminar)";
    - chama `responderBotao`.
  - **`g:outro`:** grava `nome_evento` e envia "Qual o nome do evento?".
  - **Texto "Festival Sub-11" em `nome_evento`:** `criarAlbumEvento('Festival Sub-11', '<hoje>')` e passa ao modo galeria. Texto com 2 caracteres → "O nome precisa ter pelo menos 3 letras".
  - **`g:cancelar`:** grava `noticias` e envia "Ok, cancelado.".
  - **Foto no modo galeria:**
    - `guardarFotoGaleria` é chamada e `inserirRascunho` não;
    - o prazo é renovado;
    - envia "✅ Foto guardada no álbum <título>".
  - **3 fotos com o mesmo `media_group_id`:** as 3 são guardadas e vai uma resposta só (a confirmação sai só na foto em que `media_group_id` é novo para o estado, registrado em `EstadoBot.ultimoGrupo`).
  - **Documento `image/jpeg` no modo galeria:** é guardado.
  - **Vídeo no modo galeria:** "Na galeria só vão fotos. Para notícia, envie /pronto antes".
  - **`/pronto`:** grava `noticias` e envia "Álbum pronto: <origem>/galeria/<id>".
  - **Estado vencido + foto:** devolve `false`, e o fluxo de notícia segue.
  - **Perfil não coordenador com `/fotos`:** a mesma resposta de hoje ("Você não tem permissão…").
  - **Falha em `guardarFotoGaleria`:** "Não consegui guardar uma foto, tente de novo".
- [ ] **Passo 2:** rodar → FALHA.
- [ ] **Passo 3: implementar.**
  - Em `processarUpdate`:
    - se o update tem `callback_query`, tratar por `from.id` / `message.chat.id`;
    - depois do perfil coordenador, chamar `tratarGaleria`; se ela devolver `true`, retornar.
  - O `callback_data` cabe em 64 bytes (uuid tem 36).
  - `EstadoBot.ultimoGrupo` usa a coluna `ultimo_grupo`, criada na 0019 (tarefa 6).
  - Nas portas, `guardarFotoGaleria` usa `prepararFotoGaleria` e o bucket `galeria`, e atualiza `capa_url` se estiver nula.
- [ ] **Passo 4:** os testes passam. Testes, tsc, eslint e build.
- [ ] **Passo 5:**
  - commit `feat(robô): galeria pelo Telegram com /fotos`;
  - publicar;
  - rodar `node scripts/telegram/configurar.mjs`:
    - `setMyCommands` com `fotos` ("Enviar fotos para a galeria") e `pronto` ("Terminar o envio de fotos");
    - `setWebhook` com `allowed_updates=["message","callback_query"]`, a mesma url e o mesmo segredo;
  - conferir `getWebhookInfo`: `allowed_updates` contém `callback_query` e não há `last_error_message`;
  - pedir ao dono um teste real.

### Tarefa 11: Modo parceiro (publicação 4)

**Arquivos:**
- Criar `lib/imagem/parceiro.ts` e `lib/telegram/parceiro.ts`
- Alterar `lib/telegram/processar.ts` e `lib/telegram/portas.ts`
- Testes: `lib/telegram/parceiro.test.ts`, `lib/imagem/parceiro.test.ts` e `lib/telegram/processar.test.ts`

**Interfaces:**
- Produz:
  - `extrairParceiro(texto: string): { perfil: string; texto: string } | null`;
  - `montarParceiro(bytes: Uint8Array, perfil: string): Promise<Uint8Array>` (JPEG);
  - a porta `PortasBot.montarParceiro(arq: Arquivo, perfil: string): Promise<Arquivo>`.
- [ ] **Passo 1: testes que falham.**
  - `extrairParceiro`:
    - `'Recorde! parceiro @egidiobeckhausersc\ntexto'` → `{ perfil: 'egidiobeckhausersc', texto: 'Recorde!\ntexto' }`;
    - aceita "Parceiro" com maiúscula;
    - `'parceiro @'` → `null`;
    - um perfil com 31 caracteres → `null`;
    - um texto sem a marcação → `null`.
  - `montarParceiro` com um JPEG de 1080x1080:
    - a largura continua 1080;
    - a altura fica igual a `1080 + round(1080 * 0.11)`;
    - o pixel do meio da faixa é escuro (r, g, b < 40).
  - `processarUpdate`, com foto e a legenda `"Recorde\nparceiro @egidio"`:
    - `montarParceiro` é chamado em vez de `carimbar`;
    - o rascunho tem `aba: 'arena'` e `fonte: '@egidio'`;
    - o título não contém "parceiro";
    - a resposta contém "parceiro @egidio".
  - Vídeo com parceiro: a capa passa por `montarParceiro` e o vídeo não é alterado.
- [ ] **Passo 2:** rodar → FALHA.
- [ ] **Passo 3: implementar.**
  - A faixa é um SVG com `width = largura` e `altura = round(largura * 0.11)`:
    - fundo `#0b0b0c` e uma linha vermelha `#e50914` de `round(altura * 0.05)` px no topo;
    - "Foto e arte: @perfil" em negrito, em `round(altura * 0.28)` px, branco;
    - "Publicado com autorização · ARENA VALE" em `round(altura * 0.21)` px, `#a1a1aa`;
    - margem esquerda de `round(largura * 0.037)`;
    - o `@perfil` é escapado para XML.
  - A imagem passa primeiro por `carimbarLogo` e depois a faixa é composta embaixo.
  - Em `processar.ts`, extrair o parceiro do texto antes de `extrairRascunho` e usar `fonte: '@'+perfil`, ignorando `GUARDAR_FONTE` nesse caso.
- [ ] **Passo 4:** testes, tsc, eslint e build.
- [ ] **Passo 5:**
  - commit `feat(robô): modo parceiro com crédito`;
  - publicar;
  - atualizar o README (robô: `/fotos`, `/pronto` e `parceiro @perfil`) e a memória do projeto;
  - atualizar a CFG quando o dono pedir.
