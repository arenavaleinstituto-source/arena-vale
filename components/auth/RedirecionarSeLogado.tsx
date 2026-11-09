'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cargoDoBanco, destinoPorCargo } from '@/lib/auth/rotas';

/** Na página /login: quem já tem sessão (ex.: veio pelo link do e-mail) vai direto ao painel. */
export function RedirecionarSeLogado({ next = null }: { next?: string | null }) {
  const router = useRouter();
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !vivo) return;
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        const destino = destinoPorCargo(cargoDoBanco((data as { role?: string } | null)?.role ?? 'autenticado'), next);
        if (destino && vivo) router.replace(destino);
      } catch {
        /* fica no formulário */
      }
    })();
    return () => {
      vivo = false;
    };
  }, [next, router]);
  return null;
}
