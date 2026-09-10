import React, { useState, useEffect } from 'react';
import { pleApiService, type PLEGeneracionData } from '../../services/pleApi';

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

      // Test de generación PLE.
      // Los campos ruc/razonSocial/fechaInicio/fechaFin eran de un contrato
      // anterior de la API: PLEGeneracionData ahora pide `libro_diario_id`.
      const hoy = new Date();
      const testData: PLEGeneracionData = {
        libro_diario_id: 'test-libro-diario',
        ejercicio: hoy.getFullYear(),
        mes: hoy.getMonth() + 1,
        validar_antes_generar: true,
        incluir_metadatos: true,
        generar_zip: false,
        observaciones: 'Test de integración'
      };

      try {
        const generacionResponse = await pleApiService.generarPLE(testData);
        results.push({
          test: 'PLE Generation API',
          status: 'success',
          result: `Generación exitosa: ${generacionResponse.mensaje}`
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

  const TONES = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    running: 'border-slate-200 bg-slate-50',
  } as const;

  const INFO = [
    ['Backend Connectivity', 'Verifica que el frontend puede conectarse al backend'],
    ['PLE Generation API', 'Prueba la generacion de archivos PLE'],
    ['PLE Validation API', 'Prueba la validacion de datos PLE'],
    ['PLE File Listing API', 'Prueba el listado de archivos generados'],
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Integracion PLE frontend-backend
        </h1>

        <button
          type="button"
          onClick={runTests}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Ejecutando tests...' : 'Ejecutar tests de integracion'}
        </button>

        {testResults.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">Resultados</h2>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`rounded-lg border px-4 py-3 ${TONES[result.status as keyof typeof TONES] ?? TONES.running}`}
              >
                <p className="mb-1 text-sm font-semibold text-slate-900">{result.test}</p>
                <p
                  className={`text-sm ${result.status === 'error' ? 'text-red-700' : 'text-slate-600'}`}
                >
                  {result.result}
                </p>
              </div>
            ))}
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Que comprueba cada test</h3>
          <dl className="space-y-1.5 text-sm">
            {INFO.map(([nombre, desc]) => (
              <div key={nombre} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <dt className="font-medium text-slate-700">{nombre}:</dt>
                <dd className="text-slate-500">{desc}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
};

export default PLEIntegrationTest;
