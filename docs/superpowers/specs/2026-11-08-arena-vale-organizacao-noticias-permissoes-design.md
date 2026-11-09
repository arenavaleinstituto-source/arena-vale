# Arena Vale — Organização, Notícias estilo Netflix e Permissões

**Data:** 2026-11-08
**Projeto:** `arena-vale` (Next.js + Supabase, publicado em https://arena-vale.vercel.app)
**Repositório:** `arenavaleinstituto-source/arena-vale`

## 1. Objetivo

Deixar o site da Arena Vale organizado, seguro e funcionando com dados reais, e adicionar:

- uma página de notícias com visual de catálogo (estilo Netflix), com duas abas — **Arena Vale** e **Notícias Esportivas**;
- um bot de Telegram para transformar mensagens encaminhadas em rascunhos de notícia;
- um sistema de cargos que corresponde à forma como a Arena Vale é administrada.

**Fora do escopo:** redesenho visual geral do site, novas funcionalidades além das listadas, o app de celular das patotas (projeto separado) e a reconstrução em Vite (`app-arenavale`, fica para depois).

### Contexto e restrições

- O Supabase do `.env.local` é de **desenvolvimento** (vazio ou com dados de teste). As migrações e o seed podem ser aplicados sem backup.
- Só o proprietário usa o repositório no GitHub.
- O deploy é feito pela Vercel a partir do GitHub.
- O site está no ar, mas sem dados reais. Agenda e Atletas Destaque aparecem vazios.

## 2. Estado atual (levantado em 2026-11-08)

- A `main` do GitHub (`ddfc98e`) está 6 commits à frente da cópia local (`8203f97`).
- A `main` do GitHub **não compila**: `app/page.tsx` importa `@/components/auth/OwnerLoginModal`, que não existe.
- Versões divergentes:
  - GitHub: Next 16.4.3 + React 19.
  - Cópia local e patch: Next 14.2.15 + React 18. A 14.2.15 tem falha conhecida de bypass de middleware.
- O patch `arena-vale-padrao-editorial-e-correcoes (2).patch` (56 arquivos, "44 falhas corrigidas"):
  - foi gerado sobre o commit `61d040c`, onde aplica limpo;
  - na `main` atual conflita só em `app/page.tsx` e `package.json`.
- O `middleware.ts.bak` é idêntico ao `middleware.ts` original; só as quebras de linha mudaram.
- Lixo:
  - `Untitled-1.txt` (comando de instalação da MiniMax);
  - `src/data` (arquivo vazio);
  - `tailwind.config.js` duplicado do `.ts`;
  - `.env.local` e `.next/` não estão no `.gitignore`;
  - pasta aninhada `supabase/migrations/supabase/migrations/`;
  - componentes de ferramentas de auditoria/patch de outra IA: `PatchKit`, `PatchDownload`, `SyncControlRoom`, `InteractiveMindMap`, `NodeInspectorPanel`, `RoutesAuditTable`, `NoVercelGuide`, `DomainActivation`, `RebuiltArenaSite`, `auditData.ts`, `patchFiles.ts`, `patchKit.ts`, `syncData.ts`, `domainData.ts`.
- Falhas de segurança **não cobertas pelo patch**:
  1. A policy `profiles_update_self` deixa qualquer usuário alterar o próprio `role`. Qualquer conta nova pode virar coordenador.
  2. O middleware (mesmo com o patch) só verifica se há sessão, não qual é o cargo. Qualquer conta logada acessa `/proprietario`.
  3. A trigger `guard_single_coordenador` limita a 1 coordenador. O modelo desejado tem 2.
  4. O cargo `proprietario` não existe no banco.

## 3. Parte 1 — Organização

### 3.1 Branch e base

- Criar a branch `organizacao` a partir de `origin/main` (`ddfc98e`).
- A `main` e a cópia local atual não são alteradas até a aprovação final.
- Fluxo de integração:
  1. A branch vai para o GitHub.
  2. A Vercel gera o preview dela.
  3. O proprietário revisa o preview.
  4. Merge na `main`.

### 3.2 Aplicar o patch

- Aplicar o patch com `git apply -3` sobre a branch.
- Conflitos:
  - `app/page.tsx`: manter as mudanças do patch **e** as de 31/10, ou seja, o header ajustado e o logo como botão que abre o `OwnerLoginModal`.
  - `package.json`: seguir as versões da seção 3.3. Os scripts ficam `dev`/`build`/`start`/`lint` do Next. Mantêm-se as dependências que o código realmente importa.

### 3.3 Versões

- **Next 16 + React 19** (linha atual, com suporte).
- O código do patch, escrito para Next 14, é adaptado:
  - `cookies()`, `headers()`, `params` e `searchParams` passam a ser assíncronos. Usar os codemods oficiais (`npx @next/codemod`) e revisar à mão.
  - `middleware.ts` vira `proxy.ts`, conforme a convenção do Next 16.
- Tailwind 3 com um único `tailwind.config.ts`, como está no patch.
- `@supabase/ssr` e `@supabase/supabase-js` nas versões estáveis atuais.

### 3.4 `OwnerLoginModal`

- **Acesso escondido:** a área do proprietário não aparece em nenhum menu, link, sitemap ou texto do site. A única entrada é **tocar 3 vezes seguidas no logo, no canto superior esquerdo**, em todas as páginas que têm o header.
  - **3 toques** (ou cliques), com menos de 500 ms entre um e outro, abrem o `OwnerLoginModal`.
  - **1 ou 2 toques:** o logo funciona como um logo comum e leva ao início (`/`). Na home, rola até o topo. Para isso o logo espera 500 ms após o último toque antes de navegar, um atraso que o visitante quase não percebe.
  - O `title` e o `aria-label` "Acesso reservado do Proprietário" do commit de 31/10 são trocados por "Arena Vale — início".
  - Funciona com mouse e com toque, e não dispara zoom por duplo toque no celular (`touch-action: manipulation`).
- Criar `components/auth/OwnerLoginModal.tsx`:
  - modal com e-mail e senha;
  - visual neutro, com título "Acesso restrito" e sem a palavra "proprietário";
  - login real via Supabase Auth (`signInWithPassword`);
  - em caso de sucesso, redireciona para `/proprietario`. Se a conta não for a do proprietário, a rota responde como inexistente (seção 5.5). Se o proprietário já estiver logado, os 3 toques levam direto a `/proprietario`, sem pedir a senha de novo;
  - erro de credencial mostra mensagem genérica ("E-mail ou senha inválidos").
- O modal é só um atalho. A proteção real fica no proxy, nos Server Components e no RLS (Parte 3).
- **Conteúdo da área `/proprietario`:**
  - gestão da equipe de coordenação: convidar, remover e ver os coordenadores;
  - **limite de coordenadores ajustável:** o padrão é 3 (o proprietário + 2).
    - O proprietário pode **aumentar ou diminuir** o limite. O mínimo é 1, que é só ele.
    - Se o novo limite for menor que o número atual de coordenadores, a mesma tela pede para escolher quem deixa de ser coordenador. Essas pessoas voltam a ser usuário comum e só então o limite é gravado. Nada muda até ele confirmar;
  - o restante do que o proprietário faz é pelo painel comum de coordenador.

### 3.5 Limpeza

- **Nunca removidos:**
  - páginas públicas existentes: home, agenda, campeonatos, notícias, atletas destaque, súmula, TV, inscrição, patrocínio, **projeto social**, links, termos e privacidade;
  - os componentes usados por elas (ex.: `ProjetoSocialFocus`, `AgendaJogos`).
- Remover os itens de lixo listados na seção 2. Antes de remover cada componente, verificar com busca se alguma página pública ou painel o importa. O que estiver em uso fica e é registrado no relatório final.
- Mover a migration da pasta aninhada para `supabase/migrations/` (ou remover, se for duplicata exata).
- Adicionar `.env.local`, `.env*.local`, `.next/` e `node_modules/` ao `.gitignore`.
- Reescrever o `README.md` com o estado real do projeto:
  - stack;
  - setup local;
  - variáveis de ambiente;
  - migrações;
  - seed;
  - cargos;
  - bot do Telegram.

### 3.6 Banco de desenvolvimento

- Aplicar as migrações `0001` a `0007`, mais as novas desta spec, no Supabase de desenvolvimento.
- Rodar o seed.
- O proprietário coloca a `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` por conta própria. A chave nunca é colada no chat nem commitada.
- O seed cria contas de teste, uma por cargo, para os testes da seção 6.

### 3.7 Vercel

Conferir se estas variáveis estão configuradas no projeto (Preview e Production):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, só no servidor
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `CRON_SECRET`, que protege a rotina diária de validade dos vídeos (seção 4.5)

## 4. Parte 2 — Notícias

### 4.1 Página `/noticias`

- **Visual arredondado:** cantos generosos em todo o catálogo, para um visual mais moderno:
  - cartazes com 14 px;
  - banner com 22 px;
  - abas e botões em formato pílula;
  - os mesmos raios valem para o painel lateral da equipe (5.4) e para o modal do logo.
- **Abas no topo:** **Arena Vale** (padrão) e **Notícias Esportivas**. A aba ativa fica na URL (`?aba=esportivas`), o que permite compartilhar o link.
- **Cada notícia é tratada como um "filme" do catálogo.** Ela pode ser um **vídeo** (ex.: gols de jogos do mundo todo) ou uma **foto**, quase sempre vinda do bot do Telegram (seção 4.4).
- **Banner de destaque:**
  - a notícia publicada mais recente marcada como `destaque` na aba;
  - ocupa a largura total, com gradiente escuro, título, resumo e botão "▶ Assistir" (vídeo) ou "Ver" (foto);
  - se o vídeo ainda tiver arquivo guardado (seção 4.5), ele toca **mudo e em loop** no fundo, como o trailer da Netflix, com o cartaz como imagem de espera. Em conexões lentas, com "economia de dados" ou com `prefers-reduced-motion`, aparece só o cartaz;
  - sem arquivo (foto, vídeo vencido ou modo "só link"), o fundo é o cartaz com um zoom lento (efeito Ken Burns), também desligado com `prefers-reduced-motion`.
- **Fileiras horizontais de cartazes, em ordem:**

  | Fileira | Regra | Aba Arena Vale | Aba Esportivas |
  |---|---|---|---|
  | Destaques | `destaque = true` | ✅ | ✅ |
  | Mais recentes | todas, por `publicado_em` desc | ✅ | ✅ |
  | Campeonatos | `categoria = 'campeonatos'` | ✅ | ✅ |
  | Bastidores | `categoria = 'bastidores'` | ✅ | ✅ |
  | Projeto Social | `categoria = 'projeto_social'` | ✅ | — |

- **Comportamento das fileiras:**
  - uma fileira sem notícias não é exibida;
  - cada fileira mostra até 20 cards.
- **Cartazes** (referência: fileira "Originais Netflix"):
  - formato **em pé, proporção 2:3**, como capa de filme;
  - **título grande sobre a parte de baixo da imagem**, em fonte condensada e pesada, com sombra para ler sobre qualquer foto;
  - **selo no canto superior esquerdo:** marca "AV" vermelha + "VÍDEO" ou "FOTO", no lugar do "N SÉRIE" da Netflix;
  - **selo no canto superior direito:** "NOVO" (vermelho) nas primeiras 48 h após publicar;
  - vídeos mostram um ícone ▶ discreto;
  - no desktop, ao passar o mouse, o cartaz amplia levemente e mostra o resumo. Se o vídeo tiver arquivo guardado, começa uma **prévia muda**, que só é baixada nesse momento (`preload="none"`);
  - no celular, a fileira rola com o dedo (scroll-snap), mostrando cerca de 3,5 cartazes por tela;
  - no desktop, setas laterais;
  - acessível por teclado: os cartazes são links focáveis e as setas são botões com `aria-label`.
- **Abrir:** clicar abre `/noticias/[id]` (rota do patch, adaptada):
  - vídeo, com título, texto e fonte abaixo. O que aparece no lugar do vídeo segue a ordem da seção 4.5:
    1. player próprio, com controles e som, se o arquivo estiver guardado;
    2. senão, o player do YouTube embutido;
    3. senão, o cartaz grande com "▶ Assistir no <serviço>";
  - foto: imagem grande, mais título, texto e fonte;
  - embaixo, a fileira "Mais da mesma categoria".
- **Home:** a seção de notícias da home passa a mostrar uma fileira "Mais recentes" da aba Arena Vale, com link "Ver todas".
- **Página Projeto Social (`/projetosocial`) — mantida:**
  - a página atual continua, com o texto de apresentação, o componente `ProjetoSocialFocus` e o link no menu do site;
  - ela ganha a fileira **"Resultados dos projetos"**, no mesmo estilo de cartazes, com as notícias publicadas em `categoria = 'projeto_social'`, da mais recente para a mais antiga;
  - os resultados são publicados como qualquer notícia (painel ou bot do Telegram), escolhendo a categoria "Projeto Social";
  - sem resultados publicados, a fileira não aparece e a página fica como hoje.
- **Sem cartaz:** usa a imagem padrão da Arena Vale (`/og-banner.jpg`). Esse caso só acontece com notícias antigas, porque publicar exige cartaz (seção 4.3).
- **Renderização:** Server Component lendo do Supabase, com revalidação a cada 60 s.

### 4.2 Banco: tabela `noticias`

Nova migration `0009`, que altera a tabela `noticias` do patch:

| Coluna | Tipo | Regra |
|---|---|---|
| `aba` | `text` | `'arena'` ou `'esportivas'`, padrão `'arena'` |
| `categoria` | `text` | `'geral'`, `'campeonatos'`, `'bastidores'` ou `'projeto_social'`, padrão `'geral'`. Valores antigos ("Comunicado Oficial" etc.) migram para `'geral'`. |
| `destaque` | `boolean` | padrão `false` |
| `tipo_midia` | `text` | `'foto'` ou `'video'`, padrão `'foto'` |
| `video_url` | `text` | opcional, endereço do arquivo de vídeo guardado no bucket `noticias`. Fica vazio depois que o vídeo vence (seção 4.5) |
| `video_expira_em` | `timestamptz` | opcional, data em que o arquivo será apagado (`publicado_em` + dias de validade) |
| `video_link` | `text` | opcional, link do vídeo original (`https://`) |
| `video_servico` | `text` | `'youtube'`, `'instagram'`, `'x'`, `'tiktok'`, `'facebook'`, `'telegram'` ou `'outro'`, calculado a partir do link ao salvar |
| `status` | `text` | `'rascunho'` ou `'publicado'`, padrão `'rascunho'`. Notícias já existentes com `ativo = true` migram para `'publicado'`. |
| `publicado_em` | `timestamptz` | preenchido ao publicar |
| `fonte` | `text` | opcional (ex.: nome do canal de origem) |
| `origem` | `text` | `'manual'` ou `'telegram'` |
| `telegram_message_ref` | `text` | opcional, `chat_id:message_id`, único. Evita rascunho duplicado se o Telegram reenviar. |

A coluna `imagem_url`, que já existe no patch, passa a ser **o cartaz**: a foto, ou a capa do vídeo.

**RLS:**
- público lê só `status = 'publicado'`;
- proprietário e coordenadores leem e escrevem tudo.

**Storage:** bucket público `noticias` para fotos, cartazes e vídeos, com escrita só para coordenadores (o que inclui o proprietário).
- Cada imagem é reduzida para no máximo 1200 px no lado maior, em JPEG ou WebP.
- Limites por arquivo:
  - imagens: 5 MB;
  - vídeos: 20 MB, que é também o limite do Telegram para bots.

### 4.3 Painel `/painel/noticias`

- Lista com filtros: aba, categoria, status e "Rascunhos do Telegram" (`origem = 'telegram'` e `status = 'rascunho'`).
- **Aprovação por uma pessoa só:** qualquer coordenador (incluindo o proprietário) edita e publica sozinho. Não há segunda confirmação.
- **Editor:**
  - pré-visualização do cartaz exatamente como vai aparecer na fileira (2:3, com título e selos);
  - tipo: foto ou vídeo;
  - cartaz: upload ou troca da imagem. Para vídeo, começa com a miniatura que o Telegram envia;
  - **capa do vídeo:** quando o arquivo está guardado, o editor pode escolher um quadro do próprio vídeo arrastando uma barra. A captura é feita no navegador, num `canvas`;
  - **arquivo de vídeo:** upload ou troca (até 20 MB) e o botão "Remover vídeo";
  - **link do vídeo original** (opcional): já vem preenchido quando o bot encontra um link. Ao colar um link do YouTube sem haver cartaz, o editor oferece "Usar a imagem do YouTube" (`img.youtube.com/vi/<id>/maxresdefault.jpg`, salva como cartaz);
  - ajuste do enquadramento do cartaz (arrastar a imagem para centralizar o jogador no recorte 2:3);
  - título;
  - texto;
  - aba;
  - categoria;
  - destaque;
  - fonte;
  - botões **Salvar rascunho** e **Publicar**.
- Publicar exige título e cartaz e, se for vídeo, o arquivo **ou** um link válido. Faltando algo, a publicação é bloqueada com uma mensagem que diz o que falta.

### 4.4 Bot do Telegram

**Fluxo:**
1. Proprietário ou coordenador vê uma notícia no grupo e **encaminha** a mensagem para o bot da Arena Vale.
2. O Telegram chama `POST /api/telegram`.
3. A rota valida o cabeçalho `X-Telegram-Bot-Api-Secret-Token` contra `TELEGRAM_WEBHOOK_SECRET`. Se for inválido, responde 401 e não faz nada.
4. A rota identifica quem encaminhou (`from.id`) e procura um perfil com esse `telegram_user_id` e cargo `coordenador` (o proprietário também é coordenador). Se não houver, a mensagem é ignorada e o bot responde "Você não tem permissão para criar notícias."
5. A rota extrai:
   - o texto (`text` ou `caption`);
   - a mídia:
     - **foto:** a maior resolução, baixada via `getFile` e enviada ao bucket `noticias`. Ela vira o cartaz;
     - **vídeo** (`video`, `animation` ou `document` com tipo de vídeo): o `tipo_midia` fica `'video'`.
       - A miniatura do Telegram (`thumbnail`) vira o cartaz provisório.
       - Com o modo de vídeo **"guardar arquivo"** e o vídeo com até 20 MB, o arquivo é baixado e enviado ao bucket `noticias`.
       - O `video_link` é preenchido quando possível (seção 4.5);
     - **só texto com link de vídeo** (ex.: um link do YouTube): também vira rascunho de vídeo, com o link já preenchido;
   - a fonte (`forward_origin`: nome do chat ou do usuário de origem).
6. Cria a notícia com `status = 'rascunho'` e `origem = 'telegram'`:
   - título provisório: a primeira linha do texto, até 120 caracteres;
   - texto: o restante.
7. O bot responde "Rascunho criado ✅" com o link para o editor no painel.

**Vinculação da conta Telegram:**
1. No painel, o usuário clica em "Vincular Telegram".
2. O site gera um código de 6 dígitos válido por 10 minutos.
3. O usuário envia `/vincular 123456` para o bot.
4. O site grava `telegram_user_id` no perfil.
5. Para desvincular, há um botão no painel.

**Regras:**
- **Álbuns** (várias fotos encaminhadas juntas): a primeira foto vira a capa e as demais são ignoradas. As mensagens do mesmo `media_group_id` não geram rascunhos extras.
- **Duplicatas:** `telegram_message_ref` único impede dois rascunhos para a mesma mensagem.
- **Vídeo acima de 20 MB** (a API de bots do Telegram não permite baixar): o rascunho é criado sem o arquivo.
  - Com link: o bot responde "Rascunho criado ✅ — vídeo grande demais para guardar, vai tocar pelo link original."
  - Sem link: o bot responde "Rascunho criado ✅ — vídeo acima de 20 MB. Envie uma versão menor pelo painel ou cole o link."
- **Modo "só link" sem link público:** o rascunho é criado, e o bot responde "Rascunho criado ✅ — falta o link do vídeo. Cole no painel antes de publicar."
- **Erros:** falha ao baixar a mídia ainda cria o rascunho, sem mídia, e o bot avisa "Rascunho criado sem foto". Falha ao gravar no banco faz o bot responder "Não consegui criar o rascunho, tente de novo".
- **Segurança:** a rota usa a service role só no servidor e grava `created_by` com o perfil vinculado.
- **Direitos autorais:** o grupo é de terceiros. O rascunho nunca é publicado automaticamente, e o editor mostra o lembrete "Reescreva com suas palavras e cite a fonte".

**Configuração (feita uma vez pelo proprietário, com passo a passo no README):**
1. Criar o bot no @BotFather.
2. Colocar o token e o segredo nas variáveis da Vercel.
3. Registrar o webhook (`setWebhook`) com o segredo. O passo a passo inclui o comando pronto.

### 4.5 Vídeos: guardar por 30 dias, com o link como reserva (decisão do proprietário)

**Começamos guardando o arquivo no Supabase.** Se o espaço ou o custo apertar, o proprietário troca para o modo "só link" sem precisar mudar o código.

**Dois modos**, escolhidos pelo proprietário na área escondida (`/proprietario`). O valor fica na tabela `proprietario`, coluna `modo_video`:

| Modo | O que acontece |
|---|---|
| **guardar arquivo** (padrão) | O bot e o editor enviam o vídeo (até 20 MB) para o bucket `noticias`. O arquivo é apagado depois de **N dias** (padrão **30**, ajustável). O link original, quando existe, também é guardado como reserva. |
| **só link** | Nenhum arquivo de vídeo é enviado. A notícia de vídeo precisa de um link para ser publicada. Os arquivos já guardados continuam até vencer. |

**Validade automática:**
- uma rotina diária (Vercel Cron, `GET /api/cron/videos`, protegida pelo `CRON_SECRET`) apaga do bucket os vídeos com `video_expira_em` no passado e limpa o `video_url`;
- a notícia **continua no catálogo**, com o cartaz. Se tiver `video_link`, ela continua sendo vídeo e passa a tocar pelo link. Sem link, ela passa a aparecer com o selo "FOTO";
- a área do proprietário mostra o **espaço usado** pelo bucket e quantos vídeos vencem nos próximos 7 dias. Quando o uso passa de **80% de 1 GB** (o limite do plano grátis), aparece um aviso sugerindo reduzir os dias de validade ou trocar para "só link".

**Ordem de reprodução**, a mesma em todo o site:
1. arquivo guardado (`video_url`): player próprio;
2. link do YouTube: player embutido;
3. outro link: cartaz com "▶ Assistir no <serviço>", que abre numa nova aba;
4. nada disso: a notícia aparece como foto.

**De onde vem o link:**
1. **Link no texto da mensagem:** se o texto encaminhado tiver um link do YouTube, Instagram, X/Twitter, TikTok ou Facebook, o primeiro deles vira o `video_link`.
2. **Post de canal público do Telegram:** se a mensagem foi encaminhada de um canal público, ou seja, com `forward_origin` do tipo `channel` e `username`, o link vira `https://t.me/<username>/<message_id>`.
3. **Nenhum dos dois:** é o caso de mensagens de grupos privados, onde o vídeo não tem endereço público. No modo "guardar arquivo", isso não impede a publicação. No modo "só link", o editor mostra **"Cole o link do vídeo para publicar"**.

**Players:**
- **YouTube:** embutido via `youtube-nocookie.com`, que não grava cookies até o play.
- **Instagram, X, TikTok, Facebook e Telegram:** sem incorporação, que exige scripts de terceiros e quebra com frequência. O botão abre o original numa nova aba.

**Direitos autorais:** vídeos de gols de campeonatos (Brasileirão, Champions, ligas europeias) têm direitos de transmissão de terceiros. Os detentores costumam pedir a remoção, e guardar uma cópia tem risco maior do que linkar.
- A fonte fica visível na página do vídeo.
- O painel tem os botões "Remover vídeo" (apaga o arquivo na hora) e "Despublicar", para atender rapidamente a qualquer pedido.
- O modo "só link" também reduz esse risco.
- A decisão de publicar e o risco são do proprietário. Esta spec só registra o risco.

## 5. Parte 3 — Cargos e permissões

### 5.1 Modelo

| Cargo | Pode | Não pode |
|---|---|---|
| **Coordenador-proprietário** (1, aparece como "Coordenador") | Tudo o que um coordenador faz, **mais** adicionar e remover os outros coordenadores pela área escondida `/proprietario` | — |
| **Coordenador** (2 no início; o proprietário pode liberar mais) | Tudo no site: campeonatos, tabelas de jogos, convites de capitães e moderadores, vínculo moderador↔campeonato, notícias, atletas destaque, TV, patrocínio, financeiro, configurações | Adicionar, remover ou alterar coordenadores (inclusive o proprietário) |
| **Moderador** | Nos campeonatos ligados a ele: lançar **resultados** dos jogos (placar, placar do 1º tempo, status, eventos como gols e cartões) e preencher a súmula | Criar ou editar campeonatos, times, jogos (data, local, adversários), capitães e qualquer coisa fora dos seus campeonatos |
| **Capitão** | Nos campeonatos em que foi convidado: criar e editar **a própria equipe** (nome, escudo) e a **lista de jogadores inscritos** | Jogos, resultados, eventos, súmulas, outras equipes |
| **Usuário comum** | Ver o site e se inscrever pelo formulário público | Qualquer área administrativa |

**Decisões:**
- **O proprietário nunca aparece como proprietário.** No banco, o cargo dele é `coordenador`, igual aos outros. A equipe de coordenação começa com **3 pessoas** (o proprietário + 2), e o proprietário pode aumentar esse limite. Em todo lugar (painel, listas de coordenadores, notícias com autor, súmulas, e-mails de convite), ele aparece como "Coordenador". Nem os outros coordenadores conseguem saber quem é o proprietário.
- A **classificação é calculada automaticamente** a partir dos resultados (view `v_classificacao` do patch). Ninguém a edita à mão.
- Um moderador pode ter mais de um campeonato e um capitão pode estar em mais de um campeonato.
- Um capitão tem no máximo uma equipe por campeonato.

### 5.2 Banco

Nova migration `0008`:

- **Telegram no perfil:**
  - coluna `profiles.telegram_user_id bigint unique`, opcional;
  - tabela `telegram_codigos_vinculo (profile_id, codigo, expira_em)` para os códigos de 6 dígitos da seção 4.4;
  - a migration `0008` vem antes da `0009` porque o bot depende desses campos.
- **Cargos:**
  - **não** criar o valor `proprietario` no enum. O proprietário tem `role = 'coordenador'`;
  - a marca de proprietário fica numa tabela separada `proprietario (profile_id unique, limite_coordenadores int not null default 3, modo_video text not null default 'guardar_arquivo', dias_validade_video int not null default 30)`. As regras de vídeo são lidas pelo servidor com a service role, e o público nunca lê essa tabela, com no máximo 1 linha:
    - RLS: só o próprio proprietário consegue ler a linha dele. Ninguém escreve pelo site;
    - a linha é criada uma única vez pelo seed/SQL com a service role, usando o e-mail do proprietário;
    - como `profiles` é legível por todos, a marca **não** pode ficar em `profiles`, senão vazaria;
  - remover a trigger `guard_single_coordenador`;
  - criar uma trigger que limita o número de coordenadores a `proprietario.limite_coordenadores` (padrão 3: o proprietário + 2);
  - a função `definir_limite_coordenadores(n, remover uuid[])` só funciona para o proprietário e roda numa única transação:
    1. rebaixa os perfis em `remover`;
    2. grava `n`.
  - Ela recusa o pedido se `n < 1`, se `remover` incluir o próprio proprietário, ou se, depois das remoções, ainda houver mais coordenadores que `n`.
- **Funções auxiliares** (`security definer`):
  - `is_proprietario()`: existe linha em `proprietario` para `auth.uid()`;
  - `is_staff()`: `role = 'coordenador'`, o que inclui o proprietário;
  - `is_moderador_do_campeonato(campeonato_id)`;
  - `is_capitao_do_time(time_id)`.
- **Mudança de cargo:**
  - remover as policies `profiles_update_self` e `profiles_update_coord` e criar policies separadas por coluna.
  - o usuário edita o próprio nome e avatar, mas **não** o `role` nem o `telegram_user_id`. Uma trigger bloqueia mudanças nesses campos que não venham das funções abaixo.
  - a mudança de cargo acontece só por duas funções:
    - `definir_cargo(perfil, cargo)`: o proprietário pode promover alguém a `coordenador` ou rebaixar um coordenador. Os coordenadores só definem `moderador`, `capitao` ou `autenticado` e nunca alteram quem já é coordenador. Ninguém altera o cargo do proprietário;
    - `vincular_telegram(codigo)`.
- **Moderador ↔ campeonato:** nova tabela `campeonato_moderadores (profile_id, campeonato_id)`. Escrita só por staff.
- **Capitão ↔ campeonato:**
  - `time_capitaes` passa a ter `campeonato_id`;
  - o capitão pode inserir **um** time no campeonato em que foi convidado;
  - o capitão edita o próprio time e os jogadores dele.
- **Policies por tabela:** reescritas com as funções acima.
  - `campeonatos`, `times` (exceto o próprio time do capitão), `jogos` (insert/delete e campos de agenda), `transmissoes`, `patrocinadores`, `financeiro_movimentacoes`, `site_config`, `noticias`, `atletas_destaque`: escrita só por staff.
  - `jogos` (update de placar, status e 1º tempo), `eventos_jogo` e `sumulas`: staff ou moderador do campeonato do jogo. Uma trigger impede que um moderador altere data, local ou times do jogo.
  - `jogadores`: staff ou capitão do time.
  - As policies antigas do capitão em `jogos` e `eventos_jogo` (`jogos_update_capitao`, `eventos_write_capitao`) são removidas.
  - As policies antigas do moderador por time (`time_moderadores`) são substituídas por `campeonato_moderadores`. A tabela antiga fica sem uso e é removida depois que o código parar de referenciá-la.

### 5.3 Convites

- Staff convida moderadores e capitães por e-mail no painel, informando o campeonato.
- Rota de servidor `POST /api/convites`:
  1. Confere o cargo de quem chama.
  2. Usa `auth.admin.inviteUserByEmail` (service role).
  3. Define o cargo.
  4. Cria o vínculo com o campeonato.
- Se o e-mail já tem conta, só adiciona o cargo e o vínculo.
- O proprietário convida coordenadores pela área escondida `/proprietario`, usando o mesmo fluxo. A opção não existe no painel comum, e a rota recusa o pedido com 403 se quem chama não for o proprietário.

### 5.4 Entrada da equipe (coordenadores, moderadores e capitães)

Substitui o botão "Painel ▼" do canto superior direito, que hoje abre um menu com só "Acessar Portal →", e o componente `portal-menu.tsx`, que pede para a pessoa escolher o próprio cargo.

- **Botão "Entrar"** no canto superior direito do header, em todas as páginas: formato pílula, com ícone de pessoa. No celular, só o ícone.
- **Painel lateral:** ao clicar, um painel desliza da direita, com o fundo escurecido e desfocado. Ele fecha com Esc, com clique fora ou com o botão ✕. Conteúdo:
  - título **"Área da equipe"** e o subtítulo "Coordenadores, moderadores e capitães";
  - **e-mail + senha**, com botão "Mostrar senha";
  - **"Receber link de acesso por e-mail"** (login sem senha, via Supabase Magic Link). Ajuda capitães que esquecem a senha;
  - **"Esqueci minha senha"** (redefinição pelo Supabase);
  - link de suporte pelo WhatsApp da Arena Vale, como já existe hoje.
- **Sem escolher o cargo:** depois do login, o site lê o cargo no servidor e leva a pessoa direto ao painel dela:

  | Cargo | Vai para |
  |---|---|
  | coordenador (inclusive o proprietário) | `/coordenador` |
  | moderador | `/moderador` |
  | capitão | `/capitao` |
  | sem cargo | mensagem "Sua conta ainda não tem acesso à área da equipe. Fale com a coordenação." e a sessão é encerrada |

  Se o login veio de um redirecionamento (`?next=`), a pessoa vai para esse endereço, desde que o cargo permita.
- **Já logado:** o botão vira um **avatar redondo** com as iniciais e o cargo embaixo ("Coordenador", "Moderador" ou "Capitão", nunca "Proprietário"). O menu dele tem "Meu painel", "Vincular Telegram" (só coordenadores) e "Sair".
- **Primeiro acesso por convite:** o link do e-mail de convite abre a página **"Criar sua senha"**, já com o nome da pessoa e o cargo. Depois de criar a senha, a pessoa vai para o painel dela.
- **Página `/login`:** continua existindo com o mesmo formulário em tela cheia, para quem chega por redirecionamento ou link direto.
- **Erros:**
  - "E-mail ou senha inválidos" (sempre a mesma mensagem, sem dizer qual dos dois está errado);
  - "Link enviado — confira seu e-mail";
  - depois de 5 tentativas, o limite de tentativas do próprio Supabase Auth bloqueia por alguns minutos.
- **Acessibilidade:** o foco vai para o campo de e-mail ao abrir e volta ao botão ao fechar. O painel tem `role="dialog"` e `aria-modal`.
- **O proprietário pode entrar por aqui também:** ele cai no painel de coordenador, como qualquer coordenador. A área de gestão de coordenadores só é aberta pelo toque triplo no logo (seção 3.4), mesmo para ele já logado.

### 5.5 Proteção das rotas

**`proxy.ts`:** cobre `/painel`, `/proprietario`, `/coordenador`, `/moderador` e `/capitao`.
- Sem sessão: vai para `/login?next=<rota>`.
- Com sessão, mas cargo insuficiente: vai para `/acesso-negado`.
- **Exceção de `/proprietario`:** quem não for o proprietário (logado ou não) recebe a página **404 comum**, como se a rota não existisse. Não há redirecionamento para `/login` nem para `/acesso-negado`, para não revelar que a área existe. A rota fica fora do sitemap, do `robots.txt` e de qualquer menu.
- Cargo mínimo por rota:

  | Rota | Cargo mínimo |
  |---|---|
  | `/proprietario` | proprietário (`is_proprietario()`), senão 404 |
  | `/coordenador` e `/painel` | staff |
  | `/moderador` | moderador ou staff |
  | `/capitao` | capitão ou staff |

**Defesa em camadas:**
- cada página administrativa confere o cargo de novo no Server Component;
- o RLS é a barreira final, mesmo que o código da página falhe.

**Fonte do cargo:** sempre a tabela `profiles`, lida no servidor. Nunca cookie nem `localStorage`.

## 6. Testes e verificação

- **Build:** `npm run build` e `npm run lint` sem erros.
- **Permissões no banco:**
  - script de testes (Vitest + `supabase-js`) contra o Supabase de desenvolvimento;
  - um usuário de teste por cargo;
  - cada linha da tabela 5.1 vira pelo menos um teste de "pode" e um de "não pode". Exemplos:
    - coordenador tentando promover alguém a coordenador falha;
    - com o limite padrão, o 4º coordenador é recusado. Depois que o proprietário sobe o limite para 4, ele é aceito;
    - coordenador comum tentando mudar o limite falha;
    - baixar o limite para menos que o número atual de coordenadores, sem escolher quem sai, falha;
    - baixar de 3 para 2 escolhendo 1 coordenador para sair funciona, e essa pessoa perde o acesso ao painel;
    - coordenador comum lendo a tabela `proprietario` recebe lista vazia;
    - coordenador comum abrindo `/proprietario` recebe 404;
    - o perfil do proprietário, lido por qualquer pessoa, mostra `role = 'coordenador'`;
    - usuário comum tentando mudar o próprio `role` falha;
    - moderador mudando a data de um jogo falha;
    - moderador lançando o placar do jogo do seu campeonato funciona;
    - moderador lançando placar em outro campeonato falha;
    - capitão editando jogador de outro time falha.
- **Bot do Telegram:**
  - testes da rota `/api/telegram` com payloads de exemplo: segredo inválido, usuário não vinculado, texto sem foto, foto com legenda, vídeo até 20 MB (arquivo guardado), vídeo acima de 20 MB com e sem link, vídeo de canal público (gera link `t.me`), vídeo com link do YouTube no texto, vídeo de grupo privado no modo "só link", texto só com link, álbum, mensagem repetida e `/vincular`;
  - a API do Telegram e o Storage são simulados nesses testes.
- **Entrada da equipe:** testes do redirecionamento por cargo (coordenador, moderador, capitão e sem cargo), do `?next=` respeitando o cargo e do avatar nunca mostrando "Proprietário".
- **Validade dos vídeos:** teste da rotina diária.
  - Um vídeo vencido perde o arquivo e passa a tocar pelo link, se tiver.
  - Um vídeo vencido sem link vira foto.
  - Um vídeo dentro do prazo não é tocado.
  - Sem o `CRON_SECRET`, a rota responde 401.
- **Ordem de reprodução:** teste da função que escolhe o player (arquivo, YouTube, link externo ou foto).
- **Links de vídeo:** teste da função que reconhece o serviço e extrai o ID do YouTube (formatos `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`), e que recusa links que não são `https`.
- **Logo:** teste do componente:
  - 3 toques rápidos abrem o modal;
  - 1 toque navega para o início;
  - 3 toques lentos (mais de 500 ms entre eles) não abrem o modal.
- **Notícias:** teste da função que monta as fileiras: regras de cada fileira, fileira vazia escondida e Projeto Social só na aba Arena Vale.
- **Manual, no site local e depois no preview da Vercel:**
  - rotas públicas abrindo: home, agenda, campeonatos, notícias (duas abas), notícia individual, súmula, atletas destaque, TV;
  - login de cada cargo levando ao painel certo;
  - rotas protegidas redirecionando corretamente;
  - um encaminhamento real para o bot gerando rascunho;
  - publicação aparecendo na fileira certa.

## 7. Ordem de entrega

Cada fase termina com build passando e preview da Vercel revisado:

1. **Fase 1 — Organização:** branch, patch, Next 16, `OwnerLoginModal`, limpeza, banco de desenvolvimento, README.
2. **Fase 2 — Permissões:** migration `0008`, convites, nova entrada da equipe, proxy por cargo, testes de permissão. Vem antes das notícias porque o bot e o painel dependem dos cargos.
3. **Fase 3 — Notícias:** migration `0009`, página Netflix, painel, bot do Telegram.

O merge na `main` acontece quando o proprietário aprovar. Pode ser fase a fase ou tudo no final.
