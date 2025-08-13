import axios from 'axios';
import type { 
  Empresa, 
  EmpresaCreate, 
  EmpresaUpdate, 
  SireConfig, 
  SireCredentials
} from '../types/empresa';

// Configurar la URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/companies`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar headers de autenticación si es necesario
apiClient.interceptors.request.use((config) => {
  // Aquí puedes agregar tokens de autenticación si los necesitas
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class EmpresaApiService {
  
  // ============================================
  // CRUD BÁSICO DE EMPRESAS
  // ============================================
  
  /**
   * Obtener todas las empresas
   */
  static async getEmpresas(): Promise<Empresa[]> {
    try {
      const response = await apiClient.get<{
        companies: Empresa[];
        total: number;
        total_con_sire: number;
        empresa_actual: string | null;
      }>('/');
      
      // Extraer solo el array de companies
      return response.data.companies;
    } catch (error) {
      console.error('Error obteniendo empresas:', error);
      throw new Error('Error al cargar las empresas');
    }
  }
  
  /**
   * Obtener una empresa por RUC
   */
  static async getEmpresaByRuc(ruc: string): Promise<Empresa> {
    try {
      const response = await apiClient.get<Empresa>(`/${ruc}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo empresa:', error);
      throw new Error(`Error al cargar la empresa ${ruc}`);
    }
  }
  
  /**
   * Crear una nueva empresa
   */
  static async createEmpresa(data: EmpresaCreate): Promise<Empresa> {
    try {
      const response = await apiClient.post<Empresa>('/', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creando empresa:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.status === 400) {
        const detail = error.response.data?.detail || 'Error de validación';
        throw new Error(detail);
      }
      
      throw new Error('Error al crear la empresa');
    }
  }
  
  /**
   * Actualizar una empresa
   */
  static async updateEmpresa(ruc: string, data: EmpresaUpdate): Promise<Empresa> {
    try {
      const response = await apiClient.put<Empresa>(`/${ruc}`, data);
      return response.data;
    } catch (error) {
      console.error('Error actualizando empresa:', error);
      throw new Error('Error al actualizar la empresa');
    }
  }
  
  /**
   * Eliminar una empresa (soft delete)
   */
  static async deleteEmpresa(ruc: string): Promise<void> {
    try {
      await apiClient.delete(`/${ruc}`);
    } catch (error) {
      console.error('Error eliminando empresa:', error);
      throw new Error('Error al eliminar la empresa');
    }
  }
  
  // ============================================
  // GESTIÓN SIRE
  // ============================================
  
  /**
   * Configurar credenciales SIRE para una empresa
   */
  static async configurarSire(ruc: string, config: SireConfig): Promise<Empresa> {
    try {
      console.log('🔐 Configurando SIRE para empresa:', ruc);
      console.log('📝 Datos de configuración SIRE:', config);
      console.log('🌐 URL del endpoint:', `/${ruc}/sire`);
      
      const response = await apiClient.post<Empresa>(`/${ruc}/sire`, config);
      console.log('✅ SIRE configurado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error configurando SIRE:', error);
      console.error('📊 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        sentData: error.config?.data
      });
      throw new Error(`Error al configurar SIRE: ${error.response?.data?.detail || error.message}`);
    }
  }
  
  /**
   * Obtener credenciales SIRE de una empresa
   */
  static async getCredencialesSire(
    ruc: string, 
    metodo: 'original' | 'migrado' = 'original'
  ): Promise<SireCredentials> {
    try {
      const response = await apiClient.get<SireCredentials>(`/${ruc}/sire/credentials`, {
        params: { metodo }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo credenciales SIRE:', error);
      throw new Error('Error al obtener credenciales SIRE');
    }
  }
  
  /**
   * Verificar estado SIRE de una empresa
   */
  static async verificarEstadoSire(ruc: string): Promise<{ activo: boolean; configurado: boolean }> {
    try {
      const response = await apiClient.get(`/${ruc}/sire/status`);
      return response.data;
    } catch (error) {
      console.error('Error verificando estado SIRE:', error);
      throw new Error('Error al verificar estado SIRE');
    }
  }
  
  // ============================================
  // GESTIÓN MULTI-EMPRESA
  // ============================================
  
  /**
   * Seleccionar empresa activa
   */
  static async seleccionarEmpresa(ruc: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(`/${ruc}/select`);
      return response.data;
    } catch (error) {
      console.error('Error seleccionando empresa:', error);
      throw new Error('Error al seleccionar empresa');
    }
  }
  
  /**
   * Obtener empresa actualmente seleccionada
   */
  static async getEmpresaActual(): Promise<Empresa | null> {
    try {
      const response = await apiClient.get<{
        empresa_seleccionada: boolean;
        ruc: string | null;
        razon_social: string | null;
        sire_activo: boolean;
        tiene_sire: boolean;
      }>('/current/info');
      
      // Si no hay empresa seleccionada, retornar null
      if (!response.data.empresa_seleccionada || !response.data.ruc) {
        return null;
      }
      
      // Convertir a formato Empresa
      return {
        ruc: response.data.ruc,
        razon_social: response.data.razon_social || '',
        direccion: '',
        telefono: '',
        email: '',
        activa: true,
        sire_activo: response.data.sire_activo,
        sire_client_id: '',
        sire_client_secret: '',
        sunat_usuario: '',
        sunat_clave: '',
        fecha_registro: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 400) {
        return null; // No hay empresa seleccionada
      }
      console.error('Error obteniendo empresa actual:', error);
      throw new Error('Error al obtener empresa actual');
    }
  }
  
  /**
   * Obtener resumen de configuración
   */
  static async getResumenConfiguracion(): Promise<{
    total: number;
    con_sire: number;
    empresa_actual: Empresa | null;
  }> {
    try {
      const response = await apiClient.get('/summary');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo resumen:', error);
      throw new Error('Error al obtener resumen de configuración');
    }
  }
}

// Exportar también como default
export default EmpresaApiService;
