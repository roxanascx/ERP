import React from 'react';
import { cn } from '../../lib/cn';

type BaseProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Ocupa las dos columnas en una rejilla de formulario */
  full?: boolean;
};

export const fieldControl = (error?: boolean) =>
  cn(
    'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors',
    'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
    'focus:ring-2 focus:outline-none',
    error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
  );

/**
 * Envoltura de campo: etiqueta, control, error y ayuda, con los `aria-*`
 * enlazados. Cada formulario del proyecto repetia estas tres cosas a mano con
 * estilos inline y sin `htmlFor`, asi que pulsar la etiqueta no enfocaba el
 * campo y los lectores de pantalla no anunciaban el error.
 */
export const FieldShell: React.FC<BaseProps & { children: React.ReactNode }> = ({
  label,
  name,
  error,
  hint,
  required,
  full,
  children,
}) => (
  <div className={cn(full && 'sm:col-span-2')}>
    <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>

    {children}

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

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

export const TextField: React.FC<InputProps> = ({
  label,
  name,
  error,
  hint,
  required,
  full,
  className,
  ...props
}) => (
  <FieldShell label={label} name={name} error={error} hint={hint} required={required} full={full}>
    <input
      id={name}
      name={name}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
      className={cn(fieldControl(Boolean(error)), className)}
      {...props}
    />
  </FieldShell>
);

type SelectProps = BaseProps & React.SelectHTMLAttributes<HTMLSelectElement>;

export const SelectField: React.FC<SelectProps> = ({
  label,
  name,
  error,
  hint,
  required,
  full,
  className,
  children,
  ...props
}) => (
  <FieldShell label={label} name={name} error={error} hint={hint} required={required} full={full}>
    <select
      id={name}
      name={name}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
      className={cn(fieldControl(Boolean(error)), className)}
      {...props}
    >
      {children}
    </select>
  </FieldShell>
);

type TextareaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextareaField: React.FC<TextareaProps> = ({
  label,
  name,
  error,
  hint,
  required,
  full,
  className,
  rows = 3,
  ...props
}) => (
  <FieldShell label={label} name={name} error={error} hint={hint} required={required} full={full}>
    <textarea
      id={name}
      name={name}
      rows={rows}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
      className={cn(fieldControl(Boolean(error)), 'resize-y', className)}
      {...props}
    />
  </FieldShell>
);

type CheckboxProps = Omit<BaseProps, 'full'> & React.InputHTMLAttributes<HTMLInputElement>;

export const CheckboxField: React.FC<CheckboxProps> = ({
  label,
  name,
  hint,
  className,
  ...props
}) => (
  <label
    htmlFor={name}
    className={cn('flex cursor-pointer items-start gap-2.5 text-sm text-slate-700', className)}
  >
    <input
      id={name}
      name={name}
      type="checkbox"
      className="mt-0.5 size-4 shrink-0 cursor-pointer accent-blue-600"
      {...props}
    />
    <span>
      {label}
      {hint && <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>}
    </span>
  </label>
);
