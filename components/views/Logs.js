'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ToastProvider';
import { criarClienteNavegador } from '@/lib/supabase/navegador';
import { IconRefresh } from '@/components/Icons';

/**
 * Logs em tempo real. Lê da tabela `logs` e escuta mudanças via Realtime —
 * quando um post é publicado, a linha aparece aqui sozinha, sem F5.
 */

const NIVEL = {
  info: { classe: 'b-ok', rotulo: 'OK' },
  aviso: { classe: 'b-warn', rotulo: 'Aviso' },
  erro: { classe: 'b-danger', rotulo: 'Erro' },
};

// Traduz o nome técnico do evento para algo legível.
const EVENTO = {
  publicado: 'Publicado',
  publicacao_falhou: 'Falha ao publicar',
  post_agendado: 'Post agendado',
  contas_conectadas: 'Contas conectadas',
  contas_cadastradas_system_user: 'Contas cadastradas',
  oauth_meta_falhou: 'Falha na conexão com a Meta',
  video_processado: 'Vídeo processado',
  ia_falhou: 'Falha no processamento de IA',
};

function quando(iso) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function Logs() {
  const toast = useToast();
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const sb = criarClienteNavegador();
    const { data, error } = await sb
      .from('logs')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(100);
    if (error) toast('Não consegui carregar os logs.');
    else setRegistros(data ?? []);
    setCarregando(false);
  }, [toast]);

  useEffect(() => {
    carregar();

    // Realtime: nova linha em `logs` entra no topo automaticamente.
    const sb = criarClienteNavegador();
    const canal = sb
      .channel('logs-tempo-real')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logs' },
        (payload) => setRegistros((atual) => [payload.new, ...atual].slice(0, 100)))
      .subscribe();

    return () => { sb.removeChannel(canal); };
  }, [carregar]);

  return (
    <section aria-labelledby="h-logs">
      <div className="view-head"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 id="h-logs">Logs</h1>
          <p>Acompanhe cada publicação em tempo real</p>
        </div>
        <div className="row" style={{ alignItems: 'center' }}>
          <span className="live"><span className="pulse" aria-hidden="true" />Ao vivo</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={carregar}>
            <IconRefresh />Atualizar
          </button>
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="data">
          <caption className="vh">Histórico de eventos</caption>
          <thead>
            <tr>
              <th scope="col">Data / hora</th>
              <th scope="col">Evento</th>
              <th scope="col">Detalhe</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>Carregando…</td></tr>
            )}

            {!carregando && registros.length === 0 && (
              <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>
                Nenhum evento ainda. Quando você publicar, aparece aqui.
              </td></tr>
            )}

            {registros.map((r) => {
              const nivel = NIVEL[r.nivel] ?? NIVEL.info;
              const permalink = r.detalhe?.permalink;
              return (
                <tr key={r.id}>
                  <td>{quando(r.criado_em)}</td>
                  <td>{EVENTO[r.evento] ?? r.evento}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
                    {r.detalhe?.rede && <span>{r.detalhe.rede} · </span>}
                    {r.detalhe?.msg || (permalink
                      ? <a href={permalink} target="_blank" rel="noreferrer">ver publicação</a>
                      : '—')}
                  </td>
                  <td>
                    <span className={`badge ${nivel.classe}`}>
                      <span className="dt" aria-hidden="true" />
                      {nivel.rotulo}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}