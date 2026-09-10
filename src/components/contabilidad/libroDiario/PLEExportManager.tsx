import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import type { AsientoContable, LibroDiario } from '../../../types/libroDiario';
import type { Empresa } from '../../../types/empresa';
import {
  pleApiUnified,
  type PLEGeneracionRequest,
  type PLEGeneracionResponse,
  type PLEValidacionRequest,
  type PLEValidacionResponse,
  type PLEContextoResponse,
} from '../../../services/pleApiUnified';
import Modal from '../../common/Modal';
import { cn } from '../../../lib/cn';

interface PLEExportManagerProps {
  libro: LibroDiario;
  empresa?: Empresa;
  asientos?: AsientoContable[];
  onClose?: () => void;
  onSuccess?: (archivo: PLEGeneracionResponse) => void;
  onError?: (error: string) => void;
}

interface PLEPeriodoConfig {
  ejercicio: number;
  mes: number;
  descripcion: string;
}

type PLEProcessStatus =
  | 'idle'
  | 'loading-context'
  | 'validating'
  | 'generating'
  | 'downloading'
  | 'success'
  | 'error';

const ESTADO_TEXTO: Record<PLEProcessStatus, string> = {
  idle: 'Listo',
  'loading-context': 'Cargando contexto del libro…',
  validating: 'Validando datos…',
  generating: 'Generando archivo PLE…',
  downloading: 'Descargando archivo…',
  success: 'Proceso completado',
  error: 'Se produjo un error',
};

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const selectClass = cn(
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
);

/**
 * Exportacion del libro diario al formato PLE de SUNAT.
 *
 * Migrado a Tailwind. Ademas se corrigen tres errores de tipos que arrastraba
 * la base: `validacionResult.errores` no existe (los errores viven en
 * `validacion_basica.errores` y `validacion_sunat.errores`), y `libro.id` es
 * opcional, asi que no podia pasarse directo como `libro_diario_id`.
 */
const PLEExportManager: React.FC<PLEExportManagerProps> = ({
  libro,
  onClose,
  onSuccess,
  onError,
}) => {
  const [estado, setEstado] = useState<PLEProcessStatus>('idle');
  const [validacionResult, setValidacionResult] = useState<PLEValidacionResponse | null>(null);
  const [contextoLibro, setContextoLibro] = useState<PLEContextoResponse | null>(null);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [periodoConfig, setPeriodoConfig] = useState<PLEPeriodoConfig>(() => {
    const hoy = new Date();
    return {
      ejercicio: hoy.getFullYear(),
      mes: hoy.getMonth() + 1,
      descripcion: `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`,
    };
  });

  // ---------------------------------------------------------------------------
  // Datos
  // ---------------------------------------------------------------------------

  const validarDatosParaPLE = async () => {
    if (!libro.id) {
      setError('No hay libro diario disponible');
      setEstado('error');
      return;
    }

    setEstado('validating');
    setError(null);

    try {
      const datosValidacion: PLEValidacionRequest = {
        libro_diario_id: libro.id,
        validar_estructura: true,
        validar_balanceo: true,
        validar_sunat: true,
      };

      setValidacionResult(await pleApiUnified.validarPLE(datosValidacion));
      setEstado('idle');
    } catch (err: any) {
      const msg = err.message || 'Error al validar datos para PLE';
      setError(msg);
      setEstado('error');
      onError?.(msg);
    }
  };

  const cargarContextoYValidar = async () => {
    if (!libro.id) return;

    setEstado('loading-context');
    setError(null);

    try {
      const contexto = await pleApiUnified.obtenerContexto(libro.id);
      setContextoLibro(contexto);
      setPeriodoConfig({
        ejercicio: contexto.ejercicio,
        mes: contexto.mes,
        descripcion: `${contexto.ejercicio}-${String(contexto.mes).padStart(2, '0')}`,
      });

      await validarDatosParaPLE();
    } catch (err: any) {
      const msg = err.message || 'Error al cargar contexto del libro';
      setError(msg);
      setEstado('error');
      onError?.(msg);
    }
  };

  useEffect(() => {
    void cargarContextoYValidar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libro.id]);

  // ---------------------------------------------------------------------------
  // Recuento de errores y advertencias
  // ---------------------------------------------------------------------------

  const erroresBasicos = validacionResult?.validacion_basica?.errores ?? [];
  const erroresSunat = validacionResult?.validacion_sunat?.errores ?? [];
  const warningsBasicos = validacionResult?.validacion_basica?.warnings ?? [];
  const warningsSunat = validacionResult?.validacion_sunat?.warnings ?? [];

  const totalErrores = erroresBasicos.length + erroresSunat.length;
  const totalWarnings = warningsBasicos.length + warningsSunat.length;
  const erroresCriticos = erroresSunat.filter((e) => e.critico).length;

  const todosLosErrores = [...erroresBasicos, ...erroresSunat.map((e) => e.mensaje)];
  const todasLasAdvertencias = [...warningsBasicos, ...warningsSunat.map((w) => w.mensaje)];

  // ---------------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------------

  const exportarPLE = async () => {
    if (!libro.id) {
      setError('No hay libro diario disponible');
      return;
    }
    if (!contextoLibro) {
      setError('No hay contexto del libro disponible');
      return;
    }

    setEstado('generating');
    setError(null);

    try {
      // Los errores estan repartidos entre la validacion basica y la de SUNAT.
      if (validacionResult && !validacionResult.valido && totalErrores > 0) {
        const confirmar = window.confirm(
          `Se encontraron ${totalErrores} errores. ¿Deseas continuar con la exportación?`
        );
        if (!confirmar) {
          setEstado('idle');
          return;
        }
      }

      const datosGeneracion: PLEGeneracionRequest = {
        libro_diario_id: libro.id,
        ejercicio: periodoConfig.ejercicio,
        mes: periodoConfig.mes,
        validar_antes_generar: true,
        incluir_metadatos: true,
        generar_zip: true,
        descargar_directo: false,
      };

      const resultado = await pleApiUnified.generarPLE(datosGeneracion);

      if (resultado.success && resultado.archivo_nombre) {
        setEstado('success');
        onSuccess?.(resultado);
        setTimeout(() => onClose?.(), 2000);
      } else {
        throw new Error('Error al generar el archivo PLE');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Error al exportar PLE';
      setError(msg);
      setEstado('error');
      onError?.(msg);
    }
  };

  const descargarPLEDirecto = async () => {
    if (!libro.id) {
      setError('No hay libro diario disponible');
      return;
    }

    setEstado('downloading');
    setError(null);

    try {
      const blob = await pleApiUnified.descargarPLE(
        libro.id,
        periodoConfig.ejercicio,
        periodoConfig.mes
      );

      // Nomenclatura SUNAT: LE + RUC + ejercicio + mes + codigos de libro.
      const ruc = contextoLibro?.ruc || '00000000000';
      const mes = String(periodoConfig.mes).padStart(2, '0');
      pleApiUnified.descargarArchivo(
        blob,
        `LE${ruc}${periodoConfig.ejercicio}${mes}050100001.zip`
      );

      setEstado('success');
      setTimeout(() => onClose?.(), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Error al descargar PLE';
      setError(msg);
      setEstado('error');
      onError?.(msg);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const enProceso =
    estado === 'validating' || estado === 'generating' || estado === 'downloading' ||
    estado === 'loading-context';

  const valido = Boolean(validacionResult?.valido);

  return (
    <Modal
      isOpen
      onClose={() => onClose?.()}
      title="Exportar a PLE · SUNAT"
      description={`${libro.descripcion} · RUC ${libro.ruc ?? '—'} · Período ${libro.periodo}`}
      footer={
        <>
          <button
            type="button"
            onClick={() => validarDatosParaPLE()}
            disabled={estado !== 'idle'}
            title="Volver a validar los datos del libro"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Re-validar
          </button>

          <button
            type="button"
            onClick={exportarPLE}
            disabled={estado !== 'idle' || !valido}
            title={valido ? 'Generar archivo PLE' : 'Corrige los errores antes de generar'}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {estado === 'generating' ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="size-4" aria-hidden="true" />
            )}
            Generar PLE
          </button>

          <button
            type="button"
            onClick={descargarPLEDirecto}
            disabled={estado !== 'idle'}
            title="Descargar el archivo ZIP del PLE"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {estado === 'downloading' ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            Descargar ZIP
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Estado del proceso */}
        <p
          role="status"
          className={cn(
            'flex items-center gap-2 text-sm font-medium',
            estado === 'success'
              ? 'text-green-700'
              : estado === 'error'
                ? 'text-red-700'
                : 'text-slate-600'
          )}
        >
          {enProceso ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : estado === 'success' ? (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          ) : estado === 'error' ? (
            <AlertCircle className="size-4" aria-hidden="true" />
          ) : null}
          {ESTADO_TEXTO[estado]}
        </p>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Período PLE */}
        <fieldset className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-900">Período PLE</legend>

          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ple-anio" className="mb-1.5 block text-xs font-medium text-slate-500">
                Año
              </label>
              <select
                id="ple-anio"
                value={periodoConfig.ejercicio}
                onChange={(e) => {
                  const ejercicio = parseInt(e.target.value, 10);
                  setPeriodoConfig((prev) => ({
                    ...prev,
                    ejercicio,
                    descripcion: `${ejercicio}-${String(prev.mes).padStart(2, '0')}`,
                  }));
                }}
                className={selectClass}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(
                  (año) => (
                    <option key={año} value={año}>
                      {año}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label htmlFor="ple-mes" className="mb-1.5 block text-xs font-medium text-slate-500">
                Mes
              </label>
              <select
                id="ple-mes"
                value={periodoConfig.mes}
                onChange={(e) => {
                  const mes = parseInt(e.target.value, 10);
                  setPeriodoConfig((prev) => ({
                    ...prev,
                    mes,
                    descripcion: `${prev.ejercicio}-${String(mes).padStart(2, '0')}`,
                  }));
                }}
                className={selectClass}
              >
                {MESES.map((nombre, i) => (
                  <option key={nombre} value={i + 1}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Resultado de la validación */}
        {validacionResult && (
          <div
            className={cn(
              'rounded-lg border px-4 py-3',
              valido
                ? 'border-green-200 bg-green-50'
                : erroresCriticos > 0
                  ? 'border-red-200 bg-red-50'
                  : 'border-amber-200 bg-amber-50'
            )}
          >
            <p
              className={cn(
                'mb-2 flex items-center gap-2 text-sm font-semibold',
                valido
                  ? 'text-green-800'
                  : erroresCriticos > 0
                    ? 'text-red-800'
                    : 'text-amber-800'
              )}
            >
              {valido ? (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              ) : erroresCriticos > 0 ? (
                <AlertCircle className="size-4" aria-hidden="true" />
              ) : (
                <TriangleAlert className="size-4" aria-hidden="true" />
              )}
              {valido
                ? 'Libro listo para exportar'
                : erroresCriticos > 0
                  ? 'Errores críticos encontrados'
                  : 'Advertencias encontradas'}
            </p>

            <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-700">
              <div className="flex gap-1.5">
                <dt className="text-slate-500">Asientos:</dt>
                <dd className="font-semibold tabular-nums">
                  {validacionResult.validacion_basica?.total_asientos || 0}
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-slate-500">Balance:</dt>
                <dd
                  className={cn(
                    'font-semibold',
                    validacionResult.validacion_basica?.balanceado
                      ? 'text-green-700'
                      : 'text-red-700'
                  )}
                >
                  {validacionResult.validacion_basica?.balanceado
                    ? 'Balanceado'
                    : 'Desbalanceado'}
                </dd>
              </div>
              {totalErrores > 0 && (
                <div className="flex gap-1.5">
                  <dt className="text-slate-500">Errores:</dt>
                  <dd className="font-semibold text-red-700 tabular-nums">
                    {totalErrores}
                    {erroresCriticos > 0 && ` (${erroresCriticos} críticos)`}
                  </dd>
                </div>
              )}
              {totalWarnings > 0 && (
                <div className="flex gap-1.5">
                  <dt className="text-slate-500">Advertencias:</dt>
                  <dd className="font-semibold text-amber-700 tabular-nums">{totalWarnings}</dd>
                </div>
              )}
            </dl>

            {(totalErrores > 0 || totalWarnings > 0) && (
              <button
                type="button"
                onClick={() => setMostrarOpciones((v) => !v)}
                aria-expanded={mostrarOpciones}
                className="mt-2 rounded border-0 bg-transparent p-0 text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
              >
                {mostrarOpciones ? 'Ocultar detalle' : 'Ver detalle'}
              </button>
            )}
          </div>
        )}

        {/* Detalle de errores */}
        {validacionResult && mostrarOpciones && (
          <div className="space-y-3">
            {todosLosErrores.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-red-800 uppercase">
                  Errores
                </p>
                <ul className="list-disc space-y-0.5 pl-5 text-sm text-red-700">
                  {todosLosErrores.slice(0, 5).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                  {todosLosErrores.length > 5 && (
                    <li className="text-red-600 italic">
                      …y {todosLosErrores.length - 5} errores más
                    </li>
                  )}
                </ul>
              </div>
            )}

            {todasLasAdvertencias.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-amber-800 uppercase">
                  Advertencias
                </p>
                <ul className="list-disc space-y-0.5 pl-5 text-sm text-amber-700">
                  {todasLasAdvertencias.slice(0, 3).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                  {todasLasAdvertencias.length > 3 && (
                    <li className="text-amber-600 italic">
                      …y {todasLasAdvertencias.length - 3} advertencias más
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PLEExportManager;
