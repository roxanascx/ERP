import React, { useState, useEffect } from 'react';
import { PLEGeneratorV3 } from './PLEGeneratorV3';
import { PLEArchivosTable } from './components/PLEArchivosTable';
import { PLEEstadisticas } from './components/PLEEstadisticas';
import PLEConfiguracionComponent from './components/PLEConfiguracion';
import type { PLEConfiguracion } from './components/PLEConfiguracion';
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
  const dashboardData: any = { estadisticas: { total_archivos: 0, archivos_pendientes: 0, errores_recientes: 0 } };
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
    // Refrescar datos del dashboard cuando se genera un nuevo archivo
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
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      minHeight: '600px'
    }}>
      {/* Header del Dashboard */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700'
            }}>
              📋 Generación PLE SUNAT
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              opacity: 0.9
            }}>
              Sistema de generación de archivos PLE conforme a normativa SUNAT V3
            </p>
          </div>
          
          {/* Indicador de estado */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.2)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Cargando...
              </div>
            )}
            
            {dashboardData?.estadisticas && (
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: '600' }}>
                  {dashboardData.estadisticas.total_archivos}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  Archivos PLE
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Navegación por pestañas */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '16px 20px',
              border: 'none',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? '#667eea' : '#6b7280',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: activeTab === tab.id ? '2px solid #667eea' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Contenido de la pestaña activa */}
      <div style={{
        padding: '24px',
        minHeight: '500px'
      }}>
        {renderActiveComponent()}
      </div>
      
      {/* Estilos CSS inline para animaciones */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default PLEDashboard;
