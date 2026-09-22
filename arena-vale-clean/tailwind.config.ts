import type { Config } from 'tailwindcss';

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
        bg: '#0c1f4a',
        'bg-deep': '#08163a',
        'bg-alt': '#102a5e',
        surface: { DEFAULT: '#1a3370', 2: '#234080', 3: '#2c4d95' },
        border: 'rgba(245, 215, 110, 0.20)',
        primary: { DEFAULT: '#f5d76e', dark: '#c9a338', deep: '#a8862b', light: '#ffe48f' },
        accent: '#ffd700',
        live: '#ff3b3b',
        cyan: '#4dd0e1',
        green: '#5fdb95',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cinzel', 'serif'],
      },
      borderRadius: { lg: '14px', md: '10px', sm: '6px' },
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
  plugins: [require('tailwindcss-animate')],
};
export default config;
