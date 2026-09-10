/**
 * Componente para gestionar las ventas e ingresos
 * Diseño profesional y elegante para análisis de datos SUNAT SIRE
 * ACTUALIZADO: Diseño luxury con toques suaves
 */

import { useState, useEffect } from 'react';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Cloud,
  Database,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  Wallet,
} from 'lucide-react';
import { rvieVentasService } from '../../../../services/sire';
import { rvieComprobantesService } from '../../../../services/rvieComprobantesService';
import { StatCard, StatGrid } from '../../../common/StatCard';
import EmptyState from '../../../common/EmptyState';
import { cn } from '../../../../lib/cn';

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

  /**
   * SUNAT no devuelve siempre los mismos nombres de campo, y la vista desde
   * base de datos usa otros. Se busca el primero que traiga valor.
   */
  const getFieldValue = (comp: any, ...fieldNames: string[]) => {
    for (const fieldName of fieldNames) {
      if (comp[fieldName] !== undefined && comp[fieldName] !== null && comp[fieldName] !== '') {
        return comp[fieldName];
      }
      if (comp.data?.[fieldName] !== undefined && comp.data[fieldName] !== null && comp.data[fieldName] !== '') {
        return comp.data[fieldName];
      }
      if (
        comp.comprobante?.[fieldName] !== undefined &&
        comp.comprobante[fieldName] !== null &&
        comp.comprobante[fieldName] !== ''
      ) {
        return comp.comprobante[fieldName];
      }
    }
    return null;
  };

  /** Ultimo recurso: buscar cualquier clave que contenga el patron. */
  const findFieldByPattern = (comp: any, pattern: string) => {
    for (const key of Object.keys(comp)) {
      if (key.toLowerCase().includes(pattern.toLowerCase())) {
        const value = comp[key];
        if (value !== undefined && value !== null && value !== '') return value;
      }
    }
    return null;
  };

  const TIPO_CORTO: Record<string, string> = {
    '01': 'FAC',
    '03': 'BOL',
    '07': 'NCR',
    '08': 'NDB',
  };

  const th = 'px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-white uppercase';
  const td = 'px-3 py-2.5 text-sm whitespace-nowrap text-slate-700';
  const control =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none';
  const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase';

  const cargando = loading || loadingComprobantes || loadingBD;

  return (
    <div className="space-y-5 p-4 sm:p-5">
      {/* ------------------------------------------------------------------ */}
      {/* Cabecera: origen de datos y actualizacion                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Ventas e ingresos · {periodo.mes}/{periodo.año}
          </h3>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              authStatus?.authenticated
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            )}
          >
            {authStatus?.authenticated ? 'Conectado a SUNAT' : 'Sin conexión'}
          </span>
          {estadoBD?.tiene_datos && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 tabular-nums">
              BD: {estadoBD.total_comprobantes}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Origen de los datos */}
          <div
            role="tablist"
            aria-label="Origen de los datos"
            className="inline-flex overflow-hidden rounded-lg border border-slate-300"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!vistaBD}
              onClick={() => {
                setVistaBD(false);
                if (!vistaBD && authStatus?.authenticated) actualizarDesdeSunat();
              }}
              disabled={cargando}
              className={cn(
                'inline-flex items-center gap-1.5 border-0 px-3 py-1.5 text-sm font-medium disabled:opacity-50',
                !vistaBD ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              <Cloud className="size-4" aria-hidden="true" />
              SUNAT
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={vistaBD}
              onClick={() => {
                setVistaBD(true);
                cargarDesdeBD();
              }}
              disabled={loadingBD || !estadoBD?.tiene_datos}
              className={cn(
                'inline-flex items-center gap-1.5 border-0 px-3 py-1.5 text-sm font-medium disabled:opacity-50',
                vistaBD ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              <Database className="size-4" aria-hidden="true" />
              Local
            </button>
          </div>

          <button
            type="button"
            onClick={actualizarDesdeSunat}
            disabled={loadingComprobantes || !authStatus?.authenticated}
            title="Actualizar desde SUNAT"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingComprobantes ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-4" aria-hidden="true" />
            )}
            Actualizar
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Indicadores                                                        */}
      {/* ------------------------------------------------------------------ */}
      {stats && (
        <>
          <StatGrid className="xl:grid-cols-3">
            <StatCard
              label="Comprobantes"
              value={stats.total_comprobantes.toLocaleString('es-PE')}
              icon={FileText}
              tone="blue"
            />
            <StatCard
              label="Total"
              value={formatMonto(stats.total_monto)}
              icon={Wallet}
              tone="green"
            />
            <StatCard
              label="Promedio"
              value={formatMonto(
                stats.total_comprobantes > 0 ? stats.total_monto / stats.total_comprobantes : 0
              )}
              icon={BarChart3}
              tone="violet"
            />
          </StatGrid>

          <div className="grid gap-4 xl:grid-cols-2">
            {/* Por tipo */}
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Por tipo de comprobante
              </h4>
              <ul className="space-y-1.5">
                {Object.entries(stats.por_tipo).map(([tipo, data]) => {
                  const porcentaje = ((data.cantidad / stats.total_comprobantes) * 100).toFixed(1);
                  return (
                    <li key={tipo} className="flex items-center justify-between gap-3 text-sm">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {getTipoNombre(tipo)}
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {data.cantidad} ({porcentaje}%)
                        <span className="ml-3 font-semibold text-slate-800">
                          {formatMonto(data.monto)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Por estado */}
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Por estado
              </h4>
              <ul className="space-y-1.5">
                {Object.entries(stats.por_estado).map(([estado, cantidad]) => {
                  const porcentaje = ((cantidad / stats.total_comprobantes) * 100).toFixed(1);
                  return (
                    <li key={estado} className="flex items-center justify-between gap-3 text-sm">
                      <span
                        className={cn(
                          'rounded px-2 py-0.5 text-xs font-medium',
                          estado.toUpperCase() === 'ANULADO'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        )}
                      >
                        {estado}
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {cantidad} ({porcentaje}%)
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Filtros                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label htmlFor="rv-tipo" className={labelClass}>
            Tipo
          </label>
          <select
            id="rv-tipo"
            value={filtros.tipo_comprobante}
            onChange={(e) => setFiltros((prev) => ({ ...prev, tipo_comprobante: e.target.value }))}
            className={control}
          >
            <option value="">Todos</option>
            <option value="01">Factura</option>
            <option value="03">Boleta</option>
            <option value="07">Nota de crédito</option>
            <option value="08">Nota de débito</option>
          </select>
        </div>

        <div>
          <label htmlFor="rv-estado" className={labelClass}>
            Estado
          </label>
          <select
            id="rv-estado"
            value={filtros.estado}
            onChange={(e) => setFiltros((prev) => ({ ...prev, estado: e.target.value }))}
            className={control}
          >
            <option value="">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="ANULADO">Anulado</option>
          </select>
        </div>

        <div>
          <label htmlFor="rv-min" className={labelClass}>
            Monto mínimo
          </label>
          <input
            id="rv-min"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={filtros.monto_min}
            onChange={(e) => setFiltros((prev) => ({ ...prev, monto_min: e.target.value }))}
            className={cn(control, 'text-right tabular-nums')}
          />
        </div>

        <div>
          <label htmlFor="rv-max" className={labelClass}>
            Monto máximo
          </label>
          <input
            id="rv-max"
            type="number"
            step="0.01"
            placeholder="Sin límite"
            value={filtros.monto_max}
            onChange={(e) => setFiltros((prev) => ({ ...prev, monto_max: e.target.value }))}
            className={cn(control, 'text-right tabular-nums')}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Tabla                                                              */}
      {/* ------------------------------------------------------------------ */}
      {comprobantesFiltrados.length > 0 ? (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <h4 className="text-sm font-semibold text-slate-900">
              Comprobantes{' '}
              <span className="font-normal text-slate-500 tabular-nums">
                ({comprobantesFiltrados.length})
              </span>
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportarCSV}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FileSpreadsheet className="size-4 text-emerald-600" aria-hidden="true" />
                Exportar CSV
              </button>
              <button
                type="button"
                onClick={verEnSunat}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                Ver en SUNAT
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-blue-800">
                <tr>
                  <th scope="col" className={cn(th, 'w-14 text-center')}>#</th>
                  <th scope="col" className={th}>Tipo</th>
                  <th scope="col" className={th}>Número</th>
                  <th scope="col" className={cn(th, 'text-center')}>Fecha</th>
                  <th scope="col" className={th}>Cliente</th>
                  <th scope="col" className={cn(th, 'text-center')}>Documento</th>
                  <th scope="col" className={cn(th, 'text-right')}>Base gravada</th>
                  <th scope="col" className={cn(th, 'text-right')}>IGV</th>
                  <th scope="col" className={cn(th, 'text-right')}>Exonerado</th>
                  <th scope="col" className={cn(th, 'text-right')}>Inafecto</th>
                  <th scope="col" className={cn(th, 'text-right')}>Total</th>
                  <th scope="col" className={cn(th, 'text-center')}>Estado</th>
                  <th scope="col" className={cn(th, 'text-center')}>Tipo op.</th>
                </tr>
              </thead>

              <tbody>
                {comprobantesFiltrados.slice(0, 50).map((comp: any, index) => {
                  const id = getFieldValue(comp, '_id', 'id') || `temp_${index}`;
                  const tipoComprobante = getFieldValue(comp, 'codTipoCDP', 'desTipoCDP', 'tipo');
                  const serie = getFieldValue(comp, 'numSerieCDP', 'serie');
                  const numero = getFieldValue(comp, 'numCDP', 'numero');

                  const fecha =
                    getFieldValue(comp, 'fecEmisionCDP', 'fecha', 'fechaEmision', 'fecEmision', 'dateEmision') ||
                    findFieldByPattern(comp, 'fecha') ||
                    findFieldByPattern(comp, 'fec');

                  // El receptor es el cliente; la razon social puede ser la del
                  // emisor, asi que solo se usa como ultimo recurso.
                  const cliente =
                    getFieldValue(comp, 'apeNomRznSocReceptor', 'nombreReceptor', 'clienteNombre', 'receptor') ||
                    findFieldByPattern(comp, 'receptor') ||
                    findFieldByPattern(comp, 'cliente') ||
                    getFieldValue(comp, 'nomRazonSocial', 'razonSocial') ||
                    findFieldByPattern(comp, 'nombre');

                  const tipoDocumento = getFieldValue(comp, 'codTipoDocIdentidad', 'tipoDocumento', 'tipoDoc');
                  const numeroDocumento = getFieldValue(comp, 'numDocReceptor', 'numeroDocumento', 'documento', 'docReceptor');
                  const rucComp = getFieldValue(comp, 'numRuc', 'ruc');

                  const baseGravada = Number(
                    getFieldValue(comp, 'mtoOperGravadas', 'baseGravada', 'gravada', 'operGravadas') ||
                      findFieldByPattern(comp, 'gravada') || 0
                  );
                  const igv = Number(
                    getFieldValue(comp, 'mtoIGV', 'igv', 'IGV') || findFieldByPattern(comp, 'igv') || 0
                  );
                  const exonerado = Number(
                    getFieldValue(comp, 'mtoOperExoneradas', 'exonerado', 'operExoneradas', 'montoExonerado', 'mtoExonerado') ||
                      findFieldByPattern(comp, 'exoner') ||
                      findFieldByPattern(comp, 'exo') || 0
                  );
                  const inafecto = Number(
                    getFieldValue(comp, 'mtoOperInafectas', 'inafecto', 'operInafectas', 'montoInafecto', 'mtoInafecto') ||
                      findFieldByPattern(comp, 'inafect') || 0
                  );
                  const total = Number(
                    getFieldValue(comp, 'mtoTotalCP', 'total', 'monto', 'montoTotal', 'totalComprobante') ||
                      findFieldByPattern(comp, 'total') || 0
                  );

                  const moneda = getFieldValue(comp, 'codMoneda', 'moneda') || 'PEN';
                  const estado =
                    getFieldValue(comp, 'desEstadoComprobante', 'estado', 'estadoComprobante') ||
                    findFieldByPattern(comp, 'estado') ||
                    'SIN_ESTADO';
                  const tipoOperacion =
                    getFieldValue(comp, 'indTipoOperacion', 'tipoOperacion', 'operacion', 'codOperacion', 'indicadorOperacion') ||
                    findFieldByPattern(comp, 'operacion') ||
                    findFieldByPattern(comp, 'tipo');

                  return (
                    <tr
                      key={id}
                      className="border-b border-slate-100 last:border-0 odd:bg-slate-50/60 hover:bg-blue-50"
                    >
                      <td className={cn(td, 'text-center text-slate-400 tabular-nums')}>
                        {index + 1}
                      </td>

                      <td className={td}>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {TIPO_CORTO[tipoComprobante] || tipoComprobante || 'N/A'}
                        </span>
                      </td>

                      <td className={cn(td, 'font-mono')}>
                        {serie || 'N/A'}-{numero || 'N/A'}
                      </td>

                      <td className={cn(td, 'text-center tabular-nums')}>{fecha || 'N/A'}</td>

                      <td className={cn(td, 'max-w-50 truncate whitespace-normal')}>
                        {cliente || 'Sin datos'}
                      </td>

                      <td className={cn(td, 'text-center font-mono')}>
                        {tipoDocumento ? `${tipoDocumento}-` : ''}
                        {numeroDocumento || 'N/A'}
                        {rucComp && (
                          <span className="block text-xs text-slate-400">RUC {rucComp}</span>
                        )}
                      </td>

                      <td className={cn(td, 'text-right tabular-nums')}>{formatMonto(baseGravada)}</td>
                      <td className={cn(td, 'text-right tabular-nums')}>{formatMonto(igv)}</td>
                      <td className={cn(td, 'text-right tabular-nums')}>{formatMonto(exonerado)}</td>
                      <td className={cn(td, 'text-right tabular-nums')}>{formatMonto(inafecto)}</td>

                      <td className={cn(td, 'text-right font-semibold tabular-nums')}>
                        {formatMonto(total)}
                        {moneda !== 'PEN' && (
                          <span className="block text-xs font-normal text-slate-400">{moneda}</span>
                        )}
                      </td>

                      <td className={cn(td, 'text-center')}>
                        <span
                          className={cn(
                            'rounded px-2 py-0.5 text-xs font-medium',
                            String(estado).toUpperCase() === 'ANULADO'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          )}
                        >
                          {estado}
                        </span>
                      </td>

                      <td className={cn(td, 'text-center')}>{tipoOperacion || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {comprobantesFiltrados.length > 50 && (
            <p className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
              Mostrando los primeros 50 de{' '}
              <span className="tabular-nums">{comprobantesFiltrados.length}</span>. Afina los
              filtros o{' '}
              <button
                type="button"
                onClick={exportarCSV}
                className="border-0 bg-transparent p-0 font-semibold text-blue-600 underline hover:text-blue-800"
              >
                exporta todos a CSV
              </button>
              .
            </p>
          )}
        </section>
      ) : !stats && !cargando ? (
        <EmptyState
          icon={Inbox}
          title="No hay datos disponibles"
          description={`Para ver los comprobantes de ${periodo.mes}/${periodo.año}, actualiza desde SUNAT.`}
        >
          <button
            type="button"
            onClick={actualizarDesdeSunat}
            disabled={!authStatus?.authenticated}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Obtener datos de SUNAT
          </button>
        </EmptyState>
      ) : stats && comprobantesFiltrados.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="Ningún comprobante coincide con los filtros aplicados."
        />
      ) : null}

      {/* Mensajes */}
      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {successMessage && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {successMessage}
        </p>
      )}
    </div>
  );
};

export default RvieVentas;
