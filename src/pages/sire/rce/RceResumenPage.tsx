/**
 * Resumen RCE: gestión local, consulta a SUNAT y reportes del período.
 * URL: /sire/rce/resumen
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Cloud,
  Database,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import { useRceData } from '../../../contexts/RceDataContext';
import { rceDataService } from '../../../services/rceDataService';
import { rceComprobantesService } from '../../../services/rceComprobantesService';
import RceComprobantesTable from '../../../components/sire/rce/RceComprobantesTable';
import PeriodoSelector, {
  periodoActual,
  periodoToString,
  type Periodo,
} from '../../../components/common/PeriodoSelector';
import EmptyState from '../../../components/common/EmptyState';
import { cn } from '../../../lib/cn';
import type { RceComprobantesDetalladosResponse } from '../../../types/rce';

interface ResumenData {
  totalRegistros: number;
  resumenPeriodo: any;
  archivosDisponibles: any[];
}

type VistaActiva = 'base_datos' | 'detallado' | 'resumen';

const VISTAS: { id: VistaActiva; label: string; icon: typeof Database }[] = [
  { id: 'base_datos', label: 'Gestión local', icon: Database },
  { id: 'detallado', label: 'Consultar SUNAT', icon: Cloud },
  { id: 'resumen', label: 'Reportes', icon: BarChart3 },
];

/** Importes en soles, con separador de miles y dos decimales. */
const soles = (n: number): string =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Cabeceras de SUNAT abreviadas para que la tabla quepa. */
const HEADERS_LEGIBLES: Record<string, string> = {
  'Tipo de Documento': 'Tipo Doc.',
  'Total Documentos': 'Cant.',
  'BI Gravado DG': 'BI Gravado',
  'IGV / IPM DG': 'IGV',
  'BI Gravado DGNG': 'BI Grav. DGNG',
  'IGV / IPM DGNG': 'IGV DGNG',
  'BI Gravado DNG': 'BI Grav. DNG',
  'IGV / IPM DNG': 'IGV DNG',
  'Valor Adq. NG': 'Valor No Grav.',
  ISC: 'ISC',
  ICBPER: 'ICBPER',
  'Otros Trib/ Cargos': 'Otros Tributos',
  'Total CP': 'Total',
};

const thBase =
  'whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-white first:text-left';
const tdBase = 'whitespace-nowrap px-3 py-2.5 text-xs text-slate-700';

const RceResumenPage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();
  const {
    setComprobantesDetallados: setComprobantesEnCache,
    setRucActual,
    setPeriodoActual,
    setUltimaConsultaSunat,
  } = useRceData();

  const [resumenData, setResumenData] = useState<ResumenData | null>(null);
  const [comprobantesDetallados, setComprobantesDetallados] =
    useState<RceComprobantesDetalladosResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetallados, setLoadingDetallados] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('base_datos');

  // Antes el periodo arrancaba cableado en 2025/07, asi que la pantalla abria
  // siempre en julio de 2025 en vez del mes en curso.
  const [periodo, setPeriodo] = useState<Periodo>(periodoActual);
  const [selectedOpcion, setSelectedOpcion] = useState('1');

  const selectedPeriod = periodoToString(periodo);
  const ruc = empresaActual?.ruc;

  const consultarResumen = useCallback(async () => {
    if (!ruc) return;

    setLoading(true);
    setError(null);

    try {
      const response = await rceDataService.obtenerResumen(ruc, selectedPeriod);

      if (response.exitoso) {
        setResumenData({
          totalRegistros: response.datos?.total_documentos || 0,
          resumenPeriodo: {
            ...response.datos,
            contenido_completo: response.contenido_completo,
            periodo: response.periodo,
          },
          archivosDisponibles: [],
        });
      } else {
        setError('No se encontraron datos de resumen para el período seleccionado');
        setResumenData(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error consultando resumen');
      setResumenData(null);
    } finally {
      setLoading(false);
    }
  }, [ruc, selectedPeriod]);

  const consultarComprobantesDetallados = useCallback(async () => {
    if (!ruc) return;

    setLoadingDetallados(true);
    setError(null);

    try {
      const response = await rceDataService.obtenerComprobantesDetallados(ruc, selectedPeriod);

      if (!response.exitoso) {
        setError('No se encontraron comprobantes detallados para el período seleccionado');
        setComprobantesDetallados(null);
        return;
      }

      setComprobantesDetallados(response);

      if (response.comprobantes && response.comprobantes.length > 0) {
        setComprobantesEnCache(response.comprobantes as any);
        setRucActual(ruc);
        setPeriodoActual(selectedPeriod);
        setUltimaConsultaSunat(new Date());

        // Auto-guardado en la base de datos local. Si falla no se interrumpe
        // al usuario: los datos ya estan en pantalla.
        try {
          const resultadoBD = await rceComprobantesService.guardarDesdeSupat(ruc, selectedPeriod, {
            comprobantes: response.comprobantes,
          });

          if (resultadoBD.exitoso) {
            window.dispatchEvent(new CustomEvent('rce-data-updated'));
          }
        } catch (errorBD) {
          console.warn('Error en el auto-guardado local (no crítico):', errorBD);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error consultando comprobantes detallados');
      setComprobantesDetallados(null);
    } finally {
      setLoadingDetallados(false);
    }
  }, [
    ruc,
    selectedPeriod,
    setComprobantesEnCache,
    setRucActual,
    setPeriodoActual,
    setUltimaConsultaSunat,
  ]);

  useEffect(() => {
    void consultarResumen();
  }, [consultarResumen, selectedOpcion]);

  const irADetallado = () => {
    setVistaActiva('detallado');
    if (!comprobantesDetallados && !loadingDetallados) {
      void consultarComprobantesDetallados();
    }
  };

  // RequireEmpresa garantiza que hay empresa: esta guarda solo estrecha el tipo.
  if (!empresaActual) return null;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Periodo y opciones                                                 */}
      {/* ------------------------------------------------------------------ */}
      <PeriodoSelector value={periodo} onChange={setPeriodo} disabled={loading}>
        <div className="flex items-center gap-2">
          <label htmlFor="rce-opcion" className="text-sm font-medium text-slate-600">
            Opción
          </label>
          <select
            id="rce-opcion"
            value={selectedOpcion}
            onChange={(e) => setSelectedOpcion(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="1">Resumen general</option>
            <option value="2">Detalle completo</option>
            <option value="3">Solo errores</option>
          </select>
        </div>

        <button
          type="button"
          onClick={consultarResumen}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="size-4" aria-hidden="true" />
          )}
          {loading ? 'Consultando…' : 'Consultar'}
        </button>
      </PeriodoSelector>

      {/* ------------------------------------------------------------------ */}
      {/* Vistas                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div role="tablist" className="flex border-b border-slate-200">
          {VISTAS.map(({ id, label, icon: Icon }) => {
            const isActive = vistaActiva === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => (id === 'detallado' ? irADetallado() : setVistaActiva(id))}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 border-0 border-b-2 bg-transparent px-4 py-3.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-6">
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
            >
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* Gestion local                                              */}
          {/* ---------------------------------------------------------- */}
          {vistaActiva === 'base_datos' && (
            <RceComprobantesTable
              ruc={empresaActual.ruc}
              periodo={selectedPeriod}
              onDataChange={() => {}}
              onConsultarSunat={irADetallado}
            />
          )}

          {/* ---------------------------------------------------------- */}
          {/* Consulta directa a SUNAT                                   */}
          {/* ---------------------------------------------------------- */}
          {vistaActiva === 'detallado' && (
            <div className="space-y-5">
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3">
                <p className="mb-0.5 text-sm font-semibold text-cyan-900">Consulta directa a SUNAT</p>
                <p className="text-sm text-cyan-800">
                  Obtiene los comprobantes más recientes desde SUNAT. Los datos se guardan
                  automáticamente en tu base de datos local para futuras consultas.
                </p>
              </div>

              {loadingDetallados && (
                <div className="space-y-2" aria-busy="true">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              )}

              {!loadingDetallados && !comprobantesDetallados && (
                <EmptyState
                  icon={Cloud}
                  title="Sin datos descargados"
                  description={`Consulta a SUNAT los comprobantes del período ${selectedPeriod}.`}
                >
                  <button
                    type="button"
                    onClick={consultarComprobantesDetallados}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Cloud className="size-4" aria-hidden="true" />
                    Cargar datos
                  </button>
                </EmptyState>
              )}

              {!loadingDetallados && comprobantesDetallados?.exitoso === false && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                >
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
                  <p className="text-sm font-medium text-red-800">
                    {comprobantesDetallados.mensaje}
                  </p>
                </div>
              )}

              {!loadingDetallados && comprobantesDetallados?.exitoso && (
                <>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full border-collapse">
                      <thead className="bg-blue-800">
                        <tr>
                          <th className={thBase}>RUC proveedor</th>
                          <th className={thBase}>Razón social</th>
                          <th className={thBase}>Tipo doc.</th>
                          <th className={thBase}>Serie</th>
                          <th className={thBase}>Número</th>
                          <th className={thBase}>Emisión</th>
                          <th className={cn(thBase, 'text-right')}>Base imponible</th>
                          <th className={cn(thBase, 'text-right')}>IGV</th>
                          <th className={cn(thBase, 'text-right')}>No gravado</th>
                          <th className={cn(thBase, 'text-right')}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comprobantesDetallados.comprobantes.map((c, index) => (
                          <tr
                            key={index}
                            className="border-b border-slate-100 last:border-0 odd:bg-slate-50/60 hover:bg-blue-50"
                          >
                            <td className={cn(tdBase, 'font-mono')}>{c.ruc_proveedor}</td>
                            <td className={cn(tdBase, 'max-w-55 truncate whitespace-normal')}>
                              {c.razon_social_proveedor}
                            </td>
                            <td className={cn(tdBase, 'text-center')}>{c.tipo_documento}</td>
                            <td className={cn(tdBase, 'text-center')}>{c.serie_comprobante}</td>
                            <td className={cn(tdBase, 'text-center')}>{c.numero_comprobante}</td>
                            <td className={cn(tdBase, 'text-center tabular-nums')}>
                              {c.fecha_emision}
                            </td>
                            <td className={cn(tdBase, 'text-right tabular-nums')}>
                              {soles(c.base_imponible_gravada)}
                            </td>
                            <td className={cn(tdBase, 'text-right tabular-nums')}>{soles(c.igv)}</td>
                            <td className={cn(tdBase, 'text-right tabular-nums')}>
                              {soles(c.valor_adquisicion_no_gravada)}
                            </td>
                            <td className={cn(tdBase, 'text-right font-semibold tabular-nums')}>
                              {soles(c.importe_total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {comprobantesDetallados.totales && (
                    <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                          Base imponible
                        </p>
                        <p className="text-lg font-bold text-emerald-600 tabular-nums">
                          {soles(comprobantesDetallados.totales.total_base_imponible)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                          IGV
                        </p>
                        <p className="text-lg font-bold text-red-600 tabular-nums">
                          {soles(comprobantesDetallados.totales.total_igv)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                          Total
                        </p>
                        <p className="text-lg font-bold text-slate-900 tabular-nums">
                          {soles(comprobantesDetallados.totales.total_general)}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* Reportes                                                   */}
          {/* ---------------------------------------------------------- */}
          {vistaActiva === 'resumen' && (
            <div className="space-y-5">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="mb-0.5 text-sm font-semibold text-amber-900">
                  Reportes y estadísticas
                </p>
                <p className="text-sm text-amber-800">
                  Resúmenes consolidados de tus comprobantes, para análisis de período e informes.
                </p>
              </div>

              {loading && (
                <div className="space-y-2" aria-busy="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              )}

              {!loading && !resumenData && !error && (
                <EmptyState
                  icon={BarChart3}
                  title="No hay datos de resumen"
                  description={`No se encontraron datos para el período ${selectedPeriod}.`}
                />
              )}

              {!loading && resumenData && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: 'Registros', value: String(resumenData.totalRegistros), tone: 'bg-green-50 text-green-700' },
                      { label: 'Archivos', value: String(resumenData.archivosDisponibles.length), tone: 'bg-amber-50 text-amber-700' },
                      { label: 'Período', value: selectedPeriod, tone: 'bg-blue-50 text-blue-700' },
                      {
                        label: 'Total CP',
                        value: resumenData.resumenPeriodo?.total_cp
                          ? `S/ ${resumenData.resumenPeriodo.total_cp}`
                          : '—',
                        tone: 'bg-sky-50 text-sky-700',
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className={cn('rounded-lg px-4 py-3 text-center', stat.tone)}
                      >
                        <p className="text-lg font-bold tabular-nums">{stat.value}</p>
                        <p className="text-xs font-medium tracking-wide uppercase opacity-80">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {resumenData.resumenPeriodo?.contenido_completo && (
                    <ResumenPorTipoDocumento
                      contenido={resumenData.resumenPeriodo.contenido_completo}
                      periodo={resumenData.resumenPeriodo.periodo}
                    />
                  )}

                  {resumenData.archivosDisponibles.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-slate-900">
                        Archivos disponibles
                      </h3>
                      <ul className="grid gap-2">
                        {resumenData.archivosDisponibles.map((archivo: any, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <FileText
                              className="mt-0.5 size-4 shrink-0 text-slate-400"
                              aria-hidden="true"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800">
                                {archivo.nombre || `Archivo ${index + 1}`}
                              </p>
                              {archivo.descripcion && (
                                <p className="text-sm text-slate-500">{archivo.descripcion}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/**
 * SUNAT devuelve el resumen como texto plano con columnas separadas por "|".
 * Se parsea a tabla, descartando la fila de TOTAL.
 */
const ResumenPorTipoDocumento: React.FC<{ contenido: string; periodo?: string }> = ({
  contenido,
  periodo,
}) => {
  const lineas = contenido.split('\n').filter((l) => l.trim() !== '');
  if (lineas.length === 0) return null;

  const headers = lineas[0].split('|').map((h) => h.trim());
  const headersLegibles = headers.map((h) => HEADERS_LEGIBLES[h] || h);

  const filas = lineas
    .slice(1)
    .map((linea) => linea.split('|').map((celda) => celda.trim()))
    .filter((fila) => !fila[0] || !fila[0].toUpperCase().includes('TOTAL'));

  if (filas.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900">
        Resumen por tipo de documento
      </h3>

      <p className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm text-cyan-900">
        Se encontraron <strong className="tabular-nums">{filas.length}</strong> comprobante(s)
        {periodo ? ` para el período ${periodo}` : ''}.
      </p>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse">
          <thead className="bg-blue-800">
            <tr>
              {headersLegibles.map((header, i) => (
                <th key={i} className={cn(thBase, i > 0 && 'text-center')}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-slate-100 last:border-0 odd:bg-slate-50/60 hover:bg-blue-50"
              >
                {fila.map((celda, cellIndex) => {
                  // La primera columna es texto y la segunda un contador; el
                  // resto son importes.
                  const esImporte = cellIndex > 1 && !isNaN(parseFloat(celda));
                  return (
                    <td
                      key={cellIndex}
                      className={cn(tdBase, cellIndex > 0 && 'text-right tabular-nums')}
                    >
                      {esImporte ? soles(parseFloat(celda)) : celda}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RceResumenPage;
