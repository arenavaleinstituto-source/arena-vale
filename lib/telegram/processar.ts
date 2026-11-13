/**
 * O que o bot faz com cada mensagem (spec 2026-11-08, seção 4.4; Fase 3, seção 10).
 * Fala com o banco e com o Telegram só pelas "portas", para poder ser testado sem eles.
 */
import { servicoDoLink } from '@/lib/midia/links';
import { extrairConfronto } from '@/lib/midia/confronto';
import type { ModoVideo } from '@/lib/midia/noticias';
import { comandoVincular, extrairRascunho, LIMITE_VIDEO, respostaRascunho, TITULO_PADRAO, type TgMessage } from './extrair';
import { tratarGaleria, type EstadoBot, type TgCallbackQuery } from './galeria';
import { extrairParceiro } from './parceiro';
import type { ItemAgenda } from '@/lib/midia/agenda';

export type Arquivo = { bytes: Uint8Array; ext: string; mime: string };

export type DadosRascunho = {
  titulo: string;
  descricao: string;
  status: 'rascunho';
  origem: 'telegram';
  aba: 'mundo' | 'arena';
  tipo_midia: 'foto' | 'video';
  imagem_url: string | null;
  video_url: string | null;
  video_expira_em: string | null;
  video_link: string | null;
  video_servico: string | null;
  fonte: string | null;
  telegram_message_ref: string;
  created_by: string;
  /** Times do jogo achados no texto (só vídeo). */
  confronto?: string | null;
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
  /** Põe a logo da ARENA VALE na imagem (devolve JPEG). */
  carimbar(arq: Arquivo): Promise<Arquivo>;

  // ── Galeria (Fase 4A) ──
  /** Modo do robô para a pessoa; sem linha → notícias. */
  lerEstado(telegramId: number): Promise<EstadoBot>;
  gravarEstado(telegramId: number, e: EstadoBot): Promise<void>;
  /** Só estende o prazo do modo galeria (não mexe no resto do estado). */
  renovarPrazo(telegramId: number, expiraEm: string): Promise<void>;
  /** Marca o álbum do Telegram como já respondido; true só para a primeira foto do grupo (atômico). */
  marcarGrupo(telegramId: number, grupo: string): Promise<boolean>;
  /** Jogos dos últimos 3 dias e de hoje, das duas fontes, até 8. */
  jogosRecentes(): Promise<ItemAgenda[]>;
  /** Cria o álbum do jogo ou devolve o que já existe. */
  albumDoJogo(
    origem: 'jogos' | 'agenda',
    jogoRef: string,
    titulo: string,
    data: string,
    perfilId: string,
    detalhes?: { competicao: string | null; local: string | null; placar: string | null },
  ): Promise<{ id: string; titulo: string }>;
  criarAlbumEvento(titulo: string, data: string, perfilId: string): Promise<{ id: string; titulo: string }>;
  /** Prepara (gira, reduz, logo), guarda no bucket `galeria` e registra a foto. */
  guardarFotoGaleria(albumId: string, bytes: Uint8Array, perfilId: string): Promise<void>;
  enviarBotoes(chatId: number, texto: string, botoes: { texto: string; dados: string }[][]): Promise<void>;
  responderBotao(callbackId: string): Promise<void>;
  /** false quando as tabelas da galeria ainda não existem. */
  galeriaAtiva(): Promise<boolean>;
  /** true quando o álbum já aparece no site. */
  albumPublicado(albumId: string): Promise<boolean>;
  /** Modo parceiro: logo da ARENA VALE + faixa "Foto e arte: @perfil" embaixo (devolve JPEG). */
  montarParceiro(arq: Arquivo, perfil: string): Promise<Arquivo>;
};

const LIMITE_FOTO = 5 * 1024 * 1024;

/** O dono pediu para não mostrar a fonte nas notícias do robô. Se algum canal reclamar, é só voltar para true. */
const GUARDAR_FONTE = false;

export async function processarUpdate(update: unknown, p: PortasBot, origem: string, agora: Date = new Date()): Promise<void> {
  const cb = (update as { callback_query?: TgCallbackQuery }).callback_query;
  if (cb?.from) {
    const perfilBotao = await p.perfilPorTelegram(cb.from.id);
    if (perfilBotao?.role === 'coordenador') await tratarGaleria(update, perfilBotao, p, origem, agora);
    else await p.responderBotao(cb.id);
    return;
  }

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
    // Em grupo, só responde a quem está vinculado (não fica avisando cada membro).
    if (msg.chat.type && msg.chat.type !== 'private' && !perfil) return;
    await p.enviarMensagem(chat, 'Você não tem permissão para criar notícias.');
    return;
  }

  try {
    if (await tratarGaleria(update, perfil, p, origem, agora)) return;
  } catch (e) {
    console.error('[telegram] falha na galeria', e);
    await p.enviarMensagem(chat, 'Não consegui fazer isso agora, tente de novo');
    return;
  }

  try {
    await criarRascunho(msg, chat, perfil.id, p, origem);
  } catch (e) {
    console.error('[telegram] falha ao criar rascunho', e);
    await p.enviarMensagem(chat, 'Não consegui criar o rascunho, tente de novo');
  }
}

async function criarRascunho(msgOriginal: TgMessage & { chat: { id: number } }, chat: number, perfilId: string, p: PortasBot, origem: string): Promise<void> {
  // Modo parceiro: "parceiro @perfil" sai do texto e vira o crédito da arte e a fonte.
  const parceiro = extrairParceiro(msgOriginal.text ?? msgOriginal.caption ?? '');
  const msg = parceiro
    ? { ...msgOriginal, ...(msgOriginal.text !== undefined ? { text: parceiro.texto } : { caption: parceiro.texto }) }
    : msgOriginal;
  const r = extrairRascunho(msg);
  const { modo, dias } = await p.modoVideo();
  const guardarVideo = Boolean(r.videoFileId) && modo === 'guardar_arquivo' && (r.videoTamanho ?? 0) <= LIMITE_VIDEO;
  // Vídeo demora para baixar: avisa logo, para ninguém achar que não chegou.
  if (guardarVideo && !r.mediaGroupId) await p.enviarMensagem(chat, 'Recebi o vídeo ⏳ guardando…');
  const base = `telegram/${chat}-${msg.message_id}`;
  let imagem_url: string | null = null;
  let video_url: string | null = null;
  let erroMidia = false;
  let erroVideo = false;

  // Cartaz: a foto, ou a miniatura do vídeo.
  const capaId = r.fotoFileId ?? r.thumbFileId;
  if (capaId) {
    try {
      const baixado = await p.baixarArquivo(capaId, LIMITE_FOTO);
      const marcar = (a: Arquivo) => (parceiro ? p.montarParceiro(a, parceiro.perfil) : p.carimbar(a));
      const arq = baixado && (await marcar(baixado).catch((e) => (console.error('[telegram] falha ao marcar a imagem', e), baixado)));
      if (arq) imagem_url = await p.guardarArquivo(`${base}${r.fotoFileId ? '' : '-capa'}.${arq.ext}`, arq.bytes, arq.mime);
      else if (r.fotoFileId) erroMidia = true;
    } catch (e) {
      console.error('[telegram] falha ao guardar a foto', e);
      if (r.fotoFileId) erroMidia = true;
    }
  }

  // Vídeo: só no modo "guardar arquivo" e até 20 MB.
  if (guardarVideo && r.videoFileId) {
    try {
      const arq = await p.baixarArquivo(r.videoFileId, LIMITE_VIDEO);
      if (arq) video_url = await p.guardarArquivo(`${base}.${arq.ext}`, arq.bytes, arq.mime);
      else erroVideo = true;
    } catch (e) {
      console.error('[telegram] falha ao guardar o vídeo', e);
      erroVideo = true;
    }
  }

  const dados: DadosRascunho = {
    titulo: r.titulo,
    descricao: r.descricao,
    status: 'rascunho',
    origem: 'telegram',
    aba: parceiro ? 'arena' : 'mundo',
    tipo_midia: r.tipo_midia,
    imagem_url,
    video_url,
    video_expira_em: video_url ? new Date(Date.now() + dias * 86400000).toISOString() : null,
    video_link: r.video_link,
    video_servico: r.video_link ? servicoDoLink(r.video_link) : null,
    // O crédito do parceiro sempre aparece, mesmo com GUARDAR_FONTE desligado.
    fonte: parceiro ? `@${parceiro.perfil}` : GUARDAR_FONTE ? r.fonte : null,
    // Álbum: a 1ª mensagem grava o grupo; as seguintes batem no único e são ignoradas.
    telegram_message_ref: r.mediaGroupId ? `grupo:${chat}:${r.mediaGroupId}` : r.ref,
    created_by: perfilId,
    ...(r.tipo_midia === 'video' ? { confronto: extrairConfronto(`${r.titulo} ${r.descricao}`) } : {}),
  };

  const criado = await p.inserirRascunho(dados);
  if (criado === 'duplicado') {
    // No álbum o texto vem em só uma das fotos: se for esta, completa o rascunho do grupo.
    if (r.mediaGroupId && r.titulo !== TITULO_PADRAO) await p.completarAlbum(dados.telegram_message_ref, r.titulo, r.descricao);
    return;
  }
  const link = `${origem}/coordenador?aba=noticias&editar=${criado.id}`;
  if (erroVideo) {
    const plano = r.video_link ? 'Ele vai tocar pelo link original.' : 'Envie o vídeo pelo painel antes de publicar.';
    await p.enviarMensagem(chat, `Rascunho criado, mas não consegui guardar o vídeo. ${plano}
${link}`);
    return;
  }
  const resposta = respostaRascunho(r, modo, Boolean(video_url), erroMidia, link);
  const avisoParceiro = parceiro ? `\nModo parceiro @${parceiro.perfil}: arte com crédito, na aba Notícias do Vale.` : '';
  await p.enviarMensagem(chat, resposta + avisoParceiro);
}
