import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Receipt, SlidersHorizontal, TrendingUp, Users, Wallet } from 'lucide-react';
import useEmpresaActual from '../../../hooks/useEmpresaActual';
import ComprobantesTable, {
  type ComprobanteRow,
} from '../../../components/contabilidad/ComprobantesTable';
import { StatCard, StatGrid } from '../../../components/common/StatCard';
import { ventasApi } from '../../../services/ventasApi';
import type { RegistroVentaResponse, VentasFilters, VentasStats } from '../../../types/ventas';
import { cn } from '../../../lib/cn';

const control = cn(
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
  'placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
);
const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase';

const soles = (n: number): string =>
  `S/ ${(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const RegistroVentasPage: React.FC = () => {
  const { empresa } = useEmpresaActual();

  const [ventas, setVentas] = useState<RegistroVentaResponse[]>([]);
  const [filters, setFilters] = useState<VentasFilters>({});
  const [stats, setStats] = useState<VentasStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ---------------------------------------------------------------------------
  // Datos
  // ---------------------------------------------------------------------------

  const loadVentas = async () => {
    if (!empresa?.id) return;

    setLoading(true);
    try {
      setVentas(await ventasApi.getAll(empresa.id, filters));
      setError(null);
    } catch (err) {
      setError('Error al cargar las ventas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!empresa?.id) return;

    try {
      // Periodo AAAAMM del mes en curso, que es como lo espera el backend.
      const periodo = new Date().toISOString().substring(0, 7).replace('-', '');
      setStats(await ventasApi.getStats(empresa.id, periodo));
    } catch (err) {
      console.error('Error al cargar estadísticas de ventas:', err);
    }
  };

  useEffect(() => {
    if (!empresa?.id) return;
    void loadVentas();
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, empresa?.id]);

  // ---------------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------------

  const handleFilterChange = (newFilters: VentasFilters) =>
    setFilters({ ...filters, ...newFilters });

  const handleExportExcel = async () => {
    if (!empresa?.id) return;

    try {
      const blob = await ventasApi.exportExcel(empresa.id, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registro_ventas_${new Date().toISOString().substring(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      // El enlace temporal tambien hay que retirarlo, no solo la URL.
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Error al exportar a Excel');
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const rows: ComprobanteRow[] = ventas.map((v) => ({
    id: v.id,
    fecha: v.fecha_emision,
    tipo_comprobante: v.tipo_comprobante,
    serie_comprobante: v.serie_comprobante,
    numero_comprobante: v.numero_comprobante,
    contraparte_nombre: v.razon_social_cliente,
    contraparte_documento: v.numero_documento_cliente,
    base_imponible: v.base_imponible_gravada,
    igv: v.igv_ipm,
    importe_total: v.importe_total,
    estado_operacion: String(v.estado_operacion),
  }));

  return (
    <div className="space-y-5">
      {stats && (
        <StatGrid>
          <StatCard
            label="Total registros"
            value={stats.total_registros.toLocaleString('es-PE')}
            icon={Receipt}
            tone="blue"
          />
          <StatCard
            label="Total ventas"
            value={soles(stats.total_monto)}
            icon={Wallet}
            tone="green"
          />
          <StatCard label="IGV total" value={soles(stats.total_igv)} icon={TrendingUp} tone="amber" />
          <StatCard
            label="Clientes"
            value={stats.clientes_unicos.toLocaleString('es-PE')}
            icon={Users}
            tone="violet"
          />
        </StatGrid>
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
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <FileSpreadsheet className="size-4 text-emerald-600" aria-hidden="true" />
          Exportar Excel
        </button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label htmlFor="rv-desde" className={labelClass}>
              Fecha inicio
            </label>
            <input
              id="rv-desde"
              type="date"
              value={filters.fecha_inicio || ''}
              onChange={(e) => handleFilterChange({ fecha_inicio: e.target.value })}
              className={control}
            />
          </div>

          <div>
            <label htmlFor="rv-hasta" className={labelClass}>
              Fecha fin
            </label>
            <input
              id="rv-hasta"
              type="date"
              value={filters.fecha_fin || ''}
              onChange={(e) => handleFilterChange({ fecha_fin: e.target.value })}
              className={control}
            />
          </div>

          <div>
            <label htmlFor="rv-cliente" className={labelClass}>
              Documento del cliente
            </label>
            <input
              id="rv-cliente"
              type="text"
              placeholder="20123456789"
              value={filters.cliente_documento || ''}
              onChange={(e) => handleFilterChange({ cliente_documento: e.target.value })}
              className={cn(control, 'font-mono')}
            />
          </div>

          <div>
            <label htmlFor="rv-tipo" className={labelClass}>
              Tipo de comprobante
            </label>
            <select
              id="rv-tipo"
              value={filters.tipo_comprobante || ''}
              onChange={(e) =>
                handleFilterChange({
                  tipo_comprobante: (e.target.value || undefined) as VentasFilters['tipo_comprobante'],
                })
              }
              className={control}
            >
              <option value="">Todos</option>
              <option value="01">01 · Factura</option>
              <option value="03">03 · Boleta</option>
              <option value="07">07 · Nota de crédito</option>
              <option value="08">08 · Nota de débito</option>
            </select>
          </div>
        </div>
      )}

      <ComprobantesTable
        rows={rows}
        loading={loading}
        error={error}
        contraparteLabel="Cliente"
        emptyMessage="No se encontraron registros de ventas con los filtros aplicados."
      />
    </div>
  );
};

export default RegistroVentasPage;
