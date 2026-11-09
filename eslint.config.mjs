import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * Arquivos herdados que ainda violam regras do React 19 / TypeScript estrito.
 * Só ELES têm essas regras como aviso; todo código novo segue as regras como
 * erro. Ao reescrever um destes arquivos, tire-o da lista.
 */
const LEGADO = [
  'app/(public)/sumula/\\[id\\]/page.tsx', // colchetes escapados: no glob, [id] seria uma classe de caracteres
  'app/(public)/sumula/page.tsx',
  'app/not-found.tsx',
  'app/painel/atletasdestaques/page.tsx',
  'app/painel/noticias/page.tsx',
  'app/termos/page.tsx',
  'components/capitao-elenco.tsx',
  'components/coord-destaques.tsx',
  'components/coord-jogos.tsx',
  'components/coord-shell.tsx',
  'components/coord-sumulas.tsx',
  'lib/content/destaques.ts',
  'lib/content/noticias.ts',
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: LEGADO,
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
    },
  },
  globalIgnores(['.next/**', 'node_modules/**', '.superpowers/**', 'next-env.d.ts']),
]);
