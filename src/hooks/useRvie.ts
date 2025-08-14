/**
 * Hook personalizado para gestionar el estado RVIE
 * Maneja autenticación, tickets, y operaciones RVIE
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { sireService, sireGeneralService, rvieService } from '../services/sire';
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
  SireApiError,
  UseRvieOptions
} from '../types/sire';

// ========================================
// HOOK PRINCIPAL RVIE
// ========================================

export function useRvie(options: UseRvieOptions) {
  const { ruc, auto_refresh = false, refresh_interval = 30000 } = options;
  
  // Estados principales
  const [authStatus, setAuthStatus] = useState<SireAuthStatus | null>(null);
  const [tickets, setTickets] = useState<RvieTicketResponse[]>([]);
  const [resumen, setResumen] = useState<RvieResumenResponse | null>(null);
  const [inconsistencias, setInconsistencias] = useState<RvieInconsistencia[]>([]);
  const [endpointsDisponibles, setEndpointsDisponibles] = useState<any>(null);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SireApiError | null>(null);
  const [operacionActiva, setOperacionActiva] = useState<string | null>(null);
  
  // Referencias para intervalos
  const refreshIntervalRef = useRef<number | null>(null);
  const ticketPollingRef = useRef<Map<string, number>>(new Map());

  // ========================================
  // UTILIDADES DE ERROR
  // ========================================

  const handleError = useCallback((err: any, operacion: string) => {
    console.error(`Error en ${operacion}:`, err);
    
    // Detectar errores específicos de SUNAT
    let messageForUser = '';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (err.response?.status === 503) {
      messageForUser = 'Servicio SUNAT temporalmente no disponible. Por favor, intenta más tarde.';
      errorCode = 'SUNAT_UNAVAILABLE';
    } else if (err.response?.status === 500 && err.response?.data?.detail?.includes('SUNAT')) {
      messageForUser = 'Error en el servidor de SUNAT. Por favor, intenta más tarde.';
      errorCode = 'SUNAT_SERVER_ERROR';
    } else if (err.response?.status === 401) {
      messageForUser = 'Credenciales SUNAT inválidas o expiradas.';
      errorCode = 'SUNAT_UNAUTHORIZED';
    } else {
      messageForUser = err.response?.data?.message || err.message || 'Error desconocido';
      errorCode = err.response?.data?.code || 'UNKNOWN_ERROR';
    }
    
    const sireError: SireApiError = {
      code: errorCode,
      message: messageForUser,
      details: err.response?.data?.details,
      timestamp: new Date().toISOString()
    };
    
    setError(sireError);
    setOperacionActiva(null);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================
  // AUTENTICACIÓN
  // ========================================

  const checkAuth = useCallback(async () => {
    try {
      const status = await sireService.auth.checkAuth(ruc);
      setAuthStatus(status);
      return status;
    } catch (error) {
      console.warn('Error verificando autenticación SIRE:', error);
      setAuthStatus({ authenticated: false });
      return { authenticated: false };
    }
  }, [ruc]);

  const authenticate = useCallback(async () => {
    setLoading(true);
    setOperacionActiva('authenticate');
    
    try {
      const status = await sireService.auth.authenticate(ruc);
      setAuthStatus(status);
      clearError();
      return status;
    } catch (error) {
      handleError(error, 'autenticación');
      throw error;
    } finally {
      setLoading(false);
      setOperacionActiva(null);
    }
  }, [ruc, handleError, clearError]);

  // ========================================
  // CARGAR ENDPOINTS DISPONIBLES
  // ========================================

  const cargarEndpoints = useCallback(async () => {
    try {
      const endpoints = await sireGeneralService.getRvieEndpoints();
      setEndpointsDisponibles(endpoints);
    } catch (error) {
      console.error('Error cargando endpoints RVIE:', error);
    }
  }, []);

  // ========================================
  // CARGAR TICKETS EXISTENTES
  // ========================================

  const cargarTickets = useCallback(async () => {
    try {
      console.log(`🔄 [RVIE] Cargando tickets existentes para RUC: ${ruc}`);
      const ticketsData = await sireService.tickets.listarTickets(ruc);
      setTickets(ticketsData);
      console.log(`✅ [RVIE] Cargados ${ticketsData.length} tickets existentes`);
      
      // Iniciar monitoreo automático para tickets en proceso
      ticketsData.forEach((ticket: RvieTicketResponse) => {
        if (ticket.status === 'PROCESANDO' || ticket.status === 'PENDIENTE') {
          startTicketPolling(ticket.ticket_id);
        }
      });
      
    } catch (error) {
      console.error('Error cargando tickets existentes:', error);
      // No lanzar error para no bloquear la inicialización
    }
  }, [ruc]);

  // ========================================
  // OPERACIONES RVIE
  // ========================================

  const descargarPropuesta = useCallback(async (request: RvieDescargarPropuestaRequest): Promise<RvieTicketResponse> => {
    setLoading(true);
    setOperacionActiva('descargar_propuesta');
    
    try {
      console.log('🚀 [FRONTEND] Iniciando descarga propuesta RVIE:', {
        ruc,
        periodo: request.periodo,
        forzar_descarga: request.forzar_descarga || false,
        incluir_detalle: request.incluir_detalle !== false
      });

      // Llamar directamente al servicio RVIE mejorado
      const response = await rvieService.descargarPropuesta(ruc, {
        periodo: request.periodo,
        forzar_descarga: request.forzar_descarga || false,
        incluir_detalle: request.incluir_detalle !== false
      });

      console.log('✅ [FRONTEND] Respuesta de descarga propuesta:', response);

      // Si es una respuesta con ticket, crear ticket para el estado
      const ticket: RvieTicketResponse = {
        ticket_id: response.ticket_id || `manual_${Date.now()}`,
        status: response.estado === 'COMPLETADO' ? 'TERMINADO' : response.estado === 'ERROR' ? 'ERROR' : 'TERMINADO',
        descripcion: `Descarga propuesta ${request.periodo}`,
        operacion: 'descargar-propuesta',
        ruc,
        periodo: request.periodo,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        resultado: response,
        progreso_porcentaje: 100
      };
      
      // Agregar ticket al estado
      setTickets(prev => [...prev, ticket]);
      
      clearError();
      return ticket;
    } catch (error) {
      handleError(error, 'descarga de propuesta');
      throw error;
    } finally {
      setLoading(false);
      setOperacionActiva(null);
    }
  }, [ruc, handleError, clearError]);

  const aceptarPropuesta = useCallback(async (request: RvieAceptarPropuestaRequest): Promise<RvieTicketResponse> => {
    setLoading(true);
    setOperacionActiva('aceptar_propuesta');
    
    try {
      // Usar el nuevo sistema de tickets
      const ticket = await sireService.tickets.generarTicket({
        ruc,
        periodo: request.periodo,
        operacion: 'aceptar-propuesta'
      });
      
      // Agregar ticket al estado
      setTickets(prev => [...prev, ticket]);
      
      // Iniciar monitoreo automático
      startTicketPolling(ticket.ticket_id);
      
      clearError();
      return ticket;
    } catch (error) {
      handleError(error, 'aceptación de propuesta');
      throw error;
    } finally {
      setLoading(false);
      setOperacionActiva(null);
    }
  }, [ruc, handleError, clearError]);

  const reemplazarPropuesta = useCallback(async (request: RvieReemplazarPropuestaRequest): Promise<RvieProcesoResponse> => {
    setLoading(true);
    setOperacionActiva('reemplazar_propuesta');
    
    try {
      const response = await sireService.rvie.reemplazarPropuesta(ruc, request);
      clearError();
      
      if (response.ticket_id) {
        startTicketPolling(response.ticket_id);
      }
      
      return response;
    } catch (error) {
      handleError(error, 'reemplazo de propuesta');
      throw error;
    } finally {
      setLoading(false);
      setOperacionActiva(null);
    }
  }, [ruc, handleError, clearError]);

  const registrarPreliminar = useCallback(async (request: RvieRegistrarPreliminarRequest): Promise<RvieProcesoResponse> => {
    setLoading(true);
    setOperacionActiva('registrar_preliminar');
    
    try {
      const response = await sireService.rvie.registrarPreliminar(ruc, request);
      clearError();
      
      if (response.ticket_id) {
        startTicketPolling(response.ticket_id);
      }
      
      return response;
    } catch (error) {
      handleError(error, 'registro preliminar');
      throw error;
    } finally {
      setLoading(false);
      setOperacionActiva(null);
    }
  }, [ruc, handleError, clearError]);

  // ========================================
  // GESTIÓN DE TICKETS
  // ========================================

  const consultarTicket = useCallback(async (ticketId: string): Promise<RvieTicketResponse> => {
    try {
      const ticket = await sireService.tickets.consultarTicket(ruc, ticketId);
      
      // Actualizar ticket en la lista
      setTickets(prev => {
        const index = prev.findIndex(t => t.ticket_id === ticketId);
        if (index >= 0) {
          const newTickets = [...prev];
          newTickets[index] = ticket;
          return newTickets;
        } else {
          return [...prev, ticket];
        }
      });
      
      return ticket;
    } catch (error) {
      console.warn(`Error consultando ticket ${ticketId}:`, error);
      throw error;
    }
  }, [ruc]);

  const startTicketPolling = useCallback((ticketId: string) => {
    // Limpiar polling anterior si existe
    const existingInterval = ticketPollingRef.current.get(ticketId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }
    
    // Función de polling
    const poll = async () => {
      try {
        const ticket = await consultarTicket(ticketId);
        
        // Detener polling si el ticket está completado o con error
        if (ticket.status === 'TERMINADO' || ticket.status === 'ERROR') {
          stopTicketPolling(ticketId);
        }
      } catch (error) {
        console.warn(`Error en polling de ticket ${ticketId}:`, error);
        stopTicketPolling(ticketId);
      }
    };
    
    // Consultar inmediatamente
    poll();
    
    // Configurar intervalo
    const interval = window.setInterval(poll, 5000); // Cada 5 segundos
    ticketPollingRef.current.set(ticketId, interval);
  }, [consultarTicket]);

  const stopTicketPolling = useCallback((ticketId: string) => {
    const interval = ticketPollingRef.current.get(ticketId);
    if (interval) {
      clearInterval(interval);
      ticketPollingRef.current.delete(ticketId);
    }
  }, []);

  const descargarArchivo = useCallback(async (ticketId: string): Promise<RvieArchivoResponse> => {
    try {
      const { filename, blob } = await sireService.tickets.descargarArchivoBlob(ruc, ticketId);
      
      // Crear URL temporal y descargar automáticamente
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Archivo descargado: ${filename}`);
      
      return {
        filename,
        file_size: blob.size,
        content_type: blob.type
      };
    } catch (error) {
      handleError(error, 'descarga de archivo');
      throw error;
    }
  }, [ruc, handleError]);

  // ========================================
  // DATOS COMPLEMENTARIOS
  // ========================================

  const cargarResumen = useCallback(async (periodo: string) => {
    try {
      const resumenData = await sireService.rvie.obtenerResumen(ruc, periodo);
      setResumen(resumenData);
      return resumenData;
    } catch (error) {
      console.warn('Error cargando resumen RVIE:', error);
    }
  }, [ruc]);

  const cargarInconsistencias = useCallback(async (periodo: string, fase: string = 'propuesta') => {
    try {
      const inconsistenciasData = await sireService.rvie.consultarInconsistencias(ruc, periodo, fase);
      setInconsistencias(inconsistenciasData);
      return inconsistenciasData;
    } catch (error) {
      console.warn('Error cargando inconsistencias:', error);
    }
  }, [ruc]);

  // ========================================
  // EFECTOS Y LIMPIEZA
  // ========================================

  // Verificar autenticación al montar y auto-autenticarse
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const status = await checkAuth();
        
        // Si no está autenticado, intentar autenticación automática
        if (!status.authenticated) {
          console.log('🔄 [RVIE] No hay sesión activa, intentando autenticación automática...');
          try {
            await authenticate();
            console.log('✅ [RVIE] Autenticación automática exitosa');
          } catch (error) {
            console.warn('⚠️ [RVIE] Autenticación automática falló:', error);
          }
        }
        
        // Cargar tickets existentes independientemente del estado de autenticación
        await cargarTickets();
        
      } catch (error) {
        console.error('❌ [RVIE] Error en inicialización:', error);
      }
    };

    initializeAuth();
    cargarEndpoints(); // Cargar endpoints disponibles
  }, [ruc, cargarTickets]); // Añadido cargarTickets a las dependencias

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (auto_refresh && refresh_interval > 0) {
      refreshIntervalRef.current = window.setInterval(() => {
        checkAuth();
      }, refresh_interval);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    }
  }, [auto_refresh, refresh_interval, checkAuth]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      // Limpiar todos los intervalos
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      
      ticketPollingRef.current.forEach(interval => {
        clearInterval(interval);
      });
      ticketPollingRef.current.clear();
    };
  }, []);

  // ========================================
  // VALOR DE RETORNO
  // ========================================

  return {
    // Estados
    authStatus,
    tickets,
    resumen,
    inconsistencias,
    endpointsDisponibles,
    loading,
    error,
    operacionActiva,
    
    // Acciones de autenticación
    checkAuth,
    authenticate,
    
    // Operaciones RVIE
    descargarPropuesta,
    aceptarPropuesta,
    reemplazarPropuesta,
    registrarPreliminar,
    
    // Gestión de tickets
    consultarTicket,
    startTicketPolling,
    stopTicketPolling,
    descargarArchivo,
    cargarTickets,
    
    // Datos complementarios
    cargarResumen,
    cargarInconsistencias,
    cargarEndpoints,
    
    // Utilidades
    clearError
  };
}

export default useRvie;
