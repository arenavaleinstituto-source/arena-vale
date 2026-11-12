import { buscarItemAgenda } from '@/lib/midia/agenda';
import { gerarIcs } from '@/lib/midia/lembrete';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lembrete do jogo para a agenda do celular (.ics). */
export async function GET(request: Request) {
  const u = new URL(request.url);
  const origem = u.searchParams.get('origem');
  const id = u.searchParams.get('id') ?? '';
  if ((origem !== 'jogos' && origem !== 'agenda') || !UUID.test(id)) {
    return new Response('Pedido inválido', { status: 400 });
  }
  const item = await buscarItemAgenda(origem, id).catch(() => null);
  if (!item) return new Response('Jogo não encontrado', { status: 404 });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.arenavale.com.br';
  return new Response(gerarIcs(item, baseUrl), {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': 'attachment; filename="jogo-arena-vale.ics"',
      'cache-control': 'public, max-age=300',
    },
  });
}
