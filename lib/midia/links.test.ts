import { describe, expect, it } from 'vitest';
import { idYoutube, primeiroLinkDeVideo, servicoDoLink, validarLinkInstagram } from './links';

describe('links de vídeo', () => {
  it('idYoutube nas 5 formas', () => {
    for (const u of [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/live/dQw4w9WgXcQ?si=abc',
    ]) {
      expect(idYoutube(u)).toBe('dQw4w9WgXcQ');
    }
    expect(idYoutube('https://www.instagram.com/reel/abc/')).toBeNull();
    expect(idYoutube('não é link')).toBeNull();
  });

  it('servicoDoLink', () => {
    expect(servicoDoLink('https://fb.watch/x')).toBe('facebook');
    expect(servicoDoLink('https://www.facebook.com/x')).toBe('facebook');
    expect(servicoDoLink('https://twitter.com/x/status/1')).toBe('x');
    expect(servicoDoLink('https://x.com/x/status/1')).toBe('x');
    expect(servicoDoLink('https://vm.tiktok.com/abc')).toBe('tiktok');
    expect(servicoDoLink('https://t.me/canal/10')).toBe('telegram');
    expect(servicoDoLink('https://www.instagram.com/p/abc')).toBe('instagram');
    expect(servicoDoLink('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube');
    expect(servicoDoLink('https://site.com/video')).toBe('outro');
    expect(servicoDoLink('lixo')).toBe('outro');
  });

  it('primeiroLinkDeVideo ignora links que não são de vídeo', () => {
    expect(primeiroLinkDeVideo('veja https://site.com e https://youtu.be/dQw4w9WgXcQ agora')).toBe('https://youtu.be/dQw4w9WgXcQ');
    expect(primeiroLinkDeVideo('sem link nenhum')).toBeNull();
    expect(primeiroLinkDeVideo('só https://site.com')).toBeNull();
  });

  it('validarLinkInstagram', () => {
    expect(validarLinkInstagram('https://www.instagram.com/reel/abc/')).toBe(true);
    expect(validarLinkInstagram('https://instagram.com/p/xyz')).toBe(true);
    expect(validarLinkInstagram('https://www.instagram.com/tv/xyz')).toBe(true);
    expect(validarLinkInstagram('http://instagram.com/p/x')).toBe(false);
    expect(validarLinkInstagram('https://instagram.com.evil.com/p/x')).toBe(false);
    expect(validarLinkInstagram('https://www.instagram.com/arenavaleoficial')).toBe(false);
  });
});
