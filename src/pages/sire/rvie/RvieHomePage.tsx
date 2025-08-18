/**
 * Página principal del módulo RVIE
 * Dashboard con acceso a todas las funcionalidades RVIE
 * URL: /sire/rvie
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRvie } from '../../../hooks/useRvie';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';

const RvieHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { empresaActual } = useEmpresaValidation();
  
  // Hook RVIE para obtener información general
  const {
    authStatus,
    tickets,
    loading
  } = useRvie({ ruc: empresaActual?.ruc || '' });

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
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
          <h2>🏢 Empresa no encontrada</h2>
          <button onClick={() => navigate('/empresas')}>
            Seleccionar Empresa
          </button>
        </div>
      </div>
    );
  }

  // Estadísticas rápidas
  const ticketsActivos = tickets?.filter(t => t.status === 'TERMINADO').length || 0;
  const ticketsPendientes = tickets?.filter(t => t.status === 'PROCESANDO').length || 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '20px'
    }}>
      {/* Header de navegación */}
      <div style={{
        background: 'white',
        padding: '1rem 2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                onClick={() => navigate('/sire')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                SIRE
              </button>
              <span style={{ color: '#6b7280' }}>›</span>
              <span style={{ color: '#374151', fontWeight: 'bold', fontSize: '0.9rem' }}>
                RVIE
              </span>
            </div>
            
            {/* Título */}
            <h1 style={{ 
              fontSize: '1.8rem', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              📊 RVIE - Registro de Ventas e Ingresos Electrónico
            </h1>
          </div>

          {/* Botón volver */}
          <button
            onClick={() => navigate('/sire')}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ← Volver a SIRE
          </button>
        </div>
      </div>

      {/* Información de la empresa y estado */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>📋 Información de la Empresa</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>RUC:</strong> {empresaActual.ruc}
          </div>
          <div>
            <strong>Razón Social:</strong> {empresaActual.razon_social}
          </div>
          <div>
            <strong>Estado SUNAT:</strong> 
            <span style={{ 
              color: authStatus?.authenticated ? '#059669' : '#dc2626',
              fontWeight: 'bold',
              marginLeft: '0.5rem'
            }}>
              {authStatus?.authenticated ? '✅ Autenticado' : '❌ No autenticado'}
            </span>
          </div>
          <div>
            <strong>Total Tickets:</strong> {tickets?.length || 0}
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: '#059669', marginBottom: '0.5rem' }}>
            {ticketsActivos}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tickets Completados</div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
            {ticketsPendientes}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tickets en Proceso</div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '0.5rem' }}>
            {loading ? '⏳' : '✅'}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Estado del Sistema</div>
        </div>
      </div>

      {/* Módulos RVIE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem'
      }}>
        {/* Operaciones RVIE */}
        <div
          onClick={() => navigate('/sire/rvie/operaciones')}
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            border: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.borderColor = '#10b981';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
            <h3 style={{ 
              color: '#10b981', 
              fontSize: '1.3rem', 
              margin: '0 0 1rem 0' 
            }}>
              Operaciones RVIE
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1rem', 
              margin: '0 0 1.5rem 0' 
            }}>
              Gestionar propuestas y procesos RVIE
            </p>
            <div style={{ textAlign: 'left', color: '#374151' }}>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>Descargar propuestas SUNAT</li>
                <li>Aceptar propuestas</li>
                <li>Reemplazar con archivos</li>
                <li>Registrar preliminares</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Gestión de Tickets */}
        <div
          onClick={() => navigate('/sire/rvie/tickets')}
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            border: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.borderColor = '#f59e0b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
            <h3 style={{ 
              color: '#f59e0b', 
              fontSize: '1.3rem', 
              margin: '0 0 1rem 0' 
            }}>
              Gestión de Tickets
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1rem', 
              margin: '0 0 1.5rem 0' 
            }}>
              Consultar y descargar archivos procesados
            </p>
            <div style={{ textAlign: 'left', color: '#374151' }}>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>Consultar estado de tickets</li>
                <li>Descargar archivos generados</li>
                <li>Historial de operaciones</li>
                <li>Seguimiento de procesos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Gestión de Ventas */}
        <div
          onClick={() => navigate('/sire/rvie/ventas')}
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            border: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
            <h3 style={{ 
              color: '#3b82f6', 
              fontSize: '1.3rem', 
              margin: '0 0 1rem 0' 
            }}>
              Gestión de Ventas
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1rem', 
              margin: '0 0 1.5rem 0' 
            }}>
              Analizar comprobantes y estadísticas
            </p>
            <div style={{ textAlign: 'left', color: '#374151' }}>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>Visualizar comprobantes</li>
                <li>Estadísticas por período</li>
                <li>Filtros avanzados</li>
                <li>Exportar reportes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RvieHomePage;
