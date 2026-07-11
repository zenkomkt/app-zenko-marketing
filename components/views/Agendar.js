'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import {
  IconFilm, IconImage, IconLayers, IconUpload, IconWarning, IconCalendar,
} from '@/components/Icons';

const TIPOS = [
  { id: 'reels', Icon: IconFilm, nome: 'Reels', desc: 'Vídeos verticais' },
  { id: 'feed', Icon: IconImage, nome: 'Feed', desc: 'Imagens no feed' },
  { id: 'carrossel', Icon: IconLayers, nome: 'Carrossel', desc: 'Múltiplos itens' },
];

const CONTAS = [
  { id: 'zenko', sigla: 'ZM', nome: '@zenko.mkt' },
  { id: 'aurora', sigla: 'AU', nome: '@cliente.aurora' },
  { id: 'nova', sigla: 'NV', nome: '@nova.studio' },
];

const TRIAL = ['Desativado', 'Manual', 'Automático'];
const LIMITE_LEGENDA = 2200;

export default function Agendar() {
  const toast = useToast();
  const inputArquivo = useRef(null);

  const [tipo, setTipo] = useState('reels');
  const [contas, setContas] = useState(['zenko']);
  const [legenda, setLegenda] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('09:00');
  const [arquivo, setArquivo] = useState('');
  const [trial, setTrial] = useState('Desativado');
  const [arrastando, setArrastando] = useState(false);

  // A data padrão (amanhã) é definida depois da montagem para o HTML do
  // servidor e o do navegador nascerem iguais.
  useEffect(() => {
    const amanha = new Date(Date.now() + 86400000);
    setData(amanha.toISOString().slice(0, 10));
  }, []);

  const alternarConta = (id) =>
    setContas((atual) => (atual.includes(id) ? atual.filter((c) => c !== id) : [...atual, id]));

  function agendar() {
    if (contas.length === 0) {
      toast('Selecione ao menos uma conta de destino.');
      return;
    }
    if (!arquivo) {
      toast('Faça o upload da mídia antes de agendar.');
      return;
    }
    // Fase 2: aqui entra a chamada ao back-end (POST /api/posts).
    toast('Publicação agendada com sucesso (simulação).');
  }

  function receberArquivo(nome) {
    setArquivo(nome);
    toast('Mídia carregada (simulação).');
  }

  return (
    <section aria-labelledby="h-agendar">
      <div className="view-head">
        <h1 id="h-agendar">Agendar post</h1>
        <p>Reels, feed e carrossel para as redes da Zenko</p>
      </div>

      <div className="split-2">
        <div className="stack">
          {/* Tipo de publicação */}
          <div className="card">
            <h2 style={{ marginBottom: 16 }}>Tipo de publicação</h2>
            <div className="type-grid" role="radiogroup" aria-label="Tipo de publicação">
              {TIPOS.map(({ id, Icon, nome, desc }) => (
                <div className="type-opt" key={id}>
                  <input
                    type="radio"
                    name="tipo"
                    id={`t-${id}`}
                    checked={tipo === id}
                    onChange={() => setTipo(id)}
                  />
                  <label htmlFor={`t-${id}`}>
                    <span className="ic"><Icon /></span>
                    <b>{nome}</b>
                    <small>{desc}</small>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Destinos, legenda e horário */}
          <div className="card">
            <div className="field" style={{ marginBottom: 20 }}>
              <label id="dest-lbl">
                Contas de destino <span className="req" aria-hidden="true">*</span>
              </label>
              <div className="chip-select" role="group" aria-labelledby="dest-lbl">
                {CONTAS.map(({ id, sigla, nome }) => (
                  <button
                    type="button"
                    key={id}
                    className="chip-tog"
                    aria-pressed={contas.includes(id)}
                    onClick={() => alternarConta(id)}
                  >
                    <span className="av" aria-hidden="true">{sigla}</span>
                    {nome}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="legenda">Legenda</label>
              <textarea
                className="textarea"
                id="legenda"
                maxLength={LIMITE_LEGENDA}
                placeholder="Escreva a legenda da publicação…"
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
              />
              <div className="field-foot">
                <span>Use quebras de linha e emojis à vontade.</span>
                <span>{legenda.length} / {LIMITE_LEGENDA}</span>
              </div>
            </div>

            <div className="grid-2">
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="data">
                  Data <span className="req" aria-hidden="true">*</span>
                </label>
                <input
                  className="input"
                  type="date"
                  id="data"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="hora">
                  Horário <span className="req" aria-hidden="true">*</span>
                </label>
                <input
                  className="input"
                  type="time"
                  id="hora"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Trial Reel — só faz sentido em Reels */}
          {tipo === 'reels' && (
            <div className="card">
              <h2 style={{ marginBottom: 6 }}>Trial Reel (Reels de teste)</h2>
              <p className="card-sub">
                Compartilhado primeiro só com não-seguidores; depois fica visível para todos.
              </p>
              <div className="callout" style={{ marginBottom: 16 }}>
                <IconWarning />
                <span>
                  Só funciona em contas do Instagram com <b>1k+ seguidores</b>. Abaixo disso, o post
                  publica sem os parâmetros de teste.
                </span>
              </div>
              <div className="seg" role="group" aria-label="Modo Trial Reel">
                {TRIAL.map((modo) => (
                  <button
                    type="button"
                    key={modo}
                    aria-pressed={trial === modo}
                    onClick={() => setTrial(modo)}
                  >
                    {modo}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <button
              type="button"
              className="btn btn--primary"
              style={{ padding: '13px 26px' }}
              onClick={agendar}
            >
              <IconCalendar />
              Agendar publicação
            </button>
          </div>
        </div>

        {/* Coluna lateral: prévia e dicas */}
        <div className="stack">
          <div className="card">
            <h2 style={{ marginBottom: 16 }}>Prévia da mídia</h2>
            <div
              className={`preview-box${arrastando ? ' drag' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
              onDragLeave={() => setArrastando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastando(false);
                const f = e.dataTransfer.files?.[0];
                receberArquivo(f ? f.name : 'arquivo recebido');
              }}
            >
              <span className="ic" aria-hidden="true"><IconUpload /></span>
              <b style={{ color: 'var(--foam)' }}>Faça upload da mídia</b>
              <p>{arquivo ? `Selecionado: ${arquivo}` : 'Arraste um arquivo ou escolha abaixo'}</p>

              <input
                type="file"
                id="arquivo"
                className="vh"
                ref={inputArquivo}
                accept="video/mp4,video/quicktime,image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) receberArquivo(f.name);
                }}
              />
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => inputArquivo.current?.click()}
                >
                  Escolher arquivo
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: 14 }}>Dicas</h2>
            <ul className="tips">
              <li>Selecione ao menos 1 conta de destino.</li>
              <li>Faça o upload antes de agendar.</li>
              <li>Vídeo vertical 1080×1920 (9:16) para Reels.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
