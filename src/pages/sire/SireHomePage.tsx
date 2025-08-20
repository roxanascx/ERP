/**
 * Página principal del módulo SIRE
 * Dashboard general con acceso a RVIE y RCE
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmpresaValidation } from '../../hooks/useEmpresaValidation';
import BackendStatus from '../../components/BackendStatus';

const SireHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { empresaActual } = useEmpresaValidation();

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
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            🏢 Empresa no seleccionada
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Debe seleccionar una empresa antes de acceder al módulo SIRE.
          </p>
          <button
            onClick={() => navigate('/empresas')}
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
      {/* Header con información de la empresa */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              🔗 SIRE - Sistema de Información de Reportes Electrónicos
            </h1>
            <div style={{ display: 'flex', gap: '2rem', color: '#6b7280' }}>
              <span><strong>Empresa:</strong> {empresaActual.razon_social}</span>
              <span><strong>RUC:</strong> {empresaActual.ruc}</span>
              <span><strong>SIRE:</strong> ✅ Configurado</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/empresas')}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '8px 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Cambiar Empresa
          </button>
        </div>
      </div>

      {/* Módulos principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* RVIE - Registro de Ventas e Ingresos */}
        <div
          onClick={() => navigate('/sire/rvie')}
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ 
              color: '#3b82f6', 
              fontSize: '1.5rem', 
              margin: '0 0 1rem 0' 
            }}>
              RVIE
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1.1rem', 
              margin: '0 0 1.5rem 0' 
            }}>
              Registro de Ventas e Ingresos Electrónico
            </p>
            <div style={{ textAlign: 'left', color: '#374151' }}>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>Descarga de propuestas SUNAT</li>
                <li>Aceptación de propuestas</li>
                <li>Reemplazo con archivos personalizados</li>
                <li>Consulta de inconsistencias</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RCE - Registro de Compras Electrónico */}
        <div
          onClick={() => navigate('/sire/rce')}
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ 
              color: '#10b981', 
              fontSize: '1.5rem', 
              margin: '0 0 1rem 0' 
            }}>
              RCE
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1.1rem', 
              margin: '0 0 1.5rem 0' 
            }}>
              Registro de Compras Electrónico
            </p>
            <div style={{ textAlign: 'left', color: '#374151' }}>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>Gestión de compras</li>
                <li>Validación de documentos</li>
                <li>Reportes de compras</li>
                <li>Consulta de inconsistencias</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del sistema */}
      <BackendStatus />
    </div>
  );
};

export default SireHomePage;
