import React from 'react';
import './PLEArchivosTable.css';

export interface PLEArchivo {
  id: string;
  ejercicio: number;
  mes: number;
  ruc: string;
  razonSocial: string;
  fechaGeneracion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'generado' | 'validado' | 'enviado' | 'error';
  nombreArchivo: string;
  tamanoArchivo: number;
  totalRegistros: number;
  observaciones?: string;
  errores?: string[];
}

interface PLEArchivosTableProps {
  empresaId: string;
  dashboardData?: any;
  onRefresh?: () => void;
}

export const PLEArchivosTable: React.FC<PLEArchivosTableProps> = ({
  empresaId,
  dashboardData,
  onRefresh
}) => {
  // Mock data for demonstration
  const archivos: PLEArchivo[] = [
    {
      id: '1',
      ejercicio: 2025,
      mes: 8,
      ruc: '20123456789',
      razonSocial: 'EMPRESA DEMO SAC',
      fechaGeneracion: '2025-08-27',
      fechaInicio: '2025-08-01',
      fechaFin: '2025-08-31',
      estado: 'validado',
      nombreArchivo: 'LE20123456789202508.zip',
      tamanoArchivo: 2048576,
      totalRegistros: 150,
      observaciones: 'Archivo generado correctamente'
    }
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'generado': return 'info';
      case 'validado': return 'success';
      case 'enviado': return 'primary';
      case 'error': return 'error';
      default: return 'secondary';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'generado': return '📄';
      case 'validado': return '✅';
      case 'enviado': return '📤';
      case 'error': return '❌';
      default: return '📋';
    }
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
      month: 'short',
      day: '2-digit'
    });
  };

  const handleDownload = (archivo: PLEArchivo) => {
    console.log('Descargando archivo:', archivo.nombreArchivo);
    // Implementar lógica de descarga
  };

  const handlePreview = (archivo: PLEArchivo) => {
    console.log('Vista previa del archivo:', archivo.nombreArchivo);
    // Implementar lógica de vista previa
  };

  const handleValidate = (archivo: PLEArchivo) => {
    console.log('Validando archivo:', archivo.nombreArchivo);
    // Implementar lógica de validación
  };

  return (
    <div className="ple-archivos-table">
      <div className="ple-archivos-table__header">
        <h3 className="ple-archivos-table__title">
          📁 Archivos PLE Generados
        </h3>
        <p className="ple-archivos-table__description">
          Historial de archivos PLE generados con opciones de descarga y validación
        </p>
      </div>

      <div className="ple-archivos-table__content">
        {archivos.length === 0 ? (
          <div className="ple-archivos-table__empty">
            <div className="ple-archivos-table__empty-icon">📂</div>
            <h4>No hay archivos generados</h4>
            <p>
              Aún no se han generado archivos PLE. Utilice el generador para crear
              su primer archivo PLE conforme SUNAT.
            </p>
            <button className="btn btn-primary">
              🎯 Generar Primer Archivo
            </button>
          </div>
        ) : (
          <div className="ple-archivos-table__grid">
            {archivos.map((archivo) => (
              <div key={archivo.id} className="ple-archivo-card">
                <div className="ple-archivo-card__header">
                  <div className="ple-archivo-card__status">
                    <span className={`ple-archivo-card__badge badge-${getEstadoColor(archivo.estado)}`}>
                      {getEstadoIcon(archivo.estado)} {archivo.estado.toUpperCase()}
                    </span>
                  </div>
                  <div className="ple-archivo-card__period">
                    📅 {archivo.ejercicio}/{archivo.mes.toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="ple-archivo-card__body">
                  <div className="ple-archivo-card__filename">
                    📄 {archivo.nombreArchivo}
                  </div>
                  
                  <div className="ple-archivo-card__details">
                    <div className="ple-archivo-card__detail">
                      <span className="ple-archivo-card__detail-label">🏢 Empresa:</span>
                      <span className="ple-archivo-card__detail-value">{archivo.razonSocial}</span>
                    </div>
                    
                    <div className="ple-archivo-card__detail">
                      <span className="ple-archivo-card__detail-label">📊 Registros:</span>
                      <span className="ple-archivo-card__detail-value">{archivo.totalRegistros.toLocaleString()}</span>
                    </div>
                    
                    <div className="ple-archivo-card__detail">
                      <span className="ple-archivo-card__detail-label">💾 Tamaño:</span>
                      <span className="ple-archivo-card__detail-value">{formatFileSize(archivo.tamanoArchivo)}</span>
                    </div>
                    
                    <div className="ple-archivo-card__detail">
                      <span className="ple-archivo-card__detail-label">📅 Generado:</span>
                      <span className="ple-archivo-card__detail-value">{formatDate(archivo.fechaGeneracion)}</span>
                    </div>
                  </div>

                  {archivo.observaciones && (
                    <div className="ple-archivo-card__observations">
                      💬 {archivo.observaciones}
                    </div>
                  )}

                  {archivo.errores && archivo.errores.length > 0 && (
                    <div className="ple-archivo-card__errors">
                      <strong>⚠️ Errores encontrados:</strong>
                      <ul>
                        {archivo.errores.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="ple-archivo-card__actions">
                  <button
                    onClick={() => handleDownload(archivo)}
                    className="btn btn-primary btn-sm"
                    title="Descargar archivo"
                  >
                    💾 Descargar
                  </button>
                  
                  <button
                    onClick={() => handlePreview(archivo)}
                    className="btn btn-secondary btn-sm"
                    title="Vista previa"
                  >
                    👁️ Ver
                  </button>
                  
                  <button
                    onClick={() => handleValidate(archivo)}
                    className="btn btn-secondary btn-sm"
                    title="Validar archivo"
                  >
                    ✅ Validar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters Section - Coming Soon */}
      <div className="ple-archivos-table__filters">
        <div className="alert alert-info">
          <h4>🔍 Filtros Avanzados (Próximamente)</h4>
          <p>
            Se incluirán filtros por período, estado, empresa y tipo de archivo
            para facilitar la búsqueda en el historial de archivos generados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PLEArchivosTable;
