import React from 'react';
import type { Empresa } from '../../types/empresa';
import EmpresaCard from './EmpresaCard';

interface EmpresaListProps {
  empresas: Empresa[];
  empresaActual: Empresa | null;
  loading: boolean;
  error: string | null;
  onSelectEmpresa: (empresa: Empresa) => void;
  onEditEmpresa: (empresa: Empresa) => void;
  onDeleteEmpresa: (ruc: string) => void;
  onConfigSire: (empresa: Empresa) => void;
  onCreateNew: () => void;
}

const EmpresaList: React.FC<EmpresaListProps> = ({
  empresas,
  empresaActual,
  loading,
  error,
  onSelectEmpresa,
  onEditEmpresa,
  onDeleteEmpresa,
  onConfigSire,
  onCreateNew
}) => {
  // Estadísticas
  const totalEmpresas = empresas.length;
  const empresasActivas = empresas.filter(emp => emp.activa).length;
  const empresasConSire = empresas.filter(emp => emp.sire_activo).length;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(40px, 10vw, 60px)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 'clamp(40px, 10vw, 60px)',
          height: 'clamp(40px, 10vw, 60px)',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 'clamp(16px, 4vw, 24px)'
        }}></div>
        <p style={{ 
          color: '#6b7280',
          fontSize: 'clamp(14px, 3.5vw, 18px)',
          margin: 0,
          fontWeight: '500'
        }}>
          Cargando empresas...
        </p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: 'clamp(20px, 5vw, 32px)',
        backgroundColor: '#fef2f2',
        color: '#991b1b',
        border: '2px solid #fca5a5',
        borderRadius: 'clamp(8px, 2vw, 12px)',
        textAlign: 'center',
        margin: 'clamp(20px, 5vw, 32px)'
      }}>
        <h3 style={{ 
          margin: '0 0 clamp(8px, 2vw, 12px) 0',
          fontSize: 'clamp(16px, 4vw, 20px)',
          fontWeight: '700'
        }}>
          ❌ Error al cargar empresas
        </h3>
        <p style={{ 
          margin: 0,
          fontSize: 'clamp(14px, 3.5vw, 16px)',
          lineHeight: '1.5'
        }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 'clamp(16px, 4vw, 24px)',
      maxWidth: '100%',
      margin: '0 auto',
    }}>
      {/* Header con estadísticas - Responsive */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(16px, 4vw, 24px)',
        marginBottom: 'clamp(20px, 5vw, 32px)',
        padding: 'clamp(16px, 4vw, 24px)',
        backgroundColor: 'white',
        borderRadius: 'clamp(8px, 2vw, 12px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {/* Título y estadísticas */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(12px, 3vw, 16px)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <h2 style={{
                margin: '0 0 clamp(8px, 2vw, 12px) 0',
                fontSize: 'clamp(20px, 5vw, 28px)',
                fontWeight: '700',
                color: '#1a202c',
                letterSpacing: '-0.025em',
                lineHeight: '1.2',
              }}>
                🏢 Gestión de Empresas
              </h2>
              
              {/* Estadísticas responsive */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 'clamp(12px, 3vw, 20px)',
                marginTop: 'clamp(8px, 2vw, 12px)',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 'clamp(8px, 2vw, 12px)',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'clamp(6px, 1.5vw, 8px)',
                  border: '1px solid #e2e8f0',
                }}>
                  <span style={{
                    fontSize: 'clamp(18px, 4vw, 24px)',
                    fontWeight: '700',
                    color: '#2d3748',
                  }}>
                    {totalEmpresas}
                  </span>
                  <span style={{
                    fontSize: 'clamp(11px, 2.5vw, 13px)',
                    color: '#64748b',
                    fontWeight: '600',
                  }}>
                    📊 Total
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 'clamp(8px, 2vw, 12px)',
                  backgroundColor: '#f0fff4',
                  borderRadius: 'clamp(6px, 1.5vw, 8px)',
                  border: '1px solid #9ae6b4',
                }}>
                  <span style={{
                    fontSize: 'clamp(18px, 4vw, 24px)',
                    fontWeight: '700',
                    color: '#22543d',
                  }}>
                    {empresasActivas}
                  </span>
                  <span style={{
                    fontSize: 'clamp(11px, 2.5vw, 13px)',
                    color: '#2f855a',
                    fontWeight: '600',
                  }}>
                    ✅ Activas
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 'clamp(8px, 2vw, 12px)',
                  backgroundColor: '#ebf8ff',
                  borderRadius: 'clamp(6px, 1.5vw, 8px)',
                  border: '1px solid #90cdf4',
                }}>
                  <span style={{
                    fontSize: 'clamp(18px, 4vw, 24px)',
                    fontWeight: '700',
                    color: '#1e3a8a',
                  }}>
                    {empresasConSire}
                  </span>
                  <span style={{
                    fontSize: 'clamp(11px, 2.5vw, 13px)',
                    color: '#1d4ed8',
                    fontWeight: '600',
                  }}>
                    🔐 SIRE
                  </span>
                </div>
              </div>
            </div>

            {/* Botón Nueva Empresa - Responsive */}
            <button
              onClick={onCreateNew}
              style={{
                padding: 'clamp(12px, 3vw, 16px) clamp(20px, 5vw, 28px)',
                fontSize: 'clamp(13px, 3vw, 15px)',
                fontWeight: '600',
                border: 'none',
                borderRadius: 'clamp(6px, 1.5vw, 8px)',
                backgroundColor: '#10b981',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(6px, 1.5vw, 8px)',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                minHeight: '44px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.25)';
              }}
            >
              <span style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>➕</span>
              Nueva Empresa
            </button>
          </div>
        </div>
      </div>

      {/* Empresa actual destacada - Responsive */}
      {empresaActual && (
        <div style={{
          marginBottom: 'clamp(20px, 5vw, 32px)',
          padding: 'clamp(16px, 4vw, 24px)',
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          border: '2px solid #3b82f6',
          borderRadius: 'clamp(8px, 2vw, 12px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Elemento decorativo */}
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '60px',
            height: '60px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '50%',
            transform: 'translate(20px, -20px)',
          }} />
          
          <h3 style={{
            margin: '0 0 clamp(8px, 2vw, 12px) 0',
            fontSize: 'clamp(16px, 4vw, 20px)',
            color: '#1e3a8a',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1.5vw, 8px)',
            position: 'relative',
            zIndex: 1,
          }}>
            🎯 Empresa Actualmente Seleccionada
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(8px, 2vw, 12px)',
            fontSize: 'clamp(14px, 3.5vw, 18px)',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'clamp(8px, 2vw, 12px)',
            }}>
              <strong style={{ color: '#1e3a8a' }}>{empresaActual.ruc}</strong>
              <span style={{ color: '#64748b' }}>-</span>
              <span style={{ 
                color: '#1e3a8a',
                wordBreak: 'break-word',
                flex: '1',
                minWidth: '200px',
              }}>
                {empresaActual.razon_social}
              </span>
              {empresaActual.sire_activo && (
                <span style={{
                  fontSize: 'clamp(10px, 2.5vw, 12px)',
                  padding: '4px clamp(8px, 2vw, 12px)',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                }}>
                  🔐 SIRE ACTIVO
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de empresas - Grid Responsivo */}
      {totalEmpresas === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'clamp(40px, 10vw, 80px) clamp(20px, 5vw, 40px)',
          backgroundColor: 'white',
          borderRadius: 'clamp(8px, 2vw, 12px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            fontSize: 'clamp(48px, 12vw, 72px)',
            marginBottom: 'clamp(16px, 4vw, 24px)',
            opacity: 0.6,
          }}>
            🏢
          </div>
          <h3 style={{
            margin: '0 0 clamp(12px, 3vw, 16px) 0',
            fontSize: 'clamp(18px, 4.5vw, 24px)',
            fontWeight: '700',
            color: '#374151',
          }}>
            No hay empresas registradas
          </h3>
          <p style={{
            margin: '0 0 clamp(24px, 6vw, 32px) 0',
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            color: '#6b7280',
            lineHeight: '1.5',
          }}>
            Comienza creando tu primera empresa para gestionar tu negocio
          </p>
          <button
            onClick={onCreateNew}
            style={{
              padding: 'clamp(14px, 3.5vw, 18px) clamp(28px, 7vw, 36px)',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              fontWeight: '600',
              border: 'none',
              borderRadius: 'clamp(6px, 1.5vw, 8px)',
              backgroundColor: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ➕ Crear Primera Empresa
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
          gap: 'clamp(20px, 5vw, 28px)',
          alignItems: 'start',
          width: '100%',
          maxWidth: '100%',
          padding: '0 clamp(8px, 2vw, 16px)'
        }}>
          {empresas.map((empresa) => (
            <EmpresaCard
              key={empresa.ruc}
              empresa={empresa}
              isSelected={empresaActual?.ruc === empresa.ruc}
              onSelect={onSelectEmpresa}
              onEdit={onEditEmpresa}
              onDelete={onDeleteEmpresa}
              onConfigSire={onConfigSire}
            />
          ))}
        </div>
      )}

      {/* Footer con información adicional - Responsive */}
      {totalEmpresas > 0 && (
        <div style={{
          marginTop: 'clamp(24px, 6vw, 32px)',
          padding: 'clamp(16px, 4vw, 24px)',
          backgroundColor: '#f8fafc',
          borderRadius: 'clamp(6px, 1.5vw, 8px)',
          border: '1px solid #e2e8f0',
          fontSize: 'clamp(12px, 3vw, 14px)',
          color: '#64748b',
          textAlign: 'center',
          lineHeight: '1.6',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>💡</span>
            <strong>Tip:</strong>
          </div>
          Haz clic en una empresa para seleccionarla como activa. 
          Solo puedes tener una empresa activa a la vez.
        </div>
      )}

      {/* CSS adicional para responsive */}
      <style>
        {`
          @media (max-width: 1200px) {
            .empresa-grid {
              grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)) !important;
            }
          }
          
          @media (max-width: 768px) {
            .empresa-grid {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
          }
          
          @media (max-width: 480px) {
            .empresa-grid {
              gap: 12px !important;
            }
          }
          
          @media (hover: none) {
            /* Estilos para dispositivos táctiles */
            button:hover {
              transform: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default EmpresaList;
