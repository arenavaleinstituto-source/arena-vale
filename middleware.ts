// Middleware: refresh session + guard de rotas protegidas
// As páginas server-side (/coordenador, /moderador) já fazem a própria proteção,
// então o middleware é só um extra opcional. Se falhar, a página server-side trata.
import { type NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/coordenador', '/moderador', '/conta'];
const AUTH_PATHS = ['/login'];

export async function middleware(request: NextRequest) {
  // Por enquanto, apenas deixa passar — a proteção é feita nas páginas
  return NextResponse.next();
}

export const config = {
  // Desabilitado por enquanto — proteção é server-side nas páginas
  matcher: [],
};
