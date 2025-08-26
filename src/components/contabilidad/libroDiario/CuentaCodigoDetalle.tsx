import React, { useState, useEffect, useRef } from 'react';
import type { CuentaContable } from '../../../types/contabilidad';
import { ContabilidadApiService } from '../../../services/contabilidadApi';

interface CuentaCodigoDetalleProps {
  codigo: string;
  denominacion: string;
  onCodigoChange: (codigo: string) => void;
  onCuentaSelect: (cuenta: CuentaContable) => void;
  placeholder?: string;
  error?: boolean;
  cuentasDisponibles?: CuentaContable[]; // Nueva prop para recibir cuentas
  lineaId?: string; // ID único para cada línea para debug
}

const CuentaCodigoDetalle: React.FC<CuentaCodigoDetalleProps> = ({
  codigo,
  denominacion,
  onCodigoChange,
  onCuentaSelect,
  placeholder = "Código cuenta",
  error = false,
  cuentasDisponibles = [], // Recibir cuentas del padre
  lineaId = "unknown" // ID único para debug
}) => {
  const [cuentas, setCuentas] = useState<CuentaContable[]>(cuentasDisponibles);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cuentasFiltradas, setCuentasFiltradas] = useState<CuentaContable[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Actualizar cuentas cuando cambian las disponibles
  useEffect(() => {
    setCuentas(cuentasDisponibles);
    if (cuentasDisponibles.length > 0) {
      console.log(`✅ [${lineaId}] ${cuentasDisponibles.length} cuentas listas`);
    }
  }, [cuentasDisponibles, lineaId]);

  // Filtrar cuentas cuando cambia el código
  useEffect(() => {
    // Cancelar búsqueda anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log(`🚫 [Línea ${lineaId}] Búsqueda anterior cancelada`);
    }

    if (!codigo) {
      setCuentasFiltradas([]);
      return;
    }

    // Para búsquedas dinámicas, usar la API como lo hace PlanContablePage
    const buscarConAPI = async () => {
      try {
        // Cancelar búsqueda anterior
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Usar getCuentas con búsqueda, igual que PlanContablePage
        const params = {
          activos_solo: true,
          empresa_id: 'empresa_demo',
          tipo_plan: 'estandar' as const,
          busqueda: codigo.trim() // ✅ Búsqueda en backend
        };

        const resultados = await ContabilidadApiService.getCuentas(params);
        
        // Solo actualizar si no fue cancelada
        if (!abortControllerRef.current.signal.aborted) {
          setCuentasFiltradas(resultados.slice(0, 10));
          
          // Solo log si encuentra o no encuentra nada
          if (resultados.length === 0) {
            console.log(`⚠️ [${lineaId}] Sin resultados para "${codigo}"`);
          } else if (resultados.length === 1) {
            console.log(`✅ [${lineaId}] Encontrado: ${resultados[0].codigo} - ${resultados[0].descripcion}`);
          } else {
            console.log(`✅ [${lineaId}] ${resultados.length} resultados para "${codigo}"`);
          }
        }
      } catch (error) {
        if (abortControllerRef.current?.signal.aborted) {
          return; // Silenciar cancelaciones
        }
        
        console.error(`❌ [${lineaId}] Error buscando "${codigo}":`, error);
        
        // Fallback: búsqueda local en cuentas ya cargadas
        const busquedaLocal = cuentas.filter(cuenta => 
          cuenta.codigo.toLowerCase().includes(codigo.toLowerCase()) ||
          cuenta.descripcion.toLowerCase().includes(codigo.toLowerCase())
        ).slice(0, 10);
        
        setCuentasFiltradas(busquedaLocal);
        if (busquedaLocal.length > 0) {
          console.log(`🔄 [${lineaId}] Fallback local: ${busquedaLocal.length} resultados`);
        }
      }
    };

    // Ejecutar búsqueda
    buscarConAPI();

    // Auto-seleccionar si hay coincidencia exacta en cuentas locales
    const coincidenciaExacta = cuentas.find(cuenta => cuenta.codigo === codigo);
    if (coincidenciaExacta && denominacion !== coincidenciaExacta.descripcion) {
      onCuentaSelect(coincidenciaExacta);
    }

    // Cleanup al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [codigo, lineaId, onCuentaSelect, denominacion, cuentas]);

  // Manejar clics fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onCodigoChange(value);
    setShowDropdown(value.length > 0 && cuentasFiltradas.length > 0);
  };

  const handleCuentaClick = (cuenta: CuentaContable) => {
    onCuentaSelect(cuenta);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (codigo && cuentasFiltradas.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
      {/* Campo Código */}
      <div style={{ position: 'relative', width: '140px' }} ref={dropdownRef}>
        <div style={{ 
          fontSize: '12px', 
          color: '#6b7280', 
          marginBottom: '4px',
          fontWeight: '500'
        }}>
          Código
        </div>
        <input
          ref={inputRef}
          type="text"
          value={codigo}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: `2px solid ${error ? '#ef4444' : (codigo ? '#10b981' : '#e5e7eb')}`,
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s',
            background: codigo ? '#f0fdf4' : 'white'
          }}
        />

        {/* Dropdown de sugerencias */}
        {showDropdown && cuentasFiltradas.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {cuentasFiltradas.map((cuenta) => (
              <div
                key={cuenta.codigo}
                onClick={() => handleCuentaClick(cuenta)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '13px',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{ fontWeight: '600', color: '#374151' }}>
                  {cuenta.codigo}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  {cuenta.descripcion}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            fontSize: '12px',
            color: '#ef4444',
            marginTop: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            ⚠️ Código de cuenta no válido
          </div>
        )}
      </div>

      {/* Campo Denominación (solo lectura) */}
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '12px', 
          color: '#6b7280', 
          marginBottom: '4px',
          fontWeight: '500'
        }}>
          Denominación
        </div>
        <div style={{
          width: '100%',
          padding: '8px 12px',
          border: '2px solid #f3f4f6',
          borderRadius: '6px',
          fontSize: '14px',
          minHeight: '20px',
          background: '#f9fafb',
          color: denominacion ? '#374151' : '#9ca3af',
          display: 'flex',
          alignItems: 'center'
        }}>
          {denominacion || 'Nombre de la cuenta aparecerá aquí...'}
        </div>
      </div>
    </div>
  );
};

export default CuentaCodigoDetalle;
