// Types para el módulo de contabilidad
export interface CuentaContable {
  id: string;
  codigo: string;
  descripcion: string;
  nivel: number;
  clase_contable: number;
  grupo?: string;
  subgrupo?: string;
  cuenta_padre?: string;
  es_hoja: boolean;
  acepta_movimiento: boolean;
  naturaleza: 'DEUDORA' | 'ACREEDORA';
  moneda: 'MN' | 'ME';
  activa: boolean;
  tiene_hijos?: boolean;
  fecha_creacion: string;
  fecha_modificacion?: string;
}

export interface CuentaContableCreate {
  codigo: string;
  descripcion: string;
  nivel: number;
  clase_contable: number;
  grupo?: string;
  subgrupo?: string;
  cuenta_padre?: string;
  es_hoja?: boolean;
  acepta_movimiento?: boolean;
  naturaleza?: 'DEUDORA' | 'ACREEDORA';
  moneda?: 'MN' | 'ME';
  activa?: boolean;
}

export interface ClaseContable {
  clase: number;
  descripcion: string;
  total_cuentas: number;
  cuentas?: CuentaContable[];
}

export interface EstadisticasPlanContable {
  total_cuentas: number;
  cuentas_activas: number;
  cuentas_inactivas: number;
  por_clase: ClaseContable[];
  por_nivel: Array<{
    nivel: number;
    nombre: string;
    descripcion: string;
    total_cuentas: number;
  }>;
}

export interface EstructuraJerarquica {
  codigo: string;
  descripcion: string;
  nivel: number;
  es_hoja?: boolean;
  hijos: EstructuraJerarquica[];
}

export interface EstructuraResponse {
  estructura: EstructuraJerarquica[];
  total_clases: number;
}

// Filtros para búsquedas
export interface FiltrosCuentas {
  activos_solo?: boolean;
  clase_contable?: number;
  nivel?: number;
  busqueda?: string;
}

// Estados de la UI
export interface ContabilidadUIState {
  loading: boolean;
  error: string | null;
  selectedCuenta: CuentaContable | null;
  showModal: boolean;
  modalMode: 'create' | 'edit' | 'view';
}

// Para futuras implementaciones
export interface AsientoContable {
  id: string;
  numero: number;
  fecha: string;
  descripcion: string;
  debe: number;
  haber: number;
  estado: 'BORRADOR' | 'CONFIRMADO' | 'ANULADO';
  movimientos: MovimientoContable[];
}

export interface MovimientoContable {
  id: string;
  cuenta_codigo: string;
  cuenta_descripcion: string;
  debe: number;
  haber: number;
  descripcion?: string;
}

// Módulos del sistema contable
export type ModuloContabilidad = 
  | 'plan-contable'
  | 'libro-diario' 
  | 'libro-mayor'
  | 'balance-comprobacion'
  | 'estados-financieros'
  | 'registro-ventas'
  | 'registro-compras'
  | 'activos-fijos';

export interface LibroContableConfig {
  modulo: ModuloContabilidad;
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  ruta: string;
  implementado: boolean;
}
