/**
 * 🔄 Contexto para compartir datos RCE entre vistas
 * Evita consultas duplicadas a SUNAT
 */
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Tipos para los datos compartidos
interface RceComprobante {
  ruc_proveedor: string;
  razon_social_proveedor: string;
  tipo_documento: string;
  serie: string;
  numero: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  moneda: string;
  tipo_cambio: number;
  base_imponible: number;
  igv: number;
  valor_no_gravado: number;
  total: number;
  estado?: string;
}

interface RceDataContextType {
  // Datos de la consulta detallada
  comprobantesDetallados: RceComprobante[] | null;
  setComprobantesDetallados: (comprobantes: RceComprobante[] | null) => void;
  
  // Metadata de la consulta
  periodoActual: string | null;
  setPeriodoActual: (periodo: string | null) => void;
  
  rucActual: string | null;
  setRucActual: (ruc: string | null) => void;
  
  // Estado de sincronización
  ultimaConsultaSunat: Date | null;
  setUltimaConsultaSunat: (fecha: Date | null) => void;
  
  // Métodos utilitarios
  hayDatosEnCache: () => boolean;
  limpiarCache: () => void;
  obtenerEstadoCache: (ruc?: string, periodo?: string) => { 
    hayDatos: boolean; 
    total: number; 
    descripcion: string;
    esCompatible: boolean;
  };
}

const RceDataContext = createContext<RceDataContextType | undefined>(undefined);

interface RceDataProviderProps {
  children: ReactNode;
}

export const RceDataProvider: React.FC<RceDataProviderProps> = ({ children }) => {
  const [comprobantesDetallados, setComprobantesDetallados] = useState<RceComprobante[] | null>(null);
  const [periodoActual, setPeriodoActual] = useState<string | null>(null);
  const [rucActual, setRucActual] = useState<string | null>(null);
  const [ultimaConsultaSunat, setUltimaConsultaSunat] = useState<Date | null>(null);

  const hayDatosEnCache = (): boolean => {
    return !!(comprobantesDetallados && comprobantesDetallados.length > 0);
  };

  const limpiarCache = (): void => {
    setComprobantesDetallados(null);
    setUltimaConsultaSunat(null);
    console.log('🗑️ Cache RCE limpiado');
  };

  const obtenerEstadoCache = (ruc?: string, periodo?: string): { 
    hayDatos: boolean; 
    total: number; 
    descripcion: string;
    esCompatible: boolean;
  } => {
    const hayDatos = !!(comprobantesDetallados && comprobantesDetallados.length > 0);
    const total = comprobantesDetallados?.length || 0;
    
    if (!hayDatos) {
      return {
        hayDatos: false,
        total: 0,
        descripcion: 'Sin datos en cache',
        esCompatible: false
      };
    }
    
    // Verificar compatibilidad si se proporcionan parámetros
    const esCompatible = !ruc || !periodo || 
      (rucActual === ruc && periodoActual === periodo);
    
    let descripcion = `${total} comprobantes en cache`;
    if (ultimaConsultaSunat) {
      const minutos = Math.floor((Date.now() - ultimaConsultaSunat.getTime()) / 60000);
      descripcion += ` (${minutos}m ago)`;
    }
    
    if (ruc && periodo && !esCompatible) {
      descripcion += ` [RUC/período diferente]`;
    }
    
    return {
      hayDatos: hayDatos && esCompatible,
      total,
      descripcion,
      esCompatible
    };
  };

  const value: RceDataContextType = {
    comprobantesDetallados,
    setComprobantesDetallados,
    periodoActual,
    setPeriodoActual,
    rucActual,
    setRucActual,
    ultimaConsultaSunat,
    setUltimaConsultaSunat,
    hayDatosEnCache,
    limpiarCache,
    obtenerEstadoCache
  };

  return (
    <RceDataContext.Provider value={value}>
      {children}
    </RceDataContext.Provider>
  );
};

export const useRceData = (): RceDataContextType => {
  const context = useContext(RceDataContext);
  if (context === undefined) {
    throw new Error('useRceData debe ser usado dentro de un RceDataProvider');
  }
  return context;
};

export default RceDataContext;
