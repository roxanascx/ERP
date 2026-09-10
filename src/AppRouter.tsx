import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import MainLayout from './components/MainLayout';
import ContabilidadShell from './components/contabilidad/ContabilidadShell';
import RequireAuth from './components/routing/RequireAuth';
import PublicOnly from './components/routing/PublicOnly';
import RequireEmpresa from './components/routing/RequireEmpresa';
import AppLoading from './components/routing/AppLoading';
import { RceDataProvider } from './contexts/RceDataContext';

// Eager: es lo primero que ve un usuario sin sesion.
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// ---------------------------------------------------------------------------
// Carga diferida por ruta.
// Antes AppRouter importaba las 20 paginas de forma estatica, asi que los 7
// chunks de manualChunks se descargaban igual en el primer paint (~846 kB).
// ---------------------------------------------------------------------------
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EmpresaPage = lazy(() => import('./pages/EmpresaPage'));

const SireHomePage = lazy(() => import('./pages/sire/SireHomePage'));
const RvieHomePage = lazy(() => import('./pages/sire/rvie/RvieHomePage'));
const RvieOperacionesPage = lazy(() => import('./pages/sire/rvie/RvieOperacionesPage'));
const RvieTicketsPage = lazy(() => import('./pages/sire/rvie/RvieTicketsPage'));
const RvieVentasPage = lazy(() => import('./pages/sire/rvie/RvieVentasPage'));
const RceHomePage = lazy(() => import('./pages/sire/rce/RceHomePage'));
const RceOperacionesPage = lazy(() => import('./pages/sire/rce/RceOperacionesPage'));
const RceTicketsPage = lazy(() => import('./pages/sire/rce/RceTicketsPage'));
const RceResumenPage = lazy(() => import('./pages/sire/rce/RceResumenPage'));

const SociosNegocioPage = lazy(() => import('./pages/socios-negocio/SociosNegocioPage'));
const ContabilidadPage = lazy(() => import('./pages/contabilidad/ContabilidadPage'));
const PlanContablePage = lazy(() => import('./pages/contabilidad/PlanContablePage'));
const LibroDiarioPage = lazy(() => import('./pages/contabilidad/LibroDiarioPage'));
const RegistroComprasPage = lazy(() => import('./pages/contabilidad/compras/RegistroComprasPage'));
const RegistroVentasPage = lazy(() => import('./pages/contabilidad/ventas/RegistroVentasPage'));
const LibroMayorPage = lazy(() => import('./pages/contabilidad/mayor/LibroMayorPage'));
const PLEPage = lazy(() => import('./pages/contabilidad/PLEPage'));

const TestLogoutPage = lazy(() => import('./pages/TestLogoutPage'));
const PLETestPage = lazy(() => import('./pages/PLETestPage'));
const PLEIntegrationTest = lazy(() => import('./pages/test/PLEIntegrationTest'));
const RceIntegrationTest = lazy(() => import('./pages/test/RceIntegrationTest'));

/**
 * ============================================================================
 * MAPA DE RUTAS
 * ============================================================================
 *
 * Jerarquia:
 *
 *   /                          publica (PublicOnly: con sesion redirige a /empresas)
 *   RequireAuth                sesion iniciada
 *     /empresas                seleccion de empresa (sin empresa activa aun)
 *     RequireEmpresa           empresa seleccionada
 *       pantallas propias      Dashboard / SIRE / RVIE / RCE (traen su propio chrome)
 *       MainLayout             sidebar + cabecera compartidos
 *         /socios-negocio
 *         /contabilidad/*
 *
 * Las guardias son rutas padre con <Outlet />, no envoltorios por pagina: eso
 * elimina los 15 ternarios `isSignedIn ? ... : <Navigate />` que existian antes.
 */

/** Envuelve el arbol RCE en su provider una sola vez, en vez de 5. */
const RceProviderLayout: React.FC = () => (
  <RceDataProvider>
    <Outlet />
  </RceDataProvider>
);

const AppRouter: React.FC = () => (
  <Router>
    <Suspense fallback={<AppLoading />}>
      <Routes>
        {/* ---------------------------------------------------------------- */}
        {/* Publica                                                           */}
        {/* ---------------------------------------------------------------- */}
        <Route element={<PublicOnly />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* ---------------------------------------------------------------- */}
        {/* Requiere sesion                                                   */}
        {/* ---------------------------------------------------------------- */}
        <Route element={<RequireAuth />}>
          <Route path="/empresas" element={<EmpresaPage />} />

          {/* -------------------------------------------------------------- */}
          {/* Requiere ademas empresa seleccionada                            */}
          {/* -------------------------------------------------------------- */}
          <Route element={<RequireEmpresa />}>
            {/* ------------------------------------------------------------ */}
            {/* Pantallas con el chrome compartido (sidebar + cabecera)       */}
            {/* ------------------------------------------------------------ */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/sire" element={<SireHomePage />} />
              <Route path="/sire/rvie" element={<RvieHomePage />} />
              <Route path="/sire/rvie/operaciones" element={<RvieOperacionesPage />} />
              <Route path="/sire/rvie/tickets" element={<RvieTicketsPage />} />
              <Route path="/sire/rvie/ventas" element={<RvieVentasPage />} />

              <Route path="/sire/rce" element={<RceProviderLayout />}>
                <Route index element={<RceHomePage />} />
                <Route path="operaciones" element={<RceOperacionesPage />} />
                <Route path="tickets" element={<RceTicketsPage />} />
                <Route path="resumen" element={<RceResumenPage />} />
              </Route>

              <Route path="/socios-negocio" element={<SociosNegocioPage />} />

              <Route path="/contabilidad" element={<ContabilidadShell />}>
                <Route index element={<ContabilidadPage />} />
                <Route path="plan-contable" element={<PlanContablePage />} />
                {/* La ruta canonica ya no exige el RUC: LibroDiarioPage lo
                    resuelve desde la empresa activa. Se mantiene la variante
                    con parametro por compatibilidad con enlaces existentes. */}
                <Route path="libro-diario" element={<LibroDiarioPage />} />
                <Route path="libro-diario/:empresaId" element={<LibroDiarioPage />} />
                <Route path="registro-compras" element={<RegistroComprasPage />} />
                <Route path="registro-ventas" element={<RegistroVentasPage />} />
                <Route path="libro-mayor" element={<LibroMayorPage />} />
                <Route path="ple" element={<PLEPage />} />
              </Route>
            </Route>
          </Route>

          {/* -------------------------------------------------------------- */}
          {/* Utilidades de desarrollo: fuera del bundle de produccion        */}
          {/* -------------------------------------------------------------- */}
          {import.meta.env.DEV && (
            <Route path="/test">
              <Route path="logout" element={<TestLogoutPage />} />
              <Route path="ple" element={<PLETestPage />} />
              <Route path="ple-integration" element={<PLEIntegrationTest />} />
              <Route
                path="rce"
                element={
                  <RceDataProvider>
                    <RceIntegrationTest />
                  </RceDataProvider>
                }
              />
            </Route>
          )}
        </Route>

        {/* Compatibilidad: rutas antiguas que ya circulan en marcadores */}
        <Route path="/test-logout" element={<Navigate to="/test/logout" replace />} />
        <Route path="/test-ple" element={<Navigate to="/test/ple" replace />} />
        <Route path="/test-ple-integration" element={<Navigate to="/test/ple-integration" replace />} />
        <Route path="/test-rce" element={<Navigate to="/test/rce" replace />} />

        {/* 404 explicito en vez de un rebote silencioso a "/" */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </Router>
);

export default AppRouter;
