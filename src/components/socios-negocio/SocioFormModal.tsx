import React, { useState, useEffect } from 'react';
import type { SocioNegocio } from '../../services/sociosNegocioApi';
import { useSociosNegocio } from '../../hooks';

interface SocioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (socio: any) => void;
  socio?: SocioNegocio | null;
}

const SocioFormModal: React.FC<SocioFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  socio = null
}) => {
  const { consultarRuc } = useSociosNegocio();
  
  const [formData, setFormData] = useState({
    tipo_documento: 'RUC',
    numero_documento: '',
    razon_social: '',
    nombre_comercial: '',
    tipo_socio: 'cliente',
    email: '',
    telefono: '',
    direccion: '',
    activo: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingRuc, setIsLoadingRuc] = useState(false);
  const [rucConsultaMessage, setRucConsultaMessage] = useState<{
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
        activo: socio.activo
      });
    } else {
      setFormData({
        tipo_documento: 'RUC',
        numero_documento: '',
        razon_social: '',
        nombre_comercial: '',
        tipo_socio: 'cliente',
        email: '',
        telefono: '',
        direccion: '',
        activo: true
      });
    }
    setErrors({});
    setIsSubmitting(false);
  }, [socio, isOpen]);

  const modalStyles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'hidden',
      position: 'relative' as const
    },
    header: {
      padding: '24px 24px 0 24px',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '0 0 16px 0'
    },
    closeButton: {
      position: 'absolute' as const,
      top: '20px',
      right: '20px',
      background: 'none',
      border: 'none',
      fontSize: '24px',
      color: '#6b7280',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'color 0.2s ease'
    },
    body: {
      padding: '0 24px',
      maxHeight: 'calc(90vh - 160px)',
      overflowY: 'auto' as const
    },
    form: {
      display: 'grid',
      gap: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '12px 14px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      outline: 'none'
    },
    select: {
      padding: '12px 14px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      outline: 'none'
    },
    error: {
      fontSize: '12px',
      color: '#ef4444',
      marginTop: '4px'
    },
    consultaMessage: {
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      marginTop: '8px',
      fontWeight: '500'
    },
    consultaSuccess: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #a7f3d0'
    },
    consultaError: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fca5a5'
    },
    footer: {
      padding: '24px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '24px'
    },
    button: {
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'background-color 0.2s ease'
    },
    buttonSecondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    buttonPrimary: {
      backgroundColor: '#3b82f6',
      color: '#ffffff'
    },
    buttonDisabled: {
      backgroundColor: '#d1d5db',
      color: '#9ca3af',
      cursor: 'not-allowed'
    },
    rucButton: {
      padding: '8px 12px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      marginTop: '8px'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 0'
    },
    checkboxInput: {
      width: '16px',
      height: '16px',
      cursor: 'pointer'
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.numero_documento.trim()) {
      newErrors.numero_documento = 'El número de documento es requerido';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar socio:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const consultarRucSunat = async () => {
    if (!formData.numero_documento || formData.numero_documento.length !== 11) {
      setErrors(prev => ({
        ...prev,
        numero_documento: 'El RUC debe tener 11 dígitos'
      }));
      return;
    }

    setIsLoadingRuc(true);
    setErrors(prev => ({
      ...prev,
      numero_documento: ''
    }));
    setRucConsultaMessage({ type: null, message: '' });

    try {
      console.log('🔍 Consultando RUC en SUNAT:', formData.numero_documento);
      
      // Llamada real a la API de consulta RUC
      const response = await consultarRuc(formData.numero_documento);
      
      if (response.success && response.data) {
        console.log('✅ Datos obtenidos de SUNAT:', response.data);
        
        // Autocompletar formulario con datos de SUNAT
        setFormData(prev => ({
          ...prev,
          razon_social: response.data?.razon_social || prev.razon_social,
          nombre_comercial: response.data?.nombre_comercial || prev.nombre_comercial,
          direccion: response.data?.domicilio_fiscal || prev.direccion,
          // Mantener otros campos como están si no vienen en la respuesta
        }));

        // Mostrar mensaje de éxito
        setRucConsultaMessage({
          type: 'success',
          message: `✅ Datos actualizados desde SUNAT: ${response.data.razon_social}`
        });
        
        // Limpiar mensaje después de 4 segundos
        setTimeout(() => {
          setRucConsultaMessage({ type: null, message: '' });
        }, 4000);
        
      } else {
        // Error en la consulta
        const errorMsg = response.error || 'No se pudieron obtener datos de SUNAT';
        console.error('❌ Error en consulta SUNAT:', errorMsg);
        
        setRucConsultaMessage({
          type: 'error',
          message: `❌ ${errorMsg}`
        });
      }
    } catch (error) {
      console.error('❌ Error al consultar RUC:', error);
      setRucConsultaMessage({
        type: 'error',
        message: '❌ Error de conexión al consultar SUNAT. Verifique su conexión e intente nuevamente.'
      });
    } finally {
      setIsLoadingRuc(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <button 
          style={modalStyles.closeButton}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          ×
        </button>

        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>
            {socio ? 'Editar Socio de Negocio' : 'Agregar Socio de Negocio'}
          </h2>
          <p style={modalStyles.subtitle}>
            {socio ? 'Modifica los datos del socio de negocio' : 'Completa los datos del nuevo socio de negocio'}
          </p>
        </div>

        <div style={modalStyles.body}>
          <form onSubmit={handleSubmit} style={modalStyles.form}>
            {/* Tipo y número de documento */}
            <div style={modalStyles.formRow}>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Tipo de Documento *</label>
                <select
                  name="tipo_documento"
                  value={formData.tipo_documento}
                  onChange={handleInputChange}
                  style={modalStyles.select}
                >
                  <option value="RUC">RUC</option>
                  <option value="DNI">DNI</option>
                  <option value="CE">Carnet de Extranjería</option>
                </select>
              </div>

              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Número de Documento *</label>
                <input
                  type="text"
                  name="numero_documento"
                  value={formData.numero_documento}
                  onChange={handleInputChange}
                  style={{
                    ...modalStyles.input,
                    ...(errors.numero_documento ? { borderColor: '#ef4444' } : {})
                  }}
                  placeholder="Ingrese el número"
                />
                {formData.tipo_documento === 'RUC' && formData.numero_documento.length === 11 && (
                  <button
                    type="button"
                    onClick={consultarRucSunat}
                    disabled={isLoadingRuc}
                    style={{
                      ...modalStyles.rucButton,
                      opacity: isLoadingRuc ? 0.6 : 1
                    }}
                  >
                    {isLoadingRuc ? '🔄 Consultando SUNAT...' : '🔍 Consultar SUNAT'}
                  </button>
                )}
                {errors.numero_documento && (
                  <div style={modalStyles.error}>{errors.numero_documento}</div>
                )}
                {rucConsultaMessage.type && (
                  <div style={{
                    ...modalStyles.consultaMessage,
                    ...(rucConsultaMessage.type === 'success' ? modalStyles.consultaSuccess : modalStyles.consultaError)
                  }}>
                    {rucConsultaMessage.message}
                  </div>
                )}
              </div>
            </div>

            {/* Razón social y nombre comercial */}
            <div style={modalStyles.formRow}>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Razón Social *</label>
                <input
                  type="text"
                  name="razon_social"
                  value={formData.razon_social}
                  onChange={handleInputChange}
                  style={{
                    ...modalStyles.input,
                    ...(errors.razon_social ? { borderColor: '#ef4444' } : {})
                  }}
                  placeholder="Razón social completa"
                />
                {errors.razon_social && (
                  <div style={modalStyles.error}>{errors.razon_social}</div>
                )}
              </div>

              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Nombre Comercial</label>
                <input
                  type="text"
                  name="nombre_comercial"
                  value={formData.nombre_comercial}
                  onChange={handleInputChange}
                  style={modalStyles.input}
                  placeholder="Nombre comercial (opcional)"
                />
              </div>
            </div>

            {/* Tipo de socio */}
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Tipo de Socio *</label>
              <select
                name="tipo_socio"
                value={formData.tipo_socio}
                onChange={handleInputChange}
                style={modalStyles.select}
              >
                <option value="cliente">Cliente</option>
                <option value="proveedor">Proveedor</option>
                <option value="ambos">Cliente y Proveedor</option>
              </select>
            </div>

            {/* Email y teléfono */}
            <div style={modalStyles.formRow}>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    ...modalStyles.input,
                    ...(errors.email ? { borderColor: '#ef4444' } : {})
                  }}
                  placeholder="correo@empresa.com"
                />
                {errors.email && (
                  <div style={modalStyles.error}>{errors.email}</div>
                )}
              </div>

              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  style={modalStyles.input}
                  placeholder="999 999 999"
                />
              </div>
            </div>

            {/* Dirección */}
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                style={modalStyles.input}
                placeholder="Dirección completa"
              />
            </div>

            {/* Estado activo */}
            <div style={modalStyles.checkbox}>
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleInputChange}
                style={modalStyles.checkboxInput}
              />
              <label style={modalStyles.label}>Socio activo</label>
            </div>
          </form>
        </div>

        <div style={modalStyles.footer}>
          <button
            type="button"
            onClick={onClose}
            style={{
              ...modalStyles.button,
              ...modalStyles.buttonSecondary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              ...modalStyles.button,
              ...(isSubmitting ? modalStyles.buttonDisabled : modalStyles.buttonPrimary)
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {isSubmitting ? '⏳ Guardando...' : (socio ? 'Actualizar' : 'Crear Socio')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocioFormModal;
