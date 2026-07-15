'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { criarClienteNavegador } from '@/lib/supabase/navegador';
import { IconFilm, IconImage, IconLayers, IconUpload, IconWarning, IconCalendar } from '@/components/Icons';

const TIPOS = [
  { id: 'reels', Icon: IconFilm, nome: 'Reels', desc: 'Vídeos verticais' },
  { id: 'feed', Icon: IconImage, nome: 'Feed', desc: 'Imagens no feed' },
  { id: 'carrossel', Icon: IconLayers, nome: 'Carrossel', desc: 'Múltiplos itens' },
];
const TRIAL = [
  { id: 'desativado', rotulo: 'Desativado' },
  { id: 'manual', rotulo: 'Manual' },
  { id: 'automatico', rotulo: 'Automático' },
];
const LIMITE_LEGENDA = 2200;

export default function Agendar() {
  const toast = useToast();
  const inputArquivo = useRef(null);

  const [contasDisponiveis, setContasDisponiveis] = useState([]);
  const [tipo, setTipo] = useState('feed');
  const [contas, setContas] = useState([]);
  const [legenda, setLegenda] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('09:00');
  const [midias, setMidias] = useState([]);
  const [trial, setTrial] = useState('desativado');
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const amanha = new Date(Date.now() + 86400000);
    setData(amanha.toISOString().slice(0, 10));

    fetch('/api/contas')
      .then((r) => r.json())
      .then(({ contas: lista = [] }) => {
        setContasDisponiveis(lista);
        const primeira = lista.find((c) => c.estado === 'ok');
        if (primeira) setContas([primeira.id]);
      })
      .catch(() => toast('Não consegui carregar as contas conectadas.'));
  }, [toast]);

  const alternarConta = (id) =>
    setContas((atual) => (atual.includes(id) ? atual.filter((c) => c !== id) : [...atual, id]));

  async function enviarArquivos(lista) {
    const arquivos = Array.from(lista || []);
    if (arquivos.length === 0) return;
    if (tipo !== 'carrossel' && arquivos.length > 1) {
      toast('Este tipo aceita só um arquivo. Usei o primeiro.');
      arquivos.length = 1;
    }

    setEnviando(true);
    const sb = criarClienteNavegador();
    const enviadas = [];
    try {
      for (const arquivo of arquivos) {
        const r = await fetch('/api/midia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: arquivo.name, mime: arquivo.type, tamanho: arquivo.size }),
        });
        const info = await r.json();
        if (!r.ok) throw new Error(info.erro);

        const { error } = await sb.storage.from('midias').uploadToSignedUrl(info.caminho, info.token, arquivo);
        if (error) throw new Error(error.message);

        enviadas.push({
          nome: arquivo.name, caminho: info.caminho, tipo_midia: info.tipo_midia,
          mime: arquivo.type, tamanho_bytes: arquivo.size,
        });
      }
      setMidias((atual) => (tipo === 'carrossel' ? [...atual, ...enviadas] : enviadas));
      toast(`${enviadas.length} arquivo(s) enviado(s).`);
    } catch (e) {
      toast(`Falha no upload: ${e.message}`);
    } finally {
      setEnviando(false);
    }
  }

  async function agendar() {
    if (contas.length === 0) return toast('Selecione ao menos uma conta de destino.');
    if (midias.length === 0) return toast('Faça o upload da mídia antes de agendar.');
    if (tipo === 'carrossel' && midias.length < 2) return toast('Carrossel precisa de pelo menos 2 itens.');

    const quando = new Date(`${data}T${hora}`);
    if (Number.isNaN(quando.getTime())) return toast('Data ou horário inválido.');
    if (quando < new Date()) return toast('O horário escolhido já passou.');

    setSalvando(true);
    try {
      const r = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo, legenda, agendado_para: quando.toISOString(),
          trial_reel: tipo === 'reels' ? trial : 'desativado',
          contas, midias, processar_ia: false,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro || (d.erros || []).join(' '));
      toast('Publicação agendada.');
      setLegenda('');
      setMidias([]);
    } catch (e) {
      toast(`Não deu para agendar: ${e.message}`);
    } finally {
      setSalvando(false);
    }
  }

  const contasOk = contasDisponiveis.filter((c) => c.estado === 'ok');

  return (
    <section aria-labelledby="h-agendar">
      <div className="view-head">
        <h1 id="h-agendar">Agendar post</h1>
        <p>Reels, feed e carrossel para as redes da Zenko</p>
      </div>

      <div className="split-2">
        <div className="stack">
          <div className="card">
            <h2 style={{ marginBottom: 16 }}>Tipo de publicação</h2>
            <div className="type-grid" role="radiogroup" aria-label="Tipo de publicação">
              {TIPOS.map(({ id, Icon, nome, desc }) => (
                <div className="type-opt" key={id}>
                  <input type="radio" name="tipo" id={`t-${id}`} checked={tipo === id}
                    onChange={() => { setTipo(id); setMidias([]); }} />
                  <label htmlFor={`t-${id}`}>
                    <span className="ic"><Icon /></span><b>{nome}</b><small>{desc}</small>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="field" style={{ marginBottom: 20 }}>
              <label id="dest-lbl">Contas de destino <span className="req" aria-hidden="true">*</span></label>
              {contasOk.length === 0 ? (
                <div className="callout"><IconWarning /><span>Nenhuma conta conectada ainda.</span></div>
              ) : (
                <div className="chip-select" role="group" aria-labelledby="dest-lbl">
                  {contasOk.map((c) => (
                    <button type="button" key={c.id} className="chip-tog"
                      aria-pressed={contas.includes(c.id)} onClick={() => alternarConta(c.id)}>
                      <span className="av" aria-hidden="true">{c.sigla}</span>
                      {c.usuario || c.nome_exibicao}
                      <span className="vh"> — {c.rede}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="field">
              <label htmlFor="legenda">Legenda</label>
              <textarea className="textarea" id="legenda" maxLength={LIMITE_LEGENDA}
                placeholder="Escreva a legenda da publicação…" value={legenda}
                onChange={(e) => setLegenda(e.target.value)} />
              <div className="field-foot">
                <span>Use quebras de linha e emojis à vontade.</span>
                <span>{legenda.length} / {LIMITE_LEGENDA}</span>
              </div>
            </div>

            <div className="grid-2">
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="data">Data <span className="req" aria-hidden="true">*</span></label>
                <input className="input" type="date" id="data" value={data}
                  onChange={(e) => setData(e.target.value)} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="hora">Horário <span className="req" aria-hidden="true">*</span></label>
                <input className="input" type="time" id="hora" value={hora}
                  onChange={(e) => setHora(e.target.value)} />
              </div>
            </div>
          </div>

          {tipo === 'reels' && (
            <div className="card">
              <h2 style={{ marginBottom: 6 }}>Trial Reel (Reels de teste)</h2>
              <p className="card-sub">Compartilhado primeiro só com não-seguidores.</p>
              <div className="callout" style={{ marginBottom: 16 }}>
                <IconWarning />
                <span>Só funciona em contas com <b>1k+ seguidores</b>. Abaixo disso, publica sem os parâmetros de teste.</span>
              </div>
              <div className="seg" role="group" aria-label="Modo Trial Reel">
                {TRIAL.map(({ id, rotulo }) => (
                  <button type="button" key={id} aria-pressed={trial === id} onClick={() => setTrial(id)}>{rotulo}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <button type="button" className="btn btn--primary" style={{ padding: '13px 26px' }}
              onClick={agendar} disabled={salvando || enviando}>
              <IconCalendar />
              {salvando ? 'Agendando…' : 'Agendar publicação'}
            </button>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <h2 style={{ marginBottom: 16 }}>Prévia da mídia</h2>
            <div className={`preview-box${arrastando ? ' drag' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
              onDragLeave={() => setArrastando(false)}
              onDrop={(e) => { e.preventDefault(); setArrastando(false); enviarArquivos(e.dataTransfer.files); }}>
              <span className="ic" aria-hidden="true"><IconUpload /></span>
              <b style={{ color: 'var(--foam)' }}>Faça upload da mídia</b>
              <p aria-live="polite">
                {enviando ? 'Enviando…' : midias.length
                  ? `${midias.length} arquivo(s): ${midias.map((m) => m.nome).join(', ')}`
                  : 'Arraste um arquivo ou escolha abaixo'}
              </p>
              <input type="file" id="arquivo" className="vh" ref={inputArquivo}
                multiple={tipo === 'carrossel'}
                accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp"
                onChange={(e) => enviarArquivos(e.target.files)} />
              <div style={{ marginTop: 14 }}>
                <button type="button" className="btn btn--ghost btn--sm"
                  onClick={() => inputArquivo.current?.click()} disabled={enviando}>Escolher arquivo</button>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: 14 }}>Dicas</h2>
            <ul className="tips">
              <li>Feed: o Instagram só aceita <b>JPEG</b> pela API.</li>
              <li>Reels: vertical 1080×1920 (9:16), até 90 segundos.</li>
              <li>Carrossel: de 2 a 10 itens.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}