/**
 * 🗄️ Servicio para gestión de comprobantes RVIE en Base de Datos Local
 * Maneja la comunicación con la API de BD para comprobantes de ventas
 */

import api from './api';

export interface RvieComprobanteBD {
  id: string;
  ruc: string;
  periodo: string;
  tipo_documento: string;
  tipo_documento_desc?: string;
  serie_comprobante: string;
  numero_comprobante: string;
  fecha_emision: string;
  cliente_nombre: string;
  cliente_tipo_documento?: string;
  cliente_numero_documento?: string;
  cliente_ruc?: string;
  moneda: string;
  tipo_cambio?: number;
  base_gravada: number;
  igv: number;
  exonerado: number;
  inafecto: number;
  total: number;
  estado: string;
  tipo_operacion?: string;
  fecha_registro: string;
  fecha_actualizacion?: string;
  origen: string;
  estado_registro: string;
  observaciones?: string;
}

export interface RvieEstadisticasBD {
  total_comprobantes: number;
  total_monto: number;
  por_tipo: Record<string, { cantidad: number; monto: number }>;
  por_estado: Record<string, number>;
  por_mes: Record<string, any>;
  resumen_montos: Record<string, number>;
}

export interface RvieConsultaBDResponse {
  success: boolean;
  comprobantes: RvieComprobanteBD[];
  paginacion: {
    total: number;
    pagina_actual: number;
    total_paginas: number;
    por_pagina: number;
    desde: number;
    hasta: number;
  };
  filtros_aplicados: Record<string, any>;
}

export interface RvieEstadoBDResponse {
  success: boolean;
  tiene_datos: boolean;
  total_comprobantes: number;
  total_monto: number;
  resumen: {
    por_tipo: Record<string, { cantidad: number; monto: number }>;
    por_estado: Record<string, number>;
  };
  ruc: string;
  periodo: string;
}

export interface RvieGuardarResponse {
  success: boolean;
  message: string;
  guardados: number;
  actualizados: number;
  errores: string[];
  total_procesados: number;
}

interface RvieConsultaFiltros {
  tipo_documento?: string;
  estado?: string;
  cliente_ruc?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  monto_min?: number;
  monto_max?: number;
}

export const rvieComprobantesService = {
  /**
   * 📋 Consultar comprobantes guardados en BD
   */
  async consultarComprobantes(
    ruc: string, 
    options: {
      periodo: string;
      skip?: number;
      por_pagina?: number;
      filtros?: RvieConsultaFiltros;
    }
  ): Promise<RvieConsultaBDResponse> {
    try {
      const params = new URLSearchParams({
        periodo: options.periodo,
        skip: (options.skip || 0).toString(),
        por_pagina: (options.por_pagina || 50).toString()
      });

      // Agregar filtros si existen
      if (options.filtros) {
        Object.entries(options.filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get(`/api/v1/sire/rvie/${ruc}/comprobantes?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error consultando comprobantes RVIE BD:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.message || 
        'Error consultando comprobantes de la base de datos'
      );
    }
  },

  /**
   * 📊 Obtener estadísticas de comprobantes guardados
   */
  async obtenerEstadisticas(ruc: string, periodo: string): Promise<RvieEstadisticasBD> {
    try {
      const response = await api.get(`/api/v1/sire/rvie/${ruc}/estadisticas?periodo=${periodo}`);
      return response.data.estadisticas;
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas RVIE BD:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.message || 
        'Error obteniendo estadísticas'
      );
    }
  },

  /**
   * 🔍 Verificar estado de la BD para un RUC y período
   */
  async verificarEstadoBD(ruc: string, periodo: string): Promise<RvieEstadoBDResponse> {
    try {
      const response = await api.get(`/api/v1/sire/rvie/${ruc}/estado?periodo=${periodo}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error verificando estado BD RVIE:', error);
      // No lanzar error, retornar estado por defecto
      return {
        success: false,
        tiene_datos: false,
        total_comprobantes: 0,
        total_monto: 0,
        resumen: { por_tipo: {}, por_estado: {} },
        ruc,
        periodo
      };
    }
  },

  /**
   * 💾 Guardar comprobantes desde datos de SUNAT
   * (Se llama automáticamente después de consultar SUNAT)
   */
  async guardarDesdeSunat(
    ruc: string, 
    periodo: string, 
    comprobantes: any[]
  ): Promise<RvieGuardarResponse> {
    try {
      const response = await api.post(
        `/api/v1/sire/rvie/${ruc}/guardar-desde-sunat?periodo=${periodo}`,
        comprobantes
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Error guardando comprobantes RVIE desde SUNAT:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.message || 
        'Error guardando comprobantes en la base de datos'
      );
    }
  },

  /**
   * 📄 Obtener un comprobante específico
   */
  async obtenerComprobante(ruc: string, comprobanteId: string): Promise<RvieComprobanteBD> {
    try {
      const response = await api.get(`/api/v1/sire/rvie/${ruc}/comprobantes/${comprobanteId}`);
      return response.data.comprobante;
    } catch (error: any) {
      console.error('❌ Error obteniendo comprobante RVIE:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.message || 
        'Error obteniendo comprobante'
      );
    }
  },

  /**
   * 🗑️ Eliminar un comprobante específico
   */
  async eliminarComprobante(ruc: string, comprobanteId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/api/v1/sire/rvie/${ruc}/comprobantes/${comprobanteId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error eliminando comprobante RVIE:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.message || 
        'Error eliminando comprobante'
      );
    }
  },

  /**
   * 🧹 Limpiar todos los comprobantes de un período
   */
  async limpiarPeriodo(ruc: string, periodo: string): Promise<{ success: boolean; message: string; eliminados: number }> {
    try {
      const response = await api.delete(`/api/v1/sire/rvie/${ruc}/periodo/${periodo}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error limpiando período RVIE:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.message || 
        'Error limpiando período'
      );
    }
  }
};

export default rvieComprobantesService;
