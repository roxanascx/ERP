/**
 * Alta y edición de registros de compra (PLE 080000).
 */

import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { comprasApi } from '../../../services/comprasApi';
import type {
  RegistroCompraResponse,
  RegistroCompraCreate,
  RegistroCompraUpdate,
} from '../../../services/comprasApi';
import Modal from '../../common/Modal';
import { SelectField, TextField } from '../../common/FormField';

interface ComprasFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCompra?: RegistroCompraResponse | null;
  empresaId: string;
}

const TIPOS_COMPROBANTE = [
  { value: '01', label: '01 · Factura' },
  { value: '03', label: '03 · Boleta de venta' },
  { value: '07', label: '07 · Nota de crédito' },
  { value: '08', label: '08 · Nota de débito' },
  { value: '14', label: '14 · Recibo por honorarios' },
  { value: '18', label: '18 · Documentos del sistema financiero' },
  { value: '91', label: '91 · Comprobante de no domiciliados' },
];

const TIPOS_DOCUMENTO = [
  { value: '6', label: '6 · RUC' },
  { value: '1', label: '1 · DNI' },
  { value: '4', label: '4 · Carnet de extranjería' },
  { value: '7', label: '7 · Pasaporte' },
  { value: '0', label: '0 · Sin documento' },
];

const ESTADOS_OPERACION = [
  { value: '1', label: '1 · Registro válido' },
  { value: '8', label: '8 · Registro anulado' },
  { value: '9', label: '9 · Registro de ajuste' },
];

const MONEDAS = [
  { value: 'PEN', label: 'PEN · Soles' },
  { value: 'USD', label: 'USD · Dólares' },
  { value: 'EUR', label: 'EUR · Euros' },
];

/** Campos que participan en el total del comprobante. */
const CAMPOS_IMPORTE = [
  'base_imponible_gravada',
  'igv',
  'base_imponible_exonerada',
  'base_imponible_inafecta',
  'isc',
  'otros_tributos',
] as const;

const sumarTotal = (d: RegistroCompraCreate): number =>
  d.base_imponible_gravada +
  d.igv +
  (d.base_imponible_exonerada || 0) +
  (d.base_imponible_inafecta || 0) +
  (d.isc || 0) +
  (d.otros_tributos || 0);

const ComprasFormModal: React.FC<ComprasFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingCompra,
  empresaId,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<RegistroCompraCreate>({
    empresa_id: empresaId,
    periodo: new Date().toISOString().substring(0, 7).replace('-', ''),
    fecha_comprobante: '',
    tipo_comprobante: '01',
    serie_comprobante: '',
    numero_comprobante: '',
    fecha_vencimiento: '',
    tipo_documento_proveedor: '6',
    numero_documento_proveedor: '',
    razon_social_proveedor: '',
    base_imponible_gravada: 0,
    igv: 0,
    base_imponible_exonerada: 0,
    base_imponible_inafecta: 0,
    isc: 0,
    otros_tributos: 0,
    importe_total: 0,
    moneda: 'PEN',
    tipo_cambio: 1.0,
    clasificacion_bienes_servicios: '',
    estado_operacion: '1',
  });

  useEffect(() => {
    if (!editingCompra) return;

    setFormData({
      empresa_id: editingCompra.empresa_id,
      periodo: editingCompra.periodo,
      fecha_comprobante: editingCompra.fecha_comprobante,
      tipo_comprobante: editingCompra.tipo_comprobante,
      serie_comprobante: editingCompra.serie_comprobante || '',
      numero_comprobante: editingCompra.numero_comprobante,
      fecha_vencimiento: editingCompra.fecha_vencimiento || '',
      tipo_documento_proveedor: editingCompra.tipo_documento_proveedor,
      numero_documento_proveedor: editingCompra.numero_documento_proveedor,
      razon_social_proveedor: editingCompra.razon_social_proveedor,
      base_imponible_gravada: editingCompra.base_imponible_gravada,
      igv: editingCompra.igv,
      base_imponible_exonerada: editingCompra.base_imponible_exonerada,
      base_imponible_inafecta: editingCompra.base_imponible_inafecta,
      isc: editingCompra.isc,
      otros_tributos: editingCompra.otros_tributos,
      importe_total: editingCompra.importe_total,
      moneda: editingCompra.moneda,
      tipo_cambio: editingCompra.tipo_cambio,
      clasificacion_bienes_servicios: editingCompra.clasificacion_bienes_servicios || '',
      estado_operacion: editingCompra.estado_operacion,
    });
  }, [editingCompra]);

  // ---------------------------------------------------------------------------
  // Validación
  // ---------------------------------------------------------------------------

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fecha_comprobante) {
      newErrors.fecha_comprobante = 'La fecha del comprobante es obligatoria';
    }
    if (!formData.numero_comprobante) {
      newErrors.numero_comprobante = 'El número del comprobante es obligatorio';
    }
    if (!formData.numero_documento_proveedor) {
      newErrors.numero_documento_proveedor = 'El documento del proveedor es obligatorio';
    }
    if (!formData.razon_social_proveedor.trim()) {
      newErrors.razon_social_proveedor = 'La razón social del proveedor es obligatoria';
    }

    if (
      formData.tipo_documento_proveedor === '6' &&
      !/^\d{11}$/.test(formData.numero_documento_proveedor)
    ) {
      newErrors.numero_documento_proveedor = 'El RUC debe tener exactamente 11 dígitos';
    }
    if (
      formData.tipo_documento_proveedor === '1' &&
      !/^\d{8}$/.test(formData.numero_documento_proveedor)
    ) {
      newErrors.numero_documento_proveedor = 'El DNI debe tener exactamente 8 dígitos';
    }

    if (formData.base_imponible_gravada < 0) {
      newErrors.base_imponible_gravada = 'La base imponible gravada no puede ser negativa';
    }
    if (formData.igv < 0) {
      newErrors.igv = 'El IGV no puede ser negativo';
    }
    if (formData.importe_total <= 0) {
      newErrors.importe_total = 'El importe total debe ser mayor que cero';
    }

    // Tolerancia de un centimo por redondeos.
    if (Math.abs(sumarTotal(formData) - formData.importe_total) > 0.01) {
      newErrors.importe_total = 'El importe total no coincide con la suma de los componentes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------------------------------------------
  // Cambios
  // ---------------------------------------------------------------------------

  const handleInputChange = (field: keyof RegistroCompraCreate, value: unknown) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value } as RegistroCompraCreate;

      // El IGV se calcula al 18 % sobre la base gravada.
      if (field === 'base_imponible_gravada') {
        updated.igv = Math.round((Number(value) || 0) * 0.18 * 100) / 100;
      }

      // El total se recalcula sobre el estado YA actualizado. Antes se llamaba
      // a una funcion que leia `formData` del render anterior, asi que el total
      // se quedaba siempre un cambio por detras.
      if (CAMPOS_IMPORTE.includes(field as (typeof CAMPOS_IMPORTE)[number])) {
        updated.importe_total = sumarTotal(updated);
      }

      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const numberField = (field: keyof RegistroCompraCreate) => ({
    type: 'number',
    step: '0.01',
    min: '0',
    value: String(formData[field] ?? 0),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      handleInputChange(field, parseFloat(e.target.value) || 0),
    className: 'text-right tabular-nums',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingCompra) {
        await comprasApi.update(editingCompra.id, formData as RegistroCompraUpdate);
      } else {
        await comprasApi.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      setErrors({ general: error.response?.data?.detail || 'Error al guardar el registro' });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={editingCompra ? 'Editar registro de compra' : 'Nuevo registro de compra'}
      description="Registro de compras según PLE 080000."
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
            form="compras-form"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {editingCompra ? 'Guardar cambios' : 'Crear registro'}
          </button>
        </>
      }
    >
      <form id="compras-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
        {errors.general && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
            <p className="text-sm font-medium text-red-800">{errors.general}</p>
          </div>
        )}

        {/* Comprobante */}
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-900">Comprobante</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Fecha del comprobante"
              name="fecha_comprobante"
              type="date"
              required
              value={formData.fecha_comprobante}
              onChange={(e) => handleInputChange('fecha_comprobante', e.target.value)}
              error={errors.fecha_comprobante}
            />

            <SelectField
              label="Tipo de comprobante"
              name="tipo_comprobante"
              required
              value={formData.tipo_comprobante}
              onChange={(e) => handleInputChange('tipo_comprobante', e.target.value)}
            >
              {TIPOS_COMPROBANTE.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </SelectField>

            <TextField
              label="Serie"
              name="serie_comprobante"
              value={formData.serie_comprobante}
              onChange={(e) => handleInputChange('serie_comprobante', e.target.value.toUpperCase())}
              placeholder="F001"
              className="font-mono"
            />

            <TextField
              label="Número"
              name="numero_comprobante"
              required
              value={formData.numero_comprobante}
              onChange={(e) => handleInputChange('numero_comprobante', e.target.value)}
              error={errors.numero_comprobante}
              placeholder="00001234"
              className="font-mono"
            />

            <TextField
              label="Fecha de vencimiento"
              name="fecha_vencimiento"
              type="date"
              value={formData.fecha_vencimiento}
              onChange={(e) => handleInputChange('fecha_vencimiento', e.target.value)}
            />

            <SelectField
              label="Estado de la operación"
              name="estado_operacion"
              value={formData.estado_operacion}
              onChange={(e) => handleInputChange('estado_operacion', e.target.value)}
            >
              {ESTADOS_OPERACION.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </SelectField>
          </div>
        </fieldset>

        {/* Proveedor */}
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-900">Proveedor</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Tipo de documento"
              name="tipo_documento_proveedor"
              required
              value={formData.tipo_documento_proveedor}
              onChange={(e) => handleInputChange('tipo_documento_proveedor', e.target.value)}
            >
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </SelectField>

            <TextField
              label="Número de documento"
              name="numero_documento_proveedor"
              required
              value={formData.numero_documento_proveedor}
              onChange={(e) => handleInputChange('numero_documento_proveedor', e.target.value)}
              error={errors.numero_documento_proveedor}
              placeholder={formData.tipo_documento_proveedor === '6' ? '20123456789' : '12345678'}
              inputMode="numeric"
              className="font-mono"
            />

            <TextField
              label="Razón social"
              name="razon_social_proveedor"
              required
              full
              value={formData.razon_social_proveedor}
              onChange={(e) => handleInputChange('razon_social_proveedor', e.target.value)}
              error={errors.razon_social_proveedor}
              placeholder="Nombre o razón social del proveedor"
            />
          </div>
        </fieldset>

        {/* Importes */}
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-900">Importes</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Base imponible gravada"
              name="base_imponible_gravada"
              error={errors.base_imponible_gravada}
              hint="El IGV se calcula solo al 18 %."
              {...numberField('base_imponible_gravada')}
            />

            <TextField label="IGV" name="igv" error={errors.igv} {...numberField('igv')} />

            <TextField
              label="Base imponible exonerada"
              name="base_imponible_exonerada"
              {...numberField('base_imponible_exonerada')}
            />

            <TextField
              label="Base imponible inafecta"
              name="base_imponible_inafecta"
              {...numberField('base_imponible_inafecta')}
            />

            <TextField label="ISC" name="isc" {...numberField('isc')} />

            <TextField
              label="Otros tributos"
              name="otros_tributos"
              {...numberField('otros_tributos')}
            />

            <TextField
              label="Importe total"
              name="importe_total"
              required
              error={errors.importe_total}
              hint="Se recalcula con la suma de los componentes."
              {...numberField('importe_total')}
            />

            <SelectField
              label="Moneda"
              name="moneda"
              value={formData.moneda}
              onChange={(e) => handleInputChange('moneda', e.target.value)}
            >
              {MONEDAS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </SelectField>

            {formData.moneda !== 'PEN' && (
              <TextField
                label="Tipo de cambio"
                name="tipo_cambio"
                type="number"
                step="0.001"
                min="0"
                value={String(formData.tipo_cambio ?? 1)}
                onChange={(e) => handleInputChange('tipo_cambio', parseFloat(e.target.value) || 1)}
                className="text-right tabular-nums"
              />
            )}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
};

export default ComprasFormModal;
