# DESIGN.md — Arena Vale

> Design system do site esportivo Arena Vale (arenavale.com.br). Dark-first, bold, esportivo. Toda interface deve transmitir energia, velocidade e credibilidade jornalística. Leve este arquivo quando for criar, editar ou avaliar qualquer página ou componente.

---

## Personalidade da marca

Arena Vale é uma plataforma de mídia esportiva brasileira. O visual é dark e tenso como o placar de um jogo decisivo — sem leveza gratuita, sem branco de fundo. Cada tela entrega informação esportiva com impacto visual. O vermelho sangue é o único acento de cor; todo o resto é escuro ou neutro.

**Voz visual**: bold, condensed, uppercase, vermelho quando importa.  
**Anti-padrões**: branco de fundo, fontes leves, cores pastel, gradientes com cores fora da marca.

---

## Paleta de cores

Todos os tokens estão em `tailwind.config.ts` e `app/globals.css` como variáveis CSS `--nome`.

| Token | Variável CSS | Hex | Uso |
|---|---|---|---|
| `av-preto` | `--preto` | `#0b0b0c` | Fundo global, camada zero |
| `av-grafite` | `--grafite` | `#141417` | Seções alternadas, superfícies |
| `av-grafite-2` | `--grafite-2` | `#1d1d22` | Cards, painéis internos |
| `av-linha` | `--linha` | `#2a2a30` | Bordas sutis entre elementos |
| `av-branco` | `--branco` | `#f4f4f5` | Texto principal |
| `av-cinza` | `--cinza` | `#a1a1aa` | Texto secundário, rótulos |
| `av-vermelho` | `--vermelho` | `#e50914` | Cor primária, acento da marca |
| `av-vermelho-claro` | `--vermelho-claro` | `#ff3b44` | Hover, badges, links em destaque |
| `av-amarelo` | `--amarelo` | `#facc15` | Alertas, placares, destaques únicos |

**Regra crítica**: nunca use outra cor como acento. Apenas `--vermelho` e `--amarelo` quebram o monocromático.

### Gradientes recorrentes

```css
/* Fundo de hero com foto */
background-image:
  linear-gradient(180deg, rgba(11,11,12,.55) 0%, rgba(11,11,12,.72) 55%, var(--preto) 100%),
  var(--capa-img);

/* Topo de seção com brilho vermelho */
background: radial-gradient(ellipse 60% 90% at 50% 0%, rgba(229,9,20,.22), transparent 70%), var(--preto);

/* Overlay de cartaz */
background: linear-gradient(0deg, rgba(0,0,0,.92), rgba(0,0,0,.2) 50%, transparent 72%);
```

---

## Tipografia

Três famílias, três funções. Nunca misture os papéis.

| Família | Variável CSS | Tailwind | Uso |
|---|---|---|---|
| **Saira** | `--display` | `font-display` | Títulos H1–H3, placares, números grandes |
| **Barlow** | `--body` | `font-sans` | Texto corrido, parágrafos, corpo |
| **Barlow Condensed** | `--rotulo` | `font-rotulo` | Botões, labels, menus, badges, rodapés de card |

### Regras de tipo

- **H1, H2, H3 são sempre `text-transform: uppercase`** — regra gravada em `globals.css` pelo proprietário.
- Títulos de seção: `font-display font-extrabold uppercase`, `font-stretch: 112%` (Saira wdth axis).
- Rótulos: `font-rotulo font-bold uppercase tracking-wider` (letter-spacing de `.08em` a `.2em`).
- Hero H1: `font-stretch: 125%`, `font-size: clamp(36px, 7.5vw, 86px)`, `leading-none`.
- Números/placares grandes: `font-display font-extrabold`, `font-variant-numeric: tabular-nums`.
- Texto mudo: `text-av-cinza` (`#a1a1aa`).

---

## Espaçamento e layout

- **Container**: `max-w-[1280px] mx-auto px-6` (ou `.faixa .dentro` com `padding-inline: max(16px, env(safe-area-inset-left))`)
- **Cabeçalho mais largo**: `.topo .dentro` vai até `max-width: 1640px`
- **Seções (faixa)**: `padding-block: 44px`
- **Seções alternadas** levam `.alt` → `background: var(--grafite); border-block: 1px solid #1a1a1f`
- **Âncoras com scroll**: `scroll-margin-top: 6rem` para evitar que fiquem atrás do header sticky

### Grid padrão por contexto

| Contexto | Colunas desktop | Mobile |
|---|---|---|
| Agenda de jogos | 3 colunas | 1 coluna |
| Vídeos | 4 colunas | 2 colunas → 1 coluna |
| Modalidades | 4 colunas | 2 colunas |
| Estatísticas (nums) | 4 colunas | 2 colunas |
| Ao vivo (player + agenda) | 1.6fr / 1fr | 1 coluna |
| Galeria de álbuns | `auto-fill minmax(220px, 1fr)` | 2 colunas |

---

## Border radius

| Token Tailwind | Valor | Uso típico |
|---|---|---|
| `rounded-sm` | 8px | Inputs, miniaturas pequenas |
| `rounded-md` | 12px | Menus dropdown, itens |
| `rounded-lg` | 14px | Cartazes, thumbnails, chips |
| `rounded-xl` | 18px | Cards de jogo, patrocinadores, cortes |
| `rounded-2xl` | 22px | Hero news banner, login drawer |
| `rounded-3xl` | 28px | Modais |
| `rounded-full` | 999px | Botões pill, badges, avatares |

---

## Componentes-chave

### Botões

```css
/* Forte (ação primária) */
.av-btn.forte { background: var(--vermelho); box-shadow: 0 12px 30px rgba(229,9,20,.35); }

/* Leve (ação secundária) */
.av-btn.leve { border: 1px solid #3a3a41; }

/* Estilo base */
.av-btn { font-family: var(--rotulo); font-weight: 700; letter-spacing: .1em; text-transform: uppercase; font-size: 15px; border-radius: 999px; padding: 13px 24px; }
```

Tailwind equivalentes: `btn-primary`, `btn-outline`, `btn-ghost`, `btn-forte`, `btn-leve` (definidos em `globals.css`).

### Cartaz (poster de notícia/vídeo)

- Aspect ratio 2:3
- Overlay gradient do fundo (preto 92% embaixo → transparente)
- Título (`font-display bold uppercase`) posicionado absolute no canto inferior esquerdo
- Badge de categoria (`background: var(--vermelho)`) no canto superior esquerdo
- Hover: `scale(1.04)` com `transition: .2s`
- Cortes (Shorts): aspect ratio 9:16, `border-radius: 18px`

### Trilho horizontal (scroll rail)

```css
.trilho {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: clamp(150px, 22vw, 210px); /* notícias */
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
}
```

Setas de navegação aparecem apenas em desktop com hover (`@media (hover: hover) and (min-width: 860px)`).

### Faixa (section wrapper)

```tsx
<Faixa id="slug" titulo="TÍTULO" subtitulo="Subtítulo." alt verTodos={{ href: '/rota', rotulo: 'Ver todos →' }}>
  <Fileira rotulo="Label ARIA" girar>…</Fileira>
</Faixa>
```

`.alt` alterna o fundo para `--grafite`. `verTodos` renderiza o link `.ver` com borda vermelha.

### Cabeçalho sticky

- `position: sticky; top: env(safe-area-inset-top, 0px)` 
- `background: rgba(11,11,12,.9); backdrop-filter: blur(14px)`
- Logo: 60px desktop → 50px tablet → 40px mobile
- Menu: `font-rotulo bold uppercase tracking-wider`, active com `box-shadow: inset 0 -2px 0 var(--vermelho)`
- Indicador AO VIVO: ponto vermelho com `box-shadow: 0 0 8px var(--vermelho)` antes do item

### Live indicator

```css
.live-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--vermelho);
  box-shadow: 0 0 8px var(--vermelho);
  animation: pulse-live 2s ease-in-out infinite;
}
```

### Player de vídeo

- Aspect ratio 16:9, `border-radius: 20px`
- Fundo: `radial-gradient(ellipse at 60% 40%, #2a0b0e, #0d0d10 70%)`
- Botão play: 76px, vermelho, `box-shadow: 0 0 0 10px rgba(229,9,20,.18)`
- Tag AO VIVO: glassmorphism pill no canto superior esquerdo
- Placar: faixa com `border-left: 4px solid var(--vermelho)` no canto inferior

### Formulário / inputs

```css
input {
  background: #08080a;
  border: 1px solid var(--linha);
  color: var(--branco);
  border-radius: 16px;
  padding: 13px 16px;
}
input:focus {
  border-color: var(--vermelho);
  box-shadow: 0 0 0 3px rgba(229,9,20,.25);
}
```

### Painel/card interno

```css
.panel { background: var(--surface); border: 1px solid rgba(255,255,255,.1); border-radius: 14px; padding: 1.5rem; }
```

---

## Camada premium (redesign de 18/11/2026)

`app/premium.css` é importado por último (`layout.tsx`) e dá ao site inteiro o visual "premium esportivo + futurista": vidro, profundidade e movimento leve, **só com as cores da logo** (preto, `--vermelho` e variações dele, branco/prata).

- **Tokens**: `--vidro` (fundo translúcido dos cartões), `--vidro-borda`, `--vidro-reflexo` (linha de luz no topo), `--sombra-funda`, `--brilho-vermelho` (hover), `--prata` (texto metálico, como na logo), `--vermelho-escuro` (`#b20710`), `--ease`, `--altura-topo`.
- **Vidro de verdade** (`backdrop-filter`) só onde há algo atrás para desfocar: cabeçalho, menus, cartões flutuantes do banner (`.cartao-vidro`). Nos cartões de conteúdo, vidro "falso" (translúcido + reflexo), para não pesar no celular.
- **Ordem do desfoque**: escreva sempre `-webkit-backdrop-filter` ANTES de `backdrop-filter`. Na ordem inversa, o compilador de CSS do Next guarda só a versão `-webkit-` e o Chrome fica sem o desfoque.
- **Botões**: `.av-btn.forte` (gradiente vermelho com brilho que varre no hover), `.av-btn.leve` e `.av-btn.vidro` (vidro com borda clara).
- **Seções**: `.chapeu-secao` (rótulo vermelho com traço) e `.cab-esq` (título à esquerda). Algumas faixas da home (notícias, vídeos, fotos, atletas, patrocinadores) têm título à esquerda no computador, para variar o ritmo.
- **Banner da home** (`components/home/Banner.tsx`): texto e botões à esquerda; à direita o `.palco` em camadas (foto de capa em perspectiva, logo, cartões de próxima transmissão e última notícia). Cada `.camada` tem `--prof` (profundidade) e se move com a rolagem (`--rolar`) e com o mouse (`--mx`, `--my`).
- **Revelar ao rolar**: `components/EfeitosDaPagina.tsx` marca os blocos das faixas com `.revela` e adiciona `.visivel` quando entram na tela. Só funciona com a classe `.anima` no `<html>`, que o próprio componente coloca: sem JavaScript ou com movimento reduzido, nada fica escondido.
- O topo das páginas (`.hero-premium`, `.topo-pagina`) sobe para baixo do cabeçalho de vidro (`margin-top: calc(-1 * var(--altura-topo))`) quando é o primeiro filho do `<main>`.

## Animações

| Nome | Definição | Uso |
|---|---|---|
| `fade-in` | opacity 0→1 em 0.3s ease | Aparição de modais, itens |
| `slide-up` | translateY(20px)+opacity em 0.35s ease | Entrada de cards |
| `pulse-live` | box-shadow pulsante vermelho, 2s loop | Badge AO VIVO |
| `kenburns` | scale 1→1.08 em 24s alternate | Foto do banner de notícia destaque |
| `entra` | translateX(40px)+opacity em 0.25s ease-out | Drawer de login |

Sempre inclua `@media (prefers-reduced-motion: reduce)` para zerar animações decorativas.

---

## Padrões de cantos (hero)

O hero usa "cantos de estádio" em CSS puro — detalhe visual marcante da marca:

```css
.hero .cantos::before { /* canto superior direito, vermelho */
  border-right: 3px solid var(--vermelho);
  border-top: 3px solid var(--vermelho);
  border-radius: 0 14px 0 0;
}
.hero .cantos::after { /* canto inferior esquerdo, branco translúcido */
  border-left: 3px solid #ffffff55;
  border-bottom: 3px solid #ffffff55;
  border-radius: 0 0 0 14px;
}
```

---

## Ícones

Lucide React (`lucide-react@1.61.0`). Nunca SVG inline de terceiros.

---

## Mobile

- Breakpoints: 480px (mobile pequeno), 760px (mobile), 860px (tablet), 960px (tablet largo), 1100px (desktop), 1280px (desktop largo)
- Menu mobile: hambúrguer `☰` aparece em `max-width: 760px`, menu desktop some
- Botão "Anuncie" some em mobile
- Safe area: sempre `env(safe-area-inset-*)` em padding do cabeçalho, rodapé, drawers
- Login drawer: `width: min(420px, 100%); border-radius: 28px 0 0 28px` → `border-radius: 0` em `max-width: 460px`

---

## Tom de escrita na UI

- Rótulos: `CAIXA ALTA`, `letter-spacing`, curtos
- CTA primário: verbos de ação fortes — "ASSISTA AGORA", "VER AGENDA", "CADASTRAR EQUIPE"
- Estados vazios: sempre em primeira pessoa da plataforma — "Em breve as primeiras notícias."
- Nunca: lorem ipsum, placeholders genéricos, inglês misturado com português na UI

---

## O que nunca fazer

- Fundo branco ou claro em qualquer seção
- Texto `font-display` em tamanho abaixo de 18px
- Acento de cor que não seja `--vermelho` ou `--amarelo`
- Cantos `rounded-full` em cards de conteúdo (somente em pills/botões)
- H1/H2/H3 em minúsculas (globals.css força uppercase globalmente)
- Animações sem `prefers-reduced-motion`
- Layouts sem `safe-area-inset` em elementos fixos/sticky
