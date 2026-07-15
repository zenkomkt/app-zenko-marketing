'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';
import { criarClienteNavegador } from '@/lib/supabase/navegador';
import { IconUsers, IconClock, IconCheck, IconTrend, IconUpload, IconImage } from '@/components/Icons';

/**
 * Dashboard com números reais, calculados a partir do banco.
 * Nada de valores fixos: tudo vem de contas_visiveis, posts e post_destinos.
 */

function quando(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

const ICONE_TIPO = { reels: IconUpload, feed: IconImage, carrossel: IconImage };

export default function Dashboard() {
  const toast = useToast();
  const [metricas, setMetricas] = useState(null);
  const [proximas, setProximas] = useState([]);
  const [temConta, setTemConta] = useState(true);

  useEffect(() => {
    async function carregar() {
      const sb = criarClienteNavegador();
      const agora = new Date().toISOString();
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      // Uma consulta por número — count é barato, não traz linhas.
      const [contas, agendados, publicadosMes, destinos] = await Promise.all([
        sb.from('contas_visiveis').select('id', { count: 'exact', head: true }),
        sb.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'agendado'),
        sb.from('posts').select('id', { count: 'exact', head: true })
          .eq('status', 'publicado').gte('agendado_para', inicioMes),
        sb.from('post_destinos').select('status'),
      ]);

      // Taxa de sucesso = publicados / (publicados + falhas), entre os destinos já resolvidos.
      const linhas = destinos.data ?? [];
      const ok = linhas.filter((d) => d.status === 'publicado').length;
      const falhou = linhas.filter((d) => d.status === 'falhou').length;
      const taxa = ok + falhou > 0 ? Math.round((ok / (ok + falhou)) * 100) : 100;

      setTemConta((contas.count ?? 0) > 0);
      setMetricas({
        contas: contas.count ?? 0,
        agendados: agendados.count ?? 0,
        publicadosMes: publicadosMes.count ?? 0,
        taxa,
      });

      // Próximas publicações: os agendados futuros, mais cedo primeiro.
      const { data: prox } = await sb
        .from('posts')
        .select('*, post_destinos(conta:contas_visiveis(usuario, nome_exibicao, rede))')
        .eq('status', 'agendado')
        .gte('agendado_para', agora)
        .order('agendado_para', { ascending: true })
        .limit(5);

      setProximas(prox ?? []);
    }

    carregar().catch(() => toast('Não consegui carregar o dashboard.'));
  }, [toast]);

  const cards = metricas ? [
    { Icon: IconUsers, valor: metricas.contas, rotulo: 'Contas conectadas' },
    { Icon: IconClock, valor: metricas.agendados, rotulo: 'Posts agendados' },
    { Icon: IconCheck, valor: metricas.publicadosMes, rotulo: 'Publicados no mês' },
    { Icon: IconTrend, valor: `${metricas.taxa}%`, rotulo: 'Taxa de sucesso' },
  ] : [];

  return (
    <section aria-labelledby="h-dashboard">
      <div className="view-head">
        <h1 id="h-dashboard">Dashboard</h1>
        <p>Visão geral das publicações da Zenko</p>
      </div>

      {!temConta && (
        <div className="callout" style={{ marginBottom: 20 }}>
          <span>
            Nenhuma conta conectada ainda. Vá em <Link href="/contas"><b>Contas sociais</b></Link> para começar.
          </span>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {!metricas
          ? [0, 1, 2, 3].map((i) => (
              <div className="card stat" key={i}>
                <div><div className="n" style={{ color: 'var(--muted)' }}>—</div><div className="l">Carregando…</div></div>
              </div>
            ))
          : cards.map(({ Icon, valor, rotulo }) => (
              <div className="card stat" key={rotulo}>
                <span className="ic"><Icon /></span>
                <div><div className="n">{valor}</div><div className="l">{rotulo}</div></div>
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
            {proximas.length === 0 && (
              <p style={{ color: 'var(--muted)' }}>
                Nenhuma publicação agendada. <Link href="/agendar">Agendar agora</Link>.
              </p>
            )}

            {proximas.map((p) => {
              const Icon = ICONE_TIPO[p.tipo] ?? IconImage;
              const destino = p.post_destinos?.[0]?.conta;
              const nomeDest = destino?.usuario || destino?.nome_exibicao || 'conta';
              const extras = (p.post_destinos?.length ?? 1) - 1;
              return (
                <div className="list-item" key={p.id}>
                  <span className="thumb"><Icon /></span>
                  <span className="li-main">
                    <span className="li-t">
                      {p.tipo === 'reels' ? 'Reels' : p.tipo === 'carrossel' ? 'Carrossel' : 'Feed'}
                      {p.legenda ? ` — ${p.legenda.slice(0, 40)}${p.legenda.length > 40 ? '…' : ''}` : ''}
                    </span>
                    <span className="li-s">
                      {quando(p.agendado_para)} · {nomeDest}{extras > 0 ? ` +${extras}` : ''}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2>Primeiros passos</h2>
          <p className="card-sub">Configure sua conta em 3 etapas</p>
          <div className="steps">
            <div className={`step${temConta ? ' done' : ''}`}>
              <span className="chk" aria-hidden="true">{temConta && <IconCheck />}</span>
              <span className="txt"><b>Conectar uma conta</b></span>
              {temConta
                ? <span className="badge b-ok"><span className="dt" aria-hidden="true" />Feito</span>
                : <Link className="btn btn--ghost btn--sm" href="/contas">Conectar</Link>}
            </div>
            <div className={`step${metricas?.publicadosMes > 0 || metricas?.agendados > 0 ? ' done' : ''}`}>
              <span className="chk" aria-hidden="true">
                {(metricas?.publicadosMes > 0 || metricas?.agendados > 0) && <IconCheck />}
              </span>
              <span className="txt"><b>Criar o primeiro post</b></span>
              {(metricas?.publicadosMes > 0 || metricas?.agendados > 0)
                ? <span className="badge b-ok"><span className="dt" aria-hidden="true" />Feito</span>
                : <Link className="btn btn--ghost btn--sm" href="/agendar">Criar</Link>}
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