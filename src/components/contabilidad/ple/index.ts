// Exportar todos los componentes PLE
export { default as PLEDashboard } from './PLEDashboard';
export { PLEGeneratorV3 } from './PLEGeneratorV3New';

// Exportar componentes individuales
export { default as PLEFormGeneracion } from './components/PLEFormGeneracion';
export { default as PLEArchivosTable } from './components/PLEArchivosTable';
export { default as PLEEstadisticas } from './components/PLEEstadisticas';
export { default as PLEConfiguracionComponent } from './components/PLEConfiguracion';
export { default as PLEValidacionPanel } from './components/PLEValidacionPanel';
export { default as PLEPreview } from './components/PLEPreview';

// Exportar tipos
export type { PLEGeneracionData } from './components/PLEFormGeneracion';
export type { PLEArchivo } from './components/PLEArchivosTable';
export type { PLEEstadistica } from './components/PLEEstadisticas';
export type { PLEConfiguracion } from './components/PLEConfiguracion';
export type { ValidacionResultado, ValidacionEstadistica } from './components/PLEValidacionPanel';
export type { PLERegistro, PLEValidacion } from './components/PLEPreview';

// Exportar servicios
export { pleApiService, PLEApiService } from '../../../services/pleApi';
export type { 
  PLEGeneracionResponse, 
  PLEPreviewResponse, 
  PLEValidacionResponse 
} from '../../../services/pleApi';
