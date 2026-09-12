import React from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  Landmark,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  TriangleAlert,
  CheckCircle2,
} from 'lucide-react';
import type { AsientoContable, LibroDiario } from '../../../types/libroDiario';
import FormularioAsiento from './FormularioAsiento';
import EstadisticasAsientos from './EstadisticasAsientos';
import PLEExportManager from './PLEExportManager';
import { useAsientosLogic, type EstadoAsiento } from './AsientosLogic';
import Modal from '../../common/Modal';
import Toast from '../../common/Toast';
import EmptyState from '../../common/EmptyState';
import { cn } from '../../../lib/cn';

interface AsientosManagerProps {
  libroId: string;
  libro?: LibroDiario;
  asientos: AsientoContable[];
  onCrearAsiento?: (asiento: Omit<AsientoContable, 'id'>) => Promise<void>;
  onEditarAsiento?: (id: string, asiento: Partial<AsientoContable>) => Promise<void>;
  onEliminarAsiento?: (id: string) => Promise<void>;
  onExportarExcel?: () => Promise<void>;
  onExportarPDF?: () => Promise<void>;
  isLoading?: boolean;
}

const soles = (n: number): string =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const control = cn(
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
  'placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
);

const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase';
const th = 'px-3 py-2.5 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase';
const td = 'px-3 py-3 text-sm text-slate-700';

/**
 * Gestion de asientos de un libro diario.
 *
 * Toda la logica vive en `useAsientosLogic`; aqui solo esta la presentacion,
 * migrada a Tailwind (antes 785 lineas con 79 estilos inline).
 */
const AsientosManager: React.FC<AsientosManagerProps> = (props) => {
  const { libroId, libro, isLoading = false } = props;
  const logic = useAsientosLogic(props);

  const columnas: { id: 'fecha' | 'numero' | 'descripcion' | 'debe' | 'haber'; label: string; align?: string }[] = [
    { id: 'fecha', label: 'Fecha' },
    { id: 'numero', label: 'Número' },
    { id: 'descripcion', label: 'Descripción' },
    { id: 'debe', label: 'Debe', align: 'text-right' },
    { id: 'haber', label: 'Haber', align: 'text-right' },
  ];

  const abrirPLE = () => {
    if (logic.asientosFiltrados.length === 0) {
      logic.showToast('No hay asientos para exportar a PLE', 'error');
      return;
    }
    if (!logic.isBalanceado) {
      const continuar = window.confirm(
        'El libro no está balanceado. ¿Deseas continuar con la exportación PLE?'
      );
      if (!continuar) return;
    }
    logic.setMostrarPLEManager(true);
  };

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------------------------ */}
      {/* Filtros y acciones                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div>
            <label htmlFor="as-desde" className={labelClass}>
              Fecha desde
            </label>
            <input
              id="as-desde"
              type="date"
              value={logic.filtroFecha}
              onChange={(e) => logic.setFiltroFecha(e.target.value)}
              className={control}
            />
          </div>

          <div>
            <label htmlFor="as-hasta" className={labelClass}>
              Fecha hasta
            </label>
            <input
              id="as-hasta"
              type="date"
              value={logic.filtroFechaHasta}
              onChange={(e) => logic.setFiltroFechaHasta(e.target.value)}
              className={control}
            />
          </div>

          <div>
            <label htmlFor="as-descripcion" className={labelClass}>
              Descripción
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="as-descripcion"
                type="search"
                value={logic.filtroDescripcion}
                onChange={(e) => logic.setFiltroDescripcion(e.target.value)}
                placeholder="Buscar…"
                className={cn(control, 'pl-9')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="as-estado" className={labelClass}>
              Estado
            </label>
            <select
              id="as-estado"
              value={logic.filtroEstado}
              onChange={(e) => logic.setFiltroEstado(e.target.value as EstadoAsiento | '')}
              className={control}
            >
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="confirmado">Confirmado</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>

          <div>
            <label htmlFor="as-cuenta" className={labelClass}>
              Cuenta
            </label>
            <input
              id="as-cuenta"
              type="text"
              value={logic.filtroCuenta}
              onChange={(e) => logic.setFiltroCuenta(e.target.value)}
              placeholder="Código"
              className={cn(control, 'font-mono')}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={logic.handleCrearAsiento}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nuevo asiento
          </button>

          <button
            type="button"
            onClick={logic.limpiarFiltros}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Limpiar filtros
          </button>

          <div className="ml-auto flex flex-wrap gap-2">
            {props.onExportarExcel && (
              <button
                type="button"
                onClick={() => logic.handleExportar('excel')}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <FileSpreadsheet className="size-4 text-emerald-600" aria-hidden="true" />
                Excel
              </button>
            )}

            {props.onExportarPDF && (
              <button
                type="button"
                onClick={() => logic.handleExportar('pdf')}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <FileDown className="size-4 text-red-600" aria-hidden="true" />
                PDF
              </button>
            )}

            {libro && (
              <button
                type="button"
                onClick={abrirPLE}
                disabled={isLoading}
                title={`Exportar ${logic.asientosFiltrados.length} asientos a PLE SUNAT`}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                <Landmark className="size-4" aria-hidden="true" />
                PLE SUNAT
                <span className="rounded-full bg-white/20 px-1.5 text-xs tabular-nums">
                  {logic.asientosFiltrados.length}
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Totales                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section
        className={cn(
          'flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border px-4 py-3.5',
          logic.isBalanceado ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        )}
      >
        <div className="flex items-center gap-2">
          {logic.isBalanceado ? (
            <CheckCircle2 className="size-5 text-green-600" aria-hidden="true" />
          ) : (
            <TriangleAlert className="size-5 text-red-600" aria-hidden="true" />
          )}
          <span
            className={cn(
              'text-sm font-semibold',
              logic.isBalanceado ? 'text-green-800' : 'text-red-800'
            )}
          >
            {logic.isBalanceado ? 'Libro balanceado' : 'Libro desbalanceado'}
          </span>
        </div>

        <dl className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Debe</dt>
            <dd className="text-base font-bold text-slate-900 tabular-nums">
              {soles(logic.totales.totalDebe)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Haber</dt>
            <dd className="text-base font-bold text-slate-900 tabular-nums">
              {soles(logic.totales.totalHaber)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Diferencia
            </dt>
            <dd
              className={cn(
                'text-base font-bold tabular-nums',
                logic.isBalanceado ? 'text-green-700' : 'text-red-700'
              )}
            >
              {soles(Math.abs(logic.totales.totalDebe - logic.totales.totalHaber))}
            </dd>
          </div>
        </dl>
      </section>

      <EstadisticasAsientos asientos={logic.asientosFiltrados} periodo={libro?.periodo} />

      {/* ------------------------------------------------------------------ */}
      {/* Tabla                                                              */}
      {/* ------------------------------------------------------------------ */}
      {logic.asientosPaginados.length === 0 ? (
        <EmptyState
          title="No hay asientos"
          description={
            props.asientos.length === 0
              ? 'Este libro todavía no tiene asientos contables.'
              : 'No se encontraron asientos con los filtros aplicados.'
          }
        >
          {props.asientos.length === 0 && (
            <button
              type="button"
              onClick={logic.handleCrearAsiento}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="size-4" aria-hidden="true" />
              Crear el primer asiento
            </button>
          )}
        </EmptyState>
      ) : (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  {columnas.map((col) => {
                    const activo = logic.orden.columna === col.id;
                    return (
                      <th key={col.id} scope="col" className={cn(th, col.align)}>
                        <button
                          type="button"
                          onClick={() => logic.handleOrdenar(col.id)}
                          aria-sort={
                            activo
                              ? logic.orden.direccion === 'asc'
                                ? 'ascending'
                                : 'descending'
                              : 'none'
                          }
                          className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-xs font-semibold tracking-wide text-slate-600 uppercase hover:text-slate-900"
                        >
                          {col.label}
                          {activo && (
                            <ChevronDown
                              className={cn(
                                'size-3.5 text-blue-600 transition-transform',
                                logic.orden.direccion === 'asc' && 'rotate-180'
                              )}
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </th>
                    );
                  })}
                  <th scope="col" className={cn(th, 'text-right')}>
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {logic.asientosPaginados.map((asiento) => {
                  const totalDebe = asiento.detalles.reduce((s, d) => s + (d.debe || 0), 0);
                  const totalHaber = asiento.detalles.reduce((s, d) => s + (d.haber || 0), 0);
                  const isExpandido = logic.isAsientoExpandido(asiento.id);

                  return (
                    <React.Fragment key={asiento.id}>
                      <tr
                        onClick={() => logic.toggleExpandirAsiento(asiento.id)}
                        className={cn(
                          'cursor-pointer border-b border-slate-100 transition-colors',
                          isExpandido ? 'bg-blue-50' : 'hover:bg-slate-50'
                        )}
                      >
                        <td className={td}>
                          <div className="flex items-center gap-2">
                            <ChevronDown
                              className={cn(
                                'size-4 shrink-0 text-slate-400 transition-transform',
                                !isExpandido && '-rotate-90'
                              )}
                              aria-hidden="true"
                            />
                            <span className="tabular-nums">
                              {new Date(asiento.fecha).toLocaleDateString('es-PE')}
                            </span>
                          </div>
                        </td>

                        <td className={cn(td, 'font-medium tabular-nums')}>{asiento.numero}</td>

                        <td className={td}>
                          <p className="max-w-75 truncate font-medium text-slate-900">
                            {asiento.descripcion}
                          </p>
                          <p className="text-xs text-slate-500">
                            {asiento.detalles.length} cuenta(s)
                          </p>
                        </td>

                        <td className={cn(td, 'text-right font-semibold text-blue-700 tabular-nums')}>
                          {totalDebe > 0 ? soles(totalDebe) : '—'}
                        </td>

                        <td
                          className={cn(td, 'text-right font-semibold text-violet-700 tabular-nums')}
                        >
                          {totalHaber > 0 ? soles(totalHaber) : '—'}
                        </td>

                        <td className={cn(td, 'text-right')}>
                          <div className="inline-flex gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                logic.handleEditarAsiento(asiento);
                              }}
                              title="Editar asiento"
                              aria-label={`Editar asiento ${asiento.numero}`}
                              className="grid size-8 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                logic.handleEliminarAsiento(asiento.id);
                              }}
                              title="Eliminar asiento"
                              aria-label={`Eliminar asiento ${asiento.numero}`}
                              className="grid size-8 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Detalle del asiento */}
                      {isExpandido && (
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <td colSpan={6} className="px-4 py-4">
                            <h4 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                              Detalle del asiento #{asiento.numero}
                            </h4>
                            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                              <table className="w-full border-collapse">
                                <thead className="bg-slate-100">
                                  <tr>
                                    <th className={th}>Código</th>
                                    <th className={th}>Denominación</th>
                                    <th className={cn(th, 'text-right')}>Debe</th>
                                    <th className={cn(th, 'text-right')}>Haber</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {asiento.detalles.map((detalle, index) => (
                                    <tr
                                      key={index}
                                      className="border-b border-slate-100 last:border-0"
                                    >
                                      <td className={cn(td, 'font-mono')}>
                                        {detalle.codigoCuenta}
                                      </td>
                                      <td className={td}>{detalle.denominacionCuenta}</td>
                                      <td className={cn(td, 'text-right tabular-nums')}>
                                        {detalle.debe ? soles(detalle.debe) : '—'}
                                      </td>
                                      <td className={cn(td, 'text-right tabular-nums')}>
                                        {detalle.haber ? soles(detalle.haber) : '—'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Paginación */}
      {logic.totalPaginas > 1 && (
        <nav aria-label="Paginación" className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => logic.cambiarPagina(logic.paginaActual - 1)}
            disabled={logic.paginaActual === 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Anterior
          </button>

          <span className="text-sm text-slate-500 tabular-nums">
            Página {logic.paginaActual} de {logic.totalPaginas}
          </span>

          <button
            type="button"
            onClick={() => logic.cambiarPagina(logic.paginaActual + 1)}
            disabled={logic.paginaActual === logic.totalPaginas}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Siguiente
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </nav>
      )}

      {/* Formulario de asiento */}
      <Modal
        isOpen={logic.mostrarFormulario}
        onClose={logic.handleCerrarFormulario}
        size="xl"
        title={logic.asientoEditando ? 'Editar asiento' : 'Nuevo asiento'}
      >
        <FormularioAsiento
          libroId={libroId}
          asientoEditando={logic.asientoEditando}
          asientosExistentes={props.asientos}
          onGuardar={async (asiento) => {
            if (logic.asientoEditando && props.onEditarAsiento) {
              await props.onEditarAsiento(logic.asientoEditando.id, asiento);
            } else if (props.onCrearAsiento) {
              await props.onCrearAsiento(asiento);
            }
            logic.handleCerrarFormulario();
          }}
          onCerrar={logic.handleCerrarFormulario}
        />
      </Modal>

      {logic.toast && (
        <Toast
          message={logic.toast.message}
          type={logic.toast.type}
          onClose={() => logic.showToast('', 'info')}
        />
      )}

      {/* Exportación PLE */}
      {logic.mostrarPLEManager && libro && (
        <PLEExportManager
          libro={libro}
          asientos={logic.asientosFiltrados}
          onClose={() => logic.setMostrarPLEManager(false)}
          onSuccess={(response) => {
            logic.showToast(
              `Archivo PLE generado: ${response.archivo_nombre || 'archivo.txt'}`,
              'success'
            );
            logic.setMostrarPLEManager(false);
          }}
          onError={(error) => logic.showToast(`Error al generar PLE: ${error}`, 'error')}
        />
      )}
    </div>
  );
};

export default AsientosManager;
