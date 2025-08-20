# 📋 PLAN DE TRABAJO: FRONTEND RCE (Registro de Compras Electrónico)

## 🎯 Objetivos del Proyecto

Implementar el módulo frontend completo de **RCE (Registro de Compras Electrónico)** que se integre con el backend ya completado, siguiendo los mismos patrones arquitectónicos del módulo RVIE existente.

---

## 🔍 Análisis del Estado Actual del Frontend

### ✅ **Componentes Existentes Reutilizables**

| Componente | Estado | Reutilización en RCE |
|------------|--------|----------------------|
| `SirePage.tsx` | ✅ Listo | Agregar navegación RCE |
| `useEmpresa.ts` | ✅ Completo | Reutilizar tal como está |
| `useSireAutoAuth.ts` | ✅ Completo | Misma autenticación SUNAT |
| `BackendStatus.tsx` | ✅ Completo | Monitoreo RCE |
| `Modal.tsx` | ✅ Completo | Formularios RCE |
| Servicios API base | ✅ Completo | Extender para RCE |

### 🔧 **Estructura Actual del Frontend SIRE**

```
frontend/src/
├── components/sire/
│   ├── rvie/                     # ✅ Existente - Patrón a seguir
│   └── rce/                      # 🆕 NUEVO - A implementar
├── hooks/
│   ├── useRvie.ts               # ✅ Existente - Patrón base
│   └── useRce.ts                # 🆕 NUEVO - A implementar
├── services/
│   ├── sire.ts                  # 🔧 Extender con RCE
│   └── rceApi.ts                # 🆕 NUEVO - Servicios RCE
├── types/
│   ├── sire.ts                  # 🔧 Extender con tipos RCE
│   └── rce.ts                   # 🆕 NUEVO - Tipos específicos RCE
└── pages/sire/
    ├── RvieHomePage.tsx         # ✅ Existente - Patrón base
    └── RceHomePage.tsx          # 🆕 NUEVO - A implementar
```

### 📊 **Análisis de Endpoints Backend Disponibles**

El backend RCE completado expone las siguientes rutas:

```
/api/v1/sire/rce/
├── comprobantes/     # CRUD, validación, estadísticas
├── propuestas/       # Generación, envío, gestión
├── procesos/         # Procesamiento, tickets, cancelación
└── consultas/        # Consultas avanzadas, reportes
```

---

## 🗓 PLAN DE IMPLEMENTACIÓN POR FASES

### **FASE 1: Tipos y Servicios Base** 📅 *Semana 1*

#### 1.1 Crear Tipos TypeScript RCE
**Archivo**: `types/rce.ts`

```typescript
// ========================================
// TIPOS BASE RCE
// ========================================

export interface RceComprobante {
  id?: string;
  ruc_emisor: string;
  razon_social_emisor: string;
  tipo_comprobante: RceTipoComprobante;
  serie: string;
  numero: string;
  fecha_emision: string;
  moneda: string;
  tipo_cambio?: number;
  base_imponible: number;
  igv: number;
  importe_total: number;
  estado: RceEstadoComprobante;
  observaciones?: string;
  fecha_registro?: string;
  usuario_registro?: string;
}

export enum RceTipoComprobante {
  FACTURA = '01',
  BOLETA = '03',
  NOTA_CREDITO = '07',
  NOTA_DEBITO = '08',
  RECIBO_HONORARIOS = '02'
}

export enum RceEstadoComprobante {
  REGISTRADO = 'registrado',
  VALIDADO = 'validado',
  OBSERVADO = 'observado',
  ANULADO = 'anulado',
  INCLUIDO = 'incluido',
  EXCLUIDO = 'excluido'
}

export interface RcePropuesta {
  id?: string;
  ruc: string;
  periodo: string;
  tipo_propuesta: 'automatica' | 'manual';
  estado: RceEstadoPropuesta;
  comprobantes: RceComprobante[];
  total_registros: number;
  total_importe: number;
  fecha_generacion: string;
  fecha_envio?: string;
  ticket_envio?: string;
  observaciones?: string;
}

export enum RceEstadoPropuesta {
  BORRADOR = 'borrador',
  VALIDADA = 'validada',
  ENVIADA = 'enviada',
  ACEPTADA = 'aceptada',
  OBSERVADA = 'observada',
  RECHAZADA = 'rechazada'
}

export interface RceProceso {
  id?: string;
  ruc: string;
  periodo: string;
  tipo_proceso: 'envio' | 'aceptacion' | 'cancelacion';
  estado: RceEstadoProceso;
  propuesta_id?: string;
  ticket_id?: string;
  comprobantes_enviados: number;
  total_importe_enviado: number;
  fecha_inicio: string;
  fecha_fin?: string;
  exitoso: boolean;
  mensaje?: string;
  errores?: string[];
}

export enum RceEstadoProceso {
  INICIADO = 'iniciado',
  EN_PROCESO = 'en_proceso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
  ERROR = 'error'
}

// ========================================
// TIPOS DE REQUEST/RESPONSE
// ========================================

export interface RceComprobanteRequest {
  ruc_emisor: string;
  tipo_comprobante: RceTipoComprobante;
  serie: string;
  numero: string;
  fecha_emision: string;
  moneda: string;
  tipo_cambio?: number;
  base_imponible: number;
  igv: number;
  importe_total: number;
  observaciones?: string;
}

export interface RcePropuestaRequest {
  ruc: string;
  periodo: string;
  tipo_propuesta: 'automatica' | 'manual';
  incluir_no_domiciliados?: boolean;
  filtros?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    tipo_comprobante?: RceTipoComprobante[];
    estado?: RceEstadoComprobante[];
  };
}

export interface RceConsultaAvanzadaRequest {
  ruc: string;
  filtros: {
    periodo?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    tipo_comprobante?: RceTipoComprobante[];
    estado?: RceEstadoComprobante[];
    ruc_emisor?: string;
    serie?: string;
    numero?: string;
    moneda?: string;
    importe_min?: number;
    importe_max?: number;
  };
  ordenar_por?: string;
  orden_desc?: boolean;
}

export interface RceApiResponse<T = any> {
  exitoso: boolean;
  mensaje: string;
  datos?: T;
  codigo?: string;
  timestamp?: string;
}

// ========================================
// TIPOS DE ESTADÍSTICAS Y REPORTES
// ========================================

export interface RceEstadisticas {
  periodo: string;
  total_comprobantes: number;
  total_importe: number;
  por_tipo_comprobante: Record<string, {
    cantidad: number;
    importe: number;
  }>;
  por_estado: Record<string, {
    cantidad: number;
    importe: number;
  }>;
  por_moneda: Record<string, {
    cantidad: number;
    importe: number;
  }>;
}
```

#### 1.2 Extender Tipos SIRE Existentes
**Archivo**: `types/sire.ts` - Agregar al final

```typescript
// ========================================
// INTEGRACIÓN RCE CON SIRE EXISTENTE
// ========================================

// Extender el tipo de módulo activo
export type SireModuloActivo = 'home' | 'rvie' | 'rce';

// Extender configuración de empresa para RCE
export interface EmpresaConfigRce {
  rce_activo: boolean;
  rce_periodo_actual: string;
  rce_modo_importacion: 'automatico' | 'manual';
  rce_validacion_estricta: boolean;
}
```

#### 1.3 Crear Servicio API RCE
**Archivo**: `services/rceApi.ts`

```typescript
import api from './api';
import type {
  RceComprobante,
  RceComprobanteRequest,
  RcePropuesta,
  RcePropuestaRequest,
  RceProceso,
  RceConsultaAvanzadaRequest,
  RceEstadisticas,
  RceApiResponse
} from '../types/rce';

const RCE_BASE_URL = '/api/v1/sire/rce';

// ========================================
// SERVICIO DE COMPROBANTES RCE
// ========================================

export const rceComprobantesApi = {
  // CRUD Comprobantes
  async crear(ruc: string, comprobante: RceComprobanteRequest): Promise<RceApiResponse<RceComprobante>> {
    const response = await api.post(`${RCE_BASE_URL}/comprobantes`, {
      ruc,
      ...comprobante
    });
    return response.data;
  },

  async obtenerPorId(ruc: string, comprobanteId: string): Promise<RceApiResponse<RceComprobante>> {
    const response = await api.get(`${RCE_BASE_URL}/comprobantes/${comprobanteId}`, {
      params: { ruc }
    });
    return response.data;
  },

  async actualizar(ruc: string, comprobanteId: string, comprobante: Partial<RceComprobanteRequest>): Promise<RceApiResponse<RceComprobante>> {
    const response = await api.put(`${RCE_BASE_URL}/comprobantes/${comprobanteId}`, {
      ruc,
      ...comprobante
    });
    return response.data;
  },

  async eliminar(ruc: string, comprobanteId: string): Promise<RceApiResponse<void>> {
    const response = await api.delete(`${RCE_BASE_URL}/comprobantes/${comprobanteId}`, {
      params: { ruc }
    });
    return response.data;
  },

  // Búsqueda y consultas
  async buscar(request: RceConsultaAvanzadaRequest, limit = 100, offset = 0): Promise<RceApiResponse<{
    comprobantes: RceComprobante[];
    total: number;
    offset: number;
    limit: number;
  }>> {
    const response = await api.post(`${RCE_BASE_URL}/comprobantes/buscar`, request, {
      params: { limit, offset }
    });
    return response.data;
  },

  // Validación masiva
  async validarMasivo(ruc: string, comprobanteIds: string[]): Promise<RceApiResponse<{
    validados: number;
    observados: number;
    errores: Array<{ id: string; error: string }>;
  }>> {
    const response = await api.post(`${RCE_BASE_URL}/comprobantes/validar-masivo`, {
      ruc,
      comprobante_ids: comprobanteIds
    });
    return response.data;
  },

  // Estadísticas
  async obtenerEstadisticas(ruc: string, periodo?: string): Promise<RceApiResponse<RceEstadisticas>> {
    const response = await api.get(`${RCE_BASE_URL}/comprobantes/estadisticas`, {
      params: { ruc, periodo }
    });
    return response.data;
  },

  // Exportación
  async exportarCsv(request: RceConsultaAvanzadaRequest): Promise<Blob> {
    const response = await api.post(`${RCE_BASE_URL}/comprobantes/exportar/csv`, request, {
      responseType: 'blob'
    });
    return response.data;
  },

  async exportarExcel(request: RceConsultaAvanzadaRequest): Promise<Blob> {
    const response = await api.post(`${RCE_BASE_URL}/comprobantes/exportar/excel`, request, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// ========================================
// SERVICIO DE PROPUESTAS RCE
// ========================================

export const rcePropuestasApi = {
  // Generar propuesta
  async generar(request: RcePropuestaRequest): Promise<RceApiResponse<RcePropuesta>> {
    const response = await api.post(`${RCE_BASE_URL}/propuestas/generar`, request);
    return response.data;
  },

  // Enviar propuesta a SUNAT
  async enviar(ruc: string, propuestaId: string, credenciales: {
    usuario_sunat: string;
    clave_sunat: string;
  }): Promise<RceApiResponse<RceProceso>> {
    const response = await api.post(`${RCE_BASE_URL}/propuestas/enviar`, {
      ruc,
      propuesta_id: propuestaId,
      credenciales
    });
    return response.data;
  },

  // Gestión de propuestas
  async obtenerPorId(ruc: string, propuestaId: string): Promise<RceApiResponse<RcePropuesta>> {
    const response = await api.get(`${RCE_BASE_URL}/propuestas/${propuestaId}`, {
      params: { ruc }
    });
    return response.data;
  },

  async listar(ruc: string, filtros?: {
    periodo?: string;
    estado?: string;
    limit?: number;
    offset?: number;
  }): Promise<RceApiResponse<{
    propuestas: RcePropuesta[];
    total: number;
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/propuestas`, {
      params: { ruc, ...filtros }
    });
    return response.data;
  },

  async eliminar(ruc: string, propuestaId: string): Promise<RceApiResponse<void>> {
    const response = await api.delete(`${RCE_BASE_URL}/propuestas/${propuestaId}`, {
      params: { ruc }
    });
    return response.data;
  },

  // Resumen de periodo
  async resumenPeriodo(ruc: string, periodo: string): Promise<RceApiResponse<{
    total_propuestas: number;
    propuestas_enviadas: number;
    propuestas_aceptadas: number;
    total_comprobantes: number;
    total_importe: number;
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/propuestas/resumen`, {
      params: { ruc, periodo }
    });
    return response.data;
  }
};

// ========================================
// SERVICIO DE PROCESOS RCE
// ========================================

export const rceProcesosApi = {
  // Consultar estado de proceso
  async consultarEstado(ruc: string, periodo: string, ticketId?: string): Promise<RceApiResponse<RceProceso>> {
    const response = await api.get(`${RCE_BASE_URL}/procesos/${periodo}`, {
      params: { ruc, ticket_id: ticketId }
    });
    return response.data;
  },

  // Cancelar proceso
  async cancelar(ruc: string, periodo: string, motivo: string, credenciales: {
    usuario_sunat: string;
    clave_sunat: string;
  }): Promise<RceApiResponse<RceProceso>> {
    const response = await api.post(`${RCE_BASE_URL}/procesos/${periodo}/cancelar`, {
      motivo,
      credenciales
    }, {
      params: { ruc }
    });
    return response.data;
  },

  // Listar procesos
  async listar(ruc: string, filtros?: {
    estado?: string;
    periodo_inicio?: string;
    periodo_fin?: string;
    limit?: number;
  }): Promise<RceApiResponse<{
    procesos: RceProceso[];
    total: number;
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/procesos`, {
      params: { ruc, ...filtros }
    });
    return response.data;
  },

  // Estadísticas de procesos
  async estadisticas(ruc: string, año?: number): Promise<RceApiResponse<{
    por_estado: Record<string, any>;
    por_periodo: Array<any>;
    totales: any;
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/procesos/estadisticas`, {
      params: { ruc, año }
    });
    return response.data;
  }
};

// ========================================
// SERVICIO DE CONSULTAS AVANZADAS
// ========================================

export const rceConsultasApi = {
  // Consulta avanzada
  async consultaAvanzada(request: RceConsultaAvanzadaRequest, paginacion?: {
    limit?: number;
    offset?: number;
    ordenar_por?: string;
    orden_desc?: boolean;
  }): Promise<RceApiResponse<{
    comprobantes: RceComprobante[];
    total: number;
    filtros_aplicados: any;
  }>> {
    const response = await api.post(`${RCE_BASE_URL}/consultas/avanzada`, request, {
      params: paginacion
    });
    return response.data;
  },

  // Detectar duplicados
  async detectarDuplicados(ruc: string, periodo?: string, criterio = 'estricto'): Promise<RceApiResponse<Array<{
    grupo: string;
    comprobantes: RceComprobante[];
    criterio_deteccion: string;
  }>>> {
    const response = await api.get(`${RCE_BASE_URL}/consultas/duplicados`, {
      params: { ruc, periodo, criterio }
    });
    return response.data;
  },

  // Detectar inconsistencias
  async detectarInconsistencias(ruc: string, periodo?: string): Promise<RceApiResponse<Array<{
    comprobante_id: string;
    tipo: string;
    descripcion: string;
    severidad: 'bajo' | 'medio' | 'alto';
    sugerencia: string;
  }>>> {
    const response = await api.get(`${RCE_BASE_URL}/consultas/inconsistencias`, {
      params: { ruc, periodo }
    });
    return response.data;
  },

  // Ranking de proveedores
  async rankingProveedores(ruc: string, periodoInicio: string, periodoFin: string, criterio = 'importe'): Promise<RceApiResponse<Array<{
    ruc_proveedor: string;
    razon_social: string;
    total_comprobantes: number;
    total_importe: number;
    promedio_importe: number;
    posicion: number;
  }>>> {
    const response = await api.get(`${RCE_BASE_URL}/consultas/proveedores/ranking`, {
      params: { ruc, periodo_inicio: periodoInicio, periodo_fin: periodoFin, criterio }
    });
    return response.data;
  },

  // Estadísticas de periodo
  async estadisticasPeriodo(ruc: string, periodo: string, incluirComparativo = true): Promise<RceApiResponse<{
    periodo_actual: RceEstadisticas;
    periodo_anterior?: RceEstadisticas;
    variacion?: any;
    graficos?: any;
  }>> {
    const response = await api.get(`${RCE_BASE_URL}/consultas/estadisticas/periodo`, {
      params: { ruc, periodo, incluir_comparativo: incluirComparativo }
    });
    return response.data;
  },

  // Exportaciones
  async exportarCsv(request: RceConsultaAvanzadaRequest): Promise<Blob> {
    const response = await api.post(`${RCE_BASE_URL}/exportaciones/csv`, request, {
      responseType: 'blob'
    });
    return response.data;
  },

  async exportarExcel(request: RceConsultaAvanzadaRequest): Promise<Blob> {
    const response = await api.post(`${RCE_BASE_URL}/exportaciones/excel`, request, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// ========================================
// SERVICIO INTEGRADO RCE
// ========================================

export const rceApi = {
  comprobantes: rceComprobantesApi,
  propuestas: rcePropuestasApi,
  procesos: rceProcesosApi,
  consultas: rceConsultasApi
};

export default rceApi;
```

---

### **FASE 2: Hooks Personalizados** 📅 *Semana 2*

#### 2.1 Crear Hook Principal useRce
**Archivo**: `hooks/useRce.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { Empresa } from '../types/empresa';
import type {
  RceComprobante,
  RceComprobanteRequest,
  RcePropuesta,
  RcePropuestaRequest,
  RceProceso,
  RceConsultaAvanzadaRequest,
  RceEstadisticas,
  RceApiResponse
} from '../types/rce';
import rceApi from '../services/rceApi';

interface UseRceOptions {
  empresa: Empresa;
  autoLoad?: boolean;
  periodoInicial?: string;
}

interface UseRceReturn {
  // Estados principales
  comprobantes: RceComprobante[];
  propuestas: RcePropuesta[];
  procesos: RceProceso[];
  estadisticas: RceEstadisticas | null;
  
  // Estados de carga
  loading: boolean;
  loadingComprobantes: boolean;
  loadingPropuestas: boolean;
  loadingProcesos: boolean;
  
  // Estados de error
  error: string | null;
  
  // Periodo actual
  periodoActual: string;
  
  // Funciones de comprobantes
  crearComprobante: (comprobante: RceComprobanteRequest) => Promise<RceComprobante | null>;
  actualizarComprobante: (id: string, comprobante: Partial<RceComprobanteRequest>) => Promise<RceComprobante | null>;
  eliminarComprobante: (id: string) => Promise<boolean>;
  buscarComprobantes: (filtros: RceConsultaAvanzadaRequest) => Promise<RceComprobante[]>;
  validarComprobantesMasivo: (ids: string[]) => Promise<{ validados: number; observados: number; errores: any[] }>;
  
  // Funciones de propuestas
  generarPropuesta: (request: RcePropuestaRequest) => Promise<RcePropuesta | null>;
  enviarPropuesta: (propuestaId: string, credenciales: { usuario_sunat: string; clave_sunat: string }) => Promise<RceProceso | null>;
  eliminarPropuesta: (propuestaId: string) => Promise<boolean>;
  
  // Funciones de procesos
  consultarProceso: (periodo: string, ticketId?: string) => Promise<RceProceso | null>;
  cancelarProceso: (periodo: string, motivo: string, credenciales: { usuario_sunat: string; clave_sunat: string }) => Promise<RceProceso | null>;
  
  // Funciones de carga
  cargarDatos: () => Promise<void>;
  cargarComprobantes: (filtros?: RceConsultaAvanzadaRequest) => Promise<void>;
  cargarPropuestas: (periodo?: string) => Promise<void>;
  cargarProcesos: (filtros?: any) => Promise<void>;
  cargarEstadisticas: (periodo?: string) => Promise<void>;
  
  // Funciones de utilidad
  cambiarPeriodo: (nuevoPeriodo: string) => void;
  limpiarError: () => void;
  exportarComprobantes: (formato: 'csv' | 'excel', filtros: RceConsultaAvanzadaRequest) => Promise<void>;
}

export const useRce = ({ empresa, autoLoad = true, periodoInicial }: UseRceOptions): UseRceReturn => {
  // Estados principales
  const [comprobantes, setComprobantes] = useState<RceComprobante[]>([]);
  const [propuestas, setPropuestas] = useState<RcePropuesta[]>([]);
  const [procesos, setProcesos] = useState<RceProceso[]>([]);
  const [estadisticas, setEstadisticas] = useState<RceEstadisticas | null>(null);
  
  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [loadingComprobantes, setLoadingComprobantes] = useState(false);
  const [loadingPropuestas, setLoadingPropuestas] = useState(false);
  const [loadingProcesos, setLoadingProcesos] = useState(false);
  
  // Estados de error
  const [error, setError] = useState<string | null>(null);
  
  // Periodo actual
  const [periodoActual, setPeriodoActual] = useState<string>(
    periodoInicial || new Date().toISOString().slice(0, 7).replace('-', '')
  );

  // ========================================
  // FUNCIONES DE COMPROBANTES
  // ========================================

  const crearComprobante = useCallback(async (comprobante: RceComprobanteRequest): Promise<RceComprobante | null> => {
    try {
      setLoadingComprobantes(true);
      setError(null);
      
      const response = await rceApi.comprobantes.crear(empresa.ruc, comprobante);
      
      if (response.exitoso && response.datos) {
        // Actualizar lista local
        setComprobantes(prev => [response.datos!, ...prev]);
        return response.datos;
      } else {
        setError(response.mensaje || 'Error al crear comprobante');
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al crear comprobante: ${errorMsg}`);
      return null;
    } finally {
      setLoadingComprobantes(false);
    }
  }, [empresa.ruc]);

  const actualizarComprobante = useCallback(async (id: string, comprobante: Partial<RceComprobanteRequest>): Promise<RceComprobante | null> => {
    try {
      setLoadingComprobantes(true);
      setError(null);
      
      const response = await rceApi.comprobantes.actualizar(empresa.ruc, id, comprobante);
      
      if (response.exitoso && response.datos) {
        // Actualizar en lista local
        setComprobantes(prev => prev.map(c => c.id === id ? response.datos! : c));
        return response.datos;
      } else {
        setError(response.mensaje || 'Error al actualizar comprobante');
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al actualizar comprobante: ${errorMsg}`);
      return null;
    } finally {
      setLoadingComprobantes(false);
    }
  }, [empresa.ruc]);

  const eliminarComprobante = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoadingComprobantes(true);
      setError(null);
      
      const response = await rceApi.comprobantes.eliminar(empresa.ruc, id);
      
      if (response.exitoso) {
        // Remover de lista local
        setComprobantes(prev => prev.filter(c => c.id !== id));
        return true;
      } else {
        setError(response.mensaje || 'Error al eliminar comprobante');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al eliminar comprobante: ${errorMsg}`);
      return false;
    } finally {
      setLoadingComprobantes(false);
    }
  }, [empresa.ruc]);

  const buscarComprobantes = useCallback(async (filtros: RceConsultaAvanzadaRequest): Promise<RceComprobante[]> => {
    try {
      setLoadingComprobantes(true);
      setError(null);
      
      const response = await rceApi.comprobantes.buscar(filtros);
      
      if (response.exitoso && response.datos) {
        return response.datos.comprobantes;
      } else {
        setError(response.mensaje || 'Error en búsqueda');
        return [];
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error en búsqueda: ${errorMsg}`);
      return [];
    } finally {
      setLoadingComprobantes(false);
    }
  }, []);

  const validarComprobantesMasivo = useCallback(async (ids: string[]) => {
    try {
      setLoadingComprobantes(true);
      setError(null);
      
      const response = await rceApi.comprobantes.validarMasivo(empresa.ruc, ids);
      
      if (response.exitoso && response.datos) {
        // Recargar comprobantes para reflejar cambios
        await cargarComprobantes();
        return response.datos;
      } else {
        setError(response.mensaje || 'Error en validación masiva');
        return { validados: 0, observados: 0, errores: [] };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error en validación masiva: ${errorMsg}`);
      return { validados: 0, observados: 0, errores: [] };
    } finally {
      setLoadingComprobantes(false);
    }
  }, [empresa.ruc]);

  // ========================================
  // FUNCIONES DE PROPUESTAS
  // ========================================

  const generarPropuesta = useCallback(async (request: RcePropuestaRequest): Promise<RcePropuesta | null> => {
    try {
      setLoadingPropuestas(true);
      setError(null);
      
      const response = await rceApi.propuestas.generar(request);
      
      if (response.exitoso && response.datos) {
        // Actualizar lista local
        setPropuestas(prev => [response.datos!, ...prev]);
        return response.datos;
      } else {
        setError(response.mensaje || 'Error al generar propuesta');
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al generar propuesta: ${errorMsg}`);
      return null;
    } finally {
      setLoadingPropuestas(false);
    }
  }, []);

  const enviarPropuesta = useCallback(async (propuestaId: string, credenciales: { usuario_sunat: string; clave_sunat: string }): Promise<RceProceso | null> => {
    try {
      setLoadingPropuestas(true);
      setError(null);
      
      const response = await rceApi.propuestas.enviar(empresa.ruc, propuestaId, credenciales);
      
      if (response.exitoso && response.datos) {
        // Actualizar proceso en lista
        setProcesos(prev => [response.datos!, ...prev]);
        // Recargar propuestas para actualizar estado
        await cargarPropuestas();
        return response.datos;
      } else {
        setError(response.mensaje || 'Error al enviar propuesta');
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al enviar propuesta: ${errorMsg}`);
      return null;
    } finally {
      setLoadingPropuestas(false);
    }
  }, [empresa.ruc]);

  const eliminarPropuesta = useCallback(async (propuestaId: string): Promise<boolean> => {
    try {
      setLoadingPropuestas(true);
      setError(null);
      
      const response = await rceApi.propuestas.eliminar(empresa.ruc, propuestaId);
      
      if (response.exitoso) {
        // Remover de lista local
        setPropuestas(prev => prev.filter(p => p.id !== propuestaId));
        return true;
      } else {
        setError(response.mensaje || 'Error al eliminar propuesta');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al eliminar propuesta: ${errorMsg}`);
      return false;
    } finally {
      setLoadingPropuestas(false);
    }
  }, [empresa.ruc]);

  // ========================================
  // FUNCIONES DE PROCESOS
  // ========================================

  const consultarProceso = useCallback(async (periodo: string, ticketId?: string): Promise<RceProceso | null> => {
    try {
      setLoadingProcesos(true);
      setError(null);
      
      const response = await rceApi.procesos.consultarEstado(empresa.ruc, periodo, ticketId);
      
      if (response.exitoso && response.datos) {
        return response.datos;
      } else {
        setError(response.mensaje || 'Error al consultar proceso');
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al consultar proceso: ${errorMsg}`);
      return null;
    } finally {
      setLoadingProcesos(false);
    }
  }, [empresa.ruc]);

  const cancelarProceso = useCallback(async (periodo: string, motivo: string, credenciales: { usuario_sunat: string; clave_sunat: string }): Promise<RceProceso | null> => {
    try {
      setLoadingProcesos(true);
      setError(null);
      
      const response = await rceApi.procesos.cancelar(empresa.ruc, periodo, motivo, credenciales);
      
      if (response.exitoso && response.datos) {
        // Actualizar en lista local
        setProcesos(prev => prev.map(p => 
          p.periodo === periodo ? response.datos! : p
        ));
        return response.datos;
      } else {
        setError(response.mensaje || 'Error al cancelar proceso');
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cancelar proceso: ${errorMsg}`);
      return null;
    } finally {
      setLoadingProcesos(false);
    }
  }, [empresa.ruc]);

  // ========================================
  // FUNCIONES DE CARGA
  // ========================================

  const cargarComprobantes = useCallback(async (filtros?: RceConsultaAvanzadaRequest) => {
    try {
      setLoadingComprobantes(true);
      setError(null);
      
      const filtrosFinales = filtros || {
        ruc: empresa.ruc,
        filtros: { periodo: periodoActual }
      };
      
      const response = await rceApi.comprobantes.buscar(filtrosFinales);
      
      if (response.exitoso && response.datos) {
        setComprobantes(response.datos.comprobantes);
      } else {
        setError(response.mensaje || 'Error al cargar comprobantes');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar comprobantes: ${errorMsg}`);
    } finally {
      setLoadingComprobantes(false);
    }
  }, [empresa.ruc, periodoActual]);

  const cargarPropuestas = useCallback(async (periodo?: string) => {
    try {
      setLoadingPropuestas(true);
      setError(null);
      
      const response = await rceApi.propuestas.listar(empresa.ruc, {
        periodo: periodo || periodoActual
      });
      
      if (response.exitoso && response.datos) {
        setPropuestas(response.datos.propuestas);
      } else {
        setError(response.mensaje || 'Error al cargar propuestas');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar propuestas: ${errorMsg}`);
    } finally {
      setLoadingPropuestas(false);
    }
  }, [empresa.ruc, periodoActual]);

  const cargarProcesos = useCallback(async (filtros?: any) => {
    try {
      setLoadingProcesos(true);
      setError(null);
      
      const response = await rceApi.procesos.listar(empresa.ruc, filtros);
      
      if (response.exitoso && response.datos) {
        setProcesos(response.datos.procesos);
      } else {
        setError(response.mensaje || 'Error al cargar procesos');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar procesos: ${errorMsg}`);
    } finally {
      setLoadingProcesos(false);
    }
  }, [empresa.ruc]);

  const cargarEstadisticas = useCallback(async (periodo?: string) => {
    try {
      setError(null);
      
      const response = await rceApi.comprobantes.obtenerEstadisticas(empresa.ruc, periodo || periodoActual);
      
      if (response.exitoso && response.datos) {
        setEstadisticas(response.datos);
      } else {
        setError(response.mensaje || 'Error al cargar estadísticas');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar estadísticas: ${errorMsg}`);
    }
  }, [empresa.ruc, periodoActual]);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        cargarComprobantes(),
        cargarPropuestas(),
        cargarProcesos(),
        cargarEstadisticas()
      ]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar datos: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, [cargarComprobantes, cargarPropuestas, cargarProcesos, cargarEstadisticas]);

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const cambiarPeriodo = useCallback((nuevoPeriodo: string) => {
    setPeriodoActual(nuevoPeriodo);
    // Los useEffect se encargarán de recargar datos
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  const exportarComprobantes = useCallback(async (formato: 'csv' | 'excel', filtros: RceConsultaAvanzadaRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      let blob: Blob;
      if (formato === 'csv') {
        blob = await rceApi.consultas.exportarCsv(filtros);
      } else {
        blob = await rceApi.consultas.exportarExcel(filtros);
      }
      
      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `comprobantes_rce_${periodoActual}.${formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al exportar: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, [periodoActual]);

  // ========================================
  // EFECTOS
  // ========================================

  // Cargar datos iniciales
  useEffect(() => {
    if (autoLoad && empresa.ruc) {
      cargarDatos();
    }
  }, [autoLoad, empresa.ruc, cargarDatos]);

  // Recargar datos cuando cambia el periodo
  useEffect(() => {
    if (empresa.ruc) {
      cargarComprobantes();
      cargarPropuestas();
      cargarEstadisticas();
    }
  }, [periodoActual, empresa.ruc, cargarComprobantes, cargarPropuestas, cargarEstadisticas]);

  return {
    // Estados principales
    comprobantes,
    propuestas,
    procesos,
    estadisticas,
    
    // Estados de carga
    loading,
    loadingComprobantes,
    loadingPropuestas,
    loadingProcesos,
    
    // Estados de error
    error,
    
    // Periodo actual
    periodoActual,
    
    // Funciones de comprobantes
    crearComprobante,
    actualizarComprobante,
    eliminarComprobante,
    buscarComprobantes,
    validarComprobantesMasivo,
    
    // Funciones de propuestas
    generarPropuesta,
    enviarPropuesta,
    eliminarPropuesta,
    
    // Funciones de procesos
    consultarProceso,
    cancelarProceso,
    
    // Funciones de carga
    cargarDatos,
    cargarComprobantes,
    cargarPropuestas,
    cargarProcesos,
    cargarEstadisticas,
    
    // Funciones de utilidad
    cambiarPeriodo,
    limpiarError,
    exportarComprobantes
  };
};

export default useRce;
```

---

### **FASE 3: Componentes Base RCE** 📅 *Semana 3*

#### 3.1 Crear Panel Principal RCE
**Archivo**: `components/sire/rce/RcePanel.tsx`

```typescript
import React, { useState } from 'react';
import { Empresa } from '../../../types/empresa';
import { RceComprobantesTab } from './components/RceComprobantesTab';
import { RcePropuestasTab } from './components/RcePropuestasTab';
import { RceProcesosTab } from './components/RceProcesosTab';
import { RceConsultasTab } from './components/RceConsultasTab';
import useRce from '../../../hooks/useRce';
import BackendStatus from '../../BackendStatus';

interface RcePanelProps {
  company: Empresa;
  onClose: () => void;
}

type RceTabType = 'comprobantes' | 'propuestas' | 'procesos' | 'consultas';

export const RcePanel: React.FC<RcePanelProps> = ({ company, onClose }) => {
  const [activeTab, setActiveTab] = useState<RceTabType>('comprobantes');
  
  const rceHook = useRce({
    empresa: company,
    autoLoad: true
  });

  const tabs = [
    { id: 'comprobantes', label: 'Comprobantes', icon: '📄', count: rceHook.comprobantes.length },
    { id: 'propuestas', label: 'Propuestas', icon: '📋', count: rceHook.propuestas.length },
    { id: 'procesos', label: 'Procesos', icon: '⚙️', count: rceHook.procesos.length },
    { id: 'consultas', label: 'Consultas', icon: '📊', count: null }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'comprobantes':
        return <RceComprobantesTab rceHook={rceHook} empresa={company} />;
      case 'propuestas':
        return <RcePropuestasTab rceHook={rceHook} empresa={company} />;
      case 'procesos':
        return <RceProcesosTab rceHook={rceHook} empresa={company} />;
      case 'consultas':
        return <RceConsultasTab rceHook={rceHook} empresa={company} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem' }}>🧾</span>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                RCE - Registro de Compras Electrónico
              </h1>
              <p style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '1rem'
              }}>
                {company.razon_social} - RUC: {company.ruc}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BackendStatus compact />
            <button
              onClick={onClose}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Información del periodo actual */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: '#f3f4f6',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>📅</span>
          <span style={{ fontWeight: '600', color: '#374151' }}>
            Periodo Actual: {rceHook.periodoActual}
          </span>
          <button
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            onClick={() => {
              const nuevoPeriodo = prompt('Ingrese el nuevo periodo (YYYYMM):', rceHook.periodoActual);
              if (nuevoPeriodo && /^\d{6}$/.test(nuevoPeriodo)) {
                rceHook.cambiarPeriodo(nuevoPeriodo);
              }
            }}
          >
            Cambiar
          </button>
        </div>

        {/* Error global */}
        {rceHook.error && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{rceHook.error}</span>
            <button
              onClick={rceHook.limpiarError}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as RceTabType)}
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              {tab.label}
              {tab.count !== null && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        minHeight: '500px'
      }}>
        {rceHook.loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#6b7280', margin: 0 }}>
              Cargando datos RCE...
            </p>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default RcePanel;
```

---

Este es el **inicio del plan de implementación del frontend RCE**. El plan completo incluirá:

- **Fase 1** ✅: Tipos y servicios base (mostrada arriba)
- **Fase 2** ✅: Hooks personalizados (mostrada arriba)  
- **Fase 3** 🔄: Componentes base RCE (en proceso)
- **Fase 4**: Componentes específicos por tab
- **Fase 5**: Formularios y modales
- **Fase 6**: Integración con SirePage
- **Fase 7**: Testing y optimización

¿Te gustaría que continúe con las **Fases 4-7** del plan, o prefieres que procedamos directamente con la implementación paso a paso de alguna fase específica?
