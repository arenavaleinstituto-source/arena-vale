/**
 * Leitura das mensagens encaminhadas ao bot (spec 2026-11-08, seção 4.4).
 * Funções puras: não falam com o Telegram nem com o banco.
 */
import { primeiroLinkDeVideo } from '@/lib/midia/links';
import type { ModoVideo } from '@/lib/midia/noticias';

type TgFile = { file_id: string; file_size?: number; mime_type?: string; width?: number; height?: number; thumbnail?: { file_id: string } };
type TgOrigin =
  | { type: 'user'; sender_user: { first_name?: string; last_name?: string; username?: string } }
  | { type: 'hidden_user'; sender_user_name: string }
  | { type: 'chat'; sender_chat: { title?: string; username?: string } }
  | { type: 'channel'; chat: { title?: string; username?: string }; message_id: number };

export type TgMessage = {
  message_id: number;
  chat: { id: number };
  from?: { id: number };
  text?: string;
  caption?: string;
  photo?: TgFile[];
  video?: TgFile;
  animation?: TgFile;
  document?: TgFile;
  media_group_id?: string;
  forward_origin?: TgOrigin;
};

export type RascunhoTelegram = {
  ref: string;
  titulo: string;
  descricao: string;
  tipo_midia: 'foto' | 'video';
  fotoFileId: string | null;
  videoFileId: string | null;
  videoTamanho: number | null;
  thumbFileId: string | null;
  video_link: string | null;
  fonte: string | null;
  mediaGroupId: string | null;
};

/** Limite de download da API de bots do Telegram. */
export const LIMITE_VIDEO = 20 * 1024 * 1024;

function fonteDe(o: TgOrigin | undefined): string | null {
  if (!o) return null;
  if (o.type === 'user') return [o.sender_user.first_name, o.sender_user.last_name].filter(Boolean).join(' ') || o.sender_user.username || null;
  if (o.type === 'hidden_user') return o.sender_user_name || null;
  if (o.type === 'chat') return o.sender_chat.title || o.sender_chat.username || null;
  return o.chat.title || o.chat.username || null;
}

export function extrairRascunho(msg: TgMessage): RascunhoTelegram {
  const texto = (msg.text ?? msg.caption ?? '').trim();
  const linhas = texto.split('\n');
  const i = linhas.findIndex((l) => l.trim());
  const titulo = i === -1 ? 'Notícia do Telegram' : linhas[i].trim().slice(0, 120);
  const descricao = i === -1 ? '' : linhas.slice(i + 1).join('\n').trim();

  const foto = msg.photo?.length ? [...msg.photo].sort((a, b) => (b.file_size ?? b.width ?? 0) - (a.file_size ?? a.width ?? 0))[0] : null;
  const docVideo = msg.document?.mime_type?.startsWith('video/') ? msg.document : null;
  const video = msg.video ?? msg.animation ?? docVideo ?? null;

  const o = msg.forward_origin;
  const linkCanal = o?.type === 'channel' && o.chat.username ? `https://t.me/${o.chat.username}/${o.message_id}` : null;
  const video_link = primeiroLinkDeVideo(texto) ?? linkCanal;

  return {
    ref: `${msg.chat.id}:${msg.message_id}`,
    titulo,
    descricao,
    tipo_midia: video || (!foto && video_link) ? 'video' : 'foto',
    fotoFileId: foto?.file_id ?? null,
    videoFileId: video?.file_id ?? null,
    videoTamanho: video?.file_size ?? null,
    thumbFileId: video?.thumbnail?.file_id ?? null,
    video_link,
    fonte: fonteDe(o),
    mediaGroupId: msg.media_group_id ?? null,
  };
}

export function comandoVincular(texto: string): string | null {
  const m = texto.trim().match(/^\/vincular(?:@\w+)?\s+(\d{6})$/);
  return m ? m[1] : null;
}

/** Resposta do bot depois de criar o rascunho (mensagens exatas do spec 4.4). */
export function respostaRascunho(r: RascunhoTelegram, modo: ModoVideo, guardouVideo: boolean, erroMidia: boolean, link: string): string {
  let msg = 'Rascunho criado ✅';
  if (erroMidia) msg = 'Rascunho criado sem foto.';
  else if (r.tipo_midia === 'video' && !guardouVideo) {
    const grande = (r.videoTamanho ?? 0) > LIMITE_VIDEO;
    if (modo === 'so_link' && !r.video_link) msg = 'Rascunho criado ✅ — falta o link do vídeo. Cole no painel antes de publicar.';
    else if (grande && r.video_link) msg = 'Rascunho criado ✅ — vídeo grande demais para guardar, vai tocar pelo link original.';
    else if (grande) msg = 'Rascunho criado ✅ — vídeo acima de 20 MB. Envie uma versão menor pelo painel ou cole o link.';
  }
  return `${msg}\n${link}`;
}
