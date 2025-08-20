/**
 * Hook especializado para gestión de procesos RCE
 * Manejo de envíos a SUNAT, tickets y seguimiento de estado
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { rceApi } from '../services/rceApi';
import type {
  RceProceso,
  RceTicket,
  RceEstadoProceso,
  RceDescargaMasivaRequest
} from '../types/rce';

// ========================================
// TIPOS DEL HOOK
// ========================================

interface UseRceProcesosOptions {
  ruc: string;
  auto_refresh?: boolean;
  refresh_interval?: number;
  max_tickets_activos?: number;
}

interface CredencialesSunat {
  usuario_sunat: string;
  clave_sunat: string;
}

interface ProcesoResumen {
  total_procesos: number;
  por_estado: Record<RceEstadoProceso, number>;
  tickets_activos: number;
  ultimo_envio: string | null;
  ultimo_exito: string | null;
}

interface UseRceProcesosReturn {
  // Estado principal
  procesos: RceProceso[];
  tickets: RceTicket[];
  loading: boolean;
  error: string | null;
  
  // Estados específicos
  enviando: boolean;
  consultando: boolean;
  cancelando: boolean;
  descargando: boolean;
  
  // Resumen
  resumen: ProcesoResumen;
  
  // Métodos principales
  enviarProceso: (periodo: string, tipoEnvio: string, credenciales: CredencialesSunat, observaciones?: string) => Promise<RceProceso>;
  consultarEstado: (periodo: string, ticketId?: string) => Promise<RceProceso>;
  cancelarProceso: (periodo: string, motivo: string, credenciales: CredencialesSunat) => Promise<RceProceso>;
  
  // Métodos de tickets
  consultarTicket: (ticketId: string, credenciales: CredencialesSunat) => Promise<RceTicket>;
  actualizarTicket: (ticketId: string, credenciales: CredencialesSunat) => Promise<any>;
  actualizarTodosLosTickets: (credenciales: CredencialesSunat) => Promise<void>;
  
  // Descarga masiva
  solicitarDescargaMasiva: (request: RceDescargaMasivaRequest, credenciales: CredencialesSunat) => Promise<RceTicket>;
  consultarDescargaMasiva: (ticketId: string, credenciales: CredencialesSunat) => Promise<any>;
  descargarArchivo: (ticketId: string, nombreArchivo: string, credenciales: CredencialesSunat) => Promise<Blob>;
  
  // Gestión
  listarProcesos: (filtros?: any) => Promise<void>;
  listarTicketsActivos: () => Promise<void>;
  limpiarCompletados: () => void;
  
  // Utilidades
  obtenerProcesoPorPeriodo: (periodo: string) => RceProceso | undefined;
  obtenerTicketPorId: (ticketId: string) => RceTicket | undefined;
  hayProcesosActivos: () => boolean;
  hayTicketsPendientes: () => boolean;
  
  // Control
  refresh: () => Promise<void>;
  clearError: () => void;
  iniciarMonitoreo: (credenciales: CredencialesSunat) => void;
  detenerMonitoreo: () => void;
}

// ========================================
// CONSTANTES
// ========================================

const REFRESH_INTERVAL_DEFECTO = 30000; // 30 segundos
const MAX_TICKETS_DEFECTO = 50;

// ========================================
// HOOK PRINCIPAL
// ========================================

export const useRceProcesos = (options: UseRceProcesosOptions): UseRceProcesosReturn => {
  const {
    ruc,
    auto_refresh = false,
    refresh_interval = REFRESH_INTERVAL_DEFECTO,
    max_tickets_activos = MAX_TICKETS_DEFECTO
  } = options;

  // ========================================
  // ESTADO PRINCIPAL
  // ========================================

  const [procesos, setProcesos] = useState<RceProceso[]>([]);
  const [tickets, setTickets] = useState<RceTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados específicos
  const [enviando, setEnviando] = useState(false);
  const [consultando, setConsultando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  
  // Control de monitoreo
  const intervalRef = useRef<number | null>(null);
  const credencialesRef = useRef<CredencialesSunat | null>(null);

  // ========================================
  // VALORES COMPUTADOS
  // ========================================

  const resumen: ProcesoResumen = {
    total_procesos: procesos.length,
    por_estado: procesos.reduce((acc, proceso) => {
      acc[proceso.estado] = (acc[proceso.estado] || 0) + 1;
      return acc;
    }, {} as Record<RceEstadoProceso, number>),
    tickets_activos: tickets.filter(t => 
      t.estado === 'iniciado' || t.estado === 'procesando'
    ).length,
    ultimo_envio: procesos.length > 0 
      ? Math.max(...procesos.map(p => new Date(p.fecha_inicio).getTime())).toString()
      : null,
    ultimo_exito: procesos.filter(p => p.estado === 'completado').length > 0
      ? Math.max(...procesos.filter(p => p.estado === 'completado')
          .map(p => new Date(p.fecha_fin || p.fecha_inicio).getTime())).toString()
      : null
  };

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  const handleError = useCallback((error: any, contexto: string) => {
    console.error(`Error en useRceProcesos - ${contexto}:`, error);
    const mensaje = error?.response?.data?.mensaje || error?.message || `Error en ${contexto}`;
    setError(mensaje);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const actualizarProceso = useCallback((proceso: RceProceso) => {
    setProcesos(prev => {
      const index = prev.findIndex(p => p.periodo === proceso.periodo);
      if (index >= 0) {
        const newProcesos = [...prev];
        newProcesos[index] = proceso;
        return newProcesos;
      } else {
        return [proceso, ...prev];
      }
    });
  }, []);

  const actualizarTicket = useCallback((ticket: RceTicket) => {
    setTickets(prev => {
      const index = prev.findIndex(t => t.ticket_id === ticket.ticket_id);
      if (index >= 0) {
        const newTickets = [...prev];
        newTickets[index] = ticket;
        return newTickets;
      } else {
        return [ticket, ...prev].slice(0, max_tickets_activos);
      }
    });
  }, [max_tickets_activos]);

  // ========================================
  // MÉTODOS PRINCIPALES
  // ========================================

  const enviarProceso = useCallback(async (
    periodo: string,
    tipoEnvio: string,
    credenciales: CredencialesSunat,
    observaciones?: string
  ): Promise<RceProceso> => {
    setEnviando(true);
    clearError();
    
    try {
      const response = await rceApi.procesos.enviar(ruc, periodo, tipoEnvio, credenciales, observaciones);
      
      if (response.exitoso && response.datos) {
        actualizarProceso(response.datos);
        
        // Si el proceso incluye un ticket, agregarlo a la lista
        if (response.datos.ticket_id) {
          const ticketData: RceTicket = {
            ticket_id: response.datos.ticket_id,
            ruc,
            tipo_operacion: tipoEnvio,
            estado: 'iniciado',
            porcentaje_avance: 0,
            fecha_creacion: response.datos.fecha_inicio,
            fecha_actualizacion: response.datos.fecha_inicio,
            resultados_disponibles: false,
            archivos_disponibles: [],
            reintentos: 0,
            max_reintentos: 3
          };
          actualizarTicket(ticketData);
        }
        
        return response.datos;
      }
      
      throw new Error('Error al enviar proceso');
    } catch (error) {
      handleError(error, 'enviar proceso');
      throw error;
    } finally {
      setEnviando(false);
    }
  }, [ruc, clearError, handleError, actualizarProceso, actualizarTicket]);

  const consultarEstado = useCallback(async (periodo: string, ticketId?: string): Promise<RceProceso> => {
    setConsultando(true);
    
    try {
      const response = await rceApi.procesos.consultarEstado(ruc, periodo, ticketId);
      
      if (response.exitoso && response.datos) {
        actualizarProceso(response.datos);
        return response.datos;
      }
      
      throw new Error('Error al consultar estado del proceso');
    } catch (error) {
      handleError(error, 'consultar estado del proceso');
      throw error;
    } finally {
      setConsultando(false);
    }
  }, [ruc, handleError, actualizarProceso]);

  const cancelarProceso = useCallback(async (
    periodo: string,
    motivo: string,
    credenciales: CredencialesSunat
  ): Promise<RceProceso> => {
    setCancelando(true);
    
    try {
      const response = await rceApi.procesos.cancelar(ruc, periodo, motivo, credenciales);
      
      if (response.exitoso && response.datos) {
        actualizarProceso(response.datos);
        return response.datos;
      }
      
      throw new Error('Error al cancelar proceso');
    } catch (error) {
      handleError(error, 'cancelar proceso');
      throw error;
    } finally {
      setCancelando(false);
    }
  }, [ruc, handleError, actualizarProceso]);

  // ========================================
  // MÉTODOS DE TICKETS
  // ========================================

  const consultarTicket = useCallback(async (
    ticketId: string,
    credenciales: CredencialesSunat
  ): Promise<RceTicket> => {
    try {
      const response = await rceApi.procesos.consultarTicket(ruc, ticketId, credenciales);
      
      if (response.exitoso && response.datos) {
        actualizarTicket(response.datos);
        return response.datos;
      }
      
      throw new Error('Error al consultar ticket');
    } catch (error) {
      handleError(error, 'consultar ticket');
      throw error;
    }
  }, [ruc, handleError, actualizarTicket]);

  const actualizarTicket_Action = useCallback(async (
    ticketId: string,
    credenciales: CredencialesSunat
  ): Promise<any> => {
    try {
      const response = await rceApi.procesos.actualizarEstadoTicket(ruc, ticketId, credenciales);
      
      if (response.exitoso && response.datos) {
        actualizarTicket(response.datos.ticket);
        return response.datos;
      }
      
      throw new Error('Error al actualizar ticket');
    } catch (error) {
      handleError(error, 'actualizar ticket');
      throw error;
    }
  }, [ruc, handleError, actualizarTicket]);

  const actualizarTodosLosTickets = useCallback(async (credenciales: CredencialesSunat): Promise<void> => {
    const ticketsActivos = tickets.filter(t => 
      t.estado === 'iniciado' || t.estado === 'procesando'
    );
    
    if (ticketsActivos.length === 0) return;
    
    try {
      await Promise.allSettled(
        ticketsActivos.map(ticket => 
          actualizarTicket_Action(ticket.ticket_id, credenciales)
        )
      );
    } catch (error) {
      // Los errores individuales ya se manejan en actualizarTicket_Action
      console.warn('Algunos tickets no pudieron actualizarse:', error);
    }
  }, [tickets, actualizarTicket_Action]);

  // ========================================
  // MÉTODOS DE DESCARGA MASIVA
  // ========================================

  const solicitarDescargaMasiva = useCallback(async (
    request: RceDescargaMasivaRequest,
    credenciales: CredencialesSunat
  ): Promise<RceTicket> => {
    setDescargando(true);
    
    try {
      const response = await rceApi.procesos.solicitarDescargaMasiva(ruc, request, credenciales);
      
      if (response.exitoso && response.datos) {
        actualizarTicket(response.datos);
        return response.datos;
      }
      
      throw new Error('Error al solicitar descarga masiva');
    } catch (error) {
      handleError(error, 'solicitar descarga masiva');
      throw error;
    } finally {
      setDescargando(false);
    }
  }, [ruc, handleError, actualizarTicket]);

  const consultarDescargaMasiva = useCallback(async (
    ticketId: string,
    credenciales: CredencialesSunat
  ): Promise<any> => {
    try {
      const response = await rceApi.procesos.consultarEstadoDescargaMasiva(ruc, ticketId, credenciales);
      
      if (response.exitoso && response.datos) {
        // Actualizar el ticket con el estado de la descarga
        const ticketActualizado: Partial<RceTicket> = {
          ticket_id: ticketId,
          estado: response.datos.estado === 'completado' ? 'completado' : 'procesando',
          porcentaje_avance: response.datos.porcentaje_avance,
          mensaje_usuario: response.datos.mensaje,
          resultados_disponibles: response.datos.resultados_disponibles,
          archivos_disponibles: response.datos.archivos_disponibles || [],
          fecha_actualizacion: new Date().toISOString()
        };
        
        setTickets(prev => 
          prev.map(t => 
            t.ticket_id === ticketId 
              ? { ...t, ...ticketActualizado }
              : t
          )
        );
        
        return response.datos;
      }
      
      throw new Error('Error al consultar descarga masiva');
    } catch (error) {
      handleError(error, 'consultar descarga masiva');
      throw error;
    }
  }, [ruc, handleError]);

  const descargarArchivo = useCallback(async (
    ticketId: string,
    nombreArchivo: string,
    credenciales: CredencialesSunat
  ): Promise<Blob> => {
    setDescargando(true);
    
    try {
      const blob = await rceApi.procesos.descargarArchivo(ruc, ticketId, nombreArchivo, credenciales);
      return blob;
    } catch (error) {
      handleError(error, 'descargar archivo');
      throw error;
    } finally {
      setDescargando(false);
    }
  }, [ruc, handleError]);

  // ========================================
  // MÉTODOS DE GESTIÓN
  // ========================================

  const listarProcesos = useCallback(async (filtros?: any): Promise<void> => {
    setLoading(true);
    
    try {
      const response = await rceApi.procesos.listar(ruc, filtros);
      
      if (response.exitoso && response.datos) {
        setProcesos(response.datos.procesos || []);
      }
    } catch (error) {
      handleError(error, 'listar procesos');
    } finally {
      setLoading(false);
    }
  }, [ruc, handleError]);

  const listarTicketsActivos = useCallback(async (): Promise<void> => {
    try {
      const response = await rceApi.procesos.listarTicketsActivos(ruc, max_tickets_activos);
      
      if (response.exitoso && response.datos) {
        setTickets(response.datos.tickets || []);
      }
    } catch (error) {
      handleError(error, 'listar tickets activos');
    }
  }, [ruc, max_tickets_activos, handleError]);

  const limpiarCompletados = useCallback(() => {
    setTickets(prev => 
      prev.filter(t => t.estado !== 'completado' && t.estado !== 'error' && t.estado !== 'cancelado')
    );
    setProcesos(prev => 
      prev.filter(p => p.estado !== 'completado' && p.estado !== 'error' && p.estado !== 'cancelado')
    );
  }, []);

  // ========================================
  // MÉTODOS DE UTILIDADES
  // ========================================

  const obtenerProcesoPorPeriodo = useCallback((periodo: string): RceProceso | undefined => {
    return procesos.find(p => p.periodo === periodo);
  }, [procesos]);

  const obtenerTicketPorId = useCallback((ticketId: string): RceTicket | undefined => {
    return tickets.find(t => t.ticket_id === ticketId);
  }, [tickets]);

  const hayProcesosActivos = useCallback((): boolean => {
    return procesos.some(p => p.estado === 'iniciado' || p.estado === 'en_proceso');
  }, [procesos]);

  const hayTicketsPendientes = useCallback((): boolean => {
    return tickets.some(t => t.estado === 'iniciado' || t.estado === 'procesando');
  }, [tickets]);

  // ========================================
  // MÉTODOS DE CONTROL
  // ========================================

  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([
      listarProcesos(),
      listarTicketsActivos()
    ]);
  }, [listarProcesos, listarTicketsActivos]);

  const iniciarMonitoreo = useCallback((credenciales: CredencialesSunat) => {
    credencialesRef.current = credenciales;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(async () => {
      try {
        if (credencialesRef.current && hayTicketsPendientes()) {
          await actualizarTodosLosTickets(credencialesRef.current);
        }
        await refresh();
      } catch (error) {
        console.warn('Error en monitoreo automático:', error);
      }
    }, refresh_interval);
  }, [refresh_interval, hayTicketsPendientes, actualizarTodosLosTickets, refresh]);

  const detenerMonitoreo = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    credencialesRef.current = null;
  }, []);

  // ========================================
  // EFECTOS
  // ========================================

  // Carga inicial
  useEffect(() => {
    if (ruc) {
      refresh();
    }
  }, [ruc, refresh]);

  // Auto-refresh
  useEffect(() => {
    if (auto_refresh && refresh_interval > 0) {
      const interval = setInterval(refresh, refresh_interval);
      return () => clearInterval(interval);
    }
  }, [auto_refresh, refresh_interval, refresh]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      detenerMonitoreo();
    };
  }, [detenerMonitoreo]);

  // ========================================
  // RETURN DEL HOOK
  // ========================================

  return {
    // Estado principal
    procesos,
    tickets,
    loading,
    error,
    
    // Estados específicos
    enviando,
    consultando,
    cancelando,
    descargando,
    
    // Resumen
    resumen,
    
    // Métodos principales
    enviarProceso,
    consultarEstado,
    cancelarProceso,
    
    // Métodos de tickets
    consultarTicket,
    actualizarTicket: actualizarTicket_Action,
    actualizarTodosLosTickets,
    
    // Descarga masiva
    solicitarDescargaMasiva,
    consultarDescargaMasiva,
    descargarArchivo,
    
    // Gestión
    listarProcesos,
    listarTicketsActivos,
    limpiarCompletados,
    
    // Utilidades
    obtenerProcesoPorPeriodo,
    obtenerTicketPorId,
    hayProcesosActivos,
    hayTicketsPendientes,
    
    // Control
    refresh,
    clearError,
    iniciarMonitoreo,
    detenerMonitoreo
  };
};
