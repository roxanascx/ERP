/**
 * Página principal del módulo SIRE
 * Punto de entrada para todas las funcionalidades SIRE
 */

import React, { useState } from 'react';
import { RviePanel } from '../components/sire';
import { useEmpresaValidation } from '../hooks/useEmpresaValidation';
import { tieneSire } from '../types/empresa';
import MainLayout from '../components/MainLayout';
import BackendStatus from '../components/BackendStatus';

const SirePage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();
  const [activeModule, setActiveModule] = useState<'home' | 'rvie' | 'rce'>('home');
  
  // SIEMPRE llamar useRvie (nunca condicionalmente)
  // Si no hay empresa, usar RUC por defecto que será ignorado
  // NOTA: Ya no necesitamos esto porque el RviePanel maneja su propio hook
  // const rvieOptions = empresaActual ? { ruc: empresaActual.ruc } : { ruc: '00000000000' };
  // const rvieHook = useRvie(rvieOptions);

  // Si no hay empresa seleccionada, mostrar mensaje
  if (!empresaActual) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h2 style={{
            color: '#dc2626',
            marginBottom: '1rem'
          }}>
            🏢 Empresa no seleccionada
          </h2>
          <p style={{
            color: '#6b7280',
            marginBottom: '2rem'
          }}>
            Debe seleccionar una empresa antes de acceder al módulo SIRE.
          </p>
          <button
            onClick={() => window.location.href = '/empresas'}
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Seleccionar Empresa
          </button>
        </div>
      </div>
    );
  }

  // Render del módulo específico
  if (activeModule === 'rvie') {
    // Verificar que tenemos empresa válida antes de usar RVIE
    if (!empresaActual) {
      return <div>Error: No se pudo inicializar el módulo RVIE - empresa no encontrada</div>;
    }

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        padding: '20px'
      }}>
        <RviePanel 
          company={empresaActual} 
          onClose={() => setActiveModule('home')}
        />
      </div>
    );
  }

  // Página principal SIRE
  return (
    <MainLayout
      title="SIRE - Sistema de Reportes SUNAT"
      subtitle="Gestión de reportes de compras y ventas electrónicas"
    >
      <div style={{ maxWidth: '100%' }}>
        {/* Header Information */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              🔗 SIRE - Sistema de Información de Reportes Electrónicos
            </h1>
            <div style={{
              color: '#6b7280',
              margin: '12px 0 0 0',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <span><strong>Empresa:</strong> {empresaActual.razon_social}</span>
              <span style={{ opacity: 0.6 }}>•</span>
              <span><strong>RUC:</strong> {empresaActual.ruc}</span>
              <span style={{ opacity: 0.6 }}>•</span>
              <span style={{
                background: tieneSire(empresaActual) ? '#d1fae5' : '#fee2e2',
                color: tieneSire(empresaActual) ? '#065f46' : '#991b1b',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {tieneSire(empresaActual) ? '✅ SIRE Configurado' : '❌ SIRE No Configurado'}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => window.location.href = '/empresas'}
            style={{
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🔄 Cambiar Empresa
          </button>
        </div>
      </div>

      {/* Verificación de credenciales SIRE */}
      {!tieneSire(empresaActual) && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{
            color: '#92400e',
            margin: '0 0 1rem 0',
            fontSize: '1.2rem'
          }}>
            ⚠️ Configuración SIRE Requerida
          </h3>
          <p style={{
            color: '#92400e',
            margin: '0 0 1.5rem 0',
            lineHeight: '1.6'
          }}>
            Esta empresa no tiene configuradas las credenciales SIRE. 
            Es necesario configurar las credenciales de SUNAT para acceder a las funciones SIRE.
          </p>
          <button
            onClick={() => window.location.href = '/empresas'}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Configurar Credenciales SIRE
          </button>
        </div>
      )}

      {/* Módulos SIRE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        
        {/* RVIE */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: '2px solid transparent',
          transition: 'all 0.3s ease',
          cursor: tieneSire(empresaActual) ? 'pointer' : 'not-allowed',
          opacity: tieneSire(empresaActual) ? 1 : 0.6
        }}
        onClick={tieneSire(empresaActual) ? () => setActiveModule('rvie') : undefined}
        onMouseEnter={(e) => {
          if (tieneSire(empresaActual)) {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#dc2626';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(220, 38, 38, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (tieneSire(empresaActual)) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
          }
        }}
        >
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            📊
          </div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#dc2626',
            margin: '0 0 1rem 0',
            textAlign: 'center'
          }}>
            RVIE
          </h3>
          <p style={{
            color: '#6b7280',
            lineHeight: '1.6',
            margin: '0 0 1.5rem 0',
            textAlign: 'center'
          }}>
            <strong>Registro de Ventas e Ingresos Electrónico</strong>
          </p>
          <div style={{
            fontSize: '0.9rem',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            <div style={{ marginBottom: '8px' }}>
              • Descarga de propuestas SUNAT
            </div>
            <div style={{ marginBottom: '8px' }}>
              • Aceptación de propuestas
            </div>
            <div style={{ marginBottom: '8px' }}>
              • Reemplazo con archivos personalizados
            </div>
            <div>
              • Consulta de inconsistencias
            </div>
          </div>
        </div>

        {/* RCE */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: '2px solid transparent',
          opacity: 0.6,
          cursor: 'not-allowed'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            🧾
          </div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#6b7280',
            margin: '0 0 1rem 0',
            textAlign: 'center'
          }}>
            RCE
          </h3>
          <p style={{
            color: '#6b7280',
            lineHeight: '1.6',
            margin: '0 0 1.5rem 0',
            textAlign: 'center'
          }}>
            <strong>Registro de Compras Electrónico</strong>
          </p>
          <div style={{
            fontSize: '0.9rem',
            color: '#9ca3af',
            lineHeight: '1.5'
          }}>
            <div style={{ marginBottom: '8px' }}>
              • Gestión de compras
            </div>
            <div style={{ marginBottom: '8px' }}>
              • Validación de documentos
            </div>
            <div style={{ marginBottom: '8px' }}>
              • Reportes de compras
            </div>
            <div>
              • <em>Próximamente...</em>
            </div>
          </div>
        </div>

      </div>

      {/* Estado del sistema */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🔧 Estado del Sistema
        </h2>
        <BackendStatus />
        </div>
      </div>
    </MainLayout>
  );
};

export default SirePage;
