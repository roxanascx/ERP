import { useState, useEffect, useCallback } from 'react';
import type {
  Empresa,
  EmpresaCreate,
  EmpresaUpdate,
  SireConfig,
} from '../types/empresa';
import EmpresaApiService from '../services/empresaApi';
import { useEmpresaContext } from '../contexts/EmpresaContext';

/**
 * CRUD de empresas + acceso a la empresa activa.
 *
 * La LISTA de empresas sigue siendo estado local de este hook (solo la usan
 * las 3 pantallas que administran empresas). La EMPRESA ACTIVA, en cambio,
 * vive en EmpresaContext: antes este hook la pedia por su cuenta y avisaba de
 * los cambios con un `window.dispatchEvent`, que ya no hace falta.
 *
 * La firma publica no cambia, para no tocar sus consumidores.
 */
export const useEmpresa = () => {
  const {
    empresaActual,
    seleccionarEmpresa: seleccionarEnContexto,
    revalidate: revalidarEmpresaActual,
  } = useEmpresaContext();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // OPERACIONES CRUD
  // ============================================

  const cargarEmpresas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await EmpresaApiService.getEmpresas();
      setEmpresas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const crearEmpresa = useCallback(async (data: EmpresaCreate): Promise<Empresa | null> => {
    setLoading(true);
    setError(null);
    try {
      const nuevaEmpresa = await EmpresaApiService.createEmpresa(data);
      setEmpresas((prev) => [...prev, nuevaEmpresa]);
      return nuevaEmpresa;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear empresa');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarEmpresa = useCallback(
    async (ruc: string, data: EmpresaUpdate): Promise<Empresa | null> => {
      setLoading(true);
      setError(null);
      try {
        const empresaActualizada = await EmpresaApiService.updateEmpresa(ruc, data);
        setEmpresas((prev) => prev.map((emp) => (emp.ruc === ruc ? empresaActualizada : emp)));

        // Si se ha editado la empresa activa, el contexto debe reflejarlo.
        if (empresaActual?.ruc === ruc) {
          await revalidarEmpresaActual();
        }

        return empresaActualizada;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al actualizar empresa');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [empresaActual?.ruc, revalidarEmpresaActual]
  );

  const eliminarEmpresa = useCallback(
    async (ruc: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await EmpresaApiService.deleteEmpresa(ruc);
        setEmpresas((prev) => prev.filter((emp) => emp.ruc !== ruc));

        if (empresaActual?.ruc === ruc) {
          await revalidarEmpresaActual();
        }

        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al eliminar empresa');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [empresaActual?.ruc, revalidarEmpresaActual]
  );

  // ============================================
  // OPERACIONES SIRE
  // ============================================

  const configurarSire = useCallback(
    async (ruc: string, config: SireConfig): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const empresaActualizada = await EmpresaApiService.configurarSire(ruc, config);
        setEmpresas((prev) => prev.map((emp) => (emp.ruc === ruc ? empresaActualizada : emp)));

        if (empresaActual?.ruc === ruc) {
          await revalidarEmpresaActual();
        }

        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al configurar SIRE');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [empresaActual?.ruc, revalidarEmpresaActual]
  );

  // ============================================
  // GESTION MULTI-EMPRESA (delegada al contexto)
  // ============================================

  const seleccionarEmpresa = useCallback(
    async (ruc: string): Promise<boolean> => {
      const ok = await seleccionarEnContexto(ruc);
      if (!ok) setError('Error al seleccionar empresa');
      return ok;
    },
    [seleccionarEnContexto]
  );

  const cargarEmpresaActual = revalidarEmpresaActual;

  // ============================================
  // UTILIDADES
  // ============================================

  const buscarEmpresaPorRuc = useCallback(
    (ruc: string): Empresa | undefined => empresas.find((emp) => emp.ruc === ruc),
    [empresas]
  );

  const getEmpresasConSire = useCallback(
    (): Empresa[] => empresas.filter((emp) => emp.sire_activo && emp.sire_client_id),
    [empresas]
  );

  const hasError = Boolean(error);

  const limpiarError = useCallback(() => setError(null), []);

  // ============================================
  // EFECTO INICIAL
  // ============================================
  // Solo la lista: la empresa activa ya la resuelve EmpresaProvider una vez.

  useEffect(() => {
    void cargarEmpresas();
  }, [cargarEmpresas]);

  return {
    // Estado
    empresas,
    empresaActual,
    loading,
    error,
    hasError,

    // Operaciones CRUD
    cargarEmpresas,
    crearEmpresa,
    actualizarEmpresa,
    eliminarEmpresa,

    // Operaciones SIRE
    configurarSire,

    // Multi-empresa
    seleccionarEmpresa,
    cargarEmpresaActual,

    // Utilidades
    buscarEmpresaPorRuc,
    getEmpresasConSire,
    limpiarError,
  };
};

export default useEmpresa;
