/**
 * Componente para gestionar las ventas e ingresos
 * Visualización, análisis y gestión de comprobantes
 */

import { useState, useEffect } from 'react';
import type { RvieComprobante } from '../../../../types/sire';
import './rvie-components.css';

interface RvieVentasProps {
  ruc: string;
  periodo: { año: string; mes: string };
  authStatus: any;
  loading: boolean;
}

interface VentasStats {
  total_comprobantes: number;
  total_monto: number;
  por_tipo: Record<string, { cantidad: number; monto: number }>;
  por_estado: Record<string, number>;
}

export default function RvieVentas({
  ruc,
  periodo,
  authStatus,
  loading
}: RvieVentasProps) {
  console.log('💰 [RvieVentas] Renderizando con:', { ruc, periodo, authStatus, loading });

  const [comprobantes] = useState<RvieComprobante[]>([]);
  const [stats, setStats] = useState<VentasStats | null>(null);
  const [filtros, setFiltros] = useState({
    tipo_comprobante: '',
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    monto_min: '',
    monto_max: ''
  });

  // Calcular estadísticas
  useEffect(() => {
    if (comprobantes.length > 0) {
      const nuevasStats: VentasStats = {
        total_comprobantes: comprobantes.length,
        total_monto: comprobantes.reduce((sum, comp) => sum + comp.importe_total, 0),
        por_tipo: {},
        por_estado: {}
      };

      comprobantes.forEach(comp => {
        // Por tipo
        if (!nuevasStats.por_tipo[comp.tipo_comprobante]) {
          nuevasStats.por_tipo[comp.tipo_comprobante] = { cantidad: 0, monto: 0 };
        }
        nuevasStats.por_tipo[comp.tipo_comprobante].cantidad++;
        nuevasStats.por_tipo[comp.tipo_comprobante].monto += comp.importe_total;

        // Por estado
        const estado = comp.estado || 'Sin estado';
        nuevasStats.por_estado[estado] = (nuevasStats.por_estado[estado] || 0) + 1;
      });

      setStats(nuevasStats);
    }
  }, [comprobantes]);

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto);
  };

  const filtrarComprobantes = () => {
    return comprobantes.filter(comp => {
      if (filtros.tipo_comprobante && comp.tipo_comprobante !== filtros.tipo_comprobante) return false;
      if (filtros.estado && comp.estado !== filtros.estado) return false;
      if (filtros.monto_min && comp.importe_total < parseFloat(filtros.monto_min)) return false;
      if (filtros.monto_max && comp.importe_total > parseFloat(filtros.monto_max)) return false;
      return true;
    });
  };

  const comprobantesFiltrados = filtrarComprobantes();

  return (
    <div className="rvie-ventas">
      <h3>💰 Gestión de Ventas e Ingresos</h3>

      {/* Información del período actual */}
      <div className="periodo-info" style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '1rem' 
      }}>
        <h4>📅 Período Actual: {periodo.mes}/{periodo.año}</h4>
        <p>RUC: {ruc}</p>
        <p>Estado de autenticación: {authStatus?.authenticated ? '✅ Autenticado' : '❌ No autenticado'}</p>
        {loading && <p>⏳ Cargando datos...</p>}
      </div>

      {/* Estadísticas Generales */}
      {stats ? (
        <div className="stats-section">
          <h4>📊 Resumen del Período {periodo.mes}/{periodo.año}</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total_comprobantes}</div>
              <div className="stat-label">Total Comprobantes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatMonto(stats.total_monto)}</div>
              <div className="stat-label">Monto Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Object.keys(stats.por_tipo).length}</div>
              <div className="stat-label">Tipos de Comprobante</div>
            </div>
          </div>

          {/* Estadísticas por tipo */}
          <div className="tipo-stats">
            <h5>Por Tipo de Comprobante:</h5>
            <div className="tipo-grid">
              {Object.entries(stats.por_tipo).map(([tipo, data]) => (
                <div key={tipo} className="tipo-item">
                  <strong>{tipo}:</strong> {data.cantidad} docs - {formatMonto(data.monto)}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-ventas" style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4>📋 No hay datos de ventas disponibles</h4>
          <p>Los datos de ventas aparecerán aquí después de:</p>
          <ol style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>Autenticarse con SUNAT</li>
            <li>Descargar la propuesta RVIE</li>
            <li>Procesar los comprobantes del período</li>
          </ol>
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '6px' }}>
            <h5>💡 Funcionalidades futuras:</h5>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>Visualización de comprobantes</li>
              <li>Estadísticas por tipo</li>
              <li>Filtros avanzados</li>
              <li>Exportación de reportes</li>
            </ul>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-section">
        <h4>🔍 Filtros</h4>
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>Tipo de Comprobante:</label>
            <select
              value={filtros.tipo_comprobante}
              onChange={(e) => setFiltros(prev => ({ ...prev, tipo_comprobante: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="01">Factura</option>
              <option value="03">Boleta</option>
              <option value="07">Nota de Crédito</option>
              <option value="08">Nota de Débito</option>
            </select>
          </div>

          <div className="filtro-group">
            <label>Estado:</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="VALIDO">Válido</option>
              <option value="RECHAZADO">Rechazado</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>

          <div className="filtro-group">
            <label>Monto Mínimo:</label>
            <input
              type="number"
              step="0.01"
              value={filtros.monto_min}
              onChange={(e) => setFiltros(prev => ({ ...prev, monto_min: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div className="filtro-group">
            <label>Monto Máximo:</label>
            <input
              type="number"
              step="0.01"
              value={filtros.monto_max}
              onChange={(e) => setFiltros(prev => ({ ...prev, monto_max: e.target.value }))}
              placeholder="Sin límite"
            />
          </div>
        </div>
      </div>

      {/* Lista de Comprobantes */}
      <div className="comprobantes-section">
        <h4>📋 Comprobantes ({comprobantesFiltrados.length})</h4>
        
        {comprobantesFiltrados.length === 0 ? (
          <div className="empty-comprobantes">
            <p>📭 No se encontraron comprobantes con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="comprobantes-table">
            <div className="table-header">
              <div>Tipo</div>
              <div>Serie-Número</div>
              <div>Fecha</div>
              <div>RUC Emisor</div>
              <div>Moneda</div>
              <div>Importe</div>
              <div>Estado</div>
            </div>
            
            {comprobantesFiltrados.map((comp, index) => (
              <div key={index} className="table-row">
                <div>{comp.tipo_comprobante}</div>
                <div>{comp.serie}-{comp.numero}</div>
                <div>{new Date(comp.fecha_emision).toLocaleDateString('es-PE')}</div>
                <div>{comp.ruc_emisor}</div>
                <div>{comp.moneda}</div>
                <div className="monto">{formatMonto(comp.importe_total)}</div>
                <div className={`estado estado-${comp.estado?.toLowerCase()}`}>
                  {comp.estado || 'Sin estado'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="acciones-ventas">
        <button className="btn-primary" disabled={loading}>
          📊 Exportar Reporte
        </button>
        <button className="btn-secondary" disabled={loading}>
          🔄 Actualizar Datos
        </button>
        <button className="btn-secondary" disabled={loading}>
          📤 Enviar a SUNAT
        </button>
      </div>
    </div>
  );
}
