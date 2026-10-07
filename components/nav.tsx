import Link from 'next/link';
import { Shield } from './shield';

export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[rgba(12,31,74,0.78)] backdrop-blur-md border-b border-transparent">
      <div className="container flex items-center justify-between h-[78px]">
        {/* Lado Esquerdo: Identidade Visual */}
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

        {/* Lado Direito: Apenas Campeonatos e Atletas Destaque */}
        <div className="flex gap-4 items-center">
          <Link 
            href="/#campeonatos" 
            className="text-sm text-[var(--text-dim)] hover:text-[var(--primary)] transition"
          >
            Campeonatos
          </Link>

          <Link 
            href="/coordenador/atletasdestaques" 
            className="btn-primary flex items-center gap-2 text-xs font-bold"
          >
            ⭐ Atletas Destaque
          </Link>
        </div>
      </div>
    </header>
  );
}
