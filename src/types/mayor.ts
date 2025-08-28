/**
 * Tipos TypeScript para el módulo de Libro Mayor
 * Consultas de movimientos contables y saldos acumulados
 */

// Filtros para consultas del Libro Mayor
export interface MayorFilters {
  cuenta_codigo?: string;      // Código de cuenta específica
  cuenta_nombre?: string;      // Nombre de cuenta (búsqueda parcial)
  fecha_inicio?: string;       // Fecha inicio (YYYY-MM-DD)
  fecha_fin?: string;          // Fecha fin (YYYY-MM-DD)
  periodo?: string;            // Período específico (YYYYMM)
  nivel_cuenta?: number;       // Nivel de cuenta (1,2,3,4,5)
  solo_con_movimientos?: boolean; // Solo cuentas con movimientos
  incluir_subcuentas?: boolean;   // Incluir movimientos de subcuentas
}

// Movimiento individual del Libro Mayor
export interface MayorMovimiento {
  id: string;
  fecha: string;               // Fecha del movimiento
  numero_asiento: string;      // Número del asiento contable
  cuenta_codigo: string;       // Código de la cuenta
  cuenta_nombre: string;       // Nombre de la cuenta
  debe: number;                // Monto debe
  haber: number;               // Monto haber
  saldo_acumulado: number;     // Saldo acumulado hasta este movimiento
  glosa: string;               // Descripción del movimiento
  documento_tipo?: string;     // Tipo de documento origen
  documento_numero?: string;   // Número de documento origen
  tercero_documento?: string;  // RUC/DNI del tercero
  tercero_nombre?: string;     // Nombre del tercero
  centro_costo?: string;       // Centro de costo
  referencia?: string;         // Referencia adicional
}

// Resumen de saldos del Libro Mayor
export interface MayorSummary {
  cuenta_codigo: string;
  cuenta_nombre: string;
  saldo_inicial: number;       // Saldo al inicio del período
  total_debe: number;          // Total cargos en el período
  total_haber: number;         // Total abonos en el período
  saldo_final: number;         // Saldo al final del período
  cantidad_movimientos: number; // Cantidad de movimientos
  fecha_primer_movimiento?: string;
  fecha_ultimo_movimiento?: string;
}

// Opciones de exportación
export interface MayorExportOptions {
  cuenta_codigo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  formato: 'excel' | 'pdf';
  incluir_subcuentas: boolean;
  agrupar_por_mes: boolean;
  mostrar_saldos_acumulados: boolean;
}

// Resultado de exportación
export interface MayorExportResult {
  filename: string;
  download_url: string;
  total_movimientos: number;
  fecha_generacion: string;
}

// Cuenta contable para listas desplegables
export interface CuentaContable {
  codigo: string;
  nombre: string;
  nivel: number;
  padre?: string;
  activa: boolean;
  naturaleza: 'deudor' | 'acreedor';
  tipo: 'detalle' | 'titulo';
}

// Período disponible
export interface PeriodoDisponible {
  codigo: string;              // YYYYMM
  nombre: string;              // "Enero 2024"
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}
