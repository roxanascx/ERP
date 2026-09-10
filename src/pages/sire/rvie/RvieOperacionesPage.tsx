/**
 * Operaciones RVIE
 * URL: /sire/rvie/operaciones
 */

import React, { useState } from 'react';
import { useRvie } from '../../../hooks/useRvie';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import { RvieOperaciones } from '../../../components/sire/rvie/components';
import PeriodoSelector, { periodoActual, type Periodo } from '../../../components/common/PeriodoSelector';
import SunatAuthBanner from '../../../components/common/SunatAuthBanner';

const RvieOperacionesPage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();
  const [periodo, setPeriodo] = useState<Periodo>(periodoActual);

  const { authStatus, tickets, resumen, loading } = useRvie({ ruc: empresaActual?.ruc || '' });

  // RequireEmpresa garantiza que hay empresa: esta guarda solo estrecha el tipo.
  if (!empresaActual) return null;

  const handleConsultarTicket = async (_ticketId: string): Promise<void> => {
    // TODO: Implementar lógica de consulta
  };

  const handleDescargarArchivo = async (_ticketId: string): Promise<void> => {
    // TODO: Implementar lógica de descarga
  };

  return (
    <div className="space-y-6">
      <PeriodoSelector value={periodo} onChange={setPeriodo} />

      <SunatAuthBanner authenticated={authStatus?.authenticated} loading={loading} />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <RvieOperaciones
          periodo={periodo}
          authStatus={authStatus}
          resumen={resumen}
          loading={loading}
          operacionActiva={null}
          tickets={tickets || []}
          onDescargarPropuesta={async (_params) => {
            // TODO: Implementar descarga de propuesta
          }}
          onAceptarPropuesta={async (_params) => {
            // TODO: Implementar aceptar propuesta
          }}
          onConsultarTicket={handleConsultarTicket}
          onDescargarArchivo={handleDescargarArchivo}
        />
      </section>
    </div>
  );
};

export default RvieOperacionesPage;
