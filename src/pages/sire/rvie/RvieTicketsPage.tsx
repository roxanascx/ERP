/**
 * Página específica para Gestión de Tickets RVIE
 * URL: /sire/rvie/tickets
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRvie } from '../../../hooks/useRvie';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import { RvieTickets } from '../../../components/sire/rvie/components';

const RvieTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { empresaActual } = useEmpresaValidation();
  
  // Hook RVIE
  const {
    authStatus,
    tickets,
    loading,
    consultarTicket,
    descargarArchivo,
    cargarTickets,
    cargarTodosTickets
  } = useRvie({ ruc: empresaActual?.ruc || '' });

  // Estado para mostrar todos los tickets o solo con archivos
  const [mostrarTodos, setMostrarTodos] = useState(true); // ✅ CAMBIADO: Por defecto mostrar todos

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

  // Wrappers para las funciones async
  const handleConsultarTicket = async (ticketId: string): Promise<void> => {
    try {
      await consultarTicket(ticketId);
    } catch (error) {
      // ...
    }
  };

  const handleDescargarArchivo = async (ticketId: string): Promise<void> => {
    try {
      await descargarArchivo(ticketId);
    } catch (error) {
      // ...
    }
  };

  const handleToggleTodos = async () => {
    setMostrarTodos(!mostrarTodos);
    if (mostrarTodos) {
      // Si actualmente mostramos todos, cambiar a solo con archivos
      await cargarTickets();
    } else {
      // Si actualmente mostramos solo con archivos, cambiar a todos
      await cargarTodosTickets();
    }
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
                Gestión de Tickets
              </span>
            </div>
            
            {/* Título */}
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              🎫 Gestión de Tickets RVIE
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

      {/* Controles de tickets */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>📋 Tickets Disponibles</h3>
            <p style={{ margin: 0, color: '#6b7280' }}>
              Total: {tickets?.length || 0} tickets
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Toggle para filtrar tickets */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!mostrarTodos}
                onChange={handleToggleTodos}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                Solo tickets con archivos
              </span>
            </label>

            {/* Botón refrescar */}
            <button
              onClick={() => mostrarTodos ? cargarTodosTickets() : cargarTickets()}
              disabled={loading}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🔄 {loading ? 'Cargando...' : 'Refrescar'}
            </button>
          </div>
        </div>
      </div>

      {/* Información de autenticación */}
      {!authStatus?.authenticated && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            ⚠️ <strong>No autenticado con SUNAT.</strong> Algunas funciones pueden estar limitadas.
          </p>
        </div>
      )}

      {/* Componente de tickets */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <RvieTickets
          tickets={tickets || []}
          loading={loading}
          onConsultarTicket={handleConsultarTicket}
          onDescargarArchivo={handleDescargarArchivo}
        />
      </div>
    </div>
  );
};

export default RvieTicketsPage;
