import React from 'react';
import { PLEDashboard } from '../../components/contabilidad/ple';
import { useEmpresa } from '../../hooks/useEmpresa';

/**
 * PLE - Programa de Libros Electronicos.
 *
 * Este modulo existia completo (PLEDashboard, PLEGeneratorV3, etc.) pero era
 * inalcanzable: nunca se enruto. Ahora vive en /contabilidad/ple.
 *
 * Ya no monta ContabilidadLayout (el sidebar duplicado que se elimino): el
 * chrome lo aporta MainLayout como route layout.
 */
const PLEPage: React.FC = () => {
  const { empresaActual } = useEmpresa();

  if (!empresaActual) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <p>Selecciona una empresa para continuar</p>
      </div>
    );
  }

  return <PLEDashboard empresaId={empresaActual.ruc} />;
};

export default PLEPage;
