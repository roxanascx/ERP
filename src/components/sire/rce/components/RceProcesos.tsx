/**
 * Componente RceProcesos
 * Gestión y monitoreo de procesos RCE
 */

import React, { useState, useEffect } from 'react';
import { useRceProcesos } from '../../../../hooks/useRceProcesos';
import type { Empresa } from '../../../../types/empresa';
import type { RceProceso, RceEstadoProceso } from '../../../../types/rce';

// ========================================
// INTERFACES
// ========================================

interface RceProcesosProps {
  company: Empresa;
}

interface ProcesoCardProps {
  proceso: RceProceso;
  onCancelar: (proceso: RceProceso) => void;
  onReiniciar: (proceso: RceProceso) => void;
  onDescargar: (proceso: RceProceso) => void;
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================

const ProcesoCard: React.FC<ProcesoCardProps> = ({
  proceso,
  onCancelar,
  onReiniciar,
  onDescargar
}) => {
  const getEstadoColor = (estado: RceEstadoProceso): string => {
    const colores: Record<RceEstadoProceso, string> = {
      'iniciado': '#3b82f6',
      'en_proceso': '#f59e0b',
      'completado': '#10b981',
      'cancelado': '#6b7280',
      'error': '#ef4444',
      'pendiente': '#8b5cf6'
    };
    return colores[estado] || '#6b7280';
  };

  const getEstadoIcon = (estado: RceEstadoProceso): string => {
    const iconos: Record<RceEstadoProceso, string> = {
      'iniciado': '🚀',
      'en_proceso': '⚙️',
      'completado': '✅',
      'cancelado': '❌',
      'error': '⚠️',
      'pendiente': '⏳'
    };
    return iconos[estado] || '❓';
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearTiempo = (segundos?: number): string => {
    if (!segundos) return '-';
    
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutos}m ${segs}s`;
    } else if (minutos > 0) {
      return `${minutos}m ${segs}s`;
    } else {
      return `${segs}s`;
    }
  };

  const puedeReiniciar = proceso.estado === 'error' || proceso.estado === 'cancelado';
  const puedeCancelar = proceso.estado === 'iniciado' || proceso.estado === 'en_proceso';
  const puedeDescargar = proceso.estado === 'completado' && proceso.url_descarga;

  return (
    <div className="rce-proceso-card">
      <div className="rce-proceso-header">
        <div className="rce-proceso-info">
          <div className="rce-proceso-tipo">
            <span className="rce-tipo-icon">
              {proceso.tipo_proceso === 'envio' ? '📤' : 
               proceso.tipo_proceso === 'aceptacion' ? '✅' :
               proceso.tipo_proceso === 'cancelacion' ? '❌' : '🔍'}
            </span>
            <span className="rce-tipo-label">{proceso.tipo_proceso}</span>
          </div>
          
          <div className="rce-proceso-estado">
            <span className="rce-estado-icon">{getEstadoIcon(proceso.estado)}</span>
            <span 
              className="rce-estado-badge"
              style={{ backgroundColor: getEstadoColor(proceso.estado) }}
            >
              {proceso.estado.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="rce-proceso-actions">
          {puedeDescargar && (
            <button
              onClick={() => onDescargar(proceso)}
              className="rce-btn-action rce-btn-download"
              title="Descargar archivos"
            >
              💾
            </button>
          )}
          
          {puedeCancelar && (
            <button
              onClick={() => onCancelar(proceso)}
              className="rce-btn-action rce-btn-cancel"
              title="Cancelar proceso"
            >
              ⏹️
            </button>
          )}
          
          {puedeReiniciar && (
            <button
              onClick={() => onReiniciar(proceso)}
              className="rce-btn-action rce-btn-restart"
              title="Reiniciar proceso"
            >
              🔄
            </button>
          )}
        </div>
      </div>

      <div className="rce-proceso-content">
        <div className="rce-proceso-periodo">
          <span className="rce-periodo-label">Periodo:</span>
          <span className="rce-periodo-value">{proceso.periodo}</span>
        </div>

        {proceso.ticket_id && (
          <div className="rce-proceso-ticket">
            <span className="rce-ticket-label">Ticket:</span>
            <span className="rce-ticket-value">{proceso.ticket_id}</span>
          </div>
        )}

        {/* Barra de progreso */}
        <div className="rce-proceso-progreso">
          <div className="rce-progreso-header">
            <span className="rce-progreso-label">Progreso:</span>
            <span className="rce-progreso-porcentaje">{proceso.porcentaje_avance}%</span>
          </div>
          <div className="rce-progreso-bar">
            <div 
              className="rce-progreso-fill"
              style={{ 
                width: `${proceso.porcentaje_avance}%`,
                backgroundColor: getEstadoColor(proceso.estado)
              }}
            />
          </div>
        </div>

        {/* Estadísticas del proceso */}
        <div className="rce-proceso-stats">
          <div className="rce-stat-grid">
            <div className="rce-stat-item">
              <span className="rce-stat-label">Enviados:</span>
              <span className="rce-stat-value">{proceso.comprobantes_enviados}</span>
            </div>
            <div className="rce-stat-item">
              <span className="rce-stat-label">Aceptados:</span>
              <span className="rce-stat-value">{proceso.comprobantes_aceptados}</span>
            </div>
            <div className="rce-stat-item">
              <span className="rce-stat-label">Observados:</span>
              <span className="rce-stat-value">{proceso.comprobantes_observados}</span>
            </div>
            <div className="rce-stat-item">
              <span className="rce-stat-label">Importe:</span>
              <span className="rce-stat-value">
                {new Intl.NumberFormat('es-PE', {
                  style: 'currency',
                  currency: 'PEN',
                  notation: 'compact'
                }).format(proceso.total_importe_enviado)}
              </span>
            </div>
          </div>
        </div>

        {/* Fechas y tiempos */}
        <div className="rce-proceso-tiempos">
          <div className="rce-tiempo-item">
            <span className="rce-tiempo-label">Inicio:</span>
            <span className="rce-tiempo-value">{formatearFecha(proceso.fecha_inicio)}</span>
          </div>
          
          {proceso.fecha_fin && (
            <div className="rce-tiempo-item">
              <span className="rce-tiempo-label">Fin:</span>
              <span className="rce-tiempo-value">{formatearFecha(proceso.fecha_fin)}</span>
            </div>
          )}
          
          {proceso.tiempo_estimado && (
            <div className="rce-tiempo-item">
              <span className="rce-tiempo-label">Estimado:</span>
              <span className="rce-tiempo-value">{formatearTiempo(proceso.tiempo_estimado)}</span>
            </div>
          )}
        </div>

        {/* Mensaje de error o estado */}
        {proceso.mensaje && (
          <div className={`rce-proceso-mensaje ${proceso.exitoso ? 'success' : 'error'}`}>
            <p>{proceso.mensaje}</p>
          </div>
        )}

        {proceso.errores && proceso.errores.length > 0 && (
          <div className="rce-proceso-errores">
            <h5>Errores:</h5>
            <ul>
              {proceso.errores.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export const RceProcesos: React.FC<RceProcesosProps> = ({ company }) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [filtroEstado, setFiltroEstado] = useState<RceEstadoProceso | 'todos'>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  // ========================================
  // HOOKS
  // ========================================

  const {
    procesos,
    loading,
    error,
    clearError
  } = useRceProcesos({
    ruc: company.ruc,
    auto_refresh: true,
    refresh_interval: 5000 // 5 segundos
  });

  // Estadísticas simuladas
  const estadisticas = {
    total: procesos.length,
    en_proceso: procesos.filter(p => p.estado === 'en_proceso').length,
    completados: procesos.filter(p => p.estado === 'completado').length,
    con_errores: procesos.filter(p => p.estado === 'error').length
  };

  // Función de refrescar simulada
  const refrescar = async () => {
    // TODO: Implementar refrescar real
    console.log('Refrescando procesos...');
  };

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  // ========================================
  // FUNCIONES
  // ========================================

  const procesosFiltrados = procesos.filter(proceso => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || proceso.estado === filtroEstado;
    const cumpleFiltroTipo = filtroTipo === 'todos' || proceso.tipo_proceso === filtroTipo;
    return cumpleFiltroEstado && cumpleFiltroTipo;
  });

  const handleCancelarProceso = async (proceso: RceProceso) => {
    if (!proceso.id) return;

    const confirmacion = window.confirm(
      `¿Está seguro de cancelar el proceso ${proceso.tipo_proceso} del periodo ${proceso.periodo}?`
    );

    if (confirmacion) {
      try {
        // TODO: Implementar cancelación de proceso
        console.log('Cancelar proceso:', proceso.id);
        await refrescar();
      } catch (err) {
        console.error('Error al cancelar proceso:', err);
      }
    }
  };

  const handleReiniciarProceso = async (proceso: RceProceso) => {
    if (!proceso.id) return;

    const confirmacion = window.confirm(
      `¿Está seguro de reiniciar el proceso ${proceso.tipo_proceso} del periodo ${proceso.periodo}?`
    );

    if (confirmacion) {
      try {
        // TODO: Implementar reinicio de proceso
        console.log('Reiniciar proceso:', proceso.id);
        await refrescar();
      } catch (err) {
        console.error('Error al reiniciar proceso:', err);
      }
    }
  };

  const handleDescargarArchivos = (proceso: RceProceso) => {
    if (!proceso.url_descarga) return;

    // Abrir URL de descarga en nueva ventana
    window.open(proceso.url_descarga, '_blank');
  };

  // ========================================
  // FUNCIONES DE RENDERIZADO
  // ========================================

  const renderToolbar = () => (
    <div className="rce-procesos-toolbar">
      <div className="rce-toolbar-left">
        <h3>Procesos RCE</h3>
        
        <div className="rce-filtros">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as RceEstadoProceso | 'todos')}
            className="rce-select"
          >
            <option value="todos">Todos los estados</option>
            <option value="iniciado">Iniciado</option>
            <option value="en_proceso">En proceso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
            <option value="error">Error</option>
            <option value="pendiente">Pendiente</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="rce-select"
          >
            <option value="todos">Todos los tipos</option>
            <option value="envio">Envío</option>
            <option value="aceptacion">Aceptación</option>
            <option value="cancelacion">Cancelación</option>
            <option value="consulta">Consulta</option>
          </select>
        </div>
      </div>

      <div className="rce-toolbar-right">
        <button
          onClick={refrescar}
          disabled={loading}
          className="rce-btn rce-btn-refresh"
        >
          {loading ? '⏳' : '🔄'} Actualizar
        </button>
      </div>
    </div>
  );

  const renderEstadisticas = () => (
    <div className="rce-procesos-stats">
      <div className="rce-stat-card">
        <span className="rce-stat-label">Total</span>
        <span className="rce-stat-value">{estadisticas.total}</span>
      </div>
      <div className="rce-stat-card">
        <span className="rce-stat-label">En proceso</span>
        <span className="rce-stat-value">{estadisticas.en_proceso}</span>
      </div>
      <div className="rce-stat-card">
        <span className="rce-stat-label">Completados</span>
        <span className="rce-stat-value">{estadisticas.completados}</span>
      </div>
      <div className="rce-stat-card">
        <span className="rce-stat-label">Con errores</span>
        <span className="rce-stat-value">{estadisticas.con_errores}</span>
      </div>
    </div>
  );

  const renderProcesos = () => {
    if (procesosFiltrados.length === 0) {
      return (
        <div className="rce-empty-state">
          <div className="rce-empty-content">
            <h4>No hay procesos</h4>
            <p>
              {filtroEstado !== 'todos' || filtroTipo !== 'todos' 
                ? 'No se encontraron procesos con los filtros aplicados.'
                : 'No hay procesos RCE registrados para esta empresa.'
              }
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="rce-procesos-grid">
        {procesosFiltrados.map((proceso) => (
          <ProcesoCard
            key={proceso.id}
            proceso={proceso}
            onCancelar={handleCancelarProceso}
            onReiniciar={handleReiniciarProceso}
            onDescargar={handleDescargarArchivos}
          />
        ))}
      </div>
    );
  };

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  if (error) {
    return (
      <div className="rce-error">
        <div className="rce-error-content">
          <h3>Error en Procesos RCE</h3>
          <p>{error}</p>
          <button onClick={clearError} className="rce-btn rce-btn-retry">
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rce-procesos">
      {renderToolbar()}
      {renderEstadisticas()}
      
      {loading && procesos.length === 0 ? (
        <div className="rce-loading">
          <div className="rce-loading-spinner"></div>
          <p>Cargando procesos...</p>
        </div>
      ) : (
        renderProcesos()
      )}
    </div>
  );
};
