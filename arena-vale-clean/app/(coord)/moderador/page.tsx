// Painel do moderador (similar ao coordenador, escopo = próprio time)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Nav } from '@/components/nav';

export default async function ModeradorPage() {
  const supabase = await createClient();
  const { data: { user } } = await user?.id ? await supabase.auth.getUser() : { data: { user: null } };
  if (!user) redirect('/login?next=/moderador');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: teamLink } = await supabase
    .from('time_moderadores')
    .select('*, time:times(*)')
    .eq('profile_id', user.id)
    .maybeSingle();

  return (
    <>
      <Nav />
      <main className="pt-[78px] container py-10">
        <div className="panel mb-6 bg-gradient-to-br from-[var(--surface-2)] to-[var(--bg-alt)] border-[var(--cyan)]/30">
          <span className="eyebrow">🛡️ Painel do Moderador</span>
          <h1 className="font-serif text-2xl font-extrabold mt-2">{teamLink?.time?.nome ?? '—'}</h1>
          <p className="text-[var(--text-dim)] text-sm">Bem-vindo, {profile?.full_name}.</p>
        </div>
        <div className="panel text-center text-[var(--text-mute)] py-12">
          Painel completo do moderador em construção. Ver <code>app/(coord)/moderador/page.tsx</code>.
        </div>
      </main>
    </>
  );
}
