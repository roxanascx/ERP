import React from 'react';
import { CheckCircle2, FileText, Gauge, List, TrendingDown, TrendingUp } from 'lucide-react';
import type { AsientoContable } from '../../../types/libroDiario';
import ExportacionService from '../../../services/exportacionService';
import { StatCard, StatGrid } from '../../common/StatCard';
import { cn } from '../../../lib/cn';

interface EstadisticasAsientosProps {
  asientos: AsientoContable[];
  periodo?: string;
  className?: string;
}

const soles = (n: number): string =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Indicadores de los asientos de un libro.
 * Antes: 253 lineas con seis tarjetas de colores escritas a mano.
 */
const EstadisticasAsientos: React.FC<EstadisticasAsientosProps> = ({
  asientos,
  periodo,
  className = '',
}) => {
  const resumen = ExportacionService.calcularResumenAsientos(asientos);

  const porcentaje =
    asientos.length > 0 ? (resumen.asientosBalanceados / asientos.length) * 100 : 0;

  // Semaforo de calidad: 100 % es lo esperado; por debajo de 80 % hay un problema.
  const calidadTone = porcentaje >= 100 ? 'green' : porcentaje >= 80 ? 'amber' : 'red';

  const estados = Object.entries(resumen.estadisticasPorEstado);

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">Estadísticas del libro diario</h3>
        {periodo && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 tabular-nums">
            {periodo}
          </span>
        )}
      </div>

      <StatGrid className="xl:grid-cols-3">
        <StatCard label="Asientos" value={resumen.totalAsientos} icon={FileText} tone="blue" />
        <StatCard label="Líneas" value={resumen.totalLineas} icon={List} tone="slate" />
        <StatCard
          label="Total debe"
          value={soles(resumen.totalDebe)}
          icon={TrendingUp}
          tone="blue"
        />
        <StatCard
          label="Total haber"
          value={soles(resumen.totalHaber)}
          icon={TrendingDown}
          tone="violet"
        />
        <StatCard
          label="Balanceados"
          value={resumen.asientosBalanceados}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Calidad"
          value={`${porcentaje.toFixed(1)}%`}
          icon={Gauge}
          tone={calidadTone}
          hint="Asientos que cuadran"
        />
      </StatGrid>

      {estados.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {estados.map(([estado, cantidad]) => (
            <span
              key={estado}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 capitalize"
            >
              {estado}
              <span className="rounded-full bg-white px-1.5 font-bold tabular-nums">
                {cantidad as number}
              </span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
};

export default EstadisticasAsientos;
