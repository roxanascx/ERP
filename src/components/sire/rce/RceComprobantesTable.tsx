/**
 * Comprobantes RCE guardados en la base de datos local.
 */

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BookPlus, Cloud, Database, Loader2, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  rceComprobantesService,
  type RceComprobanteBD,
} from '../../../services/rceComprobantesService';
import EmptyState from '../../common/EmptyState';
import { cn } from '../../../lib/cn';

interface Props {
  ruc: string;
  periodo?: string;
  onDataChange?: () => void;
  onConsultarSunat?: () => void;
}

const soles = (n: number): string =>
  `S/ ${(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * SUNAT devuelve las fechas en varios formatos. Se intenta ISO y, si falla,
 * DD/MM/YYYY antes de darla por invalida.
 */
const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr === 'Invalid Date' || !dateStr.trim()) return 'Fecha no válida';

  const fecha = new Date(dateStr);
  if (!isNaN(fecha.getTime())) return fecha.toLocaleDateString('es-PE');

  if (dateStr.includes('/')) {
    const [d, m, a] = dateStr.split('/');
    if (d && m && a) {
      const alternativa = new Date(`${a}-${m}-${d}`);
      if (!isNaN(alternativa.getTime())) return alternativa.toLocaleDateString('es-PE');
    }
  }

  return 'Fecha no válida';
};

const th = 'px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-white uppercase';
const td = 'px-3 py-2.5 text-sm whitespace-nowrap text-slate-700';

function RceComprobantesTable({ ruc, periodo, onConsultarSunat }: Props) {
  const navigate = useNavigate();
  const [comprobantes, setComprobantes] = useState<RceComprobanteBD[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [sinDatos, setSinDatos] = useState(false);

  const loadComprobantes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await rceComprobantesService.consultarComprobantes(ruc, {
        periodo,
        por_pagina: 2000,
      });
      setComprobantes(response.comprobantes || []);
      setSinDatos(response.comprobantes.length === 0);
    } catch (err: any) {
      setError(err.message || 'Error al cargar comprobantes');
    } finally {
      setLoading(false);
    }
  }, [ruc, periodo]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await rceComprobantesService.obtenerEstadisticas(ruc, periodo));
    } catch (err) {
      console.error('Error cargando estadísticas RCE:', err);
    }
  }, [ruc, periodo]);

  useEffect(() => {
    if (!ruc) return;

    void loadComprobantes();
    void loadStats();

    // La consulta a SUNAT guarda en la BD local y avisa por este evento.
    const handleDataUpdate = () => {
      void loadComprobantes();
      void loadStats();
    };

    window.addEventListener('rce-data-updated', handleDataUpdate);
    return () => window.removeEventListener('rce-data-updated', handleDataUpdate);
  }, [ruc, loadComprobantes, loadStats]);

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Database className="size-4 text-slate-400" aria-hidden="true" />
            Gestión local de comprobantes
          </h3>
          <p className="text-sm text-slate-500 tabular-nums">
            RUC {ruc}
            {periodo && ` · Período ${periodo}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Llevar estas compras a contabilidad. Se pasa el periodo elegido
              para no obligar a seleccionarlo otra vez. */}
          {periodo && (
            <button
              type="button"
              onClick={() => navigate(`/contabilidad/compras-sire?periodo=${periodo}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <BookPlus className="size-4" aria-hidden="true" />
              Registrar en contabilidad
            </button>
          )}

        {stats && (
          <dl className="flex gap-6">
            <div className="text-center">
              <dd className="text-base font-bold text-emerald-600 tabular-nums">
                {stats.total_comprobantes || 0}
              </dd>
              <dt className="text-xs text-slate-500">Total</dt>
            </div>
            <div className="text-center">
              <dd className="text-base font-bold text-slate-900 tabular-nums">
                {soles(stats.total_importe || 0)}
              </dd>
              <dt className="text-xs text-slate-500">Importe</dt>
            </div>
          </dl>
        )}
        </div>
      </div>

      {/* Avisos */}
      {!periodo && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Selecciona un período para acceder a todas las funcionalidades.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {loading && (
        <p className="flex items-center gap-2 text-sm text-slate-500" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Procesando…
        </p>
      )}

      {/* Contenido */}
      {comprobantes.length === 0 && !loading ? (
        <EmptyState
          icon={Database}
          title={sinDatos ? 'Base de datos lista para usar' : 'No hay comprobantes guardados'}
          description={
            sinDatos
              ? 'Aún no hay comprobantes guardados localmente. Consulta a SUNAT para descargarlos.'
              : 'No se encontraron comprobantes para el período seleccionado.'
          }
        >
          {onConsultarSunat && (
            <button
              type="button"
              onClick={onConsultarSunat}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Cloud className="size-4" aria-hidden="true" />
              Consultar SUNAT ahora
            </button>
          )}
        </EmptyState>
      ) : comprobantes.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-blue-800">
                <tr>
                  <th scope="col" className={cn(th, 'w-14 text-center')}>#</th>
                  <th scope="col" className={th}>RUC proveedor</th>
                  <th scope="col" className={th}>Razón social</th>
                  <th scope="col" className={cn(th, 'text-center')}>Tipo doc.</th>
                  <th scope="col" className={cn(th, 'text-center')}>Serie</th>
                  <th scope="col" className={cn(th, 'text-center')}>Número</th>
                  <th scope="col" className={cn(th, 'text-center')}>Emisión</th>
                  <th scope="col" className={cn(th, 'text-right')}>Base imponible</th>
                  <th scope="col" className={cn(th, 'text-right')}>IGV</th>
                  <th scope="col" className={cn(th, 'text-right')}>No gravado</th>
                  <th scope="col" className={cn(th, 'text-right')}>Total</th>
                </tr>
              </thead>

              <tbody>
                {comprobantes.map((comp, index) => (
                  <tr
                    key={`${comp.ruc_proveedor}-${comp.serie_comprobante}-${comp.numero_comprobante}-${index}`}
                    className="border-b border-slate-100 last:border-0 odd:bg-slate-50/60 hover:bg-blue-50"
                  >
                    <td className={cn(td, 'text-center text-slate-400 tabular-nums')}>
                      {index + 1}
                    </td>
                    <td className={cn(td, 'font-mono')}>{comp.ruc_proveedor}</td>
                    <td className={cn(td, 'max-w-64 truncate whitespace-normal')}>
                      {comp.razon_social_proveedor}
                    </td>
                    <td className={cn(td, 'text-center')}>{comp.tipo_documento}</td>
                    <td className={cn(td, 'text-center font-mono')}>{comp.serie_comprobante}</td>
                    <td className={cn(td, 'text-center font-mono')}>{comp.numero_comprobante}</td>
                    <td className={cn(td, 'text-center tabular-nums')}>
                      {formatDate(comp.fecha_emision)}
                    </td>
                    <td className={cn(td, 'text-right tabular-nums')}>
                      {soles(comp.base_imponible_gravada)}
                    </td>
                    <td className={cn(td, 'text-right tabular-nums')}>{soles(comp.igv)}</td>
                    <td className={cn(td, 'text-right tabular-nums')}>
                      {soles(comp.valor_adquisicion_no_gravada)}
                    </td>
                    <td className={cn(td, 'text-right font-semibold tabular-nums')}>
                      {soles(comp.importe_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default RceComprobantesTable;
