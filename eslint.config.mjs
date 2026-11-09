import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Dívida técnica do código herdado (levantada na Fase 1, 08/11/2026):
    // ~70 ocorrências destas regras em arquivos que já existiam.
    // Ficam como aviso para não bloquear o lint; devem voltar a "error"
    // conforme os arquivos forem reescritos nas Fases 2 e 3.
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
