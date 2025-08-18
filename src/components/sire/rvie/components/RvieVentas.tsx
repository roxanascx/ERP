/**
 * Componente para gestionar las ventas e ingresos
 * Visualización, análisis y gestión de comprobantes
 * ACTUALIZADO: Usa consulta directa a SUNAT
 */

import { useState, useEffect } from 'react';
import { rvieVentasService } from '../../../../services/sire';
import type { RvieComprobante } from '../../../../types/sire';
import './rvie-components.css';

interface RvieVentasProps {
  ruc: string;
  periodo: { año: string; mes: string };
  authStatus: any;
  loading: boolean;
}

interface VentasStats {
  total_comprobantes: number;
  total_monto: number;
  por_tipo: Record<string, { cantidad: number; monto: number }>;
  por_estado: Record<string, number>;
}

interface ComprobanteVenta {
  ruc_emisor: string;
  tipo_comprobante: string;
  serie: string;
  numero: string;
  fecha_emision: string;
  moneda?: string;
  importe_total: number;
  base_imponible?: number;
  igv?: number;
  exonerado?: number;
  inafecto?: number;
  estado?: string;
  observaciones?: string;
  fecha_consulta?: string;
}

export default function RvieVentas({
  ruc,
  periodo,
  authStatus,
  loading
}: RvieVentasProps) {
  console.log('💰 [RvieVentas] Renderizando con:', { ruc, periodo, authStatus, loading });

  const [comprobantes, setComprobantes] = useState<ComprobanteVenta[]>([]);
  const [loadingComprobantes, setLoadingComprobantes] = useState(false);
  const [stats, setStats] = useState<VentasStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  
  const [filtros, setFiltros] = useState({
    tipo_comprobante: '',
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    monto_min: '',
    monto_max: ''
  });

  // Cargar comprobantes cuando cambie el período
  useEffect(() => {
    const cargarDatos = async () => {
      if (!authStatus?.authenticated) {
        console.log('⚠️ [RvieVentas] No autenticado, no se cargan comprobantes');
        setError('No se ha autenticado con SUNAT. Las funciones de ventas requieren autenticación.');
        return;
      }

      try {
        setLoadingComprobantes(true);
        setError(null);
        
        const periodoFormateado = `${periodo.año}${periodo.mes.padStart(2, '0')}`;
        console.log('📅 [RvieVentas] Cargando datos para período:', periodoFormateado);
        
        // Primero intentar obtener comprobantes existentes
        let comprobantesData = await rvieVentasService.obtenerComprobantesVentas(ruc, periodoFormateado);
        
        if (comprobantesData.length === 0) {
          console.log('📥 [RvieVentas] No hay datos en cache, consultando SUNAT...');
          
          // Si no hay datos, consultar directamente desde SUNAT
          const resumenSunat = await rvieVentasService.consultarResumenSunat(ruc, periodoFormateado, 1);
          
          if (resumenSunat.estado_consulta === 'EXITOSO') {
            comprobantesData = resumenSunat.comprobantes;
            setUltimaActualizacion(new Date(resumenSunat.fecha_consulta));
          } else if (resumenSunat.estado_consulta === 'SIN_DATOS') {
            setError(`No hay datos de ventas disponibles para el período ${periodo.mes}/${periodo.año}. 
                     Para obtener datos, debe: 
                     1. Ir a "Operaciones RVIE" 
                     2. Descargar la propuesta para este período
                     3. Volver a "Gestión de Ventas"`);
            comprobantesData = [];
          } else {
            setError(`Error consultando datos: ${resumenSunat.mensaje}`);
            comprobantesData = [];
          }
        } else {
          setUltimaActualizacion(new Date());
        }
        
        setComprobantes(comprobantesData);
        calcularEstadisticas(comprobantesData);
        
      } catch (error: any) {
        console.error('❌ [RvieVentas] Error cargando comprobantes:', error);
        setError(`Error cargando datos de ventas: ${error.message || 'Error desconocido'}`);
        setComprobantes([]);
        setStats(null);
      } finally {
        setLoadingComprobantes(false);
      }
    };

    if (ruc && periodo.año && periodo.mes) {
      cargarDatos();
    }
  }, [ruc, periodo, authStatus?.authenticated]);

  // Función para actualizar datos desde SUNAT
  const actualizarDesdeSunat = async () => {
    try {
      setLoadingComprobantes(true);
      setError(null);
      
      const periodoFormateado = `${periodo.año}${periodo.mes.padStart(2, '0')}`;
      console.log('🔄 [RvieVentas] Actualizando desde SUNAT para período:', periodoFormateado);
      
      const resumenActualizado = await rvieVentasService.actualizarDesdeSunat(ruc, periodoFormateado, [1, 4, 5]);
      
      if (resumenActualizado.estado_consulta === 'EXITOSO') {
        setComprobantes(resumenActualizado.comprobantes);
        calcularEstadisticas(resumenActualizado.comprobantes);
        setUltimaActualizacion(new Date(resumenActualizado.fecha_consulta));
      } else {
        setError(`Error actualizando datos: ${resumenActualizado.mensaje}`);
      }
      
    } catch (error: any) {
      console.error('❌ [RvieVentas] Error actualizando desde SUNAT:', error);
      setError(`Error actualizando desde SUNAT: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoadingComprobantes(false);
    }
  };

  const calcularEstadisticas = (datos: ComprobanteVenta[]) => {
    if (datos.length === 0) {
      setStats(null);
      return;
    }

    const statsCalculadas: VentasStats = {
      total_comprobantes: datos.length,
      total_monto: 0,
      por_tipo: {},
      por_estado: {}
    };

    datos.forEach(comp => {
      // Sumar monto total
      statsCalculadas.total_monto += comp.importe_total || 0;
      
      // Agrupar por tipo
      const tipo = comp.tipo_comprobante || 'DESCONOCIDO';
      if (!statsCalculadas.por_tipo[tipo]) {
        statsCalculadas.por_tipo[tipo] = { cantidad: 0, monto: 0 };
      }
      statsCalculadas.por_tipo[tipo].cantidad++;
      statsCalculadas.por_tipo[tipo].monto += comp.importe_total || 0;
      
      // Agrupar por estado
      const estado = comp.estado || 'PROCESADO';
      statsCalculadas.por_estado[estado] = (statsCalculadas.por_estado[estado] || 0) + 1;
    });

    setStats(statsCalculadas);
    console.log('📊 [RvieVentas] Estadísticas calculadas:', statsCalculadas);
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto);
  };

  const filtrarComprobantes = () => {
    return comprobantes.filter(comp => {
      if (filtros.tipo_comprobante && comp.tipo_comprobante !== filtros.tipo_comprobante) return false;
      if (filtros.estado && comp.estado !== filtros.estado) return false;
      if (filtros.monto_min && comp.importe_total < parseFloat(filtros.monto_min)) return false;
      if (filtros.monto_max && comp.importe_total > parseFloat(filtros.monto_max)) return false;
      return true;
    });
  };

  const actualizarDatos = async () => {
    if (!authStatus?.authenticated) {
      alert('Debe autenticarse primero para actualizar los datos');
      return;
    }

    try {
      setLoadingComprobantes(true);
      const periodoStr = `${periodo.año}${periodo.mes.padStart(2, '0')}`;
      const comprobantesData = await cargarComprobantes(periodoStr);
      setComprobantes(comprobantesData || []);
    } catch (error) {
      console.error('Error actualizando datos:', error);
      alert('Error al actualizar los datos');
    } finally {
      setLoadingComprobantes(false);
    }
  };

  const comprobantesFiltrados = filtrarComprobantes();

  return (
    <div className="rvie-ventas">
      <h3>💰 Gestión de Ventas e Ingresos</h3>

      {/* Mensaje de error si hay alguno */}
      {error && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          whiteSpace: 'pre-line'
        }}>
          <h5 style={{ color: '#92400e', margin: '0 0 0.5rem 0' }}>⚠️ Información</h5>
          <p style={{ color: '#92400e', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Información del período actual */}
      <div className="periodo-info" style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '1rem' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4>📅 Período Actual: {periodo.mes}/{periodo.año}</h4>
            <p>RUC: {ruc}</p>
            <p>Estado de autenticación: {authStatus?.authenticated ? '✅ Autenticado' : '❌ No autenticado'}</p>
            {ultimaActualizacion && (
              <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                Última actualización: {ultimaActualizacion.toLocaleString('es-PE')}
              </p>
            )}
          </div>
          
          {/* Botón de actualización */}
          <button
            onClick={actualizarDesdeSunat}
            disabled={loadingComprobantes || !authStatus?.authenticated}
            style={{
              background: loadingComprobantes ? '#6b7280' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: loadingComprobantes ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loadingComprobantes ? '⏳ Actualizando...' : '🔄 Actualizar desde SUNAT'}
          </button>
        </div>
        
        {(loading || loadingComprobantes) && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ 
              background: '#e5e7eb', 
              borderRadius: '4px', 
              height: '4px', 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                background: '#3b82f6', 
                height: '100%', 
                animation: 'progress 2s ease-in-out infinite',
                width: '30%'
              }}></div>
            </div>
            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
              ⏳ Consultando datos desde SUNAT...
            </p>
          </div>
        )}
      </div>

      {/* Estadísticas Generales */}
      {stats ? (
        <div className="stats-section">
          <h4>📊 Resumen del Período {periodo.mes}/{periodo.año}</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total_comprobantes}</div>
              <div className="stat-label">Total Comprobantes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatMonto(stats.total_monto)}</div>
              <div className="stat-label">Monto Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Object.keys(stats.por_tipo).length}</div>
              <div className="stat-label">Tipos de Comprobante</div>
            </div>
          </div>

          {/* Estadísticas por tipo */}
          <div className="tipo-stats">
            <h5>Por Tipo de Comprobante:</h5>
            <div className="tipo-grid">
              {Object.entries(stats.por_tipo).map(([tipo, data]) => (
                <div key={tipo} className="tipo-item">
                  <strong>{tipo}:</strong> {data.cantidad} docs - {formatMonto(data.monto)}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-ventas" style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4>📋 No hay datos de ventas disponibles</h4>
          <p>Para ver los comprobantes de ventas del período <strong>{periodo.mes}/{periodo.año}</strong>, debe:</p>
          <ol style={{ textAlign: 'left', display: 'inline-block', marginBottom: '1.5rem' }}>
            <li>🔐 Autenticarse con SUNAT (✅ Completado)</li>
            <li>📥 <strong>Descargar la propuesta RVIE</strong> para el período</li>
            <li>📊 Procesar los comprobantes del período</li>
          </ol>
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '6px',
            border: '1px solid #2196f3'
          }}>
            <h5>💡 ¿Cómo descargar la propuesta?</h5>
            <p style={{ marginBottom: '0.5rem' }}>Vaya a la pestaña <strong>"Operaciones RVIE"</strong> y:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block', margin: 0 }}>
              <li>Seleccione el período <strong>{periodo.mes}/{periodo.año}</strong></li>
              <li>Haga clic en <strong>"Descargar Propuesta"</strong></li>
              <li>Espere a que se procese y descargue</li>
              <li>Regrese aquí para ver los comprobantes</li>
            </ul>
          </div>
          
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '6px' }}>
            <h5>� Funcionalidades una vez descargada:</h5>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>Visualización de todos los comprobantes</li>
              <li>Estadísticas por tipo y estado</li>
              <li>Filtros avanzados por fecha y monto</li>
              <li>Exportación de reportes</li>
            </ul>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-section">
        <h4>🔍 Filtros</h4>
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>Tipo de Comprobante:</label>
            <select
              value={filtros.tipo_comprobante}
              onChange={(e) => setFiltros(prev => ({ ...prev, tipo_comprobante: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="01">Factura</option>
              <option value="03">Boleta</option>
              <option value="07">Nota de Crédito</option>
              <option value="08">Nota de Débito</option>
            </select>
          </div>

          <div className="filtro-group">
            <label>Estado:</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="VALIDO">Válido</option>
              <option value="RECHAZADO">Rechazado</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>

          <div className="filtro-group">
            <label>Monto Mínimo:</label>
            <input
              type="number"
              step="0.01"
              value={filtros.monto_min}
              onChange={(e) => setFiltros(prev => ({ ...prev, monto_min: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div className="filtro-group">
            <label>Monto Máximo:</label>
            <input
              type="number"
              step="0.01"
              value={filtros.monto_max}
              onChange={(e) => setFiltros(prev => ({ ...prev, monto_max: e.target.value }))}
              placeholder="Sin límite"
            />
          </div>
        </div>
      </div>

      {/* Lista de Comprobantes */}
      <div className="comprobantes-section">
        <h4>📋 Comprobantes ({comprobantesFiltrados.length})</h4>
        
        {comprobantesFiltrados.length === 0 ? (
          <div className="empty-comprobantes">
            <p>📭 No se encontraron comprobantes con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="comprobantes-table">
            <div className="table-header">
              <div>Tipo</div>
              <div>Serie-Número</div>
              <div>Fecha</div>
              <div>RUC Emisor</div>
              <div>Moneda</div>
              <div>Importe</div>
              <div>Estado</div>
            </div>
            
            {comprobantesFiltrados.map((comp, index) => (
              <div key={index} className="table-row">
                <div>{comp.tipo_comprobante}</div>
                <div>{comp.serie}-{comp.numero}</div>
                <div>{new Date(comp.fecha_emision).toLocaleDateString('es-PE')}</div>
                <div>{comp.ruc_emisor}</div>
                <div>{comp.moneda}</div>
                <div className="monto">{formatMonto(comp.importe_total)}</div>
                <div className={`estado estado-${comp.estado?.toLowerCase()}`}>
                  {comp.estado || 'Sin estado'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      {comprobantes.length > 0 && (
        <div className="acciones-ventas" style={{ 
          marginTop: '2rem',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button 
            className="btn-primary" 
            disabled={loading || loadingComprobantes}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            📊 Exportar Reporte
          </button>
          
          <button 
            className="btn-secondary" 
            disabled={loading || loadingComprobantes}
            onClick={actualizarDesdeSunat}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Actualizar desde SUNAT
          </button>
          
          <button 
            className="btn-secondary" 
            disabled={loading || loadingComprobantes}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            📤 Ver en SUNAT
          </button>
        </div>
      )}
    </div>
  );
}
