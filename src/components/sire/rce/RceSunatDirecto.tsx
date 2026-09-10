/**
 * Consultas directas a SUNAT para RCE (propuestas y tickets).
 */

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send, Ticket } from 'lucide-react';
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

  /** Ambas consultas comparten el mismo ciclo de carga y manejo de error. */
  const consultar = async (url: string, params: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await api.get(url, { params });
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const consultarPropuestasSunat = () =>
    consultar('/api/v1/sire/rce/propuestas', { ruc, periodo });

  const consultarTicketsSunat = () =>
    consultar('/api/v1/sire/rce/sunat/tickets', {
      ruc,
      periodo_ini: periodo,
      periodo_fin: periodo,
      page: 1,
      per_page: 20,
    });

  return (
    <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Consulta directa a SUNAT</h3>
        <p className="text-sm text-slate-500 tabular-nums">
          RUC {ruc} · Período {periodo}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={consultarPropuestasSunat}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}
          Generar propuesta
        </button>

        <button
          type="button"
          onClick={consultarTicketsSunat}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Ticket className="size-4" aria-hidden="true" />
          )}
          Consultar tickets
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-red-800">
            <AlertCircle className="size-4" aria-hidden="true" />
            Error en la consulta
          </p>
          <pre className="overflow-x-auto text-xs whitespace-pre-wrap text-red-700">{error}</pre>
        </div>
      )}

      {data && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CheckCircle2
              className={data.exitoso ? 'size-4 text-green-600' : 'size-4 text-slate-400'}
              aria-hidden="true"
            />
            Respuesta de SUNAT
          </p>

          <dl className="mb-3 space-y-1 text-sm text-slate-700">
            <div className="flex gap-2">
              <dt className="text-slate-500">Exitoso:</dt>
              <dd className="font-medium">{data.exitoso ? 'Sí' : 'No'}</dd>
            </div>
            {data.mensaje && (
              <div className="flex gap-2">
                <dt className="text-slate-500">Mensaje:</dt>
                <dd className="min-w-0 font-medium">{data.mensaje}</dd>
              </div>
            )}
            {data.datos?.registros && (
              <div className="flex gap-2">
                <dt className="text-slate-500">Registros:</dt>
                <dd className="font-medium tabular-nums">{data.datos.registros.length}</dd>
              </div>
            )}
            {data.datos?.numTicket && (
              <div className="flex gap-2">
                <dt className="text-slate-500">Ticket generado:</dt>
                <dd className="font-mono font-medium">{data.datos.numTicket}</dd>
              </div>
            )}
          </dl>

          <details>
            <summary className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900">
              Ver respuesta completa
            </summary>
            <pre className="mt-2 max-h-100 overflow-auto rounded bg-slate-100 p-2.5 text-xs text-slate-700">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default RceSunatDirecto;
