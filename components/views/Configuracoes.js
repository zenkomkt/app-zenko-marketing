'use client';

import { useRef, useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { IconPlus } from '@/components/Icons';

const ABAS = [
  { id: 'perfil', rotulo: 'Perfil' },
  { id: 'equipe', rotulo: 'Equipe' },
  { id: 'notificacoes', rotulo: 'Notificações' },
  { id: 'seguranca', rotulo: 'Segurança' },
];

/* Fase 2: papéis reais, com permissões aplicadas no back-end. */
const EQUIPE = [
  { sigla: 'MV', nome: 'Matheus Vinicius', email: 'matheus@zenko.mkt', papel: 'Admin', classe: 'b-info', fixo: true },
  { sigla: 'JG', nome: 'Julio Garcia', email: 'julio@zenko.mkt', papel: 'Editor', classe: 'b-ok' },
  { sigla: 'RS', nome: 'Rafaela Souza', email: 'rafaela@zenko.mkt', papel: 'Publicador', classe: 'b-warn' },
];

function Switch({ label, inicial = false, onToggle }) {
  const [ligado, setLigado] = useState(inicial);
  return (
    <button
      type="button"
      className="switch"
      role="switch"
      aria-checked={ligado}
      aria-label={label}
      onClick={() => {
        setLigado((v) => !v);
        if (onToggle) onToggle(!ligado);
      }}
    />
  );
}

export default function Configuracoes() {
  const toast = useToast();
  const [aba, setAba] = useState('perfil');
  const refs = useRef({});

  // Setas ←/→, Home e End navegam entre as abas (padrão WAI-ARIA).
  function aoTeclar(e, indice) {
    const total = ABAS.length;
    let alvo = null;
    if (e.key === 'ArrowRight') alvo = ABAS[(indice + 1) % total];
    else if (e.key === 'ArrowLeft') alvo = ABAS[(indice - 1 + total) % total];
    else if (e.key === 'Home') [alvo] = ABAS;
    else if (e.key === 'End') alvo = ABAS[total - 1];
    if (!alvo) return;
    e.preventDefault();
    setAba(alvo.id);
    refs.current[alvo.id]?.focus();
  }

  return (
    <section aria-labelledby="h-config">
      <div className="view-head">
        <h1 id="h-config">Configurações</h1>
        <p>Perfil, equipe e preferências</p>
      </div>

      <div className="tabs" role="tablist" aria-label="Seções de configurações">
        {ABAS.map(({ id, rotulo }, i) => (
          <button
            type="button"
            key={id}
            id={`tab-${id}`}
            className="tab"
            role="tab"
            aria-selected={aba === id}
            aria-controls={`painel-${id}`}
            tabIndex={aba === id ? 0 : -1}
            ref={(el) => { refs.current[id] = el; }}
            onClick={() => setAba(id)}
            onKeyDown={(e) => aoTeclar(e, i)}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {/* Perfil */}
      <div
        className="tabpanel"
        role="tabpanel"
        id="painel-perfil"
        aria-labelledby="tab-perfil"
        tabIndex={0}
        hidden={aba !== 'perfil'}
      >
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="row" style={{ alignItems: 'center', marginBottom: 22 }}>
            <span className="avatar" style={{ width: 56, height: 56, fontSize: '1.2rem' }} aria-hidden="true">MV</span>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => toast('Aqui você trocaria a foto de perfil.')}>
              Trocar foto
            </button>
          </div>

          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input className="input" id="nome" defaultValue="Matheus Vinicius" />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input className="input" id="email" type="email" defaultValue="matheus@zenko.mkt" />
          </div>
          <div className="field">
            <label htmlFor="cargo">Cargo</label>
            <input className="input" id="cargo" defaultValue="Administrador" />
          </div>

          <button type="button" className="btn btn--primary" onClick={() => toast('Perfil salvo.')}>
            Salvar alterações
          </button>
        </div>
      </div>

      {/* Equipe */}
      <div
        className="tabpanel"
        role="tabpanel"
        id="painel-equipe"
        aria-labelledby="tab-equipe"
        tabIndex={0}
        hidden={aba !== 'equipe'}
      >
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Equipe</h2>
              <p className="card-sub" style={{ margin: 0 }}>Quem pode criar, aprovar e publicar</p>
            </div>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => toast('Aqui abriria o convite por e-mail.')}>
              <IconPlus />
              Convidar membro
            </button>
          </div>

          <div className="tbl-wrap">
            <table className="data">
              <caption className="vh">Membros da equipe</caption>
              <thead>
                <tr>
                  <th scope="col">Membro</th>
                  <th scope="col">E-mail</th>
                  <th scope="col">Papel</th>
                  <th scope="col"><span className="vh">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {EQUIPE.map(({ sigla, nome, email, papel, classe, fixo }) => (
                  <tr key={email}>
                    <td>
                      <span className="cell-acct">
                        <span className="av" aria-hidden="true">{sigla}</span>
                        {nome}
                      </span>
                    </td>
                    <td>{email}</td>
                    <td><span className={`badge ${classe}`}>{papel}</span></td>
                    <td>
                      {fixo ? '—' : (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => toast(`Aqui você editaria o papel de ${nome.split(' ')[0]}.`)}
                        >
                          Editar
                          <span className="vh"> o papel de {nome}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notificações */}
      <div
        className="tabpanel"
        role="tabpanel"
        id="painel-notificacoes"
        aria-labelledby="tab-notificacoes"
        tabIndex={0}
        hidden={aba !== 'notificacoes'}
      >
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="switch-row" style={{ paddingTop: 0 }}>
            <span className="sr-t">
              <b>Publicação concluída</b>
              <p>Avisar por e-mail quando um post for publicado.</p>
            </span>
            <Switch label="Avisar quando a publicação for concluída" inicial />
          </div>
          <div className="switch-row">
            <span className="sr-t">
              <b>Falha na publicação</b>
              <p>Avisar imediatamente se algo der errado.</p>
            </span>
            <Switch label="Avisar sobre falhas na publicação" inicial />
          </div>
          <div className="switch-row">
            <span className="sr-t">
              <b>Resumo semanal</b>
              <p>Enviar um resumo dos resultados toda segunda.</p>
            </span>
            <Switch label="Enviar resumo semanal" />
          </div>
        </div>
      </div>

      {/* Segurança */}
      <div
        className="tabpanel"
        role="tabpanel"
        id="painel-seguranca"
        aria-labelledby="tab-seguranca"
        tabIndex={0}
        hidden={aba !== 'seguranca'}
      >
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="switch-row" style={{ paddingTop: 0 }}>
            <span className="sr-t">
              <b>Verificação em duas etapas</b>
              <p>Uma camada extra de segurança no login.</p>
            </span>
            <Switch label="Ativar verificação em duas etapas" />
          </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 18 }}>
            <p style={{ fontWeight: 600, margin: '0 0 4px' }}>Sessão ativa</p>
            <p style={{ color: 'var(--muted)', fontSize: '.86rem', margin: '0 0 14px' }}>
              Chrome · Marechal Cândido Rondon, PR · agora
            </p>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => toast('Aqui você encerraria as outras sessões.')}
            >
              Encerrar outras sessões
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
