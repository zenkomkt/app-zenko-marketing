'use client';

import { useRef, useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { IconUpload, IconArrowRight } from '@/components/Icons';

const ETAPAS = ['Upload', 'Montagem', 'Agendar'];

export default function Carrossel() {
  const toast = useToast();
  const inputArquivos = useRef(null);
  const [arrastando, setArrastando] = useState(false);
  const [arquivos, setArquivos] = useState([]);

  function receber(lista) {
    const nomes = Array.from(lista || []).map((f) => f.name);
    setArquivos(nomes);
    toast(
      nomes.length
        ? `${nomes.length} arquivo(s) recebido(s) (simulação).`
        : 'Arquivos recebidos (simulação).',
    );
  }

  function montar() {
    if (arquivos.length === 0) {
      toast('Adicione arquivos para montar os carrosséis.');
      return;
    }
    // Fase 2: aqui entra a montagem real e o envio ao back-end.
    toast('Montagem dos carrosséis iniciada (simulação).');
  }

  return (
    <section aria-labelledby="h-carrossel">
      <div className="view-head">
        <h1 id="h-carrossel">Carrossel em massa</h1>
        <p>Crie e agende vários carrosséis de uma vez</p>
      </div>

      <div className="card">
        <ol className="stepper" aria-label="Etapas do processo" style={{ listStyle: 'none', padding: 0 }}>
          {ETAPAS.map((etapa, i) => (
            <li key={etapa} style={{ display: 'contents' }}>
              <span className={`st${i === 0 ? ' active' : ''}`}>
                <span className="no" aria-hidden="true">{i + 1}</span>
                {etapa}
                {i === 0 && <span className="vh"> (etapa atual)</span>}
              </span>
              {i < ETAPAS.length - 1 && <span className="arw" aria-hidden="true">›</span>}
            </li>
          ))}
        </ol>

        <button
          type="button"
          className={`dropzone${arrastando ? ' drag' : ''}`}
          onClick={() => inputArquivos.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            receber(e.dataTransfer.files);
          }}
        >
          <span className="ic" aria-hidden="true"><IconUpload /></span>
          <b>Arraste arquivos aqui ou clique para selecionar</b>
          <p>Imagens (JPG, PNG, WebP) e vídeos (MP4, MOV, WebM)</p>
        </button>

        <input
          type="file"
          multiple
          className="vh"
          ref={inputArquivos}
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
          onChange={(e) => receber(e.target.files)}
          aria-label="Selecionar imagens e vídeos para os carrosséis"
        />

        {arquivos.length > 0 && (
          <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginTop: 14 }}>
            {arquivos.length} arquivo(s) na fila: {arquivos.slice(0, 3).join(', ')}
            {arquivos.length > 3 ? '…' : ''}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" className="btn btn--primary" onClick={montar}>
            Montar carrosséis
            <IconArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}
