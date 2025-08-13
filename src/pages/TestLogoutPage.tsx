import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { LogoutButton } from '../components/auth';

const TestLogoutPage: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isSignedIn || !user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Debes estar autenticado para ver esta página</h2>
      </div>
    );
  }

  return (
    <div style={{
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      background: '#f8fafc',
      minHeight: '100vh'
    }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        🚪 Opciones de Cerrar Sesión
      </h1>

      <div style={{
        display: 'grid',
        gap: '30px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
      }}>
        
        {/* Variante Danger */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>
            Variante Danger (Rojo)
          </h3>
          <p style={{ marginBottom: '20px', color: '#6b7280' }}>
            Botón de cerrar sesión estilo peligro/advertencia
          </p>
          <LogoutButton variant="danger" size="medium" />
        </div>

        {/* Variante Primary */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>
            Variante Primary (Azul)
          </h3>
          <p style={{ marginBottom: '20px', color: '#6b7280' }}>
            Botón de cerrar sesión estilo principal
          </p>
          <LogoutButton variant="primary" size="medium" />
        </div>

        {/* Variante Secondary */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>
            Variante Secondary (Gris)
          </h3>
          <p style={{ marginBottom: '20px', color: '#6b7280' }}>
            Botón de cerrar sesión estilo secundario
          </p>
          <LogoutButton variant="secondary" size="medium" />
        </div>

        {/* Tamaños */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          gridColumn: 'span 2'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>
            Diferentes Tamaños
          </h3>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <p style={{ marginBottom: '10px', color: '#6b7280', fontSize: '14px' }}>Pequeño:</p>
              <LogoutButton variant="danger" size="small" />
            </div>
            <div>
              <p style={{ marginBottom: '10px', color: '#6b7280', fontSize: '14px' }}>Mediano:</p>
              <LogoutButton variant="danger" size="medium" />
            </div>
            <div>
              <p style={{ marginBottom: '10px', color: '#6b7280', fontSize: '14px' }}>Grande:</p>
              <LogoutButton variant="danger" size="large" />
            </div>
          </div>
        </div>

        {/* Sin Icono */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>
            Sin Icono
          </h3>
          <p style={{ marginBottom: '20px', color: '#6b7280' }}>
            Botón sin el emoji de puerta
          </p>
          <LogoutButton variant="danger" size="medium" showIcon={false} />
        </div>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>
          ℹ️ Información del Usuario
        </h3>
        <p style={{ color: '#6b7280' }}>
          <strong>Nombre:</strong> {user.firstName} {user.lastName}
          <br />
          <strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}
          <br />
          <strong>ID:</strong> {user.id}
        </p>
      </div>
    </div>
  );
};

export default TestLogoutPage;
