import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/ui/svg-para-png', () => ({ svgParaPng: vi.fn(async () => new Blob(['png'], { type: 'image/png' })) }));

import { MontadorEscudo } from './MontadorEscudo';
import { EscudoDoTime } from './EscudoDoTime';

const TIME = { id: 't1', nome: 'Leões do Vale', sigla: 'LEO', escudo_url: null, escudo_cor: null };

afterEach(() => vi.unstubAllGlobals());

describe('MontadorEscudo', () => {
  it('trocar o formato para "Redondo" muda a prévia', async () => {
    render(<MontadorEscudo sigla="LEO" onPronto={vi.fn()} />);
    const previa = screen.getByRole('img', { name: 'Prévia do escudo' });
    expect(previa.innerHTML).not.toContain('<circle');
    await userEvent.setup().selectOptions(screen.getByLabelText('Formato'), 'Redondo');
    expect(previa.innerHTML).toContain('<circle');
  });

  it('o texto já vem com a sigla e aceita até 4 letras', async () => {
    render(<MontadorEscudo sigla="LEO" onPronto={vi.fn()} />);
    const texto = screen.getByLabelText('Texto do escudo');
    expect(texto).toHaveValue('LEO');
    await userEvent.setup().type(texto, 'NXX');
    expect(texto).toHaveValue('LEON');
  });
});

describe('EscudoDoTime', () => {
  it('"Usar este escudo" envia o PNG com a cor para a rota do time', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ ok: true, url: 'https://x/escudo.png' })));
    vi.stubGlobal('fetch', fetch);
    render(<EscudoDoTime time={TIME} />);
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: 'Montar um escudo' }));
    await u.click(screen.getByRole('button', { name: 'Usar este escudo' }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/times/t1/escudo');
    const fd = init.body as FormData;
    expect(fd.get('cor')).toBe('#e50914');
    expect(fd.get('arquivo')).toBeInstanceOf(Blob);
    expect(await screen.findByText('Escudo atualizado.')).toBeInTheDocument();
  });

  it('mostra o erro da rota', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: false, erro: 'Só o capitão do time troca o escudo.' }), { status: 403 })));
    render(<EscudoDoTime time={TIME} />);
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: 'Montar um escudo' }));
    await u.click(screen.getByRole('button', { name: 'Usar este escudo' }));
    expect(await screen.findByText('Só o capitão do time troca o escudo.')).toBeInTheDocument();
  });

  it('oferece enviar o escudo que o time já tem', () => {
    render(<EscudoDoTime time={TIME} />);
    expect(screen.getByLabelText('Enviar o escudo que já temos')).toBeInTheDocument();
  });
});
