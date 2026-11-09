import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { destinoConfirmacao } from '@/lib/auth/rotas';

const TIPOS: EmailOtpType[] = ['invite', 'magiclink', 'recovery', 'signup', 'email', 'email_change'];

/**
 * Destino dos links de e-mail do Supabase (convite, link de acesso, nova senha).
 * Os modelos de e-mail do Supabase apontam para cá com `token_hash` e `type`
 * (padrão SSR do Supabase); aqui a sessão é criada no servidor e a pessoa segue
 * para `next` (só destinos internos permitidos).
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl;
  const tokenHash = url.searchParams.get('token_hash');
  const tipo = url.searchParams.get('type') as EmailOtpType | null;
  const destino = destinoConfirmacao(url.searchParams.get('next'), url.origin);

  if (tokenHash && tipo && TIPOS.includes(tipo)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(destino, url.origin));
  }
  return NextResponse.redirect(new URL('/criar-senha?erro=link', url.origin));
}
