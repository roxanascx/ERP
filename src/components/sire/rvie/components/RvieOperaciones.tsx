/**
 * Operaciones RVIE: descargar y aceptar la propuesta de SUNAT.
 */

import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Info,
  Loader2,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react';
import type {
  RvieDescargarPropuestaRequest,
  RvieAceptarPropuestaRequest,
  RvieResumenResponse,
  RvieTicketResponse,
} from '../../../../types/sire';
import { cn } from '../../../../lib/cn';

interface RvieOperacionesProps {
  periodo: { año: string; mes: string };
  authStatus: any;
  resumen: RvieResumenResponse | null;
  loading: boolean;
  operacionActiva: string | null;
  tickets: RvieTicketResponse[];
  onDescargarPropuesta: (params: RvieDescargarPropuestaRequest) => Promise<void>;
  onAceptarPropuesta: (params: RvieAceptarPropuestaRequest) => Promise<void>;
  onConsultarTicket: (ticketId: string) => Promise<void>;
  onDescargarArchivo: (ticketId: string) => Promise<void>;
}

/** Aviso de estado dentro de una tarjeta de operación. */
const Estado: React.FC<{
  tone: 'success' | 'warning' | 'info' | 'error';
  titulo: string;
  children?: React.ReactNode;
}> = ({ tone, titulo, children }) => {
  const TONES = {
    success: { wrap: 'border-green-200 bg-green-50', text: 'text-green-800', icon: CheckCircle2 },
    warning: { wrap: 'border-amber-200 bg-amber-50', text: 'text-amber-800', icon: TriangleAlert },
    info: { wrap: 'border-blue-200 bg-blue-50', text: 'text-blue-800', icon: Info },
    error: { wrap: 'border-red-200 bg-red-50', text: 'text-red-800', icon: AlertCircle },
  } as const;

  const { wrap, text, icon: Icon } = TONES[tone];

  return (
    <div className={cn('rounded-lg border px-4 py-3', wrap)}>
      <p className={cn('flex items-center gap-2 text-sm font-semibold', text)}>
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {titulo}
      </p>
      {children && <div className={cn('mt-1.5 text-sm', text)}>{children}</div>}
    </div>
  );
};

const checkbox = 'mt-0.5 size-4 shrink-0 cursor-pointer accent-blue-600';

export default function RvieOperaciones({
  periodo,
  authStatus,
  resumen,
  loading,
  operacionActiva,
  tickets,
  onDescargarPropuesta,
  onAceptarPropuesta,
  onConsultarTicket,
  onDescargarArchivo,
}: RvieOperacionesProps) {
  const [mostrarOpcionesAvanzadas, setMostrarOpcionesAvanzadas] = useState(false);
  const [opcionesDescarga, setOpcionesDescarga] = useState({
    forzar_descarga: false,
    incluir_detalle: true,
  });
  const [opcionesAceptacion, setOpcionesAceptacion] = useState({
    acepta_completa: true,
    observaciones: '',
  });

  // Los tickets sincronizados desde SUNAT llevan el prefijo SYNC-.
  const ticketsDescarga = tickets.filter(
    (t) => t.operacion === 'descargar-propuesta' && t.ticket_id.startsWith('SYNC-')
  );

  const periodoSunat = `${periodo.año}${periodo.mes}`;
  const autenticado = Boolean(authStatus?.authenticated);
  const yaAceptada = resumen?.estado_proceso === 'ACEPTADO';

  const handleDescargarPropuesta = () =>
    onDescargarPropuesta({
      periodo: periodoSunat,
      forzar_descarga: opcionesDescarga.forzar_descarga,
      incluir_detalle: opcionesDescarga.incluir_detalle,
    });

  const handleAceptarPropuesta = () =>
    onAceptarPropuesta({
      periodo: periodoSunat,
      acepta_completa: opcionesAceptacion.acepta_completa,
      observaciones: opcionesAceptacion.observaciones || undefined,
    });

  const textoBotonAceptar = () => {
    if (operacionActiva === 'aceptar_propuesta') return 'Procesando…';
    if (!resumen) return 'Descarga la propuesta primero';
    if (yaAceptada) return 'Ya aceptada';
    if (!autenticado) return 'Requiere autenticación';
    return 'Aceptar propuesta';
  };

  return (
    <div className="space-y-5 p-4 sm:p-5">
      {/* ------------------------------------------------------------------ */}
      {/* Descargar propuesta                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Descargar propuesta SUNAT</h4>
          <p className="text-sm text-slate-500">
            Descarga la propuesta de ventas e ingresos generada por SUNAT para el período
            seleccionado.
          </p>
        </div>

        {resumen ? (
          <Estado tone="success" titulo="Propuesta ya descargada">
            <dl className="flex flex-wrap gap-x-6 gap-y-1">
              <div className="flex gap-1.5">
                <dt>Comprobantes:</dt>
                <dd className="font-semibold tabular-nums">{resumen.total_comprobantes}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>Importe:</dt>
                <dd className="font-semibold tabular-nums">
                  S/ {resumen.total_importe.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt>Estado:</dt>
                <dd className="font-semibold">{resumen.estado_proceso}</dd>
              </div>
            </dl>
          </Estado>
        ) : (
          <Estado tone="warning" titulo="No hay propuesta descargada">
            Debes descargar la propuesta desde SUNAT para este período.
          </Estado>
        )}

        {!autenticado && (
          <Estado tone="warning" titulo="Sin autenticación SUNAT">
            Necesitas autenticarte para acceder a datos reales.
          </Estado>
        )}

        {/* Opciones avanzadas */}
        <div>
          <button
            type="button"
            onClick={() => setMostrarOpcionesAvanzadas((v) => !v)}
            aria-expanded={mostrarOpcionesAvanzadas}
            className="inline-flex items-center gap-1.5 rounded border-0 bg-transparent p-0 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ChevronDown
              className={cn(
                'size-4 transition-transform',
                !mostrarOpcionesAvanzadas && '-rotate-90'
              )}
              aria-hidden="true"
            />
            Opciones avanzadas
          </button>

          {mostrarOpcionesAvanzadas && (
            <div className="mt-2 space-y-3 rounded-lg bg-slate-50 p-3">
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={opcionesDescarga.forzar_descarga}
                  onChange={(e) =>
                    setOpcionesDescarga((prev) => ({ ...prev, forzar_descarga: e.target.checked }))
                  }
                  className={checkbox}
                />
                <span>
                  Forzar nueva descarga
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Vuelve a pedirla a SUNAT aunque ya esté en caché.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={opcionesDescarga.incluir_detalle}
                  onChange={(e) =>
                    setOpcionesDescarga((prev) => ({ ...prev, incluir_detalle: e.target.checked }))
                  }
                  className={checkbox}
                />
                <span>
                  Incluir detalle completo
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Añade la información detallada de cada comprobante.
                  </span>
                </span>
              </label>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDescargarPropuesta}
          disabled={loading || operacionActiva === 'descargar_propuesta'}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {operacionActiva === 'descargar_propuesta' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="size-4" aria-hidden="true" />
          )}
          {operacionActiva === 'descargar_propuesta' ? 'Descargando…' : 'Descargar propuesta'}
        </button>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Aceptar propuesta                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Aceptar propuesta</h4>
          <p className="text-sm text-slate-500">
            Acepta la propuesta de SUNAT, entera o en parte.
          </p>
        </div>

        {!resumen ? (
          <Estado tone="error" titulo="No hay propuesta que aceptar">
            Descarga primero la propuesta del período.
          </Estado>
        ) : yaAceptada ? (
          <Estado tone="success" titulo="Propuesta ya aceptada">
            La propuesta de este período ya se aceptó en SUNAT.
          </Estado>
        ) : (
          <Estado tone="info" titulo="Lista para aceptar">
            La propuesta está descargada y lista.
          </Estado>
        )}

        {!autenticado && (
          <Estado tone="warning" titulo="Sin autenticación SUNAT">
            Necesitas autenticarte para realizar esta operación.
          </Estado>
        )}

        <fieldset className="space-y-3 rounded-lg bg-slate-50 p-3">
          <legend className="sr-only">Tipo de aceptación</legend>

          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
            <input
              type="radio"
              name="tipo_aceptacion"
              checked={opcionesAceptacion.acepta_completa}
              onChange={() =>
                setOpcionesAceptacion((prev) => ({ ...prev, acepta_completa: true }))
              }
              className={checkbox}
            />
            <span>
              Aceptación completa
              <span className="mt-0.5 block text-xs text-slate-500">
                Acepta toda la propuesta de SUNAT sin modificaciones.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
            <input
              type="radio"
              name="tipo_aceptacion"
              checked={!opcionesAceptacion.acepta_completa}
              onChange={() =>
                setOpcionesAceptacion((prev) => ({ ...prev, acepta_completa: false }))
              }
              className={checkbox}
            />
            <span>
              Aceptación parcial
              <span className="mt-0.5 block text-xs text-slate-500">
                Acepta solo una parte; requiere justificación.
              </span>
            </span>
          </label>

          <div>
            <label
              htmlFor="observaciones"
              className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase"
            >
              Observaciones (opcional)
            </label>
            <textarea
              id="observaciones"
              rows={3}
              maxLength={500}
              placeholder="Observaciones sobre la aceptación"
              value={opcionesAceptacion.observaciones}
              onChange={(e) =>
                setOpcionesAceptacion((prev) => ({ ...prev, observaciones: e.target.value }))
              }
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-slate-400 tabular-nums">
              {opcionesAceptacion.observaciones.length}/500
            </p>
          </div>
        </fieldset>

        <button
          type="button"
          onClick={handleAceptarPropuesta}
          disabled={
            loading ||
            operacionActiva === 'aceptar_propuesta' ||
            !resumen ||
            yaAceptada ||
            !autenticado
          }
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {operacionActiva === 'aceptar_propuesta' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          )}
          {textoBotonAceptar()}
        </button>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Tickets de descarga sincronizados                                  */}
      {/* ------------------------------------------------------------------ */}
      {ticketsDescarga.length > 0 && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Tickets de descarga</h4>
            <p className="text-sm text-slate-500">
              Tickets de descarga-propuesta sincronizados desde SUNAT.
            </p>
          </div>

          <ul className="space-y-2">
            {ticketsDescarga.map((ticket) => {
              const descargable = ticket.status === 'TERMINADO' && ticket.archivo_nombre;

              return (
                <li
                  key={ticket.ticket_id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-slate-800">
                      {ticket.ticket_id}
                    </p>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {new Date(ticket.fecha_creacion).toLocaleString('es-PE')}
                    </p>
                    {ticket.descripcion && (
                      <p className="text-sm text-slate-600">{ticket.descripcion}</p>
                    )}
                    {ticket.archivo_nombre && (
                      <p className="flex items-center gap-1.5 text-sm text-slate-600">
                        <FileText className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                        <span className="min-w-0 truncate">{ticket.archivo_nombre}</span>
                      </p>
                    )}
                  </div>

                  {descargable ? (
                    <button
                      type="button"
                      onClick={() => onDescargarArchivo(ticket.ticket_id)}
                      disabled={loading}
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Download className="size-4" aria-hidden="true" />
                      Descargar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onConsultarTicket(ticket.ticket_id)}
                      disabled={loading}
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <RefreshCw className="size-4" aria-hidden="true" />
                      Consultar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
