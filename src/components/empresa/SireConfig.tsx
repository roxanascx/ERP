import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Info, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import type { SireConfigProps, SireConfig } from '../../types/empresa';
import { cn } from '../../lib/cn';

/**
 * Credenciales SIRE / SUNAT de una empresa.
 *
 * Migrado a Tailwind, sin su propio chrome (lo pone el modal que lo abre).
 *
 * SEGURIDAD: la version anterior tenia 7 `console.log` en el useEffect, uno de
 * ellos volcando el objeto `empresa` COMPLETO y otro el formulario entero. Eso
 * imprimia en la consola del navegador, tambien en produccion,
 * `sire_client_secret`, `sunat_clave`, `banco_clave`, `pdt_clave` y
 * `plame_clave` en texto plano. Se han eliminado.
 */

interface CredentialFieldProps {
  label: string;
  name: keyof SireConfig;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  secret?: boolean;
  reveal?: boolean;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
}

const CredentialField: React.FC<CredentialFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  disabled,
  secret,
  reveal,
  placeholder,
  hint,
  autoComplete = 'off',
}) => {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        <span className="ml-0.5 text-red-500">*</span>
      </label>
      <input
        id={name}
        name={name}
        type={secret && !reveal ? 'password' : 'text'}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        spellCheck={false}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors',
          'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50',
          'focus:outline-none focus:ring-2',
          secret && 'font-mono',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
        )}
      />
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

const SireConfigForm: React.FC<SireConfigProps> = ({
  empresa,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<SireConfig>({
    client_id: '',
    client_secret: '',
    sunat_usuario: '',
    sunat_clave: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (empresa.sire_client_id || empresa.sunat_usuario) {
      setFormData({
        client_id: empresa.sire_client_id || '',
        client_secret: empresa.sire_client_secret || '',
        sunat_usuario: empresa.sunat_usuario || '',
        sunat_clave: empresa.sunat_clave || '',
      });
    }
  }, [empresa]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.client_id.trim()) {
      newErrors.client_id = 'El Client ID es requerido';
    } else if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.client_id)
    ) {
      newErrors.client_id = 'El Client ID debe ser un UUID válido';
    }

    if (!formData.client_secret.trim()) newErrors.client_secret = 'El Client Secret es requerido';
    if (!formData.sunat_usuario.trim()) newErrors.sunat_usuario = 'El Usuario SUNAT es requerido';
    if (!formData.sunat_clave.trim()) newErrors.sunat_clave = 'La Clave SUNAT es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Estado actual */}
      <div
        className={cn(
          'flex items-start gap-3 rounded-lg border px-4 py-3',
          empresa.sire_activo
            ? 'border-green-200 bg-green-50'
            : 'border-amber-200 bg-amber-50'
        )}
      >
        <ShieldCheck
          className={cn(
            'mt-0.5 size-5 shrink-0',
            empresa.sire_activo ? 'text-green-600' : 'text-amber-600'
          )}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p
            className={cn(
              'text-sm font-semibold',
              empresa.sire_activo ? 'text-green-800' : 'text-amber-800'
            )}
          >
            {empresa.sire_activo ? 'SIRE configurado y activo' : 'SIRE sin configurar'}
          </p>
          <p className={cn('text-sm', empresa.sire_activo ? 'text-green-700' : 'text-amber-700')}>
            {empresa.razon_social}
          </p>
        </div>
      </div>

      {/* Credenciales de la API SIRE */}
      <fieldset className="space-y-4">
        <legend className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <KeyRound className="size-4 text-slate-400" aria-hidden="true" />
          Credenciales de la API SIRE
        </legend>

        <CredentialField
          label="Client ID"
          name="client_id"
          value={formData.client_id}
          onChange={handleChange}
          error={errors.client_id}
          disabled={loading}
          placeholder="00000000-0000-0000-0000-000000000000"
          hint="UUID que SUNAT asigna a tu aplicación."
        />

        <CredentialField
          label="Client Secret"
          name="client_secret"
          value={formData.client_secret}
          onChange={handleChange}
          error={errors.client_secret}
          disabled={loading}
          secret
          reveal={reveal}
          autoComplete="new-password"
        />
      </fieldset>

      {/* Credenciales SOL */}
      <fieldset className="space-y-4">
        <legend className="mb-1 text-sm font-semibold text-slate-900">
          Usuario SOL de SUNAT
        </legend>

        <CredentialField
          label="Usuario SUNAT"
          name="sunat_usuario"
          value={formData.sunat_usuario}
          onChange={handleChange}
          error={errors.sunat_usuario}
          disabled={loading}
          placeholder="USUARIO01"
          autoComplete="off"
        />

        <CredentialField
          label="Clave SUNAT"
          name="sunat_clave"
          value={formData.sunat_clave}
          onChange={handleChange}
          error={errors.sunat_clave}
          disabled={loading}
          secret
          reveal={reveal}
          autoComplete="new-password"
        />
      </fieldset>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setReveal((v) => !v)}
          aria-pressed={reveal}
          className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-0 py-1 text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
        >
          {reveal ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
          {reveal ? 'Ocultar credenciales' : 'Mostrar credenciales'}
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-slate-50 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-500">
          Estas credenciales se guardan en el servidor y se usan solo para consultar SIRE en tu
          nombre. Obtén el Client ID y el Client Secret en SUNAT Operaciones en Línea, en la opción
          de registro de aplicaciones.
        </p>
      </div>

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
          Guardar credenciales
        </button>
      </div>
    </form>
  );
};

export default SireConfigForm;
