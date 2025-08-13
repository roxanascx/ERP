import React, { useState, useEffect } from 'react';
import type { SireConfigProps, SireConfig } from '../../types/empresa';

const SireConfigForm: React.FC<SireConfigProps> = ({
  empresa,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<SireConfig>({
    client_id: '',
    client_secret: '',
    sunat_usuario: '',
    sunat_clave: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState(false);

  // Cargar datos existentes si los hay
  useEffect(() => {
    if (empresa.sire_client_id) {
      setFormData({
        client_id: empresa.sire_client_id,
        client_secret: empresa.sire_client_secret || '',
        sunat_usuario: empresa.sunat_usuario || '',
        sunat_clave: empresa.sunat_clave || ''
      });
    }
  }, [empresa]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.client_id.trim()) {
      newErrors.client_id = 'El Client ID es requerido';
    }

    if (!formData.client_secret.trim()) {
      newErrors.client_secret = 'El Client Secret es requerido';
    }

    if (!formData.sunat_usuario.trim()) {
      newErrors.sunat_usuario = 'El Usuario SUNAT es requerido';
    }

    if (!formData.sunat_clave.trim()) {
      newErrors.sunat_clave = 'La Clave SUNAT es requerida';
    }

    // Validar formato de Client ID (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (formData.client_id && !uuidRegex.test(formData.client_id)) {
      newErrors.client_id = 'El Client ID debe ser un UUID válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
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
    <div style={{
      backgroundColor: 'white',
      padding: 'clamp(16px, 4vw, 24px)',
      borderRadius: 'clamp(8px, 2vw, 12px)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)',
      maxWidth: 'min(95vw, 750px)',
      margin: '0 auto',
      border: '1px solid #e5e7eb',
    }}>
      {/* Header - Responsivo */}
      <div style={{
        marginBottom: 'clamp(20px, 5vw, 24px)',
        paddingBottom: 'clamp(12px, 3vw, 16px)',
        borderBottom: '2px solid #3b82f6',
      }}>
        <h2 style={{
          margin: '0 0 clamp(6px, 1.5vw, 8px) 0',
          fontSize: 'clamp(18px, 4.5vw, 24px)',
          fontWeight: '700',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(6px, 1.5vw, 8px)',
          letterSpacing: '-0.025em',
        }}>
          🔐 Configuración SIRE
        </h2>
        <div style={{
          fontSize: 'clamp(14px, 3.5vw, 16px)',
          color: '#6b7280',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'clamp(6px, 1.5vw, 8px)',
          lineHeight: '1.5',
        }}>
          <strong style={{ color: '#1f2937' }}>{empresa.ruc}</strong> 
          <span style={{ color: '#9ca3af' }}>-</span>
          <span style={{ 
            wordBreak: 'break-word',
            flex: '1',
            minWidth: '200px',
          }}>
            {empresa.razon_social}
          </span>
          {empresa.sire_activo && (
            <span style={{
              fontSize: 'clamp(10px, 2.5vw, 12px)',
              padding: '4px clamp(8px, 2vw, 12px)',
              borderRadius: 'clamp(12px, 3vw, 16px)',
              backgroundColor: '#22c55e',
              color: 'white',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
            }}>
              ✅ SIRE ACTIVO
            </span>
          )}
        </div>
      </div>

      {/* Información importante - Responsivo */}
      <div style={{
        marginBottom: 'clamp(20px, 5vw, 24px)',
        padding: 'clamp(12px, 3vw, 16px)',
        backgroundColor: '#fffbeb',
        border: '1px solid #f59e0b',
        borderRadius: 'clamp(4px, 1vw, 6px)',
        borderLeft: '4px solid #f59e0b',
      }}>
        <h4 style={{
          margin: '0 0 clamp(6px, 1.5vw, 8px) 0',
          fontSize: 'clamp(14px, 3.5vw, 16px)',
          color: '#92400e',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(4px, 1vw, 6px)',
        }}>
          <span style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>⚠️</span>
          Información Importante sobre SIRE
        </h4>
        <ul style={{
          margin: 0,
          paddingLeft: 'clamp(16px, 4vw, 20px)',
          fontSize: 'clamp(12px, 3vw, 14px)',
          color: '#92400e',
          lineHeight: '1.6',
        }}>
          <li style={{ marginBottom: 'clamp(4px, 1vw, 6px)' }}>
            Las <strong>Credenciales de API SUNAT</strong> se obtienen desde el Portal SOL
          </li>
          <li style={{ marginBottom: 'clamp(4px, 1vw, 6px)' }}>
            <strong>Client ID</strong>: UUID generado al registrar tu aplicación en SUNAT
          </li>
          <li style={{ marginBottom: 'clamp(4px, 1vw, 6px)' }}>
            <strong>Client Secret</strong>: Clave secreta asociada al Client ID
          </li>
          <li style={{ marginBottom: 'clamp(4px, 1vw, 6px)' }}>
            <strong>Usuario SOL</strong>: Tu usuario SUNAT (DNI o código de usuario)
          </li>
          <li style={{ marginBottom: 'clamp(4px, 1vw, 6px)' }}>
            <strong>Clave SOL</strong>: Tu contraseña del Portal SOL de SUNAT
          </li>
          <li>Estas credenciales permiten autenticación automática en servicios SIRE</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Client ID - Responsivo */}
        <div style={{ marginBottom: 'clamp(16px, 4vw, 20px)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 6px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            fontWeight: '600',
            color: '#374151',
            letterSpacing: '0.025em',
          }}>
            Client ID *
          </label>
          <input
            type="text"
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            placeholder="ej: 7f8bb496-f9fc-4c88-a5b8-e8662b3e17b9"
            style={errors.client_id ? errorInputStyle : inputStyle}
            disabled={loading}
          />
          {errors.client_id && (
            <span style={{
              display: 'block',
              marginTop: 'clamp(2px, 0.5vw, 4px)',
              fontSize: 'clamp(11px, 2.5vw, 12px)',
              color: '#ef4444',
              fontWeight: '500',
            }}>
              {errors.client_id}
            </span>
          )}
          <small style={{
            display: 'block',
            marginTop: 'clamp(2px, 0.5vw, 4px)',
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            color: '#6b7280',
            lineHeight: '1.4',
          }}>
            UUID proporcionado por SUNAT para acceso a SIRE
          </small>
        </div>

        {/* Client Secret - Responsivo */}
        <div style={{ marginBottom: 'clamp(16px, 4vw, 20px)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 6px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            fontWeight: '600',
            color: '#374151',
            letterSpacing: '0.025em',
          }}>
            Client Secret *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPasswords ? 'text' : 'password'}
              name="client_secret"
              value={formData.client_secret}
              onChange={handleChange}
              placeholder="Clave secreta del Client ID"
              style={errors.client_secret ? errorInputStyle : inputStyle}
              disabled={loading}
            />
          </div>
          {errors.client_secret && (
            <span style={{
              display: 'block',
              marginTop: 'clamp(2px, 0.5vw, 4px)',
              fontSize: 'clamp(11px, 2.5vw, 12px)',
              color: '#ef4444',
              fontWeight: '500',
            }}>
              {errors.client_secret}
            </span>
          )}
        </div>

        {/* Usuario SUNAT - Responsivo */}
        <div style={{ marginBottom: 'clamp(16px, 4vw, 20px)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 6px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            fontWeight: '600',
            color: '#374151',
            letterSpacing: '0.025em',
          }}>
            Usuario SUNAT *
          </label>
          <input
            type="text"
            name="sunat_usuario"
            value={formData.sunat_usuario}
            onChange={handleChange}
            placeholder="ej: 46403946"
            style={errors.sunat_usuario ? errorInputStyle : inputStyle}
            disabled={loading}
          />
          {errors.sunat_usuario && (
            <span style={{
              display: 'block',
              marginTop: 'clamp(2px, 0.5vw, 4px)',
              fontSize: 'clamp(11px, 2.5vw, 12px)',
              color: '#ef4444',
              fontWeight: '500',
            }}>
              {errors.sunat_usuario}
            </span>
          )}
          <small style={{
            display: 'block',
            marginTop: 'clamp(2px, 0.5vw, 4px)',
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            color: '#6b7280',
            lineHeight: '1.4',
          }}>
            Usuario SUNAT SOL (sin incluir el RUC)
          </small>
        </div>

        {/* Clave SOL - Responsivo */}
        <div style={{ marginBottom: 'clamp(20px, 5vw, 24px)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 6px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            fontWeight: '600',
            color: '#374151',
            letterSpacing: '0.025em',
          }}>
            Clave SUNAT *
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            name="sunat_clave"
            value={formData.sunat_clave}
            onChange={handleChange}
            placeholder="Contraseña SUNAT principal"
            style={errors.sunat_clave ? errorInputStyle : inputStyle}
            disabled={loading}
          />
          {errors.sunat_clave && (
            <span style={{
              display: 'block',
              marginTop: 'clamp(2px, 0.5vw, 4px)',
              fontSize: 'clamp(11px, 2.5vw, 12px)',
              color: '#ef4444',
              fontWeight: '500',
            }}>
              {errors.sunat_clave}
            </span>
          )}
        </div>

        {/* Mostrar/Ocultar contraseñas - Responsivo */}
        <div style={{
          marginBottom: 'clamp(20px, 5vw, 24px)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(6px, 1.5vw, 8px)',
          padding: 'clamp(8px, 2vw, 12px)',
          backgroundColor: '#f8fafc',
          borderRadius: 'clamp(4px, 1vw, 6px)',
          border: '1px solid #e2e8f0',
        }}>
          <input
            type="checkbox"
            id="showPasswords"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            style={{ 
              margin: 0,
              width: 'clamp(14px, 3.5vw, 16px)',
              height: 'clamp(14px, 3.5vw, 16px)',
            }}
          />
          <label 
            htmlFor="showPasswords"
            style={{
              fontSize: 'clamp(12px, 3vw, 14px)',
              color: '#374151',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(4px, 1vw, 6px)',
            }}
          >
            <span style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>👁️</span>
            Mostrar contraseñas
          </label>
        </div>

        {/* Información de los métodos SIRE - Responsivo */}
        <div style={{
          marginBottom: 'clamp(20px, 5vw, 24px)',
          padding: 'clamp(12px, 3vw, 16px)',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: 'clamp(4px, 1vw, 6px)',
          borderLeft: '4px solid #0ea5e9',
        }}>
          <h4 style={{
            margin: '0 0 clamp(8px, 2vw, 12px) 0',
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            color: '#0c4a6e',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(4px, 1vw, 6px)',
          }}>
            <span style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>🔄</span>
            Métodos de Conexión SIRE
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: 'clamp(12px, 3vw, 16px)',
            fontSize: 'clamp(11px, 2.8vw, 13px)',
          }}>
            <div style={{
              padding: 'clamp(8px, 2vw, 12px)',
              backgroundColor: 'white',
              borderRadius: 'clamp(4px, 1vw, 6px)',
              border: '1px solid #e2e8f0',
            }}>
              <strong style={{ 
                color: '#0c4a6e',
                fontSize: 'clamp(12px, 3vw, 14px)',
              }}>
                Método Original:
              </strong>
              <br />
              <code style={{ 
                backgroundColor: '#f1f5f9', 
                padding: '2px 4px', 
                borderRadius: '3px',
                fontSize: 'clamp(10px, 2.5vw, 12px)',
                wordBreak: 'break-all',
                display: 'block',
                marginTop: '4px',
              }}>
                Username: "{empresa.ruc} {formData.sunat_usuario}"
              </code>
              <small style={{ 
                color: '#64748b',
                fontSize: 'clamp(10px, 2.5vw, 11px)',
                display: 'block',
                marginTop: '4px',
              }}>
                Endpoint con Client ID
              </small>
            </div>
            <div style={{
              padding: 'clamp(8px, 2vw, 12px)',
              backgroundColor: 'white',
              borderRadius: 'clamp(4px, 1vw, 6px)',
              border: '1px solid #e2e8f0',
            }}>
              <strong style={{ 
                color: '#0c4a6e',
                fontSize: 'clamp(12px, 3vw, 14px)',
              }}>
                Método Migrado:
              </strong>
              <br />
              <code style={{ 
                backgroundColor: '#f1f5f9', 
                padding: '2px 4px', 
                borderRadius: '3px',
                fontSize: 'clamp(10px, 2.5vw, 12px)',
                wordBreak: 'break-all',
                display: 'block',
                marginTop: '4px',
              }}>
                Username: "{formData.sunat_usuario}"
              </code>
              <small style={{ 
                color: '#64748b',
                fontSize: 'clamp(10px, 2.5vw, 11px)',
                display: 'block',
                marginTop: '4px',
              }}>
                Endpoint con RUC
              </small>
            </div>
          </div>
        </div>

        {/* Botones - Responsivo */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 'clamp(8px, 2vw, 12px)',
          justifyContent: 'flex-end',
          paddingTop: 'clamp(12px, 3vw, 16px)',
          borderTop: '1px solid #e5e7eb',
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
              minWidth: 'clamp(140px, 35vw, 180px)',
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
                  Configurando...
                </span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>🔐</span>
                Configurar SIRE
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
            .sire-config-buttons {
              flex-direction: column-reverse !important;
              gap: 8px !important;
            }
            
            .sire-config-buttons button {
              width: 100% !important;
              min-width: unset !important;
            }
            
            .sire-methods-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
          }
          
          @media (max-width: 480px) {
            .sire-config-container {
              margin: 8px !important;
              padding: 12px !important;
            }
            
            .sire-config-form {
              padding: 12px !important;
            }
          }
          
          /* Mejoras para inputs en dispositivos táctiles */
          @media (hover: none) {
            input:focus {
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            }
            
            button:hover {
              transform: none !important;
            }
          }
          
          /* Mejoras de accesibilidad */
          input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            outline: none;
          }
          
          /* Mejoras para la legibilidad */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
          
          /* Mejoras para código en pantallas pequeñas */
          @media (max-width: 480px) {
            code {
              font-size: 10px !important;
              line-height: 1.4 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SireConfigForm;
