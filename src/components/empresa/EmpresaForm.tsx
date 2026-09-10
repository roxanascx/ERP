import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { EmpresaFormProps, EmpresaCreate, EmpresaUpdate } from '../../types/empresa';
import { cn } from '../../lib/cn';

/**
 * Formulario de alta/edicion de empresa.
 *
 * Ya NO monta su propio modal. Antes traia un contenedor `position: fixed` con
 * `zIndex: 1000`, su cabecera y su boton de cerrar... dentro del modal que ya
 * abria EmpresaPage: el usuario veia dos cabeceras y dos aspas superpuestas.
 * El chrome lo pone quien lo abre; esto es solo el formulario.
 */

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  multiline?: boolean;
}

const Field: React.FC<FieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  disabled,
  type = 'text',
  placeholder,
  hint,
  maxLength,
  multiline,
}) => {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  const control = cn(
    'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors',
    'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
    'focus:outline-none focus:ring-2',
    error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
  );

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {multiline ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(control, 'resize-y')}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={control}
        />
      )}

      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

const EmpresaForm: React.FC<EmpresaFormProps> = ({
  empresa,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    ruc: '',
    razon_social: '',
    direccion: '',
    telefono: '',
    email: '',
    notas_internas: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const isEditing = Boolean(empresa);

  useEffect(() => {
    if (empresa) {
      setFormData({
        ruc: empresa.ruc,
        razon_social: empresa.razon_social,
        direccion: empresa.direccion || '',
        telefono: empresa.telefono || '',
        email: empresa.email || '',
        notas_internas: empresa.notas_internas || '',
      });
    }
  }, [empresa]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEditing && !formData.ruc.trim()) {
      newErrors.ruc = 'El RUC es requerido';
    } else if (!isEditing && !/^\d{11}$/.test(formData.ruc)) {
      newErrors.ruc = 'El RUC debe tener 11 dígitos';
    }

    if (!formData.razon_social.trim()) {
      newErrors.razon_social = 'La razón social es requerida';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitError('');

    try {
      if (isEditing) {
        const updateData: EmpresaUpdate = {
          razon_social: formData.razon_social,
          direccion: formData.direccion || undefined,
          telefono: formData.telefono || undefined,
          email: formData.email || undefined,
          notas_internas: formData.notas_internas || undefined,
        };
        onSubmit(updateData);
      } else {
        const createData: EmpresaCreate = {
          ruc: formData.ruc,
          razon_social: formData.razon_social,
          direccion: formData.direccion || undefined,
          telefono: formData.telefono || undefined,
          email: formData.email || undefined,
        };
        onSubmit(createData);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
          <p className="flex-1 text-sm font-medium text-red-800">{submitError}</p>
        </div>
      )}

      {isEditing ? (
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">RUC</p>
          <p className="font-mono text-base font-semibold text-slate-900 tabular-nums">
            {empresa?.ruc}
          </p>
          <p className="mt-1 text-xs text-slate-500">El RUC no se puede modificar.</p>
        </div>
      ) : (
        <Field
          label="RUC"
          name="ruc"
          value={formData.ruc}
          onChange={handleChange}
          error={errors.ruc}
          required
          disabled={loading}
          placeholder="20123456789"
          hint="11 dígitos, sin espacios ni guiones."
          maxLength={11}
        />
      )}

      <Field
        label="Razón social"
        name="razon_social"
        value={formData.razon_social}
        onChange={handleChange}
        error={errors.razon_social}
        required
        disabled={loading}
        placeholder="MI EMPRESA S.A.C."
      />

      <Field
        label="Dirección"
        name="direccion"
        value={formData.direccion}
        onChange={handleChange}
        error={errors.direccion}
        disabled={loading}
        placeholder="Av. Ejemplo 123, Lima"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Teléfono"
          name="telefono"
          type="tel"
          value={formData.telefono}
          onChange={handleChange}
          error={errors.telefono}
          disabled={loading}
          placeholder="999888777"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={loading}
          placeholder="contacto@empresa.com"
        />
      </div>

      {isEditing && (
        <Field
          label="Notas internas"
          name="notas_internas"
          value={formData.notas_internas}
          onChange={handleChange}
          error={errors.notas_internas}
          disabled={loading}
          multiline
          placeholder="Anotaciones visibles solo para tu equipo"
        />
      )}

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {isEditing ? 'Guardar cambios' : 'Crear empresa'}
        </button>
      </div>
    </form>
  );
};

export default EmpresaForm;
