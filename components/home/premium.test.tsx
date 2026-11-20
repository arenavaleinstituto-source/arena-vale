import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { QuemSomos } from './QuemSomos';
import { Contato } from './Contato';
import { AgoraNaArena, EsporteMundial } from './NoticiasHome';
import { UltimosVideos } from './UltimosVideos';
import { FotosDosJogos } from './FotosDosJogos';
import { AtletasDestaques } from './AtletasDestaques';
import { ParaMarcas } from './ParaMarcas';
import { HojeNaArena } from './HojeNaArena';

describe('QuemSomos', () => {
  it('apresenta a essência da ARENA VALE com link para o Sobre', () => {
    render(<QuemSomos fotos={[]} />);
    expect(screen.getByRole('heading', { level: 2, name: /Dar palco ao esporte/i })).toBeInTheDocument();
    expect(screen.getByText(/Cada atleta, cada equipe e cada jogo merecem ser vistos/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Conheça a ARENA VALE/ })).toHaveAttribute('href', '/sobre');
  });

  it('o que fazemos: um cartão por frente de trabalho, cada um levando à página certa', () => {
    render(<QuemSomos fotos={[]} />);
    const grade = screen.getByRole('list', { name: 'O que a ARENA VALE faz' });
    const links = within(grade).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/ao-vivo', '/campeonatos', '/noticias', '/galeria', '/projetosocial', '/patrocinio']);
  });

  it('usa as fotos recebidas no fundo dos cartões e funciona sem fotos', () => {
    const { container, rerender } = render(<QuemSomos fotos={['https://x/a.jpg', 'https://x/b.jpg']} />);
    const imgs = [...container.querySelectorAll('.servico img')].map((i) => i.getAttribute('src'));
    expect(imgs).toEqual(['https://x/a.jpg', 'https://x/b.jpg']);
    rerender(<QuemSomos fotos={[]} />);
    expect(container.querySelectorAll('.servico img')).toHaveLength(0);
  });

  it('marca sem "Sports"', () => {
    render(<QuemSomos fotos={[]} />);
    expect(document.body.textContent ?? '').not.toMatch(/sports?\b/i);
  });
});

describe('Contato', () => {
  const props = { whatsapp: '5547988444404', instagramUrl: 'https://www.instagram.com/arenavaleoficial', youtubeHandle: '@TVArenaVale' };

  it('seção #contato com WhatsApp, Instagram e YouTube do site_config', () => {
    const { container } = render(<Contato {...props} />);
    expect(container.querySelector('section#contato')).not.toBeNull();
    expect(screen.getByRole('link', { name: /WhatsApp/ }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/5547988444404/);
    expect(screen.getByRole('link', { name: /Instagram/ })).toHaveAttribute('href', 'https://www.instagram.com/arenavaleoficial');
    expect(screen.getByRole('link', { name: /YouTube/ })).toHaveAttribute('href', 'https://www.youtube.com/@TVArenaVale');
  });

  it('links externos abrem em nova aba com segurança', () => {
    render(<Contato {...props} />);
    for (const a of screen.getAllByRole('link')) {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
    }
  });
});

describe('textos das seções da página inicial', () => {
  it('Agora na Arena virou NOTÍCIAS DO VALE', () => {
    render(<AgoraNaArena noticias={[]} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Notícias do Vale' })).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('Agora na Arena');
  });

  it('Esporte Mundial: só "Notícias do esporte mundial."', () => {
    render(<EsporteMundial noticias={[]} />);
    expect(screen.getByText('Notícias do esporte mundial.')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/garimpadas/);
  });

  it('Últimos vídeos sem "atualiza sozinho"', () => {
    render(<UltimosVideos videos={[]} externos={[]} channelUrl="https://www.youtube.com/@TVArenaVale" />);
    expect(screen.getByText('Direto do canal TV Arena Vale.')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/atualiza sozinho/);
  });

  it('nenhum travessão nos textos das seções', () => {
    const album = { id: 'a1', titulo: 'Final', data: '2026-11-10', origem: null, jogoRef: null, capaUrl: null, ativo: true, totalFotos: 3, competicao: null, local: null, placar: null, descricao: null, fotografo: null, publicadoEm: null };
    render(
      <>
        <QuemSomos fotos={[]} />
        <AgoraNaArena noticias={[]} />
        <EsporteMundial noticias={[]} />
        <UltimosVideos videos={[]} externos={[]} channelUrl="https://www.youtube.com/@TVArenaVale" />
        <FotosDosJogos albuns={[album]} />
        <AtletasDestaques destaques={[]} />
        <ParaMarcas whatsapp="5547988444404" />
        <HojeNaArena hoje={[]} proximos={[]} baseUrl="https://www.arenavale.com.br" youtubeHandle="@TVArenaVale" albuns={{}} />
      </>,
    );
    expect(document.body.textContent).not.toMatch(/[—–]/);
  });
});
