import React from 'react';
import type { LibroDiario } from '../../../types/libroDiario';

interface LibroDiarioTableProps {
  libros: LibroDiario[];
  onVerAsientos?: (libro: LibroDiario) => void;
  onEliminar: (libroId: string) => void;
}

const LibroDiarioTable: React.FC<LibroDiarioTableProps> = ({
  libros,
  onVerAsientos,
  onEliminar
}) => {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'finalizado':
        return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'enviado':
        return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
      default: // borrador
        return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
    }
  };

  const formatFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleDateString('es-PE');
    } catch {
      return fecha;
    }
  };

  if (libros.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        border: '2px dashed #d1d5db',
        color: '#6b7280'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>
          No hay libros diarios
        </h3>
        <p style={{ margin: '0', fontSize: '14px' }}>
          Comience creando su primer libro diario
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h3 style={{
          margin: '0',
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>📚</span>
          Libros Diarios ({libros.length})
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gap: '16px',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        {libros.map((libro) => {
          const estadoColors = getEstadoColor(libro.estado);
          const isBalanceado = Math.abs(libro.totalDebe - libro.totalHaber) < 0.01;

          return (
            <div
              key={libro.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                background: '#f9fafb',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Header del libro */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {libro.descripcion}
                  </h4>
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    📅 Período: {libro.periodo}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: estadoColors.bg,
                    color: estadoColors.text,
                    border: `1px solid ${estadoColors.border}`,
                    textTransform: 'capitalize'
                  }}>
                    {libro.estado}
                  </span>
                </div>
              </div>

              {/* Información financiera */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
                marginBottom: '16px',
                padding: '12px',
                background: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#059669'
                  }}>
                    S/ {libro.totalDebe.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Total Debe
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#dc2626'
                  }}>
                    S/ {libro.totalHaber.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Total Haber
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isBalanceado ? '#059669' : '#dc2626'
                  }}>
                    {isBalanceado ? '✅' : '⚠️'} {libro.asientos?.length || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Asientos
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end'
              }}>
                {onVerAsientos && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerAsientos(libro);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    📝 Gestionar Asientos
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`¿Está seguro de eliminar el libro "${libro.descripcion}"?`)) {
                      onEliminar(libro.id!);
                    }
                  }}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>

              {/* Información adicional */}
              {libro.fechaCreacion && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  Creado: {formatFecha(libro.fechaCreacion)}
                  {libro.fechaModificacion && libro.fechaModificacion !== libro.fechaCreacion && (
                    <span> • Modificado: {formatFecha(libro.fechaModificacion)}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LibroDiarioTable;
