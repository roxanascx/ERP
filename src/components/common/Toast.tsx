import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  message: string;
  type: ToastType;
}

interface ToastProps extends ToastMessage {
  onClose: () => void;
  /** Milisegundos antes de cerrarse solo. 0 lo deja fijo. */
  duration?: number;
}

const TONES: Record<ToastType, { wrap: string; icon: typeof Info }> = {
  success: { wrap: 'border-green-200 bg-green-50 text-green-900', icon: CheckCircle2 },
  error: { wrap: 'border-red-200 bg-red-50 text-red-900', icon: AlertCircle },
  warning: { wrap: 'border-amber-200 bg-amber-50 text-amber-900', icon: TriangleAlert },
  info: { wrap: 'border-blue-200 bg-blue-50 text-blue-900', icon: Info },
};

/**
 * Aviso flotante.
 *
 * Cada pantalla montaba el suyo con estilos inline (un div fijo arriba a la
 * derecha con el color segun el tipo). El de `components/ui/Toast.tsx` dependia
 * de su propio CSS y nadie lo usaba.
 */
const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const { wrap, icon: Icon } = TONES[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed top-4 right-4 z-[60] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg',
        wrap
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar aviso"
        className="grid size-6 shrink-0 place-items-center rounded border-0 bg-transparent p-0 text-current opacity-50 hover:opacity-100"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Toast;
