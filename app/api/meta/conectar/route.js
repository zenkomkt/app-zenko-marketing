import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { usuarioAtual, podeEscrever } from '@/lib/supabase/servidor';
import { urlDeLogin } from '@/lib/meta';

export const runtime = 'nodejs';

/** GET /api/meta/conectar → manda o usuário para o login da Meta. */
export async function GET(req) {
  const eu = await usuarioAtual();
  if (!eu) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });
  if (!podeEscrever(eu.papel)) {
    return NextResponse.json({ erro: 'Seu papel não pode conectar contas.' }, { status: 403 });
  }

  const state = randomBytes(24).toString('hex');
  const redirectUri = `${process.env.NEXT_PUBLIC_URL_APP}/api/meta/callback`;

  const res = NextResponse.redirect(urlDeLogin({ redirectUri, state }));
  res.cookies.set('meta_state', state, {
    httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: 600,
  });
  return res;
}