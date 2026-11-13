import { carimbarLogo } from '@/lib/imagem/marca';
import { montarParceiro } from '@/lib/imagem/parceiro';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Arquivo, PortasBot } from './processar';
import type { ModoVideo } from '@/lib/midia/noticias';
import { jogosRecentes } from '@/lib/midia/agenda';
import { guardarFotoNoAlbum } from '@/lib/midia/galeria-guardar';
import type { EstadoBot } from './galeria';

/** Chamada à API de bots do Telegram. O token vem só do ambiente do servidor. */
async function tg<T>(metodo: string, corpo: Record<string, unknown>): Promise<T | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/${metodo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(15000),
    });
    const j = (await r.json()) as { ok: boolean; result?: T };
    return j.ok ? (j.result ?? null) : null;
  } catch {
    return null;
  }
}

const EXT_MIME: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', mp4: 'video/mp4', mov: 'video/quicktime', gif: 'image/gif' };

/** Liga o bot ao Supabase (service role, só no servidor) e à API do Telegram. */
export function portasBot(admin: SupabaseClient): PortasBot {
  return {
    async perfilPorTelegram(telegramId) {
      const { data } = await admin.from('profiles').select('id, role').eq('telegram_user_id', telegramId).maybeSingle();
      return (data as { id: string; role: string } | null) ?? null;
    },
    async vincularCodigo(codigo, telegramId) {
      const agora = new Date();
      const { data: t } = await admin.from('telegram_tentativas_vinculo').select('falhas, bloqueado_ate').eq('telegram_user_id', telegramId).maybeSingle();
      const tent = t as { falhas: number; bloqueado_ate: string | null } | null;
      if (tent?.bloqueado_ate && Date.parse(tent.bloqueado_ate) > agora.getTime()) return 'bloqueado';

      const { data } = await admin.from('telegram_codigos_vinculo').select('profile_id').eq('codigo', codigo).gt('expira_em', agora.toISOString()).maybeSingle();
      const perfil = (data as { profile_id: string } | null)?.profile_id;
      if (!perfil) {
        const falhas = (tent?.bloqueado_ate ? 0 : (tent?.falhas ?? 0)) + 1;
        await admin.from('telegram_tentativas_vinculo').upsert({
          telegram_user_id: telegramId,
          falhas: falhas >= 5 ? 0 : falhas,
          bloqueado_ate: falhas >= 5 ? new Date(agora.getTime() + 3600_000).toISOString() : null,
        });
        return 'invalido';
      }
      await admin.from('profiles').update({ telegram_user_id: null }).eq('telegram_user_id', telegramId);
      const { error } = await admin.from('profiles').update({ telegram_user_id: telegramId }).eq('id', perfil);
      await admin.from('telegram_codigos_vinculo').delete().eq('codigo', codigo);
      await admin.from('telegram_tentativas_vinculo').delete().eq('telegram_user_id', telegramId);
      return error ? 'invalido' : 'ok';
    },
    async modoVideo() {
      const { data } = await admin.from('proprietario').select('modo_video, dias_validade_video').limit(1).maybeSingle();
      const d = data as { modo_video?: ModoVideo; dias_validade_video?: number } | null;
      return { modo: d?.modo_video === 'so_link' ? 'so_link' : 'guardar_arquivo', dias: d?.dias_validade_video ?? 30 };
    },
    async baixarArquivo(fileId, limiteBytes): Promise<Arquivo | null> {
      const info = await tg<{ file_path?: string; file_size?: number }>('getFile', { file_id: fileId });
      if (!info?.file_path || (info.file_size ?? 0) > limiteBytes) return null;
      try {
        const r = await fetch(`https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${info.file_path}`, { signal: AbortSignal.timeout(40000) });
        if (!r.ok) return null;
        const bytes = new Uint8Array(await r.arrayBuffer());
        if (bytes.byteLength > limiteBytes) return null;
        const ext = (info.file_path.split('.').pop() ?? 'bin').toLowerCase();
        return { bytes, ext, mime: EXT_MIME[ext] ?? r.headers.get('content-type') ?? 'application/octet-stream' };
      } catch {
        return null;
      }
    },
    async guardarArquivo(caminho, bytes, mime) {
      const { error } = await admin.storage.from('noticias').upload(caminho, bytes, { contentType: mime, upsert: true });
      if (error) throw new Error(error.message);
      return admin.storage.from('noticias').getPublicUrl(caminho).data.publicUrl;
    },
    async inserirRascunho(dados) {
      let { data, error } = await admin.from('noticias').insert(dados).select('id').single();
      // Banco ainda sem a coluna "confronto" (0017): grava sem ela.
      if (error && /confronto/.test(error.message) && 'confronto' in dados) {
        const { confronto: _semColuna, ...resto } = dados;
        void _semColuna;
        ({ data, error } = await admin.from('noticias').insert(resto).select('id').single());
      }
      if (error?.code === '23505') return 'duplicado';
      if (error || !data) throw new Error(error?.message ?? 'falha ao gravar');
      return { id: (data as { id: string }).id };
    },
    async carimbar(arq) {
      return { bytes: await carimbarLogo(arq.bytes), ext: 'jpg', mime: 'image/jpeg' };
    },
    async montarParceiro(arq, perfil) {
      return { bytes: await montarParceiro(arq.bytes, perfil), ext: 'jpg', mime: 'image/jpeg' };
    },
    async completarAlbum(ref, titulo, descricao) {
      await admin
        .from('noticias')
        .update({ titulo, descricao })
        .eq('telegram_message_ref', ref)
        .eq('status', 'rascunho')
        .eq('titulo', 'Notícia do Telegram');
    },
    async enviarMensagem(chatId, texto) {
      await tg('sendMessage', { chat_id: chatId, text: texto, disable_web_page_preview: true });
    },

    // ── Galeria (Fase 4A) ──
    async lerEstado(telegramId): Promise<EstadoBot> {
      const { data } = await admin
        .from('telegram_estado')
        .select('modo, album_id, expira_em, ultimo_grupo, album:album_id(titulo)')
        .eq('telegram_user_id', telegramId)
        .maybeSingle();
      const d = data as {
        modo: EstadoBot['modo'];
        album_id: string | null;
        expira_em: string | null;
        ultimo_grupo: string | null;
        album: { titulo?: string } | null;
      } | null;
      if (!d) return { modo: 'noticias', albumId: null, albumTitulo: null, expiraEm: null, ultimoGrupo: null };
      return { modo: d.modo, albumId: d.album_id, albumTitulo: d.album?.titulo ?? null, expiraEm: d.expira_em, ultimoGrupo: d.ultimo_grupo };
    },
    async gravarEstado(telegramId, e) {
      const { error } = await admin.from('telegram_estado').upsert({
        telegram_user_id: telegramId,
        modo: e.modo,
        album_id: e.albumId,
        expira_em: e.expiraEm,
        ultimo_grupo: e.ultimoGrupo ?? null,
      });
      if (error) throw new Error(error.message);
    },
    async renovarPrazo(telegramId, expiraEm) {
      await admin.from('telegram_estado').update({ expira_em: expiraEm }).eq('telegram_user_id', telegramId);
    },
    async marcarGrupo(telegramId, grupo) {
      const g = grupo.replace(/[^\w-]/g, '');
      const { data } = await admin
        .from('telegram_estado')
        .update({ ultimo_grupo: g })
        .eq('telegram_user_id', telegramId)
        .or(`ultimo_grupo.is.null,ultimo_grupo.neq.${g}`)
        .select('telegram_user_id');
      return (data?.length ?? 0) > 0;
    },
    async jogosRecentes() {
      return jogosRecentes(3, new Date(), admin);
    },
    async albumDoJogo(origem, jogoRef, titulo, data, perfilId, detalhes) {
      const buscar = async () =>
        (await admin.from('galeria_albuns').select('id, titulo').eq('origem', origem).eq('jogo_ref', jogoRef).maybeSingle()).data as {
          id: string;
          titulo: string;
        } | null;
      const existente = await buscar();
      if (existente) return existente;
      const { data: novo, error } = await admin
        .from('galeria_albuns')
        .insert({ titulo, data, origem, jogo_ref: jogoRef, criado_por: perfilId, ativo: false, ...(detalhes ?? {}) })
        .select('id, titulo')
        .single();
      if (error?.code === '23505') {
        const outro = await buscar();
        if (outro) return outro;
      }
      if (error || !novo) throw new Error(error?.message ?? 'falha ao criar álbum');
      return novo as { id: string; titulo: string };
    },
    async criarAlbumEvento(titulo, data, perfilId) {
      const { data: novo, error } = await admin.from('galeria_albuns').insert({ titulo, data, criado_por: perfilId, ativo: false }).select('id, titulo').single();
      if (error || !novo) throw new Error(error?.message ?? 'falha ao criar álbum');
      return novo as { id: string; titulo: string };
    },
    async guardarFotoGaleria(albumId, bytes, perfilId) {
      const { data: album } = await admin.from('galeria_albuns').select('id, capa_url').eq('id', albumId).maybeSingle();
      if (!album) throw new Error('álbum não existe');
      await guardarFotoNoAlbum(admin, album as { id: string; capa_url: string | null }, bytes, perfilId);
    },
    async enviarBotoes(chatId, texto, botoes) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: texto,
        reply_markup: { inline_keyboard: botoes.map((linha) => linha.map((b) => ({ text: b.texto, callback_data: b.dados }))) },
      });
    },
    async responderBotao(callbackId) {
      await tg('answerCallbackQuery', { callback_query_id: callbackId });
    },
    async albumPublicado(albumId) {
      const { data } = await admin.from('galeria_albuns').select('ativo').eq('id', albumId).maybeSingle();
      return Boolean((data as { ativo?: boolean } | null)?.ativo);
    },
    async galeriaAtiva() {
      const { error } = await admin.from('galeria_albuns').select('id').limit(1);
      return !error;
    },
  };
}
