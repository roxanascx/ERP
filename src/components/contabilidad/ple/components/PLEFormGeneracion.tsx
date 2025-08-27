import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, FileDown, Play } from "lucide-react";

interface PLEFormGeneracionProps {
  onGenerar: (data: PLEGeneracionData) => Promise<void>;
  loading?: boolean;
}

export interface PLEGeneracionData {
  ejercicio: number;
  mes: number;
  ruc: string;
  razonSocial: string;
  fechaInicio: string;
  fechaFin: string;
  incluirCierreEjercicio: boolean;
  observaciones?: string;
}

export const PLEFormGeneracion: React.FC<PLEFormGeneracionProps> = ({
  onGenerar,
  loading = false
}) => {
  const [formData, setFormData] = useState<PLEGeneracionData>({
    ejercicio: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    ruc: '',
    razonSocial: '',
    fechaInicio: '',
    fechaFin: '',
    incluirCierreEjercicio: false,
    observaciones: ''
  });

  const [validationErrors, setValidationErrors] = useState<Partial<PLEGeneracionData>>({});

  const validateForm = (): boolean => {
    const errors: Partial<PLEGeneracionData> = {};

    if (!formData.ruc || formData.ruc.length !== 11) {
      errors.ruc = 'RUC debe tener 11 dígitos';
    }

    if (!formData.razonSocial.trim()) {
      errors.razonSocial = 'Razón social es requerida';
    }

    if (!formData.fechaInicio) {
      errors.fechaInicio = 'Fecha de inicio es requerida';
    }

    if (!formData.fechaFin) {
      errors.fechaFin = 'Fecha de fin es requerida';
    }

    if (formData.fechaInicio && formData.fechaFin && formData.fechaInicio > formData.fechaFin) {
      errors.fechaFin = 'Fecha de fin debe ser mayor a fecha de inicio';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onGenerar(formData);
    } catch (error) {
      console.error('Error al generar PLE:', error);
    }
  };

  const handleInputChange = (field: keyof PLEGeneracionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error de validación si existe
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const getCurrentPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    setFormData(prev => ({
      ...prev,
      ejercicio: year,
      mes: month,
      fechaInicio: `${year}-${month.toString().padStart(2, '0')}-01`,
      fechaFin: new Date(year, month, 0).toISOString().split('T')[0]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Generar PLE SUNAT V3
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Período */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ejercicio">Ejercicio</Label>
              <Input
                id="ejercicio"
                type="number"
                min="2020"
                max="2030"
                value={formData.ejercicio}
                onChange={(e) => handleInputChange('ejercicio', parseInt(e.target.value))}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="mes">Mes</Label>
              <Input
                id="mes"
                type="number"
                min="1"
                max="12"
                value={formData.mes}
                onChange={(e) => handleInputChange('mes', parseInt(e.target.value))}
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentPeriod}
                disabled={loading}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Período Actual
              </Button>
            </div>
          </div>

          {/* Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ruc">RUC</Label>
              <Input
                id="ruc"
                type="text"
                maxLength={11}
                value={formData.ruc}
                onChange={(e) => handleInputChange('ruc', e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                className={validationErrors.ruc ? 'border-red-500' : ''}
              />
              {validationErrors.ruc && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.ruc}</p>
              )}
            </div>
            <div>
              <Label htmlFor="razonSocial">Razón Social</Label>
              <Input
                id="razonSocial"
                type="text"
                value={formData.razonSocial}
                onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                disabled={loading}
                className={validationErrors.razonSocial ? 'border-red-500' : ''}
              />
              {validationErrors.razonSocial && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.razonSocial}</p>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                disabled={loading}
                className={validationErrors.fechaInicio ? 'border-red-500' : ''}
              />
              {validationErrors.fechaInicio && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.fechaInicio}</p>
              )}
            </div>
            <div>
              <Label htmlFor="fechaFin">Fecha de Fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={formData.fechaFin}
                onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                disabled={loading}
                className={validationErrors.fechaFin ? 'border-red-500' : ''}
              />
              {validationErrors.fechaFin && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.fechaFin}</p>
              )}
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                id="incluirCierreEjercicio"
                type="checkbox"
                checked={formData.incluirCierreEjercicio}
                onChange={(e) => handleInputChange('incluirCierreEjercicio', e.target.checked)}
                disabled={loading}
                className="rounded border-gray-300"
              />
              <Label htmlFor="incluirCierreEjercicio">
                Incluir asientos de cierre de ejercicio
              </Label>
            </div>

            <div>
              <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                disabled={loading}
                maxLength={500}
                rows={3}
                placeholder="Observaciones adicionales para el PLE..."
              />
            </div>
          </div>

          {/* Botón de envío */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generar PLE
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PLEFormGeneracion;
