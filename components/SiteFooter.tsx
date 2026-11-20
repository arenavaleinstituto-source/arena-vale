'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ehRotaDaEquipe } from '@/lib/midia/menu';

/** Rodapé do site: marca e dados legais em vidro, sem linha de menu; o nome gigante ao fundo é só decoração. */
export function SiteFooter() {
  const pathname = usePathname() ?? '/';
  if (ehRotaDaEquipe(pathname)) return null;

  return (
    <footer className="rodape rodape-premium">
      <div className="rod-luz" aria-hidden="true" />
      <div className="dentro rod-grade">
        <div className="rod-marca">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-3d.png" alt="ARENA VALE" />
          <span>O palco do esporte é aqui.</span>
        </div>
        <div className="rod-legal">
          <span>CNPJ: 40.694.741/0001-34</span>
          <span>© 2026 ARENA VALE · Mídia Esportiva. Todos os direitos reservados.</span>
          <span>
            <Link href="/sobre">Sobre a ARENA VALE</Link> · <Link href="/privacidade">Política de Privacidade</Link> ·{' '}
            <Link href="/termos">Termos de Uso</Link>
          </span>
        </div>
      </div>
      <div className="rod-gigante" aria-hidden="true">
        ARENA <em>VALE</em>
      </div>
    </footer>
  );
}
