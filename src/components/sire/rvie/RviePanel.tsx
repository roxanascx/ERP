/**
 * Componente principal RVIE - Versión Refactorizada
 * Interfaz para gestionar el Registro de Ventas e Ingresos Electrónico
 */

import { useState, useEffect } from 'react';
import { useRvie } from '../../../hooks/useRvie';
import { RvieOperaciones, RvieTickets, RvieVentas } from './components';
import type { Empresa } from '../../../types/empresa';
import type { RvieDescargarPropuestaRequest, RvieAceptarPropuestaRequest } from '../../../types/sire';

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

const AÑOS_DISPONIBLES = Array.from({ length: 5 }, (_, i) => {
  const año = new Date().getFullYear() - i;
  return { value: año.toString(), label: año.toString() };
});

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function RviePanel({ company, onClose }: RviePanelProps) {
  // Hook RVIE
  const {
    authStatus,
    tickets,
    loading,
    error: rvieError,
    descargarPropuesta,
    aceptarPropuesta,
    checkAuth,
    cargarTickets,
    consultarTicket,
    descargarArchivo
  } = useRvie({ ruc: company?.ruc || '' });

  // Estados locales
  const [periodo, setPeriodo] = useState<PeriodoForm>({
    año: new Date().getFullYear().toString(),
    mes: String(new Date().getMonth() + 1).padStart(2, '0')
  });

  const [operacionActiva, setOperacionActiva] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [vistaActiva, setVistaActiva] = useState<'operaciones' | 'tickets' | 'ventas'>('operaciones');

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (company?.ruc) {
      checkAuth();
      cargarTickets(); // Cargar tickets existentes
    }
  }, [company?.ruc]); // Solo depende del RUC, no de las funciones

  // Debug: Para ver si los tickets están llegando
  useEffect(() => {
    console.log('🎫 RVIE Debug - Tickets actuales:', tickets);
    console.log('🎫 RVIE Debug - Total tickets:', tickets?.length || 0);
  }, [tickets]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleDescargarPropuesta = async (params: RvieDescargarPropuestaRequest) => {
    setOperacionActiva('descargar_propuesta');
    setError(null);

    try {
      const result = await descargarPropuesta(params);
      setResultado(result);
      // Recargar tickets después de la operación
      await cargarTickets();
    } catch (err) {
      console.error('Error al descargar propuesta:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al descargar propuesta');
    } finally {
      setOperacionActiva(null);
    }
  };

  const handleAceptarPropuesta = async (params: RvieAceptarPropuestaRequest) => {
    setOperacionActiva('aceptar_propuesta');
    setError(null);

    try {
      const result = await aceptarPropuesta(params);
      setResultado(result);
      // Recargar tickets después de la operación
      await cargarTickets();
    } catch (err) {
      console.error('Error al aceptar propuesta:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al aceptar propuesta');
    } finally {
      setOperacionActiva(null);
    }
  };

  const handleConsultarTicket = async (ticketId: string) => {
    try {
      await consultarTicket(ticketId);
      // Recargar tickets para obtener el estado actualizado
      await cargarTickets();
    } catch (err) {
      console.error('Error al consultar ticket:', err);
      setError(err instanceof Error ? err.message : 'Error al consultar ticket');
    }
  };

  const handleDescargarArchivo = async (ticketId: string) => {
    try {
      await descargarArchivo(ticketId);
    } catch (err) {
      console.error('Error al descargar archivo:', err);
      setError(err instanceof Error ? err.message : 'Error al descargar archivo');
    }
  };

  const handleVerificarAuth = async () => {
    if (company?.ruc) {
      await checkAuth();
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="rvie-panel">
      <style>{`
        .rvie-panel {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .panel-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .empresa-info {
          margin: 10px 0;
        }

        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 5px;
        }

        .auth-status {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .auth-status.authenticated {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }

        .auth-status.not-authenticated {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }

        .periodo-selector {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .periodo-row {
          display: flex;
          gap: 15px;
          align-items: end;
          margin-bottom: 15px;
        }

        .periodo-group {
          flex: 1;
        }

        .periodo-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .periodo-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .empresa-resumen {
          margin-top: 15px;
          padding: 15px;
          background: white;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        .vista-tabs {
          display: flex;
          gap: 2px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }

        .vista-tab {
          padding: 10px 20px;
          border: none;
          background: #f8f9fa;
          cursor: pointer;
          border-radius: 4px 4px 0 0;
          font-weight: 500;
          transition: all 0.2s;
        }

        .vista-tab.active {
          background: #007bff;
          color: white;
        }

        .vista-tab:hover:not(.active) {
          background: #e9ecef;
        }

        .vista-content {
          min-height: 400px;
        }

        .btn-primary, .btn-success, .btn-secondary {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 140px;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background: #1e7e34;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }

        .btn-primary:disabled,
        .btn-success:disabled,
        .btn-secondary:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .error-message {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }

        .success-message {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }

        .loading-spinner {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 20px;
        }

        .resultado-section {
          margin-top: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .rvie-panel {
            padding: 15px;
          }

          .periodo-row {
            flex-direction: column;
            gap: 10px;
          }

          .vista-tabs {
            flex-direction: column;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div className="panel-header">
        <h2>📊 RVIE - Registro de Ventas e Ingresos Electrónico</h2>
        <div className="empresa-info">
          <p><strong>{company.razon_social}</strong> | RUC: {company.ruc}</p>
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✖️ Cerrar
          </button>
        )}
      </div>

      {/* Estado de autenticación */}
      <div className={`auth-status ${authStatus?.authenticated ? 'authenticated' : 'not-authenticated'}`}>
        <span>
          {authStatus?.authenticated ? '✅' : '❌'} 
          Estado SUNAT: {authStatus?.authenticated ? 'Autenticado' : 'No autenticado'}
        </span>
        <button 
          className="btn-secondary"
          onClick={handleVerificarAuth}
          disabled={loading}
        >
          🔄 Verificar
        </button>
      </div>

      {/* Selector de período */}
      <div className="periodo-selector">
        <h3>📅 Seleccionar Período</h3>
        <div className="periodo-row">
          <div className="periodo-group">
            <label htmlFor="año">Año:</label>
            <select
              id="año"
              value={periodo.año}
              onChange={(e) => setPeriodo(prev => ({ ...prev, año: e.target.value }))}
            >
              {AÑOS_DISPONIBLES.map(año => (
                <option key={año.value} value={año.value}>
                  {año.label}
                </option>
              ))}
            </select>
          </div>

          <div className="periodo-group">
            <label htmlFor="mes">Mes:</label>
            <select
              id="mes"
              value={periodo.mes}
              onChange={(e) => setPeriodo(prev => ({ ...prev, mes: e.target.value }))}
            >
              {MESES.map(mes => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="empresa-resumen">
          <h4>📋 Información de la Empresa</h4>
          <div className="info-grid">
            <p><strong>RUC:</strong> {company.ruc}</p>
            <p><strong>Razón Social:</strong> {company.razon_social}</p>
            <p><strong>Usuario SUNAT:</strong> {company.sunat_usuario ? '✅ Configurado' : '❌ No configurado'}</p>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="vista-tabs">
        <button 
          className={`vista-tab ${vistaActiva === 'operaciones' ? 'active' : ''}`}
          onClick={() => setVistaActiva('operaciones')}
        >
          🔧 Operaciones RVIE
        </button>
        <button 
          className={`vista-tab ${vistaActiva === 'tickets' ? 'active' : ''}`}
          onClick={() => setVistaActiva('tickets')}
        >
          🎫 Tickets ({tickets?.length || 0})
        </button>
        <button 
          className={`vista-tab ${vistaActiva === 'ventas' ? 'active' : ''}`}
          onClick={() => setVistaActiva('ventas')}
        >
          💰 Gestión de Ventas
        </button>
      </div>

      {/* Contenido de las vistas */}
      <div className="vista-content">
        {vistaActiva === 'operaciones' && (
          <RvieOperaciones
            periodo={periodo}
            authStatus={authStatus}
            loading={loading}
            operacionActiva={operacionActiva}
            onDescargarPropuesta={handleDescargarPropuesta}
            onAceptarPropuesta={handleAceptarPropuesta}
          />
        )}

        {vistaActiva === 'tickets' && (
          <RvieTickets
            tickets={tickets || []}
            loading={loading}
            onConsultarTicket={handleConsultarTicket}
            onDescargarArchivo={handleDescargarArchivo}
          />
        )}

        {vistaActiva === 'ventas' && (
          <RvieVentas
            ruc={company.ruc}
            periodo={periodo}
            authStatus={authStatus}
            loading={loading}
          />
        )}
      </div>

      {/* Mensajes de error */}
      {(error || rvieError) && (
        <div className="error-message">
          <p><strong>Error:</strong> {error || (typeof rvieError === 'string' ? rvieError : rvieError?.message || 'Error desconocido')}</p>
        </div>
      )}

      {/* Sección de resultados */}
      {(loading || resultado) && (
        <div className="resultado-section">
          <h3>📋 Resultados</h3>
          
          {loading && (
            <div className="loading-spinner">
              <p>🔄 Procesando operación...</p>
            </div>
          )}
          
          {resultado && (
            <div className="success-message">
              <h4>✅ Operación completada exitosamente</h4>
              <pre style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '4px', 
                overflow: 'auto',
                maxHeight: '300px',
                fontSize: '12px'
              }}>
                {JSON.stringify(resultado, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
