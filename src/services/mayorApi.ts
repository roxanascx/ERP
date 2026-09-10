/**
 * API Service para Libro Mayor
 * Conecta con endpoints del backend FastAPI para consultas del Libro Mayor
 * Sincronizado con mayor_routes.py (prefijo real: /accounting/libro-mayor)
 */

import api from './api';
import { ContabilidadApiService } from './contabilidadApi';
import type {
  MayorFilters,
  MayorMovimiento,
  MayorSummary,
  CuentaContable
} from '../types/mayor';

// Deriva un rango de períodos AAAAMM a partir de fechas YYYY-MM-DD.
// El backend trabaja por período (mes), no por fecha exacta.
function periodosDesdeFiltros(filters: MayorFilters): { periodo_desde: string; periodo_hasta: string } {
  const hoy = new Date().toISOString().substring(0, 7).replace('-', '');
  const aPeriodo = (fecha?: string) => (fecha ? fecha.substring(0, 7).replace('-', '') : undefined);

  const periodoInicio = aPeriodo(filters.fecha_inicio);
  const periodoFin = aPeriodo(filters.fecha_fin) || periodoInicio;

  return {
    periodo_desde: periodoInicio || hoy,
    periodo_hasta: periodoFin || periodoInicio || hoy
  };
}

interface DetalleCuentaResponse {
  cuenta_mayor: {
    codigo_cuenta_contable: string;
    descripcion_cuenta: string;
    saldo_deudor_inicial: number;
    saldo_acreedor_inicial: number;
    movimiento_debe: number;
    movimiento_haber: number;
    saldo_final_deudor: number;
    saldo_final_acreedor: number;
  };
  resumen_movimientos: {
    codigo_cuenta: string;
    denominacion_cuenta?: string;
    total_debe: number;
    total_haber: number;
    cantidad_asientos: number;
    primer_movimiento: string | null;
    ultimo_movimiento: string | null;
    movimientos_detalle: Array<{
      fecha: string;
      numero_asiento: string;
      documento?: string;
      descripcion: string;
      debe: number;
      haber: number;
      saldo_acumulado: number;
    }>;
  };
}

async function obtenerDetalleCuenta(empresaId: string, filters: MayorFilters): Promise<DetalleCuentaResponse | null> {
  if (!filters.cuenta_codigo) return null;
  const { periodo_desde, periodo_hasta } = periodosDesdeFiltros(filters);

  const response = await api.get(`/accounting/libro-mayor/cuenta/${filters.cuenta_codigo}`, {
    params: { empresa_id: empresaId, periodo_desde, periodo_hasta }
  });
  return response.data;
}

export const mayorApi = {
  // Consultas principales
  async getMovimientos(empresaId: string, filters: MayorFilters): Promise<MayorMovimiento[]> {
    const detalle = await obtenerDetalleCuenta(empresaId, filters);
    if (!detalle) return [];

    return detalle.resumen_movimientos.movimientos_detalle.map((m, index) => ({
      id: `${filters.cuenta_codigo}-${index}`,
      fecha: m.fecha,
      numero_asiento: m.numero_asiento,
      cuenta_codigo: filters.cuenta_codigo || '',
      cuenta_nombre: detalle.cuenta_mayor.descripcion_cuenta,
      debe: m.debe,
      haber: m.haber,
      saldo_acumulado: m.saldo_acumulado,
      glosa: m.descripcion,
      documento_numero: m.documento
    }));
  },

  async getSummary(empresaId: string, filters: MayorFilters): Promise<MayorSummary | null> {
    const detalle = await obtenerDetalleCuenta(empresaId, filters);
    if (!detalle) return null;

    const cuenta = detalle.cuenta_mayor;
    const saldoInicial = cuenta.saldo_deudor_inicial - cuenta.saldo_acreedor_inicial;
    const saldoFinal = cuenta.saldo_final_deudor - cuenta.saldo_final_acreedor;

    return {
      cuenta_codigo: cuenta.codigo_cuenta_contable,
      cuenta_nombre: cuenta.descripcion_cuenta,
      saldo_inicial: saldoInicial,
      total_debe: cuenta.movimiento_debe,
      total_haber: cuenta.movimiento_haber,
      saldo_final: saldoFinal,
      cantidad_movimientos: detalle.resumen_movimientos.cantidad_asientos,
      fecha_primer_movimiento: detalle.resumen_movimientos.primer_movimiento || undefined,
      fecha_ultimo_movimiento: detalle.resumen_movimientos.ultimo_movimiento || undefined
    };
  },

  // Exportaciones
  async exportExcel(empresaId: string, filters: MayorFilters): Promise<Blob> {
    const { periodo_desde, periodo_hasta } = periodosDesdeFiltros(filters);
    const response = await api.get('/accounting/libro-mayor/export-excel', {
      params: {
        empresa_id: empresaId,
        cuenta_codigo: filters.cuenta_codigo,
        periodo_desde,
        periodo_hasta
      },
      responseType: 'blob'
    });
    return response.data;
  },

  // Utilidades: se reutiliza el Plan Contable (ya con datos reales) en vez de
  // un endpoint de "cuentas disponibles" que nunca existió en el backend.
  async getCuentasDisponibles(empresaId: string): Promise<CuentaContable[]> {
    const cuentas = await ContabilidadApiService.getCuentas({ empresa_id: empresaId, activos_solo: true });
    return cuentas.map((c) => ({
      codigo: c.codigo,
      nombre: c.descripcion,
      nivel: c.nivel,
      padre: c.cuenta_padre || undefined,
      activa: c.activa,
      naturaleza: c.naturaleza === 'ACREEDORA' ? 'acreedor' : 'deudor',
      tipo: c.es_hoja ? 'detalle' : 'titulo'
    }));
  }
};

export default mayorApi;
