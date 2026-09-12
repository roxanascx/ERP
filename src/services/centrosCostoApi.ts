/**
 * Configuracion de centros de costo.
 *
 * Catalogo simple que, combinado con `requiere_centro_costo` en el Plan de
 * Cuentas, exige centro de costo al grabar un asiento en las cuentas que lo
 * tengan marcado.
 *
 * `api` ya trae baseURL = <host>/api/v1: estas rutas NO repiten ese prefijo.
 */

import api from './api';

export interface CentroCosto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  empresa_id: string;
  creado_en?: string | null;
  creado_por?: string | null;
  modificado_en?: string | null;
  modificado_por?: string | null;
}

const BASE = '/accounting/centros-costo';

function mensajeDeError(error: any): string {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (detail?.mensaje) return detail.mensaje;
  return error?.message || 'Error en la configuracion de centros de costo';
}

export const centrosCostoApi = {
  /** Catalogo de la empresa. La primera llamada siembra el estandar. */
  async listar(empresaId: string, soloActivos = false): Promise<CentroCosto[]> {
    try {
      const { data } = await api.get<{ centros_costo: CentroCosto[] }>(BASE, {
        params: { empresa_id: empresaId, solo_activos: soloActivos },
      });
      return data.centros_costo;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  async crear(empresaId: string, centroCosto: Partial<CentroCosto>): Promise<CentroCosto> {
    try {
      const { data } = await api.post<{ centro_costo: CentroCosto }>(BASE, centroCosto, {
        params: { empresa_id: empresaId },
      });
      return data.centro_costo;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  /** Actualiza solo los campos enviados. */
  async actualizar(
    empresaId: string,
    codigo: string,
    cambios: Partial<CentroCosto>
  ): Promise<CentroCosto> {
    try {
      const { data } = await api.put<{ centro_costo: CentroCosto }>(`${BASE}/${codigo}`, cambios, {
        params: { empresa_id: empresaId },
      });
      return data.centro_costo;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  async eliminar(empresaId: string, codigo: string): Promise<void> {
    try {
      await api.delete(`${BASE}/${codigo}`, { params: { empresa_id: empresaId } });
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  /** Anade los del catalogo estandar que falten. No toca los ya configurados. */
  async restaurarCatalogo(empresaId: string): Promise<string> {
    try {
      const { data } = await api.post<{ mensaje: string }>(
        `${BASE}/restaurar-catalogo`,
        null,
        { params: { empresa_id: empresaId } }
      );
      return data.mensaje;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },
};

export default centrosCostoApi;
