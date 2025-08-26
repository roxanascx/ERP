/**
 * Índice centralizado de hooks
 * Exportaciones unificadas para fácil importación
 */

// Hooks base existentes
export { useBackendStatus } from './useApi';
export { useEmpresa } from './useEmpresa';
export { useEmpresaValidation } from './useEmpresaValidation';
export { useTickets } from './useTickets';

// Hooks RVIE existentes
export { useRvie } from './useRvie';
export { useRvieTickets } from './useRvieTickets';
export { useSireAutoAuth } from './useSireAutoAuth';

// Hooks RCE nuevos
export { useRce } from './useRce';
export { useRceComprobantes } from './useRceComprobantes';
export { useRceProcesos } from './useRceProcesos';

// Hooks de contabilidad
export { default as usePlantillasAsiento } from './usePlantillasAsiento';

// Hooks Socios de Negocio
export { useSociosNegocio } from './useSociosNegocio';
