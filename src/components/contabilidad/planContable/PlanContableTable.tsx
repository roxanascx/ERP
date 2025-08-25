import React, { useState } from 'react';
import type { CuentaContable } from '../../../types/contabilidad';

interface PlanContableTableProps {
  cuentas: CuentaContable[];
  loading: boolean;
  onEditarCuenta: (cuenta: CuentaContable) => void;
  onEliminarCuenta: (cuenta: CuentaContable) => void;
  onToggleActivarCuenta: (cuenta: CuentaContable) => void;
  cuentaSeleccionada?: string;
  onCuentaSelect: (cuenta: CuentaContable) => void;
}

interface CuentaConHijos extends CuentaContable {
  hijos?: CuentaConHijos[];
  expandido?: boolean;
  tieneHijos?: boolean;
}

const PlanContableTable: React.FC<PlanContableTableProps> = ({
  cuentas,
  loading,
  onEditarCuenta,
  onEliminarCuenta,
  onToggleActivarCuenta,
  cuentaSeleccionada,
  onCuentaSelect
}) => {
  const [sortField, setSortField] = useState<keyof CuentaContable>('codigo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Función para construir la estructura jerárquica
  const construirJerarquia = (cuentas: CuentaContable[]): CuentaConHijos[] => {
    const mapa = new Map<string, CuentaConHijos>();
    const raices: CuentaConHijos[] = [];

    // Ordenar cuentas por código antes de procesar
    const cuentasOrdenadas = [...cuentas].sort((a, b) => a.codigo.localeCompare(b.codigo));

    // Crear nodos con información adicional
    cuentasOrdenadas.forEach(cuenta => {
      const nodo: CuentaConHijos = {
        ...cuenta,
        hijos: [],
        expandido: expandedNodes.has(cuenta.codigo),
        tieneHijos: false
      };
      mapa.set(cuenta.codigo, nodo);
    });

    // Construir relaciones padre-hijo de manera más precisa
    cuentasOrdenadas.forEach(cuenta => {
      const nodo = mapa.get(cuenta.codigo)!;
      
      // Buscar el padre más cercano basado en la longitud del código
      let padre: CuentaConHijos | undefined;
      
      // Para códigos de más de 1 dígito, buscar el padre
      if (cuenta.codigo.length > 1) {
        for (let i = cuenta.codigo.length - 1; i > 0; i--) {
          const codigoPadre = cuenta.codigo.substring(0, i);
          padre = mapa.get(codigoPadre);
          if (padre) break;
        }
      }

      if (padre) {
        padre.hijos!.push(nodo);
        padre.tieneHijos = true;
      } else {
        // Solo las cuentas de nivel 1 (1 dígito) deben ser raíces
        if (cuenta.codigo.length === 1) {
          raices.push(nodo);
        }
      }
    });

    // Ordenar cada nivel por código
    const ordenarNodos = (nodos: CuentaConHijos[]) => {
      nodos.sort((a, b) => {
        // Ordenamiento numérico para códigos de cuenta
        const aNum = parseInt(a.codigo);
        const bNum = parseInt(b.codigo);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.codigo.localeCompare(b.codigo);
      });
      
      nodos.forEach(nodo => {
        if (nodo.hijos && nodo.hijos.length > 0) {
          ordenarNodos(nodo.hijos);
        }
      });
    };

    ordenarNodos(raices);
    return raices;
  };

  // Función para aplanar la jerarquía para mostrar en tabla
  const aplanarJerarquia = (nodos: CuentaConHijos[]): CuentaConHijos[] => {
    let resultado: CuentaConHijos[] = [];

    nodos.forEach(nodo => {
      // Calcular el nivel basado en la longitud del código
      const nivelReal = nodo.codigo.length - 1; // 0 para nivel 1, 1 para nivel 2, etc.
      
      // Agregar el nodo actual con el nivel correcto
      resultado.push({ 
        ...nodo, 
        nivel: nivelReal
      });

      // Si está expandido, agregar sus hijos
      if (nodo.expandido && nodo.hijos && nodo.hijos.length > 0) {
        resultado = resultado.concat(aplanarJerarquia(nodo.hijos));
      }
    });

    return resultado;
  };

  const toggleExpansion = (codigo: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(codigo)) {
      newExpanded.delete(codigo);
    } else {
      newExpanded.add(codigo);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSort = (field: keyof CuentaContable) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Construir y aplanar la jerarquía
  const cuentasJerarquicas = React.useMemo(() => {
    const jerarquia = construirJerarquia(cuentas);
    return aplanarJerarquia(jerarquia);
  }, [cuentas, expandedNodes]);

  const sortedCuentas = React.useMemo(() => {
    // Para mantener la jerarquía, solo ordenamos dentro de cada nivel
    return cuentasJerarquicas;
  }, [cuentasJerarquicas, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: keyof CuentaContable }) => {
    if (sortField !== field) {
      return (
        <svg style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return (
      <svg 
        style={{ width: '1rem', height: '1rem', color: '#3b82f6' }} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        {sortDirection === 'asc' ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        )}
      </svg>
    );
  };

  const getNaturalezaBadge = (naturaleza: string) => {
    const colores = {
      'DEUDORA': { bg: '#fef3c7', color: '#92400e' },
      'ACREEDORA': { bg: '#d1fae5', color: '#065f46' },
      'DEUDORA/ACREEDORA': { bg: '#e0e7ff', color: '#3730a3' }
    };

    const colorConfig = colores[naturaleza as keyof typeof colores] || { bg: '#f3f4f6', color: '#374151' };

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.125rem 0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: '500',
        background: colorConfig.bg,
        color: colorConfig.color
      }}>
        {naturaleza}
      </span>
    );
  };

  const getNivelBadge = (codigo: string, nivel?: number) => {
    // Detectar nivel automáticamente basado en el código
    const nivelDetectado = nivel || codigo.length;
    
    const colores = {
      1: { bg: '#fee2e2', color: '#991b1b', icon: '🏛️' },
      2: { bg: '#fed7aa', color: '#9a3412', icon: '📁' },
      3: { bg: '#fef3c7', color: '#92400e', icon: '📂' },
      4: { bg: '#d9f99d', color: '#365314', icon: '📄' },
      5: { bg: '#a7f3d0', color: '#064e3b', icon: '📄' },
      6: { bg: '#bfdbfe', color: '#1e40af', icon: '📄' },
      7: { bg: '#fce7f3', color: '#be185d', icon: '📄' },
      8: { bg: '#f3f4f6', color: '#374151', icon: '📄' }
    };

    const nombres = {
      1: 'Clase',
      2: 'Grupo',
      3: 'Subgrupo',
      4: 'Cuenta',
      5: 'Subcuenta',
      6: 'Divisionaria',
      7: 'Subdivisionaria',
      8: 'Auxiliar'
    };

    const colorConfig = colores[nivelDetectado as keyof typeof colores] || { bg: '#f3f4f6', color: '#374151', icon: '📄' };

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '0.125rem 0.5rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: '500',
        background: colorConfig.bg,
        color: colorConfig.color
      }}>
        <span style={{ fontSize: '12px' }}>{colorConfig.icon}</span>
        {nombres[nivelDetectado as keyof typeof nombres] || `Nivel ${nivelDetectado}`}
      </span>
    );
  };

  const getEstadoToggle = (cuenta: CuentaContable) => {
    const esSubcuenta = cuenta.codigo.length >= 4;
    
    if (!esSubcuenta) {
      // Para cuentas padre (Clase, Grupo, Subgrupo), solo mostrar estado sin toggle
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: '600',
          background: cuenta.activa ? '#dcfce7' : '#f3f4f6',
          color: cuenta.activa ? '#166534' : '#6b7280',
          border: `1px solid ${cuenta.activa ? '#bbf7d0' : '#d1d5db'}`
        }}>
          <span style={{ fontSize: '8px' }}>
            {cuenta.activa ? '●' : '○'}
          </span>
          {cuenta.activa ? 'ON' : 'OFF'}
        </span>
      );
    }

    // Para subcuentas (nivel 4+), mostrar botón toggle estilo switch
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleActivarCuenta(cuenta);
        }}
        style={{
          position: 'relative',
          width: '56px',
          height: '28px',
          borderRadius: '14px',
          border: 'none',
          background: cuenta.activa 
            ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
          boxShadow: cuenta.activa 
            ? '0 4px 12px rgba(34, 197, 94, 0.25)' 
            : '0 4px 12px rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: cuenta.activa ? 'flex-end' : 'flex-start',
          padding: '2px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = cuenta.activa 
            ? '0 6px 16px rgba(34, 197, 94, 0.4)' 
            : '0 6px 16px rgba(239, 68, 68, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = cuenta.activa 
            ? '0 4px 12px rgba(34, 197, 94, 0.25)' 
            : '0 4px 12px rgba(239, 68, 68, 0.25)';
        }}
        title={cuenta.activa ? 'Clic para desactivar' : 'Clic para activar'}
      >
        {/* Círculo deslizante */}
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          color: cuenta.activa ? '#22c55e' : '#ef4444',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {cuenta.activa ? '✓' : '✕'}
        </div>
        
        {/* Texto ON/OFF */}
        <div style={{
          position: 'absolute',
          left: cuenta.activa ? '6px' : 'auto',
          right: cuenta.activa ? 'auto' : '6px',
          fontSize: '8px',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.9)',
          letterSpacing: '0.5px',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        }}>
          {cuenta.activa ? 'ON' : 'OFF'}
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        borderRadius: '0.5rem'
      }}>
        <div style={{ padding: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ height: '1rem', background: '#e5e7eb', borderRadius: '0.25rem', width: '100%' }}></div>
              <div style={{ height: '1rem', background: '#e5e7eb', borderRadius: '0.25rem', width: '75%' }}></div>
              <div style={{ height: '1rem', background: '#e5e7eb', borderRadius: '0.25rem', width: '50%' }}></div>
              <div style={{ height: '1rem', background: '#e5e7eb', borderRadius: '0.25rem', width: '83.333333%' }}></div>
              <div style={{ height: '1rem', background: '#e5e7eb', borderRadius: '0.25rem', width: '66.666667%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cuentas.length === 0) {
    return (
      <div style={{
        background: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        borderRadius: '0.5rem'
      }}>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <svg 
              style={{ 
                margin: '0 auto',
                height: '3rem',
                width: '3rem',
                color: '#9ca3af'
              }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 style={{ 
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#111827'
            }}>
              No hay cuentas
            </h3>
            <p style={{
              marginTop: '0.25rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              No se encontraron cuentas contables con los filtros aplicados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const expandirTodo = () => {
    const todosCodigos = new Set<string>();
    const agregarCodigos = (cuentas: CuentaContable[]) => {
      cuentas.forEach(cuenta => {
        todosCodigos.add(cuenta.codigo);
      });
    };
    agregarCodigos(cuentas);
    setExpandedNodes(todosCodigos);
  };

  const colapsarTodo = () => {
    setExpandedNodes(new Set());
  };

  return (
    <div style={{
      background: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      borderRadius: '0.5rem'
    }}>
      {/* Controles de expansión */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#64748b'
        }}>
          <span>🌳</span>
          <span>Vista Jerárquica - {sortedCuentas.length} cuentas mostradas</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={expandirTodo}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            title="Expandir todas las cuentas"
          >
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Expandir Todo
          </button>
          
          <button
            onClick={colapsarTodo}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            title="Colapsar todas las cuentas"
          >
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Colapsar Todo
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th
                scope="col"
                style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease-in-out'
                }}
                onClick={() => handleSort('codigo')}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>Código</span>
                  <SortIcon field="codigo" />
                </div>
              </th>
              <th
                scope="col"
                style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease-in-out'
                }}
                onClick={() => handleSort('descripcion')}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>Descripción</span>
                  <SortIcon field="descripcion" />
                </div>
              </th>
              <th
                scope="col"
                style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease-in-out'
                }}
                onClick={() => handleSort('nivel')}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>Nivel</span>
                  <SortIcon field="nivel" />
                </div>
              </th>
              <th
                scope="col"
                style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease-in-out'
                }}
                onClick={() => handleSort('naturaleza')}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>Naturaleza</span>
                  <SortIcon field="naturaleza" />
                </div>
              </th>
              <th
                scope="col"
                style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease-in-out',
                  width: '100px', // Ancho aún más compacto
                  minWidth: '100px'
                }}
                onClick={() => handleSort('activa')}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  <span>Estado</span>
                  <SortIcon field="activa" />
                </div>
              </th>
              <th
                scope="col"
                style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'right',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody style={{ background: 'white' }}>
            {sortedCuentas.map((cuenta) => {
              // Usar el nivel calculado en lugar de calcular basado en longitud
              const nivelIndentacion = cuenta.nivel || (cuenta.codigo.length - 1);
              const tieneHijos = cuenta.tieneHijos;
              const estaExpandido = expandedNodes.has(cuenta.codigo);
              
              return (
                <tr
                  key={cuenta.codigo}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease-in-out',
                    background: cuentaSeleccionada === cuenta.codigo ? '#eff6ff' : 'transparent',
                    borderLeft: cuentaSeleccionada === cuenta.codigo ? '4px solid #3b82f6' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (cuentaSeleccionada !== cuenta.codigo) {
                      e.currentTarget.style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (cuentaSeleccionada !== cuenta.codigo) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  onClick={() => onCuentaSelect(cuenta)}
                >
                  <td style={{ 
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      paddingLeft: `${nivelIndentacion * 20}px` // Indentación por nivel
                    }}>
                      {/* Botón de expansión/colapso */}
                      {tieneHijos ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpansion(cuenta.codigo);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            marginRight: '8px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            color: '#6b7280',
                            transition: 'all 0.15s ease-in-out'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                            e.currentTarget.style.color = '#374151';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#6b7280';
                          }}
                          title={estaExpandido ? 'Colapsar' : 'Expandir'}
                        >
                          <svg 
                            style={{ 
                              width: '12px', 
                              height: '12px',
                              transform: estaExpandido ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.15s ease-in-out'
                            }} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <div style={{ width: '28px', marginRight: '8px' }} />
                      )}
                      
                      {/* Código de la cuenta */}
                      <div style={{ 
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        fontWeight: cuenta.codigo.length <= 3 ? '700' : '500', // Negrita para códigos de 1-3 dígitos
                        color: '#111827'
                      }}>
                        {cuenta.codigo}
                      </div>
                      
                      {/* Badge de clase contable - Solo para niveles 1, 2 y 3 */}
                      <div style={{ marginLeft: '0.5rem' }}>
                        {cuenta.clase_contable && cuenta.codigo.length <= 3 && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            background: '#f3f4f6',
                            color: '#1f2937'
                          }}>
                            Clase {cuenta.clase_contable}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td style={{ 
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#111827', 
                      fontWeight: cuenta.codigo.length <= 3 ? '600' : '400', // Negrita para cuentas principales (1-3 dígitos)
                      marginBottom: '2px'
                    }}>
                      {cuenta.descripcion}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {cuenta.cuenta_padre && (
                        <span>Padre: {cuenta.cuenta_padre}</span>
                      )}
                      {tieneHijos && (
                        <span style={{ 
                          color: '#059669',
                          fontWeight: '500'
                        }}>
                          {cuenta.hijos?.length || 0} subcuentas
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td style={{ 
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    {getNivelBadge(cuenta.codigo, cuenta.nivel)}
                  </td>
                  
                  <td style={{ 
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    {getNaturalezaBadge(cuenta.naturaleza)}
                  </td>
                  
                  <td style={{ 
                    padding: '1rem',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #e5e7eb',
                    textAlign: 'center',
                    width: '100px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getEstadoToggle(cuenta)}
                    </div>
                  </td>
                  
                  <td style={{ 
                    padding: '1rem 1.5rem',
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditarCuenta(cuenta);
                        }}
                        style={{
                          color: '#2563eb',
                          padding: '0.25rem',
                          borderRadius: '0.25rem',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#1d4ed8';
                          e.currentTarget.style.background = '#dbeafe';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#2563eb';
                          e.currentTarget.style.background = 'transparent';
                        }}
                        title="Editar cuenta"
                      >
                        <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEliminarCuenta(cuenta);
                        }}
                        style={{
                          color: '#dc2626',
                          padding: '0.25rem',
                          borderRadius: '0.25rem',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#b91c1c';
                          e.currentTarget.style.background = '#fee2e2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#dc2626';
                          e.currentTarget.style.background = 'transparent';
                        }}
                        title="Eliminar cuenta"
                      >
                        <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanContableTable;