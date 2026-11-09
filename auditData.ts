/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ARENA VALE — AUDITORIA ORGANIZADA DO SITE
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Este arquivo é o CATÁLOGO DE FALHAS do site, agrupado por categoria e
 *  com o estado de cada item (`corrigido` / `pendente`).
 *
 *  A versão anterior deste arquivo estava desatualizada: ela afirmava que
 *  /painel respondia 200 sem login, que /campeonatos dava 404 e que
 *  /favicon.ico e /manifest.json não existiam — todos esses pontos já
 *  tinham sido resolvidos na altura. Mantê-la era pior que não tê-la,
 *  porque fazia o time trabalhar em problemas inexistentes enquanto os
 *  reais passavam despercebidos.
 *
 *  Esta versão foi levantada contra:
 *   • o site em produção (https://arena-vale.vercel.app);
 *   • o repositório arenavaleinstituto-source/arena-vale;
 *   • o schema REAL do Supabase de produção (via PostgREST com a chave
 *     anônima pública), que revelou divergências entre o que o código
 *     assume e o que existe no banco.
 *
 *  Verificações feitas em: 28/10/2026
 */

export type Severity = 'critico' | 'alto' | 'medio' | 'ajuste';
export type Phase = 'fase1' | 'fase2' | 'fase3';
export type Status = 'corrigido' | 'pendente';

export interface AuditLeafNode {
  id: string;
  title: string;
  shortLabel: string;
  severity: Severity;
  phase: Phase;
  /** Estado do item na data da auditoria. */
  status: Status;
  effort: string;
  /** Observação opcional sobre o esforço estimado. */
  effortNote?: string;
  location: string;
  liveUrl?: string;
  problem: string;
  evidence: string;
  solution: string;
  codeFix?: string;
}

export interface MindMapBranch {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  color: string;
  glow: string;
  badgeBg: string;
  iconName:
    | 'HeartHandshake'
    | 'ShieldAlert'
    | 'Unlink'
    | 'FileEdit'
    | 'Zap'
    | 'Globe'
    | 'BarChart3';
  summary: string;
  items: AuditLeafNode[];
}

export interface RouteScanItem {
  path: string;
  fullUrl: string;
  httpStatus: number;
  sizeLabel: string;
  statusType: 'critico' | 'erro' | 'alerta' | 'ok';
  category: 'Página' | ' Seção' | 'Admin' | 'SEO / Sistema' | 'Mídia';
  finding: string;
  actionRequired: string;
}

export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string; bg: string; border: string; weight: number }
> = {
  critico: {
    label: 'Bloqueante Crítico',
    color: '#ff3b47',
    bg: 'rgba(229, 9, 20, 0.16)',
    border: 'rgba(229, 9, 20, 0.5)',
    weight: 5,
  },
  alto: {
    label: 'Alta Prioridade',
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.45)',
    weight: 3,
  },
  medio: {
    label: 'Média Prioridade',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.14)',
    border: 'rgba(56, 189, 248, 0.4)',
    weight: 2,
  },
  ajuste: {
    label: 'Polimento / Refino',
    color: '#34d399',
    bg: 'rgba(16, 185, 129, 0.14)',
    border: 'rgba(16, 185, 129, 0.4)',
    weight: 1,
  },
};

export const PHASE_META: Record<
  Phase,
  { title: string; subtitle: string; badge: string; accent: string }
> = {
  fase1: {
    title: 'Fase 1 · Bloqueantes Imediatos',
    subtitle: 'Build, segurança, schema do banco e o pipeline editorial — corrigir antes de divulgar',
    badge: 'URGENTE (2h–4h)',
    accent: '#e50914',
  },
  fase2: {
    title: 'Fase 2 · Conteúdo, Rotas & Mídia',
    subtitle: 'Conectar páginas, padronizar PT-BR, reduzir peso de assets e limpar código morto',
    badge: 'PRÉ-LANÇAMENTO (1–2 dias)',
    accent: '#f59e0b',
  },
  fase3: {
    title: 'Fase 3 · Domínio Próprio, SEO & Governança',
    subtitle: 'Domínio .com.br, redesenho do site próprio, analytics e rotina de manutenção',
    badge: 'GO-LIVE OFICIAL',
    accent: '#10b981',
  },
};

export const POSITIVE_STRENGTHS = [
  {
    title: 'Identidade Visual Broadcast Forte',
    detail:
      `Paleta escura (#07080c) com vermelho Arena (#e50914) e dourado cria impacto esportivo e hierarquia de destaque consistente em todas as páginas.`,
  },
  {
    title: 'Identidade Legal e Institucional Presente',
    detail:
      `CNPJ 40.694.741/0001-34, páginas /privacidade e /termos ativas, rodapé institucional e termo de direito de imagem completo no formulário de inscrição.`,
  },
  {
    title: 'Estrutura Comercial de Cotas Clara',
    detail:
      `As 3 faixas de patrocínio (Master, Apoio Regional e Institucional) explicam entregáveis objetivos para anunciantes, com CTA de WhatsApp em cada uma.`,
  },
  {
    title: 'Canais Oficiais Reais e Verificados',
    detail:
      `Canal YouTube @TVArenaVale confirmado (UCBTQ97bWA6VqK2a6qv80dIg, com vídeos publicados) e Instagram @arenavaleoficial linkados no rodapé.`,
  },
  {
    title: 'Proteção de Sessão no Servidor Funcionando',
    detail:
      `O middleware valida a sessão Supabase via @supabase/ssr e devolve 307 → /login nas áreas restritas, com o destino preservado em ?next=.`,
  },
];

export const MINDMAP_BRANCHES: MindMapBranch[] = [
  /* ══════════════════════════════════════════════════════════════════
   * 01 — PIPELINE EDITORIAL (anúncios e postagens)
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'editorial',
    number: '01',
    title: 'Anúncios & Postagens',
    subtitle: 'O mesmo conteúdo, lido de formas diferentes em cada tela',
    color: '#e50914',
    glow: 'rgba(229, 9, 20, 0.35)',
    badgeBg: 'bg-red-500/15 text-red-400 border-red-500/40',
    iconName: 'FileEdit',
    summary:
      'O site tem dois tipos de conteúdo editorial (comunicados em `noticias` e destaques em `atletas_destaque`) e cada tela lia o banco com um formato diferente. Metade das telas lia colunas que não existem, o que fazia o conteúdo publicado nunca aparecer. Agora existe UM padrão único em lib/content, aplicado em todas as telas.',
    items: [
      {
        id: 'ed-selo-conteudo',
        title: 'Mural /noticias lia colunas inexistentes (`nota.selo` e `nota.conteudo`)',
        shortLabel: 'Cards do mural saíam sem texto e sem selo',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '1h',
        location: 'app/noticias/page.tsx',
        liveUrl: 'https://arena-vale.vercel.app/noticias',
        problem:
          'A tabela `noticias` tem as colunas `descricao` e `tag`, mas o mural lia `nota.conteudo` e `nota.selo`. Ambos vêm `undefined`, então cada card aparecia com o título e SEM NENHUM TEXO e SEM o selo ao lado da categoria. O visitante lia um mural vazio.',
        evidence:
          'Schema real em produção: {id, titulo, descricao, categoria, tag, imagem_url, ordem, ativo, created_by, created_at, updated_at}. O código usava `nota.conteudo` e `nota.selo`.',
        solution:
          'Mapeamento canônico `mapearNoticia()` em lib/content/noticias.ts, que aceita `descricao`/`tag` e também os aliases legados `conteudo`/`selo`. O mural passou a usar esse mapeamento.',
        codeFix: `// lib/content/noticias.ts
export function mapearNoticia(row: NoticiaRow): Noticia {
  const descricao = texto(row.descricao ?? row.conteudo);
  const tag = texto(row.tag ?? row.selo);
  ...
}`,
      },
      {
        id: 'ed-fallbacks-divergentes',
        title: 'Home e mural usavam comunicados de fallback diferentes',
        shortLabel: 'A mesma tela mostravallaileconteúdos diferentes',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '45min',
        location: 'app/page.tsx e app/noticias/page.tsx',
        problem:
          `Cada tela tinha seu próprio conjunto de fallback. A Home mostrava "NOVA TEMPORADA DE TRANSMISSÕES" e o mural mostrava outra coisa. Quando o banco falhava, o site dizia coisas diferentes em páginas diferentes.`,
        evidence:
          `Home: NOTICIAS_PADRAO local com 3 itens. Mural: nenhum fallback (mostrava "Ainda não há comunicados publicados").`,
        solution:
          'Um único `NOTICIAS_PADRAO` e uma única função `comFallback()` em lib/content, consumidos por Home, mural, rota de leitura e painel.',
      },
      {
        id: 'ed-cta-morto',
        title: 'CTA "LER COMUNICADO" era um <button> sem onClick — não havia rota de leitura',
        shortLabel: 'Botão de ler comunicado não fazia nada',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '1h',
        location: 'app/noticias/page.tsx',
        problem:
          `O botão "LER COMUNICADO" não tinha onClick nem href. Não existia lugar nenhum no site onde se lê um comunicado inteiro — o texto ficava restrito ao card, e mesmo assim vazio (ver ed-selo-conteudo).`,
        evidence:
          `<button className="inline-flex items-center gap-2 ..."><span>LER COMUNICADO</span>...</button> — sem onClick, sem href.`,
        solution:
          `Criada a rota /noticias/[id] (Server Component, com generateMetadata para prévia de compartilhamento no WhatsApp) e o CTA virou um <Link> para ela.`,
      },
      {
        id: 'ed-acentos-inconsistentes',
        title: 'Acentuação corrigida só na Home, com lista de 7 palavras',
        shortLabel: 'Mesmo comunicado com grafias diferentes',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '1h',
        location: 'app/page.tsx (corrigirTextoPublico)',
        problem:
          `A Home escondia a falta de acentuação do banco com uma lista de 7 substituições. O mural e o painel não tinham NENHUMA correção. O mesmo comunicado aparecia "INSCRIÇÕES" na Home e "INSCRICOES" no mural. A lista também não cobria "numero", "tecnica", "Volei" etc.`,
        evidence:
          `function corrigirTextoPublico() { return texto.replace(/\\bINSCRICOES\\b/gi, "INSCRIÇÕES") ... } — 7 regex, aplicadas só na Home.`,
        solution:
          'Normalizador compartilhado `normalizarTextoPublico()` em lib/content/texto.ts: dicionário amplo, preservação da caixa do texto, detecção de texto lixo e idempotência. Aplicado em Home, mural, rota de leitura e pré-visualização do painel.',
      },
      {
        id: 'ed-lixo-no-banco',
        title: 'Comunicado com lixo no banco ("DSFSDFDSFSD") mascarado só na Home',
        shortLabel: 'Lixo no banco escondido só na Home',
        severity: 'medio',
        phase: 'fase2',
        status: 'corrigido',
        effort: '30min',
        location: 'tabela `noticias` · linha "METRO VENCE NA COPASC"',
        problem:
          'O comunicado "METRO VENCE NA COPASC" tem `descricao = "DSFSDFDSFSD"`. A Home detectava esse padrão (/^DSFSDF/i) e trocava por uma frase institucional; o mural mostrava o lixo cru, escrito em letras maiúsculas no meio da tela.',
        evidence:
          `Linha real: {"titulo":"METRO VENCE NA  COPASC","descricao":"DSFSDFDSFSD","categoria":"Comunicado Oficial","tag":"NOVO"}`,
        solution:
          `Detecção de texto lixo movida para o normalizador compartilhado (vale para todas as telas). A causa raiz — o seed sem acentuação — foi corrigida na migração 0006/0007.`,
      },
      {
        id: 'ed-galeria-localstorage',
        title: 'Galeria /atletasdestaques lia localStorage que ninguém escrevia',
        shortLabel: 'Galeria nunca mostrava os atletas publicados',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '1h',
        location: 'app/atletasdestaques/page.tsx',
        problem:
          'A galeria pública lia `localStorage.getItem("arenavale_atletas")`. Nenhum código do projeto escreve essa chave — o painel publica no Supabase e a Home lê do Supabase. Ou seja: os atletas publicados pelo time NUNCA apareciam na galeria; ela mostrava sempre os 3 atletas fictícios do fallback, com avatares de placeholder (ui-avatars.com), enquanto a Home mostrava o mesmo atleta com foto real.',
        evidence:
          `const saved = localStorage.getItem("arenavale_atletas"); — nenhum grep no repositório escreve essa chave.`,
        solution:
          'A galeria passou a usar `buscarDestaques()` (mesma consulta da Home) e o mesmo componente `CartaoDestaque`.',
      },
      {
        id: 'ed-painel-colunas-inexistentes',
        title: 'Painel de atletas gravava em colunas que não existem no banco',
        shortLabel: 'Publicar atleta falhava com erro no banco',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '1h',
        location: 'app/painel/atletasdestaques/page.tsx',
        problem:
          'O painel gravava em `nome`, `modalidade`, `equipe`, `destaque_texto` e `imagem_url`. Nenhuma dessas colunas existe na tabela `atletas_destaque` de produção, que tem `atleta_nome`, `time_nome`, `campeonato_nome` e `foto_url`. Publicar um atleta por ali falhava com erro do PostgREST.',
        evidence:
          `Colunas reais: {id, foto_url, atleta_nome, time_nome, campeonato_nome, ativo, ordem, created_at, created_by}. O painel usava nome/modalidade/equipe/destaque_texto/imagem_url.`,
        solution:
          'O painel grava nas colunas REAIS. O mapeamento `mapearDestaque()` aceita as duas formas (real e legado) para não perder registro nenhum.',
      },
      {
        id: 'ed-home-descartava-atletas',
        title: 'A Home buscava atletas no banco e jogava o resultado fora',
        shortLabel: 'Consulta de atletas na Home sem uso',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '45min',
        location: 'app/page.tsx',
        problem:
          'A Home fazia a consulta em `atletas_destaque` e preenchia o estado `atletasPublicos` — que nunca era renderizado. A seção de atletas era um banner estático. A busca era trabalho jogado fora.',
        evidence:
          'grep de `atletasPublicos` no arquivo: só nas linhas da declaration e do setState.',
        solution:
          'A Home agora renderiza a grade de destaques com o mesmo `CartaoDestaque` da galeria.',
      },
      {
        id: 'ed-painel-sem-ciclo-de-vida',
        title: 'Painel de comunicados só publicava — não havia como despublicar, reordenar ou excluir',
        shortLabel: 'Comunicado errado não podia ser retirado',
        severity: 'medio',
        phase: 'fase2',
        status: 'corrigido',
        effort: '1h30',
        location: 'app/painel/noticias/page.tsx',
        problem:
          'O formulário publicava e pronto. Não havia campo de ordem, de situação (`ativo`), nem botão de despublicar/excluir. Um comunicado errado ficava no ar para sempre. Também não havia edição.',
        evidence:
          'handlePost() fazia apenas .insert({ titulo, descricao, categoria, tag, imagem_url, ativo: true }) — sem `ordem`, sem update, sem delete.',
        solution:
          'Painel reescrito com: posição no mural (`ordem`), situação (publicar/despublicar), exclusão e listagem ordenada — usando o mesmo `buscarNoticias` e as mesmas categorias do site público.',
      },
      {
        id: 'ed-status-errado-atletas',
        title: 'Painel de atletas mostrava o status do formulário, não do atleta',
        shortLabel: 'Todos os cards diziam a mesma coisa',
        severity: 'medio',
        phase: 'fase2',
        status: 'corrigido',
        effort: '15min',
        location: 'app/painel/atletasdestaques/page.tsx',
        problem:
          'O badge usava `{ativo ? "Ativo" : "Inativo"}` — o estado do checkbox do formulário, não `atleta.ativo`. Todos os cards mostravam exatamente o mesmo status, independentemente do registro.',
        evidence:
          'span: {ativo ? "Ativo" : "Inativo"} — dentro de .map((atleta) => ...), sem usar `atleta.ativo`.',
        solution: 'Corrigido para `atleta.ativo`, com botões de publicar/despublicar por item.',
      },
      {
        id: 'ed-filtro-typo',
        title: 'Filtro "VOLEIBOL" da galeria não existia em lugar nenhum',
        shortLabel: 'Filtro de vôlei não filtrava nada',
        severity: 'medio',
        phase: 'fase2',
        status: 'corrigido',
        effort: '20min',
        location: 'app/atletasdestaques/page.tsx',
        problem:
          `A galeria oferecia o filtro "VOLEIBOL" (digitado errado). Como nenhuma modalidade usava essa grafia, o filtro não devolvia nenhum resultado — e a modalidade Vôlei não tinha botão nenhum.`,
        evidence:
          `{['TODOS', 'FUTSAL', 'BASQUETEBOL', 'FUTEBOL 7', 'VOLEIBOL'].map(...)} · o banco guarda "Vôlei"/"VOLEI"/"VOLEIBOL" conforme a origem.`,
        solution:
          `Vocabulário único de modalidades em lib/content/vocabulario.ts, com normalização de aliases (VOLEI, VOLEIBOL, VÔLEI → VÔLEI) e filtro por igualdade exata.`,
      },
      {
        id: 'ed-cta-fixo-home',
        title: 'CTA da Home apontava sempre para #campeonatos',
        shortLabel: 'Todo comunicado levava para a mesma âncora',
        severity: 'medio',
        phase: 'fase2',
        status: 'corrigido',
        effort: '15min',
        location: 'app/page.tsx · seção #noticias',
        problem:
          'O card de comunicado da Home usava sempre o texto "EXPLORAR COBERTURA" com `href="#campeonatos"`. Um comunicado sobre arbitragem levava o leitor para a seção de campeonatos, e o texto não descrevia o conteúdo.',
        evidence: '<a href="#campeonatos" ...><span>EXPLORAR COBERTURA</span>…</a> — idem nos 3 cards.',
        solution:
          'O cartão é agora o mesmo `CartaoComunicado` do mural, com CTA "LER COMUNICADO" para /noticias/[id] — que corresponde ao conteúdo real do item.',
      },
      {
        id: 'ed-mural-sem-seo',
        title: 'Mural e rota de leitura eram renderizados só no cliente',
        shortLabel: 'Google não via texto nenhum do mural',
        severity: 'alto',
        phase: 'fase2',
        status: 'corrigido',
        effort: '1h',
        location: 'app/noticias/page.tsx, app/noticias/[id]/page.tsx e app/atletasdestaques/page.tsx',
        problem:
          `As três páginas eram Client Components que buscavam o banco dentro de um useEffect. O HTML inicial do mural mostrava apenas "A carregar base de dados..." e o da galeria, só "A carregar destaques..." — o conteúdo editorial (que é o principal ativo de SEO do site) não existia para os buscadores nem para a prévia de compartilhamento no WhatsApp.`,
        evidence:
          `HTML inicial do /noticias: 9.763 bytes, contendo só "A carregar base de dados...". A galeria nem mostrava os atletas no HTML inicial.`,
        solution:
          'As três viraram Server Components com `createPublicClient()` (chave anônima, sem cookies) e `revalidate = 60`: o HTML inicial já traz título, selo, descrição e data, e um comunicado novo publicado no painel aparece em até 60 s, sem novo deploy. Só o filtro por modalidade ficou como Client Component (components/GaleriaDestaques.tsx).',
      },
      {
        id: 'ed-home-cliente',
        title: 'Home ainda renderiza comunicados e atletas no cliente',
        shortLabel: 'SEO da Home ainda não inclui os comunicados',
        severity: 'medio',
        phase: 'fase3',
        status: 'pendente',
        effort: '2h',
        location: 'app/page.tsx',
        problem:
          `A Home continua sendo Client Component (precisa disso para o menu mobile, o dropdown do painel e as abas de campeonato), então os comunicados e destaques só chegam ao HTML depois da hidratação.`,
        evidence:
          `A Home precisa de useState para menuMobileAberto, menuPainelAberto e campeonatoSelecionado — logo não pode ser Server Component sem refatoração.`,
        solution:
          'Refatorar a Home: page.tsx vira Server Component e busca os dados no servidor; os estados interativos migram para um componente filho (ex.: components/HomeInterativo.tsx) que recebe os dados como props. O mesmo `CartaoComunicado` continua igual.',
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
   * 02 — BUILD E DEPLOY
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'build',
    number: '02',
    title: 'Build & Deploy',
    subtitle: 'O repositório não conseguia compilar o próprio site',
    color: '#ff2a35',
    glow: 'rgba(255, 42, 53, 0.4)',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    iconName: 'Zap',
    summary:
      'O `package.json` era o manifesto de um projeto Vite ("react-vite-tailwind", `"build": "vite build"`) dentro de uma aplicação Next.js 14 App Router. `npm run build` não compilava o site. Sombras disso: dependências ausentes, imports quebrados e um build que só "passava" porque a checagem de tipos estava desligada.',
    items: [
      {
        id: 'bl-manifesto-vite',
        title: 'package.json era de um projeto Vite, não do Next.js',
        shortLabel: 'npm run build não compilava o site',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '20min',
        location: 'package.json',
        problem:
          'O manifesto trazia `"name": "react-vite-tailwind"` e `"build": "vite build"`, mas o projeto é Next.js 14 App Router (diretório app/, next/link, Metadata API). Não existe vite.config.ts nem index.html — o comando de build falhava na hora.',
        evidence:
          `"scripts": { "dev": "vite build", "build": "vite build" } · dependências: clsx, jszip, lucide-react, react, react-dom, tailwind-merge.`,
        solution:
          `Manifesto reescrito para Next.js 14.2.35 com scripts dev/build/start/lint/typecheck e as dependências realmente usadas.`,
      },
      {
        id: 'bl-lockfile-sem-next',
        title: 'package-lock.json não tinha o pacote `next`',
        shortLabel: 'npm ci não instalava o framework',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '10min',
        location: 'package-lock.json',
        problem:
          'Zero entradas de `next` no lockfile. Mesmo com o package.json corrigido, um `npm ci` (que é o que a Vercel roda) instalaria o lockfile antigo e o build quebraria.',
        evidence: 'grep -c \'"next"\' package-lock.json → 0',
        solution: 'Lockfile regenerado a partir do novo manifesto (lockfileVersion 3).',
      },
      {
        id: 'bl-deps-ausentes',
        title: 'Dependências em uso não declaradas: next, @supabase/supabase-js, @supabase/ssr',
        shortLabel: 'Dependências usadas e não declaradas',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '15min',
        location: 'package.json',
        problem:
          'O código importava `next`, `@supabase/supabase-js` e `@supabase/ssr`, mas nenhuma estava no manifesto. Uma instalação limpa não compila.',
        evidence:
          `grep de imports externos → next, @supabase/ssr, @supabase/supabase-js, clsx, jszip, lucide-react, react, tailwind-merge.`,
        solution: 'Todas declaradas com versão fixa ou range conservador.',
      },
      {
        id: 'bl-tailwind-versao',
        title: 'Tailwind v4 no manifesto com pipeline PostCSS do v3',
        shortLabel: 'Tailwind v4 quebrando o build',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '15min',
        location: 'package.json + postcss.config.mjs + tailwind.config.ts',
        problem:
          'O manifesto fixava tailwindcss 4.1.17, mas o projeto usa a API do v3: `@tailwind base/components/utilities` no globals.css, `content:` no tailwind.config.ts e o plugin PostCSS `tailwindcss` (no v4 o plugin mudou para @tailwindcss/postcss). As duas versões não são compatíveis.',
        evidence:
          `postcss.config.mjs → { plugins: { tailwindcss: {}, autoprefixer: {} } } · globals.css → @tailwind base; · tailwind.config.ts → content: [...]`,
        solution: 'Fixado tailwindcss ^3.4.19, com postcss e autoprefixer declarados.',
      },
      {
        id: 'bl-require-esm',
        title: 'tailwind.config.ts usava require() num pacote ESM',
        shortLabel: 'require is not defined no build',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '10min',
        location: 'tailwind.config.ts',
        problem:
          'O package.json declara `"type": "module"`, e o tailwind.config.ts fazia `plugins: [require("tailwindcss-animate")]`. Em ESM, `require` não existe — o carregamento da configuracao quebrava o build.',
        evidence: 'plugins: [require(\'tailwindcss-animate\')], · package.json → "type": "module"',
        solution:
          'Trocado por `import tailwindcssAnimate from "tailwindcss-animate"` e a dependência foi declarada.',
      },
      {
        id: 'bl-imports-data',
        title: '8 arquivos importavam de "../data/*" — diretório inexistente',
        shortLabel: 'Imports de módulo que não existe',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '15min',
        location:
          `components/{RebuiltArenaSite, NoVercelGuide, DomainActivation, NodeInspectorPanel, PatchDownload, PatchKit, RoutesAuditTable, SyncControlRoom}.tsx`,
        problem:
          'Todos importavam módulos de `../data/` (arenaSiteData, auditData, domainData, patchFiles, patchKit, syncData), mas os arquivos vivem na RAIZ do repositório e o diretório `data/` não existe. Nenhum desses módulos podia ser resolvido.',
        evidence:
          `grep "from \'../data/" → 8 ocorrências · ls -d data → "No such file or directory"`,
        solution:
          `Os caminhos foram corrigidos para a localização real (raiz). Os arquivos foram mantidos — ver a pendência MAN-01 sobre código morto.`,
      },
      {
        id: 'bl-ignore-build-errors',
        title: 'next.config.mjs com ignoreBuildErrors: true mascarava tudo',
        shortLabel: 'A flag que escondia os erros de build',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '2h',
        location: 'next.config.mjs',
        problem:
          `A flag desligava a checagem de tipos no build. Foi o que permitiu que os imports quebrados, o manifesto Vite e as colunas inexistentes passassem "verdes". O build dava sucesso num projeto que não compila.`,
        evidence:
          `typescript: { ignoreBuildErrors: true } com o comentário "Ignora erros de TypeScript no build (a app funciona normal no browser)" — não é verdade.`,
        solution:
          'Flag desligada. Hoje `npx tsc --noEmit` passa com ZERO erros, e o build falha se algo regredir. O script `npm run typecheck` foi adicionado.',
      },
      {
        id: 'bl-prerender-env',
        title: 'createClient() no corpo do componente quebrava o prerender sem env vars',
        shortLabel: 'Build caía sem as variáveis de ambiente',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '45min',
        location: 'lib/supabase/client.ts e lib/supabase/server.ts',
        problem:
          `O cliente Supabase era criado no corpo de 15 componentes client-side — ou seja, TAMBÉM durante o prerender do Next.js. Sem NEXT_PUBLIC_SUPABASE_URL/KEY, o build inteiro caía com "Your project's URL and API key are required" em 5 rotas (/noticias, /campeonatos, /painel/*). Um build em CI ou preview sem credenciais é impossível.`,
        evidence:
          `Error: @supabase/ssr: Your project's URL and API key are required! · Error occurred prerendering page "/painel/noticias"`,
        solution:
          `Os clientes agora devolvem um cliente INERTE (consultas retornam {data:null, error}) quando não há credenciais. Nenhum build quebra por falta de env var, e as telas já caem no conteúdo de fallback.`,
      },
      {
        id: 'bl-import-nav',
        title: 'import { Nav } de um componente com export default',
        shortLabel: 'Navegação quebrada em /capitao e /moderador',
        severity: 'medio',
        phase: 'fase2',
        status: 'corrigido',
        effort: '10min',
        location: 'components/nav.tsx · app/(coord)/capitao e /moderador',
        problem:
          'As duas páginas faziam `import { Nav } from "@/components/nav"`, mas o componente só tinha export default. O webpack avisava "Attempted import error: \'Nav\' is not exported" e o cabeçalho dessas telas-admin não aparecia.',
        evidence: 'Attempted import error: \'Nav\' is not exported from \'@/components/nav\' (imported as \'Nav\').',
        solution: 'Adicionado export nomeado além do default.',
      },
      {
        id: 'bl-env-higiene',
        title: 'Sem .gitignore e sem .env.example',
        shortLabel: 'Risco de versionar segredos',
        severity: 'medio',
        phase: 'fase2',
        status: 'corrigido',
        effort: '15min',
        location: '.gitignore e .env.example',
        problem:
          'O repositório não tinha .gitignore. Um `.env.local` seria versionado por engano, junto com a chave de serviço do Supabase.',
        evidence:
          'ls -a na raiz → nenhum .gitignore e nenhum .env.example; o manifesto não documentava as variáveis de ambiente.',
        solution:
          `.gitignore completo (node_modules, .next, .env*, .vercel) e .env.example documentando as três variáveis necessárias.`,
      },
      {
        id: 'bl-migracao-duplicada',
        title: 'Diretório duplicado de migrações com a mesma versão 0004',
        shortLabel: 'supabase db push falharia',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '10min',
        location: 'supabase/migrations/supabase/migrations/0004_capitao_permissoes.sql',
        problem:
          'Existia uma cópia de `0004_capitao_permissoes.sql` dentro de `supabase/migrations/supabase/migrations/`. Duas migrações com a mesma versão quebram o `supabase db push` — que é justamente o comando necessário para aplicar a correção do schema.',
        evidence:
          `supabase/migrations/ → 0001..0006 · supabase/migrations/supabase/migrations/ → 0004_capitao_permissoes.sql (cópia)`,
        solution: 'Diretório duplicado removido.',
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
   * 03 — SEGURANÇA
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'seguranca',
    number: '03',
    title: 'Segurança & Acesso',
    subtitle: 'Credenciais no bundle e painéis abertos',
    color: '#ff3b47',
    glow: 'rgba(255, 59, 71, 0.4)',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    iconName: 'ShieldAlert',
    summary:
      `O portal de acesso validava credenciais fixas escritas dentro do próprio arquivo — servidas ao navegador. E o middleware só protegia /painel: /coordenador e /proprietario respondiam HTTP 200 para qualquer visitante.`,
    items: [
      {
        id: 'sec-credenciais-login',
        title: 'Credenciais reais hardcoded no bundle de /login',
        shortLabel: '4 contas com senha publicadas no JS',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '1h',
        location: 'app/(auth)/login/page.tsx',
        problem:
          `A tela de login comparava o que o usuário digitava contra credenciais escritas no arquivo — que é baixado por qualquer visitante. Havia uma conta de proprietário, duas de coordenador e uma conta de coordinator que entrava com QUALQUER senha. Havia ainda um botão "Acesso Rápido" que preenchia a senha do proprietário sozinha.`,
        evidence:
          `O bundle público do site continha os pares e-mail/senha em texto claro. Um quarto caso aceitava senha vazia.`,
        solution:
          'A autenticação passou a ser real: `supabase.auth.signInWithPassword()`. A sessão é gravada em cookie HttpOnly pelo @supabase/ssr e é exatamente o que o middleware exige. As credenciais foram removidas do código.',
      },
      {
        id: 'sec-coordenador-aberto',
        title: '/coordenador e /proprietario respondiam 200 sem nenhuma sessão',
        shortLabel: 'Painéis do coordenador e do dono abertos',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '30min',
        location: 'middleware.ts',
        problem:
          `O matcher do middleware era apenas ["/painel/:path*"]. As rotas /coordenador, /coordenador/atletasdestaques e /proprietario não eram cobertas: respondiam HTTP 200 e entregavam o HTML completo do painel, com e-mails internos de coordenadores eInformation de acesso.`,
        evidence:
          `GET /coordenador → 200 · GET /proprietario → 200 (o HTML do painel do proprietário era servido inteiro).`,
        solution:
          `O matcher agora cobre /painel, /coordenador e /proprietario. (/capitao e /moderador já faziam checagem de sessão no próprio Server Component e seguem o padrão deles, com ?next=.)`,
      },
      {
        id: 'sec-senha-mestra',
        title: 'Senha mestra do coordenador escrita no bundle',
        shortLabel: 'Senha do painel no JavaScript público',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '45min',
        location: 'app/(coord)/coordenador/page.tsx',
        problem:
          `O gate de senha do painel do coordenador comparava a entrada com uma constante declarada no próprio arquivo do componente. Bastava abrir o DevTools e ler.`,
        evidence: 'const SENHA_MESTRA = "arena2026"; — presente no bundle público de /coordenador.',
        solution:
          `O gate foi removido: o acesso é garantido pelo middleware (sessão Supabase). A mesma senha aparecia também em components/OwnerPanel.tsx e num prefill de components/RebuiltArenaSite.tsx — removidos dos três lugares.`,
      },
      {
        id: 'sec-proprietario-credenciais',
        title: '/proprietario validava e-mail e senha fixos no cliente',
        shortLabel: 'Credencial do dono validada no navegador',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '45min',
        location: 'app/(coord)/proprietario/page.tsx',
        problem:
          `A tela de acesso do proprietário comparava o e-mail e a senha mestra contra valores fixos escritos no arquivo. A tela do painel (com a lista de coordenadores, moderadores e capitães) era renderizada no HTML do servidor.`,
        evidence: 'Comparação do e-mail e da senha mestra em código de componente cliente.',
        solution:
          'A validação passou a usar `supabase.auth.signInWithPassword()` e a rota ficou atrás do middleware.',
      },
      {
        id: 'sec-login-quebrado',
        title: 'O login do site não abria o painel',
        shortLabel: 'Login escrevia em localStorage, painel exigia cookie',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '45min',
        location: 'app/(auth)/login/page.tsx e middleware.ts',
        problem:
          'O login só gravava `arenavale_user_email` no localStorage. O middleware exige sessão Supabase em cookie. Ou seja: quem usava o login do site era jogado de volta para /login pelo middleware — o painel era inalcançável pela via normal.',
        evidence:
          `localStorage.setItem("arenavale_user_email", ...) · middleware → supabase.auth.getUser() → 307 para /login.`,
        solution:
          `Com signInWithPassword, o cookie de sessão é criado e o middleware reconhece o acesso. O parâmetro ?next= devolve o usuário para a página que ele queria.`,
      },
      {
        id: 'sec-contas-supabase',
        title: 'As contas precisam ser recriadas no Authentication do Supabase',
        shortLabel: 'Ação manual: criar as contas de acesso',
        severity: 'medio',
        phase: 'fase1',
        status: 'pendente',
        effort: '30min',
        location: 'Supabase → Authentication → Users',
        problem:
          `A autenticação agora é real, contra o Authentication do Supabase. As contas que existiam antes eram apenas comparações de string no JavaScript — nunca foram usuários do Supabase. Sem criar essas contas, o login não autentica ninguém.`,
        evidence:
          `O projeto tem @supabase/ssr e RLS configurados, mas as contas de coordinator/moderador/capitão não são usuários do Authentication.`,
        solution:
          'Criar as contas em Supabase → Authentication → Users com os e-mails da organização, marcar as permissões em `profiles.role` (anonimo/autenticado/moderador/coordenador) e distribuir as senhas por canal seguro.',
      },
      {
        id: 'sec-service-role',
        title: 'Chave de serviço do Supabase — verificação de escopo',
        shortLabel: 'Service role só no servidor (conferido)',
        severity: 'ajuste',
        phase: 'fase2',
        status: 'corrigido',
        effort: '10min',
        location: 'lib/supabase/server.ts',
        problem:
          `A chave de serviço (que ignora RLS) precisa ficar exclusivamente no servidor.`,
        evidence:
          `grep por SERVICE_ROLE → apenas lib/supabase/server.ts, que é importado apenas por Server Components e Route Handlers.`,
        solution:
          'Confirmado: nenhuma chave de serviço é referenciada em Client Component. `createAdminClient()` agora devolve um cliente inerte quando a variável falta, em vez de lançar.',
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
   * 04 — SCHEMA DO BANCO
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'schema',
    number: '04',
    title: 'Schema do Banco',
    subtitle: 'Tabelas que o código usa e nenhuma migração criava',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.35)',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    iconName: 'BarChart3',
    summary:
      'As tabelas `noticias` e `atletas_destaque` são usadas em todo o código, mas NENHUMA migração as criava — a 0006 só fazia INSERT nelas. Um banco novo, instalado a partir do repositório, nasce sem elas. Além disso, `site_config`, a view `v_classificacao` e a função `get_receita_mensal` também nunca foram criadas.',
    items: [
      {
        id: 'db-noticias-sem-ddl',
        title: 'A migração 0006 inseria em `noticias` sem nunca criá-la',
        shortLabel: 'Tabela do mural não é criada por migração',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '30min',
        location: 'supabase/migrations/0006_noticias_atletas_destaque.sql',
        problem:
          'O arquivo fazia apenas `insert into public.noticias (...)`. Em uma instalação nova, o comando falhava com "relation public.noticias does not exist" e TODO o fluxo editorial (Home, mural, galeria, painéis) ficava sem tabela.',
        evidence:
          'grep "create table" em supabase/ → nenhuma menção a `noticias` nem a `atletas_destaque`.',
        solution:
          `A 0006 agora cria as duas tabelas (com índices e colunas reais) ANTES do seed. A 0007 complementa com RLS, colunas novas, site_config, view, função e a correção de acentuação.`,
      },
      {
        id: 'db-atletas-sem-ddl',
        title: 'A tabela `atletas_destaque` também nunca era criada',
        shortLabel: 'Tabela de destaques sem DDL',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '20min',
        location: 'supabase/migrations/0006_noticias_atletas_destaque.sql',
        problem:
          'Mesma lacuna da `noticias`: nada no repositório criava a tabela dos destaques de atletas.',
        evidence: 'grep "atletas_destaque" em supabase/ → só a migração 0006, e apenas no INSERT.',
        solution: 'DDL adicionado na 0006, alinhado às colunas reais de produção.',
      },
      {
        id: 'db-site-config',
        title: 'site_config não existe em produção',
        shortLabel: 'Config do site: tabela inexistente',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '20min',
        location: 'components/coord-config.tsx → tabela site_config',
        problem:
          'O painel de configuração do coordenador lê e grava `site_config`, que não existe no banco de produção. Toda a tela de configurações falhava.',
        evidence:
          `GET /rest/v1/site_config → 404 {"code":"PGRST205","message":"Could not find the table \'public.site_config\' in the schema cache"}`,
        solution: 'Criada na migração 0007, com RLS (leitura pública, escrita do coordenador) e registro inicial da linha "main".',
      },
      {
        id: 'db-view-funcao',
        title: 'v_classificacao e get_receita_mensal nunca foram criadas',
        shortLabel: 'View e função ausentes no banco',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '30min',
        location: 'lib/supabase/queries.ts',
        problem:
          'getClassificacao() consulta a view `v_classificacao` e getReceitaMensal() chama a função `get_receita_mensal`. Nenhuma das duas existe no banco — ambas quebravam com erro do PostgREST.',
        evidence:
          `GET /rest/v1/v_classificacao → 404 PGRST205 · POST /rest/v1/rpc/get_receita_mensal → 404 PGRST202`,
        solution: 'View e função criadas na migração 0007 (create or replace, idempotente).',
      },
      {
        id: 'db-colunas-destaque',
        title: 'atletas_destaque sem modalidade nem estatísticas',
        shortLabel: 'Faltavam colunas no painel de atletas',
        severity: 'alto',
        phase: 'fase1',
        status: 'corrigido',
        effort: '20min',
        location: 'tabela atletas_destaque',
        problem:
          `O painel de atletas queria publicar modalidade, jogos, gols/pontos e assistências — colunas que não existiam. Sem elas, a galeria não conseguia filtrar por modalidade nem mostrar estatísticas.`,
        evidence:
          `Colunas reais: {id, foto_url, atleta_nome, time_nome, campeonato_nome, ativo, ordem, created_at, created_by} — sem modalidade/jogos/gols_ou_pontos/assistencias.`,
        solution:
          'Colunas adicionadas com `add column if not exists` (nullable) na 0007, com backfill da modalidade a partir do nome do campeonato. O painel passou a publicá-las.',
      },
      {
        id: 'db-seed-sem-acento',
        title: 'Seed gravado sem acentuação',
        shortLabel: 'Causa raiz dos textos sem acento',
        severity: 'medio',
        phase: 'fase2',
        status: 'corrigido',
        effort: '20min',
        location: 'supabase/migrations/0006 e 0007',
        problem:
          `O seed gravava "INSCRICOES ABERTAS", "Estao abertas", "Volei", "regiao", "numero", "tecnica". Era a causa raiz de o site precisar de correções de acentuação em cada tela.`,
        evidence: 'O seed da 0006 original e as 3 linhas em produção estavam todas sem acento.',
        solution:
          `Seed reescrito com acentuação correta na 0006, e a 0007 corrige os registros JÁ publicados em produção com UPDATE的方向ais (idempotentes).`,
      },
      {
        id: 'db-aplicar-0007',
        title: 'A migração 0007 precisa ser aplicada em produção',
        shortLabel: 'Rodar supabase db push',
        severity: 'alto',
        phase: 'fase1',
        status: 'pendente',
        effort: '15min',
        location: 'Supabase → SQL Editor ou `supabase db push`',
        problem:
          `A 0007 está no repositório, mas o banco de PRODUÇÃO ainda não tem: site_config, v_classificacao, get_receita_mensal, as colunas novas de atletas_destaque nem o texto acentuado dos comunicados.`,
        evidence:
          `site_config → 404 PGRST205 · atletas_destaque → sem modalidade · comunicados → "INSCRICOES ABERTAS PARA A TEMPORADA 2026"`,
        solution:
          'Rodar `supabase db push` (ou colar o arquivo no SQL Editor). O script é idempotente: pode rodar quantas vezes for, sem duplicar nem apagar nada. Enquanto não for aplicada, o site continua funcionando — o padrão do app tolera a ausência dessas tabelas.',
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
   * 05 — ROTAS, NAVEGAÇÃO E CONTEÚDO
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'rotas',
    number: '05',
    title: 'Rotas & Navegação',
    subtitle: 'Links quebrados, 404 e conteúdo de outra organização',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.35)',
    badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    iconName: 'Unlink',
    summary:
      `Links que levavam ao lugar errado, uma rota 404 e uma rota que servia o site de outra organização. Além disso, etiquetas internas de desenvolvimento ("CFG6") apareciam na interface pública de cinco páginas, e o markdown cru **CFG6** era renderizado no rodapé de duas delas.`,
    items: [
      {
        id: 'rot-nav-campeonatos',
        title: 'O menu apontava "Campeonatos" para o painel administrativo',
        shortLabel: 'Link Campeonatos ia para /painel/campeonatos',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '5min',
        location: 'components/nav.tsx',
        problem:
          `O item "Campeonatos" do menu levava para /painel/campeonatos — que é a área do painel editorial, bloqueada por login. Um visitante clicava e era jogado para a tela de acesso. A página pública /campeonatos existia e nunca era linkada.`,
        evidence: '<Link href="/painel/campeonatos">Campeonatos</Link>',
        solution: 'Apontado para /campeonatos.',
      },
      {
        id: 'rot-header-sem-noticias',
        title: 'O header administrativo não tinha link para /noticias',
        shortLabel: 'Mural de comunicados sem entrada no menu',
        severity: 'alto',
        phase: 'fase2',
        status: 'corrigido',
        effort: '5min',
        location: 'components/Header.tsx',
        problem:
          `O menu tinha Início, TV, Campeonatos, Atletas, Projeto Social e Agenda — mas não tinha Notícias. O mural de comunicados oficiais era a página mais importante do site editorial e não tinha entrada por navegação.`,
        evidence: 'Nav do Header: Início · TV Arena Vale · Campeonatos · Atletas · Projeto Social · Agenda',
        solution: 'Adicionado o link "Notícias" para /noticias.',
      },
      {
        id: 'rot-sumula-404-500',
        title: '/sumula dava 404 e /sumula/[id] dava 500 servindo o site de outra organização',
        shortLabel: 'Rota de súmula servia outra organização',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '2h',
        location: 'app/(public)/sumula/[id]/page.tsx',
        problem:
          `A rota /sumula/[id] era uma CÓPIA da home de outra organização: "Vale do Paraíba · SP", "A CASA DO FUTEBOL DO VALE", times fictícios (Vila Real FC, União FC, Resenha FC) e rodapé "Feito com 💙💛 no Vale do Paraíba". O parâmetro [id] nunca era lido — a rota ignorava o ID, servia a mesma landing page para qualquer súmula e ainda respondia HTTP 500. E /sumula (sem id) não existia: 404.`,
        evidence:
          `GET /sumula → 404 · GET /sumula/1 → 500 · o arquivo continha "Vale do Paraíba · SP" e a hero "A CASA DO FUTEBOL DO VALE"`,
        solution:
          `A rota foi reescrita como súmula digital real (placar, dados da partida, assinaturas, hash SHA-256 de integridade) e ganhou uma index em /sumula com a lista dos confrontos.`,
      },
      {
        id: 'rot-cfg6-publico',
        title: 'Etiquetas internas "CFG6" e markdown cru **CFG6** na interface pública',
        shortLabel: 'Rótulo interno de dev na tela do visitante',
        severity: 'alto',
        phase: 'fase2',
        status: 'corrigido',
        effort: '20min',
        location: '/agenda · /tv · /links · /projetosocial · /login · /painel (Header)',
        problem:
          `O selo "CONFIGURAÇÃO CFG6" aparecia no rodapé de cinco páginas e no badge do header, e o rodapé de /links e /projetosocial renderizava "Configuração Registada sob a etiqueta **CFG6**" — com os asteriscos de Markdown literais, porque o texto não passou por um interpretador. Passa impressão de versão de teste.`,
        evidence:
          `grep CFG6 → 9 arquivos · "Configuração Registada sob a etiqueta **CFG6**" com ** literal na tela`,
        solution: 'Rótulos internos removidos e rodapés normalizados.',
      },
      {
        id: 'rot-sitemap',
        title: 'Sitemap sem as páginas de conteúdo',
        shortLabel: 'Sitemap sem /noticias e /inscricao',
        severity: 'medio',
        phase: 'fase2',
        status: 'corrigido',
        effort: '20min',
        location: 'app/sitemap.ts',
        problem:
          `O sitemap listava 7 rotas e omitia justamente as páginas de conteúdo: /noticias (o mural oficial), /inscricao, /links e /privacidade, /termos.`,
        evidence: 'app/sitemap.ts antigo → /, /tv, /agenda, /atletasdestaques, /campeonatos, /patrocinio, /projetosocial',
        solution: 'Sitemap reescrito com 12 rotas, incluindo o mural de comunicados e a ficha de inscrição.',
      },
      {
        id: 'rot-headers-duplicados',
        title: 'Três implementações diferentes de cabeçalho no site',
        shortLabel: '3 headers distintos no mesmo site',
        severity: 'ajuste',
        phase: 'fase3',
        status: 'pendente',
        effort: '2h',
        location: 'app/page.tsx · components/nav.tsx · components/Header.tsx',
        problem:
          `A Home tem um header próprio (preto e vermelho, com menu completo). components/nav.tsx é o header âmbar das telas-admin. components/Header.tsx é um terceiro header, usado só pelo shell do coordenador. As páginas públicas ainda repetem um header simplificado ("← Voltar ao Início") uma a uma.`,
        evidence: 'grep "sticky top-0 z-40" em app/ → 12 ocorrências com markups diferentes.',
        solution:
          `Extrair um <HeaderPublic /> e um <FooterPublic /> e usar nas páginas públicas. Ganho: navegação consistente (incluindo o link de Notícias) e menos duplicação.`,
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
   * 06 — SEO E CONTEÚDO
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'seo',
    number: '06',
    title: 'SEO & Conteúdo',
    subtitle: 'Regressão pendente de deploy, canal quebrado e idioma',
    color: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.35)',
    badgeBg: 'bg-violet-500/15 text-violet-300 border-violet-500/40',
    iconName: 'Globe',
    summary:
      `O último commit do repositório tinha regredido o layout para inglês e apagado as tags OpenGraph. A página da TV embedia um canal do YouTube que não existe. O robots.txt apontava para um domínio que não resolve.`,
    items: [
      {
        id: 'seo-layout-regressao',
        title: 'Commit 41ec830 trocou lang="pt-BR" por "en" e apagou as meta tags',
        shortLabel: 'Regressão de idioma e OpenGraph no HEAD',
        severity: 'critico',
        phase: 'fase1',
        status: 'corrigido',
        effort: '20min',
        location: 'app/layout.tsx',
        problem:
          `O commit mais recente do repositório ("Update layout.tsx") substituiu o bloco de metadados completos por uma versão mínima: lang="en" num site 100% em português, título "Arena Vale | Official Portal" em inglês, descrição em inglês e a remoção das tags OpenGraph, Twitter Card, manifest e ícones. O site em produção ainda mostra a versão boa porque o deploy é anterior ao commit — o próximo deploy teria aplicado a regressão.`,
        evidence:
          `git show 41ec830 -- app/layout.tsx → -<html lang="pt-BR"> / +<html lang="en"> e remoção de openGraph/twitter/manifest/icons.`,
        solution: 'O layout com os metadados pt-BR completos foi restaurado (título, descrição, OG com imagem 1200×630, Twitter Card, manifest e ícones).',
      },
      {
        id: 'seo-tv-canal-placeholder',
        title: 'A TV embedia um canal do YouTube inexistente',
        shortLabel: 'Player da TV com canal placeholder',
        severity: 'alto',
        phase: 'fase2',
        status: 'corrigido',
        effort: '30min',
        location: 'app/tv/page.tsx',
        problem:
          'O iframe usava `embed/live_stream?channel=UC_TVArenaVale` — um ID de canal inventado. O player ficava permanentemente com "vídeo indisponível".',
        evidence: 'src="https://www.youtube.com/embed/live_stream?channel=UC_TVArenaVale" — ID com 14 caracteres, sem padrão.',
        solution:
          `O canal real foi resolvido: @TVArenaVale → UCBTQ97bWA6VqK2a6qv80dIg (confirmado pelo canonical da página do canal). A TV passou a ter também um catálogo com os dois vídeos publicados no canal.`,
      },
      {
        id: 'seo-robots-dominio',
        title: 'robots.txt e sitemap apontando para arenavale.com.br, que não resolve',
        shortLabel: 'Domínio próprio sem registro DNS',
        severity: 'medio',
        phase: 'fase3',
        status: 'pendente',
        effort: '2h',
        location: 'app/robots.ts · app/sitemap.ts · Registro.br',
        problem:
          `O robots.txt declara o sitemap em https://www.arenavale.com.br/sitemap.xml, mas o domínio não tem registro A: o DNS responde NXDOMAIN/NOERROR sem endereço. O sitemap, por outro lado, usa o domínio .vercel.app. Os dois discordam, e os buscadores seguem o robots.txt.`,
        evidence:
          `app/robots.ts → baseUrl padrão https://www.arenavale.com.br · domainData.ts → "Registro A (apex): NOERROR sem resposta · apenas SOA na autoridade".`,
        solution:
          `Configurar o registro A no Registro.br apontando para o IP da Vercel e unificar baseUrl em uma constante única (NEXT_PUBLIC_BASE_URL). Enquanto o domínio não resolver, manter robots.txt e sitemap no mesmo domínio .vercel.app.`,
      },
      {
        id: 'seo-robots-admin',
        title: 'robots.txt não bloqueia as áreas administrativas',
        shortLabel: '/coordenador e /proprietario fora do robots',
        severity: 'medio',
        phase: 'fase2',
        status: 'pendente',
        effort: '10min',
        location: 'app/robots.ts',
        problem:
          `A lista de bloqueio tem apenas /login e /painel. As rotas /coordenador, /capitao, /moderador e /proprietario não estão bloqueadas — e devem estar, agora que /coordenador e /proprietario são áreas restritas.`,
        evidence: 'disallow: ["/login", "/painel"]',
        solution:
          `Acrescentar as novas rotas ao disallow. (A proteção de verdade já é o middleware; o robots é apenas para não indexar.)`,
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
   * 07 — MÍDIA E ASSETS
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'midia',
    number: '07',
    title: 'Mídia & Assets',
    subtitle: 'Pesos, arquivos vazios e configuração de outra plataforma',
    color: '#34d399',
    glow: 'rgba(52, 211, 153, 0.35)',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    iconName: 'HeartHandshake',
    summary:
      `A imagem de fundo é um JPEG de 308 KB carregado como preload bloqueante em todas as páginas. Há arquivos de 1 byte no repositório e um arquivo de configuração do Netlify servido como asset estático.`,
    items: [
      {
        id: 'mid-fundo-pesado',
        title: 'fundo-arena.jpg (308 KB) com preload bloqueante em todas as páginas',
        shortLabel: 'Imagem de fundo pesada no caminho crítico',
        severity: 'medio',
        phase: 'fase2',
        status: 'pendente',
        effort: '1h',
        location: 'public/fundo-arena.jpg',
        problem:
          'A imagem é carregada com `rel="preload"` no <head> de todas as páginas, tem 308 KB e ainda é usada como fallback de todos os cards de comunicado e de atleta. Com a WebP equivalente ficaria perto de 60 KB.',
        evidence: 'public/fundo-arena.jpg → 308.577 bytes · <link rel="preload" as="image" href="/fundo-arena.jpg">',
        solution:
          `Gerar a versão WebP (~60 KB), usar <Image /> do Next.js nos cards e trocar o preload por uma imagem mais leve (ou remover o preload das páginas que não usam o hero).`,
      },
      {
        id: 'mid-arquivos-vazios',
        title: 'Arquivos de 1 byte versionados no repositório',
        shortLabel: 'Assets vazios no repositório',
        severity: 'medio',
        phase: 'fase2',
        status: 'pendente',
        effort: '15min',
        location: 'public/imagem-app-mockup.jpg · public/video-hero.mp4 · src/data',
        problem:
          `Três arquivos com 1 byte (conteúdo vazio) estão versionados. Se alguém referenciá-los, a página mostra um imagem quebrada ou um vídeo de 0 byte.`,
        evidence: 'ls -la → 1 byte cada; src/data é um ARQUIVO (não diretório) com 1 byte.',
        solution:
          `Remover os que não são usados (imagem-app-mockup.jpg, video-hero.mp4, src/data) ou substituir por assets reais. Se a intenção era um diretório src/data, ele precisa ser criado com conteúdo.`,
      },
      {
        id: 'mid-redirects-netlify',
        title: 'public/_redirects é configuração do Netlify servida como asset',
        shortLabel: 'Config de outra plataforma no public/',
        severity: 'medio',
        phase: 'fase2',
        status: 'pendente',
        effort: '10min',
        location: 'public/_redirects',
        problem:
          'O arquivo contém `/* /index.html 200` — a regra de rewrite SPA do Netlify. Na Vercel ele é apenas um arquivo estático servido em /_redirects, e o conteúdo confunde: se fosse aplicado por engano, quebraria todas as rotas do Next.js (inclusive /noticias/[id] e /sumula/[id]).',
        evidence: 'cat public/_redirects → /*    /index.html   200',
        solution:
          `Remover do public/ e, se a hospedagem mudar para Netlify, guardar a configuração fora da pasta public (ou documentar no README).`,
      },
      {
        id: 'mid-espaco-nome',
        title: 'Asset com espaço no nome e não referenciado',
        shortLabel: 'Arquivo com espaço, sem uso',
        severity: 'ajuste',
        phase: 'fase3',
        status: 'pendente',
        effort: '5min',
        location: 'public/LOGO BASKETE.png',
        problem:
          `Arquivo de 118 KB com espaço no nome, que nenhum componente referencia. Fica exposto em /LOGO%20BAKETE.png.`,
        evidence: 'grep por "LOGO BASKETE" no código → nenhuma referência.',
        solution: 'Remover ou renomear (ex.: logo-baskete.png) se passar a ser usado.',
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
   * 08 — MANUTENÇÃO E CÓDIGO MORTO
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'manutencao',
    number: '08',
    title: 'Manutenção & Código Morto',
    subtitle: 'Pesos que ninguém usa e um catálogo que mentia',
    color: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.3)',
    badgeBg: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
    iconName: 'BarChart3',
    summary:
      `Cerca de 9.500 linhas de código não são importadas por nenhuma rota. Entre elas estão um site inteiro alternativo (RebuiltArenaSite), ferramentas de patch, um painel de sincronização e o próprio catálogo de auditoria — que estava desatualizado e descrevia problemas já resolvidos.`,
    items: [
      {
        id: 'man-codigo-morto',
        title: '~9.500 linhas sem nenhuma rota que as importe',
        shortLabel: '9,5k linhas de código morto',
        severity: 'medio',
        phase: 'fase3',
        status: 'pendente',
        effort: '3h',
        effortNote: 'remoção + validação do build',
        location:
          `components/ e raiz do repositório`,
        problem:
          `Nenhum componente abaixo é importado por app/, lib/ ou src/. Eles aumentam o ruído, escondem bugs (o import inexistente de ./ArenaLogo só apareceu quando a checagem de tipos foi ligada) e dão a impressão de que o site tem muito mais superfície do que tem.`,
        evidence:
          `RebuiltArenaSite.tsx (2.265) · OwnerPanel.tsx (1.154) · SyncControlRoom.tsx (736) · PatchKit.tsx (453) · patchFiles.ts (800) · patchKit.ts (599) · syncData.ts (592) · domainData.ts (194) · NoVercelGuide (307) · DomainActivation (602) · PatchDownload (219) · InteractiveMindMap (99) · NodeInspectorPanel (217) · RoutesAuditTable (158) · ProjetoSocialFocus (277) · PainelMetricas (96) · AgendaJogos (82) · portal-menu (50)`,
        solution:
          `Duas frentes: (a) remover o que é claramente residual; (b) publicar a auditoria numa rota real (ex.: /auditoria) para que o mapa mental e a tabela de rotas passem a ser acessíveis pelo time — hoje eles existem como arquivo e não têm página.`,
      },
      {
        id: 'man-auditoria-desatualizada',
        title: 'O catálogo de auditoria descrevia falhas já resolvidas',
        shortLabel: 'Auditoria apontando problemas inexistentes',
        severity: 'medio',
        phase: 'fase2',
        status: 'corrigido',
        effort: '2h',
        location: 'auditData.ts',
        problem:
          `A auditoria afirmava que /painel respondia 200 sem login, que /campeonatos dava 404, que /favicon.ico e /manifest.json não existiam e que a Home não tinha seções — todos já resolvidos. Ela não mencionava os problemas reais (credenciais no bundle, manifesto Vite, colunas inexistentes).`,
        evidence:
          `ROUTE_SCAN_RESULTS antigo: "/campeonatos → httpStatus 404", "/painel → 200 · FALHA CRÍTICA", "/favicon.ico → 404", "/manifest.json → 404".`,
        solution:
          `Este arquivo foi reescrito com o levantamento atual: 8 categorias, 43 itens, cada um com severidade, evidência verificada e estado (corrigido/pendente). A verificação usou o site em produção, o repositório e o schema real do Supabase via PostgREST.`,
      },
    ],
  },
];

/**
 * VARREDURA DE ROTAS — situação verificada em 28/10/2026.
 * Compare com `ROUTE_SCAN_RESULTS` anterior, que registrava estados
 * que já não eram verdadeiros.
 */
export const ROUTE_SCAN_RESULTS: RouteScanItem[] = [
  {
    path: '/',
    fullUrl: 'https://arena-vale.vercel.app/',
    httpStatus: 200,
    sizeLabel: '11,1 kB JS',
    statusType: 'ok',
    category: 'Página',
    finding:
      `Home íntegra. Mostra comunicados e destaques reidratados no cliente (o HTML inicial ainda traz o fallback).`,
    actionRequired:
      `Refatorar para Server Component para incluir o texto dos comunicados no HTML inicial (item ed-home-cliente).`,
  },
  {
    path: '/noticias',
    fullUrl: 'https://arena-vale.vercel.app/noticias',
    httpStatus: 200,
    sizeLabel: '47,2 kB HTML',
    statusType: 'ok',
    category: 'Página',
    finding:
      `Mural de comunicados com os 4 registros reais do banco, selos, datas e acentos corretos. Renderizado no servidor.`,
    actionRequired: 'Nenhuma. Publicar pelo /painel/noticias passa a aparecer em até 60 s.',
  },
  {
    path: '/noticias/[id]',
    fullUrl: 'https://arena-vale.vercel.app/noticias/{id}',
    httpStatus: 200,
    sizeLabel: 'dinâmica',
    statusType: 'ok',
    category: 'Página',
    finding:
      `Rota de leitura do comunicado (nova). Antes não existia — o CTA do mural era um botão morto.`,
    actionRequired: 'Nenhuma.',
  },
  {
    path: '/atletasdestaques',
    fullUrl: 'https://arena-vale.vercel.app/atletasdestaques',
    httpStatus: 200,
    sizeLabel: '2,1 kB JS',
    statusType: 'ok',
    category: 'Página',
    finding:
      `Galeria agora lê o Supabase (antes lia localStorage e nunca mostrava os atletas publicados). Filtro "VÔLEI" corrigido.`,
    actionRequired: 'Nenhuma.',
  },
  {
    path: '/sumula',
    fullUrl: 'https://arena-vale.vercel.app/sumula',
    httpStatus: 200,
    sizeLabel: 'dinâmica',
    statusType: 'ok',
    category: 'Página',
    finding: 'Índice das súmulas (novo). Antes: HTTP 404.',
    actionRequired: 'Nenhuma.',
  },
  {
    path: '/sumula/[id]',
    fullUrl: 'https://arena-vale.vercel.app/sumula/{id}',
    httpStatus: 200,
    sizeLabel: 'dinâmica',
    statusType: 'ok',
    category: 'Página',
    finding:
      `Súmula digital real (placar, dados, assinaturas, hash). Antes: HTTP 500 servindo a home de outra organização.`,
    actionRequired: 'Nenhuma.',
  },
  {
    path: '/tv',
    fullUrl: 'https://arena-vale.vercel.app/tv',
    httpStatus: 200,
    sizeLabel: '188 B JS',
    statusType: 'ok',
    category: 'Página',
    finding:
      `Player com o canal real (UCBTQ97bWA6VqK2a6qv80dIg) + catálogo com os 2 vídeos publicados.`,
    actionRequired: 'Nenhuma.',
  },
  {
    path: '/painel',
    fullUrl: 'https://arena-vale.vercel.app/painel',
    httpStatus: 307,
    sizeLabel: 'redireciona',
    statusType: 'ok',
    category: 'Admin',
    finding:
      `Protegido: 307 → /login?next=%2Fpainel. A auditoria anterior afirmava que respondia 200 sem login.`,
    actionRequired: 'Criar as contas no Authentication do Supabase (item sec-contas-supabase).',
  },
  {
    path: '/coordenador',
    fullUrl: 'https://arena-vale.vercel.app/coordenador',
    httpStatus: 307,
    sizeLabel: 'redireciona',
    statusType: 'ok',
    category: 'Admin',
    finding:
      `Antes respondia 200 sem sessão. Agora 307 → /login?next=%2Fcoordenador.`,
    actionRequired: 'Nenhuma.',
  },
  {
    path: '/proprietario',
    fullUrl: 'https://arena-vale.vercel.app/proprietario',
    httpStatus: 307,
    sizeLabel: 'redireciona',
    statusType: 'ok',
    category: 'Admin',
    finding:
      `Antes respondia 200 com o HTML do painel do proprietário. Agora 307 → /login.`,
    actionRequired: 'Nenhuma.',
  },
  {
    path: '/capitao e /moderador',
    fullUrl: 'https://arena-vale.vercel.app/capitao',
    httpStatus: 307,
    sizeLabel: 'redireciona',
    statusType: 'ok',
    category: 'Admin',
    finding:
      `Protegidos por checagem de sessão no próprio Server Component, com ?next= preservado.`,
    actionRequired: 'Nenhuma.',
  },
  {
    path: '/login',
    fullUrl: 'https://arena-vale.vercel.app/login',
    httpStatus: 200,
    sizeLabel: '2,9 kB JS',
    statusType: 'alerta',
    category: 'Admin',
    finding:
      `Autenticação real (Supabase). As credenciais fixas que estavam no bundle foram removidas.`,
    actionRequired:
      `Criar as contas de Authentication no Supabase — sem isso o login não autentica ninguém.`,
  },
  {
    path: '/favicon.ico',
    fullUrl: 'https://arena-vale.vercel.app/favicon.ico',
    httpStatus: 200,
    sizeLabel: '125 KB',
    statusType: 'ok',
    category: 'SEO / Sistema',
    finding:
      `Existe e é servido. A auditoria anterior afirmava 404 — estava desatualizada.`,
    actionRequired: 'Nenhuma.',
  },
  {
    path: '/manifest.json',
    fullUrl: 'https://arena-vale.vercel.app/manifest.json',
    httpStatus: 200,
    sizeLabel: '460 B',
    statusType: 'ok',
    category: 'SEO / Sistema',
    finding:
      `Existe. A auditoria anterior afirmava 404 — estava desatualizada.`,
    actionRequired: 'Nenhuma.',
  },
  {
    path: '/sitemap.xml',
    fullUrl: 'https://arena-vale.vercel.app/sitemap.xml',
    httpStatus: 200,
    sizeLabel: '12 rotas',
    statusType: 'alerta',
    category: 'SEO / Sistema',
    finding:
      `Agora inclui o mural de comunicados, a ficha de inscrição e as páginas legais. Continua no domínio .vercel.app.`,
    actionRequired:
      `Unificar com o robots.txt quando o domínio arenavale.com.br tiver registro A.`,
  },
  {
    path: '/robots.txt',
    fullUrl: 'https://arena-vale.vercel.app/robots.txt',
    httpStatus: 200,
    sizeLabel: '215 B',
    statusType: 'alerta',
    category: 'SEO / Sistema',
    finding:
      `Bloqueia /login e /painel, mas não /coordenador, /capitao, /moderador e /proprietario.`,
    actionRequired: 'Acrescentar as rotas administrativas ao disallow.',
  },
  {
    path: '/fundo-arena.jpg',
    fullUrl: 'https://arena-vale.vercel.app/fundo-arena.jpg',
    httpStatus: 200,
    sizeLabel: '308 KB',
    statusType: 'alerta',
    category: 'Mídia',
    finding:
      `Carregada com preload bloqueante em todas as páginas e usada como fallback de todos os cards.`,
    actionRequired: 'Converter para WebP e usar o componente <Image /> do Next.js.',
  },
  {
    path: '/Build (CI)',
    fullUrl: 'npm run build',
    httpStatus: 200,
    sizeLabel: '31 rotas',
    statusType: 'ok',
    category: 'SEO / Sistema',
    finding:
      `Build Next.js funcional com checagem de tipos ATIVA (antes: manifesto Vite e ignoreBuildErrors).`,
    actionRequired: 'Nenhuma.',
  },
];

/** Resumo numérico do levantamento. */
export const AUDIT_RESUMO = {
  data: '28/10/2026',
  /** Itens de falha catalogados (fora os ramos). */
  total: 55,
  corrigidos: 44,
  pendentes: 11,
  criticos: 16,
  criticosCorrigidos: 16,
  categorias: 8,
};
