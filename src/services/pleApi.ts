import axios from 'axios';
import type {
  PLEExportOptions,
  PLEExportResult,
  PLEValidationResult,
  PLEPreviewResult,
  PLEStatsResult,
  PLEReportResult
} from '../types/pleTypes';

import { PLE_DEFAULT_OPTIONS } from '../types/pleTypes';

// Configuración base para el cliente axios PLE
const pleApi = axios.create({
  baseURL: '/api/v1/accounting/libros-diario',
  timeout: 30000, // 30 segundos para operaciones PLE
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
pleApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en API PLE:', error);
    return Promise.reject(error);
  }
);

export class PLEApiService {
  
  // ====================================
  // MÉTODOS PRINCIPALES PLE
  // ====================================

  /**
   * Exportar libro diario a formato PLE para SUNAT
   */
  static async exportarPLE(
    libroId: string, 
    opciones: Partial<PLEExportOptions> = {}
  ): Promise<PLEExportResult> {
    const opcionesCompletas = { ...PLE_DEFAULT_OPTIONS, ...opciones };
    
    const response = await pleApi.post(`/${libroId}/export-ple`, opcionesCompletas);
    return response.data;
  }

  /**
   * Validar libro diario para exportación PLE
   */
  static async validarPLE(libroId: string): Promise<PLEValidationResult> {
    const response = await pleApi.get(`/${libroId}/validate-ple`);
    return response.data;
  }

  /**
   * Obtener vista previa del archivo PLE
   */
  static async previewPLE(
    libroId: string, 
    maxLineas: number = 10
  ): Promise<PLEPreviewResult> {
    const response = await pleApi.get(`/${libroId}/preview-ple`, {
      params: { max_lineas: maxLineas }
    });
    return response.data;
  }

  /**
   * Obtener estadísticas del libro diario para PLE
   */
  static async obtenerEstadisticasPLE(libroId: string): Promise<PLEStatsResult> {
    const response = await pleApi.get(`/${libroId}/stats-ple`);
    return response.data;
  }

  /**
   * Generar reporte detallado de validación PLE
   */
  static async generarReportePLE(libroId: string): Promise<PLEReportResult> {
    const response = await pleApi.get(`/${libroId}/report-ple`);
    return response.data;
  }

  /**
   * Descargar archivo PLE generado
   */
  static async descargarArchivoPLE(
    libroId: string,
    formato: 'txt' | 'zip' = 'zip',
    opciones: Partial<PLEExportOptions> = {}
  ): Promise<Blob> {
    const opcionesCompletas = { ...PLE_DEFAULT_OPTIONS, ...opciones };
    
    const response = await pleApi.get(`/${libroId}/download-ple`, {
      params: { 
        formato,
        opciones: JSON.stringify(opcionesCompletas)
      },
      responseType: 'blob'
    });
    
    return response.data;
  }

  /**
   * Validar y exportar en una sola operación
   */
  static async validarYExportarPLE(
    libroId: string,
    opciones: Partial<PLEExportOptions> = {},
    forzarExportacion: boolean = false
  ): Promise<{
    exito: boolean;
    validacion: PLEValidationResult;
    exportacion: PLEExportResult | null;
    mensaje: string;
  }> {
    const opcionesCompletas = { ...PLE_DEFAULT_OPTIONS, ...opciones };
    
    const response = await pleApi.post(`/${libroId}/validate-and-export-ple`, opcionesCompletas, {
      params: { forzar_exportacion: forzarExportacion }
    });
    
    return response.data;
  }

  // ====================================
  // MÉTODOS DE UTILIDAD
  // ====================================

  /**
   * Generar nombre de archivo PLE basado en datos del libro
   */
  static generarNombreArchivoPLE(
    ruc: string,
    periodo: string,
    formato: 'txt' | 'zip' = 'txt'
  ): string {
    // Formato: LE + RUC + PERIODO + 00 + 0501 + 00 + 1 + 11 + .TXT
    // Ejemplo: LE20100070970202301000501001111.TXT
    const anio = periodo.substring(0, 4);
    const mes = periodo.substring(4, 6) || '00';
    const extension = formato === 'zip' ? '.zip' : '.TXT';
    
    return `LE${ruc}${anio}${mes}000501001111${extension}`;
  }

  /**
   * Descargar archivo con nombre automático
   */
  static async descargarConNombreAutomatico(
    libroId: string,
    ruc: string,
    periodo: string,
    formato: 'txt' | 'zip' = 'zip',
    opciones: Partial<PLEExportOptions> = {}
  ): Promise<void> {
    try {
      const blob = await this.descargarArchivoPLE(libroId, formato, opciones);
      const nombreArchivo = this.generarNombreArchivoPLE(ruc, periodo, formato);
      
      // Crear enlace de descarga temporal
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      
      // Activar descarga
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error en descarga automática:', error);
      throw error;
    }
  }

  /**
   * Validar estado del libro antes de exportar
   */
  static async verificarEstadoLibro(libroId: string): Promise<{
    listo: boolean;
    errores: string[];
    warnings: string[];
    recomendaciones: string[];
  }> {
    try {
      const validacion = await this.validarPLE(libroId);
      
      return {
        listo: validacion.valido,
        errores: [
          ...validacion.validacion_basica.errores,
          ...validacion.validacion_sunat.errores.filter(e => e.critico).map(e => e.mensaje)
        ],
        warnings: [
          ...validacion.validacion_basica.warnings,
          ...validacion.validacion_sunat.warnings.map(w => w.mensaje)
        ],
        recomendaciones: validacion.validacion_sunat.errores
          .filter(e => e.sugerencia)
          .map(e => e.sugerencia!)
      };
    } catch (error) {
      return {
        listo: false,
        errores: ['Error al validar el libro diario'],
        warnings: [],
        recomendaciones: ['Verifique que el libro diario tenga asientos válidos']
      };
    }
  }
}

export default PLEApiService;
