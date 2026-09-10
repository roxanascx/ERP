import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock, TrendingUp } from 'lucide-react';
import { getCurrentExchangeRate } from '../services/exchangeRateApi';
import { MAIN_NAV } from '../config/navigation';
import { cn } from '../lib/cn';

interface ExchangeRate {
  compra?: number;
  venta?: number;
  fecha?: string;
}

/**
 * Dashboard.
 *
 * Antes esta pagina traia DENTRO su propio sidebar completo (con un cuarto
 * array de navegacion) y su propia cabecera, asi que al entrar aqui se veia un
 * menu distinto al del resto de la aplicacion: otros iconos, otro orden y otros
 * modulos. Ahora es una pagina normal bajo MainLayout, y las tarjetas se
 * generan desde MAIN_NAV, la misma fuente que alimenta el sidebar.
 */
const DashboardPage: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getCurrentExchangeRate('USD', 'PEN');
        if (!mounted) return;
        setExchangeRate({ compra: data.compra, venta: data.venta, fecha: data.fecha });
      } catch (e: unknown) {
        if (!mounted) return;
        const err = e as { response?: { status: number; data?: { detail?: string } }; request?: unknown };
        if (err?.response) {
          setExchangeError(`Error ${err.response.status}: ${err.response.data?.detail || 'no disponible'}`);
        } else if (err?.request) {
          setExchangeError('Sin respuesta del servidor');
        } else {
          setExchangeError('Tipo de cambio no disponible');
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // El propio Dashboard no se muestra como tarjeta dentro del Dashboard.
  const modules = MAIN_NAV.filter((item) => item.id !== 'dashboard');
  const disponibles = modules.filter((m) => m.enabled);
  const pendientes = modules.filter((m) => !m.enabled);

  const fechaLarga = now.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Franja de contexto: fecha, hora y tipo de cambio                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50">
            <CalendarDays className="size-5 text-blue-600" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Fecha</p>
            <p className="truncate text-sm font-semibold text-slate-900 first-letter:uppercase">
              {fechaLarga}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50">
            <Clock className="size-5 text-indigo-600" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Hora</p>
            <p
              className="text-sm font-semibold text-slate-900 tabular-nums"
              // El reloj cambia cada segundo: se anuncia solo cuando el usuario
              // lo consulta, no en cada tick.
              aria-live="off"
            >
              {now.toLocaleTimeString('es-PE')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50">
            <TrendingUp className="size-5 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Tipo de cambio (USD → PEN)
            </p>
            {exchangeRate ? (
              <p className="text-sm font-semibold text-slate-900 tabular-nums">
                Compra {exchangeRate.compra?.toFixed(4)}
                <span className="mx-2 text-slate-300">•</span>
                Venta {exchangeRate.venta?.toFixed(4)}
              </p>
            ) : (
              <p className="text-sm font-medium text-slate-400">
                {exchangeError ?? 'Cargando…'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Modulos                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="modulos-activos">
        <h2
          id="modulos-activos"
          className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase"
        >
          Módulos del sistema
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {disponibles.map((modulo) => {
            const Icon = modulo.icon;
            return (
              <Link
                key={modulo.id}
                to={modulo.path}
                className={cn(
                  'group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 no-underline shadow-sm',
                  'transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:no-underline hover:shadow-md',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                )}
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50">
                  <Icon className="size-5 text-blue-600" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    {modulo.label}
                    <ArrowRight
                      className="size-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600"
                      aria-hidden="true"
                    />
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{modulo.descripcion}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {pendientes.length > 0 && (
        <section aria-labelledby="modulos-pendientes-dash">
          <h2
            id="modulos-pendientes-dash"
            className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase"
          >
            En desarrollo
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pendientes.map((modulo) => {
              const Icon = modulo.icon;
              return (
                <div
                  key={modulo.id}
                  className="flex items-start gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-5"
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-200/60">
                    <Icon className="size-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-slate-600">{modulo.label}</h3>
                    <p className="mt-1 text-sm text-slate-500">{modulo.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
