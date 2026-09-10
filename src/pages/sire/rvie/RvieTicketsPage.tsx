/**
 * Gestión de Tickets RVIE
 * URL: /sire/rvie/tickets
 */

import React, { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { useRvie } from '../../../hooks/useRvie';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import { RvieTickets } from '../../../components/sire/rvie/components';
import SunatAuthBanner from '../../../components/common/SunatAuthBanner';

const RvieTicketsPage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();

  const {
    authStatus,
    tickets,
    loading,
    consultarTicket,
    descargarArchivo,
    cargarTickets,
    cargarTodosTickets,
  } = useRvie({ ruc: empresaActual?.ruc || '' });

  const [mostrarTodos, setMostrarTodos] = useState(true);

  // RequireEmpresa garantiza que hay empresa: esta guarda solo estrecha el tipo.
  if (!empresaActual) return null;

  const handleConsultarTicket = async (ticketId: string): Promise<void> => {
    await consultarTicket(ticketId);
  };

  const handleDescargarArchivo = async (ticketId: string): Promise<void> => {
    await descargarArchivo(ticketId);
  };

  const handleToggleTodos = async () => {
    const siguiente = !mostrarTodos;
    setMostrarTodos(siguiente);
    await (siguiente ? cargarTodosTickets() : cargarTickets());
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Tickets disponibles</h2>
            <p className="text-sm text-slate-500 tabular-nums">
              {tickets?.length || 0} en total
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={!mostrarTodos}
                onChange={handleToggleTodos}
                className="size-4 cursor-pointer accent-blue-600"
              />
              Solo tickets con archivos
            </label>

            <button
              type="button"
              onClick={() => (mostrarTodos ? cargarTodosTickets() : cargarTickets())}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="size-4" aria-hidden="true" />
              )}
              {loading ? 'Cargando…' : 'Refrescar'}
            </button>
          </div>
        </div>
      </section>

      {!authStatus?.authenticated && <SunatAuthBanner authenticated={false} />}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <RvieTickets
          tickets={tickets || []}
          loading={loading}
          onConsultarTicket={handleConsultarTicket}
          onDescargarArchivo={handleDescargarArchivo}
        />
      </section>
    </div>
  );
};

export default RvieTicketsPage;
