import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.join(import.meta.dirname, '..');

function arquivos(dir: string, ext: RegExp): string[] {
  const saida: string[] = [];
  for (const e of fs.readdirSync(path.join(RAIZ, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) saida.push(...arquivos(rel, ext));
    else if (ext.test(e.name) && !/\.test\.tsx?$/.test(e.name)) saida.push(rel);
  }
  return saida;
}

const FONTES = [...arquivos('app', /\.tsx?$/), ...arquivos('components', /\.tsx?$/), ...arquivos('lib', /\.tsx?$/)];

function culpados(regra: RegExp): string[] {
  return FONTES.filter((f) => regra.test(fs.readFileSync(path.join(RAIZ, f), 'utf8')));
}

describe('marca e visual em todo o código', () => {
  it('nunca escreve "Arena Vale Sports" (só no conserto do dado antigo da agenda)', () => {
    expect(culpados(/arena vale sports?\b/i).filter((f) => !f.endsWith(path.join('midia', 'agenda.ts')))).toEqual([]);
  });

  it('não usa mais as cores antigas (dourado e azul)', () => {
    expect(culpados(/#f5d76e|#0c1f4a|#08163a|#c9a338|rgba\(8,\s*22,\s*58/i)).toEqual([]);
  });

  it('não usa português de Portugal nas telas', () => {
    expect(culpados(/\b(equipa|registo|registar|camisola|desportiv[oa]s?|desporto|telemóvel|ficheiro)\b/i)).toEqual([]);
  });

  it('nenhum link fixo para o endereço oficial antigo dentro das telas', () => {
    expect(culpados(/href=["'`]https:\/\/arena-vale\.vercel\.app/)).toEqual([]);
  });
});
