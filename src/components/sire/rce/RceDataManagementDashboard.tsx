/**
 * 📊 Dashboard de Gestión Avanzada de Datos RCE
 * Muestra estadísticas, salud de datos y permite gestión completa
 */

import React, { useState, useEffect } from 'react';
import { rceDataManagementApi } from '../../../services/rceDataManagementApi';
import type { 
  RceResumenAvanzado, 
  RceEstadisticasProveedor, 
  RceSaludDatos,
  RceLogOperacion 
} from '../../../services/rceDataManagementApi';

interface Props {
  ruc: string;
  periodo: string;
  onClose: () => void;
}

const RceDataManagementDashboard: React.FC<Props> = ({ ruc, periodo, onClose }) => {
  const [resumen, setResumen] = useState<RceResumenAvanzado | null>(null);
  const [proveedores, setProveedores] = useState<RceEstadisticasProveedor[]>([]);
  const [saludDatos, setSaludDatos] = useState<RceSaludDatos | null>(null);
  const [logs, setLogs] = useState<RceLogOperacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumen' | 'proveedores' | 'salud' | 'logs'>('resumen');

  useEffect(() => {
    cargarDatos();
  }, [ruc, periodo]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resumenData, proveedoresData, saludData, logsData] = await Promise.all([
        rceDataManagementApi.obtenerResumenAvanzado(ruc, periodo).catch(() => null),
        rceDataManagementApi.obtenerEstadisticasProveedores(ruc, periodo, 10).catch(() => ({ proveedores: [] })),
        rceDataManagementApi.obtenerSaludDatos(ruc, periodo).catch(() => null),
        rceDataManagementApi.obtenerLogsPeriodo(ruc, periodo, 0, 20).catch(() => ({ logs: [] }))
      ]);

      setResumen(resumenData);
      setProveedores(proveedoresData.proveedores);
      setSaludDatos(saludData);
      setLogs(logsData.logs);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const validarPeriodo = async () => {
    try {
      const resultado = await rceDataManagementApi.validarComprobantesPeriodo(ruc, periodo);
      alert(`Validación iniciada: ${resultado.message}`);
      // Recargar datos después de un tiempo
      setTimeout(cargarDatos, 3000);
    } catch (error) {
      console.error('Error validando período:', error);
      alert('Error al iniciar validación');
    }
  };

  const getSaludColor = (score: number) => {
    if (score >= 80) return '#10b981';  // Verde
    if (score >= 60) return '#f59e0b';  // Amarillo
    return '#ef4444';  // Rojo
  };

  const getSaludStatus = (status: string) => {
    const statusMap = {
      'healthy': '✅ Saludable',
      'warning': '⚠️ Advertencia',
      'critical': '🚨 Crítico',
      'error': '❌ Error'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
          <p>Cargando dashboard de gestión de datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
              📊 Gestión Avanzada de Datos RCE
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
              RUC: {ruc} • Período: {periodo}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={validarPeriodo}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ✅ Validar Período
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          background: '#f8f9fa'
        }}>
          {[
            { key: 'resumen', label: '📊 Resumen', icon: '📊' },
            { key: 'proveedores', label: '🏢 Proveedores', icon: '🏢' },
            { key: 'salud', label: '🏥 Salud', icon: '🏥' },
            { key: 'logs', label: '📋 Logs', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                background: activeTab === tab.key ? 'white' : 'transparent',
                border: 'none',
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab.key ? '#3b82f6' : '#6b7280',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem 2rem'
        }}>
          {activeTab === 'resumen' && (
            <div>
              <h3 style={{ marginTop: 0 }}>📊 Resumen del Período</h3>
              {resumen ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}>📄 Comprobantes</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#0c4a6e' }}>
                      {(resumen.total_comprobantes || 0).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>🏢 Proveedores</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#14532d' }}>
                      {(resumen.total_proveedores || 0).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ background: '#fefce8', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>💰 Importe Total</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#78350f' }}>
                      S/. {(resumen.total_importe_periodo || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div style={{ background: '#fdf2f8', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fce7f3' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#be185d' }}>🧾 IGV Total</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#9d174d' }}>
                      S/. {(resumen.total_igv_periodo || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>📝 Funcionalidad en desarrollo - Los datos se mostrarán aquí una vez implementada la lógica completa</p>
              )}
            </div>
          )}

          {activeTab === 'proveedores' && (
            <div>
              <h3 style={{ marginTop: 0 }}>🏢 Top Proveedores</h3>
              {proveedores.length > 0 ? (
                <div style={{ background: '#f8f9fa', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#e9ecef' }}>
                      <tr>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>RUC</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Razón Social</th>
                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Comprobantes</th>
                        <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Importe Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proveedores.map((proveedor, index) => (
                        <tr key={proveedor.ruc_proveedor} style={{ background: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                          <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                            {proveedor.ruc_proveedor}
                          </td>
                          <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                            {proveedor.razon_social}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                            {proveedor.total_comprobantes}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                            S/. {proveedor.total_importe.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>📝 Funcionalidad en desarrollo - Las estadísticas de proveedores se mostrarán aquí</p>
              )}
            </div>
          )}

          {activeTab === 'salud' && (
            <div>
              <h3 style={{ marginTop: 0 }}>🏥 Estado de Salud de los Datos</h3>
              {saludDatos ? (
                <div>
                  <div style={{
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    padding: '2rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '4rem',
                      fontWeight: 'bold',
                      color: getSaludColor(saludDatos.health_score),
                      marginBottom: '0.5rem'
                    }}>
                      {saludDatos.health_score}%
                    </div>
                    <div style={{ fontSize: '1.2rem', color: '#374151', marginBottom: '1rem' }}>
                      {getSaludStatus(saludDatos.status)}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '2rem',
                      marginTop: '1rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>
                          {saludDatos.summary.total_comprobantes}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Comprobantes</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>
                          {saludDatos.summary.total_proveedores}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Proveedores</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#374151' }}>
                          S/. {saludDatos.summary.total_importe.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Importe Total</div>
                      </div>
                    </div>
                  </div>

                  {saludDatos.issues.length > 0 && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px' }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#dc2626' }}>⚠️ Problemas Detectados</h4>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#7f1d1d' }}>
                        {saludDatos.issues.map((issue, index) => (
                          <li key={index} style={{ marginBottom: '0.5rem' }}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>📝 Funcionalidad en desarrollo - El estado de salud se mostrará aquí</p>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <h3 style={{ marginTop: 0 }}>📋 Registro de Operaciones</h3>
              {logs.length > 0 ? (
                <div style={{ background: '#f8f9fa', borderRadius: '8px', overflow: 'hidden' }}>
                  {logs.map((log, index) => (
                    <div
                      key={log.id}
                      style={{
                        padding: '1rem',
                        borderBottom: index < logs.length - 1 ? '1px solid #dee2e6' : 'none',
                        background: index % 2 === 0 ? 'white' : '#f8f9fa'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '0.25rem' }}>
                            {log.operacion}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            {log.detalle}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                            {new Date(log.timestamp).toLocaleString('es-PE')}
                            {log.usuario && ` • Usuario: ${log.usuario}`}
                          </div>
                        </div>
                        <div style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          background: log.resultado === 'exitoso' ? '#dcfce7' : 
                                     log.resultado === 'error' ? '#fef2f2' : '#fef3c7',
                          color: log.resultado === 'exitoso' ? '#166534' : 
                                 log.resultado === 'error' ? '#dc2626' : '#92400e'
                        }}>
                          {log.resultado === 'exitoso' ? '✅' : log.resultado === 'error' ? '❌' : '⚠️'} {log.resultado.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>📝 Funcionalidad en desarrollo - Los logs de operaciones se mostrarán aquí</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RceDataManagementDashboard;
