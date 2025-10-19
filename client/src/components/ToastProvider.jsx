import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

const POSITIONS = {
  'bottom-right': 'bottom-4 right-4',
  'top-right': 'top-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-4 left-4',
  'top-left': 'top-4 left-4',
};

export function ToastProvider({
  children,
  position = 'bottom-right',
  defaultDuration = 2500,
  max = 3,
  dedupeWindowMs = 1000,
}) {
  const [toasts, setToasts] = useState([]);
  const [cfg, setCfg] = useState({ position });
  const lastShownRef = useRef({}); // message -> timestamp

  useEffect(() => {
    const onCfg = (e) => {
      const { key, value } = e.detail || {};
      if (key === 'position') {
        localStorage.setItem('ccc.toast.position', value);
        setCfg((c) => ({ ...c, position: value }));
      } else if (key === 'preview') {
        toast({ title: 'Toast preview', variant: 'info' });
      }
    };
    window.addEventListener('ccc:toast-config', onCfg);
    return () => window.removeEventListener('ccc:toast-config', onCfg);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('ccc.toast.position');
    if (stored) setCfg((c) => ({ ...c, position: stored }));
  }, []);

  const toast = ({ title, variant = 'info', duration = defaultDuration } = {}) => {
    const now = Date.now();
    const key = `${variant}:${title}`;
    const last = lastShownRef.current[key] || 0;
    if (now - last < dedupeWindowMs) return; // de-dupe window
    lastShownRef.current[key] = now;

    setToasts((prev) => {
      const id = Math.random().toString(36).slice(2);
      const next = [...prev, { id, title, variant, until: now + duration }];
      return next.slice(-max);
    });
  };

  // GC expired
  useEffect(() => {
    const i = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((t) => t.until > now));
    }, 300);
    return () => clearInterval(i);
  }, []);

  const ctx = useMemo(() => ({ toast }), []);

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <div className={`fixed z-[9999] pointer-events-none ${POSITIONS[cfg.position] || POSITIONS['bottom-right']}`}>
        <div className="flex flex-col gap-2 items-stretch min-w-[260px]">
          {toasts.map((t) => (
            <ToastItem key={t.id} {...t} onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
          ))}
        </div>
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ title, variant, onClose }) {
  const classes =
    variant === 'success'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
      : variant === 'error'
      ? 'border-red-300 bg-red-50 text-red-900'
      : 'border-slate-300 bg-white text-slate-900';

  const Icon =
    variant === 'success' ? CheckCircle2 :
    variant === 'error' ? AlertCircle :
    Info;

  return (
    <div className={`pointer-events-auto px-3 py-2 rounded-lg border shadow-sm text-sm flex items-center justify-between gap-3 ${classes}`}>
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </div>
      <button onClick={onClose} className="text-xs px-2 py-1 rounded-md border hover:bg-slate-100">Close</button>
    </div>
  );
}
