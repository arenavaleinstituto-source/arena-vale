import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Banner } from './Banner';
import { AoVivo } from './AoVivo';
import { Contagem } from './Contagem';
import { AgendaArena } from './AgendaArena';
import { UltimosVideos } from './UltimosVideos';
import { Modalidades } from './Modalidades';
import { ParaMarcas } from './ParaMarcas';
import { AtletasDestaques } from './AtletasDestaques';
import { ProjetoSocialHome } from './ProjetoSocialHome';
import type { ItemAgenda } from '@/lib/midia/agenda';
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
  it('frase com ESPORTE em vermelho, sem botões', () => {
    const { container } = render(<Banner capaUrl="/fundo-arena.jpg" />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/O palco do\s*esporte\s*é aqui\./i);
    const vermelho = h1.querySelector('.text-av-vermelho');
    expect(vermelho?.textContent).toMatch(/esporte/i);
    expect(screen.getByText('Mídia Esportiva')).toBeInTheDocument();
    expect(container.textContent).toContain('histórias de quem vive o esporte.');
    expect(container.querySelector('button, a')).toBeNull();
  });

  it('usa a capa do site_config como fundo', () => {
    const { container } = render(<Banner capaUrl="https://x.supabase.co/capa.jpg" />);
    expect((container.querySelector('.hero') as HTMLElement).style.getPropertyValue('--capa-img')).toContain('https://x.supabase.co/capa.jpg');
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

  it('botão "▶ Assista ao vivo" abre em nova aba', () => {
    render(<AoVivo aoVivo={false} embed="x" linkAssistir="https://www.youtube.com/@TVArenaVale/live" proxima={null} />);
    const a = screen.getByRole('link', { name: '▶ Assista ao vivo' });
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('href', 'https://www.youtube.com/@TVArenaVale/live');
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
});

describe('AgendaArena', () => {
  it('vazia: mensagem curta', () => {
    render(<AgendaArena itens={[]} />);
    expect(screen.getByText('Nenhum jogo agendado — volte em breve.')).toBeInTheDocument();
  });

  it('jogo com selo Transmissão', () => {
    render(<AgendaArena itens={[JOGO]} />);
    expect(screen.getByText('● Transmissão')).toBeInTheDocument();
    expect(screen.getByText('Ginásio Galegão - Blumenau')).toBeInTheDocument();
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
  it('um cartão por modalidade cadastrada, inclusive as novas', async () => {
    render(await Modalidades());
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/modalidades/futsal', '/modalidades/futebol7', '/modalidades/basquete', '/modalidades/volei', '/modalidades/beach-tennis']);
    expect(screen.getByText('O palco do beach tennis é aqui.')).toBeInTheDocument();
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
  it('cartazes dos atletas com link para a galeria', () => {
    render(
      <AtletasDestaques
        destaques={[{ id: 'a1', nome: 'Gabriel', equipe: 'Brusque', campeonato: 'Copa Vale', modalidade: 'FUTSAL', imagem_url: null, jogos: null, gols_ou_pontos: null, assistencias: null, ordem: 1, ativo: true, created_at: '2026-11-01' }]}
      />,
    );
    expect(screen.getByRole('img', { name: 'Gabriel' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver todos →' })).toHaveAttribute('href', '/atletasdestaques');
  });
});

describe('ProjetoSocialHome', () => {
  it('3 botões vermelhos de apoio', () => {
    render(<ProjetoSocialHome whatsapp="5547988444404" />);
    const botoes = ['Apoiar o projeto social', 'Conhecer cotas de patrocínio', 'Inscrever criança / atleta'].map((n) => screen.getByRole('link', { name: n }));
    botoes.forEach((b) => expect(b.className).toContain('forte'));
    expect(botoes[2]).toHaveAttribute('href', '/inscricao');
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
});
