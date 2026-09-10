import React, { useState, useEffect, useRef } from 'react';
import type { CuentaContable } from '../../../types/contabilidad';
import { Check, Loader2, TriangleAlert, X } from 'lucide-react';
import { ContabilidadApiService } from '../../../services/contabilidadApi';
import { fieldControl } from '../../common/FormField';
import { cn } from '../../../lib/cn';

interface CuentaAutocompleteProps {
  value: string;
  denominacion: string;
  onSelect: (cuenta: CuentaContable) => void;
  onInputChange: (codigo: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

const CuentaAutocomplete: React.FC<CuentaAutocompleteProps> = ({
  value,
  denominacion,
  onSelect,
  onInputChange,
  placeholder = "Ej: 101101",
  disabled = false,
  error = false
}) => {
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [cuentasFiltradas, setCuentasFiltradas] = useState<CuentaContable[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar cuentas al montar el componente
  useEffect(() => {
    const cargarCuentas = async () => {
      try {
        setLoading(true);
        const todasLasCuentas = await ContabilidadApiService.getCuentas({
          activos_solo: true // Solo cuentas activas
        });
        
        // Filtrar solo cuentas que aceptan movimiento (cuentas hoja)
        const cuentasHoja = todasLasCuentas.filter(cuenta => 
          cuenta.acepta_movimiento && cuenta.es_hoja
        );
        
        setCuentas(cuentasHoja);
      } catch (error) {
        console.error('Error al cargar cuentas:', error);
        setCuentas([]);
      } finally {
        setLoading(false);
      }
    };

    cargarCuentas();
  }, []);

  // Filtrar cuentas cuando cambia el input (similar al PlanContableTable)
  useEffect(() => {
    if (!value.trim()) {
      setCuentasFiltradas([]);
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    const filtered = cuentas.filter(cuenta => {
      // Búsqueda exacta por código tiene prioridad
      if (cuenta.codigo.toLowerCase() === searchTerm) {
        return true;
      }
      // Luego búsqueda que comience con el término
      if (cuenta.codigo.toLowerCase().startsWith(searchTerm)) {
        return true;
      }
      // Por último, búsqueda que contenga el término en código o descripción
      return (
        cuenta.codigo.toLowerCase().includes(searchTerm) ||
        cuenta.descripcion.toLowerCase().includes(searchTerm)
      );
    }).sort((a, b) => {
      // Ordenar: primero coincidencias exactas, luego que empiecen igual, luego el resto
      const aExacto = a.codigo.toLowerCase() === searchTerm;
      const bExacto = b.codigo.toLowerCase() === searchTerm;
      if (aExacto && !bExacto) return -1;
      if (!aExacto && bExacto) return 1;
      
      const aEmpieza = a.codigo.toLowerCase().startsWith(searchTerm);
      const bEmpieza = b.codigo.toLowerCase().startsWith(searchTerm);
      if (aEmpieza && !bEmpieza) return -1;
      if (!aEmpieza && bEmpieza) return 1;
      
      // Ordenar alfabéticamente
      return a.codigo.localeCompare(b.codigo);
    }).slice(0, 15); // Aumentar a 15 resultados

    setCuentasFiltradas(filtered);
    setSelectedIndex(-1);
  }, [value, cuentas]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    onInputChange(newValue);
    setShowDropdown(newValue.length > 0);
    
    // Si el valor coincide exactamente con una cuenta, seleccionarla automáticamente
    if (newValue.length > 0) {
      const cuentaExacta = cuentas.find(cuenta => 
        cuenta.codigo.toLowerCase() === newValue.toLowerCase()
      );
      
      if (cuentaExacta) {
        onSelect(cuentaExacta);
        setShowDropdown(false); // Cerrar dropdown al encontrar coincidencia exacta
      }
    }
  };

  const handleSelectCuenta = (cuenta: CuentaContable) => {
    onSelect(cuenta);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || cuentasFiltradas.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < cuentasFiltradas.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : cuentasFiltradas.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < cuentasFiltradas.length) {
          handleSelectCuenta(cuentasFiltradas[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (value.trim() && cuentasFiltradas.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    // Delay para permitir clicks en el dropdown
    setTimeout(() => {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }, 200); // Aumentar delay para mejor UX
  };

  // Verificar si la cuenta actual es válida
  const cuentaValida = cuentas.find(cuenta => cuenta.codigo === value);
  const mostrarError = error || (value.trim() && !cuentaValida);

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        {/* Codigo */}
        <div className="relative sm:w-32 sm:shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            aria-invalid={Boolean(mostrarError)}
            aria-expanded={showDropdown}
            className={cn(fieldControl(Boolean(mostrarError)), 'pr-9 font-mono')}
          />

          {/* Estado de la validacion */}
          {value.trim() && (
            <span className="absolute top-1/2 right-3 -translate-y-1/2" aria-hidden="true">
              {loading ? (
                <Loader2 className="size-4 animate-spin text-slate-400" />
              ) : cuentaValida ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <X className="size-4 text-red-500" />
              )}
            </span>
          )}
        </div>

        {/* Denominacion (solo lectura) */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'flex items-center gap-2 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm',
              denominacion ? 'text-slate-800' : 'text-slate-400 italic'
            )}
          >
            <span className="min-w-0 truncate">
              {denominacion || 'El nombre de la cuenta aparecerá aquí'}
            </span>
            {denominacion && (
              <span className="ml-auto shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                AUTO
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Sugerencias */}
      {showDropdown && cuentasFiltradas.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-20 mt-1 w-full min-w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          <p className="border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 tabular-nums">
            {cuentasFiltradas.length} cuenta{cuentasFiltradas.length !== 1 ? 's' : ''} encontrada
            {cuentasFiltradas.length !== 1 ? 's' : ''}
          </p>

          <ul className="max-h-60 overflow-y-auto">
            {cuentasFiltradas.map((cuenta, index) => (
              <li key={cuenta.codigo}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectCuenta(cuenta)}
                  className={cn(
                    'flex w-full items-center gap-3 border-0 px-3 py-2 text-left',
                    index === selectedIndex ? 'bg-blue-50' : 'bg-transparent hover:bg-slate-50'
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-sm font-semibold text-slate-800">
                      {cuenta.codigo}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {cuenta.descripcion}
                    </span>
                  </span>
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                    Nivel {cuenta.codigo.length}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {loading && (
            <p className="flex items-center gap-2 border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Buscando cuentas…
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {mostrarError && value.trim() && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <TriangleAlert className="size-3" aria-hidden="true" />
          {loading ? 'Verificando cuenta…' : 'Código de cuenta no válido'}
        </p>
      )}
    </div>
  );
};

export default CuentaAutocomplete;
