# Fase 4A — Vitrine: Hoje na Arena, Cortes, Galeria e modo parceiro

**Data:** 2026-11-12 · **Situação:** aguardando o ok do dono
**Contexto:** primeira das 4 etapas de evolução do site, inspiradas em canais de mídia esportiva. As outras são B (placar ao vivo), C (artilharia, estatísticas e "Oferecido por") e D (Craque do jogo). Cada etapa tem spec, plano e publicação próprios.

## 1. Objetivo

Deixar o site mais vivo, com conteúdo próprio da ARENA VALE e sem depender de ninguém marcar nada durante os jogos:

- **Hoje na Arena:** jogos de hoje e dos próximos dias. Cada jogo tem o botão **Lembrar**, que põe o jogo na agenda do celular, e o **sininho do YouTube**.
- **Cortes:** os Shorts do canal TV Arena Vale numa fileira em pé, tocando dentro do site.
- **Conserto dos "Últimos vídeos":** a seção está vazia porque o feed RSS do YouTube parou de responder, inclusive para o canal do Google. A solução é a chave oficial do YouTube.
- **Galeria por jogo ou evento:** os coordenadores enviam fotos pelo robô do Telegram ou pelo painel, e o público vê, amplia e baixa.
- **Modo parceiro no robô:** reposta autorizada de outra página, mantendo a logo dela e acrescentando a nossa logo e uma faixa de crédito.

**O que o dono pediu:** as ideias 4, 5 e 6, mais o modo parceiro. "Lembrar" e "sininho" juntos. Galeria pelo robô e pelo painel, enviada pelos coordenadores presentes, com álbum por jogo ou por evento avulso. Chave oficial do YouTube.

**O que eu assumi** (o dono pode corrigir ao revisar):
- as fotos da galeria são publicadas na hora, sem rascunho;
- as notícias do modo parceiro continuam indo como rascunho;
- o álbum do robô dura 30 minutos sem fotos novas.

**Fora desta etapa:**
- placar ao vivo, estatísticas e votação, que são as etapas B a D;
- WhatsApp, porque a Arena não tem canal;
- ler postagens do Instagram de outras contas, que a Meta não permite;
- apagar a logo de terceiros, que nunca será feito.

## 2. Hoje na Arena

### 2.1 Dados

- `lib/midia/agenda.ts` ganha `buscarHojeNaArena()`, que devolve `{ hoje: ItemAgenda[], proximos: ItemAgenda[] }`:
  - **hoje:** jogos de hoje, no horário de Brasília, que começaram há no máximo 3 horas ou que ainda vão começar;
  - **próximos:** até 6 jogos dos próximos dias.
- Usa as mesmas fontes de hoje (`jogos` e `agenda_jogos`), sem as transmissões canceladas.
- A divisão em hoje e próximos é feita por uma função pura: `separarHoje(itens, agora)`.

### 2.2 Tela

- O bloco `AgendaArena` da home passa a se chamar **"Hoje na Arena"**.
  - Os jogos de hoje aparecem primeiro, com o selo **HOJE**.
  - Depois vem "Próximos dias".
  - Sem jogo hoje, o bloco mostra só os próximos, com a frase "Hoje não tem jogo na Arena — veja os próximos".
- Cada cartão de jogo, na home e em `/agenda`, ganha dois botões:
  - **Lembrar** abre um pequeno menu com duas opções:
    - **Google Agenda:** link `calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=…&location=…&details=…`;
    - **Agenda do celular (iPhone e outros):** baixa um `.ics` gerado por `GET /api/lembrete?origem=jogos|agenda&id=<uuid>`. O arquivo tem um `VEVENT` com 2 horas de duração e um `VALARM` 30 minutos antes. O título fica "Casa x Fora — ARENA VALE", o local é o do jogo e a descrição traz o link do /ao-vivo. Com id inexistente, a rota devolve 404.
  - **Sininho:** link para `https://www.youtube.com/<handle>?sub_confirmation=1`, que abre o canal com o pedido de inscrição. Ao lado aparece a dica "ative o 🔔".
- Quando o jogo tiver álbum na galeria (seção 4), o cartão mostra **Ver fotos**.

### 2.3 Regras

- O texto do `.ics` é escapado: `,`, `;`, `\` e quebras de linha. A função pura `gerarIcs(item)` tem teste.
- A rota `/api/lembrete` é pública e só lê. A resposta tem `Content-Type: text/calendar; charset=utf-8` e `Content-Disposition: attachment; filename="jogo-arena-vale.ics"`.

## 3. Cortes e vídeos do YouTube

### 3.1 Fonte

- Nova variável de ambiente `YOUTUBE_API_KEY`. O dono cria a chave no Google Cloud, com o passo a passo dado na hora, e cola na Vercel e no `.env.local`.
- `lib/midia/youtube.ts` ganha `buscarListaYT(playlistId, limite, f)`, que chama a YouTube Data API v3 em `playlistItems.list` (parte `snippet`, `maxResults` igual ao limite):
  - `revalidate: 1800` e tempo limite de 4 s;
  - erro ou falta de chave devolve `[]`;
  - cada chamada custa 1 unidade de cota, e a cota gratuita é de 10.000 por dia.
- As listas automáticas do canal saem do id `UC…`:
  - `UULF…`: vídeos normais;
  - `UULV…`: transmissões gravadas;
  - `UUSH…`: Shorts.
- A função pura `playlistsDoCanal(channelId)` monta esses ids.
- `buscarVideosYT` passa a usar `UULF` + `UULV`, juntos e ordenados por data. Sem chave, continua tentando o RSS, que pode voltar a funcionar.
- `buscarCortesYT(channelId, limite = 12)` usa `UUSH`. Vídeos privados ou apagados, com título "Private video" ou "Deleted video" ou sem miniatura, são descartados.
- As capas usam `i.ytimg.com/vi/<id>/hqdefault.jpg`. Os títulos passam pelo mesmo `semHashtags`.

### 3.2 Tela

- Nova fileira **"Cortes"** na home, depois do "Hoje na Arena":
  - cartões em pé (9:16) com capa, título em até 2 linhas e o ícone ▶;
  - gira sozinha, com o mesmo `Fileira girar`.
- Tocar abre o **player** `PlayerCorte`:
  - diálogo em tela cheia no celular e centralizado no computador;
  - `iframe` de `https://www.youtube-nocookie.com/embed/<id>?autoplay=1&playsinline=1`;
  - fecha com ✕, com Esc ou tocando no fundo;
  - trava a rolagem do fundo e devolve o foco ao cartão.
- Sem cortes, a fileira não aparece.
- "Últimos vídeos" e `/videos` continuam iguais, só que com dados de novo.

## 4. Galeria

### 4.1 Banco (migração 0019)

`galeria_albuns`

| coluna | tipo | regra |
|---|---|---|
| id | uuid pk | |
| titulo | text not null | 3 a 80 caracteres |
| data | date not null | |
| origem | text null | 'jogos' ou 'agenda' quando o álbum é de um jogo |
| jogo_ref | uuid null | id do jogo na tabela de origem (sem FK, porque são duas tabelas) |
| capa_url | text null | primeira foto, se não houver outra escolhida |
| ativo | boolean not null default true | "esconder álbum" |
| criado_por | uuid → profiles | |
| created_at | timestamptz default now() | |

- Índice único parcial em `(origem, jogo_ref)` quando `jogo_ref` não é nulo: um álbum por jogo.

`galeria_fotos`

| coluna | tipo | regra |
|---|---|---|
| id | uuid pk | |
| album_id | uuid not null → galeria_albuns on delete cascade | |
| url | text not null | foto com a logo, 2000 px no lado maior |
| miniatura_url | text not null | 600 px |
| largura, altura | int not null | da foto grande |
| enviado_por | uuid → profiles | |
| created_at | timestamptz default now() | |

`telegram_estado`: modo do robô por pessoa.

| coluna | tipo |
|---|---|
| telegram_user_id | bigint pk |
| modo | text not null default 'noticias', valores 'noticias', 'galeria' ou 'nome_evento' |
| album_id | uuid null → galeria_albuns on delete set null |
| expira_em | timestamptz null |

**Permissões e armazenamento:**
- O visitante lê os álbuns `ativo` e as fotos de álbum ativo. O staff (`is_staff()`) faz tudo. `telegram_estado` é acessível só pelo service role, com `revoke all` de anon e authenticated.
- Bucket público `galeria`: 10 MB por arquivo, `allowed_mime_types` = `image/jpeg`, `image/png`, `image/webp`. A escrita é só do staff.
- O dono roda o SQL `ARENA VALE/supabase-FASE4-1-galeria.sql`, sem comentários e começando em `begin;`, validado antes no banco de testes. O código funciona sem a tabela: sem galeria, as seções não aparecem.

### 4.2 Processamento das fotos

- `lib/imagem/galeria.ts`: `prepararFotoGaleria(bytes)` devolve `{ grande, miniatura, largura, altura }`:
  - gira conforme o EXIF;
  - reduz para 2000 px, ou 600 px na miniatura;
  - carimba a logo com `carimbarLogo`, só na grande;
  - grava em JPEG 85.
- Caminho no bucket: `<album_id>/<uuid>.jpg` e `<album_id>/<uuid>-m.jpg`.

### 4.3 Envio pelo robô do Telegram

O robô precisa saber se uma foto é para a galeria ou para notícia. **Ficou definido por um comando, e não por adivinhação:**

1. O coordenador manda **/fotos**. O comando aparece no menu do robô, registrado com `setMyCommands`.
2. O robô responde "De qual jogo são as fotos?" com botões (`inline_keyboard`):
   - os jogos dos **últimos 3 dias e de hoje**, das duas fontes, até 8, no formato "Casa x Fora · 15/11";
   - **Outro evento**;
   - **Cancelar**.
3. **Jogo escolhido:**
   - o robô cria o álbum do jogo, ou reaproveita o que já existe, com o título "Casa x Fora" e a data do jogo;
   - grava `modo='galeria'`, `album_id` e `expira_em = agora + 30 min`;
   - responde "Pode mandar as fotos 📸 (envie /pronto quando terminar)".
4. **Outro evento:**
   - grava `modo='nome_evento'` e o robô pede "Qual o nome do evento?";
   - o próximo texto daquela pessoa vira o título, com a data de hoje, e o modo passa para galeria.
5. **No modo galeria:**
   - cada foto que chega (sozinha ou em álbum do Telegram) é baixada, preparada e guardada no álbum;
   - o prazo é renovado para mais 30 min;
   - o robô não responde foto por foto. Ele responde uma vez por `media_group_id`, ou a cada foto avulsa: "✅ Foto guardada no álbum <título>";
   - foto que veio como "arquivo" (documento de imagem) também vale;
   - vídeo no modo galeria recebe a resposta "Na galeria só vão fotos. Para notícia, envie /pronto antes".
6. **/pronto, ou 30 min sem foto:** volta ao modo notícias e o robô responde com o link `/galeria/<id>`.
7. **Fora do modo galeria,** tudo funciona como hoje: foto e texto viram rascunho de notícia.

**Detalhes técnicos:**
- O webhook passa a receber `callback_query`. O `setWebhook` é refeito com `allowed_updates=["message","callback_query"]`, e eu rodo isso daqui depois do deploy.
- Cada `callback_query` é respondido com `answerCallbackQuery`.
- O `callback_data` é curto, `g:j:<id>`, `g:a:<id>`, `g:outro` ou `g:cancelar`, com no máximo 64 bytes.
- Só coordenadores vinculados usam `/fotos`. Os demais recebem a mesma resposta de hoje, e em grupo o robô fica quieto.
- Cada foto é uma requisição do Telegram, então o limite de 60 s vale por foto, o que é folgado.
- Uma falha numa foto não derruba as outras. O robô responde "Não consegui guardar uma foto, tente de novo".

### 4.4 Envio pelo painel

- Nova aba **Galeria** em `ABAS_COORD`, depois de "Notícias". Ela permite:
  - **Novo álbum:** escolher um jogo recente (últimos 7 dias e hoje) ou "Evento", com nome e data;
  - **lista de álbuns:** capa, título, data e número de fotos, com **Esconder/Mostrar** e **Abrir**;
  - **dentro do álbum:** o botão **Adicionar fotos**, com várias de uma vez e arrastar para a área, e uma grade com **Apagar** em cada foto e **Usar como capa**.
- O envio é feito pelo navegador:
  - a foto é reduzida no próprio celular ou computador, com `canvas`, para 2400 px em JPEG 0,9. Assim fica abaixo do limite de 4,5 MB da Vercel por requisição;
  - depois vai, **uma por vez**, para `POST /api/galeria/foto` (multipart: `album_id`, `arquivo`);
  - a rota confere se quem envia é coordenador (profiles.role, igual à rota do Story), roda `prepararFotoGaleria`, guarda e insere;
  - a tela mostra o progresso "3 de 12" e lista as que falharam, com "Tentar de novo".
- Apagar uma foto remove a linha e os dois arquivos.

### 4.5 Páginas públicas

- **/galeria**: grade de álbuns ativos que têm pelo menos 1 foto, do mais novo para o mais antigo, com capa, título, data e "N fotos". Mostra 24 por página, com "Ver mais".
- **/galeria/[id]**:
  - título, data e o link do jogo na agenda, se houver;
  - grade de miniaturas;
  - tocar abre o **visualizador**: tela cheia, deslizar para os lados ou usar as setas, Esc ou ✕ fecha e mostra "3 / 24";
  - o botão **Baixar** usa a rota `/api/galeria/baixar?id=` com `Content-Disposition: attachment`, porque o atributo `download` não funciona com outro domínio;
  - álbum inexistente ou escondido dá `notFound()`.
- **Home:** fileira **"Fotos dos jogos"** com os 8 álbuns mais novos, depois de "Últimos vídeos". Sem álbum, ela não aparece.
- **Menu:** novo item **Galeria**, depois de "Atletas Destaques". Entra no menu do celular também.
- `revalidate = 60` em todas. O sitemap ganha `/galeria` e os álbuns.

## 5. Modo parceiro no robô

- A legenda ou o texto da mensagem tem `parceiro @perfil`, onde o perfil tem de 1 a 30 caracteres entre letras, números, `.` e `_`.
- A função pura `extrairParceiro(texto)` devolve o perfil e o texto sem a marcação.
- Com parceiro, a imagem passa por `montarParceiro(bytes, perfil)`, em `lib/imagem/parceiro.ts`:
  - **mantém a imagem inteira**;
  - aplica `carimbarLogo`, que põe a nossa logo no canto de cima à direita;
  - acrescenta embaixo uma faixa preta com uma linha vermelha no topo e o texto "Foto e arte: @perfil" e "Publicado com autorização · ARENA VALE", desenhados em SVG pelo sharp;
  - a altura da faixa é proporcional à largura.
- A notícia vai como rascunho, com `aba='arena'` (Notícias do Vale) e `fonte = '@perfil'`.
- O crédito sempre aparece, porque a regra `GUARDAR_FONTE = false` não vale no modo parceiro.
- O robô responde "Rascunho criado (parceiro @perfil) ✅" com o link do editor.
- Vídeo com parceiro: o vídeo fica como está e a capa recebe a faixa.
- O modo parceiro só vale fora do modo galeria.

## 6. Erros e limites

- **YouTube** fora do ar ou sem chave: as fileiras somem ou mostram "Veja no canal", e a página nunca quebra (`seguro()`).
- **Galeria sem a migração aplicada:** as buscas devolvem `[]`, as seções não aparecem e `/fotos` responde "A galeria ainda não foi ativada".
- **Estado do robô vencido:** é tratado como modo notícias. Não precisa de limpeza.
- **Fotos órfãs:** não existem, porque toda foto já entra com álbum.

## 7. Testes

- **Unitários (Vitest):**
  - `separarHoje`, `gerarIcs` (escape e alarme), `playlistsDoCanal`;
  - parse da resposta da API do YouTube, `extrairParceiro`;
  - roteamento do robô: `/fotos`, os callbacks, `nome_evento`, foto no modo galeria, prazo vencido, `/pronto`, vídeo no modo galeria e coordenador não vinculado;
  - componentes: Hoje na Arena, botões Lembrar e sininho, fileira Cortes, player, aba Galeria (progresso e falha), página do álbum e visualizador (teclado);
  - `prepararFotoGaleria` e `montarParceiro`, com dimensões e a faixa presente.
- **Banco (test:db):**
  - visitante lê álbum ativo e não lê o escondido;
  - visitante não escreve;
  - `telegram_estado` fica fechado para anon e authenticated;
  - unicidade de álbum por jogo;
  - o bucket recusa o tipo de arquivo errado.
- **Manual depois de publicar:**
  - `/fotos` pelo Telegram de verdade;
  - envio de 10 fotos pelo painel no celular;
  - ".ics" no iPhone e Google Agenda no Android;
  - cortes tocando no celular.

## 8. Ordem de publicação

1. Hoje na Arena e Lembrar/sininho, que não dependem de nada.
2. Chave do YouTube colada pelo dono, Cortes e conserto dos Últimos vídeos.
3. SQL da galeria rodado pelo dono, galeria pelo painel, páginas públicas e menu.
4. Galeria pelo robô (`/fotos`), refazer o `setWebhook` e o modo parceiro.

Cada passo é publicado e conferido no site antes do próximo.
