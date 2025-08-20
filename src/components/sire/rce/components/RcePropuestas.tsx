/**
 * Componente RcePropuestas
 * Gestión de propuestas de información RCE
 */

import React, { useState, useEffect } from 'react';
import { useRce } from '../../../../hooks/useRce';
import type { Empresa } from '../../../../types/empresa';
import type { RcePropuesta, RceEstadoPropuesta } from '../../../../types/rce';

// ========================================
// INTERFACES
// ========================================

interface RcePropuestasProps {
  company: Empresa;
}

interface PropuestaCardProps {
  propuesta: RcePropuesta;
  onEnviar: (propuesta: RcePropuesta) => void;
  onEditar: (propuesta: RcePropuesta) => void;
  onEliminar: (propuesta: RcePropuesta) => void;
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================

const PropuestaCard: React.FC<PropuestaCardProps> = ({
  propuesta,
  onEnviar,
  onEditar,
  onEliminar
}) => {
  const getEstadoColor = (estado: RceEstadoPropuesta): string => {
    const colores: Partial<Record<RceEstadoPropuesta, string>> = {
      'borrador': '#6b7280',
      'generada': '#3b82f6',
      'validada': '#8b5cf6',
      'enviada': '#f59e0b',
      'aceptada': '#10b981',
      'observada': '#f59e0b',
      'rechazada': '#ef4444'
    };
    return colores[estado] || '#6b7280';
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="rce-propuesta-card">
      <div className="rce-propuesta-header">
        <div className="rce-propuesta-info">
          <h4>{propuesta.periodo}</h4>
          <span 
            className="rce-estado-badge"
            style={{ backgroundColor: getEstadoColor(propuesta.estado) }}
          >
            {propuesta.estado}
          </span>
        </div>
        
        <div className="rce-propuesta-actions">
          {propuesta.estado === 'borrador' && (
            <>
              <button
                onClick={() => onEditar(propuesta)}
                className="rce-btn-action rce-btn-edit"
                title="Editar"
              >
                ✏️
              </button>
              <button
                onClick={() => onEnviar(propuesta)}
                className="rce-btn-action rce-btn-send"
                title="Enviar"
              >
                📤
              </button>
              <button
                onClick={() => onEliminar(propuesta)}
                className="rce-btn-action rce-btn-delete"
                title="Eliminar"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rce-propuesta-content">
        <div className="rce-propuesta-stats">
          <div className="rce-stat-item">
            <span className="rce-stat-label">Registros:</span>
            <span className="rce-stat-value">{propuesta.total_registros}</span>
          </div>
          <div className="rce-stat-item">
            <span className="rce-stat-label">Importe:</span>
            <span className="rce-stat-value">
              {new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN'
              }).format(propuesta.total_importe)}
            </span>
          </div>
        </div>

        <div className="rce-propuesta-dates">
          <div className="rce-date-item">
            <span className="rce-date-label">Creada:</span>
            <span className="rce-date-value">{formatearFecha(propuesta.fecha_generacion)}</span>
          </div>
          {propuesta.fecha_envio && (
            <div className="rce-date-item">
              <span className="rce-date-label">Enviada:</span>
              <span className="rce-date-value">{formatearFecha(propuesta.fecha_envio)}</span>
            </div>
          )}
        </div>

        {propuesta.observaciones && (
          <div className="rce-propuesta-observaciones">
            <span className="rce-obs-label">Observaciones:</span>
            <p className="rce-obs-text">{propuesta.observaciones}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export const RcePropuestas: React.FC<RcePropuestasProps> = ({ company }) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [propuestas, setPropuestas] = useState<RcePropuesta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creandoPropuesta, setCreandoPropuesta] = useState(false);

  // ========================================
  // HOOKS
  // ========================================

  const { } = useRce({ ruc: company.ruc });

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarPropuestas();
  }, [company.ruc]);

  // ========================================
  // FUNCIONES
  // ========================================

  const cargarPropuestas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulación de carga de propuestas
      // TODO: Implementar llamada a API
      const propuestasSimuladas: RcePropuesta[] = [
        {
          id: '1',
          ruc: company.ruc,
          periodo: '2024-01',
          tipo_propuesta: 'automatica',
          incluir_no_domiciliados: false,
          estado: 'aceptada',
          comprobantes: [],
          total_registros: 150,
          total_importe: 25000.50,
          fecha_generacion: '2024-01-15T10:30:00Z',
          fecha_envio: '2024-01-20T14:15:00Z',
          fecha_aceptacion: '2024-01-21T09:00:00Z'
        },
        {
          id: '2',
          ruc: company.ruc,
          periodo: '2024-02',
          tipo_propuesta: 'manual',
          incluir_no_domiciliados: true,
          estado: 'borrador',
          comprobantes: [],
          total_registros: 89,
          total_importe: 18500.75,
          fecha_generacion: '2024-02-10T09:00:00Z'
        },
        {
          id: '3',
          ruc: company.ruc,
          periodo: '2024-03',
          tipo_propuesta: 'automatica',
          incluir_no_domiciliados: false,
          estado: 'enviada',
          comprobantes: [],
          total_registros: 203,
          total_importe: 35200.00,
          fecha_generacion: '2024-03-05T11:45:00Z',
          fecha_envio: '2024-03-10T16:30:00Z'
        }
      ];
      
      setPropuestas(propuestasSimuladas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar propuestas');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearPropuesta = async () => {
    setCreandoPropuesta(true);
    setError(null);

    try {
      // TODO: Implementar creación de propuesta
      console.log('Crear nueva propuesta');
      await cargarPropuestas(); // Recargar lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear propuesta');
    } finally {
      setCreandoPropuesta(false);
    }
  };

  const handleEnviarPropuesta = async (propuesta: RcePropuesta) => {
    if (!propuesta.id) return;

    setError(null);

    try {
      // TODO: Implementar envío de propuesta
      console.log('Enviar propuesta:', propuesta.id);
      await cargarPropuestas(); // Recargar lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar propuesta');
    }
  };

  const handleEditarPropuesta = (propuesta: RcePropuesta) => {
    // TODO: Implementar edición de propuesta
    console.log('Editar propuesta:', propuesta);
  };

  const handleEliminarPropuesta = async (propuesta: RcePropuesta) => {
    if (!propuesta.id) return;

    const confirmacion = window.confirm(
      `¿Está seguro de eliminar la propuesta del periodo ${propuesta.periodo}?`
    );

    if (confirmacion) {
      try {
        // TODO: Implementar eliminación
        console.log('Eliminar propuesta:', propuesta.id);
        await cargarPropuestas();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar propuesta');
      }
    }
  };

  // ========================================
  // FUNCIONES DE RENDERIZADO
  // ========================================

  const renderToolbar = () => (
    <div className="rce-propuestas-toolbar">
      <div className="rce-toolbar-left">
        <h3>Propuestas de Información RCE</h3>
      </div>

      <div className="rce-toolbar-right">
        <button
          onClick={cargarPropuestas}
          disabled={loading}
          className="rce-btn rce-btn-refresh"
        >
          {loading ? '⏳' : '🔄'} Actualizar
        </button>

        <button
          onClick={handleCrearPropuesta}
          disabled={creandoPropuesta}
          className="rce-btn rce-btn-primary"
        >
          {creandoPropuesta ? '⏳ Creando...' : '➕ Nueva Propuesta'}
        </button>
      </div>
    </div>
  );

  const renderEstadisticas = () => {
    const stats = propuestas.reduce(
      (acc, propuesta) => {
        acc.total++;
        acc.borradores += propuesta.estado === 'borrador' ? 1 : 0;
        acc.enviadas += propuesta.estado === 'enviada' ? 1 : 0;
        acc.aceptadas += propuesta.estado === 'aceptada' ? 1 : 0;
        acc.rechazadas += propuesta.estado === 'rechazada' ? 1 : 0;
        return acc;
      },
      { total: 0, borradores: 0, enviadas: 0, aceptadas: 0, rechazadas: 0 }
    );

    return (
      <div className="rce-propuestas-stats">
        <div className="rce-stat-card">
          <span className="rce-stat-label">Total</span>
          <span className="rce-stat-value">{stats.total}</span>
        </div>
        <div className="rce-stat-card">
          <span className="rce-stat-label">Borradores</span>
          <span className="rce-stat-value">{stats.borradores}</span>
        </div>
        <div className="rce-stat-card">
          <span className="rce-stat-label">Enviadas</span>
          <span className="rce-stat-value">{stats.enviadas}</span>
        </div>
        <div className="rce-stat-card">
          <span className="rce-stat-label">Aceptadas</span>
          <span className="rce-stat-value">{stats.aceptadas}</span>
        </div>
        <div className="rce-stat-card">
          <span className="rce-stat-label">Rechazadas</span>
          <span className="rce-stat-value">{stats.rechazadas}</span>
        </div>
      </div>
    );
  };

  const renderPropuestas = () => {
    if (propuestas.length === 0) {
      return (
        <div className="rce-empty-state">
          <div className="rce-empty-content">
            <h4>No hay propuestas</h4>
            <p>Cree una nueva propuesta para comenzar el proceso de envío de información RCE a SUNAT.</p>
            <button
              onClick={handleCrearPropuesta}
              disabled={creandoPropuesta}
              className="rce-btn rce-btn-primary"
            >
              {creandoPropuesta ? '⏳ Creando...' : '➕ Crear Primera Propuesta'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="rce-propuestas-grid">
        {propuestas.map((propuesta) => (
          <PropuestaCard
            key={propuesta.id}
            propuesta={propuesta}
            onEnviar={handleEnviarPropuesta}
            onEditar={handleEditarPropuesta}
            onEliminar={handleEliminarPropuesta}
          />
        ))}
      </div>
    );
  };

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  if (error) {
    return (
      <div className="rce-error">
        <div className="rce-error-content">
          <h3>Error en Propuestas RCE</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="rce-btn rce-btn-retry">
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rce-propuestas">
      {renderToolbar()}
      {renderEstadisticas()}
      
      {loading && propuestas.length === 0 ? (
        <div className="rce-loading">
          <div className="rce-loading-spinner"></div>
          <p>Cargando propuestas...</p>
        </div>
      ) : (
        renderPropuestas()
      )}
    </div>
  );
};
