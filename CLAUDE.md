# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run typecheck    # tsc --noEmit (full type check; build won't catch everything)
npm run lint         # ESLint
npm run test         # unit + component tests (Vitest + jsdom)
npm run test:db      # recreates the TESTES Supabase project and tests RLS per role (credentials in .env.test.local; refuses to run against the production DB)
npm run db:seed      # seed the DB (requires .env.local)
npm run db:teste:resetar  # wipe + recreate test DB schema
```

Run a single test file:
```bash
npx vitest run lib/midia/youtube.test.ts
```

## Architecture

**Next.js 16 App Router**, React 19, TypeScript, Tailwind CSS, Supabase, deployed on Vercel (push to `main` = production at arenavale.com.br; other branches get preview URLs).

**Next.js 16 has breaking changes vs. training data** (see [AGENTS.md](AGENTS.md)): read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code. `next dev` re-adds that block to AGENTS.md — commit it rather than reverting it.

### Naming convention
All code and UI copy is in **Portuguese**. Component names, variables, and DB column names follow Portuguese vocabulary (`Faixa`, `Fileira`, `Cartaz`, `Cargo`, `noticia`, `jogo`, etc.).

### Layer separation: lib/ vs components/

`lib/` contains **pure business logic** — no JSX, no React hooks. All external dependencies (Supabase, fetch, timers) are injected via a `portas.ts` file per domain, which is the "adapter" that connects the pure core to the real world. This makes unit-testing the core straightforward without mocking modules.

```
lib/
  auth/       — cargo system, invite links, route guards
  atletas/    — athlete records, roster (elenco), CPF validation
  content/    — static site copy and vocabulary
  midia/      — config, news, championships, agenda, YouTube
  telegram/   — bot message processing, gallery, linking
  whatsapp/   — WhatsApp Business bot (mirrors telegram/: extrair → processar → portas)
  instagram/  — Story publishing via Graph API
  imagem/     — image stamping (marca), story compositing, gallery processing
  supabase/   — client/server clients + typed queries
  ui/          — tokens, useTripleTap, image helpers
```

`components/` holds **React components**, grouped by feature. Test doubles for Supabase live in `components/auth/fake-supabase.ts` and `components/fake-consultas.ts`.

### User roles (Cargo)

Five roles in `profiles.role`: `proprietario`, `coordenador`, `moderador`, `capitao`, `delegado`.  
`proprietario` is treated as `coordenador` everywhere except `/proprietario` routes (see [lib/auth/rotas.ts](lib/auth/rotas.ts)).  
Route protection lives in a middleware-like pattern at the page level using `decidirRota()`.

### App Router groups

```
app/
  (auth)/       — login, criar-senha
  (coord)/      — coordenador, capitao, moderador, delegado, proprietario panels
  (public)/     — sumula
  api/
    cron/videos — Vercel cron, runs daily at 06:00 UTC (vercel.json)
    telegram/   — webhook for the Telegram bot
    whatsapp/   — webhook for the WhatsApp Business bot (GET = Meta verification, POST = HMAC-verified events)
    instagram/story — posts Story to Instagram Graph API
    galeria/, convites/, inscricoes/, lembrete/, patrocinadores/
```

### News bots (Telegram / WhatsApp)

Both bots turn incoming messages into **drafts** (`noticias.status = 'rascunho'`, `origem = 'telegram' | 'whatsapp'`) — nothing is auto-published; the coordenador reviews in the painel's Notícias tab. Only `coordenador` profiles may create drafts. A user links their account by generating an 8-char code in the painel (RPC `gerar_codigo_telegram` / `gerar_codigo_whatsapp`, valid 10 min) and sending `/vincular <code>` to the bot; 5 wrong codes block for 1 h. Dedup is by a unique message-ref column (`telegram_message_ref` / `whatsapp_message_ref`). Telegram drafts go to aba `mundo` (or `arena` in "parceiro" mode); WhatsApp drafts always go to aba `arena` (Notícias do Vale). Webhooks always return 200 after signature checks so the platform doesn't retry.

### Database migrations

`supabase/migrations/NNNN_*.sql`, numbered sequentially. They are applied **manually** in the Supabase SQL Editor to both the production project (ARENA VALE) and the TESTES project, so every migration must be idempotent (`if not exists`, `drop constraint if exists`, `create or replace`). Permissions live in RLS + `security definer` RPCs; pages only repeat the check.

### Ports pattern

Each domain with side effects has two files:

| File | Purpose |
|------|---------|
| `lib/X/processar.ts` (or `story.ts`, `galeria.ts`) | Pure logic, receives a `Portas` interface |
| `lib/X/portas.ts` | Builds the concrete `Portas` object using real Supabase + fetch |

The API route instantiates `portasBot(adminClient)` / `portasStory(adminClient)` and passes it to the pure core. Tests pass a `fakePortas` object instead.

### Supabase clients

- `lib/supabase/server.ts` — `createClient()` (uses cookies, server-only), `createPublicClient()` (anon, no auth)
- `lib/supabase/client.ts` — browser client for client components
- `createAdminClient()` in `lib/supabase/server.ts` — service-role client, used only in API routes / webhooks

### Styling

Tailwind with custom design tokens on the `av-*` prefix (`av-preto`, `av-vermelho`, `av-amarelo`, etc., defined in [tailwind.config.ts](tailwind.config.ts)). Class merging via `cn()` from [cn.ts](cn.ts) (clsx + tailwind-merge). Two global CSS files: `app/globals.css` (base) and `app/midia.css` (media/card components).

The full design system — palette, typography, components, animations, and do/don'ts — is documented in [DESIGN.md](DESIGN.md). Load it before creating or editing any UI.

### Key integrations

| Integration | Env vars | Notes |
|------------|----------|-------|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Service role is server-only |
| Site URL | `NEXT_PUBLIC_BASE_URL` | Used for links the bots send back, sitemap, robots |
| Vercel cron | `CRON_SECRET` | Protects `/api/cron/videos` (deletes expired videos, renews Instagram token) |
| Telegram bot | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` | Webhook at `/api/telegram`; `scripts/telegram/configurar.mjs` registers it |
| Instagram Graph API | `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` | Token auto-renews every 7 days; stored in `instagram_conta` table |
| YouTube | `YOUTUBE_API_KEY` | Optional — falls back to public RSS if absent |
| Resend | (DNS only) | SPF includes `resend.com`; no SDK used in app code |
| WhatsApp Business | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` | Webhook at `/api/whatsapp`; `scripts/whatsapp/configurar.mjs` verifica o número. Webhook registrado manualmente no Meta for Developers. |
