# Fase 1 — Organização do site Arena Vale — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar o `arena-vale` compilando em Next 16 sobre a `main` do GitHub, com o patch das 44 correções aplicado, o login escondido no logo funcionando, o lixo removido e o banco de desenvolvimento populado, tudo numa branch `organizacao` com preview na Vercel.

**Architecture:** O trabalho é feito na própria pasta `arena-vale`, numa branch `organizacao` criada a partir de `origin/main`. As mudanças locais não commitadas são guardadas num `git stash`, o que permite recuperá-las. O patch entra com `git apply -3`. Os conflitos são resolvidos a favor do patch, e o login do proprietário é preservado. O toque triplo vira um hook testável (`useTripleTap`) e um componente (`LogoSecreto`), usado no lugar do logo em todos os headers.

**Tech Stack:** Next 16 (App Router), React 19, TypeScript 5.9, Tailwind 3, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Vitest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-11-08-arena-vale-organizacao-noticias-permissoes-design.md`, seções 2, 3 e 6. As Fases 2 (permissões) e 3 (notícias) terão planos próprios, escritos depois desta fase, sobre a base que ela entregar.

**Fica para a Fase 2, de propósito:**
- o atalho "proprietário já logado → 3 toques vão direto a `/proprietario`", porque depende de `is_proprietario()`;
- as contas de teste por cargo no seed;
- a nova entrada "Entrar" da equipe;
- a checagem de cargo no `proxy.ts`. Nesta fase o proxy continua como o patch deixou: exige sessão, mas não confere o cargo.

## Global Constraints

- Next **16** + React **19**. Nada de Next 14/15.
- Tailwind **3**, com um único `tailwind.config.ts`.
- A `main` não recebe commit nem push nesta fase. Tudo vai na branch `organizacao`.
- Nenhum segredo é commitado. `.env.local`, `.env*.local`, `.next/` e `node_modules/` ficam no `.gitignore`. A `SUPABASE_SERVICE_ROLE_KEY` é colocada pelo proprietário e nunca é impressa em log nem colada no chat.
- **Nunca removidos:**
  - as páginas públicas home, agenda, campeonatos, notícias, atletas destaque, súmula, TV, inscrição, patrocínio, **projeto social**, links, termos e privacidade;
  - os componentes que elas importam, além de `ProjetoSocialFocus`.
- Textos visíveis em pt-BR. O modal do logo usa o título **"Acesso restrito"** e nunca a palavra "proprietário" em texto visível, `title` ou `aria-label`.
- Erro de credencial: exatamente **"E-mail ou senha inválidos"**.
- Toque triplo: janela de **500 ms** entre toques. Com 1 ou 2 toques, navega para `/` depois de 500 ms do último toque. O logo usa `touch-action: manipulation`, e o `aria-label`/`title` é **"Arena Vale — início"**.
- Commits terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Dois toques e depois uma pausa** devem navegar **uma vez só**, e não duas. O teste fica na Task 2.
2. **Três toques rápidos** não podem navegar antes de o modal abrir, porque um toque não pode disparar a navegação no meio da sequência. O teste fica na Task 2.
3. **Falha de rede no login** (o Supabase fora do ar) mostra "Não foi possível entrar. Verifique sua conexão e tente de novo.", e não a mensagem de senha errada nem uma tela branca. O teste fica na Task 2.
4. **Banco vazio ou inacessível:** a home, `/noticias` e `/atletasdestaques` continuam renderizando com os dados padrão do patch (`NOTICIAS_PADRAO`, `DESTAQUES_PADRAO`). Isso é verificado no smoke test da Task 3.
5. **Variáveis faltando na Vercel:** o preview não pode cair com erro 500 na home. A conferência das variáveis fica na Task 6.

---

### Task 1: Branch `organizacao` na própria pasta `arena-vale`, com spec e plano

Decisão do proprietário: o trabalho é feito na própria pasta `arena-vale`, sem worktree separado.

**Estado de partida da pasta (08/11):**
- `main` local em `8203f97`, atrás de `origin/main` (`ddfc98e`);
- mudanças não commitadas: `middleware.ts` apagado e `package.json`, `package-lock.json` e `tsconfig.json` modificados (versão Next 14 local). Todas são substituídas pelo que este plano faz;
- não rastreados: `.env.local`, `.gitignore` (só `node_modules`), `.next/`, `Untitled-1.txt`, `middleware.ts.bak`, `docs/`.

**Files:**
- Stash: as 4 mudanças rastreadas acima. Ficam guardadas e podem ser recuperadas com `git stash pop`.

- [ ] **Step 1: Guardar as mudanças locais e criar a branch a partir do GitHub**

```bash
cd "/c/Users/mmaur/OneDrive/Desktop/ARENA VALE/arena-vale"
git fetch origin
git stash push -m "local-antes-da-organizacao (Next 14)" -- middleware.ts package.json package-lock.json tsconfig.json
git switch -c organizacao origin/main
```
Esperado:
- `git log --oneline -1` mostra `ddfc98e Add OwnerLoginModal and button for owner access`;
- `git stash list` mostra a entrada `local-antes-da-organizacao`;
- `.env.local` continua na pasta.

- [ ] **Step 2: Conferir que o `.env.local` não será commitado**

Run: `git status --short`
Esperado: `.env.local` aparece como `??` (não rastreado). Nesta task só os docs são adicionados. O `.gitignore` definitivo vem com o patch na Task 3.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers
git commit -m "docs: spec e plano da fase 1 (organização)"
```

---

### Task 2: Infra de testes, `useTripleTap`, `LogoSecreto` e `OwnerLoginModal`

Componentes independentes do patch, feitos com TDD antes da migração para o Next 16.

**Files:**
- Modify: `package.json` (devDependencies e script `test`)
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Create: `lib/ui/useTripleTap.ts`
- Create: `components/auth/LogoSecreto.tsx`
- Create: `components/auth/OwnerLoginModal.tsx`
- Test: `lib/ui/useTripleTap.test.ts`, `components/auth/LogoSecreto.test.tsx`, `components/auth/OwnerLoginModal.test.tsx`

**Interfaces:**
- Produces:
  - `useTripleTap(opts: { onTriple: () => void; onSingle: () => void; windowMs?: number }): () => void`. Retorna o handler de clique. `windowMs` padrão 500.
  - `LogoSecreto(props: { className?: string; imgClassName?: string }): JSX.Element`. É um `<button type="button">` com `<img src="/logo.png" alt="Arena Vale">`. Com 1 ou 2 toques, chama `router.push('/')`, ou `window.scrollTo({ top: 0, behavior: 'smooth' })` se já estiver em `/`. Com 3 toques, abre o `OwnerLoginModal`, que é renderizado dentro do próprio `LogoSecreto`.
  - `OwnerLoginModal(props: { open: boolean; onClose: () => void }): JSX.Element | null`. Em caso de sucesso, chama `router.push('/proprietario')`.

- [ ] **Step 1: Instalar a infra de testes**

```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```
Criar:
- `vitest.config.ts`, com `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`, alias `@` → raiz do projeto e `include: ['**/*.test.{ts,tsx}']`, excluindo `node_modules` e `.next`;
- `vitest.setup.ts`, que importa `@testing-library/jest-dom/vitest`;
- o script `"test": "vitest run"` no `package.json`.

- [ ] **Step 2: Escrever os testes do hook, que devem falhar**

`lib/ui/useTripleTap.test.ts`, com `vi.useFakeTimers()` e `renderHook`:
- `3 toques em menos de 500 ms chamam onTriple uma vez e onSingle nunca`: tocar em t=0, 200 e 400, avançar 1000 ms. Esperar `onTriple` chamado 1 vez e `onSingle` chamado 0 vezes.
- `1 toque chama onSingle depois de 500 ms`: tocar em t=0. Em t=499, `onSingle` foi chamado 0 vezes; em t=500, 1 vez.
- `2 toques e pausa chamam onSingle uma única vez` (Review Focus 1): tocar em t=0 e 300, avançar 2000 ms. Esperar `onSingle` chamado 1 vez e `onTriple` 0 vezes.
- `3 toques lentos não chamam onTriple`: tocar em t=0, 600 e 1200, avançar 2000 ms. Esperar `onTriple` chamado 0 vezes e `onSingle` chamado 3 vezes.
- `onSingle não dispara entre o 1º e o 3º toque rápido` (Review Focus 2): tocar em t=0 e t=450; em t=900 tocar de novo. `onSingle` foi chamado 0 vezes e `onTriple` 1 vez.

- [ ] **Step 3: Rodar e conferir que falha**

Run: `npx vitest run lib/ui/useTripleTap.test.ts`
Esperado: FAIL (módulo não existe).

- [ ] **Step 4: Implementar `useTripleTap` em `lib/ui/useTripleTap.ts`**

Usar um contador em `useRef` e um timer em `useRef`:
- cada toque cancela o timer anterior e incrementa o contador;
- no 3º toque, chama `onTriple`, zera o contador e não agenda nada;
- nos outros casos, agenda em `windowMs` a chamada de `onSingle` e zera o contador;
- limpar o timer no unmount.

- [ ] **Step 5: Rodar e conferir que passa**

Run: `npx vitest run lib/ui/useTripleTap.test.ts`
Esperado: PASS (5 testes).

- [ ] **Step 6: Escrever os testes do modal e do logo, que devem falhar**

Mock de `next/navigation` (`useRouter` → `{ push: vi.fn() }`, `usePathname` → `'/noticias'`) e mock de `@/lib/supabase/client` (`createClient` → `{ auth: { signInWithPassword: vi.fn() } }`).

`components/auth/OwnerLoginModal.test.tsx`:
- `não renderiza nada com open=false`;
- `mostra título "Acesso restrito" e não contém a palavra proprietário`: `screen.getByRole('dialog')` tem o nome "Acesso restrito", e `document.body.textContent` não casa com `/propriet/i`;
- `login certo leva a /proprietario`: `signInWithPassword` resolve `{ data: { user: {} }, error: null }`, o teste digita e-mail e senha e clica em "Entrar". Esperar `push` chamado com `'/proprietario'`;
- `senha errada mostra mensagem genérica`: resolve `{ error: { message: 'Invalid login credentials', status: 400 } }`. Esperar o texto exato "E-mail ou senha inválidos";
- `falha de rede mostra mensagem de conexão` (Review Focus 3): `signInWithPassword` rejeita com `new TypeError('Failed to fetch')`. Esperar "Não foi possível entrar. Verifique sua conexão e tente de novo.";
- `Esc chama onClose`.

`components/auth/LogoSecreto.test.tsx`:
- `tem aria-label "Arena Vale — início" e touch-action manipulation`;
- `3 cliques rápidos abrem o diálogo "Acesso restrito"`;
- `1 clique navega para / depois de 500 ms`: com fake timers, esperar `push('/')`.

- [ ] **Step 7: Rodar e conferir que falha**

Run: `npx vitest run components/auth`
Esperado: FAIL (módulos não existem).

- [ ] **Step 8: Implementar `OwnerLoginModal` e `LogoSecreto`**

**`OwnerLoginModal`** (`'use client'`):
- `role="dialog"`, `aria-modal="true"` e `aria-labelledby` apontando para o título;
- fundo escuro com `backdrop-blur`, raio 24 px e campos com raio 16 px, no visual da prévia aprovada;
- foco no e-mail ao abrir; Esc e clique fora fecham;
- trata como erro de credencial um `error` com `status === 400`, ou com uma mensagem que contenha `"Invalid login"`. Qualquer outro `error` ou exceção mostra a mensagem de conexão.

**`LogoSecreto`** (`'use client'`):
- usa `useTripleTap`, `useRouter` e `usePathname`;
- estilo inline `touchAction: 'manipulation'`.

- [ ] **Step 9: Rodar todos os testes**

Run: `npm test`
Esperado: PASS (14 testes).

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts lib/ui components/auth
git commit -m "feat: logo com toque triplo e modal de acesso restrito"
```

---

### Task 3: Aplicar o patch e migrar para o Next 16

**Files:**
- Apply: `../arena-vale-padrao-editorial-e-correcoes (2).patch` (56 arquivos)
- Modify (conflitos): `app/page.tsx`, `package.json`
- Rename: `middleware.ts` → `proxy.ts`
- Modify: os arquivos apontados pelo codemod e pelo build (uso de `cookies()`, `headers()`, `params`, `searchParams`)
- Modify (logo): cada header com `<img src="/logo.png"` dentro de um `<header>`. Hoje são `app/page.tsx`, `components/Header.tsx` e os headers próprios das páginas listadas por `grep -rln 'logo.png' app components`. Ficam fora `app/layout.tsx` (metadados), `components/CartaoComunicado.tsx` e `components/shield.tsx`, onde o logo não é de header.

**Interfaces:**
- Consumes: `LogoSecreto` (Task 2).

- [ ] **Step 1: Aplicar o patch**

O patch cria um `.gitignore` novo, que já inclui `node_modules`, e falha se já existir um. Por isso o `.gitignore` local não rastreado é removido antes:
```bash
rm -f .gitignore
git apply -3 "../arena-vale-padrao-editorial-e-correcoes (2).patch"
```
Esperado: só `app/page.tsx` e `package.json` com conflito.

- [ ] **Step 2: Resolver `app/page.tsx`**

- No bloco de imports em conflito, ficar com o lado do patch (`theirs`): os imports de `CartaoComunicado`, `CartaoDestaque` e `@/lib/content`. Remover as interfaces e os dados padrão locais do lado `ours`.
- Remover `import { OwnerLoginModal }`, o estado `ownerLoginOpen` e o `<OwnerLoginModal …/>` da linha ~602, porque o modal agora vive dentro de `LogoSecreto`.
- Trocar o `<button … onClick={() => setOwnerLoginOpen(true)}>` com `<img src="/logo.png">` por `<LogoSecreto className="…as classes do botão atual…" imgClassName="…as classes do img atual…" />`.

Conferir: `grep -nE '^(<<<<<<<|=======|>>>>>>>)' app/page.tsx` não retorna nada.

- [ ] **Step 3: Resolver `package.json` para o Next 16**

- Manter: `"name": "arena-vale"`, os devDependencies de teste da Task 2 e os scripts `dev` (`next dev`), `build` (`next build`), `start` (`next start`), `test` (`vitest run`) e `typecheck` (`tsc --noEmit`).
- `lint` passa a ser `eslint .`, porque o `next lint` foi removido no Next 16.
- Dependências, todas na versão estável atual: `next@16`, `react@19`, `react-dom@19`, `@supabase/ssr`, `@supabase/supabase-js`, `clsx`, `tailwind-merge`, `lucide-react`.
- Remover `jszip` se, depois da Task 4, nada mais o importar. Conferir com `grep -rn jszip app components lib`.
- Dev: `tailwindcss@3`, `tailwindcss-animate`, `postcss`, `autoprefixer`, `@types/react@19`, `@types/react-dom@19`, `typescript@5.9`, `eslint`, `eslint-config-next@16`.
- Rodar `npm install`. Esperado: termina sem erro de peer dependency.

- [ ] **Step 4: Rodar o codemod oficial e renomear o middleware**

```bash
npx @next/codemod@latest upgrade latest
```
Depois do codemod:
- precisa existir `proxy.ts` exportando `async function proxy(request: NextRequest)`, com o mesmo `config.matcher` do patch (`['/painel/:path*', '/coordenador/:path*', '/proprietario/:path*']`);
- `middleware.ts` não pode mais existir;
- os usos de `cookies()` (em `lib/supabase/server.ts`), de `params` e de `searchParams` precisam estar com `await`.

- [ ] **Step 5: Criar `eslint.config.mjs`**

Config flat com `eslint-config-next` (`core-web-vitals` + `typescript`), ignorando `.next/` e `node_modules/`.

- [ ] **Step 6: Trocar o logo dos demais headers por `LogoSecreto`**

Em cada arquivo da lista de **Files**, substituir o `<Link href="/">…<img src="/logo.png" …/></Link>` do header por `<LogoSecreto …mesmas classes… />`.

- [ ] **Step 7: Build, lint, typecheck e testes**

Run:
```bash
npm run typecheck && npm run lint && npm test && npm run build
```
Esperado: os 4 sem erro. Se o build falhar por API assíncrona que o codemod não cobriu, corrigir com `await` no ponto indicado e rodar de novo.

- [ ] **Step 8: Smoke test local** (Review Focus 4)

1. Rodar `npm run dev`.
2. Com o `.env.local` apontando para o Supabase de desenvolvimento, que ainda está sem as migrações novas, abrir:
   - `/`, `/noticias`, `/atletasdestaques`, `/agenda`, `/campeonatos`;
   - `/projetosocial`, `/tv`, `/sumula`;
   - `/login`, `/privacidade`, `/termos`.

Esperado:
- todas respondem 200, e sem erro vermelho no console do servidor;
- home e notícias mostram os cards padrão;
- 3 cliques no logo da home e de `/noticias` abrem "Acesso restrito";
- 1 clique em `/noticias` vai para `/`.

- [ ] **Step 9: Commit**

```bash
git add -A
git reset .env.local 2>/dev/null; git status --short | grep -q '.env.local' && echo "ERRO: .env.local staged"
git commit -m "feat: aplica padrão editorial + 44 correções e migra para Next 16"
```

---

### Task 4: Limpeza

**Files:**
- Delete: `components/PatchKit.tsx`, `components/PatchDownload.tsx`, `components/SyncControlRoom.tsx`, `components/InteractiveMindMap.tsx`, `components/NodeInspectorPanel.tsx`, `components/RoutesAuditTable.tsx`, `components/NoVercelGuide.tsx`, `components/DomainActivation.tsx`, `components/RebuiltArenaSite.tsx`, `components/OwnerPanel.tsx`, `components/PainelMetricas.tsx`, `auditData.ts`, `patchFiles.ts`, `patchKit.ts`, `syncData.ts`, `domainData.ts`, `arenaSiteData.ts`
- Delete se existir na pasta: `Untitled-1.txt`, `src/data`, `tailwind.config.js`, `middleware.ts.bak`. Os não rastreados são apagados direto do disco; o conteúdo do `.bak` já está no histórico do git.
- Modify: `.gitignore`

- [ ] **Step 1: Confirmar que nada fora da lista importa esses arquivos**

Run:
```bash
grep -rnE "PatchKit|PatchDownload|SyncControlRoom|InteractiveMindMap|NodeInspectorPanel|RoutesAuditTable|NoVercelGuide|DomainActivation|RebuiltArenaSite|OwnerPanel|PainelMetricas|auditData|patchFiles|patchKit|syncData|domainData|arenaSiteData" app components lib proxy.ts
```
Esperado: só aparecem linhas de dentro dos próprios arquivos da lista. Se algum arquivo **fora** da lista importar algum deles, ele não é apagado, e o caso é anotado no relatório final.

- [ ] **Step 2: Apagar e ajustar o `.gitignore`**

Garantir no `.gitignore` as linhas `.env.local`, `.env*.local`, `.next/`, `node_modules/`, `coverage/`.

- [ ] **Step 3: Build e testes**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Esperado: os 4 sem erro.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: remove ferramentas de auditoria/patch e arquivos soltos"
```

---

### Task 5: Banco de desenvolvimento e README

O proprietário executa as etapas que exigem conta ou chave. O agente prepara os comandos e verifica o resultado.

**Files:**
- Modify: `README.md` (reescrito)
- Modify: `package.json` (script `db:seed`: `tsx scripts/seed.ts`, com `tsx` em devDependencies e leitura do `.env.local` via `--env-file=.env.local`)
- Modify: `scripts/seed.ts` só se o seed quebrar contra o schema do patch (colunas renomeadas pelas migrações 0006/0007)

- [ ] **Step 1 (proprietário): colocar a chave de serviço**

O proprietário abre o Supabase em **Settings → API**, copia a `service_role` e adiciona ao `.env.local` do worktree a linha `SUPABASE_SERVICE_ROLE_KEY=…`. O agente só confere que a variável existe:
```bash
grep -c '^SUPABASE_SERVICE_ROLE_KEY=.' .env.local
```
Esperado: `1`. Nunca imprimir o valor.

- [ ] **Step 2 (proprietário): aplicar as migrações**

Duas opções, à escolha do proprietário:
- **(a) CLI:** `npx supabase login`, depois `npx supabase link --project-ref <ref>`, depois `npx supabase db push`;
- **(b) painel:** colar no **SQL Editor** do Supabase, em ordem, o conteúdo de `supabase/migrations/0001…0007`.

Esperado: sem erro. As tabelas `noticias`, `atletas_destaque` e `site_config` e a view `v_classificacao` existem.

- [ ] **Step 3: Rodar o seed**

Run: `npm run db:seed`
Esperado: termina com a mensagem de sucesso do script. Ao recarregar `/agenda` e `/campeonatos` no `npm run dev`, aparecem os campeonatos do seed (ex.: "Copa Arena Vale 2026").

- [ ] **Step 4: Reescrever o `README.md`**

Seções:
1. O que é (site Arena Vale, link de produção).
2. Stack (Next 16, React 19, Supabase, Tailwind 3, Vitest).
3. Rodar localmente (`npm install`, `.env.local` com as 3 chaves, `npm run dev`).
4. Variáveis de ambiente (as 3 do Supabase; as de Telegram e Cron entram nas fases 2 e 3).
5. Banco (as duas formas de aplicar as migrações do Step 2 e o `npm run db:seed`).
6. Scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `db:seed`).
7. Deploy (Vercel com preview por branch).

- [ ] **Step 5: Commit**

```bash
git add README.md package.json package-lock.json scripts/seed.ts
git commit -m "docs: README real + script de seed"
```

---

### Task 6: Push da branch e preview na Vercel

- [ ] **Step 1 (proprietário): conferir as variáveis na Vercel**

No painel da Vercel (projeto `arena-vale` → **Settings → Environment Variables**), confirmar que `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` existem para **Preview** e **Production** (Review Focus 5).

- [ ] **Step 2: Push da branch** (só com o ok do proprietário)

```bash
git push -u origin organizacao
```
Esperado: a Vercel cria um deploy de preview da branch.

- [ ] **Step 3: Smoke test no preview**

Repetir no link de preview a lista de rotas do Step 8 da Task 3.

Esperado:
- tudo responde 200;
- agenda e campeonatos mostram os dados do seed;
- o toque triplo abre "Acesso restrito".

- [ ] **Step 4: Relatório para o proprietário**

Mensagem curta com:
- o link de preview;
- o que foi verificado;
- arquivos que foram mantidos por estarem em uso (Task 4, Step 1), se houver;
- o próximo passo: escrever o plano da Fase 2.

O merge na `main` só acontece quando o proprietário aprovar.
