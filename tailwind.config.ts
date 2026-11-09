import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        // Tokens da marca (spec Fase 3). Os nomes antigos apontam para eles,
        // para as páginas legadas mudarem de cara sem reescrever.
        av: {
          preto: '#0b0b0c',
          grafite: '#141417',
          'grafite-2': '#1d1d22',
          linha: '#2a2a30',
          branco: '#f4f4f5',
          cinza: '#a1a1aa',
          vermelho: '#e50914',
          'vermelho-claro': '#ff3b44',
          amarelo: '#facc15',
        },
        bg: '#0b0b0c',
        'bg-deep': '#0b0b0c',
        'bg-alt': '#141417',
        surface: { DEFAULT: '#141417', 2: '#1d1d22', 3: '#26262c' },
        border: '#2a2a30',
        primary: { DEFAULT: '#e50914', dark: '#b20710', deep: '#8f060d', light: '#ff3b44' },
        accent: '#e50914',
        live: '#e50914',
        cyan: '#a1a1aa',
        green: '#5fdb95',
      },
      fontFamily: {
        display: ['var(--font-saira)', 'Arial Black', 'system-ui', 'sans-serif'],
        sans: ['var(--font-barlow)', 'Segoe UI', 'system-ui', 'sans-serif'],
        rotulo: ['var(--font-barlow-condensed)', 'Arial Narrow', 'system-ui', 'sans-serif'],
        serif: ['var(--font-saira)', 'Arial Black', 'sans-serif'],
      },
      borderRadius: { lg: '14px', md: '12px', sm: '8px', xl: '18px', '2xl': '22px', '3xl': '28px' },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        blink: { '50%': { opacity: '0.4' } },
        'pulse-live': { '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,59,59,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(255,59,59,0)' } },
      },
      animation: {
        'fade-in': 'fade-in .3s ease',
        'slide-up': 'slide-up .35s ease',
        'pulse-live': 'pulse-live 2s ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
