import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validarConfig } from './coord-config';

const upsert = vi.fn();
const linha = {
  id: 'main',
  whatsapp: '5547988444404',
  instagram_url: 'https://www.instagram.com/arenavaleoficial',
  youtube_channel_id: 'UCBTQ97bWA6VqK2a6qv80dIg',
  youtube_handle: '@TVArenaVale',
  capa_url: null,
};
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: linha, error: null }) }) }),
      upsert: (v: unknown) => {
        upsert(v);
        return Promise.resolve({ error: null });
      },
    }),
    storage: { from: () => ({ upload: vi.fn(), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
  }),
}));

import { CoordConfig } from './coord-config';

describe('validarConfig', () => {
  const ok = { whatsapp: '5547988444404', instagram_url: 'https://www.instagram.com/arenavaleoficial', youtube_channel_id: 'UCBTQ97bWA6VqK2a6qv80dIg', youtube_handle: '@TVArenaVale' };

  it('aceita a configuração padrão', () => {
    expect(validarConfig(ok)).toEqual({ erros: [], valores: ok, avisos: [] });
  });

  it('ID do canal inválido', () => {
    expect(validarConfig({ ...ok, youtube_channel_id: 'abc' }).erros).toEqual(['ID do canal inválido (começa com UC e tem 24 caracteres).']);
  });

  it('handle precisa começar com @', () => {
    expect(validarConfig({ ...ok, youtube_handle: 'TVArenaVale' }).erros).toEqual(['O nome do canal começa com @ (ex.: @TVArenaVale).']);
  });

  it('Instagram precisa de https://', () => {
    expect(validarConfig({ ...ok, instagram_url: 'instagram.com/x' }).erros).toEqual(['O link do Instagram começa com https://']);
  });

  it('WhatsApp: tira a formatação e avisa quando falta o 55', () => {
    const r = validarConfig({ ...ok, whatsapp: '(47) 98844-4404' });
    expect(r.erros).toEqual([]);
    expect(r.valores.whatsapp).toBe('47988444404');
    expect(r.avisos).toEqual(['Inclua o 55 (Brasil) antes do DDD: 5547988444404.']);
  });

  it('WhatsApp curto demais é erro', () => {
    expect(validarConfig({ ...ok, whatsapp: '1234' }).erros).toEqual(['WhatsApp inválido: use só números, com 55 e DDD.']);
  });
});

describe('CoordConfig', () => {
  beforeEach(() => upsert.mockReset());

  it('ID do canal inválido bloqueia o salvamento', async () => {
    render(<CoordConfig />);
    const u = userEvent.setup();
    const campo = await screen.findByLabelText('ID do canal do YouTube');
    await waitFor(() => expect((campo as HTMLInputElement).value).toBe('UCBTQ97bWA6VqK2a6qv80dIg'));
    await u.clear(campo);
    await u.type(campo, 'abc');
    await u.click(screen.getByRole('button', { name: 'Salvar configurações' }));
    expect(await screen.findByText('ID do canal inválido (começa com UC e tem 24 caracteres).')).toBeInTheDocument();
    expect(upsert).not.toHaveBeenCalled();
  });

  it('salva os campos válidos', async () => {
    render(<CoordConfig />);
    const u = userEvent.setup();
    await waitFor(() => expect((screen.getByLabelText('WhatsApp') as HTMLInputElement).value).toBe('5547988444404'));
    await u.click(screen.getByRole('button', { name: 'Salvar configurações' }));
    await waitFor(() => expect(upsert).toHaveBeenCalledTimes(1));
    expect(upsert.mock.calls[0][0]).toMatchObject({ id: 'main', youtube_channel_id: 'UCBTQ97bWA6VqK2a6qv80dIg', whatsapp: '5547988444404' });
  });
});
