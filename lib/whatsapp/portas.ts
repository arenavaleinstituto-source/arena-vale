import { carimbarLogo } from '@/lib/imagem/marca';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Arquivo, PortasWA } from './processar';
import type { ModoVideo } from '@/lib/midia/noticias';

const EXT_DE_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/3gpp': '3gp',
};

/** Chamada à Graph API do Meta (WhatsApp Cloud API). */
async function graph<T>(url: string): Promise<T | null> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) return null;
  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

/** Envia mensagem via Cloud API. */
async function enviarWA(corpo: Record<string, unknown>): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return;
  try {
    await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    // falha silenciosa — log feito pelo chamador se necessário
  }
}

/** Liga o bot ao Supabase (service role, só no servidor) e à Graph API do Meta. */
export function portasWA(admin: SupabaseClient): PortasWA {
  return {
    async perfilPorTelefone(phone) {
      const { data } = await admin.from('profiles').select('id, role').eq('whatsapp_phone', phone).maybeSingle();
      return (data as { id: string; role: string } | null) ?? null;
    },

    async vincularCodigo(codigo, phone) {
      const agora = new Date();
      const { data: t } = await admin
        .from('whatsapp_tentativas_vinculo')
        .select('falhas, bloqueado_ate')
        .eq('whatsapp_phone', phone)
        .maybeSingle();
      const tent = t as { falhas: number; bloqueado_ate: string | null } | null;
      if (tent?.bloqueado_ate && Date.parse(tent.bloqueado_ate) > agora.getTime()) return 'bloqueado';

      const { data } = await admin
        .from('whatsapp_codigos_vinculo')
        .select('profile_id')
        .eq('codigo', codigo)
        .gt('expira_em', agora.toISOString())
        .maybeSingle();
      const perfil = (data as { profile_id: string } | null)?.profile_id;
      if (!perfil) {
        const falhas = (tent?.bloqueado_ate ? 0 : (tent?.falhas ?? 0)) + 1;
        await admin.from('whatsapp_tentativas_vinculo').upsert({
          whatsapp_phone: phone,
          falhas: falhas >= 5 ? 0 : falhas,
          bloqueado_ate: falhas >= 5 ? new Date(agora.getTime() + 3600_000).toISOString() : null,
        });
        return 'invalido';
      }
      // Desvincula o número de outra conta, se já estiver associado.
      await admin.from('profiles').update({ whatsapp_phone: null }).eq('whatsapp_phone', phone);
      const { error } = await admin.from('profiles').update({ whatsapp_phone: phone }).eq('id', perfil);
      await admin.from('whatsapp_codigos_vinculo').delete().eq('codigo', codigo);
      await admin.from('whatsapp_tentativas_vinculo').delete().eq('whatsapp_phone', phone);
      return error ? 'invalido' : 'ok';
    },

    async modoVideo() {
      const { data } = await admin.from('proprietario').select('modo_video, dias_validade_video').limit(1).maybeSingle();
      const d = data as { modo_video?: ModoVideo; dias_validade_video?: number } | null;
      return { modo: d?.modo_video === 'so_link' ? 'so_link' : 'guardar_arquivo', dias: d?.dias_validade_video ?? 30 };
    },

    async baixarArquivo(mediaId, limiteBytes): Promise<Arquivo | null> {
      // Passo 1: busca o endereço da mídia na Graph API.
      const info = await graph<{ url?: string; mime_type?: string; file_size?: number }>(
        `https://graph.facebook.com/v19.0/${mediaId}`,
      );
      if (!info?.url || (info.file_size ?? 0) > limiteBytes) return null;
      try {
        // Passo 2: baixa os bytes do endereço com o token de autorização.
        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        const r = await fetch(info.url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(40000),
        });
        if (!r.ok) return null;
        const bytes = new Uint8Array(await r.arrayBuffer());
        if (bytes.byteLength > limiteBytes) return null;
        const mime = info.mime_type ?? r.headers.get('content-type') ?? 'application/octet-stream';
        const ext = EXT_DE_MIME[mime] ?? mime.split('/')[1]?.split(';')[0] ?? 'bin';
        return { bytes, ext, mime };
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

    async carimbar(arq) {
      return { bytes: await carimbarLogo(arq.bytes), ext: 'jpg', mime: 'image/jpeg' };
    },

    async enviarMensagem(phone, texto) {
      await enviarWA({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: texto, preview_url: false },
      });
    },
  };
}
