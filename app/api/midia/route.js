import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { usuarioAtual, podeEscrever, criarClienteServidor } from '@/lib/supabase/servidor';

export const runtime = 'nodejs';

const TIPOS_OK = [
  'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm',
];

/**
 * POST /api/midia { nome, mime, tamanho } → { caminho, token, tipo_midia }
 * O arquivo NÃO passa pela Vercel: o navegador recebe uma URL assinada e
 * envia direto para o Supabase Storage.
 */
export async function POST(req) {
  const eu = await usuarioAtual();
  if (!eu) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });
  if (!podeEscrever(eu.papel)) {
    return NextResponse.json({ erro: 'Seu papel não pode enviar mídia.' }, { status: 403 });
  }

  const { nome, mime, tamanho } = await req.json();

  if (!TIPOS_OK.includes(mime)) {
    return NextResponse.json({ erro: `Formato não aceito: ${mime}` }, { status: 415 });
  }
  if (tamanho > 500 * 1024 * 1024) {
    return NextResponse.json({ erro: 'Arquivo acima de 500 MB.' }, { status: 413 });
  }

  const ext = (nome.split('.').pop() || 'bin').toLowerCase();
  const caminho = `${eu.usuario.id}/${randomUUID()}.${ext}`;

  const sb = await criarClienteServidor();
  const { data, error } = await sb.storage.from('midias').createSignedUploadUrl(caminho);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  return NextResponse.json({
    caminho,
    token: data.token,
    tipo_midia: mime.startsWith('video/') ? 'video' : 'imagem',
  });
}