// Hook para gestión de Socios de Negocio
import { useState, useEffect, useCallback } from 'react';
import { useEmpresa } from './useEmpresa';
import sociosNegocioApi from '../services/sociosNegocioApi';
import type {
  SocioNegocio,
  SocioNegocioCreate,
  SocioNegocioUpdate,
  SocioStatsResponse,
  SocioFilters,
  SocioSearchFilters,
  ConsultaRucResponse
} from '../services/sociosNegocioApi';

interface UseSociosNegocioState {
  socios: SocioNegocio[];
  socio: SocioNegocio | null;
  stats: SocioStatsResponse | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface UseSociosNegocioActions {
  // CRUD operations
  createSocio: (data: SocioNegocioCreate) => Promise<SocioNegocio>;
  getSocio: (id: string) => Promise<SocioNegocio>;
  updateSocio: (id: string, data: SocioNegocioUpdate) => Promise<SocioNegocio>;
  deleteSocio: (id: string) => Promise<void>;
  
  // List and search
  loadSocios: (filters?: SocioFilters) => Promise<void>;
  searchSocios: (filters: SocioSearchFilters) => Promise<void>;
  loadMoreSocios: () => Promise<void>;
  
  // Stats
  loadStats: () => Promise<void>;
  
  // RUC operations
  consultarRuc: (ruc: string) => Promise<ConsultaRucResponse>;
  createSocioFromRuc: (ruc: string, tipoSocio: 'proveedor' | 'cliente' | 'ambos') => Promise<SocioNegocio>;
  syncSocioWithSunat: (id: string) => Promise<SocioNegocio>;
  
  // Utils
  clearError: () => void;
  resetState: () => void;
}

const initialState: UseSociosNegocioState = {
  socios: [],
  socio: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  }
};

export function useSociosNegocio(): UseSociosNegocioState & UseSociosNegocioActions {
  const [state, setState] = useState<UseSociosNegocioState>(initialState);
  const { empresaActual } = useEmpresa();

  // Helper para actualizar estado
  const updateState = useCallback((updates: Partial<UseSociosNegocioState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Helper para manejar errores
  const handleError = useCallback((error: any) => {
    console.error('❌ [SociosNegocio] Error:', error);
    const errorMessage = error.response?.data?.detail?.message || 
                        error.response?.data?.message || 
                        error.message || 
                        'Error desconocido';
    updateState({ error: errorMessage, loading: false });
  }, [updateState]);

  // CRUD Operations
  const createSocio = useCallback(async (data: SocioNegocioCreate): Promise<SocioNegocio> => {
    if (!empresaActual?.ruc) {
      throw new Error('No hay empresa seleccionada');
    }

    try {
      updateState({ loading: true, error: null });
      const socio = await sociosNegocioApi.createSocio(empresaActual.ruc, data);
      
      // Agregar al inicio de la lista
      setState(prev => ({
        ...prev,
        socios: [socio, ...prev.socios],
        loading: false,
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total + 1
        }
      }));
      
      return socio;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [empresaActual?.ruc, updateState, handleError]);

  const getSocio = useCallback(async (id: string): Promise<SocioNegocio> => {
    try {
      updateState({ loading: true, error: null });
      const socio = await sociosNegocioApi.getSocio(id);
      updateState({ socio, loading: false });
      return socio;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [updateState, handleError]);

  const updateSocio = useCallback(async (id: string, data: SocioNegocioUpdate): Promise<SocioNegocio> => {
    try {
      updateState({ loading: true, error: null });
      const socio = await sociosNegocioApi.updateSocio(id, data);
      
      // Actualizar en la lista
      setState(prev => ({
        ...prev,
        socios: prev.socios.map(s => s.id === id ? socio : s),
        socio: prev.socio?.id === id ? socio : prev.socio,
        loading: false
      }));
      
      return socio;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [updateState, handleError]);

  const deleteSocio = useCallback(async (id: string): Promise<void> => {
    try {
      updateState({ loading: true, error: null });
      await sociosNegocioApi.deleteSocio(id);
      
      // Remover de la lista
      setState(prev => ({
        ...prev,
        socios: prev.socios.filter(s => s.id !== id),
        socio: prev.socio?.id === id ? null : prev.socio,
        loading: false,
        pagination: {
          ...prev.pagination,
          total: Math.max(0, prev.pagination.total - 1)
        }
      }));
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [updateState, handleError]);

  // List and Search
  const loadSocios = useCallback(async (filters?: SocioFilters): Promise<void> => {
    if (!empresaActual?.ruc) return;

    try {
      updateState({ loading: true, error: null });
      const response = await sociosNegocioApi.listSocios(empresaActual.ruc, filters);
      
      updateState({
        socios: response.socios,
        loading: false,
        pagination: {
          total: response.total,
          limit: response.limit,
          offset: response.offset,
          hasMore: response.has_more
        }
      });
    } catch (error) {
      handleError(error);
    }
  }, [empresaActual?.ruc, updateState, handleError]);

  const searchSocios = useCallback(async (filters: SocioSearchFilters): Promise<void> => {
    if (!empresaActual?.ruc) return;

    try {
      updateState({ loading: true, error: null });
      const response = await sociosNegocioApi.searchSocios(empresaActual.ruc, filters);
      
      updateState({
        socios: response.socios,
        loading: false,
        pagination: {
          total: response.total,
          limit: response.limit,
          offset: response.offset,
          hasMore: response.has_more
        }
      });
    } catch (error) {
      handleError(error);
    }
  }, [empresaActual?.ruc, updateState, handleError]);

  const loadMoreSocios = useCallback(async (): Promise<void> => {
    if (!empresaActual?.ruc || !state.pagination.hasMore || state.loading) return;

    try {
      updateState({ loading: true, error: null });
      const nextOffset = state.pagination.offset + state.pagination.limit;
      
      const response = await sociosNegocioApi.listSocios(empresaActual.ruc, {
        limit: state.pagination.limit,
        offset: nextOffset
      });
      
      setState(prev => ({
        ...prev,
        socios: [...prev.socios, ...response.socios],
        loading: false,
        pagination: {
          total: response.total,
          limit: response.limit,
          offset: response.offset,
          hasMore: response.has_more
        }
      }));
    } catch (error) {
      handleError(error);
    }
  }, [empresaActual?.ruc, state.pagination, state.loading, updateState, handleError]);

  // Stats
  const loadStats = useCallback(async (): Promise<void> => {
    if (!empresaActual?.ruc) return;

    try {
      updateState({ loading: true, error: null });
      const stats = await sociosNegocioApi.getStats(empresaActual.ruc);
      updateState({ stats, loading: false });
    } catch (error) {
      handleError(error);
    }
  }, [empresaActual?.ruc, updateState, handleError]);

  // RUC Operations
  const consultarRuc = useCallback(async (ruc: string): Promise<ConsultaRucResponse> => {
    try {
      updateState({ loading: true, error: null });
      const response = await sociosNegocioApi.consultarRuc(ruc);
      updateState({ loading: false });
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [updateState, handleError]);

  const createSocioFromRuc = useCallback(async (
    ruc: string, 
    tipoSocio: 'proveedor' | 'cliente' | 'ambos'
  ): Promise<SocioNegocio> => {
    if (!empresaActual?.ruc) {
      throw new Error('No hay empresa seleccionada');
    }

    try {
      updateState({ loading: true, error: null });
      const socio = await sociosNegocioApi.createSocioFromRuc({
        empresa_id: empresaActual.ruc,
        ruc,
        tipo_socio: tipoSocio
      });
      
      // Agregar al inicio de la lista
      setState(prev => ({
        ...prev,
        socios: [socio, ...prev.socios],
        loading: false,
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total + 1
        }
      }));
      
      return socio;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [empresaActual?.ruc, updateState, handleError]);

  const syncSocioWithSunat = useCallback(async (id: string): Promise<SocioNegocio> => {
    try {
      updateState({ loading: true, error: null });
      const socio = await sociosNegocioApi.syncSocioWithSunat(id);
      
      // Actualizar en la lista
      setState(prev => ({
        ...prev,
        socios: prev.socios.map(s => s.id === id ? socio : s),
        socio: prev.socio?.id === id ? socio : prev.socio,
        loading: false
      }));
      
      return socio;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [updateState, handleError]);

  // Utils
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  // Auto-load stats when empresa changes
  useEffect(() => {
    if (empresaActual?.ruc) {
      loadStats();
    } else {
      resetState();
    }
  }, [empresaActual?.ruc, loadStats, resetState]);

  return {
    // State
    ...state,
    
    // Actions
    createSocio,
    getSocio,
    updateSocio,
    deleteSocio,
    loadSocios,
    searchSocios,
    loadMoreSocios,
    loadStats,
    consultarRuc,
    createSocioFromRuc,
    syncSocioWithSunat,
    clearError,
    resetState
  };
}

export default useSociosNegocio;
