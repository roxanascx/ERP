// Servicio para gestión de tickets SIRE
import apiClient from './api';
import type { 
  SireTicket, 
  TicketSummary, 
  TicketStats,
  TicketStatus,
  TicketPriority 
} from '../types/tickets';

class SireTicketService {
  private baseUrl = '/api/v1/sire';

  // ==================== CREAR TICKETS ====================

  async createRvieDownloadTicket(
    ruc: string, 
    periodo: string, 
    priority: keyof TicketPriority = 'NORMAL'
  ): Promise<SireTicket> {
    const response = await apiClient.post(`${this.baseUrl}/ticket/rvie/descargar`, null, {
      params: { ruc, periodo, priority }
    });
    return response.data;
  }

  async createRvieAcceptTicket(
    ruc: string, 
    periodo: string, 
    priority: keyof TicketPriority = 'NORMAL'
  ): Promise<SireTicket> {
    const response = await apiClient.post(`${this.baseUrl}/ticket/rvie/aceptar`, null, {
      params: { ruc, periodo, priority }
    });
    return response.data;
  }

  // ==================== CONSULTAR TICKETS ====================

  async getTicket(ticketId: string): Promise<SireTicket> {
    const response = await apiClient.get(`${this.baseUrl}/ticket/${ticketId}`);
    return response.data;
  }

  async getTicketsByRuc(
    ruc: string,
    options: {
      status?: keyof TicketStatus;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<TicketSummary[]> {
    const params: Record<string, any> = { ruc };
    
    if (options.status) params.status = options.status;
    if (options.limit) params.limit = options.limit;
    if (options.offset) params.offset = options.offset;

    const response = await apiClient.get(`${this.baseUrl}/tickets`, { params });
    return response.data;
  }

  async getTicketStats(ruc?: string): Promise<TicketStats> {
    const params = ruc ? { ruc } : {};
    const response = await apiClient.get(`${this.baseUrl}/tickets/stats`, { params });
    return response.data;
  }

  // ==================== DESCARGAR ARCHIVOS ====================

  async downloadTicketFile(ticketId: string): Promise<{ fileName: string; blob: Blob }> {
    const response = await apiClient.get(`${this.baseUrl}/ticket/${ticketId}/download`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/octet-stream'
      }
    });

    // Obtener nombre del archivo del header
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `ticket_${ticketId}.txt`;
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, '');
      }
    }

    return {
      fileName,
      blob: response.data
    };
  }

  // ==================== CANCELAR TICKETS ====================

  async cancelTicket(ticketId: string): Promise<{ message: string; ticket_id: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/ticket/${ticketId}`);
    return response.data;
  }

  // ==================== MANTENIMIENTO ====================

  async cleanupExpiredTickets(): Promise<{ message: string; expired_count: number }> {
    const response = await apiClient.post(`${this.baseUrl}/tickets/cleanup`);
    return response.data;
  }

  // ==================== POLLING Y MONITOREO ====================

  /**
   * Hacer polling de un ticket hasta que complete o falle
   */
  async pollTicketUntilComplete(
    ticketId: string,
    options: {
      pollInterval?: number; // ms
      maxAttempts?: number;
      onProgress?: (ticket: SireTicket) => void;
    } = {}
  ): Promise<SireTicket> {
    const { 
      pollInterval = 2000, 
      maxAttempts = 150, // 5 minutos max
      onProgress 
    } = options;

    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;
          
          const ticket = await this.getTicket(ticketId);
          
          // Notificar progreso
          if (onProgress) {
            onProgress(ticket);
          }

          // Verificar estados finales
          if (ticket.status === 'TERMINADO') {
            resolve(ticket);
            return;
          }

          if (ticket.status === 'ERROR' || ticket.status === 'EXPIRADO' || ticket.status === 'CANCELADO') {
            reject(new Error(`Ticket falló: ${ticket.status} - ${ticket.status_message}`));
            return;
          }

          // Verificar límite de intentos
          if (attempts >= maxAttempts) {
            reject(new Error('Timeout: El ticket no completó en el tiempo esperado'));
            return;
          }

          // Continuar polling
          setTimeout(poll, pollInterval);

        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Descargar archivo automáticamente cuando el ticket complete
   */
  async downloadWhenReady(
    ticketId: string,
    options: {
      pollInterval?: number;
      maxAttempts?: number;
      onProgress?: (ticket: SireTicket) => void;
    } = {}
  ): Promise<{ fileName: string; blob: Blob }> {
    // Esperar a que complete
    await this.pollTicketUntilComplete(ticketId, options);
    
    // Descargar archivo
    return await this.downloadTicketFile(ticketId);
  }

  // ==================== HELPERS ====================

  /**
   * Formatear tiempo restante
   */
  formatRemainingTime(seconds?: number): string {
    if (!seconds || seconds <= 0) return '--';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  /**
   * Calcular porcentaje de tiempo transcurrido
   */
  getTimeProgress(ticket: SireTicket): number {
    if (!ticket.estimated_duration || !ticket.elapsed_time) return 0;
    
    return Math.min(100, (ticket.elapsed_time / ticket.estimated_duration) * 100);
  }

  /**
   * Verificar si un ticket está activo
   */
  isActiveTicket(ticket: SireTicket): boolean {
    return ['PENDIENTE', 'PROCESANDO'].includes(ticket.status);
  }

  /**
   * Verificar si un ticket se puede cancelar
   */
  canCancelTicket(ticket: SireTicket): boolean {
    return ['PENDIENTE', 'PROCESANDO'].includes(ticket.status);
  }

  /**
   * Verificar si un ticket tiene archivo disponible
   */
  hasFileAvailable(ticket: SireTicket): boolean {
    return ticket.status === 'TERMINADO' && !!ticket.output_file_name;
  }

  // ==================== TESTING ====================

  async createSampleTicket(): Promise<SireTicket> {
    const response = await apiClient.get(`${this.baseUrl}/tickets/test/create-sample`);
    return response.data;
  }
}

export const sireTicketService = new SireTicketService();
