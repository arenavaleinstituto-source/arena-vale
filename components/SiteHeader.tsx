'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useId, useState } from 'react';
import { LogoSecreto } from '@/components/auth/LogoSecreto';
import { EntrarEquipe } from '@/components/auth/EntrarEquipe';
import { MENU_PRINCIPAL, ehRotaDaEquipe } from '@/lib/midia/menu';

function itemAtivo(href: string, pathname: string, aba: string | null): boolean {
  const [caminho, query] = href.split('?');
  if (caminho === '/') return pathname === '/';
  if (caminho === '/noticias') return pathname.startsWith('/noticias') && (query ? aba === 'mundo' : aba !== 'mundo');
  return pathname === caminho || pathname.startsWith(`${caminho}/`);
}

type PropsMenu = { pathname: string; aoEscolher?: () => void };

function MenuPrincipal({ pathname, aoEscolher }: PropsMenu) {
  const params = useSearchParams();
  const aba = params?.get('aba') ?? null;
  return <ItensMenu pathname={pathname} aba={aba} aoEscolher={aoEscolher} />;
}

function ItensMenu({ pathname, aba, aoEscolher }: PropsMenu & { aba: string | null }) {
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
            onClick={aoEscolher}
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
 * menu no meio, Anuncie + Entrar à direita, tudo numa linha. No celular (até 760px)
 * o menu vira o botão ☰, que abre a lista de páginas logo abaixo do cabeçalho. Nenhum ancestral pode ter `overflow: hidden/auto`, senão o
 * sticky para de funcionar — use `overflow-x-clip`.
 */
function IconeMenu({ aberto }: { aberto: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {aberto ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const idMenuCel = useId();
  const [aberto, setAberto] = useState(false);
  const fechar = () => setAberto(false);

  // Menu do celular aberto: Esc fecha e a página de trás não rola.
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
    };
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = antes;
      document.removeEventListener('keydown', onKey);
    };
  }, [aberto]);

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
        <button
          type="button"
          className="hamb"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls={idMenuCel}
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
        >
          <IconeMenu aberto={aberto} />
        </button>
      </div>
      {aberto && (
        <>
          <div className="fundo-menu-cel" onClick={fechar} aria-hidden="true" />
          <nav className="menu-cel" id={idMenuCel} aria-label="Menu do celular">
            <Suspense fallback={<ItensMenu pathname={pathname} aba={null} aoEscolher={fechar} />}>
              <MenuPrincipal pathname={pathname} aoEscolher={fechar} />
            </Suspense>
            <Link href="/patrocinio" className="anuncie-cel" onClick={fechar}>
              Anuncie
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}
