/**
 * 🧪 Página de Prueba - Integración Completa RCE con Cache
 * Permite probar el flujo optimizado de datos entre vistas
 */
import React, { useState } from 'react';
import { useRceData } from '../../contexts/RceDataContext';
import RceComprobantesTable from '../../components/sire/rce/RceComprobantesTable';

const RceIntegrationTest: React.FC = () => {
  const [rucTest] = useState('20612969125'); // RUC de prueba
  const [periodoTest] = useState('202408'); // Período de prueba
  const [mostrarTabla, setMostrarTabla] = useState(false);

  const { 
    comprobantesDetallados,
    setComprobantesDetallados,
    setPeriodoActual,
    setRucActual,
    hayDatosEnCache,
    obtenerEstadoCache,
    limpiarCache
  } = useRceData();

  // Simular datos de cache (como si vinieran de consulta detallada)
  const simularConsultaSunat = () => {
    console.log('🔄 Simulando consulta SUNAT...');
    
    // Datos simulados
    const comprobantesSimulados = [
      {
        ruc_proveedor: '20123456789',
        razon_social_proveedor: 'EMPRESA EJEMPLO S.A.C.',
        tipo_documento: '01',
        serie: 'F001',
        numero: '123',
        fecha_emision: '2024-08-15',
        moneda: 'PEN',
        tipo_cambio: 1.0,
        base_imponible: 100.00,
        igv: 18.00,
        valor_no_gravado: 0.00,
        total: 118.00
      },
      {
        ruc_proveedor: '20987654321',
        razon_social_proveedor: 'PROVEEDOR TEST E.I.R.L.',
        tipo_documento: '01',
        serie: 'F002',
        numero: '456',
        fecha_emision: '2024-08-16',
        moneda: 'PEN',
        tipo_cambio: 1.0,
        base_imponible: 200.00,
        igv: 36.00,
        valor_no_gravado: 0.00,
        total: 236.00
      },
      {
        ruc_proveedor: '20555666777',
        razon_social_proveedor: 'SERVICIOS INTEGRADOS S.A.',
        tipo_documento: '03',
        serie: 'B001',
        numero: '789',
        fecha_emision: '2024-08-17',
        moneda: 'PEN',
        tipo_cambio: 1.0,
        base_imponible: 150.00,
        igv: 27.00,
        valor_no_gravado: 0.00,
        total: 177.00
      }
    ];

    // Guardar en cache
    setComprobantesDetallados(comprobantesSimulados);
    setRucActual(rucTest);
    setPeriodoActual(periodoTest);
    
    console.log(`✅ ${comprobantesSimulados.length} comprobantes guardados en cache`);
  };

  const estadoCache = obtenerEstadoCache(rucTest, periodoTest);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1>🧪 Prueba de Integración RCE - Sistema Optimizado</h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2>📊 Estado del Cache</h2>
        <p><strong>RUC:</strong> {rucTest}</p>
        <p><strong>Período:</strong> {periodoTest}</p>
        <p><strong>Hay datos:</strong> {hayDatosEnCache() ? '✅ Sí' : '❌ No'}</p>
        <p><strong>Estado:</strong> {estadoCache.descripcion}</p>
        {comprobantesDetallados && (
          <p><strong>Total comprobantes:</strong> {comprobantesDetallados.length}</p>
        )}
        
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={simularConsultaSunat}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Simular Consulta SUNAT
          </button>
          
          <button 
            onClick={limpiarCache}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🗑️ Limpiar Cache
          </button>
          
          <button 
            onClick={() => setMostrarTabla(!mostrarTabla)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {mostrarTabla ? '🙈 Ocultar' : '👀 Mostrar'} Tabla BD
          </button>
        </div>
      </div>

      {/* Visualización de datos en cache */}
      {comprobantesDetallados && comprobantesDetallados.length > 0 && (
        <div style={{ 
          background: '#e8f5e8', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h3>🚀 Datos en Cache (listos para guardar sin consultar SUNAT)</h3>
          <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
            {comprobantesDetallados.map((comp, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                <strong>{comp.razon_social_proveedor}</strong> - 
                {comp.tipo_documento}-{comp.serie}-{comp.numero} - 
                S/ {comp.total.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de base de datos */}
      {mostrarTabla && (
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #ddd' 
        }}>
          <h3>📋 Tabla de Comprobantes BD</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            El botón "Guardar" usará los datos del cache si están disponibles, 
            evitando consultas innecesarias a SUNAT.
          </p>
          <RceComprobantesTable 
            ruc={rucTest} 
            periodo={periodoTest}
            onDataChange={() => console.log('📊 Datos de BD actualizados')}
          />
        </div>
      )}

      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '20px',
        border: '1px solid #ffeaa7'
      }}>
        <h4>📋 Instrucciones de Prueba</h4>
        <ol>
          <li><strong>Simular Consulta:</strong> Genera datos ficticios en el cache</li>
          <li><strong>Mostrar Tabla:</strong> Abre la tabla de base de datos</li>
          <li><strong>Guardar desde Cache:</strong> El botón "Guardar" detectará los datos en cache</li>
          <li><strong>Verificar Optimización:</strong> No se consultará SUNAT si hay datos válidos</li>
          <li><strong>Limpiar Cache:</strong> Reinicia el estado para probar sin cache</li>
        </ol>
      </div>
    </div>
  );
};

export default RceIntegrationTest;
