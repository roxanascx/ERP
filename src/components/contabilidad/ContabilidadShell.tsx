import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CONTABILIDAD_MODULES, isActivePath } from '../../config/navigation';
import { cn } from '../../lib/cn';

/**
 * Shell del modulo de Contabilidad: barra de modulos + subruta.
 *
 * Antes esta barra vivia dentro de ContabilidadPage, asi que solo se veia en
 * el indice: al entrar en un libro desaparecia y habia que volver atras para
 * cambiar de modulo. Al moverla a un layout, persiste en todas las subrutas.
 */
const ContabilidadShell: React.FC = () => {
  const location = useLocation();

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <nav
          aria-label="Módulos de contabilidad"
          className="flex gap-1 overflow-x-auto px-2"
        >
          {CONTABILIDAD_MODULES.map((modulo) => {
            const Icon = modulo.icon;
            const isActive = modulo.enabled && isActivePath(location.pathname, modulo.path);

            const inner = (
              <>
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{modulo.label}</span>
                {modulo.badge && (
                  <span className="rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-700">
                    {modulo.badge}
                  </span>
                )}
              </>
            );

            const shared =
              'flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors';

            if (!modulo.enabled) {
              return (
                <span
                  key={modulo.id}
                  aria-disabled="true"
                  title={`${modulo.label} — próximamente`}
                  className={cn(shared, 'cursor-not-allowed border-transparent text-slate-300')}
                >
                  {inner}
                </span>
              );
            }

            return (
              <Link
                key={modulo.id}
                to={modulo.path}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  shared,
                  'no-underline hover:no-underline',
                  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600',
                  isActive
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                )}
              >
                {inner}
              </Link>
            );
          })}
        </nav>
      </div>

      <Outlet />
    </div>
  );
};

export default ContabilidadShell;
