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

As variáveis do bot do Telegram e da rotina de vídeos entram nas próximas fases.

## Banco de dados

As migrações ficam em `supabase/migrations/` (`0001` a `0007`) e devem ser aplicadas em ordem. Há duas formas:

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

Em **Authentication → Email Templates**, troque o link de cada modelo:

| Modelo | Link |
|---|---|
| Invite user | `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=invite` |
| Magic Link | `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=magiclink` |
| Reset Password | `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery` |

O site já envia `RedirectTo` como `<site>/auth/confirm?next=...`; a rota `/auth/confirm` cria a sessão e segue para o destino.

## Testes de banco

`npm run test:db` recria o banco do projeto **TESTES** do zero (credenciais em `.env.test.local`, nunca no git) e testa as regras de cada cargo. O script se recusa a rodar se apontar para o banco oficial.

## Deploy

1. Trabalhe numa branch e envie para o GitHub (`git push -u origin <branch>`).
2. A Vercel cria um link de **prévia** para a branch. Revise o site por ele.
3. Com tudo aprovado, faça o merge na `main`. A Vercel publica em produção.

## Documentação do projeto

- Spec: `docs/superpowers/specs/2026-11-08-arena-vale-organizacao-noticias-permissoes-design.md`
- Planos: `docs/superpowers/plans/`
