import Link from 'next/link';

/** Cabeçalho das áreas da equipe no visual novo (o cabeçalho público não aparece nelas). */
export function CabecalhoEquipe({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-av-linha bg-av-preto/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="ARENA VALE — início">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ARENA VALE" className="h-10 w-auto" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-extrabold uppercase leading-none text-white">{titulo}</h1>
            {subtitulo && <p className="mt-1 text-xs text-av-cinza">{subtitulo}</p>}
          </div>
        </div>
        <Link href="/" className="btn-leve">
          Ver o site
        </Link>
      </div>
    </header>
  );
}
