import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Inbox,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { CuentaContable } from '../../../types/contabilidad';
import SearchHighlight from '../../common/SearchHighlight';
import EmptyState from '../../common/EmptyState';
import { cn } from '../../../lib/cn';

interface PlanContableTableProps {
  cuentas: CuentaContable[];
  loading: boolean;
  onEditarCuenta: (cuenta: CuentaContable) => void;
  onEliminarCuenta: (cuenta: CuentaContable) => void;
  onToggleActivarCuenta: (cuenta: CuentaContable) => void;
  cuentaSeleccionada?: string;
  onCuentaSelect: (cuenta: CuentaContable) => void;
  searchTerm?: string;
}

interface CuentaConHijos extends CuentaContable {
  hijos?: CuentaConHijos[];
  expandido?: boolean;
  tieneHijos?: boolean;
}

// ---------------------------------------------------------------------------
// Presentacion
// ---------------------------------------------------------------------------

const NATURALEZA_TONE: Record<string, string> = {
  DEUDORA: 'bg-amber-100 text-amber-800',
  ACREEDORA: 'bg-emerald-100 text-emerald-800',
  'DEUDORA/ACREEDORA': 'bg-indigo-100 text-indigo-800',
};

const NIVELES: Record<number, { label: string; tone: string }> = {
  1: { label: 'Clase', tone: 'bg-red-100 text-red-800' },
  2: { label: 'Grupo', tone: 'bg-orange-100 text-orange-800' },
  3: { label: 'Subgrupo', tone: 'bg-amber-100 text-amber-800' },
  4: { label: 'Cuenta', tone: 'bg-lime-100 text-lime-800' },
  5: { label: 'Subcuenta', tone: 'bg-emerald-100 text-emerald-800' },
  6: { label: 'Divisionaria', tone: 'bg-blue-100 text-blue-800' },
  7: { label: 'Subdivisionaria', tone: 'bg-pink-100 text-pink-800' },
  8: { label: 'Auxiliar', tone: 'bg-slate-100 text-slate-700' },
};

const th = 'px-3 py-2.5 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase';
const td = 'px-3 py-2.5 text-sm text-slate-700';

const PlanContableTable: React.FC<PlanContableTableProps> = ({
  cuentas,
  loading,
  onEditarCuenta,
  onEliminarCuenta,
  onToggleActivarCuenta,
  cuentaSeleccionada,
  onCuentaSelect,
  searchTerm = '',
}) => {
  const [sortField, setSortField] = useState<keyof CuentaContable>('codigo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // -------------------------------------------------------------------------
  // Jerarquia: el codigo contable ES el arbol (1 -> 10 -> 101 -> 1011...)
  // -------------------------------------------------------------------------

  const construirJerarquia = (lista: CuentaContable[]): CuentaConHijos[] => {
    const mapa = new Map<string, CuentaConHijos>();
    const raices: CuentaConHijos[] = [];

    const ordenadas = [...lista].sort((a, b) => a.codigo.localeCompare(b.codigo));

    ordenadas.forEach((cuenta) => {
      mapa.set(cuenta.codigo, {
        ...cuenta,
        hijos: [],
        expandido: expandedNodes.has(cuenta.codigo),
        tieneHijos: false,
      });
    });

    ordenadas.forEach((cuenta) => {
      const nodo = mapa.get(cuenta.codigo)!;

      // El padre es el prefijo mas largo que exista en el plan.
      let padre: CuentaConHijos | undefined;
      if (cuenta.codigo.length > 1) {
        for (let i = cuenta.codigo.length - 1; i > 0; i--) {
          padre = mapa.get(cuenta.codigo.substring(0, i));
          if (padre) break;
        }
      }

      if (padre) {
        padre.hijos!.push(nodo);
        padre.tieneHijos = true;
      } else {
        raices.push(nodo);
      }
    });

    const ordenarNodos = (nodos: CuentaConHijos[]) => {
      nodos.sort((a, b) => {
        const aNum = parseInt(a.codigo, 10);
        const bNum = parseInt(b.codigo, 10);
        if (!isNaN(aNum) && !isNaN(bNum) && a.codigo.length === b.codigo.length) {
          return aNum - bNum;
        }
        return a.codigo.localeCompare(b.codigo);
      });
      nodos.forEach((n) => n.hijos && ordenarNodos(n.hijos));
    };

    ordenarNodos(raices);
    return raices;
  };

  const aplanarJerarquia = (nodos: CuentaConHijos[]): CuentaConHijos[] => {
    let resultado: CuentaConHijos[] = [];

    nodos.forEach((nodo) => {
      resultado.push({ ...nodo, nivel: nodo.codigo.length - 1 });
      if (nodo.expandido && nodo.hijos && nodo.hijos.length > 0) {
        resultado = resultado.concat(aplanarJerarquia(nodo.hijos));
      }
    });

    return resultado;
  };

  const toggleExpansion = (codigo: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) next.delete(codigo);
      else next.add(codigo);
      return next;
    });
  };

  const expandirTodo = () => setExpandedNodes(new Set(cuentas.map((c) => c.codigo)));
  const colapsarTodo = () => setExpandedNodes(new Set());

  const handleSort = (field: keyof CuentaContable) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const hayBusqueda = Boolean(searchTerm && searchTerm.trim());

  // Con busqueda activa se muestra lista plana de resultados; sin ella, el arbol.
  const cuentasParaMostrar = useMemo(() => {
    if (hayBusqueda) {
      return cuentas.map((c) => ({ ...c, expandido: false, tieneHijos: false, hijos: [] }));
    }
    return aplanarJerarquia(construirJerarquia(cuentas));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuentas, expandedNodes, hayBusqueda]);

  const sortedCuentas = useMemo(() => {
    // Ordenar libremente solo tiene sentido en lista plana: en el arbol
    // romperia la relacion padre-hijo.
    if (!hayBusqueda) return cuentasParaMostrar;

    return [...cuentasParaMostrar].sort((a, b) => {
      const aValue = String(a[sortField] || '');
      const bValue = String(b[sortField] || '');
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [cuentasParaMostrar, sortField, sortDirection, hayBusqueda]);

  // -------------------------------------------------------------------------
  // Estados vacio / cargando
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-5" aria-busy="true">
        {['w-full', 'w-3/4', 'w-1/2', 'w-5/6', 'w-2/3'].map((w) => (
          <div key={w} className={cn('h-4 animate-pulse rounded bg-slate-200', w)} />
        ))}
      </div>
    );
  }

  if (cuentas.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No hay cuentas"
        description="No se encontraron cuentas contables con los filtros aplicados."
      />
    );
  }

  // -------------------------------------------------------------------------
  // Cabecera ordenable
  // -------------------------------------------------------------------------

  const SortableTh: React.FC<{ field: keyof CuentaContable; children: React.ReactNode }> = ({
    field,
    children,
  }) => {
    const activo = sortField === field;
    const Icon = !activo ? ArrowUpDown : sortDirection === 'asc' ? ArrowUp : ArrowDown;

    return (
      <th scope="col" className={th}>
        <button
          type="button"
          onClick={() => handleSort(field)}
          aria-sort={activo ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
          className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-xs font-semibold tracking-wide text-slate-600 uppercase hover:text-slate-900"
        >
          {children}
          <Icon
            className={cn('size-3.5', activo ? 'text-blue-600' : 'text-slate-400')}
            aria-hidden="true"
          />
        </button>
      </th>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Barra de expansion: solo util en vista de arbol */}
      {!hayBusqueda && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
          <span className="text-sm text-slate-500 tabular-nums">
            {sortedCuentas.length.toLocaleString('es-PE')} visibles de{' '}
            {cuentas.length.toLocaleString('es-PE')}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={expandirTodo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <ChevronsUpDown className="size-3.5" aria-hidden="true" />
              Expandir todo
            </button>
            <button
              type="button"
              onClick={colapsarTodo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <ChevronsDownUp className="size-3.5" aria-hidden="true" />
              Colapsar todo
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <SortableTh field="codigo">Código</SortableTh>
              <SortableTh field="descripcion">Descripción</SortableTh>
              <SortableTh field="nivel">Nivel</SortableTh>
              <SortableTh field="naturaleza">Naturaleza</SortableTh>
              <SortableTh field="activa">Estado</SortableTh>
              <th scope="col" className={cn(th, 'text-right')}>
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedCuentas.map((cuenta) => {
              const seleccionada = cuentaSeleccionada === cuenta.codigo;
              const estaExpandido = expandedNodes.has(cuenta.codigo);
              const sangria = hayBusqueda ? 0 : Math.max(0, cuenta.codigo.length - 1);
              const nivelInfo = NIVELES[cuenta.codigo.length] ?? {
                label: `Nivel ${cuenta.codigo.length}`,
                tone: 'bg-slate-100 text-slate-700',
              };
              // Solo las subcuentas (nivel 4+) se pueden activar o desactivar.
              const esSubcuenta = cuenta.codigo.length >= 4;

              return (
                <tr
                  key={cuenta.codigo}
                  onClick={() => onCuentaSelect(cuenta)}
                  className={cn(
                    'cursor-pointer border-b border-slate-100 transition-colors last:border-0',
                    seleccionada ? 'bg-blue-50' : 'hover:bg-slate-50',
                    !cuenta.activa && 'opacity-60'
                  )}
                >
                  {/* Codigo, con sangria segun profundidad */}
                  <td className={td}>
                    <div
                      className="flex items-center gap-1.5"
                      style={{ paddingLeft: `${sangria * 16}px` }}
                    >
                      {cuenta.tieneHijos ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpansion(cuenta.codigo);
                          }}
                          aria-expanded={estaExpandido}
                          aria-label={estaExpandido ? 'Colapsar' : 'Expandir'}
                          className="grid size-5 shrink-0 place-items-center rounded border-0 bg-transparent p-0 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                        >
                          {estaExpandido ? (
                            <ChevronDown className="size-4" aria-hidden="true" />
                          ) : (
                            <ChevronRight className="size-4" aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        <span className="size-5 shrink-0" aria-hidden="true" />
                      )}

                      <span className="font-mono text-sm font-semibold text-slate-900">
                        <SearchHighlight text={cuenta.codigo} searchTerm={searchTerm} />
                      </span>

                      {cuenta.clase_contable && cuenta.codigo.length <= 3 && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          Clase {cuenta.clase_contable}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Descripcion */}
                  <td className={td}>
                    <span className="font-medium text-slate-900">
                      <SearchHighlight text={cuenta.descripcion} searchTerm={searchTerm} />
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {cuenta.cuenta_padre && <>Padre: {cuenta.cuenta_padre}</>}
                      {cuenta.hijos && cuenta.hijos.length > 0 && (
                        <>
                          {cuenta.cuenta_padre ? ' · ' : ''}
                          {cuenta.hijos.length} subcuentas
                        </>
                      )}
                    </span>
                  </td>

                  {/* Nivel */}
                  <td className={td}>
                    <span
                      className={cn(
                        'inline-flex rounded px-2 py-0.5 text-xs font-medium',
                        nivelInfo.tone
                      )}
                    >
                      {nivelInfo.label}
                    </span>
                  </td>

                  {/* Naturaleza */}
                  <td className={td}>
                    <span
                      className={cn(
                        'inline-flex rounded px-2 py-0.5 text-xs font-medium',
                        NATURALEZA_TONE[cuenta.naturaleza] ?? 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {cuenta.naturaleza}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className={td}>
                    {esSubcuenta ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={cuenta.activa}
                        aria-label={`${cuenta.activa ? 'Desactivar' : 'Activar'} cuenta ${cuenta.codigo}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleActivarCuenta(cuenta);
                        }}
                        className={cn(
                          'relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 p-0 transition-colors',
                          cuenta.activa ? 'bg-green-500' : 'bg-slate-300'
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform',
                            cuenta.activa ? 'translate-x-5.5' : 'translate-x-0.5'
                          )}
                        />
                      </button>
                    ) : (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                          cuenta.activa
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            cuenta.activa ? 'bg-green-500' : 'bg-slate-400'
                          )}
                          aria-hidden="true"
                        />
                        {cuenta.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className={cn(td, 'text-right')}>
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditarCuenta(cuenta);
                        }}
                        title="Editar cuenta"
                        aria-label={`Editar cuenta ${cuenta.codigo}`}
                        className="grid size-8 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEliminarCuenta(cuenta);
                        }}
                        title="Eliminar cuenta"
                        aria-label={`Eliminar cuenta ${cuenta.codigo}`}
                        className="grid size-8 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanContableTable;
