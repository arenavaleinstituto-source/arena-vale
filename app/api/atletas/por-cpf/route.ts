import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cpfValido, formatarCpf, soDigitos } from '@/lib/atletas/cpf';

export const dynamic = 'force-dynamic';

type Linha = { id: string; nome: string; foto_url: string | null; time: { nome: string } | null };
type Inscricao = { campeonato: { nome: string } | null };

/**
 * GET /api/atletas/por-cpf?cpf=... — só para a coordenação: acha o atleta inscrito pelo CPF
 * e devolve nome, foto, time e o campeonato mais recente (o CPF não volta na resposta).
 * O CPF não é legível pela API pública (0012), por isso a busca é feita aqui, com service role.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: 'Entre de novo no painel.' }, { status: 401 });
  const { data: staff } = await supabase.rpc('is_staff');
  if (staff !== true) return NextResponse.json({ erro: 'Só a coordenação.' }, { status: 403 });

  const cpf = soDigitos(req.nextUrl.searchParams.get('cpf') ?? '');
  if (!cpfValido(cpf)) return NextResponse.json({ erro: 'CPF inválido.' }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('jogadores')
    .select('id,nome,foto_url,time:time_id(nome)')
    .in('cpf', [cpf, formatarCpf(cpf)])
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ erro: 'Não consegui buscar agora. Tente de novo.' }, { status: 500 });
  if (!data) return NextResponse.json({ erro: 'Nenhum atleta inscrito com esse CPF.' }, { status: 404 });
  const atleta = data as unknown as Linha;

  const { data: insc } = await admin
    .from('inscricao_atletas')
    .select('campeonato:campeonato_id(nome)')
    .eq('jogador_id', atleta.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    atleta: {
      nome: atleta.nome,
      foto_url: atleta.foto_url,
      time: atleta.time?.nome ?? null,
      campeonato: (insc as unknown as Inscricao | null)?.campeonato?.nome ?? null,
    },
  });
}
