/**
 * Página de prueba RCE simple
 * Separada del panel complejo para testing directo
 */

import { useState } from 'react';
import RcePropuestasConsulta from '../components/sire/rce/RcePropuestasConsulta';
import RceResumenConsulta from '../components/sire/rce/RceResumenConsulta';
import RceSunatDirecto from '../components/sire/rce/RceSunatDirecto';

const RceTestPage: React.FC = () => {
  const [ruc, setRuc] = useState('20612969125');
  const [año, setAño] = useState('2025');
  const [mes, setMes] = useState('07');

  const periodo = `${año}${mes}`;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 Página de Prueba RCE</h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2>⚙️ Configuración</h2>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'end' }}>
          <div>
            <label>RUC:</label>
            <input 
              type="text" 
              value={ruc} 
              onChange={(e) => setRuc(e.target.value)}
              style={{ 
                display: 'block',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '150px'
              }}
            />
          </div>
          
          <div>
            <label>Año:</label>
            <input 
              type="text" 
              value={año} 
              onChange={(e) => setAño(e.target.value)}
              style={{ 
                display: 'block',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '80px'
              }}
            />
          </div>
          
          <div>
            <label>Mes:</label>
            <input 
              type="text" 
              value={mes} 
              onChange={(e) => setMes(e.target.value)}
              style={{ 
                display: 'block',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '60px'
              }}
            />
          </div>
          
          <div>
            <strong>Período: {periodo}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        <RceSunatDirecto ruc={ruc} periodo={periodo} />
        <RcePropuestasConsulta ruc={ruc} periodo={periodo} />
        <RceResumenConsulta ruc={ruc} periodo={periodo} />
      </div>
      
      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        background: '#e9ecef',
        borderRadius: '8px'
      }}>
        <h3>📝 Instrucciones</h3>
        <ul>
          <li>Configura el RUC y período arriba</li>
          <li>Haz clic en los botones de consulta</li>
          <li>Abre la consola del navegador (F12) para ver logs detallados</li>
          <li>Cada consulta es independiente y muestra errores/respuestas por separado</li>
        </ul>
      </div>
    </div>
  );
};

export default RceTestPage;
