import React, { useState, useEffect } from 'react';
import type { LibroDiario } from '../../../types/libroDiario';
import type { 
  PLEValidationResult, 
  PLEExportOptions, 
  PLEProcessStatus
} from '../../../types/pleTypes';
import { PLE_DEFAULT_OPTIONS } from '../../../types/pleTypes';
import { pleApiService } from '../../../services/pleApi';

interface PLEExportManagerProps {
  libro: LibroDiario;
  onClose?: () => void;
  onSuccess?: (mensaje: string) => void;
  onError?: (error: string) => void;
}

interface PLEPeriodoConfig {
  año: number;
  mes: number;
  descripcion: string;
}

const PLEExportManager: React.FC<PLEExportManagerProps> = ({
  libro,
  onClose,
  onSuccess,
  onError
}) => {
  // Estados principales
  const [estado, setEstado] = useState<PLEProcessStatus>('idle');
  const [validacionResult, setValidacionResult] = useState<PLEValidationResult | null>(null);
  const [opciones, setOpciones] = useState<PLEExportOptions>(PLE_DEFAULT_OPTIONS);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para selección de período
  const [periodoConfig, setPeriodoConfig] = useState<PLEPeriodoConfig>(() => {
    const fechaActual = new Date();
    return {
      año: fechaActual.getFullYear(),
      mes: fechaActual.getMonth() + 1,
      descripcion: `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`
    };
  });

  // Auto-validar al montar el componente
  useEffect(() => {
    validarLibro();
  }, [libro.id]);

  const validarLibro = async () => {
    if (!libro.id) return;
    setEstado('validating');
    setError(null);

    try {
      // Crear datos de generación a partir del libro y configuración
      const datosGeneracion = {
        ejercicio: periodoConfig.año,
        mes: periodoConfig.mes,
        ruc: libro.ruc,
        razonSocial: libro.razonSocial || 'Empresa',
        fechaInicio: `${periodoConfig.año}-${periodoConfig.mes.toString().padStart(2, '0')}-01`,
        fechaFin: `${periodoConfig.año}-${periodoConfig.mes.toString().padStart(2, '0')}-31`,
        incluirCierreEjercicio: false,
        observaciones: ''
      };

      const resultado = await pleApiService.validarPLE(datosGeneracion);
      
      // Mapear el resultado al formato esperado por este componente
      const resultadoMapeado: PLEValidationResult = {
        exito: resultado.success,
        libro_id: libro.id,
        valido: resultado.resultados.every(r => r.tipo !== 'error'),
        validacion_basica: {
          valido: true,
          total_asientos: 0,
          total_debe: '0.00',
          total_haber: '0.00',
          balanceado: true,
          errores: [],
          warnings: []
        },
        validacion_sunat: {
          valido: resultado.resultados.every(r => r.tipo !== 'error'),
          total_registros: resultado.estadisticas.totalRegistros,
          registros_validados: resultado.estadisticas.registrosValidos,
          errores: resultado.resultados.filter(r => r.tipo === 'error').map(r => ({
            codigo: r.codigo,
            tabla: '',
            campo: r.campo || '',
            valor: '',
            mensaje: r.mensaje,
            critico: r.tipo === 'error',
            sugerencia: r.sugerencia
          })),
          warnings: resultado.resultados.filter(r => r.tipo === 'advertencia').map(r => ({
            codigo: r.codigo,
            tabla: '',
            campo: r.campo || '',
            valor: '',
            mensaje: r.mensaje,
            sugerencia: r.sugerencia
          })),
          datos_enriquecidos: 0,
          estadisticas: {
            total_errores: resultado.estadisticas.registrosConErrores,
            total_warnings: resultado.estadisticas.registrosConAdvertencias,
            errores_criticos: resultado.estadisticas.registrosConErrores,
            porcentaje_validado: resultado.estadisticas.porcentajeValidez,
            cuentas_validadas: resultado.estadisticas.registrosValidos,
            tiempo_validacion: 0
          },
          tiempo_validacion: 0
        }
      };
      
      setValidacionResult(resultadoMapeado);
      setEstado('idle');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Error al validar el libro';
      setError(errorMsg);
      setEstado('error');
      onError?.(errorMsg);
    }
  };

  const exportarPLE = async (formato: 'txt' | 'zip' = 'zip') => {
    if (!libro.id) return;
    setEstado('generating');
    setError(null);

    try {
      if (validacionResult && !validacionResult.valido) {
        const erroresCriticos = validacionResult.validacion_sunat.errores.filter(e => e.critico);
        
        if (erroresCriticos.length > 0 && !opciones.fallar_en_errores_criticos) {
          const confirmar = window.confirm(
            `Se encontraron ${erroresCriticos.length} errores críticos. ¿Desea continuar con la exportación?`
          );
          
          if (!confirmar) {
            setEstado('idle');
            return;
          }
        }
      }

      setEstado('downloading');
      
      // Usar el período seleccionado por el usuario
      const periodoFormateado = periodoConfig.descripcion.replace('-', '');
      
      await pleApiService.descargarConNombreAutomatico(
        libro.id,
        libro.ruc,
        periodoFormateado,
        formato
      );

      setEstado('success');
      onSuccess?.(`Archivo PLE descargado exitosamente (${formato.toUpperCase()}) para el período ${periodoConfig.descripcion}`);
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Error al exportar PLE';
      setError(errorMsg);
      setEstado('error');
      onError?.(errorMsg);
    }
  };

  const renderIndicadorProgreso = () => {
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

    const { valido, validacion_basica, validacion_sunat } = validacionResult;
    const erroresCriticos = validacion_sunat.errores.filter(e => e.critico).length;
    const totalWarnings = validacion_basica.warnings.length + validacion_sunat.warnings.length;

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
          <p>📊 <strong>Asientos:</strong> {validacion_basica.total_asientos}</p>
          <p>💰 <strong>Balance:</strong> {validacion_basica.balanceado ? 'Balanceado ✅' : 'Desbalanceado ❌'}</p>
          {erroresCriticos > 0 && (
            <p style={{ color: '#dc2626' }}>🚨 <strong>Errores críticos:</strong> {erroresCriticos}</p>
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

    const { validacion_basica, validacion_sunat } = validacionResult;

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
          📋 Detalle de Validación
        </div>
        
        <div style={{ padding: '16px' }}>
          {validacion_basica.errores.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <h5 style={{ color: '#dc2626', marginBottom: '8px' }}>❌ Errores Básicos:</h5>
              {validacion_basica.errores.map((error, index) => (
                <p key={index} style={{ margin: '4px 0', fontSize: '13px', color: '#dc2626' }}>
                  • {error}
                </p>
              ))}
            </div>
          )}

          {validacion_sunat.errores.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <h5 style={{ color: '#dc2626', marginBottom: '8px' }}>🚨 Errores SUNAT:</h5>
              {validacion_sunat.errores.slice(0, 5).map((error, index) => (
                <p key={index} style={{ margin: '4px 0', fontSize: '13px', color: error.critico ? '#dc2626' : '#d97706' }}>
                  • <strong>{error.tabla}:</strong> {error.mensaje} {error.critico ? '(Crítico)' : ''}
                </p>
              ))}
              {validacion_sunat.errores.length > 5 && (
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  ... y {validacion_sunat.errores.length - 5} errores más
                </p>
              )}
            </div>
          )}

          {(validacion_basica.warnings.length > 0 || validacion_sunat.warnings.length > 0) && (
            <div>
              <h5 style={{ color: '#d97706', marginBottom: '8px' }}>⚠️ Advertencias:</h5>
              {[...validacion_basica.warnings, ...validacion_sunat.warnings.map(w => w.mensaje)]
                .slice(0, 3)
                .map((warning, index) => (
                  <p key={index} style={{ margin: '4px 0', fontSize: '13px', color: '#d97706' }}>
                    • {warning}
                  </p>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBotonesAccion = () => {
    const puedeExportar = validacionResult?.valido || !opciones.fallar_en_errores_criticos;

    return (
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button
          onClick={() => exportarPLE('txt')}
          disabled={estado !== 'idle' || !puedeExportar}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: puedeExportar ? '#3b82f6' : '#9ca3af',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: puedeExportar ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📄 Descargar TXT
        </button>

        <button
          onClick={() => exportarPLE('zip')}
          disabled={estado !== 'idle' || !puedeExportar}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: puedeExportar ? '#10b981' : '#9ca3af',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: puedeExportar ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📦 Descargar ZIP
        </button>

        <button
          onClick={() => setMostrarOpciones(!mostrarOpciones)}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            backgroundColor: mostrarOpciones ? '#f3f4f6' : 'white',
            color: '#374151',
            fontSize: '14px',
            cursor: 'pointer'
          }}
          title="Ver detalles de validación"
        >
          📋
        </button>

        <button
          onClick={validarLibro}
          disabled={estado !== 'idle'}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            backgroundColor: 'white',
            color: '#374151',
            fontSize: '14px',
            cursor: estado === 'idle' ? 'pointer' : 'not-allowed'
          }}
          title="Re-validar libro"
        >
          🔄
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
                value={periodoConfig.año}
                onChange={(e) => {
                  const nuevoAño = parseInt(e.target.value);
                  setPeriodoConfig(prev => ({
                    ...prev,
                    año: nuevoAño,
                    descripcion: `${nuevoAño}-${String(prev.mes).padStart(2, '0')}`
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
                    descripcion: `${prev.año}-${String(nuevoMes).padStart(2, '0')}`
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

        {renderIndicadorProgreso()}

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
        {renderBotonesAccion()}
      </div>
    </>
  );
};

export default PLEExportManager;
