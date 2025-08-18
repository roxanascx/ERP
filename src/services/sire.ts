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
  RviePropuesta,
  RvieComprobante,
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
  },

  /**
   * Consultar propuesta guardada (sin nueva descarga)
   */
  async consultarPropuestaGuardada(
    ruc: string,
    periodo: string
  ): Promise<RviePropuesta> {
    const response = await api.get(
      `${RVIE_BASE_URL}/${ruc}/propuesta/${periodo}`
    );
    return response.data;
  },

  /**
   * Obtener comprobantes de ventas de la propuesta
   */
  async obtenerComprobantes(
    ruc: string,
    periodo: string
  ): Promise<RvieComprobante[]> {
    try {
      console.log(`💰 [RVIE-VENTAS] Obteniendo comprobantes para RUC: ${ruc}, período: ${periodo}`);
      
      try {
        const propuesta = await this.consultarPropuestaGuardada(ruc, periodo);
        
        if (propuesta?.comprobantes && propuesta.comprobantes.length > 0) {
          // Convertir los comprobantes del backend al formato frontend
          const comprobantes: RvieComprobante[] = propuesta.comprobantes.map(comp => ({
            ruc_emisor: ruc,
            tipo_comprobante: comp.tipo_comprobante,
            serie: comp.serie,
            numero: comp.numero,
            fecha_emision: comp.fecha_emision,
            moneda: 'PEN', // Asumimos PEN por defecto
            importe_total: comp.importe_total,
            estado: 'VALIDO', // Estado por defecto
            observaciones: ''
          }));
          
          console.log(`✅ [RVIE-VENTAS] Obtenidos ${comprobantes.length} comprobantes`);
          return comprobantes;
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          // Si no es un 404, es un error real
          throw error;
        }
      }
      
      // No hay propuesta - informar que se debe descargar primero
      console.log(`ℹ️ [RVIE-VENTAS] No hay propuesta para período ${periodo}. Debe descargar propuesta RVIE primero.`);
      return [];
      
    } catch (error) {
      console.error('❌ [RVIE-VENTAS] Error obteniendo comprobantes:', error);
      return [];
    }
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
    archivo_nombre: backendResponse.archivo_nombre || backendResponse.output_file_name, // Mapear ambos campos
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
   * Listar todos los tickets de un RUC
   */
  async listarTickets(ruc: string, incluirTodos: boolean = false): Promise<RvieTicketResponse[]> {
    try {
      console.log(`📋 [RVIE-TICKETS] Listando tickets para RUC: ${ruc}, incluirTodos: ${incluirTodos}`);
      
      const params = incluirTodos ? '?incluir_todos=true' : '';
      const response = await api.get(`${RVIE_BASE_URL}/tickets/${ruc}${params}`);
      
      const tickets = response.data.map((ticketData: any) => mapTicketResponse(ticketData));
      console.log(`✅ [RVIE-TICKETS] Encontrados ${tickets.length} tickets`);
      return tickets;
    } catch (error) {
      console.error('❌ [RVIE-TICKETS] Error listando tickets:', error);
      throw error;
    }
  },

  /**
   * Listar todos los tickets incluyendo SYNC para operaciones
   */
  async listarTodosTickets(ruc: string): Promise<RvieTicketResponse[]> {
    try {
      console.log(`📋 [RVIE-TICKETS] Listando TODOS los tickets para RUC: ${ruc}`);
      
      const response = await api.get(`${RVIE_BASE_URL}/tickets/${ruc}?incluir_todos=true`);
      
      const tickets = response.data.map((ticketData: any) => mapTicketResponse(ticketData));
      console.log(`✅ [RVIE-TICKETS] Encontrados ${tickets.length} tickets (incluyendo SYNC)`);
      return tickets;
    } catch (error) {
      console.error('❌ [RVIE-TICKETS] Error listando todos los tickets:', error);
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
    } catch (error: any) {
      console.error('❌ [RVIE-TICKET] Error consultando ticket:', error);
      
      // Si el ticket no se encuentra en la BD, intentar consultar directamente a SUNAT
      if (error.response?.status === 404) {
        console.log('⚠️ [RVIE-TICKET] Ticket no encontrado en BD, consultando SUNAT directamente...');
        return await this.consultarTicketSunat(ruc, ticketId);
      }
      
      throw error;
    }
  },

  /**
   * Consultar ticket directamente en SUNAT (fallback)
   */
  async consultarTicketSunat(ruc: string, ticketId: string): Promise<RvieTicketResponse> {
    try {
      console.log(`🔍 [RVIE-TICKET] Consultando ticket ${ticketId} directamente en SUNAT`);
      
      // Usar endpoint de consulta directa a SUNAT
      const response = await api.get(`${RVIE_BASE_URL}/consultar-ticket-sunat`, {
        params: { ruc, ticket_id: ticketId }
      });
      
      const ticket = mapTicketResponse(response.data);
      console.log(`📊 [RVIE-TICKET] Estado del ticket desde SUNAT: ${ticket.status}`);
      
      // Opcionalmente, guardar el ticket en la BD para futuras consultas
      try {
        await this.sincronizarTicket(ruc, ticket);
      } catch (syncError) {
        console.warn('⚠️ No se pudo sincronizar el ticket:', syncError);
      }
      
      return ticket;
    } catch (error) {
      console.error('❌ [RVIE-TICKET] Error consultando ticket en SUNAT:', error);
      throw error;
    }
  },

  /**
   * Sincronizar ticket externo con la base de datos
   */
  async sincronizarTicket(ruc: string, ticket: RvieTicketResponse): Promise<void> {
    try {
      console.log(`🔄 [RVIE-TICKET] Sincronizando ticket ${ticket.ticket_id}`);
      
      await api.post(`${RVIE_BASE_URL}/sincronizar-ticket`, {
        ruc,
        ticket
      });
      
      console.log(`✅ [RVIE-TICKET] Ticket sincronizado: ${ticket.ticket_id}`);
    } catch (error) {
      console.error('❌ [RVIE-TICKET] Error sincronizando ticket:', error);
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
   * Descargar archivo como blob directamente desde el endpoint
   */
  async descargarArchivoBlob(ruc: string, ticketId: string): Promise<{ filename: string; blob: Blob }> {
    try {
      console.log(`📥 [RVIE-TICKET] Descargando archivo del ticket ${ticketId}`);
      
      const response = await api.get(`${RVIE_BASE_URL}/archivo/${ruc}/${ticketId}`, {
        responseType: 'blob'  // Importante: recibir como blob
      });
      
      // Extraer el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = `SIRE_DESCARGA_${ticketId}.zip`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/"/g, ''); // Quitar comillas si las hay
        }
      }
      
      console.log(`✅ [RVIE-TICKET] Archivo descargado: ${filename} (${response.data.size} bytes)`);
      
      return {
        filename,
        blob: response.data  // response.data ya es un Blob cuando responseType es 'blob'
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
// SERVICIOS DE VENTAS RVIE (NUEVO)
// ========================================

export const rvieVentasService = {
  /**
   * Consultar resumen de ventas directo desde SUNAT
   */
  async consultarResumenSunat(ruc: string, periodo: string, tipoResumen: number = 1) {
    try {
      console.log(`🔍 [RVIE-VENTAS] Consultando resumen SUNAT - RUC: ${ruc}, Período: ${periodo}, Tipo: ${tipoResumen}`);
      
      const response = await api.get(
        `${RVIE_BASE_URL}/ventas/resumen-sunat/${ruc}/${periodo}?tipo_resumen=${tipoResumen}`
      );
      
      console.log(`✅ [RVIE-VENTAS] Resumen obtenido:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [RVIE-VENTAS] Error consultando resumen SUNAT:', error);
      
      if (error.response?.status === 404) {
        return {
          ruc,
          periodo,
          tipo_resumen: tipoResumen,
          fecha_consulta: new Date().toISOString(),
          total_comprobantes: 0,
          comprobantes: [],
          totales: {},
          estado_consulta: 'SIN_DATOS',
          mensaje: 'No se encontraron datos para el período seleccionado',
          archivos_descargados: []
        };
      }
      
      throw error;
    }
  },

  /**
   * Obtener comprobantes de ventas procesados
   */
  async obtenerComprobantesVentas(ruc: string, periodo: string, tipoResumen: number = 1) {
    try {
      console.log(`📋 [RVIE-VENTAS] Obteniendo comprobantes - RUC: ${ruc}, Período: ${periodo}`);
      
      const response = await api.get(
        `${RVIE_BASE_URL}/ventas/comprobantes/${ruc}/${periodo}?tipo_resumen=${tipoResumen}`
      );
      
      console.log(`✅ [RVIE-VENTAS] Comprobantes obtenidos:`, response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ [RVIE-VENTAS] Error obteniendo comprobantes:', error);
      
      if (error.response?.status === 404) {
        // Retornar array vacío en lugar de lanzar error
        return [];
      }
      
      throw error;
    }
  },

  /**
   * Actualizar datos desde SUNAT y guardar localmente
   */
  async actualizarDesdeSunat(ruc: string, periodo: string, tiposResumen: number[] = [1, 4, 5]) {
    try {
      console.log(`🔄 [RVIE-VENTAS] Actualizando desde SUNAT - RUC: ${ruc}, Período: ${periodo}`);
      
      const response = await api.post(
        `${RVIE_BASE_URL}/ventas/actualizar-desde-sunat/${ruc}/${periodo}`,
        {
          periodo,
          tipos_resumen: tiposResumen,
          formato: 0,
          forzar_actualizacion: true
        }
      );
      
      console.log(`✅ [RVIE-VENTAS] Datos actualizados desde SUNAT:`, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [RVIE-VENTAS] Error actualizando desde SUNAT:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de ventas para el dashboard
   */
  async obtenerEstadisticasVentas(ruc: string, periodo: string) {
    try {
      // Por ahora calculamos estadísticas desde los comprobantes
      const comprobantes = await this.obtenerComprobantesVentas(ruc, periodo);
      
      const estadisticas = {
        periodo,
        total_comprobantes: comprobantes.length,
        total_facturado: comprobantes.reduce((sum: number, comp: any) => sum + (comp.importe_total || 0), 0),
        total_igv: comprobantes.reduce((sum: number, comp: any) => sum + (comp.igv || 0), 0),
        por_tipo_comprobante: {},
        distribucion_mensual: [],
        fecha_ultima_actualizacion: new Date().toISOString()
      };
      
      return estadisticas;
    } catch (error) {
      console.error('❌ [RVIE-VENTAS] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};

// ========================================
// SERVICIO PRINCIPAL SIRE (ACTUALIZADO)
// ========================================

export const sireService = {
  auth: sireAuthService,
  rvie: rvieService,
  ventas: rvieVentasService,  // Nuevo servicio de ventas
  tickets: rvieTicketService,
  files: sireFileUtils
};

export default sireService;
