import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Plus, Receipt, SlidersHorizontal, TrendingUp, Users, Wallet } from 'lucide-react';
import useEmpresaActual from '../../../hooks/useEmpresaActual';
import ComprobantesTable, {
  type ComprobanteRow,
} from '../../../components/contabilidad/ComprobantesTable';
import { StatCard, StatGrid } from '../../../components/common/StatCard';
import { ventasApi } from '../../../services/ventasApi';
import PeriodoSelector, {
  periodoActual,
  periodoToString,
  type Periodo,
} from '../../../components/common/PeriodoSelector';
import VentaManualModal from '../../../components/contabilidad/ventas/VentaManualModal';
import type {
  RegistroVentaRequest,
  RegistroVentaResponse,
  VentasFilters,
  VentasStats,
} from '../../../types/ventas';
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
  const [periodo, setPeriodo] = useState<Periodo>(periodoActual);
  const [filters, setFilters] = useState<VentasFilters>({});
  const [stats, setStats] = useState<VentasStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [nuevaVenta, setNuevaVenta] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Datos
  // ---------------------------------------------------------------------------

  const periodoTexto = periodoToString(periodo);

  const loadVentas = async () => {
    if (!empresa?.ruc) return;

    setLoading(true);
    try {
      setVentas(await ventasApi.getAll(empresa.ruc, { ...filters, periodo: periodoTexto }));
      setError(null);
    } catch (err) {
      setError('Error al cargar las ventas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!empresa?.ruc) return;

    try {
      // Las estadisticas tienen que ser del periodo que se esta viendo. Antes
      // estaba cableado al mes en curso, asi que al consultar cualquier otro
      // periodo salian siempre en cero.
      setStats(await ventasApi.getStats(empresa.ruc, periodoTexto));
    } catch (err) {
      console.error('Error al cargar estadísticas de ventas:', err);
    }
  };

  useEffect(() => {
    if (!empresa?.ruc) return;
    void loadVentas();
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, periodoTexto, empresa?.ruc]);

  // ---------------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------------

  const handleFilterChange = (newFilters: VentasFilters) =>
    setFilters({ ...filters, ...newFilters });

  const handleCrearVenta = async (venta: RegistroVentaRequest) => {
    if (!empresa?.ruc) return;

    // El comprobante se guarda en el periodo que se esta viendo, no en el
    // mes de su fecha de emision: es el periodo tributario al que se declara.
    await ventasApi.create(empresa.ruc, periodoTexto, venta);

    setNuevaVenta(false);
    setAviso(
      `Comprobante ${venta.serie_comprobante ?? ''}-${venta.numero_comprobante} registrado`
    );
    await Promise.all([loadVentas(), loadStats()]);
  };

  const handleExportExcel = async () => {
    if (!empresa?.ruc) return;

    try {
      const blob = await ventasApi.exportExcel(empresa.ruc, { ...filters, periodo: periodoTexto });
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
      <PeriodoSelector value={periodo} onChange={setPeriodo} />

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

        {/* A la derecha, separado de los filtros: es la unica accion que
            escribe en el registro. */}
        <button
          type="button"
          onClick={() => setNuevaVenta(true)}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nuevo comprobante
        </button>
      </div>

      {aviso && (
        <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {aviso}
        </p>
      )}

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

      {nuevaVenta && (
        <VentaManualModal
          periodo={periodoTexto}
          onCancelar={() => setNuevaVenta(false)}
          onGuardar={handleCrearVenta}
        />
      )}
    </div>
  );
};

export default RegistroVentasPage;
