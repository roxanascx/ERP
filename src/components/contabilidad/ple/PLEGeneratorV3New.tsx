import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  Settings,
  Loader2,
  Download,
  Eye
} from "lucide-react";

// Importar componentes mejorados
import PLEFormGeneracionEnhanced from './components/PLEFormGeneracionEnhanced';
import PLEArchivosTableEnhanced from './components/PLEArchivosTableEnhanced';
import PLEEstadisticas from './components/PLEEstadisticas';
import PLEConfiguracionComponent from './components/PLEConfiguracion';
import PLEValidacionPanel from './components/PLEValidacionPanel';
import type { PLEGeneracionDataEnhanced } from './components/PLEFormGeneracionEnhanced';
import type { PLEGeneracionData } from './components/PLEFormGeneracion';
import type { PLEArchivo } from './components/PLEArchivosTable';
import PLEPreview from './components/PLEPreview';

// Importar tipos mejorados
import type { PLEArchivoEnhanced } from './components/PLEArchivosTableEnhanced';
import type { PLEEstadistica } from './components/PLEEstadisticas';
import type { PLEConfiguracion } from './components/PLEConfiguracion';
import type { ValidacionResultado, ValidacionEstadistica } from './components/PLEValidacionPanel';
import type { PLERegistro, PLEValidacion } from './components/PLEPreview';

// Importar servicio API
import { pleApiService, PLEApiService } from '../../../services/pleApi';

export const PLEGeneratorV3: React.FC = () => {
  // Estados principales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados de datos
  const [archivos, setArchivos] = useState<PLEArchivoEnhanced[]>([]);
  const [estadisticas, setEstadisticas] = useState<PLEEstadistica | null>(null);
  const [configuracion, setConfiguracion] = useState<PLEConfiguracion | null>(null);
  const [validacionResultados, setValidacionResultados] = useState<ValidacionResultado[]>([]);
  const [validacionEstadisticas, setValidacionEstadisticas] = useState<ValidacionEstadistica>({
    totalRegistros: 0,
    registrosValidos: 0,
    registrosConErrores: 0,
    registrosConAdvertencias: 0,
    porcentajeValidez: 0
  });
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState('generar');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    archivo: {
      nombre: string;
      ejercicio: number;
      mes: number;
      ruc: string;
      totalRegistros: number;
    };
    registros: PLERegistro[];
    validaciones: PLEValidacion[];
  } | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Cargar archivos, configuración y estadísticas en paralelo
      const [archivosData, configData] = await Promise.all([
        pleApiService.obtenerArchivos({ limite: 20 }),
        pleApiService.obtenerConfiguracion().catch(() => null), // No fallar si no existe configuración
      ]);

      setArchivos(archivosData.map(archivo => ({
        id: archivo.id,
        nombre: archivo.nombreArchivo || `LE${archivo.ruc}${archivo.ejercicio}${archivo.mes.toString().padStart(2, '0')}00140100001111.txt`,
        ruc: archivo.ruc,
        razon_social: archivo.razonSocial || 'N/A',
        ejercicio: archivo.ejercicio,
        mes: archivo.mes,
        fecha_generacion: archivo.fechaGeneracion || new Date().toISOString(),
        tamaño: archivo.tamanoArchivo || 0,
        formato: 'TXT' as const,
        estado: (archivo.estado === 'enviado' ? 'procesando' : archivo.estado) as 'error' | 'generado' | 'validado' | 'procesando',
        registros_total: archivo.totalRegistros || 0,
        registros_validos: Math.max(0, (archivo.totalRegistros || 0) - (archivo.errores?.length || 0)),
        registros_con_errores: archivo.errores?.length || 0,
        url_descarga: `/api/ple/descargar/${archivo.id}`,
        observaciones: archivo.observaciones
      })));
      if (configData) {
        setConfiguracion(configData);
      }

      // Cargar estadísticas del mes actual
      const ahora = new Date();
      try {
        const estadisticasData = await pleApiService.obtenerEstadisticas(
          ahora.getFullYear(),
          ahora.getMonth() + 1
        );
        setEstadisticas(estadisticasData);
      } catch (error) {
        // Si no hay estadísticas, crear una estructura vacía
        console.warn('No se pudieron cargar estadísticas:', error);
      }

    } catch (error) {
      setError(PLEApiService.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleGeneracionPLE = async (data: PLEGeneracionDataEnhanced) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Convertir datos al formato esperado por el API
      const apiData = {
        ejercicio: data.ejercicio,
        mes: data.mes,
        ruc: data.ruc,
        razonSocial: data.razon_social,
        fechaInicio: `${data.ejercicio}-${data.mes.toString().padStart(2, '0')}-01`,
        fechaFin: `${data.ejercicio}-${data.mes.toString().padStart(2, '0')}-31`,
        incluirCierreEjercicio: false,
        observaciones: data.observaciones || ''
      };

      const resultado = await pleApiService.generarPLE(apiData);
      
      if (resultado.success) {
        setSuccess(`Archivo PLE generado exitosamente: ${resultado.archivo_nombre}`);
        
        // Recargar archivos - adaptando al tipo correcto
        const archivosRaw = await pleApiService.obtenerArchivos({ limite: 20 });
        const archivosAdaptados: PLEArchivoEnhanced[] = archivosRaw.map(archivo => ({
          id: archivo.id,
          nombre: archivo.nombreArchivo || `LE${archivo.ruc}${archivo.ejercicio}${archivo.mes.toString().padStart(2, '0')}00140100001111.txt`,
          ruc: archivo.ruc,
          razon_social: archivo.razonSocial || 'N/A',
          ejercicio: archivo.ejercicio,
          mes: archivo.mes,
          fecha_generacion: archivo.fechaGeneracion || new Date().toISOString(),
          tamaño: archivo.tamanoArchivo || 0,
          formato: 'TXT' as const,
          estado: (archivo.estado === 'enviado' ? 'procesando' : archivo.estado) as 'error' | 'generado' | 'validado' | 'procesando',
          registros_total: archivo.totalRegistros || 0,
          registros_validos: Math.max(0, (archivo.totalRegistros || 0) - (archivo.errores?.length || 0)),
          registros_con_errores: archivo.errores?.length || 0,
          url_descarga: `/api/ple/descargar/${archivo.id}`,
          observaciones: archivo.observaciones
        }));
        setArchivos(archivosAdaptados);
        
        // Cambiar a la pestaña de archivos
        setActiveTab('archivos');
      } else {
        setError(resultado.message || 'Error al generar el archivo PLE');
      }

    } catch (error) {
      setError(PLEApiService.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async () => {
    try {
      setLoading(true);
      setError(null);

      // Para la validación necesitamos datos básicos
      const ahora = new Date();
      const datosValidacion: PLEGeneracionData = {
        ejercicio: ahora.getFullYear(),
        mes: ahora.getMonth() + 1,
        ruc: configuracion?.general.empresaDefecto || '',
        razonSocial: 'Empresa de Prueba',
        fechaInicio: `${ahora.getFullYear()}-${(ahora.getMonth() + 1).toString().padStart(2, '0')}-01`,
        fechaFin: new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).toISOString().split('T')[0],
        incluirCierreEjercicio: false
      };

      const resultado = await pleApiService.validarPLE(datosValidacion);
      
      if (resultado.success) {
        setValidacionResultados(resultado.resultados);
        setValidacionEstadisticas(resultado.estadisticas);
        setActiveTab('validacion');
      } else {
        setError('Error al validar los datos PLE');
      }

    } catch (error) {
      setError(PLEApiService.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async (archivo: PLEArchivoEnhanced) => {
    try {
      setLoading(true);
      await pleApiService.descargarYGuardarArchivo(archivo.id, archivo.nombre);
      setSuccess(`Archivo ${archivo.nombre} descargado exitosamente`);
    } catch (error) {
      setError(PLEApiService.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (archivo: PLEArchivoEnhanced) => {
    try {
      setLoading(true);
      const preview = await pleApiService.obtenerPreview(archivo.id);
      
      if (preview.success) {
        setPreviewData(preview);
        setPreviewOpen(true);
      } else {
        setError('Error al cargar el preview del archivo');
      }
    } catch (error) {
      setError(PLEApiService.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (archivo: PLEArchivoEnhanced) => {
    if (!confirm(`¿Está seguro de eliminar el archivo ${archivo.nombre}?`)) {
      return;
    }

    try {
      setLoading(true);
      const resultado = await pleApiService.eliminarArchivo(archivo.id);
      
      if (resultado.success) {
        setSuccess(`Archivo ${archivo.nombre} eliminado exitosamente`);
        
        // Recargar archivos
        const nuevosArchivos = await pleApiService.obtenerArchivos({ limite: 20 });
        setArchivos(nuevosArchivos.map(arch => ({
          id: arch.id,
          nombre: arch.nombreArchivo || `LE${arch.ruc}${arch.ejercicio}${arch.mes.toString().padStart(2, '0')}00140100001111.txt`,
          ruc: arch.ruc,
          razon_social: arch.razonSocial || 'N/A',
          ejercicio: arch.ejercicio,
          mes: arch.mes,
          fecha_generacion: arch.fechaGeneracion || new Date().toISOString(),
          tamaño: arch.tamanoArchivo || 0,
          formato: 'TXT' as const,
          estado: (arch.estado === 'enviado' ? 'procesando' : arch.estado) as 'error' | 'generado' | 'validado' | 'procesando',
          registros_total: arch.totalRegistros || 0,
          registros_validos: Math.max(0, (arch.totalRegistros || 0) - (arch.errores?.length || 0)),
          registros_con_errores: arch.errores?.length || 0,
          url_descarga: `/api/ple/descargar/${arch.id}`,
          observaciones: arch.observaciones
        })));
      } else {
        setError(resultado.message || 'Error al eliminar el archivo');
      }
    } catch (error) {
      setError(PLEApiService.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarConfiguracion = async () => {
    if (!configuracion) return;

    try {
      setLoading(true);
      const resultado = await pleApiService.guardarConfiguracion(configuracion);
      
      if (resultado.success) {
        setSuccess('Configuración guardada exitosamente');
      } else {
        setError(resultado.message || 'Error al guardar la configuración');
      }
    } catch (error) {
      setError(PLEApiService.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecerConfiguracion = () => {
    // Configuración por defecto
    const configDefault: PLEConfiguracion = {
      general: {
        empresaDefecto: '',
        rutaArchivos: '/ple',
        formatoFecha: 'dd/mm/yyyy',
        separadorDecimal: '.',
        formatoNumeros: 'decimal'
      },
      validacion: {
        validarRUC: true,
        validarTiposCambio: true,
        validarFechas: true,
        validarCorrelatividad: true,
        permitirRegistrosVacios: false
      },
      generacion: {
        incluirCabecera: false,
        comprimirArchivos: true,
        dividirPorMes: true,
        tamanioMaximoArchivo: 50,
        codificacionArchivo: 'utf-8'
      },
      notificaciones: {
        emailGeneracion: false,
        emailErrores: true,
        emailCompletitud: false,
        destinatarios: []
      }
    };

    setConfiguracion(configDefault);
  };

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="space-y-6">
      {/* Mensajes de estado */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Indicador de carga global */}
      {loading && (
        <div className="fixed top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 z-50">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700">Procesando...</span>
        </div>
      )}

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="generar" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generar
          </TabsTrigger>
          <TabsTrigger value="archivos" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Archivos
          </TabsTrigger>
          <TabsTrigger value="estadisticas" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="validacion" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Validación
          </TabsTrigger>
          <TabsTrigger value="configuracion" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* Contenido de las pestañas */}
        <TabsContent value="generar" className="space-y-6">
          <PLEFormGeneracionEnhanced
            onGenerar={handleGeneracionPLE}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="archivos" className="space-y-6">
          <PLEArchivosTableEnhanced
            archivos={archivos}
            onRefresh={cargarDatosIniciales}
            loading={loading}
            onDescargar={handleDescargar}
            onVer={handlePreview}
            onEliminar={handleEliminar}
          />
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-6">
          {estadisticas ? (
            <PLEEstadisticas
              estadisticas={estadisticas}
              loading={loading}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay estadísticas disponibles</p>
                  <p className="text-sm">Genere archivos PLE para ver estadísticas</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="validacion" className="space-y-6">
          <PLEValidacionPanel
            resultados={validacionResultados}
            estadisticas={validacionEstadisticas}
            loading={loading}
            onValidar={handleValidar}
          />
        </TabsContent>

        <TabsContent value="configuracion" className="space-y-6">
          {configuracion ? (
            <PLEConfiguracionComponent
              configuracion={configuracion}
              onChange={setConfiguracion}
              onSave={handleGuardarConfiguracion}
              onReset={handleRestablecerConfiguracion}
              loading={loading}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Cargando configuración...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Preview */}
      {previewData && (
        <PLEPreview
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          datos={previewData}
          onDescargar={() => {
            // Implementar descarga del preview si es necesario
            console.log('Descargar preview');
          }}
        />
      )}
    </div>
  );
};
