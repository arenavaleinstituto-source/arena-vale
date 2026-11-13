import { describe, expect, it, vi } from 'vitest';
import { processarUpdate, type PortasBot } from './processar';
import type { EstadoBot } from './galeria';
import type { ItemAgenda } from '@/lib/midia/agenda';

const ORIGEM = 'https://site.test';
const JOGO: ItemAgenda = {
  id: '3f2b8c1e-1a2b-4c3d-8e9f-0123456789ab',
  origem: 'agenda',
  modalidade: null,
  fase: null,
  casa: 'Real',
  fora: 'Sede',
  dataHora: '2026-11-20T22:00:00.000Z',
  local: null,
  transmissao: false,
};
const ALBUM = { id: 'alb-1', titulo: 'Real x Sede' };

function portas(estadoInicial: EstadoBot | null = null, over: Partial<PortasBot> = {}) {
  let estado: EstadoBot = estadoInicial ?? { modo: 'noticias', albumId: null, expiraEm: null };
  const p = {
    perfilPorTelegram: vi.fn().mockResolvedValue({ id: 'coord-1', role: 'coordenador' }),
    vincularCodigo: vi.fn(),
    modoVideo: vi.fn().mockResolvedValue({ modo: 'guardar_arquivo', dias: 30 }),
    baixarArquivo: vi.fn().mockResolvedValue({ bytes: new Uint8Array([1, 2, 3]), ext: 'jpg', mime: 'image/jpeg' }),
    guardarArquivo: vi.fn().mockImplementation(async (c: string) => `https://cdn.test/${c}`),
    inserirRascunho: vi.fn().mockResolvedValue({ id: 'n-1' }),
    enviarMensagem: vi.fn().mockResolvedValue(undefined),
    completarAlbum: vi.fn(),
    carimbar: vi.fn().mockImplementation(async (a: unknown) => a),
    lerEstado: vi.fn(async () => estado),
    gravarEstado: vi.fn(async (_id: number, e: EstadoBot) => {
      estado = e;
    }),
    renovarPrazo: vi.fn(async (_id: number, expiraEm: string) => {
      estado = { ...estado, expiraEm };
    }),
    marcarGrupo: vi.fn(async (_id: number, grupo: string) => {
      if (estado.ultimoGrupo === grupo) return false;
      estado = { ...estado, ultimoGrupo: grupo };
      return true;
    }),
    jogosRecentes: vi.fn().mockResolvedValue([JOGO]),
    albumDoJogo: vi.fn().mockResolvedValue(ALBUM),
    criarAlbumEvento: vi.fn().mockImplementation(async (titulo: string) => ({ id: 'alb-ev', titulo })),
    guardarFotoGaleria: vi.fn().mockResolvedValue(undefined),
    enviarBotoes: vi.fn().mockResolvedValue(undefined),
    responderBotao: vi.fn().mockResolvedValue(undefined),
    galeriaAtiva: vi.fn().mockResolvedValue(true),
    montarParceiro: vi.fn(),
    albumPublicado: vi.fn().mockResolvedValue(false),
    ...over,
  } satisfies PortasBot;
  return { p, estado: () => estado };
}

const AGORA = new Date('2026-11-21T10:00:00.000Z');
const EM_30 = new Date(AGORA.getTime() + 30 * 60000).toISOString();
const galeriaAberta = (extra: Partial<EstadoBot> = {}): EstadoBot => ({
  modo: 'galeria',
  albumId: 'alb-1',
  albumTitulo: 'Real x Sede',
  expiraEm: new Date(AGORA.getTime() + 10 * 60000).toISOString(),
  ...extra,
});

const texto = (t: string) => ({ message: { message_id: 1, chat: { id: 5 }, from: { id: 42 }, text: t } });
const foto = (extra: object = {}) => ({
  message: { message_id: 2, chat: { id: 5 }, from: { id: 42 }, photo: [{ file_id: 'p-peq', file_size: 10 }, { file_id: 'p-grande', file_size: 99 }], ...extra },
});
const botao = (dados: string) => ({
  callback_query: { id: 'cb-1', from: { id: 42 }, message: { message_id: 9, chat: { id: 5 } }, data: dados },
});

const rodar = (u: unknown, p: PortasBot) => processarUpdate(u, p, ORIGEM, AGORA);

describe('galeria pelo robô', () => {
  it('/fotos de coordenador: pergunta o jogo com botões', async () => {
    const { p } = portas();
    await rodar(texto('/fotos'), p);
    expect(p.enviarBotoes).toHaveBeenCalledWith(5, 'De qual jogo são as fotos?', [
      [{ texto: 'Real x Sede · 20/11', dados: `g:a:${JOGO.id}` }],
      [
        { texto: 'Outro evento', dados: 'g:outro' },
        { texto: 'Cancelar', dados: 'g:cancelar' },
      ],
    ]);
    expect(p.inserirRascunho).not.toHaveBeenCalled();
  });

  it('/fotos sem a galeria ativa avisa', async () => {
    const { p } = portas(null, { galeriaAtiva: vi.fn().mockResolvedValue(false) });
    await rodar(texto('/fotos'), p);
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, 'A galeria ainda não foi ativada');
    expect(p.enviarBotoes).not.toHaveBeenCalled();
  });

  it('botão do jogo abre o álbum e entra no modo galeria por 30 min', async () => {
    const { p, estado } = portas();
    await rodar(botao(`g:a:${JOGO.id}`), p);
    expect(p.responderBotao).toHaveBeenCalledWith('cb-1');
    expect(p.albumDoJogo).toHaveBeenCalledWith('agenda', JOGO.id, 'Real x Sede', '2026-11-20', 'coord-1', { competicao: null, local: null, placar: null });
    expect(estado()).toMatchObject({ modo: 'galeria', albumId: 'alb-1', albumTitulo: 'Real x Sede', expiraEm: EM_30 });
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, 'Pode mandar as fotos 📸 (envie /pronto quando terminar)');
  });

  it('Outro evento pede o nome', async () => {
    const { p, estado } = portas();
    await rodar(botao('g:outro'), p);
    expect(estado().modo).toBe('nome_evento');
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, 'Qual o nome do evento?');
  });

  it('nome do evento cria o álbum com a data de hoje e abre o modo galeria', async () => {
    const { p, estado } = portas({ modo: 'nome_evento', albumId: null, expiraEm: EM_30 });
    await rodar(texto('Festival Sub-11'), p);
    expect(p.criarAlbumEvento).toHaveBeenCalledWith('Festival Sub-11', '2026-11-21', 'coord-1');
    expect(estado()).toMatchObject({ modo: 'galeria', albumId: 'alb-ev' });
    expect(p.inserirRascunho).not.toHaveBeenCalled();
  });

  it('nome curto demais é recusado', async () => {
    const { p } = portas({ modo: 'nome_evento', albumId: null, expiraEm: EM_30 });
    await rodar(texto('ab'), p);
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, 'O nome precisa ter pelo menos 3 letras');
    expect(p.criarAlbumEvento).not.toHaveBeenCalled();
  });

  it('Cancelar volta ao modo notícias', async () => {
    const { p, estado } = portas(galeriaAberta());
    await rodar(botao('g:cancelar'), p);
    expect(estado().modo).toBe('noticias');
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, 'Ok, cancelado.');
  });

  it('foto no modo galeria vai para o álbum (não vira notícia) e renova o prazo', async () => {
    const { p, estado } = portas(galeriaAberta());
    await rodar(foto(), p);
    expect(p.baixarArquivo).toHaveBeenCalledWith('p-grande', expect.any(Number));
    expect(p.guardarFotoGaleria).toHaveBeenCalledWith('alb-1', expect.any(Uint8Array), 'coord-1');
    expect(p.inserirRascunho).not.toHaveBeenCalled();
    expect(estado().expiraEm).toBe(EM_30);
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, '✅ Foto guardada no álbum Real x Sede');
  });

  it('3 fotos do mesmo álbum do Telegram: guarda as 3 e responde uma vez', async () => {
    const { p } = portas(galeriaAberta());
    for (const id of [11, 12, 13]) await rodar(foto({ message_id: id, media_group_id: 'grp-1' }), p);
    expect(p.guardarFotoGaleria).toHaveBeenCalledTimes(3);
    expect(p.enviarMensagem).toHaveBeenCalledTimes(1);
  });

  it('foto enviada como arquivo (documento de imagem) também vale', async () => {
    const { p } = portas(galeriaAberta());
    await rodar({ message: { message_id: 3, chat: { id: 5 }, from: { id: 42 }, document: { file_id: 'doc-1', mime_type: 'image/jpeg', file_size: 50 } } }, p);
    expect(p.baixarArquivo).toHaveBeenCalledWith('doc-1', expect.any(Number));
    expect(p.guardarFotoGaleria).toHaveBeenCalled();
  });

  it('vídeo no modo galeria é recusado com explicação', async () => {
    const { p } = portas(galeriaAberta());
    await rodar({ message: { message_id: 4, chat: { id: 5 }, from: { id: 42 }, video: { file_id: 'v1', file_size: 10 } } }, p);
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, 'Na galeria só vão fotos. Para notícia, envie /pronto antes');
    expect(p.guardarFotoGaleria).not.toHaveBeenCalled();
    expect(p.inserirRascunho).not.toHaveBeenCalled();
  });

  it('/pronto com álbum em rascunho: lembra de publicar no painel', async () => {
    const { p, estado } = portas(galeriaAberta());
    await rodar(texto('/pronto'), p);
    expect(estado().modo).toBe('noticias');
    expect(p.albumPublicado).toHaveBeenCalledWith('alb-1');
    expect(p.enviarMensagem).toHaveBeenCalledWith(
      5,
      'Fotos guardadas ✅ O álbum está em RASCUNHO: confira os detalhes e clique em Publicar no painel:\nhttps://site.test/coordenador?aba=galeria',
    );
  });

  it('/pronto com álbum já publicado: manda o link do site', async () => {
    const { p } = portas(galeriaAberta(), { albumPublicado: vi.fn().mockResolvedValue(true) });
    await rodar(texto('/pronto'), p);
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, 'Álbum atualizado no site ✅\nhttps://site.test/galeria/alb-1');
  });

  it('modo galeria vencido: a foto volta a virar notícia', async () => {
    const { p } = portas(galeriaAberta({ expiraEm: new Date(AGORA.getTime() - 60000).toISOString() }));
    await rodar(foto({ caption: 'Golaço' }), p);
    expect(p.guardarFotoGaleria).not.toHaveBeenCalled();
    expect(p.inserirRascunho).toHaveBeenCalled();
  });

  it('quem não é coordenador recebe a mesma resposta de sempre no /fotos', async () => {
    const { p } = portas(null, { perfilPorTelegram: vi.fn().mockResolvedValue({ id: 'cap', role: 'capitao' }) });
    await rodar(texto('/fotos'), p);
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, 'Você não tem permissão para criar notícias.');
    expect(p.enviarBotoes).not.toHaveBeenCalled();
  });

  it('falha ao guardar a foto: avisa para tentar de novo', async () => {
    const { p } = portas(galeriaAberta(), { guardarFotoGaleria: vi.fn().mockRejectedValue(new Error('storage')) });
    await rodar(foto(), p);
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, 'Não consegui guardar uma foto, tente de novo');
    expect(p.inserirRascunho).not.toHaveBeenCalled();
  });
});
