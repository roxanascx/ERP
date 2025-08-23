import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEmpresaValidation } from '../hooks/useEmpresaValidation';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title = 'ERP Sistema', 
  subtitle = 'Panel de control y gestión empresarial' 
}) => {
  const { empresaActual } = useEmpresaValidation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const sidebarItems = [
    { icon: '🏠', title: 'Dashboard', link: '/dashboard' },
    { icon: '🤝', title: 'Socios de Negocio', link: '/socios-negocio' },
    { icon: '📊', title: 'SIRE', link: '/sire' },
    { icon: '🏢', title: 'Proveedores', link: '#' },
    { icon: '👥', title: 'Clientes', link: '#' },
    { icon: '💰', title: 'Contabilidad', link: '#' },
    { icon: '📦', title: 'Inventario', link: '#' },
    { icon: '👤', title: 'Empleados', link: '#' },
    { icon: '📈', title: 'Reportes', link: '#' },
    { icon: '⚙️', title: 'Configuración', link: '#' },
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)',
      backgroundSize: '400% 400%',
      animation: 'subtleShift 20s ease infinite',
      display: 'flex',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>
        {`
          @keyframes subtleShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}
      </style>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '70px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(226, 232, 240, 0.8)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        zIndex: 1000,
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0
          }}>
            📊
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1e293b',
                lineHeight: '1.2'
              }}>
                ERP System
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                marginTop: '2px'
              }}>
                Panel de Control
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div style={{ padding: '20px 0', flex: 1, overflowY: 'auto' }}>
          {sidebarItems.map((item, index) => {
            const isActive = isActiveRoute(item.link);
            const isDisabled = item.link === '#';
            
            const ItemContent = (
              <div style={{
                padding: sidebarOpen ? '12px 20px' : '12px',
                margin: sidebarOpen ? '0 12px 8px' : '0 8px 8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1))' 
                  : 'transparent',
                color: isActive ? '#1e40af' : isDisabled ? '#94a3b8' : '#334155',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'translateX(4px)' : 'none',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                opacity: isDisabled ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.08)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              <span style={{ 
                fontSize: '18px', 
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px'
              }}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <span style={{ 
                  overflow: 'hidden', 
                  whiteSpace: 'nowrap'
                }}>
                  {item.title}
                </span>
              )}
            </div>
            );

            if (isDisabled) {
              return (
                <div key={index}>
                  {ItemContent}
                </div>
              );
            }

            return (
              <Link 
                key={index} 
                to={item.link} 
                style={{ textDecoration: 'none' }}
              >
                {ItemContent}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Toggle */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(226, 232, 240, 0.5)'
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            }}
          >
            <span style={{ fontSize: '16px' }}>
              {sidebarOpen ? '←' : '→'}
            </span>
            {sidebarOpen && <span>Contraer</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '70px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '24px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 900,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0,
                lineHeight: '1.2'
              }}>
                {title}
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#64748b',
                margin: '4px 0 0 0',
                lineHeight: '1.4'
              }}>
                {subtitle}
              </p>
            </div>

            {/* Company Info */}
            {empresaActual && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: 'rgba(99, 102, 241, 0.08)',
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    🏢 {empresaActual.ruc}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#64748b',
                    textTransform: 'uppercase'
                  }}>
                    {empresaActual.razon_social}
                  </div>
                </div>
                <Link
                  to="/empresas"
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#4f46e5',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  }}
                >
                  Cambiar empresa
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: '32px',
          maxWidth: '100%',
          overflow: 'auto'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
