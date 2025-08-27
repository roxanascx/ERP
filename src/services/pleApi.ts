// ========================================
// PLE API SERVICE - VERSIÓN UNIFICADA Y SINCRONIZADA
// ========================================
// Sincronizado 100% con el backend unificado
// Elimina duplicaciones entre endpoints de prueba y producción

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const PLE_BASE_PATH = '/api/v1/accounting/ple'; // Ruta unificada consistente

// ========================================
// TIPOS UNIFICADOS - SINCRONIZADOS CON BACKEND
// ========================================

export interface PLEGeneracionData {
  libro_diario_id: string;      // ID del libro diario (requerido)
  ejercicio: number;           
  mes: number;                 
  validar_antes_generar?: boolean;  // Consistente con backend
  incluir_metadatos?: boolean;      // Consistente con backend
  generar_zip?: boolean;            // Consistente con backend
  directorio_salida?: string;       // Opcional
  observaciones?: string;           // Consistente con backend
}

export interface PLEArchivo {
  id: string;
  nombre_archivo: string;
  ejercicio: number;
  mes: number;
  fecha_generacion: string;
  estado: string;
  tamano_archivo: number;
  total_registros: number;
  ruc_empresa: string;
  razon_social: string;
  observaciones?: string;
  errores: string[];
}

export interface PLEEstadistica {
  total_archivos: number;
  archivos_pendientes: number;
  errores_recientes: number;
  ultimo_periodo: {
    ejercicio: number;
    mes: number;
  };
}

export interface PLEConfiguracion {
  formatos_soportados: string[];
  validaciones_disponibles: string[];
  tipos_exportacion: string[];
  configuracion_default: {
    validar_antes_generar: boolean;
    incluir_metadatos: boolean;
    generar_zip: boolean;
    formato: string;
  };
}

export interface ValidacionResultado {
  tipo: 'error' | 'warning' | 'info' | 'success';
  campo: string;
  mensaje: string;
  detalle?: string;
}

export interface ValidacionEstadistica {
  total_validaciones: number;
  exitosas: number;
  con_warnings: number;
  con_errores: number;
}

export interface PLERegistro {
  linea: number;
  contenido: string;
  campos: string[];
}

export interface PLEValidacion {
  campo: string;
  valor: string;
  valido: boolean;
  mensaje?: string;
}

// ========================================
// TIPOS DE RESPUESTA API UNIFICADOS
// ========================================

export interface PLEGeneracionResponse {
  success: boolean;
  archivo_id: string;
  archivo_nombre: string;
  mensaje: string;
  total_registros: number;
  errores: string[];
  advertencias: string[];
  metadata?: {
    ejercicio: number;
    mes: number;
    fecha_generacion: string;
    tamaño_txt: number;
    tamaño_zip: number;
  };
}

export interface PLEValidacionResponse {
  success: boolean;
  resultados: ValidacionResultado[];
  estadisticas: ValidacionEstadistica;
}

export interface PLEPreviewResponse {
  success: boolean;
  archivo: {
    nombre: string;
    ejercicio: number;
    mes: number;
    ruc: string;
    totalRegistros: number;
  };
  registros: PLERegistro[];
  validaciones: PLEValidacion[];
}

// ========================================
// CLIENTE HTTP UNIFICADO
// ========================================

class ApiError extends Error {
  status?: number;
  details?: any;

  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 [PLE API] ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorDetails;
        
        try {
          errorDetails = JSON.parse(errorText);
        } catch {
          errorDetails = { detail: errorText };
        }

        throw new ApiError(
          errorDetails.detail || `HTTP ${response.status}`,
          response.status,
          errorDetails
        );
      }

      const data = await response.json();
      console.log(`✅ [PLE API] Response:`, data);
      return data;
      
    } catch (error) {
      console.error(`❌ [PLE API] Error:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// ========================================
// SERVICIO PRINCIPAL PLE UNIFICADO
// ========================================

export class PLEApiService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient(API_BASE_URL);
  }

  // Generar archivo PLE - ENDPOINT UNIFICADO
  async generarPLE(data: PLEGeneracionData): Promise<PLEGeneracionResponse> {
    // Payload sincronizado con backend unificado
    const payload = {
      libro_diario_id: data.libro_diario_id,
      ejercicio: data.ejercicio,
      mes: data.mes,
      validar_antes_generar: data.validar_antes_generar ?? true,
      incluir_metadatos: data.incluir_metadatos ?? true,
      generar_zip: data.generar_zip ?? true,
      directorio_salida: data.directorio_salida,
      observaciones: data.observaciones || ""
    };

    return this.client.post<PLEGeneracionResponse>(`${PLE_BASE_PATH}/generar`, payload);
  }

  // Validar datos de PLE - ENDPOINT UNIFICADO
  async validarPLE(data: PLEGeneracionData): Promise<PLEValidacionResponse> {
    const payload = {
      libro_diario_id: data.libro_diario_id,
      validar_estructura: true,
      validar_balanceo: true,
      validar_sunat: true
    };

    return this.client.post<PLEValidacionResponse>(`${PLE_BASE_PATH}/validar`, payload);
  }

  // Obtener preview de PLE - ENDPOINT UNIFICADO
  async obtenerPreview(archivoId: string, maxLineas: number = 10): Promise<PLEPreviewResponse> {
    return this.client.get<PLEPreviewResponse>(`${PLE_BASE_PATH}/preview/${archivoId}`, {
      max_lineas: maxLineas
    });
  }

  // Obtener lista de archivos PLE - ENDPOINT UNIFICADO
  async obtenerArchivos(filtros?: {
    empresa_id?: string;
    ejercicio?: number;
    mes?: number;
    limit?: number;
    offset?: number;
  }): Promise<PLEArchivo[]> {
    return this.client.get<PLEArchivo[]>(`${PLE_BASE_PATH}/archivos`, filtros);
  }

  // Descargar archivo PLE - ENDPOINT UNIFICADO
  async descargarArchivo(archivoId: string, formato: 'txt' | 'zip' = 'zip'): Promise<Blob> {
    const url = `${API_BASE_URL}${PLE_BASE_PATH}/descargar/${archivoId}?formato=${formato}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new ApiError(`Error descargando archivo: ${response.statusText}`, response.status);
    }
    
    return response.blob();
  }

  // Eliminar archivo PLE - ENDPOINT UNIFICADO
  async eliminarArchivo(archivoId: string): Promise<{ success: boolean; message: string }> {
    return this.client.delete(`${PLE_BASE_PATH}/archivos/${archivoId}`);
  }

  // Obtener estadísticas - ENDPOINT UNIFICADO
  async obtenerEstadisticas(empresaId?: string, ejercicio?: number): Promise<PLEEstadistica> {
    return this.client.get<PLEEstadistica>(`${PLE_BASE_PATH}/estadisticas`, {
      empresa_id: empresaId,
      ejercicio: ejercicio
    });
  }

  // Obtener configuración - ENDPOINT UNIFICADO
  async obtenerConfiguracion(): Promise<PLEConfiguracion> {
    return this.client.get<PLEConfiguracion>(`${PLE_BASE_PATH}/configuracion`);
  }

  // Health check del módulo PLE
  async healthCheck(): Promise<{ status: string; module: string; version: string }> {
    return this.client.get<{ status: string; module: string; version: string }>(`${PLE_BASE_PATH}/healthcheck`);
  }

  // Manejo unificado de errores
  static handleApiError(error: unknown): string {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400:
          return 'Datos inválidos. Por favor, revisa la información ingresada.';
        case 401:
          return 'No tienes autorización para realizar esta operación.';
        case 403:
          return 'No tienes permisos suficientes.';
        case 404:
          return 'El recurso solicitado no fue encontrado.';
        case 422:
          return 'Error de validación en los datos enviados.';
        case 500:
          return 'Error interno del servidor. Por favor, intenta más tarde.';
        default:
          return error.message;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Error desconocido. Por favor, intenta más tarde.';
  }
}

// ========================================
// INSTANCIA SINGLETON EXPORTADA
// ========================================

export const pleApiService = new PLEApiService();

// Exportar tipos y clases importantes
export type { ApiError };
export { ApiClient };

// Funciones de utilidad
export const PLEUtils = {
  formatearNombreArchivo: (ruc: string, ejercicio: number, mes: number): string => {
    return `LE${ruc}${ejercicio}${mes.toString().padStart(2, '0')}00140100001111.txt`;
  },
  
  validarRUC: (ruc: string): boolean => {
    return /^\d{11}$/.test(ruc);
  },
  
  validarPeriodo: (ejercicio: number, mes: number): boolean => {
    const currentYear = new Date().getFullYear();
    return ejercicio >= 2000 && ejercicio <= currentYear && mes >= 1 && mes <= 12;
  }
};
