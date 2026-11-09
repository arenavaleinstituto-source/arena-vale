import { describe, expect, it } from 'vitest';
import { CONFIG_PADRAO, linkAssistirAoVivo, mapearConfig } from './config';

describe('config do site', () => {
  it('padrões da ARENA VALE', () => {
    expect(CONFIG_PADRAO).toEqual({
      whatsapp: '5547988444404',
      instagramUrl: 'https://www.instagram.com/arenavaleoficial',
      youtubeChannelId: 'UCBTQ97bWA6VqK2a6qv80dIg',
      youtubeHandle: '@TVArenaVale',
      capaUrl: '/fundo-arena.jpg',
      aoVivoManual: false,
      aoVivoLink: null,
    });
  });

  it('linha ausente ou campos vazios usam o padrão', () => {
    expect(mapearConfig(null)).toEqual(CONFIG_PADRAO);
    expect(mapearConfig({ whatsapp: '', capa_url: null })).toEqual(CONFIG_PADRAO);
  });

  it('lê os campos do banco', () => {
    const c = mapearConfig({ whatsapp: '5547900000000', capa_url: 'https://x.supabase.co/capa.jpg', ao_vivo_manual: true, ao_vivo_link: 'https://youtu.be/x' });
    expect(c.whatsapp).toBe('5547900000000');
    expect(c.capaUrl).toBe('https://x.supabase.co/capa.jpg');
    expect(c.aoVivoManual).toBe(true);
    expect(c.aoVivoLink).toBe('https://youtu.be/x');
  });

  it('link do botão Assista ao vivo', () => {
    expect(linkAssistirAoVivo({ ...CONFIG_PADRAO, aoVivoManual: true, aoVivoLink: 'https://youtu.be/x' })).toBe('https://youtu.be/x');
    expect(linkAssistirAoVivo(CONFIG_PADRAO)).toBe('https://www.youtube.com/@TVArenaVale/live');
  });
});
