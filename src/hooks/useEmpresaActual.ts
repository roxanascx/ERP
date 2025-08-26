import { useState, useEffect } from 'react';
import { EmpresaApiService } from '../services/empresaApi';
import type { Empresa } from '../types/empresa';

export interface UseEmpresaActualResult {
  empresa: Empresa | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener y manejar la empresa actualmente seleccionada
 */
export const useEmpresaActual = (): UseEmpresaActualResult => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresaActual = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const empresaActual = await EmpresaApiService.getEmpresaActual();
      setEmpresa(empresaActual);
      
    } catch (err) {
      console.error('Error obteniendo empresa actual:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setEmpresa(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresaActual();
  }, []);

  return {
    empresa,
    loading,
    error,
    refetch: fetchEmpresaActual
  };
};

export default useEmpresaActual;
