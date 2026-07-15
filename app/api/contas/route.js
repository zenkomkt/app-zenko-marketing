import { NextResponse } from 'next/server';
import { criarClienteServidor, usuarioAtual } from '@/lib/supabase/servidor';

export const runtime = 'nodejs';

/**
 * GET /api/contas → lista as contas conectadas.
 * Lê da view contas_visiveis, que NÃO tem a coluna do token.
 */
export async function GET() {
  const eu = await usuarioAtual();
  if (!eu) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });

  const sb = await criarClienteServidor();
  const { data, error } = await sb
    .from('contas_visiveis')
    .select('*')
    .order('rede')
    .order('nome_exibicao');

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ contas: data });
}