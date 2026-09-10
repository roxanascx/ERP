/**
 * Historial de operaciones RVIE (tickets de SUNAT).
 *
 * Hay dos clases de ticket: los que generan un archivo descargable
 * (propuestas, exportaciones) y los de consulta, que no lo generan.
 */

import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HelpCircle,
  Loader2,
  RefreshCw,
  Search,
  Ticket as TicketIcon,
} from 'lucide-react';
import type { RvieTicketResponse } from '../../../../types/sire';
import EmptyState from '../../../common/EmptyState';
import { cn } from '../../../../lib/cn';

interface RvieTicketsProps {
  tickets: RvieTicketResponse[];
  loading: boolean;
  onConsultarTicket: (ticketId: string) => Promise<void>;
  onDescargarArchivo: (ticketId: string) => Promise<void>;
}

const ESTADOS: Record<string, { icon: typeof Clock; tone: string; chip: string }> = {
  PENDIENTE: { icon: Clock, tone: 'text-amber-600', chip: 'bg-amber-100 text-amber-800' },
  PROCESANDO: { icon: Loader2, tone: 'text-blue-600', chip: 'bg-blue-100 text-blue-800' },
  TERMINADO: { icon: CheckCircle2, tone: 'text-green-600', chip: 'bg-green-100 text-green-800' },
  ERROR: { icon: AlertCircle, tone: 'text-red-600', chip: 'bg-red-100 text-red-800' },
};

const OPERACIONES: Record<string, string> = {
  'descargar-propuesta': 'Descargar propuesta SUNAT',
  'aceptar-propuesta': 'Aceptar propuesta',
  'reemplazar-propuesta': 'Reemplazar propuesta',
  'registrar-preliminar': 'Registrar preliminar',
  'consultar-inconsistencias': 'Consultar inconsistencias',
};

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

/** El periodo viene como AAAAMM. */
const formatPeriodo = (periodo: string) => {
  if (periodo?.length === 6) {
    const mes = parseInt(periodo.substring(4, 6), 10);
    return `${MESES[mes - 1]} ${periodo.substring(0, 4)}`;
  }
  return periodo || 'Sin período';
};

export default function RvieTickets({
  tickets,
  loading,
  onConsultarTicket,
  onDescargarArchivo,
}: RvieTicketsProps) {
  const [ticketIdManual, setTicketIdManual] = useState('');
  const [consultandoManual, setConsultandoManual] = useState(false);

  const handleConsultarTicketManual = async () => {
    if (!ticketIdManual.trim()) return;

    setConsultandoManual(true);
    try {
      await onConsultarTicket(ticketIdManual.trim());
      setTicketIdManual('');
    } catch {
      window.alert('Error al consultar el ticket. Verifica el ID e inténtalo de nuevo.');
    } finally {
      setConsultandoManual(false);
    }
  };

  /** Buscador de tickets creados fuera de la aplicación. */
  const consultaManual = (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Search className="size-4 text-slate-400" aria-hidden="true" />
        Consultar ticket externo
      </h4>
      <p className="mb-3 text-sm text-slate-500">
        Busca tickets generados desde scripts externos; se sincronizarán con la base de datos.
      </p>

      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={ticketIdManual}
          onChange={(e) => setTicketIdManual(e.target.value)}
          placeholder="Ej: 20240300000018"
          disabled={consultandoManual}
          aria-label="ID del ticket"
          className={cn(
            'min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm',
            'placeholder:font-sans placeholder:text-slate-400',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
          )}
        />
        <button
          type="button"
          onClick={handleConsultarTicketManual}
          disabled={consultandoManual || !ticketIdManual.trim()}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {consultandoManual ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="size-4" aria-hidden="true" />
          )}
          Consultar
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-900">Historial de operaciones</h3>
        <p className="flex items-center gap-2 text-sm text-slate-500" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Cargando operaciones…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-900">
        Historial de operaciones{' '}
        {tickets.length > 0 && (
          <span className="font-normal text-slate-500 tabular-nums">({tickets.length})</span>
        )}
      </h3>

      {consultaManual}

      {tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No hay operaciones registradas"
          description="Descarga una propuesta desde Operaciones para generar tu primer ticket; aparecerá aquí con su estado."
        />
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {tickets.map((ticket) => {
            const estado = ESTADOS[ticket.status] ?? {
              icon: HelpCircle,
              tone: 'text-slate-500',
              chip: 'bg-slate-100 text-slate-700',
            };
            const EstadoIcon = estado.icon;
            const descargable = ticket.status === 'TERMINADO' && ticket.archivo_nombre;

            return (
              <li
                key={ticket.ticket_id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <EstadoIcon
                        className={cn(
                          'size-4 shrink-0',
                          estado.tone,
                          ticket.status === 'PROCESANDO' && 'animate-spin'
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">
                        {OPERACIONES[ticket.operacion] ?? ticket.operacion}
                      </span>
                    </h4>
                    <p className="font-mono text-xs text-slate-500">
                      {ticket.ticket_id.slice(0, 12)}…
                    </p>
                  </div>

                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                      estado.chip
                    )}
                  >
                    {ticket.status}
                  </span>
                </div>

                <dl className="mb-3 space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-slate-500">Período:</dt>
                    <dd className="font-medium text-slate-800">
                      {formatPeriodo(ticket.periodo)}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-slate-500">RUC:</dt>
                    <dd className="font-mono text-slate-800">{ticket.ruc}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-slate-500">Creado:</dt>
                    <dd className="text-slate-800 tabular-nums">
                      {formatFecha(ticket.fecha_creacion)}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-slate-500">Actualizado:</dt>
                    <dd className="text-slate-800 tabular-nums">
                      {formatFecha(ticket.fecha_actualizacion)}
                    </dd>
                  </div>
                </dl>

                {ticket.progreso_porcentaje !== undefined && (
                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>Progreso</span>
                      <span className="tabular-nums">{ticket.progreso_porcentaje}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-[width]"
                        style={{ width: `${ticket.progreso_porcentaje}%` }}
                      />
                    </div>
                  </div>
                )}

                {ticket.descripcion && (
                  <p className="mb-2 text-sm text-slate-600">{ticket.descripcion}</p>
                )}

                {ticket.error_mensaje && (
                  <p className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                    {ticket.error_mensaje}
                  </p>
                )}

                {ticket.archivo_nombre && (
                  <p className="mb-3 flex items-center gap-2 text-sm text-slate-600">
                    <FileText className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="min-w-0 truncate">{ticket.archivo_nombre}</span>
                    {ticket.archivo_size && (
                      <span className="shrink-0 text-xs text-slate-400 tabular-nums">
                        {(ticket.archivo_size / 1024).toFixed(2)} KB
                      </span>
                    )}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {!descargable && (
                    <button
                      type="button"
                      onClick={() => onConsultarTicket(ticket.ticket_id)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <RefreshCw className="size-4" aria-hidden="true" />
                      Consultar
                    </button>
                  )}

                  {descargable && (
                    <button
                      type="button"
                      onClick={() => onDescargarArchivo(ticket.ticket_id)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Download className="size-4" aria-hidden="true" />
                      Descargar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
