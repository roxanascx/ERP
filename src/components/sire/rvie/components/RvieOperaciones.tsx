/**
 * Componente para gestionar las operaciones RVIE
 * Descargar y Aceptar Propuesta
 */

import { useState } from 'react';
import type { RvieDescargarPropuestaRequest, RvieAceptarPropuestaRequest } from '../../../../types/sire';
import './rvie-components.css';

interface RvieOperacionesProps {
  periodo: { año: string; mes: string };
  authStatus: any;
  loading: boolean;
  operacionActiva: string | null;
  onDescargarPropuesta: (params: RvieDescargarPropuestaRequest) => Promise<void>;
  onAceptarPropuesta: (params: RvieAceptarPropuestaRequest) => Promise<void>;
}

interface OpcionesDescarga {
  forzar_descarga: boolean;
  incluir_detalle: boolean;
}

interface OpcionesAceptacion {
  acepta_completa: boolean;
  observaciones: string;
}

export default function RvieOperaciones({
  periodo,
  authStatus,
  loading,
  operacionActiva,
  onDescargarPropuesta,
  onAceptarPropuesta
}: RvieOperacionesProps) {
  console.log('🔧 [RvieOperaciones] Renderizando con:', { periodo, authStatus, loading, operacionActiva });

  // Estados para opciones avanzadas
  const [mostrarOpcionesAvanzadas, setMostrarOpcionesAvanzadas] = useState(false);
  const [opcionesDescarga, setOpcionesDescarga] = useState<OpcionesDescarga>({
    forzar_descarga: false,
    incluir_detalle: true
  });

  const [opcionesAceptacion, setOpcionesAceptacion] = useState<OpcionesAceptacion>({
    acepta_completa: true,
    observaciones: ''
  });

  const handleDescargarPropuesta = async () => {
    await onDescargarPropuesta({
      periodo: `${periodo.año}${periodo.mes}`,
      forzar_descarga: opcionesDescarga.forzar_descarga,
      incluir_detalle: opcionesDescarga.incluir_detalle
    });
  };

  const handleAceptarPropuesta = async () => {
    await onAceptarPropuesta({
      periodo: `${periodo.año}${periodo.mes}`,
      acepta_completa: opcionesAceptacion.acepta_completa,
      observaciones: opcionesAceptacion.observaciones || undefined
    });
  };

  return (
    <div className="operaciones-rvie">
      <h3>🔧 Operaciones RVIE</h3>

      {/* Descargar Propuesta */}
      <div className="operacion-card">
        <h4>📥 Descargar Propuesta SUNAT</h4>
        <p>Descarga la propuesta de ventas e ingresos generada por SUNAT para el período seleccionado.</p>
        {!authStatus?.authenticated && (
          <div className="warning-message">
            <p>⚠️ <strong>Advertencia:</strong> Necesita autenticación SUNAT para acceder a datos reales.</p>
          </div>
        )}
        
        {/* Opciones avanzadas de descarga */}
        <div className="opciones-avanzadas">
          <button 
            type="button"
            className="btn-toggle-opciones"
            onClick={() => setMostrarOpcionesAvanzadas(!mostrarOpcionesAvanzadas)}
          >
            {mostrarOpcionesAvanzadas ? '▼' : '▶'} Opciones Avanzadas
          </button>
          
          {mostrarOpcionesAvanzadas && (
            <div className="opciones-contenido">
              <div className="opcion-item">
                <label>
                  <input
                    type="checkbox"
                    checked={opcionesDescarga.forzar_descarga}
                    onChange={(e) => setOpcionesDescarga(prev => ({
                      ...prev,
                      forzar_descarga: e.target.checked
                    }))}
                  />
                  🔄 Forzar nueva descarga (ignorar cache)
                </label>
                <small>Descarga nuevamente desde SUNAT aunque ya exista en cache</small>
              </div>
              
              <div className="opcion-item">
                <label>
                  <input
                    type="checkbox"
                    checked={opcionesDescarga.incluir_detalle}
                    onChange={(e) => setOpcionesDescarga(prev => ({
                      ...prev,
                      incluir_detalle: e.target.checked
                    }))}
                  />
                  📋 Incluir detalle completo
                </label>
                <small>Incluye información detallada de cada comprobante</small>
              </div>
            </div>
          )}
        </div>
        
        <button 
          className="btn-primary"
          onClick={handleDescargarPropuesta}
          disabled={loading || operacionActiva === 'descargar_propuesta'}
        >
          {operacionActiva === 'descargar_propuesta' ? 'Descargando...' : 'Descargar Propuesta'}
        </button>
      </div>

      {/* Aceptar Propuesta */}
      <div className="operacion-card">
        <h4>✅ Aceptar Propuesta</h4>
        <p>Acepta la propuesta de SUNAT con opciones de personalización.</p>
        {!authStatus?.authenticated && (
          <div className="warning-message">
            <p>⚠️ <strong>Advertencia:</strong> Necesita autenticación SUNAT para realizar esta operación.</p>
          </div>
        )}
        
        {/* Opciones de aceptación */}
        <div className="opciones-aceptacion">
          <div className="opcion-item">
            <label>
              <input
                type="radio"
                name="tipo_aceptacion"
                checked={opcionesAceptacion.acepta_completa}
                onChange={() => setOpcionesAceptacion(prev => ({
                  ...prev,
                  acepta_completa: true
                }))}
              />
              ✅ Aceptación completa
            </label>
            <small>Acepta toda la propuesta de SUNAT sin modificaciones</small>
          </div>
          
          <div className="opcion-item">
            <label>
              <input
                type="radio"
                name="tipo_aceptacion"
                checked={!opcionesAceptacion.acepta_completa}
                onChange={() => setOpcionesAceptacion(prev => ({
                  ...prev,
                  acepta_completa: false
                }))}
              />
              ⚠️ Aceptación parcial
            </label>
            <small>Acepta solo parte de la propuesta (requiere justificación)</small>
          </div>
          
          <div className="opcion-item">
            <label htmlFor="observaciones">📝 Observaciones (opcional):</label>
            <textarea
              id="observaciones"
              placeholder="Ingrese observaciones sobre la aceptación (máx. 500 caracteres)"
              maxLength={500}
              value={opcionesAceptacion.observaciones}
              onChange={(e) => setOpcionesAceptacion(prev => ({
                ...prev,
                observaciones: e.target.value
              }))}
              rows={3}
            />
            <small>{opcionesAceptacion.observaciones.length}/500 caracteres</small>
          </div>
        </div>
        
        <button 
          className="btn-success"
          onClick={handleAceptarPropuesta}
          disabled={loading || operacionActiva === 'aceptar_propuesta'}
        >
          {operacionActiva === 'aceptar_propuesta' ? 'Procesando...' : 'Aceptar Propuesta'}
        </button>
      </div>
    </div>
  );
}
