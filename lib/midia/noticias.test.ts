import { describe, expect, it } from 'vitest';
import { ehNova, faltasParaPublicar, mapearNoticiaMidia, modoReproducao, montarFileiras, type NoticiaMidia } from './noticias';
import { faltasVideoExterno } from './videos-externos';

function n(p: Partial<NoticiaMidia> = {}): NoticiaMidia {
  return mapearNoticiaMidia({ id: Math.random().toString(36).slice(2), titulo: 'Título', imagem_url: '/c.jpg', status: 'publicado', ...p });
}

describe('mapearNoticiaMidia', () => {
  it('linha antiga (sem colunas novas): ativa vira publicada na aba arena, com publicado_em = created_at', () => {
    const r = mapearNoticiaMidia({ id: '1', titulo: 'Velha', descricao: 'x', categoria: 'Comunicado Oficial', ativo: true, imagem_url: null, created_at: '2026-10-01T00:00:00Z' });
    expect(r).toMatchObject({ aba: 'arena', status: 'publicado', publicado_em: '2026-10-01T00:00:00Z', categoria: 'geral', tipo_midia: 'foto', destaque: false, origem: 'manual' });
  });

  it('categoria antiga "Projeto Social" vira projeto_social; "Campeonatos" vira campeonatos', () => {
    expect(mapearNoticiaMidia({ id: '1', titulo: 'a', categoria: 'Projeto Social' }).categoria).toBe('projeto_social');
    expect(mapearNoticiaMidia({ id: '1', titulo: 'a', categoria: 'CAMPEONATOS' }).categoria).toBe('campeonatos');
  });
});

describe('modoReproducao (ordem do spec 4.5)', () => {
  it('arquivo vence YouTube', () => {
    expect(modoReproducao(n({ tipo_midia: 'video', video_url: 'https://x/v.mp4', video_link: 'https://youtu.be/dQw4w9WgXcQ' }))).toEqual({ tipo: 'arquivo', src: 'https://x/v.mp4' });
  });
  it('YouTube vence outro link', () => {
    expect(modoReproducao(n({ tipo_midia: 'video', video_link: 'https://youtu.be/dQw4w9WgXcQ' }))).toEqual({ tipo: 'youtube', embed: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' });
  });
  it('link do Instagram abre fora', () => {
    expect(modoReproducao(n({ tipo_midia: 'video', video_link: 'https://www.instagram.com/reel/a/' }))).toEqual({ tipo: 'link', href: 'https://www.instagram.com/reel/a/', servico: 'Instagram' });
  });
  it('nada disso: foto', () => {
    expect(modoReproducao(n({ tipo_midia: 'video' }))).toEqual({ tipo: 'foto' });
    expect(modoReproducao(n())).toEqual({ tipo: 'foto' });
  });
});

describe('ehNova', () => {
  const agora = new Date('2026-11-10T12:00:00Z');
  it('menos de 48 h', () => {
    expect(ehNova('2026-11-08T13:00:00Z', agora)).toBe(true); // 47 h
    expect(ehNova('2026-11-08T11:00:00Z', agora)).toBe(false); // 49 h
    expect(ehNova(null, agora)).toBe(false);
  });
});

describe('faltasParaPublicar', () => {
  it('vídeo sem link no modo só link', () => {
    expect(faltasParaPublicar(n({ tipo_midia: 'video' }), 'so_link')).toEqual(['Cole o link do vídeo para publicar']);
  });
  it('vídeo sem arquivo nem link no modo guardar arquivo', () => {
    expect(faltasParaPublicar(n({ tipo_midia: 'video' }), 'guardar_arquivo')).toEqual(['Falta o vídeo: envie o arquivo ou cole o link.']);
  });
  it('sem título e sem cartaz', () => {
    expect(faltasParaPublicar(n({ titulo: '  ', imagem_url: null }), 'guardar_arquivo')).toEqual(['Falta o título.', 'Falta o cartaz.']);
  });
  it('foto completa não falta nada', () => {
    expect(faltasParaPublicar(n(), 'so_link')).toEqual([]);
  });
});

describe('montarFileiras', () => {
  it('ordem, omite vazias e corta em 20', () => {
    const lista = [
      ...Array.from({ length: 25 }, (_, i) => n({ titulo: `G${i}`, publicado_em: `2026-10-${String((i % 28) + 1).padStart(2, '0')}T00:00:00Z` })),
      n({ titulo: 'Destaque', destaque: true }),
      n({ titulo: 'Bastidor', categoria: 'bastidores' }),
      n({ titulo: 'Social', categoria: 'projeto_social' }),
    ];
    const f = montarFileiras(lista, 'arena');
    expect(f.map((x) => x.titulo)).toEqual(['Destaques', 'Mais recentes', 'Bastidores', 'Projeto Social']);
    expect(f[1].itens).toHaveLength(20);
  });

  it('aba mundo nunca tem Projeto Social', () => {
    const f = montarFileiras([n({ categoria: 'projeto_social', aba: 'mundo' })], 'mundo');
    expect(f.map((x) => x.titulo)).toEqual(['Mais recentes']);
  });
});

describe('faltasVideoExterno', () => {
  it('mensagens', () => {
    expect(faltasVideoExterno({ link: 'https://www.instagram.com/arenavaleoficial', titulo: '', capa_url: '' })).toEqual([
      'Cole um link https:// do Instagram (post, reel ou tv).',
      'Falta o título.',
      'Falta a capa.',
    ]);
    expect(faltasVideoExterno({ link: 'https://www.instagram.com/reel/a/', titulo: 'Gol', capa_url: 'https://x/c.jpg' })).toEqual([]);
  });
});
