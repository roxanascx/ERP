import axios from 'axios';
import type {
  LibroDiario,
  AsientoContable,
  FiltrosLibroDiario,
  ResumenLibroDiario,
  ValidationResult,
  ExportOptions,
  CuentaContableLookup
} from '../types/libroDiario';

// Configuración base para el cliente axios
const libroDiarioApi = axios.create({
  baseURL: '/api/v1/accounting/libro-diario',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
libroDiarioApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en API de Libro Diario:', error);
    return Promise.reject(error);
  }
);

export class LibroDiarioApiService {
  
  // === CRUD BÁSICO ===
  
  static async crearLibroDiario(libro: Omit<LibroDiario, 'id'>): Promise<LibroDiario> {
    const response = await libroDiarioApi.post('/', libro);
    return response.data;
  }
  
  static async obtenerLibroDiario(libroId: string): Promise<LibroDiario> {
    const response = await libroDiarioApi.get(`/${libroId}`);
    const libroBackend = response.data;

    // Transformar asientos del formato backend al frontend
    const asientosTransformados = this.transformarAsientosDeBackend(libroBackend.asientos || []);
    
    return {
      ...libroBackend,
      asientos: asientosTransformados
    };
  }
  
  // Transformar asientos del formato backend (individuales) al frontend (agrupados)
  private static transformarAsientosDeBackend(asientosBackend: any[]): AsientoContable[] {
    // Agrupar por numeroAsiento (id real de la operación padre). Se mantiene
    // el fallback a numeroDocumento/numeroCorrelativo para asientos creados
    // antes de que existiera el campo numeroAsiento.
    const asientosAgrupados = asientosBackend.reduce((acc, asientoBackend) => {
      const numeroAsiento = asientoBackend.numeroAsiento || asientoBackend.numeroDocumento || asientoBackend.numeroCorrelativo;
      
      if (!acc[numeroAsiento]) {
        acc[numeroAsiento] = {
          id: `asiento-${numeroAsiento}`,
          numero: numeroAsiento,
          fecha: asientoBackend.fecha,
          descripcion: asientoBackend.glosa || asientoBackend.descripcion || '',
          detalles: [],
          empresaId: asientoBackend.empresaId,
          libroId: asientoBackend.libroId,
          usuarioCreacion: asientoBackend.usuarioCreacion,
          fechaCreacion: asientoBackend.fechaCreacion,
          fechaModificacion: asientoBackend.fechaModificacion,
          // ✅ AGREGADO: Mantener IDs reales para eliminar
          _backendIds: []
        };
      }
      
      // Agregar este detalle al asiento
      acc[numeroAsiento].detalles.push({
        codigoCuenta: asientoBackend.cuentaContable?.codigo || '',
        denominacionCuenta: asientoBackend.cuentaContable?.denominacion || '',
        debe: asientoBackend.debe || 0,
        haber: asientoBackend.haber || 0,
        // ✅ AGREGADO: ID real del backend para este detalle
        _backendId: asientoBackend.id
      });
      
      // ✅ AGREGADO: Mantener lista de IDs del backend
      acc[numeroAsiento]._backendIds.push(asientoBackend.id);
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(asientosAgrupados);
  }
  
  static async actualizarLibroDiario(libroId: string, libro: Partial<LibroDiario>): Promise<LibroDiario> {
    const response = await libroDiarioApi.put(`/${libroId}`, libro);
    return response.data;
  }
  
  static async eliminarLibroDiario(libroId: string): Promise<{ message: string }> {
    const response = await libroDiarioApi.delete(`/${libroId}`);
    return response.data;
  }
  
  // === LISTADO Y FILTROS ===
  
  static async obtenerLibrosPorEmpresa(empresaId: string, filtros?: FiltrosLibroDiario): Promise<LibroDiario[]> {
    const params = new URLSearchParams();
    params.append('empresa_id', empresaId);
    
    if (filtros?.periodo) params.append('periodo', filtros.periodo);
    if (filtros?.fechaDesde) params.append('fecha_desde', filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append('fecha_hasta', filtros.fechaHasta);
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros?.cuentaContable) params.append('cuenta_contable', filtros.cuentaContable);
    
    const response = await libroDiarioApi.get(`/empresa/${empresaId}?${params.toString()}`);
    return response.data;
  }
  
  static async obtenerResumen(empresaId: string, periodo?: string): Promise<ResumenLibroDiario> {
    const params = new URLSearchParams();
    params.append('empresa_id', empresaId);
    // El backend exige este query param como `periodo_aaaamm` (obligatorio);
    // enviarlo como `periodo` producía un 422 Unprocessable Entity.
    if (periodo) params.append('periodo_aaaamm', periodo);

    const response = await libroDiarioApi.get(`/resumen?${params.toString()}`);
    return response.data;
  }
  
  // === ASIENTOS CONTABLES ===
  
  // Función helper para transformar formato frontend -> backend
  private static transformarAsientoParaBackend(asiento: Omit<AsientoContable, 'id'>): any[] {
    // El backend espera un array de objetos, uno por cada detalle del asiento.
    // Todas las líneas comparten `numeroAsiento` para que, al exportar a PLE,
    // se agrupen bajo una misma operación (mismo CUO) con un correlativo
    // propio por línea - ver ple_formatter_sunat_v3.formatear_lote_asientos.
    return asiento.detalles.map((detalle, index) => ({
      numeroCorrelativo: `${asiento.numero}-${index + 1}`, // Número único por detalle
      numeroAsiento: asiento.numero, // Id de la operación padre (agrupación)
      fecha: asiento.fecha,
      glosa: asiento.descripcion,
      codigoLibro: "5.1", // Libro Diario
      numeroDocumento: asiento.numero, // Usar número de asiento como documento
      cuentaContable: {
        codigo: detalle.codigoCuenta,
        denominacion: detalle.denominacionCuenta
      },
      debe: detalle.debe || 0,
      haber: detalle.haber || 0,
      empresaId: asiento.empresaId || 'empresa_demo'
    }));
  }
  
  static async agregarAsiento(libroId: string, asiento: Omit<AsientoContable, 'id'>): Promise<AsientoContable> {
    
    // Transformar cada detalle en un asiento separado para el backend
    const asientosBackend = this.transformarAsientoParaBackend(asiento);
    
    // Enviar cada detalle como un asiento separado
    const resultados: any[] = [];
    for (const asientoBackend of asientosBackend) {
      const response = await libroDiarioApi.post(`/${libroId}/asientos`, asientoBackend);
      resultados.push(response.data);
    }

    // Retornar el asiento original con un ID generado
    return {
      ...asiento,
      id: `asiento-${Date.now()}` // ID temporal para el frontend
    };
  }
  
  static async actualizarAsiento(libroId: string, asientoId: string, asiento: Partial<AsientoContable>): Promise<AsientoContable> {
    // Para asientos agrupados del frontend, necesitamos eliminar y recrear
    if (asientoId.startsWith('asiento-')) {
      
      // 1. Eliminar asiento existente
      await this.eliminarAsiento(libroId, asientoId);
      
      // 2. Crear nuevo asiento con los datos actualizados
      const asientoCompleto = {
        numero: asiento.numero || asientoId.replace('asiento-', ''),
        fecha: asiento.fecha || new Date().toISOString().split('T')[0],
        descripcion: asiento.descripcion || '',
        detalles: asiento.detalles || [],
        empresaId: asiento.empresaId
      };
      
      return await this.agregarAsiento(libroId, asientoCompleto);
    } else {
      // ID directo del backend (método original)
      const response = await libroDiarioApi.put(`/${libroId}/asientos/${asientoId}`, asiento);
      return response.data;
    }
  }
  
  static async eliminarAsiento(libroId: string, asientoId: string): Promise<{ message: string }> {
    
    // Si es un ID artificial del frontend, necesitamos obtener el libro completo para encontrar los IDs reales
    if (asientoId.startsWith('asiento-')) {
      
      // Obtener libro completo para encontrar los IDs reales del backend
      const libro = await this.obtenerLibroDiario(libroId);
      const asiento = libro.asientos?.find(a => a.id === asientoId) as any;
      
      if (!asiento || !asiento._backendIds) {
        throw new Error('No se encontraron los IDs del backend para eliminar el asiento');
      }

      // Eliminar cada línea del asiento
      const promesasEliminacion = asiento._backendIds.map((backendId: string) => 
        libroDiarioApi.delete(`/${libroId}/asientos/${backendId}`)
      );
      
      await Promise.all(promesasEliminacion);
      
      return { message: `Asiento ${asiento.numero} eliminado correctamente` };
    } else {
      // ID directo del backend
      const response = await libroDiarioApi.delete(`/${libroId}/asientos/${asientoId}`);
      return response.data;
    }
  }
  
  // === VALIDACIONES ===
  
  static async validarLibroDiario(libroId: string): Promise<ValidationResult> {
    const response = await libroDiarioApi.post(`/${libroId}/validar`);
    return response.data;
  }
  
  static async validarAsiento(asiento: AsientoContable): Promise<ValidationResult> {
    const response = await libroDiarioApi.post('/validar-asiento', asiento);
    return response.data;
  }
  
  // === EXPORTACIÓN Y REPORTES ===
  
  static async exportarLibroDiario(libroId: string, opciones: ExportOptions): Promise<Blob> {
    const response = await libroDiarioApi.post(`/${libroId}/export`, opciones, {
      responseType: 'blob'
    });
    return response.data;
  }
  
  static async generarReporte(empresaId: string, filtros: FiltrosLibroDiario, formato: 'excel' | 'pdf'): Promise<Blob> {
    const response = await libroDiarioApi.post(`/reporte/${empresaId}`, {
      filtros,
      formato
    }, {
      responseType: 'blob'
    });
    return response.data;
  }
  
  // === AUTOCOMPLETADO Y HELPERS ===
  
  static async buscarCuentasContables(busqueda: string, empresaId: string): Promise<CuentaContableLookup[]> {
    const response = await axios.get('/api/v1/accounting/plan/cuentas/buscar', {
      params: {
        q: busqueda,
        empresa_id: empresaId,
        activos: true,
        limit: 10
      }
    });
    
    // Transformar respuesta a formato esperado
    return response.data.map((cuenta: any) => ({
      codigo: cuenta.codigo,
      denominacion: cuenta.descripcion,
      naturaleza: cuenta.naturaleza,
      nivel: cuenta.nivel,
      activa: cuenta.activa
    }));
  }
  
  static async obtenerSiguienteCorrelativo(empresaId: string, periodo: string): Promise<string> {
    const response = await libroDiarioApi.get(`/siguiente-correlativo`, {
      params: { empresa_id: empresaId, periodo }
    });
    return response.data.numeroCorrelativo;
  }
  
  // === UTILIDADES ===
  
  static calcularTotales(asientos: AsientoContable[]): { totalDebe: number; totalHaber: number; balanceado: boolean } {
    const totalDebe = asientos.reduce((sum, asiento) => {
      return sum + asiento.detalles.reduce((detalleSum, detalle) => detalleSum + (detalle.debe || 0), 0);
    }, 0);
    
    const totalHaber = asientos.reduce((sum, asiento) => {
      return sum + asiento.detalles.reduce((detalleSum, detalle) => detalleSum + (detalle.haber || 0), 0);
    }, 0);
    
    const balanceado = Math.abs(totalDebe - totalHaber) < 0.01; // Tolerancia de 1 centavo
    
    return { totalDebe, totalHaber, balanceado };
  }
  
  static validarAsientoLocal(asiento: AsientoContable): string[] {
    const errores: string[] = [];
    
    if (!asiento.numero) errores.push('Número correlativo es requerido');
    if (!asiento.fecha) errores.push('Fecha es requerida');
    if (!asiento.descripcion) errores.push('Descripción es requerida');
    if (!asiento.detalles || asiento.detalles.length === 0) errores.push('Debe tener al menos un detalle');
    
    // Validar cada detalle
    asiento.detalles.forEach((detalle, index) => {
      if (!detalle.codigoCuenta) errores.push(`Detalle ${index + 1}: Código de cuenta es requerido`);
      if (!detalle.denominacionCuenta) errores.push(`Detalle ${index + 1}: Denominación de cuenta es requerida`);
      // ❌ ELIMINADO: descripcion no existe en DetalleAsiento
      
      const debe = detalle.debe || 0;
      const haber = detalle.haber || 0;
      
      if (debe === 0 && haber === 0) {
        errores.push(`Detalle ${index + 1}: Debe especificar un valor en Debe o Haber`);
      }
      
      if (debe > 0 && haber > 0) {
        errores.push(`Detalle ${index + 1}: No puede tener valores en Debe y Haber al mismo tiempo`);
      }
      
      if (debe < 0 || haber < 0) {
        errores.push(`Detalle ${index + 1}: Los valores no pueden ser negativos`);
      }
    });
    
    // Validar que el asiento esté balanceado
    const totalDebe = asiento.detalles.reduce((sum, detalle) => sum + (detalle.debe || 0), 0);
    const totalHaber = asiento.detalles.reduce((sum, detalle) => sum + (detalle.haber || 0), 0);
    
    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      errores.push('El asiento debe estar balanceado (Total Debe = Total Haber)');
    }
    
    return errores;
  }
}

export default LibroDiarioApiService;
