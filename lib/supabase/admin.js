import { createClient } from '@supabase/supabase-js';

/**
 * Cliente com a SERVICE_ROLE. Ignora todo o RLS.
 *
 * REGRA DE OURO: nunca importe este arquivo de um Client Component.
 * Só rotas de API, cron e worker. É o único caminho que enxerga a coluna
 * `token` de contas_sociais.
 */
export function criarClienteAdmin() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada.');

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Grava em `logs`. Um erro de log nunca derruba a operação. */
export async function registrar(admin, { post_id = null, conta_id = null, nivel = 'info', evento, detalhe = {} }) {
  try {
    await admin.from('logs').insert({ post_id, conta_id, nivel, evento, detalhe });
  } catch (e) {
    console.error('[logs] falhou:', evento, e);
  }
}