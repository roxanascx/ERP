import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Save, 
  RotateCcw, 
  FileText, 
  Database,
  Calendar,
  Building2
} from "lucide-react";

export interface PLEConfiguracion {
  general: {
    empresaDefecto: string;
    rutaArchivos: string;
    formatoFecha: string;
    separadorDecimal: string;
    formatoNumeros: string;
  };
  validacion: {
    validarRUC: boolean;
    validarTiposCambio: boolean;
    validarFechas: boolean;
    validarCorrelatividad: boolean;
    permitirRegistrosVacios: boolean;
  };
  generacion: {
    incluirCabecera: boolean;
    comprimirArchivos: boolean;
    dividirPorMes: boolean;
    tamanioMaximoArchivo: number;
    codificacionArchivo: string;
  };
  notificaciones: {
    emailGeneracion: boolean;
    emailErrores: boolean;
    emailCompletitud: boolean;
    destinatarios: string[];
  };
}

interface PLEConfiguracionProps {
  configuracion: PLEConfiguracion;
  onChange: (configuracion: PLEConfiguracion) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
  loading?: boolean;
}

export const PLEConfiguracionComponent: React.FC<PLEConfiguracionProps> = ({
  configuracion,
  onChange,
  onSave,
  onReset,
  loading = false
}) => {
  const handleInputChange = (section: keyof PLEConfiguracion, field: string, value: any) => {
    onChange({
      ...configuracion,
      [section]: {
        ...configuracion[section],
        [field]: value
      }
    });
  };

  const handleArrayChange = (section: keyof PLEConfiguracion, field: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(section, field, array);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración PLE SUNAT V3
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Configura los parámetros para la generación y validación de archivos PLE.
            Los cambios se aplicarán a todas las generaciones futuras.
          </p>
        </CardContent>
      </Card>

      {/* Configuración General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-4 w-4" />
            General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="empresaDefecto">Empresa por defecto</Label>
              <Input
                id="empresaDefecto"
                value={configuracion.general.empresaDefecto}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('general', 'empresaDefecto', e.target.value)}
                placeholder="RUC de la empresa"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="rutaArchivos">Ruta de archivos</Label>
              <Input
                id="rutaArchivos"
                value={configuracion.general.rutaArchivos}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('general', 'rutaArchivos', e.target.value)}
                placeholder="/ruta/a/archivos/ple"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="formatoFecha">Formato de fecha</Label>
              <select
                id="formatoFecha"
                value={configuracion.general.formatoFecha}
                onChange={(e) => handleInputChange('general', 'formatoFecha', e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={loading}
              >
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                <option value="dd-mm-yyyy">DD-MM-YYYY</option>
              </select>
            </div>
            <div>
              <Label htmlFor="separadorDecimal">Separador decimal</Label>
              <select
                id="separadorDecimal"
                value={configuracion.general.separadorDecimal}
                onChange={(e) => handleInputChange('general', 'separadorDecimal', e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={loading}
              >
                <option value=".">Punto (.)</option>
                <option value=",">Coma (,)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="formatoNumeros">Formato de números</Label>
              <select
                id="formatoNumeros"
                value={configuracion.general.formatoNumeros}
                onChange={(e) => handleInputChange('general', 'formatoNumeros', e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={loading}
              >
                <option value="decimal">Con decimales</option>
                <option value="entero">Solo enteros</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Validación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-4 w-4" />
            Validaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="validarRUC">Validar RUC</Label>
                <Switch
                  id="validarRUC"
                  checked={configuracion.validacion.validarRUC}
                  onCheckedChange={(checked) => handleInputChange('validacion', 'validarRUC', checked)}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="validarTiposCambio">Validar tipos de cambio</Label>
                <Switch
                  id="validarTiposCambio"
                  checked={configuracion.validacion.validarTiposCambio}
                  onCheckedChange={(checked) => handleInputChange('validacion', 'validarTiposCambio', checked)}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="validarFechas">Validar fechas</Label>
                <Switch
                  id="validarFechas"
                  checked={configuracion.validacion.validarFechas}
                  onCheckedChange={(checked) => handleInputChange('validacion', 'validarFechas', checked)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="validarCorrelatividad">Validar correlatividad</Label>
                <Switch
                  id="validarCorrelatividad"
                  checked={configuracion.validacion.validarCorrelatividad}
                  onCheckedChange={(checked) => handleInputChange('validacion', 'validarCorrelatividad', checked)}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="permitirRegistrosVacios">Permitir registros vacíos</Label>
                <Switch
                  id="permitirRegistrosVacios"
                  checked={configuracion.validacion.permitirRegistrosVacios}
                  onCheckedChange={(checked) => handleInputChange('validacion', 'permitirRegistrosVacios', checked)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Generación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-4 w-4" />
            Generación de Archivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="incluirCabecera">Incluir cabecera</Label>
                <Switch
                  id="incluirCabecera"
                  checked={configuracion.generacion.incluirCabecera}
                  onCheckedChange={(checked) => handleInputChange('generacion', 'incluirCabecera', checked)}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="comprimirArchivos">Comprimir archivos (ZIP)</Label>
                <Switch
                  id="comprimirArchivos"
                  checked={configuracion.generacion.comprimirArchivos}
                  onCheckedChange={(checked) => handleInputChange('generacion', 'comprimirArchivos', checked)}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dividirPorMes">Dividir por mes</Label>
                <Switch
                  id="dividirPorMes"
                  checked={configuracion.generacion.dividirPorMes}
                  onCheckedChange={(checked) => handleInputChange('generacion', 'dividirPorMes', checked)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tamanioMaximoArchivo">Tamaño máximo (MB)</Label>
                <Input
                  id="tamanioMaximoArchivo"
                  type="number"
                  min="1"
                  max="100"
                  value={configuracion.generacion.tamanioMaximoArchivo}
                  onChange={(e) => handleInputChange('generacion', 'tamanioMaximoArchivo', parseInt(e.target.value))}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="codificacionArchivo">Codificación</Label>
                <select
                  id="codificacionArchivo"
                  value={configuracion.generacion.codificacionArchivo}
                  onChange={(e) => handleInputChange('generacion', 'codificacionArchivo', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                >
                  <option value="utf-8">UTF-8</option>
                  <option value="iso-8859-1">ISO-8859-1</option>
                  <option value="windows-1252">Windows-1252</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-4 w-4" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailGeneracion">Email al generar</Label>
              <Switch
                id="emailGeneracion"
                checked={configuracion.notificaciones.emailGeneracion}
                onCheckedChange={(checked) => handleInputChange('notificaciones', 'emailGeneracion', checked)}
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emailErrores">Email en errores</Label>
              <Switch
                id="emailErrores"
                checked={configuracion.notificaciones.emailErrores}
                onCheckedChange={(checked) => handleInputChange('notificaciones', 'emailErrores', checked)}
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emailCompletitud">Email de completitud</Label>
              <Switch
                id="emailCompletitud"
                checked={configuracion.notificaciones.emailCompletitud}
                onCheckedChange={(checked) => handleInputChange('notificaciones', 'emailCompletitud', checked)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="destinatarios">Destinatarios (separados por coma)</Label>
            <Input
              id="destinatarios"
              value={configuracion.notificaciones.destinatarios.join(', ')}
              onChange={(e) => handleArrayChange('notificaciones', 'destinatarios', e.target.value)}
              placeholder="email1@empresa.com, email2@empresa.com"
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onReset}
          disabled={loading}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Restablecer
        </Button>
        <Button
          onClick={onSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PLEConfiguracionComponent;
