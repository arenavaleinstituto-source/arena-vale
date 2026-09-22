@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0c1f4a;
  --bg-deep: #08163a;
  --bg-alt: #102a5e;
  --surface: #1a3370;
  --surface-2: #234080;
  --primary: #f5d76e;
  --primary-dark: #c9a338;
  --text: #f0f4ff;
  --text-dim: #b6c4dc;
  --text-mute: #7e8fab;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: 'Inter', system-ui, sans-serif;
  background:
    radial-gradient(ellipse at 20% -10%, rgba(120,160,255,0.18), transparent 50%),
    radial-gradient(ellipse at 80% 10%, rgba(245,215,110,0.10), transparent 45%),
    var(--bg-deep);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

@layer components {
  .container { @apply max-w-[1280px] mx-auto px-6; }
  .btn { @apply inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm border transition; }
  .btn-primary { @apply btn bg-gradient-to-br from-[#ffe48f] to-[#c9a338] text-[#0a1530] shadow-md; }
  .btn-outline { @apply btn bg-transparent border-white/10 text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)]; }
  .btn-ghost { @apply btn bg-transparent text-[var(--text-dim)] hover:text-[var(--text)]; }
  .panel { @apply bg-[var(--surface)] border border-white/10 rounded-[14px] p-6; }
  .eyebrow { @apply inline-block px-3.5 py-1.5 bg-[rgba(245,215,110,0.1)] text-[var(--primary)] border border-[rgba(245,215,110,0.3)] rounded-full text-xs font-bold tracking-wider uppercase mb-6; }
  .heading { @apply font-serif text-4xl md:text-5xl font-extrabold leading-tight; }
  .accent { @apply bg-gradient-to-br from-[#ffe48f] to-[#c9a338] bg-clip-text text-transparent; }
}
