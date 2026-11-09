/** Configurações do site editáveis pela coordenação (tabela site_config, linha 'main'). */
export type ConfigSite = {
  whatsapp: string;
  instagramUrl: string;
  youtubeChannelId: string;
  youtubeHandle: string;
  capaUrl: string;
  aoVivoManual: boolean;
  aoVivoLink: string | null;
};

export const CONFIG_PADRAO: ConfigSite = {
  whatsapp: '5547988444404',
  instagramUrl: 'https://www.instagram.com/arenavaleoficial',
  youtubeChannelId: 'UCBTQ97bWA6VqK2a6qv80dIg',
  youtubeHandle: '@TVArenaVale',
  capaUrl: '/fundo-arena.jpg',
  aoVivoManual: false,
  aoVivoLink: null,
};

function texto(v: unknown, padrao: string): string {
  return typeof v === 'string' && v.trim() ? v.trim() : padrao;
}

export function mapearConfig(row: Record<string, unknown> | null): ConfigSite {
  if (!row) return { ...CONFIG_PADRAO };
  const link = typeof row.ao_vivo_link === 'string' && row.ao_vivo_link.trim() ? row.ao_vivo_link.trim() : null;
  return {
    whatsapp: texto(row.whatsapp, CONFIG_PADRAO.whatsapp),
    instagramUrl: texto(row.instagram_url, CONFIG_PADRAO.instagramUrl),
    youtubeChannelId: texto(row.youtube_channel_id, CONFIG_PADRAO.youtubeChannelId),
    youtubeHandle: texto(row.youtube_handle, CONFIG_PADRAO.youtubeHandle),
    capaUrl: texto(row.capa_url, CONFIG_PADRAO.capaUrl),
    aoVivoManual: row.ao_vivo_manual === true,
    aoVivoLink: link,
  };
}

export function linkAssistirAoVivo(c: ConfigSite): string {
  if (c.aoVivoManual && c.aoVivoLink) return c.aoVivoLink;
  return `https://www.youtube.com/${c.youtubeHandle}/live`;
}
