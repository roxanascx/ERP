import React from 'react';
import { useSireAutoAuth } from '../../hooks/useSireAutoAuth';

/**
 * Componente de prueba para el hook de autenticación automática
 */
export const SireAutoAuthTest: React.FC = () => {
  const {
    isAuthenticating,
    authResults,
    error,
    executeAutoAuth,
    authenticateRuc,
    successCount,
    failedCount,
    authenticatedCount,
    totalCount,
    successRate
  } = useSireAutoAuth();

  const handleManualAuth = async () => {
    await executeAutoAuth();
  };

  const handleAuthSpecificRuc = async () => {
    await authenticateRuc('20612969125');
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>🔐 SIRE Auto Auth Test</h3>
      
      {/* Estado actual */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Estado Actual:</h4>
        <p>🔄 Autenticando: {isAuthenticating ? 'Sí' : 'No'}</p>
        
        {error && (
          <p style={{ color: 'red' }}>❌ Error: {error}</p>
        )}
        
        {authResults && (
          <div>
            <p>✅ Exitosos: {successCount}</p>
            <p>❌ Fallidos: {failedCount}</p>
            <p>🔄 Ya autenticados: {authenticatedCount}</p>
            <p>📊 Total: {totalCount}</p>
            <p>📈 Tasa de éxito: {(successRate * 100).toFixed(1)}%</p>
          </div>
        )}
      </div>

      {/* Botones de control */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleManualAuth}
          disabled={isAuthenticating}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          🔄 Autenticar Todos los RUCs
        </button>
        
        <button 
          onClick={handleAuthSpecificRuc}
          disabled={isAuthenticating}
          style={{ padding: '10px' }}
        >
          🔑 Autenticar RUC 20612969125
        </button>
      </div>

      {/* Resultados detallados */}
      {authResults && (
        <div>
          <h4>Resultados Detallados:</h4>
          
          {authResults.results.successful.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <strong>✅ Exitosos:</strong>
              <ul>
                {authResults.results.successful.map((result: any, index: number) => (
                  <li key={index}>
                    {result.ruc} - {result.razon_social} (Expira en: {result.expires_in}s)
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {authResults.results.failed.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <strong>❌ Fallidos:</strong>
              <ul>
                {authResults.results.failed.map((result: any, index: number) => (
                  <li key={index} style={{ color: 'red' }}>
                    {result.ruc} - {result.razon_social}: {result.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {authResults.results.already_authenticated.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <strong>🔄 Ya autenticados:</strong>
              <ul>
                {authResults.results.already_authenticated.map((result: any, index: number) => (
                  <li key={index} style={{ color: 'green' }}>
                    {result.ruc} - {result.razon_social}: {result.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
