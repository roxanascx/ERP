/**
 * Servicio para gestión de comprobantes RCE en base de datos
 */

import api from './api';

// Tipos para la respuesta del backend
export interface RceComprobanteBD {
  id: string;
  ruc: string;
  periodo: string;
  ruc_proveedor: string;
  razon_social_proveedor: string;
  tipo_documento: string;
  serie_comprobante: string;
  numero_comprobante: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  moneda: string;
  tipo_cambio: number;
  base_imponible_gravada: number;
  igv: number;
  valor_adquisicion_no_gravada: number;
  isc: number;
  icbper: number;
  otros_tributos: number;
  importe_total: number;
  estado: string;
  fecha_registro: string;
  fecha_actualizacion?: string;
  origen: string;
  observaciones?: string;
}

export interface RceEstadisticasBD {
  total_comprobantes: number;
  total_monto: number;
  por_estado: Record<string, number>;
  por_proveedor: Record<string, number>;
  por_mes: Record<string, number>;
}

export interface RceGuardarResponse {
  exitoso: boolean;
  mensaje: string;
  total_procesados: number;
  total_nuevos: number;
  total_actualizados: number;
  total_errores: number;
  errores?: string[];
}

export interface ConsultarComprobantesResponse {
  comprobantes: RceComprobanteBD[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export class RceComprobantesService {
  private baseUrl = '/api/v1/sire/rce/bd';

  /**
   * Consultar comprobantes almacenados en BD
   */
  async consultarComprobantes(
    ruc: string,
    filtros: {
      periodo?: string;
      ruc_proveedor?: string;
      fecha_desde?: string;
      fecha_hasta?: string;
      estado?: string;
      pagina?: number;
      por_pagina?: number;
    } = {}
  ): Promise<ConsultarComprobantesResponse> {
    const params = new URLSearchParams();
    
    if (filtros.periodo) params.append('periodo', filtros.periodo);
    if (filtros.ruc_proveedor) params.append('ruc_proveedor', filtros.ruc_proveedor);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.pagina) params.append('pagina', filtros.pagina.toString());
    if (filtros.por_pagina) params.append('por_pagina', filtros.por_pagina.toString());

    const response = await api.get(`${this.baseUrl}/${ruc}/comprobantes?${params}`);
    return response.data;
  }

  /**
   * Guardar comprobantes desde SUNAT (OPTIMIZADO)
   * 
   * @param ruc RUC de la empresa
   * @param periodo Período YYYYMM  
   * @param datosCache Datos ya consultados desde vista detallada (opcional)
   */
  async guardarDesdeSupat(
    ruc: string, 
    periodo: string, 
    datosCache?: { comprobantes: any[] }
  ): Promise<RceGuardarResponse> {
    const payload: any = { periodo };
    
    // Si hay datos en cache, enviarlos para evitar consulta a SUNAT
    if (datosCache?.comprobantes && datosCache.comprobantes.length > 0) {
      payload.comprobantes = datosCache.comprobantes;
      console.log(`🚀 Guardando desde cache: ${datosCache.comprobantes.length} comprobantes`);
    } else {
      console.log(`📡 Sin cache disponible, consultará SUNAT para período ${periodo}`);
    }
    
    const response = await api.post(`${this.baseUrl}/${ruc}/comprobantes/guardar`, payload);
    return response.data;
  }

  /**
   * Sincronizar con SUNAT
   */
  async sincronizarConSupat(ruc: string, periodo: string): Promise<any> {
    const response = await api.post(`${this.baseUrl}/${ruc}/comprobantes/sincronizar`, {
      periodo
    });
    return response.data;
  }

  /**
   * Obtener estadísticas
   */
  async obtenerEstadisticas(ruc: string, periodo?: string): Promise<RceEstadisticasBD> {
    const params = periodo ? `?periodo=${periodo}` : '';
    const response = await api.get(`${this.baseUrl}/${ruc}/estadisticas${params}`);
    return response.data;
  }

  /**
   * Eliminar comprobante
   */
  async eliminarComprobante(ruc: string, comprobanteId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${ruc}/comprobantes/${comprobanteId}`);
  }

  /**
   * Actualizar comprobante
   */
  async actualizarComprobante(
    ruc: string, 
    comprobanteId: string, 
    datos: Partial<RceComprobanteBD>
  ): Promise<RceComprobanteBD> {
    const response = await api.put(`${this.baseUrl}/${ruc}/comprobantes/${comprobanteId}`, datos);
    return response.data;
  }
}

// Instancia singleton del servicio
export const rceComprobantesService = new RceComprobantesService();
