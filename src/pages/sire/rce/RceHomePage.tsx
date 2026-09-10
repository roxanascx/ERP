import React from 'react';
import { Info } from 'lucide-react';
import ModuleGrid from '../../../components/common/ModuleGrid';
import { RCE_MODULES } from '../../../config/navigation';

/**
 * Portada de RCE.
 *
 * Sin layout propio (lo aporta MainLayout) y sin el bloque de empresa no
 * seleccionada, que era inalcanzable: RequireEmpresa ya redirige.
 */
const RceHomePage: React.FC = () => (
  <div className="space-y-8">
    <ModuleGrid modules={RCE_MODULES} title="Operaciones RCE" />

    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Info className="size-4 text-slate-400" aria-hidden="true" />
        Qué permite el Registro de Compras Electrónico
      </h2>
      <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        {[
          'Enviar información de compras directamente a SUNAT',
          'Generar propuestas de carga masiva de comprobantes',
          'Consultar el estado de procesamiento de los archivos enviados',
          'Descargar reportes y archivos procesados por SUNAT',
          'Mantener la trazabilidad completa del proceso',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-300" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  </div>
);

export default RceHomePage;
