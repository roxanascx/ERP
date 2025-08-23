import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEmpresaValidation } from '../hooks/useEmpresaValidation';

const DashboardPage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const modules = [
    { 
      icon: '🏢', 
      title: 'Proveedores', 
      desc: 'Sistema de gestión intergaláctica', 
      color: '#00d4ff',
      bgGradient: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)'
    },
    { 
      icon: '👥', 
      title: 'Clientes', 
      desc: 'Base de datos estelar CRM', 
      color: '#4facfe',
      bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)'
    },
    { 
      icon: '🛸', 
      title: 'SIRE', 
      desc: 'Portal de reportes cósmicos SUNAT', 
      color: '#ff6b6b', 
      link: '/sire',
      highlight: true,
      bgGradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
    },
    { 
      icon: '⭐', 
      title: 'Contabilidad', 
      desc: 'Finanzas del universo digital', 
      color: '#4ecdc4',
      bgGradient: 'linear-gradient(135deg, #4ecdc4 0%, #2980b9 100%)'
    },
    { 
      icon: '📦', 
      title: 'Inventario', 
      desc: 'Almacén espacial inteligente', 
      color: '#a29bfe',
      bgGradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)'
    },
    { 
      icon: '👨‍🚀', 
      title: 'Empleados', 
      desc: 'Tripulación corporativa', 
      color: '#fd79a8',
      bgGradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)'
    },
    { 
      icon: '🌌', 
      title: 'Reportes', 
      desc: 'Análisis del cosmos empresarial', 
      color: '#fdcb6e',
      bgGradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)'
    },
    { 
      icon: '⚙️', 
      title: 'Configuración', 
      desc: 'Panel de control espacial', 
      color: '#74b9ff',
      bgGradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
    }
  ];

  const sidebarItems = [
    { icon: '🌌', title: 'Dashboard', link: '/dashboard', active: true },
    { icon: '🛸', title: 'SIRE', link: '/sire' },
    { icon: '🏢', title: 'Proveedores', link: '#' },
    { icon: '👥', title: 'Clientes', link: '#' },
    { icon: '⭐', title: 'Contabilidad', link: '#' },
    { icon: '📦', title: 'Inventario', link: '#' },
    { icon: '👨‍🚀', title: 'Empleados', link: '#' },
    { icon: '🌌', title: 'Reportes', link: '#' },
    { icon: '⚙️', title: 'Configuración', link: '#' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1a3e 25%, #2d3561 50%, #4169e1 75%, #00d4ff 100%)',
      backgroundSize: '400% 400%',
      animation: 'galacticShift 20s ease infinite',
      display: 'flex',
      fontFamily: "'Orbitron', 'Exo 2', 'Inter', monospace",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Starfield background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(2px 2px at 20px 30px, #ffffff, transparent),
          radial-gradient(2px 2px at 40px 70px, #00d4ff, transparent),
          radial-gradient(1px 1px at 90px 40px, #4facfe, transparent),
          radial-gradient(1px 1px at 130px 80px, #ffffff, transparent),
          radial-gradient(2px 2px at 160px 30px, #74b9ff, transparent)
        `,
        backgroundSize: '200px 100px',
        animation: 'stars 50s linear infinite',
        pointerEvents: 'none',
        opacity: 0.6
      }} />

      {/* Cosmic particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 15% 85%, rgba(0, 212, 255, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 85% 15%, rgba(79, 172, 254, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(116, 185, 255, 0.1) 0%, transparent 70%)
        `,
        animation: 'cosmicFloat 25s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Sidebar Ultra Galáctico */}
      <div style={{
        width: sidebarOpen ? '280px' : '70px',
        background: 'linear-gradient(180deg, rgba(50, 80, 150, 0.85) 0%, rgba(70, 120, 200, 0.8) 50%, rgba(90, 150, 255, 0.75) 100%)',
        backdropFilter: 'blur(20px) saturate(160%)',
        borderRight: '1px solid rgba(100, 180, 255, 0.4)',
        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
        boxShadow: '15px 0 30px rgba(50, 150, 255, 0.15), inset 1px 0 1px rgba(120, 200, 255, 0.3)',
        borderTopRightRadius: '20px',
        borderBottomRightRadius: '20px',
        border: '1px solid rgba(150, 200, 255, 0.3)'
      }}>
        {/* Toggle Button Galáctico */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            top: '25px',
            right: '-20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #4facfe 0%, #00bfff 50%, #1e90ff 100%)',
            border: '2px solid rgba(100, 180, 255, 0.5)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            boxShadow: '0 0 20px rgba(50, 150, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
            zIndex: 1001,
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(50, 150, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
            e.currentTarget.style.background = 'radial-gradient(circle, #74b9ff 0%, #00bfff 50%, #1e90ff 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(50, 150, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.background = 'radial-gradient(circle, #4facfe 0%, #00bfff 50%, #1e90ff 100%)';
          }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {/* Sidebar Content */}
        <div style={{ padding: '25px 15px', paddingTop: '70px' }}>
          {/* Logo Espacial */}
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
              background: 'radial-gradient(circle, #4facfe 0%, #00bfff 50%, #1e90ff 100%)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 0 20px rgba(50, 150, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              transform: 'perspective(1000px) rotateX(5deg) rotateY(5deg)',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(120, 200, 255, 0.4)'
            }}>
              🌌
            </div>
            {sidebarOpen && (
              <span style={{
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '16px',
                opacity: sidebarOpen ? 1 : 0,
                transition: 'opacity 0.4s ease',
                textShadow: '0 0 15px rgba(100, 180, 255, 0.8)',
                fontFamily: "'Orbitron', monospace",
                letterSpacing: '1px'
              }}>
                ERP GALAXY
              </span>
            )}
          </div>

          {/* Navigation Items Galácticos */}
          <nav>
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 10px',
                  margin: '5px 0',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#ffffff',
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                  background: item.active 
                    ? 'linear-gradient(135deg, rgba(100, 180, 255, 0.3) 0%, rgba(50, 150, 255, 0.2) 100%)'
                    : 'transparent',
                  border: item.active ? '1px solid rgba(120, 200, 255, 0.4)' : '1px solid transparent',
                  boxShadow: item.active ? '0 0 15px rgba(50, 150, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : 'none',
                  transform: 'translateX(0)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(120, 200, 255, 0.2) 0%, rgba(80, 170, 255, 0.1) 100%)';
                    e.currentTarget.style.transform = 'translateX(6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(100, 180, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.border = '1px solid rgba(120, 200, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.border = '1px solid transparent';
                  }
                }}
              >
                <span style={{ 
                  fontSize: '18px', 
                  minWidth: '18px',
                  filter: 'drop-shadow(0 0 6px rgba(100, 180, 255, 0.6))'
                }}>{item.icon}</span>
                {sidebarOpen && (
                  <span style={{
                    fontWeight: item.active ? '600' : '500',
                    fontSize: '14px',
                    opacity: sidebarOpen ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    textShadow: '0 0 8px rgba(100, 180, 255, 0.5)',
                    fontFamily: "'Exo 2', sans-serif",
                    letterSpacing: '0.5px'
                  }}>
                    {item.title}
                  </span>
                )}
                {item.active && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    background: 'linear-gradient(180deg, #4facfe 0%, #00bfff 50%, #74b9ff 100%)',
                    borderRadius: '0 3px 3px 0',
                    boxShadow: '0 0 10px rgba(50, 150, 255, 0.8)'
                  }} />
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Galáctico */}
      <div style={{
        marginLeft: sidebarOpen ? '280px' : '70px',
        flex: 1,
        padding: '25px',
        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
      }}>
        {/* Header Galáctico Completo */}
        <header style={{
          background: 'linear-gradient(135deg, rgba(5, 8, 20, 0.98) 0%, rgba(15, 25, 45, 0.95) 30%, rgba(25, 40, 70, 0.92) 60%, rgba(35, 55, 95, 0.9) 100%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          borderRadius: '20px',
          padding: '25px 35px',
          marginBottom: '25px',
          boxShadow: `
            0 0 80px rgba(0, 212, 255, 0.5),
            inset 0 1px 0 rgba(0, 212, 255, 0.3),
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(0, 212, 255, 0.4)
          `,
          border: '1px solid rgba(0, 212, 255, 0.5)',
          position: 'relative',
          overflow: 'hidden',
          transform: 'translateY(0)',
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.002)';
          e.currentTarget.style.boxShadow = `
            0 0 120px rgba(0, 212, 255, 0.7),
            inset 0 1px 0 rgba(0, 212, 255, 0.5),
            0 25px 50px rgba(0, 0, 0, 0.4),
            0 0 0 2px rgba(0, 212, 255, 0.6)
          `;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = `
            0 0 80px rgba(0, 212, 255, 0.5),
            inset 0 1px 0 rgba(0, 212, 255, 0.3),
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(0, 212, 255, 0.4)
          `;
        }}
        >
          {/* Efectos de fondo galáctico animado */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              conic-gradient(from 0deg, rgba(0, 212, 255, 0.2), rgba(79, 172, 254, 0.25), rgba(116, 185, 255, 0.2), rgba(0, 212, 255, 0.2)),
              radial-gradient(circle at 20% 30%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(116, 185, 255, 0.12) 0%, transparent 50%)
            `,
            backgroundSize: '200% 200%, 100% 100%, 100% 100%',
            animation: 'cosmicRotate 25s ease infinite, cosmicFloat 15s ease-in-out infinite',
            opacity: 0.9
          }} />
          
          {/* Partículas estelares */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(1px 1px at 15% 25%, rgba(255, 255, 255, 0.8), transparent),
              radial-gradient(1px 1px at 85% 75%, rgba(0, 212, 255, 0.8), transparent),
              radial-gradient(1px 1px at 45% 15%, rgba(116, 185, 255, 0.6), transparent),
              radial-gradient(1px 1px at 75% 45%, rgba(255, 255, 255, 0.7), transparent),
              radial-gradient(1px 1px at 25% 85%, rgba(0, 212, 255, 0.9), transparent)
            `,
            backgroundSize: '100px 100px',
            animation: 'stars 30s linear infinite',
            opacity: 0.7
          }} />
          
          <div style={{ position: 'relative', zIndex: 3 }}>
            <h1 style={{
              fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
              fontWeight: '900',
              color: '#ffffff',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              background: 'linear-gradient(135deg, #00d4ff 0%, #4facfe 25%, #74b9ff 50%, #ffffff 75%, #00d4ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 200%',
              animation: 'galacticShift 8s ease infinite',
              textShadow: `
                0 0 60px rgba(0, 212, 255, 1),
                0 0 120px rgba(116, 185, 255, 0.8),
                0 0 180px rgba(0, 212, 255, 0.6)
              `,
              letterSpacing: '3px',
              fontFamily: "'Orbitron', monospace",
              filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.6))'
            }}>
              <span style={{
                background: `
                  radial-gradient(circle, #00d4ff 0%, #1a73e8 20%, #0f3460 40%, #061a2e 60%, #000814 100%),
                  conic-gradient(from 45deg, rgba(0, 212, 255, 0.3), rgba(116, 185, 255, 0.3), rgba(0, 212, 255, 0.3))
                `,
                borderRadius: '18px',
                padding: '12px 18px',
                fontSize: 'clamp(1.8rem, 4.5vw, 3rem)',
                boxShadow: `
                  0 0 60px rgba(0, 212, 255, 0.9),
                  inset 0 2px 0 rgba(0, 212, 255, 0.7),
                  0 0 40px rgba(116, 185, 255, 0.7),
                  inset 0 -2px 0 rgba(0, 30, 60, 0.5)
                `,
                transform: 'perspective(1000px) rotateX(5deg) rotateY(5deg)',
                animation: 'headerIconFloat 6s ease-in-out infinite, pulse 4s ease-in-out infinite',
                border: '2px solid rgba(0, 212, 255, 0.9)',
                color: '#00d4ff',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'conic-gradient(from 0deg, transparent, rgba(0, 212, 255, 0.3), transparent)',
                  animation: 'logoSpin 8s linear infinite'
                }} />
                <span style={{ position: 'relative', zIndex: 2 }}>🌌</span>
              </span>
              ERP GALAXY
            </h1>
            {empresaActual && (
              <div style={{
                marginTop: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.25) 0%, rgba(79, 172, 254, 0.15) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 212, 255, 0.5)',
                  padding: '12px 20px',
                  borderRadius: '15px',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  boxShadow: '0 0 25px rgba(0, 212, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  textShadow: '0 0 15px rgba(0, 212, 255, 0.8)',
                  fontFamily: "'Exo 2', sans-serif",
                  letterSpacing: '0.5px'
                }}>
                  🏢 {empresaActual.ruc} - {empresaActual.razon_social}
                </div>
                <Link
                  to="/empresas"
                  style={{
                    background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(116, 185, 255, 0.1) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(79, 172, 254, 0.4)',
                    padding: '12px 20px',
                    borderRadius: '15px',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                    display: 'inline-block',
                    transform: 'translateY(0)',
                    textShadow: '0 0 10px rgba(79, 172, 254, 0.8)',
                    fontFamily: "'Exo 2', sans-serif",
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 0 35px rgba(79, 172, 254, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79, 172, 254, 0.4) 0%, rgba(116, 185, 255, 0.3) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(79, 172, 254, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(116, 185, 255, 0.1) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(79, 172, 254, 0.3)';
                  }}
                >
                  🔄 Cambiar empresa
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Main Container Ultra Premium */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
          backdropFilter: 'blur(40px) saturate(180%)',
          borderRadius: '32px',
          padding: 'clamp(40px, 6vw, 60px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decoration ultra moderno */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '100%',
            height: '100%',
            background: 'conic-gradient(from 0deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1), rgba(240, 147, 251, 0.1), rgba(102, 126, 234, 0.1))',
            animation: 'rotate 30s linear infinite',
            opacity: 0.6
          }} />

          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: 'clamp(25px, 4vw, 35px)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            textAlign: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 50%, #90caf9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(144, 202, 249, 0.6)',
            letterSpacing: '1px',
            fontFamily: "'Orbitron', monospace",
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 50%, #90caf9 100%)',
              borderRadius: '12px',
              padding: '6px 10px',
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              boxShadow: '0 0 25px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              animation: 'iconPulse 4s ease-in-out infinite',
              color: '#1565c0',
              border: '1px solid rgba(255, 255, 255, 0.6)'
            }}>⚡</span>
            Módulos del Sistema
          </h2>
          
          {/* Layout ultra moderno con efectos 3D */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'clamp(15px, 3vw, 25px)',
            maxWidth: '900px',
            margin: '0 auto',
            placeItems: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            
            {modules.map((item, index) => (
              <Link
                key={index}
                to={item.link || '#'}
                style={{ textDecoration: 'none', width: '100%' }}
                onClick={!item.link ? (e) => e.preventDefault() : undefined}
              >
                <div
                  style={{
                    width: 'clamp(140px, 16vw, 170px)',
                    height: 'clamp(140px, 16vw, 170px)',
                    border: item.highlight 
                      ? `2px solid ${item.color}` 
                      : `1px solid rgba(255, 255, 255, 0.3)`,
                    borderRadius: '50%',
                    cursor: item.link ? 'pointer' : 'not-allowed',
                    transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                    background: item.highlight 
                      ? `conic-gradient(from 0deg, ${item.color}15, ${item.color}25, ${item.color}15)`
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    opacity: item.link ? 1 : 0.6,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(12px, 2.5vw, 20px)',
                    boxSizing: 'border-box',
                    margin: '0 auto',
                    backdropFilter: 'blur(15px)',
                    boxShadow: item.highlight 
                      ? `0 10px 25px ${item.color}20, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
                      : '0 8px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
                    animation: `cardFloat${index % 3} 6s ease-in-out infinite ${index * 0.3}s`
                  }}
                  onMouseEnter={(e) => {
                    if (item.link) {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateX(-10deg) rotateY(10deg) translateZ(50px) scale(1.05)';
                      e.currentTarget.style.boxShadow = `0 25px 50px ${item.color}30, inset 0 1px 0 rgba(255, 255, 255, 0.4)`;
                      e.currentTarget.style.borderColor = item.color;
                      e.currentTarget.style.background = item.highlight 
                        ? `conic-gradient(from 0deg, ${item.color}25, ${item.color}35, ${item.color}25)`
                        : `linear-gradient(135deg, ${item.color}15 0%, ${item.color}25 100%)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (item.link) {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
                      e.currentTarget.style.boxShadow = item.highlight 
                        ? `0 10px 25px ${item.color}20, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
                        : '0 8px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.borderColor = item.highlight 
                        ? item.color
                        : 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.background = item.highlight 
                        ? `conic-gradient(from 0deg, ${item.color}15, ${item.color}25, ${item.color}15)`
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)';
                    }
                  }}
                >
                  {item.highlight && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      border: `2px solid ${item.color}`,
                      borderRadius: '50%',
                      animation: `glow${index % 2} 3s ease-in-out infinite alternate`,
                      opacity: 0.7
                    }} />
                  )}
                  
                  <div style={{ 
                    fontSize: 'clamp(2rem, 5vw, 3rem)', 
                    marginBottom: 'clamp(8px, 2vw, 12px)',
                    filter: item.link ? 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' : 'grayscale(100%) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                    transform: 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}>
                    {item.icon}
                  </div>
                  
                  <h3 style={{
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                    fontWeight: '700',
                    color: item.link ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.5)',
                    marginBottom: 'clamp(4px, 1vw, 6px)',
                    lineHeight: '1.2',
                    textAlign: 'center',
                    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    letterSpacing: '-0.01em'
                  }}>
                    {item.title}
                  </h3>
                  
                  <p style={{
                    fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
                    color: 'rgba(255,255,255,0.8)',
                    margin: '0',
                    lineHeight: '1.3',
                    textAlign: 'center',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textShadow: '0 1px 4px rgba(0,0,0,0.2)'
                  }}>
                    {item.desc}
                  </p>
                  
                  {!item.link && (
                    <div style={{
                      position: 'absolute',
                      bottom: 'clamp(8px, 2vw, 12px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.6rem, 1.2vw, 0.75rem)',
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      textShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}>
                      Próximamente
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Ultra Modern CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes galacticShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes stars {
          0% { transform: translateX(0); }
          100% { transform: translateX(-200px); }
        }
        
        @keyframes cosmicFloat {
          0%, 100% { 
            transform: rotate(0deg) scale(1);
            opacity: 0.6;
          }
          33% { 
            transform: rotate(120deg) scale(1.1);
            opacity: 0.8;
          }
          66% { 
            transform: rotate(240deg) scale(0.9);
            opacity: 0.7;
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 40px rgba(0, 212, 255, 0.9), inset 0 2px 0 rgba(255, 255, 255, 0.4);
            transform: scale(1.05);
          }
        }
        
        @keyframes logoSpin {
          0% { transform: perspective(1000px) rotateX(5deg) rotateY(5deg) rotateZ(0deg); }
          100% { transform: perspective(1000px) rotateX(5deg) rotateY(5deg) rotateZ(360deg); }
        }
        
        @keyframes iconGlow {
          0% { filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.6)); }
          100% { filter: drop-shadow(0 0 15px rgba(0, 212, 255, 1)); }
        }
        
        @keyframes activeGlow {
          0% { box-shadow: 0 0 15px rgba(0, 212, 255, 0.8); }
          100% { box-shadow: 0 0 25px rgba(0, 212, 255, 1), 0 0 35px rgba(0, 212, 255, 0.5); }
        }
        
        @keyframes cosmicRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes headerIconFloat {
          0%, 100% { 
            transform: perspective(1000px) rotateX(5deg) rotateY(5deg) translateY(0px);
          }
          50% { 
            transform: perspective(1000px) rotateX(5deg) rotateY(5deg) translateY(-10px);
          }
        }
        
        @keyframes cardFloat0 {
          0%, 100% { 
            transform: translateY(0px) rotateX(5deg) rotateY(5deg);
          }
          50% { 
            transform: translateY(-8px) rotateX(5deg) rotateY(5deg);
          }
        }
        
        @keyframes cardFloat1 {
          0%, 100% { 
            transform: translateY(0px) rotateX(2deg) rotateY(-2deg);
          }
          50% { 
            transform: translateY(-6px) rotateX(2deg) rotateY(-2deg);
          }
        }
        
        @keyframes cardFloat2 {
          0%, 100% { 
            transform: translateY(0px) rotateX(-2deg) rotateY(2deg);
          }
          50% { 
            transform: translateY(-10px) rotateX(-2deg) rotateY(2deg);
          }
        }
        
        @keyframes iconPulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
          }
          50% { 
            transform: scale(1.05) rotate(2deg);
          }
        }
        
        @keyframes glow0 {
          0% { box-shadow: 0 0 20px currentColor, inset 0 0 20px currentColor; opacity: 0.6; }
          100% { box-shadow: 0 0 40px currentColor, inset 0 0 40px currentColor; opacity: 1; }
        }
        
        @keyframes glow1 {
          0% { box-shadow: 0 0 30px currentColor; opacity: 0.8; }
          100% { box-shadow: 0 0 50px currentColor; opacity: 1; }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .grid-container {
            grid-template-columns: repeat(2, 1fr);
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
