import Link from 'next/link';
import { Shield } from './shield';
import { PortalMenu } from './portal-menu';

export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[rgba(4,11,29,.72)] backdrop-blur-xl border-b border-white/[.07]">
      <div className="container flex items-center justify-between h-[78px]">
        <Link href="/" className="flex items-center gap-3 group">
          <Shield size={46} />
          <div className="flex flex-col leading-none">
            <strong className="font-['Cinzel'] text-base font-extrabold tracking-wider">ARENA <span className="text-[var(--primary)]">VALE</span></strong>
            <small className="font-['Cinzel'] text-[9px] font-bold tracking-[3px] text-[var(--primary)] mt-1">SPORTS</small>
          </div>
        </Link>
        <nav className="hidden lg:flex gap-8 text-[12px] font-semibold text-[var(--text-dim)]">
          <Link href="/#campeonatos" className="hover:text-[var(--primary)] transition">Campeonatos</Link>
          <Link href="/#aovivo" className="hover:text-[var(--primary)] transition">Ao Vivo</Link>
          <Link href="/#destaques" className="hover:text-[var(--primary)] transition">Atletas</Link>
          <Link href="/#patrocinadores" className="hover:text-[var(--primary)] transition">Parceiros</Link>
        </nav>
        <div className="flex gap-2 items-center">
          <PortalMenu />
          <Link href="/#cadastro" className="btn-primary hidden sm:inline-flex">Inscrever Time</Link>
        </div>
      </div>
    </header>
  );
}
