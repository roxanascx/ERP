// Types para el módulo de empresas
// Coincide con los schemas del backend

export interface Empresa {
  id?: string;
  ruc: string;
  razon_social: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activa: boolean;
  
  // Credenciales SIRE
  sire_client_id?: string;
  sire_client_secret?: string;
  sunat_usuario?: string;
  sunat_clave?: string;
  sire_activo: boolean;
  
  // Credenciales adicionales
  sunat_usuario_secundario?: string;
  sunat_clave_secundaria?: string;
  sistema_bancario?: string;
  banco_usuario?: string;
  banco_clave?: string;
  pdt_usuario?: string;
  pdt_clave?: string;
  plame_usuario?: string;
  plame_clave?: string;
  
  // Configuraciones
  configuraciones?: Record<string, any>;
  notas_internas?: string;
  
  // Timestamps
  fecha_registro?: string;
  fecha_actualizacion?: string;
}

// Helper functions
export const tieneSire = (empresa: Empresa): boolean => {
  return !!(
    empresa.sire_activo &&
    empresa.sire_client_id &&
    empresa.sire_client_secret &&
    empresa.sunat_usuario &&
    empresa.sunat_clave
  );
};

export interface EmpresaCreate {
  ruc: string;
  razon_social: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface EmpresaUpdate {
  razon_social?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activa?: boolean;
  notas_internas?: string;
}

export interface SireConfig {
  client_id: string;
  client_secret: string;
  sunat_usuario: string;
  sunat_clave: string;
}

export interface SireCredentials {
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
  endpoint_url: string;
  metodo: 'original' | 'migrado';
  ruc?: string;
}

export interface EmpresaApiResponse {
  success: boolean;
  data?: Empresa | Empresa[];
  message?: string;
  error?: string;
}

export interface EmpresaListResponse {
  empresas: Empresa[];
  total: number;
  page: number;
  limit: number;
}

// Estados de la aplicación
export interface EmpresaState {
  empresas: Empresa[];
  empresaActual: Empresa | null;
  loading: boolean;
  error: string | null;
}

// Props para componentes
export interface EmpresaCardProps {
  empresa: Empresa;
  onSelect?: (empresa: Empresa) => void;
  onEdit?: (empresa: Empresa) => void;
  onDelete?: (ruc: string) => void;
  onConfigSire?: (empresa: Empresa) => void;
  isSelected?: boolean;
}

export interface EmpresaFormProps {
  empresa?: Empresa;
  onSubmit: (data: EmpresaCreate | EmpresaUpdate) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface SireConfigProps {
  empresa: Empresa;
  onSave: (config: SireConfig) => void;
  onCancel: () => void;
  loading?: boolean;
}
