/**
 * Tipos TypeScript para el módulo de Registro de Ventas
 * Basado en especificaciones PLE 140000 SUNAT
 */

// Tipos para valores oficiales SUNAT (alineados con TipoComprobanteVenta /
// TipoDocumentoCliente / EstadoOperacionVenta en schemas_ventas.py)
export type TipoComprobanteVenta =
  | "01" // FACTURA
  | "03" // BOLETA
  | "04" // LIQUIDACION_COMPRA
  | "05" // TICKET
  | "07" // NOTA_CREDITO
  | "08" // NOTA_DEBITO
  | "09" // GUIA_REMISION
  | "11" // COMPROBANTE_PERCEPCION
  | "12" // COMPROBANTE_DETRACCION
  | "13" // BOLETO_AVIACION_COMERCIAL
  | "14" // COMPROBANTE_SCOP
  | "19" // POLIZA_SEGURO
  | "20"; // COMPROBANTE_RETENCION

export type TipoDocumentoCliente =
  | "0"  // SIN_DOCUMENTO
  | "1"  // DNI
  | "4"  // CARNET_EXTRANJERIA
  | "6"  // RUC
  | "7"  // PASAPORTE
  | "11" // CEDULA_DIPLOMATICA
  | "A"; // DOCUMENTO_TRIBUTARIO

export type EstadoOperacionVenta =
  | 1  // VIGENTE
  | 8  // ANULADO
  | 9; // ANULADO_POR_OTRO_DOCUMENTO

// Interfaces principales
// Alineadas con RegistroVentaRequest/Response en schemas_ventas.py
export interface RegistroVentaRequest {
  tipo_documento_cliente: TipoDocumentoCliente;
  numero_documento_cliente: string;
  razon_social_cliente: string;

  tipo_comprobante: TipoComprobanteVenta;
  serie_comprobante?: string;
  numero_comprobante: string;
  numero_final_rango?: string;
  fecha_emision: string;               // DD/MM/YYYY
  fecha_vencimiento?: string;

  // Montos según PLE 140000
  valor_facturado_exportacion: number;
  base_imponible_gravada: number;
  descuento_base_imponible: number;
  igv_ipm: number;
  descuento_igv_ipm: number;
  importe_exonerado: number;
  importe_inafecto: number;
  isc: number;
  base_imponible_ivap: number;
  ivap: number;
  otros_tributos_cargos: number;
  importe_total: number;

  // Campos adicionales
  codigo_moneda: string;
  tipo_cambio: number;
  fecha_emision_detraccion?: string;
  numero_constancia_detraccion?: string;
  indicador_servicio_gravado_spot?: string;
  otros_conceptos_tributos: number;
  base_imponible_icbper: number;
  icbper: number;

  indicador_error: string;
  estado_operacion: EstadoOperacionVenta;
}

export interface RegistroVentaResponse extends RegistroVentaRequest {
  id: string;
  empresa_id: string;
  periodo: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

// Filtros para consultas
export interface VentasFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  cliente_documento?: string;
  cliente_nombre?: string;
  tipo_comprobante?: TipoComprobanteVenta;
  serie_comprobante?: string;
  monto_min?: number;
  monto_max?: number;
  estado_operacion?: EstadoOperacionVenta;
  periodo?: string;
  page?: number;
  limit?: number;
}

// Opciones de exportación PLE
export interface PLEVentasExportOptions {
  periodo: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  formato: 'txt' | 'excel';
  incluir_anulados: boolean;
}

export interface PLEVentasExportResult {
  filename: string;
  download_url: string;
  total_registros: number;
  fecha_generacion: string;
}

// Estadísticas
export interface VentasStats {
  total_registros: number;
  total_monto: number;
  total_igv: number;
  promedio_venta: number;
  clientes_unicos: number;
  comprobantes_por_tipo: Record<string, number>;
  montos_por_mes: Array<{
    mes: string;
    monto: number;
    cantidad: number;
  }>;
  top_clientes: Array<{
    documento: string;
    nombres: string;
    monto_total: number;
    cantidad_ventas: number;
  }>;
}

// Validación de cliente
export interface ValidacionCliente {
  documento: string;
  tipo: string;
  valido: boolean;
  nombres?: string;
  estado?: string;
  error?: string;
}
