import React from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface Periodo {
  año: string;
  mes: string;
}

interface PeriodoSelectorProps {
  value: Periodo;
  onChange: (periodo: Periodo) => void;
  disabled?: boolean;
  /** Contenido extra alineado a la derecha (botones de acción) */
  children?: React.ReactNode;
}

export const MESES = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

/** Los 5 ultimos ejercicios, el actual primero. */
export const AÑOS_DISPONIBLES = Array.from({ length: 5 }, (_, i) => {
  const año = new Date().getFullYear() - i;
  return { value: año.toString(), label: año.toString() };
});

/** Periodo por defecto: el mes en curso, en el formato que espera SUNAT. */
export const periodoActual = (): Periodo => ({
  año: new Date().getFullYear().toString(),
  mes: String(new Date().getMonth() + 1).padStart(2, '0'),
});

/** "202609", que es como SUNAT identifica el periodo. */
export const periodoToString = (p: Periodo): string => `${p.año}${p.mes}`;

const selectClass = cn(
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900',
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'
);

/**
 * Selector de ejercicio y mes.
 *
 * Estaba copiado a mano en cada pantalla de SIRE, con su propia lista de meses
 * y su propio array de años.
 */
const PeriodoSelector: React.FC<PeriodoSelectorProps> = ({
  value,
  onChange,
  disabled,
  children,
}) => {
  const mesLabel = MESES.find((m) => m.value === value.mes)?.label ?? value.mes;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="periodo-anio"
            className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase"
          >
            Año
          </label>
          <select
            id="periodo-anio"
            value={value.año}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, año: e.target.value })}
            className={selectClass}
          >
            {AÑOS_DISPONIBLES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="periodo-mes"
            className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase"
          >
            Mes
          </label>
          <select
            id="periodo-mes"
            value={value.mes}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, mes: e.target.value })}
            className={selectClass}
          >
            {MESES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
          <CalendarDays className="size-4" aria-hidden="true" />
          {mesLabel} {value.año}
        </div>

        {children && <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </section>
  );
};

export default PeriodoSelector;
