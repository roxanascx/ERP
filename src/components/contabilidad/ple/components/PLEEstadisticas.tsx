import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Database,
  TrendingUp
} from "lucide-react";

export interface PLEEstadistica {
  periodo: {
    ejercicio: number;
    mes: number;
  };
  totales: {
    archivosGenerados: number;
    registrosProcesados: number;
    tamanioTotal: number;
    erroresValidacion: number;
  };
  cumplimiento: {
    porcentajeCompletitud: number;
    camposRequeridos: number;
    camposCompletos: number;
  };
  comparativa: {
    mesAnterior: {
      registros: number;
      variacion: number;
    };
    anoAnterior: {
      registros: number;
      variacion: number;
    };
  };
}

interface PLEEstadisticasProps {
  estadisticas: PLEEstadistica;
  loading?: boolean;
}

export const PLEEstadisticas: React.FC<PLEEstadisticasProps> = ({
  estadisticas,
  loading = false
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatVariacion = (variacion: number): { text: string; color: string; icon: React.ReactNode } => {
    const abs = Math.abs(variacion);
    const isPositive = variacion > 0;
    
    return {
      text: `${isPositive ? '+' : ''}${variacion.toFixed(1)}%`,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      icon: isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />
    };
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
            <BarChart3 className="h-5 w-5" />
            Estadísticas PLE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-2">Cargando estadísticas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mesAnteriorVar = formatVariacion(estadisticas.comparativa.mesAnterior.variacion);
  const anoAnteriorVar = formatVariacion(estadisticas.comparativa.anoAnterior.variacion);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Estadísticas PLE - {getPeriodoLabel(estadisticas.periodo.ejercicio, estadisticas.periodo.mes)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Archivos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {estadisticas.totales.archivosGenerados}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Registros</p>
                <p className="text-2xl font-bold text-green-600">
                  {estadisticas.totales.registrosProcesados.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cumplimiento</p>
                <p className="text-2xl font-bold text-purple-600">
                  {estadisticas.cumplimiento.porcentajeCompletitud.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Errores</p>
                <p className="text-2xl font-bold text-orange-600">
                  {estadisticas.totales.erroresValidacion}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles de cumplimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completitud de Datos
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Campos completados:</span>
                <span className="font-medium">
                  {estadisticas.cumplimiento.camposCompletos} / {estadisticas.cumplimiento.camposRequeridos}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${estadisticas.cumplimiento.porcentajeCompletitud}%` }}
                />
              </div>
              
              <div className="text-sm text-gray-600">
                {estadisticas.cumplimiento.porcentajeCompletitud >= 95 ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Excelente cumplimiento
                  </span>
                ) : estadisticas.cumplimiento.porcentajeCompletitud >= 80 ? (
                  <span className="text-yellow-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Cumplimiento aceptable
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Requiere mejoras
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Comparativas
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">vs. Mes anterior</p>
                  <p className="font-medium">
                    {estadisticas.comparativa.mesAnterior.registros.toLocaleString()} registros
                  </p>
                </div>
                <div className={`flex items-center gap-1 ${mesAnteriorVar.color}`}>
                  {mesAnteriorVar.icon}
                  <span className="font-medium">{mesAnteriorVar.text}</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">vs. Año anterior</p>
                  <p className="font-medium">
                    {estadisticas.comparativa.anoAnterior.registros.toLocaleString()} registros
                  </p>
                </div>
                <div className={`flex items-center gap-1 ${anoAnteriorVar.color}`}>
                  {anoAnteriorVar.icon}
                  <span className="font-medium">{anoAnteriorVar.text}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Período: {getPeriodoLabel(estadisticas.periodo.ejercicio, estadisticas.periodo.mes)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Database className="h-4 w-4" />
              <span>Tamaño total: {formatFileSize(estadisticas.totales.tamanioTotal)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <BarChart3 className="h-4 w-4" />
              <span>Promedio: {Math.round(estadisticas.totales.registrosProcesados / Math.max(estadisticas.totales.archivosGenerados, 1)).toLocaleString()} reg/archivo</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PLEEstadisticas;
