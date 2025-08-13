import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useEmpresaValidation } from '../hooks/useEmpresaValidation';

interface EmpresaProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  showLoading?: boolean;
}

/**
 * Componente que protege rutas que requieren una empresa seleccionada
 * Redirige a /empresas si no hay empresa activa
 */
const EmpresaProtectedRoute: React.FC<EmpresaProtectedRouteProps> = ({
  children,
  redirectTo = '/empresas',
  showLoading = true
}) => {
  const { isSignedIn, isLoaded } = useUser();
  const { hasEmpresaSelected, loading, isValidated } = useEmpresaValidation();

  // Si Clerk aún no se ha cargado, mostrar loading
  if (!isLoaded) {
    return showLoading ? <LoadingComponent message="Cargando autenticación..." /> : null;
  }

  // Si no está autenticado, redirigir a home
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // Si aún está validando empresa, mostrar loading
  if (loading || !isValidated) {
    return showLoading ? <LoadingComponent message="Validando empresa..." /> : null;
  }

  // Si no hay empresa seleccionada, redirigir a selección de empresa
  if (!hasEmpresaSelected) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si todo está bien, mostrar el contenido protegido
  return <>{children}</>;
};

/**
 * Componente de loading reutilizable
 */
const LoadingComponent: React.FC<{ message: string }> = ({ message }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  }}>
    <div style={{
      padding: 'clamp(30px, 8vw, 50px)',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 'clamp(12px, 3vw, 20px)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      maxWidth: 'min(90vw, 400px)',
      width: '100%'
    }}>
      <div style={{
        width: 'clamp(50px, 12vw, 70px)',
        height: 'clamp(50px, 12vw, 70px)',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto clamp(20px, 5vw, 30px)'
      }}></div>
      
      <h3 style={{
        margin: '0 0 clamp(12px, 3vw, 16px) 0',
        fontSize: 'clamp(16px, 4vw, 20px)',
        fontWeight: '700',
        color: '#1f2937',
        letterSpacing: '-0.025em'
      }}>
        🏢 Sistema ERP
      </h3>
      
      <p style={{ 
        color: '#6b7280',
        fontSize: 'clamp(14px, 3.5vw, 16px)',
        margin: 0,
        fontWeight: '500',
        lineHeight: '1.5'
      }}>
        {message}
      </p>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  </div>
);

export default EmpresaProtectedRoute;
