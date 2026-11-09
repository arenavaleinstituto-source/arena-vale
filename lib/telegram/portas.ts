import type { SupabaseClient } from '@supabase/supabase-js';
import type { Arquivo, PortasBot } from './processar';
import type { ModoVideo } from '@/lib/midia/noticias';

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
      const { data } = await admin
        .from('telegram_codigos_vinculo')
        .select('profile_id')
        .eq('codigo', codigo)
        .gt('expira_em', new Date().toISOString())
        .maybeSingle();
      const perfil = (data as { profile_id: string } | null)?.profile_id;
      if (!perfil) return false;
      await admin.from('profiles').update({ telegram_user_id: null }).eq('telegram_user_id', telegramId);
      const { error } = await admin.from('profiles').update({ telegram_user_id: telegramId }).eq('id', perfil);
      await admin.from('telegram_codigos_vinculo').delete().eq('codigo', codigo);
      return !error;
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
        const r = await fetch(`https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${info.file_path}`, { signal: AbortSignal.timeout(60000) });
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
      const { data, error } = await admin.from('noticias').insert(dados).select('id').single();
      if (error?.code === '23505') return 'duplicado';
      if (error || !data) throw new Error(error?.message ?? 'falha ao gravar');
      return { id: (data as { id: string }).id };
    },
    async enviarMensagem(chatId, texto) {
      await tg('sendMessage', { chat_id: chatId, text: texto, disable_web_page_preview: true });
    },
  };
}
