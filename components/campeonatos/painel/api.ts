import type { FormaDisputa, JogoGerado } from '@/lib/campeonatos/tipos';

export type CorpoGerar = { forma: FormaDisputa; grupos?: Record<string, string[]>; sementes?: string[]; formaMudou?: boolean; simular: boolean };
export type RespostaGerar = { ok: true; jogos: JogoGerado[]; avisos: string[] } | { ok: false; erro: string };

/** Chama a rota que gera (ou simula) os jogos do campeonato. */
export async function gerarJogos(campeonatoId: string, corpo: CorpoGerar): Promise<RespostaGerar> {
  try {
    const r = await fetch(`/api/campeonatos/${campeonatoId}/gerar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    const j = (await r.json()) as RespostaGerar;
    return j?.ok ? j : { ok: false, erro: (j as { erro?: string })?.erro ?? 'Não consegui gerar os jogos.' };
  } catch {
    return { ok: false, erro: 'Não consegui falar com o site. Verifique a conexão.' };
  }
}

/** Recalcula as vagas depois de mudar um resultado; devolve os avisos (vazio se falhar). */
export async function recalcularVagas(campeonatoId: string): Promise<string[]> {
  try {
    const r = await fetch(`/api/campeonatos/${campeonatoId}/recalcular`, { method: 'POST' });
    const j = (await r.json()) as { ok?: boolean; avisos?: string[] };
    return j?.avisos ?? [];
  } catch {
    return [];
  }
}

/** Envia o escudo (PNG já enquadrado) do campeonato ou do time. */
export async function enviarEscudo(destino: 'campeonatos' | 'times', id: string, png: Blob, cor?: string): Promise<{ ok: true; url: string } | { ok: false; erro: string }> {
  const fd = new FormData();
  fd.set('arquivo', png, 'escudo.png');
  if (cor) fd.set('cor', cor);
  try {
    const r = await fetch(`/api/${destino}/${id}/escudo`, { method: 'POST', body: fd });
    const j = (await r.json()) as { ok?: boolean; url?: string; erro?: string };
    return j?.ok && j.url ? { ok: true, url: j.url } : { ok: false, erro: j?.erro ?? 'Não consegui enviar o escudo.' };
  } catch {
    return { ok: false, erro: 'Não consegui enviar o escudo. Verifique a conexão.' };
  }
}
