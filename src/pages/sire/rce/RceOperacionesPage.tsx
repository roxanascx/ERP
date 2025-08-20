/**
 * Página de Operaciones RCE
 * Gestionar propuestas y procesos RCE
 * URL: /sire/rce/operaciones
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import { RceSunatDirecto } from '../../../components/sire/rce/RceSunatDirecto';

const RceOperacionesPage: React.FC = () => {
  const navigate = useNavigate();
  const { empresaActual } = useEmpresaValidation();
  const [activeTab, setActiveTab] = useState<'propuestas' | 'procesos' | 'archivos'>('propuestas');

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
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
              <button
                onClick={() => navigate('/sire/rce')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                RCE
              </button>
              <span style={{ color: '#6b7280' }}>›</span>
              <span style={{ color: '#374151', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Operaciones
              </span>
            </div>
            
            {/* Título principal */}
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.8rem', 
              fontWeight: 'bold',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⚙️ Operaciones RCE
            </h1>
          </div>
          
          <button
            onClick={() => navigate('/sire/rce')}
            style={{
              background: '#f3f4f6',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Volver a RCE
          </button>
        </div>
      </div>

      {/* Información de la Empresa */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>RUC:</strong> {empresaActual.ruc}
          </div>
          <div>
            <strong>Empresa:</strong> {empresaActual.razon_social}
          </div>
          <div>
            <strong>Módulo:</strong> <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Operaciones RCE</span>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button
            onClick={() => setActiveTab('propuestas')}
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
              border: 'none',
              background: activeTab === 'propuestas' ? '#8b5cf6' : 'white',
              color: activeTab === 'propuestas' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            📋 Propuestas
          </button>
          <button
            onClick={() => setActiveTab('procesos')}
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
              border: 'none',
              background: activeTab === 'procesos' ? '#8b5cf6' : 'white',
              color: activeTab === 'procesos' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            ⚙️ Procesos
          </button>
          <button
            onClick={() => setActiveTab('archivos')}
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
              border: 'none',
              background: activeTab === 'archivos' ? '#8b5cf6' : 'white',
              color: activeTab === 'archivos' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            📁 Archivos
          </button>
        </div>

        {/* Contenido de las tabs */}
        <div style={{ padding: '2rem' }}>
          {activeTab === 'propuestas' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#374151' }}>
                🚀 Generar Propuestas SUNAT
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Utiliza los endpoints directos para generar propuestas y consultar tickets de SUNAT.
              </p>
              
              {/* Componente RceSunatDirecto que ya funciona */}
              <RceSunatDirecto 
                ruc={empresaActual.ruc}
                periodo="202507"
              />
            </div>
          )}

          {activeTab === 'procesos' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#374151' }}>
                ⚙️ Gestión de Procesos
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Administra los procesos de comprobantes y registros RCE.
              </p>
              
              <div style={{
                background: '#f3f4f6',
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#6b7280' }}>🚧 En Desarrollo</h3>
                <p style={{ color: '#9ca3af' }}>
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'archivos' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#374151' }}>
                📁 Gestión de Archivos
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Cargar, procesar y descargar archivos relacionados con RCE.
              </p>
              
              <div style={{
                background: '#f3f4f6',
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#6b7280' }}>🚧 En Desarrollo</h3>
                <p style={{ color: '#9ca3af' }}>
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RceOperacionesPage;
