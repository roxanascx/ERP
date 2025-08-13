import React from 'react';
import { LoginButton } from '../components/auth';

const HomePage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '60px 40px',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Logo/Icono */}
        <div style={{
          fontSize: '72px',
          marginBottom: '20px'
        }}>
          📊
        </div>

        {/* Título */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ERP Sistema
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontSize: '20px',
          color: '#6b7280',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Sistema de gestión empresarial completo.
          <br />
          Administra tu empresa de manera eficiente y moderna.
        </p>

        {/* Características */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px',
          marginBottom: '50px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
            <h3 style={{ color: '#374151', marginBottom: '5px' }}>Contabilidad</h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Gestión financiera completa</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
            <h3 style={{ color: '#374151', marginBottom: '5px' }}>Usuarios</h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Control de acceso y roles</p>
          </div>
          
          <div style={{ fontSize: '32px', marginBottom: '10px', textAlign: 'center' }}>📈</div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#374151', marginBottom: '5px' }}>Reportes</h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Análisis y estadísticas</p>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            ¿Listo para comenzar?
          </h2>
          
          <LoginButton />
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '40px',
          paddingTop: '30px',
          borderTop: '1px solid #e5e7eb',
          color: '#9ca3af',
          fontSize: '14px'
        }}>
          © 2025 ERP Sistema. Desarrollado con React + FastAPI + MongoDB
        </div>
      </div>
    </div>
  );
};

export default HomePage;
