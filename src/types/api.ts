// Tipos para las respuestas de la API

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  database?: string;
}

export interface ApiInfoResponse {
  message: string;
  version: string;
  database?: string;
  docs: string;
  status: string;
}

export interface TestDatabaseResponse {
  status: 'success' | 'error';
  message: string;
  ping_response?: any;
  database_name?: string;
}

export interface HelloResponse {
  message: string;
  status: string;
  database: string;
  framework: string;
}

// Estados de conexión
export interface BackendConnectionStatus {
  apiInfo: ApiInfoResponse | null;
  healthCheck: HealthCheckResponse | null;
  testDb: TestDatabaseResponse | null;
  status: 'connected' | 'disconnected';
}
