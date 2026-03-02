// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de login
  const publicRoutes = ['/', '/vagas', '/empresas', '/login', '/register', '/api'];
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      return NextResponse.next();
  }

  // Se não tem sessão, redireciona para login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Aqui futuramente podemos ler o conteúdo do JWT para barrar o CANDIDATO 
  // de aceder às páginas da EMPRESA e vice-versa. Por agora, deixamos passar se estiver logado.
  // (A verificação exata de Roles será feita nos layouts/pages server-side por segurança).

  return NextResponse.next();
}

// Configura o middleware para NÃO correr nos ficheiros estáticos (imagens, css, etc)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}