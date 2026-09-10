/**
 * Gestión de Ventas e Ingresos RVIE
 * URL: /sire/rvie/ventas
 */

import React, { useState } from 'react';
import { useRvie } from '../../../hooks/useRvie';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import { RvieVentas } from '../../../components/sire/rvie/components';
import PeriodoSelector, { periodoActual, type Periodo } from '../../../components/common/PeriodoSelector';

const RvieVentasPage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();
  const [periodo, setPeriodo] = useState<Periodo>(periodoActual);

  const { authStatus, loading } = useRvie({ ruc: empresaActual?.ruc || '' });

  // RequireEmpresa garantiza que hay empresa: esta guarda solo estrecha el tipo.
  if (!empresaActual) return null;

  return (
    <div className="space-y-6">
      <PeriodoSelector value={periodo} onChange={setPeriodo} />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <RvieVentas
          ruc={empresaActual.ruc}
          periodo={periodo}
          authStatus={authStatus}
          loading={loading}
        />
      </section>
    </div>
  );
};

export default RvieVentasPage;
