/**
 * API Service para Registro de Ventas
 * Conecta con endpoints del backend FastAPI - módulo accounting/ventas
 * Sincronizado con ventas_routes.py (empresa_id explícito como query param)
 */

import api from './api';
import type {
  RegistroVentaRequest,
  RegistroVentaResponse,
  PLEVentasExportOptions,
  PLEVentasExportResult,
  VentasFilters,
  VentasStats
} from '../types/ventas';

/** Saca el motivo que manda el backend; axios solo trae el codigo HTTP. */
function mensajeDeError(error: unknown): string {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data
    ?.detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && "mensaje" in detail) {
    return String((detail as { mensaje: unknown }).mensaje);
  }
  return error instanceof Error ? error.message : "Error al guardar el comprobante";
}

export const ventasApi = {
  // CRUD Básico
  async getAll(empresaId: string, filters?: VentasFilters): Promise<RegistroVentaResponse[]> {
    const params = new URLSearchParams();
    params.append('empresa_id', empresaId);
    // El backend acota por rango de periodos (periodo_inicio/periodo_fin), no
    // por un parametro `periodo`: mandarlo con ese nombre lo ignoraba en
    // silencio y la pantalla mostraba todos los meses a la vez.
    if (filters?.periodo) {
      params.append('periodo_inicio', filters.periodo);
      params.append('periodo_fin', filters.periodo);
    }
    if (filters?.fecha_inicio) params.append('fecha_desde', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('fecha_hasta', filters.fecha_fin);
    if (filters?.cliente_documento) params.append('numero_documento_cliente', filters.cliente_documento);
    if (filters?.tipo_comprobante) params.append('tipo_comprobante', filters.tipo_comprobante);

    const response = await api.get(`/accounting/ventas/?${params.toString()}`);
    return response.data;
  },

  async getById(empresaId: string, id: string): Promise<RegistroVentaResponse> {
    const response = await api.get(`/accounting/ventas/${id}?empresa_id=${empresaId}`);
    return response.data;
  },

  async create(empresaId: string, periodo: string, registro: RegistroVentaRequest): Promise<RegistroVentaResponse> {
    try {
      const response = await api.post(
        `/accounting/ventas/?empresa_id=${empresaId}&periodo=${periodo}`,
        registro
      );
      return response.data;
    } catch (error) {
      // Sin esto el formulario mostraba "Request failed with status code 422"
      // en vez del motivo real (comprobante duplicado, montos que no cuadran).
      throw new Error(mensajeDeError(error));
    }
  },

  async update(empresaId: string, id: string, registro: RegistroVentaRequest): Promise<RegistroVentaResponse> {
    const response = await api.put(`/accounting/ventas/${id}?empresa_id=${empresaId}`, registro);
    return response.data;
  },

  async delete(empresaId: string, id: string): Promise<void> {
    await api.delete(`/accounting/ventas/${id}?empresa_id=${empresaId}`);
  },

  // Exportaciones PLE
  async exportPLE(empresaId: string, options: PLEVentasExportOptions): Promise<PLEVentasExportResult> {
    const response = await api.post(`/accounting/ventas/generar-ple?empresa_id=${empresaId}`, options);
    return response.data;
  },

  async exportExcel(empresaId: string, filters?: VentasFilters): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('empresa_id', empresaId);
    if (filters?.periodo) {
      params.append('periodo_inicio', filters.periodo);
      params.append('periodo_fin', filters.periodo);
    }
    if (filters?.fecha_inicio) params.append('fecha_desde', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('fecha_hasta', filters.fecha_fin);

    const response = await api.get(`/accounting/ventas/export-excel?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Estadísticas
  async getStats(empresaId: string, periodoAaaamm: string): Promise<VentasStats> {
    const response = await api.get(
      `/accounting/ventas/resumen?empresa_id=${empresaId}&periodo_aaaamm=${periodoAaaamm}`
    );
    return response.data;
  },

  // Validaciones (de un registro ya guardado, contra las reglas SUNAT)
  async validateRegistro(empresaId: string, id: string): Promise<{ es_valido: boolean; errores: string[]; warnings: string[] }> {
    const response = await api.get(`/accounting/ventas/validar/${id}?empresa_id=${empresaId}`);
    return response.data;
  }

  // Nota: validar documento de cliente (RUC/DNI) antes de crear un registro e
  // importación masiva desde Excel no tienen todavía endpoint en el backend.
  // No se exponen aquí hasta que se implementen esas funcionalidades.
};

export default ventasApi;
