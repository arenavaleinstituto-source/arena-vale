'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ehRotaDaEquipe } from '@/lib/midia/menu';

/** Blocos que entram com fade + slide-up ao aparecer na tela. */
const SELETOR_REVELAR = [
  'main .faixa .cab',
  'main .faixa .dentro > :not(.cab)',
  'main .topo-pagina .dentro > *',
].join(', ');

function movimentoReduzido(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Efeitos leves do site, num só lugar (nenhum é obrigatório para ler a página):
 * - blocos das seções aparecem com fade/slide-up quando entram na tela;
 * - no banner da home, as camadas do "palco" se movem com a rolagem (parallax) e com o mouse (3D).
 * Sem IntersectionObserver ou com "reduzir movimento", nada é escondido nem se move.
 */
export function EfeitosDaPagina() {
  const pathname = usePathname();

  // Revelar ao rolar. A classe `anima` só entra pelo JavaScript: sem ele, tudo aparece normalmente.
  useEffect(() => {
    if (ehRotaDaEquipe(pathname ?? '/') || typeof IntersectionObserver === 'undefined' || movimentoReduzido()) return;
    const raiz = document.documentElement;
    raiz.classList.add('anima');

    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add('visivel');
            obs.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.01 },
    );

    // Cada execução observa de novo tudo o que ainda não apareceu (no StrictMode o efeito roda
    // duas vezes; pular os já marcados deixava blocos invisíveis para sempre).
    const vistos = new WeakSet<Element>();
    const marcar = () => {
      document.querySelectorAll<HTMLElement>(SELETOR_REVELAR).forEach((el) => {
        if (vistos.has(el) || el.classList.contains('visivel')) return;
        vistos.add(el);
        el.classList.add('revela');
        // Já está acima da tela (ex.: chegou por um link #âncora): aparece sem esperar.
        if (el.getBoundingClientRect().bottom < 0) el.classList.add('visivel');
        else obs.observe(el);
      });
    };
    marcar();
    // Blocos que chegam depois (streaming, carregamento no cliente) também entram.
    const mut = new MutationObserver(marcar);
    const main = document.querySelector('main');
    if (main) mut.observe(main, { childList: true, subtree: true });

    return () => {
      obs.disconnect();
      mut.disconnect();
    };
  }, [pathname]);

  // Palco do banner: parallax com a rolagem e inclinação 3D com o mouse.
  useEffect(() => {
    const palco = document.querySelector<HTMLElement>('[data-palco]');
    if (!palco || movimentoReduzido()) return;
    const hero = palco.closest<HTMLElement>('.hero') ?? palco;
    let quadro = 0;

    const aoRolar = () => {
      if (quadro) return;
      quadro = requestAnimationFrame(() => {
        quadro = 0;
        const y = Math.min(window.scrollY, hero.offsetHeight);
        hero.style.setProperty('--rolar', String(y));
      });
    };

    const mouseFino = typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const aoMover = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      palco.style.setProperty('--mx', mx.toFixed(3));
      palco.style.setProperty('--my', my.toFixed(3));
    };
    const aoSair = () => {
      palco.style.setProperty('--mx', '0');
      palco.style.setProperty('--my', '0');
    };

    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    if (mouseFino) {
      hero.addEventListener('pointermove', aoMover);
      hero.addEventListener('pointerleave', aoSair);
    }
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener('scroll', aoRolar);
      hero.removeEventListener('pointermove', aoMover);
      hero.removeEventListener('pointerleave', aoSair);
    };
  }, [pathname]);

  return null;
}
