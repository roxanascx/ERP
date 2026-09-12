/**
 * Configuracion del sistema.
 * URL: /configuracion
 *
 * La ruta estaba en el menu pero no existia: caia en el 404. Arranca con el
 * mantenimiento de subdiarios, que es lo que hace falta para poder contabilizar
 * automaticamente las ventas que llegan de SIRE.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Pencil, Plus, RotateCcw } from 'lucide-react';
import { useEmpresaValidation } from '../hooks/useEmpresaValidation';
import SubdiarioModal from '../components/configuracion/SubdiarioModal';
import EmptyState from '../components/common/EmptyState';
import {
  subdiariosApi,
  ETIQUETA_NATURALEZA,
  type DiagnosticoSubdiarios,
  type NaturalezaVenta,
  ETIQUETA_NATURALEZA_COMPRA,
  type DiagnosticoSubdiariosCompras,
  type NaturalezaCompra,
  type Subdiario,
} from '../services/subdiariosApi';
import { cn } from '../lib/cn';

type Filtro = 'todos' | 'ventas' | 'compras';

const ConfiguracionPage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();

  const [subdiarios, setSubdiarios] = useState<Subdiario[]>([]);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoSubdiarios | null>(null);
  const [diagCompras, setDiagCompras] = useState<DiagnosticoSubdiariosCompras | null>(
    null
  );
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('ventas');
  const [editando, setEditando] = useState<Subdiario | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const ruc = empresaActual?.ruc;

  const cargar = useCallback(async () => {
    if (!ruc) return;
    setCargando(true);
    setError(null);
    try {
      const [lista, diag, diagComp] = await Promise.all([
        subdiariosApi.listar(ruc),
        subdiariosApi.diagnostico(ruc),
        subdiariosApi.diagnosticoCompras(ruc),
      ]);
      setSubdiarios(lista);
      setDiagnostico(diag);
      setDiagCompras(diagComp);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [ruc]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    if (filtro === 'ventas') return subdiarios.filter((s) => s.asiento_ventas);
    if (filtro === 'compras') return subdiarios.filter((s) => s.asiento_compras);
    return subdiarios;
  }, [subdiarios, filtro]);

  /**
   * El diagnostico que toca mostrar segun la pestaña.
   *
   * En «todos» se ensena el que tenga algo pendiente, porque es el que pide
   * atencion; si los dos estan al dia da igual cual se muestre.
   */
  const vista = useMemo(() => {
    const ventas = diagnostico && {
      que: "venta",
      total: diagnostico.total_subdiarios_venta,
      listos: diagnostico.listos,
      pendientes: diagnostico.pendientes,
    };
    const compras = diagCompras && {
      que: "compra",
      total: diagCompras.total_subdiarios_compra,
      listos: diagCompras.listos,
      pendientes: diagCompras.pendientes,
    };

    if (filtro === 'ventas') return ventas;
    if (filtro === 'compras') return compras;
    return compras?.pendientes.length ? compras : (ventas ?? compras);
  }, [filtro, diagnostico, diagCompras]);

  const guardar = async (datos: Partial<Subdiario>) => {
    if (!ruc) return;
    if (editando) {
      await subdiariosApi.actualizar(ruc, editando.codigo, datos);
      setAviso(`Subdiario ${editando.codigo} actualizado`);
    } else {
      await subdiariosApi.crear(ruc, datos);
      setAviso(`Subdiario ${datos.codigo} creado`);
    }
    setModalAbierto(false);
    setEditando(null);
    cargar();
  };

  const restaurar = async () => {
    if (!ruc) return;
    try {
      setAviso(await subdiariosApi.restaurarCatalogo(ruc));
      cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (!empresaActual) return null;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Subdiarios</h2>
            <p className="text-sm text-slate-500">
              Clasifican las operaciones por su origen y determinan que asiento producen.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={restaurar}
              className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="size-3.5" />
              Restaurar estandar
            </button>
            <button
              type="button"
              onClick={() => {
                setEditando(null);
                setModalAbierto(true);
              }}
              className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <Plus className="size-4" />
              Nuevo
            </button>
          </div>
        </div>

        {/* --- Estado de la configuracion de ventas --- */}
        {/* El aviso habla de lo que se esta mirando: en la pestaña de compras
            no sirve de nada que cuente los subdiarios de venta. */}
        {vista && (
          <div
            className={cn(
              'flex gap-2 border-b px-5 py-3 text-sm sm:px-6',
              vista.pendientes.length
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            )}
          >
            {vista.pendientes.length ? (
              <AlertTriangle className="size-4 shrink-0 text-amber-600" />
            ) : (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            )}
            <div>
              <p className="font-semibold">
                {vista.listos} de {vista.total} subdiarios de {vista.que} listos para
                contabilizar
              </p>
              {vista.pendientes.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {vista.pendientes.map((p) => (
                    <li key={p.codigo}>
                      <strong>{p.codigo}</strong> {p.nombre} — falta {p.falta.join(' y ')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* --- Filtro --- */}
        <div className="flex gap-1 border-b border-slate-200 px-5 py-2 sm:px-6">
          {(['ventas', 'compras', 'todos'] as Filtro[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                filtro === f
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto self-center text-sm text-slate-400">
            {visibles.length} de {subdiarios.length}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {cargando && !subdiarios.length ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" /> Cargando subdiarios…
            </p>
          ) : error ? (
            <p className="flex gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              <AlertTriangle className="size-4 shrink-0" />
              {error}
            </p>
          ) : visibles.length === 0 ? (
            <EmptyState
              title="Sin subdiarios"
              description="Usa «Restaurar estandar» para cargar el catalogo habitual."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3 font-semibold">Cod.</th>
                    <th className="py-2 pr-3 font-semibold">Descripcion</th>
                    <th className="py-2 pr-3 font-semibold">Tipo</th>
                    <th className="py-2 pr-3 font-semibold">Naturaleza</th>
                    <th className="py-2 pr-3 font-semibold">
                      {filtro === 'compras' ? 'Cuentas 60 / 40 / 42' : 'Cuentas 12 / 70 / 40'}
                    </th>
                    <th className="py-2 pr-3 font-semibold">Estado</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibles.map((s) => (
                    <tr key={s.codigo} className={cn(!s.activo && 'opacity-50')}>
                      <td className="py-2 pr-3 font-mono text-slate-700">{s.codigo}</td>
                      <td className="py-2 pr-3 text-slate-800">{s.nombre}</td>
                      <td className="py-2 pr-3 text-slate-500">
                        {s.tipos.join(', ') || '—'}
                      </td>
                      <td className="py-2 pr-3 text-slate-500">
                        {s.asiento_compras && s.naturaleza_compra
                          ? ETIQUETA_NATURALEZA_COMPRA[
                              s.naturaleza_compra as NaturalezaCompra
                            ]
                          : s.naturaleza
                            ? ETIQUETA_NATURALEZA[s.naturaleza as NaturalezaVenta]
                            : '—'}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-slate-500">
                        {s.asiento_compras
                          ? [
                              s.cuentas?.cuenta_gasto || '—',
                              s.cuentas?.cuenta_igv || '—',
                              s.cuentas?.cuenta_pago || '—',
                            ].join(' / ')
                          : s.asiento_ventas
                            ? [
                                s.cuentas?.cuenta_cobro || '—',
                                s.cuentas?.cuenta_ingreso || '—',
                                s.cuentas?.cuenta_igv || '—',
                              ].join(' / ')
                            : '—'}
                      </td>
                      <td className="py-2 pr-3">
                        {s.asiento_ventas || s.asiento_compras ? (
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-xs font-medium',
                              s.listo
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            )}
                          >
                            {s.listo ? 'Listo' : 'Faltan cuentas'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEditando(s);
                            setModalAbierto(true);
                          }}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          aria-label={`Modificar subdiario ${s.codigo}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {aviso && (
            <p className="mt-4 flex gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 className="size-4 shrink-0" />
              {aviso}
            </p>
          )}
        </div>
      </section>

      <SubdiarioModal
        abierto={modalAbierto}
        subdiario={editando}
        onCerrar={() => {
          setModalAbierto(false);
          setEditando(null);
        }}
        onGuardar={guardar}
      />
    </div>
  );
};

export default ConfiguracionPage;
