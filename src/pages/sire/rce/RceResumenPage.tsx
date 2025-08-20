/**
 * Página de Resumen RCE
 * Descargar reportes de período completo
 * URL: /sire/rce/resumen
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import api from '../../../services/api';

interface ResumenData {
  totalRegistros: number;
  resumenPeriodo: any;
  archivosDisponibles: any[];
}

const RceResumenPage: React.FC = () => {
  const navigate = useNavigate();
  const { empresaActual } = useEmpresaValidation();
  const [resumenData, setResumenData] = useState<ResumenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('202507');
  const [selectedOpcion, setSelectedOpcion] = useState('1');

  const consultarResumen = async () => {
    if (!empresaActual) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📊 Consultando resumen para período:', selectedPeriod);
      
      const response = await api.get('/api/v1/sire/rce/sunat/resumen', {
        params: {
          ruc: empresaActual.ruc,
          per_tributario: selectedPeriod,
          opcion: selectedOpcion
        }
      });

      console.log('✅ Respuesta de resumen:', response.data);
      
      if (response.data.exitoso) {
        setResumenData({
          totalRegistros: response.data.datos?.registros?.length || 0,
          resumenPeriodo: response.data.datos,
          archivosDisponibles: response.data.datos?.archivos || []
        });
      } else {
        setError('No se encontraron datos de resumen para el período seleccionado');
        setResumenData(null);
      }
    } catch (err: any) {
      console.error('❌ Error consultando resumen:', err);
      setError(err.response?.data?.detail || 'Error consultando resumen');
      setResumenData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    consultarResumen();
  }, [selectedPeriod, selectedOpcion, empresaActual]);

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
                Resumen
              </span>
            </div>
            
            {/* Título principal */}
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.8rem', 
              fontWeight: 'bold',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📊 Resumen de Período RCE
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

      {/* Información de la Empresa y Controles */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <strong>RUC:</strong> {empresaActual.ruc}
          </div>
          <div>
            <strong>Empresa:</strong> {empresaActual.razon_social}
          </div>
          {resumenData && (
            <div>
              <strong>Total Registros:</strong> <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{resumenData.totalRegistros}</span>
            </div>
          )}
        </div>

        {/* Controles */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Período:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.9rem'
              }}
            >
              <option value="202507">Julio 2025</option>
              <option value="202506">Junio 2025</option>
              <option value="202505">Mayo 2025</option>
              <option value="202504">Abril 2025</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Opción:</label>
            <select
              value={selectedOpcion}
              onChange={(e) => setSelectedOpcion(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.9rem'
              }}
            >
              <option value="1">Resumen General</option>
              <option value="2">Detalle Completo</option>
              <option value="3">Solo Errores</option>
            </select>
          </div>
          
          <button
            onClick={consultarResumen}
            disabled={loading}
            style={{
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '⏳ Consultando...' : '🔄 Consultar'}
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            color: '#dc2626'
          }}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Consultando resumen de período...</p>
          </div>
        )}

        {!loading && !resumenData && !error && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3>No hay datos de resumen</h3>
            <p>No se encontraron datos para el período {selectedPeriod}</p>
          </div>
        )}

        {!loading && resumenData && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#374151' }}>
              📊 Resumen del Período {selectedPeriod}
            </h2>
            
            {/* Estadísticas generales */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#f0fdf4',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{resumenData.totalRegistros}</div>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Registros</div>
              </div>
              
              <div style={{
                background: '#fef3c7',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{resumenData.archivosDisponibles.length}</div>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Archivos</div>
              </div>
              
              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedPeriod}</div>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Período</div>
              </div>
            </div>

            {/* Datos del resumen */}
            {resumenData.resumenPeriodo && (
              <div style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>📄 Datos del Período</h3>
                <pre style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.9rem',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {JSON.stringify(resumenData.resumenPeriodo, null, 2)}
                </pre>
              </div>
            )}

            {/* Archivos disponibles */}
            {resumenData.archivosDisponibles.length > 0 && (
              <div>
                <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>📁 Archivos Disponibles</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {resumenData.archivosDisponibles.map((archivo: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '1rem',
                        background: '#fafafa'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📄</span>
                        <strong>{archivo.nombre || `Archivo ${index + 1}`}</strong>
                      </div>
                      {archivo.descripcion && (
                        <p style={{ margin: '0.5rem 0 0 1.7rem', color: '#6b7280', fontSize: '0.9rem' }}>
                          {archivo.descripcion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RceResumenPage;
