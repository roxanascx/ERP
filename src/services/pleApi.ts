// Configuración base de la API - UNIFICADA
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
}e { PLEGeneracionData } from '../components/contabilidad/ple/components/PLEFormGeneracion';
import type { PLEArchivo } from '../components/contabilidad/ple/components/PLEArchivosTable';
import type { PLEEstadistica } from '../components/contabilidad/ple/components/PLEEstadisticas';
import type { PLEConfiguracion } from '../components/contabilidad/ple/components/PLEConfiguracion';
import type { ValidacionResultado, ValidacionEstadistica } from '../components/contabilidad/ple/components/PLEValidacionPanel';
import type { PLERegistro, PLEValidacion } from '../components/contabilidad/ple/components/PLEPreview';

// Configuración base de la API - UNIFICADA
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const PLE_BASE_PATH = '/api/v1/accounting/ple'; // Ruta unificada consistente

class ApiError extends Error {
  public status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Cliente HTTP base
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
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Si la respuesta es empty (204), retornar null
      if (response.status === 204) {
        return null as T;
      }

      const contentType = response.headers.get('content-type');
      
      // Si es un archivo ZIP o similar
      if (contentType?.includes('application/zip') || contentType?.includes('application/octet-stream')) {
        return response.blob() as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Error de red o parsing
      throw new ApiError(0, `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Tipos de respuesta de la API
export interface PLEGeneracionResponse {
  success: boolean;
  message: string;
  archivo_id: string;
  archivo_nombre: string;
  archivo_url?: string;
  total_registros: number;
  errores?: string[];
  advertencias?: string[];
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

export interface PLEValidacionResponse {
  success: boolean;
  resultados: ValidacionResultado[];
  estadisticas: ValidacionEstadistica;
}

// Servicio principal de PLE
export class PLEApiService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient(API_BASE_URL);
  }

  // Generar archivo PLE
  async generarPLE(data: PLEGeneracionData): Promise<PLEGeneracionResponse> {
    const payload = {
      ejercicio: data.ejercicio,
      mes: data.mes,
      ruc: data.ruc,
      razon_social: data.razonSocial,
      formato: "TXT",
      incluir_cabecera: data.incluirCierreEjercicio || false,
      validar_antes_generar: true,
      observaciones: data.observaciones || ""
    };

    return this.client.post<PLEGeneracionResponse>('/accounting/test/ple/generar', payload);
  }

  // Obtener preview de PLE
  async obtenerPreview(archivoId: string): Promise<PLEPreviewResponse> {
    return this.client.get<PLEPreviewResponse>(`/accounting/test/ple/preview/${archivoId}`);
  }

  // Validar datos de PLE
  async validarPLE(data: PLEGeneracionData): Promise<PLEValidacionResponse> {
    const payload = {
      ejercicio: data.ejercicio,
      mes: data.mes,
      ruc: data.ruc,
      razon_social: data.razonSocial,
      formato: "TXT",
      incluir_cabecera: data.incluirCierreEjercicio || false,
      validar_antes_generar: true,
      observaciones: data.observaciones || ""
    };

    return this.client.post<PLEValidacionResponse>('/accounting/test/ple/validar', payload);
  }

  // Obtener lista de archivos PLE generados
  async obtenerArchivos(filtros?: {
    ejercicio?: number;
    mes?: number;
    ruc?: string;
    limite?: number;
    offset?: number;
  }): Promise<PLEArchivo[]> {
    return this.client.get<PLEArchivo[]>('/accounting/test/ple/archivos', filtros);
  }

  // Descargar archivo PLE
  async descargarArchivo(archivoId: string): Promise<Blob> {
    return this.client.get<Blob>(`/accounting/test/ple/descargar/${archivoId}`);
  }

  // Eliminar archivo PLE
  async eliminarArchivo(archivoId: string): Promise<{ success: boolean; message: string }> {
    return this.client.delete(`/accounting/test/ple/archivos/${archivoId}`);
  }

  // Obtener estadísticas
  async obtenerEstadisticas(ejercicio: number, mes: number): Promise<PLEEstadistica> {
    return this.client.get<PLEEstadistica>(`/accounting/test/ple/estadisticas/${ejercicio}/${mes}`);
  }

  // Configuración
  async obtenerConfiguracion(): Promise<PLEConfiguracion> {
    return this.client.get<PLEConfiguracion>('/accounting/test/ple/configuracion');
  }

  async guardarConfiguracion(configuracion: PLEConfiguracion): Promise<{ success: boolean; message: string }> {
    return this.client.put('/accounting/test/ple/configuracion', configuracion);
  }

  // Funciones de utilidad para el manejo de errores
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

  // Funciones auxiliares para descargas
  static async downloadBlob(blob: Blob, filename: string): Promise<void> {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Función para manejar descarga de archivos
  async descargarYGuardarArchivo(archivoId: string, nombreArchivo: string): Promise<void> {
    try {
      const blob = await this.descargarArchivo(archivoId);
      await PLEApiService.downloadBlob(blob, nombreArchivo);
    } catch (error) {
      throw new Error(`Error al descargar archivo: ${PLEApiService.handleApiError(error)}`);
    }
  }

  // Función específica para descargar con nombre automático desde libro diario
  async descargarConNombreAutomatico(
    libroId: string, 
    ruc: string, 
    periodo: string, 
    formato: 'txt' | 'zip' = 'zip',
    opciones?: any
  ): Promise<void> {
    try {
      // Generar PLE primero
      const generacionData = {
        ejercicio: parseInt(periodo.slice(0, 4)),
        mes: parseInt(periodo.slice(4, 6)),
        ruc: ruc,
        razonSocial: 'Empresa',
        fechaInicio: `${periodo.slice(0, 4)}-${periodo.slice(4, 6)}-01`,
        fechaFin: `${periodo.slice(0, 4)}-${periodo.slice(4, 6)}-31`,
        incluirCierreEjercicio: false,
        observaciones: `Generado desde libro ${libroId}`
      };

      const resultado = await this.generarPLE(generacionData);
      
      if (resultado.success && resultado.archivo_url) {
        // Generar nombre automático
        const nombreArchivo = `LE${ruc}${periodo}030100${formato === 'zip' ? '1' : '0'}11.${formato}`;
        
        // Descargar archivo
        const response = await fetch(resultado.archivo_url);
        const blob = await response.blob();
        await PLEApiService.downloadBlob(blob, nombreArchivo);
      } else {
        throw new Error(resultado.message || 'Error al generar el archivo PLE');
      }
    } catch (error) {
      throw new Error(`Error al descargar archivo: ${PLEApiService.handleApiError(error)}`);
    }
  }
}

// Instancia singleton del servicio
export const pleApiService = new PLEApiService();

// Exportar tipos importantes
export type { ApiError };
