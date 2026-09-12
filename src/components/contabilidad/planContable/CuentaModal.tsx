import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Wand2 } from 'lucide-react';
import type { CuentaContable } from '../../../types/contabilidad';
import Modal from '../../common/Modal';
import { CheckboxField, SelectField, TextField } from '../../common/FormField';
import { cn } from '../../../lib/cn';

interface CuentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cuenta: Partial<CuentaContable>) => Promise<void>;
  cuenta?: CuentaContable;
  modo: 'crear' | 'editar';
}

const VACIO = {
  codigo: '',
  descripcion: '',
  nivel: 1,
  clase_contable: 1,
  grupo: '',
  subgrupo: '',
  cuenta_padre: '',
  es_hoja: true,
  acepta_movimiento: true,
  naturaleza: 'DEUDORA' as 'DEUDORA' | 'ACREEDORA',
  moneda: 'MN' as 'MN' | 'ME',
  activa: true,
  requiere_centro_costo: false,
  es_cuenta_caja: false,
  es_cuenta_bancaria: false,
};

/** En el plan contable peruano la LONGITUD del codigo determina el nivel. */
const TIPOS_POR_LONGITUD = [
  { nivel: 1, digitos: '1 dígito', ejemplo: '1', tipo: 'Clase', descripcion: 'Activo disponible y exigible', tone: 'bg-red-100 text-red-800' },
  { nivel: 2, digitos: '2 dígitos', ejemplo: '10', tipo: 'Grupo', descripcion: 'Efectivo y equivalentes de efectivo', tone: 'bg-orange-100 text-orange-800' },
  { nivel: 3, digitos: '3 dígitos', ejemplo: '101', tipo: 'Subgrupo', descripcion: 'Caja', tone: 'bg-amber-100 text-amber-800' },
  { nivel: 4, digitos: '4+ dígitos', ejemplo: '1011', tipo: 'Cuenta', descripcion: 'Caja principal', tone: 'bg-green-100 text-green-800' },
];

const tipoPorCodigo = (codigo: string) => {
  const n = codigo.length;
  if (n === 1) return { tipo: 'Clase', tone: 'bg-red-100 text-red-800' };
  if (n === 2) return { tipo: 'Grupo', tone: 'bg-orange-100 text-orange-800' };
  if (n === 3) return { tipo: 'Subgrupo', tone: 'bg-amber-100 text-amber-800' };
  if (n >= 4) return { tipo: 'Cuenta', tone: 'bg-green-100 text-green-800' };
  return { tipo: 'Indefinido', tone: 'bg-slate-100 text-slate-700' };
};

const CuentaModal: React.FC<CuentaModalProps> = ({ isOpen, onClose, onSubmit, cuenta, modo }) => {
  const [formData, setFormData] = useState(VACIO);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cuenta && modo === 'editar') {
      setFormData({
        codigo: cuenta.codigo,
        descripcion: cuenta.descripcion,
        nivel: cuenta.nivel,
        clase_contable: cuenta.clase_contable,
        grupo: cuenta.grupo || '',
        subgrupo: cuenta.subgrupo || '',
        cuenta_padre: cuenta.cuenta_padre || '',
        es_hoja: cuenta.es_hoja,
        acepta_movimiento: cuenta.acepta_movimiento,
        naturaleza: cuenta.naturaleza,
        moneda: cuenta.moneda,
        activa: cuenta.activa,
        requiere_centro_costo: cuenta.requiere_centro_costo,
        es_cuenta_caja: cuenta.es_cuenta_caja,
        es_cuenta_bancaria: cuenta.es_cuenta_bancaria,
      });
    } else {
      setFormData(VACIO);
    }
    setErrors({});
  }, [cuenta, modo, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const next =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: next }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /**
   * Deduce nivel, clase y comportamiento a partir del codigo:
   * niveles 1-3 son agrupadores, 4+ son cuentas de movimiento.
   */
  const configuracionAutomatica = () => {
    const codigo = formData.codigo.trim();
    if (!codigo) return;

    const nivel = codigo.length;
    const esCuentaDeMovimiento = nivel >= 4;
    const clase_contable = parseInt(codigo.charAt(0), 10) || 1;

    setFormData((prev) => ({
      ...prev,
      nivel: Math.min(nivel, 9),
      clase_contable,
      es_hoja: esCuentaDeMovimiento,
      acepta_movimiento: esCuentaDeMovimiento,
      activa: true,
      // Estos flags solo tienen sentido en una cuenta hoja de la clase 1;
      // si el codigo ya no cumple eso, se apagan para no dejar un estado
      // que el backend va a rechazar (ver _validar_flags_cuenta).
      requiere_centro_costo: prev.requiere_centro_costo && esCuentaDeMovimiento,
      es_cuenta_caja: prev.es_cuenta_caja && esCuentaDeMovimiento && clase_contable === 1,
      es_cuenta_bancaria: prev.es_cuenta_bancaria && esCuentaDeMovimiento && clase_contable === 1,
    }));
    setErrors((prev) => ({ ...prev, configuracion: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo.trim()) newErrors.codigo = 'El código es requerido';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';

    if (formData.es_hoja && !formData.acepta_movimiento) {
      newErrors.configuracion = 'Las cuentas hoja normalmente deben aceptar movimientos.';
    }
    if (!formData.es_hoja && formData.acepta_movimiento) {
      newErrors.configuracion = 'Las cuentas padre normalmente no deben aceptar movimientos.';
    }
    if (!formData.acepta_movimiento && (formData.requiere_centro_costo || formData.es_cuenta_caja || formData.es_cuenta_bancaria)) {
      newErrors.configuracion = 'Solo una cuenta que acepta movimiento puede requerir centro de costo o ser cuenta de caja/banco.';
    }
    if ((formData.es_cuenta_caja || formData.es_cuenta_bancaria) && formData.clase_contable !== 1) {
      newErrors.configuracion = 'Solo las cuentas de la clase 1 (Activo) pueden ser cuenta de caja o bancaria.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar cuenta:', error);
    } finally {
      setLoading(false);
    }
  };

  const tipo = tipoPorCodigo(formData.codigo.trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={modo === 'crear' ? 'Nueva cuenta contable' : `Editar cuenta ${cuenta?.codigo ?? ''}`}
      description="El nivel se deduce de la longitud del código: 1-3 dígitos agrupan, 4 o más registran movimientos."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="cuenta-form"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {modo === 'crear' ? 'Crear cuenta' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      <form id="cuenta-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Datos principales */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <TextField
              label="Código"
              name="codigo"
              value={formData.codigo}
              onChange={handleInputChange}
              error={errors.codigo}
              required
              disabled={loading || modo === 'editar'}
              placeholder="Ej: 1011"
              inputMode="numeric"
              className="font-mono"
            />
            {formData.codigo.trim() && (
              <span
                className={cn(
                  'mt-2 inline-flex rounded px-2 py-0.5 text-xs font-medium',
                  tipo.tone
                )}
              >
                {tipo.tipo} · {formData.codigo.trim().length}{' '}
                {formData.codigo.trim().length === 1 ? 'dígito' : 'dígitos'}
              </span>
            )}
          </div>

          <TextField
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            error={errors.descripcion}
            required
            disabled={loading}
            placeholder="Ej: Caja y bancos"
          />

          <TextField
            label="Nivel"
            name="nivel"
            type="number"
            min={1}
            max={9}
            value={formData.nivel}
            onChange={handleInputChange}
            disabled={loading}
            hint="Se calcula solo con «Auto-configurar»."
          />

          <TextField
            label="Clase contable"
            name="clase_contable"
            type="number"
            min={1}
            max={9}
            value={formData.clase_contable}
            onChange={handleInputChange}
            disabled={loading}
            hint="Primer dígito del código."
          />

          <SelectField
            label="Naturaleza"
            name="naturaleza"
            value={formData.naturaleza}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="DEUDORA">Deudora</option>
            <option value="ACREEDORA">Acreedora</option>
          </SelectField>

          <SelectField
            label="Moneda"
            name="moneda"
            value={formData.moneda}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="MN">Moneda nacional</option>
            <option value="ME">Moneda extranjera</option>
          </SelectField>
        </div>

        {/* Configuración */}
        <fieldset className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <legend className="flex items-center gap-3 px-1 text-sm font-semibold text-slate-900">
            Configuración
            <button
              type="button"
              onClick={configuracionAutomatica}
              disabled={loading || !formData.codigo.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            >
              <Wand2 className="size-3.5" aria-hidden="true" />
              Auto-configurar
            </button>
          </legend>

          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <CheckboxField
              label="Es hoja"
              name="es_hoja"
              checked={formData.es_hoja}
              onChange={handleInputChange}
              disabled={loading}
              hint="No puede tener subcuentas"
            />
            <CheckboxField
              label="Acepta movimiento"
              name="acepta_movimiento"
              checked={formData.acepta_movimiento}
              onChange={handleInputChange}
              disabled={loading}
              hint="Se pueden registrar asientos"
            />
            <CheckboxField
              label="Activa"
              name="activa"
              checked={formData.activa}
              onChange={handleInputChange}
              disabled={loading}
              hint="La cuenta está habilitada"
            />
          </div>

          <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-3">
            <CheckboxField
              label="Requiere centro de costo"
              name="requiere_centro_costo"
              checked={formData.requiere_centro_costo}
              onChange={handleInputChange}
              disabled={loading || !formData.acepta_movimiento}
              hint="Se exigirá al registrar un asiento"
            />
            <CheckboxField
              label="Es cuenta de caja"
              name="es_cuenta_caja"
              checked={formData.es_cuenta_caja}
              onChange={handleInputChange}
              disabled={loading || !formData.acepta_movimiento || formData.clase_contable !== 1}
              hint="Aparecerá en Caja/Bancos"
            />
            <CheckboxField
              label="Es cuenta bancaria"
              name="es_cuenta_bancaria"
              checked={formData.es_cuenta_bancaria}
              onChange={handleInputChange}
              disabled={loading || !formData.acepta_movimiento || formData.clase_contable !== 1}
              hint="Aparecerá en Caja/Bancos"
            />
          </div>

          {errors.configuracion && (
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {errors.configuracion}
            </p>
          )}
        </fieldset>

        {/* Guía de estructura */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            Estructura jerárquica del plan contable
          </h3>
          <ul className="grid gap-2">
            {TIPOS_POR_LONGITUD.map((n) => (
              <li
                key={n.nivel}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <span className={cn('rounded px-2 py-0.5 text-xs font-medium', n.tone)}>
                  {n.tipo}
                </span>
                <span className="text-xs text-slate-500">{n.digitos}</span>
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
                  {n.ejemplo}
                </code>
                <span className="min-w-0 flex-1 truncate text-xs text-slate-500">
                  {n.descripcion}
                </span>
                <span
                  className={cn(
                    'text-xs font-medium',
                    n.nivel >= 4 ? 'text-green-700' : 'text-slate-400'
                  )}
                >
                  {n.nivel >= 4 ? 'Acepta movimientos' : 'Solo agrupa'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </Modal>
  );
};

export default CuentaModal;
