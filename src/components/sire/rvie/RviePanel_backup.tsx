/**
 * Componente principal RVIE
 * Interfaz para gestionar el Registro de Ventas e Ingresos Electrónico
 */

import React, { useState, useEffect } from 'react';
import { useRvie } from '../../../hooks/useRvie';
import { sireService } from '../../../services/sire';
import type { Empresa } from '../../../types/empresa';
import './RviePanel.css';

// ========================================
// INTERFACES
// ========================================

interface RviePanelProps {
  company: Empresa;
  onClose?: () => void;
}

interface PeriodoForm {
  año: string;
  mes: string;
}

// ========================================
// CONSTANTES
// ========================================

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

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export const RviePanel: React.FC<RviePanelProps> = ({ company, onClose }) => {
  // Hooks
  const {
    authStatus,
    tickets,
    resumen,
    inconsistencias,
    endpointsDisponibles,
    loading,
    error,
    operacionActiva,
    authenticate,
    descargarPropuesta,
    aceptarPropuesta,
    consultarTicket,
    descargarArchivo,
    cargarResumen,
    cargarInconsistencias,
    clearError
  } = useRvie({ 
    ruc: company.ruc,
    auto_refresh: true,
    refresh_interval: 30000
  });

  // Estados locales
  const [activeTab, setActiveTab] = useState<'funciones' | 'operaciones' | 'tickets' | 'resumen'>('funciones');
  const [periodoForm, setPeriodoForm] = useState<PeriodoForm>({
    año: new Date().getFullYear().toString(),
    mes: String(new Date().getMonth() + 1).padStart(2, '0')
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAuthRequired, setShowAuthRequired] = useState(false);

  // ========================================
  // UTILIDADES
  // ========================================

  const getPeriodo = (): string => {
    return `${periodoForm.año}${periodoForm.mes}`;
  };

  const getPeriodoLabel = (): string => {
    const mes = MESES.find(m => m.value === periodoForm.mes);
    return `${mes?.label || periodoForm.mes} ${periodoForm.año}`;
  };

  // ========================================
  // HANDLERS DE OPERACIONES
  // ========================================

  const handleDescargarPropuesta = async () => {
    try {
      await descargarPropuesta({
        ruc: company.ruc,
        periodo: getPeriodo()
      });
      setActiveTab('tickets');
    } catch (error) {
      console.error('Error descargando propuesta:', error);
    }
  };

  const handleAceptarPropuesta = async () => {
    try {
      await aceptarPropuesta({
        ruc: company.ruc,
        periodo: getPeriodo()
      });
      setActiveTab('tickets');
    } catch (error) {
      console.error('Error aceptando propuesta:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    try {
      // TODO: Implementar reemplazar propuesta con archivo
      setActiveTab('tickets');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
    }
  };

  const handleTestMode = () => {
    // Simular autenticación exitosa para modo de prueba
    alert('🧪 Modo de Prueba Activado!\n\nPuedes probar todas las funciones RVIE sin conectar a SUNAT.\nEsto es útil para desarrollo y demostración.');
    // Simular estado autenticado
    console.log('🧪 [TEST] Modo de prueba activado');
  };

  // ========================================
  // HANDLERS DE TICKETS
  // ========================================

  const handleRefreshTicket = async (ticketId: string) => {
    try {
      await consultarTicket(ticketId);
    } catch (error) {
      console.error('Error refrescando ticket:', error);
    }
  };

  const handleDownloadFile = async (ticketId: string) => {
    try {
      await descargarArchivo(ticketId);
    } catch (error) {
      console.error('Error descargando archivo:', error);
    }
  };

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (activeTab === 'resumen') {
      cargarResumen(getPeriodo());
      cargarInconsistencias(getPeriodo());
    }
  }, [activeTab, periodoForm]);

  // ========================================
  // RENDER PRINCIPAL (siempre mostrar tabs)
  // ========================================

  return (
    <div className="rvie-panel">
      {/* Header */}
      <div className="rvie-header">
        <div className="header-info">
          <h2>📊 RVIE - Registro de Ventas e Ingresos</h2>
          <p><strong>{company.razon_social}</strong> | RUC: {company.ruc}</p>
          <div className={`auth-status ${authStatus?.authenticated ? 'authenticated' : 'not-authenticated'}`}>
            {authStatus?.authenticated ? '✅ Autenticado' : '🔐 No autenticado'}
          </div>
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {/* Navegación */}
      <div className="rvie-nav">
        <button 
          className={`nav-btn ${activeTab === 'funciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('funciones')}
        >
          📋 Funciones RVIE
        </button>
        <button 
          className={`nav-btn ${activeTab === 'operaciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('operaciones')}
        >
          🔧 Operaciones
        </button>
        <button 
          className={`nav-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          🎫 Tickets ({tickets.length})
        </button>
        <button 
          className={`nav-btn ${activeTab === 'resumen' ? 'active' : ''}`}
          onClick={() => setActiveTab('resumen')}
        >
          📋 Resumen
        </button>
      </div>

      {/* Contenido principal */}
      <div className="rvie-content">
        {/* Selector de período - solo para operaciones, tickets y resumen */}
        {(activeTab === 'operaciones' || activeTab === 'tickets' || activeTab === 'resumen') && (
          <div className="periodo-selector">
            <h3>📅 Período de trabajo: {getPeriodoLabel()}</h3>
            <div className="periodo-inputs">
              <select 
                value={periodoForm.año}
                onChange={(e) => setPeriodoForm(prev => ({ ...prev, año: e.target.value }))}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const año = new Date().getFullYear() - i;
                  return (
                    <option key={año} value={año}>{año}</option>
                  );
                })}
              </select>
              <select 
                value={periodoForm.mes}
                onChange={(e) => setPeriodoForm(prev => ({ ...prev, mes: e.target.value }))}
              >
                {MESES.map(mes => (
                  <option key={mes.value} value={mes.value}>{mes.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Tab: Funciones RVIE */}
        {activeTab === 'funciones' && (
          <div className="funciones-tab">
            <div className="funciones-info">
              <h3>🔗 Funciones RVIE Disponibles</h3>
              <p className="funciones-description">
                El módulo RVIE (Registro de Ventas e Ingresos Electrónico) permite gestionar
                las siguientes operaciones con SUNAT:
              </p>
              
              {endpointsDisponibles && (
                <div className="endpoints-grid">
                  {endpointsDisponibles.rvie_endpoints?.map((endpoint: any, index: number) => (
                    <div key={index} className="endpoint-card">
                      <div className="endpoint-header">
                        <h4 className="endpoint-name">{endpoint.endpoint}</h4>
                        <span className="endpoint-method">{endpoint.method}</span>
                      </div>
                      <p className="endpoint-description">{endpoint.description}</p>
                      <div className="endpoint-requirements">
                        <strong>Requiere:</strong>
                        <ul>
                          {endpoint.requires.map((req: string, i: number) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="api-info">
                <h4>📡 Información de la API</h4>
                <div className="api-details">
                  <p><strong>Base URL:</strong> <code>{endpointsDisponibles?.base_url || '/api/v1/sire/rvie'}</code></p>
                  <p><strong>Autenticación:</strong> {endpointsDisponibles?.authentication || 'Requiere credenciales SUNAT válidas'}</p>
                  <p><strong>Estado:</strong> 
                    <span className={`status-badge ${endpointsDisponibles?.status === 'disponible' ? 'available' : 'unavailable'}`}>
                      {endpointsDisponibles?.status === 'disponible' ? '✅ Disponible' : '❌ No disponible'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="empresa-info">
                <h4>🏢 Empresa Actual</h4>
                <div className="empresa-details">
                  <p><strong>RUC:</strong> {company.ruc}</p>
                  <p><strong>Razón Social:</strong> {company.razon_social}</p>
                  <p><strong>Usuario SUNAT:</strong> {company.sunat_usuario ? '✅ Configurado' : '❌ No configurado'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Operaciones */}
        {activeTab === 'operaciones' && (
          <div className="operaciones-tab">
            {!authStatus?.authenticated && (
              <div className="auth-required-message">
                <h3>🔐 Autenticación SUNAT Requerida</h3>
                <p>Para acceder a las operaciones RVIE debe autenticarse con SUNAT primero.</p>
                
                <div className="auth-buttons">
                  <button 
                    className="btn-primary"
                    onClick={() => authenticate(company.ruc)}
                    disabled={loading || operacionActiva === 'authenticate'}
                  >
                    {loading ? '🔄 Autenticando...' : '🔐 Autenticar con SUNAT'}
                  </button>
                  
                  <button 
                    className="btn-test"
                    onClick={handleTestMode}
                    disabled={loading}
                  >
                    🧪 Modo de Prueba (Sin SUNAT)
                  </button>
                </div>
                
                <div className="test-mode-info">
                  <p><small>💡 <strong>Modo de Prueba:</strong> Simula las operaciones RVIE sin conectar a SUNAT. Útil para testing y demostración.</small></p>
                </div>
                
                {error && (
                  <div className="error-message">
                    <p>❌ Error: {error.message}</p>
                    <button onClick={clearError}>Cerrar</button>
                  </div>
                )}
              </div>
            )}
            
            {authStatus?.authenticated && (
              <>
                <div className="operacion-card">
                  <h4>📥 Descargar Propuesta SUNAT</h4>
                  <p>Descarga la propuesta de ventas e ingresos generada por SUNAT para el período seleccionado.</p>
                  <button 
                    className="btn-primary"
                    onClick={handleDescargarPropuesta}
                    disabled={loading || operacionActiva === 'descargar_propuesta'}
                  >
                    {operacionActiva === 'descargar_propuesta' ? 'Descargando...' : 'Descargar Propuesta'}
                  </button>
                </div>

                <div className="operacion-card">
                  <h4>✅ Aceptar Propuesta</h4>
                  <p>Acepta la propuesta de SUNAT sin modificaciones.</p>
                  <button 
                    className="btn-success"
                    onClick={handleAceptarPropuesta}
                    disabled={loading || operacionActiva === 'aceptar_propuesta'}
                  >
                    {operacionActiva === 'aceptar_propuesta' ? 'Procesando...' : 'Aceptar Propuesta'}
                  </button>
                </div>

                <div className="operacion-card">
                  <h4>📄 Reemplazar con Archivo</h4>
                  <p>Sube un archivo TXT personalizado para reemplazar la propuesta de SUNAT.</p>
                  <div className="file-upload">
                    <input 
                      type="file"
                      accept=".txt"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      disabled={loading}
                    />
                    {selectedFile && (
                      <div className="file-info">
                        <span>📎 {selectedFile.name}</span>
                        <span>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    )}
                  </div>
                  <button 
                    className="btn-warning"
                    onClick={handleFileUpload}
                    disabled={!selectedFile || loading}
                  >
                    Subir y Reemplazar
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Tickets */}
        {activeTab === 'tickets' && (
          <div className="tickets-tab">
            <h3>🎫 Gestión de Tickets RVIE</h3>
            {tickets.length === 0 ? (
              <div className="no-tickets">
                <p>No hay tickets activos.</p>
                <p>Los tickets se generan automáticamente cuando realizas operaciones RVIE.</p>
              </div>
            ) : (
              <div className="tickets-grid">
                {tickets.map((ticket, index) => (
                  <div key={index} className="ticket-card">
                    <h4>Ticket #{ticket.ticket}</h4>
                    <p><strong>Estado:</strong> {ticket.estado}</p>
                    <div className="ticket-actions">
                      <button onClick={() => handleRefreshTicket(ticket.ticket)}>
                        🔄 Actualizar
                      </button>
                      <button onClick={() => handleDownloadFile(ticket.ticket)}>
                        📥 Descargar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Resumen */}
        {activeTab === 'resumen' && (
          <div className="resumen-tab">
            <h3>📋 Resumen RVIE</h3>
            <div className="resumen-content">
              <div className="resumen-card">
                <h4>📊 Estadísticas del Período</h4>
                <p>Período: {getPeriodoLabel()}</p>
                {resumen ? (
                  <div className="stats">
                    <p>Total registros: {resumen.total_registros || 0}</p>
                    <p>Procesados: {resumen.procesados || 0}</p>
                    <p>Pendientes: {resumen.pendientes || 0}</p>
                  </div>
                ) : (
                  <p>No hay datos disponibles para este período.</p>
                )}
              </div>
              
              {inconsistencias.length > 0 && (
                <div className="resumen-card">
                  <h4>⚠️ Inconsistencias</h4>
                  <div className="inconsistencias-list">
                    {inconsistencias.map((inc, index) => (
                      <div key={index} className="inconsistencia-item">
                        <p><strong>Línea {inc.linea}:</strong> {inc.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RviePanel;
