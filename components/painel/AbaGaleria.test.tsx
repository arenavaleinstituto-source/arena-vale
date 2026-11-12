import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ALBUM = { id: 'alb-1', titulo: 'Real x Sede', data: '2026-11-15', origem: 'agenda', jogo_ref: 'j1', capa_url: null, ativo: true, galeria_fotos: [{ count: 2 }] };
const FOTOS = [
  { id: 'f1', album_id: 'alb-1', url: 'https://banco.test/storage/v1/object/public/galeria/alb-1/aaa.jpg', miniatura_url: 'https://banco.test/storage/v1/object/public/galeria/alb-1/aaa-m.jpg', largura: 2000, altura: 1500 },
  { id: 'f2', album_id: 'alb-1', url: 'https://banco.test/storage/v1/object/public/galeria/alb-1/bbb.jpg', miniatura_url: 'https://banco.test/storage/v1/object/public/galeria/alb-1/bbb-m.jpg', largura: 2000, altura: 1500 },
];

type Chamada = { tabela: string; acao: string; valor?: unknown; filtros: [string, unknown][] };
const chamadas: Chamada[] = [];
const removidos: string[][] = [];

function consulta(tabela: string) {
  const c: Chamada = { tabela, acao: 'select', filtros: [] };
  chamadas.push(c);
  const q: Record<string, unknown> = {};
  for (const m of ['select', 'order', 'limit', 'not']) q[m] = () => q;
  q.eq = (k: string, v: unknown) => {
    c.filtros.push([k, v]);
    return q;
  };
  for (const acao of ['update', 'insert']) {
    q[acao] = (v: unknown) => {
      c.acao = acao;
      c.valor = v;
      return q;
    };
  }
  q.delete = () => {
    c.acao = 'delete';
    return q;
  };
  const dados = () => (tabela === 'galeria_albuns' ? [ALBUM] : FOTOS);
  q.maybeSingle = () => Promise.resolve({ data: null, error: null });
  q.single = () => Promise.resolve({ data: { ...ALBUM, id: 'alb-novo' }, error: null });
  q.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: dados(), error: null }).then(ok);
  return q;
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: consulta,
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
    storage: {
      from: () => ({
        remove: async (caminhos: string[]) => {
          removidos.push(caminhos);
          return { error: null };
        },
      }),
    },
  }),
}));
vi.mock('@/lib/imagem/reduzir-no-navegador', () => ({ reduzirNoNavegador: async (f: File) => f }));

import { AbaGaleria } from './AbaGaleria';

const JOGOS = [
  { id: 'j1', origem: 'agenda', modalidade: null, fase: null, casa: 'Real', fora: 'Sede', dataHora: '2026-11-15T22:00:00.000Z', local: null, transmissao: false },
];

describe('AbaGaleria', () => {
  beforeEach(() => {
    chamadas.length = 0;
    removidos.length = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.startsWith('/api/galeria/jogos')) return new Response(JSON.stringify({ jogos: JOGOS }));
        return new Response('{}');
      }),
    );
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://banco.test');
    vi.stubGlobal('confirm', () => true);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('lista os álbuns com título e número de fotos', async () => {
    render(<AbaGaleria />);
    expect(await screen.findByText('Real x Sede')).toBeInTheDocument();
    expect(screen.getByText(/2 fotos/)).toBeInTheDocument();
  });

  it('Novo álbum mostra os jogos recentes e a opção Evento', async () => {
    const u = userEvent.setup();
    render(<AbaGaleria />);
    await u.click(await screen.findByRole('button', { name: '+ Novo álbum' }));
    expect(await screen.findByRole('radio', { name: 'Real x Sede · 15/11' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Evento' })).toBeInTheDocument();
  });

  it('Evento sem nome pede o nome', async () => {
    const u = userEvent.setup();
    render(<AbaGaleria />);
    await u.click(await screen.findByRole('button', { name: '+ Novo álbum' }));
    await u.click(await screen.findByRole('radio', { name: 'Evento' }));
    await u.click(screen.getByRole('button', { name: 'Criar álbum' }));
    expect(screen.getByText('Escreva o nome do evento')).toBeInTheDocument();
  });

  it('Esconder grava ativo=false', async () => {
    const u = userEvent.setup();
    render(<AbaGaleria />);
    await u.click(await screen.findByRole('button', { name: 'Esconder' }));
    expect(chamadas.find((c) => c.acao === 'update' && c.tabela === 'galeria_albuns')).toMatchObject({
      valor: { ativo: false },
      filtros: [['id', 'alb-1']],
    });
  });

  it('envia 3 fotos uma por vez e avisa a que falhou', async () => {
    let n = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.startsWith('/api/galeria/jogos')) return new Response(JSON.stringify({ jogos: [] }));
        n += 1;
        return n === 2 ? new Response('{}', { status: 500 }) : new Response(JSON.stringify({ ok: true }));
      }),
    );
    const u = userEvent.setup();
    render(<AbaGaleria />);
    await u.click(await screen.findByRole('button', { name: 'Abrir' }));
    const arquivos = [1, 2, 3].map((i) => new File([new Uint8Array([i])], `f${i}.jpg`, { type: 'image/jpeg' }));
    await u.upload(screen.getByLabelText('Adicionar fotos'), arquivos);
    expect(await screen.findByText('3 de 3')).toBeInTheDocument();
    expect(screen.getByText('1 foto não foi enviada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    expect(n).toBe(3);
  });

  it('Apagar remove a linha e os dois arquivos; Usar como capa grava a capa', async () => {
    const u = userEvent.setup();
    render(<AbaGaleria />);
    await u.click(await screen.findByRole('button', { name: 'Abrir' }));
    const primeira = (await screen.findAllByRole('listitem', { name: /Foto/ }))[0];
    await u.click(within(primeira).getByRole('button', { name: 'Usar como capa' }));
    expect(chamadas.find((c) => c.acao === 'update' && c.tabela === 'galeria_albuns')).toMatchObject({
      valor: { capa_url: FOTOS[0].url },
    });
    await u.click(within(primeira).getByRole('button', { name: 'Apagar' }));
    expect(chamadas.find((c) => c.acao === 'delete' && c.tabela === 'galeria_fotos')).toMatchObject({ filtros: [['id', 'f1']] });
    expect(removidos[0]).toEqual(['alb-1/aaa.jpg', 'alb-1/aaa-m.jpg']);
  });

  it('apagar a foto que é capa no banco troca a capa pela próxima, mesmo sem a tela saber', async () => {
    const u = userEvent.setup();
    render(<AbaGaleria />);
    await u.click(await screen.findByRole('button', { name: 'Abrir' }));
    const primeira = (await screen.findAllByRole('listitem', { name: /Foto/ }))[0];
    await u.click(within(primeira).getByRole('button', { name: 'Apagar' }));
    expect(chamadas.find((c) => c.acao === 'update' && c.tabela === 'galeria_albuns')).toMatchObject({
      valor: { capa_url: FOTOS[1].url },
      filtros: [
        ['id', 'alb-1'],
        ['capa_url', FOTOS[0].url],
      ],
    });
  });
});
