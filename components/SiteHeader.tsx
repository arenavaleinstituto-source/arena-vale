'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { LogoSecreto } from '@/components/auth/LogoSecreto';
import { EntrarEquipe } from '@/components/auth/EntrarEquipe';
import { MENU_PRINCIPAL, ehRotaDaEquipe } from '@/lib/midia/menu';

function itemAtivo(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** `noTopo`: barra do topo (sem os itens do ☰). Sem ele: menu ☰, com todos os itens. */
type PropsMenu = { pathname: string; aoEscolher?: () => void; noTopo?: boolean };

function ItensMenu({ pathname, aoEscolher, noTopo }: PropsMenu) {
  const itens = noTopo ? MENU_PRINCIPAL.filter((i) => !i.soNoHamburguer) : MENU_PRINCIPAL;
  return (
    <>
      {itens.map((item) => {
        const ativo = itemAtivo(item.href, pathname);
        // No ☰ do computador só aparecem os itens que não estão na barra do topo.
        const tambemNoTopo = !noTopo && !item.soNoHamburguer;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[ativo ? 'on' : '', tambemNoTopo ? 'tambem-no-topo' : ''].join(' ').trim() || undefined}
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
 * Cabeçalho único do site, preso no topo: logo e "Ao Vivo" à esquerda,
 * menu no meio, Anuncie + Entrar + ☰ à direita, tudo numa linha. No computador o ☰ abre
 * só os itens que não estão na barra (ex.: Galeria). No celular (até 760px) a barra some
 * e o ☰ abre a lista com todas as páginas logo abaixo do cabeçalho. Nenhum ancestral pode ter `overflow: hidden/auto`, senão o
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
        <Link href="/ao-vivo" className={`ao-vivo-topo${itemAtivo('/ao-vivo', pathname) ? ' on' : ''}`} aria-current={itemAtivo('/ao-vivo', pathname) ? 'page' : undefined}>
          Ao Vivo
        </Link>
        <nav className="menu" aria-label="Menu principal">
          <ItensMenu pathname={pathname} noTopo />
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
            <ItensMenu pathname={pathname} aoEscolher={fechar} />
            <Link href="/patrocinio" className="anuncie-cel" onClick={fechar}>
              Anuncie
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}
