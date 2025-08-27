import { useState, useMemo } from 'react';
import type { AsientoContable, DetalleAsiento, LibroDiario } from '../../../types/libroDiario';

// Tipos para la lógica de asientos
export type EstadoAsiento = 'borrador' | 'confirmado' | 'anulado';
export type OrdenColumna = 'fecha' | 'numero' | 'descripcion' | 'debe' | 'haber';
export type DireccionOrden = 'asc' | 'desc';

interface UseAsientosLogicProps {
  asientos: AsientoContable[];
  libro?: LibroDiario;
  onCrearAsiento?: (asiento: Omit<AsientoContable, 'id'>) => Promise<void>;
  onEditarAsiento?: (id: string, asiento: Partial<AsientoContable>) => Promise<void>;
  onEliminarAsiento?: (id: string) => Promise<void>;
  onExportarExcel?: () => Promise<void>;
  onExportarPDF?: () => Promise<void>;
  isLoading?: boolean;
}

export const useAsientosLogic = ({
  asientos,
  // libro,
  // onCrearAsiento,
  // onEditarAsiento,
  onEliminarAsiento,
  onExportarExcel,
  onExportarPDF,
  // isLoading = false
}: UseAsientosLogicProps) => {
  // Estados principales
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [asientoEditando, setAsientoEditando] = useState<AsientoContable | null>(null);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoAsiento | ''>('');
  const [filtroCuenta, setFiltroCuenta] = useState('');
  const [orden, setOrden] = useState<{ columna: OrdenColumna; direccion: DireccionOrden }>({
    columna: 'fecha',
    direccion: 'desc'
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;
  
  // Estados para PLE Export
  const [mostrarPLEManager, setMostrarPLEManager] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Estado para expansión de asientos
  const [asientosExpandidos, setAsientosExpandidos] = useState<Set<string>>(new Set());

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filtrar y ordenar asientos con useMemo para optimización
  const asientosFiltrados = useMemo(() => {
    let resultado = asientos.filter(asiento => {
      // Filtro por fecha desde
      const cumpleFecha = !filtroFecha || asiento.fecha >= filtroFecha;
      
      // Filtro por fecha hasta
      const cumpleFechaHasta = !filtroFechaHasta || asiento.fecha <= filtroFechaHasta;
      
      // Filtro por descripción (búsqueda en glosa)
      const cumpleDescripcion = !filtroDescripcion || 
        asiento.descripcion.toLowerCase().includes(filtroDescripcion.toLowerCase());
      
      // Filtro por estado
      const cumpleEstado = !filtroEstado || asiento.estado === filtroEstado;
      
      // Filtro por cuenta contable
      const cumpleCuenta = !filtroCuenta || 
        asiento.detalles.some(detalle => 
          detalle.codigoCuenta.includes(filtroCuenta) ||
          detalle.denominacionCuenta.toLowerCase().includes(filtroCuenta.toLowerCase())
        );
      
      return cumpleFecha && cumpleFechaHasta && cumpleDescripcion && cumpleEstado && cumpleCuenta;
    });

    // Ordenamiento
    resultado.sort((a, b) => {
      let valorA: string | number = '';
      let valorB: string | number = '';

      switch (orden.columna) {
        case 'fecha':
          valorA = a.fecha;
          valorB = b.fecha;
          break;
        case 'numero':
          valorA = a.numero;
          valorB = b.numero;
          break;
        case 'descripcion':
          valorA = a.descripcion.toLowerCase();
          valorB = b.descripcion.toLowerCase();
          break;
        case 'debe':
          valorA = a.detalles.reduce((sum, d) => sum + (d.debe || 0), 0);
          valorB = b.detalles.reduce((sum, d) => sum + (d.debe || 0), 0);
          break;
        case 'haber':
          valorA = a.detalles.reduce((sum, d) => sum + (d.haber || 0), 0);
          valorB = b.detalles.reduce((sum, d) => sum + (d.haber || 0), 0);
          break;
      }

      if (valorA < valorB) return orden.direccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return orden.direccion === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [asientos, filtroFecha, filtroFechaHasta, filtroDescripcion, filtroEstado, filtroCuenta, orden]);

  // Paginación
  const totalPaginas = Math.ceil(asientosFiltrados.length / itemsPorPagina);
  const asientosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return asientosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [asientosFiltrados, paginaActual, itemsPorPagina]);

  // Handlers
  const handleCrearAsiento = () => {
    setAsientoEditando(null);
    setMostrarFormulario(true);
  };

  const handleEditarAsiento = (asiento: AsientoContable) => {
    setAsientoEditando(asiento);
    setMostrarFormulario(true);
  };

  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
    setAsientoEditando(null);
  };

  const calcularTotales = () => {
    return asientosFiltrados.reduce((acc, asiento) => {
      asiento.detalles.forEach((detalle: DetalleAsiento) => {
        acc.totalDebe += detalle.debe || 0;
        acc.totalHaber += detalle.haber || 0;
      });
      return acc;
    }, { totalDebe: 0, totalHaber: 0 });
  };

  const totales = calcularTotales();
  const isBalanceado = Math.abs(totales.totalDebe - totales.totalHaber) < 0.01;

  const handleOrdenar = (columna: OrdenColumna) => {
    setOrden(prev => ({
      columna,
      direccion: prev.columna === columna && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExportar = async (tipo: 'excel' | 'pdf') => {
    try {
      if (tipo === 'excel' && onExportarExcel) {
        await onExportarExcel();
      } else if (tipo === 'pdf' && onExportarPDF) {
        await onExportarPDF();
      }
    } catch (error) {
      console.error(`Error al exportar a ${tipo}:`, error);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroFecha('');
    setFiltroFechaHasta('');
    setFiltroDescripcion('');
    setFiltroEstado('');
    setFiltroCuenta('');
    setPaginaActual(1);
  };

  // Cambio de página
  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  // Eliminar asiento
  const handleEliminarAsiento = async (asientoId: string) => {
    if (!confirm('¿Está seguro de eliminar este asiento?')) return;
    
    if (onEliminarAsiento) {
      try {
        await onEliminarAsiento(asientoId);
      } catch (error) {
        console.error('Error al eliminar asiento:', error);
      }
    }
  };

  // Funciones para expansión de asientos
  const toggleExpandirAsiento = (asientoId: string) => {
    setAsientosExpandidos(prev => {
      const nuevosExpandidos = new Set(prev);
      if (nuevosExpandidos.has(asientoId)) {
        nuevosExpandidos.delete(asientoId);
      } else {
        nuevosExpandidos.add(asientoId);
      }
      return nuevosExpandidos;
    });
  };

  const isAsientoExpandido = (asientoId: string) => {
    return asientosExpandidos.has(asientoId);
  };

  return {
    // Estados
    mostrarFormulario,
    setMostrarFormulario,
    asientoEditando,
    setAsientoEditando,
    filtroFecha,
    setFiltroFecha,
    filtroFechaHasta,
    setFiltroFechaHasta,
    filtroDescripcion,
    setFiltroDescripcion,
    filtroEstado,
    setFiltroEstado,
    filtroCuenta,
    setFiltroCuenta,
    orden,
    setOrden,
    paginaActual,
    setPaginaActual,
    mostrarPLEManager,
    setMostrarPLEManager,
    toast,
    showToast,
    
    // Datos procesados
    asientosFiltrados,
    asientosPaginados,
    totalPaginas,
    totales,
    isBalanceado,
    itemsPorPagina,
    
    // Handlers
    handleCrearAsiento,
    handleEditarAsiento,
    handleCerrarFormulario,
    handleOrdenar,
    handleExportar,
    handleEliminarAsiento,
    limpiarFiltros,
    cambiarPagina,
    
    // Funciones de expansión
    toggleExpandirAsiento,
    isAsientoExpandido
  };
};
