import React, { useState } from 'react';
import type { LibroDiario } from '../../../types/libroDiario';
import PLEExportManager from './PLEExportManager';

interface LibroDiarioDetalleProps {
  libro: LibroDiario;
  onClose: () => void;
  onAgregarAsiento?: () => void;
}

const LibroDiarioDetalle: React.FC<LibroDiarioDetalleProps> = ({
  libro,
  onClose,
  onAgregarAsiento
}) => {
  const [mostrarPLEManager, setMostrarPLEManager] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'validado':
        return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'cerrado':
        return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
      default: // borrador
        return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
    }
  };

  const estadoColors = getEstadoColor(libro.estado);
  const isBalanceado = Math.abs(libro.totalDebe - libro.totalHaber) < 0.01;

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Header del detalle */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        position: 'relative'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start' 
        }}>
          <div>
            <h3 style={{ 
              margin: '0 0 8px 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '1.75rem' }}>📖</span>
              {libro.descripcion}
            </h3>
            <p style={{ 
              margin: '0',
              opacity: 0.9,
              fontSize: '14px'
            }}>
              Detalles del libro diario seleccionado
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: 'white',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ✕ Cerrar
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ padding: '24px' }}>
        {/* Información básica */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
              PERÍODO
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              📅 {libro.periodo}
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
              ESTADO
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: estadoColors.bg,
                color: estadoColors.text,
                border: `1px solid ${estadoColors.border}`,
                textTransform: 'capitalize'
              }}>
                {libro.estado}
              </span>
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
              ASIENTOS
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              📝 {libro.asientos?.length || 0}
            </div>
          </div>
        </div>

        {/* Información financiera */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #0369a1'
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0',
            color: '#0c4a6e',
            fontSize: '1.1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💰 Resumen Financiero
          </h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#059669',
                marginBottom: '4px'
              }}>
                S/ {libro.totalDebe.toFixed(2)}
              </div>
              <div style={{ fontSize: '14px', color: '#0c4a6e' }}>Total Debe</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#dc2626',
                marginBottom: '4px'
              }}>
                S/ {libro.totalHaber.toFixed(2)}
              </div>
              <div style={{ fontSize: '14px', color: '#0c4a6e' }}>Total Haber</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: isBalanceado ? '#059669' : '#dc2626',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                {isBalanceado ? '✅' : '⚠️'}
                {isBalanceado ? 'Balanceado' : 'Desbalanceado'}
              </div>
              <div style={{ fontSize: '14px', color: '#0c4a6e' }}>
                Estado del Balance
              </div>
            </div>
          </div>
        </div>

        {/* Acciones disponibles */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0',
            color: '#475569',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            🛠️ Acciones Disponibles
          </h4>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {onAgregarAsiento && (
              <button
                onClick={onAgregarAsiento}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                <span>➕</span>
                Agregar Asiento
              </button>
            )}
            
            <button
              onClick={() => alert('Funcionalidad en desarrollo')}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
              }}
            >
              <span>📊</span>
              Ver Asientos
            </button>

            <button
              onClick={() => setMostrarPLEManager(true)}
              style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#047857';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
            >
              <span>🇵🇪</span>
              Exportar PLE SUNAT
            </button>
          </div>

          <div style={{ 
            marginTop: '16px',
            padding: '12px',
            background: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#065f46'
          }}>
            ✅ <strong>¡Nuevo!</strong> Exportación a formato PLE para SUNAT ya disponible. 
            Genera archivos TXT y ZIP según especificaciones oficiales.
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          borderRadius: '8px',
          backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 1000,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      {/* Modal PLE Export Manager */}
      {mostrarPLEManager && (
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
          <div style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <PLEExportManager
              libro={libro}
              onClose={() => setMostrarPLEManager(false)}
              onSuccess={(mensaje) => {
                showToast(mensaje, 'success');
                setMostrarPLEManager(false);
              }}
              onError={(error) => {
                showToast(error, 'error');
              }}
            />
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default LibroDiarioDetalle;
