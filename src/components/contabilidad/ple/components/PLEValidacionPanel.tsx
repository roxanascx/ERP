import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Play,
  RefreshCw,
  FileCheck,
  Eye,
  Download
} from "lucide-react";

export interface ValidacionResultado {
  tipo: 'error' | 'advertencia' | 'info' | 'exito';
  codigo: string;
  mensaje: string;
  detalle?: string;
  linea?: number;
  campo?: string;
  sugerencia?: string;
}

export interface ValidacionEstadistica {
  totalRegistros: number;
  registrosValidos: number;
  registrosConErrores: number;
  registrosConAdvertencias: number;
  porcentajeValidez: number;
}

interface PLEValidacionPanelProps {
  resultados: ValidacionResultado[];
  estadisticas: ValidacionEstadistica;
  loading?: boolean;
  onValidar: () => Promise<void>;
  onExportarReporte?: () => void;
  onVerDetalle?: (resultado: ValidacionResultado) => void;
}

export const PLEValidacionPanel: React.FC<PLEValidacionPanelProps> = ({
  resultados,
  estadisticas,
  loading = false,
  onValidar,
  onExportarReporte,
  onVerDetalle
}) => {
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  const getIconoTipo = (tipo: ValidacionResultado['tipo']) => {
    switch (tipo) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'advertencia':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'exito':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getBadgeTipo = (tipo: ValidacionResultado['tipo']) => {
    const variants = {
      error: { variant: 'destructive' as const, label: 'Error' },
      advertencia: { variant: 'default' as const, label: 'Advertencia' },
      info: { variant: 'secondary' as const, label: 'Info' },
      exito: { variant: 'success' as const, label: 'Válido' }
    };

    const config = variants[tipo];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const resultadosFiltrados = resultados.filter(resultado => {
    const coincideTipo = filtroTipo === 'todos' || resultado.tipo === filtroTipo;
    const coincideBusqueda = busqueda === '' || 
      resultado.mensaje.toLowerCase().includes(busqueda.toLowerCase()) ||
      resultado.codigo.toLowerCase().includes(busqueda.toLowerCase());
    
    return coincideTipo && coincideBusqueda;
  });

  const contadores = {
    errores: resultados.filter(r => r.tipo === 'error').length,
    advertencias: resultados.filter(r => r.tipo === 'advertencia').length,
    infos: resultados.filter(r => r.tipo === 'info').length,
    exitos: resultados.filter(r => r.tipo === 'exito').length
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Panel de Validación PLE
            </CardTitle>
            <div className="flex gap-2">
              {onExportarReporte && (
                <Button variant="outline" onClick={onExportarReporte}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Reporte
                </Button>
              )}
              <Button onClick={onValidar} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Validar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Estadísticas generales */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.totalRegistros.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Registros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{estadisticas.registrosValidos.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Válidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{estadisticas.registrosConErrores.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Con Errores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.registrosConAdvertencias.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Advertencias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{estadisticas.porcentajeValidez.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Validez</div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso de validación</span>
              <span>{estadisticas.porcentajeValidez.toFixed(1)}% válido</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  estadisticas.porcentajeValidez >= 95 ? 'bg-green-500' :
                  estadisticas.porcentajeValidez >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${estadisticas.porcentajeValidez}%` }}
              />
            </div>
          </div>

          {/* Contadores por tipo */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>{contadores.errores} errores</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>{contadores.advertencias} advertencias</span>
            </div>
            <div className="flex items-center gap-1">
              <Info className="h-4 w-4 text-blue-500" />
              <span>{contadores.infos} informativos</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{contadores.exitos} válidos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por mensaje o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="todos">Todos los tipos</option>
                <option value="error">Solo errores</option>
                <option value="advertencia">Solo advertencias</option>
                <option value="info">Solo información</option>
                <option value="exito">Solo válidos</option>
              </select>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            Mostrando {resultadosFiltrados.length} de {resultados.length} resultados
          </div>
        </CardContent>
      </Card>

      {/* Lista de resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados de Validación</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p>Ejecutando validaciones...</p>
            </div>
          ) : resultadosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron resultados con los filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {resultadosFiltrados.map((resultado, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIconoTipo(resultado.tipo)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getBadgeTipo(resultado.tipo)}
                        <span className="text-sm text-gray-500 font-mono">{resultado.codigo}</span>
                        {resultado.linea && (
                          <span className="text-xs text-gray-500">Línea {resultado.linea}</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-800 mb-1">{resultado.mensaje}</p>
                      
                      {resultado.detalle && (
                        <p className="text-xs text-gray-600 mb-2">{resultado.detalle}</p>
                      )}
                      
                      {resultado.campo && (
                        <div className="text-xs text-gray-500 mb-2">
                          Campo: <span className="font-mono">{resultado.campo}</span>
                        </div>
                      )}
                      
                      {resultado.sugerencia && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                          💡 Sugerencia: {resultado.sugerencia}
                        </div>
                      )}
                    </div>
                    
                    {onVerDetalle && (
                      <div className="flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onVerDetalle(resultado)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PLEValidacionPanel;
