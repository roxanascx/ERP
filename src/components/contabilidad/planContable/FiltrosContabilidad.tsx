import React, { useState } from 'react';
import { ChevronDown, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '../../../lib/cn';

export interface Filtros {
  busqueda: string;
  clase_contable?: number;
  nivel?: number;
  solo_activas: boolean;
}

interface FiltrosContabilidadProps {
  filtros: Filtros;
  onFiltrosChange: (filtros: Filtros) => void;
  onCrearCuenta: () => void;
  totalCuentas: number;
}

const CLASES_CONTABLES = [
  { value: 1, label: '1 · Activo disponible y exigible' },
  { value: 2, label: '2 · Activo realizable' },
  { value: 3, label: '3 · Activo inmovilizado' },
  { value: 4, label: '4 · Pasivo' },
  { value: 5, label: '5 · Patrimonio neto' },
  { value: 6, label: '6 · Gastos por naturaleza' },
  { value: 7, label: '7 · Ventas' },
  { value: 8, label: '8 · Saldos intermediarios' },
  { value: 9, label: '9 · Contabilidad analítica' },
];

const NIVELES = [
  { value: 1, label: '1 · Clase' },
  { value: 2, label: '2 · Grupo' },
  { value: 3, label: '3 · Subgrupo' },
  { value: 4, label: '4 · Cuenta' },
  { value: 5, label: '5 · Subcuenta' },
  { value: 6, label: '6 · Divisionaria' },
  { value: 7, label: '7 · Subdivisionaria' },
  { value: 8, label: '8 · Auxiliar' },
];

const selectClass = cn(
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
);

/** Etiqueta de filtro aplicado, con su aspa para quitarlo. */
const Chip: React.FC<{ label: string; onRemove: () => void; tone: string }> = ({
  label,
  onRemove,
  tone,
}) => (
  <span
    className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', tone)}
  >
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Quitar filtro ${label}`}
      className="grid size-4 place-items-center rounded-full border-0 bg-transparent p-0 text-current opacity-60 hover:opacity-100"
    >
      <X className="size-3" aria-hidden="true" />
    </button>
  </span>
);

const FiltrosContabilidad: React.FC<FiltrosContabilidadProps> = ({
  filtros,
  onFiltrosChange,
  onCrearCuenta,
  totalCuentas,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = (patch: Partial<Filtros>) => onFiltrosChange({ ...filtros, ...patch });

  const limpiarFiltros = () =>
    onFiltrosChange({
      busqueda: '',
      clase_contable: undefined,
      nivel: undefined,
      solo_activas: true,
    });

  const hayFiltrosActivos = Boolean(
    filtros.busqueda || filtros.clase_contable || filtros.nivel || !filtros.solo_activas
  );

  const claseLabel = CLASES_CONTABLES.find((c) => c.value === filtros.clase_contable)?.label;
  const nivelLabel = NIVELES.find((n) => n.value === filtros.nivel)?.label;

  return (
    <div className="space-y-4">
      {/* Fila principal */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filtros.busqueda}
            onChange={(e) => set({ busqueda: e.target.value })}
            placeholder="Buscar por código o descripción…"
            aria-label="Buscar cuenta contable"
            className={cn(
              'w-full rounded-lg border border-slate-300 bg-white py-2 pr-9 pl-9 text-sm text-slate-900',
              'placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
            )}
          />
          {filtros.busqueda && (
            <button
              type="button"
              onClick={() => set({ busqueda: '' })}
              aria-label="Limpiar búsqueda"
              className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded border-0 bg-transparent p-0 text-slate-400 hover:text-slate-700"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <span className="hidden text-sm text-slate-500 tabular-nums sm:inline">
          {totalCuentas.toLocaleString('es-PE')} cuentas
        </span>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            showAdvanced
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          )}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtros
          <ChevronDown
            className={cn('size-4 transition-transform', showAdvanced && 'rotate-180')}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={onCrearCuenta}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nueva cuenta
        </button>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label
                htmlFor="filtro-clase"
                className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase"
              >
                Clase contable
              </label>
              <select
                id="filtro-clase"
                value={filtros.clase_contable ?? ''}
                onChange={(e) =>
                  set({ clase_contable: e.target.value ? parseInt(e.target.value, 10) : undefined })
                }
                className={selectClass}
              >
                <option value="">Todas las clases</option>
                {CLASES_CONTABLES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filtro-nivel"
                className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase"
              >
                Nivel
              </label>
              <select
                id="filtro-nivel"
                value={filtros.nivel ?? ''}
                onChange={(e) =>
                  set({ nivel: e.target.value ? parseInt(e.target.value, 10) : undefined })
                }
                className={selectClass}
              >
                <option value="">Todos los niveles</option>
                {NIVELES.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label
                htmlFor="filtro-activas"
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
              >
                <input
                  id="filtro-activas"
                  type="checkbox"
                  checked={filtros.solo_activas}
                  onChange={(e) => set({ solo_activas: e.target.checked })}
                  className="size-4 cursor-pointer accent-blue-600"
                />
                Solo cuentas activas
              </label>
            </div>
          </div>

          {hayFiltrosActivos && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                Filtros aplicados
              </span>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="rounded border-0 bg-transparent px-0 py-0 text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filtros aplicados */}
      {hayFiltrosActivos && (
        <div className="flex flex-wrap gap-2">
          {filtros.busqueda && (
            <Chip
              label={`Búsqueda: "${filtros.busqueda}"`}
              onRemove={() => set({ busqueda: '' })}
              tone="bg-blue-50 text-blue-700"
            />
          )}
          {filtros.clase_contable && claseLabel && (
            <Chip
              label={claseLabel}
              onRemove={() => set({ clase_contable: undefined })}
              tone="bg-emerald-50 text-emerald-700"
            />
          )}
          {filtros.nivel && nivelLabel && (
            <Chip
              label={nivelLabel}
              onRemove={() => set({ nivel: undefined })}
              tone="bg-violet-50 text-violet-700"
            />
          )}
          {!filtros.solo_activas && (
            <Chip
              label="Incluye inactivas"
              onRemove={() => set({ solo_activas: true })}
              tone="bg-slate-100 text-slate-700"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FiltrosContabilidad;
