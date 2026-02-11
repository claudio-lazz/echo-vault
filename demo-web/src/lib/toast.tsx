import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  push: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-6 top-6 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border px-4 py-3 text-xs text-white shadow-lg transition-all ${
              toast.tone === 'success'
                ? 'border-[#2BD4C8] bg-[#0d1f21]'
                : toast.tone === 'warning'
                  ? 'border-[#F6C24A] bg-[#1f1a0d]'
                  : toast.tone === 'error'
                    ? 'border-[#F472B6] bg-[#200f1d]'
                    : 'border-[#2A3040] bg-[#11141c]'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
