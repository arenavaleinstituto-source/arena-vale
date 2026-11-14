# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Brand

Always write **ARENA VALE** (all caps, no "Sports" or "Sport"). This applies in code, comments, and copy — including when referencing Supabase project names.

## Commands

```bash
# Type-check (runs clean, no incremental cache)
npx tsc --noEmit --incremental false

# Unit tests (jsdom, excludes tests/db/)
npx vitest run --maxWorkers=2

# Single test file
npx vitest run --maxWorkers=2 components/coord-shell.test.tsx

# DB integration tests (requires .env.test.local — see below)
npx vitest run -c vitest.db.config.ts --maxWorkers=2

# Single DB test file
npx vitest run -c vitest.db.config.ts tests/db/delegado.test.ts --maxWorkers=2

# Dev server
npm run dev

# Build
npm run build
```

## Environment

- **Production** (never test against): `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Test DB**: `.env.test.local` with `TEST_SUPABASE_URL`, `TEST_SUPABASE_ANON_KEY`, `TEST_SUPABASE_SERVICE_ROLE_KEY`, `TEST_DATABASE_URL`

**Critical**: Never `source .env.local`. Read env values only with `grep '^KEY=' .env.local | cut -d= -f2-`. The test harness (`scripts/db/teste-env.ts`) hard-blocks any test run that points at the production project ref (`cpvmfpxxrdpvfbonwynr`).

## Architecture

### Auth & Role Model

Roles in `profiles.role` (DB): `anonimo`, `autenticado`, `moderador`, `coordenador`, `capitao`, `delegado`, `proprietario`.

The site maps these to the `Cargo` type (`lib/auth/rotas.ts`): `visitante | autenticado | coordenador | moderador | capitao | delegado`. Both `proprietario` and `coordenador` DB roles become `'coordenador'` cargo. `ehDono` (from `is_proprietario()` RPC) is a separate boolean used only to gate owner-only actions.

Cargo is always read from the DB at request time via `lerCargo(supabase)` in `lib/auth/cargo.ts` — never from cookies or localStorage.

### Route Protection (three-layer)

1. **Middleware** (`proxy.ts` / `middleware.ts`): `decidirRota()` redirects unauthenticated users to `/login?next=<rota>` and insufficient cargo to `/acesso-negado`. Config matcher lists every protected prefix.
2. **Page**: every protected page re-checks cargo server-side with `lerCargo()` and `redirect()`.
3. **Database RLS**: the final barrier. Policy functions like `is_staff()`, `is_moderador_do_campeonato()`, `is_delegado_do_jogo()` are `security definer` SQL functions.

Protected prefixes: `/coordenador`, `/painel`, `/moderador`, `/capitao`, `/delegado`, `/proprietario`.

### Route Groups

- `app/(public)/` — public pages (home, noticias, galeria, etc.)
- `app/(coord)/` — pages for the team (coordenador, moderador, capitao, delegado)
- `app/(auth)/` — login, criar-senha

Pages under `(coord)` use `export const dynamic = 'force-dynamic'` and must call `lerCargo()` + `redirect()` themselves.

### Supabase Client Pattern

- `createClient()` (`lib/supabase/server.ts`) — Server Components / Route Handlers that need the user session (reads cookies).
- `createPublicClient()` — public content that can be statically generated; uses anon key without touching cookies.
- `createClient()` (`lib/supabase/client.ts`) — Client Components.

### Coordinator Panel

`CoordShell` (`components/coord-shell.tsx`) is a client component that owns the tab state. Each tab renders one `coord-*.tsx` component. Tab definitions live in `components/painel/abas.ts` (array `ABAS_COORD`, currently 15 tabs). Adding a tab requires: updating `abas.ts`, rendering it in `coord-shell.tsx`, and updating the two tests that assert the count.

### Invites / Cargo Assignment

`lib/auth/convites.ts` exports `convidar()`. Rules:
- Only `coordenador` can invite.
- Only the owner (`ehDono`) can invite another `coordenador`.
- `moderador` and `capitao` require a `campeonatoId`.
- `coordenador` and `delegado` do not require a `campeonatoId`.
- `delegado` is not linked to a team (`vincular()` is not called for them).

### DB Migrations

Migrations live in `supabase/migrations/` (numbered `0001_…` → current). After running a migration in production, the owner SQL file at `ARENA VALE/supabase-FASE4-N-<name>.sql` (outside the repo) mirrors it wrapped in `begin;`/`commit;` for the Supabase SQL Editor.

### DB Tests (`tests/db/`)

Each test file uses helpers from `tests/db/fixtures.ts`: `criarUsuario(cargo)`, `admin()`, `visitante()`. The global setup (`tests/db/global-setup.ts`) resets the test DB from migrations and waits for PostgREST schema reload before tests run. Tests are sequential (`fileParallelism: false`) with a 30 s timeout per test.

### Live Score / Agenda

`lib/midia/agenda.ts` → `deJogos()` builds `ItemAgenda` from the `jogos` table. Items with `status = 'ao_vivo'` carry a `placar` string and are shown with a 🔴 AO VIVO badge in `components/home/AgendaArena.tsx`. The `buscarHojeNaArena()` function queries `['agendado', 'ao_vivo', 'finalizado']` statuses so live games remain visible.

### Delegado / Mesa do Jogo

`app/(coord)/delegado/page.tsx` → `components/delegado/MesaDoJogo.tsx`. The `delegado_id` column on `jogos` links a delegado to their game. RLS trigger `tr_moderador_so_resultado` (WITHOUT security definer — deliberate) blocks a delegado from changing structural fields. Trigger `tr_bloquear_delegado_ao_finalizar` (WITH security definer) downgrades the delegado's `profiles.role` to `autenticado` when the game is finalized.
