/**
 * Componente para consultas DIRECTAS a SUNAT
 * Usa las mismas URLs que los scripts que funcionan
 */

import { useState } from 'react';
import api from '../../../services/api';

interface RceSunatDirectoProps {
  ruc: string;
  periodo: string;
}

interface SunatResponse {
  exitoso: boolean;
  mensaje?: string;
  datos?: any;
}

export const RceSunatDirecto: React.FC<RceSunatDirectoProps> = ({ ruc, periodo }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SunatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const consultarPropuestasSunat = async () => {
    console.log('🚀 [SUNAT Directo] Iniciando consulta DIRECTA a SUNAT');
    console.log('📋 [SUNAT Directo] RUC:', ruc, 'Período:', periodo);
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Usar el endpoint que llama DIRECTAMENTE a SUNAT
      const url = `/api/v1/sire/rce/propuestas`;
      const params = { ruc, periodo };
      
      console.log('🌐 [SUNAT Directo] URL:', url);
      console.log('🌐 [SUNAT Directo] Params:', params);
      
      const response = await api.get(url, { params });
      
      console.log('✅ [SUNAT Directo] Response status:', response.status);
      console.log('✅ [SUNAT Directo] Response data:', response.data);
      
      setData(response.data);
      
    } catch (err: any) {
      console.error('❌ [SUNAT Directo] Error:', err);
      console.error('❌ [SUNAT Directo] Response:', err.response?.data);
      console.error('❌ [SUNAT Directo] Status:', err.response?.status);
      
      const errorMsg = err.response?.data?.detail || err.message || 'Error desconocido';
      setError(errorMsg);
    } finally {
      setLoading(false);
      console.log('🏁 [SUNAT Directo] Consulta finalizada');
    }
  };

  const consultarTicketsSunat = async () => {
    console.log('🎫 [SUNAT Tickets] Iniciando consulta DIRECTA de tickets a SUNAT');
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const url = `/api/v1/sire/rce/sunat/tickets`;
      const params = { 
        ruc, 
        periodo_ini: periodo, 
        periodo_fin: periodo,
        page: 1,
        per_page: 20
      };
      
      console.log('🌐 [SUNAT Tickets] URL:', url);
      console.log('🌐 [SUNAT Tickets] Params:', params);
      
      const response = await api.get(url, { params });
      
      console.log('✅ [SUNAT Tickets] Response status:', response.status);
      console.log('✅ [SUNAT Tickets] Response data:', response.data);
      
      setData(response.data);
      
    } catch (err: any) {
      console.error('❌ [SUNAT Tickets] Error:', err);
      console.error('❌ [SUNAT Tickets] Response:', err.response?.data);
      
      const errorMsg = err.response?.data?.detail || err.message || 'Error desconocido';
      setError(errorMsg);
    } finally {
      setLoading(false);
      console.log('🏁 [SUNAT Tickets] Consulta finalizada');
    }
  };

  return (
    <div className="rce-sunat-directo">
      <div className="consulta-header">
        <h3>🚀 Consultar SUNAT Directo (URLs Verificadas)</h3>
        <p>RUC: {ruc} | Período: {periodo}</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          ✅ Usa las mismas URLs que tus scripts Python que funcionan
        </p>
      </div>

      <div className="consulta-controls">
        <button 
          onClick={consultarPropuestasSunat}
          disabled={loading}
          className="btn-consultar btn-propuestas"
        >
          {loading ? '🔄 Consultando...' : '📤 Generar Propuesta SUNAT'}
        </button>
        
        <button 
          onClick={consultarTicketsSunat}
          disabled={loading}
          className="btn-consultar btn-tickets"
        >
          {loading ? '🔄 Consultando...' : '🎫 Consultar Tickets SUNAT'}
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
          <h4>✅ Respuesta SUNAT Directa:</h4>
          <div className="response-summary">
            <p><strong>Exitoso:</strong> {data.exitoso ? 'Sí' : 'No'}</p>
            {data.mensaje && <p><strong>Mensaje:</strong> {data.mensaje}</p>}
            
            {data.datos && (
              <div>
                <p><strong>Datos recibidos de SUNAT:</strong></p>
                {data.datos.registros && (
                  <p><strong>Total registros:</strong> {data.datos.registros.length}</p>
                )}
                {data.datos.numTicket && (
                  <p><strong>Ticket generado:</strong> {data.datos.numTicket}</p>
                )}
              </div>
            )}
          </div>
          
          <details>
            <summary>Ver respuesta completa de SUNAT</summary>
            <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '400px' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <style>{`
        .rce-sunat-directo {
          margin: 20px 0;
          padding: 20px;
          border: 2px solid #007bff;
          border-radius: 8px;
          background: #f8f9ff;
        }
        
        .consulta-header h3 {
          margin: 0 0 10px 0;
          color: #007bff;
        }
        
        .consulta-header p {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }
        
        .consulta-controls {
          margin: 15px 0;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .btn-consultar {
          border: none;
          padding: 12px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
        }
        
        .btn-propuestas {
          background: #007bff;
          color: white;
        }
        
        .btn-tickets {
          background: #28a745;
          color: white;
        }
        
        .btn-consultar:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .btn-consultar:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        
        .error-message {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 15px;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        .error-message h4 {
          margin: 0 0 10px 0;
        }
        
        .response-data {
          background: #d4edda;
          border: 2px solid #28a745;
          color: #155724;
          padding: 15px;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        .response-data h4 {
          margin: 0 0 15px 0;
          color: #155724;
        }
        
        .response-summary p {
          margin: 8px 0;
        }
        
        .response-summary strong {
          color: #0d4e1f;
        }
        
        details {
          margin-top: 15px;
        }
        
        summary {
          cursor: pointer;
          font-weight: bold;
          padding: 5px;
          background: #c3e6cb;
          border-radius: 4px;
        }
        
        summary:hover {
          background: #b7dfbb;
        }
      `}</style>
    </div>
  );
};

export default RceSunatDirecto;
