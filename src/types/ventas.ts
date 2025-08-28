/**
 * Tipos TypeScript para el módulo de Registro de Ventas
 * Basado en especificaciones PLE 140000 SUNAT
 */

// Tipos para valores oficiales SUNAT
export type TipoComprobanteVenta = 
  | "01" // FACTURA
  | "03" // BOLETA
  | "07" // NOTA_CREDITO
  | "08" // NOTA_DEBITO
  | "14" // GUIA_REMISION
  | "12" // TICKET_MAQUINA
  | "16"; // BOLETO_TRANSPORTE

export type TipoDocumentoCliente =
  | "1"  // DNI
  | "6"  // RUC
  | "4"  // CARNET_EXTRANJERIA
  | "7"  // PASAPORTE
  | "0"; // SIN_DOCUMENTO

export type EstadoOperacionVenta =
  | "1"  // REGISTRADO
  | "2"  // ANULADO
  | "9"; // MODIFICADO

// Interfaces principales
export interface RegistroVentaRequest {
  // Campos obligatorios PLE 140000
  periodo: string;                     // Campo 1: Período (YYYYMM00)
  numero_correlativo: string;          // Campo 2: Número correlativo
  fecha_emision: string;               // Campo 3: Fecha emisión (DD/MM/YYYY)
  fecha_vencimiento?: string;          // Campo 4: Fecha vencimiento
  tipo_comprobante: TipoComprobanteVenta; // Campo 5: Tipo comprobante
  serie_comprobante: string;           // Campo 6: Serie comprobante
  numero_comprobante: string;          // Campo 7: Número comprobante
  numero_final?: string;               // Campo 8: Número final (rangos)
  tipo_documento_cliente: TipoDocumentoCliente; // Campo 9: Tipo doc cliente
  numero_documento_cliente: string;    // Campo 10: Número doc cliente
  apellidos_nombres_cliente: string;   // Campo 11: Apellidos/razón social
  
  // Montos según PLE 140000
  valor_facturado_exportacion: number;      // Campo 12: Valor facturado exportación
  base_imponible_gravada: number;           // Campo 13: Base imponible gravada
  descuento_base_imponible: number;         // Campo 14: Descuento base imponible
  igv_ipm: number;                          // Campo 15: IGV/IPM
  descuento_igv: number;                    // Campo 16: Descuento IGV
  importe_exonerado: number;                // Campo 17: Importe exonerado
  importe_inafecto: number;                 // Campo 18: Importe inafecto
  isc: number;                              // Campo 19: ISC
  base_imponible_ivap: number;              // Campo 20: Base imponible IVAP
  ivap: number;                             // Campo 21: IVAP
  otros_tributos: number;                   // Campo 22: Otros tributos
  importe_total: number;                    // Campo 23: Importe total
  
  // Campos adicionales
  codigo_moneda: string;                    // Campo 24: Código moneda
  tipo_cambio: number;                      // Campo 25: Tipo cambio
  fecha_emision_modificado?: string;        // Campo 26: Fecha emisión doc modificado
  tipo_comprobante_modificado?: string;     // Campo 27: Tipo doc modificado
  serie_comprobante_modificado?: string;    // Campo 28: Serie doc modificado
  numero_comprobante_modificado?: string;   // Campo 29: Número doc modificado
  
  // ICBPER y controles
  base_imponible_icbper: number;            // Campo 30: Base imponible ICBPER
  icbper: number;                           // Campo 31: ICBPER
  
  // Control
  estado_operacion: EstadoOperacionVenta;   // Campo 32: Estado operación
  observaciones?: string;
}

export interface RegistroVentaResponse extends RegistroVentaRequest {
  id: string;
  empresa_id: string;
  usuario_creacion: string;
  fecha_creacion: string;
  usuario_modificacion?: string;
  fecha_modificacion?: string;
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
