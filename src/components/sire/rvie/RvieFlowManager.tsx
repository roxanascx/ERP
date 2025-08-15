import React, { useState, useEffect } from 'react';

// Componentes UI simples
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow border ${className}`}>{children}</div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4">{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  className?: string;
}> = ({ children, onClick, disabled = false, variant = 'default', className = '' }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = variant === 'outline' 
    ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
    : 'bg-blue-600 text-white hover:bg-blue-700';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
};

const Alert: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 rounded-md border ${className}`}>{children}</div>
);

const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

// Iconos simples con SVG
const Loader2: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
    <path fill="currentColor" className="opacity-75" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Download: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckCircle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Play: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Eye: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

interface RvieFlowData {
  ruc: string;
  periodo: string;
  timestamp_inicio: string;
  pasos_ejecutados: Array<{
    paso: string;
    estado: string;
    timestamp: string;
    detalles?: any;
    error?: string;
  }>;
  estado_final: string;
  propuesta?: {
    cantidad_comprobantes: number;
    total_importe: number;
    estado: string;
    fecha_generacion: string;
  };
  errores: string[];
  tiempo_total_segundos?: number;
  siguiente_paso?: string;
}

interface RvieEstado {
  ruc: string;
  periodo: string;
  estado: string;
  cantidad_comprobantes?: number;
  total_importe?: number;
  fecha_generacion?: string;
  fecha_aceptacion?: string;
  siguiente_accion?: string;
  mensaje?: string;
}

const RvieFlowManager: React.FC = () => {
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [periodo, setPeriodo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [flowData, setFlowData] = useState<RvieFlowData | null>(null);
  const [estadoActual, setEstadoActual] = useState<RvieEstado | null>(null);
  const [error, setError] = useState<string>('');
  const [autoAceptar, setAutoAceptar] = useState<boolean>(true);

  // Generar período actual por defecto
  useEffect(() => {
    const now = new Date();
    const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1);
    const periodoDefault = `${mesAnterior.getFullYear()}${(mesAnterior.getMonth() + 1).toString().padStart(2, '0')}`;
    setPeriodo(periodoDefault);
  }, []);

  // Cargar estado actual cuando cambian RUC/período
  useEffect(() => {
    if (selectedEmpresa && periodo) {
      cargarEstadoActual();
    }
  }, [selectedEmpresa, periodo]);

  const cargarEstadoActual = async () => {
    if (!selectedEmpresa || !periodo) return;

    try {
      const response = await fetch(`/api/v1/sire/rvie/estado/${selectedEmpresa}/${periodo}`);
      const result = await response.json();
      
      if (result.success) {
        setEstadoActual(result.data);
      }
    } catch (err) {
      console.error('Error cargando estado:', err);
    }
  };

  const ejecutarFlujoCompleto = async () => {
    if (!selectedEmpresa || !periodo) {
      setError('Debe seleccionar empresa y período');
      return;
    }

    setLoading(true);
    setError('');
    setFlowData(null);

    try {
      const response = await fetch(
        `/api/v1/sire/rvie/flujo-completo/${selectedEmpresa}/${periodo}?auto_aceptar=${autoAceptar}&incluir_detalle=true`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setFlowData(result.data);
        // Recargar estado actual después del flujo
        await cargarEstadoActual();
      } else {
        setError(result.detail || 'Error ejecutando flujo completo');
      }
    } catch (err: any) {
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
    const colores = {
      'NO_INICIADO': 'bg-gray-500',
      'PENDIENTE': 'bg-yellow-500',
      'PROPUESTA': 'bg-blue-500',
      'ACEPTADO': 'bg-green-500',
      'PRELIMINAR': 'bg-purple-500',
      'FINALIZADO': 'bg-green-600',
      'ERROR': 'bg-red-500',
      'LISTO_PARA_PRELIMINAR': 'bg-green-500'
    };
    return colores[estado as keyof typeof colores] || 'bg-gray-500';
  };

  const getPasoIcon = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            SIRE RVIE - Gestor de Flujo Completo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Flujo completo según Manual SUNAT v25: Descargar propuesta → Aceptar propuesta → Preparar registro preliminar
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Selector de Empresa */}
            <div>
              <label className="block text-sm font-medium mb-2">RUC Empresa</label>
              <input
                type="text"
                value={selectedEmpresa}
                onChange={(e) => setSelectedEmpresa(e.target.value)}
                placeholder="Ej: 20123456789"
                className="w-full p-2 border rounded-md"
                maxLength={11}
              />
            </div>
            
            {/* Selector de Período */}
            <div>
              <label className="block text-sm font-medium mb-2">Período (YYYYMM)</label>
              <input
                type="text"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                placeholder="Ej: 202412"
                className="w-full p-2 border rounded-md"
                maxLength={6}
              />
            </div>
            
            {/* Opciones */}
            <div>
              <label className="block text-sm font-medium mb-2">Opciones</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-aceptar"
                  checked={autoAceptar}
                  onChange={(e) => setAutoAceptar(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="auto-aceptar" className="text-sm">
                  Aceptar automáticamente
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <Button
              onClick={ejecutarFlujoCompleto}
              disabled={loading || !selectedEmpresa || !periodo}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Ejecutar Flujo Completo
            </Button>
            
            <Button
              variant="outline"
              onClick={cargarEstadoActual}
              disabled={!selectedEmpresa || !periodo}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Ver Estado Actual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Estado Actual */}
      {estadoActual && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Estado Actual del Proceso</span>
              <Badge className={`${getEstadoBadgeColor(estadoActual.estado)} text-white`}>
                {estadoActual.estado}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">RUC: {estadoActual.ruc}</p>
                <p className="text-sm text-gray-600">Período: {estadoActual.periodo}</p>
                {estadoActual.cantidad_comprobantes !== undefined && (
                  <p className="text-sm text-gray-600">
                    Comprobantes: {estadoActual.cantidad_comprobantes.toLocaleString()}
                  </p>
                )}
                {estadoActual.total_importe !== undefined && (
                  <p className="text-sm text-gray-600">
                    Total: S/ {estadoActual.total_importe.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              
              <div>
                {estadoActual.fecha_generacion && (
                  <p className="text-sm text-gray-600">
                    Generado: {new Date(estadoActual.fecha_generacion).toLocaleString('es-PE')}
                  </p>
                )}
                {estadoActual.fecha_aceptacion && (
                  <p className="text-sm text-gray-600">
                    Aceptado: {new Date(estadoActual.fecha_aceptacion).toLocaleString('es-PE')}
                  </p>
                )}
                {estadoActual.siguiente_accion && (
                  <p className="text-sm font-medium text-blue-600 mt-2">
                    Siguiente: {estadoActual.siguiente_accion}
                  </p>
                )}
              </div>
            </div>
            
            {estadoActual.mensaje && (
              <Alert className="mt-4">
                <AlertDescription>{estadoActual.mensaje}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resultado del Flujo */}
      {flowData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultado del Flujo Completo</span>
              <Badge className={`${getEstadoBadgeColor(flowData.estado_final)} text-white`}>
                {flowData.estado_final}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Resumen */}
            {flowData.propuesta && (
              <div className="grid md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {flowData.propuesta.cantidad_comprobantes.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Comprobantes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    S/ {flowData.propuesta.total_importe.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-600">Total Importe</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {flowData.tiempo_total_segundos?.toFixed(1)}s
                  </p>
                  <p className="text-sm text-gray-600">Tiempo Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {flowData.pasos_ejecutados.length}
                  </p>
                  <p className="text-sm text-gray-600">Pasos</p>
                </div>
              </div>
            )}

            {/* Pasos Ejecutados */}
            <div className="space-y-3">
              <h4 className="font-medium">Pasos Ejecutados:</h4>
              {flowData.pasos_ejecutados.map((paso, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getPasoIcon(paso.estado)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {paso.paso.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(paso.timestamp).toLocaleTimeString('es-PE')}
                      </span>
                    </div>
                    
                    {paso.detalles && (
                      <div className="text-sm text-gray-600 mt-1">
                        {typeof paso.detalles === 'object' ? (
                          <div>
                            {paso.detalles.comprobantes && (
                              <span>Comprobantes: {paso.detalles.comprobantes.toLocaleString()} </span>
                            )}
                            {paso.detalles.total && (
                              <span>Total: S/ {paso.detalles.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                            )}
                          </div>
                        ) : (
                          <span>{paso.detalles}</span>
                        )}
                      </div>
                    )}
                    
                    {paso.error && (
                      <Alert className="mt-2 border-red-200 bg-red-50">
                        <AlertDescription className="text-red-700 text-sm">
                          {paso.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Errores */}
            {flowData.errores.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-600 mb-2">Errores Encontrados:</h4>
                {flowData.errores.map((error, index) => (
                  <Alert key={index} className="mb-2 border-red-200 bg-red-50">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Siguiente Paso */}
            {flowData.siguiente_paso && (
              <Alert className="mt-4 border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-700">
                  <strong>Siguiente paso:</strong> {flowData.siguiente_paso}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RvieFlowManager;
