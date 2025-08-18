/**
 * Página específica para Operaciones RVIE
 * URL: /sire/rvie/operaciones
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRvie } from '../../../hooks/useRvie';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import { RvieOperaciones } from '../../../components/sire/rvie/components';

const RvieOperacionesPage: React.FC = () => {
  const navigate = useNavigate();
  const { empresaActual } = useEmpresaValidation();
  
  // Estados para período
  const [periodo, setPeriodo] = useState({
    año: new Date().getFullYear().toString(),
    mes: String(new Date().getMonth() + 1).padStart(2, '0')
  });

  // Hook RVIE
  const {
    authStatus,
    tickets,
    resumen,
    loading
  } = useRvie({ ruc: empresaActual?.ruc || '' });

  const MESES = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  const AÑOS_DISPONIBLES = Array.from({ length: 5 }, (_, i) => {
    const año = new Date().getFullYear() - i;
    return { value: año.toString(), label: año.toString() };
  });

  if (!empresaActual) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
          <h2>🏢 Empresa no encontrada</h2>
          <button onClick={() => navigate('/empresas')}>
            Seleccionar Empresa
          </button>
        </div>
      </div>
    );
  }

  // Wrappers para funciones de tickets
  const handleConsultarTicket = async (ticketId: string): Promise<void> => {
    console.log('Consultando ticket:', ticketId);
    // TODO: Implementar lógica de consulta
  };

  const handleDescargarArchivo = async (ticketId: string): Promise<void> => {
    console.log('Descargando archivo:', ticketId);  
    // TODO: Implementar lógica de descarga
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '20px'
    }}>
      {/* Header de navegación */}
      <div style={{
        background: 'white',
        padding: '1rem 2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                onClick={() => navigate('/sire')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                SIRE
              </button>
              <span style={{ color: '#6b7280' }}>›</span>
              <button
                onClick={() => navigate('/sire/rvie')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                RVIE
              </button>
              <span style={{ color: '#6b7280' }}>›</span>
              <span style={{ color: '#374151', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Operaciones
              </span>
            </div>
            
            {/* Título */}
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              ⚙️ Operaciones RVIE
            </h1>
          </div>

          {/* Botón volver */}
          <button
            onClick={() => navigate('/sire/rvie')}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ← Volver a RVIE
          </button>
        </div>
      </div>

      {/* Selector de período */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>📅 Seleccionar Período</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Año:</label>
            <select
              value={periodo.año}
              onChange={(e) => setPeriodo(prev => ({ ...prev, año: e.target.value }))}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '1rem'
              }}
            >
              {AÑOS_DISPONIBLES.map(año => (
                <option key={año.value} value={año.value}>{año.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mes:</label>
            <select
              value={periodo.mes}
              onChange={(e) => setPeriodo(prev => ({ ...prev, mes: e.target.value }))}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '1rem'
              }}
            >
              {MESES.map(mes => (
                <option key={mes.value} value={mes.value}>{mes.label}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{
              padding: '0.75rem 1rem',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              fontWeight: 'bold'
            }}>
              Período: {MESES.find(m => m.value === periodo.mes)?.label} {periodo.año}
            </div>
          </div>
        </div>
      </div>

      {/* Estado de autenticación */}
      <div style={{
        background: authStatus?.authenticated ? '#d1fae5' : '#fef3c7',
        border: `1px solid ${authStatus?.authenticated ? '#10b981' : '#f59e0b'}`,
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <p style={{ 
          margin: 0, 
          color: authStatus?.authenticated ? '#065f46' : '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {authStatus?.authenticated ? '✅' : '⚠️'}
          <strong>Estado SUNAT:</strong> 
          {authStatus?.authenticated ? 'Autenticado correctamente' : 'No autenticado - Algunas operaciones pueden fallar'}
        </p>
      </div>

      {/* Componente de operaciones */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <RvieOperaciones
          periodo={periodo}
          authStatus={authStatus}
          resumen={resumen}
          loading={loading}
          operacionActiva={null}
          tickets={tickets || []}
          onDescargarPropuesta={async (params) => {
            console.log('Descargando propuesta:', params);
            // TODO: Implementar descarga de propuesta
          }}
          onAceptarPropuesta={async (params) => {
            console.log('Aceptando propuesta:', params);
            // TODO: Implementar aceptar propuesta  
          }}
          onConsultarTicket={handleConsultarTicket}
          onDescargarArchivo={handleDescargarArchivo}
        />
      </div>
    </div>
  );
};

export default RvieOperacionesPage;
