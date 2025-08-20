/**
 * Página de Tickets RCE
 * Consultar y descargar archivos procesados
 * URL: /sire/rce/tickets
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import api from '../../../services/api';

interface Ticket {
  numTicket: string;
  perTributario: string;
  desEstadoProceso: string;
  desProceso: string;
  fecInicProceso: string;
  fecFinProceso?: string;
  archivoReporte?: any[];
}

const RceTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { empresaActual } = useEmpresaValidation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('202507');

  const consultarTickets = async () => {
    if (!empresaActual) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🎫 Consultando tickets para período:', selectedPeriod);
      
      const response = await api.get('/api/v1/sire/rce/sunat/tickets', {
        params: {
          ruc: empresaActual.ruc,
          periodo_ini: selectedPeriod,
          periodo_fin: selectedPeriod,
          page: 1,
          per_page: 50
        }
      });

      console.log('✅ Respuesta de tickets:', response.data);
      
      if (response.data.exitoso && response.data.datos?.registros) {
        setTickets(response.data.datos.registros);
      } else {
        setError('No se encontraron tickets para el período seleccionado');
        setTickets([]);
      }
    } catch (err: any) {
      console.error('❌ Error consultando tickets:', err);
      setError(err.response?.data?.detail || 'Error consultando tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    consultarTickets();
  }, [selectedPeriod, empresaActual]);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
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
                onClick={() => navigate('/sire/rce')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                RCE
              </button>
              <span style={{ color: '#6b7280' }}>›</span>
              <span style={{ color: '#374151', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Tickets
              </span>
            </div>
            
            {/* Título principal */}
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.8rem', 
              fontWeight: 'bold',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📋 Gestión de Tickets RCE
            </h1>
          </div>
          
          <button
            onClick={() => navigate('/sire/rce')}
            style={{
              background: '#f3f4f6',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Volver a RCE
          </button>
        </div>
      </div>

      {/* Información de la Empresa y Controles */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <strong>RUC:</strong> {empresaActual.ruc}
          </div>
          <div>
            <strong>Empresa:</strong> {empresaActual.razon_social}
          </div>
          <div>
            <strong>Total Tickets:</strong> <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{tickets.length}</span>
          </div>
        </div>

        {/* Controles de período */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold' }}>Período:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '0.9rem'
            }}
          >
            <option value="202507">Julio 2025</option>
            <option value="202506">Junio 2025</option>
            <option value="202505">Mayo 2025</option>
            <option value="202504">Abril 2025</option>
          </select>
          
          <button
            onClick={consultarTickets}
            disabled={loading}
            style={{
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '⏳ Consultando...' : '🔄 Consultar'}
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            color: '#dc2626'
          }}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Consultando tickets...</p>
          </div>
        )}

        {!loading && tickets.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3>No hay tickets disponibles</h3>
            <p>No se encontraron tickets para el período {selectedPeriod}</p>
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#374151' }}>
              📋 Tickets Encontrados ({tickets.length})
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {tickets.map((ticket, index) => (
                <div
                  key={ticket.numTicket || index}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    background: ticket.desEstadoProceso === 'Terminado' ? '#f0fdf4' : '#fefce8'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <strong>Ticket:</strong> {ticket.numTicket}
                    </div>
                    <div>
                      <strong>Período:</strong> {ticket.perTributario}
                    </div>
                    <div>
                      <strong>Estado:</strong> 
                      <span style={{ 
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        background: ticket.desEstadoProceso === 'Terminado' ? '#dcfce7' : '#fef3c7',
                        color: ticket.desEstadoProceso === 'Terminado' ? '#166534' : '#92400e'
                      }}>
                        {ticket.desEstadoProceso}
                      </span>
                    </div>
                    <div>
                      <strong>Proceso:</strong> {ticket.desProceso}
                    </div>
                    <div>
                      <strong>Inicio:</strong> {ticket.fecInicProceso}
                    </div>
                    {ticket.fecFinProceso && (
                      <div>
                        <strong>Fin:</strong> {ticket.fecFinProceso}
                      </div>
                    )}
                  </div>
                  
                  {ticket.archivoReporte && ticket.archivoReporte.length > 0 && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                      <strong>Archivos:</strong>
                      <ul style={{ margin: '0.5rem 0 0 1rem' }}>
                        {ticket.archivoReporte.map((archivo: any, i: number) => (
                          <li key={i} style={{ color: '#3b82f6' }}>
                            📄 {archivo.nomArchivoReporte || 'Archivo disponible'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RceTicketsPage;
