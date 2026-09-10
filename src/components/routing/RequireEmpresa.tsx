import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useEmpresaValidation } from '../../hooks/useEmpresaValidation';
import AppLoading from './AppLoading';

interface RequireEmpresaProps {
  redirectTo?: string;
}

/**
 * Guardia de empresa seleccionada.
 *
 * Reemplaza a EmpresaProtectedRoute, que envolvia `children` y por eso tenia
 * que repetirse en cada <Route>. Se asume montada bajo <RequireAuth />, asi que
 * ya no revalida la sesion.
 *
 * Solo bloquea mientras se resuelve la PRIMERA validacion (`!isValidated`).
 * Antes bloqueaba tambien con `loading`, es decir en cada revalidacion: como
 * `revalidate()` vive en el contexto compartido, cualquier pagina que la
 * llamase provocaba que esta guardia mostrara el loader, desmontara el arbol y
 * volviera a montarlo, disparando la llamada otra vez. Eso es lo que hacia
 * parpadear /socios-negocio en un bucle infinito.
 */
const RequireEmpresa: React.FC<RequireEmpresaProps> = ({ redirectTo = '/empresas' }) => {
  const { hasEmpresaSelected, isValidated } = useEmpresaValidation();

  if (!isValidated) {
    return <AppLoading message="Validando empresa…" />;
  }

  if (!hasEmpresaSelected) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RequireEmpresa;
