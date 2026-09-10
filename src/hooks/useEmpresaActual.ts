import { useEmpresaContext } from '../contexts/EmpresaContext';
import type { Empresa } from '../types/empresa';

export interface UseEmpresaActualResult {
  empresa: Empresa | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Empresa actualmente seleccionada.
 *
 * Fachada de EmpresaContext, con la misma firma que antes (4 paginas de
 * contabilidad la consumen). Antes hacia su propio `GET /current/info` al
 * montar, en paralelo al de useEmpresaValidation.
 */
export const useEmpresaActual = (): UseEmpresaActualResult => {
  const { empresaActual, loading, error, revalidate } = useEmpresaContext();

  return {
    empresa: empresaActual,
    loading,
    error,
    refetch: revalidate,
  };
};

export default useEmpresaActual;
