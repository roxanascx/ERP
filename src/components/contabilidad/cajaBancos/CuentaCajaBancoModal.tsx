/**
 * Alta y modificacion de una cuenta de caja o banco.
 *
 * La cuenta contable se elige con el mismo autocompletado del Libro Diario;
 * el backend rechaza cualquiera que no este marcada `es_cuenta_caja` /
 * `es_cuenta_bancaria` en el Plan de Cuentas (Fase 1), asi que aqui no se
 * duplica esa validacion, solo se muestra el error que devuelva la API.
 */

import React, { useEffect, useState } from 'react';
import Modal from '../../common/Modal';
import { TextField, SelectField, CheckboxField } from '../../common/FormField';
import CuentaCodigoDetalle from '../libroDiario/CuentaCodigoDetalle';
import type { CuentaCajaBanco, TipoCuentaCajaBanco, MonedaCajaBanco } from '../../../services/cajaBancosApi';

interface Props {
  abierto: boolean;
  cuenta: CuentaCajaBanco | null;
  onCerrar: () => void;
  onGuardar: (datos: Partial<CuentaCajaBanco>) => Promise<void>;
}

const VACIO: Partial<CuentaCajaBanco> = {
  codigo: '',
  nombre: '',
  tipo: 'CAJA',
  moneda: 'MN',
  cuenta_contable: { codigo: '', denominacion: '' },
  banco: '',
  numero_cuenta: '',
  cci: '',
  saldo_inicial: 0,
  activa: true,
};

export const CuentaCajaBancoModal: React.FC<Props> = ({ abierto, cuenta, onCerrar, onGuardar }) => {
  const [datos, setDatos] = useState<Partial<CuentaCajaBanco>>(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esNuevo = !cuenta;

  useEffect(() => {
    setDatos(cuenta ? { ...cuenta } : { ...VACIO });
    setError(null);
  }, [cuenta, abierto]);

  const set = (campo: keyof CuentaCajaBanco, valor: unknown) =>
    setDatos((d) => ({ ...d, [campo]: valor }));

  const guardar = async () => {
    if (!datos.codigo?.trim()) return setError('El codigo es obligatorio');
    if (!datos.nombre?.trim()) return setError('El nombre es obligatorio');
    if (!datos.cuenta_contable?.codigo) return setError('Debes elegir la cuenta contable');

    setGuardando(true);
    setError(null);
    try {
      await onGuardar(datos);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const esBanco = datos.tipo === 'BANCO';

  return (
    <Modal
      isOpen={abierto}
      onClose={onCerrar}
      title={esNuevo ? 'Nueva cuenta de caja/banco' : `Cuenta ${cuenta?.codigo}`}
      description="Debe enlazar con una cuenta del Plan Contable marcada para caja o banco"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            label="Codigo"
            name="codigo"
            value={datos.codigo || ''}
            onChange={(e) => set('codigo', e.target.value.toUpperCase())}
            disabled={!esNuevo}
            placeholder="CAJA-01"
          />
          <SelectField
            label="Tipo"
            name="tipo"
            value={datos.tipo || 'CAJA'}
            onChange={(e) => set('tipo', e.target.value as TipoCuentaCajaBanco)}
            disabled={!esNuevo}
          >
            <option value="CAJA">Caja</option>
            <option value="BANCO">Banco</option>
          </SelectField>
          <SelectField
            label="Moneda"
            name="moneda"
            value={datos.moneda || 'MN'}
            onChange={(e) => set('moneda', e.target.value as MonedaCajaBanco)}
          >
            <option value="MN">Moneda nacional</option>
            <option value="ME">Moneda extranjera</option>
          </SelectField>
        </div>

        <TextField
          label="Nombre"
          name="nombre"
          value={datos.nombre || ''}
          onChange={(e) => set('nombre', e.target.value.toUpperCase())}
          placeholder="CAJA PRINCIPAL"
        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Cuenta contable</p>
          <CuentaCodigoDetalle
            codigo={datos.cuenta_contable?.codigo || ''}
            denominacion={datos.cuenta_contable?.denominacion || ''}
            onCodigoChange={(codigo) =>
              set('cuenta_contable', { ...(datos.cuenta_contable || {}), codigo })
            }
            onCuentaSelect={(c) => set('cuenta_contable', { codigo: c.codigo, denominacion: c.descripcion })}
            placeholder={esBanco ? 'Cuenta bancaria (ej: 104101)' : 'Cuenta de caja (ej: 101101)'}
          />
        </div>

        {esBanco && (
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Banco"
              name="banco"
              value={datos.banco || ''}
              onChange={(e) => set('banco', e.target.value)}
              placeholder="BCP"
            />
            <TextField
              label="Numero de cuenta"
              name="numero_cuenta"
              value={datos.numero_cuenta || ''}
              onChange={(e) => set('numero_cuenta', e.target.value)}
            />
            <TextField
              label="CCI"
              name="cci"
              value={datos.cci || ''}
              onChange={(e) => set('cci', e.target.value)}
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Saldo inicial"
            name="saldo_inicial"
            type="number"
            step="0.01"
            value={datos.saldo_inicial ?? 0}
            onChange={(e) => set('saldo_inicial', parseFloat(e.target.value) || 0)}
            disabled={!esNuevo}
            hint={esNuevo ? undefined : 'No se puede cambiar despues de creada'}
          />
          <div className="flex items-end pb-2.5">
            <CheckboxField
              label="Activa"
              name="activa"
              checked={datos.activa !== false}
              onChange={(e) => set('activa', e.target.checked)}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default CuentaCajaBancoModal;
