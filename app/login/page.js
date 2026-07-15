import { Suspense } from 'react';
import Login from '@/components/views/Login';

export const metadata = { title: 'Entrar' };

export default function Page() {
  // useSearchParams num Client Component exige fronteira de Suspense,
  // senão o `next build` quebra na prerenderização.
  return (
    <Suspense fallback={<p style={{ padding: 32 }}>Carregando…</p>}>
      <Login />
    </Suspense>
  );
}