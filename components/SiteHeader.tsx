'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoSecreto } from '@/components/auth/LogoSecreto';
import { EntrarEquipe } from '@/components/auth/EntrarEquipe';

/** Rotas da equipe têm o próprio menu (coord-shell etc.) — o cabeçalho público não aparece nelas. */
const ROTAS_DA_EQUIPE = ['/painel', '/coordenador', '/proprietario', '/moderador', '/capitao'];

const WHATSAPP = 'https://wa.me/5547988444404';

const MENU: { rotulo: string; href: string; aoVivo?: boolean }[] = [
  { rotulo: 'Início', href: '/#inicio' },
  { rotulo: 'TV Arena Vale', href: '/tv', aoVivo: true },
  { rotulo: 'Notícias', href: '/#noticias' },
  { rotulo: 'Agenda', href: '/agenda' },
  { rotulo: 'Campeonatos', href: '/#campeonatos' },
  { rotulo: 'Atletas Destaque', href: '/atletasdestaques' },
  { rotulo: 'Projeto Social', href: '/projetosocial' },
];

function PontoAoVivo() {
  return <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[#e50914] shadow-[0_0_8px_#e50914]" />;
}

/**
 * Cabeçalho único do site: o mesmo em todas as páginas públicas e preso no
 * topo (sticky) enquanto a página rola. Nenhum ancestral pode ter
 * `overflow: hidden/auto`, senão o sticky para de funcionar — use `overflow-x-clip`.
 */
export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  if (ROTAS_DA_EQUIPE.some((r) => pathname === r || pathname.startsWith(`${r}/`))) return null;

  const fecharMobile = () => setMenuMobileAberto(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex w-full max-w-[1750px] min-w-0 items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-10 2xl:px-12">
          <div className="flex shrink-0 items-center">
            <LogoSecreto
              className="group relative flex max-w-[170px] items-center rounded-2xl p-1 transition duration-300 hover:scale-[1.02] sm:max-w-[190px]"
              imgClassName="relative h-11 w-auto max-w-full rounded-xl object-contain mix-blend-lighten contrast-110 drop-shadow-[0_0_20px_rgba(229,9,20,0.3)] sm:h-14 xl:h-16"
            />
          </div>

          <nav
            aria-label="Menu principal"
            className="hidden min-w-0 flex-1 items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.08em] text-[#b8c0d4] xl:flex 2xl:gap-5 2xl:text-xs"
          >
            {MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 whitespace-nowrap transition hover:text-white ${item.aoVivo || item.href === '/#inicio' ? 'text-white hover:text-[#e50914]' : ''}`}
              >
                {item.aoVivo && <PontoAoVivo />}
                {item.rotulo}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="whitespace-nowrap rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-[#e50914]/30 transition hover:scale-105 hover:shadow-[#e50914]/50">
              Anuncie
            </a>
            <EntrarEquipe />
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <EntrarEquipe />
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="whitespace-nowrap rounded-full bg-[#e50914] px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30">
              Anuncie
            </a>
            <button type="button" onClick={() => setMenuMobileAberto(true)} aria-label="Abrir Menu" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-transform active:scale-95">
              <span className="pointer-events-none flex w-5 flex-col gap-1.5">
                <span className="h-0.5 w-full rounded-full bg-white" />
                <span className="h-0.5 w-full rounded-full bg-[#e50914]" />
                <span className="h-0.5 w-full rounded-full bg-white" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {menuMobileAberto && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-between overflow-y-auto bg-[#050505]/98 p-6 backdrop-blur-2xl xl:hidden">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Arena Vale" className="h-14 w-auto rounded-lg object-contain mix-blend-lighten" />
              <button type="button" onClick={fecharMobile} aria-label="Fechar Menu" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-2xl font-bold text-white transition-transform active:scale-95">✕</button>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-[#e50914]">Navegação Oficial</p>
            <nav aria-label="Menu do celular" className="flex flex-col gap-3 text-lg font-black uppercase tracking-wide">
              {MENU.map((item) => (
                <Link key={item.href} href={item.href} onClick={fecharMobile} className={`flex items-center gap-2 border-b border-white/5 py-2.5 ${item.aoVivo || item.href === '/#inicio' ? 'text-white' : 'text-[#cad0e0]'}`}>
                  {item.aoVivo && <PontoAoVivo />}
                  {item.rotulo}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
            <Link href="/login" onClick={fecharMobile} className="mt-2 block w-full rounded-full border border-white/30 bg-[#050505] py-4 text-center text-xs font-black uppercase tracking-wider text-white shadow-xl">Área da equipe 🔒</Link>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="mt-2 block w-full rounded-full bg-[#e50914] py-4 text-center text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30">Falar no WhatsApp Oficial ↗</a>
          </div>
        </div>
      )}
    </>
  );
}
