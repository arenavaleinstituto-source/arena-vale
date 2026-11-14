import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { Banner } from './Banner';
import { AoVivo } from './AoVivo';
import { Contagem } from './Contagem';
import { HojeNaArena } from './HojeNaArena';
import { UltimosVideos } from './UltimosVideos';
import { Modalidades } from './Modalidades';
import { ParaMarcas } from './ParaMarcas';
import { AtletasDestaques } from './AtletasDestaques';
import { ProjetoSocialHome } from './ProjetoSocialHome';
import { EsporteMundial } from './NoticiasHome';
import type { ItemAgenda } from '@/lib/midia/agenda';
import type { NoticiaMidia } from '@/lib/midia/noticias';
import { MODALIDADES_SITE } from '@/lib/midia/modalidades';

vi.mock('@/lib/midia/modalidades-busca', () => ({
  buscarModalidades: async () => [...MODALIDADES_SITE, { slug: 'beach-tennis', nome: 'Beach Tennis', frase: 'O palco do beach tennis é aqui.' }],
}));

const JOGO: ItemAgenda = {
  id: 'j1',
  origem: 'agenda',
  modalidade: 'Futsal',
  fase: 'Fase de Grupos',
  casa: 'Água Verde',
  fora: 'Vila Nova',
  dataHora: '2099-11-15T19:00:00.000Z',
  local: 'Ginásio Galegão - Blumenau',
  transmissao: true,
};

describe('Banner', () => {
  it('frase com ESPORTE em vermelho', () => {
    render(<Banner capaUrl="/fundo-arena.jpg" whatsapp="5547988444404" linkAssistir="https://youtube.com" />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/O palco do\s*esporte\s*é aqui\./i);
    const vermelho = h1.querySelector('.text-av-vermelho');
    expect(vermelho?.textContent).toMatch(/esporte/i);
    expect(screen.getByText('Mídia Esportiva')).toBeInTheDocument();
  });

  it('usa a capa do site_config como fundo', () => {
    const { container } = render(<Banner capaUrl="https://x.supabase.co/capa.jpg" whatsapp="5547988444404" linkAssistir="https://youtube.com" />);
    expect((container.querySelector('.hero') as HTMLElement).style.getPropertyValue('--capa-img')).toContain('https://x.supabase.co/capa.jpg');
  });

  it('Banner shows WhatsApp CTA and stats bullets', () => {
    render(<Banner capaUrl="" whatsapp="5547988444404" linkAssistir="https://youtube.com" />);
    expect(screen.getByRole('link', { name: /falar com a arena vale/i })).toBeInTheDocument();
    expect(screen.getByText(/\+1\.200/i)).toBeInTheDocument();
  });
});

describe('AoVivo', () => {
  it('ao vivo mostra o player do canal', () => {
    render(<AoVivo aoVivo embed="https://www.youtube-nocookie.com/embed/live_stream?channel=UC1" linkAssistir="https://www.youtube.com/@TVArenaVale/live" proxima={null} />);
    const iframe = screen.getByTitle('Transmissão ao vivo ARENA VALE');
    expect(iframe.getAttribute('src')).toContain('live_stream?channel=');
  });

  it('fora do ar e sem próxima: "Próxima transmissão a definir"', () => {
    render(<AoVivo aoVivo={false} embed="x" linkAssistir="https://www.youtube.com/@TVArenaVale/live" proxima={null} />);
    expect(screen.getByText('Próxima transmissão a definir')).toBeInTheDocument();
    expect(screen.queryByTitle('Transmissão ao vivo ARENA VALE')).toBeNull();
  });

  it('fora do ar com próxima: mostra o jogo', () => {
    render(<AoVivo aoVivo={false} embed="x" linkAssistir="https://www.youtube.com/@TVArenaVale/live" proxima={JOGO} />);
    expect(screen.getByRole('heading', { name: 'Água Verde × Vila Nova' })).toBeInTheDocument();
  });

  it('link "Assistir ao vivo" abre em nova aba', () => {
    render(<AoVivo aoVivo={false} embed="x" linkAssistir="https://www.youtube.com/@TVArenaVale/live" proxima={null} />);
    const links = screen.getAllByRole('link');
    const assistir = links.find(l => l.getAttribute('href') === 'https://www.youtube.com/@TVArenaVale/live');
    expect(assistir).toBeDefined();
    expect(assistir).toHaveAttribute('target', '_blank');
  });

  it('AoVivo off-air shows av-tela card linking to channel', () => {
    const { container } = render(<AoVivo aoVivo={false} embed="" linkAssistir="https://youtube.com/live" proxima={null} />);
    const tela = container.querySelector('.av-tela');
    expect(tela).toBeInTheDocument();
    expect(tela).toHaveAttribute('href', 'https://youtube.com/live');
  });
});

const makeNoticia = (id: string, titulo: string): NoticiaMidia => ({
  id, titulo, descricao: 'x', categoria: 'esporte', imagem_url: null, enquadramento: null,
  aba: 'mundo', destaque: false, tipo_midia: 'foto', video_url: null, video_expira_em: null,
  video_link: null, video_servico: null, status: 'publicado', publicado_em: new Date().toISOString(),
  fonte: null, origem: 'manual', modalidade: null, created_at: new Date().toISOString(),
});

describe('EsporteMundial', () => {
  it('mosaico shows big card for first news item', () => {
    const noticias = [makeNoticia('1', 'Titulo principal'), makeNoticia('2', 'Secundaria')];
    const { container } = render(<EsporteMundial noticias={noticias} />);
    expect(container.querySelector('.mosaico-grade')).toBeInTheDocument();
    expect(container.querySelector('.mosaico-cartao.grande')).toBeInTheDocument();
  });

  it('sem noticias: mensagem vazio', () => {
    render(<EsporteMundial noticias={[]} />);
    expect(screen.getByText(/em breve/i)).toBeInTheDocument();
  });
});

describe('Contagem', () => {
  it('data no passado mostra "Começando agora" (nunca negativa)', () => {
    render(<Contagem alvo="2000-01-01T00:00:00.000Z" />);
    expect(screen.getByText('Começando agora')).toBeInTheDocument();
  });

  it('data futura mostra dias, horas e min', () => {
    render(<Contagem alvo="2099-01-01T00:00:00.000Z" />);
    expect(screen.getByText('dias')).toBeInTheDocument();
    expect(screen.getByText('min')).toBeInTheDocument();
  });

  it('no servidor não usa o relógio (evita diferença ao abrir no navegador)', () => {
    const html = renderToString(<Contagem alvo="2099-01-01T00:00:00.000Z" />);
    expect(html).toContain('--');
    expect(html).not.toMatch(/<b>\d/);
  });
});

describe('HojeNaArena agenda linhas', () => {
  it('lista de jogos usa classe linhas-agenda', () => {
    const props = { baseUrl: 'https://www.arenavale.com.br', youtubeHandle: '@TVArenaVale', albuns: {} };
    const jogo = { id: 'j1', origem: 'agenda' as const, modalidade: 'Futsal', fase: 'Final', casa: 'Água Verde', fora: 'Vila Nova', dataHora: '2099-11-15T19:00:00.000Z', local: 'Ginásio', transmissao: false };
    const { container } = render(<HojeNaArena hoje={[jogo]} proximos={[]} {...props} />);
    expect(container.querySelector('.linhas-agenda')).toBeInTheDocument();
  });
});

describe('HojeNaArena', () => {
  const props = { baseUrl: 'https://www.arenavale.com.br', youtubeHandle: '@TVArenaVale', albuns: {} };
  const outro = (id: string, casa: string): ItemAgenda => ({ ...JOGO, id, casa });

  it('vazia: mensagem curta', () => {
    render(<HojeNaArena hoje={[]} proximos={[]} {...props} />);
    expect(screen.getByText('Nenhum jogo agendado — volte em breve.')).toBeInTheDocument();
  });

  it('jogo de hoje com selo HOJE e próximos dias', () => {
    render(<HojeNaArena hoje={[JOGO]} proximos={[outro('j2', 'Real'), outro('j3', 'Sede')]} {...props} />);
    expect(screen.getByRole('heading', { name: 'Hoje na Arena' })).toBeInTheDocument();
    expect(screen.getAllByText('HOJE')).toHaveLength(1);
    expect(screen.getByText('Próximos dias')).toBeInTheDocument();
    expect(screen.getAllByText('● Transmissão')).toHaveLength(3);
    expect(screen.getAllByText('Ginásio Galegão - Blumenau')).toHaveLength(3);
  });

  it('sem jogo hoje: avisa e mostra os próximos', () => {
    render(<HojeNaArena hoje={[]} proximos={[outro('j2', 'Real')]} {...props} />);
    expect(screen.getByText('Hoje não tem jogo na Arena — veja os próximos')).toBeInTheDocument();
    expect(screen.getByText(/Real/)).toBeInTheDocument();
  });
});

describe('UltimosVideos', () => {
  it('sem vídeos: link "Veja no canal"', () => {
    render(<UltimosVideos videos={[]} externos={[]} channelUrl="https://www.youtube.com/@TVArenaVale" />);
    expect(screen.getByRole('link', { name: 'Veja no canal' })).toHaveAttribute('href', 'https://www.youtube.com/@TVArenaVale');
  });

  it('junta YouTube e Instagram por data e mostra até 8', () => {
    const yt = Array.from({ length: 7 }, (_, i) => ({
      id: `id${i}xxxxxxx`.slice(0, 11),
      titulo: `YT ${i}`,
      publicadoEm: `2026-10-0${i + 1}T10:00:00Z`,
      capa: '/c.jpg',
      link: `https://www.youtube.com/watch?v=${i}`,
    }));
    const ig = [{ id: 'g1', titulo: 'Reel novo', link: 'https://www.instagram.com/reel/a/', capa_url: '/r.jpg', plataforma: 'instagram', publicado_em: '2026-11-01T10:00:00Z' }];
    render(<UltimosVideos videos={yt} externos={ig} channelUrl="https://www.youtube.com/@TVArenaVale" />);
    const titulos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titulos).toHaveLength(8);
    expect(titulos[0]).toBe('Reel novo');
  });
});

describe('Modalidades', () => {
  it('um botão por modalidade cadastrada, inclusive as novas', async () => {
    render(await Modalidades());
    const botoes = screen.getAllByRole('button').map((b) => b.textContent);
    expect(botoes.some((t) => t?.includes('Beach Tennis'))).toBe(true);
    expect(botoes.some((t) => t?.includes('Futsal'))).toBe(true);
  });

  it('exibe a frase da primeira modalidade no painel', async () => {
    render(await Modalidades());
    const primeiraMod = MODALIDADES_SITE[0];
    expect(screen.getByText(primeiraMod.frase)).toBeInTheDocument();
  });
});

describe('ParaMarcas', () => {
  it('só texto e o botão, sem as etiquetas', () => {
    const { container } = render(<ParaMarcas whatsapp="5547988444404" />);
    expect(container.textContent).toContain('Coloque sua marca no');
    expect(screen.getByRole('link', { name: 'Falar com a ARENA VALE' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/5547988444404/);
    expect(container.textContent).not.toContain('Naming da transmissão');
  });
});

describe('AtletasDestaques', () => {
  const destaque = { id: 'a1', nome: 'Gabriel', equipe: 'Brusque', campeonato: 'Copa Vale', modalidade: 'FUTSAL', imagem_url: '/g.jpg', jogos: null, gols_ou_pontos: null, assistencias: null, ordem: 1, ativo: true, created_at: '2026-11-01' };

  it('portrait spotlight shows first atleta name', () => {
    const { container } = render(<AtletasDestaques destaques={[destaque]} />);
    expect(container.querySelector('.atleta-sobre')).toBeInTheDocument();
    expect(screen.getByText('Gabriel')).toBeInTheDocument();
  });

  it('link para /atletasdestaques', () => {
    render(<AtletasDestaques destaques={[destaque]} />);
    const link = screen.getByRole('link', { name: /ver todos/i });
    expect(link).toHaveAttribute('href', '/atletasdestaques');
  });

  it('sem destaques: mensagem vazio', () => {
    render(<AtletasDestaques destaques={[]} />);
    expect(screen.getByText(/em breve/i)).toBeInTheDocument();
  });
});

describe('ProjetoSocialHome', () => {
  it('3 botões vermelhos de apoio', () => {
    render(<ProjetoSocialHome whatsapp="5547988444404" />);
    const botoes = ['Apoiar o projeto social', 'Conhecer cotas de patrocínio', 'Inscrever criança / atleta'].map((n) => screen.getByRole('link', { name: n }));
    botoes.forEach((b) => expect(b.className).toContain('forte'));
    expect(botoes[2]).toHaveAttribute('href', '/inscricao');
  });

  it('ProjetoSocialHome shows numeros impacto strip', () => {
    const { container } = render(<ProjetoSocialHome whatsapp="5547988444404" />);
    expect(container.querySelector('.numeros-impacto')).toBeInTheDocument();
    expect(screen.getByText('+1.200')).toBeInTheDocument();
  });
});

describe('SeuCampeonato', () => {
  it('oferece o site para campeonatos de terceiros, com WhatsApp e exemplo', async () => {
    const { SeuCampeonato } = await import('./SeuCampeonato');
    const { container } = render(<SeuCampeonato whatsapp="5547988444404" />);
    expect(container.textContent).toContain('Seu campeonato');
    expect(container.textContent).toContain('Tabela de classificação automática');
    const zap = screen.getByRole('link', { name: 'Quero meu campeonato no site' }).getAttribute('href')!;
    expect(zap).toMatch(/^https:\/\/wa\.me\/5547988444404\?text=/);
    expect(decodeURIComponent(zap)).toContain('campeonato');
    expect(screen.getByRole('link', { name: 'Ver como fica' }).getAttribute('href')).toBe('/modalidades');
  });

  it('SeuCampeonato shows the anel graphic', async () => {
    const { SeuCampeonato } = await import('./SeuCampeonato');
    const { container } = render(<SeuCampeonato whatsapp="5547988444404" />);
    expect(container.querySelector('.anel-grafico')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });
});

describe('BannerTorneio', () => {
  it('banner estático que leva ao WhatsApp, com versão de celular', async () => {
    const { BannerTorneio } = await import('./BannerTorneio');
    const { container } = render(<BannerTorneio whatsapp="5547988444404" />);
    const link = container.querySelector('a.banner-torneio')!.getAttribute('href')!;
    expect(link).toMatch(/^https:\/\/wa\.me\/5547988444404\?text=/);
    expect(decodeURIComponent(link)).toContain('divulgar o meu torneio');
    expect(screen.getByRole('img').getAttribute('alt')).toContain('Divulgue seu torneio na ARENA VALE');
    expect(container.querySelector('source')?.getAttribute('srcset')).toBe('/banners/divulgue-torneio-celular.jpg');
  });
});
