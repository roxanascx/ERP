/**
 * Alta y modificacion de un centro de costo.
 *
 * Mucho mas simple que SubdiarioModal: solo codigo/nombre/descripcion/activo.
 * La regla de negocio (que cuentas lo exigen) vive en el Plan de Cuentas.
 */

import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { TextField, CheckboxField } from '../common/FormField';
import type { CentroCosto } from '../../services/centrosCostoApi';

interface Props {
  abierto: boolean;
  centroCosto: CentroCosto | null;
  onCerrar: () => void;
  onGuardar: (datos: Partial<CentroCosto>) => Promise<void>;
}

const VACIO: Partial<CentroCosto> = {
  codigo: '',
  nombre: '',
  descripcion: '',
  activo: true,
};

export const CentroCostoModal: React.FC<Props> = ({
  abierto,
  centroCosto,
  onCerrar,
  onGuardar,
}) => {
  const [datos, setDatos] = useState<Partial<CentroCosto>>(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esNuevo = !centroCosto;

  useEffect(() => {
    setDatos(centroCosto ? { ...centroCosto } : { ...VACIO });
    setError(null);
  }, [centroCosto, abierto]);

  const set = (campo: keyof CentroCosto, valor: unknown) =>
    setDatos((d) => ({ ...d, [campo]: valor }));

  const guardar = async () => {
    if (!datos.codigo?.trim()) {
      setError('El codigo es obligatorio');
      return;
    }
    if (!datos.nombre?.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

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
      title={esNuevo ? 'Nuevo centro de costo' : `Centro de costo ${centroCosto?.codigo}`}
      description="Clasifica en que area de la empresa se origina un gasto o ingreso"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Salir
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {guardando ? 'Grabando…' : 'Grabar'}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Codigo"
            name="codigo"
            value={datos.codigo || ''}
            onChange={(e) => set('codigo', e.target.value.toUpperCase())}
            disabled={!esNuevo}
            placeholder="100"
            hint={esNuevo ? undefined : 'El codigo no se puede cambiar'}
          />
          <TextField
            label="Nombre"
            name="nombre"
            value={datos.nombre || ''}
            onChange={(e) => set('nombre', e.target.value.toUpperCase())}
            placeholder="PRODUCCION"
          />
        </div>

        <TextField
          label="Descripcion"
          name="descripcion"
          value={datos.descripcion || ''}
          onChange={(e) => set('descripcion', e.target.value)}
        />

        <CheckboxField
          label="Activo"
          name="activo"
          checked={datos.activo !== false}
          onChange={(e) => set('activo', e.target.checked)}
        />

        {error && (
          <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {centroCosto?.creado_en && (
          <p className="text-xs text-slate-400">
            Creado {new Date(centroCosto.creado_en).toLocaleString('es-PE')}
            {centroCosto.creado_por ? ` por ${centroCosto.creado_por}` : ''}
            {centroCosto.modificado_en
              ? ` · Modificado ${new Date(centroCosto.modificado_en).toLocaleString('es-PE')}`
              : ''}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default CentroCostoModal;
