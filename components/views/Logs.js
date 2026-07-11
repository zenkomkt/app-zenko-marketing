'use client';

import { useToast } from '@/components/ToastProvider';
import { IconRefresh } from '@/components/Icons';

/* Fase 2: virá do back-end, atualizado em tempo real. */
const REGISTROS = [
  { quando: 'Hoje, 14:20', sigla: 'ZM', conta: '@zenko.mkt', tipo: 'Reel', status: 'Publicando', classe: 'b-warn' },
  { quando: 'Hoje, 12:00', sigla: 'AU', conta: '@cliente.aurora', tipo: 'Carrossel', status: 'Publicado', classe: 'b-ok' },
  { quando: 'Hoje, 09:00', sigla: 'ZM', conta: 'Zenko MKT (TikTok)', tipo: 'Reel', status: 'Publicado', classe: 'b-ok' },
  { quando: 'Ontem, 19:30', sigla: 'NV', conta: '@nova.studio', tipo: 'Feed', status: 'Falhou', classe: 'b-danger' },
  { quando: 'Amanhã, 12:30', sigla: 'AU', conta: '@cliente.aurora', tipo: 'Carrossel', status: 'Agendado', classe: 'b-info' },
];

export default function Logs() {
  const toast = useToast();

  return (
    <section aria-labelledby="h-logs">
      <div
        className="view-head"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}
      >
        <div>
          <h1 id="h-logs">Logs</h1>
          <p>Acompanhe cada publicação em tempo real</p>
        </div>
        <div className="row" style={{ alignItems: 'center' }}>
          <span className="live">
            <span className="pulse" aria-hidden="true" />
            Ao vivo
          </span>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => toast('Lista atualizada.')}
          >
            <IconRefresh />
            Atualizar
          </button>
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="data">
          <caption className="vh">Histórico de publicações</caption>
          <thead>
            <tr>
              <th scope="col">Data / hora</th>
              <th scope="col">Conta</th>
              <th scope="col">Tipo</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {REGISTROS.map((r) => (
              <tr key={`${r.quando}-${r.conta}`}>
                <td>{r.quando}</td>
                <td>
                  <span className="cell-acct">
                    <span className="av" aria-hidden="true">{r.sigla}</span>
                    {r.conta}
                  </span>
                </td>
                <td>{r.tipo}</td>
                <td>
                  {/* O status nunca é comunicado só pela cor: o texto vem junto. */}
                  <span className={`badge ${r.classe}`}>
                    <span className="dt" aria-hidden="true" />
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
