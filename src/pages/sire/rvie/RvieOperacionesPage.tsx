/**
 * Operaciones RVIE (ventas)
 * URL: /sire/rvie/operaciones
 *
 * Antes esta pagina montaba un componente cuyos manejadores eran todos
 * `TODO: Implementar`: los botones existian y no hacian nada. Ahora usa el
 * ciclo real del periodo, el mismo panel que compras, contra los servicios
 * 5.8 / 5.9 / 5.15 del manual de Ventas.
 */

import React, { useState } from 'react';
import { useRvie } from '../../../hooks/useRvie';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import RceCicloPanel from '../../../components/sire/rce/RceCicloPanel';
import { rvieCicloApi } from '../../../services/rceCicloApi';
import PeriodoSelector, {
  periodoActual,
  periodoToString,
  type Periodo,
} from '../../../components/common/PeriodoSelector';
import SunatAuthBanner from '../../../components/common/SunatAuthBanner';

/** Numeros de servicio del manual de Ventas v30. */
const SERVICIOS_RVIE = { aceptar: '5.8', registrar: '5.9', eliminar: '5.15' };

const RvieOperacionesPage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();
  const [periodo, setPeriodo] = useState<Periodo>(periodoActual);

  const { authStatus, loading } = useRvie({ ruc: empresaActual?.ruc || '' });

  // RequireEmpresa garantiza que hay empresa: esta guarda solo estrecha el tipo.
  if (!empresaActual) return null;

  return (
    <div className="space-y-6">
      <PeriodoSelector value={periodo} onChange={setPeriodo} />

      <SunatAuthBanner authenticated={authStatus?.authenticated} loading={loading} />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">Ciclo del periodo</h2>
          <p className="text-sm text-slate-500">
            Acepta la propuesta de ventas y registra el preliminar. Las dos
            operaciones escriben en SUNAT.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <RceCicloPanel
            ruc={empresaActual.ruc}
            periodo={periodoToString(periodo)}
            api={rvieCicloApi}
            servicios={SERVICIOS_RVIE}
          />
        </div>
      </section>
    </div>
  );
};

export default RvieOperacionesPage;
