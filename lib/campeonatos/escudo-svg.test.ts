import { describe, expect, it } from 'vitest';
import { desenharEscudo, escudoPadrao, type OpcoesEscudo } from './escudo-svg';

const base: OpcoesEscudo = { formato: 'classico', cor1: '#112233', cor2: '#ffffff', texto: 'abc', detalhe: 'nenhum' };

describe('desenharEscudo', () => {
  it('estrutura do svg', () => {
    const s = desenharEscudo(base);
    expect(s.startsWith('<svg')).toBe(true);
    expect(s).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(s).toContain('viewBox="0 0 512 512"');
    expect(s).toContain('width="512"');
    expect(s).toContain('height="512"');
  });
  it('escapa e limita o texto', () => {
    expect(desenharEscudo({ ...base, texto: 'a&b<' })).toContain('A&amp;B&lt;');
    const s = desenharEscudo({ ...base, texto: '  abcdef ' });
    expect(s).toContain('>ABCD<');
    expect(s).not.toContain('ABCDE');
  });
  it('texto vazio não gera <text', () => {
    expect(desenharEscudo({ ...base, texto: '   ' })).not.toContain('<text');
  });
  it('formatos', () => {
    expect(desenharEscudo({ ...base, formato: 'redondo' })).toContain('<circle');
    expect(desenharEscudo({ ...base, formato: 'losango' })).toContain('<polygon');
    expect(desenharEscudo({ ...base, formato: 'classico' })).toContain('<path');
    expect(desenharEscudo({ ...base, formato: 'moderno' })).toContain('<path');
    expect(desenharEscudo({ ...base, formato: 'classico' })).not.toContain('<circle');
  });
  it('detalhes em cor2 com recorte', () => {
    const cor2 = '#ff0000';
    for (const d of ['faixa', 'listras', 'estrela', 'taca'] as const) {
      const s = desenharEscudo({ ...base, cor2, detalhe: d });
      expect(s).toContain(`fill="${cor2}"`);
      expect(s).toContain('clip-path');
    }
    expect(desenharEscudo({ ...base, cor2, detalhe: 'nenhum' })).not.toContain(cor2);
    expect(desenharEscudo({ ...base, cor2, detalhe: 'listras' }).match(/<rect/g)?.length).toBe(3);
  });
  it('cor do texto pelo contraste', () => {
    expect(desenharEscudo({ ...base, cor1: '#000000' })).toMatch(/<text[^>]*fill="#ffffff"/);
    expect(desenharEscudo({ ...base, cor1: '#ffffff' })).toMatch(/<text[^>]*fill="#0b0b0d"/);
    expect(desenharEscudo({ ...base, cor1: '#f2c94c' })).toMatch(/<text[^>]*fill="#0b0b0d"/);
  });
  it('cor inválida cai no padrão', () => {
    const s = desenharEscudo({ ...base, cor1: 'red', cor2: '"><script>', detalhe: 'faixa' });
    expect(s).toContain('#e50914');
    expect(s).toContain('#ffffff');
    expect(s).not.toContain('script');
  });
  it('fonte da marca', () => {
    expect(desenharEscudo(base)).toContain('Saira');
    expect(desenharEscudo(base)).toContain('sans-serif');
  });
});

describe('escudoPadrao', () => {
  it('usa a cor ou o vermelho da marca', () => {
    expect(escudoPadrao('ABC', '#112233')).toBe(desenharEscudo({ ...base, texto: 'ABC' }));
    expect(escudoPadrao('ABC', null)).toContain('#e50914');
  });

  it('borda opcional: contorno na cor pedida; sem ela, sem contorno', () => {
    expect(desenharEscudo({ ...base, borda: '#e50914' })).toContain('stroke="#e50914"');
    expect(desenharEscudo(base)).not.toContain('stroke=');
  });
});
