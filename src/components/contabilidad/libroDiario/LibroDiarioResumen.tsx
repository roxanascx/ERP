import React from 'react';
import { CheckCircle2, RefreshCw, TriangleAlert } from 'lucide-react';
import type { ResumenLibroDiario } from '../../../types/libroDiario';
import { cn } from '../../../lib/cn';

interface LibroDiarioResumenProps {
  resumen: ResumenLibroDiario;
  onRefresh: () => void;
}

const soles = (amount: number): string =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);

const numero = (n: number): string => new Intl.NumberFormat('es-PE').format(n);

/**
 * Panel lateral con los totales del periodo.
 * Migrado a Tailwind; su LibroDiarioResumen.css (6 kB) se elimina.
 */
const LibroDiarioResumen: React.FC<LibroDiarioResumenProps> = ({ resumen, onRefresh }) => {
  const balance = resumen.totalDebe - resumen.totalHaber;
  // Un asiento cuadra cuando debe y haber coinciden al centimo.
  const balanceado = Math.abs(balance) < 0.01;

  const filas = [
    { label: 'Libros', value: numero(resumen.totalLibros), tone: 'text-slate-900' },
    { label: 'Asientos', value: numero(resumen.totalAsientos), tone: 'text-slate-900' },
    { label: 'Total debe', value: soles(resumen.totalDebe), tone: 'text-blue-700' },
    { label: 'Total haber', value: soles(resumen.totalHaber), tone: 'text-violet-700' },
  ];

  const estados = [
    { label: 'Borrador', value: resumen.asientosPorEstado.borrador || 0 },
    { label: 'Finalizado', value: resumen.asientosPorEstado.finalizado || 0 },
    { label: 'Enviado', value: resumen.asientosPorEstado.enviado || 0 },
  ];

  return (
    <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Resumen del período</h3>
        <button
          type="button"
          onClick={onRefresh}
          title="Actualizar resumen"
          aria-label="Actualizar resumen"
          className="grid size-8 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
        </button>
      </div>

      <dl className="space-y-2.5">
        {filas.map((f) => (
          <div key={f.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-slate-500">{f.label}</dt>
            <dd className={cn('text-sm font-semibold tabular-nums', f.tone)}>{f.value}</dd>
          </div>
        ))}
      </dl>

      {/* Balance */}
      <div
        className={cn(
          'flex items-start gap-2.5 rounded-lg border px-3 py-2.5',
          balanceado ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
        )}
      >
        {balanceado ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden="true" />
        ) : (
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <p
            className={cn(
              'text-xs font-medium tracking-wide uppercase',
              balanceado ? 'text-green-700' : 'text-amber-700'
            )}
          >
            {balanceado ? 'Balanceado' : 'Desbalanceado'}
          </p>
          <p
            className={cn(
              'text-sm font-bold tabular-nums',
              balanceado ? 'text-green-800' : 'text-amber-800'
            )}
          >
            {soles(Math.abs(balance))}
          </p>
        </div>
      </div>

      {/* Estados */}
      <div className="border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
          Asientos por estado
        </p>
        <dl className="space-y-1.5">
          {estados.map((e) => (
            <div key={e.label} className="flex items-baseline justify-between gap-3">
              <dt className="text-sm text-slate-500">{e.label}</dt>
              <dd className="text-sm font-semibold text-slate-800 tabular-nums">
                {numero(e.value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Último libro */}
      {resumen.ultimoLibro && (
        <div className="border-t border-slate-100 pt-3">
          <p className="mb-1 text-xs font-medium tracking-wide text-slate-500 uppercase">
            Último libro
          </p>
          <p className="truncate text-sm font-medium text-slate-800">
            {resumen.ultimoLibro.descripcion}
          </p>
          <p className="text-xs text-slate-500 tabular-nums">
            {new Date(resumen.ultimoLibro.fechaCreacion).toLocaleDateString('es-PE')}
          </p>
        </div>
      )}
    </aside>
  );
};

export default LibroDiarioResumen;
