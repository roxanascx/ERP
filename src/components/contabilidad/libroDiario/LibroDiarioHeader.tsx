import React, { useState } from 'react';
import type { FiltrosLibroDiario } from '../../../types/libroDiario';
import './LibroDiarioHeader.css';

interface LibroDiarioHeaderProps {
  filtros: FiltrosLibroDiario;
  onFiltrosChange: (filtros: FiltrosLibroDiario) => void;
  onCrearLibro: () => void;
  onExportar: (formato: 'excel' | 'pdf') => void;
  loading?: boolean;
}

const LibroDiarioHeader: React.FC<LibroDiarioHeaderProps> = ({
  filtros,
  onFiltrosChange,
  onCrearLibro,
  onExportar,
  loading = false
}) => {
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  const handleInputChange = (campo: keyof FiltrosLibroDiario, valor: string) => {
    onFiltrosChange({
      ...filtros,
      [campo]: valor
    });
  };

  const limpiarFiltros = () => {
    onFiltrosChange({
      periodo: new Date().getFullYear().toString(),
      estado: 'borrador'
    });
  };

  const añosDisponibles = () => {
    const añoActual = new Date().getFullYear();
    const años = [];
    for (let i = añoActual; i >= añoActual - 5; i--) {
      años.push(i.toString());
    }
    return años;
  };

  return (
    <div className="libro-diario-header">
      <div className="header-top">
        <div className="header-title">
          <h1>📚 Libro Diario</h1>
          <p>Gestión de asientos contables</p>
        </div>
        
        <div className="header-actions">
          <button
            className="btn-header btn-export"
            onClick={() => onExportar('excel')}
            disabled={loading}
            title="Exportar a Excel"
          >
            📊 Excel
          </button>
          
          <button
            className="btn-header btn-export"
            onClick={() => onExportar('pdf')}
            disabled={loading}
            title="Exportar a PDF"
          >
            📄 PDF
          </button>
          
          <button
            className="btn-header btn-primary"
            onClick={onCrearLibro}
            disabled={loading}
          >
            ➕ Nuevo Libro
          </button>
        </div>
      </div>

      <div className="header-filters">
        <div className="filters-row">
          {/* Filtros básicos */}
          <div className="filter-group">
            <label>Período:</label>
            <select
              value={filtros.periodo || ''}
              onChange={(e) => handleInputChange('periodo', e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los años</option>
              {añosDisponibles().map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Estado:</label>
            <select
              value={filtros.estado || ''}
              onChange={(e) => handleInputChange('estado', e.target.value)}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="borrador">Borrador</option>
              <option value="finalizado">Finalizado</option>
              <option value="enviado">Enviado</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Búsqueda:</label>
            <input
              type="text"
              value={filtros.busqueda || ''}
              onChange={(e) => handleInputChange('busqueda', e.target.value)}
              placeholder="Buscar por descripción, glosa..."
              className="filter-input"
            />
          </div>

          <button
            className="btn-toggle-filters"
            onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
            title="Filtros avanzados"
          >
            {mostrarFiltrosAvanzados ? '🔼' : '🔽'} Filtros
          </button>
        </div>

        {/* Filtros avanzados */}
        {mostrarFiltrosAvanzados && (
          <div className="filters-row advanced">
            <div className="filter-group">
              <label>Fecha desde:</label>
              <input
                type="date"
                value={filtros.fechaDesde || ''}
                onChange={(e) => handleInputChange('fechaDesde', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Fecha hasta:</label>
              <input
                type="date"
                value={filtros.fechaHasta || ''}
                onChange={(e) => handleInputChange('fechaHasta', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Cuenta contable:</label>
              <input
                type="text"
                value={filtros.cuentaContable || ''}
                onChange={(e) => handleInputChange('cuentaContable', e.target.value)}
                placeholder="Código de cuenta"
                className="filter-input"
              />
            </div>

            <button
              className="btn-clear-filters"
              onClick={limpiarFiltros}
              title="Limpiar filtros"
            >
              🗑️ Limpiar
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <span>Cargando...</span>
        </div>
      )}
    </div>
  );
};

export default LibroDiarioHeader;
