/**
 * Hook personalizado para gestionar el estado RVIE
 * Maneja autenticación, tickets, y operaciones RVIE
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { sireService } from '../services/sire';
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
    
    const sireError: SireApiError = {
      code: err.response?.data?.code || 'UNKNOWN_ERROR',
      message: err.response?.data?.message || err.message || 'Error desconocido',
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
  // OPERACIONES RVIE
  // ========================================

  const descargarPropuesta = useCallback(async (request: RvieDescargarPropuestaRequest): Promise<RvieProcesoResponse> => {
    setLoading(true);
    setOperacionActiva('descargar_propuesta');
    
    try {
      const response = await sireService.rvie.descargarPropuesta(ruc, request);
      clearError();
      
      // Iniciar polling del ticket
      if (response.ticket_id) {
        startTicketPolling(response.ticket_id);
      }
      
      return response;
    } catch (error) {
      handleError(error, 'descarga de propuesta');
      throw error;
    } finally {
      setLoading(false);
      setOperacionActiva(null);
    }
  }, [ruc, handleError, clearError]);

  const aceptarPropuesta = useCallback(async (request: RvieAceptarPropuestaRequest): Promise<RvieProcesoResponse> => {
    setLoading(true);
    setOperacionActiva('aceptar_propuesta');
    
    try {
      const response = await sireService.rvie.aceptarPropuesta(ruc, request);
      clearError();
      
      if (response.ticket_id) {
        startTicketPolling(response.ticket_id);
      }
      
      return response;
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
      const ticket = await sireService.rvie.consultarTicket(ruc, ticketId);
      
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
        if (ticket.estado === 'COMPLETADO' || ticket.estado === 'ERROR') {
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
      const archivo = await sireService.rvie.descargarArchivo(ruc, ticketId);
      
      // Descargar automáticamente
      sireService.files.downloadFromBase64(
        archivo.contenido,
        archivo.nombre_archivo,
        archivo.tipo_mime
      );
      
      return archivo;
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

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
    
    // Datos complementarios
    cargarResumen,
    cargarInconsistencias,
    
    // Utilidades
    clearError
  };
}

export default useRvie;
