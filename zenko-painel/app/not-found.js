import Link from 'next/link';

export const metadata = { title: 'Página não encontrada' };

export default function NotFound() {
  return (
    <section aria-labelledby="h-404">
      <div className="view-head">
        <h1 id="h-404">Página não encontrada</h1>
        <p>O endereço acessado não existe no painel.</p>
      </div>
      <Link className="btn btn--primary" href="/">Voltar ao dashboard</Link>
    </section>
  );
}
