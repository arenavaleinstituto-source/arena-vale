import { describe, expect, it, vi } from 'vitest';
import { processarUpdate, type PortasBot } from './processar';

function portas(over: Partial<PortasBot> = {}) {
  const p: PortasBot = {
    perfilPorTelegram: vi.fn().mockResolvedValue({ id: 'coord-1', role: 'coordenador' }),
    vincularCodigo: vi.fn().mockResolvedValue('invalido'),
    modoVideo: vi.fn().mockResolvedValue({ modo: 'guardar_arquivo', dias: 30 }),
    baixarArquivo: vi.fn().mockResolvedValue({ bytes: new Uint8Array([1, 2, 3]), ext: 'jpg', mime: 'image/jpeg' }),
    guardarArquivo: vi.fn().mockImplementation(async (caminho: string) => `https://cdn.test/${caminho}`),
    inserirRascunho: vi.fn().mockResolvedValue({ id: 'n-1' }),
    enviarMensagem: vi.fn().mockResolvedValue(undefined),
    completarAlbum: vi.fn().mockResolvedValue(undefined),
    ...over,
  };
  return p;
}

const ORIGEM = 'https://site.test';
const foto = (extra: object = {}) => ({
  message: { message_id: 7, chat: { id: 5 }, from: { id: 42 }, caption: 'Golaço\ntexto', photo: [{ file_id: 'f1', file_size: 10 }], ...extra },
});

describe('processarUpdate', () => {
  it('remetente sem vínculo: avisa que não tem permissão e não cria nada', async () => {
    const p = portas({ perfilPorTelegram: vi.fn().mockResolvedValue(null) });
    await processarUpdate(foto(), p, ORIGEM);
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, 'Você não tem permissão para criar notícias.');
    expect(p.inserirRascunho).not.toHaveBeenCalled();
  });

  it('capitão vinculado também não cria notícia', async () => {
    const p = portas({ perfilPorTelegram: vi.fn().mockResolvedValue({ id: 'cap', role: 'capitao' }) });
    await processarUpdate(foto(), p, ORIGEM);
    expect(p.inserirRascunho).not.toHaveBeenCalled();
  });

  it('foto de coordenador: guarda a imagem e cria rascunho na aba mundo', async () => {
    const p = portas();
    await processarUpdate(foto(), p, ORIGEM);
    expect(p.guardarArquivo).toHaveBeenCalledWith('telegram/5-7.jpg', expect.any(Uint8Array), 'image/jpeg');
    expect(p.inserirRascunho).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'Golaço',
        descricao: 'texto',
        status: 'rascunho',
        origem: 'telegram',
        aba: 'mundo',
        tipo_midia: 'foto',
        imagem_url: 'https://cdn.test/telegram/5-7.jpg',
        telegram_message_ref: '5:7',
        created_by: 'coord-1',
      }),
    );
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, `Rascunho criado ✅\n${ORIGEM}/coordenador?aba=noticias&editar=n-1`);
  });

  it('vídeo até 20 MB no modo guardar arquivo: guarda e marca a validade', async () => {
    const p = portas({ baixarArquivo: vi.fn().mockResolvedValue({ bytes: new Uint8Array([9]), ext: 'mp4', mime: 'video/mp4' }) });
    await processarUpdate({ message: { message_id: 8, chat: { id: 5 }, from: { id: 42 }, caption: 'Virada', video: { file_id: 'v1', file_size: 1000 } } }, p, ORIGEM);
    const dados = (p.inserirRascunho as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(dados.tipo_midia).toBe('video');
    expect(dados.video_url).toBe('https://cdn.test/telegram/5-8.mp4');
    expect(Date.parse(dados.video_expira_em) - Date.now()).toBeGreaterThan(29 * 86400000);
  });

  it('modo só link: não baixa o vídeo', async () => {
    const p = portas({ modoVideo: vi.fn().mockResolvedValue({ modo: 'so_link', dias: 30 }) });
    await processarUpdate({ message: { message_id: 8, chat: { id: 5 }, from: { id: 42 }, caption: 'Virada', video: { file_id: 'v1', file_size: 1000 } } }, p, ORIGEM);
    expect(p.baixarArquivo).not.toHaveBeenCalledWith('v1', expect.anything());
    expect((p.enviarMensagem as ReturnType<typeof vi.fn>).mock.calls[0][1]).toContain('falta o link do vídeo');
  });

  it('falha ao baixar a mídia: cria o rascunho mesmo assim e avisa', async () => {
    const p = portas({ baixarArquivo: vi.fn().mockResolvedValue(null) });
    await processarUpdate(foto(), p, ORIGEM);
    expect(p.inserirRascunho).toHaveBeenCalled();
    expect((p.enviarMensagem as ReturnType<typeof vi.fn>).mock.calls[0][1]).toMatch(/^Rascunho criado sem foto\./);
  });

  it('mensagem repetida ou 2ª foto do álbum: não cria outro rascunho nem responde', async () => {
    const p = portas({ inserirRascunho: vi.fn().mockResolvedValue('duplicado') });
    await processarUpdate(foto({ media_group_id: 'g9' }), p, ORIGEM);
    expect((p.inserirRascunho as ReturnType<typeof vi.fn>).mock.calls[0][0].telegram_message_ref).toBe('grupo:5:g9');
    expect(p.enviarMensagem).not.toHaveBeenCalled();
  });

  it('álbum: a parte que traz o texto completa o rascunho criado pela primeira foto (sem texto)', async () => {
    const p = portas({ inserirRascunho: vi.fn().mockResolvedValue('duplicado') });
    await processarUpdate(foto({ media_group_id: 'g9', message_id: 8, caption: 'STJD pune Maripán\nUm jogo de suspensão.' }), p, ORIGEM);
    expect(p.completarAlbum).toHaveBeenCalledWith('grupo:5:g9', 'STJD pune Maripán', 'Um jogo de suspensão.');
    expect(p.enviarMensagem).not.toHaveBeenCalled();
  });

  it('álbum: parte sem texto não mexe no rascunho', async () => {
    const p = portas({ inserirRascunho: vi.fn().mockResolvedValue('duplicado') });
    await processarUpdate(foto({ media_group_id: 'g9', message_id: 9, caption: undefined }), p, ORIGEM);
    expect(p.completarAlbum).not.toHaveBeenCalled();
  });

  it('falha ao gravar: pede para tentar de novo', async () => {
    const p = portas({ inserirRascunho: vi.fn().mockRejectedValue(new Error('banco fora')) });
    await processarUpdate(foto(), p, ORIGEM);
    expect(p.enviarMensagem).toHaveBeenCalledWith(5, 'Não consegui criar o rascunho, tente de novo');
  });

  it('/vincular: válido, inválido e bloqueado por tentativas', async () => {
    const ok = portas({ vincularCodigo: vi.fn().mockResolvedValue('ok') });
    await processarUpdate({ message: { message_id: 1, chat: { id: 5 }, from: { id: 42 }, text: '/vincular AB23CD45' } }, ok, ORIGEM);
    expect(ok.vincularCodigo).toHaveBeenCalledWith('AB23CD45', 42);
    expect(ok.enviarMensagem).toHaveBeenCalledWith(5, 'Telegram vinculado ✅');
    const ruim = portas();
    await processarUpdate({ message: { message_id: 1, chat: { id: 5 }, from: { id: 42 }, text: '/vincular ZZZZZZZZ' } }, ruim, ORIGEM);
    expect(ruim.enviarMensagem).toHaveBeenCalledWith(5, 'Código inválido ou vencido. Gere outro no painel.');
    const bloq = portas({ vincularCodigo: vi.fn().mockResolvedValue('bloqueado') });
    await processarUpdate({ message: { message_id: 1, chat: { id: 5 }, from: { id: 42 }, text: '/vincular ZZZZZZZZ' } }, bloq, ORIGEM);
    expect(bloq.enviarMensagem).toHaveBeenCalledWith(5, 'Muitas tentativas. Tente de novo em 1 hora.');
  });

  it('update sem mensagem é ignorado', async () => {
    const p = portas();
    await processarUpdate({ edited_message: {} }, p, ORIGEM);
    expect(p.enviarMensagem).not.toHaveBeenCalled();
  });

  it('erro ao guardar o vídeo: cria o rascunho mesmo assim e avisa (nunca fica calado)', async () => {
    const p = portas({
      baixarArquivo: vi.fn().mockResolvedValue({ bytes: new Uint8Array([9]), ext: 'mp4', mime: 'video/mp4' }),
      guardarArquivo: vi.fn().mockRejectedValue(new Error('Payload too large')),
    });
    await processarUpdate({ message: { message_id: 9, chat: { id: 5 }, from: { id: 42 }, caption: 'Gol', video: { file_id: 'v1', file_size: 1000 } } }, p, ORIGEM);
    expect(p.inserirRascunho).toHaveBeenCalledWith(expect.objectContaining({ titulo: 'Gol', video_url: null, tipo_midia: 'video' }));
    expect(p.enviarMensagem).toHaveBeenLastCalledWith(5, expect.stringContaining('não consegui guardar o vídeo'));
  });

  it('vídeo: responde na hora que recebeu, antes de baixar', async () => {
    const p = portas({ baixarArquivo: vi.fn().mockResolvedValue({ bytes: new Uint8Array([9]), ext: 'mp4', mime: 'video/mp4' }) });
    await processarUpdate({ message: { message_id: 10, chat: { id: 5 }, from: { id: 42 }, caption: 'Gol', video: { file_id: 'v1', file_size: 1000 } } }, p, ORIGEM);
    expect(p.enviarMensagem).toHaveBeenNthCalledWith(1, 5, 'Recebi o vídeo ⏳ guardando…');
  });

  it('falha inesperada (ex.: banco fora): responde com o erro em vez de ficar calado', async () => {
    const p = portas({ modoVideo: vi.fn().mockRejectedValue(new Error('timeout')) });
    await processarUpdate(foto(), p, ORIGEM);
    expect(p.enviarMensagem).toHaveBeenLastCalledWith(5, 'Não consegui criar o rascunho, tente de novo');
  });
});
