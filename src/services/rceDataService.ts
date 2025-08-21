/**
 * 🏢 Servicio de Datos RCE
 * Gestión centralizada de datos RCE sin cache para datos en tiempo real
 */

import api from './api';
import type { 
  RceComprobantesDetalladosResponse
} from '../types/rce';

/**
 * 📊 Servicio principal de datos RCE
 * Simplificado sin cache para trabajar siempre con datos en tiempo real
 */
class RceDataService {

  /**
   * 📋 Obtener resumen de período desde SUNAT
   */
  async obtenerResumen(ruc: string, periodo: string): Promise<any> {
    try {
      const response = await api.get('/api/v1/sire/rce/comprobantes/resumen-sunat', {
        params: { ruc, periodo }
      });

      return response.data;

    } catch (error: any) {
      console.error('❌ Error en obtenerResumen:', error);
      
      // Manejo específico para errores de axios
      if (error.response) {
        // Error del servidor (4xx, 5xx)
        const status = error.response.status;
        const message = error.response.data?.detail || error.response.data?.mensaje || `Error del servidor (${status})`;
        
        throw new Error(message);
      } else if (error.request) {
        // Error de red
        throw new Error('Error de conexión. Verifique su conexión a internet.');
      } else {
        // Error de configuración
        throw new Error(error.message || 'Error interno del cliente');
      }
    }
  }

  /**
   * 📄 Obtener comprobantes detallados desde SUNAT
   */
  async obtenerComprobantesDetallados(
    ruc: string, 
    periodo: string
  ): Promise<RceComprobantesDetalladosResponse> {
    try {
      const response = await api.get('/api/v1/sire/rce/comprobantes/comprobantes-detallados', {
        params: { ruc, periodo }
      });

      return response.data;

    } catch (error: any) {
      console.error('❌ Error en obtenerComprobantesDetallados:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.detail || error.response.data?.mensaje || `Error del servidor (${status})`;
        
        throw new Error(message);
      } else if (error.request) {
        throw new Error('Error de conexión. Verifique su conexión a internet.');
      } else {
        throw new Error(error.message || 'Error interno del cliente');
      }
    }
  }

  /**
   * ✅ Validar datos RCE (mantenido para compatibilidad)
   */
  async validarDatos(request: any): Promise<any> {
    try {
      const response = await api.post('/api/v1/sire/rce/data-management/validate', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error en validación');
    }
  }

  /**
   * 🗑️ Invalidar cache (sin efecto, mantenido para compatibilidad)
   */
  async invalidarCache(): Promise<void> {
    // No hace nada, pero mantiene compatibilidad
    console.log('ℹ️ Cache deshabilitado, no hay nada que invalidar');
  }
}

// Exportar instancia única
export const rceDataService = new RceDataService();
