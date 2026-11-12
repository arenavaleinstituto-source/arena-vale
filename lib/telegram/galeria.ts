/**
 * Galeria pelo robô (spec Fase 4A, seção 4.3): /fotos → escolhe o jogo (ou evento) →
 * modo galeria por 30 min → fotos vão para o álbum → /pronto devolve o link.
 */
import { diaBrasilia, rotuloJogo } from '@/lib/midia/jogo-rotulo';
import type { PortasBot } from './processar';
import type { TgMessage } from './extrair';

export type EstadoBot = {
  modo: 'noticias' | 'galeria' | 'nome_evento';
  albumId: string | null;
  albumTitulo?: string | null;
  expiraEm: string | null;
  ultimoGrupo?: string | null;
};

export type TgCallbackQuery = {
  id: string;
  from: { id: number };
  message?: { message_id: number; chat: { id: number } };
  data?: string;
};

const PRAZO_MS = 30 * 60 * 1000;
/** getFile do Telegram baixa até 20 MB. */
const LIMITE_FOTO_GALERIA = 20 * 1024 * 1024;
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const RE_BOTAO_JOGO = new RegExp(`^g:([ja]):(${UUID})$`, 'i');

const MSG = {
  pergunta: 'De qual jogo são as fotos?',
  inativa: 'A galeria ainda não foi ativada',
  podeMandar: 'Pode mandar as fotos 📸 (envie /pronto quando terminar)',
  nomeEvento: 'Qual o nome do evento?',
  nomeCurto: 'O nome precisa ter pelo menos 3 letras',
  cancelado: 'Ok, cancelado.',
  soFotos: 'Na galeria só vão fotos. Para notícia, envie /pronto antes',
  falhaFoto: 'Não consegui guardar uma foto, tente de novo',
  jogoSumiu: 'Não achei esse jogo. Envie /fotos de novo.',
  nadaAberto: 'Nenhum envio de fotos aberto. Para começar, envie /fotos.',
  modoGaleria: 'Estou no modo galeria: mande as fotos ou envie /pronto.',
  primeiroNome: 'Antes das fotos, me diga o nome do evento.',
} as const;

const ehComando = (texto: string | undefined, nome: string) => new RegExp(`^/${nome}(@\\w+)?$`, 'i').test((texto ?? '').trim());

function vencido(e: EstadoBot, agora: Date): boolean {
  return !e.expiraEm || Date.parse(e.expiraEm) <= agora.getTime();
}

const NOTICIAS: EstadoBot = { modo: 'noticias', albumId: null, albumTitulo: null, expiraEm: null, ultimoGrupo: null };

/** Foto (maior tamanho) ou documento de imagem da mensagem. */
function arquivoDeFoto(msg: TgMessage): string | null {
  if (msg.photo?.length) return msg.photo[msg.photo.length - 1].file_id;
  if (msg.document && (msg.document.mime_type ?? '').startsWith('image/')) return msg.document.file_id;
  return null;
}

async function abrirGaleria(
  p: PortasBot,
  telegramId: number,
  chat: number,
  album: { id: string; titulo: string },
  agora: Date,
): Promise<void> {
  await p.gravarEstado(telegramId, {
    modo: 'galeria',
    albumId: album.id,
    albumTitulo: album.titulo,
    expiraEm: new Date(agora.getTime() + PRAZO_MS).toISOString(),
    ultimoGrupo: null,
  });
  await p.enviarMensagem(chat, MSG.podeMandar);
}

async function tratarBotao(cb: TgCallbackQuery, perfilId: string, p: PortasBot, agora: Date): Promise<void> {
  await p.responderBotao(cb.id);
  const chat = cb.message?.chat.id ?? cb.from.id;
  const dados = cb.data ?? '';
  if (dados === 'g:cancelar') {
    await p.gravarEstado(cb.from.id, NOTICIAS);
    await p.enviarMensagem(chat, MSG.cancelado);
    return;
  }
  if (dados === 'g:outro') {
    await p.gravarEstado(cb.from.id, { ...NOTICIAS, modo: 'nome_evento', expiraEm: new Date(agora.getTime() + PRAZO_MS).toISOString() });
    await p.enviarMensagem(chat, MSG.nomeEvento);
    return;
  }
  const m = dados.match(RE_BOTAO_JOGO);
  if (!m) return;
  const origem = m[1].toLowerCase() === 'j' ? 'jogos' : 'agenda';
  const jogo = (await p.jogosRecentes()).find((j) => j.origem === origem && j.id.toLowerCase() === m[2].toLowerCase());
  if (!jogo) {
    await p.enviarMensagem(chat, MSG.jogoSumiu);
    return;
  }
  const titulo = `${jogo.casa} x ${jogo.fora}`.slice(0, 80);
  const album = await p.albumDoJogo(origem, jogo.id, titulo, diaBrasilia(Date.parse(jogo.dataHora)), perfilId);
  await abrirGaleria(p, cb.from.id, chat, album, agora);
}

async function guardarFoto(msg: TgMessage, fileId: string, estado: EstadoBot, perfilId: string, p: PortasBot, agora: Date): Promise<void> {
  const telegramId = msg.from!.id;
  const chat = msg.chat.id;
  await p.renovarPrazo(telegramId, new Date(agora.getTime() + PRAZO_MS).toISOString());
  // Álbum do Telegram: marca o grupo antes de guardar, para só uma das fotos responder.
  const responder = msg.media_group_id ? await p.marcarGrupo(telegramId, msg.media_group_id) : true;
  try {
    const arq = await p.baixarArquivo(fileId, LIMITE_FOTO_GALERIA);
    if (!arq) throw new Error('download falhou');
    await p.guardarFotoGaleria(estado.albumId!, arq.bytes, perfilId);
  } catch (e) {
    console.error('[telegram] falha ao guardar foto da galeria', e);
    await p.enviarMensagem(chat, MSG.falhaFoto);
    return;
  }
  if (responder) await p.enviarMensagem(chat, `✅ Foto guardada no álbum ${estado.albumTitulo ?? ''}`.trim());
}

/**
 * Trata o que for da galeria. Devolve true quando o update foi consumido aqui;
 * false deixa seguir o fluxo de notícia.
 */
export async function tratarGaleria(
  update: unknown,
  perfil: { id: string; role: string },
  p: PortasBot,
  origem: string,
  agora: Date,
): Promise<boolean> {
  const cb = (update as { callback_query?: TgCallbackQuery }).callback_query;
  if (cb) {
    await tratarBotao(cb, perfil.id, p, agora);
    return true;
  }
  const msg = (update as { message?: TgMessage }).message;
  if (!msg?.from) return false;
  const chat = msg.chat.id;
  const telegramId = msg.from.id;

  if (ehComando(msg.text, 'fotos')) {
    if (!(await p.galeriaAtiva())) {
      await p.enviarMensagem(chat, MSG.inativa);
      return true;
    }
    const jogos = await p.jogosRecentes();
    const botoes = [
      ...jogos.map((j) => [{ texto: rotuloJogo(j), dados: `g:${j.origem === 'jogos' ? 'j' : 'a'}:${j.id}` }]),
      [
        { texto: 'Outro evento', dados: 'g:outro' },
        { texto: 'Cancelar', dados: 'g:cancelar' },
      ],
    ];
    await p.enviarBotoes(chat, MSG.pergunta, botoes);
    return true;
  }

  const estado = await p.lerEstado(telegramId);
  const pronto = ehComando(msg.text, 'pronto');

  if (estado.modo === 'noticias' || vencido(estado, agora)) {
    if (!pronto) return false;
    if (estado.modo === 'galeria' && estado.albumId) {
      await p.gravarEstado(telegramId, NOTICIAS);
      await p.enviarMensagem(chat, `Álbum pronto: ${origem}/galeria/${estado.albumId}`);
    } else {
      await p.enviarMensagem(chat, MSG.nadaAberto);
    }
    return true;
  }

  if (estado.modo === 'nome_evento') {
    if (pronto) {
      await p.gravarEstado(telegramId, NOTICIAS);
      await p.enviarMensagem(chat, MSG.cancelado);
      return true;
    }
    const nome = (msg.text ?? '').trim();
    if (!nome) {
      await p.enviarMensagem(chat, MSG.primeiroNome);
      return true;
    }
    if (nome.length < 3) {
      await p.enviarMensagem(chat, MSG.nomeCurto);
      return true;
    }
    const album = await p.criarAlbumEvento(nome.slice(0, 80), diaBrasilia(agora.getTime()), perfil.id);
    await abrirGaleria(p, telegramId, chat, album, agora);
    return true;
  }

  // modo galeria, dentro do prazo
  if (pronto) {
    await p.gravarEstado(telegramId, NOTICIAS);
    await p.enviarMensagem(chat, `Álbum pronto: ${origem}/galeria/${estado.albumId}`);
    return true;
  }
  const fileId = arquivoDeFoto(msg);
  if (fileId) {
    await guardarFoto(msg, fileId, estado, perfil.id, p, agora);
    return true;
  }
  if (msg.video || msg.animation || (msg.document && !(msg.document.mime_type ?? '').startsWith('image/'))) {
    await p.enviarMensagem(chat, MSG.soFotos);
    return true;
  }
  await p.enviarMensagem(chat, MSG.modoGaleria);
  return true;
}
