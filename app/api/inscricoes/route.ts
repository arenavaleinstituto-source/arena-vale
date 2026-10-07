import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const CATEGORIAS = ['Sub-9','Sub-10','Sub-11','Sub-12','Sub-13','Sub-14','Sub-15','Sub-16','Sub-17','Sub-18','Sub-19','Sub-20'];

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const categoria = String(form.get('categoria') ?? '').trim();
    const atletas = JSON.parse(String(form.get('atletas') ?? '[]'));
    if (!CATEGORIAS.includes(categoria) || !Array.isArray(atletas) || atletas.length === 0) {
      return NextResponse.json({ ok: false, error: 'Informe uma categoria válida e pelo menos um atleta.' }, { status: 400 });
    }
    if (String(form.get('autorizacao_responsavel')) !== 'true') {
      return NextResponse.json({ ok: false, error: 'A autorização do responsável é obrigatória.' }, { status: 400 });
    }
    const admin = createAdminClient();
    const paths: string[] = [];
    const atletasComFotos = [];
    const requestId = crypto.randomUUID();
    for (let index = 0; index < atletas.length; index++) {
      const atleta = atletas[index];
      const foto = form.get(`foto_${index}`);
      let foto_path = null;
      if (foto instanceof File && foto.size > 0) {
        const ext = foto.name.split('.').pop()?.toLowerCase() || 'jpg';
        foto_path = `${requestId}/${index}.${ext}`;
        const upload = await admin.storage.from('atletas-privado').upload(foto_path, Buffer.from(await foto.arrayBuffer()), { contentType: foto.type || 'image/jpeg', upsert: false });
        if (upload.error) throw upload.error;
        paths.push(foto_path);
      }
      atletasComFotos.push({ ...atleta, foto_path });
    }
    const { data, error } = await admin.from('solicitacoes_inscricao').insert({
      equipe_nome: String(form.get('equipe_nome') ?? '').trim(),
      equipe_sigla: String(form.get('equipe_sigla') ?? '').trim() || null,
      cidade: String(form.get('cidade') ?? '').trim() || null,
      responsavel_nome: String(form.get('responsavel_nome') ?? '').trim(),
      responsavel_cpf: String(form.get('responsavel_cpf') ?? '').trim(),
      responsavel_email: String(form.get('responsavel_email') ?? '').trim(),
      responsavel_telefone: String(form.get('responsavel_telefone') ?? '').trim(),
      categoria,
      campeonato_id: String(form.get('campeonato_id') ?? '').trim() || null,
      atletas: atletasComFotos,
      fotos_paths: paths,
      autorizacao_responsavel: true,
      status: 'pendente'
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Não foi possível enviar a inscrição.' }, { status: 400 });
  }
}
