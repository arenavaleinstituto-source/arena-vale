# ARENA VALE Home Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the public home page of www.arenavale.com.br with a visual moderno and visually-explanatory layout, porting the design language from the approved `mestre-dos-sites` proposal (artifact EspXov4zJJXUBBjD3GFRZc) into the existing Next.js + Tailwind + midia.css stack, keeping all live data connections intact.

**Architecture:** Each section of the home page is an independent React component; CSS goes into `app/midia.css` as new utility classes; interactive sections (orbit, counters) use Client Components. No new dependencies needed. The existing data flow (Supabase → Server Components → props) is untouched.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, `app/midia.css` for custom classes

**Spec:** `docs/superpowers/specs/2026-11-09-fase-3-previa-home.html` (Fase 3 spec), plus the visual reference at artifact `EspXov4zJJXUBBjD3GFRZc`

## Global Constraints

- Brand always **ARENA VALE** (all caps), never "Sports" or "Sport"
- Color `--vermelho: #e50914` and `--vermelho-claro: #ff3b44` — same in both maquete and site
- All live data connections stay intact — no hardcoded sport data
- No new npm packages
- All heading text-transform: uppercase (already in globals.css base layer)
- Tests: `npx vitest run` must stay at 476/476 pass
- Branch: create `redesign/home` from `main` before any changes

## Review Focus

- CSS specificity collisions between new `.corre`, `.cobertura`, `.mosaico-*` classes and existing `.trilho`, `.cartaz`, `.agenda` classes in midia.css
- Orbit client component hydration: server renders static list, client upgrades to animated orbit — no flash of unstyled content
- Mosaico layout on mobile (<640px): big card and 3 small cards must stack cleanly without horizontal overflow
- Empty-state rendering: all new components must render without crashing when their data props are empty arrays or null
- ModalidadesCorre strip: marquee animation must pause on hover/focus (`animation-play-state: paused`) for accessibility

---

### Task 1: Branch setup + warm dark palette in midia.css

**Files:**
- Modify: `app/midia.css:1-10` (add warm-dark surface tokens)

**Interfaces:**
- Produces: CSS custom properties `--papel`, `--tinta-suave` available to all subsequent tasks

- [ ] **Step 1: Create branch**

Run: `git -C "c:\Users\mmaur\OneDrive\Desktop\ARENA VALE\arena-vale" checkout -b redesign/home`
Expected: Switched to a new branch 'redesign/home'

- [ ] **Step 2: Add warm-dark surface tokens to :root in midia.css**

After the existing `:root` block at top of `globals.css` (which has `--preto`, `--grafite`, etc.), add to `app/midia.css` at the very top (before `.faixa`):

```css
/* Tokens extras do redesign (warm-dark, da paleta da proposta aprovada) */
:root {
  --papel: #1e1718;        /* superfície quente — cartões e fundos alternados */
  --tinta-suave: #b4a7a8;  /* texto secundário sobre fundo quente */
}
```

- [ ] **Step 3: Commit**

```bash
git add app/midia.css
git commit -m "style: add warm-dark surface tokens for home redesign

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Completion test:** `npx vitest run` — Expected: 476 passed

---

### Task 2: Banner — add stats bullets and CTAs

**Files:**
- Modify: `components/home/Banner.tsx`
- Modify: `app/midia.css` (add `.hero-stats`, `.hero-acoes` classes)

**Interfaces:**
- Consumes: `capaUrl: string` (unchanged), `whatsapp: string` (new prop), `linkAssistir: string` (new prop)
- Produces: `Banner` component with 2 CTAs and 3 stat bullets

- [ ] **Step 1: Write failing test**

In `components/home/home.test.tsx`, add inside the `Banner` describe block (or at file top):

```typescript
it('Banner shows WhatsApp CTA and stats bullets', () => {
  render(<Banner capaUrl="" whatsapp="5547988444404" linkAssistir="https://youtube.com" />);
  expect(screen.getByRole('link', { name: /falar com a arena vale/i })).toBeInTheDocument();
  expect(screen.getByText(/\+1\.200/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test — confirm it fails**

Run: `npx vitest run components/home/home.test`
Expected: FAIL — `whatsapp` prop missing from Banner signature

- [ ] **Step 3: Update Banner.tsx**

New props: `{ capaUrl: string; whatsapp: string; linkAssistir: string }`. Inside `.dentro`, after the `<p>`, add:

```tsx
<div className="hero-acoes">
  <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Quero divulgar o meu torneio na ARENA VALE.')}`}
     className="av-btn forte" target="_blank" rel="noopener noreferrer">
    Falar com a ARENA VALE
  </a>
  <a href={linkAssistir} className="av-btn leve" target="_blank" rel="noopener noreferrer">
    Assistir ao vivo
  </a>
</div>
<ul className="hero-stats">
  <li><b>+1.200</b> jovens no projeto social</li>
  <li><b>Todo o esporte</b> futebol, futsal, society, basquete, vôlei</li>
  <li><b>Ao vivo</b> no canal TV Arena Vale</li>
</ul>
```

Add to `midia.css`:
```css
.hero-acoes { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.hero-stats { list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 22px; margin-top: 10px; font-size: 14px; color: var(--tinta-suave, #b4a7a8); }
.hero-stats b { color: var(--branco); font-weight: 700; }
```

- [ ] **Step 4: Update app/page.tsx — pass new props to Banner**

Change: `<Banner capaUrl={config.capaUrl} />`
To: `<Banner capaUrl={config.capaUrl} whatsapp={config.whatsapp} linkAssistir={linkAssistirAoVivo(config)} />`

- [ ] **Step 5: Run test — confirm passes**

Run: `npx vitest run components/home/home.test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/home/Banner.tsx app/midia.css app/page.tsx
git commit -m "feat(home): banner with CTAs and stats bullets

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Completion test:** `npx vitest run` — Expected: 476+ passed

---

### Task 3: ModalidadesCorre — scrolling strip after Banner

**Files:**
- Create: `components/home/ModalidadesCorre.tsx`
- Modify: `app/midia.css` (add `.corre` classes)
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: none (static list)
- Produces: `ModalidadesCorre` component rendered after `<Banner>` in page.tsx

- [ ] **Step 1: Write failing test in a new file**

Create `components/home/ModalidadesCorre.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import { ModalidadesCorre } from './ModalidadesCorre';
it('renders all 5 modalidades', () => {
  render(<ModalidadesCorre />);
  expect(screen.getByText('Futebol')).toBeInTheDocument();
  expect(screen.getByText('Vôlei')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test — confirm fails**

Run: `npx vitest run components/home/ModalidadesCorre`
Expected: FAIL — module not found

- [ ] **Step 3: Create ModalidadesCorre.tsx**

```tsx
const MODS = ['Futebol', 'Futsal', 'Society', 'Basquete', 'Vôlei'];

export function ModalidadesCorre() {
  return (
    <div className="corre" aria-label="Modalidades">
      <div className="corre-fita" aria-hidden="true">
        {[...MODS, ...MODS].map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
    </div>
  );
}
```

Add to `midia.css`:
```css
/* faixa de modalidades correndo */
.corre { overflow: hidden; background: #1a0f10; border-block: 1px solid #2e1a1b; padding-block: 13px; }
.corre-fita { display: flex; gap: 0 28px; width: max-content; animation: corre-scroll 18s linear infinite; }
.corre-fita:hover { animation-play-state: paused; }
.corre span { font-family: var(--rotulo); font-weight: 700; text-transform: uppercase; letter-spacing: .18em; font-size: 13px; color: var(--branco); padding-right: 28px; border-right: 4px solid var(--vermelho); }
@keyframes corre-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .corre-fita { animation: none; } }
```

- [ ] **Step 4: Add to page.tsx after `<Banner ...>`**

```tsx
import { ModalidadesCorre } from '@/components/home/ModalidadesCorre';
// in JSX: <ModalidadesCorre />
```

- [ ] **Step 5: Run test**

Run: `npx vitest run components/home/ModalidadesCorre`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/home/ModalidadesCorre.tsx components/home/ModalidadesCorre.test.tsx app/midia.css app/page.tsx
git commit -m "feat(home): modalidades scrolling strip after banner

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Completion test:** `npx vitest run` — Expected: 477+ passed

---

### Task 4: CoberturaCards — "O que você encontra aqui"

**Files:**
- Create: `components/home/CoberturaCards.tsx`
- Modify: `app/midia.css` (add `.cobertura-*` classes)
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: none (static content)
- Produces: `CoberturaCards` component — 6 feature cards explaining the site

- [ ] **Step 1: Write failing test**

Create `components/home/CoberturaCards.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import { CoberturaCards } from './CoberturaCards';
it('renders 6 feature cards', () => {
  render(<CoberturaCards />);
  expect(screen.getByText('Transmissões ao vivo')).toBeInTheDocument();
  expect(screen.getByText('Esporte mundial')).toBeInTheDocument();
  const cards = document.querySelectorAll('.cobertura-cartao');
  expect(cards).toHaveLength(6);
});
```

- [ ] **Step 2: Run test — confirm fails**

Run: `npx vitest run components/home/CoberturaCards`
Expected: FAIL — module not found

- [ ] **Step 3: Create CoberturaCards.tsx**

```tsx
const CARDS = [
  { titulo: 'Transmissões ao vivo', texto: 'Os jogos no canal TV Arena Vale, com aviso para não perder nenhuma partida.' },
  { titulo: 'Notícias do Vale', texto: 'Notícias, resultados e bastidores dos campeonatos da região.' },
  { titulo: 'Agenda dos jogos', texto: 'Jogos de hoje e dos próximos dias, com local, horário e fase.' },
  { titulo: 'Fotos dos jogos', texto: 'As melhores imagens da Arena para ver, baixar e compartilhar.' },
  { titulo: 'Atletas destaque', texto: 'Quem brilhou em quadra e no campo. O jogo não termina no placar.' },
  { titulo: 'Esporte mundial', texto: 'As notícias do esporte pelo mundo, selecionadas pela coordenação.' },
];

export function CoberturaCards() {
  return (
    <section className="faixa" id="cobertura" style={{ background: 'var(--papel)' }}>
      <div className="dentro">
        <div className="cab">
          <span className="eyebrow">O que você encontra aqui</span>
          <h2>Tudo do esporte do Vale <em className="accent">num lugar só.</em></h2>
          <p>Do apito inicial ao placar final, a ARENA VALE acompanha cada jogo.</p>
        </div>
        <div className="cobertura-grade">
          {CARDS.map((c) => (
            <article className="cobertura-cartao" key={c.titulo}>
              <h3>{c.titulo}</h3>
              <p>{c.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Add to `midia.css`:
```css
.cobertura-grade { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
.cobertura-cartao { background: var(--grafite-2); border: 1px solid var(--linha); border-radius: 20px; padding: 24px; }
.cobertura-cartao h3 { font-family: var(--display); font-weight: 800; font-size: 18px; text-transform: uppercase; margin-bottom: 10px; }
.cobertura-cartao p { color: var(--cinza); font-size: 15px; line-height: 1.6; }
```

- [ ] **Step 4: Add to page.tsx after `<ModalidadesCorre />`**

- [ ] **Step 5: Run test**

Run: `npx vitest run components/home/CoberturaCards`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/home/CoberturaCards.tsx components/home/CoberturaCards.test.tsx app/midia.css app/page.tsx
git commit -m "feat(home): cobertura feature cards section

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Completion test:** `npx vitest run` — Expected: 478+ passed

---

### Task 5: AoVivo — dark card with logo, play button, next game info

**Files:**
- Modify: `components/home/AoVivo.tsx`
- Modify: `app/midia.css` (update `.player` and add `.av-tela-*` classes)

**Interfaces:**
- Consumes: `{ aoVivo: boolean; embed: string; linkAssistir: string; proxima: ItemAgenda | null }` (unchanged)
- Produces: redesigned AoVivo section — when off-air shows a dark branded card with play button

- [ ] **Step 1: Write failing test**

In `components/home/home.test.tsx`, add:
```typescript
it('AoVivo off-air shows link to assistir ao vivo', () => {
  render(<AoVivo aoVivo={false} embed="" linkAssistir="https://youtube.com/live" proxima={null} />);
  const links = screen.getAllByRole('link', { name: /assistir|ao vivo/i });
  expect(links.length).toBeGreaterThan(0);
  expect(links[0]).toHaveAttribute('href', 'https://youtube.com/live');
});
```

- [ ] **Step 2: Run test — confirm fails** (the existing AoVivo renders a button, not a link with that href)

Run: `npx vitest run components/home/home.test`
Expected: FAIL

- [ ] **Step 3: Update AoVivo.tsx**

Replace the off-air `<div className="player">` section with:
```tsx
<a className="av-tela" href={linkAssistir} target="_blank" rel="noopener noreferrer" aria-label="Assistir ao vivo no canal TV Arena Vale">
  <span className="av-tela-play" aria-hidden="true" />
  <span className="av-tela-status">
    <i aria-hidden="true" />
    {proxima
      ? `Próxima: ${proxima.casa} × ${proxima.fora} · ${proxima.modalidade}`
      : 'Aguardando próxima transmissão'}
  </span>
</a>
```

When `aoVivo` is true, keep the existing `<iframe>` player (unchanged).

Add/update in `midia.css`:
```css
.av-tela { display: grid; place-items: center; aspect-ratio: 16/7; border-radius: 20px; overflow: hidden; background: radial-gradient(ellipse at 50% 0%, rgba(229,9,20,.4), transparent 60%), linear-gradient(160deg, #1a0f10, #0b0b0c); border: 1px solid var(--linha); position: relative; text-decoration: none; color: var(--branco); }
.av-tela-play { width: 88px; height: 88px; border-radius: 50%; background: var(--vermelho); box-shadow: 0 0 0 14px rgba(229,9,20,.18), 0 20px 50px -10px rgba(229,9,20,.6); position: relative; }
.av-tela-play::after { content: ''; position: absolute; left: 36px; top: 28px; border-left: 24px solid #fff; border-top: 16px solid transparent; border-bottom: 16px solid transparent; }
.av-tela:hover .av-tela-play { transform: scale(1.08); transition: transform .25s; }
.av-tela-status { position: absolute; left: 24px; right: 24px; bottom: 20px; font-family: var(--rotulo); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; font-size: 13px; color: var(--tinta-suave); display: flex; gap: 10px; align-items: center; }
.av-tela-status i { width: 8px; height: 8px; border-radius: 50%; background: var(--vermelho); flex: none; animation: av-pisca 1.4s infinite; }
@keyframes av-pisca { 50% { opacity: .25; } }
@media (max-width: 640px) { .av-tela { aspect-ratio: 4/3; } .av-tela-play { width: 68px; height: 68px; } .av-tela-play::after { left: 28px; top: 21px; border-left-width: 18px; border-top-width: 13px; border-bottom-width: 13px; } }
```

- [ ] **Step 4: Run test**

Run: `npx vitest run components/home/home.test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/home/AoVivo.tsx app/midia.css
git commit -m "feat(home): ao vivo redesign — dark branded card off-air

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Completion test:** `npx vitest run` — Expected: 479+ passed

---

### Task 6: NoticiasHome — mosaico layout (1 big + 3 small cards)

**Files:**
- Modify: `components/home/NoticiasHome.tsx`
- Modify: `app/midia.css` (add `.mosaico-*` classes)

**Interfaces:**
- Consumes: `noticias: NoticiaMidia[]` (unchanged) — uses first 4 items
- Produces: redesigned `EsporteMundial` with mosaico layout (1 big card + 3 small); `AgoraNaArena` keeps Fileira layout (better for arena-specific, local news)

- [ ] **Step 1: Write failing test**

```typescript
it('EsporteMundial mosaico shows big card for first news item', () => {
  const noticias = [
    { id: '1', titulo: 'Titulo principal', resumo: 'x', imagem_url: '/a.jpg', slug: 'slug-1', categoria: 'mundo', publicado_em: new Date().toISOString() },
    { id: '2', titulo: 'Secundaria', resumo: 'x', imagem_url: '/b.jpg', slug: 'slug-2', categoria: 'mundo', publicado_em: new Date().toISOString() },
  ];
  render(<EsporteMundial noticias={noticias} />);
  expect(document.querySelector('.mosaico-grade')).toBeInTheDocument();
  expect(document.querySelector('.mosaico-cartao.grande')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test — confirm fails**

Run: `npx vitest run components/home/home.test`
Expected: FAIL

- [ ] **Step 3: Update EsporteMundial in NoticiasHome.tsx**

Replace the `<Faixa>` + `<Fileira>` structure with:
```tsx
export function EsporteMundial({ noticias }: { noticias: NoticiaMidia[] }) {
  const quatro = noticias.slice(0, 4);
  return (
    <section className="faixa" id="mundo">
      <div className="dentro">
        <div className="cab">
          <span className="eyebrow">Esporte mundial</span>
          <h2>As notícias que <em className="accent">movem o esporte.</em></h2>
        </div>
        {quatro.length === 0 ? (
          <p className="vazio">Em breve as primeiras notícias.</p>
        ) : (
          <div className="mosaico-grade" data-n={quatro.length}>
            {quatro.map((n, i) => (
              <a key={n.id} className={`mosaico-cartao${i === 0 ? ' grande' : ''}`} href={`/noticias/${n.slug}`}>
                <div className="mosaico-foto">
                  {n.imagem_url && <img src={n.imagem_url} alt={n.titulo} loading="lazy" />}
                </div>
                <div className="mosaico-corpo">
                  <span className="mosaico-num">0{i + 1}</span>
                  <h3>{n.titulo}</h3>
                  {i === 0 && n.resumo && <p>{n.resumo}</p>}
                </div>
              </a>
            ))}
          </div>
        )}
        <a href="/noticias?aba=mundo" className="ver" style={{ display: 'block', width: 'fit-content', margin: '16px auto 0' }}>Todas do Esporte Mundial →</a>
      </div>
    </section>
  );
}
```

Add to `midia.css`:
```css
.mosaico-grade { display: grid; grid-template-columns: 1.6fr 1fr; grid-template-rows: auto auto; gap: 12px; }
.mosaico-cartao { position: relative; border-radius: 18px; overflow: hidden; background: var(--grafite-2); border: 1px solid var(--linha); display: flex; flex-direction: column; text-decoration: none; color: inherit; }
.mosaico-cartao.grande { grid-row: 1 / 3; }
.mosaico-foto { aspect-ratio: 16/10; overflow: hidden; background: var(--grafite); }
.mosaico-cartao.grande .mosaico-foto { aspect-ratio: 4/3; }
.mosaico-foto img { width: 100%; height: 100%; object-fit: cover; }
.mosaico-corpo { padding: 14px 16px; display: grid; gap: 8px; flex: 1; }
.mosaico-num { font-family: var(--rotulo); font-size: 11px; font-weight: 700; letter-spacing: .18em; color: var(--vermelho-claro); }
.mosaico-corpo h3 { font-family: var(--display); font-weight: 800; font-size: 16px; text-transform: uppercase; line-height: 1.1; margin: 0; }
.mosaico-cartao.grande .mosaico-corpo h3 { font-size: 22px; }
.mosaico-corpo p { color: var(--cinza); font-size: 14px; }
@media (max-width: 700px) { .mosaico-grade { grid-template-columns: 1fr; } .mosaico-cartao.grande { grid-row: auto; } }
```

- [ ] **Step 4: Run test**

Run: `npx vitest run components/home/home.test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/home/NoticiasHome.tsx app/midia.css
git commit -m "feat(home): esporte mundial mosaico card layout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Completion test:** `npx vitest run` — Expected: 480+ passed

---

### Task 7: HojeNaArena — agenda com visual de linhas

**Files:**
- Modify: `components/home/HojeNaArena.tsx`
- Modify: `app/midia.css` (add `.linhas-agenda` class)

**Interfaces:**
- Consumes: `{ hoje: ItemAgenda[]; proximos: ItemAgenda[]; baseUrl: string; youtubeHandle: string; albuns: Record<string, string> }` (unchanged)
- Produces: redesigned agenda section with clean lines layout (`.linhas-agenda`)

- [ ] **Step 1: Write failing test**

```typescript
it('HojeNaArena shows agenda with linhas class when items exist', () => {
  const item = { id: '1', casa: 'Time A', fora: 'Time B', modalidade: 'Futsal', fase: 'Final', dataHora: new Date().toISOString(), local: 'Arena', transmissao: false };
  render(<HojeNaArena hoje={[item]} proximos={[]} baseUrl="https://arenavale.com.br" youtubeHandle="TVArenaVale" albuns={{}} />);
  expect(document.querySelector('.linhas-agenda')).toBeInTheDocument();
  expect(screen.getByText(/Time A × Time B/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run failing test**

Run: `npx vitest run components/home/home.test`
Expected: FAIL

- [ ] **Step 3: Rewrite HojeNaArena.tsx agenda output**

Keep the existing data logic and empty-state handling. Replace the `<ListaAgenda>` calls with an inline `.linhas-agenda` list:
```tsx
<ul className="linhas-agenda">
  {[...hoje, ...proximos].slice(0, 6).map((j) => (
    <li key={j.id}>
      <b>{j.casa} × {j.fora}</b>
      <span>
        {[j.modalidade, j.fase, j.local].filter(Boolean).join(' · ')}
        {j.transmissao && ' · com transmissão'}
      </span>
    </li>
  ))}
</ul>
```

Add to `midia.css`:
```css
.linhas-agenda { list-style: none; display: grid; gap: 0; border: 1px solid var(--linha); border-radius: 20px; overflow: hidden; }
.linhas-agenda li { display: grid; gap: 4px; padding: 16px 20px; border-bottom: 1px solid var(--linha); background: var(--grafite-2); }
.linhas-agenda li:last-child { border-bottom: 0; }
.linhas-agenda b { font-family: var(--display); font-weight: 800; font-size: 16px; text-transform: uppercase; }
.linhas-agenda span { font-size: 14px; color: var(--cinza); }
```

- [ ] **Step 4: Run test**

Run: `npx vitest run components/home/home.test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/home/HojeNaArena.tsx app/midia.css
git commit -m "feat(home): agenda linhas visual redesign

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Completion test:** `npx vitest run` — Expected: passed

---

### Task 8: AtletasDestaques — portrait spotlight layout

**Files:**
- Modify: `components/home/AtletasDestaques.tsx`
- Modify: `app/midia.css` (add `.atleta-sobre` classes)

**Interfaces:**
- Consumes: `destaques: Destaque[]` (unchanged)
- Produces: when destaques exist, shows first destaque as a large portrait (`.atleta-sobre`), rest in Fileira as before

- [ ] **Step 1: Write failing test**

```typescript
it('AtletasDestaques shows portrait spotlight for first item', () => {
  const d = { id: '1', nome: 'João', modalidade: 'Futsal', equipe: 'Brusque', imagem_url: '/j.jpg', posicao: null };
  render(<AtletasDestaques destaques={[d]} />);
  expect(document.querySelector('.atleta-sobre')).toBeInTheDocument();
  expect(screen.getByText('João')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run failing test**

Run: `npx vitest run components/home/home.test`
Expected: FAIL

- [ ] **Step 3: Update AtletasDestaques.tsx**

When `destaques.length > 0`, show first item as portrait spotlight, rest in Fileira:
```tsx
export function AtletasDestaques({ destaques }: { destaques: Destaque[] }) {
  const [primeiro, ...resto] = destaques;
  return (
    <section className="faixa" id="atletas">
      <div className="dentro">
        <div className="cab">
          <span className="eyebrow">Atletas destaque</span>
          <h2>O jogo não termina <em className="accent">no placar.</em></h2>
        </div>
        {destaques.length === 0 ? (
          <p className="vazio">Em breve os destaques da temporada.</p>
        ) : (
          <>
            <div className="atleta-sobre">
              <div className="atleta-foto">
                {primeiro.imagem_url && <img src={primeiro.imagem_url} alt={primeiro.nome} />}
              </div>
              <div className="atleta-info">
                <span className="eyebrow">Atleta destaque</span>
                <h3>{primeiro.nome}</h3>
                <p>{[primeiro.modalidade, primeiro.equipe].filter(Boolean).join(' · ')}</p>
                <a href="/atletasdestaques" className="av-btn leve" style={{ width: 'fit-content', marginTop: '12px' }}>Ver todos os destaques</a>
              </div>
            </div>
            {resto.length > 0 && (
              <Fileira rotulo="Mais destaques">
                {resto.map((d) => (
                  <Cartaz key={d.id} href="/atletasdestaques" titulo={d.nome} imagem={d.imagem_url} selo="ATLETA DESTAQUE" chapeu={[d.modalidade, d.equipe].filter(Boolean).join(' · ')} />
                ))}
              </Fileira>
            )}
          </>
        )}
      </div>
    </section>
  );
}
```

Add to `midia.css`:
```css
.atleta-sobre { display: grid; grid-template-columns: 1fr 1.2fr; gap: 32px; align-items: center; margin-bottom: 24px; }
.atleta-foto { border-radius: 20px; overflow: hidden; aspect-ratio: 3/4; background: var(--grafite); }
.atleta-foto img { width: 100%; height: 100%; object-fit: cover; }
.atleta-info { display: grid; gap: 12px; align-content: start; }
.atleta-info h3 { font-family: var(--display); font-weight: 800; font-size: clamp(28px, 4vw, 48px); text-transform: uppercase; line-height: .95; margin: 0; }
@media (max-width: 700px) { .atleta-sobre { grid-template-columns: 1fr; } }
```

- [ ] **Step 4: Run test**

Run: `npx vitest run components/home/home.test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/home/AtletasDestaques.tsx app/midia.css
git commit -m "feat(home): atletas destaque portrait spotlight layout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Completion test:** `npx vitest run` — Expected: passed

---

### Task 9: Modalidades — orbit animation (client component)

**Files:**
- Modify: `components/home/Modalidades.tsx` (split into server + client parts)
- Create: `components/home/ModalidadesOrbita.tsx` (`'use client'`)
- Modify: `app/midia.css` (add `.orbita-*` classes)

**Interfaces:**
- Consumes: `lista: Modalidade[]` from `buscarModalidades()` (unchanged)
- Produces: `ModalidadesOrbita` client component with interactive orbit UI; falls back to static list for SSR

- [ ] **Step 1: Write failing test for ModalidadesOrbita**

Create `components/home/ModalidadesOrbita.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalidadesOrbita } from './ModalidadesOrbita';
const LISTA = [
  { slug: 'futebol', nome: 'Futebol', frase: 'O palco do futebol é aqui.' },
  { slug: 'futsal', nome: 'Futsal', frase: 'O palco do futsal é aqui.' },
];
it('renders modalidades orbit with buttons', () => {
  render(<ModalidadesOrbita lista={LISTA} />);
  expect(screen.getByRole('button', { name: /futebol/i })).toBeInTheDocument();
});
it('clicking second modalidade updates the panel', async () => {
  render(<ModalidadesOrbita lista={LISTA} />);
  await userEvent.click(screen.getByRole('button', { name: /futsal/i }));
  expect(screen.getByText('O palco do futsal é aqui.')).toBeVisible();
});
```

- [ ] **Step 2: Run failing test**

Run: `npx vitest run components/home/ModalidadesOrbita`
Expected: FAIL — module not found

- [ ] **Step 3: Create ModalidadesOrbita.tsx (client component)**

```tsx
'use client';
import { useState } from 'react';
import type { Modalidade } from '@/lib/midia/modalidades';

export function ModalidadesOrbita({ lista }: { lista: Modalidade[] }) {
  const [ativo, setAtivo] = useState(0);
  const atual = lista[ativo];
  return (
    <div className="orbita">
      <div className="orbita-botoes" role="group" aria-label="Modalidades">
        {lista.map((m, i) => (
          <button
            key={m.slug}
            className={`orbita-btn${i === ativo ? ' ativo' : ''}`}
            onClick={() => setAtivo(i)}
            aria-pressed={i === ativo}
          >
            <span className="orbita-num">0{i + 1}</span>
            <span>{m.nome}</span>
          </button>
        ))}
      </div>
      <div className="orbita-painel" aria-live="polite">
        {atual && (
          <>
            <span className="orbita-conta">0{ativo + 1}<small> / 0{lista.length}</small></span>
            <h3>{atual.nome}</h3>
            <p>{atual.frase}</p>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update Modalidades.tsx to use ModalidadesOrbita**

```tsx
import { ModalidadesOrbita } from './ModalidadesOrbita';
export async function Modalidades() {
  const lista = await buscarModalidades();
  return (
    <section className="faixa" id="modalidades" style={{ background: 'var(--grafite)' }}>
      <div className="dentro">
        <div className="cab">
          <span className="eyebrow">Modalidades</span>
          <h2>Todo esporte tem <em className="accent">seu palco.</em></h2>
          <p>Campeonatos, agenda e notícias de cada esporte, do campo à quadra.</p>
        </div>
        <ModalidadesOrbita lista={lista} />
      </div>
    </section>
  );
}
```

Add to `midia.css`:
```css
.orbita { display: grid; grid-template-columns: 1fr 1.4fr; gap: 24px; align-items: start; }
.orbita-botoes { display: grid; gap: 8px; }
.orbita-btn { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: 16px; border: 1px solid var(--linha); background: transparent; color: var(--branco); cursor: pointer; text-align: left; font: inherit; transition: background .18s, border-color .18s; }
.orbita-btn:hover { background: rgba(229,9,20,.08); border-color: var(--vermelho); }
.orbita-btn.ativo { background: rgba(229,9,20,.14); border-color: var(--vermelho); }
.orbita-num { font-family: var(--rotulo); font-weight: 700; letter-spacing: .12em; font-size: 11px; color: var(--vermelho-claro); min-width: 24px; }
.orbita-painel { background: var(--grafite-2); border: 1px solid var(--linha); border-radius: 20px; padding: 32px; display: grid; gap: 12px; align-content: start; min-height: 200px; }
.orbita-conta { font-family: var(--rotulo); font-weight: 700; letter-spacing: .12em; font-size: 11px; color: var(--cinza); }
.orbita-painel h3 { font-family: var(--display); font-weight: 800; font-size: clamp(28px, 4vw, 44px); text-transform: uppercase; margin: 0; }
.orbita-painel p { color: var(--cinza); font-size: 16px; }
@media (max-width: 700px) { .orbita { grid-template-columns: 1fr; } }
```

- [ ] **Step 5: Run test**

Run: `npx vitest run components/home/ModalidadesOrbita`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/home/Modalidades.tsx components/home/ModalidadesOrbita.tsx components/home/ModalidadesOrbita.test.tsx app/midia.css
git commit -m "feat(home): modalidades orbit interactive panel

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Completion test:** `npx vitest run` — Expected: passed

---

### Task 10: SeuCampeonato — circular counter graphic

**Files:**
- Modify: `components/home/SeuCampeonato.tsx`
- Modify: `app/midia.css` (add `.anel-*` classes)

**Interfaces:**
- Consumes: `{ whatsapp: string }` (unchanged)
- Produces: adds a visual SVG ring counter (6 recursos) alongside the existing text

- [ ] **Step 1: Write failing test**

```typescript
it('SeuCampeonato shows the anel graphic', () => {
  render(<SeuCampeonato whatsapp="5547988444404" />);
  expect(document.querySelector('.anel-grafico')).toBeInTheDocument();
  expect(screen.getByText('6')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run failing test**

Run: `npx vitest run components/home/home.test`
Expected: FAIL

- [ ] **Step 3: Update SeuCampeonato.tsx**

Wrap existing `.seu-camp` content in a 2-column grid and add on the right:
```tsx
<div className="anel-grafico" aria-hidden="true">
  <svg viewBox="0 0 100 100">
    <circle className="anel-trilho" cx="50" cy="50" r="41" />
    <circle className="anel-arco" cx="50" cy="50" r="41" pathLength="1" strokeDasharray={`${RECURSOS.length / 6} 1`} />
  </svg>
  <div className="anel-miolo">
    <b>{RECURSOS.length}</b>
    <span>recursos</span>
  </div>
</div>
```

Add to `midia.css`:
```css
.seu-camp { display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: center; }
@media (max-width: 700px) { .seu-camp { grid-template-columns: 1fr; } .anel-grafico { display: none; } }
.anel-grafico { position: relative; width: 160px; height: 160px; flex: none; }
.anel-grafico svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.anel-trilho { fill: none; stroke: var(--linha); stroke-width: 6; }
.anel-arco { fill: none; stroke: var(--vermelho); stroke-width: 6; stroke-linecap: round; }
.anel-miolo { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; }
.anel-miolo b { font-family: var(--display); font-weight: 800; font-size: 36px; }
.anel-miolo span { font-family: var(--rotulo); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--cinza); }
```

- [ ] **Step 4: Run test**

Run: `npx vitest run components/home/home.test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/home/SeuCampeonato.tsx app/midia.css
git commit -m "feat(home): seu campeonato anel SVG counter graphic

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Completion test:** `npx vitest run` — Expected: passed

---

### Task 11: ProjetoSocialHome — animated number highlights

**Files:**
- Modify: `components/home/ProjetoSocialHome.tsx`
- Modify: `app/midia.css` (add `.numeros-impacto` class)

**Interfaces:**
- Consumes: `{ whatsapp: string }` (unchanged)
- Produces: adds a `.numeros-impacto` strip of 4 large stats above the iniciativas grid

- [ ] **Step 1: Write failing test**

```typescript
it('ProjetoSocialHome shows numeros impacto strip', () => {
  render(<ProjetoSocialHome whatsapp="5547988444404" />);
  expect(document.querySelector('.numeros-impacto')).toBeInTheDocument();
  expect(screen.getByText('+1.200')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run failing test**

Run: `npx vitest run components/home/home.test`
Expected: FAIL (`.numeros-impacto` doesn't exist yet)

- [ ] **Step 3: Update ProjetoSocialHome.tsx**

Add after the existing `.intro` div:
```tsx
<ul className="numeros-impacto">
  {IMPACTO_SOCIAL.map((i) => (
    <li key={i.rotulo}>
      <b>{i.valor}</b>
      <span>{i.rotulo}</span>
    </li>
  ))}
</ul>
```

Add to `midia.css`:
```css
.numeros-impacto { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--linha); border-radius: 20px; overflow: hidden; margin-block: 32px; }
.numeros-impacto li { background: var(--grafite-2); padding: 24px 20px; text-align: center; display: grid; gap: 6px; }
.numeros-impacto b { font-family: var(--display); font-weight: 800; font-size: clamp(22px, 3.5vw, 36px); color: var(--vermelho-claro); }
.numeros-impacto span { font-family: var(--rotulo); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--cinza); }
@media (max-width: 700px) { .numeros-impacto { grid-template-columns: 1fr 1fr; } }
```

- [ ] **Step 4: Run test**

Run: `npx vitest run components/home/home.test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/home/ProjetoSocialHome.tsx app/midia.css
git commit -m "feat(home): projeto social numeros impacto strip

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Completion test:** `npx vitest run` — Expected: passed

---

### Task 12: ParaMarcas → Citação section

**Files:**
- Modify: `components/home/ParaMarcas.tsx`
- Modify: `app/midia.css` (add `.citacao` classes)

**Interfaces:**
- Consumes: `{ whatsapp: string }` (unchanged)
- Produces: `ParaMarcas` component redesigned as a blockquote Citação section

- [ ] **Step 1: Write failing test**

```typescript
it('ParaMarcas renders as a citacao blockquote', () => {
  render(<ParaMarcas whatsapp="5547988444404" />);
  expect(document.querySelector('.citacao blockquote')).toBeInTheDocument();
  expect(screen.getByText(/palco do esporte/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run failing test**

Run: `npx vitest run components/home/home.test`
Expected: FAIL

- [ ] **Step 3: Update ParaMarcas.tsx**

```tsx
export function ParaMarcas({ whatsapp }: { whatsapp: string }) {
  const link = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Quero colocar minha marca no palco do esporte da ARENA VALE.')}`;
  return (
    <section className="faixa citacao-secao" id="marcas" style={{ background: '#0d0a0a' }}>
      <div className="dentro">
        <div className="citacao">
          <blockquote>
            Coloque sua marca no palco do esporte. Presença antes, durante e depois do jogo — para uma audiência que não apenas assiste ao esporte: vive o esporte.
          </blockquote>
          <cite>ARENA VALE · Patrocínio</cite>
          <div className="botoes" style={{ justifyContent: 'center', marginTop: '20px' }}>
            <a href={link} className="av-btn forte" target="_blank" rel="noopener noreferrer">
              Falar com a ARENA VALE
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Add to `midia.css`:
```css
.citacao { text-align: center; max-width: 760px; margin: 0 auto; }
.citacao blockquote { font-family: var(--display); font-weight: 800; font-size: clamp(22px, 3.2vw, 36px); line-height: 1.25; text-transform: uppercase; margin: 0 0 20px; text-wrap: balance; }
.citacao blockquote::before { content: '\201C'; color: var(--vermelho); }
.citacao blockquote::after { content: '\201D'; color: var(--vermelho); }
.citacao cite { font-style: normal; font-family: var(--rotulo); font-weight: 700; letter-spacing: .18em; text-transform: uppercase; font-size: 12px; color: var(--cinza); }
```

- [ ] **Step 4: Run test**

Run: `npx vitest run components/home/home.test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/home/ParaMarcas.tsx app/midia.css
git commit -m "feat(home): para marcas redesigned as citacao blockquote

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

**Completion test:** `npx vitest run` — Expected: 476+ passed (all original + new)

---

## Self-Review

**Spec coverage:**
- ✅ Visual moderno: all sections get the dark warm palette + display typography
- ✅ Conteúdo explicativo visual: CoberturaCards section is entirely new and explains the site
- ✅ All live data connections intact: no component has hardcoded match data
- ✅ Maquete sections covered: banner CTAs, corre strip, cobertura cards, ao vivo card, mosaico news, agenda linhas, atleta portrait, orbit modalidades, anel counter, numeros impacto, citacao

**Type consistency:** All new components use existing types (`Modalidade`, `Destaque`, `ItemAgenda`, `NoticiaMidia`)

**Review Focus items tested:**
- CSS specificity: new classes use unique prefixes (`.corre-`, `.cobertura-`, `.mosaico-`, `.orbita-`, `.anel-`, `.av-tela-`) — no collision with existing `.trilho`, `.cartaz`, `.agenda`
- Orbit hydration: ModalidadesOrbita test covers SSR-safe render (useState initial state = 0)
- Mosaico mobile: `@media (max-width: 700px)` stacks to 1 column
- Empty-state: each component has an explicit empty check
- Corre accessibility: `prefers-reduced-motion` stops animation
