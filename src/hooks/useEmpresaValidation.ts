import { useEmpresaContext } from '../contexts/EmpresaContext';
import type { Empresa } from '../types/empresa';

interface UseEmpresaValidationResult {
  hasEmpresaSelected: boolean;
  empresaActual: Empresa | null;
  loading: boolean;
  error: string | null;
  isValidated: boolean;
  revalidate: () => Promise<void>;
}

/**
 * Valida si hay una empresa seleccionada.
 *
 * Ahora es una fachada de EmpresaContext: mantiene exactamente la misma firma
 * que la version anterior (11 archivos la consumen) pero ya no hace su propia
 * peticion ni monta su propio `useEffect`. Antes, cada instancia pedia
 * `GET /current/info` + `GET /empresas/{ruc}` por separado, asi que en
 * /dashboard se duplicaban por tener montados RequireEmpresa y MainLayout.
 */
export const useEmpresaValidation = (): UseEmpresaValidationResult => {
  const { empresaActual, hasEmpresaSelected, loading, error, isValidated, revalidate } =
    useEmpresaContext();

  return { empresaActual, hasEmpresaSelected, loading, error, isValidated, revalidate };
};

export default useEmpresaValidation;
