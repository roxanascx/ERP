/**
 * Caja/Bancos (MVP).
 * URL: /contabilidad/caja-bancos
 *
 * Dos pestañas: catalogo de cuentas (caja/banco enlazadas al Plan Contable) y
 * sus movimientos (pagos/cobros), con un boton para contabilizar los
 * pendientes en un lote reversible. Sin conciliacion bancaria todavia.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Plus, RotateCcw } from 'lucide-react';
import useEmpresaActual from '../../hooks/useEmpresaActual';
import EmptyState from '../../components/common/EmptyState';
import CuentaCajaBancoModal from '../../components/contabilidad/cajaBancos/CuentaCajaBancoModal';
import MovimientoModal from '../../components/contabilidad/cajaBancos/MovimientoModal';
import {
  cajaBancosApi,
  type CuentaCajaBanco,
  type MovimientoCajaBanco,
} from '../../services/cajaBancosApi';
import { centrosCostoApi, type CentroCosto } from '../../services/centrosCostoApi';
import { cn } from '../../lib/cn';

type Tab = 'cuentas' | 'movimientos';

const soles = (n: number): string =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CajaBancosPage: React.FC = () => {
  const { empresa } = useEmpresaActual();
  const empresaId = empresa?.ruc ?? '';

  const [tab, setTab] = useState<Tab>('cuentas');
  const [cuentas, setCuentas] = useState<CuentaCajaBanco[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoCajaBanco[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<CentroCosto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [modalCuentaAbierto, setModalCuentaAbierto] = useState(false);
  const [cuentaEditando, setCuentaEditando] = useState<CuentaCajaBanco | null>(null);
  const [modalMovAbierto, setModalMovAbierto] = useState(false);
  const [cuentaParaMovimiento, setCuentaParaMovimiento] = useState<string | undefined>();
  const [contabilizando, setContabilizando] = useState(false);

  const cargar = useCallback(async () => {
    if (!empresaId) return;
    setCargando(true);
    setError(null);
    try {
      const [listaCuentas, listaMovimientos, listaCentros] = await Promise.all([
        cajaBancosApi.listarCuentas(empresaId),
        cajaBancosApi.listarMovimientos(empresaId),
        centrosCostoApi.listar(empresaId, true).catch(() => []),
      ]);
      setCuentas(listaCuentas);
      setMovimientos(listaMovimientos);
      setCentrosCosto(listaCentros);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [empresaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cuentaPorId = useMemo(
    () => Object.fromEntries(cuentas.map((c) => [c.id, c])),
    [cuentas]
  );

  const pendientes = useMemo(
    () => movimientos.filter((m) => !m.contabilizado).length,
    [movimientos]
  );

  const guardarCuenta = async (datos: Partial<CuentaCajaBanco>) => {
    if (!empresaId) return;
    if (cuentaEditando) {
      await cajaBancosApi.actualizarCuenta(empresaId, cuentaEditando.codigo, datos);
      setAviso(`Cuenta ${cuentaEditando.codigo} actualizada`);
    } else {
      await cajaBancosApi.crearCuenta(empresaId, datos);
      setAviso(`Cuenta ${datos.codigo} creada`);
    }
    setModalCuentaAbierto(false);
    setCuentaEditando(null);
    cargar();
  };

  const guardarMovimiento = async (datos: Partial<MovimientoCajaBanco>) => {
    if (!empresaId) return;
    await cajaBancosApi.crearMovimiento(empresaId, datos);
    setAviso('Movimiento registrado');
    setModalMovAbierto(false);
    cargar();
  };

  const contabilizar = async () => {
    if (!empresaId) return;
    setContabilizando(true);
    setError(null);
    try {
      const resultado = await cajaBancosApi.contabilizar(empresaId);
      setAviso(resultado.mensaje);
      cargar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setContabilizando(false);
    }
  };

  if (!empresaId) return null;

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {([
          { id: 'cuentas' as const, label: 'Cuentas' },
          { id: 'movimientos' as const, label: `Movimientos${pendientes ? ` (${pendientes} pendientes)` : ''}` },
        ]).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setTab(s.id)}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              tab === s.id ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="flex gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </p>
      )}
      {aviso && (
        <p className="flex gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0" />
          {aviso}
        </p>
      )}

      {tab === 'cuentas' && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Cuentas de caja y bancos</h2>
              <p className="text-sm text-slate-500">
                Cada cuenta enlaza con una cuenta del Plan Contable marcada para caja o banco.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCuentaEditando(null);
                setModalCuentaAbierto(true);
              }}
              className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <Plus className="size-4" />
              Nueva cuenta
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {cargando && !cuentas.length ? (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" /> Cargando…
              </p>
            ) : cuentas.length === 0 ? (
              <EmptyState
                title="Sin cuentas de caja/banco"
                description="Crea la primera enlazandola a una cuenta del Plan Contable."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-3 font-semibold">Cod.</th>
                      <th className="py-2 pr-3 font-semibold">Nombre</th>
                      <th className="py-2 pr-3 font-semibold">Tipo</th>
                      <th className="py-2 pr-3 font-semibold">Cuenta contable</th>
                      <th className="py-2 pr-3 text-right font-semibold">Saldo actual</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cuentas.map((c) => (
                      <tr key={c.id} className={cn(!c.activa && 'opacity-50')}>
                        <td className="py-2 pr-3 font-mono text-slate-700">{c.codigo}</td>
                        <td className="py-2 pr-3 text-slate-800">{c.nombre}</td>
                        <td className="py-2 pr-3 text-slate-500">{c.tipo}</td>
                        <td className="py-2 pr-3 font-mono text-xs text-slate-500">
                          {c.cuenta_contable.codigo}
                        </td>
                        <td className="py-2 pr-3 text-right font-semibold tabular-nums text-slate-800">
                          {soles(c.saldo_actual)}
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setCuentaParaMovimiento(c.id);
                                setModalMovAbierto(true);
                              }}
                              className="rounded px-2 py-1 text-xs font-medium text-violet-700 hover:bg-violet-50"
                            >
                              + Movimiento
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCuentaEditando(c);
                                setModalCuentaAbierto(true);
                              }}
                              className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'movimientos' && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Movimientos</h2>
              <p className="text-sm text-slate-500">
                Pagos y cobros registrados. Contabilizar genera su asiento en el Libro Diario.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={contabilizar}
                disabled={contabilizando || pendientes === 0}
                className="flex items-center gap-1.5 rounded-md border border-violet-300 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
              >
                <RotateCcw className="size-3.5" />
                {contabilizando ? 'Contabilizando…' : `Contabilizar (${pendientes})`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCuentaParaMovimiento(undefined);
                  setModalMovAbierto(true);
                }}
                className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus className="size-4" />
                Nuevo movimiento
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {cargando && !movimientos.length ? (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" /> Cargando…
              </p>
            ) : movimientos.length === 0 ? (
              <EmptyState
                title="Sin movimientos"
                description="Registra el primer pago o cobro desde la pestaña Cuentas."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[48rem] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-3 font-semibold">Fecha</th>
                      <th className="py-2 pr-3 font-semibold">Cuenta</th>
                      <th className="py-2 pr-3 font-semibold">Tipo</th>
                      <th className="py-2 pr-3 font-semibold">Glosa</th>
                      <th className="py-2 pr-3 text-right font-semibold">Monto</th>
                      <th className="py-2 pr-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {movimientos.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2 pr-3 text-slate-600">{m.fecha}</td>
                        <td className="py-2 pr-3 text-slate-800">
                          {cuentaPorId[m.cuenta_caja_banco_id]?.codigo || '—'}
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-xs font-medium',
                              m.tipo === 'INGRESO'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            )}
                          >
                            {m.tipo}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-slate-600">{m.glosa}</td>
                        <td className="py-2 pr-3 text-right font-semibold tabular-nums text-slate-800">
                          {soles(m.monto)}
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-xs font-medium',
                              m.contabilizado
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            )}
                          >
                            {m.contabilizado ? 'Contabilizado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      <CuentaCajaBancoModal
        abierto={modalCuentaAbierto}
        cuenta={cuentaEditando}
        onCerrar={() => {
          setModalCuentaAbierto(false);
          setCuentaEditando(null);
        }}
        onGuardar={guardarCuenta}
      />

      <MovimientoModal
        abierto={modalMovAbierto}
        cuentas={cuentas}
        centrosCosto={centrosCosto}
        cuentaPreseleccionada={cuentaParaMovimiento}
        onCerrar={() => setModalMovAbierto(false)}
        onGuardar={guardarMovimiento}
      />
    </div>
  );
};

export default CajaBancosPage;
