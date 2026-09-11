/**
 * Barrel de hooks.
 *
 * Solo se exporta lo que alguien importa desde aqui. Reexportar "por si acaso"
 * mantiene vivo codigo muerto: seis hooks de SIRE (2.835 lineas) sobrevivieron
 * asi hasta que se construyo el grafo de imports, porque el barrel los hacia
 * parecer alcanzables aunque ninguna pagina los usara.
 *
 * Los hooks que se importan por su ruta directa no necesitan estar aqui.
 */

export { useBackendStatus } from './useApi';
export { useEmpresa } from './useEmpresa';
export { useEmpresaValidation } from './useEmpresaValidation';
export { useRvie } from './useRvie';
export { default as usePlantillasAsiento } from './usePlantillasAsiento';
export { useSociosNegocio } from './useSociosNegocio';
