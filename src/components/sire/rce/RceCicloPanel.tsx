/**
 * Ciclo de un periodo SIRE: propuesta -> preliminar -> registrado.
 *
 * Sirve para compras y para ventas: los dos libros exponen el mismo contrato y
 * las mismas fases, asi que solo cambian el cliente y los numeros de servicio
 * que se citan al confirmar. Las dos acciones que escriben en SUNAT piden
 * confirmacion, y la de registrar avisa de que solo se deshace con el servicio
 * de eliminar preliminar.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Send,
  Undo2,
} from 'lucide-react';
import {
  rceCicloApi,
  type EstadoCiclo,
  type EstadoPeriodo,
  type ResumenPropuesta,
} from '../../../services/rceCicloApi';
import { cn } from '../../../lib/cn';

/** Numeros de servicio del manual, distintos en cada libro. */
export interface ServiciosCiclo {
  aceptar: string;
  registrar: string;
  eliminar: string;
}

const SERVICIOS_RCE: ServiciosCiclo = { aceptar: '5.2', registrar: '5.4', eliminar: '5.17' };

interface Props {
  ruc: string;
  periodo: string;
  /** Cliente del libro. Por defecto, compras. */
  api?: typeof rceCicloApi;
  servicios?: ServiciosCiclo;
}

const FASES: { id: EstadoPeriodo; titulo: string; detalle: string }[] = [
  { id: 'PROPUESTA', titulo: 'Propuesta', detalle: 'SUNAT publico la propuesta del periodo' },
  { id: 'PRELIMINAR', titulo: 'Preliminar', detalle: 'La propuesta fue aceptada' },
  { id: 'REGISTRADO', titulo: 'Registrado', detalle: 'El preliminar quedo registrado' },
];

const ORDEN: EstadoPeriodo[] = ['PROPUESTA', 'PRELIMINAR', 'REGISTRADO'];

export const RceCicloPanel: React.FC<Props> = ({
  ruc,
  periodo,
  api = rceCicloApi,
  servicios = SERVICIOS_RCE,
}) => {
  const [estado, setEstado] = useState<EstadoCiclo | null>(null);
  const [cargando, setCargando] = useState(false);
  const [operando, setOperando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resumen, setResumen] = useState<ResumenPropuesta | null>(null);
  const [errorResumen, setErrorResumen] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!ruc || !periodo) return;
    setCargando(true);
    setError(null);
    try {
      setEstado(await api.estado(ruc, periodo, true));
      // El resumen va aparte: si SUNAT no lo da, el ciclo sigue siendo usable.
      setErrorResumen(null);
      try {
        setResumen(await api.resumen(ruc, periodo));
      } catch (e: any) {
        setResumen(null);
        setErrorResumen(e.message);
      }
    } catch (e: any) {
      setError(e.message);
      setEstado(null);
    } finally {
      setCargando(false);
    }
  }, [ruc, periodo, api]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  /** Ejecuta una operacion que escribe en SUNAT y refresca el estado. */
  const operar = async (
    id: string,
    confirmacion: string,
    accion: () => Promise<EstadoCiclo>
  ) => {
    if (!window.confirm(confirmacion)) return;

    setOperando(id);
    setError(null);
    setAviso(null);
    try {
      const nuevo = await accion();
      setEstado(nuevo);
      setAviso(nuevo.mensaje);
      // Releer para traer tambien lo que SUNAT reporta tras la operacion.
      cargar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setOperando(null);
    }
  };

  const indiceActual = estado ? ORDEN.indexOf(estado.estado) : -1;
  const discrepancia = estado?.coincide_con_sunat === false;

  // SUNAT manda sobre el estado local: si el periodo ya no esta abierto, las
  // operaciones de escritura no se ofrecen. El backend tambien las rechaza,
  // pero ensenar un boton que va a fallar solo hace perder el tiempo.
  const cerradoEnSunat = estado?.estado_sunat
    ? estado.estado_sunat.desEstado !== 'No Presentado'
    : false;

  // Si SUNAT todavia no publico propuesta, no hay nada que aceptar.
  const sinPropuesta = resumen?.sin_datos === true;
  const puedeAceptar = !cerradoEnSunat && !sinPropuesta;

  const moneda = (v: number | null | undefined) =>
    v == null ? 's/d' : `S/ ${v.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-5">
      {/* --- Linea de fases --- */}
      <ol className="grid gap-3 sm:grid-cols-3">
        {FASES.map((fase, i) => {
          const alcanzada = indiceActual >= i;
          const esActual = indiceActual === i;
          return (
            <li
              key={fase.id}
              className={cn(
                'rounded-lg border p-4 transition-colors',
                esActual
                  ? 'border-violet-400 bg-violet-50'
                  : alcanzada
                    ? 'border-emerald-300 bg-emerald-50/60'
                    : 'border-slate-200 bg-white'
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    alcanzada ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {alcanzada && !esActual ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    esActual ? 'text-violet-800' : alcanzada ? 'text-emerald-800' : 'text-slate-500'
                  )}
                >
                  {fase.titulo}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{fase.detalle}</p>
            </li>
          );
        })}
      </ol>

      {/* --- Estado y discrepancia --- */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {cargando && !estado ? (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" /> Consultando el estado del periodo…
          </p>
        ) : estado ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Periodo {estado.periodo}</p>
                <p className="text-lg font-semibold text-slate-900">{estado.estado}</p>
              </div>
              <button
                type="button"
                onClick={cargar}
                disabled={cargando}
                className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw className={cn('size-3.5', cargando && 'animate-spin')} />
                Actualizar
              </button>
            </div>

            {estado.num_ticket && (
              <p className="text-xs text-slate-500">
                Ultimo ticket de SUNAT: <span className="font-mono">{estado.num_ticket}</span>
              </p>
            )}

            {discrepancia && (
              <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3">
                <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold">SUNAT y este registro no coinciden</p>
                  <p className="mt-0.5">
                    Aqui consta <strong>{estado.estado}</strong>, pero SUNAT reporta el periodo
                    como <strong>{estado.estado_sunat?.desEstado}</strong>. Suele significar que
                    se opero desde el portal SOL.
                  </p>
                  {cerradoEnSunat && (
                    <p className="mt-1.5">
                      Por eso no se ofrece aceptar la propuesta: SUNAT ya no admite esa
                      operacion en este periodo. Revisa el estado en el portal SOL.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {error && (
          <p className="mt-3 flex gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </p>
        )}

        {aviso && !error && (
          <p className="mt-3 flex gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 className="size-4 shrink-0" />
            {aviso}
          </p>
        )}
      </div>

      {/* --- Que contiene la propuesta --- */}
      {estado?.estado === 'PROPUESTA' && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Contenido de la propuesta
          </h3>

          {resumen?.sin_datos ? (
            <p className="mt-2 text-sm text-slate-600">
              SUNAT todavia no publica propuesta para este periodo: no hay nada que
              aceptar.
            </p>
          ) : resumen ? (
            <>
              <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Comprobantes
                  </p>
                  <p className="text-xl font-semibold tabular-nums text-slate-900">
                    {resumen.total_comprobantes ?? 's/d'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                  <p className="text-xl font-semibold tabular-nums text-slate-900">
                    {moneda(resumen.total_importe)}
                  </p>
                </div>
              </div>

              {resumen.por_tipo.length > 0 && (
                <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
                  {resumen.por_tipo.map((t) => (
                    <li
                      key={t.tipo}
                      className="flex items-center justify-between gap-4 py-1.5 text-sm"
                    >
                      <span className="text-slate-600">{t.tipo}</span>
                      <span className="tabular-nums text-slate-500">
                        {t.documentos} · {moneda(t.importe)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : errorResumen ? (
            <p className="mt-2 text-sm text-slate-500">
              No se pudo leer el resumen del periodo: {errorResumen}
            </p>
          ) : (
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" /> Consultando que trae el periodo…
            </p>
          )}
        </div>
      )}

      {/* --- Acciones --- */}
      {estado && (
        <div className="flex flex-wrap gap-3">
          {estado.estado === 'PROPUESTA' && puedeAceptar && (
            <button
              type="button"
              disabled={operando !== null}
              onClick={() =>
                operar(
                  'aceptar',
                  `Aceptar la propuesta de SUNAT del periodo ${periodo}.\n\n` +
                    `El libro pasara a preliminar. Se puede deshacer con el servicio ${servicios.eliminar}.`,
                  () => api.aceptarPropuesta(ruc, periodo)
                )
              }
              className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {operando === 'aceptar' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Aceptar propuesta
            </button>
          )}

          {estado.estado === 'PRELIMINAR' && (
            <button
              type="button"
              disabled={operando !== null}
              onClick={() =>
                operar(
                  'registrar',
                  `Registrar el preliminar del periodo ${periodo}.\n\n` +
                    'Es el paso final del ciclo por API. La unica marcha atras es ' +
                    'eliminar el preliminar (5.17).\n\n¿Continuar?',
                  () => api.registrarPreliminar(ruc, periodo)
                )
              }
              className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {operando === 'registrar' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Registrar preliminar
            </button>
          )}

          {estado.estado !== 'PROPUESTA' && (
            <button
              type="button"
              disabled={operando !== null}
              onClick={() =>
                operar(
                  'eliminar',
                  `Eliminar el preliminar del periodo ${periodo}.\n\n` +
                    'El periodo volvera a propuesta y se perdera lo registrado.\n\n¿Continuar?',
                  () => api.eliminarPreliminar(ruc, periodo)
                )
              }
              className="flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {operando === 'eliminar' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Undo2 className="size-4" />
              )}
              Eliminar preliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RceCicloPanel;
