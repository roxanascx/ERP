/**
 * Servicio API para el módulo RCE (Registro de Compras Electrónico)
 * Comunicación con endpoints del backend RCE implementado
 */

import api from './api';
import type {
  RceComprobante,
  RceComprobanteRequest,
  RcePropuesta,
  RcePropuestaRequest,
  RceProceso,
  RceConsultaAvanzadaRequest,
  RceDescargaMasivaRequest,
  RceEstadisticas,
  RceResumenPeriodo,
  RceResumenSunat,
  RceApiResponse,
  RceTicket,
  RceFiltros,
  RceResultadoValidacion,
  RceComprobantesDetalladosResponse
} from '../types/rce';

// ========================================
// CONFIGURACIÓN BASE
// ========================================

const RCE_BASE_URL = '/api/v1/sire/rce';

// Tipos para credenciales SUNAT
interface CredencialesSunat {
  usuario_sunat: string;
  clave_sunat: string;
}

// ========================================
// SERVICIO DE COMPROBANTES RCE
// ========================================

export const rceComprobantesApi = {
  /**
   * CRUD Comprobantes
   */
  async crear(ruc: string, comprobante: RceComprobanteRequest): Promise<RceApiResponse<RceComprobante>> {
    const response = await api.post(`${RCE_BASE_URL}/comprobantes`, {
      ruc,
      ...comprobante
    });
    return response.data;
  },

  async obtenerPorId(ruc: string, comprobanteId: string): Promise<RceApiResponse<RceComprobante>> {
    const response = await api.get(`${RCE_BASE_URL}/comprobantes/${comprobanteId}`, {
      params: { ruc }
    });
    return response.data;
  },

  async actualizar(
    ruc: string, 
    comprobanteId: string, 
    comprobante: Partial<RceComprobanteRequest>
  ): Promise<RceApiResponse<RceComprobante>> {
    const response = await api.put(`${RCE_BASE_URL}/comprobantes/${comprobanteId}`, {
      ruc,
      ...comprobante
    });
    return response.data;
  },

  async eliminar(ruc: string, comprobanteId: string): Promise<RceApiResponse<void>> {
    const response = await api.delete(`${RCE_BASE_URL}/comprobantes/${comprobanteId}`, {
      params: { ruc }
    });
    return response.data;
  },

  /**
   * Búsqueda y consultas
   */
  async buscar(
    request: RceConsultaAvanzadaRequest, 
    limit = 100, 
    offset = 0,
    ordenarPor = 'fecha_emision',
    ordenDesc = true
  ): Promise<RceApiResponse<{
    comprobantes: RceComprobante[];
    total: number;
    offset: number;
    limit: number;
    filtros_aplicados: any;
  }>> {
    const response = await api.post(`${RCE_BASE_URL}/comprobantes/buscar`, request, {
      params: { 
        limit, 
        offset,
        ordenar_por: ordenarPor,
        orden_desc: ordenDesc
      }
    });
    return response.data;
  },

  async buscarSimple(
    ruc: string,
    filtros: RceFiltros,
    limit = 50,
    offset = 0
  ): Promise<RceApiResponse<{
    comprobantes: RceComprobante[];
    total: number;
  }>> {
    const request: RceConsultaAvanzadaRequest = {
      ruc,
      filtros: {
        periodo: filtros.periodo,
        fecha_inicio: filtros.fecha_inicio,
        fecha_fin: filtros.fecha_fin,
        tipo_comprobante: filtros.tipo_comprobante,
        estado: filtros.estado,
        ruc_emisor: filtros.ruc_emisor,
        serie: filtros.serie,
        numero: filtros.numero,
        moneda: filtros.moneda,
        importe_min: filtros.importe_min,
        importe_max: filtros.importe_max,
        incluir_anulados: filtros.incluir_anulados,
        incluir_observados: filtros.incluir_observados
      }
    };
    
    return this.buscar(request, limit, offset);
  },

  /**
   * Validación masiva
   */
  async validarMasivo(ruc: string, comprobanteIds: string[]): Promise<RceApiResponse<{
    validados: number;
    observados: number;
    errores: Array<{ id: string; error: string }>;
    resultados: RceResultadoValidacion[];
  }>> {
    const response = await api.post(`${RCE_BASE_URL}/comprobantes/validar-masivo`, {
      ruc,
      comprobante_ids: comprobanteIds
    });
    return response.data;
  },

  async validarIndividual(ruc: string, comprobanteId: string): Promise<RceApiResponse<RceResultadoValidacion>> {
    const response = await api.post(`${RCE_BASE_URL}/comprobantes/${comprobanteId}/validar`, {
      ruc
    });
    return response.data;
  },

  /**
   * Estadísticas
   */
  async obtenerEstadisticas(ruc: string, periodo?: string): Promise<RceApiResponse<RceEstadisticas>> {
    const response = await api.get(`${RCE_BASE_URL}/comprobantes/estadisticas`, {
      params: { ruc, periodo }
    });
    return response.data;
  },

  async obtenerResumenPeriodo(ruc: string, periodo: string): Promise<RceResumenSunat> {
    // Usar el endpoint exitoso que funciona correctamente
    const response = await api.get(`${RCE_BASE_URL}/comprobantes/resumen-sunat`, {
      params: { ruc, periodo }
    });
    return response.data;
  },

  async obtenerComprobantesDetallados(ruc: string, periodo: string): Promise<RceComprobantesDetalladosResponse> {
    // Nuevo endpoint para obtener comprobantes individuales con datos de proveedor
    const response = await api.get(`${RCE_BASE_URL}/comprobantes/comprobantes-detallados`, {
      params: { ruc, periodo }
    });
    return response.data;
  },

  /**
   * Exportación
   */
  async exportarCsv(
    request: RceConsultaAvanzadaRequest,
    incluirCabeceras = true,
    separador = ',',
    codificacion = 'utf-8'
  ): Promise<Blob> {
    const response = await api.post(`${RCE_BASE_URL}/comprobantes/exportar/csv`, request, {
      params: {
        incluir_cabeceras: incluirCabeceras,
        separador,
        codificacion
      },
      responseType: 'blob'
    });
    return response.data;
  },

  async exportarExcel(
    request: RceConsultaAvanzadaRequest,
    incluirResumen = true,
    incluirGraficos = false
  ): Promise<Blob> {
    const response = await api.post(`${RCE_BASE_URL}/comprobantes/exportar/excel`, request, {
      params: {
        incluir_resumen: incluirResumen,
        incluir_graficos: incluirGraficos
      },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Health check
   */
  async healthCheck(ruc: string): Promise<RceApiResponse<{
    timestamp: string;
    modulo: string;
    estado: string;
    estadisticas: any;
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/comprobantes/health`, {
      params: { ruc }
    });
    return response.data;
  }
};

// ========================================
// SERVICIO DE PROPUESTAS RCE
// ========================================

export const rcePropuestasApi = {
  /**
   * Generar propuesta
   */
  async generar(request: RcePropuestaRequest): Promise<RceApiResponse<RcePropuesta>> {
    const response = await api.post(`${RCE_BASE_URL}/propuestas/generar`, request);
    return response.data;
  },

  async generarAutomatica(
    ruc: string, 
    periodo: string,
    incluirNoDomiciliados = false
  ): Promise<RceApiResponse<RcePropuesta>> {
    const request: RcePropuestaRequest = {
      ruc,
      periodo,
      tipo_propuesta: 'automatica',
      incluir_no_domiciliados: incluirNoDomiciliados
    };
    return this.generar(request);
  },

  async generarManual(
    ruc: string,
    periodo: string,
    filtros: RceFiltros,
    observaciones?: string
  ): Promise<RceApiResponse<RcePropuesta>> {
    const request: RcePropuestaRequest = {
      ruc,
      periodo,
      tipo_propuesta: 'manual',
      filtros: {
        fecha_inicio: filtros.fecha_inicio,
        fecha_fin: filtros.fecha_fin,
        tipo_comprobante: filtros.tipo_comprobante,
        estado: filtros.estado,
        ruc_emisor: filtros.ruc_emisor,
        importe_min: filtros.importe_min,
        importe_max: filtros.importe_max
      },
      observaciones
    };
    return this.generar(request);
  },

  /**
   * Enviar propuesta a SUNAT
   */
  async enviar(
    ruc: string, 
    propuestaId: string, 
    credenciales: CredencialesSunat
  ): Promise<RceApiResponse<RceProceso>> {
    const response = await api.post(`${RCE_BASE_URL}/propuestas/enviar`, {
      ruc,
      propuesta_id: propuestaId,
      credenciales
    });
    return response.data;
  },

  /**
   * Gestión de propuestas
   */
  async obtenerPorId(ruc: string, propuestaId: string): Promise<RceApiResponse<RcePropuesta>> {
    const response = await api.get(`${RCE_BASE_URL}/propuestas/${propuestaId}`, {
      params: { ruc }
    });
    return response.data;
  },

  async actualizar(
    ruc: string,
    propuestaId: string,
    datos: Partial<RcePropuestaRequest>
  ): Promise<RceApiResponse<RcePropuesta>> {
    const response = await api.put(`${RCE_BASE_URL}/propuestas/${propuestaId}`, {
      ruc,
      ...datos
    });
    return response.data;
  },

  async eliminar(ruc: string, propuestaId: string): Promise<RceApiResponse<void>> {
    const response = await api.delete(`${RCE_BASE_URL}/propuestas/${propuestaId}`, {
      params: { ruc }
    });
    return response.data;
  },

  async listar(ruc: string, filtros?: {
    periodo?: string;
    estado?: string;
    tipo_propuesta?: string;
    limit?: number;
    offset?: number;
  }): Promise<RceApiResponse<{
    propuestas: RcePropuesta[];
    total: number;
  }>> {
    const url = `${RCE_BASE_URL}/propuestas`;
    const params = { ruc, ...filtros };
    
    console.log('🌐 [RCE API] Haciendo petición GET a:', url);
    console.log('🌐 [RCE API] Con parámetros:', params);
    console.log('🌐 [RCE API] URL completa construida:', url, 'params:', params);
    
    try {
      const response = await api.get(url, { params });
      console.log('🌐 [RCE API] Respuesta recibida:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 [RCE API] Error en petición:', error);
      console.error('🌐 [RCE API] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
      throw error;
    }
  },

  /**
   * Resumen de periodo
   */
  async resumenPeriodo(ruc: string, periodo: string): Promise<RceApiResponse<{
    total_propuestas: number;
    propuestas_enviadas: number;
    propuestas_aceptadas: number;
    total_comprobantes: number;
    total_importe: number;
    ultima_propuesta: RcePropuesta;
    estado_periodo: string;
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/propuestas/resumen`, {
      params: { ruc, periodo }
    });
    return response.data;
  },

  /**
   * Operaciones de estado
   */
  async validar(ruc: string, propuestaId: string): Promise<RceApiResponse<{
    valida: boolean;
    errores: string[];
    warnings: string[];
  }>> {
    const response = await api.post(`${RCE_BASE_URL}/propuestas/${propuestaId}/validar`, {
      ruc
    });
    return response.data;
  },

  async cambiarEstado(
    ruc: string,
    propuestaId: string,
    nuevoEstado: string,
    observaciones?: string
  ): Promise<RceApiResponse<RcePropuesta>> {
    const response = await api.put(`${RCE_BASE_URL}/propuestas/${propuestaId}/estado`, {
      ruc,
      nuevo_estado: nuevoEstado,
      observaciones
    });
    return response.data;
  }
};

// ========================================
// SERVICIO DE PROCESOS RCE
// ========================================

export const rceProcesosApi = {
  /**
   * Envío de procesos
   */
  async enviar(
    ruc: string,
    periodo: string,
    tipoEnvio: string,
    credenciales: CredencialesSunat,
    observaciones?: string
  ): Promise<RceApiResponse<RceProceso>> {
    const response = await api.post(`${RCE_BASE_URL}/procesos/enviar`, {
      ruc,
      periodo,
      tipo_envio: tipoEnvio,
      credenciales,
      observaciones
    });
    return response.data;
  },

  /**
   * Consultar estado de proceso
   */
  async consultarEstado(ruc: string, periodo: string, ticketId?: string): Promise<RceApiResponse<RceProceso>> {
    const response = await api.get(`${RCE_BASE_URL}/procesos/${periodo}`, {
      params: { ruc, ticket_id: ticketId }
    });
    return response.data;
  },

  /**
   * Cancelar proceso
   */
  async cancelar(
    ruc: string, 
    periodo: string, 
    motivo: string, 
    credenciales: CredencialesSunat
  ): Promise<RceApiResponse<RceProceso>> {
    const response = await api.post(`${RCE_BASE_URL}/procesos/${periodo}/cancelar`, {
      motivo,
      credenciales
    }, {
      params: { ruc }
    });
    return response.data;
  },

  /**
   * Listar procesos
   */
  async listar(ruc: string, filtros?: {
    estado?: string;
    periodo_inicio?: string;
    periodo_fin?: string;
    tipo_proceso?: string;
    limit?: number;
  }): Promise<RceApiResponse<{
    procesos: RceProceso[];
    total: number;
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/procesos`, {
      params: { ruc, ...filtros }
    });
    return response.data;
  },

  /**
   * Gestión de tickets
   */
  async consultarTicket(
    ruc: string,
    ticketId: string,
    credenciales: CredencialesSunat,
    actualizarDesdeSunat = true
  ): Promise<RceApiResponse<RceTicket>> {
    const response = await api.get(`${RCE_BASE_URL}/tickets/${ticketId}`, {
      data: { credenciales },
      params: { ruc, actualizar_desde_sunat: actualizarDesdeSunat }
    });
    return response.data;
  },

  async listarTicketsActivos(ruc: string, limit = 20): Promise<RceApiResponse<{
    tickets: RceTicket[];
    total: number;
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/tickets`, {
      params: { ruc, limit }
    });
    return response.data;
  },

  async actualizarEstadoTicket(
    ruc: string,
    ticketId: string,
    credenciales: CredencialesSunat
  ): Promise<RceApiResponse<{
    ticket: RceTicket;
    estado_cambio: boolean;
    estado_anterior: string;
    estado_actual: string;
  }>> {
    const response = await api.post(`${RCE_BASE_URL}/tickets/${ticketId}/actualizar`, {
      credenciales
    }, {
      params: { ruc }
    });
    return response.data;
  },

  /**
   * Descarga masiva
   */
  async solicitarDescargaMasiva(
    ruc: string,
    request: RceDescargaMasivaRequest,
    credenciales: CredencialesSunat
  ): Promise<RceApiResponse<RceTicket>> {
    const response = await api.post(`${RCE_BASE_URL}/descarga-masiva`, {
      ...request,
      credenciales
    }, {
      params: { ruc }
    });
    return response.data;
  },

  async consultarEstadoDescargaMasiva(
    ruc: string,
    ticketId: string,
    credenciales: CredencialesSunat
  ): Promise<RceApiResponse<{
    ticket_id: string;
    estado: string;
    porcentaje_avance: number;
    resultados_disponibles: boolean;
    archivos_disponibles: string[];
    url_descarga?: string;
    fecha_vencimiento?: string;
    mensaje: string;
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/descarga-masiva/${ticketId}/estado`, {
      data: { credenciales },
      params: { ruc }
    });
    return response.data;
  },

  async descargarArchivo(
    ruc: string,
    ticketId: string,
    nombreArchivo: string,
    credenciales: CredencialesSunat
  ): Promise<Blob> {
    const response = await api.get(`${RCE_BASE_URL}/descargar-archivo`, {
      data: { credenciales },
      params: { ruc, ticket_id: ticketId, nombre_archivo: nombreArchivo },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Estadísticas de procesos
   */
  async obtenerEstadisticas(ruc: string, año?: number): Promise<RceApiResponse<{
    por_estado: Record<string, any>;
    por_periodo: Array<any>;
    totales: {
      procesos_total: number;
      comprobantes_total: number;
      importe_total: number;
    };
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/procesos/estadisticas`, {
      params: { ruc, año }
    });
    return response.data;
  }
};

// ========================================
// SERVICIO DE CONSULTAS AVANZADAS
// ========================================

export const rceConsultasApi = {
  /**
   * Consulta avanzada
   */
  async consultaAvanzada(
    request: RceConsultaAvanzadaRequest, 
    paginacion?: {
      limit?: number;
      offset?: number;
      ordenar_por?: string;
      orden_desc?: boolean;
    }
  ): Promise<RceApiResponse<{
    comprobantes: RceComprobante[];
    total: number;
    filtros_aplicados: any;
    tiempo_consulta: number;
  }>> {
    const response = await api.post(`${RCE_BASE_URL}/consultas/avanzada`, request, {
      params: paginacion
    });
    return response.data;
  },

  /**
   * Generar reportes
   */
  async generarReporte(
    ruc: string,
    parametros: {
      periodo_inicio: string;
      periodo_fin: string;
      tipo_comprobante?: string[];
      estado_comprobante?: string[];
      formato_salida: 'xlsx' | 'csv' | 'pdf';
      incluir_detalles?: boolean;
      incluir_graficos?: boolean;
      agrupar_por?: string;
    },
    credenciales: CredencialesSunat
  ): Promise<RceApiResponse<{
    nombre_archivo: string;
    url_descarga: string;
    fecha_generacion: string;
    tamaño_archivo: number;
  }>> {
    const response = await api.post(`${RCE_BASE_URL}/reportes/generar`, {
      ruc,
      parametros,
      credenciales
    });
    return response.data;
  },

  async generarResumenPeriodo(
    ruc: string,
    periodo: string,
    incluirComparativo = false
  ): Promise<RceApiResponse<RceResumenPeriodo>> {
    const response = await api.post(`${RCE_BASE_URL}/reportes/resumen-periodo`, {
      ruc,
      periodo,
      incluir_comparativo: incluirComparativo
    });
    return response.data;
  },

  /**
   * Detectar problemas
   */
  async detectarDuplicados(
    ruc: string, 
    periodo?: string, 
    criterio = 'estricto',
    limit = 100
  ): Promise<RceApiResponse<Array<{
    grupo: string;
    comprobantes: RceComprobante[];
    criterio_deteccion: string;
    nivel_similitud: number;
  }>>> {
    const response = await api.get(`${RCE_BASE_URL}/consultas/duplicados`, {
      params: { ruc, periodo, criterio, limit }
    });
    return response.data;
  },

  async detectarInconsistencias(
    ruc: string, 
    periodo?: string,
    tipoValidacion = 'todas',
    nivelSeveridad = 'medio'
  ): Promise<RceApiResponse<Array<{
    comprobante_id: string;
    tipo: string;
    descripcion: string;
    severidad: 'bajo' | 'medio' | 'alto';
    sugerencia: string;
    valor_actual?: any;
    valor_esperado?: any;
  }>>> {
    const response = await api.get(`${RCE_BASE_URL}/consultas/inconsistencias`, {
      params: { 
        ruc, 
        periodo, 
        tipo_validacion: tipoValidacion,
        nivel_severidad: nivelSeveridad
      }
    });
    return response.data;
  },

  /**
   * Análisis de tendencias
   */
  async analizarTendencias(
    ruc: string,
    filtros: any,
    tipoAnalisis = 'mensual',
    metricas = ['importe', 'cantidad']
  ): Promise<RceApiResponse<{
    tipo_analisis: string;
    periodo_analizado: string;
    metricas: string[];
    tendencias: Array<{
      periodo: string;
      valores: Record<string, number>;
      variacion: Record<string, number>;
    }>;
    proyecciones: Record<string, number>;
    alertas: string[];
  }>> {
    const response = await api.post(`${RCE_BASE_URL}/analisis/tendencias`, {
      ruc,
      filtros,
      tipo_analisis: tipoAnalisis,
      metricas
    });
    return response.data;
  },

  /**
   * Rankings y estadísticas
   */
  async rankingProveedores(
    ruc: string, 
    periodoInicio: string, 
    periodoFin: string, 
    criterio = 'importe',
    limit = 50,
    incluirDetalles = true
  ): Promise<RceApiResponse<Array<{
    ruc_proveedor: string;
    razon_social: string;
    total_comprobantes: number;
    total_importe: number;
    promedio_importe: number;
    posicion: number;
    tendencia: 'subiendo' | 'bajando' | 'estable';
    detalles?: any;
  }>>> {
    const response = await api.get(`${RCE_BASE_URL}/consultas/proveedores/ranking`, {
      params: { 
        ruc, 
        periodo_inicio: periodoInicio, 
        periodo_fin: periodoFin, 
        criterio,
        limit,
        incluir_detalles: incluirDetalles
      }
    });
    return response.data;
  },

  async estadisticasPeriodo(
    ruc: string, 
    periodo: string, 
    incluirComparativo = true,
    incluirGraficos = false
  ): Promise<RceApiResponse<{
    periodo_actual: RceEstadisticas;
    periodo_anterior?: RceEstadisticas;
    variacion?: Record<string, number>;
    graficos?: any;
    insights: string[];
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/consultas/estadisticas/periodo`, {
      params: { 
        ruc, 
        periodo, 
        incluir_comparativo: incluirComparativo,
        incluir_graficos: incluirGraficos
      }
    });
    return response.data;
  },

  /**
   * Exportaciones especializadas
   */
  async exportarCsv(
    request: RceConsultaAvanzadaRequest,
    opciones?: {
      incluir_cabeceras?: boolean;
      separador?: string;
      codificacion?: string;
    }
  ): Promise<Blob> {
    const response = await api.post(`${RCE_BASE_URL}/exportaciones/csv`, request, {
      params: opciones,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportarExcel(
    request: RceConsultaAvanzadaRequest,
    opciones?: {
      incluir_resumen?: boolean;
      incluir_graficos?: boolean;
      multiples_hojas?: boolean;
    }
  ): Promise<Blob> {
    const response = await api.post(`${RCE_BASE_URL}/exportaciones/excel`, request, {
      params: opciones,
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Health check
   */
  async healthCheck(
    ruc: string,
    verificarConexionSunat = false
  ): Promise<RceApiResponse<{
    timestamp: string;
    modulo: string;
    estado: string;
    estadisticas: any;
    sunat_disponible?: boolean;
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/consultas/health`, {
      params: { ruc, verificar_conexion_sunat: verificarConexionSunat }
    });
    return response.data;
  }
};

// ========================================
// SERVICIO INTEGRADO RCE
// ========================================

export const rceApi = {
  comprobantes: rceComprobantesApi,
  propuestas: rcePropuestasApi,
  procesos: rceProcesosApi,
  consultas: rceConsultasApi,

  // Métodos de conveniencia
  async healthCheckCompleto(ruc: string): Promise<{
    comprobantes: boolean;
    propuestas: boolean;
    procesos: boolean;
    consultas: boolean;
    general: boolean;
  }> {
    try {
      const [comprobantesHealth, consultasHealth] = await Promise.allSettled([
        rceComprobantesApi.healthCheck(ruc),
        rceConsultasApi.healthCheck(ruc)
      ]);

      return {
        comprobantes: comprobantesHealth.status === 'fulfilled' && comprobantesHealth.value.exitoso,
        propuestas: true, // Las propuestas dependen de comprobantes
        procesos: true, // Los procesos dependen de propuestas
        consultas: consultasHealth.status === 'fulfilled' && consultasHealth.value.exitoso,
        general: comprobantesHealth.status === 'fulfilled' && consultasHealth.status === 'fulfilled'
      };
    } catch (error) {
      return {
        comprobantes: false,
        propuestas: false,
        procesos: false,
        consultas: false,
        general: false
      };
    }
  }
};

export default rceApi;
