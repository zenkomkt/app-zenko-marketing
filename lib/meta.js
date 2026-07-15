/**
 * Zenko · camada da Meta Graph API (Instagram + Facebook). SÓ roda no servidor.
 * Recebe tokens; nada aqui pode atravessar para o navegador.
 */

const VERSAO = process.env.META_API_VERSION || 'v25.0';
const GRAPH = `https://graph.facebook.com/${VERSAO}`;

export const ESCOPOS = [
  'instagram_basic',
  'instagram_content_publish',
  'pages_show_list',
  'pages_read_engagement',
].join(',');

async function chamar(caminho, { metodo = 'GET', token, params = {}, corpo } = {}) {
  const url = new URL(`${GRAPH}${caminho}`);
  if (metodo === 'GET') {
    Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  }

  const opcoes = { method: metodo, headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' };
  if (metodo === 'POST') {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(corpo ?? params);
  }

  const r = await fetch(url, opcoes);
  const dados = await r.json().catch(() => ({}));

  if (!r.ok || dados.error) {
    const e = dados.error || {};
    const erro = new Error(e.error_user_msg || e.message || `Meta ${r.status}`);
    erro.codigo = e.code;
    erro.bruto = dados;
    throw erro;
  }
  return dados;
}

/* ---------- OAuth ---------- */

export function urlDeLogin({ redirectUri, state }) {
  const p = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    redirect_uri: redirectUri,
    state,
    response_type: 'code',
    scope: ESCOPOS,
    auth_type: 'rerequest',   // ← ADICIONE esta linha
  });
  return `https://www.facebook.com/${VERSAO}/dialog/oauth?${p}`;
}

export async function trocarCodigoPorToken({ code, redirectUri }) {
  const p = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    client_secret: process.env.META_APP_SECRET,
    redirect_uri: redirectUri,
    code,
  });
  const r = await fetch(`${GRAPH}/oauth/access_token?${p}`, { cache: 'no-store' });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.access_token;
}

export async function ampliarToken(tokenCurto) {
  const p = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID,
    client_secret: process.env.META_APP_SECRET,
    fb_exchange_token: tokenCurto,
  });
  const r = await fetch(`${GRAPH}/oauth/access_token?${p}`, { cache: 'no-store' });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return { token: d.access_token, expira_em_seg: d.expires_in ?? 60 * 24 * 3600 };
}

/** Lista as Páginas do usuário e, em cada uma, a conta profissional do Instagram. */
export async function listarAtivos(tokenUsuarioLongo) {
  const d = await chamar('/me/accounts', {
    token: tokenUsuarioLongo,
    params: {
      fields: 'id,name,access_token,picture{url},instagram_business_account{id,username,name,profile_picture_url}',
      limit: 100,
    },
  });

  const contas = [];
  for (const pagina of d.data ?? []) {
    contas.push({
      rede: 'facebook',
      id_externo: pagina.id,
      pagina_id: pagina.id,
      nome_exibicao: pagina.name,
      usuario: null,
      avatar_url: pagina.picture?.data?.url ?? null,
      token: pagina.access_token,
    });

    const ig = pagina.instagram_business_account;
    if (ig) {
      contas.push({
        rede: 'instagram',
        id_externo: ig.id,
        pagina_id: pagina.id,
        nome_exibicao: ig.name || ig.username,
        usuario: ig.username ? `@${ig.username}` : null,
        avatar_url: ig.profile_picture_url ?? null,
        token: pagina.access_token, // o IG usa o token DA PÁGINA
      });
    }
  }
  return contas;
}

/* ---------- Publicação Instagram ---------- */

export async function criarContainerIG(igId, token, opcoes) {
  const { tipo, urlMidia, legenda = '', urlCapa, filhos, itemDeCarrossel, trialReel = false } = opcoes;
  const corpo = {};

  if (tipo === 'carrossel' && filhos) {
    corpo.media_type = 'CAROUSEL';
    corpo.children = filhos.join(',');
    corpo.caption = legenda;
  } else if (tipo === 'reels') {
    corpo.media_type = 'REELS';
    corpo.video_url = urlMidia;
    corpo.caption = legenda;
    corpo.share_to_feed = true;
    if (urlCapa) corpo.cover_url = urlCapa;
    if (trialReel) corpo.is_trial = true;
  } else {
    corpo.image_url = urlMidia;
    if (!itemDeCarrossel) corpo.caption = legenda;
    if (itemDeCarrossel) corpo.is_carousel_item = true;
  }

  const d = await chamar(`/${igId}/media`, { metodo: 'POST', token, corpo });
  return d.id;
}

export async function esperarContainer(containerId, token, { tentativas = 30, intervaloMs = 5000 } = {}) {
  for (let i = 0; i < tentativas; i++) {
    const d = await chamar(`/${containerId}`, { token, params: { fields: 'status_code,status' } });
    if (d.status_code === 'FINISHED') return true;
    if (d.status_code === 'ERROR' || d.status_code === 'EXPIRED') {
      throw new Error(`Container ${d.status_code}: ${d.status || 'sem detalhe'}`);
    }
    await new Promise((r) => setTimeout(r, intervaloMs));
  }
  throw new Error('Container não ficou pronto no tempo esperado.');
}

export async function publicarIG(igId, token, containerId) {
  const d = await chamar(`/${igId}/media_publish`, {
    metodo: 'POST', token, corpo: { creation_id: containerId },
  });
  let permalink = null;
  try {
    const m = await chamar(`/${d.id}`, { token, params: { fields: 'permalink' } });
    permalink = m.permalink ?? null;
  } catch { /* permalink é bônus */ }
  return { media_id: d.id, permalink };
}

/* ---------- Publicação Facebook ---------- */

export async function publicarFacebook(paginaId, token, { tipo, urlMidia, legenda }) {
  if (tipo === 'reels' || /\.(mp4|mov|webm)(\?|$)/i.test(urlMidia || '')) {
    const d = await chamar(`/${paginaId}/videos`, {
      metodo: 'POST', token, corpo: { file_url: urlMidia, description: legenda },
    });
    return { media_id: d.id, permalink: `https://facebook.com/${d.id}` };
  }
  const d = await chamar(`/${paginaId}/photos`, {
    metodo: 'POST', token, corpo: { url: urlMidia, caption: legenda, published: true },
  });
  return { media_id: d.post_id || d.id, permalink: `https://facebook.com/${d.post_id || d.id}` };
}

/* ---------- Orquestração: um post → uma conta ---------- */

export async function publicarPost(conta, post, midias) {
  const trial = post.trial_reel && post.trial_reel !== 'desativado';

  if (conta.rede === 'facebook') {
    return publicarFacebook(conta.id_externo, conta.token, {
      tipo: post.tipo, urlMidia: midias[0].url, legenda: post.legenda,
    });
  }

  const ig = conta.id_externo;
  const token = conta.token;

  if (post.tipo === 'carrossel') {
    if (midias.length < 2 || midias.length > 10) throw new Error('Carrossel precisa de 2 a 10 itens.');
    const filhos = [];
    for (const m of midias) {
      const id = await criarContainerIG(ig, token, {
        tipo: m.tipo_midia === 'video' ? 'reels' : 'feed',
        urlMidia: m.url, itemDeCarrossel: true,
      });
      await esperarContainer(id, token);
      filhos.push(id);
    }
    const pai = await criarContainerIG(ig, token, { tipo: 'carrossel', filhos, legenda: post.legenda });
    await esperarContainer(pai, token);
    return { ...(await publicarIG(ig, token, pai)), container_id: pai };
  }

  const container = await criarContainerIG(ig, token, {
    tipo: post.tipo,
    urlMidia: midias[0].url,
    urlCapa: midias[0].urlCapa,
    legenda: post.legenda,
    trialReel: post.tipo === 'reels' && trial,
  });
  await esperarContainer(container, token);
  return { ...(await publicarIG(ig, token, container)), container_id: container };
}