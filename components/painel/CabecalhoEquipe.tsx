import Link from 'next/link';

/** Cabeçalho simples das áreas da equipe (o cabeçalho público não aparece nelas). */
export function CabecalhoEquipe({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Arena Vale — início">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Arena Vale" className="h-10 w-auto mix-blend-lighten" />
          </Link>
          <div>
            <p className="text-lg font-black uppercase leading-none text-white">{titulo}</p>
            {subtitulo && <p className="text-xs text-white/50">{subtitulo}</p>}
          </div>
        </div>
        <Link href="/" className="rounded-full border border-white/20 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:border-[#e50914]">
          Ver o site
        </Link>
      </div>
    </header>
  );
}
