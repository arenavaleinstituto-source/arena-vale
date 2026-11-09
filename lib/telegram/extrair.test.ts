import { describe, expect, it } from 'vitest';
import { comandoVincular, extrairRascunho, respostaRascunho, type TgMessage } from './extrair';

const base = { message_id: 10, chat: { id: 555 }, from: { id: 99 } };

const FOTO: TgMessage = {
  ...base,
  caption: 'Golaço do meio de campo\nNa final do estadual.',
  photo: [
    { file_id: 'p-pequena', file_size: 1000, width: 90, height: 90 },
    { file_id: 'p-grande', file_size: 90000, width: 1280, height: 720 },
  ],
  forward_origin: { type: 'chat', sender_chat: { title: 'Gols do Mundo' } },
};

const VIDEO: TgMessage = {
  ...base,
  caption: 'Virada histórica',
  video: { file_id: 'v1', file_size: 5_000_000, mime_type: 'video/mp4', thumbnail: { file_id: 't1' } },
  forward_origin: { type: 'user', sender_user: { first_name: 'Ana', last_name: 'Lima' } },
};

const VIDEO_GRANDE: TgMessage = { ...base, caption: 'Grande', video: { file_id: 'v2', file_size: 40_000_000, mime_type: 'video/mp4' } };

const TEXTO_YT: TgMessage = { ...base, text: 'Olha esse gol https://youtu.be/dQw4w9WgXcQ demais' };

const CANAL: TgMessage = {
  ...base,
  caption: 'Lance do dia',
  document: { file_id: 'd1', file_size: 3_000_000, mime_type: 'video/mp4' },
  forward_origin: { type: 'channel', chat: { title: 'Canal Esportes', username: 'canalesportes' }, message_id: 321 },
};

describe('extrairRascunho', () => {
  it('foto: a maior resolução vira o cartaz; fonte do chat', () => {
    const r = extrairRascunho(FOTO);
    expect(r).toMatchObject({ ref: '555:10', tipo_midia: 'foto', fotoFileId: 'p-grande', titulo: 'Golaço do meio de campo', descricao: 'Na final do estadual.', fonte: 'Gols do Mundo' });
  });

  it('vídeo: tipo vídeo, miniatura e fonte do usuário', () => {
    expect(extrairRascunho(VIDEO)).toMatchObject({ tipo_midia: 'video', videoFileId: 'v1', videoTamanho: 5_000_000, thumbFileId: 't1', fonte: 'Ana Lima' });
  });

  it('só texto com link do YouTube vira rascunho de vídeo com o link', () => {
    expect(extrairRascunho(TEXTO_YT)).toMatchObject({ tipo_midia: 'video', video_link: 'https://youtu.be/dQw4w9WgXcQ', videoFileId: null });
  });

  it('documento de vídeo de canal público: link t.me', () => {
    expect(extrairRascunho(CANAL)).toMatchObject({ tipo_midia: 'video', videoFileId: 'd1', video_link: 'https://t.me/canalesportes/321', fonte: 'Canal Esportes' });
  });

  it('título sem a hashtag de editoria nem emoji no começo; o texto inteiro vai para a descrição', () => {
    const r = extrairRascunho({ ...base, caption: '#Futebol: 🔴 O STJD puniu Maripán com um jogo de suspensão.\n\nO zagueiro cumprirá suspensão automática.\n\n📰Juliano Machado' });
    expect(r.titulo).toBe('O STJD puniu Maripán com um jogo de suspensão.');
    expect(r.descricao).toBe('O zagueiro cumprirá suspensão automática.\n\n📰Juliano Machado');
  });

  it('bandeira no começo sai do título (no Windows ela aparece como "DE")', () => {
    expect(extrairRascunho({ ...base, text: '🇩🇪 🥇 Pela primeira vez desde 2005' }).titulo).toBe('Pela primeira vez desde 2005');
  });

  it('título longo corta numa palavra inteira, com reticências', () => {
    const t = extrairRascunho({ ...base, text: 'Pela primeira vez desde que o FIFPro World 11 começou em 2005, o vencedor da Bola de Ouro do mesmo ano não foi incluído na seleção' }).titulo;
    expect(t.length).toBeLessThanOrEqual(111);
    expect(t.endsWith('…')).toBe(true);
    expect(t).not.toMatch(/\s…$/);
    expect(t).toMatch(/^Pela primeira vez desde que o FIFPro World 11/);
  });

  it('título longo é cortado em 120; sem texto, título padrão', () => {
    expect(extrairRascunho({ ...base, text: 'x'.repeat(200) }).titulo).toBe('x'.repeat(110) + '…');
    expect(extrairRascunho({ ...base, photo: FOTO.photo }).titulo).toBe('Notícia do Telegram');
  });

  it('álbum: guarda o media_group_id', () => {
    expect(extrairRascunho({ ...FOTO, media_group_id: 'g1' }).mediaGroupId).toBe('g1');
  });
});

describe('comandoVincular', () => {
  it('lê o código de 8 letras/números (maiúsculo)', () => {
    expect(comandoVincular('/vincular AB23CD45')).toBe('AB23CD45');
    expect(comandoVincular('/vincular@ArenaValeBot ab23cd45')).toBe('AB23CD45');
    expect(comandoVincular('/vincular 123456')).toBeNull();
    expect(comandoVincular('/vincular abc')).toBeNull();
    expect(comandoVincular('oi')).toBeNull();
  });
});

describe('respostaRascunho', () => {
  const link = 'https://site/coordenador?aba=noticias&editar=1';
  it('normal', () => {
    expect(respostaRascunho(extrairRascunho(FOTO), 'guardar_arquivo', false, false, link)).toBe(`Rascunho criado ✅\n${link}`);
  });
  it('vídeo grande com link', () => {
    const r = { ...extrairRascunho(VIDEO_GRANDE), video_link: 'https://youtu.be/dQw4w9WgXcQ' };
    expect(respostaRascunho(r, 'guardar_arquivo', false, false, link)).toBe(`Rascunho criado ✅ — vídeo grande demais para guardar, vai tocar pelo link original.\n${link}`);
  });
  it('vídeo grande sem link', () => {
    expect(respostaRascunho(extrairRascunho(VIDEO_GRANDE), 'guardar_arquivo', false, false, link)).toBe(
      `Rascunho criado ✅ — vídeo acima de 20 MB. Envie uma versão menor pelo painel ou cole o link.\n${link}`,
    );
  });
  it('modo só link sem link', () => {
    expect(respostaRascunho(extrairRascunho(VIDEO), 'so_link', false, false, link)).toBe(`Rascunho criado ✅ — falta o link do vídeo. Cole no painel antes de publicar.\n${link}`);
  });
  it('falha ao baixar a mídia', () => {
    expect(respostaRascunho(extrairRascunho(FOTO), 'guardar_arquivo', false, true, link)).toBe(`Rascunho criado sem foto.\n${link}`);
  });
});
