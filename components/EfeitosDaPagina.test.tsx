import { StrictMode } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/sobre' }));

import { EfeitosDaPagina } from './EfeitosDaPagina';

/** IntersectionObserver de mentira: guarda o que está sendo observado e deixa o teste "mostrar" na tela. */
class FakeIO {
  static todos: FakeIO[] = [];
  alvos = new Set<Element>();
  constructor(private cb: IntersectionObserverCallback) {
    FakeIO.todos.push(this);
  }
  observe(el: Element) {
    this.alvos.add(el);
  }
  unobserve(el: Element) {
    this.alvos.delete(el);
  }
  disconnect() {
    this.alvos.clear();
  }
  static aparecerTudo() {
    for (const io of FakeIO.todos) {
      const entradas = [...io.alvos].map((target) => ({ target, isIntersecting: true }) as IntersectionObserverEntry);
      if (entradas.length) io.cb(entradas, io as unknown as IntersectionObserver);
    }
  }
}

function pagina() {
  document.body.innerHTML = `
    <main>
      <section class="faixa"><div class="dentro"><div class="cab"><h2>Título</h2></div><div class="grade">conteúdo</div></div></section>
    </main>`;
}

describe('EfeitosDaPagina', () => {
  beforeEach(() => {
    FakeIO.todos = [];
    vi.stubGlobal('IntersectionObserver', FakeIO);
    document.documentElement.className = '';
    pagina();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('esconde os blocos só quando há JavaScript e mostra quando entram na tela', () => {
    render(<EfeitosDaPagina />, { container: document.body.appendChild(document.createElement('div')) });
    expect(document.documentElement.classList.contains('anima')).toBe(true);
    const blocos = document.querySelectorAll('.revela');
    expect(blocos).toHaveLength(2);
    act(() => FakeIO.aparecerTudo());
    expect(document.querySelectorAll('.revela:not(.visivel)')).toHaveLength(0);
  });

  it('no StrictMode (efeito roda duas vezes) nenhum bloco fica invisível para sempre', () => {
    render(
      <StrictMode>
        <EfeitosDaPagina />
      </StrictMode>,
      { container: document.body.appendChild(document.createElement('div')) },
    );
    act(() => FakeIO.aparecerTudo());
    expect(document.querySelectorAll('.revela:not(.visivel)')).toHaveLength(0);
  });

  it('com "reduzir movimento" nada é escondido', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} }));
    render(<EfeitosDaPagina />, { container: document.body.appendChild(document.createElement('div')) });
    expect(document.documentElement.classList.contains('anima')).toBe(false);
    expect(document.querySelectorAll('.revela')).toHaveLength(0);
  });
});
