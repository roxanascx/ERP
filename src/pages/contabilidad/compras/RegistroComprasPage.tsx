import React, { useEffect, useState } from 'react';
import {
  CloudDownload,
  FileSpreadsheet,
  FileText,
  Plus,
  Receipt,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PeriodoSelector, {
  periodoActual as periodoActualObj,
  periodoToString,
  type Periodo,
} from '../../../components/common/PeriodoSelector';
import useEmpresaActual from '../../../hooks/useEmpresaActual';
import ComprasFormModal from '../../../components/contabilidad/compras/ComprasFormModal';
import ComprobantesTable, {
  type ComprobanteRow,
} from '../../../components/contabilidad/ComprobantesTable';
import { StatCard, StatGrid } from '../../../components/common/StatCard';
import { comprasApi } from '../../../services/comprasApi';
import type {
  RegistroCompraResponse,
  ComprasFilters,
  ComprasStats,
} from '../../../services/comprasApi';
import { cn } from '../../../lib/cn';

const control = cn(
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
  'placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
);
const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase';

const soles = (n: number): string =>
  `S/ ${(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Periodo AAAAMM del mes en curso, que es como lo espera el backend. */

const RegistroComprasPage: React.FC = () => {
  const { empresa } = useEmpresaActual();

  const [compras, setCompras] = useState<RegistroCompraResponse[]>([]);
  const [filters, setFilters] = useState<ComprasFilters>({});
  const [stats, setStats] = useState<ComprasStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>(periodoActualObj);
  // Ver el ejercicio entero en vez de un mes. El registro de compras se
  // revisa muchas veces de corrido, no solo mes a mes.
  const [todosLosPeriodos, setTodosLosPeriodos] = useState(false);

  const periodoTexto = periodoToString(periodo);

  // El listado del backend no filtra por razon social, asi que esta busqueda
  // se aplica sobre lo ya cargado. Es instantanea y no gasta una consulta.
  const [buscarProveedor, setBuscarProveedor] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompra, setEditingCompra] = useState<RegistroCompraResponse | null>(null);

  // ---------------------------------------------------------------------------
  // Datos
  // ---------------------------------------------------------------------------

  const loadCompras = async (customFilters?: ComprasFilters) => {
    if (!empresa?.ruc) {
      setError('No se ha seleccionado una empresa');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // `getByEmpresa` pega contra /compras/empresa/{id}, que solo acepta skip y
      // limit: mandarle un periodo no hacia nada y salian todos los meses.
      // `getAll` usa el listado con filtros de verdad.
      setCompras(
        await comprasApi.getAll({
          ...(customFilters || filters),
          empresa_id: empresa.ruc,
          periodo: todosLosPeriodos ? undefined : periodoTexto,
        })
      );
      setError(null);
    } catch {
      setError('Error al cargar las compras');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!empresa?.ruc) return;

    // Con «todos los periodos» no hay resumen que pedir: el endpoint exige un
    // mes. Se calcula de las filas cargadas, que ademas garantiza que las
    // tarjetas digan lo mismo que la tabla.
    if (todosLosPeriodos) {
      setStats(null);
      return;
    }

    try {
      // El periodo que se esta viendo, no el mes en curso: cableado al mes
      // actual, las tarjetas salian en cero al consultar cualquier otro.
      setStats(
        await comprasApi.getResumenLegacy({
          empresa_id: empresa.ruc,
          periodo: periodoTexto,
        })
      );
    } catch (err) {
      console.error('Error al cargar estadísticas de compras:', err);
      setStats(null);
    }
  };

  useEffect(() => {
    if (!empresa?.ruc) return;
    void loadCompras();
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa?.ruc, filters, periodoTexto, todosLosPeriodos]);

  // ---------------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------------

  const handleFilterChange = (newFilters: ComprasFilters) =>
    setFilters({ ...filters, ...newFilters });

  const handleExportExcel = async () => {
    if (!empresa?.ruc) {
      setError('No se ha seleccionado una empresa');
      return;
    }

    try {
      const blob = await comprasApi.exportExcel({
        empresa_id: empresa.ruc,
        periodo: periodoTexto,
        formato: 'excel',
      });

      await comprasApi.downloadFile(
        blob,
        `registro_compras_${empresa.ruc}_${new Date().toISOString().substring(0, 10)}.xlsx`
      );
    } catch (err) {
      setError('Error al exportar a Excel');
      console.error(err);
    }
  };

  const handleDeleteCompra = async (compraId: string) => {
    if (!window.confirm('¿Eliminar este registro de compra?')) return;

    try {
      await comprasApi.delete(compraId);
      void loadCompras();
      void loadStats();
    } catch {
      setError('Error al eliminar el registro');
    }
  };

  const abrirEdicion = (compraId: string) => {
    const compra = compras.find((c) => c.id === compraId) ?? null;
    setEditingCompra(compra);
    setShowModal(true);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  /**
   * Lo que se enseña en las tarjetas.
   *
   * Con un mes concreto viene del resumen del backend. Con «todos los
   * periodos» no hay resumen —el endpoint exige un mes— asi que se suma lo
   * cargado: es preferible a dejar las tarjetas en blanco, y ademas siempre
   * coincide con lo que se ve en la tabla.
   */
  const visibles = buscarProveedor.trim()
    ? compras.filter((c) =>
        (c.razon_social_proveedor || '')
          .toLowerCase()
          .includes(buscarProveedor.trim().toLowerCase())
      )
    : compras;
  const sumado: ComprasStats = {
    total_registros: visibles.length,
    suma_base_imponible: visibles.reduce((t, c) => t + (c.base_imponible_gravada || 0), 0),
    suma_igv: visibles.reduce((t, c) => t + (c.igv || 0), 0),
    suma_importe_total: visibles.reduce((t, c) => t + (c.importe_total || 0), 0),
  };

  // El resumen del backend solo vale mientras se vea todo el periodo. En cuanto
  // hay una busqueda por proveedor, las tarjetas tienen que contar lo que esta
  // en la tabla o dirian una cosa distinta de la que se ve.
  const resumen: ComprasStats = stats && !buscarProveedor.trim() ? stats : sumado;


  const rows: ComprobanteRow[] = visibles.map((c) => ({
    id: c.id,
    fecha: c.fecha_comprobante,
    tipo_comprobante: c.tipo_comprobante,
    serie_comprobante: c.serie_comprobante,
    numero_comprobante: c.numero_comprobante,
    contraparte_nombre: c.razon_social_proveedor,
    contraparte_documento: c.numero_documento_proveedor,
    base_imponible: c.base_imponible_gravada,
    igv: c.igv,
    importe_total: c.importe_total,
    estado_operacion: c.estado_operacion,
  }));

  return (
    <div className="space-y-5">
      {/* --- Periodo --- */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={cn('min-w-0 flex-1', todosLosPeriodos && 'opacity-40')}>
          <PeriodoSelector value={periodo} onChange={setPeriodo} />
        </div>
        <label className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={todosLosPeriodos}
            onChange={(e) => setTodosLosPeriodos(e.target.checked)}
            className="size-4 rounded border-slate-300"
          />
          Ver todos los periodos
        </label>
      </div>

      <StatGrid>
        <StatCard
          label="Total registros"
          value={resumen.total_registros.toLocaleString('es-PE')}
          icon={Receipt}
          tone="blue"
        />
        <StatCard
          label="Base imponible"
          value={soles(resumen.suma_base_imponible)}
          icon={FileText}
          tone="slate"
        />
        <StatCard
          label="IGV credito fiscal"
          value={soles(resumen.suma_igv)}
          icon={TrendingUp}
          tone="amber"
        />
        <StatCard
          label="Total compras"
          value={soles(resumen.suma_importe_total)}
          icon={Wallet}
          tone="green"
        />
      </StatGrid>

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

        {/* La accion tiene que estar donde el usuario mira sus compras, no
            escondida en otro menu. Lleva el periodo que ya tiene elegido. */}
        <Link
          to={`/contabilidad/compras-sire?periodo=${periodoTexto}`}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"
        >
          <CloudDownload className="size-4" aria-hidden="true" />
          Importar del SIRE
        </Link>

        <button
          type="button"
          onClick={() => {
            setEditingCompra(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nueva compra
        </button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-3">

          <div>
            <label htmlFor="rc-ruc" className={labelClass}>
              RUC / DNI proveedor
            </label>
            <input
              id="rc-ruc"
              type="text"
              placeholder="20123456789"
              value={filters.numero_documento_proveedor || ''}
              onChange={(e) => handleFilterChange({ numero_documento_proveedor: e.target.value })}
              className={cn(control, 'font-mono')}
            />
          </div>

          <div>
            <label htmlFor="rc-razon" className={labelClass}>
              Buscar proveedor
            </label>
            <input
              id="rc-razon"
              type="text"
              placeholder="Nombre del proveedor…"
              value={buscarProveedor}
              onChange={(e) => setBuscarProveedor(e.target.value)}
              className={control}
            />
          </div>

          <div>
            <label htmlFor="rc-tipo" className={labelClass}>
              Tipo de comprobante
            </label>
            <select
              id="rc-tipo"
              value={filters.tipo_comprobante || ''}
              onChange={(e) => handleFilterChange({ tipo_comprobante: e.target.value })}
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
        contraparteLabel="Proveedor"
        emptyMessage="No se encontraron registros de compras con los filtros aplicados."
        onVer={abrirEdicion}
        onEditar={abrirEdicion}
        onEliminar={handleDeleteCompra}
      />

      {showModal && empresa && (
        <ComprasFormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingCompra(null);
          }}
          onSuccess={() => {
            void loadCompras();
            void loadStats();
          }}
          editingCompra={editingCompra}
          empresaId={empresa.ruc}
        />
      )}
    </div>
  );
};

export default RegistroComprasPage;
