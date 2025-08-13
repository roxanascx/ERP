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
    // Aquí podríamos agregar tokens de autenticación si fuera necesario
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
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