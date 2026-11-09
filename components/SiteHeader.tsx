'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LogoSecreto } from '@/components/auth/LogoSecreto';
import { EntrarEquipe } from '@/components/auth/EntrarEquipe';
import { MENU_PRINCIPAL, ehRotaDaEquipe } from '@/lib/midia/menu';

function itemAtivo(href: string, pathname: string, aba: string | null): boolean {
  const [caminho, query] = href.split('?');
  if (caminho === '/') return pathname === '/';
  if (caminho === '/noticias') return pathname.startsWith('/noticias') && (query ? aba === 'mundo' : aba !== 'mundo');
  return pathname === caminho || pathname.startsWith(`${caminho}/`);
}

function MenuPrincipal({ pathname }: { pathname: string }) {
  const params = useSearchParams();
  const aba = params?.get('aba') ?? null;
  return <ItensMenu pathname={pathname} aba={aba} />;
}

function ItensMenu({ pathname, aba }: { pathname: string; aba: string | null }) {
  return (
    <>
      {MENU_PRINCIPAL.map((item) => {
        const ativo = itemAtivo(item.href, pathname, aba);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[item.vivo ? 'vivo' : '', ativo ? 'on' : ''].join(' ').trim() || undefined}
            aria-current={ativo ? 'page' : undefined}
          >
            {item.rotulo}
          </Link>
        );
      })}
    </>
  );
}

/**
 * Cabeçalho único do site, preso no topo (spec Fase 3, seção 4): logo à esquerda,
 * menu no meio, Anuncie + Entrar à direita, tudo numa linha. No celular o menu
 * rola para o lado. Nenhum ancestral pode ter `overflow: hidden/auto`, senão o
 * sticky para de funcionar — use `overflow-x-clip`.
 */
export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  if (ehRotaDaEquipe(pathname)) return null;

  return (
    <header className="topo sticky top-0">
      <div className="dentro">
        <LogoSecreto className="logo-topo" imgClassName="logo-topo-img" />
        <nav className="menu" aria-label="Menu principal">
          <Suspense fallback={<ItensMenu pathname={pathname} aba={null} />}>
            <MenuPrincipal pathname={pathname} />
          </Suspense>
        </nav>
        <Link href="/patrocinio" className="anuncie">
          Anuncie
        </Link>
        <EntrarEquipe />
      </div>
    </header>
  );
}
