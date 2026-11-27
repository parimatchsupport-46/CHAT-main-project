import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle, WarningTriangle } from 'iconoir-react';
import { usePresence } from '../hooks/usePresence.js';

const ToastContext = createContext(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const { mounted, visible } = usePresence(Boolean(toast), 220);

  const notify = useCallback((text, tone = 'ok') => {
    clearTimeout(timer.current);
    setToast({ text, tone, id: Date.now() });
    // errors/warnings thoda lamba dikhein taaki padhne ka time mile
    timer.current = setTimeout(() => setToast(null), tone === 'warn' ? 4200 : 2100);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {mounted && toast && (
        <div className={`toast-layer${visible ? ' is-on' : ''}`} role="status" aria-live="polite">
          <div className="toast">
            {toast.tone === 'warn' ? (
              <WarningTriangle width={16} height={16} strokeWidth={2} color="#FF9500" />
            ) : (
              <CheckCircle width={16} height={16} strokeWidth={2} color="#34C759" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
