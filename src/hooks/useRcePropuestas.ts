/**
 * Hook básico para gestión de propuestas RCE
 * Versión simplificada funcional
 */

import { useState, useEffect, useCallback } from 'react';
import { rceApi } from '../services/rceApi';
import type {
  RcePropuesta,
  RcePropuestaRequest
} from '../types/rce';

interface UseRcePropuestasOptions {
  ruc: string;
  auto_load?: boolean;
}

interface UseRcePropuestasReturn {
  propuestas: RcePropuesta[];
  loading: boolean;
  error: string | null;
  
  // Operaciones básicas
  crearPropuesta: (propuesta: RcePropuestaRequest) => Promise<void>;
  cargarPropuestas: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  
  // Estado computado
  isEmpty: boolean;
  hasData: boolean;
}

export const useRcePropuestas = (options: UseRcePropuestasOptions): UseRcePropuestasReturn => {
  const { ruc, auto_load = true } = options;
  
  // Estado local
  const [propuestas, setPropuestas] = useState<RcePropuesta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Funciones auxiliares
  const clearError = useCallback(() => setError(null), []);

  // Cargar propuestas
  const cargarPropuestas = useCallback(async () => {
    if (!ruc) return;

    console.log('🔄 [RCE] Iniciando carga de propuestas para RUC:', ruc);
    setLoading(true);
    setError(null);

    try {
      console.log('📡 [RCE] Llamando a rceApi.propuestas.listar...');
      const response = await rceApi.propuestas.listar(ruc);
      console.log('📥 [RCE] Respuesta recibida:', response);
      
      if (response.exitoso && response.datos) {
        console.log('✅ [RCE] Datos exitosos:', response.datos);
        setPropuestas(response.datos.propuestas || []);
      } else {
        console.log('❌ [RCE] Respuesta no exitosa:', response.mensaje);
        throw new Error(response.mensaje || 'Error al cargar propuestas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('💥 [RCE] Error cargando propuestas:', err);
      console.error('💥 [RCE] Error stack:', err instanceof Error ? err.stack : 'No stack');
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 [RCE] Carga finalizada');
    }
  }, [ruc]);

  // Crear propuesta
  const crearPropuesta = useCallback(async (propuestaData: RcePropuestaRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await rceApi.propuestas.generar(propuestaData);
      
      if (response.exitoso && response.datos) {
        setPropuestas(prev => [response.datos!, ...prev]);
      } else {
        throw new Error(response.mensaje || 'Error al crear propuesta');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    await cargarPropuestas();
  }, [cargarPropuestas]);

  // Efectos
  useEffect(() => {
    if (ruc && auto_load) {
      cargarPropuestas();
    }
  }, [cargarPropuestas, ruc, auto_load]);

  // Valores computados
  const isEmpty = propuestas.length === 0 && !loading;
  const hasData = propuestas.length > 0;

  return {
    // Estado principal
    propuestas,
    loading,
    error,
    
    // Operaciones básicas
    crearPropuesta,
    cargarPropuestas,
    refresh,
    clearError,
    
    // Estado computado
    isEmpty,
    hasData
  };
};

export default useRcePropuestas;
