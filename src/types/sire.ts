/**
 * Tipos TypeScript para el módulo SIRE
 * Alineados con los schemas del backend
 */

// ========================================
// TIPOS BASE RVIE
// ========================================

export interface RvieComprobante {
  ruc_emisor: string;
  tipo_comprobante: string;
  serie: string;
  numero: string;
  fecha_emision: string;
  moneda: string;
  importe_total: number;
  estado?: string;
  observaciones?: string;
}

export interface RviePropuesta {
  periodo: string;
  ruc: string;
  comprobantes: RvieComprobante[];
  total_registros: number;
  fecha_generacion: string;
  estado: string;
}

export interface RvieInconsistencia {
  linea: number;
  campo: string;
  valor_detectado: string;
  valor_esperado?: string;
  descripcion: string;
  severidad: 'ERROR' | 'WARNING' | 'INFO';
}

// ========================================
// REQUESTS RVIE
// ========================================

export interface RvieDescargarPropuestaRequest {
  periodo: string; // YYYYMM
  fase?: 'propuesta' | 'definitiva';
}

export interface RvieAceptarPropuestaRequest {
  periodo: string;
  ticket_id?: string;
}

export interface RvieReemplazarPropuestaRequest {
  periodo: string;
  archivo_contenido: string; // Base64 encoded
  nombre_archivo: string;
}

export interface RvieRegistrarPreliminarRequest {
  periodo: string;
  comprobantes: RvieComprobante[];
}

// ========================================
// RESPONSES RVIE
// ========================================

export interface RvieProcesoResponse {
  ticket_id: string;
  estado: 'INICIADO' | 'EN_PROCESO' | 'COMPLETADO' | 'ERROR';
  mensaje: string;
  fecha_inicio: string;
  fecha_fin?: string;
  detalles?: any;
}

export interface RvieTicketResponse {
  ticket_id: string;
  estado: 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR';
  progreso: number; // 0-100
  mensaje: string;
  archivo_disponible: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  errores?: string[];
}

export interface RvieArchivoResponse {
  ticket_id: string;
  nombre_archivo: string;
  contenido: string; // Base64 encoded
  tipo_mime: string;
  tamaño: number;
  hash_md5: string;
}

export interface RvieResumenResponse {
  periodo: string;
  ruc: string;
  total_comprobantes: number;
  total_importe: number;
  fecha_ultima_actualizacion: string;
  estado_proceso: string;
  inconsistencias_pendientes: number;
  tickets_activos: string[];
}

// ========================================
// TIPOS DE ESTADO Y UI
// ========================================

export interface RvieEstado {
  periodo: string;
  fase: 'propuesta' | 'definitiva';
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'ERROR';
  ultimo_ticket?: string;
  fecha_actualizacion: string;
}

export interface RvieFormData {
  periodo: string;
  tipo_operacion: 'descargar' | 'aceptar' | 'reemplazar' | 'preliminar';
  archivo?: File;
  comprobantes?: RvieComprobante[];
}

// ========================================
// TIPOS GENERALES SIRE
// ========================================

export interface SireCredentials {
  sunat_usuario: string;
  sunat_clave: string;
  ruc: string;
}

export interface SireAuthStatus {
  authenticated: boolean;
  expires_at?: string;
  last_login?: string;
  session_id?: string;
}

export interface SireStatusResponse {
  ruc: string;
  sire_activo: boolean;
  credenciales_validas: boolean;
  sesion_activa: boolean;
  token_expira_en?: number;
  ultima_autenticacion?: string;
  ultima_actividad?: string;
  servicios_disponibles: string[];
  servicios_activos: string[];
  version_api?: string;
  servidor_region?: string;
  consulta_timestamp: string;
}

export interface SireApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// ========================================
// HOOKS Y UTILITIES
// ========================================

export interface UseRvieOptions {
  ruc: string;
  auto_refresh?: boolean;
  refresh_interval?: number;
}

export interface RvieContextValue {
  estado: RvieEstado | null;
  tickets: RvieTicketResponse[];
  loading: boolean;
  error: SireApiError | null;
  
  // Acciones
  descargarPropuesta: (request: RvieDescargarPropuestaRequest) => Promise<RvieProcesoResponse>;
  aceptarPropuesta: (request: RvieAceptarPropuestaRequest) => Promise<RvieProcesoResponse>;
  reemplazarPropuesta: (request: RvieReemplazarPropuestaRequest) => Promise<RvieProcesoResponse>;
  registrarPreliminar: (request: RvieRegistrarPreliminarRequest) => Promise<RvieProcesoResponse>;
  consultarTicket: (ticketId: string) => Promise<RvieTicketResponse>;
  descargarArchivo: (ticketId: string) => Promise<RvieArchivoResponse>;
  
  // Utilidades
  refreshEstado: () => Promise<void>;
  clearError: () => void;
}
