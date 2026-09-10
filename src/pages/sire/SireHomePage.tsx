import React from 'react';
import ModuleGrid from '../../components/common/ModuleGrid';
import BackendStatus from '../../components/BackendStatus';
import { SIRE_MODULES } from '../../config/navigation';

/**
 * Portada del modulo SIRE.
 *
 * Ya no monta su propio layout de pantalla completa: el sidebar y la cabecera
 * (con la empresa activa y el boton de cambiarla) los aporta MainLayout.
 *
 * Tambien desaparece el bloque "Empresa no seleccionada" que traia cada
 * pantalla de SIRE: era codigo inalcanzable, porque RequireEmpresa ya redirige
 * a /empresas antes de montar la pagina.
 */
const SireHomePage: React.FC = () => (
  <div className="space-y-8">
    <ModuleGrid modules={SIRE_MODULES} title="Registros electrónicos" />
    <BackendStatus />
  </div>
);

export default SireHomePage;
