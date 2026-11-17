import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { lerCargo } from '@/lib/auth/cargo';
import { decidirRota, enderecoDeLogin } from '@/lib/auth/rotas';

/**
 * Porteiro das áreas da equipe (spec 5.5). O cargo vem sempre do banco.
 *  - sem login          → /login?next=<rota>
 *  - cargo insuficiente → /acesso-negado
 *  - /proprietario para quem não é o dono → 404 comum (a área "não existe")
 * Cada página repete a checagem no servidor e o RLS é a barreira final.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const naoEncontrado = () => NextResponse.rewrite(new URL('/_nao-existe', request.url));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) {
    if (pathname.startsWith('/proprietario')) return naoEncontrado();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let resposta = NextResponse.next({ request });
  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies: { name: string; value: string; options?: CookieOptions }[]) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
      },
    },
  });

  const { cargo, ehDono } = await lerCargo(supabase);
  const decisao = decidirRota(pathname, cargo, ehDono);

  if (decisao === 'nao-encontrado') return naoEncontrado();
  if (decisao === 'login') {
    return NextResponse.redirect(new URL(enderecoDeLogin(pathname, request.nextUrl.search), request.url));
  }
  if (decisao === 'negado') return NextResponse.redirect(new URL('/acesso-negado', request.url));
  return resposta;
}

export const config = {
  matcher: [
    '/painel/:path*',
    '/coordenador/:path*',
    '/proprietario/:path*',
    '/moderador/:path*',
    '/capitao/:path*',
    '/delegado/:path*',
  ],
};
