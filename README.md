# Arena Vale — site oficial

Site da Arena Vale ("O palco do esporte é aqui."). Tem agenda, campeonatos, notícias, atletas destaque, súmulas digitais, TV, projeto social e os painéis da equipe.

- Produção: https://arena-vale.vercel.app
- Repositório: `arenavaleinstituto-source/arena-vale`

## Stack

- **Next.js 16** (App Router) + **React 19** + TypeScript
- **Supabase**: banco Postgres, login (Auth), arquivos (Storage) e regras de acesso (RLS)
- **Tailwind CSS 3**, com a configuração em `tailwind.config.ts`
- **Vitest** + Testing Library para os testes
- Deploy na **Vercel**: cada branch enviada ao GitHub ganha um link de prévia

## Rodar localmente

Requisitos: Node 20.9 ou mais novo.

```bash
npm install
cp .env.example .env.local   # depois preencha as 3 chaves (veja abaixo)
npm run dev                  # http://localhost:3000
```

## Variáveis de ambiente

Ficam em `.env.local`, que **nunca** vai para o git. Na Vercel, ficam em *Settings → Environment Variables*, para Preview e Production.

| Variável | Onde pegar | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | navegador e servidor |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` `public` | navegador e servidor |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` | **só no servidor** e no seed. Nunca expor no navegador |

Outras variáveis (cadastradas na Vercel; no computador, em `.env.local`):

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | endereço do site (`https://www.arenavale.com.br`) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` | robô do Telegram (seção abaixo) |
| `CRON_SECRET` | rotina diária que apaga vídeos vencidos e renova a chave do Instagram |
| `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` | Story automático no Instagram (opcional) |

## Banco de dados

As migrações ficam em `supabase/migrations/` (`0001` a `0018`) e devem ser aplicadas em ordem. Há duas formas:

**A) Pelo terminal (Supabase CLI)**
```bash
npx supabase login
npx supabase link --project-ref <ref-do-projeto>   # o ref aparece na URL do painel do Supabase
npx supabase db push
```

**B) Pelo painel**

Abra **SQL Editor** no Supabase, cole o conteúdo de cada arquivo de `supabase/migrations/` em ordem (`0001`, `0002`, …) e execute.

Depois, para popular com dados de demonstração (campeonatos, times, jogos e súmulas):
```bash
npm run db:seed   # exige SUPABASE_SERVICE_ROLE_KEY no .env.local
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm start` | sobe o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | checagem de tipos (TypeScript) |
| `npm test` | testes (Vitest) |
| `npm run db:seed` | popula o banco com dados de demonstração |

## Acesso da equipe e cargos

| Cargo | Entra em | Pode |
|---|---|---|
| Proprietário (aparece como "Coordenador") | tudo + área escondida (3 toques no logo) | gerir os coordenadores e o limite |
| Coordenador | `/coordenador` | tudo no site, menos mexer em coordenadores |
| Moderador | `/moderador` | resultados, eventos e súmulas dos SEUS campeonatos |
| Capitão | `/capitao` | a própria equipe e o elenco |

- Botão **Entrar** no cabeçalho (ou `/login`): o site lê o cargo no banco e leva ao painel certo.
- As regras valem no banco (RLS, migrações `0009` e `0010`); as páginas só repetem a checagem.
- Convites: a coordenação convida moderadores e capitães por campeonato; o proprietário convida coordenadores.

### Configuração dos e-mails no Supabase (obrigatória para convites)

Em **Authentication → URL Configuration**:
- **Site URL:** `https://arena-vale.vercel.app`
- **Redirect URLs:** `https://arena-vale.vercel.app/**`, `https://*-arena-vale.vercel.app/**` e `http://localhost:3000/**`

Os **modelos de e-mail padrão** do Supabase já funcionam com o site:
- convite → o link abre `/criar-senha` com a sessão no `#` (a página abre a sessão sozinha);
- link de acesso e "esqueci a senha" → voltam com `?code=` para `/auth/confirm`.

**Limite importante:** sem um servidor de e-mail próprio (Authentication → Emails → *Set up SMTP*), o Supabase só entrega e-mails para os membros da equipe do projeto e com limite baixo por hora. Para convidar qualquer pessoa, configure um SMTP (ex.: Resend). Com SMTP, os modelos também podem ser personalizados; nesse caso use links no formato `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=<invite|magiclink|recovery>` (a rota `/auth/confirm` também aceita esse formato).

## Testes de banco

`npm run test:db` recria o banco do projeto **TESTES** do zero (credenciais em `.env.test.local`, nunca no git) e testa as regras de cada cargo. O script se recusa a rodar se apontar para o banco oficial.

## Deploy

1. Trabalhe numa branch e envie para o GitHub (`git push -u origin <branch>`).
2. A Vercel cria um link de **prévia** para a branch. Revise o site por ele.
3. Com tudo aprovado, faça o merge na `main`. A Vercel publica em produção.

## Documentação do projeto

- Spec: `docs/superpowers/specs/2026-11-08-arena-vale-organizacao-noticias-permissoes-design.md`
- Planos: `docs/superpowers/plans/`

## Bot do Telegram (Esporte Mundial)

O bot transforma mensagens encaminhadas em **rascunhos** na aba Notícias do painel (aba Esporte Mundial). Nada é publicado sozinho: a coordenação revisa e publica.

**Configuração (uma vez):**

1. No Telegram, abra o **@BotFather**, envie `/newbot` e escolha o nome (ex.: ARENA VALE Notícias). Ele devolve o **token**.
2. Na Vercel → projeto → Settings → Environment Variables, crie (Production e Preview):
   - `TELEGRAM_BOT_TOKEN` = o token do BotFather;
   - `TELEGRAM_WEBHOOK_SECRET` = uma senha longa inventada (só letras, números, `_` e `-`);
   - `CRON_SECRET` = outra senha longa (usada pela rotina diária que apaga vídeos vencidos).
3. Faça um novo deploy e registre o webhook pelo terminal (assim o segredo não fica no histórico do navegador), trocando `<TOKEN>` e `<SEGREDO>`:

   ```
   curl -s "https://api.telegram.org/bot<TOKEN>/setWebhook" -d "url=https://arena-vale.vercel.app/api/telegram" -d "secret_token=<SEGREDO>" -d 'allowed_updates=["message"]'
   ```

   A resposta deve ter `"ok":true`.
4. No painel, aba **Notícias**, clique em **Vincular Telegram**, e envie ao bot a mensagem `/vincular <código>`.

**Uso:** encaminhe ao bot a mensagem do grupo (foto, vídeo ou texto com link). Ele responde "Rascunho criado ✅" com o link do editor.

**Vídeos:** guardados por 30 dias (ajustável na área do proprietário) até 20 MB; depois disso a notícia toca pelo link original, quando houver.
