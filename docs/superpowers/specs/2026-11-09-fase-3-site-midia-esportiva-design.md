# Fase 3 — Site no modelo de mídia esportiva — Design

**Data:** 2026-11-09
**Projeto:** `arena-vale` (branch `organizacao`)
**Base:**
- PDF "Arena Vale — Evolução estratégica da marca" (posicionamento, menu, home, editorias, paleta);
- prévia aprovada pelo dono em https://claude.ai/artifact/GdrfPrLmEULAeiMHpoorb6 (versão 7).

**Substitui:** a "Fase 3 — Notícias" do spec `2026-11-08-...-design.md`. As seções 4.1 a 4.5 desse spec continuam valendo onde não forem alteradas aqui (cartazes 2:3, bot do Telegram, vídeos guardados por 30 dias com o link como reserva).

## 1. Objetivo

Fazer o site abrir como **marca de mídia esportiva**, e não como plataforma de campeonatos:
- transmissão, notícias, agenda, vídeos e histórias em primeiro plano;
- o mesmo visual em todo o site e nos painéis da equipe;
- a marca é sempre **ARENA VALE**, nunca "Sports".

**Entrega:** tudo vai para o endereço oficial **de uma vez**, quando o dono aprovar no site de teste. A `main` só recebe o merge nesse momento.

## 2. Decisões do dono (09/11/2026)

1. **Escopo:** o site inteiro no modelo novo, com os painéis no mesmo visual (opção "c").
2. **Entrega:** tudo junto no endereço oficial (opção "2").
3. **Vídeos:**
   - o canal **TV Arena Vale** do YouTube (`@TVArenaVale`, id `UCBTQ97bWA6VqK2a6qv80dIg`) entra sozinho;
   - os vídeos do **Instagram** (`@arenavaleoficial`) são cadastrados pela coordenação no painel.
4. **Banner:**
   - "ARENA VALE" em tamanho grande, com "Mídia Esportiva" embaixo;
   - a frase "O PALCO DO" em branco, "**ESPORTE**" em vermelho e "É AQUI." em branco;
   - o subtítulo termina em "…histórias de quem vive o **esporte**.";
   - **sem botões** no banner;
   - **fundo:** a foto de capa do site antigo (`public/fundo-arena.jpg`), com uma camada escura para dar leitura.
5. **Ao Vivo:** o botão **"▶ Assista ao vivo"** fica na seção Ao Vivo, no lugar de "Canal no YouTube".
6. **Projeto Social:** item próprio no menu e página completa, com **todo o conteúdo da página antiga**.
7. **Esporte Mundial:** seção e aba próprias, alimentadas pelo bot do Telegram. A coordenação edita e publica.
8. **Entrar:**
   - o botão no canto superior direito abre o menu **Coordenação / Moderador / Capitão**, sem descrições;
   - cada opção abre o painel de login;
   - a área do proprietário segue escondida (3 toques no logo).
9. **Permissões:** moderador e capitão ficam restritos ao que é deles, como já está garantido pelas migrações 0009/0010.
10. **Visual:** títulos centralizados e em caixa alta; cantos arredondados.

## 3. Visual (tokens)

| Token | Valor | Uso |
|---|---|---|
| `--preto` | `#0b0b0c` | fundo |
| `--grafite` / `--grafite-2` | `#141417` / `#1d1d22` | faixas alternadas e cartões |
| `--linha` | `#2a2a30` | bordas |
| `--branco` | `#f4f4f5` | texto |
| `--cinza` | `#a1a1aa` | texto secundário |
| `--vermelho` | `#e50914` | marca e ações |
| `--amarelo` | `#facc15` | **só** "ao vivo", "transmissão" e "pendente" |

**Fontes:**
- **Saira** (títulos, largura expandida);
- **Barlow** (texto);
- **Barlow Condensed** (rótulos e menu).

**Formas:**
- raios de 14 a 28 px;
- botões em pílula;
- os títulos de seção são centralizados e em caixa alta;
- seções em faixas que alternam preto e grafite.

**Implementação:**
- os tokens viram variáveis CSS em `app/globals.css` e cores no `tailwind.config.ts` (`av-preto`, `av-vermelho` etc.);
- os componentes usam só esses tokens;
- as cores antigas (azul e dourado do `coord-shell`, `--primary` amarelo) saem.

## 4. Cabeçalho (todas as páginas públicas)

Evolução do `SiteHeader` atual (preso no topo, o mesmo em todas as páginas).

- **Esquerda:** o logo (`LogoSecreto`, que mantém os 3 toques).
- **Menu:**
  - Início `/`
  - Ao Vivo `/ao-vivo`, com ponto vermelho
  - **Notícias do Vale** `/noticias` (notícias da ARENA VALE e da região; aba "Notícias do Vale" na página de notícias)
  - Esporte Mundial `/noticias?aba=mundo` (nome no menu: **ESPORTE MUNDIAL** — notícias do esporte pelo mundo, garimpadas pelo bot)
  - Agenda `/agenda`
  - Modalidades `/modalidades`
  - Vídeos `/videos`
  - Projeto Social `/projetosocial`
  - Atletas Destaques `/atletas` (no lugar de "Sobre"; a página `/sobre` continua, com link no rodapé)
- **Direita:**
  - **Anuncie** (`/patrocinio`);
  - **Entrar**, que abre o menu "ÁREA DA EQUIPE" com Coordenação, Moderador e Capitão.
- **Cada opção do Entrar** abre o painel lateral de login (`FormEntrarEquipe`) com o rótulo "Área da equipe · <cargo>". O rótulo é só visual: **o destino depois do login vem do cargo no banco** (`destinoPorCargo`), e não da opção clicada.
- **No celular:** o menu vira uma faixa que rola para o lado, e "Entrar" vira só o ícone.
- **Logado:** continua o avatar com as iniciais e o cargo, nunca "Proprietário".

## 5. Página inicial — ordem e fonte de cada bloco

| # | Bloco | Conteúdo | Fonte |
|---|---|---|---|
| 1 | **Banner** | ARENA VALE, frase, subtítulo, foto de capa | `site_config.capa_url` (padrão `/fundo-arena.jpg`) |
| 2 | **Arena Vale Ao Vivo** | player quando o canal está ao vivo; fora do ar: "Próxima transmissão" com contagem regressiva + botão "▶ Assista ao vivo" | YouTube (seção 6) + agenda |
| 3 | **Agora na Arena** | cartazes 2:3 das notícias da ARENA VALE | `noticias` (`aba = 'arena'`, publicadas) |
| 4 | **Esporte Mundial** | cartazes com a fonte visível; abaixo, o caminho da notícia (Telegram → bot → rascunho → coordenação publica) | `noticias` (`aba = 'mundo'`, publicadas) |
| 5 | **Agenda da Arena** | próximos 6 jogos: modalidade, fase, times, data e hora, local, selo "Transmissão" | `agenda_jogos` + `jogos` futuros (seção 7) |
| 6 | **Últimos vídeos** | 8 mais recentes | YouTube RSS + vídeos do Instagram cadastrados |
| 7 | **Modalidades** | Futsal, Futebol 7, Basquete, Vôlei ("O palco do <modalidade> é aqui.") | fixas → `/modalidades/[slug]` |
| 8 | **Projeto Social** | título, texto, 4 números, 3 iniciativas, resultados, apoio (3 botões vermelhos: Apoiar, Cotas, Inscrever criança/atleta) | textos da página antiga + `noticias` (categoria `projeto_social`) |
| 9 | **Atletas Destaques** | cartazes dos atletas destaque (rodada, artilheiro, revelação) | `atletas_destaque` |
| 10 | ~~Números da Arena~~ | **saiu do site público**: as contagens (campeonatos, equipes, jogos, vídeos) ficam só no painel da coordenação, para conhecimento; talvez voltem ao público no futuro | contagens no banco + RSS |
| 11 | **Para marcas** | "Coloque sua marca no palco do esporte.", com as propriedades de mídia e o botão para o WhatsApp | fixo |
| 12 | **Rodapé** | logo + slogan, menu completo (com link "Sobre a ARENA VALE"), botões **WhatsApp** (wa.me/5547988444404), **Instagram** (@arenavaleoficial) e **YouTube** (@TVArenaVale), **CNPJ 40.694.741/0001-34**, © ARENA VALE · Mídia Esportiva, Privacidade e Termos | fixo (links editáveis em Configurações) |

- **Blocos sem conteúdo** (sem notícias publicadas, sem jogos futuros) mostram um estado vazio curto, por exemplo "Nenhum jogo agendado — volte em breve.". A página nunca quebra.
- **Renderização:** Server Components com `revalidate = 60`. O YouTube revalida a cada 30 min.

## 6. YouTube: vídeos e ao vivo

- **Vídeos:** `lib/midia/youtube.ts` lê `https://www.youtube.com/feeds/videos.xml?channel_id=UCBTQ97bWA6VqK2a6qv80dIg` no servidor, sem chave, e devolve `{ id, titulo, publicadoEm, capa }` (capa = `https://i.ytimg.com/vi/<id>/hqdefault.jpg`). Se o feed falhar, devolve a lista vazia e o bloco mostra "Veja no canal" com link.
- **Ao vivo:** `estaAoVivo()` consulta `https://www.youtube.com/channel/<id>/live` no servidor, com cache de 2 min.
  - Se a página indicar transmissão ao vivo (`"isLiveNow":true`), o player embutido é `https://www.youtube-nocookie.com/embed/live_stream?channel=<id>`.
  - Em qualquer erro, considera "fora do ar". É uma heurística: se o YouTube mudar o formato, o site cai no estado "fora do ar" sem quebrar.
  - **Reserva manual:** em Configurações, a coordenação pode marcar "Estamos ao vivo agora", com o link da live. Essa marcação tem prioridade sobre a detecção.
- **"▶ Assista ao vivo"** leva a `https://www.youtube.com/@TVArenaVale/live`, em nova aba.
- **IDs do canal** ficam em `site_config` (`youtube_channel_id`, `youtube_handle`), editáveis em Configurações. O padrão é o do canal TV Arena Vale.

## 7. Agenda

- **Fonte única** `lib/midia/agenda.ts`: junta `agenda_jogos` (a agenda de transmissões que já existe em produção) com os `jogos` futuros dos campeonatos (`status` agendado, com os times).
- **Duplicatas:** o mesmo jogo pode estar nas duas tabelas. Se tiver os mesmos dois times e o mesmo horário com até 1 h de diferença, prevalece o registro de `jogos`.
- **Selo "Transmissão":** aparece quando o jogo tem transmissão cadastrada (`transmissoes`) ou quando veio de `agenda_jogos`.
- **Correção de dado:** o local "Arena Vale Sports" passa a ser "Arena Vale" (`update` na migração da fase).

## 8. Modalidades

- **Campo novo:** `campeonatos` ganha `modalidade text` (`futsal`, `futebol7`, `basquete` ou `volei`), preenchido pela coordenação. Os campeonatos já existentes ficam nulos até alguém editar.
- **`/modalidades`:** os 4 cartões.
- **`/modalidades/[slug]`:**
  - banner da modalidade;
  - próximos jogos;
  - campeonatos daquela modalidade, com a classificação (`v_classificacao`);
  - notícias com a tag da modalidade.
- **Página antiga `/campeonatos`:** redireciona (308) para `/modalidades`. Campeonatos deixam de ser item do menu, como o PDF recomenda.

## 9. Demais páginas

| Página | Conteúdo |
|---|---|
| `/ao-vivo` | o player ou "fora do ar", a próxima transmissão e a agenda de transmissões. A página antiga `/tv` redireciona (308) para cá |
| `/noticias` | abas **Notícias do Vale** e **Esporte Mundial** (`?aba=mundo`), cartazes 2:3 e fileiras do spec anterior (4.1) |
| `/noticias/[id]` | leitura: vídeo (player próprio, YouTube embutido ou link externo) ou foto, mais o texto e a fonte |
| `/videos` | grade dos vídeos do YouTube + os do Instagram; filtro "Todos / YouTube / Instagram" |
| `/projetosocial` | toda a página antiga (título, texto, 4 números, 3 iniciativas, apoio pelo WhatsApp com mensagem pronta, cotas, CNPJ) + "Resultados dos projetos" + botão "Inscrever criança / atleta" (→ `/inscricao`) |
| `/sobre` | manifesto do PDF, essência, missão, pilares, contatos e redes (YouTube, Instagram, WhatsApp) |
| `/patrocinio` | "Anuncie": propriedades de mídia e contato. Mantém o conteúdo atual no visual novo |
| `/agenda`, `/atletasdestaques`, `/sumula`, `/inscricao`, `/login`, `/criar-senha`, `/privacidade`, `/termos`, `/links` | passam para o visual novo, com o mesmo conteúdo |

## 10. Esporte Mundial e o bot do Telegram

O bot segue a seção 4.4 do spec anterior. Mudanças:

- **Valores da aba:** passam a ser `'arena'` e `'mundo'`, no lugar de `'esportivas'`.
- **Rascunho vindo do Telegram:** entra com `aba = 'mundo'` por padrão.
- **Painel → Notícias:**
  - filtro **"Rascunhos do Telegram"** em destaque;
  - **um coordenador** edita e publica, sem segunda aprovação.
- **Vídeos:** modo "guardar arquivo" por 30 dias, com o link como reserva (spec anterior, 4.5).

**Ação do dono, guiada passo a passo:**
1. criar o bot no @BotFather;
2. colocar `TELEGRAM_BOT_TOKEN` e `TELEGRAM_WEBHOOK_SECRET` na Vercel;
3. vincular o próprio Telegram no painel, com `/vincular <código>`.

## 11. Vídeos do Instagram

- **Tabela nova `videos_externos`:** `id`, `plataforma ('instagram' | 'outro')`, `link`, `titulo`, `capa_url`, `publicado_em`, `ativo`, `created_by`.
- **Regras:** leitura pública só de `ativo`; escrita só pela coordenação (RLS, padrão da 0010).
- **Painel → Vídeos:** colar o link do post, título e capa (upload). "Publicar" exige link `https://` do Instagram, título e capa.
- **No site:** cartão com a capa e o selo "Instagram", que abre o post numa nova aba. Não há incorporação do Instagram.

## 12. Painéis da equipe no visual novo

- **Coordenação (`CoordShell`):** cabeçalho preto com o logo e "PAINEL DA COORDENAÇÃO", e as abas:
  - Visão geral
  - Ao Vivo
  - Notícias (com rascunhos do Telegram)
  - Vídeos (Instagram)
  - Agenda e jogos
  - Campeonatos (com modalidade)
  - Inscrições
  - Súmulas
  - Moderadores
  - Capitães
  - Patrocinadores
  - Atletas destaque
  - Configurações (capa do banner, canal do YouTube, "ao vivo agora", WhatsApp)
- **Moderador e capitão:** os mesmos componentes da Fase 2, com o visual novo. **Nenhuma permissão muda.**
- **Área do proprietário:** visual novo, mantendo "← Voltar ao site".
- **Botão "Ver o site":** está em todos os painéis.

## 13. Banco (migração `0011_midia_esportiva.sql`)

**Alterações:**
- `site_config`: + `capa_url`, `youtube_channel_id` (padrão `UCBTQ97bWA6VqK2a6qv80dIg`), `youtube_handle` (padrão `@TVArenaVale`), `instagram_url`, `ao_vivo_manual boolean`, `ao_vivo_link`;
- `campeonatos`: + `modalidade`;
- tabela `videos_externos` (seção 11);
- `noticias`: colunas da seção 4.2 do spec anterior, com `aba in ('arena','mundo')`;
- `profiles.telegram_user_id` e `telegram_codigos_vinculo` (adiados da Fase 2);
- correção de dado: "Arena Vale Sports" → "Arena Vale" em `agenda_jogos.local`.

**Regras de acesso:** escrita só pela coordenação, no mesmo padrão da 0010. A migração não apaga políticas existentes; só cria as das tabelas novas.

**Aplicação:**
- primeiro no banco de TESTES (`npm run test:db`);
- depois o dono roda a checagem e o arquivo de produção, como na Fase 2.

## 14. Testes

- **Unidade:**
  - parser do feed do YouTube: amostra real salva, feed vazio, XML inválido;
  - detector de "ao vivo": página com e sem `isLiveNow`, erro de rede;
  - junção da agenda: duplicata casada por time e horário, ordem por data, limite de 6;
  - menu "Entrar": as 3 opções abrem o login com o rótulo certo, e o destino vem do cargo;
  - validação do link do Instagram.
- **Banco:**
  - visitante lê só `videos_externos` ativos;
  - só a coordenação escreve;
  - `campeonatos.modalidade` aceita só os 4 valores;
  - a notícia vinda do Telegram nasce como rascunho na aba `mundo`.
- **Teste de fumaça:**
  - todas as páginas públicas respondem 200 no build, com o banco de TESTES e com o oficial;
  - no site de teste: login de cada cargo e abertura do painel certo.
- **Review Focus** (para o plano): feed do YouTube fora do ar; o canal ao vivo na hora em que a página é gerada; nenhum jogo futuro; notícia sem capa; menu "Entrar" no celular.

## 15. Ordem de entrega

Cada parte termina com build verde e o site de teste atualizado:

1. **3A — Base visual + cabeçalho + página inicial**: tokens, `SiteHeader` novo com o menu Entrar, home com os 12 blocos, YouTube e agenda.
2. **3B — Páginas**: `/ao-vivo`, `/modalidades`, `/videos`, `/projetosocial`, `/sobre` e o visual novo nas demais.
3. **3C — Notícias + Esporte Mundial + bot do Telegram** (spec anterior, 4.1–4.5, com as mudanças da seção 10).
4. **3D — Painéis no visual novo** + abas Ao Vivo, Vídeos e Configurações.
5. **3E — Revisão final independente**, aplicação no banco oficial (o dono roda a checagem e o SQL), aprovação do dono no site de teste e **merge na `main`**: o site novo vai para o endereço oficial.

## 16. Fora do escopo

- O app de celular das patotas (projeto separado).
- Servidor de e-mail próprio (SMTP) para os convites. Fica para quando o dono decidir.
- Estatísticas avançadas por jogador. Os números do painel usam só contagens.
- A reconstrução em Vite (`app-arenavale`).
