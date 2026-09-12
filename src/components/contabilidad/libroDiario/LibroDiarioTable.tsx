import React from 'react';
import { BookOpen, CheckCircle2, ListChecks, Trash2, TriangleAlert } from 'lucide-react';
import type { LibroDiario } from '../../../types/libroDiario';
import EmptyState from '../../common/EmptyState';
import { cn } from '../../../lib/cn';

interface LibroDiarioTableProps {
  libros: LibroDiario[];
  onVerAsientos?: (libro: LibroDiario) => void;
  onEliminar: (libroId: string) => void;
}

const ESTADO_TONE: Record<string, string> = {
  finalizado: 'bg-green-100 text-green-800',
  enviado: 'bg-red-100 text-red-800',
  borrador: 'bg-amber-100 text-amber-800',
};

const soles = (n: number): string =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatFecha = (fecha: string): string => {
  try {
    return new Date(fecha).toLocaleDateString('es-PE');
  } catch {
    return fecha;
  }
};

/**
 * Listado de libros diarios.
 * Migrado a Tailwind; su LibroDiarioTable.css (8 kB) se elimina.
 */
const LibroDiarioTable: React.FC<LibroDiarioTableProps> = ({
  libros,
  onVerAsientos,
  onEliminar,
}) => {
  if (libros.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No hay libros diarios"
        description="Empieza creando tu primer libro diario del período."
      />
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-4 border-b border-slate-200 pb-3 text-sm font-semibold text-slate-900">
        Libros diarios{' '}
        <span className="font-normal text-slate-500 tabular-nums">({libros.length})</span>
      </h3>

      <ul className="max-h-150 space-y-3 overflow-y-auto">
        {libros.map((libro) => {
          // Un libro cuadra cuando debe y haber coinciden al centimo.
          const balanceado = Math.abs(libro.totalDebe - libro.totalHaber) < 0.01;

          return (
            <li
              key={libro.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-300"
            >
              {/* Cabecera */}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-base font-semibold text-slate-900">
                    {libro.descripcion}
                  </h4>
                  <p className="text-sm text-slate-500 tabular-nums">
                    Período {libro.periodo}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
                    ESTADO_TONE[libro.estado] ?? 'bg-slate-100 text-slate-700'
                  )}
                >
                  {libro.estado}
                </span>
              </div>

              {/* Totales */}
              <dl className="mb-3 grid grid-cols-3 gap-3 rounded-lg bg-white px-3 py-2.5">
                <div className="text-center">
                  <dd className="text-sm font-bold text-blue-700 tabular-nums">
                    {soles(libro.totalDebe)}
                  </dd>
                  <dt className="text-xs text-slate-500">Debe</dt>
                </div>
                <div className="text-center">
                  <dd className="text-sm font-bold text-violet-700 tabular-nums">
                    {soles(libro.totalHaber)}
                  </dd>
                  <dt className="text-xs text-slate-500">Haber</dt>
                </div>
                <div className="text-center">
                  <dd className="flex items-center justify-center gap-1 text-sm font-bold text-slate-900 tabular-nums">
                    {balanceado ? (
                      <CheckCircle2 className="size-3.5 text-green-600" aria-hidden="true" />
                    ) : (
                      <TriangleAlert className="size-3.5 text-amber-600" aria-hidden="true" />
                    )}
                    {libro.totalAsientos ?? libro.asientos?.length ?? 0}
                  </dd>
                  <dt className="text-xs text-slate-500">Asientos</dt>
                </div>
              </dl>

              {/* Acciones */}
              <div className="flex flex-wrap gap-2">
                {onVerAsientos && (
                  <button
                    type="button"
                    onClick={() => onVerAsientos(libro)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <ListChecks className="size-4" aria-hidden="true" />
                    Gestionar asientos
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Eliminar el libro "${libro.descripcion}"?`)) {
                      onEliminar(libro.id!);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Eliminar
                </button>
              </div>

              {/* Fechas */}
              {libro.fechaCreacion && (
                <p className="mt-3 border-t border-slate-200 pt-2 text-xs text-slate-500">
                  Creado: {formatFecha(libro.fechaCreacion)}
                  {libro.fechaModificacion && libro.fechaModificacion !== libro.fechaCreacion && (
                    <> · Modificado: {formatFecha(libro.fechaModificacion)}</>
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default LibroDiarioTable;
