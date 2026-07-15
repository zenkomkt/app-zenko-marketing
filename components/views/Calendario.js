'use client';

import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ToastProvider';

/**
 * Calendário de publicações. Lê /api/posts no intervalo do mês visível e
 * marca os dias que têm post agendado/publicado.
 */

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const COR_STATUS = {
  agendado: 'b-info',
  publicando: 'b-warn',
  aguardando_ia: 'b-warn',
  publicado: 'b-ok',
  falhou: 'b-danger',
  cancelado: 'b-warn',
};

const ROTULO_STATUS = {
  agendado: 'Agendado',
  publicando: 'Publicando',
  aguardando_ia: 'Processando IA',
  publicado: 'Publicado',
  falhou: 'Falhou',
  cancelado: 'Cancelado',
};

export default function Calendario() {
  const toast = useToast();
  const hoje = new Date();

  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());
  const [posts, setPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [diaAberto, setDiaAberto] = useState(null);

  useEffect(() => {
    setCarregando(true);
    const de = new Date(ano, mes, 1).toISOString();
    const ate = new Date(ano, mes + 1, 0, 23, 59, 59).toISOString();

    fetch(`/api/posts?de=${de}&ate=${ate}`)
      .then((r) => r.json())
      .then(({ posts: lista = [] }) => setPosts(lista))
      .catch(() => toast('Não consegui carregar o calendário.'))
      .finally(() => setCarregando(false));
  }, [ano, mes, toast]);

  // Agrupa os posts por dia do mês.
  const porDia = useMemo(() => {
    const mapa = {};
    for (const p of posts) {
      const d = new Date(p.agendado_para);
      const dia = d.getDate();
      (mapa[dia] ??= []).push(p);
    }
    return mapa;
  }, [posts]);

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const celulas = [...Array(primeiroDiaSemana).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)];

  function mudarMes(delta) {
    setDiaAberto(null);
    let m = mes + delta;
    let a = ano;
    if (m < 0) { m = 11; a -= 1; }
    if (m > 11) { m = 0; a += 1; }
    setMes(m);
    setAno(a);
  }

  const ehHoje = (dia) =>
    dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();

  const hora = (iso) =>
    new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <section aria-labelledby="h-calendario">
      <div className="view-head"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 id="h-calendario">Calendário</h1>
          <p>Suas publicações agendadas e feitas</p>
        </div>
        <div className="row" style={{ alignItems: 'center', gap: 8 }}>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => mudarMes(-1)}
            aria-label="Mês anterior">‹</button>
          <strong style={{ minWidth: 160, textAlign: 'center' }} aria-live="polite">
            {MESES[mes]} {ano}
          </strong>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => mudarMes(1)}
            aria-label="Próximo mês">›</button>
        </div>
      </div>

      <div className="card">
        {carregando && <p style={{ color: 'var(--muted)' }}>Carregando…</p>}

        <div role="grid" aria-label={`Calendário de ${MESES[mes]} de ${ano}`}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {DIAS.map((d) => (
            <div key={d} role="columnheader"
              style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--muted)', padding: '4px 0', fontWeight: 600 }}>
              {d}
            </div>
          ))}

          {celulas.map((dia, i) => {
            if (dia === null) return <div key={`v-${i}`} aria-hidden="true" />;
            const doDia = porDia[dia] ?? [];
            const temPost = doDia.length > 0;

            return (
              <button key={dia} type="button"
                onClick={() => temPost && setDiaAberto(diaAberto === dia ? null : dia)}
                aria-label={`Dia ${dia}${temPost ? `, ${doDia.length} publicação(ões)` : ''}`}
                style={{
                  minHeight: 72, padding: 8, textAlign: 'left', borderRadius: 10,
                  border: ehHoje(dia) ? '2px solid var(--foam)' : '1px solid var(--linha, #ffffff18)',
                  background: diaAberto === dia ? '#ffffff12' : 'transparent',
                  cursor: temPost ? 'pointer' : 'default', color: 'inherit',
                }}>
                <div style={{ fontWeight: ehHoje(dia) ? 700 : 500, marginBottom: 4 }}>{dia}</div>
                {doDia.slice(0, 2).map((p) => (
                  <div key={p.id} className={`badge ${COR_STATUS[p.status] ?? 'b-info'}`}
                    style={{ fontSize: '.68rem', marginBottom: 2, display: 'block', width: 'fit-content' }}>
                    <span className="dt" aria-hidden="true" />{hora(p.agendado_para)}
                  </div>
                ))}
                {doDia.length > 2 && (
                  <div style={{ fontSize: '.68rem', color: 'var(--muted)' }}>+{doDia.length - 2}</div>
                )}
              </button>
            );
          })}
        </div>

        {diaAberto && porDia[diaAberto] && (
          <div style={{ marginTop: 20, borderTop: '1px solid #ffffff18', paddingTop: 16 }} aria-live="polite">
            <h2 style={{ marginBottom: 12 }}>{diaAberto} de {MESES[mes]}</h2>
            <div className="list">
              {porDia[diaAberto].map((p) => (
                <div className="list-item" key={p.id}>
                  <span className="li-main">
                    <span className="li-t">{p.tipo === 'reels' ? 'Reels' : p.tipo === 'carrossel' ? 'Carrossel' : 'Feed'} · {hora(p.agendado_para)}</span>
                    <span className="li-s">{p.legenda?.slice(0, 60) || 'Sem legenda'}{p.legenda?.length > 60 ? '…' : ''}</span>
                  </span>
                  <span className={`badge ${COR_STATUS[p.status] ?? 'b-info'}`}>
                    <span className="dt" aria-hidden="true" />{ROTULO_STATUS[p.status] ?? p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}