import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Renova a sessão a cada navegação e barra quem não está logado.
 * Sempre getUser() (bate no servidor de Auth), nunca getSession() —
 * o cookie de sessão pode ser forjado.
 */
const PUBLICAS = ['/login', '/auth', '/api/cron', '/api/meta/callback'];

export async function middleware(req) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (lista) => {
          lista.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          lista.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const rota = req.nextUrl.pathname;
  const publica = PUBLICAS.some((p) => rota.startsWith(p));

  if (!user && !publica) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('proxima', rota);
    return NextResponse.redirect(url);
  }

  if (user && rota === '/login') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.woff2$).*)'],
};