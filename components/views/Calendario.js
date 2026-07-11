'use client';

import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { IconChevronLeft, IconChevronRight, IconCalendar } from '@/components/Icons';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DIAS = [
  { curto: 'Dom', longo: 'Domingo' }, { curto: 'Seg', longo: 'Segunda' },
  { curto: 'Ter', longo: 'Terça' }, { curto: 'Qua', longo: 'Quarta' },
  { curto: 'Qui', longo: 'Quinta' }, { curto: 'Sex', longo: 'Sexta' },
  { curto: 'Sáb', longo: 'Sábado' },
];

const PERFIS = ['Todos os perfis', '@zenko.mkt', '@cliente.aurora', '@nova.studio'];

export default function Calendario() {
  const toast = useToast();
  const [hoje, setHoje] = useState(null); // só depois da montagem: evita divergência servidor/navegador
  const [deslocamento, setDeslocamento] = useState(0);
  const [perfil, setPerfil] = useState(PERFIS[0]);

  useEffect(() => setHoje(new Date()), []);

  const grade = useMemo(() => {
    if (!hoje) return null;

    const base = new Date(hoje.getFullYear(), hoje.getMonth() + deslocamento, 1);
    const ano = base.getFullYear();
    const mes = base.getMonth();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const mesAtual = ano === hoje.getFullYear() && mes === hoje.getMonth();

    // Fase 2: as publicações virão do back-end, filtradas pelo perfil.
    const eventos = {};
    if (mesAtual) {
      const d = hoje.getDate();
      eventos[d] = [{ texto: '18h · Reel @zenko.mkt' }];
      if (d + 1 <= totalDias) eventos[d + 1] = [{ texto: '12h · Carrossel @aurora', alt: true }];
      if (d + 3 <= totalDias) eventos[d + 3] = [{ texto: '09h · Reel TikTok' }];
    }

    const semanas = [];
    let dia = 1;
    for (let s = 0; s < 6 && dia <= totalDias; s += 1) {
      const semana = [];
      for (let c = 0; c < 7; c += 1) {
        if ((s === 0 && c < primeiroDiaSemana) || dia > totalDias) {
          semana.push(null);
        } else {
          semana.push({
            dia,
            hoje: mesAtual && dia === hoje.getDate(),
            eventos: eventos[dia] || [],
          });
          dia += 1;
        }
      }
      semanas.push(semana);
    }

    return { rotulo: `${MESES[mes]} ${ano}`, semanas };
  }, [hoje, deslocamento]);

  return (
    <section aria-labelledby="h-calendario">
      <div className="view-head">
        <h1 id="h-calendario">Calendário</h1>
        <p>Publicações por perfil</p>
      </div>

      <div className="card">
        <div className="cal-top">
          <div className="field" style={{ margin: 0, minWidth: 220 }}>
            <label htmlFor="perfil" className="vh">Perfil</label>
            <select
              className="select"
              id="perfil"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
            >
              {PERFIS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="cal-nav">
            <button
              type="button"
              className="icon-btn"
              aria-label="Mês anterior"
              onClick={() => setDeslocamento((v) => v - 1)}
            >
              <IconChevronLeft />
            </button>
            <span className="lbl" aria-live="polite">{grade ? grade.rotulo : '—'}</span>
            <button
              type="button"
              className="icon-btn"
              aria-label="Próximo mês"
              onClick={() => setDeslocamento((v) => v + 1)}
            >
              <IconChevronRight />
            </button>
          </div>
        </div>

        {!grade ? (
          <div className="empty">
            <span className="ic" aria-hidden="true"><IconCalendar /></span>
            <b>Carregando o calendário…</b>
          </div>
        ) : (
          <table className="cal">
            <caption className="vh">Calendário de publicações — {grade.rotulo}</caption>
            <thead>
              <tr>
                {DIAS.map(({ curto, longo }) => (
                  <th scope="col" key={curto}><abbr title={longo}>{curto}</abbr></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grade.semanas.map((semana, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={i}>
                  {semana.map((celula, j) => (
                    celula === null ? (
                      // eslint-disable-next-line react/no-array-index-key
                      <td className="empty" key={`v-${i}-${j}`} />
                    ) : (
                      <td
                        key={celula.dia}
                        className={celula.hoje ? 'today' : undefined}
                        aria-current={celula.hoje ? 'date' : undefined}
                      >
                        <span className="dn">{celula.dia}</span>
                        {celula.eventos.map((ev) => (
                          <button
                            type="button"
                            key={ev.texto}
                            className={`ev${ev.alt ? ' alt' : ''}`}
                            onClick={() => toast(`Abriria os detalhes: ${ev.texto}`)}
                          >
                            {ev.texto}
                          </button>
                        ))}
                      </td>
                    )
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
