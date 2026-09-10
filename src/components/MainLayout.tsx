import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Building2, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useEmpresaValidation } from '../hooks/useEmpresaValidation';
import { MAIN_NAV, isActivePath, resolvePageMeta } from '../config/navigation';
import { cn } from '../lib/cn';
import Breadcrumbs from './common/Breadcrumbs';

interface MainLayoutProps {
  /**
   * Opcional. Si no se pasa, el layout renderiza <Outlet /> y funciona como
   * route layout (uso recomendado). El modo `children` se mantiene solo para
   * paginas que aun no se han migrado al router anidado.
   */
  children?: React.ReactNode;
  /** Override manual del titulo. Por defecto se resuelve desde la ruta. */
  title?: string;
  subtitle?: string;
}

const SIDEBAR_STORAGE_KEY = 'erp:sidebar-collapsed';

/**
 * Chrome principal de la aplicacion: sidebar + cabecera.
 *
 * Migrado a Tailwind. Lo que cambia respecto a la version con estilos inline:
 *
 *   - Responsive real. Antes el sidebar era `position: fixed` con un ancho de
 *     70/280px pasara lo que pasara, asi que en movil se comia la pantalla y
 *     no habia forma de cerrarlo. Ahora en <lg es un drawer con fondo oscuro,
 *     que se cierra con Escape, con el fondo o al navegar.
 *   - :hover y :focus-visible son CSS de verdad, no 100 handlers de JS que no
 *     responden al teclado.
 *   - Iconos de lucide-react en vez de emojis.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children, title, subtitle }) => {
  const { empresaActual } = useEmpresaValidation();
  const location = useLocation();

  // Colapsado en escritorio: se recuerda entre navegaciones y recargas.
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Drawer en movil: siempre arranca cerrado.
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        /* almacenamiento no disponible: sigue funcionando en memoria */
      }
      return next;
    });
  };

  // Al navegar, el drawer se cierra: en movil el contenido queda tapado.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Escape cierra el drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const meta = resolvePageMeta(location.pathname);
  const pageTitle = title ?? meta.title;
  const pageSubtitle = subtitle ?? meta.subtitle;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fondo del drawer (solo movil) */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Sidebar                                                            */}
      {/* ------------------------------------------------------------------ */}
      <aside
        aria-label="Navegación principal"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white',
          'transition-[transform,width] duration-300 ease-out',
          'w-[280px]',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          'lg:translate-x-0 lg:shadow-none',
          collapsed ? 'lg:w-[76px]' : 'lg:w-[280px]'
        )}
      >
        {/* Marca */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 px-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
            <Building2 className="size-5" aria-hidden="true" />
          </div>
          <div className={cn('min-w-0 flex-1', collapsed && 'lg:hidden')}>
            <p className="truncate text-sm font-bold text-slate-900">Sistema ERP</p>
            <p className="truncate text-xs text-slate-500">Panel de control</p>
          </div>

          {/* Cerrar drawer (solo movil) */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
            className="grid size-9 shrink-0 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navegacion */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {MAIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.enabled && isActivePath(location.pathname, item.path);

            const inner = (
              <>
                <Icon
                  className={cn(
                    'size-5 shrink-0',
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                  aria-hidden="true"
                />
                <span className={cn('truncate', collapsed && 'lg:hidden')}>{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      'ml-auto rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700',
                      collapsed && 'lg:hidden'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            );

            const shared = cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              collapsed && 'lg:justify-center lg:px-0'
            );

            if (!item.enabled) {
              return (
                <span
                  key={item.id}
                  aria-disabled="true"
                  title={`${item.label} — próximamente`}
                  className={cn(shared, 'cursor-not-allowed text-slate-400')}
                >
                  {inner}
                </span>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  shared,
                  'no-underline hover:no-underline',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {inner}
              </Link>
            );
          })}
        </nav>

        {/* Colapsar (solo escritorio) */}
        <div className="hidden shrink-0 border-t border-slate-200 p-3 lg:block">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border-0 bg-transparent px-3 py-2 text-sm font-medium text-slate-600',
              'hover:bg-slate-100 hover:text-slate-900',
              collapsed && 'justify-center px-0'
            )}
          >
            {collapsed ? (
              <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="size-5 shrink-0" aria-hidden="true" />
                <span>Contraer</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Contenido                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-300 ease-out',
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[280px]'
        )}
      >
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:py-4">
            {/* Abrir drawer (solo movil) */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              className="grid size-10 shrink-0 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1">
              <Breadcrumbs />
              <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl">
                {pageTitle}
              </h1>
              <p className="hidden truncate text-sm text-slate-500 sm:block">{pageSubtitle}</p>
            </div>

            {empresaActual && (
              <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="hidden min-w-0 text-right sm:block">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {empresaActual.ruc}
                  </p>
                  <p className="max-w-[220px] truncate text-xs text-slate-500">
                    {empresaActual.razon_social}
                  </p>
                </div>
                <Link
                  to="/empresas"
                  className={cn(
                    'shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 no-underline',
                    'border border-slate-200 hover:bg-slate-100 hover:no-underline',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                  )}
                >
                  Cambiar
                </Link>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
};

export default MainLayout;
