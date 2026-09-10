/**
 * Operaciones RCE: propuestas, procesos y archivos.
 * URL: /sire/rce/operaciones
 */

import React, { useState } from 'react';
import { FileStack, Rocket, Settings2 } from 'lucide-react';
import { useEmpresaValidation } from '../../../hooks/useEmpresaValidation';
import { RceSunatDirecto } from '../../../components/sire/rce/RceSunatDirecto';
import PeriodoSelector, {
  periodoActual,
  periodoToString,
  type Periodo,
} from '../../../components/common/PeriodoSelector';
import EmptyState from '../../../components/common/EmptyState';
import { cn } from '../../../lib/cn';

type TabId = 'propuestas' | 'procesos' | 'archivos';

const TABS: { id: TabId; label: string; icon: typeof Rocket }[] = [
  { id: 'propuestas', label: 'Propuestas', icon: Rocket },
  { id: 'procesos', label: 'Procesos', icon: Settings2 },
  { id: 'archivos', label: 'Archivos', icon: FileStack },
];

const RceOperacionesPage: React.FC = () => {
  const { empresaActual } = useEmpresaValidation();
  const [activeTab, setActiveTab] = useState<TabId>('propuestas');
  const [periodo, setPeriodo] = useState<Periodo>(periodoActual);

  // RequireEmpresa garantiza que hay empresa: esta guarda solo estrecha el tipo.
  if (!empresaActual) return null;

  return (
    <div className="space-y-6">
      {/* El periodo estaba cableado a "202507" en la llamada a SUNAT: siempre
          se consultaba julio de 2025 sin importar la fecha. Ahora lo elige el
          usuario. */}
      <PeriodoSelector value={periodo} onChange={setPeriodo} />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div role="tablist" className="flex border-b border-slate-200">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 border-0 border-b-2 bg-transparent px-4 py-3.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'border-violet-600 bg-violet-50/60 text-violet-700'
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-6">
          {activeTab === 'propuestas' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Generar propuestas SUNAT
                </h2>
                <p className="text-sm text-slate-500">
                  Genera propuestas y consulta el estado de los tickets directamente en SUNAT.
                </p>
              </div>
              <RceSunatDirecto ruc={empresaActual.ruc} periodo={periodoToString(periodo)} />
            </div>
          )}

          {activeTab === 'procesos' && (
            <EmptyState
              title="Gestión de procesos"
              description="La administración de procesos de comprobantes y registros RCE estará disponible próximamente."
            />
          )}

          {activeTab === 'archivos' && (
            <EmptyState
              title="Gestión de archivos"
              description="La carga, procesamiento y descarga de archivos RCE estará disponible próximamente."
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default RceOperacionesPage;
