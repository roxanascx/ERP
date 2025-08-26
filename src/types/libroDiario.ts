// Tipos para el módulo de Libro Diario

// Detalle de cada línea en un asiento contable
export interface DetalleAsiento {
  codigoCuenta: string;
  denominacionCuenta: string;
  descripcion: string;
  debe?: number;
  haber?: number;
}

export interface AsientoContable {
  id: string;
  numero: string; // Número correlativo del asiento
  fecha: string; // YYYY-MM-DD format
  descripcion: string; // Glosa o descripción del asiento
  detalles: DetalleAsiento[];
  
  // Campos adicionales para validación
  empresaId?: string;
  libroId?: string;
  usuarioCreacion?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

export interface LibroDiario {
  id?: string;
  empresaId: string;
  descripcion: string; // Descripción del libro diario
  periodo: string; // Formato: "YYYY-MM" o "YYYY"
  ruc: string;
  razonSocial: string;
  asientos: AsientoContable[];
  
  // Totales calculados
  totalDebe: number;
  totalHaber: number;
  
  // Metadatos
  fechaCreacion?: string;
  fechaModificacion?: string;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
  
  // Estado del libro
  estado: 'borrador' | 'finalizado' | 'enviado';
  
  // Información adicional para reportes
  moneda?: string;
  tipoLibro?: string; // "5.1" para Libro Diario
}

export interface FiltrosLibroDiario {
  empresaId?: string;
  periodo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: 'borrador' | 'finalizado' | 'enviado';
  busqueda?: string; // Para buscar por glosa o número de documento
  cuentaContable?: string;
}

export interface ResumenLibroDiario {
  totalLibros: number;
  totalAsientos: number;
  totalDebe: number;
  totalHaber: number;
  diferencia: number; // Debe - Haber (debería ser 0)
  balanceado: boolean;
  periodos: string[];
  ultimaModificacion: string;
  asientosPorEstado: {
    borrador: number;
    finalizado: number;
    enviado: number;
  };
  ultimoLibro?: {
    id: string;
    descripcion: string;
    fechaCreacion: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  asientosSinBalancear: string[]; // números correlativos
}

export interface ExportOptions {
  formato: 'excel' | 'pdf' | 'txt';
  incluirTotales: boolean;
  incluirResumen: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
}

// Para el autocompletado de cuentas contables
export interface CuentaContableLookup {
  codigo: string;
  denominacion: string;
  naturaleza: 'DEUDORA' | 'ACREEDORA' | 'DEUDORA/ACREEDORA';
  nivel: number;
  activa: boolean;
}
