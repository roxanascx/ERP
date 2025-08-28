/**
 * Tipos TypeScript para el módulo de Registro de Compras
 * Sincronizado con schemas del backend FastAPI
 * Basado en especificaciones PLE 080000 SUNAT
 */

// Tipos para valores oficiales SUNAT
export type TipoComprobanteCompra = 
  | "01" // FACTURA
  | "03" // BOLETA
  | "04" // LIQUIDACION_COMPRA
  | "07" // NOTA_CREDITO
  | "08" // NOTA_DEBITO
  | "02" // RECIBO_HONORARIOS
  | "13" // BOLETO_AVION
  | "96"; // DOCUMENTO_EXTRANJERO

export type TipoDocumentoProveedor =
  | "1"  // DNI
  | "6"  // RUC
  | "4"  // CARNET_EXTRANJERIA
  | "7"  // PASAPORTE
  | "A"; // CEDULA_DIPLOMATICA

export type EstadoOperacionCompra =
  | "1"  // REGISTRADO
  | "2"  // ANULADO
  | "3"; // MODIFICADO

// Schema base - coincide con RegistroCompra del backend
export interface RegistroCompra {
  id?: string;
  empresa_id: string;
  periodo: string; // AAAAMM
  fecha_comprobante: string; // ISO date string
  tipo_comprobante: TipoComprobanteCompra;
  serie_comprobante?: string;
  numero_comprobante: string;
  fecha_vencimiento?: string;
  tipo_documento_proveedor: TipoDocumentoProveedor;
  numero_documento_proveedor: string;
  razon_social_proveedor: string;
  base_imponible_gravada: number;
  igv: number;
  base_imponible_exonerada?: number;
  base_imponible_inafecta?: number;
  isc?: number;
  otros_tributos?: number;
  importe_total: number;
  moneda?: string; // default "PEN"
  tipo_cambio?: number; // default 1.0000
  fecha_emision_documento_modificado?: string;
  tipo_comprobante_modificado?: string;
  serie_comprobante_modificado?: string;
  numero_comprobante_modificado?: string;
  clasificacion_bienes_servicios: string;
  estado_operacion?: EstadoOperacionCompra; // default "1"
  created_at?: string;
  updated_at?: string;
}

// Para crear nuevos registros - coincide con RegistroCompraCreate
export interface RegistroCompraCreate extends Omit<RegistroCompra, 'id' | 'created_at' | 'updated_at'> {}

// Para actualizar registros - coincide con RegistroCompraUpdate  
export interface RegistroCompraUpdate extends Partial<Omit<RegistroCompra, 'id' | 'empresa_id' | 'created_at' | 'updated_at'>> {}

// Respuesta del servidor - coincide con RegistroCompraResponse
export interface RegistroCompraResponse extends RegistroCompra {
  id: string;
  created_at: string;
  updated_at: string;
}

// Filtros para consultas - coincide con RegistroCompraFilter del backend
export interface ComprasFilters {
  empresa_id?: string;
  periodo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_comprobante?: TipoComprobanteCompra;
  numero_documento_proveedor?: string;
  razon_social_proveedor?: string;
  importe_min?: number;
  importe_max?: number;
  estado_operacion?: EstadoOperacionCompra;
  skip?: number;
  limit?: number;
}

// Resumen de compras - coincide con RegistroCompraResumen
export interface ComprasStats {
  total_registros: number;
  suma_base_imponible: number;
  suma_igv: number;
  suma_importe_total: number;
  conteo_por_tipo_comprobante: Record<string, number>;
  conteo_por_proveedor: Record<string, number>;
}

// Resultado de validación - coincide con ValidationResult
export interface ValidationResult {
  valido: boolean;
  errores: string[];
  advertencias: string[];
}

// Información de archivo PLE - coincide con PLEFileInfo
export interface PLEFileInfo {
  nombre_archivo: string;
  ruta_archivo: string;
  tamaño_bytes: number;
  fecha_generacion: string;
  hash_contenido: string;
}

// Metadatos PLE - coincide con PLEComprasMetadata
export interface PLEComprasMetadata {
  empresa_id: string;
  periodo: string;
  total_registros: number;
  fecha_generacion: string;
  archivo_info: PLEFileInfo;
}

// Opciones de exportación PLE
export interface PLEComprasExportOptions {
  empresa_id: string;
  periodo: string;
  formato?: 'txt' | 'excel';
  incluir_cabecera?: boolean;
}

export interface PLEComprasExportResult {
  archivo_info: PLEFileInfo;
  metadata: PLEComprasMetadata;
}

// Para el componente de la página
export interface ComprasPageData {
  registros: RegistroCompraResponse[];
  resumen: ComprasStats;
  loading: boolean;
  error: string | null;
}

// Respuesta paginada del backend
export interface ComprasPaginatedResponse {
  registros: RegistroCompraResponse[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

// Respuesta de resumen actualizada del backend
export interface ComprasResumenResponse {
  empresa_id: string;
  periodo: string;
  total_registros: number;
  total_base_imponible: number;
  total_igv: number;
  total_isc: number;
  total_otros_tributos: number;
  total_importe: number;
  tipos_comprobante_count: number;
  proveedores_unicos_count: number;
}

// Validación de proveedor (para funcionalidades futuras)
export interface ValidacionProveedor {
  numero_documento: string;
  tipo_documento: TipoDocumentoProveedor;
  valido: boolean;
  razon_social?: string;
  estado?: string;
  condicion?: string;
  error?: string;
}
