import { NextResponse } from 'next/server';
import { usuarioAtual, podeEscrever, criarClienteServidor } from '@/lib/supabase/servidor';
import { criarClienteAdmin, registrar } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/** GET /api/posts?de=&ate= → posts com destinos e mídias. */
export async function GET(req) {
  const eu = await usuarioAtual();
  if (!eu) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });

  const url = new URL(req.url);
  const sb = await criarClienteServidor();

  let q = sb
    .from('posts')
    .select('*, post_midias(*), post_destinos(*, conta:contas_visiveis(nome_exibicao, usuario, sigla, rede))')
    .order('agendado_para', { ascending: true });

  const de = url.searchParams.get('de');
  const ate = url.searchParams.get('ate');
  if (de) q = q.gte('agendado_para', de);
  if (ate) q = q.lte('agendado_para', ate);

  const { data, error } = await q;
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

/** POST /api/posts — cria um post agendado. */
export async function POST(req) {
  const eu = await usuarioAtual();
  if (!eu) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });
  if (!podeEscrever(eu.papel)) {
    return NextResponse.json({ erro: 'Seu papel não pode agendar publicações.' }, { status: 403 });
  }

  const corpo = await req.json();
  const { tipo, legenda = '', agendado_para, trial_reel = 'desativado',
          contas = [], midias = [], processar_ia = false } = corpo;

  const erros = [];
  if (!['reels', 'feed', 'carrossel'].includes(tipo)) erros.push('Tipo inválido.');
  if (!agendado_para || Number.isNaN(Date.parse(agendado_para))) erros.push('Data inválida.');
  if (contas.length === 0) erros.push('Selecione ao menos uma conta de destino.');
  if (midias.length === 0) erros.push('Envie a mídia antes de agendar.');
  if (tipo === 'carrossel' && (midias.length < 2 || midias.length > 10)) {
    erros.push('Carrossel aceita de 2 a 10 itens.');
  }
  if (tipo !== 'carrossel' && midias.length > 1) erros.push('Este tipo aceita só uma mídia.');
  if (legenda.length > 2200) erros.push('Legenda acima de 2.200 caracteres.');
  if (erros.length) return NextResponse.json({ erros }, { status: 422 });

  const temVideo = midias.some((m) => m.tipo_midia === 'video');
  const status = processar_ia && temVideo ? 'aguardando_ia' : 'agendado';

  const admin = criarClienteAdmin();

  const { data: post, error: e1 } = await admin
    .from('posts')
    .insert({ tipo, legenda, agendado_para, trial_reel, status, criado_por: eu.usuario.id })
    .select()
    .single();
  if (e1) return NextResponse.json({ erro: e1.message }, { status: 500 });

  const { error: e2 } = await admin.from('post_midias').insert(
    midias.map((m, i) => ({
      post_id: post.id, ordem: i, caminho: m.caminho, tipo_midia: m.tipo_midia,
      mime: m.mime, tamanho_bytes: m.tamanho_bytes,
      estado_ia: processar_ia && m.tipo_midia === 'video' ? 'pendente' : 'nao_aplicavel',
    })),
  );

  const { error: e3 } = await admin.from('post_destinos').insert(
    contas.map((conta_id) => ({ post_id: post.id, conta_id })),
  );

  if (e2 || e3) {
    await admin.from('posts').delete().eq('id', post.id);
    return NextResponse.json({ erro: (e2 || e3).message }, { status: 500 });
  }

  await registrar(admin, {
    post_id: post.id, evento: 'post_agendado',
    detalhe: { tipo, destinos: contas.length, quando: agendado_para, ia: processar_ia },
  });

  return NextResponse.json({ post }, { status: 201 });
}