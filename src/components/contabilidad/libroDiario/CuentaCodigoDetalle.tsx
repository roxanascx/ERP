import React, { useState, useEffect, useRef } from 'react';
import { TriangleAlert } from 'lucide-react';
import type { CuentaContable } from '../../../types/contabilidad';
import { ContabilidadApiService } from '../../../services/contabilidadApi';
import useEmpresaActual from '../../../hooks/useEmpresaActual';
import { fieldControl } from '../../common/FormField';
import { cn } from '../../../lib/cn';

interface CuentaCodigoDetalleProps {
  codigo: string;
  denominacion: string;
  onCodigoChange: (codigo: string) => void;
  onCuentaSelect: (cuenta: CuentaContable) => void;
  placeholder?: string;
  error?: boolean;
  /** Cuentas ya cargadas por el padre, usadas como respaldo local */
  cuentasDisponibles?: CuentaContable[];
  /** Identificador de la linea, solo para diagnostico */
  lineaId?: string;
}

/**
 * Codigo de cuenta con autocompletado + denominacion en solo lectura.
 *
 * Migrado a Tailwind. Ademas, el `empresa_id` de la busqueda estaba cableado a
 * 'empresa_demo': se consultaba siempre un plan contable inexistente en vez del
 * de la empresa activa.
 */
const CuentaCodigoDetalle: React.FC<CuentaCodigoDetalleProps> = ({
  codigo,
  denominacion,
  onCodigoChange,
  onCuentaSelect,
  placeholder = 'Código cuenta',
  error = false,
  cuentasDisponibles = [],
  lineaId = 'unknown',
}) => {
  const { empresa } = useEmpresaActual();
  const [cuentas, setCuentas] = useState<CuentaContable[]>(cuentasDisponibles);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cuentasFiltradas, setCuentasFiltradas] = useState<CuentaContable[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const empresaId = empresa?.ruc ?? '';

  // Sincronizar con las cuentas que aporta el padre
  useEffect(() => {
    setCuentas(cuentasDisponibles);
  }, [cuentasDisponibles]);

  // Buscar cuentas cada vez que cambia el codigo
  useEffect(() => {
    // Cancelar la busqueda anterior si sigue en vuelo
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!codigo) {
      setCuentasFiltradas([]);
      return;
    }

    const buscarConAPI = async () => {
      try {
        abortControllerRef.current = new AbortController();

        const resultados = await ContabilidadApiService.getCuentas({
          activos_solo: true,
          empresa_id: empresaId,
          tipo_plan: 'estandar' as const,
          busqueda: codigo.trim(),
        });

        if (!abortControllerRef.current.signal.aborted) {
          setCuentasFiltradas(resultados.slice(0, 10));
        }
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) return;

        // Si la API falla, se busca en las cuentas que ya tenemos en memoria.
        const busquedaLocal = cuentas
          .filter(
            (cuenta) =>
              cuenta.codigo.toLowerCase().includes(codigo.toLowerCase()) ||
              cuenta.descripcion.toLowerCase().includes(codigo.toLowerCase())
          )
          .slice(0, 10);

        setCuentasFiltradas(busquedaLocal);
      }
    };

    void buscarConAPI();

    // Si el codigo coincide exactamente, se autocompleta la denominacion.
    const coincidenciaExacta = cuentas.find((cuenta) => cuenta.codigo === codigo);
    if (coincidenciaExacta && denominacion !== coincidenciaExacta.descripcion) {
      onCuentaSelect(coincidenciaExacta);
    }

    return () => {
      abortControllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo, cuentas, empresaId]);

  // Cerrar el desplegable al pulsar fuera
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCodigoChange(e.target.value);
    setShowDropdown(true);
  };

  const handleFocus = () => {
    if (cuentasFiltradas.length > 0) setShowDropdown(true);
  };

  const handleCuentaClick = (cuenta: CuentaContable) => {
    onCuentaSelect(cuenta);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const inputId = `cuenta-codigo-${lineaId}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      {/* Código */}
      <div ref={dropdownRef} className="relative sm:w-36 sm:shrink-0">
        <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-slate-500">
          Código
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={codigo}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={error}
          aria-expanded={showDropdown}
          className={cn(fieldControl(error), 'font-mono')}
        />

        {showDropdown && cuentasFiltradas.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-60 w-full min-w-64 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {cuentasFiltradas.map((cuenta) => (
              <li key={cuenta.codigo}>
                <button
                  type="button"
                  onClick={() => handleCuentaClick(cuenta)}
                  className="w-full border-0 bg-transparent px-3 py-2 text-left hover:bg-blue-50"
                >
                  <span className="block font-mono text-sm font-semibold text-slate-800">
                    {cuenta.codigo}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {cuenta.descripcion}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <TriangleAlert className="size-3" aria-hidden="true" />
            Código de cuenta no válido
          </p>
        )}
      </div>

      {/* Denominación (solo lectura) */}
      <div className="min-w-0 flex-1">
        <span className="mb-1 block text-xs font-medium text-slate-500">Denominación</span>
        <p
          className={cn(
            'truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm',
            denominacion ? 'text-slate-800' : 'text-slate-400 italic'
          )}
        >
          {denominacion || 'Se completa al elegir la cuenta'}
        </p>
      </div>
    </div>
  );
};

export default CuentaCodigoDetalle;
