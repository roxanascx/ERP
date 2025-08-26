import React, { useState } from 'react';
import type { AsientoContable, DetalleAsiento } from '../../../types/libroDiario';
import FormularioAsiento from './FormularioAsiento';

interface AsientosManagerProps {
  libroId: string;
  asientos: AsientoContable[];
  onCrearAsiento?: (asiento: Omit<AsientoContable, 'id'>) => Promise<void>;
  onEditarAsiento?: (id: string, asiento: Partial<AsientoContable>) => Promise<void>;
  onEliminarAsiento?: (id: string) => Promise<void>;
}

const AsientosManager: React.FC<AsientosManagerProps> = ({
  libroId,
  asientos,
  onCrearAsiento,
  onEditarAsiento,
  onEliminarAsiento
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [asientoEditando, setAsientoEditando] = useState<AsientoContable | null>(null);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');

  // Filtrar asientos
  const asientosFiltrados = asientos.filter(asiento => {
    const cumpleFecha = !filtroFecha || asiento.fecha.includes(filtroFecha);
    const cumpleDescripcion = !filtroDescripcion || 
      asiento.descripcion.toLowerCase().includes(filtroDescripcion.toLowerCase());
    return cumpleFecha && cumpleDescripcion;
  });

  const handleCrearAsiento = () => {
    setAsientoEditando(null);
    setMostrarFormulario(true);
  };

  const handleEditarAsiento = (asiento: AsientoContable) => {
    setAsientoEditando(asiento);
    setMostrarFormulario(true);
  };

  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
    setAsientoEditando(null);
  };

  const calcularTotales = () => {
    return asientosFiltrados.reduce((acc, asiento) => {
      asiento.detalles.forEach((detalle: DetalleAsiento) => {
        acc.totalDebe += detalle.debe || 0;
        acc.totalHaber += detalle.haber || 0;
      });
      return acc;
    }, { totalDebe: 0, totalHaber: 0 });
  };

  const totales = calcularTotales();
  const isBalanceado = Math.abs(totales.totalDebe - totales.totalHaber) < 0.01;

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px' }}>
      {/* Header con filtros y acciones */}
      <div style={{
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <div>
            <h3 style={{ 
              margin: '0 0 8px 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📝</span>
              Gestión de Asientos Contables
            </h3>
            <p style={{ 
              margin: '0',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              {asientosFiltrados.length} asiento(s) encontrado(s)
            </p>
          </div>

          <button
            onClick={handleCrearAsiento}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
            }}
          >
            <span>➕</span>
            Crear Asiento
          </button>
        </div>

        {/* Filtros */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px' 
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '6px'
            }}>
              📅 Filtrar por fecha:
            </label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '6px'
            }}>
              🔍 Buscar por descripción:
            </label>
            <input
              type="text"
              placeholder="Buscar en descripciones..."
              value={filtroDescripcion}
              onChange={(e) => setFiltroDescripcion(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Resumen de totales */}
      <div style={{
        background: isBalanceado 
          ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
          : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        border: `2px solid ${isBalanceado ? '#16a34a' : '#dc2626'}`
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '16px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#059669',
              marginBottom: '4px'
            }}>
              S/ {totales.totalDebe.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#065f46' }}>Total Debe</div>
          </div>
          
          <div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#dc2626',
              marginBottom: '4px'
            }}>
              S/ {totales.totalHaber.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#991b1b' }}>Total Haber</div>
          </div>
          
          <div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: isBalanceado ? '#16a34a' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              {isBalanceado ? '✅' : '⚠️'}
              {isBalanceado ? 'Balanceado' : 'Desbalanceado'}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: isBalanceado ? '#15803d' : '#991b1b'
            }}>
              Estado
            </div>
          </div>
        </div>
      </div>

      {/* Lista de asientos */}
      {asientosFiltrados.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '2px dashed #d1d5db'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>
            No hay asientos contables
          </h3>
          <p style={{ margin: '0', fontSize: '14px' }}>
            {asientos.length === 0 
              ? 'Comienza creando tu primer asiento contable'
              : 'No se encontraron asientos con los filtros aplicados'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {asientosFiltrados.map((asiento) => (
            <AsientoCard
              key={asiento.id}
              asiento={asiento}
              onEditar={() => handleEditarAsiento(asiento)}
              onEliminar={onEliminarAsiento ? () => onEliminarAsiento(asiento.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <FormularioAsiento
          libroId={libroId}
          asientoEditando={asientoEditando}
          onGuardar={async (datos) => {
            if (asientoEditando && onEditarAsiento) {
              await onEditarAsiento(asientoEditando.id, datos);
            } else if (onCrearAsiento) {
              await onCrearAsiento(datos);
            }
            handleCerrarFormulario();
          }}
          onCerrar={handleCerrarFormulario}
        />
      )}
    </div>
  );
};

// Componente para mostrar cada asiento
interface AsientoCardProps {
  asiento: AsientoContable;
  onEditar: () => void;
  onEliminar?: () => void;
}

const AsientoCard: React.FC<AsientoCardProps> = ({ asiento, onEditar, onEliminar }) => {
  const [expandido, setExpandido] = useState(false);

  const totales = asiento.detalles.reduce((acc: { debe: number; haber: number }, detalle: DetalleAsiento) => {
    acc.debe += detalle.debe || 0;
    acc.haber += detalle.haber || 0;
    return acc;
  }, { debe: 0, haber: 0 });

  const isBalanceado = Math.abs(totales.debe - totales.haber) < 0.01;

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      background: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease'
    }}>
      {/* Header del asiento */}
      <div 
        style={{
          padding: '16px',
          borderBottom: '1px solid #f3f4f6',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => setExpandido(!expandido)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#111827'
            }}>
              {asiento.numero}
            </span>
            <span style={{ 
              fontSize: '14px', 
              color: '#6b7280'
            }}>
              📅 {asiento.fecha}
            </span>
            <span style={{ 
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: isBalanceado ? '#dcfce7' : '#fee2e2',
              color: isBalanceado ? '#166534' : '#dc2626'
            }}>
              {isBalanceado ? '✅ Balanceado' : '⚠️ Desbalanceado'}
            </span>
          </div>
          <p style={{ 
            margin: '0',
            color: '#374151',
            fontSize: '14px'
          }}>
            {asiento.descripcion}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right', marginRight: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
              D: S/ {totales.debe.toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>
              H: S/ {totales.haber.toFixed(2)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditar();
              }}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✏️ Editar
            </button>
            {onEliminar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('¿Estás seguro de eliminar este asiento?')) {
                    onEliminar();
                  }
                }}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🗑️ Eliminar
              </button>
            )}
          </div>

          <span style={{ 
            fontSize: '18px',
            color: '#6b7280',
            transition: 'transform 0.2s ease',
            transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* Detalles expandidos */}
      {expandido && (
        <div style={{ padding: '16px' }}>
          <h4 style={{ 
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            Detalles del Asiento:
          </h4>
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Cuenta
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Descripción
                  </th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>
                    Debe
                  </th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>
                    Haber
                  </th>
                </tr>
              </thead>
              <tbody>
                {asiento.detalles.map((detalle: DetalleAsiento, index: number) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                      {detalle.codigoCuenta}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                      {detalle.descripcion}
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      textAlign: 'right', 
                      borderBottom: '1px solid #f3f4f6',
                      color: detalle.debe ? '#059669' : '#9ca3af'
                    }}>
                      {detalle.debe ? `S/ ${detalle.debe.toFixed(2)}` : '-'}
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      textAlign: 'right', 
                      borderBottom: '1px solid #f3f4f6',
                      color: detalle.haber ? '#dc2626' : '#9ca3af'
                    }}>
                      {detalle.haber ? `S/ ${detalle.haber.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsientosManager;
