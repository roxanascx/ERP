/**
 * Componente para gestionar las ventas e ingresos
 * Diseño profesional y elegante para análisis de datos SUNAT SIRE
 * ACTUALIZADO: Diseño luxury con toques suaves
 */

import { useState, useEffect } from 'react';
import { rvieVentasService } from '../../../../services/sire';
import './rvie-luxury.css';

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

interface ComprobanteVenta {
  _id?: string;
  id?: string;
  numRuc?: string;
  nomRazonSocial?: string;
  codTipoCDP?: string;
  desTipoCDP?: string;
  numSerieCDP?: string;
  numCDP?: string;
  fecEmisionCDP?: string;
  codTipoDocIdentidad?: string;
  numDocReceptor?: string;
  apeNomRznSocReceptor?: string;
  mtoOperGravadas?: number;
  mtoIGV?: number;
  mtoOperExoneradas?: number;
  mtoOperInafectas?: number;
  mtoTotalCP?: number;
  codMoneda?: string;
  desEstadoComprobante?: string;
  indTipoOperacion?: string;
  // Campos adicionales que pueden venir de SUNAT
  [key: string]: any;
}

const RvieVentas = ({
  ruc,
  periodo,
  authStatus,
  loading
}: RvieVentasProps) => {
  console.log('💰 [RvieVentas] Renderizando con:', { ruc, periodo, authStatus, loading });

  const [comprobantes, setComprobantes] = useState<ComprobanteVenta[]>([]);
  const [stats, setStats] = useState<VentasStats | null>(null);
  const [loadingComprobantes, setLoadingComprobantes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  
  const [filtros, setFiltros] = useState({
    tipo_comprobante: '',
    estado: '',
    monto_min: '',
    monto_max: ''
  });

  // 📦 SISTEMA DE CACHE LOCAL INTELIGENTE
  // ====================================
  // El cache permite:
  // 1. Evitar consultas innecesarias a SUNAT
  // 2. Mejorar la velocidad de carga
  // 3. Funcionar offline con datos previos
  // 4. Reducir la carga en los servidores de SUNAT
  
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 🔍 VERIFICAR CACHE LOCAL
        // Creamos una clave única por RUC y período
        const cacheKey = `rvie_ventas_${ruc}_${periodo.año}${periodo.mes}`;
        const datosCache = localStorage.getItem(cacheKey);
        
        if (datosCache) {
          console.log('📦 [Cache] Verificando datos en localStorage...');
          
          try {
            const { comprobantes: comprobantesCache, timestamp } = JSON.parse(datosCache);
            const tiempoCache = new Date(timestamp);
            const ahora = new Date();
            const diferencia = ahora.getTime() - tiempoCache.getTime();
            const horasCache = diferencia / (1000 * 60 * 60);
            
            console.log(`⏰ [Cache] Datos guardados hace ${horasCache.toFixed(1)} horas`);
            
            // ✅ CACHE VÁLIDO (menos de 24 horas)
            if (horasCache < 24) {
              console.log('✅ [Cache] Usando datos del cache (válidos por 24h)');
              setComprobantes(comprobantesCache);
              calcularEstadisticas(comprobantesCache);
              setUltimaActualizacion(tiempoCache);
              return; // No consultar SUNAT
            } else {
              console.log('⚠️ [Cache] Cache expirado, se consultará SUNAT');
              localStorage.removeItem(cacheKey); // Limpiar cache viejo
            }
          } catch (parseError) {
            console.warn('⚠️ [Cache] Error al parsear cache, se limpiará:', parseError);
            localStorage.removeItem(cacheKey);
          }
        } else {
          console.log('📭 [Cache] No hay datos en cache para este período');
        }
        
        // 🔄 Si no hay cache válido Y está autenticado, consultar SUNAT
        if (authStatus?.authenticated) {
          console.log('🔄 [Cache] Consultando datos frescos desde SUNAT...');
          await actualizarDesdeSunat();
        } else {
          console.log('❌ [Cache] No autenticado, no se puede consultar SUNAT');
        }
      } catch (error) {
        console.error('❌ [RvieVentas] Error en carga de datos:', error);
      }
    };

    cargarDatos();
  }, [ruc, periodo, authStatus?.authenticated]);

  const actualizarDesdeSunat = async () => {
    try {
      setLoadingComprobantes(true);
      setError(null);
      setSuccessMessage(null);
      
      const periodoFormateado = `${periodo.año}${periodo.mes.padStart(2, '0')}`;
      console.log('🔄 [SUNAT] Consultando período:', periodoFormateado);
      
      const resumenActualizado = await rvieVentasService.actualizarDesdeSunat(ruc, periodoFormateado, [1, 4, 5]);
      
      if (resumenActualizado.success) {
        const comprobantesData = resumenActualizado.data?.registros || [];
        console.log(`✅ [SUNAT] Recibidos ${comprobantesData.length} comprobantes`);
        
        setComprobantes(comprobantesData);
        calcularEstadisticas(comprobantesData);
        setUltimaActualizacion(new Date());
        
        // 💾 GUARDAR EN CACHE LOCAL
        // =========================
        // Estructura del cache:
        // {
        //   comprobantes: [...], // Array de comprobantes de SUNAT
        //   timestamp: "2025-08-18T10:30:00.000Z" // Cuándo se guardó
        // }
        const cacheKey = `rvie_ventas_${ruc}_${periodo.año}${periodo.mes}`;
        const datosCache = {
          comprobantes: comprobantesData,
          timestamp: new Date().toISOString()
        };
        
        try {
          localStorage.setItem(cacheKey, JSON.stringify(datosCache));
          console.log(`💾 [Cache] Datos guardados en localStorage con clave: ${cacheKey}`);
          console.log(`📊 [Cache] Tamaño aprox: ${JSON.stringify(datosCache).length} caracteres`);
        } catch (storageError) {
          console.warn('⚠️ [Cache] Error al guardar en localStorage (posible límite):', storageError);
        }
        
        setSuccessMessage(`✅ Datos actualizados exitosamente. ${comprobantesData.length} comprobantes encontrados.`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(resumenActualizado.mensaje || 'Error al obtener datos de SUNAT');
      }
    } catch (error) {
      console.error('❌ [SUNAT] Error en consulta:', error);
      setError('Error de conexión con SUNAT. Intente nuevamente.');
    } finally {
      setLoadingComprobantes(false);
    }
  };

  const calcularEstadisticas = (comprobantesData: ComprobanteVenta[]) => {
    console.log('📊 [Stats] Calculando estadísticas para:', comprobantesData.length, 'comprobantes');
    console.log('📊 [Stats] Primer comprobante:', comprobantesData[0]);
    
    if (!comprobantesData || comprobantesData.length === 0) {
      setStats(null);
      return;
    }

    const porTipo: Record<string, { cantidad: number; monto: number }> = {};
    const porEstado: Record<string, number> = {};
    let totalMonto = 0;

    comprobantesData.forEach((comp, index) => {
      console.log(`📊 [Stats] Procesando comprobante ${index + 1}:`, comp);
      
      // Obtener el tipo de comprobante (puede venir en diferentes campos)
      const tipoComprobante = comp.codTipoCDP || comp.desTipoCDP || 'SIN_TIPO';
      
      // Por tipo
      if (!porTipo[tipoComprobante]) {
        porTipo[tipoComprobante] = { cantidad: 0, monto: 0 };
      }
      porTipo[tipoComprobante].cantidad++;
      
      // Monto total - puede venir en diferentes campos
      const monto = comp.mtoTotalCP || comp.total || comp.monto || 0;
      porTipo[tipoComprobante].monto += monto;

      // Por estado
      const estado = comp.desEstadoComprobante || comp.estado || 'SIN_ESTADO';
      porEstado[estado] = (porEstado[estado] || 0) + 1;

      totalMonto += monto;
    });

    console.log('📊 [Stats] Estadísticas calculadas:', {
      total_comprobantes: comprobantesData.length,
      total_monto: totalMonto,
      por_tipo: porTipo,
      por_estado: porEstado
    });

    setStats({
      total_comprobantes: comprobantesData.length,
      total_monto: totalMonto,
      por_tipo: porTipo,
      por_estado: porEstado
    });
  };

  const filtrarComprobantes = () => {
    return comprobantes.filter(comp => {
      // Función helper para obtener valores de campos
      const getFieldValue = (comp: any, ...fieldNames: string[]) => {
        for (const fieldName of fieldNames) {
          if (comp[fieldName] !== undefined && comp[fieldName] !== null && comp[fieldName] !== '') {
            return comp[fieldName];
          }
        }
        return null;
      };

      // Aplicar filtros
      const tipoComprobante = getFieldValue(comp, 'codTipoCDP', 'desTipoCDP', 'tipo');
      const estado = getFieldValue(comp, 'desEstadoComprobante', 'estado');
      const total = Number(getFieldValue(comp, 'mtoTotalCP', 'total', 'monto') || 0);

      if (filtros.tipo_comprobante && tipoComprobante !== filtros.tipo_comprobante) return false;
      if (filtros.estado && estado !== filtros.estado) return false;
      if (filtros.monto_min && total < parseFloat(filtros.monto_min)) return false;
      if (filtros.monto_max && total > parseFloat(filtros.monto_max)) return false;
      
      return true;
    });
  };

  const exportarCSV = () => {
    try {
      const comprobantesFiltrados = filtrarComprobantes();
      
      if (comprobantesFiltrados.length === 0) {
        setError('No hay datos para exportar con los filtros aplicados.');
        return;
      }

      const headers = [
        'ID', 'Tipo', 'Serie', 'Número', 'Fecha', 'Cliente', 'Doc_Tipo', 'Doc_Cliente', 'RUC',
        'Base_Gravada', 'IGV', 'Exonerado', 'Inafecto', 'Total', 'Moneda', 'Estado', 'Tipo_Operacion'
      ];

      const datosExport = comprobantesFiltrados.map(comp => {
        // Función helper para obtener valores de campos
        const getFieldValue = (comp: any, ...fieldNames: string[]) => {
          for (const fieldName of fieldNames) {
            if (comp[fieldName] !== undefined && comp[fieldName] !== null && comp[fieldName] !== '') {
              return comp[fieldName];
            }
          }
          return '';
        };

        return {
          ID: getFieldValue(comp, '_id', 'id'),
          Tipo: getFieldValue(comp, 'codTipoCDP', 'desTipoCDP', 'tipo'),
          Serie: getFieldValue(comp, 'numSerieCDP', 'serie'),
          Número: getFieldValue(comp, 'numCDP', 'numero'),
          Fecha: getFieldValue(comp, 'fecEmisionCDP', 'fecha'),
          Cliente: getFieldValue(comp, 'apeNomRznSocReceptor', 'nomRazonSocial', 'cliente', 'razonSocial'),
          Doc_Tipo: getFieldValue(comp, 'codTipoDocIdentidad', 'tipoDocumento'),
          Doc_Cliente: getFieldValue(comp, 'numDocReceptor', 'numeroDocumento', 'documento'),
          RUC: getFieldValue(comp, 'numRuc', 'ruc'),
          Base_Gravada: Number(getFieldValue(comp, 'mtoOperGravadas', 'baseGravada', 'gravada') || 0),
          IGV: Number(getFieldValue(comp, 'mtoIGV', 'igv') || 0),
          Exonerado: Number(getFieldValue(comp, 'mtoOperExoneradas', 'exonerado') || 0),
          Inafecto: Number(getFieldValue(comp, 'mtoOperInafectas', 'inafecto') || 0),
          Total: Number(getFieldValue(comp, 'mtoTotalCP', 'total', 'monto') || 0),
          Moneda: getFieldValue(comp, 'codMoneda', 'moneda') || 'PEN',
          Estado: getFieldValue(comp, 'desEstadoComprobante', 'estado'),
          Tipo_Operacion: getFieldValue(comp, 'indTipoOperacion', 'tipoOperacion')
        };
      });

      const csvContent = [
        headers.join(','),
        ...datosExport.map(row => 
          headers.map(header => {
            const value = (row as any)[header];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return `"${value || ''}"`;
          }).join(',')
        )
      ].join('\n');

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = `SIRE_Ventas_${ruc}_${periodo.año}${periodo.mes.padStart(2, '0')}_${timestamp}.csv`;

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage(`✅ Reporte exportado exitosamente: ${filename}`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (error) {
      console.error('❌ [Export] Error exportando:', error);
      setError('Error al exportar el reporte. Intente nuevamente.');
    }
  };

  const verEnSunat = () => {
    try {
      const url = 'https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm';
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ [SUNAT] Error abriendo portal:', error);
      setError('Error al abrir el portal SUNAT.');
    }
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto);
  };

  const getTipoNombre = (codigo: string) => {
    switch (codigo) {
      case '01': return 'FACTURA';
      case '03': return 'BOLETA';
      case '07': return 'NOTA DE CRÉDITO';
      case '08': return 'NOTA DE DÉBITO';
      default: return `TIPO ${codigo}`;
    }
  };

  const getTipoBadgeClass = (codigo: string | null | undefined) => {
    if (!codigo) return 'factura'; // Default
    
    switch (codigo) {
      case '01': return 'factura';
      case '03': return 'boleta';
      case '07': return 'nota-credito';
      case '08': return 'nota-debito';
      default: return 'factura';
    }
  };

  // 🧹 FUNCIÓN PARA LIMPIAR CACHE (DEBUG)
  const limpiarCache = () => {
    const cacheKey = `rvie_ventas_${ruc}_${periodo.año}${periodo.mes}`;
    localStorage.removeItem(cacheKey);
    console.log('🧹 [Cache] Cache limpiado para:', cacheKey);
    setSuccessMessage('🧹 Cache limpiado. La próxima consulta será desde SUNAT.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // 🔍 FUNCIÓN PARA DEBUG DE DATOS (NUEVA)
  const debugDatos = () => {
    console.log('🔍 [DEBUG] Estado completo del componente:');
    console.log('📊 Stats:', stats);
    console.log('📋 Comprobantes RAW:', comprobantes);
    console.log('🎯 Filtros:', filtros);
    console.log('📑 Comprobantes filtrados:', comprobantesFiltrados);
    console.log('🔄 Loading:', loadingComprobantes);
    console.log('🔐 Auth:', authStatus);
    
    // Analizar estructura detallada del primer comprobante
    if (comprobantes.length > 0) {
      console.log('🔬 [DEBUG] ESTRUCTURA DETALLADA DEL PRIMER COMPROBANTE:');
      const primer = comprobantes[0];
      console.log('- Objeto completo:', primer);
      console.log('- Todas las claves disponibles:', Object.keys(primer));
      console.log('- Valores específicos:');
      console.log('  - fecEmisionCDP:', primer.fecEmisionCDP);
      console.log('  - fecha:', primer.fecha);
      console.log('  - mtoOperExoneradas:', primer.mtoOperExoneradas);
      console.log('  - exonerado:', primer.exonerado);
      console.log('  - indTipoOperacion:', primer.indTipoOperacion);
      console.log('  - tipoOperacion:', primer.tipoOperacion);
      console.log('  - apeNomRznSocReceptor:', primer.apeNomRznSocReceptor);
      console.log('  - cliente:', primer.cliente);
      
      // Mostrar TODOS los campos que contienen la palabra "fecha"
      Object.keys(primer).forEach(key => {
        if (key.toLowerCase().includes('fecha') || key.toLowerCase().includes('fec')) {
          console.log(`  - ${key}:`, primer[key]);
        }
      });
      
      // Mostrar TODOS los campos que contienen nombres o clientes
      Object.keys(primer).forEach(key => {
        const value = primer[key];
        if (typeof value === 'string' && value.length > 5) {
          // Buscar campos que contengan nombres de personas
          if (key.toLowerCase().includes('nombre') || 
              key.toLowerCase().includes('cliente') || 
              key.toLowerCase().includes('receptor') ||
              key.toLowerCase().includes('razon') ||
              // Buscar por contenido que parece nombre de persona
              value.includes('CASTRO') || 
              value.includes('TORRES') ||
              value.includes('GUILLERMO') ||
              value.includes('ARNOL') ||
              value.includes('MIGDONIO') ||
              value.includes('WILLIAM')) {
            console.log(`  🏷️ CLIENTE CANDIDATO - ${key}:`, value);
          }
        }
      });
    }
    
    // Mostrar en pantalla también
    setSuccessMessage(`🔍 Debug: ${comprobantes.length} comprobantes totales, ${comprobantesFiltrados.length} filtrados. Ver consola para detalles completos.`);
    setTimeout(() => setSuccessMessage(null), 8000);
  };

  const comprobantesFiltrados = filtrarComprobantes();

  return (
    <div className="rvie-ventas-luxury">
      {/* FILA 1: HEADER COMPACTO CON INFO DEL PERÍODO */}
      <div className="compact-header-row">
        <div className="header-info-compact">
          <h2>📊 Ventas e Ingresos</h2>
          <div className="header-badges">
            <span className="info-badge">📅 {periodo.mes}/{periodo.año}</span>
            <span className="info-badge">🏢 {ruc}</span>
            <span className={`info-badge ${authStatus?.authenticated ? 'success' : 'error'}`}>
              {authStatus?.authenticated ? '✅ Autenticado' : '❌ No autenticado'}
            </span>
            {ultimaActualizacion && (
              <span className="info-badge">🕒 {ultimaActualizacion.toLocaleString('es-PE', { 
                day: '2-digit', 
                month: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <button
            className="compact-button primary"
            onClick={actualizarDesdeSunat}
            disabled={loadingComprobantes || !authStatus?.authenticated}
          >
            {loadingComprobantes ? (
              <>
                <div className="loading-spinner"></div>
                Actualizando...
              </>
            ) : (
              <>🔄 Actualizar SUNAT</>
            )}
          </button>
          
          <button
            onClick={limpiarCache}
            className="compact-button secondary"
            title="Limpiar cache local"
          >
            🧹 Cache
          </button>

          <button
            onClick={debugDatos}
            className="compact-button debug"
            title="Debug - Ver datos en consola"
          >
            🔍 Debug
          </button>
        </div>
        
        {(loading || loadingComprobantes) && (
          <div className="compact-loading">
            <div className="loading-spinner"></div>
            <span>Consultando SUNAT...</span>
          </div>
        )}
      </div>

      {/* FILA 2: ESTADÍSTICAS + ANÁLISIS + FILTROS EN UNA SOLA FILA */}
      {stats && (
        <div className="compact-analysis-row">
          {/* ESTADÍSTICAS PRINCIPALES */}
          <div className="stats-compact">
            <div className="stat-item-compact total">
              <div className="stat-icon">📄</div>
              <div className="stat-details">
                <div className="stat-value">{stats.total_comprobantes.toLocaleString()}</div>
                <div className="stat-label">Comprobantes</div>
              </div>
            </div>
            
            <div className="stat-item-compact monto">
              <div className="stat-icon">💰</div>
              <div className="stat-details">
                <div className="stat-value">{formatMonto(stats.total_monto)}</div>
                <div className="stat-label">Total</div>
              </div>
            </div>
            
            <div className="stat-item-compact promedio">
              <div className="stat-icon">📊</div>
              <div className="stat-details">
                <div className="stat-value">
                  {formatMonto(stats.total_comprobantes > 0 ? stats.total_monto / stats.total_comprobantes : 0)}
                </div>
                <div className="stat-label">Promedio</div>
              </div>
            </div>
          </div>

          {/* ANÁLISIS POR TIPO */}
          <div className="tipo-analysis-compact">
            <h4>🔍 Por Tipo</h4>
            <div className="tipo-breakdown-compact">
              {Object.entries(stats.por_tipo).map(([tipo, data]) => {
                const porcentaje = (data.cantidad / stats.total_comprobantes * 100).toFixed(1);
                return (
                  <div key={tipo} className="tipo-item-compact">
                    <span className={`tipo-badge-compact ${getTipoBadgeClass(tipo)}`}>
                      {getTipoNombre(tipo)}
                    </span>
                    <div className="tipo-stats-compact">
                      <span>{data.cantidad} ({porcentaje}%)</span>
                      <span>{formatMonto(data.monto)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FILTROS COMPACTOS */}
          <div className="filtros-compact">
            <h4>🎯 Filtros</h4>
            <div className="filtros-grid-compact">
              <div className="filtro-compact">
                <label>Tipo</label>
                <select
                  value={filtros.tipo_comprobante}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tipo_comprobante: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="01">Factura</option>
                  <option value="03">Boleta</option>
                  <option value="07">N.Crédito</option>
                  <option value="08">N.Débito</option>
                </select>
              </div>

              <div className="filtro-compact">
                <label>Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="ANULADO">Anulado</option>
                </select>
              </div>

              <div className="filtro-compact">
                <label>Monto Min</label>
                <input
                  type="number"
                  step="0.01"
                  value={filtros.monto_min}
                  onChange={(e) => setFiltros(prev => ({ ...prev, monto_min: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="filtro-compact">
                <label>Monto Max</label>
                <input
                  type="number"
                  step="0.01"
                  value={filtros.monto_max}
                  onChange={(e) => setFiltros(prev => ({ ...prev, monto_max: e.target.value }))}
                  placeholder="∞"
                />
              </div>
            </div>
          </div>

          {/* ESTADOS COMPACTOS */}
          <div className="estados-compact">
            <h4>📋 Estados</h4>
            <div className="estados-list-compact">
              {Object.entries(stats.por_estado).map(([estado, cantidad]) => {
                const porcentaje = (cantidad / stats.total_comprobantes * 100).toFixed(1);
                return (
                  <div key={estado} className="estado-item-compact">
                    <span className={`estado-badge-compact ${estado.toLowerCase()}`}>
                      {estado}
                    </span>
                    <span className="estado-stats-compact">
                      {cantidad} ({porcentaje}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TABLA LUXURY */}
      {comprobantesFiltrados.length > 0 ? (
        <div className="luxury-table-section">
          <div className="table-header-luxury">
            <h3 className="table-title">📋 Comprobantes ({comprobantesFiltrados.length})</h3>
            <div className="table-actions">
              <button className="action-button export" onClick={exportarCSV}>
                📊 Exportar CSV
              </button>
              <button className="action-button sunat" onClick={verEnSunat}>
                🔗 Ver en SUNAT
              </button>
            </div>
          </div>

          <div className="luxury-table-wrapper">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Doc. Cliente</th>
                  <th style={{ textAlign: 'right' }}>Base Gravada</th>
                  <th style={{ textAlign: 'right' }}>IGV</th>
                  <th style={{ textAlign: 'right' }}>Exonerado</th>
                  <th style={{ textAlign: 'right' }}>Inafecto</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                  <th style={{ textAlign: 'center' }}>Tipo Op.</th>
                </tr>
              </thead>
              <tbody>
                {comprobantesFiltrados.slice(0, 50).map((comp, index) => {
                  console.log(`[Tabla] Comprobante ${index + 1}:`, comp);
                  
                  // Mapeo inteligente de campos - detecta la estructura real
                  const getFieldValue = (comp: any, ...fieldNames: string[]) => {
                    for (const fieldName of fieldNames) {
                      // Buscar en el nivel raíz
                      if (comp[fieldName] !== undefined && comp[fieldName] !== null && comp[fieldName] !== '') {
                        return comp[fieldName];
                      }
                      
                      // Buscar en propiedades anidadas comunes
                      if (comp.data && comp.data[fieldName] !== undefined && comp.data[fieldName] !== null && comp.data[fieldName] !== '') {
                        return comp.data[fieldName];
                      }
                      
                      // Buscar en otras posibles estructuras anidadas
                      if (comp.comprobante && comp.comprobante[fieldName] !== undefined && comp.comprobante[fieldName] !== null && comp.comprobante[fieldName] !== '') {
                        return comp.comprobante[fieldName];
                      }
                    }
                    return null;
                  };

                  // También crear una función para buscar por valor similar
                  const findFieldByPattern = (comp: any, pattern: string) => {
                    const keys = Object.keys(comp);
                    for (const key of keys) {
                      if (key.toLowerCase().includes(pattern.toLowerCase())) {
                        const value = comp[key];
                        if (value !== undefined && value !== null && value !== '') {
                          console.log(`🔍 [Pattern] Encontrado ${pattern} en campo '${key}':`, value);
                          return value;
                        }
                      }
                    }
                    return null;
                  };

                  const id = getFieldValue(comp, '_id', 'id') || `temp_${index}`;
                  const tipoComprobante = getFieldValue(comp, 'codTipoCDP', 'desTipoCDP', 'tipo');
                  const serie = getFieldValue(comp, 'numSerieCDP', 'serie');
                  const numero = getFieldValue(comp, 'numCDP', 'numero');
                  // FECHA - Múltiples posibilidades + búsqueda por patrón
                  const fecha = getFieldValue(comp, 'fecEmisionCDP', 'fecha', 'fechaEmision', 'fecEmision', 'dateEmision') || 
                               findFieldByPattern(comp, 'fecha') || 
                               findFieldByPattern(comp, 'fec');
                  // CLIENTE - Múltiples posibilidades + búsqueda por patrón (CORREGIDO)
                  // Primero intentar campos específicos de receptor/cliente
                  const cliente = getFieldValue(comp, 'apeNomRznSocReceptor', 'nombreReceptor', 'clienteNombre', 'receptor') ||
                                 findFieldByPattern(comp, 'receptor') ||
                                 findFieldByPattern(comp, 'cliente') ||
                                 // Solo como último recurso usar razón social (que puede ser de la empresa emisora)
                                 getFieldValue(comp, 'nomRazonSocial', 'razonSocial') ||
                                 findFieldByPattern(comp, 'nombre');
                  const tipoDocumento = getFieldValue(comp, 'codTipoDocIdentidad', 'tipoDocumento', 'tipoDoc');
                  const numeroDocumento = getFieldValue(comp, 'numDocReceptor', 'numeroDocumento', 'documento', 'docReceptor');
                  const ruc = getFieldValue(comp, 'numRuc', 'ruc');
                  const baseGravada = Number(getFieldValue(comp, 'mtoOperGravadas', 'baseGravada', 'gravada', 'operGravadas') || 
                                           findFieldByPattern(comp, 'gravada') || 0);
                  const igv = Number(getFieldValue(comp, 'mtoIGV', 'igv', 'IGV') || 
                                    findFieldByPattern(comp, 'igv') || 0);
                  // EXONERADO - Múltiples posibilidades + búsqueda por patrón
                  const exonerado = Number(getFieldValue(comp, 'mtoOperExoneradas', 'exonerado', 'operExoneradas', 'montoExonerado', 'mtoExonerado') || 
                                          findFieldByPattern(comp, 'exoner') || 
                                          findFieldByPattern(comp, 'exo') || 0);
                  const inafecto = Number(getFieldValue(comp, 'mtoOperInafectas', 'inafecto', 'operInafectas', 'montoInafecto', 'mtoInafecto') || 
                                         findFieldByPattern(comp, 'inafect') || 0);
                  const total = Number(getFieldValue(comp, 'mtoTotalCP', 'total', 'monto', 'montoTotal', 'totalComprobante') || 
                                      findFieldByPattern(comp, 'total') || 0);
                  const moneda = getFieldValue(comp, 'codMoneda', 'moneda') || 'PEN';
                  const estado = getFieldValue(comp, 'desEstadoComprobante', 'estado', 'estadoComprobante') || 
                                findFieldByPattern(comp, 'estado') || 'SIN_ESTADO';
                  // TIPO OPERACIÓN - Múltiples posibilidades + búsqueda por patrón
                  const tipoOperacion = getFieldValue(comp, 'indTipoOperacion', 'tipoOperacion', 'operacion', 'codOperacion', 'indicadorOperacion') ||
                                       findFieldByPattern(comp, 'operacion') ||
                                       findFieldByPattern(comp, 'tipo');

                  // DEBUG: Log detallado de cada comprobante
                  console.log(`🔬 [Fila ${index + 1}] Valores extraídos:`, {
                    id: typeof id === 'string' ? id.slice(-8) : id,
                    tipoComprobante,
                    serie,
                    numero,
                    fecha,
                    cliente: `"${cliente}" (debería ser ${index === 0 ? 'CASTRO ALBORNOZ...' : 'TORRES GUILLERMO...'})`,
                    tipoDocumento,
                    numeroDocumento,
                    ruc,
                    baseGravada,
                    igv,
                    exonerado: `${exonerado} (debería ser ${index === 0 ? '660' : '640'} para comp ${index + 1})`,
                    inafecto,
                    total,
                    moneda,
                    estado,
                    tipoOperacion: `${tipoOperacion} (debería ser 0101)`
                  });
                  
                  // DEBUG ESPECÍFICO PARA CLIENTE: Mostrar todos los campos que podrían ser el cliente
                  console.log(`🏷️ [Fila ${index + 1}] CAMPOS DE CLIENTE CANDIDATOS:`, {
                    apeNomRznSocReceptor: comp.apeNomRznSocReceptor,
                    nombreReceptor: comp.nombreReceptor,
                    clienteNombre: comp.clienteNombre,
                    receptor: comp.receptor,
                    nomRazonSocial: comp.nomRazonSocial,
                    razonSocial: comp.razonSocial,
                    // Buscar campos que contengan los nombres esperados
                    camposConCASTRO: Object.keys(comp).filter(k => typeof comp[k] === 'string' && comp[k].includes('CASTRO')).map(k => ({[k]: comp[k]})),
                    camposConTORRES: Object.keys(comp).filter(k => typeof comp[k] === 'string' && comp[k].includes('TORRES')).map(k => ({[k]: comp[k]}))
                  });
                  
                  console.log(`🔬 [Fila ${index + 1}] Objeto original:`, comp);

                  return (
                    <tr key={id}>
                      <td>
                        <span className={`table-badge ${getTipoBadgeClass(tipoComprobante)}`}>
                          {tipoComprobante === '01' ? 'FAC' : 
                           tipoComprobante === '03' ? 'BOL' : 
                           tipoComprobante === '07' ? 'NCR' : 
                           tipoComprobante === '08' ? 'NDB' : (tipoComprobante || 'N/A')}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                          {tipoComprobante || 'N/A'}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        <strong>{serie || 'N/A'}-{numero || 'N/A'}</strong>
                        {id && (
                          <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '2px' }}>
                            ID: {typeof id === 'string' ? id.slice(-8) : id}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                        <strong>{fecha || 'N/A'}</strong>
                      </td>
                      <td style={{ maxWidth: '200px' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                          {cliente || 'Sin datos'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                        <strong>{tipoDocumento ? `${tipoDocumento}-` : ''}{numeroDocumento || 'N/A'}</strong>
                        {ruc && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                            RUC: {ruc}
                          </div>
                        )}
                      </td>
                      <td className="table-amount">
                        <strong>{formatMonto(Number(baseGravada))}</strong>
                      </td>
                      <td className="table-amount">
                        <strong>{formatMonto(Number(igv))}</strong>
                      </td>
                      <td className="table-amount">
                        <strong>{formatMonto(Number(exonerado))}</strong>
                      </td>
                      <td className="table-amount">
                        <strong>{formatMonto(Number(inafecto))}</strong>
                      </td>
                      <td className="table-amount total">
                        <strong>{formatMonto(Number(total))}</strong>
                        {moneda && moneda !== 'PEN' && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                            {moneda}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`table-badge ${estado?.toLowerCase() || 'sin-estado'}`}>
                          {estado || 'SIN ESTADO'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                        <strong>{tipoOperacion || 'N/A'}</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {comprobantesFiltrados.length > 50 && (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                color: '#64748b',
                fontSize: '0.9rem'
              }}>
                📋 Mostrando primeros 50 de {comprobantesFiltrados.length} comprobantes. 
                Use los filtros para refinar o{' '}
                <button 
                  onClick={exportarCSV} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#3b82f6', 
                    cursor: 'pointer', 
                    textDecoration: 'underline',
                    fontWeight: '600'
                  }}
                >
                  exporte todos a CSV
                </button>
              </div>
            )}
          </div>
        </div>
      ) : !stats && !loading && !loadingComprobantes ? (
        <div className="luxury-empty-state">
          <div className="empty-icon">📭</div>
          <h3 className="empty-title">No hay datos disponibles</h3>
          <p className="empty-description">
            Para ver los comprobantes de ventas del período <strong>{periodo.mes}/{periodo.año}</strong>,<br />
            haga clic en "Actualizar desde SUNAT" para obtener los datos más recientes.
          </p>
          <button className="luxury-button" onClick={actualizarDesdeSunat} disabled={!authStatus?.authenticated}>
            🔄 Obtener Datos de SUNAT
          </button>
        </div>
      ) : stats && comprobantesFiltrados.length === 0 ? (
        <div className="luxury-empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">Sin resultados</h3>
          <p className="empty-description">
            No se encontraron comprobantes que coincidan con los filtros aplicados.<br />
            Ajuste los criterios de búsqueda para ver más resultados.
          </p>
        </div>
      ) : null}

      {/* MENSAJES */}
      {error && (
        <div className="luxury-message error">
          ⚠️ {error}
        </div>
      )}

      {successMessage && (
        <div className="luxury-message success">
          ✅ {successMessage}
        </div>
      )}
    </div>
  );
};

export default RvieVentas;
