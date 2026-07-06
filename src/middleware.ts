import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

const protectedRoutes = ['/dashboard', '/clients', '/loans', '/settings', '/ayuda', '/equipo', '/auditoria'];
const authRoutes = ['/login', '/register'];
const publicRoutes = ['/invite'];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAuthRoute(pathname: string) {
  return authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  let sessionResult: any = { response: NextResponse.next({ request }), user: null, cloneCookies: (r: any) => r };
  try {
    sessionResult = await updateSession(request);
  } catch (error) {
    console.error('Middleware updateSession error:', error);
  }
  const { response, user, cloneCookies } = sessionResult;
  const { pathname } = request.nextUrl;

  // Las rutas de invitación son siempre públicas
  if (isPublicRoute(pathname)) {
    return response;
  }

  if (isAuthRoute(pathname) && user) {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    return cloneCookies(redirectResponse);
  }

  if (isProtectedRoute(pathname) && !user) {
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
    return cloneCookies(redirectResponse);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};