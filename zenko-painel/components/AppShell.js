'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from './ToastProvider';
import {
  LogoZ, IconGrid, IconUpload, IconLayers, IconCalendar,
  IconUsers, IconScroll, IconGear, IconMenu, IconBell, IconPlus,
} from './Icons';

const NAV = [
  {
    group: 'Publicação',
    items: [
      { href: '/', label: 'Dashboard', Icon: IconGrid },
      { href: '/agendar', label: 'Agendar post', Icon: IconUpload },
      { href: '/carrossel', label: 'Carrossel em massa', Icon: IconLayers },
      { href: '/calendario', label: 'Calendário', Icon: IconCalendar },
    ],
  },
  {
    group: 'Gestão',
    items: [
      { href: '/contas', label: 'Contas', Icon: IconUsers },
      { href: '/logs', label: 'Logs', Icon: IconScroll },
      { href: '/configuracoes', label: 'Configurações', Icon: IconGear },
    ],
  },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const mainRef = useRef(null);
  const menuBtnRef = useRef(null);
  const firstRender = useRef(true);

  const close = useCallback(() => setOpen(false), []);

  // Ao trocar de rota: fecha o menu e leva o foco para o conteúdo.
  // (Sem isso, quem navega por teclado ou leitor de tela ficaria "preso" no menu.)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setOpen(false);
    if (mainRef.current) mainRef.current.focus();
  }, [pathname]);

  // Esc fecha o menu no celular e devolve o foco ao botão que o abriu.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
        if (menuBtnRef.current) menuBtnRef.current.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <a className="skip" href="#main">Pular para o conteúdo</a>

      <div
        className={`backdrop${open ? ' show' : ''}`}
        onClick={close}
        hidden={!open}
        aria-hidden="true"
      />

      <div className="app">
        <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar">
          <Link className="side-brand" href="/" aria-label="Zenko — início">
            <LogoZ className="mark" />
            <span>
              <span className="word">ZENKO</span>
              <span className="tag">MKT</span>
            </span>
          </Link>

          <nav className="side-nav" aria-label="Navegação do painel">
            {NAV.map(({ group, items }) => (
              <div key={group}>
                <p className="side-label">{group}</p>
                {items.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="nav-item"
                    aria-current={isActive(href) ? 'page' : undefined}
                  >
                    <Icon />
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="side-user">
            <span className="avatar" aria-hidden="true">MV</span>
            <span className="who">
              <span className="nm">Matheus Vinicius</span>
              <span className="rl">ADMIN · ZENKO</span>
            </span>
          </div>
        </aside>

        <div className="content">
          <header className="topbar">
            <button
              type="button"
              ref={menuBtnRef}
              className="menu-btn"
              aria-expanded={open}
              aria-controls="sidebar"
              aria-label={open ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              onClick={() => setOpen((v) => !v)}
            >
              <IconMenu />
            </button>

            <div className="top-spacer" />

            <Link className="btn btn--primary" href="/agendar">
              <IconPlus />
              <span className="hide-sm">Nova publicação</span>
            </Link>

            <button
              type="button"
              className="icon-btn"
              aria-label="Notificações"
              onClick={() => toast('Você não tem notificações novas por enquanto.')}
            >
              <IconBell />
              <span className="badge-dot" aria-hidden="true" />
            </button>
          </header>

          <main id="main" tabIndex={-1} ref={mainRef}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
