import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  X, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Download
} from "lucide-react";

export interface PLERegistro {
  linea: number;
  periodo: string;
  cuo: string;
  correlativo: string;
  fechaContable: string;
  fechaVencimiento: string;
  tipoComprobante: string;
  serie: string;
  numero: string;
  numeroFinal?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  apellidosNombres: string;
  baseImponible: number;
  igv: number;
  bidim?: number;
  isc?: number;
  icbper?: number;
  otros?: number;
  total: number;
  moneda: string;
  tipoCambio?: number;
  fechaEmisionModificado?: string;
  tipoComprobanteModificado?: string;
  serieComprobanteModificado?: string;
  numeroComprobanteModificado?: string;
  estado: string;
}

export interface PLEValidacion {
  tipo: 'error' | 'advertencia' | 'info';
  codigo: string;
  mensaje: string;
  linea?: number;
  campo?: string;
  sugerencia?: string;
}

interface PLEPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  datos: {
    archivo: {
      nombre: string;
      ejercicio: number;
      mes: number;
      ruc: string;
      totalRegistros: number;
    };
    registros: PLERegistro[];
    validaciones: PLEValidacion[];
  };
  onDescargar?: () => void;
}

export const PLEPreview: React.FC<PLEPreviewProps> = ({
  isOpen,
  onClose,
  datos,
  onDescargar
}) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTipoValidacionIcon = (tipo: PLEValidacion['tipo']) => {
    switch (tipo) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'advertencia':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTipoValidacionBadge = (tipo: PLEValidacion['tipo']) => {
    const variants = {
      error: { variant: 'destructive' as const, label: 'Error' },
      advertencia: { variant: 'default' as const, label: 'Advertencia' },
      info: { variant: 'secondary' as const, label: 'Info' }
    };

    const config = variants[tipo];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const errores = datos.validaciones.filter(v => v.tipo === 'error');
  const advertencias = datos.validaciones.filter(v => v.tipo === 'advertencia');
  const infos = datos.validaciones.filter(v => v.tipo === 'info');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Preview PLE</h2>
              <p className="text-sm text-gray-600">{datos.archivo.nombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onDescargar && (
              <Button variant="outline" onClick={onDescargar}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Resumen */}
            <div className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Período:</span>
                  <div className="font-medium">{datos.archivo.mes}/{datos.archivo.ejercicio}</div>
                </div>
                <div>
                  <span className="text-gray-600">RUC:</span>
                  <div className="font-medium">{datos.archivo.ruc}</div>
                </div>
                <div>
                  <span className="text-gray-600">Total Registros:</span>
                  <div className="font-medium">{datos.archivo.totalRegistros.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Estado:</span>
                  <div className="flex items-center gap-1">
                    {errores.length === 0 ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">Válido</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 font-medium">Con errores</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de registros */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="font-medium">Registros del PLE</h3>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 border-b">Línea</th>
                      <th className="text-left py-2 px-3 border-b">CUO</th>
                      <th className="text-left py-2 px-3 border-b">Fecha</th>
                      <th className="text-left py-2 px-3 border-b">Comprobante</th>
                      <th className="text-left py-2 px-3 border-b">Proveedor</th>
                      <th className="text-left py-2 px-3 border-b">Base</th>
                      <th className="text-left py-2 px-3 border-b">IGV</th>
                      <th className="text-left py-2 px-3 border-b">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.registros.slice(0, 100).map((registro, index) => (
                      <tr key={index} className="hover:bg-gray-50 border-b">
                        <td className="py-2 px-3">{registro.linea}</td>
                        <td className="py-2 px-3 font-mono text-xs">{registro.cuo}</td>
                        <td className="py-2 px-3">{registro.fechaContable}</td>
                        <td className="py-2 px-3">
                          {registro.tipoComprobante}-{registro.serie}-{registro.numero}
                        </td>
                        <td className="py-2 px-3 max-w-[200px] truncate" title={registro.apellidosNombres}>
                          {registro.apellidosNombres}
                        </td>
                        <td className="py-2 px-3 text-right">{formatCurrency(registro.baseImponible)}</td>
                        <td className="py-2 px-3 text-right">{formatCurrency(registro.igv)}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatCurrency(registro.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {datos.registros.length > 100 && (
                <div className="px-4 py-2 bg-gray-50 border-t text-sm text-gray-600">
                  Mostrando primeros 100 registros de {datos.registros.length} totales
                </div>
              )}
            </div>
          </div>

          {/* Sidebar con validaciones */}
          {datos.validaciones.length > 0 && (
            <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Validaciones ({datos.validaciones.length})
              </h3>

              {/* Resumen de validaciones */}
              <div className="mb-4 space-y-2">
                {errores.length > 0 && (
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm text-red-700">Errores</span>
                    <Badge variant="destructive">{errores.length}</Badge>
                  </div>
                )}
                {advertencias.length > 0 && (
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm text-yellow-700">Advertencias</span>
                    <Badge variant="default">{advertencias.length}</Badge>
                  </div>
                )}
                {infos.length > 0 && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm text-blue-700">Información</span>
                    <Badge variant="secondary">{infos.length}</Badge>
                  </div>
                )}
              </div>

              {/* Lista de validaciones */}
              <div className="space-y-3">
                {datos.validaciones.map((validacion, index) => (
                  <div key={index} className="p-3 bg-white rounded border">
                    <div className="flex items-start gap-2 mb-2">
                      {getTipoValidacionIcon(validacion.tipo)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTipoValidacionBadge(validacion.tipo)}
                          <span className="text-xs text-gray-500">{validacion.codigo}</span>
                        </div>
                        <p className="text-sm text-gray-800">{validacion.mensaje}</p>
                        {validacion.linea && (
                          <p className="text-xs text-gray-500 mt-1">
                            Línea: {validacion.linea}
                            {validacion.campo && ` - Campo: ${validacion.campo}`}
                          </p>
                        )}
                        {validacion.sugerencia && (
                          <p className="text-xs text-blue-600 mt-2 italic">
                            💡 {validacion.sugerencia}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PLEPreview;
