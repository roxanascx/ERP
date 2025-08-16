/**
 * Hook para autenticación automática de SIRE
 * Se ejecuta automáticamente al entrar al módulo SIRE
 */

import { useState, useEffect } from 'react';
import apiClient from '../services/api';

interface AutoAuthResult {
  successful: Array<{
    ruc: string;
    razon_social: string;
    session_id: string;
    expires_in: number;
  }>;
  failed: Array<{
    ruc: string;
    razon_social: string;
    error: string;
  }>;
  already_authenticated: Array<{
    ruc: string;
    razon_social: string;
    message: string;
  }>;
  summary: {
    successful_count: number;
    failed_count: number;
    already_authenticated_count: number;
    total_processed: number;
    success_rate: number;
  };
}

interface AutoAuthResponse {
  success: boolean;
  message: string;
  timestamp: string;
  results: AutoAuthResult;
}

export const useSireAutoAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authResults, setAuthResults] = useState<AutoAuthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ejecutar autenticación automática de todos los RUCs
   */
  const executeAutoAuth = async (): Promise<boolean> => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      console.log('🔐 [AUTO-AUTH] Iniciando autenticación automática...');
      
      const response = await apiClient.post<AutoAuthResponse>(
        '/api/v1/sire/auto-auth/auto-authenticate'
      );
      
      setAuthResults(response.data);
      
      const { results } = response.data;
      const totalAuthenticated = results.summary.successful_count + results.summary.already_authenticated_count;
      
      console.log(`✅ [AUTO-AUTH] Completado: ${totalAuthenticated}/${results.summary.total_processed} RUCs autenticados`);
      
      // Mostrar resultados en consola para debugging
      if (results.successful.length > 0) {
        console.log('✅ Autenticaciones exitosas:', results.successful);
      }
      
      if (results.failed.length > 0) {
        console.warn('❌ Autenticaciones fallidas:', results.failed);
      }
      
      return response.data.success;
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error en autenticación automática';
      setError(errorMessage);
      console.error('❌ [AUTO-AUTH] Error:', errorMessage);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Autenticar un RUC específico
   */
  const authenticateRuc = async (ruc: string): Promise<boolean> => {
    try {
      console.log(`🔐 [AUTO-AUTH] Autenticando RUC específico: ${ruc}`);
      
      const response = await apiClient.post(`/api/v1/sire/auto-auth/authenticate/${ruc}`);
      
      console.log(`✅ [AUTO-AUTH] RUC ${ruc} autenticado exitosamente`);
      return response.data.success;
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || `Error autenticando RUC ${ruc}`;
      console.error(`❌ [AUTO-AUTH] Error autenticando RUC ${ruc}:`, errorMessage);
      return false;
    }
  };

  /**
   * Ejecutar autenticación automática al montar el componente
   * (cuando se entra al módulo SIRE)
   */
  useEffect(() => {
    let mounted = true;

    const autoAuthenticate = async () => {
      // Solo ejecutar si no estamos ya autenticando
      if (isAuthenticating) return;

      try {
        // Ejecutar autenticación automática
        await executeAutoAuth();
      } catch (error) {
        console.error('❌ [AUTO-AUTH] Error en autenticación automática inicial:', error);
      }
    };

    // Ejecutar autenticación automática después de un pequeño delay
    const timer = setTimeout(() => {
      if (mounted) {
        autoAuthenticate();
      }
    }, 1000); // 1 segundo de delay para permitir que la UI se renderice

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []); // Solo ejecutar una vez al montar

  return {
    isAuthenticating,
    authResults,
    error,
    executeAutoAuth,
    authenticateRuc,
    // Datos derivados para fácil acceso
    successCount: authResults?.results.summary.successful_count || 0,
    failedCount: authResults?.results.summary.failed_count || 0,
    authenticatedCount: authResults?.results.summary.already_authenticated_count || 0,
    totalCount: authResults?.results.summary.total_processed || 0,
    successRate: authResults?.results.summary.success_rate || 0
  };
};
