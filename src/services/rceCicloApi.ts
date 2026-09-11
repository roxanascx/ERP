/**
 * Ciclo de vida del periodo RCE (compras).
 *
 * Cubre la secuencia minima del manual SUNAT: aceptar la propuesta (5.2) y
 * registrar el preliminar (5.4), mas la consulta de periodos habilitados (5.33)
 * y la marcha atras (5.17).
 *
 * `api` ya trae baseURL = <host>/api/v1: estas rutas NO repiten ese prefijo.
 */

import api from './api';

/** Fase en la que esta el libro de compras del periodo. */
export type EstadoPeriodo = 'PROPUESTA' | 'PRELIMINAR' | 'REGISTRADO';

export interface EstadoSunat {
  perTributario: string;
  codEstado: string;
  desEstado: string;
  numEjercicio: string;
}

export interface EstadoCiclo {
  exitoso: boolean;
  mensaje: string;
  ruc: string;
  periodo: string;
  estado: EstadoPeriodo;
  num_ticket: string | null;
  operaciones_disponibles: string[];
  actualizado_en: string;
  /** Solo si se pidio `consultarSunat`. */
  estado_sunat?: EstadoSunat | null;
  /** `false` avisa de que SUNAT y el estado local no cuentan lo mismo. */
  coincide_con_sunat?: boolean | null;
}

/** Que contiene la propuesta de un periodo. `null` = no se pudo determinar. */
export interface ResumenPropuesta {
  exitoso: boolean;
  periodo: string;
  total_comprobantes: number | null;
  total_importe: number | null;
  total_base_imponible: number | null;
  total_igv: number | null;
  por_tipo: { tipo: string; documentos: number; importe: number }[];
  /** SUNAT dice que el periodo aun no tiene comprobantes (codigo 1070). */
  sin_datos?: boolean;
}

export interface PeriodosHabilitados {
  exitoso: boolean;
  ruc: string;
  total: number;
  periodos: EstadoSunat[];
}

const BASE_RCE = '/sire/rce/ciclo';
const BASE_RVIE = '/sire/rvie/ciclo';

/**
 * Extrae el mensaje util de un error del backend.
 *
 * Un 409 llega como objeto con `mensaje` y las operaciones que si caben; un 422
 * de SUNAT trae la lista de validaciones. Aplastarlo todo a "Error" perderia
 * justo lo que el usuario necesita leer.
 */
function mensajeDeError(error: any): string {
  const detail = error?.response?.data?.detail;

  if (typeof detail === 'string') return detail;

  if (detail && typeof detail === 'object') {
    const errores = Array.isArray(detail.errores)
      ? detail.errores.map((e: any) => `${e.cod}: ${e.msg}`).join('; ')
      : '';
    return [detail.mensaje, errores].filter(Boolean).join(' — ');
  }

  return error?.message || 'Error consultando el ciclo RCE';
}

function crearCicloApi(BASE: string) {
    return {
    /** 5.33: periodos que SUNAT tiene abiertos, del mas reciente al mas antiguo. */
    async periodosHabilitados(ruc: string): Promise<PeriodosHabilitados> {
      try {
        const { data } = await api.get<PeriodosHabilitados>(`${BASE}/periodos`, {
          params: { ruc },
        });
        return data;
      } catch (error) {
        throw new Error(mensajeDeError(error));
      }
    },

    /**
     * Estado del periodo.
     *
     * Con `consultarSunat` se anade lo que SUNAT reporta, a costa de una llamada
     * mas. Vale la pena antes de operar: el estado local solo conoce lo hecho
     * desde el ERP, y si alguien trabajo en el portal web la diferencia importa.
     */
    async estado(ruc: string, periodo: string, consultarSunat = false): Promise<EstadoCiclo> {
      try {
        const { data } = await api.get<EstadoCiclo>(`${BASE}/estado`, {
          params: { ruc, periodo, consultar_sunat: consultarSunat },
        });
        return data;
      } catch (error) {
        throw new Error(mensajeDeError(error));
      }
    },

    /**
     * Que trae la propuesta: cuantos comprobantes y por cuanto.
     *
     * Es lo que hay que poder ensenar antes de aceptar; sin esto el usuario
     * confirma una escritura en SUNAT sin saber que esta aceptando.
     */
    async resumen(ruc: string, periodo: string): Promise<ResumenPropuesta> {
      try {
        const { data } = await api.get<ResumenPropuesta>(`${BASE}/resumen`, {
          params: { ruc, periodo },
        });
        return data;
      } catch (error) {
        throw new Error(mensajeDeError(error));
      }
    },

    /** 5.2: aceptar la propuesta. El libro pasa a preliminar. Escribe en SUNAT. */
    async aceptarPropuesta(ruc: string, periodo: string): Promise<EstadoCiclo> {
      try {
        const { data } = await api.post<EstadoCiclo>(`${BASE}/aceptar-propuesta`, null, {
          params: { ruc, periodo },
        });
        return data;
      } catch (error) {
        throw new Error(mensajeDeError(error));
      }
    },

    /** 5.4: registrar el preliminar. Solo se deshace con 5.17. Escribe en SUNAT. */
    async registrarPreliminar(ruc: string, periodo: string): Promise<EstadoCiclo> {
      try {
        const { data } = await api.post<EstadoCiclo>(`${BASE}/registrar-preliminar`, null, {
          params: { ruc, periodo },
        });
        return data;
      } catch (error) {
        throw new Error(mensajeDeError(error));
      }
    },

    /** 5.17: eliminar el preliminar y devolver el periodo a propuesta. */
    async eliminarPreliminar(
      ruc: string,
      periodo: string,
      soloNoDomiciliados = false
    ): Promise<EstadoCiclo> {
      try {
        const { data } = await api.delete<EstadoCiclo>(`${BASE}/preliminar`, {
          params: { ruc, periodo, solo_no_domiciliados: soloNoDomiciliados },
        });
        return data;
      } catch (error) {
        throw new Error(mensajeDeError(error));
      }
    },
  };
}

/**
 * Los dos libros exponen el mismo contrato: misma forma de respuesta y mismas
 * operaciones, solo cambia la raiz. Se comparte el cliente para que la interfaz
 * pueda tratarlos igual y no se dupliquen los arreglos.
 */
export const rceCicloApi = crearCicloApi(BASE_RCE);
export const rvieCicloApi = crearCicloApi(BASE_RVIE);

export default rceCicloApi;
