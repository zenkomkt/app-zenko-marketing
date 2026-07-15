import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/** Cliente para Server Components e Route Handlers (chave ANON + RLS). */
export async function criarClienteServidor() {
  const jar = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (lista) => {
          try {
            lista.forEach(({ name, value, options }) => jar.set(name, value, options));
          } catch {
            // Server Component não escreve cookie. Tudo bem: o middleware renova a sessão.
          }
        },
      },
    },
  );
}

/** { usuario, papel, nome } ou null. Chame no começo de toda rota protegida. */
export async function usuarioAtual() {
  const sb = await criarClienteServidor();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await sb
    .from('perfis')
    .select('papel, nome')
    .eq('id', user.id)
    .single();

  return { usuario: user, papel: perfil?.papel ?? 'leitor', nome: perfil?.nome ?? '' };
}

/** true se o papel pode criar/alterar posts. */
export function podeEscrever(papel) {
  return papel === 'admin' || papel === 'editor';
}