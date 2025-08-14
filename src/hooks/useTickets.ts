// Hook para gestión de tickets SIRE
import { useState, useEffect, useCallback } from 'react';
import { sireTicketService } from '../services/ticketService';
import type { 
  SireTicket, 
  TicketSummary, 
  TicketStats,
  TicketStatus,
  TicketPriority 
} from '../types/tickets';

export const useTickets = (ruc?: string) => {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar lista de tickets
  const loadTickets = useCallback(async (
    options: {
      status?: keyof TicketStatus;
      limit?: number;
      offset?: number;
    } = {}
  ) => {
    if (!ruc) return;

    try {
      setLoading(true);
      setError(null);
      
      const ticketList = await sireTicketService.getTicketsByRuc(ruc, options);
      setTickets(ticketList);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando tickets');
    } finally {
      setLoading(false);
    }
  }, [ruc]);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      const ticketStats = await sireTicketService.getTicketStats(ruc);
      setStats(ticketStats);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }, [ruc]);

  // Crear ticket de descarga RVIE
  const createDownloadTicket = useCallback(async (
    periodo: string, 
    priority: keyof TicketPriority = 'NORMAL'
  ) => {
    if (!ruc) throw new Error('RUC no disponible');

    try {
      setError(null);
      const ticket = await sireTicketService.createRvieDownloadTicket(ruc, periodo, priority);
      
      // Recargar lista
      loadTickets();
      loadStats();
      
      return ticket;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error creando ticket';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [ruc, loadTickets, loadStats]);

  // Crear ticket de aceptación RVIE
  const createAcceptTicket = useCallback(async (
    periodo: string, 
    priority: keyof TicketPriority = 'NORMAL'
  ) => {
    if (!ruc) throw new Error('RUC no disponible');

    try {
      setError(null);
      const ticket = await sireTicketService.createRvieAcceptTicket(ruc, periodo, priority);
      
      // Recargar lista
      loadTickets();
      loadStats();
      
      return ticket;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error creando ticket';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [ruc, loadTickets, loadStats]);

  // Cancelar ticket
  const cancelTicket = useCallback(async (ticketId: string) => {
    try {
      setError(null);
      await sireTicketService.cancelTicket(ticketId);
      
      // Recargar lista
      loadTickets();
      loadStats();
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error cancelando ticket';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [loadTickets, loadStats]);

  // Descargar archivo
  const downloadFile = useCallback(async (ticketId: string) => {
    try {
      setError(null);
      const { fileName, blob } = await sireTicketService.downloadTicketFile(ticketId);
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error descargando archivo';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (ruc) {
      loadTickets();
      loadStats();
    }
  }, [ruc, loadTickets, loadStats]);

  return {
    tickets,
    stats,
    loading,
    error,
    actions: {
      loadTickets,
      loadStats,
      createDownloadTicket,
      createAcceptTicket,
      cancelTicket,
      downloadFile
    }
  };
};

export const useTicketMonitor = (ticketId: string | null) => {
  const [ticket, setTicket] = useState<SireTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar ticket individual
  const loadTicket = useCallback(async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      setError(null);
      
      const ticketData = await sireTicketService.getTicket(ticketId);
      setTicket(ticketData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  // Polling automático para tickets activos
  useEffect(() => {
    if (!ticketId || !ticket || !sireTicketService.isActiveTicket(ticket)) {
      return;
    }

    const pollInterval = setInterval(loadTicket, 3000); // Poll cada 3 segundos

    return () => clearInterval(pollInterval);
  }, [ticketId, ticket, loadTicket]);

  // Cargar ticket inicial
  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  return {
    ticket,
    loading,
    error,
    reload: loadTicket
  };
};

export const useTicketDownload = () => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<SireTicket | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadWhenReady = useCallback(async (
    ticketId: string,
    options: {
      onProgress?: (ticket: SireTicket) => void;
    } = {}
  ) => {
    try {
      setDownloading(true);
      setError(null);
      setProgress(null);

      const { fileName, blob } = await sireTicketService.downloadWhenReady(ticketId, {
        onProgress: (ticket) => {
          setProgress(ticket);
          options.onProgress?.(ticket);
        }
      });

      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setProgress(null);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error en descarga automática';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setDownloading(false);
    }
  }, []);

  return {
    downloading,
    progress,
    error,
    downloadWhenReady
  };
};
