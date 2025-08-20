/**
 * Componente principal RCE
 * Interfaz para gestionar el Registro de Compras Electrónico
 */

import { useState, useEffect } from 'react';
import { useRce } from '../../../hooks/useRce';
import { RceComprobantes, RcePropuestas, RceProcesos, RceEstadisticas } from './components/index';
import type { Empresa } from '../../../types/empresa';
import type { RceEstadoComprobante } from '../../../types/rce';
import '../../../styles/components/sire/rce/index.css';

// ========================================
// INTERFACES
// ========================================

interface RcePanelProps {
  company: Empresa;
  onClose?: () => void;
}

interface PeriodoForm {
  año: string;
  mes: string;
}

type RceTab = 'comprobantes' | 'propuestas' | 'procesos' | 'estadisticas';

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

const ESTADOS_COMPROBANTE = [
  { value: '', label: 'Todos los estados' },
  { value: 'registrado', label: 'Registrado' },
  { value: 'validado', label: 'Validado' },
  { value: 'observado', label: 'Observado' },
  { value: 'anulado', label: 'Anulado' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'procesado', label: 'Procesado' }
];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export const RcePanel: React.FC<RcePanelProps> = ({ company, onClose }) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [activeTab, setActiveTab] = useState<RceTab>('comprobantes');
  const [periodoForm, setPeriodoForm] = useState<PeriodoForm>({
    año: new Date().getFullYear().toString(),
    mes: String(new Date().getMonth() + 1).padStart(2, '0')
  });

  // ========================================
  // HOOKS
  // ========================================

  const {
    estado,
    loading,
    error,
    filtrosActivos,
    cargarDatos,
    actualizarFiltros,
    limpiarFiltros,
    refresh,
    clearError,
    isLoading,
    hasData,
    lastUpdated
  } = useRce({
    ruc: company.ruc,
    auto_refresh: true,
    refresh_interval: 30000,
    lazy_loading: false
  });

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (company.ruc) {
      const periodo = `${periodoForm.año}${periodoForm.mes}`;
      console.log('🎯 [RCE Panel] Cargando datos con periodo:', periodo, 'y RUC:', company.ruc);
      cargarDatos(periodo);
    }
  }, [company.ruc, periodoForm.año, periodoForm.mes]); // Removemos cargarDatos de dependencias

  // Actualizar filtros cuando cambie el período
  useEffect(() => {
    const periodo = `${periodoForm.año}${periodoForm.mes}`;
    actualizarFiltros({ periodo });
  }, [periodoForm, actualizarFiltros]);

  // ========================================
  // MANEJADORES DE EVENTOS
  // ========================================

  const handlePeriodoChange = (campo: keyof PeriodoForm, valor: string) => {
    setPeriodoForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleTabChange = (tab: RceTab) => {
    setActiveTab(tab);
  };

  const handleEstadoChange = (estado: string) => {
    const estadosFiltro = estado ? [estado as RceEstadoComprobante] : undefined;
    actualizarFiltros({ estado: estadosFiltro });
  };

  const handleRefresh = async () => {
    clearError();
    await refresh();
  };

  const handleLimpiarFiltros = () => {
    limpiarFiltros();
    setPeriodoForm({
      año: new Date().getFullYear().toString(),
      mes: String(new Date().getMonth() + 1).padStart(2, '0')
    });
  };

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const formatearPeriodo = (año: string, mes: string): string => {
    const nombreMes = MESES.find(m => m.value === mes)?.label || mes;
    return `${nombreMes} ${año}`;
  };

  // const obtenerEstadisticasResumen = () => {
  //   if (!estado) return null;
  //   
  //   return {
  //     comprobantes: estado.comprobantes_total,
  //     propuestas: estado.propuestas_total,
  //     procesos: estado.procesos_activos,
  //     tickets: estado.tickets_pendientes
  //   };
  // };

  // ========================================
  // RENDERIZADO DE COMPONENTES
  // ========================================

  const renderHeader = () => (
    <div className="rce-panel-header">
      <div className="rce-panel-title">
        <h2>Registro de Compras Electrónico (RCE)</h2>
        <div className="rce-company-info">
          <span className="company-name">{company.razon_social}</span>
          <span className="company-ruc">RUC: {company.ruc}</span>
        </div>
      </div>
      
      {onClose && (
        <button className="rce-close-btn" onClick={onClose} title="Cerrar">
          ✕
        </button>
      )}
    </div>
  );

  const renderControls = () => (
    <div className="rce-panel-controls">
      {/* Selector de período */}
      <div className="rce-periodo-selector">
        <label>Período:</label>
        <select 
          value={periodoForm.año} 
          onChange={(e) => handlePeriodoChange('año', e.target.value)}
          className="rce-select"
        >
          {AÑOS_DISPONIBLES.map(año => (
            <option key={año.value} value={año.value}>
              {año.label}
            </option>
          ))}
        </select>
        
        <select 
          value={periodoForm.mes} 
          onChange={(e) => handlePeriodoChange('mes', e.target.value)}
          className="rce-select"
        >
          {MESES.map(mes => (
            <option key={mes.value} value={mes.value}>
              {mes.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por estado (para tab comprobantes) */}
      {activeTab === 'comprobantes' && (
        <div className="rce-estado-filter">
          <label>Estado:</label>
          <select 
            value={filtrosActivos.estado?.[0] || ''} 
            onChange={(e) => handleEstadoChange(e.target.value)}
            className="rce-select"
          >
            {ESTADOS_COMPROBANTE.map(estado => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Controles de acción */}
      <div className="rce-action-controls">
        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="rce-btn rce-btn-refresh"
          title="Actualizar datos"
        >
          {isLoading ? '⏳' : '🔄'} Actualizar
        </button>
        
        <button 
          onClick={handleLimpiarFiltros}
          className="rce-btn rce-btn-clear"
          title="Limpiar filtros"
        >
          🗑️ Limpiar
        </button>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="rce-tabs">
      <button 
        className={`rce-tab ${activeTab === 'comprobantes' ? 'active' : ''}`}
        onClick={() => handleTabChange('comprobantes')}
      >
        📄 Comprobantes
        {estado && (
          <span className="rce-tab-count">{estado.comprobantes_total}</span>
        )}
      </button>
      
      <button 
        className={`rce-tab ${activeTab === 'propuestas' ? 'active' : ''}`}
        onClick={() => handleTabChange('propuestas')}
      >
        📋 Propuestas
        {estado && (
          <span className="rce-tab-count">{estado.propuestas_total}</span>
        )}
      </button>
      
      <button 
        className={`rce-tab ${activeTab === 'procesos' ? 'active' : ''}`}
        onClick={() => handleTabChange('procesos')}
      >
        ⚙️ Procesos
        {estado && estado.procesos_activos > 0 && (
          <span className="rce-tab-count active">{estado.procesos_activos}</span>
        )}
      </button>
      
      <button 
        className={`rce-tab ${activeTab === 'estadisticas' ? 'active' : ''}`}
        onClick={() => handleTabChange('estadisticas')}
      >
        📊 Estadísticas
      </button>
    </div>
  );

  const renderContent = () => {
    if (loading && !hasData) {
      return (
        <div className="rce-loading">
          <div className="rce-loading-spinner"></div>
          <p>Cargando datos RCE...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rce-error">
          <div className="rce-error-icon">⚠️</div>
          <div className="rce-error-content">
            <h3>Error al cargar datos</h3>
            <p>{error}</p>
            <button onClick={handleRefresh} className="rce-btn rce-btn-retry">
              🔄 Reintentar
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'comprobantes':
        return (
          <RceComprobantes 
            company={company}
            filtros={filtrosActivos}
            onFiltrosChange={actualizarFiltros}
          />
        );
      
      case 'propuestas':
        return (
          <RcePropuestas 
            company={company}
          />
        );
      
      case 'procesos':
        return (
          <RceProcesos 
            company={company}
          />
        );
      
      case 'estadisticas':
        return (
          <RceEstadisticas 
            company={company}
          />
        );
      
      default:
        return null;
    }
  };

  const renderStatusBar = () => (
    <div className="rce-status-bar">
      <div className="rce-status-info">
        <span className="rce-status-period">
          📅 {formatearPeriodo(periodoForm.año, periodoForm.mes)}
        </span>
        
        {lastUpdated && (
          <span className="rce-last-updated">
            🕐 Actualizado: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
        
        {isLoading && (
          <span className="rce-loading-indicator">
            ⏳ Cargando...
          </span>
        )}
      </div>

      {estado && (
        <div className="rce-summary-stats">
          <span className="rce-stat">
            📄 {estado.comprobantes_total} comprobantes
          </span>
          <span className="rce-stat">
            📋 {estado.propuestas_total} propuestas
          </span>
          {estado.procesos_activos > 0 && (
            <span className="rce-stat active">
              ⚙️ {estado.procesos_activos} procesos activos
            </span>
          )}
          {estado.tickets_pendientes > 0 && (
            <span className="rce-stat pending">
              🎫 {estado.tickets_pendientes} tickets pendientes
            </span>
          )}
        </div>
      )}
    </div>
  );

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  // DEBUG: Agregar información de debug
  // console.log('🚀 RcePanel DEBUG:', {
  //   company: company?.ruc,
  //   estado,
  //   loading,
  //   error,
  //   activeTab,
  //   periodoForm
  // });

  return (
    <div className="rce-panel">
      {renderHeader()}
      {renderControls()}
      {renderTabs()}
      
      <div className="rce-content">
        {renderContent()}
      </div>
      
      {renderStatusBar()}
    </div>
  );
};
