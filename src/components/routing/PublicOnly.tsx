import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import AppLoading from './AppLoading';

interface PublicOnlyProps {
  /** Destino para un usuario que ya tiene sesion iniciada. */
  redirectTo?: string;
}

/**
 * Guardia inversa: la landing no debe mostrarse a alguien que ya inicio sesion.
 * Reemplaza el ternario `isSignedIn ? <Navigate to="/empresas" /> : <HomePage />`.
 */
const PublicOnly: React.FC<PublicOnlyProps> = ({ redirectTo = '/empresas' }) => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <AppLoading />;
  }

  if (isSignedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PublicOnly;
