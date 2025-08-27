import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export interface PLEConfiguracion {
  empresa: {
    ruc: string;
    razon_social: string;
  };
  formato_predeterminado: 'TXT' | 'ZIP';
  incluir_cabecera: boolean;
  validacion_automatica: boolean;
  directorio_salida: string;
}

interface PLEConfiguracionProps {
  configuracion: PLEConfiguracion | null;
  onGuardar: (config: PLEConfiguracion) => void;
  loading: boolean;
}

const PLEConfiguracionComponent: React.FC<PLEConfiguracionProps> = ({
  configuracion,
  onGuardar,
  loading
}) => {
  return (
    <Card>
      <CardHeader>
        <h2>Configuración PLE</h2>
      </CardHeader>
      <CardContent>
        <p>Configuración del sistema PLE (en desarrollo)</p>
      </CardContent>
    </Card>
  );
};

export default PLEConfiguracionComponent;
