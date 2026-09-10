import React from 'react';
import { Building2, Loader2 } from 'lucide-react';

interface AppLoadingProps {
  message?: string;
}

/**
 * Pantalla de carga a pantalla completa.
 *
 * Unifica las dos que estaban duplicadas inline en AppRouter y
 * EmpresaProtectedRoute, cada una con su propio <style> inyectando `spin`.
 */
const AppLoading: React.FC<AppLoadingProps> = ({ message = 'Cargando aplicación…' }) => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-500 to-purple-700 p-6"
  >
    <div className="w-full max-w-sm rounded-2xl bg-white/95 px-8 py-10 text-center shadow-2xl backdrop-blur">
      <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white">
        <Building2 className="size-7" aria-hidden="true" />
      </div>

      <h1 className="mb-3 text-lg font-bold tracking-tight text-slate-900">Sistema ERP</h1>

      <p className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {message}
      </p>
    </div>
  </div>
);

export default AppLoading;
