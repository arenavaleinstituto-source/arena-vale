/**
 * O que o bot faz com cada mensagem do WhatsApp Business.
 * Fala com o banco e com a Cloud API só pelas "portas", para poder ser testado sem eles.
 * Padrão análogo ao bot do Telegram (lib/telegram/processar.ts).
 */
import { servicoDoLink } from '@/lib/midia/links';
import type { ModoVideo } from '@/lib/midia/noticias';
import { comandoVincular, extrairRascunhoWA, TITULO_PADRAO, type WaMessage } from './extrair';

export type Arquivo = { bytes: Uint8Array; ext: string; mime: string };

export type DadosRascunhoWA = {
  titulo: string;
  descricao: string;
  status: 'rascunho';
  origem: 'whatsapp';
  aba: 'mundo' | 'arena';
  tipo_midia: 'foto' | 'video';
  imagem_url: string | null;
  video_url: string | null;
  video_expira_em: string | null;
  video_link: string | null;
  video_servico: string | null;
  fonte: string | null;
  whatsapp_message_ref: string;
  created_by: string;
};

export type PortasWA = {
  perfilPorTelefone(phone: string): Promise<{ id: string; role: string } | null>;
  /** Confere o código (válido e não vencido), grava o whatsapp_phone e apaga o código. 5 erros bloqueiam por 1 h. */
  vincularCodigo(codigo: string, phone: string): Promise<'ok' | 'invalido' | 'bloqueado'>;
  modoVideo(): Promise<{ modo: ModoVideo; dias: number }>;
  /** Baixa pela Graph API media endpoint; null se falhar ou passar do limite. */
  baixarArquivo(mediaId: string, limiteBytes: number): Promise<Arquivo | null>;
  /** Envia ao bucket `noticias` e devolve o endereço público. */
  guardarArquivo(caminho: string, bytes: Uint8Array, mime: string): Promise<string>;
  /** 'duplicado' quando whatsapp_message_ref já existe. */
  inserirRascunho(dados: DadosRascunhoWA): Promise<{ id: string } | 'duplicado'>;
  enviarMensagem(phone: string, texto: string): Promise<void>;
  /** Põe a logo da ARENA VALE na imagem (devolve JPEG). */
  carimbar(arq: Arquivo): Promise<Arquivo>;
};

const LIMITE_FOTO = 5 * 1024 * 1024;
const LIMITE_VIDEO = 16 * 1024 * 1024; // WhatsApp limita vídeos a 16 MB

/** O dono pediu para não mostrar a fonte nas notícias do robô. */
const GUARDAR_FONTE = false;

export async function processarMensagem(msg: WaMessage, p: PortasWA, origem: string): Promise<void> {
  // Ignora tipos sem conteúdo utilizável
  if (['reaction', 'sticker', 'audio'].includes(msg.type)) return;

  const phone = msg.from;

  const codigo = comandoVincular(
    msg.type === 'text' ? (msg.text?.body ?? '') : '',
  );
  if (codigo) {
    const r = await p.vincularCodigo(codigo, phone);
    const resposta = {
      ok: 'WhatsApp vinculado ✅',
      invalido: 'Código inválido ou vencido. Gere outro no painel.',
      bloqueado: 'Muitas tentativas. Tente de novo em 1 hora.',
    } as const;
    await p.enviarMensagem(phone, resposta[r]);
    return;
  }

  const perfil = await p.perfilPorTelefone(phone);
  if (!perfil || perfil.role !== 'coordenador') {
    await p.enviarMensagem(phone, 'Você não tem permissão para criar notícias.');
    return;
  }

  try {
    await criarRascunho(msg, phone, perfil.id, p, origem);
  } catch (e) {
    console.error('[whatsapp] falha ao criar rascunho', e);
    await p.enviarMensagem(phone, 'Não consegui criar o rascunho, tente de novo.');
  }
}

async function criarRascunho(
  msg: WaMessage,
  phone: string,
  perfilId: string,
  p: PortasWA,
  origem: string,
): Promise<void> {
  const r = extrairRascunhoWA(msg);
  const { modo, dias } = await p.modoVideo();

  const guardarVideo = Boolean(r.videoMediaId) && modo === 'guardar_arquivo';
  if (guardarVideo) await p.enviarMensagem(phone, 'Recebi o vídeo ⏳ guardando…');

  const base = `whatsapp/${phone}-${msg.id}`;
  let imagem_url: string | null = null;
  let video_url: string | null = null;
  let erroMidia = false;
  let erroVideo = false;

  if (r.imagemMediaId) {
    try {
      const baixado = await p.baixarArquivo(r.imagemMediaId, LIMITE_FOTO);
      const arq = baixado && (await p.carimbar(baixado).catch((e) => (console.error('[whatsapp] falha ao carimbar', e), baixado)));
      if (arq) imagem_url = await p.guardarArquivo(`${base}.${arq.ext}`, arq.bytes, arq.mime);
      else erroMidia = true;
    } catch (e) {
      console.error('[whatsapp] falha ao guardar foto', e);
      erroMidia = true;
    }
  }

  if (guardarVideo && r.videoMediaId) {
    try {
      const arq = await p.baixarArquivo(r.videoMediaId, LIMITE_VIDEO);
      if (arq) video_url = await p.guardarArquivo(`${base}-video.${arq.ext}`, arq.bytes, arq.mime);
      else erroVideo = true;
    } catch (e) {
      console.error('[whatsapp] falha ao guardar vídeo', e);
      erroVideo = true;
    }
  }

  const dados: DadosRascunhoWA = {
    titulo: r.titulo,
    descricao: r.descricao,
    status: 'rascunho',
    origem: 'whatsapp',
    aba: 'arena', // WhatsApp sempre cai em "Notícias do Vale"
    tipo_midia: r.tipo_midia,
    imagem_url,
    video_url,
    video_expira_em: video_url ? new Date(Date.now() + dias * 86400000).toISOString() : null,
    video_link: r.video_link,
    video_servico: r.video_link ? servicoDoLink(r.video_link) : null,
    fonte: GUARDAR_FONTE ? null : null,
    whatsapp_message_ref: r.ref,
    created_by: perfilId,
  };

  const criado = await p.inserirRascunho(dados);
  if (criado === 'duplicado') return;

  const link = `${origem}/coordenador?aba=noticias&editar=${criado.id}`;

  if (erroVideo) {
    const plano = r.video_link ? 'Ele vai tocar pelo link original.' : 'Envie o vídeo pelo painel antes de publicar.';
    await p.enviarMensagem(phone, `Rascunho criado, mas não consegui guardar o vídeo. ${plano}\n${link}`);
    return;
  }

  let msg_resposta = 'Rascunho criado ✅';
  if (erroMidia) msg_resposta = 'Rascunho criado sem foto.';
  else if (r.tipo_midia === 'video' && !video_url) {
    if (modo === 'so_link' && !r.video_link) msg_resposta = 'Rascunho criado ✅ — falta o link do vídeo. Cole no painel antes de publicar.';
    else if (r.video_link) msg_resposta = 'Rascunho criado ✅ — vídeo vai tocar pelo link original.';
    else msg_resposta = `Rascunho criado ✅ — vídeo acima de ${LIMITE_VIDEO / 1024 / 1024} MB. Envie pelo painel ou cole o link.`;
  }

  await p.enviarMensagem(phone, `${msg_resposta}\n${link}`);
}
