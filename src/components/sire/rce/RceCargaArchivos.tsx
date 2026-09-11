/**
 * Carga de archivos al RCE (5.3 y 5.5-5.9).
 *
 * Solo ofrece las operaciones que el estado del periodo admite, y cuando SUNAT
 * rechaza el archivo muestra su lista de errores fila a fila: es la informacion
 * que dice que hay que corregir.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileUp, Loader2, Upload } from 'lucide-react';
import {
  rceCargasApi,
  ErrorCarga,
  type OperacionCarga,
  type ResultadoCarga,
} from '../../../services/rceCargasApi';
import { rceCicloApi, type EstadoPeriodo } from '../../../services/rceCicloApi';
import { cn } from '../../../lib/cn';

interface Props {
  ruc: string;
  periodo: string;
}

export const RceCargaArchivos: React.FC<Props> = ({ ruc, periodo }) => {
  const [operaciones, setOperaciones] = useState<OperacionCarga[]>([]);
  const [estado, setEstado] = useState<EstadoPeriodo | null>(null);
  const [seleccionada, setSeleccionada] = useState<string>('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCarga | null>(null);
  const [error, setError] = useState<ErrorCarga | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [ops, est] = await Promise.all([
        rceCargasApi.operaciones(),
        rceCicloApi.estado(ruc, periodo),
      ]);
      setOperaciones(ops);
      setEstado(est.estado);
    } catch (e: any) {
      setError(e instanceof ErrorCarga ? e : new ErrorCarga(e.message));
    }
  }, [ruc, periodo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const disponibles = operaciones.filter((o) => o.estado_requerido === estado);
  const bloqueadas = operaciones.filter((o) => o.estado_requerido !== estado);

  const subir = async () => {
    if (!archivo || !seleccionada) return;

    const op = operaciones.find((o) => o.clave === seleccionada);
    const aviso =
      `Subir "${archivo.name}" a SUNAT.\n\n` +
      `Operacion: ${op?.nombre} (${op?.servicio}).\n` +
      (op?.estado_resultante
        ? `El periodo pasara a ${op.estado_resultante}.\n\n`
        : 'El periodo no cambia de fase.\n\n') +
      'Continuar?';

    if (!window.confirm(aviso)) return;

    setSubiendo(true);
    setError(null);
    setResultado(null);
    try {
      setResultado(await rceCargasApi.subir(seleccionada, ruc, periodo, archivo));
      setArchivo(null);
      cargar();
    } catch (e: any) {
      setError(e instanceof ErrorCarga ? e : new ErrorCarga(e.message));
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* --- Que se puede subir ahora --- */}
      <div>
        <p className="mb-2 text-sm text-slate-500">
          {estado
            ? `El periodo ${periodo} esta en ${estado}. Estas son las cargas que admite:`
            : 'Consultando el estado del periodo…'}
        </p>

        {disponibles.length === 0 && estado && (
          <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            En estado {estado} no hay ninguna carga disponible.
          </p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          {disponibles.map((op) => (
            <label
              key={op.clave}
              className={cn(
                'flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors',
                seleccionada === op.clave
                  ? 'border-violet-400 bg-violet-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              )}
            >
              <input
                type="radio"
                name="operacion-carga"
                value={op.clave}
                checked={seleccionada === op.clave}
                onChange={() => setSeleccionada(op.clave)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900">{op.nombre}</span>
                <span className="block text-xs text-slate-500">
                  Servicio {op.servicio} · codProceso {op.cod_proceso}
                </span>
              </span>
            </label>
          ))}
        </div>

        {bloqueadas.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-slate-500">
              Otras {bloqueadas.length} cargas, no disponibles en este estado
            </summary>
            <ul className="mt-2 space-y-1">
              {bloqueadas.map((op) => (
                <li key={op.clave} className="text-xs text-slate-500">
                  {op.nombre} ({op.servicio}) — necesita el periodo en{' '}
                  <strong>{op.estado_requerido}</strong>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* --- Archivo --- */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <span className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">
            <FileUp className="size-4" />
            Elegir archivo .txt
          </span>
          <input
            type="file"
            accept=".txt"
            className="hidden"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          />
          <span className="text-slate-600">
            {archivo ? `${archivo.name} (${(archivo.size / 1024).toFixed(1)} kB)` : 'Ninguno'}
          </span>
        </label>

        <button
          type="button"
          onClick={subir}
          disabled={!archivo || !seleccionada || subiendo}
          className="mt-4 flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {subiendo ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Subir a SUNAT
        </button>
      </div>

      {/* --- Resultado --- */}
      {resultado && (
        <div className="flex gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          <CheckCircle2 className="size-4 shrink-0" />
          <div>
            <p className="font-semibold">{resultado.mensaje}</p>
            <p className="mt-0.5">
              {resultado.num_ticket ? (
                <>
                  Ticket <span className="font-mono">{resultado.num_ticket}</span>. Sigue su
                  estado en la pestana de tickets.
                </>
              ) : (
                'SUNAT acepto el archivo pero no devolvio numero de ticket.'
              )}
            </p>
          </div>
        </div>
      )}

      {/* --- Errores de SUNAT, fila a fila --- */}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="size-4 shrink-0" />
            {error.message}
          </p>
          {error.errores.length > 0 && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded border border-red-200 bg-white">
              <table className="w-full text-xs">
                <thead className="bg-red-100/60 text-left text-red-900">
                  <tr>
                    <th className="px-2 py-1.5 font-semibold">Codigo</th>
                    <th className="px-2 py-1.5 font-semibold">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {error.errores.map((e, i) => (
                    <tr key={`${e.cod}-${i}`} className="border-t border-red-100">
                      <td className="px-2 py-1.5 font-mono align-top text-red-700">{e.cod}</td>
                      <td className="px-2 py-1.5 text-slate-700">{e.msg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RceCargaArchivos;
