/**
 * Caja/Bancos (MVP): cuentas de caja y bancos, sus movimientos, y su
 * contabilización en lotes reversibles.
 *
 * `api` ya trae baseURL = <host>/api/v1: estas rutas NO repiten ese prefijo.
 */

import api from './api';

export type TipoCuentaCajaBanco = 'CAJA' | 'BANCO';
export type MonedaCajaBanco = 'MN' | 'ME';
export type TipoMovimientoCajaBanco = 'INGRESO' | 'EGRESO';
export type MedioPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'CHEQUE' | 'TARJETA';

export interface CuentaContableRef {
  codigo: string;
  denominacion?: string;
}

export interface CuentaCajaBanco {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoCuentaCajaBanco;
  moneda: MonedaCajaBanco;
  cuenta_contable: CuentaContableRef;
  banco?: string | null;
  numero_cuenta?: string | null;
  cci?: string | null;
  saldo_inicial: number;
  saldo_actual: number;
  activa: boolean;
  empresa_id: string;
  creado_en?: string | null;
  creado_por?: string | null;
  modificado_en?: string | null;
  modificado_por?: string | null;
}

export interface MovimientoCajaBanco {
  id: string;
  cuenta_caja_banco_id: string;
  fecha: string;
  tipo: TipoMovimientoCajaBanco;
  monto: number;
  glosa: string;
  medio_pago: MedioPago;
  documento_referencia?: string | null;
  socio_negocio_id?: string | null;
  contra_cuenta: CuentaContableRef;
  centro_costo?: { codigo: string; nombre?: string } | null;
  contabilizado: boolean;
  lote_contabilizacion?: string | null;
  numeroAsiento?: string | null;
  empresa_id: string;
  creado_en?: string | null;
  creado_por?: string | null;
}

export interface ResultadoContabilizacion {
  lote: string | null;
  asientos: number;
  lineas: number;
  mensaje: string;
}

const BASE = '/caja-bancos';

function mensajeDeError(error: any): string {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (detail?.mensaje) return detail.mensaje;
  return error?.message || 'Error en Caja/Bancos';
}

export const cajaBancosApi = {
  async listarCuentas(empresaId: string, soloActivas = false): Promise<CuentaCajaBanco[]> {
    try {
      const { data } = await api.get<{ cuentas: CuentaCajaBanco[] }>(`${BASE}/cuentas`, {
        params: { empresa_id: empresaId, solo_activas: soloActivas },
      });
      return data.cuentas;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  async crearCuenta(
    empresaId: string,
    cuenta: Partial<CuentaCajaBanco>
  ): Promise<CuentaCajaBanco> {
    try {
      const { data } = await api.post<{ cuenta: CuentaCajaBanco }>(`${BASE}/cuentas`, cuenta, {
        params: { empresa_id: empresaId },
      });
      return data.cuenta;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  async actualizarCuenta(
    empresaId: string,
    codigo: string,
    cambios: Partial<CuentaCajaBanco>
  ): Promise<CuentaCajaBanco> {
    try {
      const { data } = await api.put<{ cuenta: CuentaCajaBanco }>(
        `${BASE}/cuentas/${codigo}`,
        cambios,
        { params: { empresa_id: empresaId } }
      );
      return data.cuenta;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  async eliminarCuenta(empresaId: string, codigo: string): Promise<void> {
    try {
      await api.delete(`${BASE}/cuentas/${codigo}`, { params: { empresa_id: empresaId } });
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  async listarMovimientos(
    empresaId: string,
    cuentaCajaBancoId?: string,
    contabilizado?: boolean
  ): Promise<MovimientoCajaBanco[]> {
    try {
      const { data } = await api.get<{ movimientos: MovimientoCajaBanco[] }>(
        `${BASE}/movimientos`,
        {
          params: {
            empresa_id: empresaId,
            ...(cuentaCajaBancoId ? { cuenta_caja_banco_id: cuentaCajaBancoId } : {}),
            ...(contabilizado !== undefined ? { contabilizado } : {}),
          },
        }
      );
      return data.movimientos;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  async crearMovimiento(
    empresaId: string,
    movimiento: Partial<MovimientoCajaBanco>
  ): Promise<MovimientoCajaBanco> {
    try {
      const { data } = await api.post<{ movimiento: MovimientoCajaBanco }>(
        `${BASE}/movimientos`,
        movimiento,
        { params: { empresa_id: empresaId } }
      );
      return data.movimiento;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  async contabilizar(
    empresaId: string,
    cuentaCajaBancoId?: string
  ): Promise<ResultadoContabilizacion> {
    try {
      const { data } = await api.post<ResultadoContabilizacion>(
        `${BASE}/contabilizar`,
        null,
        {
          params: {
            empresa_id: empresaId,
            ...(cuentaCajaBancoId ? { cuenta_caja_banco_id: cuentaCajaBancoId } : {}),
          },
        }
      );
      return data;
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },

  async deshacerLote(empresaId: string, lote: string): Promise<void> {
    try {
      await api.post(`${BASE}/deshacer/${lote}`, null, { params: { empresa_id: empresaId } });
    } catch (error) {
      throw new Error(mensajeDeError(error));
    }
  },
};

export default cajaBancosApi;
