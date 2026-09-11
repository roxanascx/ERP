/**
 * Cargas de archivos al RCE (servicios 5.3 y 5.5-5.9 del manual SUNAT).
 *
 * `api` ya trae baseURL = <host>/api/v1: estas rutas NO repiten ese prefijo.
 */

import api from './api';
import type { EstadoPeriodo } from './rceCicloApi';

export interface OperacionCarga {
  clave: string;
  servicio: string;
  nombre: string;
  cod_proceso: string;
  estado_requerido: EstadoPeriodo;
  estado_resultante: EstadoPeriodo | null;
}

export interface ResultadoCarga {
  exitoso: boolean;
  mensaje: string;
  ruc: string;
  periodo: string;
  servicio: string;
  num_ticket: string | null;
  bytes_enviados: number;
  estado: EstadoPeriodo;
  operaciones_disponibles: string[];
}

/** Una fila del detalle que devuelve SUNAT en un 422. */
export interface ErrorSunat {
  cod: string;
  msg: string;
}

/**
 * Error de carga que conserva el detalle de SUNAT.
 *
 * Cuando SUNAT rechaza un archivo devuelve una fila por cada problema
 * encontrado. Aplastar eso a un texto dejaria al usuario sin saber que
 * corregir, que es justo lo que hay que evitar.
 */
export class ErrorCarga extends Error {
  errores: ErrorSunat[];

  constructor(mensaje: string, errores: ErrorSunat[] = []) {
    super(mensaje);
    this.name = 'ErrorCarga';
    this.errores = errores;
  }
}

const BASE = '/sire/rce/cargas';

function comoErrorCarga(error: any): ErrorCarga {
  const detail = error?.response?.data?.detail;

  if (typeof detail === 'string') return new ErrorCarga(detail);

  if (detail && typeof detail === 'object') {
    return new ErrorCarga(
      detail.mensaje || 'SUNAT rechazo el archivo',
      Array.isArray(detail.errores) ? detail.errores : []
    );
  }

  return new ErrorCarga(error?.message || 'Error subiendo el archivo');
}

export const rceCargasApi = {
  /** Catalogo de cargas, con el estado que exige cada una. */
  async operaciones(): Promise<OperacionCarga[]> {
    try {
      const { data } = await api.get<{ operaciones: OperacionCarga[] }>(`${BASE}/operaciones`);
      return data.operaciones;
    } catch (error) {
      throw comoErrorCarga(error);
    }
  },

  /** Sube un .txt a SUNAT. El backend lo zipea y monta la metadata TUS. */
  async subir(
    operacion: string,
    ruc: string,
    periodo: string,
    archivo: File
  ): Promise<ResultadoCarga> {
    const form = new FormData();
    form.append('archivo', archivo);

    try {
      const { data } = await api.post<ResultadoCarga>(`${BASE}/${operacion}`, form, {
        params: { ruc, periodo },
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (error) {
      throw comoErrorCarga(error);
    }
  },
};

export default rceCargasApi;
