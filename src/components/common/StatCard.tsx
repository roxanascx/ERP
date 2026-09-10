import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export type StatTone = 'blue' | 'green' | 'slate' | 'violet' | 'amber' | 'red' | 'teal';

const TONES: Record<StatTone, { chip: string; value: string }> = {
  blue: { chip: 'bg-blue-50 text-blue-600', value: 'text-slate-900' },
  green: { chip: 'bg-green-50 text-green-600', value: 'text-green-700' },
  slate: { chip: 'bg-slate-100 text-slate-500', value: 'text-slate-700' },
  violet: { chip: 'bg-violet-50 text-violet-600', value: 'text-slate-900' },
  amber: { chip: 'bg-amber-50 text-amber-600', value: 'text-amber-700' },
  red: { chip: 'bg-red-50 text-red-600', value: 'text-red-700' },
  teal: { chip: 'bg-teal-50 text-teal-600', value: 'text-teal-700' },
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: StatTone;
  /** Linea secundaria: porcentaje, contexto, comparativa */
  hint?: string;
}

/**
 * Indicador numerico.
 *
 * Sustituye a las rejillas de tarjetas con degradado que cada pantalla
 * reimplementaba (EstadisticasCard, RegistroCompras, RegistroVentas,
 * LibroMayor...). Texto oscuro sobre blanco en vez de blanco sobre degradado:
 * las cifras son lo importante y asi se leen mejor.
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  tone = 'blue',
  hint,
}) => {
  const t = TONES[tone];

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {Icon && (
        <div className={cn('grid size-10 shrink-0 place-items-center rounded-lg', t.chip)}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
        <p className={cn('text-xl font-bold tabular-nums', t.value)}>{value}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  );
};

/** Rejilla estandar de indicadores. */
export const StatGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>{children}</div>
);

export default StatCard;
