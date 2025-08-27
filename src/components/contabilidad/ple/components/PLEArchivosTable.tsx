import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Building2, 
  FileCheck,
  AlertCircle
} from "lucide-react";

export interface PLEArchivo {
  id: string;
  ejercicio: number;
  mes: number;
  ruc: string;
  razonSocial: string;
  fechaGeneracion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'generado' | 'validado' | 'enviado' | 'error';
  nombreArchivo: string;
  tamanoArchivo: number;
  totalRegistros: number;
  observaciones?: string;
  errores?: string[];
}

interface PLEArchivosTableProps {
  archivos: PLEArchivo[];
  loading?: boolean;
  onDescargar: (archivo: PLEArchivo) => void;
  onPreview: (archivo: PLEArchivo) => void;
  onEliminar: (archivo: PLEArchivo) => void;
}

export const PLEArchivosTable: React.FC<PLEArchivosTableProps> = ({
  archivos,
  loading = false,
  onDescargar,
  onPreview,
  onEliminar
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado: PLEArchivo['estado']) => {
    const variants = {
      generado: { variant: 'secondary' as const, label: 'Generado' },
      validado: { variant: 'default' as const, label: 'Validado' },
      enviado: { variant: 'success' as const, label: 'Enviado' },
      error: { variant: 'destructive' as const, label: 'Error' }
    };

    const config = variants[estado];
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getPeriodoLabel = (ejercicio: number, mes: number): string => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[mes - 1]} ${ejercicio}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Archivos PLE Generados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-2">Cargando archivos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (archivos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Archivos PLE Generados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se han generado archivos PLE aún.</p>
            <p className="text-sm">Utiliza el generador para crear tu primer archivo PLE.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Archivos PLE Generados ({archivos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium">Período</th>
                <th className="text-left py-3 px-2 font-medium">Empresa</th>
                <th className="text-left py-3 px-2 font-medium">Archivo</th>
                <th className="text-left py-3 px-2 font-medium">Estado</th>
                <th className="text-left py-3 px-2 font-medium">Fecha</th>
                <th className="text-left py-3 px-2 font-medium">Registros</th>
                <th className="text-left py-3 px-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {archivos.map((archivo) => (
                <tr key={archivo.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {getPeriodoLabel(archivo.ejercicio, archivo.mes)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {archivo.fechaInicio} - {archivo.fechaFin}
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{archivo.ruc}</div>
                        <div className="text-xs text-gray-500 max-w-[150px] truncate">
                          {archivo.razonSocial}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <div>
                      <div className="font-medium text-sm">{archivo.nombreArchivo}</div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(archivo.tamanoArchivo)}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <div className="space-y-1">
                      {getEstadoBadge(archivo.estado)}
                      {archivo.errores && archivo.errores.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {archivo.errores.length} error(es)
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <div className="text-sm">
                      {formatDate(archivo.fechaGeneracion)}
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <FileCheck className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{archivo.totalRegistros.toLocaleString()}</span>
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPreview(archivo)}
                        title="Ver preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDescargar(archivo)}
                        title="Descargar archivo"
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEliminar(archivo)}
                        title="Eliminar archivo"
                        className="text-red-600 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumen */}
        <div className="mt-4 pt-4 border-t text-sm text-gray-600">
          <div className="flex flex-wrap gap-4">
            <span>Total: {archivos.length} archivo(s)</span>
            <span>
              Registros: {archivos.reduce((acc, archivo) => acc + archivo.totalRegistros, 0).toLocaleString()}
            </span>
            <span>
              Tamaño: {formatFileSize(archivos.reduce((acc, archivo) => acc + archivo.tamanoArchivo, 0))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PLEArchivosTable;
