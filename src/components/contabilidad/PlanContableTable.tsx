import React, { useState } from 'react';
import type { CuentaContable } from '../../types/contabilidad';

interface PlanContableTableProps {
  cuentas: CuentaContable[];
  loading: boolean;
  onEditarCuenta: (cuenta: CuentaContable) => void;
  onEliminarCuenta: (cuenta: CuentaContable) => void;
  cuentaSeleccionada?: string;
  onCuentaSelect: (cuenta: CuentaContable) => void;
}

const PlanContableTable: React.FC<PlanContableTableProps> = ({
  cuentas,
  loading,
  onEditarCuenta,
  onEliminarCuenta,
  cuentaSeleccionada,
  onCuentaSelect
}) => {
  const [sortField, setSortField] = useState<keyof CuentaContable>('codigo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof CuentaContable) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCuentas = React.useMemo(() => {
    return [...cuentas].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }, [cuentas, sortField, sortDirection]);

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

  const getNivelBadge = (nivel: number) => {
    const colores = {
      1: { bg: '#fee2e2', color: '#991b1b' },
      2: { bg: '#fed7aa', color: '#9a3412' },
      3: { bg: '#fef3c7', color: '#92400e' },
      4: { bg: '#d9f99d', color: '#365314' },
      5: { bg: '#a7f3d0', color: '#064e3b' },
      6: { bg: '#bfdbfe', color: '#1e40af' },
      7: { bg: '#fce7f3', color: '#be185d' },
      8: { bg: '#f3f4f6', color: '#374151' }
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

    const colorConfig = colores[nivel as keyof typeof colores] || { bg: '#f3f4f6', color: '#374151' };

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
        {nombres[nivel as keyof typeof nombres] || `Nivel ${nivel}`}
      </span>
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

  return (
    <div style={{
      background: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      borderRadius: '0.5rem'
    }}>
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
            {sortedCuentas.map((cuenta) => (
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
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                      fontWeight: '500',
                      color: '#111827'
                    }}>
                      {cuenta.codigo}
                    </div>
                    <div style={{ marginLeft: '0.5rem' }}>
                      {cuenta.clase_contable && (
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
                  <div style={{ fontSize: '0.875rem', color: '#111827' }}>{cuenta.descripcion}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {cuenta.cuenta_padre && `Padre: ${cuenta.cuenta_padre}`}
                  </div>
                </td>
                <td style={{ 
                  padding: '1rem 1.5rem',
                  whiteSpace: 'nowrap',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  {getNivelBadge(cuenta.nivel)}
                </td>
                <td style={{ 
                  padding: '1rem 1.5rem',
                  whiteSpace: 'nowrap',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  {getNaturalezaBadge(cuenta.naturaleza)}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanContableTable;