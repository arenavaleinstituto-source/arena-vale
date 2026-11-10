import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { montarStory } from '@/lib/imagem/story';
import type { ContaInstagram, PortasStory } from './story';

const GRAPH = 'https://graph.instagram.com/v23.0';

type RespostaGraph = { id?: string; status_code?: string; access_token?: string; error?: { message?: string } };

async function graph(metodo: 'GET' | 'POST', caminho: string, params: Record<string, string>): Promise<RespostaGraph> {
  const corpo = new URLSearchParams(params);
  const r =
    metodo === 'GET'
      ? await fetch(`${GRAPH}/${caminho}?${corpo}`, { signal: AbortSignal.timeout(20000) })
      : await fetch(`${GRAPH}/${caminho}`, { method: 'POST', body: corpo, signal: AbortSignal.timeout(20000) });
  const json = (await r.json().catch(() => ({}))) as RespostaGraph;
  if (!r.ok || json.error) throw new Error(json.error?.message ?? `Instagram respondeu ${r.status}`);
  return json;
}

const hash = (t: string) => createHash('sha256').update(t).digest('hex');

/**
 * Conta do Instagram: a chave colada na Vercel (INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_USER_ID) entra no banco
 * na primeira vez — e de novo sempre que for trocada lá. Depois disso vale a do banco, que é renovada sozinha.
 */
export async function lerConta(admin: SupabaseClient): Promise<ContaInstagram | null> {
  const envToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const envUser = process.env.INSTAGRAM_USER_ID?.trim();
  const { data } = await admin.from('instagram_conta').select('ig_user_id, token, token_env_hash').eq('id', 'main').maybeSingle();
  if (envToken && envUser && data?.token_env_hash !== hash(envToken)) {
    await admin
      .from('instagram_conta')
      .upsert({ id: 'main', ig_user_id: envUser, token: envToken, token_env_hash: hash(envToken), renovado_em: new Date().toISOString() });
    return { userId: envUser, token: envToken };
  }
  if (data) return { userId: data.ig_user_id as string, token: data.token as string };
  return null;
}

/** A chave do Instagram vale 60 dias: renova se a última renovação tiver mais de 7 dias. */
export async function renovarChaveInstagram(admin: SupabaseClient): Promise<'renovada' | 'em_dia' | 'sem_conta'> {
  await lerConta(admin);
  const { data } = await admin.from('instagram_conta').select('token, renovado_em').eq('id', 'main').maybeSingle();
  if (!data) return 'sem_conta';
  if (Date.now() - new Date(data.renovado_em as string).getTime() < 7 * 86400000) return 'em_dia';
  const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(data.token as string)}`);
  const json = (await r.json().catch(() => ({}))) as RespostaGraph;
  if (!r.ok || !json.access_token) throw new Error(json.error?.message ?? 'Não consegui renovar a chave do Instagram.');
  await admin.from('instagram_conta').update({ token: json.access_token, renovado_em: new Date().toISOString() }).eq('id', 'main');
  return 'renovada';
}

/** Liga o Story ao Instagram, ao banco e ao armazenamento (service role, só no servidor). */
export function portasStory(admin: SupabaseClient): PortasStory {
  return {
    conta: () => lerConta(admin),
    async criarContainer(conta, midia) {
      const r = await graph('POST', `${conta.userId}/media`, { media_type: 'STORIES', ...midia, access_token: conta.token });
      if (!r.id) throw new Error('O Instagram não devolveu o envio.');
      return r.id;
    },
    async statusContainer(conta, id) {
      return (await graph('GET', id, { fields: 'status_code', access_token: conta.token })).status_code ?? 'IN_PROGRESS';
    },
    async publicarContainer(conta, id) {
      return (await graph('POST', `${conta.userId}/media_publish`, { creation_id: id, access_token: conta.token })).id ?? '';
    },
    async prepararImagem(noticiaId, capaUrl) {
      const r = await fetch(capaUrl, { signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw new Error('Não consegui abrir a foto da notícia.');
      const jpeg = await montarStory(new Uint8Array(await r.arrayBuffer()));
      const caminho = `instagram/${noticiaId}.jpg`;
      const { error } = await admin.storage.from('noticias').upload(caminho, jpeg, { contentType: 'image/jpeg', upsert: true });
      if (error) throw new Error(error.message);
      return `${admin.storage.from('noticias').getPublicUrl(caminho).data.publicUrl}?v=${Date.now()}`;
    },
    async salvar(noticiaId, campos) {
      await admin.from('noticias').update(campos).eq('id', noticiaId);
    },
    esperar: (ms) => new Promise((ok) => setTimeout(ok, ms)),
    agora: () => Date.now(),
  };
}
