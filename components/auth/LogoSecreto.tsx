'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTripleTap } from '@/lib/ui/useTripleTap';
import { createClient } from '@/lib/supabase/client';
import { OwnerLoginModal } from './OwnerLoginModal';

type Props = { className?: string; imgClassName?: string; children?: ReactNode };

const ROTULO = 'Arena Vale — início';

/**
 * Logo do header. 1 ou 2 toques: vai para o início (ou rola ao topo na home).
 * 3 toques rápidos: abre o acesso restrito (o dono já logado vai direto à área dele).
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

  // Dono já logado vai direto para a área dele; qualquer outro caso abre o login.
  const abrirOuIr = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: ehDono } = await supabase.rpc('is_proprietario');
        if (ehDono === true) {
          router.push('/proprietario');
          return;
        }
      }
    } catch {
      /* sem conexão: segue para o login */
    }
    setAberto(true);
  }, [router]);

  const onClick = useTripleTap({ onTriple: () => { void abrirOuIr(); }, onSingle: irParaInicio });
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
