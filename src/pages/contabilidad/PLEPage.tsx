import React from 'react';
import ContabilidadLayout from '../../components/contabilidad/ContabilidadLayout';
import { PLEDashboard } from '../../components/contabilidad/ple';
import { useEmpresa } from '../../hooks/useEmpresa';

const PLEPage: React.FC = () => {
  const { empresaActual } = useEmpresa();

  if (!empresaActual) {
    return (
      <ContabilidadLayout 
        title="📊 PLE - Programa de Libros Electrónicos"
        subtitle="Generación de archivos PLE para SUNAT V3"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Selecciona una empresa para continuar</p>
        </div>
      </ContabilidadLayout>
    );
  }

  return (
    <ContabilidadLayout 
      title="📊 PLE - Programa de Libros Electrónicos"
      subtitle="Generación de archivos PLE para SUNAT V3"
    >
      <PLEDashboard empresaId={empresaActual.ruc} />
    </ContabilidadLayout>
  );
};

export default PLEPage;
