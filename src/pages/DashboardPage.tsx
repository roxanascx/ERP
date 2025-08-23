import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEmpresaValidation } from '../hooks/useEmpresaValidation';

const DashboardPage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const modules = [
    { 
      icon: '🤝', 
      title: 'Socios de Negocio', 
      desc: 'Proveedores y clientes unificados', 
      color: '#6366f1',
      link: '/socios-negocio',
      highlight: true,
      bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%)'
    },
    { 
      icon: '🏢', 
      title: 'Proveedores', 
      desc: 'Gestión de proveedores', 
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)'
    },
    { 
      icon: '👥', 
      title: 'Clientes', 
      desc: 'Base de datos CRM', 
      color: '#a855f7',
      bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)'
    },
    { 
      icon: '📊', 
      title: 'SIRE', 
      desc: 'Reportes SUNAT', 
      color: '#06b6d4', 
      link: '/sire',
      bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)'
    },
    { 
      icon: '💰', 
      title: 'Contabilidad', 
      desc: 'Gestión financiera', 
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
    },
    { 
      icon: '📦', 
      title: 'Inventario', 
      desc: 'Control de almacén', 
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
    },
    { 
      icon: '👤', 
      title: 'Empleados', 
      desc: 'Recursos humanos', 
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
    },
    { 
      icon: '📈', 
      title: 'Reportes', 
      desc: 'Análisis y estadísticas', 
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'
    },
    { 
      icon: '⚙️', 
      title: 'Configuración', 
      desc: 'Panel de administración', 
      color: '#6b7280',
      bgGradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%)'
    }
  ];

  const sidebarItems = [
    { icon: '🏠', title: 'Dashboard', link: '/dashboard', active: true },
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

      {/* Elegant ambient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 15% 85%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 85% 15%, rgba(6, 182, 212, 0.06) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 70%)
        `,
        animation: 'ambientFloat 25s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Modern Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '70px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 50%, rgba(241, 245, 249, 0.85) 100%)',
        backdropFilter: 'blur(20px) saturate(160%)',
        borderRight: '1px solid rgba(203, 213, 225, 0.3)',
        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
        boxShadow: '8px 0 24px rgba(0, 0, 0, 0.06), inset 1px 0 1px rgba(255, 255, 255, 0.3)',
        borderTopRightRadius: '20px',
        borderBottomRightRadius: '20px',
        border: '1px solid rgba(226, 232, 240, 0.4)'
      }}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            top: '25px',
            right: '-20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
            zIndex: 1001,
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
          }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {/* Sidebar Content */}
        <div style={{ padding: '25px 15px', paddingTop: '70px' }}>
          {/* Modern Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '30px',
            padding: '0 8px'
          }}>
            <div style={{
              width: '45px',
              height: '45px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              transform: 'perspective(1000px) rotateX(5deg) rotateY(5deg)',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.4)'
            }}>
              🏢
            </div>
            {sidebarOpen && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1e293b',
                  fontFamily: "'Inter', sans-serif"
                }}>ERP</h3>
                <span style={{
                  fontSize: '12px',
                  color: '#64748b',
                  fontWeight: '500'
                }}>Sistema de Gestión</span>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav>
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: item.active ? '#6366f1' : '#64748b',
                  background: item.active ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)' : 'transparent',
                  border: item.active ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  fontWeight: item.active ? '600' : '500',
                  fontSize: '14px',
                  boxShadow: item.active ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.background = 'rgba(248, 250, 252, 0.8)';
                    e.currentTarget.style.color = '#1e293b';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span style={{ fontSize: '18px', minWidth: '18px' }}>{item.icon}</span>
                {sidebarOpen && <span>{item.title}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarOpen ? '280px' : '70px',
        flex: 1,
        padding: '25px',
        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
      }}>
        {/* Modern Header */}
        <header style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 30%, rgba(241, 245, 249, 0.85) 60%, rgba(226, 232, 240, 0.8) 100%)',
          backdropFilter: 'blur(20px) saturate(200%)',
          borderRadius: '20px',
          padding: '25px 35px',
          marginBottom: '25px',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            0 0 0 1px rgba(226, 232, 240, 0.4)
          `,
          border: '1px solid rgba(226, 232, 240, 0.5)',
          position: 'relative',
          overflow: 'hidden',
          transform: 'translateY(0)',
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `
            0 12px 40px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.6),
            0 0 0 1px rgba(99, 102, 241, 0.2)
          `;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            0 0 0 1px rgba(226, 232, 240, 0.4)
          `;
        }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.2rem)',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0,
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.025em'
              }}>
                Bienvenido al ERP
              </h1>
              <p style={{
                fontSize: '1rem',
                color: '#64748b',
                margin: 0,
                fontWeight: '500'
              }}>
                Panel de control y gestión empresarial
              </p>
            </div>
            {empresaActual && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                borderRadius: '12px',
                padding: '12px 20px',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6366f1',
                  marginBottom: '4px'
                }}>
                  🏢 {empresaActual.ruc}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  {empresaActual.razon_social}
                </div>
                <button style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
                }}
                >
                  Cambiar empresa
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Container */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '24px',
          padding: 'clamp(30px, 5vw, 50px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 0 0 1px rgba(226, 232, 240, 0.3)',
          border: '1px solid rgba(226, 232, 240, 0.3)',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3vw, 2rem)',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: 'clamp(20px, 3vw, 30px)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
            letterSpacing: '-0.025em'
          }}>
            📊 Módulos del Sistema
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'clamp(20px, 3vw, 30px)',
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2
          }}>
            {modules.map((module, index) => (
              <Link
                key={index}
                to={module.link || '#'}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '30px 20px',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  background: module.bgGradient,
                  border: `2px solid ${module.color}20`,
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  minHeight: '180px',
                  boxShadow: module.highlight 
                    ? `0 8px 32px ${module.color}30, 0 0 0 2px ${module.color}40`
                    : `0 4px 16px ${module.color}20`,
                  backdropFilter: 'blur(10px)',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 16px 48px ${module.color}40, 0 0 0 2px ${module.color}60`;
                  e.currentTarget.style.background = `linear-gradient(135deg, ${module.color}15, ${module.color}08)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = module.highlight 
                    ? `0 8px 32px ${module.color}30, 0 0 0 2px ${module.color}40`
                    : `0 4px 16px ${module.color}20`;
                  e.currentTarget.style.background = module.bgGradient;
                }}
              >
                {module.highlight && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: module.color,
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Activo
                  </div>
                )}
                
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '15px',
                  filter: `drop-shadow(0 4px 8px ${module.color}40)`,
                  transition: 'all 0.3s ease'
                }}>
                  {module.icon}
                </div>
                
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: '0 0 8px 0',
                  textAlign: 'center',
                  letterSpacing: '-0.025em'
                }}>
                  {module.title}
                </h3>
                
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0,
                  textAlign: 'center',
                  fontWeight: '500',
                  lineHeight: '1.4'
                }}>
                  {module.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Modern CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes subtleShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes ambientFloat {
          0%, 100% { 
            transform: rotate(0deg) scale(1);
            opacity: 0.6;
          }
          33% { 
            transform: rotate(120deg) scale(1.05);
            opacity: 0.8;
          }
          66% { 
            transform: rotate(240deg) scale(0.95);
            opacity: 0.7;
          }
        }
        
        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
        }
        
        @media (max-width: 480px) {
          .grid-container {
            grid-template-columns: 1fr;
            gap: 15px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
