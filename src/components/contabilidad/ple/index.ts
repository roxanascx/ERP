// Exportar todos los componentes PLE - VERSIÓN UNIFICADA
export { default as PLEDashboard } from './PLEDashboard';
export { PLEGeneratorV3 } from './PLEGeneratorV3';

// Exportar componentes individuales - UNIFICADOS
export { PLEFormGeneracion } from './components/PLEFormGeneracionUnified';
export { default as PLEArchivosTable } from './components/PLEArchivosTableNew';
export { default as PLEEstadisticas } from './components/PLEEstadisticasNew';
export { default as PLEConfiguracionComponent } from './components/PLEConfiguracionComponent';
export { default as PLEValidacionPanel } from './components/PLEValidacionPanel';
export { default as PLEPreview } from './components/PLEPreview';

// Exportar tipos desde el servicio unificado
export type { 
  PLEGeneracionData,
  PLEArchivo,
  PLEEstadistica,
  PLEConfiguracion,
  ValidacionResultado, 
  ValidacionEstadistica,
  PLERegistro, 
  PLEValidacion,
  PLEGeneracionResponse,
  PLEPreviewResponse,
  PLEValidacionResponse
} from '../../../services/pleApi';

// Exportar servicios unificados
export { pleApiService, PLEApiService, PLEUtils } from '../../../services/pleApi';
