/**
 * API Service para Registro de Ventas
 * Conecta con endpoints del backend FastAPI para CRUD de ventas
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

export const ventasApi = {
  // CRUD Básico
  async getAll(filters?: VentasFilters): Promise<RegistroVentaResponse[]> {
    const params = new URLSearchParams();
    if (filters?.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters?.cliente_documento) params.append('cliente_documento', filters.cliente_documento);
    if (filters?.tipo_comprobante) params.append('tipo_comprobante', filters.tipo_comprobante);
    if (filters?.monto_min) params.append('monto_min', filters.monto_min.toString());
    if (filters?.monto_max) params.append('monto_max', filters.monto_max.toString());
    
    const response = await api.get(`/accounting/ventas?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<RegistroVentaResponse> {
    const response = await api.get(`/accounting/ventas/${id}`);
    return response.data;
  },

  async create(registro: RegistroVentaRequest): Promise<RegistroVentaResponse> {
    const response = await api.post('/accounting/ventas', registro);
    return response.data;
  },

  async update(id: string, registro: RegistroVentaRequest): Promise<RegistroVentaResponse> {
    const response = await api.put(`/accounting/ventas/${id}`, registro);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/accounting/ventas/${id}`);
  },

  // Exportaciones PLE
  async exportPLE(options: PLEVentasExportOptions): Promise<PLEVentasExportResult> {
    const response = await api.post('/accounting/ventas/export-ple', options);
    return response.data;
  },

  async exportExcel(filters?: VentasFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    
    const response = await api.get(`/accounting/ventas/export-excel?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Estadísticas
  async getStats(periodo: string): Promise<VentasStats> {
    const response = await api.get(`/accounting/ventas/stats?periodo=${periodo}`);
    return response.data;
  },

  // Validaciones
  async validateDocumento(tipo: string, numero: string): Promise<{ valid: boolean; nombres?: string }> {
    const response = await api.get(`/accounting/ventas/validate-documento/${tipo}/${numero}`);
    return response.data;
  },

  // Importación masiva
  async importFromExcel(file: File): Promise<{ success: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/accounting/ventas/import-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default ventasApi;
