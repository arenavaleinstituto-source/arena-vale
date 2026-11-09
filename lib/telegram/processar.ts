/**
 * O que o bot faz com cada mensagem (spec 2026-11-08, seção 4.4; Fase 3, seção 10).
 * Fala com o banco e com o Telegram só pelas "portas", para poder ser testado sem eles.
 */
import { servicoDoLink } from '@/lib/midia/links';
import type { ModoVideo } from '@/lib/midia/noticias';
import { comandoVincular, extrairRascunho, LIMITE_VIDEO, respostaRascunho, TITULO_PADRAO, type TgMessage } from './extrair';

export type Arquivo = { bytes: Uint8Array; ext: string; mime: string };

export type DadosRascunho = {
  titulo: string;
  descricao: string;
  status: 'rascunho';
  origem: 'telegram';
  aba: 'mundo';
  tipo_midia: 'foto' | 'video';
  imagem_url: string | null;
  video_url: string | null;
  video_expira_em: string | null;
  video_link: string | null;
  video_servico: string | null;
  fonte: string | null;
  telegram_message_ref: string;
  created_by: string;
};

export type PortasBot = {
  perfilPorTelegram(telegramId: number): Promise<{ id: string; role: string } | null>;
  /** Confere o código (válido e não vencido), grava o telegram_user_id e apaga o código. 5 erros bloqueiam por 1 h. */
  vincularCodigo(codigo: string, telegramId: number): Promise<'ok' | 'invalido' | 'bloqueado'>;
  modoVideo(): Promise<{ modo: ModoVideo; dias: number }>;
  /** Baixa pelo getFile; null se falhar ou passar do limite. */
  baixarArquivo(fileId: string, limiteBytes: number): Promise<Arquivo | null>;
  /** Envia ao bucket `noticias` e devolve o endereço público. */
  guardarArquivo(caminho: string, bytes: Uint8Array, mime: string): Promise<string>;
  /** 'duplicado' quando o telegram_message_ref já existe. */
  inserirRascunho(dados: DadosRascunho): Promise<{ id: string } | 'duplicado'>;
  enviarMensagem(chatId: number, texto: string): Promise<void>;
  /** Álbum: preenche título e texto do rascunho do grupo se ele ainda estiver com o título padrão. */
  completarAlbum(ref: string, titulo: string, descricao: string): Promise<void>;
};

const LIMITE_FOTO = 5 * 1024 * 1024;

export async function processarUpdate(update: unknown, p: PortasBot, origem: string): Promise<void> {
  const msg = (update as { message?: TgMessage }).message;
  if (!msg?.chat || !msg.from) return;
  const chat = msg.chat.id;

  const codigo = comandoVincular(msg.text ?? '');
  if (codigo) {
    const r = await p.vincularCodigo(codigo, msg.from.id);
    const resposta = {
      ok: 'Telegram vinculado ✅',
      invalido: 'Código inválido ou vencido. Gere outro no painel.',
      bloqueado: 'Muitas tentativas. Tente de novo em 1 hora.',
    } as const;
    await p.enviarMensagem(chat, resposta[r]);
    return;
  }

  const perfil = await p.perfilPorTelegram(msg.from.id);
  if (!perfil || perfil.role !== 'coordenador') {
    await p.enviarMensagem(chat, 'Você não tem permissão para criar notícias.');
    return;
  }

  const r = extrairRascunho(msg);
  const { modo, dias } = await p.modoVideo();
  const base = `telegram/${chat}-${msg.message_id}`;
  let imagem_url: string | null = null;
  let video_url: string | null = null;
  let erroMidia = false;

  // Cartaz: a foto, ou a miniatura do vídeo.
  const capaId = r.fotoFileId ?? r.thumbFileId;
  if (capaId) {
    const arq = await p.baixarArquivo(capaId, LIMITE_FOTO);
    if (arq) imagem_url = await p.guardarArquivo(`${base}${r.fotoFileId ? '' : '-capa'}.${arq.ext}`, arq.bytes, arq.mime);
    else if (r.fotoFileId) erroMidia = true;
  }

  // Vídeo: só no modo "guardar arquivo" e até 20 MB.
  if (r.videoFileId && modo === 'guardar_arquivo' && (r.videoTamanho ?? 0) <= LIMITE_VIDEO) {
    const arq = await p.baixarArquivo(r.videoFileId, LIMITE_VIDEO);
    if (arq) video_url = await p.guardarArquivo(`${base}.${arq.ext}`, arq.bytes, arq.mime);
  }

  const dados: DadosRascunho = {
    titulo: r.titulo,
    descricao: r.descricao,
    status: 'rascunho',
    origem: 'telegram',
    aba: 'mundo',
    tipo_midia: r.tipo_midia,
    imagem_url,
    video_url,
    video_expira_em: video_url ? new Date(Date.now() + dias * 86400000).toISOString() : null,
    video_link: r.video_link,
    video_servico: r.video_link ? servicoDoLink(r.video_link) : null,
    fonte: r.fonte,
    // Álbum: a 1ª mensagem grava o grupo; as seguintes batem no único e são ignoradas.
    telegram_message_ref: r.mediaGroupId ? `grupo:${chat}:${r.mediaGroupId}` : r.ref,
    created_by: perfil.id,
  };

  let criado: { id: string } | 'duplicado';
  try {
    criado = await p.inserirRascunho(dados);
  } catch {
    await p.enviarMensagem(chat, 'Não consegui criar o rascunho, tente de novo');
    return;
  }
  if (criado === 'duplicado') {
    // No álbum o texto vem em só uma das fotos: se for esta, completa o rascunho do grupo.
    if (r.mediaGroupId && r.titulo !== TITULO_PADRAO) await p.completarAlbum(dados.telegram_message_ref, r.titulo, r.descricao);
    return;
  }
  await p.enviarMensagem(chat, respostaRascunho(r, modo, Boolean(video_url), erroMidia, `${origem}/coordenador?aba=noticias&editar=${criado.id}`));
}
