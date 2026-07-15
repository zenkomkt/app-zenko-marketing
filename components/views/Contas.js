'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { IconInstagram, IconFacebook } from '@/components/Icons';

/**
 * Contas sociais. Lê da view contas_visiveis (via /api/contas), que não tem a
 * coluna do token. Quem lê token é só o back-end com a service_role.
 *
 * TikTok saiu do escopo: as diretrizes do TikTok excluem ferramentas de uso
 * interno. Instagram e Facebook funcionam sem revisão da Meta porque só
 * publicamos em contas que a Zenko administra.
 */

const REDES = {
  instagram: { Icon: IconInstagram, rotulo: 'Instagram · conta profissional' },
  facebook: { Icon: IconFacebook, rotulo: 'Facebook · Página' },
};

export default function Contas() {
  const toast = useToast();
  const params = useSearchParams();

  const [contas, setContas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const erro = params.get('erro');
    const ok = params.get('ok');
    if (erro) toast(erro);
    if (ok) toast(`${ok} conta(s) conectada(s).`);

    fetch('/api/contas')
      .then((r) => r.json())
      .then(({ contas: lista = [] }) => setContas(lista))
      .catch(() => toast('Não consegui carregar as contas.'))
      .finally(() => setCarregando(false));
  }, [params, toast]);

  return (
    <section aria-labelledby="h-contas">
      <div className="view-head">
        <h1 id="h-contas">Contas sociais</h1>
        <p>Conecte e gerencie as redes da Zenko</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <h2>
            Canais conectados{' '}
            <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {contas.length}</span>
          </h2>
        </div>

        <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {carregando && <p style={{ color: 'var(--muted)' }}>Carregando contas…</p>}

          {!carregando && contas.length === 0 && (
            <p style={{ color: 'var(--muted)' }}>
              Nenhuma conta conectada. Use os botões abaixo para conectar.
            </p>
          )}

          {contas.map((c) => {
            const rede = REDES[c.rede] ?? {};
            const precisaReconectar = c.estado !== 'ok';

            return (
              <div className="acct-card" key={c.id}>
                <span className="av" aria-hidden="true">{c.sigla}</span>
                <span className="info">
                  <b>{c.usuario || c.nome_exibicao}</b>
                  <span>{rede.rotulo || c.rede}</span>
                </span>
                <span
                  className={`badge ${precisaReconectar ? 'b-warn' : 'b-ok'}`}
                  style={{ marginRight: 8 }}
                >
                  <span className="dt" aria-hidden="true" />
                  {precisaReconectar ? 'Reautenticar' : 'Conectada'}
                </span>
                <a className="btn btn--ghost btn--sm" href="/api/meta/conectar">
                  {precisaReconectar ? 'Reconectar' : 'Gerenciar'}
                  <span className="vh"> a conta {c.usuario || c.nome_exibicao}</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h2>Conectar nova conta</h2></div>

        <p className="card-sub">
          Um login só traz as Páginas do Facebook e as contas profissionais do Instagram
          ligadas a elas. A conta do Instagram precisa ser <b>profissional</b> e estar
          <b> vinculada a uma Página</b> — sem isso a Meta não libera a publicação.
        </p>

        <div className="connect-grid">
          <a className="connect-btn" href="/api/meta/conectar">
            <span className="lg" aria-hidden="true"><IconInstagram /></span>
            Instagram
          </a>
          <a className="connect-btn" href="/api/meta/conectar">
            <span className="lg" aria-hidden="true"><IconFacebook /></span>
            Facebook
          </a>
        </div>
      </div>
    </section>
  );
}