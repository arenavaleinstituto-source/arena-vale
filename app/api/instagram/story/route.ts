import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { publicarStory, type NoticiaStory } from '@/lib/instagram/story';
import { portasStory } from '@/lib/instagram/portas';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/instagram/story { id } — posta a notícia publicada como Story no Instagram (só coordenação).
 * Vídeo pode demorar: responde "processando" e o painel chama de novo até publicar.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ status: 'erro', erro: 'Entre de novo no painel.' }, { status: 401 });
  const { data: perfil } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (perfil?.role !== 'coordenador') return NextResponse.json({ status: 'erro', erro: 'Sem permissão.' }, { status: 403 });

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ status: 'erro', erro: 'Notícia não informada.' }, { status: 400 });

  const admin = createAdminClient();
  const { data: n } = await admin
    .from('noticias')
    .select('id, status, video_url, imagem_url, story_status, story_container_id')
    .eq('id', id)
    .single();
  if (!n) return NextResponse.json({ status: 'erro', erro: 'Notícia não encontrada.' }, { status: 404 });
  if (n.status !== 'publicado') return NextResponse.json({ status: 'erro', erro: 'Publique a notícia antes de postar o Story.' }, { status: 400 });

  try {
    return NextResponse.json(await publicarStory(n as NoticiaStory, portasStory(admin), 45000));
  } catch (e) {
    console.error('[instagram] falha no Story', e);
    return NextResponse.json({ status: 'erro', erro: 'Falha ao falar com o Instagram.' });
  }
}
