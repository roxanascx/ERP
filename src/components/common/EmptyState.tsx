import React from 'react';
import { Construction, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Hueco vacio / funcionalidad pendiente.
 * El bloque "🚧 En Desarrollo" estaba copiado en varias pantallas.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Construction,
  title,
  description,
  children,
}) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
    <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-slate-200/70">
      <Icon className="size-6 text-slate-400" aria-hidden="true" />
    </div>
    <h3 className="mb-1 text-base font-semibold text-slate-700">{title}</h3>
    {description && <p className="mx-auto max-w-md text-sm text-slate-500">{description}</p>}
    {children && <div className="mt-4">{children}</div>}
  </div>
);

export default EmptyState;
