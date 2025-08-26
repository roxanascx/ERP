// Tipos para PLE (Programa de Libros Electrónicos) - SUNAT

export interface PLEExportOptions {
  incluir_asientos_cero: boolean;
  validar_antes_generar: boolean;
  generar_zip: boolean;
  incluir_metadatos: boolean;
  formato_fecha: string;
  precision_montos: number;
  validar_con_sunat: boolean;
  validar_plan_contable: boolean;
  validar_tipos_documento: boolean;
  enriquecer_con_sunat: boolean;
  permitir_cuentas_personalizadas: boolean;
  fallar_en_errores_criticos: boolean;
  incluir_reporte_validacion: boolean;
}

export interface PLEValidationError {
  codigo: string;
  tabla: string;
  campo: string;
  valor: string;
  mensaje: string;
  critico: boolean;
  sugerencia?: string;
}

export interface PLEValidationWarning {
  codigo: string;
  tabla: string;
  campo: string;
  valor: string;
  mensaje: string;
  sugerencia?: string;
}

export interface PLEValidationStats {
  total_errores: number;
  total_warnings: number;
  errores_criticos: number;
  porcentaje_validado: number;
  cuentas_validadas: number;
  tiempo_validacion: number;
}

export interface PLEValidationBasic {
  valido: boolean;
  total_asientos: number;
  total_debe: string;
  total_haber: string;
  balanceado: boolean;
  errores: string[];
  warnings: string[];
}

export interface PLEValidationSunat {
  valido: boolean;
  total_registros: number;
  registros_validados: number;
  errores: PLEValidationError[];
  warnings: PLEValidationWarning[];
  datos_enriquecidos: number;
  estadisticas: PLEValidationStats;
  tiempo_validacion: number;
}

export interface PLEValidationResult {
  exito: boolean;
  libro_id: string;
  valido: boolean;
  validacion_basica: PLEValidationBasic;
  validacion_sunat: PLEValidationSunat;
  error?: string;
}

export interface PLEExportResult {
  exito: boolean;
  libro_id: string;
  nombre_archivo: string;
  tamaño_txt: number;
  tamaño_zip?: number;
  total_lineas: number;
  contenido_txt: string;
  contenido_zip?: Uint8Array;
  fecha_generacion: string;
  errores: string[];
  warnings: string[];
  metadatos: Record<string, any>;
  validacion_sunat?: Record<string, any>;
  datos_enriquecidos: boolean;
  reporte_validacion?: string;
  error?: string;
}

export interface PLEPreviewResult {
  exito: boolean;
  libro_id: string;
  nombre_archivo: string;
  total_lineas: number;
  lineas_mostradas: number;
  preview_lineas: string[];
  muestra_completa: boolean;
  estadisticas: Record<string, any>;
  error?: string;
}

export interface PLEStatsResult {
  exito: boolean;
  libro_id: string;
  estadisticas: Record<string, any>;
  error?: string;
}

export interface PLEReportResult {
  exito: boolean;
  libro_id: string;
  reporte_texto: string;
  resumen: Record<string, any>;
  validacion_completa: PLEValidationResult;
  error?: string;
}

// Estados de proceso PLE
export type PLEProcessStatus = 
  | 'idle'           // Sin iniciar
  | 'validating'     // Validando
  | 'generating'     // Generando archivo
  | 'downloading'    // Descargando
  | 'success'        // Completado exitosamente
  | 'error';         // Error en el proceso

// Configuración predeterminada para PLE
export const PLE_DEFAULT_OPTIONS: PLEExportOptions = {
  incluir_asientos_cero: true,
  validar_antes_generar: true,
  generar_zip: true,
  incluir_metadatos: true,
  formato_fecha: "DD/MM/YYYY",
  precision_montos: 2,
  validar_con_sunat: true,
  validar_plan_contable: true,
  validar_tipos_documento: true,
  enriquecer_con_sunat: true,
  permitir_cuentas_personalizadas: true,
  fallar_en_errores_criticos: true,
  incluir_reporte_validacion: true
};
