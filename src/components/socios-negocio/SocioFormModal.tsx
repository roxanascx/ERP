import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Landmark, Loader2, Search } from 'lucide-react';
import type { SocioNegocio } from '../../services/sociosNegocioApi';
import { useSociosNegocio } from '../../hooks';
import Modal from '../common/Modal';
import { CheckboxField, SelectField, TextField } from '../common/FormField';
import { cn } from '../../lib/cn';

interface SocioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (socio: any) => void;
  socio?: SocioNegocio | null;
}

const VACIO = {
  tipo_documento: 'RUC',
  numero_documento: '',
  razon_social: '',
  nombre_comercial: '',
  tipo_socio: 'cliente',
  email: '',
  telefono: '',
  direccion: '',
  // Datos que llegan de la consulta a SUNAT
  estado_contribuyente: '',
  condicion_contribuyente: '',
  domicilio_fiscal: '',
  actividad_economica: '',
  tipo_contribuyente: '',
  activo: true,
};

const SocioFormModal: React.FC<SocioFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  socio = null,
}) => {
  const { consultarRuc, consultarDni } = useSociosNegocio();
  const esEdicion = Boolean(socio);

  const [formData, setFormData] = useState(VACIO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConsultando, setIsConsultando] = useState(false);
  const [consultaMensaje, setConsultaMensaje] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    if (socio) {
      setFormData({
        tipo_documento: socio.tipo_documento,
        numero_documento: socio.numero_documento,
        razon_social: socio.razon_social,
        nombre_comercial: socio.nombre_comercial || '',
        tipo_socio: socio.tipo_socio,
        email: socio.email || '',
        telefono: socio.telefono || '',
        direccion: socio.direccion || '',
        estado_contribuyente: '',
        condicion_contribuyente: '',
        domicilio_fiscal: socio.direccion || '',
        actividad_economica: '',
        tipo_contribuyente: '',
        activo: socio.activo,
      });
    } else {
      setFormData(VACIO);
    }
    setErrors({});
    setConsultaMensaje({ type: null, message: '' });
    setIsSubmitting(false);
  }, [socio, isOpen]);

  // ---------------------------------------------------------------------------
  // Validación
  // ---------------------------------------------------------------------------

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const doc = formData.numero_documento;

    if (!doc.trim()) {
      newErrors.numero_documento = 'El número de documento es requerido';
    } else if (formData.tipo_documento === 'RUC') {
      if (doc.length !== 11) {
        newErrors.numero_documento = 'El RUC debe tener exactamente 11 dígitos';
      } else if (!/^\d{11}$/.test(doc)) {
        newErrors.numero_documento = 'El RUC debe contener solo números';
      } else if (!['10', '15', '17', '20'].includes(doc.substring(0, 2))) {
        newErrors.numero_documento = 'El RUC debe empezar con 10, 15, 17 o 20';
      }
    } else if (formData.tipo_documento === 'DNI') {
      if (doc.length !== 8) {
        newErrors.numero_documento = 'El DNI debe tener exactamente 8 dígitos';
      } else if (!/^\d{8}$/.test(doc)) {
        newErrors.numero_documento = 'El DNI debe contener solo números';
      }
    } else if (formData.tipo_documento === 'CE') {
      if (doc.length < 8 || doc.length > 12) {
        newErrors.numero_documento = 'El carnet de extranjería debe tener entre 8 y 12 caracteres';
      } else if (!/^[A-Za-z0-9]+$/.test(doc)) {
        newErrors.numero_documento = 'El carnet de extranjería solo admite letras y números';
      }
    }

    if (!formData.razon_social.trim()) {
      newErrors.razon_social = 'La razón social es requerida';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------------------------------------------
  // Consulta a SUNAT (RUC) / RENIEC (DNI)
  // ---------------------------------------------------------------------------

  const consultarRucSunat = async () => {
    if (!formData.numero_documento || formData.numero_documento.length !== 11) {
      setErrors((prev) => ({ ...prev, numero_documento: 'El RUC debe tener 11 dígitos' }));
      return;
    }

    setIsConsultando(true);
    setErrors((prev) => ({ ...prev, numero_documento: '' }));
    setConsultaMensaje({ type: null, message: '' });

    try {
      const response = await consultarRuc(formData.numero_documento);

      if (response.success && response.data) {
        setFormData((prev) => ({
          ...prev,
          razon_social: response.data?.razon_social || prev.razon_social,
          nombre_comercial: response.data?.nombre_comercial || prev.nombre_comercial,
          direccion: response.data?.domicilio_fiscal || prev.direccion,
          estado_contribuyente: response.data?.estado_contribuyente || '',
          condicion_contribuyente: response.data?.condicion_contribuyente || '',
          domicilio_fiscal: response.data?.domicilio_fiscal || '',
          actividad_economica: response.data?.actividad_economica || '',
          tipo_contribuyente: response.data?.tipo_contribuyente || '',
        }));

        setConsultaMensaje({
          type: 'success',
          message: `Datos actualizados desde SUNAT: ${response.data.razon_social}`,
        });
        setTimeout(() => setConsultaMensaje({ type: null, message: '' }), 4000);
      } else {
        setConsultaMensaje({
          type: 'error',
          message: response.error || 'No se pudieron obtener datos de SUNAT',
        });
      }
    } catch {
      setConsultaMensaje({
        type: 'error',
        message: 'Error de conexión al consultar SUNAT. Revisa tu conexión e inténtalo de nuevo.',
      });
    } finally {
      setIsConsultando(false);
    }
  };

  const consultarDniReniec = async () => {
    if (!formData.numero_documento || formData.numero_documento.length !== 8) {
      setErrors((prev) => ({ ...prev, numero_documento: 'El DNI debe tener 8 dígitos' }));
      return;
    }

    setIsConsultando(true);
    setErrors((prev) => ({ ...prev, numero_documento: '' }));
    setConsultaMensaje({ type: null, message: '' });

    try {
      const response = await consultarDni(formData.numero_documento);

      if (response.success && response.data) {
        const nombreCompleto = [
          response.data.nombres,
          response.data.apellido_paterno,
          response.data.apellido_materno,
        ]
          .filter(Boolean)
          .join(' ');

        setFormData((prev) => ({
          ...prev,
          razon_social: nombreCompleto || prev.razon_social,
          direccion: response.data?.direccion || prev.direccion,
        }));

        setConsultaMensaje({
          type: 'success',
          message: `Datos actualizados desde RENIEC: ${nombreCompleto}`,
        });
        setTimeout(() => setConsultaMensaje({ type: null, message: '' }), 4000);
      } else {
        setConsultaMensaje({
          type: 'error',
          message: response.error || 'No se pudieron obtener datos de RENIEC',
        });
      }
    } catch {
      setConsultaMensaje({
        type: 'error',
        message: 'Error de conexión al consultar RENIEC. Revisa tu conexión e inténtalo de nuevo.',
      });
    } finally {
      setIsConsultando(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Envío
  // ---------------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      let errorMessage = 'Error al guardar el socio';

      const detail = error.response?.data?.detail;
      if (typeof detail === 'string') errorMessage = detail;
      else if (detail?.message) errorMessage = detail.message;
      else if (error.message) errorMessage = error.message;

      // El backend distingue estos casos; se muestran donde corresponde.
      if (errorMessage.includes('No hay empresa seleccionada')) {
        setConsultaMensaje({
          type: 'error',
          message: 'No hay empresa seleccionada. Elige una empresa antes de crear el socio.',
        });
      } else if (errorMessage.includes('Dígito verificador')) {
        setErrors((prev) => ({ ...prev, numero_documento: errorMessage }));
      } else if (errorMessage.includes('ya existe')) {
        setErrors((prev) => ({ ...prev, numero_documento: 'Este documento ya está registrado' }));
      } else {
        setConsultaMensaje({ type: 'error', message: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const next = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: next }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const tieneDatosSunat = Boolean(
    formData.estado_contribuyente ||
      formData.condicion_contribuyente ||
      formData.domicilio_fiscal ||
      formData.actividad_economica ||
      formData.tipo_contribuyente
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={socio ? 'Editar socio de negocio' : 'Nuevo socio de negocio'}
      description={
        socio
          ? 'Modifica los datos del socio de negocio.'
          : 'Completa los datos del nuevo socio de negocio.'
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="socio-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {socio ? 'Guardar cambios' : 'Crear socio'}
          </button>
        </>
      }
    >
      <form id="socio-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Tipo de documento"
            name="tipo_documento"
            required
            value={formData.tipo_documento}
            onChange={handleInputChange}
            disabled={esEdicion}
          >
            <option value="RUC">RUC</option>
            <option value="DNI">DNI</option>
            <option value="CE">Carnet de extranjería</option>
          </SelectField>

          <div>
            <TextField
              label="Número de documento"
              name="numero_documento"
              required
              value={formData.numero_documento}
              onChange={handleInputChange}
              error={errors.numero_documento}
              placeholder={formData.tipo_documento === 'RUC' ? '20123456789' : '12345678'}
              inputMode="numeric"
              className="font-mono"
              disabled={esEdicion}
            />

            {!esEdicion && formData.tipo_documento === 'RUC' && (
              <button
                type="button"
                onClick={consultarRucSunat}
                disabled={isConsultando}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                {isConsultando ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Search className="size-4" aria-hidden="true" />
                )}
                {isConsultando ? 'Consultando SUNAT…' : 'Consultar SUNAT'}
              </button>
            )}

            {!esEdicion && formData.tipo_documento === 'DNI' && (
              <button
                type="button"
                onClick={consultarDniReniec}
                disabled={isConsultando}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                {isConsultando ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Search className="size-4" aria-hidden="true" />
                )}
                {isConsultando ? 'Consultando RENIEC…' : 'Consultar RENIEC'}
              </button>
            )}
          </div>
        </div>

        {consultaMensaje.type && (
          <p
            role="status"
            className={cn(
              'flex items-start gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium',
              consultaMensaje.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            )}
          >
            {consultaMensaje.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            {consultaMensaje.message}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Razón social"
            name="razon_social"
            required
            value={formData.razon_social}
            onChange={handleInputChange}
            error={errors.razon_social}
            placeholder="Razón social completa"
          />

          <TextField
            label="Nombre comercial"
            name="nombre_comercial"
            value={formData.nombre_comercial}
            onChange={handleInputChange}
            placeholder="Opcional"
          />

          <SelectField
            label="Tipo de socio"
            name="tipo_socio"
            required
            full
            value={formData.tipo_socio}
            onChange={handleInputChange}
          >
            <option value="cliente">Cliente</option>
            <option value="proveedor">Proveedor</option>
            <option value="ambos">Cliente y proveedor</option>
          </SelectField>

          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            placeholder="correo@empresa.com"
          />

          <TextField
            label="Teléfono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleInputChange}
            placeholder="999 999 999"
          />

          <TextField
            label="Dirección"
            name="direccion"
            full
            value={formData.direccion}
            onChange={handleInputChange}
            placeholder="Dirección del socio"
          />
        </div>

        {/* Datos traídos de SUNAT: solo lectura */}
        {tieneDatosSunat && (
          <fieldset className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-900">
              <Landmark className="size-4 text-slate-400" aria-hidden="true" />
              Información de SUNAT
            </legend>

            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <TextField
                label="Estado del contribuyente"
                name="estado_contribuyente"
                value={formData.estado_contribuyente}
                onChange={handleInputChange}
                readOnly
              />
              <TextField
                label="Condición del contribuyente"
                name="condicion_contribuyente"
                value={formData.condicion_contribuyente}
                onChange={handleInputChange}
                readOnly
              />
              <TextField
                label="Domicilio fiscal"
                name="domicilio_fiscal"
                full
                value={formData.domicilio_fiscal}
                onChange={handleInputChange}
                readOnly
              />
              <TextField
                label="Actividad económica"
                name="actividad_economica"
                value={formData.actividad_economica}
                onChange={handleInputChange}
                readOnly
              />
              <TextField
                label="Tipo de contribuyente"
                name="tipo_contribuyente"
                value={formData.tipo_contribuyente}
                onChange={handleInputChange}
                readOnly
              />
            </div>
          </fieldset>
        )}

        <CheckboxField
          label="Socio activo"
          name="activo"
          checked={formData.activo}
          onChange={handleInputChange}
        />
      </form>
    </Modal>
  );
};

export default SocioFormModal;
