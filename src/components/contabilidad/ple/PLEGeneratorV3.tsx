import React, { useState } from 'react';
import { PLEFormGeneracion } from './components/PLEFormGeneracionUnified';
import { PLEPreview } from './components/PLEPreview';
import { PLEValidacionPanel } from './components/PLEValidacionPanel';
import { pleApiService, PLEApiService } from '../../../services/pleApi';
import type { PLEGeneracionData } from '../../../services/pleApi';
import './PLEGeneratorV3.css';

interface PLEGeneratorV3Props {
  empresaId: string;
  dashboardData?: any;
  onRefresh?: () => void;
}

export const PLEGeneratorV3: React.FC<PLEGeneratorV3Props> = ({
  empresaId,
  dashboardData,
  onRefresh
}) => {
  const [libroSeleccionado, setLibroSeleccionado] = useState<string>('');
  const [opciones, setOpciones] = useState({
    validar_antes_generar: true,
    incluir_metadatos: true,
    generar_zip: true
  });
  const [generando, setGenerando] = useState(false);
  const [validacionRealizada, setValidacionRealizada] = useState(false);
  const [datosValidacion, setDatosValidacion] = useState<any>(null);
  
  const handleLibroSeleccionado = (libroId: string) => {
    setLibroSeleccionado(libroId);
    setValidacionRealizada(false);
    setDatosValidacion(null);
  };
  
  const handleValidacionCompletada = (resultados: any) => {
    setValidacionRealizada(true);
    setDatosValidacion(resultados);
  };
  
  const handleGeneracionCompletada = () => {
    setGenerando(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleGenerar = async (formData: PLEGeneracionData) => {
    setGenerando(true);
    try {
      
      // Usar el servicio API unificado
      const resultado = await pleApiService.generarPLE(formData);

      if (resultado.success) {
        
        if (resultado.errores.length > 0) {
          console.warn('⚠️ Errores encontrados:', resultado.errores);
        }
        
        if (resultado.advertencias.length > 0) {
          console.warn('⚠️ Advertencias:', resultado.advertencias);
        }
        
        // Llamar callback de actualización
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error('❌ Error en la generación:', resultado);
      }
      
    } catch (error) {
      console.error('💥 Error generando PLE:', error);
      const mensajeError = PLEApiService.handleApiError(error);
      console.error('📝 Mensaje de error procesado:', mensajeError);
    } finally {
      setGenerando(false);
    }
  };
  
  return (
    <div className="ple-generator">
      {/* Título y descripción */}
      <div className="ple-generator__header">
        <h2 className="ple-generator__title">
          🎯 Generar Archivo PLE SUNAT V3
        </h2>
        <p className="ple-generator__description">
          Configure los parámetros y genere archivos PLE en formato oficial SUNAT 
          con validación automática y compresión ZIP conforme a normativa vigente.
        </p>
      </div>
      
      <div className="ple-generator__content">
        {/* Formulario de generación */}
        <div className="ple-generator__section">
          <PLEFormGeneracion
            onGenerar={handleGenerar}
            loading={generando}
            empresaId={empresaId}
            libroSeleccionado={libroSeleccionado}
          />
        </div>
        
        {/* Panel de validación */}
        {libroSeleccionado && (
          <div className="ple-generator__section">
            <div className="alert alert-warning">
              <div className="ple-generator__validation-header">
                <h3>⚠️ Panel de Validación</h3>
                <p>Esta funcionalidad está en desarrollo. Próximamente incluirá validación automática de balances contables.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Preview del archivo */}
        {libroSeleccionado && validacionRealizada && datosValidacion?.validacion?.es_valido && (
          <div className="ple-generator__section">
            <div className="alert alert-success">
              <div className="ple-generator__preview-header">
                <h3>✅ Vista Previa del Archivo</h3>
                <p>El archivo ha sido validado correctamente y está listo para generar.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Estado de generación */}
        {generando && (
          <div className="ple-generator__section">
            <div className="ple-generator__loading">
              <div className="ple-generator__loading-content">
                <div className="loading-spinner animate-spin" />
                <div className="ple-generator__loading-text">
                  <h3>🔄 Generando Archivo PLE</h3>
                  <p>Este proceso puede tomar unos segundos dependiendo del tamaño del libro diario.</p>
                </div>
              </div>
              
              <div className="ple-generator__progress">
                <div className="ple-generator__progress-bar">
                  <div className="ple-generator__progress-fill animate-pulse"></div>
                </div>
                <div className="ple-generator__progress-text">
                  Procesando datos contables...
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Información adicional */}
        <div className="ple-generator__section">
          <div className="ple-generator__info">
            <h3 className="ple-generator__info-title">
              📋 Información del Proceso PLE
            </h3>
            
            <div className="ple-generator__info-grid">
              <div className="ple-generator__info-item">
                <div className="ple-generator__info-icon">📄</div>
                <div className="ple-generator__info-content">
                  <h4>Formato Oficial SUNAT</h4>
                  <p>Archivos generados con 24 campos según especificaciones técnicas V3</p>
                </div>
              </div>
              
              <div className="ple-generator__info-item">
                <div className="ple-generator__info-icon">🗜️</div>
                <div className="ple-generator__info-content">
                  <h4>Compresión ZIP</h4>
                  <p>Compresión automática según normativa SUNAT para optimizar envío</p>
                </div>
              </div>
              
              <div className="ple-generator__info-item">
                <div className="ple-generator__info-icon">📝</div>
                <div className="ple-generator__info-content">
                  <h4>Nomenclatura Estándar</h4>
                  <p>Nombres de archivo siguen formato: LE + RUC + FECHA + CÓDIGOS</p>
                </div>
              </div>
              
              <div className="ple-generator__info-item">
                <div className="ple-generator__info-icon">⚖️</div>
                <div className="ple-generator__info-content">
                  <h4>Validación Contable</h4>
                  <p>Verificación automática de balance (Debe = Haber) antes de generar</p>
                </div>
              </div>
              
              <div className="ple-generator__info-item">
                <div className="ple-generator__info-icon">🔐</div>
                <div className="ple-generator__info-content">
                  <h4>Integridad de Datos</h4>
                  <p>Metadatos incluyen hash MD5 para verificación de integridad</p>
                </div>
              </div>
              
              <div className="ple-generator__info-item">
                <div className="ple-generator__info-icon">📊</div>
                <div className="ple-generator__info-content">
                  <h4>Trazabilidad Completa</h4>
                  <p>Registro detallado de cada archivo generado para auditoría</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
