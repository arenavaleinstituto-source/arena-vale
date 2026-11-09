import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acesso negado | Arena Vale',
  robots: { index: false, follow: false },
};

export default function AcessoNegadoPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 px-6 py-20 text-center">
      <span className="rounded-full border border-[#e50914]/40 bg-[#e50914]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#ff6b73]">
        Área da equipe
      </span>
      <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">Acesso negado</h1>
      <p className="text-base text-white/70">Sua conta não tem acesso a esta área. Fale com a coordenação.</p>
      <Link
        href="/"
        className="rounded-full bg-[#e50914] px-6 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30 transition hover:bg-[#ff1f2b]"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
