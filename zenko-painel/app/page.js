import Dashboard from '@/components/views/Dashboard';

// O `template` do layout não se aplica ao mesmo segmento de rota,
// por isso o título da home vem escrito por extenso.
export const metadata = { title: 'Zenko · Dashboard' };

export default function Page() {
  return <Dashboard />;
}
