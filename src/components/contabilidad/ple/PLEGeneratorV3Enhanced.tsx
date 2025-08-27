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
  Eye,
  TrendingUp,
  Calendar,
  Shield,
  Activity,
  RefreshCw
} from "lucide-react";

// Importar componentes mejorados y existentes
import PLEFormGeneracionEnhanced from './components/PLEFormGeneracionEnhanced';
import PLEArchivosTableEnhanced from './components/PLEArchivosTableEnhanced';
import PLEEstadisticas from './components/PLEEstadisticas';
import PLEConfiguracionComponent from './components/PLEConfiguracionComponent';
import PLEValidacionPanel from './components/PLEValidacionPanel';
import PLEPreview from './components/PLEPreview';

// Importar tipos mejorados
import type { PLEGeneracionDataEnhanced } from './components/PLEFormGeneracionEnhanced';
import type { PLEArchivoEnhanced } from './components/PLEArchivosTableEnhanced';
import type { PLEEstadistica } from './components/PLEEstadisticas';
import type { PLEConfiguracion } from './components/PLEConfiguracionComponent';
import type { ValidacionResultado, ValidacionEstadistica } from './components/PLEValidacionPanel';
import type { PLERegistro, PLEValidacion } from './components/PLEPreview';

// Importar servicio API
import { pleApiService } from '../../../services/pleApi';

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
  
  // Estados de UI mejorados
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Estados de preview mejorados
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
      setError(null);
      
      // Cargar datos en paralelo con mejor manejo de errores
      const resultados = await Promise.allSettled([
        pleApiService.obtenerArchivos({ limite: 20 }),
        pleApiService.obtenerConfiguracion?.() || Promise.resolve(null),
        cargarEstadisticasActuales()
      ]);

      // Procesar resultados con adaptador
      if (resultados[0].status === 'fulfilled') {
        // Convertir archivos al formato mejorado
        const archivosRaw = resultados[0].value;
        const archivosAdaptados: PLEArchivoEnhanced[] = archivosRaw.map(archivo => ({
          id: archivo.id,
          nombre: archivo.nombreArchivo || `LE${archivo.ruc}${archivo.ejercicio}${archivo.mes.toString().padStart(2, '0')}00140100001111.txt`,
          ruc: archivo.ruc,
          razon_social: archivo.razonSocial || 'N/A',
          ejercicio: archivo.ejercicio,
          mes: archivo.mes,
          fecha_generacion: archivo.fechaGeneracion || new Date().toISOString(),
          tamaño: 1024, // Valor por defecto
          formato: 'TXT' as const,
          estado: (archivo.estado === 'enviado' ? 'validado' : archivo.estado) as any,
          registros_total: archivo.totalRegistros || 0,
          registros_validos: Math.max(0, (archivo.totalRegistros || 0) - (archivo.errores?.length || 0)),
          registros_con_errores: archivo.errores?.length || 0,
          url_descarga: `/api/ple/archivos/${archivo.id}/descargar`,
          observaciones: archivo.observaciones
        }));
        setArchivos(archivosAdaptados);
      }

      if (resultados[1].status === 'fulfilled' && resultados[1].value) {
        // setConfiguracion(resultados[1].value); // Comentado por incompatibilidad
      }

      if (resultados[2].status === 'fulfilled' && resultados[2].value) {
        setEstadisticas(resultados[2].value);
      }

      setLastUpdate(new Date());

    } catch (error: any) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error al cargar los datos del sistema. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticasActuales = async () => {
    const ahora = new Date();
    try {
      return await pleApiService.obtenerEstadisticas?.(
        ahora.getFullYear(),
        ahora.getMonth() + 1
      );
    } catch (error) {
      console.warn('No se pudieron cargar estadísticas:', error);
      return null;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await cargarDatosIniciales();
    setIsRefreshing(false);
  };

  const handleGeneracionPLE = async (data: PLEGeneracionDataEnhanced) => {
    try {
      setLoading(true);
      setError(null);
      
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
        await cargarDatosIniciales(); // Recargar datos
        setActiveTab('archivos'); // Cambiar a la pestaña de archivos
      } else {
        setError(`Error al generar PLE: ${resultado.message}`);
      }
    } catch (error: any) {
      console.error('Error generando PLE:', error);
      setError(`Error al generar archivo PLE: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleValidacion = async (data: PLEGeneracionDataEnhanced) => {
    try {
      setLoading(true);
      setError(null);
      
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
      
      const resultado = await pleApiService.validarPLE(apiData);
      
      if (resultado.success) {
        setValidacionResultados(resultado.resultados);
        setValidacionEstadisticas(resultado.estadisticas);
        setSuccess('Validación completada exitosamente');
        setActiveTab('validacion');
      } else {
        setError('Error durante la validación');
      }
    } catch (error: any) {
      console.error('Error en validación:', error);
      setError(`Error al validar datos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Componente de Header mejorado
  const PLEHeader = () => (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '24px',
      color: 'white',
      marginBottom: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Patrón de fondo decorativo */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '100%',
        opacity: 0.1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FileText size={32} />
              PLE SUNAT V3
            </h1>
            <p style={{
              fontSize: '16px',
              margin: 0,
              opacity: 0.9,
              fontWeight: '500'
            }}>
              Programa de Libros Electrónicos - Generación y validación conforme SUNAT
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              <RefreshCw size={16} style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
              }} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)'
            }}>
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de estadísticas rápidas
  const QuickStats = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {[
        {
          title: 'Archivos Generados',
          value: archivos.length,
          icon: FileText,
          color: '#3b82f6',
          bg: '#eff6ff'
        },
        {
          title: 'Registros Procesados',
          value: estadisticas?.totales?.registrosProcesados || 0,
          icon: CheckCircle,
          color: '#10b981',
          bg: '#ecfdf5'
        },
        {
          title: 'Errores Detectados',
          value: validacionResultados.filter(r => r.tipo === 'error').length,
          icon: AlertCircle,
          color: '#ef4444',
          bg: '#fef2f2'
        },
        {
          title: 'Cumplimiento',
          value: `${Math.round(validacionEstadisticas.porcentajeValidez || 0)}%`,
          icon: TrendingUp,
          color: '#8b5cf6',
          bg: '#f5f3ff'
        }
      ].map((stat, index) => (
        <Card key={index} style={{
          border: 'none',
          background: stat.bg,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
          <CardContent style={{ padding: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 4px 0',
                  fontWeight: '600'
                }}>
                  {stat.title}
                </p>
                <p style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  margin: 0,
                  color: stat.color
                }}>
                  {stat.value}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <stat.icon size={24} color="white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Alertas mejoradas
  const AlertMessages = () => (
    <>
      {error && (
        <Alert style={{
          marginBottom: '16px',
          border: '1px solid #fecaca',
          background: '#fef2f2'
        }}>
          <AlertCircle size={16} style={{ color: '#dc2626' }} />
          <AlertDescription style={{ color: '#dc2626', fontWeight: '600' }}>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert style={{
          marginBottom: '16px',
          border: '1px solid #bbf7d0',
          background: '#f0fdf4'
        }}>
          <CheckCircle size={16} style={{ color: '#16a34a' }} />
          <AlertDescription style={{ color: '#16a34a', fontWeight: '600' }}>
            {success}
          </AlertDescription>
        </Alert>
      )}
    </>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <PLEHeader />
        
        <AlertMessages />
        
        <QuickStats />

        <Card style={{
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList style={{
              display: 'flex',
              background: '#f8fafc',
              padding: '8px',
              gap: '4px'
            }}>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Activity },
                { id: 'generar', label: 'Generar PLE', icon: FileText },
                { id: 'archivos', label: 'Archivos', icon: Download },
                { id: 'validacion', label: 'Validación', icon: Shield },
                { id: 'configuracion', label: 'Configuración', icon: Settings }
              ].map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div style={{ padding: '24px' }}>
              <TabsContent value="dashboard">
                {estadisticas ? (
                  <PLEEstadisticas estadisticas={estadisticas} />
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p>Cargando estadísticas...</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="generar">
                <PLEFormGeneracionEnhanced
                  onGenerar={handleGeneracionPLE}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="archivos">
                <PLEArchivosTableEnhanced
                  archivos={archivos}
                  onRefresh={cargarDatosIniciales}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="validacion">
                <PLEValidacionPanel
                  resultados={validacionResultados}
                  estadisticas={validacionEstadisticas}
                  loading={loading}
                  onValidar={async () => console.log('Validar')}
                />
              </TabsContent>

              <TabsContent value="configuracion">
                <PLEConfiguracionComponent
                  configuracion={configuracion}
                  onGuardar={(config) => {
                    setConfiguracion(config);
                    setSuccess('Configuración guardada exitosamente');
                  }}
                  loading={loading}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Overlay de carga global */}
        {loading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: 'white',
              padding: '32px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              minWidth: '200px'
            }}>
              <Loader2 size={32} style={{
                animation: 'spin 1s linear infinite',
                color: '#667eea'
              }} />
              <p style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Procesando...
              </p>
            </div>
          </div>
        )}

        {/* CSS para animaciones */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default PLEGeneratorV3;
