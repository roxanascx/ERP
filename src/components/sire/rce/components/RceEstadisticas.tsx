/**
 * Componente RceEstadisticas
 * Dashboard con estadísticas y métricas RCE
 */

import React, { useState, useEffect } from 'react';
import { useRce } from '../../../../hooks/useRce';
import type { Empresa } from '../../../../types/empresa';

// ========================================
// INTERFACES
// ========================================

interface RceEstadisticasProps {
  company: Empresa;
}

interface MetricaCard {
  titulo: string;
  valor: string | number;
  icono: string;
  color: string;
  tendencia?: 'up' | 'down' | 'stable';
  porcentajeCambio?: number;
}

interface EstadisticasPeriodo {
  periodo: string;
  total_comprobantes: number;
  importe_total: number;
  promedio_diario: number;
  comprobantes_validados: number;
  comprobantes_observados: number;
  tasa_validacion: number;
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================

const MetricaCardComponent: React.FC<{ metrica: MetricaCard }> = ({ metrica }) => {
  const getTendenciaIcon = (tendencia?: 'up' | 'down' | 'stable'): string => {
    switch (tendencia) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  const getTendenciaColor = (tendencia?: 'up' | 'down' | 'stable'): string => {
    switch (tendencia) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      case 'stable': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="rce-metrica-card" style={{ borderColor: metrica.color }}>
      <div className="rce-metrica-header">
        <span className="rce-metrica-icono">{metrica.icono}</span>
        <h4 className="rce-metrica-titulo">{metrica.titulo}</h4>
      </div>
      
      <div className="rce-metrica-valor" style={{ color: metrica.color }}>
        {typeof metrica.valor === 'number' 
          ? metrica.valor.toLocaleString('es-PE')
          : metrica.valor
        }
      </div>
      
      {metrica.tendencia && metrica.porcentajeCambio !== undefined && (
        <div className="rce-metrica-tendencia">
          <span 
            className="rce-tendencia-icono"
            style={{ color: getTendenciaColor(metrica.tendencia) }}
          >
            {getTendenciaIcon(metrica.tendencia)}
          </span>
          <span 
            className="rce-tendencia-porcentaje"
            style={{ color: getTendenciaColor(metrica.tendencia) }}
          >
            {Math.abs(metrica.porcentajeCambio)}%
          </span>
        </div>
      )}
    </div>
  );
};

const GraficoBarras: React.FC<{ datos: EstadisticasPeriodo[] }> = ({ datos }) => {
  const maxImporte = Math.max(...datos.map(d => d.importe_total));

  return (
    <div className="rce-grafico-barras">
      <h4>Importes por Periodo</h4>
      <div className="rce-barras-container">
        {datos.map((dato, index) => (
          <div key={dato.periodo} className="rce-barra-item">
            <div className="rce-barra-wrapper">
              <div 
                className="rce-barra"
                style={{ 
                  height: `${(dato.importe_total / maxImporte) * 100}%`,
                  backgroundColor: `hsl(${200 + index * 30}, 70%, 50%)`
                }}
              />
            </div>
            <div className="rce-barra-label">{dato.periodo}</div>
            <div className="rce-barra-valor">
              {new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN',
                notation: 'compact'
              }).format(dato.importe_total)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TablaResumen: React.FC<{ datos: EstadisticasPeriodo[] }> = ({ datos }) => {
  return (
    <div className="rce-tabla-resumen">
      <h4>Resumen por Periodo</h4>
      <div className="rce-tabla-container">
        <table className="rce-tabla">
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Comprobantes</th>
              <th>Importe Total</th>
              <th>Promedio Diario</th>
              <th>Tasa Validación</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((dato) => (
              <tr key={dato.periodo}>
                <td>{dato.periodo}</td>
                <td>{dato.total_comprobantes.toLocaleString('es-PE')}</td>
                <td>
                  {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: 'PEN'
                  }).format(dato.importe_total)}
                </td>
                <td>
                  {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: 'PEN'
                  }).format(dato.promedio_diario)}
                </td>
                <td>
                  <span className={`rce-tasa-badge ${dato.tasa_validacion >= 90 ? 'good' : dato.tasa_validacion >= 70 ? 'warning' : 'bad'}`}>
                    {dato.tasa_validacion.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export const RceEstadisticas: React.FC<RceEstadisticasProps> = ({ company }) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [estadisticas, setEstadisticas] = useState<EstadisticasPeriodo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('');
  const [tipoVista, setTipoVista] = useState<'metricas' | 'grafico' | 'tabla'>('metricas');

  // ========================================
  // HOOKS
  // ========================================

  const { } = useRce({ ruc: company.ruc });

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarEstadisticas();
  }, [company.ruc]);

  useEffect(() => {
    // Auto-seleccionar periodo actual
    const periodoActual = new Date().toISOString().slice(0, 7); // YYYY-MM
    setPeriodoSeleccionado(periodoActual);
  }, []);

  // ========================================
  // FUNCIONES
  // ========================================

  const cargarEstadisticas = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulación de datos estadísticos
      // TODO: Implementar llamada a API
      const estadisticasSimuladas: EstadisticasPeriodo[] = [
        {
          periodo: '2024-01',
          total_comprobantes: 1250,
          importe_total: 458750.50,
          promedio_diario: 14798.40,
          comprobantes_validados: 1180,
          comprobantes_observados: 70,
          tasa_validacion: 94.4
        },
        {
          periodo: '2024-02',
          total_comprobantes: 1089,
          importe_total: 387650.25,
          promedio_diario: 13367.94,
          comprobantes_validados: 1020,
          comprobantes_observados: 69,
          tasa_validacion: 93.7
        },
        {
          periodo: '2024-03',
          total_comprobantes: 1456,
          importe_total: 523890.75,
          promedio_diario: 16899.70,
          comprobantes_validados: 1398,
          comprobantes_observados: 58,
          tasa_validacion: 95.9
        },
        {
          periodo: '2024-04',
          total_comprobantes: 1178,
          importe_total: 412567.80,
          promedio_diario: 13752.26,
          comprobantes_validados: 1089,
          comprobantes_observados: 89,
          tasa_validacion: 92.4
        }
      ];

      setEstadisticas(estadisticasSimuladas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const obtenerMetricas = (): MetricaCard[] => {
    const estadisticaActual = estadisticas.find(e => e.periodo === periodoSeleccionado);
    const estadisticaAnterior = estadisticas.find(e => {
      const [año, mes] = periodoSeleccionado.split('-').map(Number);
      const mesAnterior = mes === 1 ? 12 : mes - 1;
      const añoAnterior = mes === 1 ? año - 1 : año;
      return e.periodo === `${añoAnterior}-${mesAnterior.toString().padStart(2, '0')}`;
    });

    if (!estadisticaActual) return [];

    const calcularTendencia = (actual: number, anterior?: number): { tendencia: 'up' | 'down' | 'stable', porcentaje: number } => {
      if (!anterior) return { tendencia: 'stable', porcentaje: 0 };
      
      const cambio = ((actual - anterior) / anterior) * 100;
      if (cambio > 5) return { tendencia: 'up', porcentaje: cambio };
      if (cambio < -5) return { tendencia: 'down', porcentaje: Math.abs(cambio) };
      return { tendencia: 'stable', porcentaje: Math.abs(cambio) };
    };

    const tendenciaComprobantes = calcularTendencia(
      estadisticaActual.total_comprobantes, 
      estadisticaAnterior?.total_comprobantes
    );

    const tendenciaImporte = calcularTendencia(
      estadisticaActual.importe_total, 
      estadisticaAnterior?.importe_total
    );

    const tendenciaValidacion = calcularTendencia(
      estadisticaActual.tasa_validacion, 
      estadisticaAnterior?.tasa_validacion
    );

    return [
      {
        titulo: 'Total Comprobantes',
        valor: estadisticaActual.total_comprobantes,
        icono: '📄',
        color: '#3b82f6',
        tendencia: tendenciaComprobantes.tendencia,
        porcentajeCambio: tendenciaComprobantes.porcentaje
      },
      {
        titulo: 'Importe Total',
        valor: new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN',
          notation: 'compact'
        }).format(estadisticaActual.importe_total),
        icono: '💰',
        color: '#10b981',
        tendencia: tendenciaImporte.tendencia,
        porcentajeCambio: tendenciaImporte.porcentaje
      },
      {
        titulo: 'Promedio Diario',
        valor: new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN',
          notation: 'compact'
        }).format(estadisticaActual.promedio_diario),
        icono: '📊',
        color: '#8b5cf6',
        tendencia: 'stable',
        porcentajeCambio: 0
      },
      {
        titulo: 'Tasa Validación',
        valor: `${estadisticaActual.tasa_validacion.toFixed(1)}%`,
        icono: '✅',
        color: estadisticaActual.tasa_validacion >= 90 ? '#10b981' : estadisticaActual.tasa_validacion >= 70 ? '#f59e0b' : '#ef4444',
        tendencia: tendenciaValidacion.tendencia,
        porcentajeCambio: tendenciaValidacion.porcentaje
      },
      {
        titulo: 'Observados',
        valor: estadisticaActual.comprobantes_observados,
        icono: '⚠️',
        color: '#f59e0b',
        tendencia: 'stable',
        porcentajeCambio: 0
      },
      {
        titulo: 'Validados',
        valor: estadisticaActual.comprobantes_validados,
        icono: '🎯',
        color: '#06b6d4',
        tendencia: 'stable',
        porcentajeCambio: 0
      }
    ];
  };

  // ========================================
  // FUNCIONES DE RENDERIZADO
  // ========================================

  const renderToolbar = () => (
    <div className="rce-estadisticas-toolbar">
      <div className="rce-toolbar-left">
        <h3>Estadísticas RCE</h3>
        
        <select
          value={periodoSeleccionado}
          onChange={(e) => setPeriodoSeleccionado(e.target.value)}
          className="rce-select"
        >
          {estadisticas.map((est) => (
            <option key={est.periodo} value={est.periodo}>
              {est.periodo}
            </option>
          ))}
        </select>
      </div>

      <div className="rce-toolbar-right">
        <div className="rce-vista-selector">
          <button
            onClick={() => setTipoVista('metricas')}
            className={`rce-btn-vista ${tipoVista === 'metricas' ? 'active' : ''}`}
          >
            📊 Métricas
          </button>
          <button
            onClick={() => setTipoVista('grafico')}
            className={`rce-btn-vista ${tipoVista === 'grafico' ? 'active' : ''}`}
          >
            📈 Gráfico
          </button>
          <button
            onClick={() => setTipoVista('tabla')}
            className={`rce-btn-vista ${tipoVista === 'tabla' ? 'active' : ''}`}
          >
            📋 Tabla
          </button>
        </div>

        <button
          onClick={cargarEstadisticas}
          disabled={loading}
          className="rce-btn rce-btn-refresh"
        >
          {loading ? '⏳' : '🔄'} Actualizar
        </button>
      </div>
    </div>
  );

  const renderContenido = () => {
    switch (tipoVista) {
      case 'metricas':
        return (
          <div className="rce-metricas-grid">
            {obtenerMetricas().map((metrica, index) => (
              <MetricaCardComponent key={index} metrica={metrica} />
            ))}
          </div>
        );

      case 'grafico':
        return <GraficoBarras datos={estadisticas} />;

      case 'tabla':
        return <TablaResumen datos={estadisticas} />;

      default:
        return null;
    }
  };

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  if (error) {
    return (
      <div className="rce-error">
        <div className="rce-error-content">
          <h3>Error en Estadísticas RCE</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="rce-btn rce-btn-retry">
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (loading && estadisticas.length === 0) {
    return (
      <div className="rce-loading">
        <div className="rce-loading-spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="rce-estadisticas">
      {renderToolbar()}
      {renderContenido()}
    </div>
  );
};
