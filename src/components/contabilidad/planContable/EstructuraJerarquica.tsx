import React, { useState, useEffect } from 'react';
import type { CuentaContable } from '../../../types/contabilidad';

interface EstructuraJerarquicaProps {
  cuentas: CuentaContable[];
  cuentaSeleccionada?: string;
  onCuentaSelect: (cuenta: CuentaContable) => void;
  onEditarCuenta: (cuenta: CuentaContable) => void;
  className?: string;
}

interface NodoJerarquico {
  cuenta: CuentaContable;
  hijos: NodoJerarquico[];
  expandido: boolean;
}

const EstructuraJerarquica: React.FC<EstructuraJerarquicaProps> = ({
  cuentas,
  cuentaSeleccionada,
  onCuentaSelect,
  onEditarCuenta,
  className = ''
}) => {
  const [arbol, setArbol] = useState<NodoJerarquico[]>([]);
  const [nodosExpandidos, setNodosExpandidos] = useState<Set<string>>(new Set());

  // Construir el árbol jerárquico
  useEffect(() => {
    const construirArbol = (cuentas: CuentaContable[]): NodoJerarquico[] => {
      const nodos = new Map<string, NodoJerarquico>();
      
      // Crear nodos
      cuentas.forEach(cuenta => {
        nodos.set(cuenta.codigo, {
          cuenta,
          hijos: [],
          expandido: nodosExpandidos.has(cuenta.codigo)
        });
      });

      // Construir jerarquía
      const raices: NodoJerarquico[] = [];
      
      cuentas.forEach(cuenta => {
        const nodo = nodos.get(cuenta.codigo)!;
        
        if (cuenta.cuenta_padre) {
          const padre = nodos.get(cuenta.cuenta_padre);
          if (padre) {
            padre.hijos.push(nodo);
          } else {
            raices.push(nodo);
          }
        } else {
          raices.push(nodo);
        }
      });

      // Ordenar nodos por código
      const ordenarNodos = (nodos: NodoJerarquico[]) => {
        nodos.sort((a, b) => a.cuenta.codigo.localeCompare(b.cuenta.codigo));
        nodos.forEach(nodo => ordenarNodos(nodo.hijos));
      };

      ordenarNodos(raices);
      return raices;
    };

    setArbol(construirArbol(cuentas));
  }, [cuentas, nodosExpandidos]);

  const toggleExpansion = (codigo: string) => {
    const nuevosExpandidos = new Set(nodosExpandidos);
    if (nuevosExpandidos.has(codigo)) {
      nuevosExpandidos.delete(codigo);
    } else {
      nuevosExpandidos.add(codigo);
    }
    setNodosExpandidos(nuevosExpandidos);
  };

  const expandirTodo = () => {
    const todosLosCodigos = new Set(cuentas.map(c => c.codigo));
    setNodosExpandidos(todosLosCodigos);
  };

  const contraerTodo = () => {
    setNodosExpandidos(new Set());
  };

  const renderNodo = (nodo: NodoJerarquico, nivel: number = 0): React.ReactNode => {
    const { cuenta, hijos } = nodo;
    const tieneHijos = hijos.length > 0;
    const estaExpandido = nodosExpandidos.has(cuenta.codigo);
    const estaSeleccionada = cuentaSeleccionada === cuenta.codigo;

    const paddingLeft = nivel * 20 + 8;

    return (
      <div key={cuenta.codigo} className="select-none">
        {/* Nodo padre */}
        <div
          className={`
            flex items-center py-2 px-2 cursor-pointer rounded-md transition-colors duration-150
            ${estaSeleccionada 
              ? 'bg-blue-100 border-l-4 border-blue-500' 
              : 'hover:bg-gray-50'
            }
          `}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => onCuentaSelect(cuenta)}
        >
          {/* Icono de expansión */}
          <div className="w-6 h-6 flex items-center justify-center mr-2">
            {tieneHijos ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpansion(cuenta.codigo);
                }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  className={`w-4 h-4 transform transition-transform duration-200 ${
                    estaExpandido ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            )}
          </div>

          {/* Icono del tipo de cuenta */}
          <div className="w-6 h-6 flex items-center justify-center mr-3">
            {getNivelIcon(cuenta.nivel)}
          </div>

          {/* Información de la cuenta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <span className={`font-mono text-sm ${
                estaSeleccionada ? 'font-semibold text-blue-900' : 'text-gray-700'
              }`}>
                {cuenta.codigo}
              </span>
              <span className={`text-sm ${
                estaSeleccionada ? 'font-medium text-blue-800' : 'text-gray-900'
              }`}>
                {cuenta.descripcion}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-xs text-gray-500">
                Nivel {cuenta.nivel}
              </span>
              {cuenta.acepta_movimiento && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Acepta movimiento
                </span>
              )}
              {!cuenta.activa && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Inactiva
                </span>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditarCuenta(cuenta);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 rounded"
              title="Editar cuenta"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Nodos hijos */}
        {tieneHijos && estaExpandido && (
          <div>
            {hijos.map(hijo => renderNodo(hijo, nivel + 1))}
          </div>
        )}
      </div>
    );
  };

  const getNivelIcon = (nivel: number) => {
    const iconProps = "w-4 h-4";
    
    switch (nivel) {
      case 1: // Clase
        return (
          <svg className={`${iconProps} text-purple-600`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 16a2 2 0 002-2v-3a2 2 0 00-2-2H6a2 2 0 00-2 2v3a2 2 0 002 2h8z" />
          </svg>
        );
      case 2: // Grupo
        return (
          <svg className={`${iconProps} text-blue-600`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 3: // Subgrupo
        return (
          <svg className={`${iconProps} text-green-600`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm0 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm0 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      default: // Cuenta, subcuenta, etc.
        return (
          <svg className={`${iconProps} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  if (arbol.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center py-12 text-gray-500`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mt-2">No hay cuentas disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Controles */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Estructura Jerárquica</h3>
        <div className="flex space-x-2">
          <button
            onClick={expandirTodo}
            className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
          >
            Expandir todo
          </button>
          <button
            onClick={contraerTodo}
            className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-50"
          >
            Contraer todo
          </button>
        </div>
      </div>

      {/* Árbol */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {arbol.map(nodo => renderNodo(nodo))}
      </div>
    </div>
  );
};

export default EstructuraJerarquica;
