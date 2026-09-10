import React from 'react';
import { CheckCircle2, Clock, Loader2, ShieldAlert, ShieldCheck, Ticket } from 'lucide-react';
import ModuleGrid from '../../../components/common/ModuleGrid';
import { useRvie } from '../../../hooks/useRvie';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import { RVIE_MODULES } from '../../../config/navigation';
import { cn } from '../../../lib/cn';

/**
 * Portada de RVIE.
 *
 * Sin layout propio (lo aporta MainLayout) y sin el bloque
 * "Empresa no encontrada", que era inalcanzable: RequireEmpresa ya redirige.
 * Tampoco repite RUC y razon social, que la cabecera ya muestra.
 */
const RvieHomePage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();
  const { authStatus, tickets, loading } = useRvie({ ruc: empresaActual?.ruc || '' });

  const total = tickets?.length ?? 0;
  const terminados = tickets?.filter((t) => t.status === 'TERMINADO').length ?? 0;
  const procesando = tickets?.filter((t) => t.status === 'PROCESANDO').length ?? 0;
  const autenticado = Boolean(authStatus?.authenticated);

  const stats = [
    { id: 'total', label: 'Tickets', value: total, icon: Ticket, tone: 'text-slate-600 bg-slate-100' },
    { id: 'ok', label: 'Terminados', value: terminados, icon: CheckCircle2, tone: 'text-green-600 bg-green-50' },
    { id: 'wip', label: 'Procesando', value: procesando, icon: Clock, tone: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Estado de la conexion con SUNAT */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border p-4',
            autenticado ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          )}
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/70">
            {autenticado ? (
              <ShieldCheck className="size-5 text-green-600" aria-hidden="true" />
            ) : (
              <ShieldAlert className="size-5 text-red-600" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                'text-xs font-medium tracking-wide uppercase',
                autenticado ? 'text-green-700' : 'text-red-700'
              )}
            >
              Estado SUNAT
            </p>
            <p
              className={cn(
                'flex items-center gap-1.5 text-sm font-semibold',
                autenticado ? 'text-green-800' : 'text-red-800'
              )}
            >
              {loading && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
              {autenticado ? 'Autenticado' : 'No autenticado'}
            </p>
          </div>
        </div>

        {stats.map(({ id, label, value, icon: Icon, tone }) => (
          <div
            key={id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className={cn('grid size-10 shrink-0 place-items-center rounded-lg', tone)}>
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <ModuleGrid modules={RVIE_MODULES} title="Operaciones RVIE" />
    </div>
  );
};

export default RvieHomePage;
