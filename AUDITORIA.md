# 🔎 Auditoria Arena Vale — Falhas Organizadas

**Site:** https://arena-vale.vercel.app
**Repositório:** `arenavaleinstituto-source/arena-vale`
**Data do levantamento:** 28/10/2026

---

## Como este levantamento foi feito

Não é uma leitura de código às cegas. Cada item foi verificado contra:

| Fonte | O que foi verificado |
|---|---|
| **Site em produção** | Status HTTP real de 26 rotas, com e sem seguir redirecionamento |
| **Bundle público do site** | Credenciais, IDs de canal do YouTube, campos lidos pelo código |
| **Schema real do Supabase** | Colunas, tabelas, views e funções via PostgREST (chave anônima pública) |
| **Repositório** | Manifesto, lockfile, migrações, imports resolvidos, `tsc --noEmit` |
| **Build local** | `npm run build` com a checagem de tipos **ativada** |

Foi assim que apareceram as falhas mais graves: **o código e o banco de produção discordam sobre os nomes das colunas.** NenhumaAmount of them era visível só lendo o código.

---

## Resumo

| | |
|---|---|
| Falhas catalogadas | **55** |
| ✅ Corrigidas nesta entrega | **44** |
| ⏳ Pendentes (ação do dono / refactor) | **11** |
| 🔴 Críticas | **16** — todas corrigidas |
| Categorias | **8** |

---

## As 8 categorias

### 1. 🔴 Anúncios & Postagens — `editorial`
*O mesmo conteúdo, lido de formas diferentes em cada tela.*

O site tem dois tipos de conteúdo editorial: **comunicados** (`noticias`) e **destaques de atletas** (`atletas_destaque`). Cada tela lia o banco com um formato diferente, e metade lia colunas que **não existem**.

| # | Falha | Gravidade | Estado |
|---|---|---|---|
| ed-selo-conteudo | `/noticias` lia `nota.selo` e `nota.conteudo` — colunas inexistentes. Cards saíam **sem texto e sem selo** | 🔴 Crítico | ✅ |
| ed-galeria-localstorage | `/atletasdestaques` lia `localStorage` que **nenhum código escrevia** → os atletas publicados nunca apareciam | 🔴 Crítico | ✅ |
| ed-painel-colunas-inexistentes | Painel gravava em `nome`/`equipe`/`imagem_url` — a tabela real tem `atleta_nome`/`time_nome`/`foto_url` | 🔴 Crítico | ✅ |
| ed-fallbacks-divergentes | Home e mural tinham comunicados de fallback **diferentes** | 🔴 Crítico | ✅ |
| ed-cta-morto | "LER COMUNICADO" era um `<button>` sem `onClick` — **não havia rota de leitura** | 🟠 Alto | ✅ |
| ed-acentos-inconsistentes | Acentuação corrigida **só na Home**, com 7 palavras; mural e painel sem correção nenhuma | 🟠 Alto | ✅ |
| ed-mural-sem-seo | Mural e leitura eram renderizados **só no cliente** → o Google não via texto nenhum | 🟠 Alto | ✅ |
| ed-home-descartava-atletas | A Home buscava atletas e **jogava o resultado fora** | 🟠 Alto | ✅ |
| ed-lixo-no-banco | Comunicado com `descricao = "DSFSDFDSFSD"` — mascarado só na Home | 🟡 Médio | ✅ |
| ed-painel-sem-ciclo-de-vida | Só publicava: sem `ordem`, sem despublicar, sem excluir | 🟡 Médio | ✅ |
| ed-status-errado-atletas | Painel mostrava o status do **formulário**, não do atleta | 🟡 Médio | ✅ |
| ed-filtro-typo | Filtro `VOLEIBOL` não existia em lugar nenhum | 🟡 Médio | ✅ |
| ed-cta-fixo-home | Todo comunicado levava para `#campeonatos` | 🟡 Médio | ✅ |
| ed-home-cliente | Home ainda renderiza comunicados no cliente (SEO) | 🟡 Médio | ⏳ |

### 2. ⚡ Build & Deploy — `build`
*O repositório não conseguia compilar o próprio site.*

| # | Falha | Gravidade | Estado |
|---|---|---|---|
| bl-manifesto-vite | `package.json` era de um projeto **Vite** (`"build": "vite build"`) num app Next.js 14 | 🔴 Crítico | ✅ |
| bl-lockfile-sem-next | Lockfile com **zero** entradas de `next` | 🔴 Crítico | ✅ |
| bl-imports-data | 8 arquivos importavam de `../data/*` — **diretório inexistente** | 🔴 Crítico | ✅ |
| bl-deps-ausentes | `next`, `@supabase/supabase-js`, `@supabase/ssr` não declarados | 🟠 Alto | ✅ |
| bl-tailwind-versao | Tailwind **v4** no manifesto com pipeline PostCSS do **v3** | 🟠 Alto | ✅ |
| bl-require-esm | `require()` em pacote ESM → *"require is not defined"* | 🟠 Alto | ✅ |
| bl-ignore-build-errors | `ignoreBuildErrors: true` **mascarava** os erros de build | 🟠 Alto | ✅ |
| bl-prerender-env | `createClient()` no corpo do componente → build caía sem env vars | 🟠 Alto | ✅ |
| bl-migracao-duplicada | Migração `0004` duplicada em diretório aninhado → `db push` falharia | 🟠 Alto | ✅ |
| bl-import-nav | `import { Nav }` de um componente com `export default` | 🟡 Médio | ✅ |
| bl-env-higiene | Sem `.gitignore` e sem `.env.example` | 🟡 Médio | ✅ |

### 3. 🛡️ Segurança & Acesso — `seguranca`
*Credenciais no bundle e painéis abertos.*

| # | Falha | Gravidade | Estado |
|---|---|---|---|
| sec-credenciais-login | **4 contas com senha hardcoded** no JS público — uma aceitava qualquer senha | 🔴 Crítico | ✅ |
| sec-coordenador-aberto | `/coordenador` e `/proprietario` respondiam **200 sem sessão** | 🔴 Crítico | ✅ |
| sec-senha-mestra | Senha do painel do coordenador escrita no bundle (`arena2026`) | 🔴 Crítico | ✅ |
| sec-proprietario-credenciais | `/proprietario` validava credenciais fixas no cliente | 🔴 Crítico | ✅ |
| sec-login-quebrado | Login só gravava `localStorage` → **o painel era inalcançável** | 🟠 Alto | ✅ |
| sec-service-role | Chave de serviço fora do escopo do cliente (conferido) | ⚪ Ajuste | ✅ |
| sec-contas-supabase | Criar as contas no Authentication do Supabase | 🟡 Médio | ⏳ |

### 4. 🗄️ Schema do Banco — `schema`
*Tabelas que o código usa e nenhuma migração criava.*

| # | Falha | Gravidade | Estado |
|---|---|---|---|
| db-noticias-sem-ddl | A migração 0006 **inseria** em `noticias` sem nunca criá-la | 🔴 Crítico | ✅ |
| db-atletas-sem-ddl | `atletas_destaque` também nunca era criada | 🔴 Crítico | ✅ |
| db-site-config | `site_config` não existe em produção (PGRST205) | 🟠 Alto | ✅ |
| db-view-funcao | `v_classificacao` e `get_receita_mensal` nunca criadas | 🟠 Alto | ✅ |
| db-colunas-destaque | Faltavam `modalidade`, `jogos`, `gols_ou_pontos`, `assistencias` | 🟠 Alto | ✅ |
| db-aplicar-0007 | Rodar `supabase db push` em produção | 🟠 Alto | ⏳ |
| db-seed-sem-acento | Seed gravado sem acentuação (causa raiz) | 🟡 Médio | ✅ |

### 5. 🔗 Rotas & Navegação — `rotas`

| # | Falha | Gravidade | Estado |
|---|---|---|---|
| rot-nav-campeonatos | "Campeonatos" no menu levava ao **painel admin** | 🔴 Crítico | ✅ |
| rot-sumula-404-500 | `/sumula` dava 404; `/sumula/[id]` dava 500 servindo o site de **outra organização** ("Vale do Paraíba · SP") | 🔴 Crítico | ✅ |
| rot-header-sem-noticias | Menu sem link para `/noticias` | 🟠 Alto | ✅ |
| rot-cfg6-publico | Etiqueta interna `CFG6` e markdown cru `**CFG6**` na tela do visitante | 🟠 Alto | ✅ |
| rot-sitemap | Sitemap sem `/noticias`, `/inscricao` e páginas legais | 🟡 Médio | ✅ |
| rot-headers-duplicados | 3 implementações de header no mesmo site | ⚪ Ajuste | ⏳ |

### 6. 🌐 SEO & Conteúdo — `seo`

| # | Falha | Gravidade | Estado |
|---|---|---|---|
| seo-layout-regressao | Commit `41ec830` trocou `lang="pt-BR"` por `"en"` e apagou OG/Twitter/manifest — **regressão pendente de deploy** | 🔴 Crítico | ✅ |
| seo-tv-canal-placeholder | TV embedia o canal `UC_TVArenaVale` — **inexistente** | 🟠 Alto | ✅ |
| seo-robots-dominio | robots.txt aponta para domínio sem registro A | 🟡 Médio | ⏳ |
| seo-robots-admin | robots.txt não bloqueia as novas rotas admin | 🟡 Médio | ⏳ |

### 7. 🖼️ Mídia & Assets — `midia`

| # | Falha | Gravidade | Estado |
|---|---|---|---|
| mid-fundo-pesado | `fundo-arena.jpg` com 308 KB e preload bloqueante | 🟡 Médio | ⏳ |
| mid-arquivos-vazios | 3 arquivos de **1 byte** versionados | 🟡 Médio | ⏳ |
| mid-redirects-netlify | `public/_redirects` é config do Netlify servida como asset | 🟡 Médio | ⏳ |
| mid-espaco-nome | `LOGO BASKETE.png` com espaço, sem referência | ⚪ Ajuste | ⏳ |

### 8. 🧹 Manutenção & Código Morto — `manutencao`

| # | Falha | Gravidade | Estado |
|---|---|---|---|
| man-auditoria-desatualizada | A auditoria anterior descrevia falhas **já resolvidas** | 🟡 Médio | ✅ |
| man-codigo-morto | ~9.500 linhas sem nenhuma rota que as importe | 🟡 Médio | ⏳ |

---

## O padrão adotado

O pedido central era **"achar um padrão para os anúncios e postagens e manter em todos"**. O padrão está em `lib/content/` e é a única fonte de verdade:

```
lib/content/
├── tipos.ts        → Noticia e Destaque (os dois formatos canônicos)
├── vocabulario.ts  → categorias, selos e modalidades (lista única, fechada)
├── texto.ts        → normalização de acentuação, texto lixo, datas em pt-BR
├── noticias.ts     → buscarNoticias() · mapearNoticia() · NOTICIAS_PADRAO
├── destaques.ts    → buscarDestaques() · mapearDestaque() · DESTAQUES_PADRAO
└── index.ts        → barrel
```

### As 8 regras do padrão

| # | Regra | Onde é aplicada |
|---|---|---|
| 1 | **Uma consulta só** — `buscarNoticias()` / `buscarDestaques()`, sempre com `ativo = true` e ordenação por `ordem` | Home, mural, leitura, galeria, painéis |
| 2 | **Um mapeamento só** — aceita o formato novo e os aliases legados (`descricao`/`conteudo`, `tag`/`selo`, `atleta_nome`/`nome`…) | idem |
| 3 | **Um vocabulário só** — categorias, selos e modalidades saem de `vocabulario.ts` | painel **e** site público |
| 4 | **Uma normalização só** — acentuação, texto lixo e datas | idem |
| 5 | **Um cartão só** — `CartaoComunicado` e `CartaoDestaque` | idem |
| 6 | **Um fallback só** — `comFallback()` com o mesmo conjunto | idem |
| 7 | **Um CTA só** — "LER COMUNICADO" → `/noticias/[id]` | idem |
| 8 | **Uma imagem só** — mesma capa de fallback em todo lugar | idem |

### O que isso mudou na prática

| Antes | Depois |
|---|---|
| Mural mostrava cards **sem texto** e **sem selo** | Mural mostra título, selo, descrição, data e CTA funcionando |
| Galeria mostrava **3 atletas fictícios** com avatar de placeholder | Galeria mostra os atletas **publicados de verdade**, com filtro por modalidade funcionando |
| Publicar um atleta pelo painel **dava erro** no banco | Publica e despublica, reordena e exclui |
| Comunicado "DSFSDFDSFSD" aparecia **cru** no mural | Aparece o texto institucional em todas as telas |
| Home e mural diziam **coisas diferentes** | Dizem a mesma coisa |
| Sem rota para ler um comunicado | `/noticias/[id]` — com prévia de compartilhamento no WhatsApp |
| Acentos corrigidos em **1 de 3** telas | Corrigidos em **todas**, com dicionário amplo e idempotente |

---

## O que ainda precisa de você

| # | Ação | Como |
|---|---|---|
| 1 | **Rodar a migração 0007 em produção** | `supabase db push` (ou colar o arquivo no SQL Editor). Idempotente — pode rodar à vontade. |
| 2 | **Criar as contas de acesso** | Supabase → Authentication → Users, com os e-mails da organização. As credenciais antigas eram só comparações de string no JavaScript — nunca foram usuários reais. Marque o `profiles.role` de cada um. |
| 3 | **Configurar o registro A** | `arenavale.com.br` no Registro.br → IP da Vercel. Enquanto não resolver, o robots.txt e o sitemap devem apontar para o mesmo domínio (hoje divergem). |
| 4 | **Publicar esta versão** | `npm run build` passa, `tsc --noEmit` passa com 0 erros. |

### Verificação da home

A home em produção (`arena-vale.vercel.app`) foi conferida **texto a texto** contra o `app/page.tsx` do repositório: as duas são o **mesmo arquivo**. As diferenças que ainda aparecem em produção são apenas as correções desta entrega ainda não publicadas — o CTA antigo "EXPLORAR COBERTURA" e o "TRANSMISSAO AO VIVO" sem acento.

### Pendências técnicas (refactor, não bloqueiam)

- `app/page.tsx` → Server Component, para o texto dos comunicados entrar no HTML da Home.
- Componentes de header extraídos (`<HeaderPublic />`, `<FooterPublic />`) para eliminar as 3 implementações.
- WebP do `fundo-arena.jpg` (308 KB → ~60 KB) e `<Image />` do Next.js nos cards.
- Remover (ou publicar em `/auditoria`) as ~9.500 linhas de código morto.
- Remover `public/_redirects` e os 3 arquivos de 1 byte.

---

## Detalhe técnico por item

O catálogo completo — 55 itens com **problema, evidência verificada, solução e estado** — está em `auditData.ts`, no formato que o `InteractiveMindMap` e o `RoutesAuditTable` já consomem.

```ts
import { MINDMAP_BRANCHES, ROUTE_SCAN_RESULTS, AUDIT_RESUMO } from './auditData';
```

| Export | Conteúdo |
|---|---|
| `MINDMAP_BRANCHES` | 8 categorias × 55 itens, cada um com `severity`, `phase`, `status`, `evidence`, `solution` |
| `ROUTE_SCAN_RESULTS` | 18 rotas com status HTTP verificado e o que falta em cada uma |
| `AUDIT_RESUMO` | Contadores do levantamento |
| `POSITIVE_STRENGTHS` | O que já está bem feito (identidade visual, institucional, canais oficiais verificados) |
