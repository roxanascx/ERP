import React from 'react';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/cn';

interface SunatAuthBannerProps {
  authenticated?: boolean;
  loading?: boolean;
}

/**
 * Estado de la sesion con SUNAT.
 *
 * Estaba escrito a mano en varias pantallas de SIRE, cada una con sus propios
 * colores y su propio emoji.
 */
const SunatAuthBanner: React.FC<SunatAuthBannerProps> = ({ authenticated, loading }) => {
  const ok = Boolean(authenticated);

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3',
        ok ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
      )}
    >
      {ok ? (
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden="true" />
      ) : (
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
      )}
      <div className="min-w-0">
        <p className={cn('text-sm font-semibold', ok ? 'text-green-800' : 'text-amber-800')}>
          {loading && <Loader2 className="mr-1.5 inline size-3.5 animate-spin" aria-hidden="true" />}
          {ok ? 'Autenticado en SUNAT' : 'Sin autenticar en SUNAT'}
        </p>
        {!ok && (
          <p className="text-sm text-amber-700">
            Algunas operaciones pueden fallar. Revisa las credenciales SIRE de la empresa.
          </p>
        )}
      </div>
    </div>
  );
};

export default SunatAuthBanner;
