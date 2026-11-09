'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTripleTap } from '@/lib/ui/useTripleTap';
import { OwnerLoginModal } from './OwnerLoginModal';

type Props = { className?: string; imgClassName?: string; children?: ReactNode };

const ROTULO = 'Arena Vale — início';

/**
 * Logo do header. 1 ou 2 toques: vai para o início (ou rola ao topo na home).
 * 3 toques rápidos: abre o acesso restrito.
 * `children` substitui o logo padrão, para manter o conteúdo original do header.
 */
export function LogoSecreto({ className, imgClassName, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const irParaInicio = useCallback(() => {
    if (pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' });
    else router.push('/');
  }, [pathname, router]);

  const onClick = useTripleTap({ onTriple: () => setAberto(true), onSingle: irParaInicio });
  const fechar = useCallback(() => setAberto(false), []);

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label={ROTULO}
        title={ROTULO}
        style={{ touchAction: 'manipulation' }}
        className={className}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {children ?? <img src="/logo.png" alt="Arena Vale" className={imgClassName} />}
      </button>
      <OwnerLoginModal open={aberto} onClose={fechar} />
    </>
  );
}
