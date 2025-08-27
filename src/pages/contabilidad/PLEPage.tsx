import React from 'react';
import ContabilidadLayout from '../../components/contabilidad/ContabilidadLayout';
import { PLEGeneratorV3 } from '../../components/contabilidad/ple/PLEGeneratorV3Enhanced';

const PLEPage: React.FC = () => {
  return (
    <ContabilidadLayout 
      title="📊 PLE - Programa de Libros Electrónicos"
      subtitle="Generación de archivos PLE para SUNAT V3"
    >
      <PLEGeneratorV3 />
    </ContabilidadLayout>
  );
};

export default PLEPage;
