import React, { useState, useEffect } from 'react';
import type { CuentaContable } from '../../../types/contabilidad';

interface CuentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cuenta: Partial<CuentaContable>) => Promise<void>;
  cuenta?: CuentaContable;
  modo: 'crear' | 'editar';
}

const CuentaModal: React.FC<CuentaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cuenta,
  modo
}) => {
  const [formData, setFormData] = useState({
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
    activa: true
  });

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
        activa: cuenta.activa
      });
    } else {
      setFormData({
        codigo: '',
        descripcion: '',
        nivel: 1,
        clase_contable: 1,
        grupo: '',
        subgrupo: '',
        cuenta_padre: '',
        es_hoja: true,
        acepta_movimiento: true,
        naturaleza: 'DEUDORA',
        moneda: 'MN',
        activa: true
      });
    }
    setErrors({});
  }, [cuenta, modo, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const configuracionAutomatica = () => {
    const codigo = formData.codigo.trim();
    
    // Detectar nivel y configuración automática basada en la longitud del código
    let nivel = 1;
    let esHoja = false;
    let aceptaMovimiento = false;
    let claseContable = 1;
    
    if (codigo) {
      nivel = codigo.length; // La longitud determina el nivel
      claseContable = parseInt(codigo.charAt(0)) || 1; // Primer dígito = clase contable
      
      // Configuración jerárquica:
      // Nivel 1 (1 dígito): Clase - No es hoja, no acepta movimientos
      // Nivel 2 (2 dígitos): Grupo - No es hoja, no acepta movimientos  
      // Nivel 3 (3 dígitos): Subgrupo - No es hoja, no acepta movimientos
      // Nivel 4+ (4+ dígitos): Cuenta - Es hoja, acepta movimientos
      
      if (nivel >= 4) {
        esHoja = true;
        aceptaMovimiento = true;
      } else {
        esHoja = false;
        aceptaMovimiento = false;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      nivel: Math.min(nivel, 9), // Máximo 9 niveles
      clase_contable: claseContable,
      es_hoja: esHoja,
      acepta_movimiento: aceptaMovimiento,
      activa: true
    }));

    // Limpiar errores de configuración
    setErrors(prev => ({ ...prev, configuracion: '' }));
  };

  // Función para obtener el tipo de cuenta basado en el código
  const getTipoCuenta = (codigo: string) => {
    const longitud = codigo.length;
    if (longitud === 1) return { tipo: 'Clase', nivel: 1, color: '#ef4444' };
    if (longitud === 2) return { tipo: 'Grupo', nivel: 2, color: '#f97316' };
    if (longitud === 3) return { tipo: 'Subgrupo', nivel: 3, color: '#eab308' };
    if (longitud >= 4) return { tipo: 'Cuenta', nivel: longitud, color: '#22c55e' };
    return { tipo: 'Indefinido', nivel: 1, color: '#6b7280' };
  };

  const tipoCuenta = getTipoCuenta(formData.codigo);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    // Validación inteligente para configuración
    if (formData.es_hoja && !formData.acepta_movimiento) {
      newErrors.configuracion = 'Las cuentas hoja generalmente deben aceptar movimientos';
    }

    if (!formData.es_hoja && formData.acepta_movimiento) {
      newErrors.configuracion = 'Las cuentas padre (no hoja) generalmente no deben aceptar movimientos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
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
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '600',
            color: '#1e293b'
          }}>
            {modo === 'crear' ? '✨ Nueva Cuenta Contable' : '✏️ Editar Cuenta'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#64748b',
              width: '44px',
              height: '44px'
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '32px', overflow: 'auto', maxHeight: 'calc(90vh - 160px)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '24px' }}>
              
              {/* Información Básica */}
              <div>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  color: '#334155'
                }}>
                  📝 Información Básica
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'minmax(120px, 1fr) minmax(200px, 2fr)', 
                  gap: '20px'
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '500',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      Código <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setFormData(prev => ({ ...prev, codigo: valor }));
                        
                        // Auto-configurar basado en el código
                        if (valor.trim()) {
                          const info = getTipoCuenta(valor.trim());
                          setFormData(prev => ({
                            ...prev,
                            codigo: valor,
                            nivel: info.nivel,
                            clase_contable: parseInt(valor.charAt(0)) || 1,
                            es_hoja: info.nivel >= 4,
                            acepta_movimiento: info.nivel >= 4
                          }));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: errors.codigo ? '2px solid #ef4444' : '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace'
                      }}
                      placeholder="Ej: 1011"
                      disabled={loading}
                    />
                    {errors.codigo && (
                      <span style={{ 
                        color: '#ef4444', 
                        fontSize: '12px', 
                        marginTop: '4px',
                        display: 'block'
                      }}>
                        {errors.codigo}
                      </span>
                    )}
                    
                    {/* Indicador de jerarquía */}
                    {formData.codigo && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: `${getTipoCuenta(formData.codigo).color}15`,
                        border: `1px solid ${getTipoCuenta(formData.codigo).color}30`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: getTipoCuenta(formData.codigo).color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ fontSize: '14px' }}>
                          {getTipoCuenta(formData.codigo).nivel === 1 ? '🏛️' :
                           getTipoCuenta(formData.codigo).nivel === 2 ? '📁' :
                           getTipoCuenta(formData.codigo).nivel === 3 ? '📂' : '📄'}
                        </span>
                        {getTipoCuenta(formData.codigo).tipo} - Nivel {getTipoCuenta(formData.codigo).nivel}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '500',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      Descripción <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: errors.descripcion ? '2px solid #ef4444' : '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Ej: Caja y Bancos"
                      disabled={loading}
                    />
                    {errors.descripcion && (
                      <span style={{ 
                        color: '#ef4444', 
                        fontSize: '12px', 
                        marginTop: '4px',
                        display: 'block'
                      }}>
                        {errors.descripcion}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Clasificación */}
              <div>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  color: '#334155'
                }}>
                  🏷️ Clasificación
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '20px'
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '500',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      Nivel
                    </label>
                    <input
                      type="number"
                      name="nivel"
                      value={formData.nivel}
                      onChange={handleInputChange}
                      min="1"
                      max="9"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '500',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      Clase Contable
                    </label>
                    <select
                      name="clase_contable"
                      value={formData.clase_contable}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: 'white'
                      }}
                      disabled={loading}
                    >
                      <option value={1}>1 - ACTIVO DISPONIBLE Y EXIGIBLE</option>
                      <option value={2}>2 - ACTIVO REALIZABLE</option>
                      <option value={3}>3 - ACTIVO INMOVILIZADO</option>
                      <option value={4}>4 - PASIVO</option>
                      <option value={5}>5 - PATRIMONIO NETO</option>
                      <option value={6}>6 - GASTOS POR NATURALEZA</option>
                      <option value={7}>7 - VENTAS</option>
                      <option value={8}>8 - SALDOS INTERMEDIARIOS</option>
                      <option value={9}>9 - CONTABILIDAD ANALÍTICA</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '500',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      Naturaleza
                    </label>
                    <select
                      name="naturaleza"
                      value={formData.naturaleza}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: 'white'
                      }}
                      disabled={loading}
                    >
                      <option value="DEUDORA">Deudora</option>
                      <option value="ACREEDORA">Acreedora</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '500',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      Moneda
                    </label>
                    <select
                      name="moneda"
                      value={formData.moneda}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: 'white'
                      }}
                      disabled={loading}
                    >
                      <option value="MN">Moneda Nacional</option>
                      <option value="ME">Moneda Extranjera</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Configuración */}
              <div>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>⚙️ Configuración</span>
                  <button
                    type="button"
                    onClick={configuracionAutomatica}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#3b82f6',
                      background: '#eff6ff',
                      border: '1px solid #3b82f6',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dbeafe';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                  >
                    🔧 Auto-configurar
                  </button>
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                  gap: '16px'
                }}>
                  {[
                    { 
                      name: 'es_hoja', 
                      label: '🍃 Es Hoja', 
                      checked: formData.es_hoja,
                      description: 'La cuenta no puede tener subcuentas'
                    },
                    { 
                      name: 'acepta_movimiento', 
                      label: '💱 Acepta Movimiento', 
                      checked: formData.acepta_movimiento,
                      description: 'Se pueden registrar transacciones'
                    },
                    { 
                      name: 'activa', 
                      label: '✅ Activa', 
                      checked: formData.activa,
                      description: 'La cuenta está habilitada'
                    }
                  ].map(({ name, label, checked, description }) => (
                    <div 
                      key={name}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '16px 20px',
                        backgroundColor: checked ? '#f0f9ff' : '#f8fafc',
                        borderRadius: '10px',
                        border: checked ? '2px solid #0ea5e9' : '2px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => {
                        const event = {
                          target: {
                            name,
                            type: 'checkbox',
                            checked: !checked
                          }
                        } as React.ChangeEvent<HTMLInputElement>;
                        handleInputChange(event);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="checkbox"
                          name={name}
                          checked={checked}
                          onChange={handleInputChange}
                          disabled={loading}
                          style={{
                            width: '18px',
                            height: '18px',
                            accentColor: '#3b82f6'
                          }}
                        />
                        <label style={{ 
                          fontWeight: '600',
                          color: '#374151',
                          fontSize: '14px',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}>
                          {label}
                        </label>
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#64748b',
                        paddingLeft: '30px'
                      }}>
                        {description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Información adicional */}
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: errors.configuracion ? '#fef2f2' : '#fef3c7',
                  border: errors.configuracion ? '1px solid #ef4444' : '1px solid #f59e0b',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>
                      {errors.configuracion ? '⚠️' : '💡'}
                    </span>
                    <div>
                      {errors.configuracion ? (
                        <>
                          <p style={{ 
                            margin: '0 0 8px 0', 
                            fontWeight: '600', 
                            color: '#dc2626',
                            fontSize: '13px'
                          }}>
                            Advertencia de Configuración:
                          </p>
                          <p style={{ 
                            margin: 0, 
                            color: '#dc2626',
                            fontSize: '12px'
                          }}>
                            {errors.configuracion}
                          </p>
                        </>
                      ) : (
                        <>
                          <p style={{ 
                            margin: '0 0 8px 0', 
                            fontWeight: '600', 
                            color: '#92400e',
                            fontSize: '13px'
                          }}>
                            Recomendaciones:
                          </p>
                          <ul style={{ 
                            margin: 0, 
                            paddingLeft: '16px',
                            color: '#92400e',
                            fontSize: '12px'
                          }}>
                            <li>Las cuentas padre (no hoja) generalmente no aceptan movimientos</li>
                            <li>Las cuentas hija (hoja) son las que normalmente aceptan movimientos</li>
                            <li>Solo desactiva cuentas que no se usen temporalmente</li>
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guía de Jerarquía */}
              <div style={{
                padding: '20px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '10px'
              }}>
                <h4 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📚 Estructura Jerárquica del Plan Contable
                </h4>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { nivel: 1, digitos: '1 dígito', ejemplo: '1', tipo: 'Clase', descripcion: 'ACTIVO DISPONIBLE Y EXIGIBLE', icon: '🏛️', color: '#ef4444' },
                    { nivel: 2, digitos: '2 dígitos', ejemplo: '10', tipo: 'Grupo', descripcion: 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', icon: '📁', color: '#f97316' },
                    { nivel: 3, digitos: '3 dígitos', ejemplo: '101', tipo: 'Subgrupo', descripcion: 'Caja', icon: '📂', color: '#eab308' },
                    { nivel: 4, digitos: '4+ dígitos', ejemplo: '1011', tipo: 'Cuenta', descripcion: 'Caja Principal', icon: '📄', color: '#22c55e' }
                  ].map(({ nivel, digitos, ejemplo, tipo, descripcion, icon, color }) => (
                    <div key={nivel} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${color}30`
                    }}>
                      <span style={{ fontSize: '18px' }}>{icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ 
                            fontWeight: '600', 
                            color: color,
                            fontSize: '13px'
                          }}>
                            Nivel {nivel} - {tipo}
                          </span>
                          <span style={{ 
                            fontSize: '11px',
                            color: '#64748b',
                            backgroundColor: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {digitos}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                          <span style={{ 
                            fontFamily: 'monospace',
                            fontWeight: '600',
                            color: '#475569'
                          }}>
                            Ej: {ejemplo}
                          </span>
                          <span style={{ color: '#64748b' }}>
                            {descripcion}
                          </span>
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '11px',
                        color: nivel >= 4 ? '#059669' : '#64748b',
                        fontWeight: '500'
                      }}>
                        {nivel >= 4 ? '✓ Acepta movimientos' : '○ No acepta movimientos'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px',
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '12px 24px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#475569'
            }}
            disabled={loading}
          >
            ❌ Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            style={{
              padding: '12px 28px',
              border: 'none',
              borderRadius: '8px',
              background: loading ? '#94a3b8' : '#3b82f6',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            disabled={loading}
          >
            {loading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {modo === 'crear' ? '✨ Crear Cuenta' : '💾 Actualizar'}
          </button>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CuentaModal;
