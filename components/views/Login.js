'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { criarClienteNavegador } from '@/lib/supabase/navegador';

/**
 * Acessibilidade:
 *  - o erro vai num container com role="alert": o leitor de tela anuncia sozinho;
 *  - os campos apontam para o erro via aria-describedby + aria-invalid;
 *  - o botão anuncia "Entrando…" por texto, não por spinner mudo.
 */
export default function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const proxima = params.get('proxima') || '/';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    const sb = criarClienteNavegador();
    const { error } = await sb.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro(
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : error.message,
      );
      setCarregando(false);
      return;
    }

    router.push(proxima);
    router.refresh();
  }

  return (
    <section aria-labelledby="h-login" style={{ maxWidth: 420, margin: '8vh auto' }}>
      <div className="view-head">
        <h1 id="h-login">Entrar no painel</h1>
        <p>Acesso restrito à equipe da Zenko</p>
      </div>

      <form className="card" onSubmit={entrar} noValidate>
        {erro && (
          <div className="callout" role="alert" id="erro-login" style={{ marginBottom: 18 }}>
            <span>{erro}</span>
          </div>
        )}

        <div className="field">
          <label htmlFor="email">
            E-mail <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            className="input"
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            aria-invalid={erro ? 'true' : undefined}
            aria-describedby={erro ? 'erro-login' : undefined}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="senha">
            Senha <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            className="input"
            id="senha"
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            aria-invalid={erro ? 'true' : undefined}
            aria-describedby={erro ? 'erro-login' : undefined}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          style={{ width: '100%', justifyContent: 'center', padding: '13px 26px' }}
          disabled={carregando}
        >
          {carregando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}