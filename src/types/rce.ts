/**
 * Tipos TypeScript para el módulo RCE (Registro de Compras Electrónico)
 * Alineados con los schemas del backend RCE
 */

// ========================================
// TIPOS BASE RCE CON CONST ASSERTIONS
// ========================================

export const RceTipoComprobante = {
  FACTURA: '01',
  BOLETA: '03',
  NOTA_CREDITO: '07',
  NOTA_DEBITO: '08',
  RECIBO_HONORARIOS: '02',
  GUIA_REMISION: '09',
  COMPROBANTE_RETENCION: '20',
  COMPROBANTE_PERCEPCION: '40'
} as const;

export type RceTipoComprobante = typeof RceTipoComprobante[keyof typeof RceTipoComprobante];

export const RceEstadoComprobante = {
  REGISTRADO: 'registrado',
  VALIDADO: 'validado',
  OBSERVADO: 'observado',
  ANULADO: 'anulado',
  INCLUIDO: 'incluido',
  EXCLUIDO: 'excluido',
  PENDIENTE: 'pendiente',
  PROCESADO: 'procesado'
} as const;

export type RceEstadoComprobante = typeof RceEstadoComprobante[keyof typeof RceEstadoComprobante];

export const RceEstadoPropuesta = {
  BORRADOR: 'borrador',
  GENERADA: 'generada',
  VALIDADA: 'validada',
  ENVIADA: 'enviada',
  ACEPTADA: 'aceptada',
  OBSERVADA: 'observada',
  RECHAZADA: 'rechazada'
} as const;

export type RceEstadoPropuesta = typeof RceEstadoPropuesta[keyof typeof RceEstadoPropuesta];

export const RceEstadoProceso = {
  INICIADO: 'iniciado',
  EN_PROCESO: 'en_proceso',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
  ERROR: 'error',
  PENDIENTE: 'pendiente'
} as const;

export type RceEstadoProceso = typeof RceEstadoProceso[keyof typeof RceEstadoProceso];

export const RceMoneda = {
  PEN: 'PEN',
  USD: 'USD',
  EUR: 'EUR'
} as const;

export type RceMoneda = typeof RceMoneda[keyof typeof RceMoneda];

// ========================================
// INTERFACES PRINCIPALES RCE
// ========================================

export interface RceComprobante {
  id?: string;
  ruc: string;
  periodo: string;
  
  // Datos del emisor
  ruc_emisor: string;
  razon_social_emisor: string;
  
  // Datos del comprobante
  tipo_comprobante: RceTipoComprobante;
  serie: string;
  numero: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  
  // Datos monetarios
  moneda: RceMoneda;
  tipo_cambio?: number;
  base_imponible: number;
  igv: number;
  isc?: number;
  otros_tributos?: number;
  importe_total: number;
  
  // Estado y control
  estado: RceEstadoComprobante;
  observaciones?: string;
  errores_validacion?: string[];
  
  // Datos de registro
  fecha_registro?: string;
  fecha_modificacion?: string;
  usuario_registro?: string;
  
  // Datos SUNAT
  cdr_recibido?: boolean;
  hash_cdr?: string;
  numero_autorizacion?: string;
  
  // Flags de control
  incluido_propuesta?: boolean;
  rectificativa?: boolean;
  comprobante_original?: string;
}

export interface RcePropuesta {
  id?: string;
  ruc: string;
  periodo: string;
  
  // Configuración
  tipo_propuesta: 'automatica' | 'manual';
  incluir_no_domiciliados: boolean;
  
  // Estado
  estado: RceEstadoPropuesta;
  
  // Contenido
  comprobantes: RceComprobante[];
  total_registros: number;
  total_importe: number;
  
  // Fechas
  fecha_generacion: string;
  fecha_envio?: string;
  fecha_aceptacion?: string;
  
  // Control SUNAT
  ticket_envio?: string;
  numero_propuesta?: string;
  hash_propuesta?: string;
  
  // Observaciones
  observaciones?: string;
  errores?: string[];
  
  // Metadatos
  usuario_generacion?: string;
  parametros_generacion?: any;
}

export interface RceProceso {
  id?: string;
  ruc: string;
  periodo: string;
  
  // Configuración
  tipo_proceso: 'envio' | 'aceptacion' | 'cancelacion' | 'consulta';
  propuesta_id?: string;
  
  // Estado
  estado: RceEstadoProceso;
  porcentaje_avance: number;
  
  // Ticket SUNAT
  ticket_id?: string;
  ticket_estado?: string;
  
  // Resultados
  comprobantes_enviados: number;
  comprobantes_aceptados: number;
  comprobantes_observados: number;
  total_importe_enviado: number;
  
  // Fechas
  fecha_inicio: string;
  fecha_fin?: string;
  tiempo_estimado?: number;
  
  // Control
  exitoso: boolean;
  mensaje?: string;
  errores?: string[];
  
  // Archivos
  archivos_generados?: string[];
  url_descarga?: string;
  fecha_vencimiento_descarga?: string;
}

// ========================================
// TIPOS DE REQUEST/RESPONSE
// ========================================

export interface RceComprobanteRequest {
  ruc_emisor: string;
  razon_social_emisor?: string;
  tipo_comprobante: RceTipoComprobante;
  serie: string;
  numero: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  moneda: RceMoneda;
  tipo_cambio?: number;
  base_imponible: number;
  igv: number;
  isc?: number;
  otros_tributos?: number;
  importe_total: number;
  observaciones?: string;
}

export interface RcePropuestaRequest {
  ruc: string;
  periodo: string;
  tipo_propuesta: 'automatica' | 'manual';
  incluir_no_domiciliados?: boolean;
  filtros?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    tipo_comprobante?: RceTipoComprobante[];
    estado?: RceEstadoComprobante[];
    ruc_emisor?: string;
    importe_min?: number;
    importe_max?: number;
  };
  observaciones?: string;
}

export interface RceConsultaAvanzadaRequest {
  ruc: string;
  filtros: {
    periodo?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    tipo_comprobante?: RceTipoComprobante[];
    estado?: RceEstadoComprobante[];
    ruc_emisor?: string;
    razon_social_emisor?: string;
    serie?: string;
    numero?: string;
    moneda?: RceMoneda;
    importe_min?: number;
    importe_max?: number;
    incluir_anulados?: boolean;
    incluir_observados?: boolean;
    solo_rectificativas?: boolean;
  };
  ordenar_por?: string;
  orden_desc?: boolean;
}

export interface RceDescargaMasivaRequest {
  ruc: string;
  periodo_inicio: string;
  periodo_fin: string;
  formato: 'txt' | 'xlsx' | 'csv';
  incluir_anulados?: boolean;
  incluir_observados?: boolean;
  filtros?: {
    tipo_comprobante?: RceTipoComprobante[];
    ruc_emisor?: string;
  };
}

export interface RceApiResponse<T = any> {
  exitoso: boolean;
  mensaje: string;
  datos?: T;
  codigo?: string;
  timestamp?: string;
  errores?: string[];
}

// ========================================
// TIPOS DE ESTADÍSTICAS Y REPORTES
// ========================================

export interface RceEstadisticas {
  periodo: string;
  fecha_calculo: string;
  
  // Totales generales
  total_comprobantes: number;
  total_importe: number;
  promedio_importe: number;
  
  // Por tipo de comprobante
  por_tipo_comprobante: Record<string, {
    cantidad: number;
    importe: number;
    porcentaje_cantidad: number;
    porcentaje_importe: number;
  }>;
  
  // Por estado
  por_estado: Record<string, {
    cantidad: number;
    importe: number;
    porcentaje_cantidad: number;
    porcentaje_importe: number;
  }>;
  
  // Por moneda
  por_moneda: Record<string, {
    cantidad: number;
    importe: number;
    importe_pen: number;
    tipo_cambio_promedio: number;
  }>;
  
  // Por emisor (top 10)
  top_emisores: Array<{
    ruc_emisor: string;
    razon_social: string;
    cantidad: number;
    importe: number;
    porcentaje: number;
  }>;
  
  // Tendencias (últimos 6 meses)
  tendencia_mensual: Array<{
    periodo: string;
    cantidad: number;
    importe: number;
    variacion_cantidad: number;
    variacion_importe: number;
  }>;
}

export interface RceResumenPeriodo {
  periodo: string;
  empresa: {
    ruc: string;
    razon_social: string;
  };
  
  // Resumen general
  total_comprobantes: number;
  total_importe: number;
  total_igv: number;
  
  // Por estado
  comprobantes_validados: number;
  comprobantes_observados: number;
  comprobantes_anulados: number;
  
  // Propuestas
  total_propuestas: number;
  propuestas_enviadas: number;
  propuestas_aceptadas: number;
  
  // Comparativo (periodo anterior)
  comparativo?: {
    variacion_comprobantes: number;
    variacion_importe: number;
    variacion_igv: number;
  };
  
  // Alertas
  alertas: Array<{
    tipo: 'error' | 'warning' | 'info';
    mensaje: string;
    cantidad_afectada?: number;
  }>;
}

// Nuevo tipo para la respuesta directa de SUNAT
export interface RceResumenSunat {
  exitoso: boolean;
  mensaje: string;
  ruc: string;
  periodo: string;
  datos: {
    tipo: string;
    total_documentos: number;
    total_cp: number;
    valor_adq_ng: number;
    contenido_raw: string;
  } | null;
  total_lineas: number;
  contenido_completo: string;
}

// ========================================
// TIPOS DE FILTROS Y BÚSQUEDA
// ========================================

export interface RceFiltros {
  periodo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_comprobante?: RceTipoComprobante[];
  estado?: RceEstadoComprobante[];
  ruc_emisor?: string;
  razon_social_emisor?: string;
  serie?: string;
  numero?: string;
  moneda?: RceMoneda;
  importe_min?: number;
  importe_max?: number;
  incluir_anulados?: boolean;
  incluir_observados?: boolean;
  solo_rectificativas?: boolean;
  texto_libre?: string;
}

export interface RcePaginacion {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RceOrdenamiento {
  campo: string;
  direccion: 'asc' | 'desc';
}

// ========================================
// TIPOS DE VALIDACIÓN
// ========================================

export interface RceValidacion {
  campo: string;
  tipo: 'error' | 'warning' | 'info';
  mensaje: string;
  valor_actual?: any;
  valor_esperado?: any;
  sugerencia?: string;
}

export interface RceResultadoValidacion {
  comprobante_id: string;
  valido: boolean;
  errores: RceValidacion[];
  warnings: RceValidacion[];
  score_calidad: number; // 0-100
}

// ========================================
// TIPOS DE TICKET Y PROCESOS ASINCRÓNICOS
// ========================================

export interface RceTicket {
  ticket_id: string;
  ruc: string;
  tipo_operacion: string;
  estado: 'iniciado' | 'procesando' | 'completado' | 'error' | 'cancelado';
  porcentaje_avance: number;
  mensaje_usuario?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_vencimiento?: string;
  
  // Resultados
  resultados_disponibles: boolean;
  archivos_disponibles: string[];
  url_descarga?: string;
  
  // Errores
  errores?: string[];
  reintentos: number;
  max_reintentos: number;
}

// ========================================
// TIPOS DE CONFIGURACIÓN
// ========================================

export interface RceConfiguracion {
  ruc: string;
  
  // Configuración general
  periodo_actual: string;
  modo_importacion: 'automatico' | 'manual';
  validacion_estricta: boolean;
  auto_incluir_nuevos: boolean;
  
  // Configuración de propuestas
  generar_propuesta_auto: boolean;
  incluir_no_domiciliados_auto: boolean;
  validar_antes_envio: boolean;
  
  // Configuración de notificaciones
  notificar_nuevos_comprobantes: boolean;
  notificar_errores_validacion: boolean;
  notificar_completar_procesos: boolean;
  
  // Configuración de respaldos
  backup_automatico: boolean;
  dias_retencion_backup: number;
  
  // Última actualización
  fecha_actualizacion: string;
  usuario_actualizacion: string;
}

// ========================================
// HELPERS Y UTILIDADES
// ========================================

export const RceUtils = {
  // Formatear periodo
  formatearPeriodo: (periodo: string): string => {
    if (periodo.length === 6) {
      const año = periodo.substring(0, 4);
      const mes = periodo.substring(4, 6);
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${meses[parseInt(mes) - 1]} ${año}`;
    }
    return periodo;
  },
  
  // Validar periodo
  validarPeriodo: (periodo: string): boolean => {
    return /^\d{6}$/.test(periodo) && 
           parseInt(periodo.substring(4, 6)) >= 1 && 
           parseInt(periodo.substring(4, 6)) <= 12;
  },
  
  // Obtener descripción de tipo de comprobante
  descripcionTipoComprobante: (tipo: RceTipoComprobante): string => {
    const descripciones = {
      [RceTipoComprobante.FACTURA]: 'Factura',
      [RceTipoComprobante.BOLETA]: 'Boleta de Venta',
      [RceTipoComprobante.NOTA_CREDITO]: 'Nota de Crédito',
      [RceTipoComprobante.NOTA_DEBITO]: 'Nota de Débito',
      [RceTipoComprobante.RECIBO_HONORARIOS]: 'Recibo por Honorarios',
      [RceTipoComprobante.GUIA_REMISION]: 'Guía de Remisión',
      [RceTipoComprobante.COMPROBANTE_RETENCION]: 'Comprobante de Retención',
      [RceTipoComprobante.COMPROBANTE_PERCEPCION]: 'Comprobante de Percepción'
    };
    return descripciones[tipo] || tipo;
  },
  
  // Formatear moneda
  formatearImporte: (importe: number, moneda: RceMoneda = RceMoneda.PEN): string => {
    const simbolos = {
      [RceMoneda.PEN]: 'S/',
      [RceMoneda.USD]: '$',
      [RceMoneda.EUR]: '€'
    };
    return `${simbolos[moneda]} ${importe.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },
  
  // Calcular porcentaje
  calcularPorcentaje: (parte: number, total: number): number => {
    return total > 0 ? Math.round((parte / total) * 100) : 0;
  },
  
  // Validar RUC
  validarRuc: (ruc: string): boolean => {
    return /^\d{11}$/.test(ruc);
  },
  
  // Obtener color por estado
  colorPorEstado: (estado: RceEstadoComprobante | RceEstadoPropuesta | RceEstadoProceso): string => {
    const colores: Record<string, string> = {
      // Estados de comprobante
      'registrado': '#3b82f6',
      'validado': '#10b981',
      'observado': '#f59e0b',
      'anulado': '#ef4444',
      'incluido': '#8b5cf6',
      'excluido': '#6b7280',
      'pendiente': '#f59e0b',
      'procesado': '#10b981',
      
      // Estados de propuesta
      'borrador': '#6b7280',
      'generada': '#3b82f6',
      'enviada': '#8b5cf6',
      'aceptada': '#10b981',
      'rechazada': '#ef4444',
      
      // Estados de proceso
      'iniciado': '#3b82f6',
      'en_proceso': '#8b5cf6',
      'completado': '#10b981',
      'cancelado': '#6b7280',
      'error': '#ef4444'
    };
    return colores[estado] || '#6b7280';
  }
};

// ========================================
// TIPOS DE INTEGRACIÓN CON SIRE EXISTENTE
// ========================================

// Extender el tipo de módulo activo para incluir RCE
export type SireModuloActivo = 'home' | 'rvie' | 'rce';

// Configuración de empresa para RCE
export interface EmpresaConfigRce {
  rce_activo: boolean;
  rce_configuracion?: RceConfiguracion;
}

// Respuesta de API unificada
export interface SireApiResponse<T = any> extends RceApiResponse<T> {
  modulo: 'rvie' | 'rce';
}
