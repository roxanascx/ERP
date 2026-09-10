import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { buildBreadcrumbs } from '../../config/navigation';

/**
 * Migas de pan derivadas de la ruta y de los titulos declarados en la config.
 *
 * Solo se pintan cuando hay al menos dos niveles: en una pantalla de primer
 * nivel no aportan nada que el sidebar no diga ya.
 */
const Breadcrumbs: React.FC = () => {
  const { pathname } = useLocation();
  const crumbs = buildBreadcrumbs(pathname);

  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Ruta de navegación" className="mb-1">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="size-3.5 shrink-0 text-slate-300" aria-hidden="true" />
              )}
              {isLast ? (
                <span aria-current="page" className="font-medium text-slate-700">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-slate-500 no-underline hover:text-slate-900 hover:underline"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
