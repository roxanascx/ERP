import React from 'react';
import { Link } from 'react-router-dom';
import { UserProfile, UserSync } from '../components/auth';
import BackendStatus from '../components/BackendStatus';
import { useEmpresaValidation } from '../hooks/useEmpresaValidation';

const DashboardPage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '20px'
    }}>
      {/* Header con información de empresa */}
      <header style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px 30px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            📊 ERP Dashboard
          </h1>
          <div style={{
            color: '#6b7280',
            margin: '8px 0 0 0',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {empresaActual ? (
              <>
                <span>Empresa activa:</span>
                <span style={{
                  fontWeight: '600',
                  color: '#3b82f6',
                  backgroundColor: '#dbeafe',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid #93c5fd'
                }}>
                  🏢 {empresaActual.ruc} - {empresaActual.razon_social}
                </span>
                <Link
                  to="/empresas"
                  style={{
                    padding: '4px 12px',
                    fontSize: '14px',
                    color: '#6b7280',
                    textDecoration: 'none',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  🔄 Cambiar empresa
                </Link>
              </>
            ) : (
              <span>Bienvenido a tu sistema de gestión empresarial</span>
            )}
          </div>
        </div>
        
        <UserProfile />
      </header>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* Estado del Sistema */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🔧 Estado del Sistema
          </h2>
          <BackendStatus />
        </div>

        {/* Gestión de Usuarios */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <UserSync />
        </div>

        {/* Accesos Rápidos */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          gridColumn: 'span 2'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ⚡ Accesos Rápidos
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            
            {[
              { icon: '🏢', title: 'Empresas', desc: 'Gestión de empresas y SIRE', color: '#3b82f6', link: '/empresas' },
              { icon: '🔗', title: 'SIRE', desc: 'Sistema de Información de Reportes Electrónicos', color: '#dc2626', link: '/sire' },
              { icon: '💰', title: 'Contabilidad', desc: 'Gestión financiera', color: '#10b981' },
              { icon: '📦', title: 'Inventario', desc: 'Control de productos', color: '#f59e0b' },
              { icon: '👥', title: 'Empleados', desc: 'Recursos humanos', color: '#ef4444' },
              { icon: '📊', title: 'Reportes', desc: 'Análisis y métricas', color: '#8b5cf6' },
              { icon: '⚙️', title: 'Configuración', desc: 'Ajustes del sistema', color: '#6b7280' },
              { icon: '📈', title: 'Ventas', desc: 'Gestión comercial', color: '#06b6d4' },
              { icon: '🚪', title: 'Test Logout', desc: 'Probar botones logout', color: '#ef4444', link: '/test-logout' }
            ].map((item, index) => (
              <Link
                key={index}
                to={item.link || '#'}
                style={{ textDecoration: 'none' }}
                onClick={!item.link ? (e) => e.preventDefault() : undefined}
              >
                <div
                  style={{
                    padding: '25px',
                    border: `2px solid ${item.color}20`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    background: `${item.color}05`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 25px ${item.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '15px' }}>
                    {item.icon}
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: item.color,
                    marginBottom: '8px'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0'
                  }}>
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
