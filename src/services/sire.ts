/**
 * Servicio API para el módulo SIRE
 * Comunicación con endpoints del backend SIRE (RVIE y RCE)
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
  SireStatusResponse,
  SireModuloActivo,
  SireModuloConfig
} from '../types/sire';
import { rvieComprobantesService } from './rvieComprobantesService';

// ========================================
// CONFIGURACIÓN BASE
// ========================================

const SIRE_BASE_URL = '/api/v1/sire';  // Actualizado para usar /api/v1
const RVIE_BASE_URL = `${SIRE_BASE_URL}/rvie`;
const RCE_BASE_URL = `${SIRE_BASE_URL}/rce`;

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
      throw error;
    }
  },

  /**
   * Obtener endpoints RCE disponibles
   */
  async getRceEndpoints() {
    try {
      const response = await api.get(`${RCE_BASE_URL}/comprobantes/health`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verificar estado de módulos SIRE
   */
  async verificarEstadoModulos(ruc: string): Promise<{
    rvie: SireModuloConfig;
    rce: SireModuloConfig;
    modulo_activo: SireModuloActivo;
  }> {
    try {
      const [rvieHealth, rceHealth] = await Promise.allSettled([
        api.get(`${RVIE_BASE_URL}/health`, { params: { ruc } }),
        api.get(`${RCE_BASE_URL}/comprobantes/health`, { params: { ruc } })
      ]);

      const rvieDisponible = rvieHealth.status === 'fulfilled' && rvieHealth.value.data.exitoso;
      const rceDisponible = rceHealth.status === 'fulfilled' && rceHealth.value.data.exitoso;

      return {
        rvie: {
          disponible: rvieDisponible,
          ultimo_check: new Date().toISOString(),
          endpoints_activos: rvieDisponible ? ['consultas', 'propuestas', 'tickets'] : [],
          configuracion: {}
        },
        rce: {
          disponible: rceDisponible,
          ultimo_check: new Date().toISOString(),
          endpoints_activos: rceDisponible ? ['comprobantes', 'propuestas', 'procesos'] : [],
          configuracion: {}
        },
        modulo_activo: 'ninguno' // Por defecto, el usuario debe seleccionar
      };
    } catch (error) {
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
    
    // Test de conectividad básica primero
    try {
      await api.get('/api/v1/companies/');  // ✅ ARREGLADO: agregado /api/v1
    } catch (error) {
      // Error de conectividad ignorado para el test básico
    }
    
    try {
      const response = await api.get<SireStatusResponse>(url);
      
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
      throw error;
    }
  },

  /**
   * Autenticar con SUNAT SIRE
   */
  async authenticate(ruc: string): Promise<SireAuthStatus> {
    try {
      // Primero obtener las credenciales de la empresa
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
      
      
      const response = await api.post(`${SIRE_BASE_URL}/login`, authRequest);  // ✅ ARREGLADO: removido /auth
      return response.data;
    } catch (error: any) {
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
          
          return comprobantes;
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          // Si no es un 404, es un error real
          throw error;
        }
      }
      
      // No hay propuesta - informar que se debe descargar primero
      return [];
      
    } catch (error) {
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
      
      const response = await api.post(`${RVIE_BASE_URL}/generar-ticket`, request);
      
      const ticket = mapTicketResponse(response.data);
      return ticket;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Listar todos los tickets de un RUC
   */
  async listarTickets(ruc: string, incluirTodos: boolean = false): Promise<RvieTicketResponse[]> {
    try {
      
      const params = incluirTodos ? '?incluir_todos=true' : '';
      const response = await api.get(`${RVIE_BASE_URL}/tickets/${ruc}${params}`);
      
      const tickets = response.data.map((ticketData: any) => mapTicketResponse(ticketData));
      return tickets;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Listar todos los tickets incluyendo SYNC para operaciones
   */
  async listarTodosTickets(ruc: string): Promise<RvieTicketResponse[]> {
    try {
      
      const response = await api.get(`${RVIE_BASE_URL}/tickets/${ruc}?incluir_todos=true`);
      
      const tickets = response.data.map((ticketData: any) => mapTicketResponse(ticketData));
      return tickets;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Consultar estado de un ticket
   */
  async consultarTicket(ruc: string, ticketId: string): Promise<RvieTicketResponse> {
    try {
      
      const response = await api.get(`${RVIE_BASE_URL}/ticket/${ruc}/${ticketId}`);
      
      const ticket = mapTicketResponse(response.data);
      return ticket;
    } catch (error: any) {
      
      // Si el ticket no se encuentra en la BD, intentar consultar directamente a SUNAT
      if (error.response?.status === 404) {
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
      
      // Usar endpoint de consulta directa a SUNAT
      const response = await api.get(`${RVIE_BASE_URL}/consultar-ticket-sunat`, {
        params: { ruc, ticket_id: ticketId }
      });
      
      const ticket = mapTicketResponse(response.data);
      
      // Opcionalmente, guardar el ticket en la BD para futuras consultas
      try {
        await this.sincronizarTicket(ruc, ticket);
      } catch (syncError) {
      }
      
      return ticket;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Sincronizar ticket externo con la base de datos
   */
  async sincronizarTicket(ruc: string, ticket: RvieTicketResponse): Promise<void> {
    try {
      
      await api.post(`${RVIE_BASE_URL}/sincronizar-ticket`, {
        ruc,
        ticket
      });
      
    } catch (error) {
      throw error;
    }
  },

  /**
   * Descargar archivo de un ticket completado
   */
  async descargarArchivo(ruc: string, ticketId: string): Promise<RvieArchivoResponse> {
    try {
      
      const response = await api.get(`${RVIE_BASE_URL}/archivo/${ruc}/${ticketId}`);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Descargar archivo como blob directamente desde el endpoint
   */
  async descargarArchivoBlob(ruc: string, ticketId: string): Promise<{ filename: string; blob: Blob }> {
    try {
      
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
      
      
      return {
        filename,
        blob: response.data  // response.data ya es un Blob cuando responseType es 'blob'
      };
    } catch (error) {
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
    
    
    for (let intento = 1; intento <= maxIntentos; intento++) {
      try {
        const ticket = await this.consultarTicket(ruc, ticketId);
        
        // Llamar callback de progreso si existe
        if (onProgress) {
          onProgress(ticket);
        }
        
        // Verificar si está completado
        if (ticket.status === 'TERMINADO') {
          return ticket;
        }
        
        if (ticket.status === 'ERROR') {
          return ticket;
        }
        
        // Si aún está procesando, esperar
        if (ticket.status === 'PENDIENTE' || ticket.status === 'PROCESANDO') {
          
          if (intento < maxIntentos) {
            await new Promise(resolve => setTimeout(resolve, intervalo));
          }
        }
        
      } catch (error) {
        
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
      
      const response = await api.get(
        `${RVIE_BASE_URL}/ventas/resumen-sunat/${ruc}/${periodo}?tipo_resumen=${tipoResumen}`
      );
      
      return response.data;
    } catch (error: any) {
      
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
      
      const response = await api.get(
        `${RVIE_BASE_URL}/ventas/comprobantes/${ruc}/${periodo}?tipo_resumen=${tipoResumen}`
      );
      
      return response.data;
    } catch (error: any) {
      
      if (error.response?.status === 404) {
        // Retornar array vacío en lugar de lanzar error
        return [];
      }
      
      throw error;
    }
  },

  /**
   * Actualizar datos desde SUNAT y guardar localmente
   * ✅ CORREGIDO: Usar endpoint que existe y funciona + auto-guardado en BD
   */
  async actualizarDesdeSunat(ruc: string, periodo: string, _tiposResumen: number[] = [1, 4, 5]) {
    try {
      
      // ✅ USAR ENDPOINT QUE SÍ EXISTE: /comprobantes/{ruc}/{periodo}
      const response = await api.get(
        `${RVIE_BASE_URL}/ventas/comprobantes/${ruc}/${periodo}`,
        {
          params: {
            page: 1,
            per_page: 99,
            tipo_resumen: 1  // Usar tipo 1 por defecto (propuesta)
          }
        }
      );
      
      
      // Verificar si hay datos
      if (response.data?.data?.registros && response.data.data.registros.length > 0) {
        
        // 🆕 AUTO-GUARDADO: Guardar automáticamente en BD local
        try {
          await rvieComprobantesService.guardarDesdeSunat(
            ruc, 
            periodo, 
            response.data.data.registros
          );
          
        } catch (guardarError) {
          console.warn('⚠️ Error en auto-guardado (datos de SUNAT disponibles):', guardarError);
          // No fallar la operación principal si falla el guardado
        }
        
        return {
          success: true,
          data: response.data.data,
          mensaje: `Se encontraron ${response.data.data.registros.length} comprobantes`,
          periodo: periodo
        };
      } else {
        return {
          success: true,
          data: { registros: [], paginacion: { totalRegistros: 0 } },
          mensaje: `No hay comprobantes disponibles para el período ${periodo}`,
          periodo: periodo
        };
      }
      
    } catch (error) {
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
