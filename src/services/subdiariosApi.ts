/**
 * Configuracion de subdiarios contables.
 *
 * Un subdiario clasifica las operaciones por su origen y determina que asiento
 * producen. Es la base de la contabilizacion automatica de las ventas de SIRE.
 *
 * `api` ya trae baseURL = <host>/api/v1: estas rutas NO repiten ese prefijo.
 */

import api from './api';

export type NaturalezaVenta =
  | 'EXPORTACION'
  | 'GRAVADA'
  | 'EXONERADA'
  | 'INAFECTA'
  | 'MIXTO'
  | 'GRAVADA_IGV_10';

export const ETIQUETA_NATURALEZA: Record<NaturalezaVenta, string> = {
  EXPORTACION: 'Exportacion',
  GRAVADA: 'Gravada',
  EXONERADA: 'Exonerada',
  INAFECTA: 'Inafecta',
  MIXTO: 'Mixto',
  GRAVADA_IGV_10: 'Gravada IGV 10%',
};

export type NaturalezaCompra =
  | 'GRAVADA'
  | 'NO_GRAVADA'
  | 'MIXTA'
  | 'IMPORTACION'
  | 'GRAVADA_Y_NO_GRAVADA'
  | 'SIN_DERECHO_CREDITO'
  | 'GRAVADA_IGV_10';

export const ETIQUETA_NATURALEZA_COMPRA: Record<NaturalezaCompra, string> = {
  GRAVADA: 'Gravada',
  NO_GRAVADA: 'No gravada',
  MIXTA: 'Mixta',
  IMPORTACION: 'Importacion',
  GRAVADA_Y_NO_GRAVADA: 'Destinada a ventas gravadas y no gravadas',
  SIN_DERECHO_CREDITO: 'Sin derecho a credito fiscal',
  GRAVADA_IGV_10: 'Gravada IGV 10%',
};

export interface CuentasSubdiario {
  // Ventas
  cuenta_cobro?: string | null;
  cuenta_ingreso?: string | null;
  // Compras
  cuenta_gasto?: string | null;
  cuenta_pago?: string | null;
  /** Compartida: es la misma cuenta 40 con distinta subcuenta segun el caso. */
  cuenta_igv?: string | null;
}

export interface Subdiario {
  id: string;
  codigo: string;
  nombre: string;
  detalle?: string | null;
  sucursal: string;
  asiento_compras: boolean;
  asiento_ventas: boolean;
  asiento_honorarios: boolean;
  asiento_cheque: boolean;
  asiento_caja: boolean;
  modo_caja?: 'A' | 'I' | 'E' | null;
  asiento_bancos: boolean;
  modo_bancos?: 'A' | 'I' | 'E' | null;
  asiento_canje_aplicacion: boolean;
  naturaleza?: NaturalezaVenta | null;
  naturaleza_compra?: NaturalezaCompra | null;
  cuentas: CuentasSubdiario;
  activo: boolean;
  /** Derivados por el backend. */
  tipos: string[];
  listo: boolean;
  creado_en?: string | null;
  creado_por?: string | null;
  modificado_en?: string | null;
  modificado_por?: string | null;
}

/** Qué falta para poder contabilizar ventas. */
export interface DiagnosticoSubdiarios {
  total_subdiarios_venta: number;
  listos: number;
  puede_contabilizar: boolean;
  pendientes: {
    codigo: string;
    nombre: string;
    naturaleza?: NaturalezaVenta | null;
    falta: string[];
  }[];
}

/** Lo mismo por el lado de compras. */
export interface DiagnosticoSubdiariosCompras {
  total_subdiarios_compra: number;
  listos: number;
  puede_contabilizar: boolean;
  pendientes: {
    codigo: string;
    nombre: string;
    naturaleza?: NaturalezaCompra | null;
    falta: string[];
  }[];
}

const BASE = '/accounting/subdiarios';

function mensajeDeError(error: any): string {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (detail?.mensaje) return detail.mensaje;
  return error?.message || 'Error en la configuracion de subdiarios';
}

export const subdiariosApi = {
  /** Catalogo de la empresa. La primera llamada siembra el estandar. */
  async listar(empresaId: string, tipo?: string): Promise<Subdiario[]> {
    try {
      const { data } = await api.get<{ subdiarios: Subdiario[] }>(BASE, {
        params: { empresa_id: empresaId, ...(tipo ? { tipo } : {}) },
      });
      return data.subdiarios;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  async diagnostico(empresaId: string): Promise<DiagnosticoSubdiarios> {
    try {
      const { data } = await api.get<DiagnosticoSubdiarios>(`${BASE}/diagnostico`, {
        params: { empresa_id: empresaId },
      });
      return data;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  /** Lo mismo por el lado de compras: la cuenta de gasto es la que suele faltar. */
  async diagnosticoCompras(empresaId: string): Promise<DiagnosticoSubdiariosCompras> {
    try {
      const { data } = await api.get<DiagnosticoSubdiariosCompras>(
        `${BASE}/diagnostico-compras`,
        { params: { empresa_id: empresaId } }
      );
      return data;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  async crear(empresaId: string, subdiario: Partial<Subdiario>): Promise<Subdiario> {
    try {
      const { data } = await api.post<{ subdiario: Subdiario }>(BASE, subdiario, {
        params: { empresa_id: empresaId },
      });
      return data.subdiario;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  /** Actualiza solo los campos enviados. */
  async actualizar(
    empresaId: string,
    codigo: string,
    cambios: Partial<Subdiario>
  ): Promise<Subdiario> {
    try {
      const { data } = await api.put<{ subdiario: Subdiario }>(`${BASE}/${codigo}`, cambios, {
        params: { empresa_id: empresaId },
      });
      return data.subdiario;
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

export default subdiariosApi;
