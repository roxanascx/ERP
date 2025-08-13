import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { HomePage, DashboardPage } from './pages';
import TestLogoutPage from './pages/TestLogoutPage';

const AppRouter: React.FC = () => {
  const { isLoaded, isSignedIn } = useUser();

  // Mientras Clerk se carga, mostrar un loader
  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{
          padding: '40px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ 
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            Cargando aplicación...
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
  }

  return (
    <Router>
      <Routes>
        {/* Ruta principal - decide entre HomePage o Dashboard */}
        <Route 
          path="/" 
          element={
            isSignedIn ? <Navigate to="/dashboard" replace /> : <HomePage />
          } 
        />
        
        {/* Dashboard - solo accesible si está autenticado */}
        <Route 
          path="/dashboard" 
          element={
            isSignedIn ? <DashboardPage /> : <Navigate to="/" replace />
          } 
        />
        
        {/* Página de prueba de logout - solo accesible si está autenticado */}
        <Route 
          path="/test-logout" 
          element={
            isSignedIn ? <TestLogoutPage /> : <Navigate to="/" replace />
          } 
        />
        
        {/* Ruta catch-all - redirige a home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
