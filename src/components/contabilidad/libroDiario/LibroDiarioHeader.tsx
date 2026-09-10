import React, { useState } from 'react';
import { ChevronDown, FileDown, FileSpreadsheet, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import type { FiltrosLibroDiario } from '../../../types/libroDiario';
import { cn } from '../../../lib/cn';

interface LibroDiarioHeaderProps {
  filtros: FiltrosLibroDiario;
  onFiltrosChange: (filtros: FiltrosLibroDiario) => void;
  onCrearLibro: () => void;
  onExportar: (formato: 'excel' | 'pdf') => void;
  loading?: boolean;
}

const control = cn(
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
  'placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
);

const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase';

/**
 * Barra de acciones y filtros del libro diario.
 * Migrado a Tailwind; su LibroDiarioHeader.css (5 kB) se elimina.
 * El titulo ya no se repite: lo pone la cabecera de MainLayout.
 */
const LibroDiarioHeader: React.FC<LibroDiarioHeaderProps> = ({
  filtros,
  onFiltrosChange,
  onCrearLibro,
  onExportar,
  loading = false,
}) => {
  const [mostrarAvanzados, setMostrarAvanzados] = useState(false);

  const set = (campo: keyof FiltrosLibroDiario, valor: string) =>
    onFiltrosChange({ ...filtros, [campo]: valor });

  const limpiarFiltros = () =>
    onFiltrosChange({
      periodo: new Date().getFullYear().toString(),
      estado: 'borrador',
    });

  const añoActual = new Date().getFullYear();
  const años = Array.from({ length: 6 }, (_, i) => (añoActual - i).toString());

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {/* Acciones */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {loading && (
          <span className="mr-auto inline-flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Cargando…
          </span>
        )}

        <button
          type="button"
          onClick={() => onExportar('excel')}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <FileSpreadsheet className="size-4 text-emerald-600" aria-hidden="true" />
          Excel
        </button>

        <button
          type="button"
          onClick={() => onExportar('pdf')}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <FileDown className="size-4 text-red-600" aria-hidden="true" />
          PDF
        </button>

        <button
          type="button"
          onClick={onCrearLibro}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nuevo libro
        </button>
      </div>

      {/* Filtros básicos */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label htmlFor="ld-periodo" className={labelClass}>
            Período
          </label>
          <select
            id="ld-periodo"
            value={filtros.periodo || ''}
            onChange={(e) => set('periodo', e.target.value)}
            className={control}
          >
            <option value="">Todos los años</option>
            {años.map((año) => (
              <option key={año} value={año}>
                {año}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ld-estado" className={labelClass}>
            Estado
          </label>
          <select
            id="ld-estado"
            value={filtros.estado || ''}
            onChange={(e) => set('estado', e.target.value)}
            className={control}
          >
            <option value="">Todos</option>
            <option value="borrador">Borrador</option>
            <option value="finalizado">Finalizado</option>
            <option value="enviado">Enviado</option>
          </select>
        </div>

        <div>
          <label htmlFor="ld-busqueda" className={labelClass}>
            Búsqueda
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="ld-busqueda"
              type="search"
              value={filtros.busqueda || ''}
              onChange={(e) => set('busqueda', e.target.value)}
              placeholder="Descripción, glosa…"
              className={cn(control, 'pl-9')}
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setMostrarAvanzados((v) => !v)}
            aria-expanded={mostrarAvanzados}
            className={cn(
              'inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              mostrarAvanzados
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            Filtros avanzados
            <ChevronDown
              className={cn('size-4 transition-transform', mostrarAvanzados && 'rotate-180')}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {mostrarAvanzados && (
        <div className="grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label htmlFor="ld-desde" className={labelClass}>
              Fecha desde
            </label>
            <input
              id="ld-desde"
              type="date"
              value={filtros.fechaDesde || ''}
              onChange={(e) => set('fechaDesde', e.target.value)}
              className={control}
            />
          </div>

          <div>
            <label htmlFor="ld-hasta" className={labelClass}>
              Fecha hasta
            </label>
            <input
              id="ld-hasta"
              type="date"
              value={filtros.fechaHasta || ''}
              onChange={(e) => set('fechaHasta', e.target.value)}
              className={control}
            />
          </div>

          <div>
            <label htmlFor="ld-cuenta" className={labelClass}>
              Cuenta contable
            </label>
            <input
              id="ld-cuenta"
              type="text"
              value={filtros.cuentaContable || ''}
              onChange={(e) => set('cuentaContable', e.target.value)}
              placeholder="Código de cuenta"
              className={cn(control, 'font-mono')}
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Limpiar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default LibroDiarioHeader;
