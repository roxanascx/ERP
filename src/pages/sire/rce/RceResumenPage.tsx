/**
 * Página de Resumen RCE
 * Descargar reportes de período completo
 * URL: /sire/rce/resumen
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import { rceDataService } from '../../../services/rceDataService';
import RceDataManagementDashboard from '../../../components/sire/rce/RceDataManagementDashboard';
import type { RceComprobantesDetalladosResponse } from '../../../types/rce';

interface ResumenData {
  totalRegistros: number;
  resumenPeriodo: any;
  archivosDisponibles: any[];
}

type VistaActiva = 'resumen' | 'detallado';

const RceResumenPage: React.FC = () => {
  const navigate = useNavigate();
  const { empresaActual } = useEmpresaValidation();
  const [resumenData, setResumenData] = useState<ResumenData | null>(null);
  const [comprobantesDetallados, setComprobantesDetallados] = useState<RceComprobantesDetalladosResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetallados, setLoadingDetallados] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('resumen');
  const [showDataDashboard, setShowDataDashboard] = useState(false);
  
  // Estados separados para año y mes
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('07');
  const [selectedOpcion, setSelectedOpcion] = useState('1');

  // Generar período de 6 dígitos (YYYYMM)
  const selectedPeriod = `${selectedYear}${selectedMonth.padStart(2, '0')}`;

  // Lista de meses
  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  // Lista de años (últimos 5 años)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const consultarResumen = async () => {
    if (!empresaActual) return;

    setLoading(true);
    setError(null);

    try {
      // Usar el nuevo servicio de datos con cache inteligente
      const response = await rceDataService.obtenerResumen(empresaActual.ruc, selectedPeriod);
      
      if (response.exitoso) {
        setResumenData({
          totalRegistros: response.datos?.total_documentos || 0,
          resumenPeriodo: {
            ...response.datos,
            contenido_completo: response.contenido_completo,
            periodo: response.periodo
          },
          archivosDisponibles: []
        });
      } else {
        setError('No se encontraron datos de resumen para el período seleccionado');
        setResumenData(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error consultando resumen');
      setResumenData(null);
    } finally {
      setLoading(false);
    }
  };

  const consultarComprobantesDetallados = async () => {
    if (!empresaActual) return;

    setLoadingDetallados(true);
    setError(null);

    try {
      // Usar el servicio normal (ahora con cache deshabilitado por defecto)
      const response = await rceDataService.obtenerComprobantesDetallados(
        empresaActual.ruc, 
        selectedPeriod
      );
      
      if (response.exitoso) {
        setComprobantesDetallados(response);
      } else {
        setError('No se encontraron comprobantes detallados para el período seleccionado');
        setComprobantesDetallados(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error consultando comprobantes detallados');
      setComprobantesDetallados(null);
    } finally {
      setLoadingDetallados(false);
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
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowDataDashboard(true)}
              style={{
                background: '#10b981',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🚀 Gestión Avanzada
            </button>
            
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
          {/* Selector de Año */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Año:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.9rem',
                minWidth: '80px'
              }}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Selector de Mes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Mes:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.9rem',
                minWidth: '120px'
              }}
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mostrar período calculado */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: '#f3f4f6',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            <label style={{ fontWeight: 'bold', color: '#374151' }}>Período:</label>
            <span style={{ 
              fontWeight: 'bold', 
              color: '#1f2937',
              fontFamily: 'monospace'
            }}>
              {selectedPeriod}
            </span>
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

        {/* Toggle de Vistas */}
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Vista:</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setVistaActiva('resumen')}
              style={{
                background: vistaActiva === 'resumen' ? '#3b82f6' : '#e5e7eb',
                color: vistaActiva === 'resumen' ? 'white' : '#374151',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: vistaActiva === 'resumen' ? 'bold' : 'normal'
              }}
            >
              📊 Vista Resumen
            </button>
            <button
              onClick={() => {
                setVistaActiva('detallado');
                if (!comprobantesDetallados && !loadingDetallados) {
                  consultarComprobantesDetallados();
                }
              }}
              style={{
                background: vistaActiva === 'detallado' ? '#3b82f6' : '#e5e7eb',
                color: vistaActiva === 'detallado' ? 'white' : '#374151',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: vistaActiva === 'detallado' ? 'bold' : 'normal'
              }}
            >
              📋 Vista Detallada
            </button>
          </div>
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

        {!loading && !resumenData && !error && vistaActiva === 'resumen' && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3>No hay datos de resumen</h3>
            <p>No se encontraron datos para el período {selectedPeriod}</p>
          </div>
        )}

        {/* Vista Resumen */}
        {!loading && resumenData && vistaActiva === 'resumen' && (
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
              
              <div style={{
                background: '#f0f9ff',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {resumenData.resumenPeriodo?.total_cp ? `S/ ${resumenData.resumenPeriodo.total_cp}` : 'N/A'}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total CP</div>
              </div>
            </div>

            {/* Tabla de Resumen Detallado estilo SUNAT */}
            {resumenData.resumenPeriodo && resumenData.resumenPeriodo.contenido_completo && (
              <div style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  � Resumen Detallado por Tipo de Documento
                </h3>
                
                {(() => {
                  const contenido = resumenData.resumenPeriodo.contenido_completo;
                  const lineas = contenido.split('\n').filter((linea: string) => linea.trim() !== '');
                  
                  if (lineas.length === 0) return null;
                  
                  // Primera línea son los headers
                  const headers = lineas[0].split('|').map((h: string) => h.trim());
                  
                  // Separar facturas individuales del total
                  const todasLasFilas = lineas.slice(1).map((linea: string) => 
                    linea.split('|').map((celda: string) => celda.trim())
                  );
                  
                  // Filtrar solo las facturas (excluir TOTAL)
                  const facturas = todasLasFilas.filter((fila: string[]) => 
                    !fila[0] || !fila[0].toUpperCase().includes('TOTAL')
                  );

                  // Mapeo de headers más legibles
                  const headersLegibles = headers.map((header: string) => {
                    const mapa: { [key: string]: string } = {
                      'Tipo de Documento': 'Tipo Doc.',
                      'Total Documentos': 'Cant.',
                      'BI Gravado DG': 'BI Gravado',
                      'IGV / IPM DG': 'IGV',
                      'BI Gravado DGNG': 'BI Grav. DGNG',
                      'IGV / IPM DGNG': 'IGV DGNG',
                      'BI Gravado DNG': 'BI Grav. DNG',
                      'IGV / IPM DNG': 'IGV DNG',
                      'Valor Adq. NG': 'Valor No Grav.',
                      'ISC': 'ISC',
                      'ICBPER': 'ICBPER',
                      'Otros Trib/ Cargos': 'Otros Tributos',
                      'Total CP': 'Total'
                    };
                    return mapa[header] || header;
                  });
                  
                  return (
                    <>
                      {/* Información sobre los comprobantes encontrados */}
                      {facturas.length > 0 && (
                        <div style={{ 
                          background: '#e0f2fe', 
                          padding: '12px', 
                          borderRadius: '8px', 
                          marginBottom: '1rem',
                          border: '1px solid #0891b2'
                        }}>
                          <p style={{ margin: 0, color: '#0e7490', fontSize: '0.9rem', fontWeight: '500' }}>
                            📄 Se encontraron <strong>{facturas.length}</strong> comprobante(s) individual(es) para el período {resumenData.resumenPeriodo.periodo}
                          </p>
                        </div>
                      )}

                      {/* Tabla de Facturas Individuales */}
                      {facturas.length > 0 && (
                        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
                          <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            background: 'white',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}>
                            <thead>
                              <tr style={{ background: '#1e40af', color: 'white' }}>
                                {headersLegibles.map((header: string, index: number) => (
                                  <th key={index} style={{
                                    padding: '12px 8px',
                                    textAlign: index === 0 ? 'left' : 'center',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    borderRight: index < headersLegibles.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                                  }}>
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {facturas.map((fila: string[], rowIndex: number) => (
                                <tr key={rowIndex} style={{
                                  background: rowIndex % 2 === 0 ? '#f8fafc' : 'white',
                                  borderBottom: '1px solid #e2e8f0',
                                  transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#e0f2fe'}
                                onMouseLeave={(e) => e.currentTarget.style.background = rowIndex % 2 === 0 ? '#f8fafc' : 'white'}
                                >
                                  {fila.map((celda: string, cellIndex: number) => (
                                    <td key={cellIndex} style={{
                                      padding: '10px 8px',
                                      fontSize: '0.8rem',
                                      borderRight: cellIndex < fila.length - 1 ? '1px solid #e2e8f0' : 'none',
                                      color: '#374151',
                                      textAlign: cellIndex === 0 ? 'left' : 'right',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {/* Formatear números monetarios */}
                                      {cellIndex === 0 
                                        ? celda // Texto para "Tipo de Documento"
                                        : cellIndex === 1 
                                          ? celda // Número entero para "Cantidad"
                                          : !isNaN(parseFloat(celda))
                                            ? `S/ ${parseFloat(celda).toFixed(2)}`
                                            : celda
                                      }
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  );
                })()}
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

        {/* Vista Detallada */}
        {vistaActiva === 'detallado' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#374151' }}>
              📋 Comprobantes Detallados - Período {selectedPeriod}
            </h2>

            {loadingDetallados && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p>Descargando comprobantes detallados de SUNAT...</p>
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  Este proceso puede tomar unos minutos...
                </p>
              </div>
            )}

            {!loadingDetallados && !comprobantesDetallados && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <h3>No hay comprobantes detallados</h3>
                <p>Haz clic en "Vista Detallada" para cargar los comprobantes</p>
                <button
                  onClick={consultarComprobantesDetallados}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}
                >
                  🔄 Cargar Comprobantes Detallados
                </button>
              </div>
            )}

            {!loadingDetallados && comprobantesDetallados && comprobantesDetallados.exitoso && (
              <div>
                {/* Información del resultado */}
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <p style={{ margin: 0, color: '#0c4a6e', fontSize: '0.9rem' }}>
                    ✅ <strong>{comprobantesDetallados.total_comprobantes}</strong> comprobantes encontrados
                    {comprobantesDetallados.ticket && (
                      <span style={{ marginLeft: '1rem' }}>
                        🎫 Ticket: {comprobantesDetallados.ticket}
                      </span>
                    )}
                  </p>
                </div>

                {/* Tabla de comprobantes detallados */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    background: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <thead>
                      <tr style={{ background: '#1e40af', color: 'white' }}>
                        <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' }}>
                          RUC Proveedor
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' }}>
                          Razón Social
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                          Tipo Doc.
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                          Serie
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                          Número
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                          Fecha Emisión
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>
                          Base Imponible
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>
                          IGV
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>
                          Valor No Gravado
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comprobantesDetallados.comprobantes.map((comprobante, index) => (
                        <tr 
                          key={index}
                          style={{
                            background: index % 2 === 0 ? '#f8fafc' : 'white',
                            borderBottom: '1px solid #e2e8f0'
                          }}
                        >
                          <td style={{ padding: '10px 8px', fontSize: '0.8rem', color: '#374151' }}>
                            {comprobante.ruc_proveedor}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '0.8rem', color: '#374151' }}>
                            {comprobante.razon_social_proveedor}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '0.8rem', color: '#374151', textAlign: 'center' }}>
                            {comprobante.tipo_documento}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '0.8rem', color: '#374151', textAlign: 'center' }}>
                            {comprobante.serie_comprobante}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '0.8rem', color: '#374151', textAlign: 'center' }}>
                            {comprobante.numero_comprobante}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '0.8rem', color: '#374151', textAlign: 'center' }}>
                            {comprobante.fecha_emision}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '0.8rem', color: '#374151', textAlign: 'right' }}>
                            S/ {comprobante.base_imponible_gravada.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '0.8rem', color: '#374151', textAlign: 'right' }}>
                            S/ {comprobante.igv.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '0.8rem', color: '#374151', textAlign: 'right' }}>
                            S/ {comprobante.valor_adquisicion_no_gravada.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '0.8rem', color: '#374151', textAlign: 'right', fontWeight: 'bold' }}>
                            S/ {comprobante.importe_total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totales */}
                {comprobantesDetallados.totales && (
                  <div style={{
                    background: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginTop: '1.5rem',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>
                      🧮 Totales del Período
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem'
                    }}>
                      <div>
                        <strong>Base Imponible:</strong>
                        <div style={{ fontSize: '1.2rem', color: '#059669', fontWeight: 'bold' }}>
                          S/ {comprobantesDetallados.totales.total_base_imponible.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <strong>IGV:</strong>
                        <div style={{ fontSize: '1.2rem', color: '#dc2626', fontWeight: 'bold' }}>
                          S/ {comprobantesDetallados.totales.total_igv.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <strong>Total General:</strong>
                        <div style={{ fontSize: '1.2rem', color: '#1f2937', fontWeight: 'bold' }}>
                          S/ {comprobantesDetallados.totales.total_general.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loadingDetallados && comprobantesDetallados && !comprobantesDetallados.exitoso && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '1rem',
                borderRadius: '8px',
                color: '#dc2626'
              }}>
                <strong>❌ Error:</strong> {comprobantesDetallados.mensaje}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dashboard de Gestión Avanzada de Datos */}
      {showDataDashboard && empresaActual && (
        <RceDataManagementDashboard
          ruc={empresaActual.ruc}
          periodo={selectedPeriod}
          onClose={() => setShowDataDashboard(false)}
        />
      )}
    </div>
  );
};

export default RceResumenPage;
