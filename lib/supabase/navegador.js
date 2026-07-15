'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente do Supabase para o navegador. Usa a chave ANON — ela é pública de
 * propósito. Quem protege os dados é o RLS, não o segredo da chave.
 * A tabela contas_sociais tem RLS ligado e zero políticas: este cliente não
 * alcança ela. Ele só enxerga a view contas_visiveis, que não tem o token.
 */
export function criarClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}