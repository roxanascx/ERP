/**
 * Servicio API para el módulo SIRE
 * Comunicación con endpoints del backend SIRE
 */

import api from './api';
import type {
  RvieDescargarPropuestaRequest,
  RvieAceptarPropuestaRequest,
  RvieReemplazarPropuestaRequest,
  RvieRegistrarPreliminarRequest,
  RvieProcesoResponse,
  RvieTicketResponse,
  RvieArchivoResponse,
  RvieResumenResponse,
  RvieInconsistencia,
  SireAuthStatus,
  SireStatusResponse
} from '../types/sire';

// ========================================
// CONFIGURACIÓN BASE
// ========================================

const SIRE_BASE_URL = '/api/v1/sire';  // Actualizado para usar /api/v1
const RVIE_BASE_URL = `${SIRE_BASE_URL}/rvie`;

// ========================================
// SERVICIOS GENERALES SIRE
// ========================================

export const sireGeneralService = {
  /**
   * Obtener endpoints RVIE disponibles
   */
  async getRvieEndpoints() {
    try {
      const response = await api.get(`${RVIE_BASE_URL}/endpoints`);
      return response.data;
    } catch (error) {
      console.error('❌ [SIRE] Error obteniendo endpoints RVIE:', error);
      throw error;
    }
  }
};

// ========================================
// SERVICIOS DE AUTENTICACIÓN SIRE
// ========================================

export const sireAuthService = {
  /**
   * Verificar estado de autenticación SIRE
   */
  async checkAuth(ruc: string): Promise<SireAuthStatus> {
    const url = `${SIRE_BASE_URL}/status/${ruc}`;  // ✅ ARREGLADO: removido /auth
    console.log('🔍 [SIRE] Llamando a checkAuth:', url);
    console.log('🔍 [SIRE] RUC:', ruc);
    console.log('🔍 [SIRE] SIRE_BASE_URL:', SIRE_BASE_URL);
    
    // Test de conectividad básica primero
    try {
      console.log('🔍 [SIRE] Probando conectividad básica...');
      const healthResponse = await api.get('/api/v1/companies/');  // ✅ ARREGLADO: agregado /api/v1
      console.log('✅ [SIRE] Conectividad básica OK:', healthResponse.status);
    } catch (error) {
      console.error('❌ [SIRE] Problema de conectividad básica:', error);
    }
    
    try {
      const response = await api.get<SireStatusResponse>(url);
      console.log('✅ [SIRE] Respuesta recibida:', response.data);
      
      // Convertir la respuesta del backend al formato esperado por el frontend
      return {
        authenticated: response.data.sesion_activa,
        expires_at: response.data.token_expira_en ? 
          new Date(Date.now() + response.data.token_expira_en * 1000).toISOString() : 
          undefined,
        last_login: response.data.ultima_autenticacion || undefined,
        session_id: undefined // No disponible en el backend por ahora
      };
    } catch (error: any) {
      console.error('❌ [SIRE] Error en checkAuth:', error);
      console.error('❌ [SIRE] URL que falló:', url);
      console.error('❌ [SIRE] Status:', error.response?.status);
      console.error('❌ [SIRE] Data:', error.response?.data);
      throw error;
    }
  },

  /**
   * Autenticar con SUNAT SIRE
   */
  async authenticate(ruc: string): Promise<SireAuthStatus> {
    try {
      // Primero obtener las credenciales de la empresa
      console.log('🔍 [SIRE] Obteniendo credenciales para autenticación...', ruc);
      const empresaResponse = await api.get(`/api/v1/companies/${ruc}`);  // ✅ CORREGIDO: agregado /api/v1
      const empresa = empresaResponse.data;
      
      if (!empresa.sire_client_id || !empresa.sire_client_secret || !empresa.sunat_usuario || !empresa.sunat_clave) {
        throw new Error('La empresa no tiene credenciales SIRE completas configuradas');
      }
      
      // Preparar el request de autenticación
      const authRequest = {
        ruc: ruc,
        sunat_usuario: empresa.sunat_usuario,
        sunat_clave: empresa.sunat_clave,
        client_id: empresa.sire_client_id,
        client_secret: empresa.sire_client_secret
      };
      
      console.log('🔐 [SIRE] Enviando request de autenticación:', {
        ruc: authRequest.ruc,
        sunat_usuario: authRequest.sunat_usuario,
        client_id: authRequest.client_id,
        // No logear las claves por seguridad
      });
      
      const response = await api.post(`${SIRE_BASE_URL}/login`, authRequest);  // ✅ ARREGLADO: removido /auth
      return response.data;
    } catch (error: any) {
      console.error('❌ [SIRE] Error en autenticación:', error);
      throw error;
    }
  },

  /**
   * Cerrar sesión SIRE
   */
  async logout(ruc: string): Promise<void> {
    await api.post(`${SIRE_BASE_URL}/logout`, { ruc });  // ✅ ARREGLADO: endpoint simplificado
  }
};

// ========================================
// SERVICIOS RVIE
// ========================================

export const rvieService = {
  /**
   * Descargar propuesta RVIE de SUNAT
   */
  async descargarPropuesta(
    ruc: string, 
    request: RvieDescargarPropuestaRequest
  ): Promise<RvieProcesoResponse> {
    const response = await api.post(
      `${RVIE_BASE_URL}/descargar-propuesta`,
      { ...request, ruc }
    );
    return response.data;
  },

  /**
   * Aceptar propuesta RVIE
   */
  async aceptarPropuesta(
    ruc: string,
    request: RvieAceptarPropuestaRequest
  ): Promise<RvieProcesoResponse> {
    const response = await api.post(
      `${RVIE_BASE_URL}/aceptar-propuesta`,
      { ...request, ruc }
    );
    return response.data;
  },

  /**
   * Reemplazar propuesta con archivo personalizado
   */
  async reemplazarPropuesta(
    ruc: string,
    request: RvieReemplazarPropuestaRequest
  ): Promise<RvieProcesoResponse> {
    const response = await api.post(
      `${RVIE_BASE_URL}/${ruc}/reemplazar-propuesta`,
      request
    );
    return response.data;
  },

  /**
   * Registrar información preliminar
   */
  async registrarPreliminar(
    ruc: string,
    request: RvieRegistrarPreliminarRequest
  ): Promise<RvieProcesoResponse> {
    const response = await api.post(
      `${RVIE_BASE_URL}/${ruc}/registrar-preliminar`,
      request
    );
    return response.data;
  },

  /**
   * Consultar inconsistencias RVIE
   */
  async consultarInconsistencias(
    ruc: string,
    periodo: string,
    fase: string = 'propuesta'
  ): Promise<RvieInconsistencia[]> {
    const response = await api.get(
      `${RVIE_BASE_URL}/${ruc}/inconsistencias/${periodo}`,
      { params: { fase } }
    );
    return response.data;
  },

  /**
   * Consultar estado de ticket
   */
  async consultarTicket(
    ruc: string,
    ticketId: string
  ): Promise<RvieTicketResponse> {
    const response = await api.get(
      `${RVIE_BASE_URL}/ticket/${ruc}/${ticketId}`
    );
    return response.data;
  },

  /**
   * Descargar archivo de ticket
   */
  async descargarArchivo(
    ruc: string,
    ticketId: string
  ): Promise<RvieArchivoResponse> {
    const response = await api.get(
      `${RVIE_BASE_URL}/archivo/${ruc}/${ticketId}`
    );
    return response.data;
  },

  /**
   * Obtener resumen RVIE
   */
  async obtenerResumen(
    ruc: string,
    periodo: string
  ): Promise<RvieResumenResponse> {
    const response = await api.get(
      `${RVIE_BASE_URL}/${ruc}/resumen/${periodo}`
    );
    return response.data;
  }
};

// ========================================
// UTILIDADES DE ARCHIVO
// ========================================

export const sireFileUtils = {
  /**
   * Convertir archivo a base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:type/subtype;base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Descargar archivo desde base64
   */
  downloadFromBase64(
    base64Content: string,
    filename: string,
    mimeType: string = 'application/octet-stream'
  ): void {
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  },

  /**
   * Validar formato de periodo (YYYYMM)
   */
  validarPeriodo(periodo: string): boolean {
    const regex = /^\d{4}(0[1-9]|1[0-2])$/;
    return regex.test(periodo);
  },

  /**
   * Formatear periodo para mostrar
   */
  formatearPeriodo(periodo: string): string {
    if (!this.validarPeriodo(periodo)) return periodo;
    
    const año = periodo.substring(0, 4);
    const mes = periodo.substring(4, 6);
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    return `${meses[parseInt(mes) - 1]} ${año}`;
  }
};

// ========================================
// SERVICIOS DE TICKETS RVIE
// ========================================

// Función auxiliar para convertir respuesta del backend a formato frontend
function mapTicketResponse(backendResponse: any): RvieTicketResponse {
  return {
    ticket_id: backendResponse.ticket_id,
    status: backendResponse.estado || backendResponse.status, // Mapear estado -> status
    progreso_porcentaje: backendResponse.progreso_porcentaje,
    descripcion: backendResponse.descripcion,
    fecha_creacion: backendResponse.fecha_creacion,
    fecha_actualizacion: backendResponse.fecha_actualizacion,
    operacion: backendResponse.operacion,
    ruc: backendResponse.ruc,
    periodo: backendResponse.periodo,
    resultado: backendResponse.resultado,
    error_mensaje: backendResponse.error_mensaje,
    archivo_nombre: backendResponse.archivo_nombre,
    archivo_size: backendResponse.archivo_size
  };
}

export const rvieTicketService = {
  /**
   * Generar ticket para operación RVIE asíncrona
   */
  async generarTicket(request: {
    ruc: string;
    periodo: string;
    operacion: 'descargar-propuesta' | 'aceptar-propuesta' | 'reemplazar-propuesta';
  }): Promise<RvieTicketResponse> {
    try {
      console.log('🎫 [RVIE-TICKET] Generando ticket:', request);
      
      const response = await api.post(`${RVIE_BASE_URL}/generar-ticket`, request);
      
      const ticket = mapTicketResponse(response.data);
      console.log('✅ [RVIE-TICKET] Ticket generado:', ticket.ticket_id);
      return ticket;
    } catch (error) {
      console.error('❌ [RVIE-TICKET] Error generando ticket:', error);
      throw error;
    }
  },

  /**
   * Consultar estado de un ticket
   */
  async consultarTicket(ruc: string, ticketId: string): Promise<RvieTicketResponse> {
    try {
      console.log(`🔍 [RVIE-TICKET] Consultando ticket ${ticketId}`);
      
      const response = await api.get(`${RVIE_BASE_URL}/ticket/${ruc}/${ticketId}`);
      
      const ticket = mapTicketResponse(response.data);
      console.log(`📊 [RVIE-TICKET] Estado del ticket: ${ticket.status}`);
      return ticket;
    } catch (error) {
      console.error('❌ [RVIE-TICKET] Error consultando ticket:', error);
      throw error;
    }
  },

  /**
   * Descargar archivo de un ticket completado
   */
  async descargarArchivo(ruc: string, ticketId: string): Promise<RvieArchivoResponse> {
    try {
      console.log(`📥 [RVIE-TICKET] Descargando archivo del ticket ${ticketId}`);
      
      const response = await api.get(`${RVIE_BASE_URL}/archivo/${ruc}/${ticketId}`);
      
      console.log(`✅ [RVIE-TICKET] Archivo descargado: ${response.data.filename}`);
      return response.data;
    } catch (error) {
      console.error('❌ [RVIE-TICKET] Error descargando archivo:', error);
      throw error;
    }
  },

  /**
   * Descargar archivo y convertir a blob para descarga en navegador
   */
  async descargarArchivoBlob(ruc: string, ticketId: string): Promise<{ filename: string; blob: Blob }> {
    try {
      const archivoData = await this.descargarArchivo(ruc, ticketId);
      
      // Si el contenido viene en base64, convertir a blob
      if (archivoData.content) {
        const binaryString = atob(archivoData.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { 
          type: archivoData.content_type || 'text/plain' 
        });
        
        return {
          filename: archivoData.filename,
          blob
        };
      }
      
      // Si no hay contenido, crear blob vacío
      const blob = new Blob([], { type: 'text/plain' });
      return {
        filename: archivoData.filename || 'archivo.txt',
        blob
      };
    } catch (error) {
      console.error('❌ [RVIE-TICKET] Error descargando archivo como blob:', error);
      throw error;
    }
  },

  /**
   * Hacer polling de un ticket hasta que complete
   */
  async monitorearTicket(
    ruc: string, 
    ticketId: string, 
    options: {
      intervalo?: number;
      maxIntentos?: number;
      onProgress?: (ticket: RvieTicketResponse) => void;
    } = {}
  ): Promise<RvieTicketResponse> {
    const { intervalo = 3000, maxIntentos = 20, onProgress } = options;
    
    console.log(`👀 [RVIE-TICKET] Iniciando monitoreo del ticket ${ticketId}`);
    
    for (let intento = 1; intento <= maxIntentos; intento++) {
      try {
        const ticket = await this.consultarTicket(ruc, ticketId);
        
        // Llamar callback de progreso si existe
        if (onProgress) {
          onProgress(ticket);
        }
        
        // Verificar si está completado
        if (ticket.status === 'TERMINADO') {
          console.log(`✅ [RVIE-TICKET] Ticket ${ticketId} completado exitosamente`);
          return ticket;
        }
        
        if (ticket.status === 'ERROR') {
          console.log(`❌ [RVIE-TICKET] Ticket ${ticketId} falló: ${ticket.error_mensaje}`);
          return ticket;
        }
        
        // Si aún está procesando, esperar
        if (ticket.status === 'PENDIENTE' || ticket.status === 'PROCESANDO') {
          console.log(`⏳ [RVIE-TICKET] Ticket ${ticketId} procesando... (${ticket.progreso_porcentaje}%)`);
          
          if (intento < maxIntentos) {
            await new Promise(resolve => setTimeout(resolve, intervalo));
          }
        }
        
      } catch (error) {
        console.error(`❌ [RVIE-TICKET] Error en intento ${intento}:`, error);
        
        if (intento === maxIntentos) {
          throw new Error(`Timeout monitoreando ticket después de ${maxIntentos} intentos`);
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, intervalo));
      }
    }
    
    throw new Error(`Timeout monitoreando ticket ${ticketId} después de ${maxIntentos} intentos`);
  }
};

// ========================================
// SERVICIO PRINCIPAL SIRE (ACTUALIZADO)
// ========================================

export const sireService = {
  auth: sireAuthService,
  rvie: rvieService,
  tickets: rvieTicketService,
  files: sireFileUtils
};

export default sireService;
