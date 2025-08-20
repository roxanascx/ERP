/**
 * Componente RceComprobantes
 * Gestión y visualización de comprobantes RCE
 */

import React, { useState, useEffect } from 'react';
import { useRceComprobantes } from '../../../../hooks/useRceComprobantes';
import type { Empresa } from '../../../../types/empresa';
import type { RceFiltros, RceComprobante, RceEstadoComprobante } from '../../../../types/rce';

// ========================================
// INTERFACES
// ========================================

interface RceComprobantesProps {
  company: Empresa;
  filtros: RceFiltros;
  onFiltrosChange: (filtros: Partial<RceFiltros>) => void;
}

interface ComprobanteRowProps {
  comprobante: RceComprobante;
  seleccionado: boolean;
  onSeleccionar: (id: string) => void;
  onVer: (comprobante: RceComprobante) => void;
  onEditar: (comprobante: RceComprobante) => void;
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================

const ComprobanteRow: React.FC<ComprobanteRowProps> = ({
  comprobante,
  seleccionado,
  onSeleccionar,
  onVer,
  onEditar
}) => {
  const getEstadoColor = (estado: RceEstadoComprobante): string => {
    const colores: Record<RceEstadoComprobante, string> = {
      'registrado': '#3b82f6',
      'validado': '#10b981',
      'observado': '#f59e0b',
      'anulado': '#ef4444',
      'pendiente': '#6b7280',
      'procesado': '#8b5cf6',
      'incluido': '#10b981',
      'excluido': '#ef4444'
    };
    return colores[estado] || '#6b7280';
  };

  const formatearImporte = (importe: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(importe);
  };

  return (
    <tr className={`rce-comprobante-row ${seleccionado ? 'selected' : ''}`}>
      <td>
        <input
          type="checkbox"
          checked={seleccionado}
          onChange={() => onSeleccionar(comprobante.id || '')}
          className="rce-checkbox"
        />
      </td>
      <td>{comprobante.fecha_emision}</td>
      <td>{comprobante.tipo_comprobante}</td>
      <td>{comprobante.serie}-{comprobante.numero}</td>
      <td>{comprobante.ruc_emisor}</td>
      <td className="rce-text-truncate" title={comprobante.razon_social_emisor}>
        {comprobante.razon_social_emisor}
      </td>
      <td className="rce-text-right">{formatearImporte(comprobante.importe_total)}</td>
      <td>
        <span 
          className="rce-estado-badge"
          style={{ backgroundColor: getEstadoColor(comprobante.estado) }}
        >
          {comprobante.estado}
        </span>
      </td>
      <td>
        <div className="rce-actions">
          <button
            onClick={() => onVer(comprobante)}
            className="rce-btn-action rce-btn-view"
            title="Ver detalles"
          >
            👁️
          </button>
          <button
            onClick={() => onEditar(comprobante)}
            className="rce-btn-action rce-btn-edit"
            title="Editar"
          >
            ✏️
          </button>
        </div>
      </td>
    </tr>
  );
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export const RceComprobantes: React.FC<RceComprobantesProps> = ({
  company,
  filtros,
  // onFiltrosChange
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState<RceComprobante | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // ========================================
  // HOOKS
  // ========================================

  const {
    comprobantes,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPrevPage,
    filtros: filtrosActivos,
    // textoBusqueda,
    estadisticas,
    seleccionados,
    todoSeleccionado,
    algunoSeleccionado,
    // guardando,
    validando,
    eliminando,
    exportando,
    // buscar,
    cargarPagina,
    refrescar,
    // crear,
    // actualizar,
    // eliminar,
    eliminarMasivo,
    // validar,
    validarMasivo,
    actualizarFiltros,
    limpiarFiltros,
    aplicarFiltroRapido,
    // seleccionar,
    // deseleccionar,
    seleccionarTodos,
    deseleccionarTodos,
    toggleSeleccion,
    actualizarBusqueda,
    exportar,
    clearError
  } = useRceComprobantes({
    ruc: company.ruc,
    auto_load: true,
    filtros_iniciales: filtros,
    page_size: 50
  });

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (filtros) {
      actualizarFiltros(filtros);
    }
  }, [filtros, actualizarFiltros]);

  // ========================================
  // MANEJADORES DE EVENTOS
  // ========================================

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusqueda(valor);
    actualizarBusqueda(valor);
  };

  const handleFiltroRapido = (tipo: 'hoy' | 'semana' | 'mes' | 'año') => {
    aplicarFiltroRapido(tipo);
  };

  const handlePaginaChange = (page: number) => {
    cargarPagina(page);
  };

  const handleVerComprobante = (comprobante: RceComprobante) => {
    setComprobanteSeleccionado(comprobante);
    setMostrarModal(true);
  };

  const handleEditarComprobante = (comprobante: RceComprobante) => {
    // TODO: Implementar edición
    console.log('Editar comprobante:', comprobante);
  };

  const handleValidarSeleccionados = async () => {
    if (seleccionados.length === 0) return;
    
    try {
      await validarMasivo();
      await refrescar();
    } catch (error) {
      console.error('Error al validar:', error);
    }
  };

  const handleEliminarSeleccionados = async () => {
    if (seleccionados.length === 0) return;
    
    const confirmacion = window.confirm(
      `¿Está seguro de eliminar ${seleccionados.length} comprobante(s)?`
    );
    
    if (confirmacion) {
      try {
        await eliminarMasivo(seleccionados);
        await refrescar();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleExportar = async (formato: 'csv' | 'excel') => {
    try {
      const blob = await exportar(formato, algunoSeleccionado);
      
      // Crear URL y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobantes_rce_${new Date().toISOString().split('T')[0]}.${formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  // ========================================
  // FUNCIONES DE RENDERIZADO
  // ========================================

  const renderToolbar = () => (
    <div className="rce-comprobantes-toolbar">
      <div className="rce-toolbar-left">
        <div className="rce-search-box">
          <input
            type="text"
            placeholder="Buscar por RUC, serie, número..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className="rce-search-input"
          />
          <button className="rce-search-btn">🔍</button>
        </div>

        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`rce-btn rce-btn-filter ${mostrarFiltros ? 'active' : ''}`}
        >
          🔧 Filtros
        </button>
      </div>

      <div className="rce-toolbar-right">
        <div className="rce-filter-quick">
          <button onClick={() => handleFiltroRapido('hoy')} className="rce-btn-quick">
            Hoy
          </button>
          <button onClick={() => handleFiltroRapido('semana')} className="rce-btn-quick">
            Semana
          </button>
          <button onClick={() => handleFiltroRapido('mes')} className="rce-btn-quick">
            Mes
          </button>
        </div>

        <button
          onClick={refrescar}
          disabled={loading}
          className="rce-btn rce-btn-refresh"
        >
          {loading ? '⏳' : '🔄'} Actualizar
        </button>
      </div>
    </div>
  );

  const renderFiltros = () => {
    if (!mostrarFiltros) return null;

    return (
      <div className="rce-filtros-panel">
        <div className="rce-filtros-content">
          <div className="rce-filtro-group">
            <label>Fecha desde:</label>
            <input
              type="date"
              value={filtrosActivos.fecha_inicio || ''}
              onChange={(e) => actualizarFiltros({ fecha_inicio: e.target.value })}
              className="rce-input"
            />
          </div>

          <div className="rce-filtro-group">
            <label>Fecha hasta:</label>
            <input
              type="date"
              value={filtrosActivos.fecha_fin || ''}
              onChange={(e) => actualizarFiltros({ fecha_fin: e.target.value })}
              className="rce-input"
            />
          </div>

          <div className="rce-filtro-group">
            <label>Importe mínimo:</label>
            <input
              type="number"
              step="0.01"
              value={filtrosActivos.importe_min || ''}
              onChange={(e) => actualizarFiltros({ importe_min: parseFloat(e.target.value) || undefined })}
              className="rce-input"
            />
          </div>

          <div className="rce-filtro-group">
            <label>Importe máximo:</label>
            <input
              type="number"
              step="0.01"
              value={filtrosActivos.importe_max || ''}
              onChange={(e) => actualizarFiltros({ importe_max: parseFloat(e.target.value) || undefined })}
              className="rce-input"
            />
          </div>

          <div className="rce-filtro-actions">
            <button onClick={limpiarFiltros} className="rce-btn rce-btn-clear">
              Limpiar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAccionesMasivas = () => {
    if (!algunoSeleccionado) return null;

    return (
      <div className="rce-acciones-masivas">
        <span className="rce-seleccion-info">
          {seleccionados.length} de {comprobantes.length} seleccionados
        </span>

        <div className="rce-acciones-buttons">
          <button
            onClick={handleValidarSeleccionados}
            disabled={validando}
            className="rce-btn rce-btn-validate"
          >
            {validando ? '⏳' : '✅'} Validar
          </button>

          <button
            onClick={handleEliminarSeleccionados}
            disabled={eliminando}
            className="rce-btn rce-btn-delete"
          >
            {eliminando ? '⏳' : '🗑️'} Eliminar
          </button>

          <button
            onClick={() => handleExportar('csv')}
            disabled={exportando}
            className="rce-btn rce-btn-export"
          >
            📊 CSV
          </button>

          <button
            onClick={() => handleExportar('excel')}
            disabled={exportando}
            className="rce-btn rce-btn-export"
          >
            📈 Excel
          </button>
        </div>
      </div>
    );
  };

  const renderEstadisticas = () => (
    <div className="rce-estadisticas-resumen">
      <div className="rce-stat-item">
        <span className="rce-stat-label">Total:</span>
        <span className="rce-stat-value">{estadisticas.total}</span>
      </div>
      <div className="rce-stat-item">
        <span className="rce-stat-label">Importe:</span>
        <span className="rce-stat-value">
          {new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
          }).format(estadisticas.importe_total)}
        </span>
      </div>
      <div className="rce-stat-item">
        <span className="rce-stat-label">Promedio:</span>
        <span className="rce-stat-value">
          {new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
          }).format(estadisticas.promedio_importe)}
        </span>
      </div>
    </div>
  );

  const renderTabla = () => (
    <div className="rce-tabla-container">
      <table className="rce-tabla">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={todoSeleccionado}
                onChange={todoSeleccionado ? deseleccionarTodos : seleccionarTodos}
                className="rce-checkbox"
              />
            </th>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Serie-Número</th>
            <th>RUC Emisor</th>
            <th>Razón Social</th>
            <th>Importe</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {comprobantes.map((comprobante) => (
            <ComprobanteRow
              key={comprobante.id}
              comprobante={comprobante}
              seleccionado={seleccionados.includes(comprobante.id || '')}
              onSeleccionar={toggleSeleccion}
              onVer={handleVerComprobante}
              onEditar={handleEditarComprobante}
            />
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPaginacion = () => (
    <div className="rce-paginacion">
      <div className="rce-paginacion-info">
        Página {currentPage} de {totalPages} ({totalItems} total)
      </div>
      
      <div className="rce-paginacion-controls">
        <button
          onClick={() => handlePaginaChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="rce-btn rce-btn-page"
        >
          ← Anterior
        </button>
        
        <span className="rce-page-current">{currentPage}</span>
        
        <button
          onClick={() => handlePaginaChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="rce-btn rce-btn-page"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  if (error) {
    return (
      <div className="rce-error">
        <div className="rce-error-content">
          <h3>Error al cargar comprobantes</h3>
          <p>{error}</p>
          <button onClick={clearError} className="rce-btn rce-btn-retry">
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rce-comprobantes">
      {renderToolbar()}
      {renderFiltros()}
      {renderAccionesMasivas()}
      {renderEstadisticas()}
      
      {loading && comprobantes.length === 0 ? (
        <div className="rce-loading">
          <div className="rce-loading-spinner"></div>
          <p>Cargando comprobantes...</p>
        </div>
      ) : (
        <>
          {renderTabla()}
          {renderPaginacion()}
        </>
      )}

      {/* Modal de detalles (placeholder) */}
      {mostrarModal && comprobanteSeleccionado && (
        <div className="rce-modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="rce-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rce-modal-header">
              <h3>Detalles del Comprobante</h3>
              <button onClick={() => setMostrarModal(false)}>✕</button>
            </div>
            <div className="rce-modal-content">
              <pre>{JSON.stringify(comprobanteSeleccionado, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
