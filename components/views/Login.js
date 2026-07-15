'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { criarClienteNavegador } from '@/lib/supabase/navegador';
import { LogoZ } from '@/components/Icons';

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
      setErro(error.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos.' : error.message);
      setCarregando(false);
      return;
    }

    router.push(proxima);
    router.refresh();
  }

  return (
    <div className="login-split">
      {/* Lado da marca */}
      <div className="login-brand" aria-hidden="true">
        <div className="lb-shapes">
          <span className="lb-circle c1" />
          <span className="lb-circle c2" />
          <span className="lb-circle c3" />
          <span className="lb-ring r1" />
          <span className="lb-ring r2" />
        </div>
        <div className="lb-content">
          <div className="lb-logo">
            <LogoZ className="mark" />
            <span className="lb-word">ZENKO<span className="lb-tag">MKT</span></span>
          </div>
          <h2 className="lb-title">
            Sua marca postando sozinha<br />
            <span className="lb-accent">— e sites que convertem de verdade.</span>
          </h2>
        </div>
      </div>

      {/* Lado do formulário */}
      <div className="login-form-side">
        <div className="login-card">
          <div className="login-mobilebrand">
            <LogoZ className="mark" />
            <span className="lb-word">ZENKO<span className="lb-tag">MKT</span></span>
          </div>

          <h1 className="login-h1">Entrar no painel</h1>
          <p className="login-sub">Acesso restrito à equipe</p>

          <form onSubmit={entrar} noValidate>
            {erro && (
              <div className="callout" role="alert" id="erro-login" style={{ marginBottom: 18 }}>
                <span>{erro}</span>
              </div>
            )}

            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                className="input" id="email" type="email" autoComplete="username"
                placeholder="nome@zenko.com" required value={email}
                aria-invalid={erro ? 'true' : undefined}
                aria-describedby={erro ? 'erro-login' : undefined}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="senha">Senha</label>
              <input
                className="input" id="senha" type="password" autoComplete="current-password"
                placeholder="••••••••" required value={senha}
                aria-invalid={erro ? 'true' : undefined}
                aria-describedby={erro ? 'erro-login' : undefined}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <div className="login-actions">
              <button type="submit" className="btn btn--primary login-btn" disabled={carregando}>
                {carregando ? 'Entrando…' : 'Entrar'}
              </button>
              <button type="button" className="btn btn--ghost login-btn" disabled
                title="Em breve — o cadastro será liberado em uma próxima atualização">
                Criar conta
              </button>
            </div>
            <p className="login-hint">O cadastro de novos usuários chega em breve.</p>
          </form>
        </div>
      </div>
    </div>
  );
}