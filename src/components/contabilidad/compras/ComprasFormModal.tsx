/**
 * Modal para Crear/Editar Registros de Compras
 * Implementa formulario SUNAT-compliant para el Registro de Compras (PLE 080000)
 */

import React, { useState, useEffect } from 'react';
import { comprasApi } from '../../../services/comprasApi';
import type { 
  RegistroCompraResponse, 
  RegistroCompraCreate, 
  RegistroCompraUpdate 
} from '../../../services/comprasApi';

interface ComprasFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCompra?: RegistroCompraResponse | null;
  empresaId: string;
}

const ComprasFormModal: React.FC<ComprasFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingCompra,
  empresaId
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<RegistroCompraCreate>({
    empresa_id: empresaId,
    periodo: new Date().toISOString().substring(0, 7).replace('-', ''), // AAAAMM
    fecha_comprobante: '',
    tipo_comprobante: '01', // Factura por defecto
    serie_comprobante: '',
    numero_comprobante: '',
    fecha_vencimiento: '',
    tipo_documento_proveedor: '6', // RUC por defecto
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
    tipo_cambio: 1.00,
    clasificacion_bienes_servicios: '',
    estado_operacion: '1' // Registro válido por defecto
  });

  // Opciones SUNAT para selectores
  const tiposComprobante = [
    { value: '01', label: '01 - Factura' },
    { value: '03', label: '03 - Boleta de Venta' },
    { value: '07', label: '07 - Nota de Crédito' },
    { value: '08', label: '08 - Nota de Débito' },
    { value: '14', label: '14 - Recibo por Honorarios' },
    { value: '18', label: '18 - Documentos de Empresas del Sistema Financiero' },
    { value: '91', label: '91 - Comprobante de No Domiciliados' }
  ];

  const tiposDocumentoProveedor = [
    { value: '6', label: '6 - RUC' },
    { value: '1', label: '1 - DNI' },
    { value: '4', label: '4 - Carnet de Extranjería' },
    { value: '7', label: '7 - Pasaporte' },
    { value: '0', label: '0 - Sin Documento' }
  ];

  const estadosOperacion = [
    { value: '1', label: '1 - Registro válido' },
    { value: '8', label: '8 - Registro anulado' },
    { value: '9', label: '9 - Registro de ajuste' }
  ];

  const monedas = [
    { value: 'PEN', label: 'PEN - Soles' },
    { value: 'USD', label: 'USD - Dólares' },
    { value: 'EUR', label: 'EUR - Euros' }
  ];

  // Cargar datos si está editando
  useEffect(() => {
    if (editingCompra) {
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
        base_imponible_exonerada: editingCompra.base_imponible_exonerada || 0,
        base_imponible_inafecta: editingCompra.base_imponible_inafecta || 0,
        isc: editingCompra.isc || 0,
        otros_tributos: editingCompra.otros_tributos || 0,
        importe_total: editingCompra.importe_total,
        moneda: editingCompra.moneda || 'PEN',
        tipo_cambio: editingCompra.tipo_cambio || 1.00,
        clasificacion_bienes_servicios: editingCompra.clasificacion_bienes_servicios || '',
        estado_operacion: editingCompra.estado_operacion
      });
    } else {
      // Reset para nuevo registro
      setFormData({
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
        tipo_cambio: 1.00,
        clasificacion_bienes_servicios: '',
        estado_operacion: '1'
      });
    }
    setErrors({});
  }, [editingCompra, empresaId]);

  // Validaciones del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones obligatorias
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

    // Validación RUC (11 dígitos)
    if (formData.tipo_documento_proveedor === '6') {
      const ruc = formData.numero_documento_proveedor;
      if (!/^\d{11}$/.test(ruc)) {
        newErrors.numero_documento_proveedor = 'El RUC debe tener exactamente 11 dígitos';
      }
    }

    // Validación DNI (8 dígitos) 
    if (formData.tipo_documento_proveedor === '1') {
      const dni = formData.numero_documento_proveedor;
      if (!/^\d{8}$/.test(dni)) {
        newErrors.numero_documento_proveedor = 'El DNI debe tener exactamente 8 dígitos';
      }
    }

    // Validaciones de importes
    if (formData.base_imponible_gravada < 0) {
      newErrors.base_imponible_gravada = 'La base imponible gravada no puede ser negativa';
    }

    if (formData.igv < 0) {
      newErrors.igv = 'El IGV no puede ser negativo';
    }

    if (formData.importe_total <= 0) {
      newErrors.importe_total = 'El importe total debe ser mayor a cero';
    }

    // Validación de coherencia de importes
    const totalCalculado = 
      formData.base_imponible_gravada + 
      formData.igv + 
      (formData.base_imponible_exonerada || 0) + 
      (formData.base_imponible_inafecta || 0) + 
      (formData.isc || 0) + 
      (formData.otros_tributos || 0);

    const diferencia = Math.abs(totalCalculado - formData.importe_total);
    if (diferencia > 0.01) { // Tolerancia de 1 centavo
      newErrors.importe_total = 'El importe total no coincide con la suma de los componentes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-cálculo del IGV
  const calcularIGV = (baseGravada: number): number => {
    return Math.round(baseGravada * 0.18 * 100) / 100;
  };

  // Auto-cálculo del total
  const calcularTotal = (): number => {
    return formData.base_imponible_gravada + 
           formData.igv + 
           (formData.base_imponible_exonerada || 0) + 
           (formData.base_imponible_inafecta || 0) + 
           (formData.isc || 0) + 
           (formData.otros_tributos || 0);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof RegistroCompraCreate, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calcular IGV cuando cambia la base gravada
      if (field === 'base_imponible_gravada') {
        const baseGravada = parseFloat(value) || 0;
        updated.igv = calcularIGV(baseGravada);
      }

      // Auto-calcular total cuando cambian los importes
      if (['base_imponible_gravada', 'igv', 'base_imponible_exonerada', 'base_imponible_inafecta', 'isc', 'otros_tributos'].includes(field)) {
        updated.importe_total = calcularTotal();
      }

      return updated;
    });

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (editingCompra) {
        // Actualizar registro existente
        await comprasApi.update(editingCompra.id, formData as RegistroCompraUpdate);
      } else {
        // Crear nuevo registro
        await comprasApi.create(formData);
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      setErrors({ 
        general: error.response?.data?.detail || 'Error al guardar el registro' 
      });
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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#111827',
              margin: 0
            }}>
              {editingCompra ? '✏️ Editar Compra' : '➕ Nueva Compra'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem',
                border: 'none',
                background: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ✕
            </button>
          </div>

          {/* Formulario */}
          <div style={{ padding: '1.5rem' }}>
            {/* Error general */}
            {errors.general && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                {errors.general}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {/* Fecha del Comprobante */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Fecha del Comprobante *
                </label>
                <input
                  type="date"
                  value={formData.fecha_comprobante}
                  onChange={(e) => handleInputChange('fecha_comprobante', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${errors.fecha_comprobante ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
                {errors.fecha_comprobante && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.fecha_comprobante}
                  </p>
                )}
              </div>

              {/* Tipo de Comprobante */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Tipo de Comprobante *
                </label>
                <select
                  value={formData.tipo_comprobante}
                  onChange={(e) => handleInputChange('tipo_comprobante', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {tiposComprobante.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serie del Comprobante */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Serie
                </label>
                <input
                  type="text"
                  value={formData.serie_comprobante}
                  onChange={(e) => handleInputChange('serie_comprobante', e.target.value)}
                  placeholder="Ej: F001"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Número del Comprobante */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Número del Comprobante *
                </label>
                <input
                  type="text"
                  value={formData.numero_comprobante}
                  onChange={(e) => handleInputChange('numero_comprobante', e.target.value)}
                  placeholder="Ej: 00000123"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${errors.numero_comprobante ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
                {errors.numero_comprobante && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.numero_comprobante}
                  </p>
                )}
              </div>

              {/* Tipo de Documento del Proveedor */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Tipo de Documento *
                </label>
                <select
                  value={formData.tipo_documento_proveedor}
                  onChange={(e) => handleInputChange('tipo_documento_proveedor', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {tiposDocumentoProveedor.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Número de Documento del Proveedor */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Número de Documento *
                </label>
                <input
                  type="text"
                  value={formData.numero_documento_proveedor}
                  onChange={(e) => handleInputChange('numero_documento_proveedor', e.target.value)}
                  placeholder={formData.tipo_documento_proveedor === '6' ? '12345678901' : '12345678'}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${errors.numero_documento_proveedor ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
                {errors.numero_documento_proveedor && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.numero_documento_proveedor}
                  </p>
                )}
              </div>

              {/* Razón Social del Proveedor */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Razón Social del Proveedor *
                </label>
                <input
                  type="text"
                  value={formData.razon_social_proveedor}
                  onChange={(e) => handleInputChange('razon_social_proveedor', e.target.value)}
                  placeholder="Ingrese la razón social del proveedor"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${errors.razon_social_proveedor ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
                {errors.razon_social_proveedor && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.razon_social_proveedor}
                  </p>
                )}
              </div>

              {/* Base Imponible Gravada */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Base Imponible Gravada *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_imponible_gravada}
                  onChange={(e) => handleInputChange('base_imponible_gravada', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${errors.base_imponible_gravada ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
                {errors.base_imponible_gravada && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.base_imponible_gravada}
                  </p>
                )}
              </div>

              {/* IGV */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  IGV (18%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.igv}
                  onChange={(e) => handleInputChange('igv', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${errors.igv ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
                {errors.igv && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.igv}
                  </p>
                )}
              </div>

              {/* Base Imponible Exonerada */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Base Imponible Exonerada
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_imponible_exonerada}
                  onChange={(e) => handleInputChange('base_imponible_exonerada', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Base Imponible Inafecta */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Base Imponible Inafecta
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_imponible_inafecta}
                  onChange={(e) => handleInputChange('base_imponible_inafecta', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Importe Total */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Importe Total *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.importe_total}
                  onChange={(e) => handleInputChange('importe_total', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${errors.importe_total ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    backgroundColor: '#f9fafb'
                  }}
                />
                {errors.importe_total && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.importe_total}
                  </p>
                )}
              </div>

              {/* Moneda */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Moneda
                </label>
                <select
                  value={formData.moneda}
                  onChange={(e) => handleInputChange('moneda', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {monedas.map(moneda => (
                    <option key={moneda.value} value={moneda.value}>
                      {moneda.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado de Operación */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Estado de Operación *
                </label>
                <select
                  value={formData.estado_operacion}
                  onChange={(e) => handleInputChange('estado_operacion', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {estadosOperacion.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                background: 'white',
                color: '#374151',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.5rem 1.5rem',
                border: 'none',
                borderRadius: '0.375rem',
                background: loading ? '#9ca3af' : '#ea580c',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Guardando...' : (editingCompra ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComprasFormModal;
