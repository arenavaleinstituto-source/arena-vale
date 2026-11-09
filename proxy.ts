import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';

/**
 * PROTEÇÃO DAS ROTAS ADMINISTRATIVAS
 *
 * ANTES, o matcher cobria apenas `/painel/:path*`. As rotas
 * `/coordenador`, `/coordenador/atletasdestaques` e `/proprietario`
 * respondiam HTTP 200 para qualquer visitante — o painel do coordenador e
 * o painel do proprietário eram servidos publicamente.
 *
 * (`/capitao` e `/moderador` já faziam a checagem de sessão dentro do
 * próprio Server Component, então não entram no matcher para não
 * duplicar o redirecionamento e perder o parâmetro `?next=`.)
 *
 * O middleware agora cobre todas as áreas restritas.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verifica se o utilizador está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sem sessão válida → redireciona para o portal de acesso, preservando
  // o destino para depois do login.
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

/**
 * Matcher: todas as áreas administrativas do Arena Vale.
 */
export const config = {
  matcher: [
    '/painel/:path*',
    '/coordenador/:path*',
    '/proprietario/:path*',
  ],
};
