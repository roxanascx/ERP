// Servicio API para Socios de Negocio
import api from './api';

// Tipos para Socios de Negocio
export interface SocioNegocio {
  id: string;
  tipo_documento: 'RUC' | 'DNI' | 'CE';
  numero_documento: string;
  razon_social: string;
  nombre_comercial?: string;
  tipo_socio: 'proveedor' | 'cliente' | 'ambos';
  categoria?: string;
  estado_sunat?: string;
  condicion_sunat?: string;
  tipo_contribuyente?: string;
  fecha_inscripcion?: string;
  actividad_economica?: string;
  direccion?: string;
  ubigeo?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  contacto_principal?: string;
  moneda_preferida?: string;
  condicion_pago?: string;
  limite_credito?: number;
  activo: boolean;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  ultimo_sync_sunat?: string;
  datos_sunat_disponibles: boolean;
}

export interface SocioNegocioCreate {
  tipo_documento: 'RUC' | 'DNI' | 'CE';
  numero_documento: string;
  razon_social: string;
  nombre_comercial?: string;
  tipo_socio: 'proveedor' | 'cliente' | 'ambos';
  categoria?: string;
  direccion?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  contacto_principal?: string;
  moneda_preferida?: string;
  condicion_pago?: string;
  limite_credito?: number;
  observaciones?: string;
}

export interface SocioNegocioUpdate {
  razon_social?: string;
  nombre_comercial?: string;
  tipo_socio?: 'proveedor' | 'cliente' | 'ambos';
  categoria?: string;
  direccion?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  contacto_principal?: string;
  moneda_preferida?: string;
  condicion_pago?: string;
  limite_credito?: number;
  activo?: boolean;
  observaciones?: string;
}

export interface SocioListResponse {
  socios: SocioNegocio[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface SocioStatsResponse {
  total_socios: number;
  total_proveedores: number;
  total_clientes: number;
  total_ambos: number;
  total_activos: number;
  total_inactivos: number;
  total_con_ruc: number;
  total_sincronizados_sunat: number;
}

export interface ConsultaRucRequest {
  ruc: string;
}

export interface DatosSunat {
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  tipo_contribuyente: string;
  estado_contribuyente: string;
  condicion_contribuyente: string;
  domicilio_fiscal: string;
  actividad_economica: string;
  fecha_inscripcion: string;
  ubigeo?: string;
}

export interface ConsultaRucResponse {
  success: boolean;
  ruc: string;
  data?: DatosSunat;
  error?: string;
  timestamp: string;
}

export interface SocioCreateFromRucRequest {
  empresa_id: string;
  ruc: string;
  tipo_socio: 'proveedor' | 'cliente' | 'ambos';
}

// Filtros para búsqueda
export interface SocioFilters {
  tipo_socio?: 'proveedor' | 'cliente' | 'ambos';
  tipo_documento?: 'RUC' | 'DNI' | 'CE';
  activo?: boolean;
  limit?: number;
  offset?: number;
}

export interface SocioSearchFilters extends SocioFilters {
  q: string;
}

class SociosNegocioApi {
  private baseURL = '/api/v1/socios-negocio';

  // Crear socio
  async createSocio(empresaId: string, data: SocioNegocioCreate): Promise<SocioNegocio> {
    const response = await api.post(`${this.baseURL}/`, data, {
      params: { empresa_id: empresaId }
    });
    return response.data;
  }

  // Obtener socio por ID
  async getSocio(id: string): Promise<SocioNegocio> {
    const response = await api.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  // Actualizar socio
  async updateSocio(id: string, data: SocioNegocioUpdate): Promise<SocioNegocio> {
    const response = await api.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  // Eliminar socio
  async deleteSocio(id: string): Promise<void> {
    await api.delete(`${this.baseURL}/${id}`);
  }

  // Listar socios con filtros y paginación
  async listSocios(empresaId: string, filters?: SocioFilters): Promise<SocioListResponse> {
    const params = {
      empresa_id: empresaId,
      ...filters
    };
    const response = await api.get(`${this.baseURL}/`, { params });
    return response.data;
  }

  // Buscar socios por texto
  async searchSocios(empresaId: string, filters: SocioSearchFilters): Promise<SocioListResponse> {
    const params = {
      empresa_id: empresaId,
      ...filters
    };
    const response = await api.get(`${this.baseURL}/search/query`, { params });
    return response.data;
  }

  // Obtener estadísticas
  async getStats(empresaId: string): Promise<SocioStatsResponse> {
    const response = await api.get(`${this.baseURL}/stats/empresa`, {
      params: { empresa_id: empresaId }
    });
    return response.data;
  }

  // Consultar RUC en SUNAT
  async consultarRuc(ruc: string): Promise<ConsultaRucResponse> {
    const response = await api.post(`${this.baseURL}/consulta-ruc`, { ruc });
    return response.data;
  }

  // Crear socio desde consulta RUC
  async createSocioFromRuc(data: SocioCreateFromRucRequest): Promise<SocioNegocio> {
    const response = await api.post(`${this.baseURL}/crear-desde-ruc`, data);
    return response.data;
  }

  // Sincronizar socio con SUNAT
  async syncSocioWithSunat(id: string): Promise<SocioNegocio> {
    const response = await api.post(`${this.baseURL}/${id}/sync-sunat`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; module: string; version: string }> {
    const response = await api.get(`${this.baseURL}/health`);
    return response.data;
  }
}

export const sociosNegocioApi = new SociosNegocioApi();
export default sociosNegocioApi;
