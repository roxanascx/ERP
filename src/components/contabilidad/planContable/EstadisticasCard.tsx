import React from 'react';
import { CheckCircle2, FileText, Layers, XCircle } from 'lucide-react';
import { StatCard, StatGrid } from '../../common/StatCard';
import type { EstadisticasPlanContable } from '../../../types/contabilidad';

interface EstadisticasCardProps {
  estadisticas: EstadisticasPlanContable;
}

/**
 * Indicadores del plan contable.
 * Antes: 175 lineas con cuatro tarjetas de degradado escritas a mano.
 */
const EstadisticasCard: React.FC<EstadisticasCardProps> = ({ estadisticas }) => {
  const { total_cuentas, cuentas_activas, cuentas_inactivas, por_clase } = estadisticas;

  const porcentajeActivas =
    total_cuentas > 0 ? Math.round((cuentas_activas / total_cuentas) * 100) : 0;

  return (
    <StatGrid>
      <StatCard
        label="Total cuentas"
        value={total_cuentas.toLocaleString('es-PE')}
        icon={FileText}
        tone="blue"
      />
      <StatCard
        label="Activas"
        value={cuentas_activas.toLocaleString('es-PE')}
        icon={CheckCircle2}
        tone="green"
        hint={`${porcentajeActivas}% del total`}
      />
      <StatCard
        label="Inactivas"
        value={cuentas_inactivas.toLocaleString('es-PE')}
        icon={XCircle}
        tone="slate"
        hint={`${100 - porcentajeActivas}% del total`}
      />
      <StatCard
        label="Clases"
        value={por_clase.length}
        icon={Layers}
        tone="violet"
        hint="Niveles jerárquicos"
      />
    </StatGrid>
  );
};

export default EstadisticasCard;
