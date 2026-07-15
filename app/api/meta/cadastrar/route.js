import { NextResponse } from 'next/server';
import { usuarioAtual } from '@/lib/supabase/servidor';
import { criarClienteAdmin, registrar } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * POST /api/meta/cadastrar
 * Cadastra a Página e a conta do Instagram usando o token permanente do
 * System User (fixo no .env). Substitui o fluxo de OAuth: rode uma vez.
 */
export async function POST() {
  const eu = await usuarioAtual();
  if (!eu) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });
  if (eu.papel !== 'admin') {
    return NextResponse.json({ erro: 'Só admin pode cadastrar contas.' }, { status: 403 });
  }

  const token = process.env.META_SYSTEM_TOKEN;
  const igId = process.env.META_IG_ID;
  const pageId = process.env.META_PAGE_ID;
  const V = process.env.META_API_VERSION || 'v25.0';

  if (!token || !igId || !pageId) {
    return NextResponse.json({ erro: 'Faltam META_SYSTEM_TOKEN, META_IG_ID ou META_PAGE_ID no .env.' }, { status: 500 });
  }

  try {
    // Busca os dados da Página (nome, avatar) e do Instagram (username, foto).
    const rPage = await fetch(
      `https://graph.facebook.com/${V}/${pageId}?fields=name,picture{url}&access_token=${token}`,
      { cache: 'no-store' },
    );
    const page = await rPage.json();
    if (page.error) throw new Error(page.error.message);

    const rIg = await fetch(
      `https://graph.facebook.com/${V}/${igId}?fields=username,name,profile_picture_url&access_token=${token}`,
      { cache: 'no-store' },
    );
    const ig = await rIg.json();
    if (ig.error) throw new Error(ig.error.message);

    const sigla = (s = '') => s.replace(/[@._-]/g, ' ').trim().split(/\s+/).slice(0, 2)
      .map((p) => p[0] ?? '').join('').toUpperCase() || '??';

    const linhas = [
      {
        rede: 'facebook', id_externo: pageId, pagina_id: pageId,
        nome_exibicao: page.name, usuario: null, sigla: sigla(page.name),
        avatar_url: page.picture?.data?.url ?? null, token, estado: 'ok',
        criado_por: eu.usuario.id,
      },
      {
        rede: 'instagram', id_externo: igId, pagina_id: pageId,
        nome_exibicao: ig.name || ig.username, usuario: `@${ig.username}`,
        sigla: sigla(ig.username), avatar_url: ig.profile_picture_url ?? null,
        token, estado: 'ok', criado_por: eu.usuario.id,
      },
    ];

    const admin = criarClienteAdmin();
    const { error } = await admin.from('contas_sociais').upsert(linhas, { onConflict: 'rede,id_externo' });
    if (error) throw error;

    await registrar(admin, { evento: 'contas_cadastradas_system_user', detalhe: { por: eu.usuario.email } });

    return NextResponse.json({ ok: true, contas: linhas.map((l) => `${l.rede}: ${l.usuario || l.nome_exibicao}`) });
  } catch (e) {
    return NextResponse.json({ erro: e.message }, { status: 502 });
  }
}