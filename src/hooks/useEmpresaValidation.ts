import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import EmpresaApiService from '../services/empresaApi';
import type { Empresa } from '../types/empresa';

interface EmpresaValidationState {
  hasEmpresaSelected: boolean;
  empresaActual: Empresa | null;
  loading: boolean;
  error: string | null;
  isValidated: boolean;
}

// Event personalizado para notificar cambios de empresa
const EMPRESA_CHANGE_EVENT = 'empresa-selection-changed';

// Función para disparar el evento de cambio de empresa
export const notifyEmpresaChange = () => {
  window.dispatchEvent(new CustomEvent(EMPRESA_CHANGE_EVENT));
};

/**
 * Hook para validar si el usuario tiene una empresa seleccionada
 * Útil para proteger rutas que requieren una empresa activa
 */
export const useEmpresaValidation = () => {
  const { isSignedIn, isLoaded } = useUser();
  const [state, setState] = useState<EmpresaValidationState>({
    hasEmpresaSelected: false,
    empresaActual: null,
    loading: true,
    error: null,
    isValidated: false
  });

  useEffect(() => {
    let isMounted = true; // Prevenir memory leaks
    
    const validateEmpresa = async () => {
      // Solo validar si el usuario está autenticado y Clerk está cargado
      if (!isLoaded || !isSignedIn) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            isValidated: true,
            hasEmpresaSelected: false,
            empresaActual: null
          }));
        }
        return;
      }

      if (isMounted) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      try {
        const empresaInfo = await EmpresaApiService.getEmpresaActual();
        
        let empresaActual: Empresa | null = null;
        
        // Si hay empresa seleccionada, obtener detalles completos
        if (empresaInfo?.ruc) {
          try {
            empresaActual = await EmpresaApiService.getEmpresaByRuc(empresaInfo.ruc);
          } catch (error) {
            // Si no se pueden obtener los detalles, usar la info básica
            empresaActual = empresaInfo;
          }
        }
        
        const hasEmpresa = empresaActual !== null;
        
        if (isMounted) {
          setState({
            hasEmpresaSelected: hasEmpresa,
            empresaActual,
            loading: false,
            error: null,
            isValidated: true
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            hasEmpresaSelected: false,
            empresaActual: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Error validando empresa',
            isValidated: true
          });
        }
      }
    };

    // Ejecutar validación inicial
    validateEmpresa();

    // Escuchar cambios de empresa
    const handleEmpresaChange = () => {
      if (isMounted) {
        validateEmpresa();
      }
    };

    window.addEventListener(EMPRESA_CHANGE_EVENT, handleEmpresaChange);

    // Cleanup
    return () => {
      isMounted = false;
      window.removeEventListener(EMPRESA_CHANGE_EVENT, handleEmpresaChange);
    };
  }, [isSignedIn, isLoaded]);

  /**
   * Revalidar manualmente la empresa actual
   */
  const revalidate = async () => {
    if (!isSignedIn) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const empresaActual = await EmpresaApiService.getEmpresaActual();
      
      setState(prev => ({
        ...prev,
        hasEmpresaSelected: empresaActual !== null,
        empresaActual,
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        hasEmpresaSelected: false,
        empresaActual: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Error validando empresa'
      }));
    }
  };

  return {
    ...state,
    revalidate
  };
};

export default useEmpresaValidation;
