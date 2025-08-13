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
  SireAuthStatus
} from '../types/sire';

// ========================================
// CONFIGURACIÓN BASE
// ========================================

const SIRE_BASE_URL = '/api/sire';
const RVIE_BASE_URL = `${SIRE_BASE_URL}/rvie`;

// ========================================
// SERVICIOS DE AUTENTICACIÓN SIRE
// ========================================

export const sireAuthService = {
  /**
   * Verificar estado de autenticación SIRE
   */
  async checkAuth(ruc: string): Promise<SireAuthStatus> {
    const response = await api.get(`${SIRE_BASE_URL}/auth/${ruc}/status`);
    return response.data;
  },

  /**
   * Autenticar con SUNAT SIRE
   */
  async authenticate(ruc: string): Promise<SireAuthStatus> {
    const response = await api.post(`${SIRE_BASE_URL}/auth/${ruc}/login`);
    return response.data;
  },

  /**
   * Cerrar sesión SIRE
   */
  async logout(ruc: string): Promise<void> {
    await api.post(`${SIRE_BASE_URL}/auth/${ruc}/logout`);
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
      `${RVIE_BASE_URL}/${ruc}/descargar-propuesta`,
      request
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
      `${RVIE_BASE_URL}/${ruc}/aceptar-propuesta`,
      request
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
// SERVICIO PRINCIPAL SIRE
// ========================================

export const sireService = {
  auth: sireAuthService,
  rvie: rvieService,
  files: sireFileUtils
};

export default sireService;
