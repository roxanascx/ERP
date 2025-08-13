import React from 'react';
import { useBackendStatus, useApiCall } from '../hooks/useApi';
import { apiService } from '../services/api';

const BackendStatus: React.FC = () => {
  const { data, loading, error } = useBackendStatus();
  const { callApi, loading: callLoading } = useApiCall();

  const testHelloEndpoint = async () => {
    try {
      const result = await callApi(apiService.hello);
      alert(`Respuesta del backend: ${result.message}`);
    } catch (err) {
      alert('Error al conectar con el backend');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', background: '#f59e0b', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
        🔄 Verificando conexión con el backend...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '20px', background: '#ef4444', color: 'white', borderRadius: '8px' }}>
        <h4>❌ Backend Desconectado</h4>
        <p>No se pudo conectar con el backend en http://localhost:8000</p>
        <p><strong>Error:</strong> {error}</p>
        <p>
          <strong>Solución:</strong> Asegúrate de que el backend esté ejecutándose:
        </p>
        <code style={{ background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '3px', display: 'block', marginTop: '10px' }}>
          cd backend && uvicorn app.main:app --reload
        </code>
      </div>
    );
  }

  const isConnected = data.status === 'connected';

  return (
    <div style={{ padding: '20px', background: isConnected ? '#10b981' : '#ef4444', color: 'white', borderRadius: '8px' }}>
      <h4>{isConnected ? '✅ Backend Conectado' : '❌ Backend Desconectado'}</h4>
      
      {isConnected && (
        <>
          <div style={{ marginTop: '15px', display: 'grid', gap: '10px' }}>
            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '5px' }}>
              <strong>API Info:</strong> {data.apiInfo?.message}
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '5px' }}>
              <strong>Health Check:</strong> {data.healthCheck?.status}
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '5px' }}>
              <strong>Base de Datos:</strong> {data.testDb?.message}
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <button
              onClick={testHelloEndpoint}
              disabled={callLoading}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              {callLoading ? 'Probando...' : 'Probar Endpoint /hola'}
            </button>
            
            <a 
              href="http://localhost:8000/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'white', 
                textDecoration: 'underline',
                marginLeft: '10px'
              }}
            >
              Ver Documentación API
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default BackendStatus;
