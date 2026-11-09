'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ehRotaDaEquipe } from '@/lib/midia/menu';

const ICONES = {
  whatsapp:
    'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z',
  instagram:
    'M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21 8.2a5.5 5.5 0 0 0-1.5-3.8A5.5 5.5 0 0 0 15.7 3C14.2 3 9.8 3 8.3 3a5.5 5.5 0 0 0-3.8 1.5A5.5 5.5 0 0 0 3 8.2c-.1 1.5-.1 6 0 7.6a5.5 5.5 0 0 0 1.5 3.8A5.5 5.5 0 0 0 8.3 21c1.5.1 6 .1 7.4 0a5.5 5.5 0 0 0 3.8-1.5 5.5 5.5 0 0 0 1.5-3.8c.1-1.5.1-6 0-7.5Zm-2 9.2a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-5.3.4s-4.1.1-5.3-.4A3 3 0 0 1 5 17.4c-.5-1.2-.4-4-.4-5.4s-.1-4.1.4-5.3A3 3 0 0 1 6.7 5c1.2-.5 4-.4 5.3-.4s4.1-.1 5.3.4A3 3 0 0 1 19 6.7c.5 1.2.4 4 .4 5.3s.1 4.2-.4 5.4Z',
  youtube:
    'M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15V9l5.8 3-5.8 3Z',
};

function Icone({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

type Props = { whatsapp: string; instagramUrl: string };

/** Rodapé do site (spec Fase 3, seção 5, bloco 12): tudo centralizado, sem linha de menu. */
export function SiteFooter({ whatsapp, instagramUrl }: Props) {
  const pathname = usePathname() ?? '/';
  if (ehRotaDaEquipe(pathname)) return null;

  return (
    <footer className="rodape">
      <div className="dentro rod">
        <div className="rod-marca">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ARENA VALE" />
          <span>O palco do esporte é aqui.</span>
        </div>
        <div className="redes">
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp da ARENA VALE">
            <Icone d={ICONES.whatsapp} />
            <span>WhatsApp</span>
          </a>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram @arenavaleoficial">
            <Icone d={ICONES.instagram} />
            <span>Instagram</span>
          </a>
          <a href="https://www.youtube.com/@TVArenaVale" target="_blank" rel="noopener noreferrer" aria-label="YouTube TV Arena Vale">
            <Icone d={ICONES.youtube} />
            <span>YouTube</span>
          </a>
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
    </footer>
  );
}
