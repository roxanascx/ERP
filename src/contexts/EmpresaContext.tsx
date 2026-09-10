import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import EmpresaApiService from '../services/empresaApi';
import type { Empresa } from '../types/empresa';

/**
 * ============================================================================
 * ESTADO COMPARTIDO DE LA EMPRESA ACTIVA
 * ============================================================================
 *
 * La empresa seleccionada es estado del SERVIDOR (`POST /{ruc}/select`,
 * `GET /current/info`), no del navegador. Antes, cada hook que la necesitaba
 * la pedia por su cuenta:
 *
 *   useEmpresaValidation  -> 11 archivos, cada instancia con su propio fetch
 *   useEmpresaActual      ->  4 archivos, idem
 *   useEmpresa            ->  3 archivos, idem
 *
 * En /dashboard convivian RequireEmpresa y MainLayout, cada uno con su
 * instancia de useEmpresaValidation, asi que `GET /current/info` se pedia
 * 4 veces en el recorrido login -> empresas -> dashboard. Y para enterarse de
 * los cambios se usaba un `window.dispatchEvent` casero.
 *
 * Ahora la peticion se hace UNA vez aqui y los tres hooks son fachadas de este
 * contexto, de modo que ninguno de los 18 archivos que los consumen cambia.
 */

interface EmpresaContextValue {
  /** Empresa activa, con sus datos completos */
  empresaActual: Empresa | null;
  hasEmpresaSelected: boolean;
  loading: boolean;
  error: string | null;
  /** false hasta que se ha resuelto la primera consulta */
  isValidated: boolean;
  /** Vuelve a preguntar al servidor cual es la empresa activa */
  revalidate: () => Promise<void>;
  /** Selecciona una empresa y deja el contexto ya actualizado */
  seleccionarEmpresa: (ruc: string) => Promise<boolean>;
}

const EmpresaContext = createContext<EmpresaContextValue | null>(null);

export const EmpresaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();

  const [empresaActual, setEmpresaActual] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);

  // Evita que una respuesta lenta pise a otra mas reciente.
  const requestId = useRef(0);

  const fetchEmpresaActual = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const info = await EmpresaApiService.getEmpresaActual();

      let empresa: Empresa | null = null;
      if (info?.ruc) {
        try {
          // `/current/info` devuelve una version reducida; se completa con el
          // detalle. Si el detalle falla, la version reducida sirve.
          empresa = await EmpresaApiService.getEmpresaByRuc(info.ruc);
        } catch {
          empresa = info;
        }
      }

      if (id !== requestId.current) return;
      setEmpresaActual(empresa);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof Error ? e.message : 'Error validando empresa');
      setEmpresaActual(null);
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setIsValidated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // Sin sesion no hay nada que consultar: se resuelve sin tocar la red.
    if (!isSignedIn) {
      requestId.current++;
      setEmpresaActual(null);
      setError(null);
      setLoading(false);
      setIsValidated(true);
      return;
    }

    void fetchEmpresaActual();
  }, [isLoaded, isSignedIn, fetchEmpresaActual]);

  const seleccionarEmpresa = useCallback(
    async (ruc: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const result = await EmpresaApiService.seleccionarEmpresa(ruc);
        if (!result.success) {
          setError(result.message || 'Error al seleccionar empresa');
          setLoading(false);
          return false;
        }
        // Una sola revalidacion, y todos los consumidores se enteran por
        // contexto. Antes esto disparaba un evento de window.
        await fetchEmpresaActual();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al seleccionar empresa');
        setLoading(false);
        return false;
      }
    },
    [fetchEmpresaActual]
  );

  const value = useMemo<EmpresaContextValue>(
    () => ({
      empresaActual,
      hasEmpresaSelected: empresaActual !== null,
      loading,
      error,
      isValidated,
      revalidate: fetchEmpresaActual,
      seleccionarEmpresa,
    }),
    [empresaActual, loading, error, isValidated, fetchEmpresaActual, seleccionarEmpresa]
  );

  return <EmpresaContext.Provider value={value}>{children}</EmpresaContext.Provider>;
};

/**
 * Acceso directo al contexto. Los hooks historicos
 * (useEmpresaValidation / useEmpresaActual / useEmpresa) son fachadas de este.
 */
export const useEmpresaContext = (): EmpresaContextValue => {
  const ctx = useContext(EmpresaContext);
  if (!ctx) {
    throw new Error('useEmpresaContext debe usarse dentro de <EmpresaProvider>');
  }
  return ctx;
};

export default EmpresaContext;
