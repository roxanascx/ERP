import React, { useState } from 'react';
import { PLEGeneratorV3 } from './PLEGeneratorV3';
import { PLEArchivosTable } from './components/PLEArchivosTableNew';
import { PLEEstadisticas } from './components/PLEEstadisticasNew';
import PLEConfiguracionComponent from './components/PLEConfiguracionComponent';
import './PLEDashboard.css';
// import { usePLEDashboard } from '../../../hooks/usePLE';

interface PLEDashboardProps {
  empresaId: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType<any>;
}

const PLEDashboard: React.FC<PLEDashboardProps> = ({ empresaId }) => {
  const [activeTab, setActiveTab] = useState<string>('generar');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  
  // const { data: dashboardData, loading, refetch } = usePLEDashboard(empresaId);
  const dashboardData: any = { 
    estadisticas: { 
      total_archivos: 0, 
      archivos_pendientes: 0, 
      errores_recientes: 0 
    } 
  };
  const loading = false;
  const refetch = () => {};
  
  // Configuración de pestañas
  const tabs: TabItem[] = [
    {
      id: 'generar',
      label: 'Generar PLE',
      icon: '📝',
      component: PLEGeneratorV3
    },
    {
      id: 'archivos',
      label: 'Archivos Generados',
      icon: '📁',
      component: PLEArchivosTable
    },
    {
      id: 'estadisticas',
      label: 'Estadísticas',
      icon: '📊',
      component: PLEEstadisticas
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: '⚙️',
      component: PLEConfiguracionComponent
    }
  ];
  
  const handleArchivoGenerado = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };
  
  const renderActiveComponent = () => {
    const activeTabConfig = tabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;
    
    const Component = activeTabConfig.component;
    
    const commonProps = {
      empresaId,
      dashboardData,
      onRefresh: handleArchivoGenerado
    };
    
    return <Component {...commonProps} key={refreshKey} />;
  };
  
  return (
    <div className="ple-dashboard">
      {/* Header del Dashboard */}
      <div className="ple-dashboard__header">
        <div className="ple-dashboard__header-content">
          <div className="ple-dashboard__title-section">
            <h1 className="ple-dashboard__title">
              📋 PLE - Programa de Libros Electrónicos
            </h1>
            <p className="ple-dashboard__subtitle">
              Generación de archivos PLE para SUNAT V3
            </p>
          </div>
          
          {/* Indicador de estado */}
          <div className="ple-dashboard__status">
            {loading && (
              <div className="ple-dashboard__loading">
                <div className="loading-spinner animate-spin" />
                Cargando...
              </div>
            )}
            
            {dashboardData?.estadisticas && (
              <div className="ple-dashboard__stats">
                <div className="ple-dashboard__stat-value">
                  {dashboardData.estadisticas.total_archivos}
                </div>
                <div className="ple-dashboard__stat-label">
                  Archivos PLE
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Navegación por pestañas */}
      <div className="ple-dashboard__nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`ple-dashboard__tab ${
              activeTab === tab.id ? 'ple-dashboard__tab--active' : ''
            }`}
          >
            <span className="ple-dashboard__tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Contenido de la pestaña activa */}
      <div className="ple-dashboard__content">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default PLEDashboard;
