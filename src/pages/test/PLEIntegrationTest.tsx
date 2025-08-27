import React, { useState, useEffect } from 'react';
import { pleApiService } from '../../services/pleApi';

const PLEIntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any[] = [];

    try {
      // Test 1: Verificar conectividad con backend
      results.push({
        test: 'Backend Connectivity',
        status: 'running',
        result: 'Testing connection...'
      });

      // Test de generación PLE
      const testData = {
        ejercicio: 2024,
        mes: 8,
        ruc: '20123456789',
        razonSocial: 'Empresa Test',
        fechaInicio: '2024-08-01',
        fechaFin: '2024-08-31',
        incluirCierreEjercicio: false,
        observaciones: 'Test de integración'
      };

      try {
        const generacionResponse = await pleApiService.generarPLE(testData);
        results.push({
          test: 'PLE Generation API',
          status: 'success',
          result: `Generación exitosa: ${generacionResponse.message}`
        });
      } catch (error: any) {
        results.push({
          test: 'PLE Generation API',
          status: 'error',
          result: `Error: ${error.message}`
        });
      }

      // Test de validación PLE
      try {
        const validacionResponse = await pleApiService.validarPLE(testData);
        results.push({
          test: 'PLE Validation API',
          status: 'success',
          result: `Validación exitosa: ${validacionResponse.success ? 'Válido' : 'Con errores'}`
        });
      } catch (error: any) {
        results.push({
          test: 'PLE Validation API',
          status: 'error',
          result: `Error: ${error.message}`
        });
      }

      // Test de listado de archivos
      try {
        const archivosResponse = await pleApiService.obtenerArchivos();
        results.push({
          test: 'PLE File Listing API',
          status: 'success',
          result: `Archivos encontrados: ${archivosResponse?.length || 0}`
        });
      } catch (error: any) {
        results.push({
          test: 'PLE File Listing API',
          status: 'error',
          result: `Error: ${error.message}`
        });
      }

    } catch (error: any) {
      results.push({
        test: 'General Test',
        status: 'error',
        result: `Error general: ${error.message}`
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 PLE Frontend-Backend Integration Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runTests}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: loading ? '#gray' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Ejecutando Tests...' : 'Ejecutar Tests de Integración'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div>
          <h2>📊 Resultados de Tests</h2>
          {testResults.map((result, index) => (
            <div 
              key={index}
              style={{
                padding: '15px',
                margin: '10px 0',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: result.status === 'success' ? '#f0f9ff' : 
                          result.status === 'error' ? '#fef2f2' : '#f9fafb'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '8px' 
              }}>
                <span style={{ 
                  marginRight: '10px',
                  fontSize: '18px'
                }}>
                  {result.status === 'success' ? '✅' : 
                   result.status === 'error' ? '❌' : '⏳'}
                </span>
                <strong>{result.test}</strong>
              </div>
              <div style={{ 
                color: result.status === 'error' ? '#dc2626' : '#374151',
                fontSize: '14px'
              }}>
                {result.result}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
        <h3>ℹ️ Información de Tests</h3>
        <ul style={{ fontSize: '14px', color: '#6b7280' }}>
          <li><strong>Backend Connectivity:</strong> Verifica que el frontend puede conectarse al backend</li>
          <li><strong>PLE Generation API:</strong> Prueba la generación de archivos PLE</li>
          <li><strong>PLE Validation API:</strong> Prueba la validación de datos PLE</li>
          <li><strong>PLE File Listing API:</strong> Prueba el listado de archivos generados</li>
        </ul>
      </div>
    </div>
  );
};

export default PLEIntegrationTest;
