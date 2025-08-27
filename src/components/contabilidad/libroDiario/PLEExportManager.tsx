import React, { useState, useEffect } from 'react';
import type { LibroDiario } from '../../../types/libroDiario';
import type { AsientoContable } from '../../../types/libroDiario';
import type { Empresa } from '../../../types/empresa';
import { 
  pleApiUnified, 
  type PLEGeneracionRequest, 
  type PLEGeneracionResponse,
  type PLEValidacionRequest,
  type PLEValidacionResponse,
  type PLEContextoResponse
} from '../../../services/pleApiUnified';

interface PLEExportManagerProps {
  libro: LibroDiario;
  empresa?: Empresa;
  asientos?: AsientoContable[];
  onClose?: () => void;
  onSuccess?: (archivo: PLEGeneracionResponse) => void;
  onError?: (error: string) => void;
}

interface PLEPeriodoConfig {
  ejercicio: number;
  mes: number;
  descripcion: string;
}

type PLEProcessStatus = 'idle' | 'loading-context' | 'validating' | 'generating' | 'downloading' | 'success' | 'error';

const PLEExportManager: React.FC<PLEExportManagerProps> = ({
  libro,
  empresa,
  asientos,
  onClose,
  onSuccess,
  onError
}) => {
  // Estados principales
  const [estado, setEstado] = useState<PLEProcessStatus>('idle');
  const [validacionResult, setValidacionResult] = useState<PLEValidacionResponse | null>(null);
  const [contextoLibro, setContextoLibro] = useState<PLEContextoResponse | null>(null);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para selección de período
  const [periodoConfig, setPeriodoConfig] = useState<PLEPeriodoConfig>(() => {
    const fechaActual = new Date();
    return {
      ejercicio: fechaActual.getFullYear(),
      mes: fechaActual.getMonth() + 1,
      descripcion: `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`
    };
  });

  // Auto-cargar contexto y validar al montar el componente
  useEffect(() => {
    cargarContextoYValidar();
  }, [libro.id]);

  const cargarContextoYValidar = async () => {
    if (!libro.id) return;
    setEstado('loading-context');
    setError(null);

    try {
      // 1. Cargar contexto automático del libro
      const contexto = await pleApiUnified.obtenerContexto(libro.id);
      setContextoLibro(contexto);
      
      // 2. Actualizar configuración de período con datos del contexto
      setPeriodoConfig({
        ejercicio: contexto.ejercicio,
        mes: contexto.mes,
        descripcion: `${contexto.ejercicio}-${String(contexto.mes).padStart(2, '0')}`
      });

      // 3. Validar datos para PLE
      await validarDatosParaPLE();
      
    } catch (error: any) {
      console.error('Error cargando contexto:', error);
      setError(error.message || 'Error al cargar contexto del libro');
      setEstado('error');
      onError?.(error.message || 'Error al cargar contexto del libro');
    }
  };

  const validarDatosParaPLE = async () => {
    setEstado('validating');
    setError(null);

    try {
      if (!libro.id) {
        throw new Error('No hay libro diario disponible');
      }

      // Preparar datos para validación
      const datosValidacion: PLEValidacionRequest = {
        libro_diario_id: libro.id,
        validar_estructura: true,
        validar_balanceo: true,
        validar_sunat: true
      };

      const resultado = await pleApiUnified.validarPLE(datosValidacion);
      setValidacionResult(resultado);
      setEstado('idle');

    } catch (error: any) {
      console.error('Error validando datos:', error);
      setError(error.message || 'Error al validar datos para PLE');
      setEstado('error');
      onError?.(error.message || 'Error al validar datos para PLE');
    }
  };

  const exportarPLE = async (formato: 'txt' | 'excel' = 'txt') => {
    if (!contextoLibro) {
      setError('No hay contexto del libro disponible');
      return;
    }
    setEstado('generating');
    setError(null);

    try {
      // Verificar validaciones si existen
      if (validacionResult && !validacionResult.valido) {
        const tieneErrores = validacionResult.errores.length > 0;
        
        if (tieneErrores) {
          const confirmar = window.confirm(
            `Se encontraron ${validacionResult.errores.length} errores. ¿Desea continuar con la exportación?`
          );
          
          if (!confirmar) {
            setEstado('idle');
            return;
          }
        }
      }

      // Preparar datos para generación
      const datosGeneracion: PLEGeneracionRequest = {
        libro_diario_id: libro.id,
        ejercicio: periodoConfig.ejercicio,
        mes: periodoConfig.mes,
        validar_antes_generar: true,
        incluir_metadatos: true,
        generar_zip: true,
        descargar_directo: false
      };

      const resultado = await pleApiUnified.generarPLE(datosGeneracion);

      if (resultado.success && resultado.archivo_nombre) {
        setEstado('success');
        onSuccess?.(resultado);
        
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        throw new Error('Error al generar archivo PLE');
      }

    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Error al exportar PLE';
      setError(errorMsg);
      setEstado('error');
      onError?.(errorMsg);
    }
  };

  const descargarPLEDirecto = async () => {
    if (!libro.id) {
      setError('No hay libro diario disponible');
      return;
    }
    setEstado('downloading');
    setError(null);

    try {
      // Descargar archivo ZIP directamente
      const blob = await pleApiUnified.descargarPLE(
        libro.id,
        periodoConfig.ejercicio,
        periodoConfig.mes
      );
      
      // Crear nombre del archivo basado en el contexto
      const ruc = contextoLibro?.ruc || '00000000000';
      const ejercicio = periodoConfig.ejercicio;
      const mes = String(periodoConfig.mes).padStart(2, '0');
      const nombreArchivo = `LE${ruc}${ejercicio}${mes}050100001.zip`;
      
      // Descargar archivo
      pleApiUnified.descargarArchivo(blob, nombreArchivo);

      setEstado('success');
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);

    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Error al descargar PLE';
      setError(errorMsg);
      setEstado('error');
      onError?.(errorMsg);
    }
  };

  const renderEstadoProgress = () => {
    const estadoTexto = {
      idle: 'Listo',
      validating: 'Validando...',
      generating: 'Generando archivo...',
      downloading: 'Descargando...',
      success: '¡Completado!',
      error: 'Error'
    };

    const estadoColor = {
      idle: '#6b7280',
      validating: '#3b82f6',
      generating: '#8b5cf6',
      downloading: '#10b981',
      success: '#059669',
      error: '#dc2626'
    };

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        marginBottom: '16px'
      }}>
        {estado === 'validating' || estado === 'generating' || estado === 'downloading' ? (
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #e5e7eb',
            borderTop: `2px solid ${estadoColor[estado]}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : (
          <span style={{ fontSize: '16px' }}>
            {estado === 'success' ? '✅' : estado === 'error' ? '❌' : '🔄'}
          </span>
        )}
        <span style={{ color: estadoColor[estado], fontSize: '14px', fontWeight: '500' }}>
          {estadoTexto[estado]}
        </span>
      </div>
    );
  };

  const renderEstadoGeneral = () => {
    if (!validacionResult) return null;

    const valido = validacionResult.valido;
    const erroresBasicos = validacionResult.validacion_basica?.errores || [];
    const erroresSunat = validacionResult.validacion_sunat?.errores || [];
    const warningsBasicos = validacionResult.validacion_basica?.warnings || [];
    const warningsSunat = validacionResult.validacion_sunat?.warnings || [];
    
    const erroresCriticos = erroresSunat.filter(e => e.critico).length;
    const totalWarnings = warningsBasicos.length + warningsSunat.length;
    const totalErrores = erroresBasicos.length + erroresSunat.length;

    return (
      <div style={{
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: valido ? '#10b981' : erroresCriticos > 0 ? '#ef4444' : '#f59e0b',
        backgroundColor: valido ? '#ecfdf5' : erroresCriticos > 0 ? '#fef2f2' : '#fffbeb',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '20px' }}>
            {valido ? '✅' : erroresCriticos > 0 ? '❌' : '⚠️'}
          </span>
          <h4 style={{ margin: 0, color: valido ? '#059669' : erroresCriticos > 0 ? '#dc2626' : '#d97706' }}>
            {valido ? 'Libro listo para exportar' : erroresCriticos > 0 ? 'Errores críticos encontrados' : 'Advertencias encontradas'}
          </h4>
        </div>
        
        <div style={{ fontSize: '14px', color: '#374151' }}>
          <p>📊 <strong>Asientos:</strong> {validacionResult.validacion_basica?.total_asientos || 0}</p>
          <p>💰 <strong>Balance:</strong> {validacionResult.validacion_basica?.balanceado ? 'Balanceado ✅' : 'Desbalanceado ❌'}</p>
          {erroresCriticos > 0 && (
            <p style={{ color: '#dc2626' }}>🚨 <strong>Errores críticos:</strong> {erroresCriticos}</p>
          )}
          {totalErrores > 0 && (
            <p style={{ color: '#dc2626' }}>❌ <strong>Total errores:</strong> {totalErrores}</p>
          )}
          {totalWarnings > 0 && (
            <p style={{ color: '#d97706' }}>⚠️ <strong>Advertencias:</strong> {totalWarnings}</p>
          )}
        </div>
      </div>
    );
  };

  const renderValidacionDetallada = () => {
    if (!validacionResult || !mostrarOpciones) return null;

    const erroresBasicos = validacionResult.validacion_basica?.errores || [];
    const erroresSunat = validacionResult.validacion_sunat?.errores || [];
    const warningsBasicos = validacionResult.validacion_basica?.warnings || [];
    const warningsSunat = validacionResult.validacion_sunat?.warnings || [];
    
    const todosLosErrores = [
      ...erroresBasicos,
      ...erroresSunat.map(e => e.mensaje)
    ];
    
    const todasLasAdvertencias = [
      ...warningsBasicos,
      ...warningsSunat.map(w => w.mensaje)
    ];

    return (
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          � Detalles de Validación
        </div>
        
        <div style={{ padding: '16px' }}>
          {todosLosErrores.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <h5 style={{ color: '#dc2626', marginBottom: '8px' }}>❌ Errores ({todosLosErrores.length}):</h5>
              {todosLosErrores.slice(0, 5).map((error, index) => (
                <p key={index} style={{ margin: '4px 0', fontSize: '13px', color: '#dc2626' }}>
                  • {error}
                </p>
              ))}
              {todosLosErrores.length > 5 && (
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  ... y {todosLosErrores.length - 5} errores más
                </p>
              )}
            </div>
          )}

          {todasLasAdvertencias.length > 0 && (
            <div>
              <h5 style={{ color: '#d97706', marginBottom: '8px' }}>⚠️ Advertencias ({todasLasAdvertencias.length}):</h5>
              {todasLasAdvertencias.slice(0, 3).map((warning, index) => (
                <p key={index} style={{ margin: '4px 0', fontSize: '13px', color: '#d97706' }}>
                  • {warning}
                </p>
              ))}
              {todasLasAdvertencias.length > 3 && (
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  ... y {todasLasAdvertencias.length - 3} advertencias más
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBotonesAccion = () => {
    const puedeGenerar = estado === 'idle' && validacionResult?.valido;
    const puedeDescargar = estado === 'idle';

    return (
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Botón de Descarga Directa - PRINCIPAL */}
        <button
          onClick={descargarPLEDirecto}
          disabled={!puedeDescargar}
          style={{
            flex: '1',
            minWidth: '200px',
            padding: '14px 20px',
            backgroundColor: puedeDescargar ? '#10b981' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: puedeDescargar ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          title="Descargar archivo PLE ZIP directamente"
        >
          {estado === 'downloading' ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid white',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Descargando...
            </>
          ) : (
            <>
              📥 Descargar ZIP PLE
            </>
          )}
        </button>

        {/* Botón de Generar (proceso en 2 pasos) */}
        <button
          onClick={() => exportarPLE('txt')}
          disabled={!puedeGenerar}
          style={{
            padding: '12px 18px',
            backgroundColor: puedeGenerar ? '#3b82f6' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: puedeGenerar ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Generar archivo PLE (2 pasos)"
        >
          {estado === 'generating' ? (
            <>
              <div style={{
                width: '14px',
                height: '14px',
                border: '2px solid white',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Generando...
            </>
          ) : (
            <>
              🔄 Generar PLE
            </>
          )}
        </button>

        {/* Botón de Re-validación */}
        <button
          onClick={() => validarDatosParaPLE()}
          disabled={estado !== 'idle'}
          style={{
            padding: '12px 18px',
            backgroundColor: estado === 'idle' ? '#f3f4f6' : '#e5e7eb',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: estado === 'idle' ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Re-validar datos del libro"
        >
          {estado === 'validating' ? (
            <>
              <div style={{
                width: '14px',
                height: '14px',
                border: '2px solid #374151',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Validando...
            </>
          ) : (
            <>
              🔍 Re-validar
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ margin: 0, color: '#1f2937' }}>
            📋 Exportar a PLE - SUNAT
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#374151'
        }}>
          <p><strong>📖 Libro:</strong> {libro.descripcion}</p>
          <p><strong>🏢 RUC:</strong> {libro.ruc}</p>
          <p><strong>📅 Período:</strong> {libro.periodo}</p>
          <p><strong>📝 Asientos:</strong> {libro.asientos?.length || 0}</p>
        </div>

        {/* Selección de Período PLE */}
        <div style={{
          padding: '16px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          marginBottom: '16px',
          backgroundColor: 'white'
        }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '16px', 
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 Período PLE para SUNAT
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '4px'
              }}>
                Año
              </label>
              <select
                value={periodoConfig.ejercicio}
                onChange={(e) => {
                  const nuevoEjercicio = parseInt(e.target.value);
                  setPeriodoConfig(prev => ({
                    ...prev,
                    ejercicio: nuevoEjercicio,
                    descripcion: `${nuevoEjercicio}-${String(prev.mes).padStart(2, '0')}`
                  }));
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const año = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={año} value={año}>
                      {año}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '4px'
              }}>
                Mes
              </label>
              <select
                value={periodoConfig.mes}
                onChange={(e) => {
                  const nuevoMes = parseInt(e.target.value);
                  setPeriodoConfig(prev => ({
                    ...prev,
                    mes: nuevoMes,
                    descripcion: `${prev.ejercicio}-${String(nuevoMes).padStart(2, '0')}`
                  }));
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const mes = i + 1;
                  const nombreMes = new Date(2000, i, 1).toLocaleString('es-ES', { month: 'long' });
                  return (
                    <option key={mes} value={mes}>
                      {mes.toString().padStart(2, '0')} - {nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            💡 <strong>Período seleccionado:</strong> {periodoConfig.descripcion}
          </div>
        </div>

        {renderEstadoProgress()}

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            ❌ {error}
          </div>
        )}

        {renderEstadoGeneral()}
        {renderValidacionDetallada()}
        {renderEstadoProgress()}
        {renderBotonesAccion()}
      </div>
    </>
  );
};

export default PLEExportManager;
