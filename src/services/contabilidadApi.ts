import axios from 'axios';
import type {
  CuentaContable,
  CuentaContableCreate,
  EstadisticasPlanContable,
  EstructuraResponse,
  FiltrosCuentas
} from '../types/contabilidad';

// Configuración base para el cliente axios
const contabilidadApi = axios.create({
  baseURL: '/api/v1/accounting',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
contabilidadApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en API de contabilidad:', error);
    return Promise.reject(error);
  }
);

export class ContabilidadApiService {
  // Health check
  static async ping(): Promise<{ status: string; module: string }> {
    const response = await contabilidadApi.get('/ping');
    return response.data;
  }

  // === PLAN CONTABLE ===

  // Obtener todas las cuentas con filtros optimizados
  static async getCuentas(filtros?: FiltrosCuentas): Promise<CuentaContable[]> {
    const params = new URLSearchParams();
    
    if (filtros?.activos_solo !== undefined) {
      params.append('activos', filtros.activos_solo.toString());
    }
    if (filtros?.clase_contable) {
      params.append('clase_contable', filtros.clase_contable.toString());
    }
    if (filtros?.nivel) {
      params.append('nivel', filtros.nivel.toString());
    }
    if (filtros?.busqueda && filtros.busqueda.trim()) {
      params.append('busqueda', filtros.busqueda.trim());
    }

    const response = await contabilidadApi.get(`/plan/cuentas?${params.toString()}`);
    return response.data;
  }

  // Obtener cuenta específica por código
  static async getCuenta(codigo: string): Promise<CuentaContable> {
    const response = await contabilidadApi.get(`/plan/cuentas/${codigo}`);
    return response.data;
  }

  // Crear nueva cuenta
  static async createCuenta(cuenta: CuentaContableCreate): Promise<CuentaContable> {
    const response = await contabilidadApi.post('/plan/cuentas', cuenta);
    return response.data;
  }

  // Actualizar cuenta existente
  static async updateCuenta(codigo: string, updates: Partial<CuentaContable>): Promise<CuentaContable> {
    const response = await contabilidadApi.put(`/plan/cuentas/${codigo}`, updates);
    return response.data;
  }

  // Eliminar cuenta (soft delete)
  static async deleteCuenta(codigo: string): Promise<{ message: string }> {
    const response = await contabilidadApi.delete(`/plan/cuentas/${codigo}`);
    return response.data;
  }

  // Obtener estructura jerárquica
  static async getEstructura(): Promise<EstructuraResponse> {
    const response = await contabilidadApi.get('/plan/estructura');
    return response.data;
  }

  // Obtener estadísticas del plan contable
  static async getEstadisticas(): Promise<EstadisticasPlanContable> {
    const response = await contabilidadApi.get('/plan/estadisticas');
    return response.data;
  }

  // === BÚSQUEDA OPTIMIZADA ===

  // Búsqueda rápida optimizada (usa endpoint específico del backend)
  static async buscarCuentas(query: string, activos_solo: boolean = true, limit: number = 50): Promise<CuentaContable[]> {
    if (!query.trim()) {
      return [];
    }

    const params = new URLSearchParams();
    params.append('q', query.trim());
    params.append('activos', activos_solo.toString());
    params.append('limit', limit.toString());

    const response = await contabilidadApi.get(`/plan/cuentas/buscar?${params.toString()}`);
    return response.data;
  }

  // Obtener cuentas por clase contable
  static async getCuentasPorClase(clase: number): Promise<CuentaContable[]> {
    return this.getCuentas({ clase_contable: clase, activos_solo: true });
  }

  // Obtener cuentas hoja (que permiten movimientos)
  static async getCuentasHoja(): Promise<CuentaContable[]> {
    const cuentas = await this.getCuentas({ activos_solo: true });
    return cuentas.filter(cuenta => cuenta.es_hoja && cuenta.acepta_movimiento);
  }

  // === VALIDACIONES ===

  // Verificar si un código de cuenta está disponible
  static async isCodigoDisponible(codigo: string): Promise<boolean> {
    try {
      await this.getCuenta(codigo);
      return false; // Código ya existe
    } catch (error: any) {
      if (error.response?.status === 404) {
        return true; // Código disponible
      }
      throw error; // Otro tipo de error
    }
  }

  // === UTILIDADES ===

  // Obtener descripción de clase contable
  static getDescripcionClase(clase: number): string {
    const descripciones: Record<number, string> = {
      1: 'ACTIVO DISPONIBLE Y EXIGIBLE',
      2: 'ACTIVO REALIZABLE',
      3: 'ACTIVO INMOVILIZADO',
      4: 'PASIVO',
      5: 'PATRIMONIO NETO',
      6: 'GASTOS POR NATURALEZA',
      7: 'VENTAS',
      8: 'SALDOS INTERMEDIARIOS DE GESTIÓN',
      9: 'CONTABILIDAD ANALÍTICA DE EXPLOTACIÓN'
    };
    return descripciones[clase] || `Clase ${clase}`;
  }

  // Obtener descripción de nivel
  static getDescripcionNivel(nivel: number): string {
    const nombres: Record<number, string> = {
      1: 'CLASE',
      2: 'GRUPO',
      3: 'SUBGRUPO',
      4: 'CUENTA',
      5: 'SUBCUENTA',
      6: 'DIVISIONARIA',
      7: 'SUBDIVISIONARIA',
      8: 'AUXILIAR'
    };
    return nombres[nivel] || `Nivel ${nivel}`;
  }

  // Validar formato de código según nivel
  static validarCodigo(codigo: string, nivel: number): { valido: boolean; mensaje?: string } {
    if (!codigo || codigo.trim() === '') {
      return { valido: false, mensaje: 'El código es requerido' };
    }

    if (!/^\d+$/.test(codigo)) {
      return { valido: false, mensaje: 'El código debe contener solo números' };
    }

    if (codigo.length !== nivel) {
      return { 
        valido: false, 
        mensaje: `El código debe tener ${nivel} dígito(s) para el nivel ${this.getDescripcionNivel(nivel)}` 
      };
    }

    return { valido: true };
  }
}

export default ContabilidadApiService;
