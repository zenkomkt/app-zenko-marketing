import { Suspense } from 'react';
import Contas from '@/components/views/Contas';

export const metadata = { title: 'Contas sociais' };

export default function Page() {
  return (
    <Suspense fallback={<p style={{ padding: 32 }}>Carregando contas…</p>}>
      <Contas />
    </Suspense>
  );
}