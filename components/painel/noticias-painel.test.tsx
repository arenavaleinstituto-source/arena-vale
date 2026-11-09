import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mapearNoticiaMidia } from '@/lib/midia/noticias';

const escritas: { tabela: string; op: string; valor: unknown }[] = [];
const rpc = vi.fn();
const remover = vi.fn().mockResolvedValue({ error: null });
function consulta(tabela: string) {
  const q: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'order', 'limit']) q[m] = () => q;
  q.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(ok);
  q.update = (v: unknown) => {
    escritas.push({ tabela, op: 'update', valor: v });
    return { eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'n1', ...(v as object) }, error: null }) }) }) };
  };
  q.insert = (v: unknown) => {
    escritas.push({ tabela, op: 'insert', valor: v });
    return { select: () => ({ single: () => Promise.resolve({ data: { id: 'novo', ...(v as object) }, error: null }) }) };
  };
  return q;
}
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: consulta, rpc, storage: { from: () => ({ upload: vi.fn(), getPublicUrl: () => ({ data: { publicUrl: '' } }), remove: remover }) } }),
}));

import { EditorNoticia } from './EditorNoticia';
import { AbaVideos } from './AbaVideos';
import { VincularTelegram } from './VincularTelegram';

const n = (p: Record<string, unknown> = {}) => mapearNoticiaMidia({ id: 'n1', titulo: 'Golaço', imagem_url: 'https://x/c.jpg', status: 'rascunho', ...p });

describe('EditorNoticia', () => {
  beforeEach(() => {
    escritas.length = 0;
  });

  it('vídeo sem link no modo só link: Publicar mostra o que falta e não grava', async () => {
    render(<EditorNoticia noticia={n({ tipo_midia: 'video' })} modo="so_link" onSalvo={vi.fn()} onFechar={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Publicar' }));
    expect(screen.getByText('Cole o link do vídeo para publicar')).toBeInTheDocument();
    expect(escritas).toEqual([]);
  });

  it('foto com título e cartaz: Publicar grava status publicado', async () => {
    const onSalvo = vi.fn();
    render(<EditorNoticia noticia={n()} modo="guardar_arquivo" onSalvo={onSalvo} onFechar={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Publicar' }));
    await waitFor(() => expect(escritas[0]).toMatchObject({ tabela: 'noticias', op: 'update', valor: expect.objectContaining({ status: 'publicado', titulo: 'Golaço' }) }));
    expect(onSalvo).toHaveBeenCalled();
  });

  it('nova notícia: Salvar rascunho insere na aba escolhida', async () => {
    render(<EditorNoticia noticia={null} modo="guardar_arquivo" onSalvo={vi.fn()} onFechar={vi.fn()} />);
    const u = userEvent.setup();
    await u.type(screen.getByLabelText('Título'), 'Nova');
    await u.selectOptions(screen.getByLabelText('Aba'), 'mundo');
    await u.click(screen.getByRole('button', { name: 'Salvar rascunho' }));
    await waitFor(() => expect(escritas[0]).toMatchObject({ op: 'insert', valor: expect.objectContaining({ titulo: 'Nova', aba: 'mundo', status: 'rascunho' }) }));
  });

  it('rascunho do Telegram mostra o lembrete de direitos', () => {
    render(<EditorNoticia noticia={n({ origem: 'telegram' })} modo="guardar_arquivo" onSalvo={vi.fn()} onFechar={vi.fn()} />);
    expect(screen.getByText('Reescreva com suas palavras e cite a fonte.')).toBeInTheDocument();
  });

  it('link do YouTube sem cartaz oferece a imagem do YouTube', async () => {
    render(<EditorNoticia noticia={n({ imagem_url: null, tipo_midia: 'video', video_link: 'https://youtu.be/dQw4w9WgXcQ' })} modo="guardar_arquivo" onSalvo={vi.fn()} onFechar={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Usar a imagem do YouTube' }));
    expect(screen.getByRole('img', { name: 'Golaço' })).toHaveAttribute('src', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
  });

  it('"Remover vídeo" só apaga o arquivo depois de salvar', async () => {
    remover.mockClear();
    const url = 'https://x.supabase.co/storage/v1/object/public/noticias/videos/1.mp4';
    render(<EditorNoticia noticia={n({ tipo_midia: 'video', video_url: url, video_link: 'https://youtu.be/dQw4w9WgXcQ' })} modo="guardar_arquivo" onSalvo={vi.fn()} onFechar={vi.fn()} />);
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: 'Remover vídeo' }));
    expect(remover).not.toHaveBeenCalled();
    await u.click(screen.getByRole('button', { name: 'Salvar rascunho' }));
    await waitFor(() => expect(remover).toHaveBeenCalledWith(['videos/1.mp4']));
    expect(escritas[0]).toMatchObject({ op: 'update', valor: expect.objectContaining({ video_url: null }) });
  });

  it('publicada: mostra Despublicar', () => {
    render(<EditorNoticia noticia={n({ status: 'publicado' })} modo="guardar_arquivo" onSalvo={vi.fn()} onFechar={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Despublicar' })).toBeInTheDocument();
  });
});

describe('AbaVideos', () => {
  beforeEach(() => {
    escritas.length = 0;
  });

  it('link de perfil (não de post) é recusado', async () => {
    render(<AbaVideos />);
    const u = userEvent.setup();
    await u.type(screen.getByLabelText('Link do post no Instagram'), 'https://www.instagram.com/arenavaleoficial');
    await u.type(screen.getByLabelText('Título do vídeo'), 'Gol');
    await u.click(screen.getByRole('button', { name: 'Publicar vídeo' }));
    expect(screen.getByText('Cole um link https:// do Instagram (post, reel ou tv).')).toBeInTheDocument();
    expect(escritas).toEqual([]);
  });
});

describe('VincularTelegram', () => {
  it('gera o código e mostra a instrução', async () => {
    rpc.mockResolvedValueOnce({ data: '482913', error: null });
    render(<VincularTelegram />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Vincular Telegram' }));
    expect(await screen.findByText('/vincular 482913')).toBeInTheDocument();
    expect(rpc).toHaveBeenCalledWith('gerar_codigo_telegram');
  });
});
