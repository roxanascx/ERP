/**
 * Registro de un pago o cobro (ingreso/egreso) de una cuenta de caja/banco.
 *
 * La contra-cuenta es obligatoria: este ERP no tiene todavia una cuenta
 * contable asociada a cada socio de negocio, asi que se elige a mano con el
 * mismo autocompletado del Libro Diario (ver `schemas.py` en el backend).
 */

import React, { useEffect, useState } from 'react';
import Modal from '../../common/Modal';
import { TextField, SelectField } from '../../common/FormField';
import CuentaCodigoDetalle from '../libroDiario/CuentaCodigoDetalle';
import type {
  CuentaCajaBanco,
  MedioPago,
  MovimientoCajaBanco,
  TipoMovimientoCajaBanco,
} from '../../../services/cajaBancosApi';
import type { CentroCosto } from '../../../services/centrosCostoApi';

interface Props {
  abierto: boolean;
  cuentas: CuentaCajaBanco[];
  centrosCosto: CentroCosto[];
  cuentaPreseleccionada?: string;
  onCerrar: () => void;
  onGuardar: (datos: Partial<MovimientoCajaBanco>) => Promise<void>;
}

const vacio = (cuentaId?: string): Partial<MovimientoCajaBanco> => ({
  cuenta_caja_banco_id: cuentaId || '',
  fecha: new Date().toISOString().split('T')[0],
  tipo: 'INGRESO',
  monto: 0,
  glosa: '',
  medio_pago: 'EFECTIVO',
  documento_referencia: '',
  contra_cuenta: { codigo: '', denominacion: '' },
});

export const MovimientoModal: React.FC<Props> = ({
  abierto,
  cuentas,
  centrosCosto,
  cuentaPreseleccionada,
  onCerrar,
  onGuardar,
}) => {
  const [datos, setDatos] = useState<Partial<MovimientoCajaBanco>>(vacio(cuentaPreseleccionada));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDatos(vacio(cuentaPreseleccionada));
    setError(null);
  }, [abierto, cuentaPreseleccionada]);

  const set = (campo: keyof MovimientoCajaBanco, valor: unknown) =>
    setDatos((d) => ({ ...d, [campo]: valor }));

  const guardar = async () => {
    if (!datos.cuenta_caja_banco_id) return setError('Elige la cuenta de caja/banco');
    if (!datos.monto || datos.monto <= 0) return setError('El monto debe ser mayor a cero');
    if (!datos.glosa?.trim()) return setError('La glosa es obligatoria');
    if (!datos.contra_cuenta?.codigo) return setError('Elige la contra-cuenta contable');

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

  return (
    <Modal
      isOpen={abierto}
      onClose={onCerrar}
      title="Registrar pago o cobro"
      description="Genera, al contabilizar, un asiento de dos lineas: la cuenta de caja/banco y la contra-cuenta"
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
            {guardando ? 'Guardando…' : 'Registrar'}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Cuenta de caja/banco"
            name="cuenta_caja_banco_id"
            value={datos.cuenta_caja_banco_id || ''}
            onChange={(e) => set('cuenta_caja_banco_id', e.target.value)}
          >
            <option value="">Selecciona…</option>
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} · {c.nombre}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Tipo"
            name="tipo"
            value={datos.tipo || 'INGRESO'}
            onChange={(e) => set('tipo', e.target.value as TipoMovimientoCajaBanco)}
          >
            <option value="INGRESO">Ingreso (cobro)</option>
            <option value="EGRESO">Egreso (pago)</option>
          </SelectField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Fecha"
            name="fecha"
            type="date"
            value={datos.fecha || ''}
            onChange={(e) => set('fecha', e.target.value)}
          />
          <TextField
            label="Monto"
            name="monto"
            type="number"
            step="0.01"
            value={datos.monto ?? 0}
            onChange={(e) => set('monto', parseFloat(e.target.value) || 0)}
          />
        </div>

        <TextField
          label="Glosa"
          name="glosa"
          value={datos.glosa || ''}
          onChange={(e) => set('glosa', e.target.value)}
          placeholder="Cobro factura F001-123"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Medio de pago"
            name="medio_pago"
            value={datos.medio_pago || 'EFECTIVO'}
            onChange={(e) => set('medio_pago', e.target.value as MedioPago)}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="CHEQUE">Cheque</option>
            <option value="TARJETA">Tarjeta</option>
          </SelectField>
          <TextField
            label="Documento de referencia"
            name="documento_referencia"
            value={datos.documento_referencia || ''}
            onChange={(e) => set('documento_referencia', e.target.value)}
            placeholder="F001-123"
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Contra-cuenta contable</p>
          <CuentaCodigoDetalle
            codigo={datos.contra_cuenta?.codigo || ''}
            denominacion={datos.contra_cuenta?.denominacion || ''}
            onCodigoChange={(codigo) =>
              set('contra_cuenta', { ...(datos.contra_cuenta || {}), codigo })
            }
            onCuentaSelect={(c) => set('contra_cuenta', { codigo: c.codigo, denominacion: c.descripcion })}
            placeholder="Ej: 121101 (cuenta por cobrar)"
          />
        </div>

        {centrosCosto.length > 0 && (
          <SelectField
            label="Centro de costo (opcional)"
            name="centro_costo"
            value={datos.centro_costo?.codigo || ''}
            onChange={(e) => {
              const centro = centrosCosto.find((c) => c.codigo === e.target.value);
              set('centro_costo', centro ? { codigo: centro.codigo, nombre: centro.nombre } : undefined);
            }}
          >
            <option value="">Sin centro de costo</option>
            {centrosCosto.map((c) => (
              <option key={c.codigo} value={c.codigo}>
                {c.codigo} · {c.nombre}
              </option>
            ))}
          </SelectField>
        )}

        {error && (
          <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default MovimientoModal;
