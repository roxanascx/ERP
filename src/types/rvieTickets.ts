// Tipos para sistema de tickets RVIE - Alineados con backend implementado

// ==================== TIPOS BÁSICOS ====================

export type TicketStatus = 'PENDIENTE' | 'PROCESANDO' | 'TERMINADO' | 'ERROR';

export type OperacionRvie = 'descargar-propuesta' | 'aceptar-propuesta' | 'reemplazar-propuesta';

// ==================== INTERFACES PRINCIPALES ====================

export interface RvieTicket {
  ticket_id: string;
  status: TicketStatus;
  progreso_porcentaje: number;
  descripcion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  operacion: OperacionRvie;
  ruc: string;
  periodo: string;
  resultado?: any;
  error_mensaje?: string;
  archivo_nombre?: string;
  archivo_size?: number;
}

export interface GenerarTicketRequest {
  ruc: string;
  periodo: string;
  operacion: OperacionRvie;
}

export interface ArchivoTicket {
  filename: string;
  file_size: number;
  content?: string;
  download_url?: string;
}

// ==================== TIPOS PARA UI ====================

export interface TicketDisplayInfo {
  id: string;
  titulo: string;
  descripcion: string;
  estado: TicketStatus;
  progreso: number;
  tiempoTranscurrido: string;
  fechaCreacion: string;
  periodo: string;
  operacion: OperacionRvie;
  emoji: string;
  color: string;
  tieneArchivo: boolean;
  esActivo: boolean;
}

export interface TicketProgressInfo {
  progreso: number;
  mensaje: string;
  estado: TicketStatus;
  tiempoTranscurrido: string;
  esCompleto: boolean;
  esError: boolean;
}

// ==================== CALLBACKS Y OPCIONES ====================

export interface TicketCallbacks {
  onTicketCreated?: (ticket: RvieTicket) => void;
  onProgress?: (ticket: RvieTicket) => void;
  onCompleted?: (ticket: RvieTicket, archivo?: ArchivoTicket) => void;
  onError?: (error: string) => void;
}

export interface MonitoringOptions {
  pollInterval?: number;
  maxAttempts?: number;
  onProgress?: (ticket: RvieTicket) => void;
  onError?: (error: string) => void;
}

// ==================== ESTADOS DE OPERACIÓN ====================

export interface OperacionActiva {
  tipo: OperacionRvie;
  ticketId: string;
  estado: TicketStatus;
  progreso: number;
  mensaje: string;
  fechaInicio: string;
}

// ==================== ESTADÍSTICAS ====================

export interface TicketStats {
  total: number;
  pendientes: number;
  procesando: number;
  terminados: number;
  errores: number;
  tiempoPromedioCompletado: number; // en segundos
  ultimaActualizacion: string;
}

// ==================== UTILIDADES DE TIPO ====================

export interface TicketUtils {
  isActive: (ticket: RvieTicket) => boolean;
  hasFile: (ticket: RvieTicket) => boolean;
  getDisplayInfo: (ticket: RvieTicket) => TicketDisplayInfo;
  getProgressInfo: (ticket: RvieTicket) => TicketProgressInfo;
  formatElapsedTime: (fechaCreacion: string) => string;
  getStatusEmoji: (status: TicketStatus) => string;
  getStatusColor: (status: TicketStatus) => string;
}

// ==================== PROPS DE COMPONENTES ====================

export interface TicketCardProps {
  ticket: RvieTicket;
  onViewDetails?: (ticketId: string) => void;
  onDownload?: (ticketId: string) => void;
  onCancel?: (ticketId: string) => void;
  showActions?: boolean;
}

export interface TicketListProps {
  tickets: RvieTicket[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onTicketAction?: (ticketId: string, action: string) => void;
  emptyMessage?: string;
}

export interface TicketProgressProps {
  ticket: RvieTicket;
  showDetails?: boolean;
  compact?: boolean;
}

export interface TicketModalProps {
  ticket: RvieTicket;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  onCancel?: () => void;
}

// ==================== CONSTANTES ====================

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  'PENDIENTE': 'Pendiente',
  'PROCESANDO': 'Procesando',
  'TERMINADO': 'Terminado',
  'ERROR': 'Error'
};

export const OPERACION_LABELS: Record<OperacionRvie, string> = {
  'descargar-propuesta': 'Descargar Propuesta',
  'aceptar-propuesta': 'Aceptar Propuesta',
  'reemplazar-propuesta': 'Reemplazar Propuesta'
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  'PENDIENTE': '#f59e0b',
  'PROCESANDO': '#3b82f6',
  'TERMINADO': '#10b981',
  'ERROR': '#ef4444'
};

export const TICKET_STATUS_EMOJIS: Record<TicketStatus, string> = {
  'PENDIENTE': '⏳',
  'PROCESANDO': '⚙️',
  'TERMINADO': '✅',
  'ERROR': '❌'
};

// ==================== HELPERS ====================

export const TicketHelpers = {
  isActive: (ticket: RvieTicket): boolean => {
    return ['PENDIENTE', 'PROCESANDO'].includes(ticket.status);
  },

  hasFile: (ticket: RvieTicket): boolean => {
    return ticket.status === 'TERMINADO' && !!ticket.archivo_nombre;
  },

  getDisplayInfo: (ticket: RvieTicket): TicketDisplayInfo => {
    return {
      id: ticket.ticket_id,
      titulo: OPERACION_LABELS[ticket.operacion],
      descripcion: ticket.descripcion,
      estado: ticket.status,
      progreso: ticket.progreso_porcentaje,
      tiempoTranscurrido: TicketHelpers.formatElapsedTime(ticket.fecha_creacion),
      fechaCreacion: ticket.fecha_creacion,
      periodo: ticket.periodo,
      operacion: ticket.operacion,
      emoji: TICKET_STATUS_EMOJIS[ticket.status],
      color: TICKET_STATUS_COLORS[ticket.status],
      tieneArchivo: TicketHelpers.hasFile(ticket),
      esActivo: TicketHelpers.isActive(ticket)
    };
  },

  getProgressInfo: (ticket: RvieTicket): TicketProgressInfo => {
    return {
      progreso: ticket.progreso_porcentaje,
      mensaje: ticket.descripcion,
      estado: ticket.status,
      tiempoTranscurrido: TicketHelpers.formatElapsedTime(ticket.fecha_creacion),
      esCompleto: ticket.status === 'TERMINADO',
      esError: ticket.status === 'ERROR'
    };
  },

  formatElapsedTime: (fechaCreacion: string): string => {
    const created = new Date(fechaCreacion);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'menos de 1 minuto';
    if (diffMinutes < 60) return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  },

  getStatusEmoji: (status: TicketStatus): string => {
    return TICKET_STATUS_EMOJIS[status] || '❓';
  },

  getStatusColor: (status: TicketStatus): string => {
    return TICKET_STATUS_COLORS[status] || '#6b7280';
  }
};

export default TicketHelpers;
