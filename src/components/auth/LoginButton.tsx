import React from 'react';
import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react';

const LoginButton: React.FC = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return null; // No mostrar si ya está logueado
  }

  return (
    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
      <SignInButton mode="modal">
        <button style={{
          background: '#2563eb',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'all 0.2s'
        }}>
          Iniciar Sesión
        </button>
      </SignInButton>

      <SignUpButton mode="modal">
        <button style={{
          background: 'transparent',
          color: '#2563eb',
          border: '2px solid #2563eb',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'all 0.2s'
        }}>
          Registrarse
        </button>
      </SignUpButton>
    </div>
  );
};

export default LoginButton;
