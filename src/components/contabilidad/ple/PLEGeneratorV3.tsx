import React, { useState } from 'react';
import { PLEFormGeneracion } from './components/PLEFormGeneracion';
import { PLEPreview } from './components/PLEPreview';
import { PLEValidacionPanel } from './components/PLEValidacionPanel';

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
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Título y descripción */}
      <div>
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          🎯 Generar Archivo PLE SUNAT V3
        </h2>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#6b7280',
          lineHeight: '1.5'
        }}>
          Selecciona un libro diario y configura las opciones para generar un archivo PLE 
          en formato oficial SUNAT con 24 campos y compresión ZIP conforme.
        </p>
      </div>
      
      {/* Formulario de generación */}
      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <PLEFormGeneracion
          onGenerar={async () => {}}
          loading={generando}
        />
      </div>
      
      {/* Panel de validación */}
      {libroSeleccionado && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div>Validación Panel - En desarrollo</div>
          {/* <PLEValidacionPanel
            libroId={libroSeleccionado}
            onValidacionCompletada={handleValidacionCompletada}
            autoValidar={opciones.validar_antes_generar}
          /> */}
        </div>
      )}
      
      {/* Preview del archivo */}
      {libroSeleccionado && validacionRealizada && datosValidacion?.validacion?.es_valido && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div>Preview - En desarrollo</div>
          {/* <PLEPreview
            libroId={libroSeleccionado}
            empresaId={empresaId}
          /> */}
        </div>
      )}
      
      {/* Estado de generación */}
      {generando && (
        <div style={{
          background: '#dbeafe',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#1e40af'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid #93c5fd',
              borderTop: '3px solid #1e40af',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '16px', fontWeight: '500' }}>
              Generando archivo PLE...
            </span>
          </div>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: '#3730a3'
          }}>
            Este proceso puede tomar unos segundos dependiendo del tamaño del libro diario.
          </p>
        </div>
      )}
      
      {/* Información adicional */}
      <div style={{
        background: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151'
        }}>
          📋 Información del Proceso
        </h3>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '14px',
          color: '#6b7280',
          lineHeight: '1.6'
        }}>
          <li>El archivo se genera en formato oficial SUNAT de 24 campos</li>
          <li>Se incluye compresión ZIP automática según normativa</li>
          <li>La nomenclatura de archivos sigue el estándar: LE + RUC + FECHA + CÓDIGOS</li>
          <li>Se valida el balance contable (Debe = Haber) antes de generar</li>
          <li>Los metadatos incluyen hash MD5 para verificación de integridad</li>
        </ul>
      </div>
    </div>
  );
};
