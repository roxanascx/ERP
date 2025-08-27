import api from './api';

// ✅ Tipos unificados para PLE - Actualizados para los nuevos endpoints
export interface PLEGeneracionRequest {
  libro_diario_id: string;
  ejercicio: number;
  mes: number;
  validar_antes_generar?: boolean;
  incluir_metadatos?: boolean;
  generar_zip?: boolean;
  descargar_directo?: boolean;
  directorio_salida?: string;
  observaciones?: string;
}

export interface PLEGeneracionResponse {
  success: boolean;
  archivo_id: string;
  archivo_nombre: string;
  mensaje: string;
  total_registros: number;
  errores: string[];
  advertencias: string[];
  metadata?: {
    ejercicio: number;
    mes: number;
    fecha_generacion: string;
    tamaño_txt: number;
    tamaño_zip: number;
  };
}

export interface PLEContextoResponse {
  libro_diario_id: string;
  ejercicio: number;
  mes: number;
  ruc: string;
  razon_social: string;
  total_asientos: number;
  esta_balanceado: boolean;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface PLEValidacionRequest {
  libro_diario_id: string;
  validar_estructura?: boolean;
  validar_balanceo?: boolean;
  validar_sunat?: boolean;
}

export interface PLEValidacionResponse {
  exito: boolean;
  libro_id: string;
  valido: boolean;
  validacion_basica: {
    valido: boolean;
    total_asientos: number;
    total_debe: string;
    total_haber: string;
    balanceado: boolean;
    errores: string[];
    warnings: string[];
  };
  validacion_sunat: {
    valido: boolean;
    total_registros: number;
    registros_validados: number;
    errores: Array<{
      codigo: string;
      tabla: string;
      campo: string;
      valor: string;
      mensaje: string;
      critico: boolean;
      sugerencia?: string;
    }>;
    warnings: Array<{
      codigo: string;
      tabla: string;
      campo: string;
      valor: string;
      mensaje: string;
      sugerencia?: string;
    }>;
    datos_enriquecidos: number;
    estadisticas: {
      total_errores: number;
      total_warnings: number;
      errores_criticos: number;
      porcentaje_validado: number;
      cuentas_validadas: number;
      tiempo_validacion: number;
    };
    tiempo_validacion: number;
  };
  error?: string;
}

export interface PLEContextData {
  libro_diario_id: string;
  ejercicio: number;
  mes: number;
  ruc: string;
  razon_social: string;
  total_asientos: number;
  esta_balanceado: boolean;
  fecha_inicio: string;
  fecha_fin: string;
}

// ✅ Servicio API unificado para PLE - Actualizado
class PLEApiUnified {
  private baseUrl = '/api/v1/accounting/ple';

  /**
   * Obtiene el contexto automático del libro diario para PLE
   */
  async obtenerContexto(libroId: string): Promise<PLEContextoResponse> {
    try {
      console.log('🔍 Obteniendo contexto PLE para libro:', libroId);
      const response = await api.get(`${this.baseUrl}/contexto/${libroId}`);
      console.log('✅ Contexto PLE obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo contexto PLE:', error);
      throw new Error(`Error obteniendo contexto PLE: ${error}`);
    }
  }

  /**
   * Genera archivo PLE usando los endpoints unificados
   */
  async generarPLE(data: PLEGeneracionRequest): Promise<PLEGeneracionResponse> {
    try {
      console.log('🚀 Generando PLE:', data);
      const response = await api.post(`${this.baseUrl}/generar`, data);
      console.log('✅ PLE generado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error generando PLE:', error);
      throw new Error(`Error generando PLE: ${error}`);
    }
  }

  /**
   * Descarga directa del archivo PLE como ZIP
   */
  async descargarPLE(libroId: string, ejercicio: number, mes: number): Promise<Blob> {
    try {
      console.log(`📥 Descargando PLE: libro=${libroId}, ejercicio=${ejercicio}, mes=${mes}`);
      
      const response = await api.get(`${this.baseUrl}/descargar/${libroId}`, {
        params: {
          ejercicio,
          mes
        },
        responseType: 'blob', // Importante para archivos
        headers: {
          'Accept': 'application/zip'
        }
      });
      
      console.log('✅ Archivo PLE descargado:', response.data.size, 'bytes');
      return response.data;
    } catch (error) {
      console.error('❌ Error descargando PLE:', error);
      throw new Error(`Error descargando PLE: ${error}`);
    }
  }

  /**
   * Valida datos para exportación PLE
   */
  async validarPLE(data: PLEValidacionRequest): Promise<PLEValidacionResponse> {
    try {
      console.log('🔍 Validando PLE:', data);
      const response = await api.post(`${this.baseUrl}/validar`, data);
      console.log('✅ Validación PLE completada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error validando PLE:', error);
      throw new Error(`Error validando PLE: ${error}`);
    }
  }

  /**
   * Función helper para descargar archivo con nombre correcto
   */
  descargarArchivo(blob: Blob, nombreArchivo: string): void {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('📁 Archivo descargado:', nombreArchivo);
    } catch (error) {
      console.error('❌ Error descargando archivo:', error);
      throw new Error(`Error descargando archivo: ${error}`);
    }
  }
}

// ✅ Instancia singleton del servicio
export const pleApiUnified = new PLEApiUnified();
export default pleApiUnified;
