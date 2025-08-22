/**
 * Componente para gestionar las ventas e ingresos
 * Diseño profesional y elegante para análisis de datos SUNAT SIRE
 * ACTUALIZADO: Diseño luxury con toques suaves
 */

import { useState, useEffect } from 'react';
import { rvieVentasService } from '../../../../services/sire';
import { rvieComprobantesService } from '../../../../services/rvieComprobantesService';
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

  const [comprobantes, setComprobantes] = useState<ComprobanteVenta[]>([]);
  const [stats, setStats] = useState<VentasStats | null>(null);
  const [loadingComprobantes, setLoadingComprobantes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  
  // 🆕 Estados para gestión de BD
  const [vistaBD, setVistaBD] = useState(false); // false = SUNAT, true = BD
  const [datosBD, setDatosBD] = useState<ComprobanteVenta[]>([]);
  const [estadoBD, setEstadoBD] = useState<any>(null);
  const [loadingBD, setLoadingBD] = useState(false);
  
  const [filtros, setFiltros] = useState({
    tipo_comprobante: '',
    estado: '',
    monto_min: '',
    monto_max: ''
  });

  // 🆕 Recalcular estadísticas cuando cambie la vista o los datos
  useEffect(() => {
    const datosActuales = vistaBD ? datosBD : comprobantes;
    if (datosActuales && datosActuales.length > 0) {
      calcularEstadisticas(datosActuales);
    } else {
      setStats(null);
    }
  }, [vistaBD, datosBD, comprobantes]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Verificar estado de BD al cargar
        await verificarEstadoBD();
        
        // Si está autenticado, consultar SUNAT directamente
        if (authStatus?.authenticated) {
          await actualizarDesdeSunat();
        }
      } catch (error) {
        setError('Error al cargar los datos');
      }
    };

    cargarDatos();
  }, [ruc, periodo, authStatus?.authenticated]);

  // 🆕 Verificar estado de BD
  const verificarEstadoBD = async () => {
    try {
      const periodoFormateado = `${periodo.año}${periodo.mes.padStart(2, '0')}`;
      const estado = await rvieComprobantesService.verificarEstadoBD(ruc, periodoFormateado);
      setEstadoBD(estado);
    } catch (error) {
      console.warn('Error verificando estado BD:', error);
    }
  };

  // 🆕 Cargar datos desde BD
  const cargarDesdeBD = async () => {
    try {
      setLoadingBD(true);
      setError(null);
      
      const periodoFormateado = `${periodo.año}${periodo.mes.padStart(2, '0')}`;
      const resultado = await rvieComprobantesService.consultarComprobantes(ruc, {
        periodo: periodoFormateado,
        por_pagina: 2000 // Obtener todos los registros
      });
      
      if (resultado.success) {
        // Mapear datos de BD a formato esperado por el componente
        const comprobantesDB = resultado.comprobantes.map((comp: any) => ({
          // Mapear campos de BD a campos esperados por el componente
          codTipoCDP: comp.tipo_documento,
          desTipoCDP: comp.tipo_documento_desc || getTipoDocumentoDesc(comp.tipo_documento),
          numSerieCDP: comp.serie_comprobante,
          numCDP: comp.numero_comprobante,
          fecEmisionCDP: comp.fecha_emision,
          apeNomRznSocReceptor: comp.cliente_nombre,
          codTipoDocIdentidad: comp.cliente_tipo_documento,
          numDocReceptor: comp.cliente_numero_documento,
          numRuc: comp.cliente_ruc,
          mtoOperGravadas: comp.base_gravada,
          mtoIGV: comp.igv,
          mtoOperExoneradas: comp.exonerado,
          mtoOperInafectas: comp.inafecto,
          mtoTotalCP: comp.total,
          codMoneda: comp.moneda,
          desEstadoComprobante: comp.estado,
          indTipoOperacion: comp.tipo_operacion,
          // Mantener campos originales también
          ...comp
        }));
        
        setDatosBD(comprobantesDB);
        setUltimaActualizacion(new Date(resultado.comprobantes[0]?.fecha_registro || new Date()));
        
        setSuccessMessage(`✅ Cargados ${comprobantesDB.length} comprobantes desde BD local`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error: any) {
      setError('Error cargando datos desde BD: ' + error.message);
    } finally {
      setLoadingBD(false);
    }
  };

  // Función auxiliar para obtener descripción de tipo de documento
  const getTipoDocumentoDesc = (codigo: string) => {
    const tipos: Record<string, string> = {
      '01': 'Factura',
      '03': 'Boleta de Venta',
      '07': 'Nota de Crédito',
      '08': 'Nota de Débito'
    };
    return tipos[codigo] || codigo;
  };

  const actualizarDesdeSunat = async () => {
    try {
      setLoadingComprobantes(true);
      setError(null);
      setSuccessMessage(null);
      
      const periodoFormateado = `${periodo.año}${periodo.mes.padStart(2, '0')}`;
      
      const resumenActualizado = await rvieVentasService.actualizarDesdeSunat(ruc, periodoFormateado, [1, 4, 5]);
      
      if (resumenActualizado.success) {
        const comprobantesData = resumenActualizado.data?.registros || [];
        
        setComprobantes(comprobantesData);
        calcularEstadisticas(comprobantesData);
        setUltimaActualizacion(new Date());
        
        setSuccessMessage(`✅ Datos actualizados exitosamente. ${comprobantesData.length} comprobantes encontrados.`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(resumenActualizado.mensaje || 'Error al obtener datos de SUNAT');
      }
    } catch (error) {
      setError('Error de conexión con SUNAT. Intente nuevamente.');
    } finally {
      setLoadingComprobantes(false);
    }
  };

  const calcularEstadisticas = (comprobantesData: ComprobanteVenta[]) => {
    if (!comprobantesData || comprobantesData.length === 0) {
      setStats(null);
      return;
    }

    const porTipo: Record<string, { cantidad: number; monto: number }> = {};
    const porEstado: Record<string, number> = {};
    let totalMonto = 0;

    comprobantesData.forEach((comp) => {
      // Obtener el tipo de comprobante
      const tipoComprobante = comp.codTipoCDP || comp.desTipoCDP || 'SIN_TIPO';
      
      // Por tipo
      if (!porTipo[tipoComprobante]) {
        porTipo[tipoComprobante] = { cantidad: 0, monto: 0 };
      }
      porTipo[tipoComprobante].cantidad++;
      
      // Monto total
      const monto = comp.mtoTotalCP || comp.total || comp.monto || 0;
      porTipo[tipoComprobante].monto += monto;

      // Por estado
      const estado = comp.desEstadoComprobante || comp.estado || 'SIN_ESTADO';
      porEstado[estado] = (porEstado[estado] || 0) + 1;

      totalMonto += monto;
    });


    setStats({
      total_comprobantes: comprobantesData.length,
      total_monto: totalMonto,
      por_tipo: porTipo,
      por_estado: porEstado
    });
  };

  const filtrarComprobantes = () => {
    // 🆕 Usar datos según la vista actual
    const datosOriginales = vistaBD ? datosBD : comprobantes;
    
    if (!datosOriginales || datosOriginales.length === 0) {
      return [];
    }

    return datosOriginales.filter(comp => {
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
      setError('Error al exportar el reporte. Intente nuevamente.');
    }
  };

  const verEnSunat = () => {
    try {
      const url = 'https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm';
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
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

  const comprobantesFiltrados = filtrarComprobantes();

  return (
    <div className="rvie-ventas-luxury">
      {/* FILA 1: HEADER COMPACTO CON INFO DEL PERÍODO Y TOGGLE DE VISTAS */}
      <div className="compact-header-row">
        <div className="header-info-compact">
          <h2>📊 Ventas e Ingresos</h2>
          <div className="header-badges">
            <span className="info-badge">📅 {periodo.mes}/{periodo.año}</span>
            <span className="info-badge">🏢 {ruc}</span>
            <span className={`info-badge ${authStatus?.authenticated ? 'success' : 'error'}`}>
              {authStatus?.authenticated ? '✅ Autenticado' : '❌ No autenticado'}
            </span>
            {/* 🆕 Indicador de estado BD */}
            {estadoBD?.tiene_datos && (
              <span className="info-badge success">
                💾 BD: {estadoBD.total_comprobantes} registros
              </span>
            )}
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
          {/* 🆕 Toggle de vistas */}
          <div className="vista-toggle">
            <button
              className={`compact-button ${!vistaBD ? 'primary' : 'secondary'}`}
              onClick={() => {
                setVistaBD(false);
                if (!vistaBD && authStatus?.authenticated) {
                  actualizarDesdeSunat(); // Refrescar datos SUNAT
                }
              }}
              disabled={loading || loadingComprobantes}
            >
              🌐 SUNAT
            </button>
            <button
              className={`compact-button ${vistaBD ? 'primary' : 'secondary'}`}
              onClick={() => {
                setVistaBD(true);
                cargarDesdeBD(); // Cargar datos de BD
              }}
              disabled={loadingBD || (!estadoBD?.tiene_datos)}
              title={!estadoBD?.tiene_datos ? 'No hay datos guardados en BD' : 'Ver datos guardados localmente'}
            >
              💾 BD Local {estadoBD?.tiene_datos ? `(${estadoBD.total_comprobantes})` : ''}
            </button>
          </div>
          
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
        </div>
        
        {/* 🆕 Badges informativos */}
        <div className="info-badges">
          {vistaBD ? (
            <div className="badge badge-bd">
              💾 Vista BD Local - {datosBD?.length || 0} registros
              {estadoBD?.ultima_actualizacion && (
                <span className="badge-detail">
                  (última actualización: {new Date(estadoBD.ultima_actualizacion).toLocaleDateString()})
                </span>
              )}
            </div>
          ) : (
            <div className="badge badge-sunat">
              🌐 Vista SUNAT - {comprobantes?.length || 0} registros
              {estadoBD?.tiene_datos && (
                <span className="badge-detail">
                  💡 Datos también guardados en BD Local
                </span>
              )}
            </div>
          )}
        </div>

        {loadingBD && (
          <div className="loading-message">
            <div className="loading-spinner"></div>
            Cargando datos desde BD local...
          </div>
        )}
        
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
