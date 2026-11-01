"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const success = useCallback((msg: string) => showToast(msg, "success"), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, "error"), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, "warning"), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, "info"), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let bg = "bg-white border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100";
          let icon = <Info className="h-5 w-5 text-blue-500 shrink-0" />;

          if (t.type === "success") {
            bg = "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-100";
            icon = <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
          } else if (t.type === "error") {
            bg = "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-100";
            icon = <XCircle className="h-5 w-5 text-rose-600 shrink-0" />;
          } else if (t.type === "warning") {
            bg = "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-100";
            icon = <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg text-sm font-medium transition-all animate-in fade-in slide-in-from-top-2 ${bg}`}
            >
              <div className="flex items-center gap-2.5">
                {icon}
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    return {
      showToast: (m: string) => console.log(m),
      success: (m: string) => console.log(m),
      error: (m: string) => console.log(m),
      warning: (m: string) => console.log(m),
      info: (m: string) => console.log(m),
    };
  }
  return ctx;
};
