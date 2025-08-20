import axios from 'axios';

// Configuración base de Axios
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación (si es necesario en el futuro)
apiClient.interceptors.request.use(
  (config) => {
    // Log detallado para debugging
    console.log('🚀 [API] Petición saliente:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      params: config.params,
      data: config.data
    });
    
    // Aquí podríamos agregar tokens de autenticación si fuera necesario
    return config;
  },
  (error) => {
    console.error('🚀 [API] Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas
apiClient.interceptors.response.use(
  (response) => {
    // Log respuestas exitosas
    console.log('📨 [API] Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log errores detallado
    console.error('📨 [API] Error en respuesta:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      responseData: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Servicios de la API
export const apiService = {
  // Health check
  healthCheck: () => apiClient.get('/health'),
  
  // Prueba de conexión con base de datos
  testDatabase: () => apiClient.get('/test-db'),
  
  // Hola mundo
  hello: () => apiClient.get('/hola'),
  
  // Información general del API
  getApiInfo: () => apiClient.get('/'),

  // Servicios de usuarios
  users: {
    // Obtener todos los usuarios
    getAll: (skip = 0, limit = 100) => 
      apiClient.get(`/api/users?skip=${skip}&limit=${limit}`),
    
    // Obtener usuario por Clerk ID
    getByClerkId: (clerkId: string) => 
      apiClient.get(`/api/users/clerk/${clerkId}`),
    
    // Sincronizar usuario desde Clerk
    sync: (userData: any) => 
      apiClient.post('/api/users/sync-user', userData),
    
    // Obtener usuario actual
    getCurrentUser: (clerkUserId: string) => 
      apiClient.get('/api/users/me', {
        headers: {
          'X-Clerk-User-Id': clerkUserId
        }
      }),
    
    // Actualizar usuario
    update: (clerkId: string, userData: any) =>
      apiClient.put(`/api/users/clerk/${clerkId}`, userData),
    
    // Eliminar usuario
    delete: (clerkId: string) =>
      apiClient.delete(`/api/users/clerk/${clerkId}`)
  }
};

export default apiClient;