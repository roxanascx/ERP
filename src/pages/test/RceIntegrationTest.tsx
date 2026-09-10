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
    
  };

  const estadoCache = obtenerEstadoCache(rucTest, periodoTest);

  const PASOS = [
    ['Simular consulta', 'Genera datos ficticios en el cache'],
    ['Mostrar tabla', 'Abre la tabla de base de datos'],
    ['Guardar desde cache', 'El boton Guardar detecta los datos en cache'],
    ['Verificar optimizacion', 'No se consulta SUNAT si hay datos validos'],
    ['Limpiar cache', 'Reinicia el estado para probar sin cache'],
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Integracion RCE - cache de comprobantes
        </h1>

        {/* Estado del cache */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Estado del cache</h2>

          <dl className="mb-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="text-slate-500">RUC:</dt>
              <dd className="font-mono font-medium text-slate-800">{rucTest}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-slate-500">Periodo:</dt>
              <dd className="font-mono font-medium text-slate-800">{periodoTest}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-slate-500">Hay datos:</dt>
              <dd className="font-medium text-slate-800">{hayDatosEnCache() ? 'Si' : 'No'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-slate-500">Estado:</dt>
              <dd className="font-medium text-slate-800">{estadoCache.descripcion}</dd>
            </div>
            {comprobantesDetallados && (
              <div className="flex gap-2">
                <dt className="text-slate-500">Comprobantes:</dt>
                <dd className="font-medium text-slate-800 tabular-nums">
                  {comprobantesDetallados.length}
                </dd>
              </div>
            )}
          </dl>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={simularConsultaSunat}
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Simular consulta SUNAT
            </button>
            <button
              type="button"
              onClick={limpiarCache}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Limpiar cache
            </button>
            <button
              type="button"
              onClick={() => setMostrarTabla(!mostrarTabla)}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {mostrarTabla ? 'Ocultar' : 'Mostrar'} tabla BD
            </button>
          </div>
        </section>

        {/* Datos en cache */}
        {comprobantesDetallados && comprobantesDetallados.length > 0 && (
          <section className="rounded-xl border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 text-sm font-semibold text-green-900">
              Datos en cache (listos para guardar sin consultar SUNAT)
            </h3>
            <ul className="space-y-1 font-mono text-sm text-green-800">
              {comprobantesDetallados.map((comp, index) => (
                <li key={index}>
                  <strong>{comp.razon_social_proveedor}</strong> · {comp.tipo_documento}-
                  {comp.serie}-{comp.numero} · S/ {comp.total.toFixed(2)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tabla BD */}
        {mostrarTabla && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-1 text-sm font-semibold text-slate-900">Comprobantes en BD</h3>
            <p className="mb-3 text-sm text-slate-500">
              El boton Guardar usa los datos del cache si estan disponibles, evitando consultas
              innecesarias a SUNAT.
            </p>
            <RceComprobantesTable ruc={rucTest} periodo={periodoTest} onDataChange={() => {}} />
          </section>
        )}

        {/* Instrucciones */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h4 className="mb-2 text-sm font-semibold text-slate-900">Como probarlo</h4>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
            {PASOS.map(([titulo, desc]) => (
              <li key={titulo}>
                <strong className="text-slate-800">{titulo}:</strong> {desc}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
};

export default RceIntegrationTest;
