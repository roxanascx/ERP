import React from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { useBackendStatus, useApiCall } from '../hooks/useApi';
import { apiService } from '../services/api';
import { cn } from '../lib/cn';

/** Estado de la conexión con el backend. */
const BackendStatus: React.FC = () => {
  const { data, loading, error } = useBackendStatus();
  const { callApi, loading: callLoading } = useApiCall();

  const testHelloEndpoint = async () => {
    try {
      const result = await callApi(apiService.hello);
      window.alert(`Respuesta del backend: ${result.message}`);
    } catch {
      window.alert('Error al conectar con el backend');
    }
  };

  if (loading) {
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Verificando conexión con el backend…
      </p>
    );
  }

  if (error || !data) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      >
        <p className="mb-1 flex items-center gap-2 font-semibold">
          <AlertCircle className="size-4" aria-hidden="true" />
          Backend desconectado
        </p>
        <p className="mb-2">
          No se pudo conectar con el backend en <code>http://localhost:8000</code>.
          {error && <> Error: {error}</>}
        </p>
        <p className="mb-1 text-xs font-medium">Para levantarlo:</p>
        <code className="block rounded bg-red-100 px-2 py-1.5 font-mono text-xs">
          cd back &amp;&amp; uvicorn app.main:app --reload
        </code>
      </div>
    );
  }

  const isConnected = data.status === 'connected';

  const detalles = [
    { label: 'API', value: data.apiInfo?.message },
    { label: 'Health check', value: data.healthCheck?.status },
    { label: 'Base de datos', value: data.testDb?.message },
  ];

  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3',
        isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
      )}
    >
      <p
        className={cn(
          'mb-2 flex items-center gap-2 text-sm font-semibold',
          isConnected ? 'text-green-800' : 'text-red-800'
        )}
      >
        {isConnected ? (
          <CheckCircle2 className="size-4" aria-hidden="true" />
        ) : (
          <AlertCircle className="size-4" aria-hidden="true" />
        )}
        {isConnected ? 'Backend conectado' : 'Backend desconectado'}
      </p>

      {isConnected && (
        <>
          <dl className="mb-3 grid gap-2 sm:grid-cols-3">
            {detalles.map((d) => (
              <div key={d.label} className="rounded-lg bg-white/70 px-3 py-2">
                <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                  {d.label}
                </dt>
                <dd className="truncate text-sm text-slate-800">{d.value ?? '—'}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={testHelloEndpoint}
              disabled={callLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {callLoading && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
              {callLoading ? 'Probando…' : 'Probar endpoint /hola'}
            </button>

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 no-underline hover:bg-slate-50 hover:no-underline"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Documentación de la API
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default BackendStatus;
