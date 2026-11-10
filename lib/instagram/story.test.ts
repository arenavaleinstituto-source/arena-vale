import { describe, expect, it, vi } from 'vitest';
import { publicarStory, type NoticiaStory, type PortasStory } from './story';

function portas(over: Partial<PortasStory> = {}, status: string[] = ['FINISHED']) {
  const fila = [...status];
  const p: PortasStory = {
    conta: vi.fn().mockResolvedValue({ userId: '178', token: 'tok' }),
    criarContainer: vi.fn().mockResolvedValue('c-1'),
    statusContainer: vi.fn().mockImplementation(async () => fila.shift() ?? 'IN_PROGRESS'),
    publicarContainer: vi.fn().mockResolvedValue('m-9'),
    prepararImagem: vi.fn().mockResolvedValue('https://cdn.test/instagram/n1.jpg'),
    salvar: vi.fn().mockResolvedValue(undefined),
    esperar: vi.fn().mockResolvedValue(undefined),
    agora: (() => {
      let t = 0;
      return () => (t += 1000);
    })(),
    ...over,
  };
  return p;
}

const N: NoticiaStory = { id: 'n1', video_url: null, imagem_url: 'https://cdn.test/foto.jpg', story_status: null, story_container_id: null };

describe('publicarStory', () => {
  it('vídeo guardado: manda o vídeo como Story e publica quando o Instagram termina de processar', async () => {
    const p = portas({}, ['IN_PROGRESS', 'FINISHED']);
    const r = await publicarStory({ ...N, video_url: 'https://cdn.test/gol.mp4' }, p, 30000);
    expect(p.criarContainer).toHaveBeenCalledWith({ userId: '178', token: 'tok' }, { video_url: 'https://cdn.test/gol.mp4' });
    expect(p.publicarContainer).toHaveBeenCalledWith({ userId: '178', token: 'tok' }, 'c-1');
    expect(r).toEqual({ status: 'publicado' });
    expect(p.salvar).toHaveBeenLastCalledWith('n1', expect.objectContaining({ story_status: 'publicado', story_erro: null }));
  });

  it('sem vídeo: monta a imagem em pé (9:16) a partir da capa e manda como Story', async () => {
    const p = portas();
    await publicarStory(N, p, 30000);
    expect(p.prepararImagem).toHaveBeenCalledWith('n1', 'https://cdn.test/foto.jpg');
    expect(p.criarContainer).toHaveBeenCalledWith(expect.anything(), { image_url: 'https://cdn.test/instagram/n1.jpg' });
  });

  it('demorou para processar: guarda o container e responde "processando" para tentar de novo', async () => {
    const p = portas({}, []);
    const r = await publicarStory({ ...N, video_url: 'https://cdn.test/gol.mp4' }, p, 5000);
    expect(r).toEqual({ status: 'processando' });
    expect(p.salvar).toHaveBeenCalledWith('n1', expect.objectContaining({ story_status: 'processando', story_container_id: 'c-1' }));
    expect(p.publicarContainer).not.toHaveBeenCalled();
  });

  it('nova tentativa reaproveita o container que já estava processando', async () => {
    const p = portas();
    await publicarStory({ ...N, story_status: 'processando', story_container_id: 'c-velho' }, p, 30000);
    expect(p.criarContainer).not.toHaveBeenCalled();
    expect(p.publicarContainer).toHaveBeenCalledWith(expect.anything(), 'c-velho');
  });

  it('já publicado: não posta de novo', async () => {
    const p = portas();
    const r = await publicarStory({ ...N, story_status: 'publicado' }, p, 30000);
    expect(r).toEqual({ status: 'publicado' });
    expect(p.criarContainer).not.toHaveBeenCalled();
  });

  it('Instagram recusou o vídeo: grava o erro e libera para tentar de novo', async () => {
    const p = portas({}, ['ERROR']);
    const r = await publicarStory({ ...N, video_url: 'https://cdn.test/gol.mp4' }, p, 30000);
    expect(r.status).toBe('erro');
    expect(p.salvar).toHaveBeenLastCalledWith('n1', expect.objectContaining({ story_status: 'erro', story_container_id: null }));
  });

  it('Instagram ainda não ligado: avisa sem quebrar', async () => {
    const p = portas({ conta: vi.fn().mockResolvedValue(null) });
    const r = await publicarStory(N, p, 30000);
    expect(r).toEqual({ status: 'erro', erro: 'O Instagram ainda não foi ligado ao site.' });
    expect(p.criarContainer).not.toHaveBeenCalled();
  });

  it('notícia sem foto nem vídeo: não tem o que postar', async () => {
    const p = portas();
    const r = await publicarStory({ ...N, imagem_url: null }, p, 30000);
    expect(r.status).toBe('erro');
    expect(p.criarContainer).not.toHaveBeenCalled();
  });

  it('erro da API (ex.: chave vencida): grava a mensagem', async () => {
    const p = portas({ criarContainer: vi.fn().mockRejectedValue(new Error('Invalid OAuth access token')) });
    const r = await publicarStory(N, p, 30000);
    expect(r).toEqual({ status: 'erro', erro: 'Invalid OAuth access token' });
    expect(p.salvar).toHaveBeenLastCalledWith('n1', expect.objectContaining({ story_status: 'erro', story_erro: 'Invalid OAuth access token' }));
  });
});
