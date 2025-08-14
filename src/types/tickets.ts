// Tipos para el sistema de tickets SIRE
export interface TicketOperationType {
  DESCARGAR_PROPUESTA: 'DESCARGAR_PROPUESTA';
  ACEPTAR_PROPUESTA: 'ACEPTAR_PROPUESTA';
  REEMPLAZAR_PROPUESTA: 'REEMPLAZAR_PROPUESTA';
  REGISTRAR_PRELIMINAR: 'REGISTRAR_PRELIMINAR';
  DESCARGAR_INCONSISTENCIAS: 'DESCARGAR_INCONSISTENCIAS';
  GENERAR_RESUMEN: 'GENERAR_RESUMEN';
}

export interface TicketStatus {
  PENDIENTE: 'PENDIENTE';
  PROCESANDO: 'PROCESANDO';
  TERMINADO: 'TERMINADO';
  ERROR: 'ERROR';
  EXPIRADO: 'EXPIRADO';
  CANCELADO: 'CANCELADO';
}

export interface TicketPriority {
  BAJA: 'BAJA';
  NORMAL: 'NORMAL';
  ALTA: 'ALTA';
  URGENTE: 'URGENTE';
}

export interface SireTicket {
  ticket_id: string;
  operation_type: keyof TicketOperationType;
  status: keyof TicketStatus;
  progress_percentage: number;
  status_message: string;
  detailed_message?: string;
  
  created_at: string;
  updated_at: string;
  expires_at: string;
  
  estimated_duration?: number;
  elapsed_time?: number;
  remaining_time?: number;
  
  output_file_name?: string;
  output_file_size?: number;
  output_file_type?: string;
  
  error_code?: string;
  error_message?: string;
  error_details?: string[];
  
  can_retry: boolean;
  is_expired: boolean;
}

export interface TicketSummary {
  ticket_id: string;
  operation_type: keyof TicketOperationType;
  status: keyof TicketStatus;
  created_at: string;
  progress_percentage: number;
  status_message: string;
  output_file_name?: string;
}

export interface TicketStats {
  total: number;
  by_status: Record<string, number>;
  latest_activity?: string;
}

// Mapas para UI
export const TICKET_OPERATION_LABELS: Record<keyof TicketOperationType, string> = {
  DESCARGAR_PROPUESTA: 'Descargar Propuesta',
  ACEPTAR_PROPUESTA: 'Aceptar Propuesta',
  REEMPLAZAR_PROPUESTA: 'Reemplazar Propuesta',
  REGISTRAR_PRELIMINAR: 'Registro Preliminar',
  DESCARGAR_INCONSISTENCIAS: 'Descargar Inconsistencias',
  GENERAR_RESUMEN: 'Generar Resumen'
};

export const TICKET_STATUS_LABELS: Record<keyof TicketStatus, string> = {
  PENDIENTE: 'Pendiente',
  PROCESANDO: 'Procesando',
  TERMINADO: 'Completado',
  ERROR: 'Error',
  EXPIRADO: 'Expirado',
  CANCELADO: 'Cancelado'
};

export const TICKET_PRIORITY_LABELS: Record<keyof TicketPriority, string> = {
  BAJA: 'Baja',
  NORMAL: 'Normal',
  ALTA: 'Alta',
  URGENTE: 'Urgente'
};

// Colores para estados
export const TICKET_STATUS_COLORS: Record<keyof TicketStatus, string> = {
  PENDIENTE: '#6B7280',    // Gray
  PROCESANDO: '#3B82F6',   // Blue
  TERMINADO: '#10B981',    // Green
  ERROR: '#EF4444',        // Red
  EXPIRADO: '#F59E0B',     // Amber
  CANCELADO: '#8B5CF6'     // Purple
};

// Iconos para operaciones
export const TICKET_OPERATION_ICONS: Record<keyof TicketOperationType, string> = {
  DESCARGAR_PROPUESTA: '📥',
  ACEPTAR_PROPUESTA: '✅',
  REEMPLAZAR_PROPUESTA: '🔄',
  REGISTRAR_PRELIMINAR: '📝',
  DESCARGAR_INCONSISTENCIAS: '⚠️',
  GENERAR_RESUMEN: '📊'
};
