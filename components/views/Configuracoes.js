'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { criarClienteNavegador } from '@/lib/supabase/navegador';

/**
 * Configurações. Mostra o usuário real (perfil + papel vindo do banco).
 * A parte de Equipe (convidar, trocar papéis) está marcada como "em breve" —
 * mexe com o Auth do Supabase e entra numa fase seguinte.
 */

const ABAS = ['Perfil', 'Equipe', 'Notificações', 'Segurança'];

const PAPEL_ROTULO = {
  admin: 'Administrador',
  editor: 'Editor',
  leitor: 'Leitor',
};

export default function Configuracoes() {
  const toast = useToast();
  const [aba, setAba] = useState('Perfil');
  const [perfil, setPerfil] = useState(null);
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregar() {
      const sb = criarClienteNavegador();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      const { data: p } = await sb
        .from('perfis')
        .select('nome, papel')
        .eq('id', user.id)
        .single();

      setPerfil({ email: user.email, nome: p?.nome ?? '', papel: p?.papel ?? 'leitor' });
      setNome(p?.nome ?? '');
    }
    carregar().catch(() => toast('Não consegui carregar o perfil.'));
  }, [toast]);

  async function salvarNome() {
    setSalvando(true);
    try {
      const sb = criarClienteNavegador();
      const { data: { user } } = await sb.auth.getUser();
      const { error } = await sb.from('perfis').update({ nome }).eq('id', user.id);
      if (error) throw error;
      setPerfil((p) => ({ ...p, nome }));
      toast('Nome atualizado.');
    } catch (e) {
      toast(`Não deu para salvar: ${e.message}`);
    } finally {
      setSalvando(false);
    }
  }

  async function sair() {
    const sb = criarClienteNavegador();
    await sb.auth.signOut();
    window.location.href = '/login';
  }

  // Navegação por seta nas abas (acessibilidade — igual ao resto do painel).
  function navegarAbas(e) {
    const i = ABAS.indexOf(aba);
    if (e.key === 'ArrowRight') setAba(ABAS[(i + 1) % ABAS.length]);
    if (e.key === 'ArrowLeft') setAba(ABAS[(i - 1 + ABAS.length) % ABAS.length]);
  }

  return (
    <section aria-labelledby="h-config">
      <div className="view-head">
        <h1 id="h-config">Configurações</h1>
        <p>Seu perfil e as preferências do painel</p>
      </div>

      <div className="tabs" role="tablist" aria-label="Seções das configurações" onKeyDown={navegarAbas}
        style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #ffffff18' }}>
        {ABAS.map((nome) => (
          <button key={nome} role="tab" type="button"
            aria-selected={aba === nome}
            tabIndex={aba === nome ? 0 : -1}
            className={`tab${aba === nome ? ' active' : ''}`}
            onClick={() => setAba(nome)}
            style={{
              padding: '10px 16px', background: 'none', border: 'none', color: 'inherit',
              cursor: 'pointer', fontWeight: aba === nome ? 700 : 400,
              borderBottom: aba === nome ? '2px solid var(--foam)' : '2px solid transparent',
            }}>
            {nome}
          </button>
        ))}
      </div>

      {/* PERFIL */}
      {aba === 'Perfil' && (
        <div className="card" role="tabpanel">
          {!perfil ? (
            <p style={{ color: 'var(--muted)' }}>Carregando…</p>
          ) : (
            <>
              <div className="field">
                <label htmlFor="cfg-nome">Nome</label>
                <input className="input" id="cfg-nome" value={nome}
                  onChange={(e) => setNome(e.target.value)} />
              </div>

              <div className="field">
                <label htmlFor="cfg-email">E-mail</label>
                <input className="input" id="cfg-email" value={perfil.email} disabled
                  aria-describedby="email-nota" />
                <div className="field-foot">
                  <span id="email-nota">O e-mail de acesso não pode ser alterado por aqui.</span>
                </div>
              </div>

              <div className="field">
                <label>Seu papel</label>
                <div>
                  <span className="badge b-info">
                    <span className="dt" aria-hidden="true" />
                    {PAPEL_ROTULO[perfil.papel] ?? perfil.papel}
                  </span>
                </div>
              </div>

              <button type="button" className="btn btn--primary" onClick={salvarNome} disabled={salvando}>
                {salvando ? 'Salvando…' : 'Salvar alterações'}
              </button>
            </>
          )}
        </div>
      )}

      {/* EQUIPE — em breve */}
      {aba === 'Equipe' && (
        <div className="card" role="tabpanel">
          <div className="callout" style={{ marginBottom: 0 }}>
            <span>
              <b>Em breve.</b> O convite de novos membros e a troca de papéis (Administrador,
              Editor, Leitor) estão em desenvolvimento e chegam numa próxima atualização.
              Por enquanto, os usuários são criados direto no painel do Supabase.
            </span>
          </div>
        </div>
      )}

      {/* NOTIFICAÇÕES — em breve */}
      {aba === 'Notificações' && (
        <div className="card" role="tabpanel">
          <div className="callout" style={{ marginBottom: 0 }}>
            <span>
              <b>Em breve.</b> Avisos por e-mail quando uma publicação for feita ou falhar
              estão em desenvolvimento.
            </span>
          </div>
        </div>
      )}

      {/* SEGURANÇA */}
      {aba === 'Segurança' && (
        <div className="card" role="tabpanel">
          <h2 style={{ marginBottom: 6 }}>Sessão</h2>
          <p className="card-sub">Encerre sua sessão neste dispositivo.</p>
          <button type="button" className="btn btn--ghost" onClick={sair}>
            Sair da conta
          </button>
        </div>
      )}
    </section>
  );
}