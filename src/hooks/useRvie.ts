/**
 * Hook personalizado para gestionar el estado RVIE
 * 
 * IMPORTANTE: Este hook NO realiza autenticación automática.
 * Solo verifica el estado de autenticación y requiere acción explícita
 * del usuario para autenticarse mediante la función authenticate().
 * 
 * Maneja autenticación manual, tickets, y operaciones RVIE
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

  const handleError = useCallback((err: any, _operacion: string) => {
    
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
    }
  }, []);

  // ========================================
  // CARGAR TICKETS EXISTENTES
  // ========================================

  const cargarTickets = useCallback(async () => {
    try {
      const ticketsData = await sireService.tickets.listarTickets(ruc, false); // Solo tickets con archivos
      setTickets(ticketsData);
      
      // Nota: El monitoreo automático se configurará después de definir startTicketPolling
      
    } catch (error) {
      // No lanzar error para no bloquear la inicialización
    }
  }, [ruc]);

  const cargarTodosTickets = useCallback(async () => {
    try {
      const ticketsData = await sireService.tickets.listarTickets(ruc, true); // Incluir tickets SYNC
      setTickets(ticketsData);
      
      // Nota: El monitoreo automático se configurará después de definir startTicketPolling
      
    } catch (error) {
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

      // OPCIÓN 1: Llamar directamente (respuesta inmediata)
      if (!request.forzar_descarga) {
        try {
          const response = await rvieService.descargarPropuesta(ruc, {
            periodo: request.periodo,
            forzar_descarga: false,
            incluir_detalle: request.incluir_detalle !== false
          });


          // Crear ticket local para mostrar en la UI
          const ticket: RvieTicketResponse = {
            ticket_id: response.ticket_id || `sync_${Date.now()}`,
            status: 'TERMINADO',
            descripcion: `Descarga propuesta ${request.periodo}`,
            operacion: 'descargar-propuesta',
            ruc,
            periodo: request.periodo,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString(),
            resultado: response,
            progreso_porcentaje: 100
          };
          
          // Agregar ticket al estado para mostrar en UI
          setTickets(prev => [ticket, ...prev]);
          
          // Recargar tickets desde backend para sincronizar
          await cargarTickets();
          
          clearError();
          return ticket;
          
        } catch (error: any) {
          // Si la respuesta inmediata falla, usar flujo de tickets
        }
      }

      // OPCIÓN 2: Generar ticket (operación asíncrona)
      
      const ticketRequest = {
        ruc,
        periodo: request.periodo,
        operacion: 'descargar-propuesta' as const
      };

      const ticket = await sireService.tickets.generarTicket(ticketRequest);
      
      
      // Agregar ticket al estado inmediatamente
      setTickets(prev => [ticket, ...prev]);
      
      // Iniciar monitoreo del ticket
      if (ticket.status === 'PROCESANDO' || ticket.status === 'PENDIENTE') {
        startTicketPolling(ticket.ticket_id);
      }
      
      clearError();
      return ticket;
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
          const newTickets = [...prev, ticket];
          return newTickets;
        }
      });
      
      return ticket;
    } catch (error) {
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
    } catch (error: any) {
      
      // Si no existe resumen guardado (404), eso es normal
      if (error.response?.status === 404) {
        setResumen(null);
      } else {
      }
      
      return null;
    }
  }, [ruc]);

  const cargarPropuestaGuardada = useCallback(async (periodo: string) => {
    try {
      const propuesta = await sireService.rvie.consultarPropuestaGuardada(ruc, periodo);
      return propuesta;
    } catch (error: any) {
      
      // Si no existe propuesta guardada (404), eso es normal
      if (error.response?.status === 404) {
      } else {
      }
      
      return null;
    }
  }, [ruc]);

  const cargarInconsistencias = useCallback(async (periodo: string, fase: string = 'propuesta') => {
    try {
      const inconsistenciasData = await sireService.rvie.consultarInconsistencias(ruc, periodo, fase);
      setInconsistencias(inconsistenciasData);
      return inconsistenciasData;
    } catch (error) {
    }
  }, [ruc]);

  const cargarComprobantes = useCallback(async (periodo: string) => {
    try {
      setLoading(true);
      const comprobantes = await rvieService.obtenerComprobantes(ruc, periodo);
      return comprobantes;
    } catch (error: any) {
      handleError(error, 'cargarComprobantes');
      return [];
    } finally {
      setLoading(false);
    }
  }, [ruc, handleError]);

  // ========================================
  // EFECTOS Y LIMPIEZA
  // ========================================

  // Verificar autenticación al montar (SIN auto-autenticarse)
  useEffect(() => {
    const initializeStatus = async () => {
      try {
        // ✅ SOLO verificar estado, NO auto-autenticar
        await checkAuth();
        
        // Cargar endpoints disponibles siempre
        await cargarEndpoints();
        
        // Solo cargar tickets si está autenticado
        const currentStatus = await checkAuth();
        if (currentStatus.authenticated) {
          await cargarTodosTickets();
        }
        
      } catch (error) {
        console.log('Error inicializando RVIE:', error);
      }
    };

    // Solo inicializar si tenemos un RUC válido
    if (ruc && ruc.trim() !== '') {
      initializeStatus();
    }
  }, [ruc]); // ✅ Dependencias simplificadas

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
    cargarTodosTickets,
    
    // Datos complementarios
    cargarResumen,
    cargarPropuestaGuardada,
    cargarInconsistencias,
    cargarComprobantes,
    cargarEndpoints,
    
    // Utilidades
    clearError
  };
}

export default useRvie;
