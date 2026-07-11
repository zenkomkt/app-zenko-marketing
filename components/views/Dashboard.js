'use client';

import Link from 'next/link';
import { IconUsers, IconClock, IconCheck, IconTrend, IconUpload, IconImage } from '@/components/Icons';

/* Fase 2: estes dados virão do back-end. Por enquanto são exemplos. */
const METRICAS = [
  { Icon: IconUsers, valor: '12', rotulo: 'Contas conectadas' },
  { Icon: IconClock, valor: '48', rotulo: 'Posts agendados' },
  { Icon: IconCheck, valor: '231', rotulo: 'Publicados no mês', tendencia: '+18 esta semana' },
  { Icon: IconTrend, valor: '99%', rotulo: 'Taxa de sucesso' },
];

const PROXIMAS = [
  { Icon: IconUpload, titulo: 'Reel — bastidores do ensaio', quando: 'Hoje, 18:00 · @zenko.mkt', rede: 'Instagram' },
  { Icon: IconImage, titulo: 'Carrossel — 5 dicas de copy', quando: 'Amanhã, 12:30 · @cliente.aurora', rede: 'Instagram' },
  { Icon: IconUpload, titulo: 'Reel — trend da semana', quando: 'Qui, 09:00 · @zenko.mkt', rede: 'TikTok' },
];

export default function Dashboard() {
  return (
    <section aria-labelledby="h-dashboard">
      <div className="view-head">
        <h1 id="h-dashboard">Dashboard</h1>
        <p>Visão geral das publicações da Zenko</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {METRICAS.map(({ Icon, valor, rotulo, tendencia }) => (
          <div className="card stat" key={rotulo}>
            <span className="ic"><Icon /></span>
            <div>
              <div className="n">{valor}</div>
              <div className="l">{rotulo}</div>
              {tendencia && <div className="t">{tendencia}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="split-2">
        <div className="card">
          <div className="card-head">
            <h2>Próximas publicações</h2>
            <Link className="btn btn--ghost btn--sm" href="/calendario">Ver calendário</Link>
          </div>
          <div className="list">
            {PROXIMAS.map(({ Icon, titulo, quando, rede }) => (
              <div className="list-item" key={titulo}>
                <span className="thumb"><Icon /></span>
                <span className="li-main">
                  <span className="li-t">{titulo}</span>
                  <span className="li-s">{quando}</span>
                </span>
                <span className="net">{rede}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Primeiros passos</h2>
          <p className="card-sub">Configure sua conta em 3 etapas</p>
          <div className="steps">
            <div className="step done">
              <span className="chk" aria-hidden="true"><IconCheck /></span>
              <span className="txt"><b>Conectar uma conta</b></span>
              <span className="badge b-ok"><span className="dt" aria-hidden="true" />Feito</span>
            </div>
            <div className="step done">
              <span className="chk" aria-hidden="true"><IconCheck /></span>
              <span className="txt"><b>Criar o primeiro post</b></span>
              <span className="badge b-ok"><span className="dt" aria-hidden="true" />Feito</span>
            </div>
            <div className="step">
              <span className="chk" aria-hidden="true" />
              <span className="txt"><b>Convidar a equipe</b></span>
              <Link className="btn btn--ghost btn--sm" href="/configuracoes">Convidar</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
