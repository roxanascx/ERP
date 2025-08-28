/**
 * API Service para Libro Mayor
 * Conecta con endpoints del backend FastAPI para consultas del Libro Mayor
 */

import api from './api';
import type { 
  MayorFilters,
  MayorMovimiento,
  MayorSummary,
  MayorExportOptions
} from '../types/mayor';

export const mayorApi = {
  // Consultas principales
  async getMovimientos(filters: MayorFilters): Promise<MayorMovimiento[]> {
    const params = new URLSearchParams();
    if (filters.cuenta_codigo) params.append('cuenta_codigo', filters.cuenta_codigo);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters.periodo) params.append('periodo', filters.periodo);
    
    const response = await api.get(`/accounting/mayor/movimientos?${params.toString()}`);
    return response.data;
  },

  async getSummary(filters: MayorFilters): Promise<MayorSummary> {
    const params = new URLSearchParams();
    if (filters.cuenta_codigo) params.append('cuenta_codigo', filters.cuenta_codigo);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters.periodo) params.append('periodo', filters.periodo);
    
    const response = await api.get(`/accounting/mayor/summary?${params.toString()}`);
    return response.data;
  },

  // Exportaciones
  async exportExcel(filters: MayorFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.cuenta_codigo) params.append('cuenta_codigo', filters.cuenta_codigo);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    
    const response = await api.get(`/accounting/mayor/export-excel?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async exportPDF(filters: MayorFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.cuenta_codigo) params.append('cuenta_codigo', filters.cuenta_codigo);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    
    const response = await api.get(`/accounting/mayor/export-pdf?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Utilidades
  async getCuentasDisponibles(): Promise<{ codigo: string; nombre: string }[]> {
    const response = await api.get('/accounting/mayor/cuentas-disponibles');
    return response.data;
  },

  async getUltimosPeriodos(): Promise<string[]> {
    const response = await api.get('/accounting/mayor/periodos');
    return response.data;
  }
};

export default mayorApi;
