import React from 'react';
import { Loader2, Pencil, Trash2, Users } from 'lucide-react';
import type { SocioNegocio } from '../../services/sociosNegocioApi';
import EmptyState from '../common/EmptyState';
import { cn } from '../../lib/cn';

interface SociosNegocioTableProps {
  socios: SocioNegocio[];
  onEdit: (socio: SocioNegocio) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const TIPO_SOCIO_TONE: Record<string, string> = {
  proveedor: 'bg-amber-100 text-amber-800',
  cliente: 'bg-blue-100 text-blue-800',
  ambos: 'bg-violet-100 text-violet-800',
};

const th = 'px-3 py-2.5 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase';
const td = 'px-3 py-3 text-sm text-slate-700';

const SociosNegocioTable: React.FC<SociosNegocioTableProps> = ({
  socios,
  onEdit,
  onDelete,
  loading = false,
}) => {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-16"
        role="status"
      >
        <Loader2 className="size-5 animate-spin text-blue-600" aria-hidden="true" />
        <span className="ml-3 text-sm text-slate-500">Cargando socios de negocio…</span>
      </div>
    );
  }

  if (socios.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No hay socios registrados"
        description="Empieza agregando tu primer socio de negocio."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th scope="col" className={th}>Documento</th>
              <th scope="col" className={th}>Razón social</th>
              <th scope="col" className={th}>Tipo</th>
              <th scope="col" className={th}>Email</th>
              <th scope="col" className={th}>Teléfono</th>
              <th scope="col" className={cn(th, 'text-center')}>Estado</th>
              <th scope="col" className={cn(th, 'text-right')}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {socios.map((socio) => (
              <tr
                key={socio.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className={td}>
                  <span className="text-xs font-medium text-slate-500">{socio.tipo_documento}</span>
                  <span className="block font-mono">{socio.numero_documento}</span>
                </td>

                <td className={td}>
                  <p className="max-w-64 truncate font-medium text-slate-900">
                    {socio.razon_social}
                  </p>
                  {socio.nombre_comercial && (
                    <p className="max-w-64 truncate text-xs text-slate-500">
                      {socio.nombre_comercial}
                    </p>
                  )}
                </td>

                <td className={td}>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                      TIPO_SOCIO_TONE[socio.tipo_socio] ?? 'bg-slate-100 text-slate-700'
                    )}
                  >
                    {socio.tipo_socio}
                  </span>
                </td>

                <td className={cn(td, 'max-w-48 truncate')}>
                  {socio.email || <span className="text-slate-400">—</span>}
                </td>

                <td className={cn(td, 'tabular-nums')}>
                  {socio.telefono || <span className="text-slate-400">—</span>}
                </td>

                <td className={cn(td, 'text-center')}>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                      socio.activo ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        socio.activo ? 'bg-green-500' : 'bg-slate-400'
                      )}
                      aria-hidden="true"
                    />
                    {socio.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                <td className={cn(td, 'text-right')}>
                  <div className="inline-flex gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(socio)}
                      title="Editar socio"
                      aria-label={`Editar ${socio.razon_social}`}
                      className="grid size-8 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar a ${socio.razon_social}?`)) {
                          onDelete(socio.id);
                        }
                      }}
                      title="Eliminar socio"
                      aria-label={`Eliminar ${socio.razon_social}`}
                      className="grid size-8 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SociosNegocioTable;
