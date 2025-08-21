/**
 * 🚀 RCE Data Management API Service
 * Integración con los nuevos endpoints de gestión avanzada de datos RCE
 */

import api from './api';

// ========================================
// TIPOS DE DATOS
// ========================================

export interface RceDataImportRequest {
  ruc: string;
  periodo: string;
  datos_sunat: RceComprobantesSunat[];
}

export interface RceComprobantesSunat {
  periodo: string;
  fecha_emision: string;
  tipo_documento: string;
  serie_comprobante: string;
  numero_comprobante: string;
  tipo_documento_proveedor: string;
  ruc_proveedor: string;
  razon_social_proveedor: string;
  moneda: string;
  base_imponible_gravada: string;
  igv: string;
  importe_total: string;
  valor_adquisicion_no_gravada?: string;
}

export interface RceResumenAvanzado {
  ruc: string;
  periodo: string;
  total_comprobantes: number;
  total_proveedores: number;
  total_importe_periodo: number;
  total_igv_periodo: number;
  total_base_gravada: number;
  estadisticas_por_tipo: RceEstadisticasTipo[];
  fecha_ultimo_calculo: string;
}

export interface RceEstadisticasTipo {
  tipo_documento: string;
  descripcion: string;
  cantidad: number;
  importe_total: number;
  porcentaje_del_total: number;
}

export interface RceEstadisticasProveedor {
  ruc_proveedor: string;
  razon_social: string;
  total_comprobantes: number;
  total_importe: number;
  promedio_por_comprobante: number;
  tipos_documentos: string[];
  primer_comprobante: string;
  ultimo_comprobante: string;
}

export interface RceResultadoImportacion {
  total_procesados: number;
  exitosos: number;
  errores: number;
  duplicados: number;
  detalles_errores: RceErrorImportacion[];
  status: 'completed' | 'processing' | 'error';
}

export interface RceErrorImportacion {
  comprobante: string;
  error: string;
}

export interface RceResultadoValidacion {
  total_comprobantes: number;
  validos: number;
  con_errores: number;
  errores_encontrados: RceErrorValidacion[];
  status: 'completed' | 'processing' | 'error';
}

export interface RceErrorValidacion {
  comprobante_id: string;
  serie_numero: string;
  error: string;
}

export interface RceComparacionSunat {
  cantidad_local: number;
  cantidad_sunat: number;
  diferencia_cantidad: number;
  importe_local: number;
  importe_sunat: number;
  diferencia_importe: number;
  coincide: boolean;
}

export interface RceConfiguracionPeriodo {
  ruc: string;
  periodo: string;
  descripcion?: string;
  configuracion_validacion?: {
    validar_igv: boolean;
    validar_totales: boolean;
    permitir_retroactivos: boolean;
  };
  configuracion_reportes?: {
    incluir_observados: boolean;
    formato_moneda: string;
  };
  estado_periodo?: string;
  fecha_cierre?: string;
}

export interface RceLogOperacion {
  id: string;
  ruc: string;
  periodo: string;
  operacion: string;
  detalle: string;
  usuario?: string;
  timestamp: string;
  resultado: 'exitoso' | 'error' | 'warning';
}

export interface RceSaludDatos {
  ruc: string;
  periodo: string;
  health_score: number;
  status: 'healthy' | 'warning' | 'critical' | 'error';
  issues: string[];
  summary: {
    total_comprobantes: number;
    total_proveedores: number;
    total_importe: number;
  };
}

// ========================================
// SERVICIO DE API
// ========================================

const DATA_MANAGEMENT_BASE_URL = '/api/v1/sire/rce/data-management';

export const rceDataManagementApi = {
  
  /**
   * 🔍 Health Check del módulo
   */
  async healthCheck(): Promise<{ status: string; message: string; version: string }> {
    const response = await api.get(`${DATA_MANAGEMENT_BASE_URL}/health`);
    return response.data;
  },

  /**
   * 📥 Importar comprobantes masivamente desde SUNAT
   */
  async importarComprobantesSunat(
    ruc: string, 
    periodo: string, 
    datos_sunat: RceComprobantesSunat[]
  ): Promise<RceResultadoImportacion> {
    const response = await api.post(
      `${DATA_MANAGEMENT_BASE_URL}/import/sunat/${ruc}/${periodo}`,
      datos_sunat
    );
    return response.data;
  },

  /**
   * 📊 Obtener resumen avanzado del período
   */
  async obtenerResumenAvanzado(ruc: string, periodo: string): Promise<RceResumenAvanzado> {
    const response = await api.get(
      `${DATA_MANAGEMENT_BASE_URL}/summary/advanced/${ruc}/${periodo}`
    );
    return response.data;
  },

  /**
   * 📈 Obtener estadísticas por proveedor
   */
  async obtenerEstadisticasProveedores(
    ruc: string, 
    periodo: string, 
    limit: number = 20
  ): Promise<{
    periodo: string;
    total_proveedores: number;
    proveedores: RceEstadisticasProveedor[];
  }> {
    const response = await api.get(
      `${DATA_MANAGEMENT_BASE_URL}/statistics/providers/${ruc}/${periodo}?limit=${limit}`
    );
    return response.data;
  },

  /**
   * ✅ Validar comprobantes del período
   */
  async validarComprobantesPeriodo(ruc: string, periodo: string): Promise<{
    message: string;
    ruc: string;
    periodo: string;
    status: string;
  }> {
    const response = await api.post(
      `${DATA_MANAGEMENT_BASE_URL}/validate/${ruc}/${periodo}`,
      {}
    );
    return response.data;
  },

  /**
   * 🔍 Comparar datos locales con SUNAT
   */
  async compararConSunat(
    ruc: string, 
    periodo: string, 
    datos_sunat: { total_documentos: number; total_cp: number }
  ): Promise<RceComparacionSunat> {
    const response = await api.post(
      `${DATA_MANAGEMENT_BASE_URL}/compare/sunat/${ruc}/${periodo}`,
      datos_sunat
    );
    return response.data;
  },

  /**
   * ⚙️ Configurar período
   */
  async configurarPeriodo(
    ruc: string, 
    periodo: string, 
    configuracion: Partial<RceConfiguracionPeriodo>
  ): Promise<RceConfiguracionPeriodo> {
    const response = await api.post(
      `${DATA_MANAGEMENT_BASE_URL}/configure/${ruc}/${periodo}`,
      configuracion
    );
    return response.data;
  },

  /**
   * 🔒 Cerrar período
   */
  async cerrarPeriodo(ruc: string, periodo: string): Promise<{
    message: string;
    ruc: string;
    periodo: string;
    estado: string;
  }> {
    const response = await api.post(
      `${DATA_MANAGEMENT_BASE_URL}/close/${ruc}/${periodo}`,
      {}
    );
    return response.data;
  },

  /**
   * 📋 Obtener logs de operaciones
   */
  async obtenerLogsPeriodo(
    ruc: string, 
    periodo: string, 
    skip: number = 0, 
    limit: number = 100
  ): Promise<{
    periodo: string;
    pagination: {
      skip: number;
      limit: number;
      total: number;
    };
    logs: RceLogOperacion[];
  }> {
    const response = await api.get(
      `${DATA_MANAGEMENT_BASE_URL}/logs/${ruc}/${periodo}?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * 🏥 Obtener estado de salud de los datos
   */
  async obtenerSaludDatos(ruc: string, periodo: string): Promise<RceSaludDatos> {
    const response = await api.get(
      `${DATA_MANAGEMENT_BASE_URL}/health/${ruc}/${periodo}`
    );
    return response.data;
  }
};

// Exportar como default también para compatibilidad
export default rceDataManagementApi;
