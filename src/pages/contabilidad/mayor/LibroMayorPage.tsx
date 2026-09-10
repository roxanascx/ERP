import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  FileSpreadsheet,
  Loader2,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import useEmpresaActual from '../../../hooks/useEmpresaActual';
import { mayorApi } from '../../../services/mayorApi';
import { StatCard, StatGrid } from '../../../components/common/StatCard';
import EmptyState from '../../../components/common/EmptyState';
import type {
  MayorMovimiento,
  MayorFilters,
  MayorSummary,
  CuentaContable,
} from '../../../types/mayor';
import { cn } from '../../../lib/cn';

const control = cn(
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
);
const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase';
const th = 'px-3 py-2.5 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase';
const td = 'px-3 py-3 text-sm text-slate-700';

const soles = (n: number): string =>
  `S/ ${(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatFecha = (fecha: string): string => {
  try {
    return new Date(fecha).toLocaleDateString('es-PE');
  } catch {
    return fecha;
  }
};

const LibroMayorPage: React.FC = () => {
  const { empresa } = useEmpresaActual();

  const [movimientos, setMovimientos] = useState<MayorMovimiento[]>([]);
  const [summary, setSummary] = useState<MayorSummary | null>(null);
  const [filters, setFilters] = useState<MayorFilters>({});
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // ---------------------------------------------------------------------------
  // Datos
  // ---------------------------------------------------------------------------

  const loadCuentas = async () => {
    if (!empresa?.id) return;
    try {
      setCuentas(await mayorApi.getCuentasDisponibles(empresa.id));
    } catch (err) {
      console.error('Error al cargar cuentas:', err);
    }
  };

  const loadMovimientos = async () => {
    if (!empresa?.id) return;

    setLoading(true);
    try {
      setMovimientos(await mayorApi.getMovimientos(empresa.id, filters));
      setError(null);
    } catch (err) {
      setError('Error al cargar los movimientos del Libro Mayor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    if (!empresa?.id) return;
    try {
      setSummary(await mayorApi.getSummary(empresa.id, filters));
    } catch (err) {
      console.error('Error al cargar el resumen:', err);
    }
  };

  useEffect(() => {
    void loadCuentas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa?.id]);

  // El Libro Mayor se consulta por cuenta: sin cuenta no hay nada que pedir.
  useEffect(() => {
    if (!empresa?.id || (!filters.cuenta_codigo && !filters.fecha_inicio)) return;
    void loadMovimientos();
    void loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, empresa?.id]);

  // ---------------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------------

  const handleFilterChange = (newFilters: MayorFilters) =>
    setFilters({ ...filters, ...newFilters });

  const handleExportExcel = async () => {
    if (!empresa?.id) return;

    try {
      const blob = await mayorApi.exportExcel(empresa.id, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `libro_mayor_${filters.cuenta_codigo || 'todas'}_${new Date().toISOString().substring(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Error al exportar a Excel');
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-5">
      {summary && (
        <>
          <h2 className="text-sm font-semibold text-slate-900">
            <span className="font-mono">{summary.cuenta_codigo}</span>
            <span className="mx-2 text-slate-300">·</span>
            {summary.cuenta_nombre}
          </h2>

          <StatGrid className="xl:grid-cols-5">
            <StatCard
              label="Saldo inicial"
              value={soles(summary.saldo_inicial)}
              icon={Wallet}
              tone="slate"
            />
            <StatCard
              label="Total debe"
              value={soles(summary.total_debe)}
              icon={TrendingUp}
              tone="blue"
            />
            <StatCard
              label="Total haber"
              value={soles(summary.total_haber)}
              icon={TrendingDown}
              tone="violet"
            />
            <StatCard
              label="Saldo final"
              value={soles(summary.saldo_final)}
              icon={Wallet}
              tone={summary.saldo_final >= 0 ? 'green' : 'red'}
            />
            <StatCard
              label="Movimientos"
              value={summary.cantidad_movimientos.toLocaleString('es-PE')}
              icon={BarChart3}
              tone="amber"
            />
          </StatGrid>
        </>
      )}

      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            showFilters
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          )}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtros
        </button>

        <button
          type="button"
          onClick={handleExportExcel}
          disabled={!filters.cuenta_codigo}
          title={!filters.cuenta_codigo ? 'Elige una cuenta para exportar' : undefined}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <FileSpreadsheet className="size-4 text-emerald-600" aria-hidden="true" />
          Exportar Excel
        </button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="sm:col-span-2 xl:col-span-1">
            <label htmlFor="lm-cuenta" className={labelClass}>
              Cuenta contable <span className="text-red-500">*</span>
            </label>
            <select
              id="lm-cuenta"
              value={filters.cuenta_codigo || ''}
              onChange={(e) => handleFilterChange({ cuenta_codigo: e.target.value })}
              className={control}
            >
              <option value="">Selecciona una cuenta</option>
              {cuentas.map((cuenta) => (
                <option key={cuenta.codigo} value={cuenta.codigo}>
                  {cuenta.codigo} · {cuenta.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="lm-desde" className={labelClass}>
              Fecha inicio
            </label>
            <input
              id="lm-desde"
              type="date"
              value={filters.fecha_inicio || ''}
              onChange={(e) => handleFilterChange({ fecha_inicio: e.target.value })}
              className={control}
            />
          </div>

          <div>
            <label htmlFor="lm-hasta" className={labelClass}>
              Fecha fin
            </label>
            <input
              id="lm-hasta"
              type="date"
              value={filters.fecha_fin || ''}
              onChange={(e) => handleFilterChange({ fecha_fin: e.target.value })}
              className={control}
            />
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Movimientos */}
      {loading ? (
        <div
          className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-16"
          role="status"
        >
          <Loader2 className="size-5 animate-spin text-blue-600" aria-hidden="true" />
          <span className="ml-3 text-sm text-slate-500">Cargando movimientos…</span>
        </div>
      ) : movimientos.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title={filters.cuenta_codigo ? 'Sin movimientos' : 'Elige una cuenta'}
          description={
            filters.cuenta_codigo
              ? 'Esta cuenta no tiene movimientos en el período seleccionado.'
              : 'Selecciona una cuenta contable para ver sus movimientos y saldos.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th scope="col" className={th}>Fecha</th>
                  <th scope="col" className={th}>Asiento</th>
                  <th scope="col" className={th}>Glosa</th>
                  <th scope="col" className={th}>Tercero</th>
                  <th scope="col" className={cn(th, 'text-right')}>Debe</th>
                  <th scope="col" className={cn(th, 'text-right')}>Haber</th>
                  <th scope="col" className={cn(th, 'text-right')}>Saldo</th>
                </tr>
              </thead>

              <tbody>
                {movimientos.map((movimiento) => (
                  <tr
                    key={movimiento.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className={cn(td, 'tabular-nums')}>{formatFecha(movimiento.fecha)}</td>

                    <td className={td}>
                      <span className="font-mono font-medium">{movimiento.numero_asiento}</span>
                      {movimiento.documento_numero && (
                        <span className="block text-xs text-slate-500">
                          {movimiento.documento_tipo} {movimiento.documento_numero}
                        </span>
                      )}
                    </td>

                    <td className={td}>
                      <p className="max-w-75 truncate">{movimiento.glosa}</p>
                    </td>

                    <td className={td}>
                      {movimiento.tercero_nombre ? (
                        <>
                          <p className="max-w-50 truncate">{movimiento.tercero_nombre}</p>
                          {movimiento.tercero_documento && (
                            <span className="font-mono text-xs text-slate-500">
                              {movimiento.tercero_documento}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className={cn(td, 'text-right tabular-nums')}>
                      {movimiento.debe ? soles(movimiento.debe) : '—'}
                    </td>
                    <td className={cn(td, 'text-right tabular-nums')}>
                      {movimiento.haber ? soles(movimiento.haber) : '—'}
                    </td>
                    <td
                      className={cn(
                        td,
                        'text-right font-semibold tabular-nums',
                        movimiento.saldo_acumulado >= 0 ? 'text-green-700' : 'text-red-700'
                      )}
                    >
                      {soles(movimiento.saldo_acumulado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibroMayorPage;
