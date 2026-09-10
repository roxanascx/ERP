import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../../common/Modal';
import { SelectField, TextField } from '../../common/FormField';

interface NuevoLibroData {
  descripcion: string;
  periodo: string;
  estado: 'borrador' | 'finalizado' | 'enviado';
}

interface CrearLibroModalProps {
  onGuardar: (datos: NuevoLibroData) => Promise<void>;
  onCerrar: () => void;
  loading?: boolean;
}

/**
 * Alta de libro diario.
 * Usa el Modal compartido en vez de montar su propio overlay.
 */
const CrearLibroModal: React.FC<CrearLibroModalProps> = ({
  onGuardar,
  onCerrar,
  loading = false,
}) => {
  const [nuevoLibro, setNuevoLibro] = useState<NuevoLibroData>({
    descripcion: '',
    periodo: new Date().getFullYear().toString(),
    estado: 'borrador',
  });
  const [errores, setErrores] = useState<Partial<NuevoLibroData>>({});
  const [guardando, setGuardando] = useState(false);

  const isLoading = loading || guardando;

  const set = (campo: keyof NuevoLibroData, valor: string) => {
    setNuevoLibro((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Partial<NuevoLibroData> = {};
    if (!nuevoLibro.descripcion.trim()) nuevosErrores.descripcion = 'La descripción es requerida';
    if (!nuevoLibro.periodo.trim()) nuevosErrores.periodo = 'El período es requerido';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      // El padre cierra el modal cuando el guardado sale bien.
      await onGuardar(nuevoLibro);
    } catch (error) {
      console.error('Error al guardar el libro:', error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onCerrar}
      title="Nuevo libro diario"
      description="Completa la información del nuevo libro contable."
      footer={
        <>
          <button
            type="button"
            onClick={onCerrar}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="crear-libro-form"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Crear libro
          </button>
        </>
      }
    >
      <form id="crear-libro-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        <TextField
          label="Descripción del libro"
          name="descripcion"
          value={nuevoLibro.descripcion}
          onChange={(e) => set('descripcion', e.target.value)}
          error={errores.descripcion}
          required
          disabled={isLoading}
          placeholder="Ej: Libro Diario Enero 2026"
        />

        <TextField
          label="Período"
          name="periodo"
          value={nuevoLibro.periodo}
          onChange={(e) => set('periodo', e.target.value)}
          error={errores.periodo}
          required
          disabled={isLoading}
          placeholder="Ej: 2026 o 2026-01"
          hint="Puedes indicar el ejercicio completo o un mes concreto."
        />

        <SelectField
          label="Estado"
          name="estado"
          value={nuevoLibro.estado}
          onChange={(e) => set('estado', e.target.value)}
          disabled={isLoading}
        >
          <option value="borrador">Borrador</option>
          <option value="finalizado">Finalizado</option>
          <option value="enviado">Enviado</option>
        </SelectField>
      </form>
    </Modal>
  );
};

export default CrearLibroModal;
