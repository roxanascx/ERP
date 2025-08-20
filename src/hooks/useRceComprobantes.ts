/**
 * Hook especializado para gestión de comprobantes RCE
 * Funcionalidades avanzadas para CRUD y búsqueda de comprobantes
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { rceApi } from '../services/rceApi';
import type {
  RceComprobante,
  RceComprobanteRequest,
  RceFiltros,
  RceEstadoComprobante,
  RceTipoComprobante,
  RceResultadoValidacion
} from '../types/rce';

// ========================================
// TIPOS DEL HOOK
// ========================================

interface UseRceComprobantesOptions {
  ruc: string;
  auto_load?: boolean;
  filtros_iniciales?: Partial<RceFiltros>;
  page_size?: number;
  cache_duration?: number;
}

interface ComprobanteEstadisticas {
  total: number;
  por_estado: Record<RceEstadoComprobante, number>;
  por_tipo: Record<RceTipoComprobante, number>;
  importe_total: number;
  promedio_importe: number;
}

interface UseRceComprobantesReturn {
  // Estado principal
  comprobantes: RceComprobante[];
  loading: boolean;
  error: string | null;
  
  // Paginación
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  
  // Filtros y búsqueda
  filtros: RceFiltros;
  textoBusqueda: string;
  
  // Estadísticas computadas
  estadisticas: ComprobanteEstadisticas;
  
  // Selección múltiple
  seleccionados: string[];
  todoSeleccionado: boolean;
  algunoSeleccionado: boolean;
  
  // Estados de operaciones
  guardando: boolean;
  validando: boolean;
  eliminando: boolean;
  exportando: boolean;
  
  // Métodos principales
  buscar: (nuevaBusqueda?: string) => Promise<void>;
  cargarPagina: (page: number) => Promise<void>;
  refrescar: () => Promise<void>;
  
  // CRUD
  crear: (datos: RceComprobanteRequest) => Promise<RceComprobante>;
  actualizar: (id: string, datos: Partial<RceComprobanteRequest>) => Promise<RceComprobante>;
  eliminar: (id: string) => Promise<void>;
  eliminarMasivo: (ids: string[]) => Promise<void>;
  
  // Validación
  validar: (id: string) => Promise<RceResultadoValidacion>;
  validarMasivo: (ids?: string[]) => Promise<any>;
  
  // Filtros
  actualizarFiltros: (nuevosFiltros: Partial<RceFiltros>) => void;
  limpiarFiltros: () => void;
  aplicarFiltroRapido: (tipo: 'hoy' | 'semana' | 'mes' | 'año', valor?: string) => void;
  
  // Selección
  seleccionar: (id: string) => void;
  deseleccionar: (id: string) => void;
  seleccionarTodos: () => void;
  deseleccionarTodos: () => void;
  toggleSeleccion: (id: string) => void;
  
  // Búsqueda
  actualizarBusqueda: (texto: string) => void;
  buscarPorCampo: (campo: keyof RceComprobante, valor: any) => void;
  
  // Utilidades
  obtenerPorId: (id: string) => RceComprobante | undefined;
  filtrarLocalmente: (predicado: (comp: RceComprobante) => boolean) => RceComprobante[];
  exportar: (formato: 'csv' | 'excel', incluirSeleccionados?: boolean) => Promise<Blob>;
  
  // Control
  clearError: () => void;
  resetearEstado: () => void;
}

// ========================================
// CONSTANTES
// ========================================

const FILTROS_DEFECTO: RceFiltros = {
  incluir_anulados: false,
  incluir_observados: true,
  periodo: new Date().getFullYear().toString()
};

const PAGE_SIZE_DEFECTO = 50;
const CACHE_DURATION_DEFECTO = 5 * 60 * 1000; // 5 minutos

// ========================================
// HOOK PRINCIPAL
// ========================================

export const useRceComprobantes = (options: UseRceComprobantesOptions): UseRceComprobantesReturn => {
  const {
    ruc,
    auto_load = true,
    filtros_iniciales = {},
    page_size = PAGE_SIZE_DEFECTO,
    cache_duration = CACHE_DURATION_DEFECTO
  } = options;

  // ========================================
  // ESTADO PRINCIPAL
  // ========================================

  const [comprobantes, setComprobantes] = useState<RceComprobante[]>([]);
  const [loading, setLoading] = useState(auto_load);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filtros y búsqueda
  const [filtros, setFiltros] = useState<RceFiltros>({ ...FILTROS_DEFECTO, ...filtros_iniciales });
  const [textoBusqueda, setTextoBusqueda] = useState('');
  
  // Selección
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  
  // Estados de operaciones
  const [guardando, setGuardando] = useState(false);
  const [validando, setValidando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [exportando, setExportando] = useState(false);
  
  // Cache
  const [lastFetch, setLastFetch] = useState<number>(0);

  // ========================================
  // VALORES COMPUTADOS
  // ========================================

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  const todoSeleccionado = comprobantes.length > 0 && seleccionados.length === comprobantes.length;
  const algunoSeleccionado = seleccionados.length > 0;

  const estadisticas = useMemo((): ComprobanteEstadisticas => {
    const stats: ComprobanteEstadisticas = {
      total: comprobantes.length,
      por_estado: {} as Record<RceEstadoComprobante, number>,
      por_tipo: {} as Record<RceTipoComprobante, number>,
      importe_total: 0,
      promedio_importe: 0
    };

    // Inicializar contadores
    const estados: RceEstadoComprobante[] = ['registrado', 'validado', 'observado', 'anulado', 'pendiente', 'procesado'];
    const tipos: RceTipoComprobante[] = ['01', '02', '03', '07', '08', '09', '20', '40'];
    
    estados.forEach(estado => { stats.por_estado[estado] = 0; });
    tipos.forEach(tipo => { stats.por_tipo[tipo] = 0; });

    // Calcular estadísticas
    comprobantes.forEach(comp => {
      // Contar por estado
      if (comp.estado in stats.por_estado) {
        stats.por_estado[comp.estado]++;
      }
      
      // Contar por tipo
      if (comp.tipo_comprobante in stats.por_tipo) {
        stats.por_tipo[comp.tipo_comprobante]++;
      }
      
      // Sumar importes
      stats.importe_total += comp.importe_total || 0;
    });

    // Calcular promedio
    stats.promedio_importe = stats.total > 0 ? stats.importe_total / stats.total : 0;

    return stats;
  }, [comprobantes]);

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  const handleError = useCallback((error: any, contexto: string) => {
    console.error(`Error en useRceComprobantes - ${contexto}:`, error);
    const mensaje = error?.response?.data?.mensaje || error?.message || `Error en ${contexto}`;
    setError(mensaje);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const shouldRefreshCache = useCallback(() => {
    return Date.now() - lastFetch > cache_duration;
  }, [lastFetch, cache_duration]);

  // ========================================
  // MÉTODOS DE CARGA
  // ========================================

  const buscar = useCallback(async (nuevaBusqueda?: string) => {
    if (loading && !nuevaBusqueda) return;
    
    setLoading(true);
    clearError();
    
    try {
      const busquedaActual = nuevaBusqueda !== undefined ? nuevaBusqueda : textoBusqueda;
      const filtrosConBusqueda = {
        ...filtros,
        texto_libre: busquedaActual || undefined
      };
      
      const offset = (currentPage - 1) * page_size;
      const response = await rceApi.comprobantes.buscarSimple(ruc, filtrosConBusqueda, page_size, offset);
      
      if (response.exitoso && response.datos) {
        const { comprobantes: nuevosComprobantes, total } = response.datos;
        
        setComprobantes(nuevosComprobantes || []);
        setTotalItems(total || 0);
        setTotalPages(Math.ceil((total || 0) / page_size));
        setLastFetch(Date.now());
        
        // Limpiar selección si cambió la búsqueda
        if (nuevaBusqueda !== undefined) {
          setSeleccionados([]);
        }
      }
    } catch (error) {
      handleError(error, 'buscar comprobantes');
    } finally {
      setLoading(false);
    }
  }, [ruc, filtros, textoBusqueda, currentPage, page_size, loading, clearError, handleError]);

  const cargarPagina = useCallback(async (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    
    setCurrentPage(page);
    // El efecto se encargará de cargar cuando cambie currentPage
  }, [currentPage, totalPages]);

  const refrescar = useCallback(async () => {
    setLastFetch(0); // Forzar refresh
    await buscar();
  }, [buscar]);

  // ========================================
  // MÉTODOS CRUD
  // ========================================

  const crear = useCallback(async (datos: RceComprobanteRequest): Promise<RceComprobante> => {
    setGuardando(true);
    try {
      const response = await rceApi.comprobantes.crear(ruc, datos);
      if (response.exitoso && response.datos) {
        // Insertar al inicio de la lista
        setComprobantes(prev => [response.datos!, ...prev]);
        setTotalItems(prev => prev + 1);
        return response.datos;
      }
      throw new Error('Error al crear comprobante');
    } catch (error) {
      handleError(error, 'crear comprobante');
      throw error;
    } finally {
      setGuardando(false);
    }
  }, [ruc, handleError]);

  const actualizar = useCallback(async (id: string, datos: Partial<RceComprobanteRequest>): Promise<RceComprobante> => {
    setGuardando(true);
    try {
      const response = await rceApi.comprobantes.actualizar(ruc, id, datos);
      if (response.exitoso && response.datos) {
        // Actualizar en la lista
        setComprobantes(prev => 
          prev.map(comp => comp.id === id ? response.datos! : comp)
        );
        return response.datos;
      }
      throw new Error('Error al actualizar comprobante');
    } catch (error) {
      handleError(error, 'actualizar comprobante');
      throw error;
    } finally {
      setGuardando(false);
    }
  }, [ruc, handleError]);

  const eliminar = useCallback(async (id: string): Promise<void> => {
    setEliminando(true);
    try {
      const response = await rceApi.comprobantes.eliminar(ruc, id);
      if (response.exitoso) {
        // Remover de la lista
        setComprobantes(prev => prev.filter(comp => comp.id !== id));
        setSeleccionados(prev => prev.filter(selId => selId !== id));
        setTotalItems(prev => prev - 1);
      }
    } catch (error) {
      handleError(error, 'eliminar comprobante');
      throw error;
    } finally {
      setEliminando(false);
    }
  }, [ruc, handleError]);

  const eliminarMasivo = useCallback(async (ids: string[]): Promise<void> => {
    setEliminando(true);
    try {
      // Eliminar uno por uno (el API no tiene delete masivo)
      const resultados = await Promise.allSettled(
        ids.map(id => rceApi.comprobantes.eliminar(ruc, id))
      );
      
      // Contar exitosos
      const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
      
      if (exitosos > 0) {
        // Remover de la lista
        setComprobantes(prev => prev.filter(comp => comp.id && !ids.includes(comp.id)));
        setSeleccionados(prev => prev.filter(selId => !ids.includes(selId)));
        setTotalItems(prev => prev - exitosos);
      }
      
      if (exitosos < ids.length) {
        throw new Error(`Solo se eliminaron ${exitosos} de ${ids.length} comprobantes`);
      }
    } catch (error) {
      handleError(error, 'eliminar comprobantes');
      throw error;
    } finally {
      setEliminando(false);
    }
  }, [ruc, handleError]);

  // ========================================
  // MÉTODOS DE VALIDACIÓN
  // ========================================

  const validar = useCallback(async (id: string): Promise<RceResultadoValidacion> => {
    setValidando(true);
    try {
      const response = await rceApi.comprobantes.validarIndividual(ruc, id);
      if (response.exitoso && response.datos) {
        // Actualizar estado del comprobante
        setComprobantes(prev =>
          prev.map(comp => 
            comp.id === id 
              ? { ...comp, estado: response.datos!.valido ? 'validado' as RceEstadoComprobante : 'observado' as RceEstadoComprobante }
              : comp
          )
        );
        return response.datos;
      }
      throw new Error('Error al validar comprobante');
    } catch (error) {
      handleError(error, 'validar comprobante');
      throw error;
    } finally {
      setValidando(false);
    }
  }, [ruc, handleError]);

  const validarMasivo = useCallback(async (ids?: string[]) => {
    const idsAValidar = ids || seleccionados;
    if (idsAValidar.length === 0) return;
    
    setValidando(true);
    try {
      const response = await rceApi.comprobantes.validarMasivo(ruc, idsAValidar);
      if (response.exitoso && response.datos) {
        // Actualizar estados
        if (response.datos.resultados) {
          setComprobantes(prev =>
            prev.map(comp => {
              const resultado = response.datos!.resultados.find(r => r.comprobante_id === comp.id);
              return resultado ? {
                ...comp,
                estado: resultado.valido ? 'validado' as RceEstadoComprobante : 'observado' as RceEstadoComprobante
              } : comp;
            })
          );
        }
        return response.datos;
      }
      throw new Error('Error en validación masiva');
    } catch (error) {
      handleError(error, 'validar comprobantes');
      throw error;
    } finally {
      setValidando(false);
    }
  }, [ruc, seleccionados, handleError]);

  // ========================================
  // MÉTODOS DE FILTROS
  // ========================================

  const actualizarFiltros = useCallback((nuevosFiltros: Partial<RceFiltros>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    setCurrentPage(1); // Reset página
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_DEFECTO);
    setTextoBusqueda('');
    setCurrentPage(1);
  }, []);

  const aplicarFiltroRapido = useCallback((tipo: 'hoy' | 'semana' | 'mes' | 'año', valor?: string) => {
    const hoy = new Date();
    let fecha_inicio: string;
    let fecha_fin: string;

    switch (tipo) {
      case 'hoy':
        fecha_inicio = fecha_fin = hoy.toISOString().split('T')[0];
        break;
      case 'semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        fecha_inicio = inicioSemana.toISOString().split('T')[0];
        fecha_fin = hoy.toISOString().split('T')[0];
        break;
      case 'mes':
        fecha_inicio = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
        fecha_fin = hoy.toISOString().split('T')[0];
        break;
      case 'año':
        fecha_inicio = `${valor || hoy.getFullYear()}-01-01`;
        fecha_fin = `${valor || hoy.getFullYear()}-12-31`;
        break;
    }

    actualizarFiltros({ fecha_inicio, fecha_fin });
  }, [actualizarFiltros]);

  // ========================================
  // MÉTODOS DE SELECCIÓN
  // ========================================

  const seleccionar = useCallback((id: string) => {
    setSeleccionados(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const deseleccionar = useCallback((id: string) => {
    setSeleccionados(prev => prev.filter(selId => selId !== id));
  }, []);

  const seleccionarTodos = useCallback(() => {
    setSeleccionados(comprobantes.map(comp => comp.id).filter((id): id is string => id !== undefined));
  }, [comprobantes]);

  const deseleccionarTodos = useCallback(() => {
    setSeleccionados([]);
  }, []);

  const toggleSeleccion = useCallback((id: string) => {
    setSeleccionados(prev => 
      prev.includes(id) 
        ? prev.filter(selId => selId !== id)
        : [...prev, id]
    );
  }, []);

  // ========================================
  // MÉTODOS DE BÚSQUEDA
  // ========================================

  const actualizarBusqueda = useCallback((texto: string) => {
    setTextoBusqueda(texto);
    setCurrentPage(1);
  }, []);

  const buscarPorCampo = useCallback((campo: keyof RceComprobante, valor: any) => {
    const nuevosFiltros: Partial<RceFiltros> = {};
    
    switch (campo) {
      case 'ruc_emisor':
        nuevosFiltros.ruc_emisor = valor;
        break;
      case 'tipo_comprobante':
        nuevosFiltros.tipo_comprobante = [valor];
        break;
      case 'serie':
        nuevosFiltros.serie = valor;
        break;
      case 'numero':
        nuevosFiltros.numero = valor;
        break;
      case 'estado':
        nuevosFiltros.estado = [valor];
        break;
      default:
        // Para otros campos, usar búsqueda libre
        setTextoBusqueda(String(valor));
        break;
    }
    
    if (Object.keys(nuevosFiltros).length > 0) {
      actualizarFiltros(nuevosFiltros);
    }
  }, [actualizarFiltros]);

  // ========================================
  // MÉTODOS DE UTILIDADES
  // ========================================

  const obtenerPorId = useCallback((id: string): RceComprobante | undefined => {
    return comprobantes.find(comp => comp.id === id);
  }, [comprobantes]);

  const filtrarLocalmente = useCallback((predicado: (comp: RceComprobante) => boolean): RceComprobante[] => {
    return comprobantes.filter(predicado);
  }, [comprobantes]);

  const exportar = useCallback(async (formato: 'csv' | 'excel', incluirSeleccionados = false): Promise<Blob> => {
    setExportando(true);
    try {
      const filtrosExport = incluirSeleccionados && seleccionados.length > 0
        ? { ...filtros, ids_especificos: seleccionados }
        : filtros;

      const request = { ruc, filtros: filtrosExport };
      
      const blob = formato === 'csv'
        ? await rceApi.comprobantes.exportarCsv(request)
        : await rceApi.comprobantes.exportarExcel(request);
      
      return blob;
    } catch (error) {
      handleError(error, 'exportar comprobantes');
      throw error;
    } finally {
      setExportando(false);
    }
  }, [ruc, filtros, seleccionados, handleError]);

  // ========================================
  // MÉTODOS DE CONTROL
  // ========================================

  const resetearEstado = useCallback(() => {
    setComprobantes([]);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalItems(0);
    setSeleccionados([]);
    setTextoBusqueda('');
    setFiltros({ ...FILTROS_DEFECTO, ...filtros_iniciales });
    setError(null);
    setLastFetch(0);
  }, [filtros_iniciales]);

  // ========================================
  // EFECTOS
  // ========================================

  // Búsqueda automática cuando cambian filtros, página o búsqueda
  useEffect(() => {
    if (auto_load && ruc && (shouldRefreshCache() || currentPage !== 1)) {
      buscar();
    }
  }, [filtros, currentPage, auto_load, ruc, shouldRefreshCache, buscar]);

  // Búsqueda con debounce para texto
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (textoBusqueda !== '') {
        buscar();
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [textoBusqueda, buscar]);

  // ========================================
  // RETURN DEL HOOK
  // ========================================

  return {
    // Estado principal
    comprobantes,
    loading,
    error,
    
    // Paginación
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPrevPage,
    
    // Filtros y búsqueda
    filtros,
    textoBusqueda,
    
    // Estadísticas computadas
    estadisticas,
    
    // Selección múltiple
    seleccionados,
    todoSeleccionado,
    algunoSeleccionado,
    
    // Estados de operaciones
    guardando,
    validando,
    eliminando,
    exportando,
    
    // Métodos principales
    buscar,
    cargarPagina,
    refrescar,
    
    // CRUD
    crear,
    actualizar,
    eliminar,
    eliminarMasivo,
    
    // Validación
    validar,
    validarMasivo,
    
    // Filtros
    actualizarFiltros,
    limpiarFiltros,
    aplicarFiltroRapido,
    
    // Selección
    seleccionar,
    deseleccionar,
    seleccionarTodos,
    deseleccionarTodos,
    toggleSeleccion,
    
    // Búsqueda
    actualizarBusqueda,
    buscarPorCampo,
    
    // Utilidades
    obtenerPorId,
    filtrarLocalmente,
    exportar,
    
    // Control
    clearError,
    resetearEstado
  };
};
