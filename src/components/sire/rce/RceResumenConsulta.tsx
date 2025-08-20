/**
 * Componente específico para consultar resumen RCE
 * Separado del panel principal para mejor control
 */

import { useState } from 'react';
import api from '../../../services/api';

interface RceResumenConsultaProps {
  ruc: string;
  periodo: string;
}

interface ResumenResponse {
  exitoso: boolean;
  mensaje?: string;
  datos?: {
    resumen: any;
    estadisticas: any;
  };
}

export const RceResumenConsulta: React.FC<RceResumenConsultaProps> = ({ ruc, periodo }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ResumenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const consultarResumen = async () => {
    console.log('📊 [Resumen] Iniciando consulta manual');
    console.log('📋 [Resumen] RUC:', ruc, 'Período:', periodo);
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const url = `/api/v1/sire/rce/resumen`;
      const params = { ruc, periodo };
      
      console.log('🌐 [Resumen] URL:', url);
      console.log('🌐 [Resumen] Params:', params);
      
      const response = await api.get(url, { params });
      
      console.log('✅ [Resumen] Response status:', response.status);
      console.log('✅ [Resumen] Response data:', response.data);
      
      setData(response.data);
      
    } catch (err: any) {
      console.error('❌ [Resumen] Error:', err);
      console.error('❌ [Resumen] Response:', err.response?.data);
      console.error('❌ [Resumen] Status:', err.response?.status);
      
      const errorMsg = err.response?.data?.detail || err.message || 'Error desconocido';
      setError(errorMsg);
    } finally {
      setLoading(false);
      console.log('🏁 [Resumen] Consulta finalizada');
    }
  };

  return (
    <div className="rce-resumen-consulta">
      <div className="consulta-header">
        <h3>📊 Consultar Resumen RCE</h3>
        <p>RUC: {ruc} | Período: {periodo}</p>
      </div>

      <div className="consulta-controls">
        <button 
          onClick={consultarResumen}
          disabled={loading}
          className="btn-consultar"
        >
          {loading ? '🔄 Consultando...' : '📊 Consultar Resumen'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <h4>❌ Error:</h4>
          <pre>{error}</pre>
        </div>
      )}

      {data && (
        <div className="response-data">
          <h4>✅ Respuesta:</h4>
          <div className="response-summary">
            <p><strong>Exitoso:</strong> {data.exitoso ? 'Sí' : 'No'}</p>
            {data.mensaje && <p><strong>Mensaje:</strong> {data.mensaje}</p>}
          </div>
          
          <details>
            <summary>Ver respuesta completa</summary>
            <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <style>{`
        .rce-resumen-consulta {
          margin: 20px 0;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        
        .consulta-header h3 {
          margin: 0 0 10px 0;
          color: #333;
        }
        
        .consulta-header p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        
        .consulta-controls {
          margin: 15px 0;
        }
        
        .btn-consultar {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .btn-consultar:hover:not(:disabled) {
          background: #1e7e34;
        }
        
        .btn-consultar:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .error-message {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        .error-message h4 {
          margin: 0 0 5px 0;
        }
        
        .response-data {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        .response-data h4 {
          margin: 0 0 10px 0;
        }
        
        .response-summary p {
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
};

export default RceResumenConsulta;
