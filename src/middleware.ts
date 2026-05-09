import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

const protectedRoutes = ['/dashboard', '/clients', '/loans', '/settings', '/ayuda'];
const authRoutes = ['/login', '/register'];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAuthRoute(pathname: string) {
  return authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  const { response, user, cloneCookies } = await updateSession(request);
  const { pathname } = request.nextUrl;

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