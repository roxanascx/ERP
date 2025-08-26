import React, { useState, useEffect, useRef } from 'react';
import type { CuentaContable } from '../../../types/contabilidad';
import { ContabilidadApiService } from '../../../services/contabilidadApi';

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
        console.log('✅ Cuenta encontrada automáticamente:', cuentaExacta);
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
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Input de código */}
        <div style={{ flex: '0 0 120px', position: 'relative' }}>
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
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `2px solid ${mostrarError ? '#ef4444' : cuentaValida ? '#10b981' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              background: disabled ? '#f9fafb' : 'white',
              outline: 'none',
              transition: 'border-color 0.2s',
              fontFamily: 'monospace',
              fontWeight: '600'
            }}
          />
          
          {/* Indicador de validación */}
          {value.trim() && (
            <div style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '14px'
            }}>
              {loading ? (
                <span style={{ color: '#6b7280' }}>⏳</span>
              ) : cuentaValida ? (
                <span style={{ color: '#10b981' }}>✓</span>
              ) : (
                <span style={{ color: '#ef4444' }}>✗</span>
              )}
            </div>
          )}
        </div>

        {/* Campo de denominación (solo lectura y autocompletado) */}
        <div style={{ flex: 1 }}>
          <div style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            background: '#f8fafc',
            color: denominacion ? '#1f2937' : '#9ca3af',
            fontWeight: denominacion ? '500' : 'normal',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
          }}>
            {denominacion || 'Nombre de la cuenta aparecerá aquí...'}
            {denominacion && (
              <div style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '12px',
                color: '#10b981',
                background: '#ecfdf5',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                AUTO
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown de sugerencias */}
      {showDropdown && cuentasFiltradas.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '300px',
            overflowY: 'auto',
            marginTop: '4px'
          }}
        >
          {/* Header del dropdown */}
          <div style={{
            padding: '8px 12px',
            background: '#f8fafc',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            {cuentasFiltradas.length} cuenta{cuentasFiltradas.length !== 1 ? 's' : ''} encontrada{cuentasFiltradas.length !== 1 ? 's' : ''}
          </div>
          
          {cuentasFiltradas.map((cuenta, index) => (
            <div
              key={cuenta.codigo}
              onClick={() => handleSelectCuenta(cuenta)}
              style={{
                padding: '12px',
                cursor: 'pointer',
                borderBottom: index < cuentasFiltradas.length - 1 ? '1px solid #f3f4f6' : 'none',
                background: index === selectedIndex ? '#f0f9ff' : 'white',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '14px',
                      color: '#1f2937',
                      fontFamily: 'monospace',
                      background: '#f3f4f6',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {cuenta.codigo}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: cuenta.naturaleza === 'DEUDORA' ? '#fef3c7' : 
                                  cuenta.naturaleza === 'ACREEDORA' ? '#d1fae5' : '#e0e7ff',
                      color: cuenta.naturaleza === 'DEUDORA' ? '#92400e' : 
                             cuenta.naturaleza === 'ACREEDORA' ? '#065f46' : '#3730a3',
                      fontWeight: '500'
                    }}>
                      {cuenta.naturaleza}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#4b5563', 
                    lineHeight: '1.4',
                    fontWeight: '500'
                  }}>
                    {cuenta.descripcion}
                  </div>
                  {cuenta.codigo.length > 1 && (
                    <div style={{
                      fontSize: '10px',
                      color: '#9ca3af',
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>📁</span>
                      Nivel {cuenta.codigo.length}
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#10b981',
                  fontWeight: '600'
                }}>
                  ✓
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{ 
              padding: '16px', 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '14px'
            }}>
              <div style={{ marginBottom: '4px' }}>🔍</div>
              Buscando cuentas...
            </div>
          )}
        </div>
      )}

      {/* Mensaje de error */}
      {mostrarError && value.trim() && (
        <div style={{
          marginTop: '4px',
          fontSize: '12px',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>⚠️</span>
          {loading ? 'Verificando cuenta...' : 'Código de cuenta no válido'}
        </div>
      )}
    </div>
  );
};

export default CuentaAutocomplete;
