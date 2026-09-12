/**
 * Compras de SIRE a contabilidad.
 * URL: /contabilidad/compras-sire
 *
 * Dos pasos deliberadamente separados: importar crea los registros de compra y
 * contabilizar genera el asiento del libro diario. Cada uno se previsualiza
 * antes de escribir, y la contabilizacion se agrupa en lotes reversibles.
 *
 * **Se diferencia de la pantalla de ventas en una cosa.** Alli la consulta a
 * SUNAT es instantanea y se lanza sola al entrar. Aqui no: RCE obliga a pedir
 * la propuesta, esperar un ticket y descargar un archivo, asi que puede tardar
 * minutos. Lanzarla sola al abrir la pantalla dejaria al usuario esperando algo
 * que quiza no queria. Por eso hay un boton y se avisa de la espera.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  RefreshCw,
  Undo2,
} from 'lucide-react';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import PeriodoSelector, {
  periodoActual,
  periodoToString,
  type Periodo,
} from '../../../components/common/PeriodoSelector';
import {
  comprasSireApi,
  type Lote,
  type PrevisualizacionContabilizacionCompras,
  type PrevisualizacionImportacionCompras,
} from '../../../services/comprasSireApi';
import { cn } from '../../../lib/cn';

const soles = (v: number) =>
  `S/ ${(v ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

/** Lee el periodo que llega en la URL (`?periodo=202607`). */
const periodoDeLaUrl = (valor: string | null): Periodo | null => {
  if (!valor || !/^\d{6}$/.test(valor)) return null;
  const mes = valor.slice(4);
  if (Number(mes) < 1 || Number(mes) > 12) return null;
  return { año: valor.slice(0, 4), mes };
};

const ImportarSireComprasPage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();
  const [params] = useSearchParams();
  const [periodo, setPeriodo] = useState<Periodo>(
    () => periodoDeLaUrl(params.get('periodo')) ?? periodoActual()
  );

  const [impPrev, setImpPrev] = useState<PrevisualizacionImportacionCompras | null>(null);
  const [conPrev, setConPrev] = useState<PrevisualizacionContabilizacionCompras | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);

  const [consultando, setConsultando] = useState(false);
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const ruc = empresaActual?.ruc;
  const per = periodoToString(periodo);

  /**
   * Lo que se puede cargar sin molestar a SUNAT: la contabilizacion mira solo
   * lo que ya esta importado en la base.
   */
  const cargarLocal = useCallback(async () => {
    if (!ruc) return;
    try {
      const [con, lot] = await Promise.all([
        comprasSireApi.previsualizarContabilizacion(ruc, per),
        comprasSireApi.lotes(ruc, per),
      ]);
      setConPrev(con);
      setLotes(lot);
    } catch (e: any) {
      setError(e.message);
    }
  }, [ruc, per]);

  useEffect(() => {
    // Al cambiar de periodo, lo consultado antes ya no vale.
    setImpPrev(null);
    cargarLocal();
  }, [cargarLocal]);

  /** Esta es la que tarda: descarga la propuesta de SUNAT. */
  const consultarSunat = async () => {
    if (!ruc) return;
    setConsultando(true);
    setError(null);
    setAviso(null);
    try {
      setImpPrev(await comprasSireApi.previsualizarImportacion(ruc, per));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setConsultando(false);
    }
  };

  const ejecutar = async (id: string, confirmacion: string, accion: () => Promise<string>) => {
    if (!window.confirm(confirmacion)) return;
    setTrabajando(id);
    setError(null);
    setAviso(null);
    try {
      setAviso(await accion());
      await cargarLocal();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTrabajando(null);
    }
  };

  const importar = () =>
    ejecutar(
      'importar',
      `Importar las compras del periodo ${per} desde SUNAT.\n\n` +
        `Se crearian ${impPrev?.nuevos ?? 0} registros y se actualizarian ` +
        `${impPrev?.actualizables ?? 0}.\n\n` +
        'Vuelve a descargar la propuesta, asi que tarda. No toca el libro diario.\n\n' +
        'Continuar?',
      async () => (await comprasSireApi.importar(ruc!, per)).mensaje
    );

  const contabilizar = () =>
    ejecutar(
      'contabilizar',
      `Contabilizar ${conPrev?.contabilizables ?? 0} comprobantes del periodo ${per}.\n\n` +
        'ESTO ESCRIBE EN EL LIBRO DIARIO. El lote se puede deshacer despues.\n\n' +
        'Continuar?',
      async () => (await comprasSireApi.contabilizar(ruc!, per)).mensaje
    );

  const deshacer = (lote: string) =>
    ejecutar(
      `deshacer-${lote}`,
      `Deshacer el lote ${lote}.\n\n` +
        'Se borraran sus asientos del libro diario y sus compras quedaran otra vez ' +
        'pendientes de contabilizar.\n\nContinuar?',
      () => comprasSireApi.deshacerLote(ruc!, lote)
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
              Importar de SUNAT al registro de compras
            </h2>
            <p className="text-sm text-slate-500">
              No toca el libro diario. Reimportar actualiza, no duplica.
            </p>
          </div>
        </header>

        <div className="p-5 sm:p-6">
          {consultando ? (
            <div className="rounded-md border border-violet-200 bg-violet-50 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-violet-900">
                <Loader2 className="size-4 animate-spin" />
                Descargando la propuesta de SUNAT…
              </p>
              <p className="mt-1 text-sm text-violet-800">
                SUNAT no entrega las compras al momento: genera el archivo y lo avisa con
                un ticket. Puede tardar varios minutos. No cierres la pagina.
              </p>
            </div>
          ) : !impPrev ? (
            /* Estado inicial: nada se consulta hasta que el usuario lo pide. */
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-sm text-slate-600">
                <Clock className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <span>
                  Consultar las compras del periodo {per} descarga la propuesta de SUNAT,
                  que <strong>puede tardar varios minutos</strong>. Por eso no se lanza
                  sola al abrir la pantalla.
                </span>
              </p>
              <button
                type="button"
                onClick={consultarSunat}
                className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <RefreshCw className="size-4" />
                Consultar SUNAT
              </button>
            </div>
          ) : (
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
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    IGV credito fiscal
                  </p>
                  <p className="text-xl font-semibold tabular-nums text-slate-900">
                    {soles(impPrev.igv_total)}
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
                  <p className="mt-1.5 text-xs text-slate-500">
                    La cuenta de gasto (60 o 63) se configura en cada subdiario desde
                    Configuracion. Sin ella el comprobante no se puede contabilizar.
                  </p>
                </div>
              )}

              {impPrev.capturados_a_mano > 0 && (
                <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  {impPrev.capturados_a_mano} comprobantes existen y fueron capturados a
                  mano: no se tocan.
                </p>
              )}

              {impPrev.bloqueados_por_contabilizados > 0 && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-medium">
                    {impPrev.bloqueados_por_contabilizados} comprobantes ya estan
                    contabilizados y en SUNAT cambiaron de importe.
                  </p>
                  <p className="mt-1">
                    No se actualizan: el asiento del libro diario dejaria de corresponder
                    con la compra. Deshaz su lote en el paso 2 y vuelve a importar.
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

              <div className="flex flex-wrap gap-2">
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

                <button
                  type="button"
                  onClick={consultarSunat}
                  disabled={trabajando !== null}
                  className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw className="size-4" />
                  Volver a consultar
                </button>
              </div>
            </div>
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
              Deshacer borra sus asientos y deja las compras otra vez pendientes.
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

export default ImportarSireComprasPage;
