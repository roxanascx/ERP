/**
 * API Service para Registro de Compras
 * Conecta con endpoints del backend FastAPI - módulo accounting/compras
 * Sincronizado con compras_routes.py
 */

import api from './api';

// Tipos básicos temporales para evitar problemas de importación
interface ComprasFilters {
  empresa_id?: string;
  periodo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_comprobante?: string;
  numero_documento_proveedor?: string;
  razon_social_proveedor?: string;
  importe_min?: number;
  importe_max?: number;
  estado_operacion?: string;
  skip?: number;
  limit?: number;
}

interface ComprasResumenResponse {
  empresa_id: string;
  periodo: string;
  total_registros: number;
  total_base_imponible: number;
  total_igv: number;
  total_isc: number;
  total_otros_tributos: number;
  total_importe: number;
  tipos_comprobante_count: number;
  proveedores_unicos_count: number;
}

interface RegistroCompraResponse {
  id: string;
  empresa_id: string;
  periodo: string;
  fecha_comprobante: string;
  tipo_comprobante: string;
  serie_comprobante?: string;
  numero_comprobante: string;
  fecha_vencimiento?: string;
  tipo_documento_proveedor: string;
  numero_documento_proveedor: string;
  razon_social_proveedor: string;
  base_imponible_gravada: number;
  igv: number;
  base_imponible_exonerada?: number;
  base_imponible_inafecta?: number;
  isc?: number;
  otros_tributos?: number;
  importe_total: number;
  moneda?: string;
  tipo_cambio?: number;
  clasificacion_bienes_servicios?: string;
  estado_operacion: string;
  created_at?: string;
  updated_at?: string;
}

interface ComprasPaginatedResponse {
  registros: RegistroCompraResponse[];
  total: number;
  skip: number;
  limit: number;
}

interface RegistroCompraCreate {
  empresa_id: string;
  periodo: string;
  fecha_comprobante: string;
  tipo_comprobante: string;
  serie_comprobante?: string;
  numero_comprobante: string;
  fecha_vencimiento?: string;
  tipo_documento_proveedor: string;
  numero_documento_proveedor: string;
  razon_social_proveedor: string;
  base_imponible_gravada: number;
  igv: number;
  base_imponible_exonerada?: number;
  base_imponible_inafecta?: number;
  isc?: number;
  otros_tributos?: number;
  importe_total: number;
  moneda?: string;
  tipo_cambio?: number;
  clasificacion_bienes_servicios?: string;
  estado_operacion: string;
}

interface RegistroCompraUpdate extends Partial<RegistroCompraCreate> {}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

interface PLEComprasExportOptions {
  empresa_id: string;
  periodo: string;
  formato?: 'txt' | 'excel';
  fecha_inicio?: string;
  fecha_fin?: string;
}

interface PLEComprasMetadata {
  empresa_id: string;
  periodo: string;
  total_registros: number;
  fecha_generacion: string;
  version_formato: string;
}

interface ComprasStats {
  total_registros: number;
  suma_base_imponible: number;
  suma_igv: number;
  suma_importe_total: number;
  suma_isc?: number;
  suma_otros_tributos?: number;
  tipos_comprobante_count?: number;
  proveedores_unicos?: number;
}

export const comprasApi = {
  // CRUD Básico - coincide con endpoints del backend
  
  /**
   * GET /accounting/compras/ - Obtener todos los registros con filtros
   * Retorna lista simple para compatibilidad con código existente
   */
  async getAll(filters?: ComprasFilters): Promise<RegistroCompraResponse[]> {
    const params = new URLSearchParams();
    
    if (filters?.empresa_id) params.append('empresa_id', filters.empresa_id);
    if (filters?.periodo) params.append('periodo', filters.periodo);
    if (filters?.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters?.tipo_comprobante) params.append('tipo_comprobante', filters.tipo_comprobante);
    if (filters?.numero_documento_proveedor) params.append('numero_documento_proveedor', filters.numero_documento_proveedor);
    if (filters?.razon_social_proveedor) params.append('razon_social_proveedor', filters.razon_social_proveedor);
    if (filters?.importe_min) params.append('importe_min', filters.importe_min.toString());
    if (filters?.importe_max) params.append('importe_max', filters.importe_max.toString());
    if (filters?.estado_operacion) params.append('estado_operacion', filters.estado_operacion);
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get(`/accounting/compras?${params.toString()}`);
    return response.data; // Backend retorna lista directa
  },

  /**
   * GET /accounting/compras/ - Obtener registros con paginación completa
   * Nueva función que retorna toda la información de paginación
   */
  async getAllPaginated(filters?: ComprasFilters): Promise<ComprasPaginatedResponse> {
    const params = new URLSearchParams();
    
    if (filters?.empresa_id) params.append('empresa_id', filters.empresa_id);
    if (filters?.periodo) params.append('periodo', filters.periodo);
    if (filters?.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters?.tipo_comprobante) params.append('tipo_comprobante', filters.tipo_comprobante);
    if (filters?.numero_documento_proveedor) params.append('numero_documento_proveedor', filters.numero_documento_proveedor);
    if (filters?.razon_social_proveedor) params.append('razon_social_proveedor', filters.razon_social_proveedor);
    if (filters?.importe_min) params.append('importe_min', filters.importe_min.toString());
    if (filters?.importe_max) params.append('importe_max', filters.importe_max.toString());
    if (filters?.estado_operacion) params.append('estado_operacion', filters.estado_operacion);
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get(`/accounting/compras?${params.toString()}`);
    return response.data;
  },

  /**
   * GET /accounting/compras/resumen - Obtener resumen/estadísticas
   * Requiere empresa_id y periodo_aaaamm según backend
   */
  async getResumen(empresaId: string, periodoAaaamm: string): Promise<ComprasResumenResponse> {
    const params = new URLSearchParams();
    params.append('empresa_id', empresaId);
    params.append('periodo_aaaamm', periodoAaaamm);
    
    const url = `/accounting/compras/resumen?${params.toString()}`;
    console.log('🔍 [API] Llamando a resumen:', url);
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * GET /accounting/compras/resumen - Versión compatible con filtros (legacy)
   */
  async getResumenLegacy(filters?: ComprasFilters): Promise<ComprasStats> {
    if (!filters?.empresa_id || !filters?.periodo) {
      throw new Error('empresa_id y periodo son requeridos para obtener resumen');
    }
    
    const resumen = await this.getResumen(filters.empresa_id, filters.periodo);
    
    // Convertir a formato legacy para compatibilidad
    return {
      total_registros: resumen.total_registros,
      suma_base_imponible: resumen.total_base_imponible,
      suma_igv: resumen.total_igv,
      suma_importe_total: resumen.total_importe,
      // Campos adicionales del nuevo formato
      suma_isc: resumen.total_isc,
      suma_otros_tributos: resumen.total_otros_tributos,
      tipos_comprobante_count: resumen.tipos_comprobante_count,
      proveedores_unicos: resumen.proveedores_unicos_count
    } as ComprasStats;
  },

  /**
   * GET /accounting/compras/empresa/{empresa_id} - Obtener registros por empresa
   * Retorna solo la lista de registros para compatibilidad
   */
  async getByEmpresa(empresaId: string, filters?: ComprasFilters): Promise<RegistroCompraResponse[]> {
    const params = new URLSearchParams();
    if (filters?.periodo) params.append('periodo', filters.periodo);
    if (filters?.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const url = `/accounting/compras/empresa/${empresaId}?${params.toString()}`;
    console.log('🔍 [API] Llamando a:', url);
    
    const response = await api.get(url);
    return response.data.registros; // Extraer solo los registros
  },

  /**
   * GET /accounting/compras/empresa/{empresa_id} - Obtener registros por empresa con paginación
   */
  async getByEmpresaPaginated(empresaId: string, filters?: ComprasFilters): Promise<ComprasPaginatedResponse> {
    const params = new URLSearchParams();
    if (filters?.periodo) params.append('periodo', filters.periodo);
    if (filters?.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get(`/accounting/compras/empresa/${empresaId}?${params.toString()}`);
    return response.data; // Retorna toda la respuesta con paginación
  },

  /**
   * GET /accounting/compras/{registro_id} - Obtener registro específico
   */
  async getById(registroId: string): Promise<RegistroCompraResponse> {
    const response = await api.get(`/accounting/compras/${registroId}`);
    return response.data;
  },

  /**
   * POST /accounting/compras/ - Crear nuevo registro
   */
  async create(registro: RegistroCompraCreate): Promise<RegistroCompraResponse> {
    const response = await api.post('/accounting/compras/', registro);
    return response.data;
  },

  /**
   * PUT /accounting/compras/{registro_id} - Actualizar registro
   */
  async update(registroId: string, registro: RegistroCompraUpdate): Promise<RegistroCompraResponse> {
    const response = await api.put(`/accounting/compras/${registroId}`, registro);
    return response.data;
  },

  /**
   * DELETE /accounting/compras/{registro_id} - Eliminar registro
   */
  async delete(registroId: string): Promise<void> {
    await api.delete(`/accounting/compras/${registroId}`);
  },

  /**
   * POST /accounting/compras/validar - Validar datos del registro
   */
  async validate(registro: RegistroCompraCreate): Promise<ValidationResult> {
    const response = await api.post('/accounting/compras/validar', registro);
    return response.data;
  },

  // Exportaciones y archivos PLE

  /**
   * POST /accounting/compras/export/ple - Exportar archivo PLE
   */
  async exportPLE(options: PLEComprasExportOptions): Promise<Blob> {
    const response = await api.post('/accounting/compras/export/ple', options, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * GET /accounting/compras/metadata/ple/{empresa_id}/{periodo} - Obtener metadatos PLE
   */
  async getPLEMetadata(empresaId: string, periodo: string): Promise<PLEComprasMetadata> {
    const response = await api.get(`/accounting/compras/metadata/ple/${empresaId}/${periodo}`);
    return response.data;
  },

  // Estadísticas y reportes

  /**
   * GET /accounting/compras/estadisticas/empresa/{empresa_id} - Estadísticas por empresa
   */
  async getEstadisticas(empresaId: string, fechaInicio?: string, fechaFin?: string): Promise<any> {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    
    const response = await api.get(`/accounting/compras/estadisticas/empresa/${empresaId}?${params.toString()}`);
    return response.data;
  },

  /**
   * GET /accounting/compras/proveedores/ranking/{empresa_id} - Ranking de proveedores
   */
  async getRankingProveedores(empresaId: string, limite?: number): Promise<any> {
    const params = new URLSearchParams();
    if (limite) params.append('limite', limite.toString());
    
    const response = await api.get(`/accounting/compras/proveedores/ranking/${empresaId}?${params.toString()}`);
    return response.data;
  },

  // Utilidades de exportación (métodos auxiliares)

  /**
   * Exportar a Excel (usando endpoint PLE con formato excel)
   */
  async exportExcel(options: PLEComprasExportOptions): Promise<Blob> {
    const excelOptions = { ...options, formato: 'excel' as const };
    return this.exportPLE(excelOptions);
  },

  /**
   * Crear y descargar archivo automáticamente
   */
  async downloadFile(blob: Blob, filename: string): Promise<void> {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

export default comprasApi;

// Exportar tipos para uso en otros archivos
export type { 
  ComprasFilters, 
  RegistroCompraResponse, 
  ComprasPaginatedResponse,
  RegistroCompraCreate,
  RegistroCompraUpdate,
  ValidationResult,
  PLEComprasExportOptions,
  PLEComprasMetadata,
  ComprasStats,
  ComprasResumenResponse
};
