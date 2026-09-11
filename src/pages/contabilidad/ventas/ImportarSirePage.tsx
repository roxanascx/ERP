/**
 * Ventas de SIRE a contabilidad.
 * URL: /contabilidad/ventas-sire
 *
 * Dos pasos deliberadamente separados: importar crea los registros de venta y
 * contabilizar genera el asiento del libro diario. Cada uno se previsualiza
 * antes de escribir, y la contabilizacion se agrupa en lotes reversibles.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Loader2,
  Undo2,
} from 'lucide-react';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import PeriodoSelector, {
  periodoActual,
  periodoToString,
  type Periodo,
} from '../../../components/common/PeriodoSelector';
import {
  ventasSireApi,
  type Lote,
  type PrevisualizacionContabilizacion,
  type PrevisualizacionImportacion,
} from '../../../services/ventasSireApi';
import { cn } from '../../../lib/cn';

const soles = (v: number) =>
  `S/ ${(v ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

/**
 * Lee el periodo que llega en la URL (`?periodo=202607`).
 *
 * La pantalla de Ventas de SIRE enlaza aqui con el periodo que el usuario ya
 * tenia elegido; obligarle a seleccionarlo otra vez seria una molestia y una
 * fuente de errores.
 */
const periodoDeLaUrl = (valor: string | null): Periodo | null => {
  if (!valor || !/^\d{6}$/.test(valor)) return null;
  const mes = valor.slice(4);
  if (Number(mes) < 1 || Number(mes) > 12) return null;
  return { año: valor.slice(0, 4), mes };
};

const ImportarSirePage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();
  const [params] = useSearchParams();
  const [periodo, setPeriodo] = useState<Periodo>(
    () => periodoDeLaUrl(params.get('periodo')) ?? periodoActual()
  );

  const [impPrev, setImpPrev] = useState<PrevisualizacionImportacion | null>(null);
  const [conPrev, setConPrev] = useState<PrevisualizacionContabilizacion | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);

  const [cargando, setCargando] = useState(false);
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const ruc = empresaActual?.ruc;
  const per = periodoToString(periodo);

  const cargar = useCallback(async () => {
    if (!ruc) return;
    setCargando(true);
    setError(null);
    try {
      // La previsualizacion de importacion consulta SUNAT; la de
      // contabilizacion solo mira lo ya importado.
      const [imp, con, lot] = await Promise.all([
        ventasSireApi.previsualizarImportacion(ruc, per).catch((e) => {
          setError(e.message);
          return null;
        }),
        ventasSireApi.previsualizarContabilizacion(ruc, per),
        ventasSireApi.lotes(ruc, per),
      ]);
      setImpPrev(imp);
      setConPrev(con);
      setLotes(lot);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [ruc, per]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const ejecutar = async (id: string, confirmacion: string, accion: () => Promise<string>) => {
    if (!window.confirm(confirmacion)) return;
    setTrabajando(id);
    setError(null);
    setAviso(null);
    try {
      setAviso(await accion());
      await cargar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTrabajando(null);
    }
  };

  const importar = () =>
    ejecutar(
      'importar',
      `Importar las ventas del periodo ${per} desde SUNAT.\n\n` +
        `Se crearian ${impPrev?.nuevos ?? 0} registros y se actualizarian ` +
        `${impPrev?.actualizables ?? 0}.\n\n` +
        'No toca el libro diario. Continuar?',
      async () => (await ventasSireApi.importar(ruc!, per)).mensaje
    );

  const contabilizar = () =>
    ejecutar(
      'contabilizar',
      `Contabilizar ${conPrev?.contabilizables ?? 0} comprobantes del periodo ${per}.\n\n` +
        'ESTO ESCRIBE EN EL LIBRO DIARIO. El lote se puede deshacer despues.\n\n' +
        'Continuar?',
      async () => (await ventasSireApi.contabilizar(ruc!, per)).mensaje
    );

  const deshacer = (lote: string) =>
    ejecutar(
      `deshacer-${lote}`,
      `Deshacer el lote ${lote}.\n\n` +
        'Se borraran sus asientos del libro diario y sus ventas quedaran otra vez ' +
        'pendientes de contabilizar.\n\nContinuar?',
      () => ventasSireApi.deshacerLote(ruc!, lote)
    );

  if (!empresaActual) return null;

  return (
    <div className="space-y-6">
      <PeriodoSelector value={periodo} onChange={setPeriodo} />

      {error && (
        <p className="flex gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </p>
      )}
      {aviso && !error && (
        <p className="flex gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0" />
          {aviso}
        </p>
      )}

      {/* ================= PASO 1 ================= */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
            1
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Importar de SUNAT al registro de ventas
            </h2>
            <p className="text-sm text-slate-500">
              No toca el libro diario. Reimportar actualiza, no duplica.
            </p>
          </div>
        </header>

        <div className="p-5 sm:p-6">
          {cargando && !impPrev ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" /> Consultando SUNAT…
            </p>
          ) : impPrev ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {[
                  ['En SUNAT', impPrev.total_sunat],
                  ['Se crearian', impPrev.nuevos],
                  ['Se actualizarian', impPrev.actualizables],
                  ['Capturados a mano', impPrev.capturados_a_mano],
                ].map(([etiqueta, valor]) => (
                  <div key={etiqueta as string}>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{etiqueta}</p>
                    <p className="text-xl font-semibold tabular-nums text-slate-900">{valor}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Importe</p>
                  <p className="text-xl font-semibold tabular-nums text-slate-900">
                    {soles(impPrev.importe_total)}
                  </p>
                </div>
              </div>

              {impPrev.por_subdiario.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Reparto por subdiario</p>
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {impPrev.por_subdiario.map((s) => (
                      <li
                        key={s.codigo}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                      >
                        <span className="text-slate-700">
                          <span className="font-mono text-slate-500">{s.codigo}</span> {s.nombre}
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="tabular-nums text-slate-500">
                            {s.comprobantes} · {soles(s.importe)}
                          </span>
                          {!s.listo && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                              Faltan cuentas
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {impPrev.capturados_a_mano > 0 && (
                <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  {impPrev.capturados_a_mano} comprobantes existen y fueron capturados a mano:
                  no se tocan.
                </p>
              )}

              {impPrev.bloqueados_por_contabilizados > 0 && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-medium">
                    {impPrev.bloqueados_por_contabilizados} comprobantes ya estan
                    contabilizados y en SUNAT cambiaron de importe.
                  </p>
                  <p className="mt-1">
                    No se actualizan: el asiento del libro diario dejaria de
                    corresponder con la venta. Deshaz su lote en el paso 2 y vuelve a
                    importar.
                  </p>
                  <ul className="mt-2 space-y-0.5 font-mono text-xs">
                    {impPrev.detalle_contabilizados.map((c) => (
                      <li key={c.comprobante}>
                        {c.comprobante} <span className="text-amber-700">lote {c.lote}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={importar}
                disabled={trabajando !== null || impPrev.total_sunat === 0}
                className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {trabajando === 'importar' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Importar {impPrev.total_sunat} comprobantes
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No se pudo consultar SUNAT para este periodo.
            </p>
          )}
        </div>
      </section>

      {/* ================= PASO 2 ================= */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
            2
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Contabilizar al libro diario
            </h2>
            <p className="text-sm text-slate-500">
              Un asiento por comprobante, en un lote que se puede deshacer.
            </p>
          </div>
        </header>

        <div className="p-5 sm:p-6">
          {conPrev ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {[
                  ['Pendientes', conPrev.pendientes],
                  ['Se contabilizarian', conPrev.contabilizables],
                  ['Se apartarian', conPrev.apartados],
                ].map(([etiqueta, valor]) => (
                  <div key={etiqueta as string}>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{etiqueta}</p>
                    <p className="text-xl font-semibold tabular-nums text-slate-900">{valor}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Total al Debe</p>
                  <p className="text-xl font-semibold tabular-nums text-slate-900">
                    {soles(conPrev.total_debe)}
                  </p>
                </div>
              </div>

              {/* Qué se queda fuera y por qué */}
              {conPrev.detalle_apartados.length > 0 && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                    <AlertTriangle className="size-4" />
                    Estos no se contabilizan
                  </p>
                  <ul className="mt-1.5 space-y-0.5 text-sm text-amber-900">
                    {conPrev.detalle_apartados.slice(0, 8).map((a) => (
                      <li key={a.comprobante}>
                        <span className="font-mono">{a.comprobante}</span> — {a.motivo}
                      </li>
                    ))}
                    {conPrev.detalle_apartados.length > 8 && (
                      <li>y {conPrev.detalle_apartados.length - 8} mas…</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Cómo quedaria el asiento */}
              {conPrev.muestra.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    Asi quedaria el primer asiento
                  </p>
                  <table className="w-full max-w-lg text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                        <th className="py-1.5 font-semibold">Cuenta</th>
                        <th className="py-1.5 text-right font-semibold">Debe</th>
                        <th className="py-1.5 text-right font-semibold">Haber</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {conPrev.muestra[0].lineas.map((l, i) => (
                        <tr key={`${l.codigo}-${i}`}>
                          <td className="py-1.5 font-mono text-slate-700">{l.codigo}</td>
                          <td className="py-1.5 text-right tabular-nums text-slate-700">
                            {l.debe ? soles(l.debe) : ''}
                          </td>
                          <td className="py-1.5 text-right tabular-nums text-slate-700">
                            {l.haber ? soles(l.haber) : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-1 text-xs text-slate-500">
                    Comprobante {conPrev.muestra[0].comprobante}, subdiario{' '}
                    {conPrev.muestra[0].subdiario}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={contabilizar}
                disabled={trabajando !== null || conPrev.contabilizables === 0}
                className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {trabajando === 'contabilizar' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
                Contabilizar {conPrev.contabilizables} comprobantes
              </button>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" /> Cargando…
            </p>
          )}
        </div>
      </section>

      {/* ================= LOTES ================= */}
      {lotes.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-slate-900">Lotes contabilizados</h2>
            <p className="text-sm text-slate-500">
              Deshacer borra sus asientos y deja las ventas otra vez pendientes.
            </p>
          </header>

          <ul className="divide-y divide-slate-100">
            {lotes.map((l) => (
              <li
                key={l.lote}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6"
              >
                <div>
                  <p className="font-mono text-sm text-slate-800">{l.lote}</p>
                  <p className="text-xs text-slate-500">
                    {l.comprobantes} comprobantes · {soles(l.importe)}
                    {l.fecha ? ` · ${new Date(l.fecha).toLocaleString('es-PE')}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deshacer(l.lote)}
                  disabled={trabajando !== null}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5',
                    'text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50'
                  )}
                >
                  {trabajando === `deshacer-${l.lote}` ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Undo2 className="size-3.5" />
                  )}
                  Deshacer
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ImportarSirePage;
