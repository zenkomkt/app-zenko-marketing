'use client';

import { useToast } from '@/components/ToastProvider';
import { IconInstagram, IconFacebook, IconTikTok } from '@/components/Icons';

/* Fase 2: virá do back-end (tabela de contas + tokens guardados com segurança). */
const CONECTADAS = [
  { sigla: 'ZM', nome: '@zenko.mkt', rede: 'Instagram · conta profissional', estado: 'ok', rotulo: 'Conectada', acao: 'Gerenciar' },
  { sigla: 'AU', nome: '@cliente.aurora', rede: 'Instagram · conta profissional', estado: 'ok', rotulo: 'Conectada', acao: 'Gerenciar' },
  { sigla: 'ZM', nome: 'Zenko MKT', rede: 'TikTok', estado: 'warn', rotulo: 'Reautenticar', acao: 'Reconectar' },
];

const REDES = [
  { nome: 'Instagram', Icon: IconInstagram, aviso: 'Aqui abriria o login oficial do Instagram (via Meta).' },
  { nome: 'Facebook', Icon: IconFacebook, aviso: 'Aqui abriria o login oficial do Facebook (via Meta).' },
  { nome: 'TikTok', Icon: IconTikTok, aviso: 'Aqui abriria o login oficial do TikTok.' },
];

export default function Contas() {
  const toast = useToast();

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
            <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {CONECTADAS.length}</span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CONECTADAS.map(({ sigla, nome, rede, estado, rotulo, acao }) => (
            <div className="acct-card" key={nome}>
              <span className="av" aria-hidden="true">{sigla}</span>
              <span className="info">
                <b>{nome}</b>
                <span>{rede}</span>
              </span>
              <span className={`badge ${estado === 'ok' ? 'b-ok' : 'b-warn'}`} style={{ marginRight: 8 }}>
                <span className="dt" aria-hidden="true" />
                {rotulo}
              </span>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => toast(`${acao}: ${nome} (simulação).`)}
              >
                {acao}
                <span className="vh"> a conta {nome}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h2>Conectar nova conta</h2></div>
        <div className="connect-grid">
          {REDES.map(({ nome, Icon, aviso }) => (
            <button type="button" className="connect-btn" key={nome} onClick={() => toast(aviso)}>
              <span className="lg" aria-hidden="true"><Icon /></span>
              {nome}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
