# Mesa do Jogo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que um delegado nomeado pelo coordenador atualize o placar ao vivo pelo celular, com bloqueio automático da conta ao finalizar o jogo e exibição do placar em tempo real para os visitantes.

**Architecture:** Novo cargo `delegado` no enum `user_role`; coluna `delegado_id` em `jogos` vincula o delegado ao jogo; página `/delegado` mobile-first com botões grandes; home exibe badge AO VIVO com placar quando `status = ao_vivo`.

**Tech Stack:** Next.js 16 App Router, Supabase (RLS + triggers), Tailwind/CSS customizado do projeto, TypeScript.

**Spec:** Design aprovado na conversa de 13/11/2026 (mensagens: "o COORDENADOR" até "sim").

## Global Constraints

- Nunca escrever "Sports" ou "Sport" para a marca ARENA VALE.
- Cargo do banco mapeado em `lib/auth/rotas.ts` — toda mudança de cargo exige atualizar o `Cargo` type, `REGRAS`, `PAINEL` e `cargoDoBanco`.
- Testes de banco só rodam no banco TESTES (`jxusepdpzlcwcrgwngbm`), nunca no banco oficial (`cpvmfpxxrdpvfbonwynr`).
- Build: parar servidor da porta 3100 antes; `rm -rf .next` em caso de EPERM.
- Vitest: `npx vitest run --maxWorkers=2`.
- Commits em português no formato "contexto: o que faz".
- SQL do dono: sem comentários, `begin;`/`commit;`, validar no TESTES antes de gerar o arquivo do dono.

## Review Focus

1. **Delegado atualiza jogo de outro** — `is_delegado_do_jogo(id)` deve comparar `delegado_id` com `auth.uid()`. Task 1 testa isso.
2. **Delegado muda `delegado_id` para se promover** — trigger bloqueia alteração de `delegado_id` por não-staff. Task 1 testa isso.
3. **Coordenador acessa `/delegado` para testar** — página deve funcionar para 'coordenador' (vê o seletor de jogo). Task 5 cobre.
4. **Trigger de bloqueio falha silenciosamente** — trigger usa `security definer`; teste valida que role virou 'autenticado'. Task 1 testa.
5. **`nome_casa_custom` vazio não substitui o nome real** — `MesaDoJogo` exibe custom name só se não-nulo/não-vazio. Task 5 cobre no componente.

---

## Task 1: SQL — cargo delegado, colunas e triggers

**Files:**
- Create: `supabase/migrations/0021_delegado.sql`
- Create: `supabase/migrations/0021_delegado-dono.sql` (versão sem comentários para o dono rodar)
- Create (temp): `.superpowers/tmp/valida-0021.mts` (validação no TESTES)
- Test: `tests/db/delegado.test.ts`

**Interfaces:**
- Produces:
  - `user_role` enum com valor 'delegado'
  - `jogos.delegado_id uuid`
  - `jogos.nome_casa_custom text`
  - `jogos.nome_visitante_custom text`
  - `is_delegado_do_jogo(uuid) → bool`
  - Política `jogos_atualiza` atualizada
  - Trigger `tr_bloquear_delegado_ao_finalizar`

- [ ] **Step 1: Escrever `supabase/migrations/0021_delegado.sql`**

```sql
-- 1) novo cargo
alter type user_role add value if not exists 'delegado';

-- 2) novas colunas em jogos
alter table public.jogos
  add column if not exists delegado_id uuid references public.profiles(id) on delete set null,
  add column if not exists nome_casa_custom text check (char_length(nome_casa_custom) <= 80),
  add column if not exists nome_visitante_custom text check (char_length(nome_visitante_custom) <= 80);

create index if not exists idx_jogos_delegado on public.jogos(delegado_id);

-- 3) função auxiliar de RLS
create or replace function public.is_delegado_do_jogo(p_jogo_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.jogos
    where id = p_jogo_id and delegado_id = auth.uid()
  );
$$;

-- 4) refazer política de update em jogos (inclui delegado)
drop policy if exists jogos_atualiza on public.jogos;
create policy jogos_atualiza on public.jogos for update
  using (
    public.is_staff()
    or public.is_moderador_do_campeonato(campeonato_id)
    or public.is_delegado_do_jogo(id)
  )
  with check (
    public.is_staff()
    or public.is_moderador_do_campeonato(campeonato_id)
    or public.is_delegado_do_jogo(id)
  );

-- 5) atualizar trigger que protege campos estruturais:
--    não-staff não pode mudar delegado_id nem os campos de equipe/data
create or replace function public.moderador_so_resultado()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff() then return new; end if;
  if new.data is distinct from old.data
     or new.local is distinct from old.local
     or new.time_casa_id is distinct from old.time_casa_id
     or new.time_visitante_id is distinct from old.time_visitante_id
     or new.campeonato_id is distinct from old.campeonato_id
     or new.fase is distinct from old.fase
     or new.rodada is distinct from old.rodada
     or new.delegado_id is distinct from old.delegado_id then
    raise exception 'Apenas a coordenação altera dados estruturais do jogo.';
  end if;
  return new;
end;
$$;

-- 6) trigger que bloqueia o delegado ao finalizar o jogo
create or replace function public.bloquear_delegado_ao_finalizar()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'finalizado'
     and (old.status is distinct from 'finalizado')
     and new.delegado_id is not null then
    update public.profiles set role = 'autenticado' where id = new.delegado_id;
  end if;
  return new;
end;
$$;
drop trigger if exists tr_bloquear_delegado_ao_finalizar on public.jogos;
create trigger tr_bloquear_delegado_ao_finalizar
  after update of status on public.jogos
  for each row execute function public.bloquear_delegado_ao_finalizar();

notify pgrst, 'reload schema';
```

- [ ] **Step 2: Escrever `.superpowers/tmp/valida-0021.mts` e validar no banco TESTES**

Script com `pg.Client` usando `TEST_DATABASE_URL`; executa a SQL completa e faz rollback. Padrão dos scripts anteriores da Fase 4A.

Run: `npx tsx .superpowers/tmp/valida-0021.mts`
Expected: "SQL válida ✓"

- [ ] **Step 3: Escrever `tests/db/delegado.test.ts`**

```typescript
// @vitest-environment node
it('delegado lê jogos normalmente', ...)
it('delegado atualiza placar e status do próprio jogo', ...)
it('delegado não atualiza jogo de outro delegado', ...)
it('delegado não muda delegado_id', ...)
it('ao finalizar, role do delegado vira autenticado', ...)
it('coordenador continua podendo atualizar tudo', ...)
```

Usar `admin()`, `clienteComo()` e `criarUsuario()` das fixtures existentes em `tests/db/`.

- [ ] **Step 4: Rodar testes**

Run: `npx vitest run tests/db/delegado.test.ts --maxWorkers=2`
Expected: 6 passed

- [ ] **Step 5: Gerar arquivo do dono `supabase-FASE4-3-delegado.sql`**

No diretório pai (`ARENA VALE/`), criar o arquivo sem comentários com `begin;`/`commit;` conforme padrão.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0021_delegado.sql tests/db/delegado.test.ts
git commit -m "db: cargo delegado, colunas e triggers na tabela jogos (0021)"
```

---

## Task 2: Camada de autenticação

**Files:**
- Modify: `lib/auth/rotas.ts`
- Modify: `lib/auth/rotas.test.ts`
- Modify: `lib/auth/mensagens.ts`
- Modify: `lib/auth/convites.ts`
- Modify: `app/api/convites/route.ts`
- Modify: `proxy.ts`

**Interfaces:**
- Consumes: Task 1 — enum 'delegado' existe no banco.
- Produces:
  - `Cargo` type inclui `'delegado'`
  - `cargoDoBanco('delegado')` → `'delegado'`
  - `/delegado` protegido para cargo 'delegado' e 'coordenador'
  - `CargoConvite` inclui `'delegado'`; criar delegado não exige campeonatoId

- [ ] **Step 1: Atualizar `lib/auth/rotas.ts`**

```typescript
export type Cargo = 'visitante' | 'autenticado' | 'coordenador' | 'moderador' | 'capitao' | 'delegado';

// Em REGRAS, adicionar:
{ prefixo: '/delegado', permite: ['delegado', 'coordenador'] },

// Em PAINEL, adicionar:
delegado: '/delegado',

// Em cargoDoBanco, adicionar antes do return 'autenticado':
if (role === 'delegado') return 'delegado';
```

- [ ] **Step 2: Atualizar `lib/auth/rotas.test.ts`**

Adicionar casos: delegado acessa `/delegado` → 'livre'; delegado acessa `/moderador` → 'negado'; visitante acessa `/delegado` → 'login'.

- [ ] **Step 3: Rodar testes de rotas**

Run: `npx vitest run lib/auth/rotas.test.ts --maxWorkers=2`
Expected: PASS

- [ ] **Step 4: Atualizar `lib/auth/mensagens.ts`**

Adicionar `delegado: 'Delegado'` em `ROTULO_CARGO`.

- [ ] **Step 5: Atualizar `lib/auth/convites.ts`**

```typescript
export type CargoConvite = 'coordenador' | 'moderador' | 'capitao' | 'delegado';

// Na função convidar():
// — delegado não precisa de campeonatoId (como coordenador)
// — delegado não chama vincular()
// Mudar a guarda:
if (entrada.cargo !== 'coordenador' && entrada.cargo !== 'delegado' && !campeonatoId) {
  return { ok: false, status: 400, erro: 'Escolha o campeonato.' };
}
// No bloco vincular():
if (entrada.cargo !== 'coordenador' && entrada.cargo !== 'delegado') {
  const erroVinculo = await deps.vincular(entrada.cargo as 'moderador' | 'capitao', id, campeonatoId!);
  ...
}
```

- [ ] **Step 6: Atualizar `app/api/convites/route.ts`**

Mudar a validação de cargo de:
`['coordenador', 'moderador', 'capitao'].includes(corpo.cargo)`
para:
`['coordenador', 'moderador', 'capitao', 'delegado'].includes(corpo.cargo)`

- [ ] **Step 7: Atualizar `proxy.ts`**

Adicionar `'/delegado/:path*'` ao `config.matcher`.

- [ ] **Step 8: Verificar tipos**

Run: `npx tsc --noEmit` (via cmd.exe)
Expected: 0 erros

- [ ] **Step 9: Commit**

```bash
git add lib/auth/rotas.ts lib/auth/rotas.test.ts lib/auth/mensagens.ts lib/auth/convites.ts app/api/convites/route.ts proxy.ts
git commit -m "auth: cargo delegado — rotas, convites e middleware"
```

---

## Task 3: Aba Delegados no painel

**Files:**
- Modify: `components/painel/abas.ts`
- Create: `components/coord-delegados.tsx`
- Modify: `components/coord-shell.tsx`

**Interfaces:**
- Consumes: Task 2 — `CargoConvite` inclui 'delegado'; rota `/api/convites` aceita delegado.
- Produces: Tab 'delegados' visível no painel; coordenador cria/lista/remove contas de delegado.

- [ ] **Step 1: Adicionar aba em `components/painel/abas.ts`**

Inserir `{ id: 'delegados', rotulo: 'Delegados' }` após `{ id: 'moderadores', ... }`.

- [ ] **Step 2: Criar `components/coord-delegados.tsx`**

Componente client `CoordDelegados`. Diferenças em relação a `CoordVinculos`:
- Sem seletor de campeonato (delegado não precisa de um).
- POST para `/api/convites` com `{ email, cargo: 'delegado', senha, nome }`.
- Lista busca `profiles` onde `role = 'delegado'` (via Supabase `from('profiles').select(...).eq('role', 'delegado')`).
- Remover: define `role = 'autenticado'` (não apaga a conta — a conta volta ao estado neutro). Usar a rota `DELETE /api/convites` ou update direto via `supabase.from('profiles').update({ role: 'autenticado' }).eq('id', id)` (a RLS `profiles_staff` permite staff atualizar role de não-coordenador).
- Texto de ajuda: "O delegado atualiza o placar ao vivo no dia do jogo. A conta é bloqueada automaticamente ao finalizar o jogo."

- [ ] **Step 3: Importar e renderizar em `components/coord-shell.tsx`**

Importar `CoordDelegados`. Adicionar bloco `{tab === 'delegados' && <CoordDelegados />}` após o bloco de moderadores.

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: 0 erros

- [ ] **Step 5: Commit**

```bash
git add components/painel/abas.ts components/coord-delegados.tsx components/coord-shell.tsx
git commit -m "painel: aba Delegados para criar e listar contas de delegado"
```

---

## Task 4: Vincular delegado ao jogo no painel

**Files:**
- Modify: `components/coord-jogos.tsx`

**Interfaces:**
- Consumes: Task 1 — coluna `delegado_id` existe em `jogos`; Task 3 — contas de delegado existem.
- Produces: Campo "Delegado do jogo" no card de cada jogo; salva `delegado_id` via update Supabase.

- [ ] **Step 1: Carregar lista de delegados em `CoordJogos`**

No `useEffect`, adicionar query:
```typescript
supabase.from('profiles').select('id, full_name, email').eq('role', 'delegado').order('full_name')
```
Guardar em `const [delegados, setDelegados] = useState<{id:string; full_name:string|null; email:string|null}[]>([])`.

Atualizar a query de jogos para incluir `delegado_id` no select.

- [ ] **Step 2: Adicionar picker por jogo**

No card de cada jogo, após o bloco de placar, adicionar:
```tsx
<label className="grid gap-1 text-xs mt-3">
  Delegado do jogo
  <select
    value={jogo.delegado_id ?? ''}
    onChange={(e) => atribuirDelegado(jogo.id, e.target.value || null)}
    className="input text-sm"
  >
    <option value="">— sem delegado —</option>
    {delegados.map((d) => (
      <option key={d.id} value={d.id}>{d.full_name ?? d.email}</option>
    ))}
  </select>
</label>
```

- [ ] **Step 3: Implementar `atribuirDelegado(jogoId, delegadoId)`**

```typescript
async function atribuirDelegado(jogoId: string, delegadoId: string | null) {
  const { error } = await supabase.from('jogos').update({ delegado_id: delegadoId }).eq('id', jogoId);
  if (error) return setMensagem(`Erro: ${error.message}`);
  setJogos((prev) => prev.map((j) => j.id === jogoId ? { ...j, delegado_id: delegadoId } : j));
}
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: 0 erros

- [ ] **Step 5: Commit**

```bash
git add components/coord-jogos.tsx
git commit -m "painel: seletor de delegado por jogo em Agenda e jogos"
```

---

## Task 5: Página `/delegado` — Mesa do Jogo

**Files:**
- Create: `app/(coord)/delegado/page.tsx`
- Create: `components/delegado/MesaDoJogo.tsx`

**Interfaces:**
- Consumes: Tasks 1–4 — delegado existe, tem conta, está atribuído ao jogo.
- Produces: Página `/delegado` mobile-first; delegado vê jogo(s) atribuídos, atualiza placar.

- [ ] **Step 1: Criar `app/(coord)/delegado/page.tsx`**

Servidor. Padrão do `app/(coord)/moderador/page.tsx`.

```typescript
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mesa do Jogo | ARENA VALE', robots: { index: false, follow: false } };

export default async function DelegadoPage() {
  const supabase = await createClient();
  const { cargo, userId } = await lerCargo(supabase);
  if (!userId) redirect('/login?next=/delegado');
  if (cargo !== 'delegado' && cargo !== 'coordenador') redirect('/acesso-negado');

  // Buscar jogo(s) atribuídos ao delegado (ou todos se coordenador)
  let q = supabase
    .from('jogos')
    .select('id, data, local, status, placar_casa, placar_visitante, nome_casa_custom, nome_visitante_custom, casa:times!jogos_time_casa_id_fkey(id, nome), fora:times!jogos_time_visitante_id_fkey(id, nome)')
    .order('data', { ascending: true });
  if (cargo === 'delegado') q = q.eq('delegado_id', userId).not('status', 'in', '("finalizado","cancelado","adiado")');
  const { data: jogos } = await q;

  return (
    <>
      <CabecalhoEquipe titulo="Mesa do Jogo" subtitulo="Placar ao vivo" />
      <main className="mx-auto w-full max-w-lg px-4 py-6">
        <MesaDoJogo jogos={(jogos ?? []) as JogoDelegado[]} ehCoordenador={cargo === 'coordenador'} />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Criar `components/delegado/MesaDoJogo.tsx`**

Tipo exportado:
```typescript
export type JogoDelegado = {
  id: string; data: string; local: string | null; status: string;
  placar_casa: number; placar_visitante: number;
  nome_casa_custom: string | null; nome_visitante_custom: string | null;
  casa: { id: string; nome: string }; fora: { id: string; nome: string };
};
```

UI quando 0 jogos: "Nenhum jogo atribuído a você hoje."

UI quando 1 jogo: exibe diretamente o cartão da mesa.

UI quando 2+ jogos: exibe lista de seleção (`<select>` grande), depois o cartão do jogo selecionado.

**Cartão da mesa:**
- Nome casa (editável inline — `<input>` inicialmente oculto, aparece ao clicar no nome; salva ao `onBlur` via update Supabase `nome_casa_custom`; exibe `nome_casa_custom || casa.nome`).
- Placar central grande: `{placarCasa} × {placarFora}`.
- Nome visitante (mesmo padrão).
- Botões de gol: `+ GOL CASA` e `+ GOL FORA` — grandes, `height: 72px`, `font-size: 1.25rem`.
- Botão `− Desfazer último gol` (incrementa −1 no último time que marcou — ou se não sabe, mostra dois mini-botões `− Casa` / `− Fora`).
- Botão `🔴 Iniciar jogo` (muda status para 'ao_vivo') — aparece quando status = 'agendado'.
- Botão `✓ Finalizar jogo` (muda status para 'finalizado') — aparece quando status = 'ao_vivo'.
- Mensagem de confirmação após cada ação.

Todas as updates vão direto para Supabase client (anon com RLS) sem rota de API.

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: 0 erros

- [ ] **Step 4: Commit**

```bash
git add app/'(coord)'/delegado/page.tsx components/delegado/MesaDoJogo.tsx
git commit -m "delegado: página Mesa do Jogo com botões de gol e controle de status"
```

---

## Task 6: Placar ao vivo na home

**Files:**
- Modify: `components/home/AgendaArena.tsx`
- Modify: `app/midia.css`

**Interfaces:**
- Consumes: `ItemAgenda` já inclui `status`, `placar_casa`, `placar_visitante` (via `deJogos` em `agenda.ts`).
- Produces: Badge 🔴 AO VIVO + placar visível nos cartões da seção "Hoje na Arena".

- [ ] **Step 1: Verificar que `ItemAgenda` carrega placar para jogos ao_vivo**

Ler `lib/midia/agenda.ts` → função `deJogos`. Atualmente `placar` é preenchido só quando `status === 'finalizado'`. Adicionar condição: quando `status === 'ao_vivo'` e `placar_casa != null`, preencher `placar` também.

- [ ] **Step 2: Atualizar `components/home/AgendaArena.tsx`**

No `<article className="jogo">`, após `<div className="quando">`, adicionar:

```tsx
{j.status === 'ao_vivo' && (
  <div className="ao-vivo-placar">
    <span className="badge-ao-vivo">🔴 AO VIVO</span>
    {j.placar && <span className="placar-ao-vivo">{j.placar}</span>}
  </div>
)}
{j.status === 'finalizado' && j.placar && (
  <span className="d">{j.placar}</span>
)}
```

- [ ] **Step 3: Adicionar estilos em `app/midia.css`**

```css
.ao-vivo-placar { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.badge-ao-vivo { font-size: 11px; font-weight: 800; letter-spacing: .05em; color: #e50914; }
.placar-ao-vivo { font-family: var(--display); font-weight: 900; font-size: 15px; }
```

- [ ] **Step 4: Rodar testes de agenda**

Run: `npx vitest run lib/midia/agenda.test.ts --maxWorkers=2`
Expected: PASS (todos os testes existentes continuam passando)

- [ ] **Step 5: Commit**

```bash
git add components/home/AgendaArena.tsx lib/midia/agenda.ts app/midia.css
git commit -m "home: placar ao vivo com badge AO VIVO na seção Hoje na Arena"
```

---

## Task 7: Publicar e validar

**Files:**
- Modify: `README.md` (opcional — uma linha sobre o cargo delegado)

- [ ] **Step 1: Merge organizacao → main e push**

```bash
git checkout main
git merge --no-ff organizacao -m "Publica Mesa do Jogo — delegado ao vivo"
git push origin main
git checkout organizacao
```

- [ ] **Step 2: Gerar arquivo do dono**

O arquivo `ARENA VALE/supabase-FASE4-3-delegado.sql` já foi gerado na Task 1. Instrução ao dono: rodar no painel do Supabase → SQL Editor antes de usar a funcionalidade.

- [ ] **Step 3: Verificar no site**

Após o deploy, acessar `https://www.arenavale.com.br/delegado` logado como coordenador e confirmar que a página carrega corretamente.
