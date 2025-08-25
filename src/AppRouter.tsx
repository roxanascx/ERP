import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
  HomePage, 
  DashboardPage, 
  EmpresaPage, 
  SirePage,
  SireHomePage,
  RvieHomePage,
  RvieVentasPage,
  RvieTicketsPage,
  RvieOperacionesPage,
  RceHomePage,
  RceOperacionesPage,
  RceTicketsPage,
  RceResumenPage
} from './pages';
import SociosNegocioPage from './pages/socios-negocio/SociosNegocioPage';
import ContabilidadPage from './pages/contabilidad/ContabilidadPage';
import PlanContablePage from './pages/contabilidad/PlanContablePage';
import TestLogoutPage from './pages/TestLogoutPage';
import EmpresaProtectedRoute from './components/EmpresaProtectedRoute';
import { RceDataProvider } from './contexts/RceDataContext';
import RceIntegrationTest from './pages/test/RceIntegrationTest';

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
        {/* Ruta principal - decide entre HomePage o Empresas */}
        <Route 
          path="/" 
          element={
            isSignedIn ? <Navigate to="/empresas" replace /> : <HomePage />
          } 
        />
        
        {/* Dashboard - requiere empresa seleccionada */}
        <Route 
          path="/dashboard" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <DashboardPage />
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        {/* Empresas - solo accesible si está autenticado */}
        <Route 
          path="/empresas" 
          element={
            isSignedIn ? <EmpresaPage /> : <Navigate to="/" replace />
          } 
        />
        
        {/* SIRE - requiere empresa seleccionada */}
        <Route 
          path="/sire" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <SireHomePage />
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* RVIE Dashboard */}
        <Route 
          path="/sire/rvie" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <RvieHomePage />
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* RVIE Operaciones */}
        <Route 
          path="/sire/rvie/operaciones" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <RvieOperacionesPage />
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* RVIE Tickets */}
        <Route 
          path="/sire/rvie/tickets" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <RvieTicketsPage />
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* RVIE Ventas */}
        <Route 
          path="/sire/rvie/ventas" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <RvieVentasPage />
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* RCE Dashboard */}
        <Route 
          path="/sire/rce" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <RceDataProvider>
                  <RceHomePage />
                </RceDataProvider>
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* RCE Operaciones */}
        <Route 
          path="/sire/rce/operaciones" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <RceDataProvider>
                  <RceOperacionesPage />
                </RceDataProvider>
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* RCE Tickets */}
        <Route 
          path="/sire/rce/tickets" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <RceDataProvider>
                  <RceTicketsPage />
                </RceDataProvider>
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* RCE Resumen */}
        <Route 
          path="/sire/rce/resumen" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <RceDataProvider>
                  <RceResumenPage />
                </RceDataProvider>
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Socios de Negocio - MÓDULO INDEPENDIENTE */}
        <Route 
          path="/socios-negocio" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <SociosNegocioPage />
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* CONTABILIDAD - MÓDULO INDEPENDIENTE */}
        <Route 
          path="/contabilidad" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <ContabilidadPage />
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        >
          {/* Rutas anidadas de contabilidad */}
          <Route path="plan-contable" element={<PlanContablePage />} />
        </Route>

        {/* SIRE Legacy - mantener compatibilidad temporal */}
        <Route 
          path="/sire-legacy" 
          element={
            isSignedIn ? (
              <EmpresaProtectedRoute>
                <SirePage />
              </EmpresaProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        {/* Página de prueba de logout - solo accesible si está autenticado */}
        <Route 
          path="/test-logout" 
          element={
            isSignedIn ? <TestLogoutPage /> : <Navigate to="/" replace />
          } 
        />

        {/* 🧪 Página de prueba integración RCE */}
        <Route 
          path="/test-rce" 
          element={
            isSignedIn ? (
              <RceDataProvider>
                <RceIntegrationTest />
              </RceDataProvider>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        {/* Ruta catch-all - redirige a home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
