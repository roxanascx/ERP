import React, { useState } from 'react';

interface EjemplosAsientosProps {
  onCerrar: () => void;
}

const ejemplosContables = [
  {
    titulo: "💰 Venta al Contado",
    descripcion: "Registro de una venta con cobranza inmediata en efectivo",
    ejemplo: {
      descripcion: "Venta de mercadería según factura 001-123",
      detalles: [
        { cuenta: "101101", denominacion: "Caja", descripcion: "Por cobranza de venta", debe: "S/ 1,180.00", haber: "" },
        { cuenta: "401111", denominacion: "IGV por pagar", descripcion: "IGV 18% de la venta", debe: "", haber: "S/ 180.00" },
        { cuenta: "701101", denominacion: "Ventas", descripcion: "Venta de mercadería", debe: "", haber: "S/ 1,000.00" }
      ]
    }
  },
  {
    titulo: "🛒 Compra al Crédito",
    descripcion: "Registro de compra de mercadería con pago diferido",
    ejemplo: {
      descripcion: "Compra de mercadería según factura 002-456",
      detalles: [
        { cuenta: "601101", denominacion: "Mercaderías", descripcion: "Por compra de mercadería", debe: "S/ 1,000.00", haber: "" },
        { cuenta: "401111", denominacion: "IGV crédito fiscal", descripcion: "IGV 18% de la compra", debe: "S/ 180.00", haber: "" },
        { cuenta: "421101", denominacion: "Proveedores", descripcion: "Por compra al crédito", debe: "", haber: "S/ 1,180.00" }
      ]
    }
  },
  {
    titulo: "🏦 Depósito a Banco",
    descripcion: "Traslado de efectivo de caja a cuenta bancaria",
    ejemplo: {
      descripcion: "Depósito en cuenta corriente BCP",
      detalles: [
        { cuenta: "101201", denominacion: "Bancos", descripcion: "Depósito en cuenta corriente", debe: "S/ 5,000.00", haber: "" },
        { cuenta: "101101", denominacion: "Caja", descripcion: "Por traslado a banco", debe: "", haber: "S/ 5,000.00" }
      ]
    }
  },
  {
    titulo: "👥 Pago de Sueldos",
    descripcion: "Registro del pago de planilla de trabajadores",
    ejemplo: {
      descripcion: "Pago de planilla mes de agosto 2024",
      detalles: [
        { cuenta: "621101", denominacion: "Sueldos", descripcion: "Planilla de sueldos", debe: "S/ 8,000.00", haber: "" },
        { cuenta: "403101", denominacion: "Essalud por pagar", descripcion: "Aporte Essalud 9%", debe: "", haber: "S/ 720.00" },
        { cuenta: "403201", denominacion: "ONP por pagar", descripcion: "Aporte ONP 13%", debe: "", haber: "S/ 1,040.00" },
        { cuenta: "101201", denominacion: "Bancos", descripcion: "Pago vía transferencia", debe: "", haber: "S/ 6,240.00" }
      ]
    }
  }
];

const EjemplosAsientos: React.FC<EjemplosAsientosProps> = ({ onCerrar }) => {
  const [ejemploSeleccionado, setEjemploSeleccionado] = useState(0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '1.5rem', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '24px' }}>📚</span>
                Ejemplos de Asientos Contables
              </h3>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                Guía visual para entender la estructura de los asientos contables más comunes
              </p>
            </div>
            
            <button
              onClick={onCerrar}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'white',
                padding: '8px',
                borderRadius: '50%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', height: 'calc(90vh - 100px)' }}>
          {/* Sidebar con lista de ejemplos */}
          <div style={{
            width: '300px',
            borderRight: '1px solid #e5e7eb',
            background: '#f8fafc',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '20px' }}>
              <h4 style={{ 
                margin: '0 0 16px 0', 
                fontSize: '1rem', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Tipos de Asientos
              </h4>
              
              {ejemplosContables.map((ejemplo, index) => (
                <div
                  key={index}
                  onClick={() => setEjemploSeleccionado(index)}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    background: ejemploSeleccionado === index ? '#3b82f6' : 'white',
                    color: ejemploSeleccionado === index ? 'white' : '#374151',
                    border: `2px solid ${ejemploSeleccionado === index ? '#3b82f6' : '#e5e7eb'}`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (ejemploSeleccionado !== index) {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.background = '#f0f9ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (ejemploSeleccionado !== index) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  <div style={{ 
                    fontWeight: '600', 
                    marginBottom: '4px',
                    fontSize: '14px'
                  }}>
                    {ejemplo.titulo}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    opacity: 0.8,
                    lineHeight: '1.4'
                  }}>
                    {ejemplo.descripcion}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contenido principal */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '24px' }}>
              {/* Título del ejemplo seleccionado */}
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '1.25rem', 
                  fontWeight: '700',
                  color: '#1f2937'
                }}>
                  {ejemplosContables[ejemploSeleccionado].titulo}
                </h2>
                <p style={{ 
                  margin: 0, 
                  color: '#6b7280', 
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {ejemplosContables[ejemploSeleccionado].descripcion}
                </p>
              </div>

              {/* Datos del asiento */}
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #0ea5e9'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '18px' }}>📝</span>
                  <span style={{ fontWeight: '600', color: '#0c4a6e' }}>
                    Descripción del Asiento:
                  </span>
                </div>
                <div style={{
                  background: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  border: '1px solid #bae6fd'
                }}>
                  {ejemplosContables[ejemploSeleccionado].ejemplo.descripcion}
                </div>
              </div>

              {/* Tabla de detalles */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                {/* Header de la tabla */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 200px 1fr 120px 120px',
                  gap: '0',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                  fontWeight: '700',
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <div>Código</div>
                  <div>Cuenta</div>
                  <div>Descripción</div>
                  <div style={{ textAlign: 'center' }}>Debe</div>
                  <div style={{ textAlign: 'center' }}>Haber</div>
                </div>

                {/* Filas de detalles */}
                {ejemplosContables[ejemploSeleccionado].ejemplo.detalles.map((detalle, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '100px 200px 1fr 120px 120px',
                      gap: '0',
                      padding: '16px',
                      borderBottom: index < ejemplosContables[ejemploSeleccionado].ejemplo.detalles.length - 1 
                        ? '1px solid #f3f4f6' 
                        : 'none',
                      background: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}
                  >
                    <div style={{ 
                      fontFamily: 'monospace',
                      fontWeight: '600',
                      color: '#3b82f6',
                      fontSize: '14px'
                    }}>
                      {detalle.cuenta}
                    </div>
                    <div style={{ 
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      {detalle.denominacion}
                    </div>
                    <div style={{ 
                      color: '#6b7280',
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {detalle.descripcion}
                    </div>
                    <div style={{ 
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontWeight: '600',
                      color: detalle.debe ? '#059669' : '#d1d5db',
                      fontSize: '14px'
                    }}>
                      {detalle.debe || '—'}
                    </div>
                    <div style={{ 
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontWeight: '600',
                      color: detalle.haber ? '#dc2626' : '#d1d5db',
                      fontSize: '14px'
                    }}>
                      {detalle.haber || '—'}
                    </div>
                  </div>
                ))}

                {/* Totales */}
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  padding: '16px',
                  borderTop: '2px solid #bbf7d0'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 200px 1fr 120px 120px',
                    gap: '0',
                    fontWeight: '700',
                    fontSize: '16px'
                  }}>
                    <div></div>
                    <div></div>
                    <div style={{ textAlign: 'right', color: '#374151' }}>
                      TOTALES:
                    </div>
                    <div style={{ 
                      textAlign: 'center',
                      color: '#059669',
                      fontFamily: 'monospace'
                    }}>
                      {/* Calcular total debe */}
                      S/ {ejemplosContables[ejemploSeleccionado].ejemplo.detalles
                        .reduce((sum, d) => {
                          const monto = d.debe ? parseFloat(d.debe.replace(/[^\d.]/g, '')) : 0;
                          return sum + monto;
                        }, 0)
                        .toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ 
                      textAlign: 'center',
                      color: '#dc2626',
                      fontFamily: 'monospace'
                    }}>
                      {/* Calcular total haber */}
                      S/ {ejemplosContables[ejemploSeleccionado].ejemplo.detalles
                        .reduce((sum, d) => {
                          const monto = d.haber ? parseFloat(d.haber.replace(/[^\d.]/g, '')) : 0;
                          return sum + monto;
                        }, 0)
                        .toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div style={{
                    textAlign: 'center',
                    marginTop: '12px',
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>✅</span>
                    ASIENTO BALANCEADO
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EjemplosAsientos;
