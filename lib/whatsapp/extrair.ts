/**
 * Leitura das mensagens recebidas pelo número WhatsApp Business (Cloud API).
 * Funções puras: não falam com o WhatsApp nem com o banco.
 */
import { primeiroLinkDeVideo } from '@/lib/midia/links';

// ─── Tipos do payload da Cloud API ──────────────────────────────────

export type WaMessage = {
  id: string;
  from: string; // número E.164 sem "+", ex.: "5511999999999"
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'reaction' | 'sticker' | string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  video?: { id: string; mime_type: string; caption?: string };
  document?: { id: string; filename?: string; mime_type?: string; caption?: string };
  context?: { forwarded?: boolean; frequently_forwarded?: boolean };
};

export type WaPayload = {
  object: string;
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WaMessage[];
        statuses?: unknown[];
      };
    }>;
  }>;
};

// ─── Resultado da extração ───────────────────────────────────────────

export type RascunhoWA = {
  ref: string;
  titulo: string;
  descricao: string;
  tipo_midia: 'foto' | 'video';
  imagemMediaId: string | null;
  videoMediaId: string | null;
  videoMime: string | null;
  video_link: string | null;
};

export const TITULO_PADRAO = 'Notícia do WhatsApp';

/** Até 110 caracteres, cortando numa palavra inteira e terminando com "…". */
function cortarTitulo(t: string, max = 110): string {
  if (t.length <= max) return t;
  const corte = t.slice(0, max);
  const espaco = corte.lastIndexOf(' ');
  return (espaco > max * 0.6 ? corte.slice(0, espaco) : corte).replace(/[\s,;:.–-]+$/, '') + '…';
}

function textoDoMensagem(msg: WaMessage): string {
  if (msg.type === 'text') return msg.text?.body?.trim() ?? '';
  if (msg.type === 'image') return msg.image?.caption?.trim() ?? '';
  if (msg.type === 'video') return msg.video?.caption?.trim() ?? '';
  if (msg.type === 'document') return msg.document?.caption?.trim() ?? '';
  return '';
}

export function extrairRascunhoWA(msg: WaMessage): RascunhoWA {
  const texto = textoDoMensagem(msg);
  const linhas = texto.split('\n');
  const i = linhas.findIndex((l) => l.trim());
  // "#Futebol: 🔴 O STJD..." → "O STJD...": tira hashtag de editoria e emojis do começo.
  const limpo =
    i === -1
      ? ''
      : linhas[i]
          .replace(/^(?:\s*#[\p{L}\p{N}_]+:?)+/u, '')
          .replace(/^[\s\p{Extended_Pictographic}\p{Regional_Indicator}️‍:–-]+/u, '')
          .trim();
  const titulo = cortarTitulo(limpo || (i === -1 ? '' : linhas[i].trim()) || TITULO_PADRAO);
  const descricao = i === -1 ? '' : linhas.slice(i + 1).join('\n').trim();

  const docVideo = msg.document?.mime_type?.startsWith('video/') ? msg.document : null;
  const imagemMediaId = msg.type === 'image' ? (msg.image?.id ?? null) : null;
  const videoMedia = msg.type === 'video' ? msg.video : docVideo;
  const videoMediaId = videoMedia?.id ?? null;
  const videoMime = videoMedia?.mime_type ?? null;

  const video_link = primeiroLinkDeVideo(texto);
  const ehVideo = Boolean(videoMediaId) || Boolean(video_link && !imagemMediaId);

  return {
    ref: msg.id,
    titulo,
    descricao,
    tipo_midia: ehVideo ? 'video' : 'foto',
    imagemMediaId,
    videoMediaId,
    videoMime,
    video_link,
  };
}

/** Extrai o código de 8 caracteres do comando `/vincular XXXXXXXX`. */
export function comandoVincular(texto: string): string | null {
  const m = texto.trim().match(/^\/vincular\s+([A-Za-z0-9]{8})$/);
  return m ? m[1].toUpperCase() : null;
}
