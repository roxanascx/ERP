/**
 * Página Principal RCE (Registro de Compras Electrónico)
 * Dashboard y navegación para operaciones RCE
 * URL: /sire/rce
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';

const RceHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { empresaActual } = useEmpresaValidation();

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
          padding: '2rem', 
          borderRadius: '12px', 
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <h2>🏢 Empresa no encontrada</h2>
          <p>Debe seleccionar una empresa para acceder al módulo RCE</p>
          <button 
            onClick={() => navigate('/empresas')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Seleccionar Empresa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '2rem' }}>
              📊 RCE - Registro de Compras Electrónico
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d' }}>
              Empresa: <strong>{empresaActual.razon_social}</strong> | RUC: <strong>{empresaActual.ruc}</strong>
            </p>
          </div>
          <button
            onClick={() => navigate('/sire')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Volver a SIRE
          </button>
        </div>
      </div>

      {/* Panel de opciones RCE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Operaciones RCE */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          border: '2px solid transparent'
        }}
        onClick={() => navigate('/sire/rce/operaciones')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.borderColor = '#007bff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'transparent';
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Operaciones RCE</h3>
            <p style={{ color: '#6c757d', lineHeight: '1.5' }}>
              Generar propuestas, enviar archivos y gestionar procesos de carga de compras
            </p>
          </div>
        </div>

        {/* Consulta de Tickets */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          border: '2px solid transparent'
        }}
        onClick={() => navigate('/sire/rce/tickets')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.borderColor = '#28a745';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'transparent';
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Consulta de Tickets</h3>
            <p style={{ color: '#6c757d', lineHeight: '1.5' }}>
              Consultar estado de procesos y descargar archivos procesados por SUNAT
            </p>
          </div>
        </div>

        {/* Resumen de Período */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          border: '2px solid transparent'
        }}
        onClick={() => navigate('/sire/rce/resumen')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.borderColor = '#ffc107';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'transparent';
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Resumen de Período</h3>
            <p style={{ color: '#6c757d', lineHeight: '1.5' }}>
              Descargar reportes consolidados y resúmenes por período tributario
            </p>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>📋 Información sobre RCE</h3>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1.5rem', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <p style={{ margin: '0 0 1rem 0', color: '#495057' }}>
            <strong>Registro de Compras Electrónico (RCE)</strong> permite a las empresas:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6c757d' }}>
            <li>Enviar información de compras directamente a SUNAT</li>
            <li>Generar propuestas de carga masiva de comprobantes</li>
            <li>Consultar el estado de procesamiento de archivos enviados</li>
            <li>Descargar reportes y archivos procesados por SUNAT</li>
            <li>Mantener la trazabilidad completa del proceso</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RceHomePage;
