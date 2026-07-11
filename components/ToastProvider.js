'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { IconCheck } from './Icons';

const ToastContext = createContext(() => {});

/** Hook para disparar um aviso: const toast = useToast(); toast('Salvo.'); */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef([]);

  const push = useCallback((message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((list) => [...list, { id, message }]);
    const timer = setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 3600);
    timers.current.push(timer);
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      {/* role="status" + aria-live: o aviso é anunciado por leitores de tela */}
      <div className="toasts" role="status" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <span className="ic" aria-hidden="true">
              <IconCheck />
            </span>
            <p>{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
