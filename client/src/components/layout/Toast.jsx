import React, { useState, useCallback } from 'react';
import { createContext, useContext } from 'react';

const ToastContext = createContext(null);

let _addToast = null;

export function useToast() {
  return useContext(ToastContext);
}

// Also expose globally for use outside React tree
export const toast = {
  success: (msg) => _addToast?.({ type: 'success', msg }),
  error:   (msg) => _addToast?.({ type: 'error',   msg }),
  info:    (msg) => _addToast?.({ type: 'info',     msg }),
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type, msg }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, msg, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 200);
    }, 3200);
  }, []);

  _addToast = addToast;

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast toast-${t.type} ${t.exiting ? 'toast-exit' : ''}`}
            role="alert"
          >
            {t.type === 'success' && '✅ '}{t.type === 'error' && '❌ '}{t.type === 'info' && 'ℹ️ '}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
