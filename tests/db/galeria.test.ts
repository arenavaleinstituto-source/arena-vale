import { beforeEach, describe, expect, it } from 'vitest';
import pg from 'pg';
import { carregarEnvTeste } from '../../scripts/db/teste-env';
import { admin, clienteComo, criarUsuario, limparCoordenadores, visitante } from './fixtures';

const env = carregarEnvTeste();

async function consultar<T>(sql: string): Promise<T[]> {
  const cli = new pg.Client({ connectionString: env.databaseUrl, ssl: { rejectUnauthorized: false } });
  await cli.connect();
  try {
    return (await cli.query(sql)).rows as T[];
  } finally {
    await cli.end();
  }
}

async function criarAlbum(p: { titulo: string; ativo?: boolean; origem?: string | null; jogo_ref?: string | null }) {
  const { data, error } = await admin()
    .from('galeria_albuns')
    .insert({ data: '2026-11-15', ativo: true, ...p })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  const foto = await admin()
    .from('galeria_fotos')
    .insert({ album_id: data.id, url: 'https://x.test/g.jpg', miniatura_url: 'https://x.test/m.jpg', largura: 2000, altura: 1500 });
  if (foto.error) throw new Error(foto.error.message);
  return data.id as string;
}

describe('galeria (0019)', () => {
  beforeEach(async () => {
    await limparCoordenadores();
    await admin().from('galeria_albuns').delete().not('id', 'is', null);
  });

  it('visitante lê álbum ativo e as fotos dele', async () => {
    const id = await criarAlbum({ titulo: 'Final Sub-11' });
    const { data: albuns } = await visitante().from('galeria_albuns').select('id');
    expect(albuns?.map((a) => a.id)).toEqual([id]);
    const { data: fotos } = await visitante().from('galeria_fotos').select('id').eq('album_id', id);
    expect(fotos).toHaveLength(1);
  });

  it('visitante não lê álbum escondido nem as fotos dele', async () => {
    const id = await criarAlbum({ titulo: 'Escondido', ativo: false });
    const { data: albuns } = await visitante().from('galeria_albuns').select('id').eq('id', id);
    expect(albuns).toEqual([]);
    const { data: fotos } = await visitante().from('galeria_fotos').select('id').eq('album_id', id);
    expect(fotos).toEqual([]);
  });

  it('visitante não cria álbum', async () => {
    const { error } = await visitante().from('galeria_albuns').insert({ titulo: 'Invasor', data: '2026-11-15' });
    expect(error).not.toBeNull();
  });

  it('coordenador cria álbum e foto', async () => {
    const u = await criarUsuario('coordenador');
    const coord = await clienteComo(u);
    const { data, error } = await coord
      .from('galeria_albuns')
      .insert({ titulo: 'Festival', data: '2026-11-15', criado_por: u.id })
      .select('id')
      .single();
    expect(error).toBeNull();
    const foto = await coord
      .from('galeria_fotos')
      .insert({ album_id: data!.id, url: 'u', miniatura_url: 'm', largura: 10, altura: 10, enviado_por: u.id });
    expect(foto.error).toBeNull();
  });

  it('um álbum por jogo', async () => {
    const ref = '3f2b8c1e-1a2b-4c3d-8e9f-0123456789ab';
    await criarAlbum({ titulo: 'Real x Sede', origem: 'agenda', jogo_ref: ref });
    const { error } = await admin().from('galeria_albuns').insert({ titulo: 'Repetido', data: '2026-11-15', origem: 'agenda', jogo_ref: ref });
    expect(error?.code).toBe('23505');
  });

  it('título com menos de 3 letras é recusado', async () => {
    const { error } = await admin().from('galeria_albuns').insert({ titulo: 'ab', data: '2026-11-15' });
    expect(error?.code).toBe('23514');
  });

  it('telegram_estado só pelo service role', async () => {
    const r1 = await visitante().from('telegram_estado').select('*');
    expect(r1.error?.code).toBe('42501');
    const coord = await clienteComo(await criarUsuario('coordenador'));
    const r2 = await coord.from('telegram_estado').select('*');
    expect(r2.error?.code).toBe('42501');
    const ok = await admin().from('telegram_estado').upsert({ telegram_user_id: 555001, modo: 'galeria', ultimo_grupo: 'g1' });
    expect(ok.error).toBeNull();
    const { data } = await admin().from('telegram_estado').select('modo,ultimo_grupo').eq('telegram_user_id', 555001).single();
    expect(data).toEqual({ modo: 'galeria', ultimo_grupo: 'g1' });
  });

  it('bucket galeria: público, 10 MB, só imagens', async () => {
    const [b] = await consultar<{ public: boolean; file_size_limit: string; allowed_mime_types: string[] }>(
      "select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'galeria'",
    );
    expect(b.public).toBe(true);
    expect(Number(b.file_size_limit)).toBe(10485760);
    expect([...b.allowed_mime_types].sort()).toEqual(['image/jpeg', 'image/png', 'image/webp']);
  });

  it('visitante não lista os arquivos do bucket galeria (álbum escondido não vaza)', async () => {
    await admin().storage.from('galeria').upload('pasta-teste/x.jpg', new Uint8Array([255, 216, 255, 217]), { contentType: 'image/jpeg', upsert: true });
    const { data } = await visitante().storage.from('galeria').list('');
    expect(data ?? []).toEqual([]);
    const { data: dentro } = await visitante().storage.from('galeria').list('pasta-teste');
    expect(dentro ?? []).toEqual([]);
  });
});
