/**
 * Índice centralizado de servicios API
 * Exportaciones unificadas para fácil importación
 */

// Servicios base
export { default as api } from './api';

// Servicios de dominio específico
export * from './empresaApi';
export * from './sire';
export * from './ticketService';
export { rvieTicketService } from './rvieTicketService';

// Servicios RCE
export { default as rceApi } from './rceApi';
export {
  rceComprobantesApi,
  rcePropuestasApi,
  rceProcesosApi,
  rceConsultasApi
} from './rceApi';

// Re-exportar tipos importantes para conveniencia
export type {
  // Tipos SIRE
  SireAuthStatus,
  SireStatusResponse,
  SireModuloActivo,
  SireModuloConfig,
  SireApiResponse,
  EmpresaConfigRce
} from '../types/sire';

export type {
  // Tipos RCE
  RceComprobante,
  RcePropuesta,
  RceProceso,
  RceTicket,
  RceEstadisticas,
  RceResumenPeriodo,
  RceFiltros,
  RceApiResponse
} from '../types/rce';

export type {
  // Tipos Empresa
  Empresa,
  EmpresaCreate,
  EmpresaUpdate
} from '../types/empresa';
