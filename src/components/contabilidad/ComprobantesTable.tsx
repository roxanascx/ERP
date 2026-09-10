import React from 'react';
import { AlertCircle, Eye, FileText, Loader2, Pencil, Trash2 } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { cn } from '../../lib/cn';

/**
 * Fila normalizada: compras y ventas tienen el mismo formato de comprobante,
 * solo cambia si la contraparte es proveedor o cliente.
 */
export interface ComprobanteRow {
  id: string;
  fecha: string;
  tipo_comprobante: string;
  serie_comprobante?: string;
  numero_comprobante: string;
  contraparte_nombre: string;
  contraparte_documento: string;
  base_imponible: number;
  igv: number;
  importe_total: number;
  estado_operacion?: string;
}

interface ComprobantesTableProps {
  rows: ComprobanteRow[];
  loading: boolean;
  error?: string | null;
  /** Cabecera de la columna de contraparte */
  contraparteLabel: string;
  emptyMessage: string;
  onVer?: (id: string) => void;
  onEditar?: (id: string) => void;
  onEliminar?: (id: string) => void;
}

const ESTADOS: Record<string, { label: string; tone: string }> = {
  '1': { label: 'Registrado', tone: 'bg-green-100 text-green-800' },
  '2': { label: 'Anulado', tone: 'bg-red-100 text-red-800' },
  '3': { label: 'Modificado', tone: 'bg-amber-100 text-amber-800' },
};

const soles = (n: number): string =>
  `S/ ${(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatFecha = (fecha: string): string => {
  try {
    return new Date(fecha).toLocaleDateString('es-PE');
  } catch {
    return fecha;
  }
};

const th = 'px-3 py-2.5 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase';
const td = 'px-3 py-3 text-sm text-slate-700';

/**
 * Tabla de comprobantes compartida por el registro de compras y el de ventas.
 * Antes cada pagina repetia la misma tabla con sus propios estilos inline.
 */
const ComprobantesTable: React.FC<ComprobantesTableProps> = ({
  rows,
  loading,
  error,
  contraparteLabel,
  emptyMessage,
  onVer,
  onEditar,
  onEliminar,
}) => {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-16"
        role="status"
      >
        <Loader2 className="size-5 animate-spin text-blue-600" aria-hidden="true" />
        <span className="ml-3 text-sm text-slate-500">Cargando registros…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
      >
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
        <p className="text-sm font-medium text-red-800">{error}</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState icon={FileText} title="Sin registros" description={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th scope="col" className={th}>Fecha</th>
              <th scope="col" className={th}>Comprobante</th>
              <th scope="col" className={th}>{contraparteLabel}</th>
              <th scope="col" className={cn(th, 'text-right')}>Base imponible</th>
              <th scope="col" className={cn(th, 'text-right')}>IGV</th>
              <th scope="col" className={cn(th, 'text-right')}>Total</th>
              <th scope="col" className={cn(th, 'text-center')}>Estado</th>
              <th scope="col" className={cn(th, 'text-right')}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const estado = ESTADOS[row.estado_operacion ?? ''] ?? {
                label: 'Sin estado',
                tone: 'bg-slate-100 text-slate-600',
              };

              return (
                <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className={cn(td, 'tabular-nums')}>{formatFecha(row.fecha)}</td>

                  <td className={td}>
                    <span className="font-medium text-slate-900">
                      {row.tipo_comprobante}
                      {' · '}
                      <span className="font-mono">
                        {row.serie_comprobante ? `${row.serie_comprobante}-` : ''}
                        {row.numero_comprobante}
                      </span>
                    </span>
                  </td>

                  <td className={td}>
                    <p className="max-w-64 truncate font-medium text-slate-900">
                      {row.contraparte_nombre}
                    </p>
                    <p className="font-mono text-xs text-slate-500">{row.contraparte_documento}</p>
                  </td>

                  <td className={cn(td, 'text-right tabular-nums')}>{soles(row.base_imponible)}</td>
                  <td className={cn(td, 'text-right tabular-nums')}>{soles(row.igv)}</td>
                  <td className={cn(td, 'text-right font-semibold tabular-nums')}>
                    {soles(row.importe_total)}
                  </td>

                  <td className={cn(td, 'text-center')}>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        estado.tone
                      )}
                    >
                      {estado.label}
                    </span>
                  </td>

                  <td className={cn(td, 'text-right')}>
                    <div className="inline-flex gap-1">
                      {onVer && (
                        <button
                          type="button"
                          onClick={() => onVer(row.id)}
                          title="Ver detalles"
                          aria-label={`Ver comprobante ${row.numero_comprobante}`}
                          className="grid size-8 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Eye className="size-4" aria-hidden="true" />
                        </button>
                      )}
                      {onEditar && (
                        <button
                          type="button"
                          onClick={() => onEditar(row.id)}
                          title="Editar registro"
                          aria-label={`Editar comprobante ${row.numero_comprobante}`}
                          className="grid size-8 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </button>
                      )}
                      {onEliminar && (
                        <button
                          type="button"
                          onClick={() => onEliminar(row.id)}
                          title="Eliminar registro"
                          aria-label={`Eliminar comprobante ${row.numero_comprobante}`}
                          className="grid size-8 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComprobantesTable;
