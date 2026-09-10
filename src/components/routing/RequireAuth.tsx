import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import AppLoading from './AppLoading';

/**
 * Guardia de sesion.
 *
 * Sustituye al ternario `isSignedIn ? (...) : <Navigate to="/" />` que estaba
 * repetido 15 veces en AppRouter. Se usa como ruta padre:
 *
 *   <Route element={<RequireAuth />}>
 *     <Route path="/empresas" element={<EmpresaPage />} />
 *   </Route>
 */
const RequireAuth: React.FC = () => {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return <AppLoading message="Cargando autenticación..." />;
  }

  if (!isSignedIn) {
    // Guardamos el destino para poder volver tras iniciar sesion.
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
