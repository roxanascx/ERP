import React, { useState, useEffect } from 'react';
import type { AsientoContable, DetalleAsiento } from '../../../types/libroDiario';

interface FormularioAsientoProps {
  libroId: string;
  asientoEditando?: AsientoContable | null;
  onGuardar: (asiento: Omit<AsientoContable, 'id'>) => Promise<void>;
  onCerrar: () => void;
}

const FormularioAsiento: React.FC<FormularioAsientoProps> = ({
  libroId,
  asientoEditando,
  onGuardar,
  onCerrar
}) => {
  const [formData, setFormData] = useState({
    numero: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    detalles: [
      { codigoCuenta: '', denominacionCuenta: '', descripcion: '', debe: 0, haber: 0 },
      { codigoCuenta: '', denominacionCuenta: '', descripcion: '', debe: 0, haber: 0 }
    ] as DetalleAsiento[]
  });

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  useEffect(() => {
    if (asientoEditando) {
      setFormData({
        numero: asientoEditando.numero,
        fecha: asientoEditando.fecha,
        descripcion: asientoEditando.descripcion,
        detalles: asientoEditando.detalles.length > 0 
          ? asientoEditando.detalles 
          : [
              { codigoCuenta: '', denominacionCuenta: '', descripcion: '', debe: 0, haber: 0 },
              { codigoCuenta: '', denominacionCuenta: '', descripcion: '', debe: 0, haber: 0 }
            ]
      });
    } else {
      // Generar número correlativo automático
      const siguienteNumero = String(Date.now()).slice(-3).padStart(3, '0');
      setFormData(prev => ({ ...prev, numero: siguienteNumero }));
    }
  }, [asientoEditando]);

  const agregarDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        { codigoCuenta: '', denominacionCuenta: '', descripcion: '', debe: 0, haber: 0 }
      ]
    }));
  };

  const eliminarDetalle = (index: number) => {
    if (formData.detalles.length <= 2) return; // Mínimo 2 detalles
    
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const actualizarDetalle = (index: number, campo: keyof DetalleAsiento, valor: any) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map((detalle, i) => 
        i === index ? { ...detalle, [campo]: valor } : detalle
      )
    }));

    // Autocompletar denominación si es código de cuenta
    if (campo === 'codigoCuenta' && valor) {
      // Simulación de autocompletado - en producción esto vendría de una API
      const cuentasComunes: Record<string, string> = {
        '101101': 'Caja',
        '101201': 'Bancos',
        '121101': 'Facturas por cobrar',
        '601101': 'Mercaderías',
        '621101': 'Sueldos',
        '701101': 'Ventas',
        '421101': 'Proveedores',
        '401111': 'IGV por pagar',
        '403101': 'Essalud por pagar',
        '403201': 'ONP por pagar'
      };

      if (cuentasComunes[valor]) {
        setFormData(prev => ({
          ...prev,
          detalles: prev.detalles.map((detalle, i) => 
            i === index ? { ...detalle, denominacionCuenta: cuentasComunes[valor] } : detalle
          )
        }));
      }
    }
  };

  const validarFormulario = (): string[] => {
    const errores: string[] = [];

    if (!formData.numero) errores.push('Número es requerido');
    if (!formData.fecha) errores.push('Fecha es requerida');
    if (!formData.descripcion) errores.push('Descripción es requerida');
    if (formData.detalles.length < 2) errores.push('Debe tener al menos 2 detalles');

    // Validar cada detalle
    formData.detalles.forEach((detalle, index) => {
      if (!detalle.codigoCuenta) errores.push(`Detalle ${index + 1}: Código de cuenta es requerido`);
      if (!detalle.denominacionCuenta) errores.push(`Detalle ${index + 1}: Denominación es requerida`);
      if (!detalle.descripcion) errores.push(`Detalle ${index + 1}: Descripción es requerida`);
      
      const debe = detalle.debe || 0;
      const haber = detalle.haber || 0;
      
      if (debe === 0 && haber === 0) {
        errores.push(`Detalle ${index + 1}: Debe especificar un valor en Debe o Haber`);
      }
      
      if (debe > 0 && haber > 0) {
        errores.push(`Detalle ${index + 1}: No puede tener valores en Debe y Haber al mismo tiempo`);
      }
      
      if (debe < 0 || haber < 0) {
        errores.push(`Detalle ${index + 1}: Los valores no pueden ser negativos`);
      }
    });

    // Validar balance
    const totalDebe = formData.detalles.reduce((sum, d) => sum + (d.debe || 0), 0);
    const totalHaber = formData.detalles.reduce((sum, d) => sum + (d.haber || 0), 0);
    
    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      errores.push('El asiento debe estar balanceado (Total Debe = Total Haber)');
    }

    return errores;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const erroresValidacion = validarFormulario();
    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setLoading(true);
    setErrores([]);

    try {
      await onGuardar({
        numero: formData.numero,
        fecha: formData.fecha,
        descripcion: formData.descripcion,
        detalles: formData.detalles,
        empresaId: '', // Se completará en el backend
        libroId
      });
    } catch (error) {
      setErrores([`Error al guardar: ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotales = () => {
    const totalDebe = formData.detalles.reduce((sum, d) => sum + (d.debe || 0), 0);
    const totalHaber = formData.detalles.reduce((sum, d) => sum + (d.haber || 0), 0);
    return { totalDebe, totalHaber, balanceado: Math.abs(totalDebe - totalHaber) < 0.01 };
  };

  const totales = calcularTotales();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 10
        }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: '600' }}>
              {asientoEditando ? '✏️ Editar Asiento' : '➕ Nuevo Asiento'}
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              Libro ID: {libroId}
            </p>
          </div>
          
          <button
            onClick={onCerrar}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Datos Generales */}
          <div style={{ padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.125rem', fontWeight: '600' }}>
              📋 Datos Generales
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Número:
                </label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="001"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Fecha:
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Descripción:
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="Ej: Compra de mercadería según factura 001-123"
                />
              </div>
            </div>
          </div>

          {/* Detalles del Asiento */}
          <div style={{ padding: '0 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
                💰 Detalles del Asiento
              </h4>
              <button
                type="button"
                onClick={agregarDetalle}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ➕ Agregar Línea
              </button>
            </div>

            {/* Header de la tabla */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '120px 200px 1fr 120px 120px 60px',
              gap: '8px',
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '6px',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '14px',
              color: '#374151'
            }}>
              <div>Código</div>
              <div>Denominación</div>
              <div>Descripción</div>
              <div>Debe</div>
              <div>Haber</div>
              <div></div>
            </div>

            {/* Líneas de detalle */}
            {formData.detalles.map((detalle, index) => (
              <div key={index} style={{
                display: 'grid',
                gridTemplateColumns: '120px 200px 1fr 120px 120px 60px',
                gap: '8px',
                padding: '8px',
                background: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                borderRadius: '4px',
                marginBottom: '4px',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  value={detalle.codigoCuenta}
                  onChange={(e) => actualizarDetalle(index, 'codigoCuenta', e.target.value)}
                  placeholder="101101"
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />

                <input
                  type="text"
                  value={detalle.denominacionCuenta}
                  onChange={(e) => actualizarDetalle(index, 'denominacionCuenta', e.target.value)}
                  placeholder="Caja"
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />

                <input
                  type="text"
                  value={detalle.descripcion}
                  onChange={(e) => actualizarDetalle(index, 'descripcion', e.target.value)}
                  placeholder="Descripción del movimiento"
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />

                <input
                  type="number"
                  value={detalle.debe || ''}
                  onChange={(e) => actualizarDetalle(index, 'debe', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '13px',
                    textAlign: 'right'
                  }}
                />

                <input
                  type="number"
                  value={detalle.haber || ''}
                  onChange={(e) => actualizarDetalle(index, 'haber', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '13px',
                    textAlign: 'right'
                  }}
                />

                <button
                  type="button"
                  onClick={() => eliminarDetalle(index)}
                  disabled={formData.detalles.length <= 2}
                  style={{
                    background: formData.detalles.length <= 2 ? '#e5e7eb' : '#ef4444',
                    color: formData.detalles.length <= 2 ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px',
                    cursor: formData.detalles.length <= 2 ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                  title={formData.detalles.length <= 2 ? 'Mínimo 2 líneas requeridas' : 'Eliminar línea'}
                >
                  🗑️
                </button>
              </div>
            ))}

            {/* Totales */}
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: totales.balanceado ? '#f0fdf4' : '#fef2f2',
              border: `2px solid ${totales.balanceado ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '8px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Debe</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#059669' }}>
                    S/ {totales.totalDebe.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Haber</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626' }}>
                    S/ {totales.totalHaber.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Estado</div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '600',
                    color: totales.balanceado ? '#059669' : '#dc2626'
                  }}>
                    {totales.balanceado ? '✅ Balanceado' : '⚠️ Desbalanceado'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Errores */}
          {errores.length > 0 && (
            <div style={{ margin: '0 24px 24px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>❌ Errores de Validación:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {errores.map((error, index) => (
                  <li key={index} style={{ color: '#dc2626', fontSize: '14px' }}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer con botones */}
          <div style={{
            padding: '24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            position: 'sticky',
            bottom: 0,
            background: 'white'
          }}>
            <button
              type="button"
              onClick={onCerrar}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading || !totales.balanceado}
              style={{
                background: loading || !totales.balanceado ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                cursor: loading || !totales.balanceado ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? '⏳' : '💾'} 
              {loading ? 'Guardando...' : (asientoEditando ? 'Actualizar' : 'Crear Asiento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioAsiento;
