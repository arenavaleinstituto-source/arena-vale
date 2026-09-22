# 🏆 Arena Vale Sports — App Completo (Next.js + Supabase + Vercel)

Stack de produção recomendada pelo time:
- **Frontend + Backend:** Next.js 14 (App Router, React Server Components, Route Handlers)
- **Banco + Auth:** Supabase (Postgres + Auth + Storage + RLS)
- **Deploy:** Vercel (1-clique)
- **Charts:** Recharts (já incluso)
- **UI:** Tailwind + shadcn + Radix UI

> ⚠️ **Substitui 100% o template original Manus.** Toda a lógica de tRPC/MySQL/Manus-OAuth/Manus-Forge é descartada.

---

## 🚀 Setup em 10 minutos

### 1. Criar projeto no Supabase
1. Acesse https://supabase.com → New Project
2. Escolha senha do DB forte, região **South America (São Paulo)**
3. Espere provisionar (~2 min)
4. Em **Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Rodar migration + seed
```bash
# Instalar CLI (se não tiver)
npm install -g supabase

# Linkar ao projeto (vai pedir o ref ID da URL do Supabase)
supabase link --project-ref <seu-ref>

# Aplicar schema completo (tabelas + RLS + policies)
supabase db push

# Popular com dados demo
npm run db:seed
```

### 3. Setup local
```bash
npm install
cp .env.local.example .env.local
# preencha .env.local com as 3 chaves do passo 1
npm run dev
```

Abre em http://localhost:3000

### 4. Deploy na Vercel
1. Suba o código para um repo Git (GitHub/GitLab/Bitbucket)
2. Acesse https://vercel.com → New Project → Import
3. Em **Environment Variables**, cole as 3 chaves
4. Deploy 🚀

---

## 🏗️ Estrutura

```
arena-vale-app/
├── app/
│   ├── (public)/
│   │   └── page.tsx                  ← landing pública
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── login/actions.ts
│   │   └── logout/route.ts
│   ├── (coord)/
│   │   ├── coordenador/
│   │   │   ├── page.tsx              ← dashboard visão geral
│   │   │   ├── inscricoes/page.tsx
│   │   │   ├── moderadores/page.tsx
│   │   │   ├── sumulas/page.tsx
│   │   │   ├── patrocinadores/page.tsx
│   │   │   └── config/page.tsx
│   │   └── moderador/
│   │       └── page.tsx              ← painel do time
│   ├── api/
│   │   ├── campeonatos/route.ts
│   │   ├── times/route.ts
│   │   ├── jogos/route.ts
│   │   ├── sumulas/route.ts
│   │   ├── patrocinadores/route.ts
│   │   └── inscricoes/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                           ← shadcn primitives
│   ├── shield.tsx
│   ├── nav.tsx
│   ├── coord-shell.tsx
│   ├── mod-shell.tsx
│   ├── stat-card.tsx
│   ├── live-game-card.tsx
│   ├── championship-card.tsx
│   ├── standings-table.tsx
│   ├── activity-feed.tsx
│   ├── revenue-chart.tsx
│   └── revenue-donut.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts                 ← cliente SSR
│   │   ├── client.ts                 ← cliente browser
│   │   ├── middleware.ts             ← refresh session
│   │   ├── types.ts                  ← tipos gerados
│   │   └── queries.ts                ← helpers de query
│   ├── utils.ts
│   └── auth-helpers.ts
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 0001_init.sql             ← schema + RLS + seed
├── middleware.ts                     ← auth guard global
├── scripts/
│   └── seed.ts
├── .env.local.example
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

---

## 🔐 RBAC (controle de acesso)

3 níveis, cada um com policies RLS específicas:

| Role | Pode |
|---|---|
| `anon` | Ver landing, jogos ao vivo, classificação pública |
| `authenticated` | Tudo de `anon` + editar perfil + inscrições do próprio time |
| `moderador` | Tudo de `authenticated` + lançar súmulas do seu time + escalar jogadores |
| `coordenador` | **TUDO**: aprova inscrições, gerencia patrocinadores, valida súmulas, vê financeiro |

Todas as policies estão em `supabase/migrations/0001_init.sql`.

---

## 🖨️ Súmula digital

A súmula é persistida em `sumulas` com:
- ID único (`uuid`)
- Hash SHA-256 do conteúdo (imutabilidade)
- QR code de validação (aponta para `/sumula/[id]/verificar`)
- Assinaturas digitais do árbitro e dos 2 capitães
- Timestamps `created_at` + `validated_at`

A impressão usa `@media print` em uma rota dedicada `/sumula/[id]/imprimir`.

Para integração com **impressora térmica Bluetooth** (Zebra ZQ630, Brother PJ-773 etc):
- Service Worker PWA + Web Bluetooth API
- Job de impressão em background
- Templates ESC/POS otimizados para 80mm

---

## 💳 Pagamentos (opcional)

Schema já tem `inscricoes` com `status_pagamento`. Integre Stripe:
```ts
// app/api/checkout/route.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// ...
```

Pix via Mercado Pago ou PagSeguro também são suportados (BRL nativo).

---

## 📺 Transmissões ao vivo

Tabela `transmissoes` já modelada. Suporta:
- YouTube Live (URL embed)
- Twitch
- Livepeer (WebRTC descentralizado)
- Servidor próprio via RTMP + HLS

A landing pública consome `transmissoes` com `status = 'ao_vivo'`.

---

## 🛠️ Próximos passos sugeridos

1. ✅ Criar projeto Supabase
2. ✅ Rodar migration + seed
3. ✅ Criar usuário coordenador (sign up + update role no DB)
4. ✅ Customizar domínio (arenavalesports.com.br → Vercel)
5. ✅ Configurar SMTP (Resend ou Supabase Auth emails)
6. ✅ Integrar gateway de pagamento
7. ✅ Integrar stream provider
8. ✅ PWA para uso em campo (smartphone dos árbitros)

---

## 💰 Custos estimados

| Serviço | Free tier | Produção |
|---|---|---|
| Supabase | 500MB DB · 50k MAU · 1GB storage | $25/mês (Pro) |
| Vercel | Hobby (não-comercial) | $20/mês (Pro) |
| Domínio | — | ~R$ 50/ano |
| Stripe | — | 2.99% + R$ 0.39 por transação |
| **Total mensal mínimo (MVP)** | **R$ 0** | **~R$ 150/mês** |

---

## 🆘 Suporte

Documentação interna em `docs/` (criar conforme necessário).
Para issues do template: ver PENDENCIAS.md (entregue junto da landing estática).
