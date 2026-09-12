/**
 * Tickets RCE: consultar y descargar archivos procesados.
 * URL: /sire/rce/tickets
 */

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, FileText, Loader2, RefreshCw, Ticket as TicketIcon } from 'lucide-react';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import api from '../../../services/api';
import PeriodoSelector, {
  periodoActual,
  periodoToString,
  type Periodo,
} from '../../../components/common/PeriodoSelector';
import EmptyState from '../../../components/common/EmptyState';
import { cn } from '../../../lib/cn';

interface ArchivoReporte {
  nomArchivoReporte?: string;
}

interface Ticket {
  numTicket: string;
  perTributario: string;
  desEstadoProceso: string;
  desProceso: string;
  fecInicProceso: string;
  fecFinProceso?: string;
  archivoReporte?: ArchivoReporte[];
}

const RceTicketsPage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Antes el desplegable ofrecia solo cuatro meses fijos de 2025
  // (abril a julio), asi que era imposible consultar el periodo en curso.
  const [periodo, setPeriodo] = useState<Periodo>(periodoActual);

  const ruc = empresaActual?.ruc;

  const consultarTickets = useCallback(async () => {
    if (!ruc) return;

    const periodoSunat = periodoToString(periodo);
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/sire/rce/propuestas/sunat/tickets', {
        params: {
          ruc,
          periodo_ini: periodoSunat,
          periodo_fin: periodoSunat,
          page: 1,
          per_page: 50,
        },
      });

      if (response.data.exitoso && response.data.datos?.registros) {
        setTickets(response.data.datos.registros);
      } else {
        setError('No se encontraron tickets para el período seleccionado');
        setTickets([]);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || 'Error consultando tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [ruc, periodo]);

  useEffect(() => {
    void consultarTickets();
  }, [consultarTickets]);

  // RequireEmpresa garantiza que hay empresa: esta guarda solo estrecha el tipo.
  if (!empresaActual) return null;

  return (
    <div className="space-y-6">
      <PeriodoSelector value={periodo} onChange={setPeriodo} disabled={loading}>
        <span className="text-sm text-slate-500 tabular-nums">
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
        </span>
        <button
          type="button"
          onClick={consultarTickets}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="size-4" aria-hidden="true" />
          )}
          {loading ? 'Consultando…' : 'Consultar'}
        </button>
      </PeriodoSelector>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {loading && tickets.length === 0 && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {!loading && tickets.length === 0 && !error && (
        <EmptyState
          icon={TicketIcon}
          title="No hay tickets en este período"
          description={`No se encontraron tickets para ${periodoToString(periodo)}. Prueba con otro período.`}
        />
      )}

      {tickets.length > 0 && (
        <ul className="grid gap-3">
          {tickets.map((ticket, index) => {
            const terminado = ticket.desEstadoProceso === 'Terminado';
            return (
              <li
                key={ticket.numTicket || index}
                className={cn(
                  'rounded-xl border bg-white p-5 shadow-sm',
                  terminado ? 'border-green-200' : 'border-amber-200'
                )}
              >
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {ticket.numTicket}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      terminado ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {ticket.desEstadoProceso}
                  </span>
                  <span className="text-sm text-slate-500 tabular-nums">
                    Período {ticket.perTributario}
                  </span>
                </div>

                <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 xl:grid-cols-3">
                  <div className="flex gap-2">
                    <dt className="text-slate-500">Proceso:</dt>
                    <dd className="min-w-0 font-medium text-slate-800">{ticket.desProceso}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-slate-500">Inicio:</dt>
                    <dd className="font-medium text-slate-800 tabular-nums">
                      {ticket.fecInicProceso}
                    </dd>
                  </div>
                  {ticket.fecFinProceso && (
                    <div className="flex gap-2">
                      <dt className="text-slate-500">Fin:</dt>
                      <dd className="font-medium text-slate-800 tabular-nums">
                        {ticket.fecFinProceso}
                      </dd>
                    </div>
                  )}
                </dl>

                {ticket.archivoReporte && ticket.archivoReporte.length > 0 && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <p className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase">
                      Archivos
                    </p>
                    <ul className="space-y-1">
                      {ticket.archivoReporte.map((archivo, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <FileText className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                          {archivo.nomArchivoReporte || 'Archivo disponible'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RceTicketsPage;
