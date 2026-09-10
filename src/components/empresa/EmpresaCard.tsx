import React from 'react';
import { Check, Mail, MapPin, Pencil, Phone, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import type { EmpresaCardProps } from '../../types/empresa';
import { cn } from '../../lib/cn';

/**
 * Tarjeta de empresa del selector.
 *
 * Migrada a Tailwind. Antes eran 585 lineas con 24 estilos inline que volcaban
 * en pantalla todos los campos de configuracion SIRE (Client ID, Usuario...),
 * la mayoria vacios. Ahora el estado SIRE se resume en una insignia y el
 * detalle vive donde se edita: el panel de configuracion.
 */
const EmpresaCard: React.FC<EmpresaCardProps> = ({
  empresa,
  onSelect,
  onEdit,
  onDelete,
  onConfigSire,
  isSelected = false,
}) => {
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const handleDelete = (e: React.MouseEvent) => {
    stop(e);
    if (onDelete && window.confirm(`¿Eliminar la empresa ${empresa.razon_social}?`)) {
      onDelete(empresa.ruc);
    }
  };

  return (
    <article
      className={cn(
        'flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-all duration-200',
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
      )}
    >
      {/* Cabecera: RUC + estados */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-lg font-bold tracking-tight text-slate-900 tabular-nums">
          {empresa.ruc}
        </span>

        {isSelected && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
            <Check className="size-3" aria-hidden="true" />
            Actual
          </span>
        )}

        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            empresa.activa ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
          )}
        >
          <span
            className={cn('size-1.5 rounded-full', empresa.activa ? 'bg-green-500' : 'bg-slate-400')}
            aria-hidden="true"
          />
          {empresa.activa ? 'Activa' : 'Inactiva'}
        </span>

        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            empresa.sire_activo ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
          )}
        >
          {empresa.sire_activo ? (
            <ShieldCheck className="size-3" aria-hidden="true" />
          ) : (
            <ShieldOff className="size-3" aria-hidden="true" />
          )}
          {empresa.sire_activo ? 'SIRE activo' : 'Sin SIRE'}
        </span>
      </div>

      {/* Razon social */}
      <h3 className="mb-3 text-base leading-snug font-semibold text-slate-900">
        {empresa.razon_social}
      </h3>

      {/* Datos de contacto: solo los que existen */}
      <dl className="mb-5 flex-1 space-y-1.5 text-sm text-slate-500">
        {empresa.direccion && (
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <dd className="min-w-0">{empresa.direccion}</dd>
          </div>
        )}
        {empresa.telefono && (
          <div className="flex items-center gap-2">
            <Phone className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <dd className="tabular-nums">{empresa.telefono}</dd>
          </div>
        )}
        {empresa.email && (
          <div className="flex items-center gap-2">
            <Mail className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <dd className="min-w-0 truncate">{empresa.email}</dd>
          </div>
        )}
      </dl>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect?.(empresa)}
          disabled={isSelected}
          className={cn(
            'flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
            isSelected
              ? 'cursor-default bg-slate-100 text-slate-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {isSelected ? 'Empresa actual' : 'Entrar'}
        </button>

        <button
          type="button"
          onClick={(e) => {
            stop(e);
            onConfigSire?.(empresa);
          }}
          title="Configurar SIRE"
          aria-label={`Configurar SIRE de ${empresa.razon_social}`}
          className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white p-0 text-slate-500 hover:bg-slate-50 hover:text-amber-600"
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            stop(e);
            onEdit?.(empresa);
          }}
          title="Editar empresa"
          aria-label={`Editar ${empresa.razon_social}`}
          className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white p-0 text-slate-500 hover:bg-slate-50 hover:text-blue-600"
        >
          <Pencil className="size-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          title="Eliminar empresa"
          aria-label={`Eliminar ${empresa.razon_social}`}
          className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white p-0 text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};

export default EmpresaCard;
