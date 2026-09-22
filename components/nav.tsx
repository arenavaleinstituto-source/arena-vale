import Link from 'next/link';
import { Shield } from './shield';

export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[rgba(12,31,74,0.78)] backdrop-blur-md border-b border-transparent">
      <div className="container flex items-center justify-between h-[78px]">
        <Link href="/" className="flex items-center gap-3">
          <Shield size={44} />
          <div className="flex flex-col leading-none">
            <strong className="font-serif text-base font-extrabold tracking-wider">
              ARENA <span className="text-[var(--primary)]">VALE</span>
            </strong>
            <small className="font-serif text-[10px] font-bold tracking-[3px] text-[var(--primary)] mt-1">
              SPORTS
            </small>
          </div>
        </Link>
        <nav className="hidden md:flex gap-7 text-sm text-[var(--text-dim)]">
          <Link href="/#campeonatos" className="hover:text-[var(--primary)] transition">Campeonatos</Link>
          <Link href="/#aovivo" className="hover:text-[var(--primary)] transition">Ao Vivo</Link>
          <Link href="/#estatisticas" className="hover:text-[var(--primary)] transition">Estatísticas</Link>
          <Link href="/#classificacao" className="hover:text-[var(--primary)] transition">Classificação</Link>
        </nav>
        <div className="flex gap-2 items-center">
          <Link href="/login" className="btn-ghost">🔐 Coordenador</Link>
          <Link href="/#cadastro" className="btn-primary">Inscrever Time</Link>
        </div>
      </div>
    </header>
  );
}
