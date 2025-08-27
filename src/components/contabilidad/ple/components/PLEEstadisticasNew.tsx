import React from 'react';
import './PLEEstadisticas.css';

export interface PLEEstadistica {
  total_archivos: number;
  archivos_pendientes: number;
  archivos_validados: number;
  archivos_enviados: number;
  errores_recientes: number;
  ultimo_generado?: string;
  tamaño_total?: number;
  registros_totales?: number;
}

interface PLEEstadisticasProps {
  empresaId: string;
  dashboardData?: any;
  onRefresh?: () => void;
}

export const PLEEstadisticas: React.FC<PLEEstadisticasProps> = ({
  empresaId,
  dashboardData,
  onRefresh
}) => {
  // Mock data for demonstration
  const estadisticas: PLEEstadistica = {
    total_archivos: 24,
    archivos_pendientes: 2,
    archivos_validados: 20,
    archivos_enviados: 18,
    errores_recientes: 1,
    ultimo_generado: '2025-08-27',
    tamaño_total: 15728640, // 15 MB
    registros_totales: 3420
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    });
  };

  const getSuccessRate = () => {
    if (estadisticas.total_archivos === 0) return 0;
    return ((estadisticas.archivos_validados / estadisticas.total_archivos) * 100).toFixed(1);
  };

  return (
    <div className="ple-estadisticas">
      <div className="ple-estadisticas__header">
        <h3 className="ple-estadisticas__title">
          📊 Estadísticas del Sistema PLE
        </h3>
        <p className="ple-estadisticas__description">
          Resumen estadístico de archivos PLE generados y su estado actual
        </p>
      </div>

      <div className="ple-estadisticas__content">
        {/* Métricas principales */}
        <div className="ple-estadisticas__main-metrics">
          <div className="ple-metric-card ple-metric-card--primary">
            <div className="ple-metric-card__icon">📄</div>
            <div className="ple-metric-card__content">
              <div className="ple-metric-card__value">{estadisticas.total_archivos}</div>
              <div className="ple-metric-card__label">Total Archivos</div>
            </div>
          </div>

          <div className="ple-metric-card ple-metric-card--success">
            <div className="ple-metric-card__icon">✅</div>
            <div className="ple-metric-card__content">
              <div className="ple-metric-card__value">{estadisticas.archivos_validados}</div>
              <div className="ple-metric-card__label">Validados</div>
            </div>
          </div>

          <div className="ple-metric-card ple-metric-card--info">
            <div className="ple-metric-card__icon">📤</div>
            <div className="ple-metric-card__content">
              <div className="ple-metric-card__value">{estadisticas.archivos_enviados}</div>
              <div className="ple-metric-card__label">Enviados</div>
            </div>
          </div>

          <div className="ple-metric-card ple-metric-card--warning">
            <div className="ple-metric-card__icon">⏳</div>
            <div className="ple-metric-card__content">
              <div className="ple-metric-card__value">{estadisticas.archivos_pendientes}</div>
              <div className="ple-metric-card__label">Pendientes</div>
            </div>
          </div>
        </div>

        {/* Métricas secundarias */}
        <div className="ple-estadisticas__secondary-metrics">
          <div className="ple-estadisticas__metric-group">
            <h4 className="ple-estadisticas__group-title">📈 Rendimiento</h4>
            <div className="ple-estadisticas__metrics-grid">
              <div className="ple-stat-item">
                <div className="ple-stat-item__label">Tasa de Éxito</div>
                <div className="ple-stat-item__value ple-stat-item__value--success">
                  {getSuccessRate()}%
                </div>
              </div>
              
              <div className="ple-stat-item">
                <div className="ple-stat-item__label">Errores Recientes</div>
                <div className={`ple-stat-item__value ${
                  estadisticas.errores_recientes > 0 ? 'ple-stat-item__value--error' : 'ple-stat-item__value--success'
                }`}>
                  {estadisticas.errores_recientes}
                </div>
              </div>
            </div>
          </div>

          <div className="ple-estadisticas__metric-group">
            <h4 className="ple-estadisticas__group-title">💾 Volumen de Datos</h4>
            <div className="ple-estadisticas__metrics-grid">
              <div className="ple-stat-item">
                <div className="ple-stat-item__label">Tamaño Total</div>
                <div className="ple-stat-item__value">
                  {estadisticas.tamaño_total ? formatFileSize(estadisticas.tamaño_total) : 'N/A'}
                </div>
              </div>
              
              <div className="ple-stat-item">
                <div className="ple-stat-item__label">Registros Totales</div>
                <div className="ple-stat-item__value">
                  {estadisticas.registros_totales?.toLocaleString() || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="ple-estadisticas__metric-group">
            <h4 className="ple-estadisticas__group-title">⏰ Actividad Reciente</h4>
            <div className="ple-estadisticas__metrics-grid">
              <div className="ple-stat-item ple-stat-item--full">
                <div className="ple-stat-item__label">Último Archivo Generado</div>
                <div className="ple-stat-item__value">
                  {estadisticas.ultimo_generado ? formatDate(estadisticas.ultimo_generado) : 'Nunca'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="ple-estadisticas__progress-section">
          <h4 className="ple-estadisticas__group-title">📊 Distribución por Estado</h4>
          
          <div className="ple-progress-item">
            <div className="ple-progress-item__header">
              <span>Archivos Validados</span>
              <span>{estadisticas.archivos_validados}/{estadisticas.total_archivos}</span>
            </div>
            <div className="ple-progress-bar">
              <div 
                className="ple-progress-bar__fill ple-progress-bar__fill--success"
                style={{ width: `${(estadisticas.archivos_validados / Math.max(estadisticas.total_archivos, 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="ple-progress-item">
            <div className="ple-progress-item__header">
              <span>Archivos Enviados</span>
              <span>{estadisticas.archivos_enviados}/{estadisticas.total_archivos}</span>
            </div>
            <div className="ple-progress-bar">
              <div 
                className="ple-progress-bar__fill ple-progress-bar__fill--info"
                style={{ width: `${(estadisticas.archivos_enviados / Math.max(estadisticas.total_archivos, 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="ple-progress-item">
            <div className="ple-progress-item__header">
              <span>Archivos Pendientes</span>
              <span>{estadisticas.archivos_pendientes}/{estadisticas.total_archivos}</span>
            </div>
            <div className="ple-progress-bar">
              <div 
                className="ple-progress-bar__fill ple-progress-bar__fill--warning"
                style={{ width: `${(estadisticas.archivos_pendientes / Math.max(estadisticas.total_archivos, 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="ple-estadisticas__actions">
          <button 
            onClick={onRefresh}
            className="btn btn-primary"
          >
            🔄 Actualizar Estadísticas
          </button>
          
          <button className="btn btn-secondary">
            📊 Reporte Detallado
          </button>
          
          <button className="btn btn-secondary">
            📥 Exportar Datos
          </button>
        </div>
      </div>
    </div>
  );
};

export default PLEEstadisticas;
