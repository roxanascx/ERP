/**
 * Hook personalizado para gestión de tickets RVIE
 * Alineado con la implementación del backend
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { rvieTicketService } from '../services/rvieTicketService';
import { sireService } from '../services/sire';
import type {
  RvieTicket,
  TicketCallbacks,
  OperacionActiva,
  ArchivoTicket
} from '../types/rvieTickets';

// ==================== INTERFACES ====================

export interface UseRvieTicketsOptions {
  ruc: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseRvieTicketsReturn {
  // Estados principales
  tickets: RvieTicket[];
  operacionActiva: OperacionActiva | null;
  loading: boolean;
  error: string | null;
  
  // Estados de sesión
  sesionActiva: boolean;
  verificandoSesion: boolean;
  
  // Funciones principales
  generarTicketDescarga: (periodo: string) => Promise<RvieTicket>;
  generarTicketAceptar: (periodo: string) => Promise<RvieTicket>;
  generarTicketReemplazar: (periodo: string) => Promise<RvieTicket>;
  
  // Funciones de monitoreo
  consultarTicket: (ticketId: string) => Promise<RvieTicket>;
  descargarArchivo: (ticketId: string) => Promise<ArchivoTicket>;
  
  // Funciones de control
  iniciarMonitoreo: (ticketId: string, callbacks?: TicketCallbacks) => void;
  detenerMonitoreo: (ticketId?: string) => void;
  actualizarTickets: () => Promise<void>;
  
  // Utilidades
  clearError: () => void;
  getTicketById: (ticketId: string) => RvieTicket | undefined;
  getTicketsActivos: () => RvieTicket[];
}

// ==================== HOOK PRINCIPAL ====================

export function useRvieTickets(options: UseRvieTicketsOptions): UseRvieTicketsReturn {
  const { ruc, autoRefresh = false, refreshInterval = 5000 } = options;

  // ========== ESTADOS PRINCIPALES ==========
  const [tickets, setTickets] = useState<RvieTicket[]>([]);
  const [operacionActiva, setOperacionActiva] = useState<OperacionActiva | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ========== ESTADOS DE SESIÓN ==========
  const [sesionActiva, setSesionActiva] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(false);

  // ========== REFERENCIAS ==========
  const intervalRef = useRef<number | null>(null);
  const monitoringRefs = useRef<Map<string, number>>(new Map());

  // ========== UTILIDADES ==========
  const setErrorSafe = useCallback((errorMsg: string) => {
    console.error('❌ [RVIE-HOOK] Error:', errorMsg);
    setError(errorMsg);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Convertir TicketResponse del servicio a RvieTicket
  const convertTicketResponse = useCallback((ticketResponse: any): RvieTicket => {
    return {
      ticket_id: ticketResponse.ticket_id,
      status: ticketResponse.status,
      progreso_porcentaje: ticketResponse.progreso_porcentaje,
      descripcion: ticketResponse.descripcion,
      fecha_creacion: ticketResponse.fecha_creacion,
      fecha_actualizacion: ticketResponse.fecha_actualizacion,
      operacion: ticketResponse.operacion as 'descargar-propuesta' | 'aceptar-propuesta' | 'reemplazar-propuesta',
      ruc: ticketResponse.ruc,
      periodo: ticketResponse.periodo,
      resultado: ticketResponse.resultado,
      error_mensaje: ticketResponse.error_mensaje,
      archivo_nombre: ticketResponse.archivo_nombre,
      archivo_size: ticketResponse.archivo_size
    };
  }, []);

  // ========== VERIFICACIÓN DE SESIÓN ==========
  const verificarSesion = useCallback(async () => {
    try {
      setVerificandoSesion(true);
      const response = await sireService.auth.checkAuth(ruc);
      setSesionActiva(response.authenticated || false);
      return response.authenticated || false;
    } catch (error: any) {
      console.warn('⚠️ [RVIE-HOOK] Error verificando sesión:', error.message);
      setSesionActiva(false);
      return false;
    } finally {
      setVerificandoSesion(false);
    }
  }, [ruc]);

  // ========== ACTUALIZACIÓN DE TICKETS ==========
  const actualizarTickets = useCallback(async () => {
    // Por ahora, mantenemos los tickets en memoria
    // En el futuro se puede implementar persistencia local
  }, []);

  const agregarTicket = useCallback((ticket: RvieTicket) => {
    setTickets(prev => {
      const existe = prev.find(t => t.ticket_id === ticket.ticket_id);
      if (existe) {
        return prev.map(t => t.ticket_id === ticket.ticket_id ? ticket : t);
      }
      return [ticket, ...prev];
    });
  }, []);

  const actualizarTicket = useCallback((ticketActualizado: RvieTicket) => {
    setTickets(prev => 
      prev.map(t => 
        t.ticket_id === ticketActualizado.ticket_id ? ticketActualizado : t
      )
    );
  }, []);

  // ========== FUNCIONES PRINCIPALES ==========
  const generarTicketDescarga = useCallback(async (periodo: string): Promise<RvieTicket> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎫 [RVIE-HOOK] Generando ticket de descarga...');
      
      const ticketResponse = await rvieTicketService.generarTicketDescarga(ruc, periodo);
      const ticket = convertTicketResponse(ticketResponse);
      
      agregarTicket(ticket);
      
      // Configurar operación activa
      setOperacionActiva({
        tipo: 'descargar-propuesta',
        ticketId: ticket.ticket_id,
        estado: ticket.status,
        progreso: ticket.progreso_porcentaje,
        mensaje: ticket.descripcion,
        fechaInicio: ticket.fecha_creacion
      });

      setLoading(false);
      return ticket;

    } catch (error: any) {
      setErrorSafe(error.message);
      throw error;
    }
  }, [ruc, agregarTicket, setErrorSafe, convertTicketResponse]);

  const generarTicketAceptar = useCallback(async (periodo: string): Promise<RvieTicket> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎫 [RVIE-HOOK] Generando ticket de aceptación...');
      
      const ticketResponse = await rvieTicketService.generarTicketAceptar(ruc, periodo);
      const ticket = convertTicketResponse(ticketResponse);
      
      agregarTicket(ticket);
      
      setOperacionActiva({
        tipo: 'aceptar-propuesta',
        ticketId: ticket.ticket_id,
        estado: ticket.status,
        progreso: ticket.progreso_porcentaje,
        mensaje: ticket.descripcion,
        fechaInicio: ticket.fecha_creacion
      });

      setLoading(false);
      return ticket;

    } catch (error: any) {
      setErrorSafe(error.message);
      throw error;
    }
  }, [ruc, agregarTicket, setErrorSafe, convertTicketResponse]);

  const generarTicketReemplazar = useCallback(async (periodo: string): Promise<RvieTicket> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎫 [RVIE-HOOK] Generando ticket de reemplazo...');
      
      const ticketResponse = await rvieTicketService.generarTicketReemplazar(ruc, periodo);
      const ticket = convertTicketResponse(ticketResponse);
      
      agregarTicket(ticket);
      
      setOperacionActiva({
        tipo: 'reemplazar-propuesta',
        ticketId: ticket.ticket_id,
        estado: ticket.status,
        progreso: ticket.progreso_porcentaje,
        mensaje: ticket.descripcion,
        fechaInicio: ticket.fecha_creacion
      });

      setLoading(false);
      return ticket;

    } catch (error: any) {
      setErrorSafe(error.message);
      throw error;
    }
  }, [ruc, agregarTicket, setErrorSafe, convertTicketResponse]);

  // ========== FUNCIONES DE CONSULTA ==========
  const consultarTicket = useCallback(async (ticketId: string): Promise<RvieTicket> => {
    try {
      console.log(`🔍 [RVIE-HOOK] Consultando ticket ${ticketId}...`);
      
      const ticketResponse = await rvieTicketService.consultarTicket(ruc, ticketId);
      const ticket = convertTicketResponse(ticketResponse);
      
      actualizarTicket(ticket);
      
      // Actualizar operación activa si es el mismo ticket
      if (operacionActiva?.ticketId === ticketId) {
        setOperacionActiva(prev => prev ? {
          ...prev,
          estado: ticket.status,
          progreso: ticket.progreso_porcentaje,
          mensaje: ticket.descripcion
        } : null);
      }

      return ticket;

    } catch (error: any) {
      console.error(`❌ [RVIE-HOOK] Error consultando ticket ${ticketId}:`, error.message);
      throw error;
    }
  }, [ruc, actualizarTicket, operacionActiva, convertTicketResponse]);

  const descargarArchivo = useCallback(async (ticketId: string): Promise<ArchivoTicket> => {
    try {
      console.log(`📥 [RVIE-HOOK] Descargando archivo del ticket ${ticketId}...`);
      
      const archivo = await rvieTicketService.descargarArchivo(ruc, ticketId);
      
      return archivo;

    } catch (error: any) {
      console.error(`❌ [RVIE-HOOK] Error descargando archivo del ticket ${ticketId}:`, error.message);
      throw error;
    }
  }, [ruc]);

  // ========== FUNCIONES DE MONITOREO ==========
  const iniciarMonitoreo = useCallback((ticketId: string, callbacks?: TicketCallbacks) => {
    console.log(`🔄 [RVIE-HOOK] Iniciando monitoreo del ticket ${ticketId}...`);

    // Detener monitoreo previo si existe
    const existingInterval = monitoringRefs.current.get(ticketId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Función de polling
    const poll = async () => {
      try {
        const ticket = await consultarTicket(ticketId);
        
        // Callback de progreso
        if (callbacks?.onProgress) {
          callbacks.onProgress(ticket);
        }

        // Verificar si completó
        if (ticket.status === 'TERMINADO') {
          console.log(`✅ [RVIE-HOOK] Ticket ${ticketId} completado`);
          
          detenerMonitoreo(ticketId);
          
          if (callbacks?.onCompleted) {
            try {
              const archivo = await descargarArchivo(ticketId);
              callbacks.onCompleted(ticket, archivo);
            } catch (error) {
              callbacks.onCompleted(ticket);
            }
          }
        } else if (ticket.status === 'ERROR') {
          console.error(`❌ [RVIE-HOOK] Ticket ${ticketId} falló:`, ticket.error_mensaje);
          
          detenerMonitoreo(ticketId);
          
          if (callbacks?.onError) {
            callbacks.onError(ticket.error_mensaje || 'Error desconocido');
          }
        }

      } catch (error: any) {
        console.error(`❌ [RVIE-HOOK] Error en polling del ticket ${ticketId}:`, error.message);
        
        if (callbacks?.onError) {
          callbacks.onError(error.message);
        }
      }
    };

    // Iniciar polling
    const interval = setInterval(poll, refreshInterval);
    monitoringRefs.current.set(ticketId, interval);

    // Polling inicial inmediato
    poll();

  }, [consultarTicket, descargarArchivo, refreshInterval]);

  const detenerMonitoreo = useCallback((ticketId?: string) => {
    if (ticketId) {
      const interval = monitoringRefs.current.get(ticketId);
      if (interval) {
        clearInterval(interval);
        monitoringRefs.current.delete(ticketId);
        console.log(`⏹️ [RVIE-HOOK] Monitoreo detenido para ticket ${ticketId}`);
      }
    } else {
      // Detener todos los monitoreos
      monitoringRefs.current.forEach((interval, id) => {
        clearInterval(interval);
        console.log(`⏹️ [RVIE-HOOK] Monitoreo detenido para ticket ${id}`);
      });
      monitoringRefs.current.clear();
    }
  }, []);

  // ========== UTILIDADES ==========
  const getTicketById = useCallback((ticketId: string): RvieTicket | undefined => {
    return tickets.find(t => t.ticket_id === ticketId);
  }, [tickets]);

  const getTicketsActivos = useCallback((): RvieTicket[] => {
    return tickets.filter(t => ['PENDIENTE', 'PROCESANDO'].includes(t.status));
  }, [tickets]);

  // ========== EFECTOS ==========
  useEffect(() => {
    verificarSesion();
  }, [verificarSesion]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        verificarSesion();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, verificarSesion]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      detenerMonitoreo(); // Detener todos los monitoreos
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [detenerMonitoreo]);

  // ========== RETURN ==========
  return {
    // Estados principales
    tickets,
    operacionActiva,
    loading,
    error,
    
    // Estados de sesión
    sesionActiva,
    verificandoSesion,
    
    // Funciones principales
    generarTicketDescarga,
    generarTicketAceptar,
    generarTicketReemplazar,
    
    // Funciones de monitoreo
    consultarTicket,
    descargarArchivo,
    
    // Funciones de control
    iniciarMonitoreo,
    detenerMonitoreo,
    actualizarTickets,
    
    // Utilidades
    clearError,
    getTicketById,
    getTicketsActivos
  };
}

export default useRvieTickets;
