import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEmpresaValidation } from '../../hooks/useEmpresaValidation';

interface ContabilidadLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

interface NavigationItem {
  icon: string;
  title: string;
  link: string;
  badge?: string;
  special?: boolean;
}

interface NavigationItem {
  icon: string;
  title: string;
  link: string;
  badge?: string;
  special?: boolean;
}

const ContabilidadLayout: React.FC<ContabilidadLayoutProps> = ({ 
  children, 
  title = '📊 Contabilidad', 
  subtitle = 'Gestión financiera y libros contables' 
}) => {
  const { empresaActual } = useEmpresaValidation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Módulos específicos de contabilidad
  const contabilidadItems: NavigationItem[] = [
    { icon: '🏠', title: 'Dashboard', link: '/dashboard' },
    { icon: '📊', title: 'Contabilidad', link: '/contabilidad' },
    { icon: '📋', title: 'Plan Contable', link: '/contabilidad/plan-contable' },
    { icon: '📘', title: 'Libro Diario', link: '/contabilidad/libro-diario' },
    { 
      icon: '🏛️', 
      title: 'PLE SUNAT', 
      link: '/contabilidad/ple',
      badge: 'V3',
      special: true 
    },
    { icon: '📗', title: 'Libro Mayor', link: '/contabilidad/libro-mayor' },
    { icon: '🧾', title: 'Balance Comprobación', link: '/contabilidad/balance-comprobacion' },
    { icon: '📊', title: 'Estado Resultados', link: '/contabilidad/estado-resultados' },
    { icon: '💰', title: 'Balance General', link: '/contabilidad/balance-general' },
    { icon: '📈', title: 'Análisis Financiero', link: '/contabilidad/analisis-financiero' },
    { icon: '💸', title: 'Flujo de Caja', link: '/contabilidad/flujo-caja' },
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    if (path === '/contabilidad' && location.pathname === '/contabilidad') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/contabilidad';
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
      {/* Subtle background texture */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.02) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        opacity: 0.6
      }} />

      {/* Modern Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '70px',
        height: '100vh',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.1), inset -1px 0 0 rgba(255, 255, 255, 0.5)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Sidebar Toggle */}
        <div style={{
          padding: '20px 0',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          paddingLeft: sidebarOpen ? '20px' : '0',
          paddingRight: sidebarOpen ? '20px' : '0'
        }}>
          {sidebarOpen && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
              }}>
                📊
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#1f2937',
                  lineHeight: '1.2'
                }}>
                  ERP System
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Contabilidad
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#6b7280',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)';
              e.currentTarget.style.color = '#6366f1';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)';
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Sidebar Content */}
        <div style={{
          flex: 1,
          padding: '16px 0',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {/* Company Info */}
          <div style={{
            padding: sidebarOpen ? '0 20px 16px' : '0 10px 16px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            marginBottom: '16px'
          }}>
            {sidebarOpen && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(99, 102, 241, 0.1)'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6366f1',
                  marginBottom: '4px'
                }}>
                  RUC: {empresaActual?.ruc || 'No seleccionado'}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  fontWeight: '500',
                  lineHeight: '1.3'
                }}>
                  {empresaActual?.razon_social || 'Seleccione una empresa'}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav style={{ padding: '0 8px' }}>
            {contabilidadItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: sidebarOpen ? '12px 16px' : '12px 8px',
                  margin: '4px 0',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  background: isActiveRoute(item.link) 
                    ? (item.special 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)')
                    : (item.special && !isActiveRoute(item.link)
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.03) 100%)'
                        : 'transparent'),
                  color: isActiveRoute(item.link) 
                    ? (item.special ? '#059669' : '#6366f1') 
                    : (item.special ? '#10b981' : '#6b7280'),
                  border: isActiveRoute(item.link) 
                    ? (item.special ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.2)') 
                    : (item.special ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid transparent'),
                  boxShadow: item.special ? '0 2px 8px rgba(16, 185, 129, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActiveRoute(item.link)) {
                    if (item.special) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)';
                      e.currentTarget.style.color = '#047857';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                    } else {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)';
                      e.currentTarget.style.color = '#374151';
                    }
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveRoute(item.link)) {
                    if (item.special) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.03) 100%)';
                      e.currentTarget.style.color = '#10b981';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.1)';
                    } else {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span style={{ 
                  fontSize: '16px', 
                  marginRight: sidebarOpen ? '12px' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '20px'
                }}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flex: 1 
                  }}>
                    <span>{item.title}</span>
                    {item.badge && (
                      <span style={{
                        background: item.special 
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        marginLeft: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        letterSpacing: '0.5px'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '70px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          padding: '20px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                margin: 0,
                background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {title}
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '4px 0 0 0',
                fontWeight: '500'
              }}>
                {subtitle}
              </p>
            </div>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
              color: '#15803d',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#22c55e',
                borderRadius: '50%',
                marginRight: '8px',
                animation: 'pulse 2s infinite'
              }}></div>
              Sistema Activo
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          padding: '32px',
          minHeight: 'calc(100vh - 100px)'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ContabilidadLayout;
