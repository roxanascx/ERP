import { useState, useEffect, useCallback } from 'react';
import type { 
  Empresa, 
  EmpresaCreate, 
  EmpresaUpdate, 
  SireConfig,
  EmpresaState 
} from '../types/empresa';
import EmpresaApiService from '../services/empresaApi';
import { notifyEmpresaChange } from './useEmpresaValidation';

export const useEmpresa = () => {
  const [state, setState] = useState<EmpresaState>({
    empresas: [],
    empresaActual: null,
    loading: false,
    error: null,
  });

  // ============================================
  // FUNCIONES DE ESTADO
  // ============================================

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setEmpresas = (empresas: Empresa[]) => {
    setState(prev => ({ ...prev, empresas }));
  };

  const setEmpresaActual = (empresa: Empresa | null) => {
    setState(prev => ({ ...prev, empresaActual: empresa }));
  };

  // ============================================
  // OPERACIONES CRUD
  // ============================================

  /**
   * Cargar todas las empresas
   */
  const cargarEmpresas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const empresas = await EmpresaApiService.getEmpresas();
      setEmpresas(empresas);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nueva empresa
   */
  const crearEmpresa = useCallback(async (data: EmpresaCreate): Promise<Empresa | null> => {
    setLoading(true);
    setError(null);
    try {
      const nuevaEmpresa = await EmpresaApiService.createEmpresa(data);
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        empresas: [...prev.empresas, nuevaEmpresa]
      }));
      
      return nuevaEmpresa;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear empresa');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar empresa existente
   */
  const actualizarEmpresa = useCallback(async (
    ruc: string, 
    data: EmpresaUpdate
  ): Promise<Empresa | null> => {
    setLoading(true);
    setError(null);
    try {
      const empresaActualizada = await EmpresaApiService.updateEmpresa(ruc, data);
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        empresas: prev.empresas.map(emp => 
          emp.ruc === ruc ? empresaActualizada : emp
        ),
        empresaActual: prev.empresaActual?.ruc === ruc ? empresaActualizada : prev.empresaActual
      }));
      
      return empresaActualizada;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar empresa');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar empresa
   */
  const eliminarEmpresa = useCallback(async (ruc: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await EmpresaApiService.deleteEmpresa(ruc);
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        empresas: prev.empresas.filter(emp => emp.ruc !== ruc),
        empresaActual: prev.empresaActual?.ruc === ruc ? null : prev.empresaActual
      }));
      
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar empresa');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // OPERACIONES SIRE
  // ============================================

  /**
   * Configurar SIRE para una empresa
   */
  const configurarSire = useCallback(async (
    ruc: string, 
    config: SireConfig
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const empresaActualizada = await EmpresaApiService.configurarSire(ruc, config);
      
      // Actualizar estado local
      setState(prev => ({
        ...prev,
        empresas: prev.empresas.map(emp => 
          emp.ruc === ruc ? empresaActualizada : emp
        ),
        empresaActual: prev.empresaActual?.ruc === ruc ? empresaActualizada : prev.empresaActual
      }));
      
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al configurar SIRE');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // GESTIÓN MULTI-EMPRESA
  // ============================================

  /**
   * Cargar empresa actual
   */
  const cargarEmpresaActual = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const empresaActual = await EmpresaApiService.getEmpresaActual();
      setEmpresaActual(empresaActual);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar empresa actual');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Seleccionar empresa activa
   */
  const seleccionarEmpresa = useCallback(async (ruc: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await EmpresaApiService.seleccionarEmpresa(ruc);
      if (result.success) {
        // Después de seleccionar, cargar la empresa actual
        await cargarEmpresaActual();
        
        // Notificar que la empresa ha cambiado para que otros hooks se actualicen
        notifyEmpresaChange();
        
        return true;
      } else {
        setError(result.message || 'Error al seleccionar empresa');
        return false;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al seleccionar empresa');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cargarEmpresaActual]);

  // ============================================
  // FUNCIONES UTILITARIAS
  // ============================================

  /**
   * Buscar empresa por RUC en el estado local
   */
  const buscarEmpresaPorRuc = useCallback((ruc: string): Empresa | undefined => {
    return state.empresas.find(emp => emp.ruc === ruc);
  }, [state.empresas]);

  /**
   * Obtener empresas con SIRE configurado
   */
  const getEmpresasConSire = useCallback((): Empresa[] => {
    return state.empresas.filter(emp => emp.sire_activo && emp.sire_client_id);
  }, [state.empresas]);

  /**
   * Verificar si hay errores
   */
  const hasError = Boolean(state.error);

  /**
   * Limpiar error
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================
  // EFECTO INICIAL
  // ============================================

  useEffect(() => {
    // Cargar datos iniciales
    cargarEmpresas();
    cargarEmpresaActual();
  }, [cargarEmpresas, cargarEmpresaActual]);

  // ============================================
  // RETORNO DEL HOOK
  // ============================================

  return {
    // Estado
    ...state,
    hasError,
    
    // Operaciones CRUD
    cargarEmpresas,
    crearEmpresa,
    actualizarEmpresa,
    eliminarEmpresa,
    
    // Operaciones SIRE
    configurarSire,
    
    // Multi-empresa
    seleccionarEmpresa,
    cargarEmpresaActual,
    
    // Utilidades
    buscarEmpresaPorRuc,
    getEmpresasConSire,
    limpiarError,
  };
};

export default useEmpresa;
