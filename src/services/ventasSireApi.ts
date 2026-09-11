/**
 * Puente SIRE -> contabilidad para el registro de ventas.
 *
 * Son dos pasos separados a proposito: importar crea los registros de venta y
 * contabilizar genera el asiento. Entre uno y otro se puede revisar, y la
 * contabilizacion se agrupa en lotes que se pueden deshacer enteros.
 *
 * `api` ya trae baseURL = <host>/api/v1: estas rutas NO repiten ese prefijo.
 */

import api from './api';

const BASE_IMPORTAR = '/accounting/ventas/importar-sire';
const BASE_CONTABILIZAR = '/accounting/ventas/contabilizar';

// ---------------------------------------------------------------------------
// Paso 1: importar
// ---------------------------------------------------------------------------

export interface RepartoSubdiario {
  codigo: string;
  nombre: string;
  listo: boolean;
  comprobantes: number;
  importe: number;
}

export interface PrevisualizacionImportacion {
  periodo: string;
  total_sunat: number;
  nuevos: number;
  actualizables: number;
  capturados_a_mano: number;
  /** Ya tienen asiento y SUNAT les cambio el importe: no se pueden actualizar. */
  bloqueados_por_contabilizados: number;
  detalle_contabilizados: { comprobante: string; lote: string | null }[];
  sin_subdiario: number;
  importe_total: number;
  por_subdiario: RepartoSubdiario[];
  detalle_manuales: { tipo: string; serie: string; numero: string }[];
}

export interface ResultadoImportacion {
  mensaje: string;
  creados: number;
  actualizados: number;
  respetados_por_ser_manuales: number;
  bloqueados_por_contabilizados: number;
  detalle_bloqueados: { comprobante: string; lote: string | null }[];
  total_procesados: number;
}

// ---------------------------------------------------------------------------
// Paso 2: contabilizar
// ---------------------------------------------------------------------------

export interface Apartado {
  comprobante: string;
  importe?: number;
  motivo: string;
}

export interface PrevisualizacionContabilizacion {
  periodo: string;
  pendientes: number;
  contabilizables: number;
  apartados: number;
  total_debe: number;
  detalle_apartados: Apartado[];
  muestra: {
    comprobante: string;
    subdiario: string;
    lineas: { codigo: string; debe: number; haber: number }[];
  }[];
}

export interface ResultadoContabilizacion {
  mensaje: string;
  lote: string | null;
  asientos: number;
  lineas: number;
  apartados: Apartado[];
}

export interface Lote {
  lote: string;
  periodo: string;
  comprobantes: number;
  importe: number;
  fecha: string | null;
}

function mensajeDeError(error: any): string {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (detail?.mensaje) return detail.mensaje;
  return error?.message || 'Error en el proceso';
}

export const ventasSireApi = {
  /** Qué traeria la importacion. No escribe nada. */
  async previsualizarImportacion(
    ruc: string,
    periodo: string
  ): Promise<PrevisualizacionImportacion> {
    try {
      const { data } = await api.get<PrevisualizacionImportacion>(
        `${BASE_IMPORTAR}/previsualizar`,
        { params: { ruc, periodo } }
      );
      return data;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  /** Trae los comprobantes al registro de ventas. Idempotente. */
  async importar(ruc: string, periodo: string): Promise<ResultadoImportacion> {
    try {
      const { data } = await api.post<ResultadoImportacion>(BASE_IMPORTAR, null, {
        params: { ruc, periodo },
      });
      return data;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  /** Qué asientos se generarian y qué se quedaria fuera. No escribe nada. */
  async previsualizarContabilizacion(
    empresaId: string,
    periodo: string,
    subdiario?: string
  ): Promise<PrevisualizacionContabilizacion> {
    try {
      const { data } = await api.get<PrevisualizacionContabilizacion>(
        `${BASE_CONTABILIZAR}/previsualizar`,
        { params: { empresa_id: empresaId, periodo, ...(subdiario ? { subdiario } : {}) } }
      );
      return data;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  /** Genera los asientos. **Escribe en el libro diario.** */
  async contabilizar(
    empresaId: string,
    periodo: string,
    subdiario?: string
  ): Promise<ResultadoContabilizacion> {
    try {
      const { data } = await api.post<ResultadoContabilizacion>(BASE_CONTABILIZAR, null, {
        params: { empresa_id: empresaId, periodo, ...(subdiario ? { subdiario } : {}) },
      });
      return data;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  async lotes(empresaId: string, periodo?: string): Promise<Lote[]> {
    try {
      const { data } = await api.get<{ lotes: Lote[] }>(`${BASE_CONTABILIZAR}/lotes`, {
        params: { empresa_id: empresaId, ...(periodo ? { periodo } : {}) },
      });
      return data.lotes;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  /** Borra los asientos del lote y libera sus ventas. */
  async deshacerLote(empresaId: string, lote: string): Promise<string> {
    try {
      const { data } = await api.delete<{ mensaje: string }>(
        `${BASE_CONTABILIZAR}/lotes/${lote}`,
        { params: { empresa_id: empresaId } }
      );
      return data.mensaje;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },
};

export default ventasSireApi;
