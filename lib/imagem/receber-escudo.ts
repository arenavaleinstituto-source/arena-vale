import type { SupabaseClient } from '@supabase/supabase-js';
import { prepararEscudo } from './escudo';

export const LIMITE_ESCUDO = 5 * 1024 * 1024;

/** Lê o campo `arquivo` do formulário e confere tamanho e tipo. */
export function lerArquivoDoFormulario(fd: FormData | null): { arquivo: Blob } | { erro: string } {
  const campo = fd?.get('arquivo');
  const arquivo = campo && typeof campo === 'object' && 'arrayBuffer' in campo ? (campo as Blob) : null;
  if (!arquivo || arquivo.size === 0) return { erro: 'Envie uma imagem.' };
  if (arquivo.size > LIMITE_ESCUDO) return { erro: 'A imagem passa de 5 MB.' };
  if (arquivo.type && !arquivo.type.startsWith('image/')) return { erro: 'O arquivo precisa ser uma imagem.' };
  return { arquivo };
}

/** Padroniza (512 px, PNG) e grava no bucket `campeonatos`; devolve o endereço público. */
export async function guardarEscudo(admin: SupabaseClient, pasta: 'campeonatos' | 'times', id: string, arquivo: Blob): Promise<string> {
  const bytes = await prepararEscudo(new Uint8Array(await arquivo.arrayBuffer()));
  // Date.now() no nome: o navegador não mostra o escudo antigo do cache.
  const caminho = `${pasta}/${id}-${Date.now()}.png`;
  const { error } = await admin.storage.from('campeonatos').upload(caminho, bytes, { contentType: 'image/png', upsert: true });
  if (error) throw new Error(error.message);
  return admin.storage.from('campeonatos').getPublicUrl(caminho).data.publicUrl;
}
