import React, { useState, useEffect } from 'react';
import type { EmpresaFormProps, EmpresaCreate, EmpresaUpdate } from '../../types/empresa';

const EmpresaForm: React.FC<EmpresaFormProps> = ({
  empresa,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    ruc: '',
    razon_social: '',
    direccion: '',
    telefono: '',
    email: '',
    notas_internas: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const isEditing = Boolean(empresa);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (empresa) {
      setFormData({
        ruc: empresa.ruc,
        razon_social: empresa.razon_social,
        direccion: empresa.direccion || '',
        telefono: empresa.telefono || '',
        email: empresa.email || '',
        notas_internas: empresa.notas_internas || ''
      });
    }
  }, [empresa]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // RUC requerido solo al crear
    if (!isEditing && !formData.ruc.trim()) {
      newErrors.ruc = 'El RUC es requerido';
    } else if (!isEditing && !/^\d{11}$/.test(formData.ruc)) {
      newErrors.ruc = 'El RUC debe tener 11 dígitos';
    }

    // Razón social requerida
    if (!formData.razon_social.trim()) {
      newErrors.razon_social = 'La razón social es requerida';
    }

    // Email válido si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitError(''); // Limpiar errores previos
    
    try {
      if (isEditing) {
        // Actualizar: solo enviar campos modificados
        const updateData: EmpresaUpdate = {
          razon_social: formData.razon_social,
          direccion: formData.direccion || undefined,
          telefono: formData.telefono || undefined,
          email: formData.email || undefined,
          notas_internas: formData.notas_internas || undefined
        };
        onSubmit(updateData);
      } else {
        // Crear: enviar datos completos
        const createData: EmpresaCreate = {
          ruc: formData.ruc,
          razon_social: formData.razon_social,
          direccion: formData.direccion || undefined,
          telefono: formData.telefono || undefined,
          email: formData.email || undefined
        };
        onSubmit(createData);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: 'clamp(10px, 2.5vw, 12px)',
    fontSize: 'clamp(13px, 3.5vw, 14px)',
    border: '1px solid #d1d5db',
    borderRadius: 'clamp(4px, 1vw, 6px)',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#374151',
    lineHeight: '1.5',
  };

  const errorInputStyle = {
    ...inputStyle,
    border: '1px solid #ef4444',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    backgroundColor: '#fef2f2',
  };

  return (
    <>
      {/* Overlay del modal */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }}
        onClick={onCancel}
      />
      
      {/* Contenedor del modal - Responsivo */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: 'clamp(8px, 2vw, 12px)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), 0 10px 30px rgba(0, 0, 0, 0.1)',
        maxWidth: 'min(95vw, 650px)',
        width: '100%',
        maxHeight: 'min(95vh, 90vh)',
        overflowY: 'auto',
        zIndex: 1000,
        padding: '0',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}>
        {/* Header del modal - Responsivo */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'clamp(16px, 4vw, 24px)',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          borderRadius: 'clamp(8px, 2vw, 12px) clamp(8px, 2vw, 12px) 0 0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(16px, 4vw, 20px)',
            fontWeight: '700',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1.5vw, 8px)',
            letterSpacing: '-0.025em',
          }}>
            {isEditing ? '✏️ Editar Empresa' : '🏢 Nueva Empresa'}
            {isEditing && empresa && (
              <span style={{ 
                fontSize: 'clamp(12px, 3vw, 14px)', 
                color: '#6b7280', 
                fontWeight: '500' 
              }}>
                - {empresa.ruc}
              </span>
            )}
          </h2>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 'clamp(18px, 4vw, 20px)',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#6b7280',
              padding: 'clamp(6px, 1.5vw, 8px)',
              borderRadius: 'clamp(4px, 1vw, 6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s ease',
              minWidth: '32px',
              minHeight: '32px',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }
            }}
            title="Cerrar"
          >
            ✖️
          </button>
        </div>

        {/* Contenido del formulario - Responsivo */}
        <div style={{ padding: 'clamp(16px, 4vw, 24px)' }}>
          {/* Mostrar error de submit si existe - Responsivo */}
          {submitError && (
            <div style={{
              marginBottom: 'clamp(16px, 4vw, 20px)',
              padding: 'clamp(12px, 3vw, 16px)',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
              borderRadius: 'clamp(4px, 1vw, 6px)',
              fontSize: 'clamp(12px, 3vw, 14px)',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(6px, 1.5vw, 8px)',
              lineHeight: '1.5',
            }}>
              <span style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>❌</span>
              <span style={{ flex: 1 }}>{submitError}</span>
              <button
                type="button"
                onClick={() => setSubmitError('')}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: '#991b1b',
                  cursor: 'pointer',
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  padding: '4px',
                  borderRadius: '2px',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ✖️
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
        {/* RUC - Solo al crear - Responsivo */}
        {!isEditing && (
          <div style={{ marginBottom: 'clamp(16px, 4vw, 20px)' }}>
            <label style={{
              display: 'block',
              marginBottom: 'clamp(4px, 1vw, 6px)',
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: '600',
              color: '#374151',
              letterSpacing: '0.025em',
            }}>
              RUC *
            </label>
            <input
              type="text"
              name="ruc"
              value={formData.ruc}
              onChange={handleChange}
              placeholder="Ingrese el RUC (11 dígitos)"
              style={errors.ruc ? errorInputStyle : inputStyle}
              disabled={loading}
              maxLength={11}
            />
            {errors.ruc && (
              <span style={{
                display: 'block',
                marginTop: 'clamp(2px, 0.5vw, 4px)',
                fontSize: 'clamp(11px, 2.5vw, 12px)',
                color: '#ef4444',
                fontWeight: '500',
              }}>
                {errors.ruc}
              </span>
            )}
          </div>
        )}

        {/* Razón Social - Responsivo */}
        <div style={{ marginBottom: 'clamp(16px, 4vw, 20px)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 6px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            fontWeight: '600',
            color: '#374151',
            letterSpacing: '0.025em',
          }}>
            Razón Social *
          </label>
          <input
            type="text"
            name="razon_social"
            value={formData.razon_social}
            onChange={handleChange}
            placeholder="Ingrese la razón social"
            style={errors.razon_social ? errorInputStyle : inputStyle}
            disabled={loading}
          />
          {errors.razon_social && (
            <span style={{
              display: 'block',
              marginTop: 'clamp(2px, 0.5vw, 4px)',
              fontSize: 'clamp(11px, 2.5vw, 12px)',
              color: '#ef4444',
              fontWeight: '500',
            }}>
              {errors.razon_social}
            </span>
          )}
        </div>

        {/* Dirección - Responsivo */}
        <div style={{ marginBottom: 'clamp(16px, 4vw, 20px)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 6px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            fontWeight: '600',
            color: '#374151',
            letterSpacing: '0.025em',
          }}>
            Dirección
          </label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Ingrese la dirección (opcional)"
            style={inputStyle}
            disabled={loading}
          />
        </div>

        {/* Teléfono y Email - Grid Responsivo */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', 
          gap: 'clamp(12px, 3vw, 16px)', 
          marginBottom: 'clamp(16px, 4vw, 20px)' 
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: 'clamp(4px, 1vw, 6px)',
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: '600',
              color: '#374151',
              letterSpacing: '0.025em',
            }}>
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Teléfono (opcional)"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: 'clamp(4px, 1vw, 6px)',
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: '600',
              color: '#374151',
              letterSpacing: '0.025em',
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email (opcional)"
              style={errors.email ? errorInputStyle : inputStyle}
              disabled={loading}
            />
            {errors.email && (
              <span style={{
                display: 'block',
                marginTop: 'clamp(2px, 0.5vw, 4px)',
                fontSize: 'clamp(11px, 2.5vw, 12px)',
                color: '#ef4444',
                fontWeight: '500',
              }}>
                {errors.email}
              </span>
            )}
          </div>
        </div>

        {/* Notas internas - Responsivo */}
        <div style={{ marginBottom: 'clamp(20px, 5vw, 24px)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 6px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            fontWeight: '600',
            color: '#374151',
            letterSpacing: '0.025em',
          }}>
            Notas Internas
          </label>
          <textarea
            name="notas_internas"
            value={formData.notas_internas}
            onChange={handleChange}
            placeholder="Notas adicionales sobre la empresa (opcional)"
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: 'clamp(60px, 15vw, 80px)',
              fontFamily: 'inherit',
            }}
            disabled={loading}
          />
        </div>

        {/* Botones - Responsivo */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 'clamp(8px, 2vw, 12px)',
          justifyContent: 'flex-end',
          paddingTop: 'clamp(12px, 3vw, 16px)',
          borderTop: '1px solid #e5e7eb',
          marginTop: 'clamp(20px, 5vw, 24px)',
          flexWrap: 'wrap-reverse',
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px)',
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: '600',
              border: '1px solid #6b7280',
              borderRadius: 'clamp(4px, 1vw, 6px)',
              backgroundColor: 'white',
              color: '#6b7280',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(4px, 1vw, 6px)',
              minHeight: '44px',
              minWidth: 'clamp(100px, 25vw, 120px)',
              justifyContent: 'center',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#6b7280';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <span style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>❌</span>
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px)',
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: '600',
              border: 'none',
              borderRadius: 'clamp(4px, 1vw, 6px)',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(4px, 1vw, 6px)',
              minHeight: '44px',
              minWidth: 'clamp(120px, 30vw, 150px)',
              justifyContent: 'center',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.25)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.25)';
              }
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 'clamp(14px, 3.5vw, 16px)',
                  height: 'clamp(14px, 3.5vw, 16px)',
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                <span style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>
                  {isEditing ? '💾' : '✅'}
                </span>
                {isEditing ? 'Actualizar' : 'Crear Empresa'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Estilos CSS responsivos mejorados */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Mejoras para dispositivos móviles */
          @media (max-width: 768px) {
            .empresa-modal-buttons {
              flex-direction: column-reverse !important;
              gap: 8px !important;
            }
            
            .empresa-modal-buttons button {
              width: 100% !important;
              min-width: unset !important;
            }
            
            .empresa-form-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
          }
          
          @media (max-width: 480px) {
            .empresa-modal-container {
              margin: 8px !important;
              max-height: calc(100vh - 16px) !important;
              width: calc(100vw - 16px) !important;
              max-width: unset !important;
            }
            
            .empresa-modal-header {
              padding: 12px !important;
            }
            
            .empresa-modal-content {
              padding: 16px !important;
            }
          }
          
          /* Mejoras para inputs en dispositivos táctiles */
          @media (hover: none) {
            input:focus, textarea:focus {
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            }
            
            button:hover {
              transform: none !important;
            }
          }
          
          /* Mejoras de accesibilidad */
          input:focus, textarea:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            outline: none;
          }
          
          /* Scroll suave en el modal */
          .empresa-modal-container {
            scroll-behavior: smooth;
          }
          
          /* Mejoras para la legibilidad */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
        </div>
      </div>
    </>
  );
};

export default EmpresaForm;
