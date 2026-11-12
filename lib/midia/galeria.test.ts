import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { rotuloJogo, jogosRecentes, type ItemAgenda } from './agenda';
import { albunsDosJogos, buscarAlbum, buscarAlbuns } from './galeria-busca';
import { deAlbum, deFoto } from './galeria';

/** Cliente falso: toda consulta devolve erro (tabela ainda não existe). */
function clienteComErro(): SupabaseClient {
  const resposta = { data: null, error: { message: 'relation does not exist', code: '42P01' } };
  const cadeia: unknown = new Proxy(function () {}, {
    get: (_a, p) => (p === 'then' ? (ok: (v: unknown) => unknown) => Promise.resolve(resposta).then(ok) : cadeia),
    apply: () => cadeia,
  });
  return { from: () => cadeia } as unknown as SupabaseClient;
}

describe('rotuloJogo', () => {
  it('Casa x Fora · dd/mm no horário de Brasília', () => {
    const j: ItemAgenda = {
      id: '1', origem: 'agenda', modalidade: null, fase: null, casa: 'Real', fora: 'Sede',
      dataHora: '2026-11-21T01:30:00.000Z', local: null, transmissao: false,
    };
    expect(rotuloJogo(j)).toBe('Real x Sede · 20/11');
  });
});

describe('conversões da galeria', () => {
  it('álbum e foto do banco viram os tipos do site', () => {
    expect(
      deAlbum({
        id: 'a', titulo: 'Final', data: '2026-11-15', origem: 'agenda', jogo_ref: 'j', capa_url: 'c', ativo: true,
        galeria_fotos: [{ count: 12 }],
      }),
    ).toEqual({ id: 'a', titulo: 'Final', data: '2026-11-15', origem: 'agenda', jogoRef: 'j', capaUrl: 'c', ativo: true, totalFotos: 12 });
    expect(deFoto({ id: 'f', album_id: 'a', url: 'u', miniatura_url: 'm', largura: 2000, altura: 1500 })).toEqual({
      id: 'f', albumId: 'a', url: 'u', miniaturaUrl: 'm', largura: 2000, altura: 1500,
    });
  });
});

describe('buscas sem as tabelas', () => {
  it('devolvem vazio, sem erro', async () => {
    const sb = clienteComErro();
    expect(await buscarAlbuns(24, 1, sb)).toEqual([]);
    expect(await buscarAlbum('3f2b8c1e-1a2b-4c3d-8e9f-0123456789ab', sb)).toBeNull();
    expect(await albunsDosJogos(sb)).toEqual({});
    expect(await jogosRecentes(3, new Date(), sb)).toEqual([]);
  });
});
