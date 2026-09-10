import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import type { ModuloContable } from '../../config/navigation';
import { cn } from '../../lib/cn';

interface ModuleGridProps {
  modules: ModuloContable[];
  /** Encabezado de la seccion de modulos disponibles */
  title?: string;
  /** Encabezado de la seccion de modulos pendientes */
  pendingTitle?: string;
  /** Oculta los modulos no implementados */
  hidePending?: boolean;
}

/**
 * Rejilla de tarjetas de modulo.
 *
 * El mismo marcado estaba repetido a mano en el indice de Contabilidad, el
 * Dashboard y las tres portadas de SIRE, cada una con sus propios colores y su
 * propio criterio para marcar lo que aun no existe.
 */
const ModuleGrid: React.FC<ModuleGridProps> = ({
  modules,
  title = 'Módulos disponibles',
  pendingTitle = 'En desarrollo',
  hidePending = false,
}) => {
  const disponibles = modules.filter((m) => m.enabled);
  const pendientes = hidePending ? [] : modules.filter((m) => !m.enabled);

  return (
    <div className="space-y-8">
      {disponibles.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {title}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {disponibles.map((modulo) => {
              const Icon = modulo.icon;
              return (
                <article
                  key={modulo.id}
                  className={cn(
                    'group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm',
                    'transition-all duration-200 hover:-translate-y-1 hover:shadow-md',
                    modulo.accent.ring
                  )}
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div
                      className={cn(
                        'grid size-11 shrink-0 place-items-center rounded-xl',
                        modulo.accent.soft
                      )}
                    >
                      <Icon className={cn('size-5', modulo.accent.text)} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-900">
                        {modulo.label}
                        {modulo.badge && (
                          <span className="ml-2 rounded-full bg-teal-100 px-1.5 py-0.5 align-middle text-[10px] font-bold text-teal-700">
                            {modulo.badge}
                          </span>
                        )}
                      </h3>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
                        Disponible
                      </span>
                    </div>
                  </div>

                  <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-500">
                    {modulo.descripcion}
                  </p>

                  <Link
                    to={modulo.path}
                    className={cn(
                      'inline-flex w-fit items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white no-underline hover:no-underline',
                      'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900',
                      modulo.accent.solid
                    )}
                  >
                    Abrir módulo
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {pendientes.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {pendingTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pendientes.map((modulo) => {
              const Icon = modulo.icon;
              return (
                <article
                  key={modulo.id}
                  className="flex flex-col rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-5"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-200/60">
                      <Icon className="size-5 text-slate-400" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-600">{modulo.label}</h3>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-600">
                        <Clock className="size-3" aria-hidden="true" />
                        Pendiente
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-500">{modulo.descripcion}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ModuleGrid;
