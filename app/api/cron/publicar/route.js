import { NextResponse } from 'next/server';
import { criarClienteAdmin, registrar } from '@/lib/supabase/admin';
import { publicarPost } from '@/lib/meta';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_TENTATIVAS = 3;
const VALIDADE_URL = 3600;

/**
 * POST /api/cron/publicar
 * Pega os posts vencidos (status 'agendado', horário passado) e publica em cada
 * destino. Protegido pelo SEGREDO_CRON. Por enquanto disparamos na mão; depois
 * o pg_cron chama isto de minuto em minuto.
 */
export async function POST(req) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.SEGREDO_CRON}`) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  }

  const admin = criarClienteAdmin();

  const { data: posts, error } = await admin
    .from('posts')
    .select('*, post_midias(*), post_destinos(*)')
    .eq('status', 'agendado')
    .lte('agendado_para', new Date().toISOString())
    .order('agendado_para')
    .limit(3);

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  if (!posts?.length) return NextResponse.json({ processados: 0, msg: 'Nada vencido.' });

  const resumo = [];

  for (const post of posts) {
    await admin.from('posts').update({ status: 'publicando' }).eq('id', post.id);

    const midias = [];
    for (const m of [...post.post_midias].sort((a, b) => a.ordem - b.ordem)) {
      const caminho = m.caminho_processado || m.caminho;
      const { data: assinada, error: eUrl } =
        await admin.storage.from('midias').createSignedUrl(caminho, VALIDADE_URL);
      if (eUrl) { await falhar(admin, post, null, `URL da mídia: ${eUrl.message}`); continue; }

      let urlCapa;
      if (m.caminho_capa) {
        const { data: capa } = await admin.storage.from('midias').createSignedUrl(m.caminho_capa, VALIDADE_URL);
        urlCapa = capa?.signedUrl;
      }
      midias.push({ url: assinada.signedUrl, urlCapa, tipo_midia: m.tipo_midia });
    }

    if (midias.length === 0) { await marcarPost(admin, post.id); continue; }

    for (const destino of post.post_destinos) {
      if (destino.status === 'publicado' || destino.status === 'cancelado') continue;
      if (destino.tentativas >= MAX_TENTATIVAS) continue;

      const { data: conta } = await admin.from('contas_sociais').select('*').eq('id', destino.conta_id).single();
      if (!conta) { await falhar(admin, post, destino, 'Conta não encontrada.'); continue; }

      await admin.from('post_destinos')
        .update({ status: 'publicando', tentativas: destino.tentativas + 1 }).eq('id', destino.id);

      try {
        const r = await publicarPost(conta, post, midias);
        await admin.from('post_destinos').update({
          status: 'publicado', container_id: r.container_id ?? null, media_id: r.media_id,
          permalink: r.permalink, erro: null, publicado_em: new Date().toISOString(),
        }).eq('id', destino.id);

        await registrar(admin, {
          post_id: post.id, conta_id: conta.id, evento: 'publicado',
          detalhe: { rede: conta.rede, media_id: r.media_id, permalink: r.permalink },
        });
        resumo.push({ conta: conta.nome_exibicao, ok: true, permalink: r.permalink });
      } catch (e) {
        if ([190, 10, 200].includes(e.codigo)) {
          await admin.from('contas_sociais').update({ estado: 'reautenticar' }).eq('id', conta.id);
        }
        await falhar(admin, post, destino, e.message, { codigo: e.codigo, rede: conta.rede });
        resumo.push({ conta: conta.nome_exibicao, ok: false, erro: e.message });
      }
    }
    await marcarPost(admin, post.id);
  }

  return NextResponse.json({ processados: posts.length, resumo });
}

async function falhar(admin, post, destino, msg, extra = {}) {
  if (destino) {
    const definitivo = destino.tentativas + 1 >= MAX_TENTATIVAS;
    await admin.from('post_destinos')
      .update({ status: definitivo ? 'falhou' : 'agendado', erro: msg }).eq('id', destino.id);
  }
  await registrar(admin, {
    post_id: post.id, conta_id: destino?.conta_id ?? null, nivel: 'erro',
    evento: 'publicacao_falhou', detalhe: { msg, ...extra },
  });
}

async function marcarPost(admin, postId) {
  const { data: destinos } = await admin.from('post_destinos').select('status, tentativas').eq('post_id', postId);
  const publicados = destinos.filter((d) => d.status === 'publicado').length;
  const pendentes = destinos.filter((d) => d.status === 'agendado' && d.tentativas < MAX_TENTATIVAS).length;
  const status = pendentes > 0 ? 'agendado' : publicados > 0 ? 'publicado' : 'falhou';
  await admin.from('posts').update({ status }).eq('id', postId);
}