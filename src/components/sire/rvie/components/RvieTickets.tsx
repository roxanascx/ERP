/**
 * Componente para gestionar los tickets RVIE
 * Historial de operaciones y estados
 */

import type { RvieTicketResponse } from '../../../../types/sire';
import './rvie-components.css';

interface RvieTicketsProps {
  tickets: RvieTicketResponse[];
  loading: boolean;
  onConsultarTicket: (ticketId: string) => Promise<void>;
  onDescargarArchivo: (ticketId: string) => Promise<void>;
}

export default function RvieTickets({
  tickets,
  loading,
  onConsultarTicket,
  onDescargarArchivo
}: RvieTicketsProps) {
  console.log('🎫 [RvieTickets] Renderizando con:', { tickets: tickets.length, loading });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return '⏳';
      case 'PROCESANDO': return '🔄';
      case 'TERMINADO': return '✅';
      case 'ERROR': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return '#ffc107';
      case 'PROCESANDO': return '#007bff';
      case 'TERMINADO': return '#28a745';
      case 'ERROR': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPeriodo = (periodo: string) => {
    if (periodo && periodo.length === 6) {
      const año = periodo.substring(0, 4);
      const mes = periodo.substring(4, 6);
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${meses[parseInt(mes) - 1]} ${año}`;
    }
    return periodo || 'Sin período';
  };

  const getOperacionDescripcion = (operacion: string) => {
    switch (operacion) {
      case 'descargar-propuesta': return '📥 Descargar Propuesta SUNAT';
      case 'aceptar-propuesta': return '✅ Aceptar Propuesta';
      case 'reemplazar-propuesta': return '🔄 Reemplazar Propuesta';
      case 'registrar-preliminar': return '📝 Registrar Preliminar';
      case 'consultar-inconsistencias': return '🔍 Consultar Inconsistencias';
      default: return `🔧 ${operacion.charAt(0).toUpperCase() + operacion.slice(1)}`;
    }
  };

  if (loading) {
    return (
      <div className="tickets-section">
        <h3>🎫 Historial de Operaciones</h3>
        <div className="loading-tickets">
          <p>⏳ Cargando operaciones...</p>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="tickets-section">
        <h3>🎫 Historial de Operaciones</h3>
        <div className="empty-tickets">
          <p>📭 No hay operaciones registradas aún.</p>
          <small>Realiza una operación RVIE para ver el historial aquí.</small>
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4>💡 ¿Cómo generar tickets?</h4>
            <ol>
              <li>Usa "Descargar Propuesta" arriba para crear un ticket</li>
              <li>Los tickets aparecerán aquí con su estado</li>
              <li>Podrás consultar y descargar archivos</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-section">
      <h3>🎫 Historial de Operaciones ({tickets.length})</h3>
      <div className="tickets-grid">
        {tickets.map((ticket) => (
          <div key={ticket.ticket_id} className="ticket-card">
            <div className="ticket-header">
              <div className="ticket-info">
                <h4>
                  {getStatusIcon(ticket.status)} {getOperacionDescripcion(ticket.operacion)}
                </h4>
                <span className="ticket-id">ID: {ticket.ticket_id.slice(0, 8)}...</span>
              </div>
              <div 
                className="ticket-status" 
                style={{ backgroundColor: getStatusColor(ticket.status) }}
              >
                {ticket.status}
              </div>
            </div>

            <div className="ticket-details">
              <div className="periodo-destacado">
                <p><strong>📅 Período:</strong> <span className="periodo-badge">{formatPeriodo(ticket.periodo)}</span></p>
              </div>
              <p><strong>🏢 RUC:</strong> {ticket.ruc}</p>
              <p><strong>⏰ Creado:</strong> {formatFecha(ticket.fecha_creacion)}</p>
              <p><strong>🔄 Actualizado:</strong> {formatFecha(ticket.fecha_actualizacion)}</p>
              
              {ticket.progreso_porcentaje !== undefined && (
                <div className="progress-container">
                  <div className="progress-label">
                    Progreso: {ticket.progreso_porcentaje}%
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${ticket.progreso_porcentaje}%` }}
                    />
                  </div>
                </div>
              )}

              {ticket.descripcion && (
                <p><strong>Descripción:</strong> {ticket.descripcion}</p>
              )}

              {ticket.error_mensaje && (
                <div className="error-message">
                  <p><strong>Error:</strong> {ticket.error_mensaje}</p>
                </div>
              )}

              {ticket.archivo_nombre && (
                <div className="archivo-info">
                  <p><strong>Archivo:</strong> {ticket.archivo_nombre}</p>
                  {ticket.archivo_size && (
                    <p><strong>Tamaño:</strong> {(ticket.archivo_size / 1024).toFixed(2)} KB</p>
                  )}
                </div>
              )}
            </div>

            <div className="ticket-actions">
              <button 
                className="btn-secondary"
                onClick={() => onConsultarTicket(ticket.ticket_id)}
                disabled={loading}
              >
                🔄 Consultar
              </button>
              
              {ticket.status === 'TERMINADO' && ticket.archivo_nombre && (
                <button 
                  className="btn-primary"
                  onClick={() => onDescargarArchivo(ticket.ticket_id)}
                  disabled={loading}
                >
                  📥 Descargar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
