import { NextResponse } from 'next/server';
import { usuarioAtual } from '@/lib/supabase/servidor';
import { criarClienteAdmin, registrar } from '@/lib/supabase/admin';
import { trocarCodigoPorToken, ampliarToken, listarAtivos } from '@/lib/meta';

export const runtime = 'nodejs';

const sigla = (nome = '') =>
  nome.replace(/[@._-]/g, ' ').trim().split(/\s+/).slice(0, 2)
      .map((p) => p[0] ?? '').join('').toUpperCase() || '??';

/** GET /api/meta/callback → a Meta volta aqui com ?code= */
export async function GET(req) {
  const url = new URL(req.url);
  const destino = new URL('/contas', process.env.NEXT_PUBLIC_URL_APP);

  const erroMeta = url.searchParams.get('error_description') || url.searchParams.get('error');
  if (erroMeta) {
    destino.searchParams.set('erro', erroMeta);
    return NextResponse.redirect(destino);
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const stateCookie = req.cookies.get('meta_state')?.value;

  if (!code || !state || state !== stateCookie) {
    destino.searchParams.set('erro', 'Validação de segurança falhou. Tente conectar de novo.');
    return NextResponse.redirect(destino);
  }

  const eu = await usuarioAtual();
  if (!eu) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_URL_APP));

  const admin = criarClienteAdmin();

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_URL_APP}/api/meta/callback`;
    const curto = await trocarCodigoPorToken({ code, redirectUri });
    const { token: longo, expira_em_seg } = await ampliarToken(curto);
    const expira = new Date(Date.now() + expira_em_seg * 1000).toISOString();
    const ativos = await listarAtivos(longo);

    if (ativos.length === 0) {
      destino.searchParams.set('erro',
        'Nenhuma Página encontrada. A conta do Instagram precisa ser profissional e estar vinculada a uma Página do Facebook.');
      return NextResponse.redirect(destino);
    }

    const linhas = ativos.map((c) => ({
      ...c,
      sigla: sigla(c.usuario || c.nome_exibicao),
      token_expira_em: expira,
      estado: 'ok',
      criado_por: eu.usuario.id,
    }));

    const { error } = await admin
      .from('contas_sociais')
      .upsert(linhas, { onConflict: 'rede,id_externo' });
    if (error) throw error;

    await registrar(admin, {
      evento: 'contas_conectadas',
      detalhe: { quantidade: linhas.length, por: eu.usuario.email },
    });

    destino.searchParams.set('ok', String(linhas.length));
  } catch (e) {
    await registrar(admin, { nivel: 'erro', evento: 'oauth_meta_falhou', detalhe: { msg: e.message } });
    destino.searchParams.set('erro', e.message);
  }

  const res = NextResponse.redirect(destino);
  res.cookies.delete('meta_state');
  return res;
}