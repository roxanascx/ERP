// Servicio para gestión de tickets RVIE - Alineado con backend implementado
import apiClient from './api';

// ==================== TIPOS ====================

export interface GenerarTicketRequest {
  ruc: string;
  periodo: string;
  operacion: 'descargar-propuesta' | 'aceptar-propuesta' | 'reemplazar-propuesta';
}

export interface TicketResponse {
  ticket_id: string;
  status: 'PENDIENTE' | 'PROCESANDO' | 'TERMINADO' | 'ERROR';
  progreso_porcentaje: number;
  descripcion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  operacion: string;
  ruc: string;
  periodo: string;
  resultado?: any;
  error_mensaje?: string;
  archivo_nombre?: string;
  archivo_size?: number;
}

export interface ArchivoResponse {
  filename: string;
  file_size: number;
  content?: string;
  download_url?: string;
}

// ==================== SERVICIO ====================

class RvieTicketService {
  private baseUrl = '/api/v1/sire/rvie';

  // ==================== GESTIÓN DE TICKETS ====================

  /**
   * Generar un nuevo ticket RVIE
   */
  async generarTicket(request: GenerarTicketRequest): Promise<TicketResponse> {
    try {
      console.log('🎫 [TICKETS] Generando ticket:', request);
      
      const response = await apiClient.post(`${this.baseUrl}/generar-ticket`, request);
      
      console.log('✅ [TICKETS] Ticket generado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TICKETS] Error generando ticket:', error);
      throw new Error(error.response?.data?.detail || 'Error generando ticket');
    }
  }

  /**
   * Consultar estado de un ticket
   */
  async consultarTicket(ruc: string, ticketId: string): Promise<TicketResponse> {
    try {
      console.log(`🔍 [TICKETS] Consultando ticket ${ticketId} para RUC ${ruc}`);
      
      const response = await apiClient.get(`${this.baseUrl}/ticket/${ruc}/${ticketId}`);
      
      console.log('📊 [TICKETS] Estado ticket:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TICKETS] Error consultando ticket:', error);
      throw new Error(error.response?.data?.detail || 'Error consultando ticket');
    }
  }

  /**
   * Descargar archivo de ticket completado
   */
  async descargarArchivo(ruc: string, ticketId: string): Promise<ArchivoResponse> {
    try {
      console.log(`📥 [TICKETS] Descargando archivo del ticket ${ticketId}`);
      
      const response = await apiClient.get(`${this.baseUrl}/archivo/${ruc}/${ticketId}`);
      
      console.log('✅ [TICKETS] Archivo descargado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TICKETS] Error descargando archivo:', error);
      throw new Error(error.response?.data?.detail || 'Error descargando archivo');
    }
  }

  // ==================== HELPERS DE OPERACIONES ====================

  /**
   * Generar ticket para descargar propuesta
   */
  async generarTicketDescarga(ruc: string, periodo: string): Promise<TicketResponse> {
    return this.generarTicket({
      ruc,
      periodo,
      operacion: 'descargar-propuesta'
    });
  }

  /**
   * Generar ticket para aceptar propuesta
   */
  async generarTicketAceptar(ruc: string, periodo: string): Promise<TicketResponse> {
    return this.generarTicket({
      ruc,
      periodo,
      operacion: 'aceptar-propuesta'
    });
  }

  /**
   * Generar ticket para reemplazar propuesta
   */
  async generarTicketReemplazar(ruc: string, periodo: string): Promise<TicketResponse> {
    return this.generarTicket({
      ruc,
      periodo,
      operacion: 'reemplazar-propuesta'
    });
  }

  // ==================== MONITOREO Y POLLING ====================

  /**
   * Monitorear un ticket hasta que complete
   */
  async monitorearTicket(
    ruc: string,
    ticketId: string,
    options: {
      onProgress?: (ticket: TicketResponse) => void;
      onError?: (error: string) => void;
      pollInterval?: number;
      maxAttempts?: number;
    } = {}
  ): Promise<TicketResponse> {
    const {
      onProgress,
      onError,
      pollInterval = 3000, // 3 segundos
      maxAttempts = 100 // 5 minutos máximo
    } = options;

    let attemptCount = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attemptCount++;
          
          const ticket = await this.consultarTicket(ruc, ticketId);
          
          // Notificar progreso
          if (onProgress) {
            onProgress(ticket);
          }

          // Verificar estados finales
          if (ticket.status === 'TERMINADO') {
            console.log('✅ [TICKETS] Ticket completado exitosamente');
            resolve(ticket);
            return;
          }

          if (ticket.status === 'ERROR') {
            const errorMsg = ticket.error_mensaje || 'Ticket falló';
            console.error('❌ [TICKETS] Ticket falló:', errorMsg);
            if (onError) onError(errorMsg);
            reject(new Error(errorMsg));
            return;
          }

          // Verificar timeout
          if (attemptCount >= maxAttempts) {
            const timeoutMsg = `Timeout: Ticket no completó en ${maxAttempts} intentos`;
            console.error('⏰ [TICKETS] Timeout:', timeoutMsg);
            if (onError) onError(timeoutMsg);
            reject(new Error(timeoutMsg));
            return;
          }

          // Continuar monitoring
          console.log(`🔄 [TICKETS] Intento ${attemptCount}/${maxAttempts} - Estado: ${ticket.status} (${ticket.progreso_porcentaje}%)`);
          setTimeout(poll, pollInterval);

        } catch (error: any) {
          console.error('❌ [TICKETS] Error en monitoreo:', error);
          if (onError) onError(error.message);
          reject(error);
        }
      };

      // Iniciar polling
      poll();
    });
  }

  /**
   * Flujo completo: generar ticket, monitorear y descargar
   */
  async procesamientoCompleto(
    ruc: string,
    periodo: string,
    operacion: 'descargar-propuesta' | 'aceptar-propuesta' | 'reemplazar-propuesta',
    callbacks: {
      onTicketCreated?: (ticket: TicketResponse) => void;
      onProgress?: (ticket: TicketResponse) => void;
      onCompleted?: (ticket: TicketResponse, archivo?: ArchivoResponse) => void;
      onError?: (error: string) => void;
    } = {}
  ): Promise<{ ticket: TicketResponse; archivo?: ArchivoResponse }> {
    
    try {
      // Paso 1: Generar ticket
      console.log(`🚀 [TICKETS] Iniciando procesamiento completo: ${operacion}`);
      const ticket = await this.generarTicket({ ruc, periodo, operacion });
      
      if (callbacks.onTicketCreated) {
        callbacks.onTicketCreated(ticket);
      }

      // Paso 2: Monitorear hasta completar
      const ticketFinal = await this.monitorearTicket(ruc, ticket.ticket_id, {
        onProgress: callbacks.onProgress,
        onError: callbacks.onError
      });

      // Paso 3: Descargar archivo si está disponible
      let archivo: ArchivoResponse | undefined;
      if (ticketFinal.status === 'TERMINADO' && ticketFinal.archivo_nombre) {
        try {
          archivo = await this.descargarArchivo(ruc, ticket.ticket_id);
        } catch (error) {
          console.warn('⚠️ [TICKETS] No se pudo descargar archivo, pero ticket completó exitosamente');
        }
      }

      // Notificar completado
      if (callbacks.onCompleted) {
        callbacks.onCompleted(ticketFinal, archivo);
      }

      return { ticket: ticketFinal, archivo };

    } catch (error: any) {
      console.error('❌ [TICKETS] Error en procesamiento completo:', error);
      if (callbacks.onError) {
        callbacks.onError(error.message);
      }
      throw error;
    }
  }

  // ==================== UTILIDADES ====================

  /**
   * Verificar si un ticket está activo
   */
  isTicketActive(ticket: TicketResponse): boolean {
    return ['PENDIENTE', 'PROCESANDO'].includes(ticket.status);
  }

  /**
   * Verificar si un ticket tiene archivo disponible
   */
  hasFileAvailable(ticket: TicketResponse): boolean {
    return ticket.status === 'TERMINADO' && !!ticket.archivo_nombre;
  }

  /**
   * Formatear tiempo transcurrido
   */
  formatElapsedTime(fechaCreacion: string): string {
    const created = new Date(fechaCreacion);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'menos de 1 minuto';
    if (diffMinutes < 60) return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  }

  /**
   * Obtener emoji de estado
   */
  getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      'PENDIENTE': '⏳',
      'PROCESANDO': '⚙️',
      'TERMINADO': '✅',
      'ERROR': '❌'
    };
    return emojis[status] || '❓';
  }

  /**
   * Obtener color de estado para UI
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'PENDIENTE': '#f59e0b',
      'PROCESANDO': '#3b82f6',
      'TERMINADO': '#10b981',
      'ERROR': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }
}

// ==================== EXPORT ====================

export const rvieTicketService = new RvieTicketService();
export default rvieTicketService;
