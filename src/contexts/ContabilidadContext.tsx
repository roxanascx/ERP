import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type {
  CuentaContable,
  EstadisticasPlanContable,
  EstructuraResponse,
  ContabilidadUIState,
  ModuloContabilidad
} from '../types/contabilidad';

// Estado global del módulo contabilidad
interface ContabilidadState {
  // Datos
  cuentas: CuentaContable[];
  estadisticas: EstadisticasPlanContable | null;
  estructura: EstructuraResponse | null;
  
  // UI State
  ui: ContabilidadUIState;
  
  // Módulo activo
  moduloActivo: ModuloContabilidad;
  
  // Filtros actuales
  filtros: {
    busqueda: string;
    clase_contable?: number;
    nivel?: number;
    solo_activas: boolean;
    solo_hojas: boolean;
  };
}

// Acciones del reducer
type ContabilidadAction =
  | { type: 'SET_CUENTAS'; payload: CuentaContable[] }
  | { type: 'ADD_CUENTA'; payload: CuentaContable }
  | { type: 'UPDATE_CUENTA'; payload: CuentaContable }
  | { type: 'DELETE_CUENTA'; payload: string } // código
  | { type: 'SET_ESTADISTICAS'; payload: EstadisticasPlanContable }
  | { type: 'SET_ESTRUCTURA'; payload: EstructuraResponse }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_CUENTA'; payload: CuentaContable | null }
  | { type: 'SET_MODAL'; payload: { show: boolean; mode?: 'create' | 'edit' | 'view' } }
  | { type: 'SET_MODULO_ACTIVO'; payload: ModuloContabilidad }
  | { type: 'SET_FILTROS'; payload: Partial<ContabilidadState['filtros']> }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: ContabilidadState = {
  cuentas: [],
  estadisticas: null,
  estructura: null,
  ui: {
    loading: false,
    error: null,
    selectedCuenta: null,
    showModal: false,
    modalMode: 'create'
  },
  moduloActivo: 'plan-contable',
  filtros: {
    busqueda: '',
    solo_activas: true,
    solo_hojas: false
  }
};

// Reducer
function contabilidadReducer(state: ContabilidadState, action: ContabilidadAction): ContabilidadState {
  switch (action.type) {
    case 'SET_CUENTAS':
      return { ...state, cuentas: action.payload };
    
    case 'ADD_CUENTA':
      return { 
        ...state, 
        cuentas: [...state.cuentas, action.payload].sort((a, b) => a.codigo.localeCompare(b.codigo))
      };
    
    case 'UPDATE_CUENTA':
      return {
        ...state,
        cuentas: state.cuentas.map(cuenta => 
          cuenta.codigo === action.payload.codigo ? action.payload : cuenta
        )
      };
    
    case 'DELETE_CUENTA':
      return {
        ...state,
        cuentas: state.cuentas.map(cuenta =>
          cuenta.codigo === action.payload ? { ...cuenta, activa: false } : cuenta
        )
      };
    
    case 'SET_ESTADISTICAS':
      return { ...state, estadisticas: action.payload };
    
    case 'SET_ESTRUCTURA':
      return { ...state, estructura: action.payload };
    
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, loading: action.payload } };
    
    case 'SET_ERROR':
      return { ...state, ui: { ...state.ui, error: action.payload } };
    
    case 'SET_SELECTED_CUENTA':
      return { ...state, ui: { ...state.ui, selectedCuenta: action.payload } };
    
    case 'SET_MODAL':
      return { 
        ...state, 
        ui: { 
          ...state.ui, 
          showModal: action.payload.show,
          modalMode: action.payload.mode || state.ui.modalMode
        } 
      };
    
    case 'SET_MODULO_ACTIVO':
      return { ...state, moduloActivo: action.payload };
    
    case 'SET_FILTROS':
      return { ...state, filtros: { ...state.filtros, ...action.payload } };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context
const ContabilidadContext = createContext<{
  state: ContabilidadState;
  dispatch: React.Dispatch<ContabilidadAction>;
} | null>(null);

// Provider
interface ContabilidadProviderProps {
  children: ReactNode;
}

export const ContabilidadProvider: React.FC<ContabilidadProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(contabilidadReducer, initialState);

  return (
    <ContabilidadContext.Provider value={{ state, dispatch }}>
      {children}
    </ContabilidadContext.Provider>
  );
};

// Hook personalizado
export const useContabilidad = () => {
  const context = useContext(ContabilidadContext);
  if (!context) {
    throw new Error('useContabilidad debe usarse dentro de ContabilidadProvider');
  }
  return context;
};

// Hooks utilitarios
export const useContabilidadActions = () => {
  const { dispatch } = useContabilidad();

  return {
    setCuentas: (cuentas: CuentaContable[]) => 
      dispatch({ type: 'SET_CUENTAS', payload: cuentas }),
    
    addCuenta: (cuenta: CuentaContable) => 
      dispatch({ type: 'ADD_CUENTA', payload: cuenta }),
    
    updateCuenta: (cuenta: CuentaContable) => 
      dispatch({ type: 'UPDATE_CUENTA', payload: cuenta }),
    
    deleteCuenta: (codigo: string) => 
      dispatch({ type: 'DELETE_CUENTA', payload: codigo }),
    
    setEstadisticas: (stats: EstadisticasPlanContable) => 
      dispatch({ type: 'SET_ESTADISTICAS', payload: stats }),
    
    setEstructura: (estructura: EstructuraResponse) => 
      dispatch({ type: 'SET_ESTRUCTURA', payload: estructura }),
    
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    
    setError: (error: string | null) => 
      dispatch({ type: 'SET_ERROR', payload: error }),
    
    setSelectedCuenta: (cuenta: CuentaContable | null) => 
      dispatch({ type: 'SET_SELECTED_CUENTA', payload: cuenta }),
    
    setModal: (show: boolean, mode?: 'create' | 'edit' | 'view') => 
      dispatch({ type: 'SET_MODAL', payload: { show, mode } }),
    
    setModuloActivo: (modulo: ModuloContabilidad) => 
      dispatch({ type: 'SET_MODULO_ACTIVO', payload: modulo }),
    
    setFiltros: (filtros: Partial<ContabilidadState['filtros']>) => 
      dispatch({ type: 'SET_FILTROS', payload: filtros }),
    
    resetState: () => 
      dispatch({ type: 'RESET_STATE' })
  };
};

export default ContabilidadContext;
