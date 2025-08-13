import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { BackendConnectionStatus } from '../types/api';

interface ApiResponse {
  data: BackendConnectionStatus | null;
  loading: boolean;
  error: string | null;
}

// Hook para obtener el estado del backend
export const useBackendStatus = (): ApiResponse => {
  const [data, setData] = useState<BackendConnectionStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Hacer múltiples llamadas para verificar el estado
        const [apiInfo, healthCheck, testDb] = await Promise.allSettled([
          apiService.getApiInfo(),
          apiService.healthCheck(),
          apiService.testDatabase(),
        ]);

        setData({
          apiInfo: apiInfo.status === 'fulfilled' ? apiInfo.value.data : null,
          healthCheck: healthCheck.status === 'fulfilled' ? healthCheck.value.data : null,
          testDb: testDb.status === 'fulfilled' ? testDb.value.data : null,
          status: 'connected'
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setData({ 
          apiInfo: null,
          healthCheck: null,
          testDb: null,
          status: 'disconnected' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return { data, loading, error };
};

// Hook para hacer una llamada específica a la API
export const useApiCall = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = async (apiFunction: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la petición';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { callApi, loading, error };
};
