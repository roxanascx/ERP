import React, { useMemo, useState } from 'react';
import { Building2, Plus, Search, ShieldCheck, X } from 'lucide-react';
import type { Empresa } from '../../types/empresa';
import EmpresaCard from './EmpresaCard';
import { cn } from '../../lib/cn';

interface EmpresaListProps {
  empresas: Empresa[];
  empresaActual: Empresa | null;
  loading: boolean;
  error: string | null;
  onSelectEmpresa: (empresa: Empresa) => void;
  onEditEmpresa: (empresa: Empresa) => void;
  onDeleteEmpresa: (ruc: string) => void;
  onConfigSire: (empresa: Empresa) => void;
  onCreateNew: () => void;
}

/**
 * Selector de empresas.
 *
 * Anade dos cosas que no existian:
 *   - Buscador por RUC o razon social. Con 5 empresas sobra; con 50 la lista
 *     plana era inservible.
 *   - Estado vacio. Un usuario nuevo veia tres contadores a cero y ninguna
 *     indicacion de que hacer, justo en el primer momento de la aplicacion.
 */
const EmpresaList: React.FC<EmpresaListProps> = ({
  empresas,
  empresaActual,
  loading,
  error,
  onSelectEmpresa,
  onEditEmpresa,
  onDeleteEmpresa,
  onConfigSire,
  onCreateNew,
}) => {
  const [query, setQuery] = useState('');

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return empresas;
    return empresas.filter(
      (e) => e.ruc.includes(q) || e.razon_social.toLowerCase().includes(q)
    );
  }, [empresas, query]);

  const stats = useMemo(
    () => ({
      total: empresas.length,
      activas: empresas.filter((e) => e.activa).length,
      conSire: empresas.filter((e) => e.sire_activo).length,
    }),
    [empresas]
  );

  // ---------------------------------------------------------------- cargando
  if (loading && empresas.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 h-6 w-40 rounded bg-slate-200" />
            <div className="mb-4 h-4 w-full rounded bg-slate-100" />
            <div className="mb-2 h-3 w-3/4 rounded bg-slate-100" />
            <div className="h-9 w-full rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  // ------------------------------------------------------------ estado vacio
  if (empresas.length === 0 && !error) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-blue-50">
          <Building2 className="size-7 text-blue-600" aria-hidden="true" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">
          Todavía no tienes ninguna empresa
        </h2>
        <p className="mx-auto mb-6 max-w-md text-sm text-slate-500">
          Registra tu primera empresa con su RUC para empezar a usar el sistema. Después podrás
          configurar sus credenciales SIRE.
        </p>
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          Registrar mi primera empresa
        </button>
      </div>
    );
  }

  // ----------------------------------------------------------------- listado
  return (
    <div className="space-y-5">
      {/* Barra: contadores + busqueda + alta */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <dl className="flex shrink-0 items-center gap-5">
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Empresas</dt>
            <dd className="text-xl font-bold text-slate-900 tabular-nums">{stats.total}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Activas</dt>
            <dd className="text-xl font-bold text-green-600 tabular-nums">{stats.activas}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs font-medium tracking-wide text-slate-500 uppercase">
              <ShieldCheck className="size-3" aria-hidden="true" />
              SIRE
            </dt>
            <dd className="text-xl font-bold text-amber-600 tabular-nums">{stats.conSire}</dd>
          </div>
        </dl>

        <div className="relative flex-1 sm:mx-2">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por RUC o razón social…"
            aria-label="Buscar empresa"
            className={cn(
              'w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-9 pl-9 text-sm text-slate-900',
              'placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none'
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Limpiar búsqueda"
              className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded border-0 bg-transparent p-0 text-slate-400 hover:text-slate-700"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nueva empresa
        </button>
      </div>

      {/* Sin resultados de busqueda */}
      {filtradas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            Ninguna empresa coincide con <span className="font-semibold text-slate-700">“{query}”</span>.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((empresa) => (
            <EmpresaCard
              key={empresa.ruc}
              empresa={empresa}
              isSelected={empresaActual?.ruc === empresa.ruc}
              onSelect={onSelectEmpresa}
              onEdit={onEditEmpresa}
              onDelete={onDeleteEmpresa}
              onConfigSire={onConfigSire}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmpresaList;
