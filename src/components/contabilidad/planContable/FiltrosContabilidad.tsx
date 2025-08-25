import React, { useState } from 'react';

interface FiltrosContabilidadProps {
  filtros: {
    busqueda: string;
    clase_contable?: number;
    nivel?: number;
    solo_activas: boolean;
  };
  onFiltrosChange: (filtros: any) => void;
  onCrearCuenta: () => void;
  totalCuentas: number;
}

const FiltrosContabilidad: React.FC<FiltrosContabilidadProps> = ({
  filtros,
  onFiltrosChange,
  onCrearCuenta,
  totalCuentas
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const clasesContables = [
    { value: 1, label: '1 - ACTIVO DISPONIBLE Y EXIGIBLE' },
    { value: 2, label: '2 - ACTIVO REALIZABLE' },
    { value: 3, label: '3 - ACTIVO INMOVILIZADO' },
    { value: 4, label: '4 - PASIVO' },
    { value: 5, label: '5 - PATRIMONIO NETO' },
    { value: 6, label: '6 - GASTOS POR NATURALEZA' },
    { value: 7, label: '7 - VENTAS' },
    { value: 8, label: '8 - SALDOS INTERMEDIARIOS' },
    { value: 9, label: '9 - CONTABILIDAD ANALÍTICA' }
  ];

  const niveles = [
    { value: 1, label: '1 - CLASE' },
    { value: 2, label: '2 - GRUPO' },
    { value: 3, label: '3 - SUBGRUPO' },
    { value: 4, label: '4 - CUENTA' },
    { value: 5, label: '5 - SUBCUENTA' },
    { value: 6, label: '6 - DIVISIONARIA' },
    { value: 7, label: '7 - SUBDIVISIONARIA' },
    { value: 8, label: '8 - AUXILIAR' }
  ];

  const handleBusquedaChange = (value: string) => {
    onFiltrosChange({ ...filtros, busqueda: value });
  };

  const handleClaseChange = (value: string) => {
    onFiltrosChange({ 
      ...filtros, 
      clase_contable: value ? parseInt(value) : undefined 
    });
  };

  const handleNivelChange = (value: string) => {
    onFiltrosChange({ 
      ...filtros, 
      nivel: value ? parseInt(value) : undefined 
    });
  };

  const handleActivasChange = (checked: boolean) => {
    onFiltrosChange({ ...filtros, solo_activas: checked });
  };

  const limpiarFiltros = () => {
    onFiltrosChange({
      busqueda: '',
      clase_contable: undefined,
      nivel: undefined,
      solo_activas: true
    });
  };

  const hayFiltrosActivos = filtros.busqueda || filtros.clase_contable || filtros.nivel || !filtros.solo_activas;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Fila principal */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, maxWidth: '28rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              paddingLeft: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              <svg style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por código o descripción..."
              value={filtros.busqueda}
              onChange={(e) => handleBusquedaChange(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '3rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                lineHeight: '1.25',
                background: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.15s ease-in-out'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 1px #3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            {filtros.busqueda && (
              <button
                onClick={() => handleBusquedaChange('')}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  paddingRight: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                <svg style={{ height: '1rem', width: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280',
              fontWeight: '500'
            }}>
              {totalCuentas} cuenta{totalCuentas !== 1 ? 's' : ''}
            </span>
            {hayFiltrosActivos && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.125rem 0.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                background: '#dbeafe',
                color: '#1e40af'
              }}>
                Filtrado
              </span>
            )}
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              background: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.15s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            <svg style={{ height: '1rem', width: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Filtros {showAdvanced ? 'avanzados' : ''}
            <svg 
              style={{ 
                height: '1rem', 
                width: '1rem',
                transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease-in-out'
              }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <button
            onClick={onCrearCuenta}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease-in-out'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            <svg style={{ height: '1rem', width: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cuenta
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div style={{
          background: '#f9fafb',
          borderRadius: '0.5rem',
          padding: '1rem',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {/* Clase contable */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Clase Contable
              </label>
              <select
                value={filtros.clase_contable || ''}
                onChange={(e) => handleClaseChange(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  background: 'white',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.15s ease-in-out'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 1px #3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Todas las clases</option>
                {clasesContables.map((clase) => (
                  <option key={clase.value} value={clase.value}>
                    {clase.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nivel */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Nivel Jerárquico
              </label>
              <select
                value={filtros.nivel || ''}
                onChange={(e) => handleNivelChange(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  background: 'white',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.15s ease-in-out'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 1px #3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Todos los niveles</option>
                {niveles.map((nivel) => (
                  <option key={nivel.value} value={nivel.value}>
                    {nivel.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Estados */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Estado
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={filtros.solo_activas}
                    onChange={(e) => handleActivasChange(e.target.checked)}
                    style={{
                      height: '1rem',
                      width: '1rem',
                      accentColor: '#3b82f6',
                      borderRadius: '0.25rem'
                    }}
                  />
                  <span style={{ 
                    marginLeft: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}>
                    Solo cuentas activas
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Acciones de filtros */}
          {hayFiltrosActivos && (
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.125rem 0.625rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500',
                background: '#dbeafe',
                color: '#1e40af'
              }}>
                Filtros aplicados
              </span>
              
              <button
                onClick={limpiarFiltros}
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  textDecoration: 'underline',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease-in-out'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filtros activos (chips) */}
      {hayFiltrosActivos && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {filtros.busqueda && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              background: '#dbeafe',
              color: '#1e40af'
            }}>
              Búsqueda: "{filtros.busqueda}"
              <button
                onClick={() => handleBusquedaChange('')}
                style={{
                  marginLeft: '0.5rem',
                  color: '#2563eb',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  lineHeight: 1,
                  transition: 'color 0.15s ease-in-out'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}
              >
                ×
              </button>
            </span>
          )}
          
          {filtros.clase_contable && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              background: '#d1fae5',
              color: '#065f46'
            }}>
              Clase: {filtros.clase_contable}
              <button
                onClick={() => handleClaseChange('')}
                style={{
                  marginLeft: '0.5rem',
                  color: '#059669',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  lineHeight: 1,
                  transition: 'color 0.15s ease-in-out'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#059669'}
              >
                ×
              </button>
            </span>
          )}
          
          {filtros.nivel && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              background: '#fef3c7',
              color: '#92400e'
            }}>
              Nivel: {filtros.nivel}
              <button
                onClick={() => handleNivelChange('')}
                style={{
                  marginLeft: '0.5rem',
                  color: '#d97706',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  lineHeight: 1,
                  transition: 'color 0.15s ease-in-out'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#b45309'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d97706'}
              >
                ×
              </button>
            </span>
          )}
          
          {!filtros.solo_activas && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              background: '#fee2e2',
              color: '#991b1b'
            }}>
              Incluye inactivas
              <button
                onClick={() => handleActivasChange(true)}
                style={{
                  marginLeft: '0.5rem',
                  color: '#dc2626',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  lineHeight: 1,
                  transition: 'color 0.15s ease-in-out'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#dc2626'}
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FiltrosContabilidad;
