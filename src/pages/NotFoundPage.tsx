import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';

/**
 * 404 explicito.
 *
 * Antes el catch-all hacia <Navigate to="/" replace />, lo que ocultaba enlaces
 * rotos: el usuario simplemente "rebotaba" al inicio sin saber por que.
 */
const NotFoundPage: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-slate-100">
          <Compass className="size-7 text-slate-500" aria-hidden="true" />
        </div>

        <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
          Página no encontrada
        </h1>
        <p className="mb-2 text-sm text-slate-500">No existe ninguna ruta para:</p>

        <code className="mb-6 inline-block rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm break-all text-slate-700">
          {location.pathname}
        </code>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-blue-700 hover:no-underline"
          >
            Ir al Dashboard
          </Link>
          <Link
            to="/empresas"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 no-underline hover:bg-slate-50 hover:no-underline"
          >
            Cambiar empresa
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
