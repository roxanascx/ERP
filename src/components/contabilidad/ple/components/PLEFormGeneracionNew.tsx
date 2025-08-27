import React, { useState } from 'react';
import type { PLEGeneracionData } from '../../../../services/pleApiUnified';
import './PLEFormGeneracion.css';

interface PLEFormGeneracionProps {
  onGenerar: (data: PLEGeneracionData) => Promise<void>;
  loading?: boolean;
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
      errors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof PLEGeneracionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error específico cuando el usuario empiece a corregir
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
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
    <div className="ple-form card">
      <div className="ple-form__header">
        <h3 className="ple-form__title">
          📄 Configuración de Generación PLE
        </h3>
        <p className="ple-form__description">
          Complete los datos necesarios para generar el archivo PLE conforme SUNAT V3
        </p>
      </div>
      
      <div className="ple-form__content">
        <form onSubmit={handleSubmit} className="ple-form__form">
          {/* Período */}
          <div className="ple-form__section">
            <h4 className="ple-form__section-title">📅 Período</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              <div className="form-group">
                <label htmlFor="ejercicio" className="form-label">Ejercicio</label>
                <input
                  id="ejercicio"
                  type="number"
                  min="2020"
                  max="2030"
                  value={formData.ejercicio}
                  onChange={(e) => handleInputChange('ejercicio', parseInt(e.target.value))}
                  disabled={loading}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="mes" className="form-label">Mes</label>
                <select
                  id="mes"
                  value={formData.mes}
                  onChange={(e) => handleInputChange('mes', parseInt(e.target.value))}
                  disabled={loading}
                  className="form-input"
                >
                  <option value={1}>Enero</option>
                  <option value={2}>Febrero</option>
                  <option value={3}>Marzo</option>
                  <option value={4}>Abril</option>
                  <option value={5}>Mayo</option>
                  <option value={6}>Junio</option>
                  <option value={7}>Julio</option>
                  <option value={8}>Agosto</option>
                  <option value={9}>Septiembre</option>
                  <option value={10}>Octubre</option>
                  <option value={11}>Noviembre</option>
                  <option value={12}>Diciembre</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">&nbsp;</label>
                <button
                  type="button"
                  onClick={getCurrentPeriod}
                  disabled={loading}
                  className="btn btn-secondary ple-form__period-btn"
                >
                  📅 Período Actual
                </button>
              </div>
            </div>
          </div>

          {/* Empresa */}
          <div className="ple-form__section">
            <h4 className="ple-form__section-title">🏢 Información de la Empresa</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="form-group">
                <label htmlFor="ruc" className="form-label">RUC *</label>
                <input
                  id="ruc"
                  type="text"
                  maxLength={11}
                  value={formData.ruc}
                  onChange={(e) => handleInputChange('ruc', e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  className={`form-input ${validationErrors.ruc ? 'error' : ''}`}
                  placeholder="Ingrese RUC de 11 dígitos"
                />
                {validationErrors.ruc && (
                  <div className="form-error">{validationErrors.ruc}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="razonSocial" className="form-label">Razón Social *</label>
                <input
                  id="razonSocial"
                  type="text"
                  value={formData.razonSocial}
                  onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                  disabled={loading}
                  className={`form-input ${validationErrors.razonSocial ? 'error' : ''}`}
                  placeholder="Razón social de la empresa"
                />
                {validationErrors.razonSocial && (
                  <div className="form-error">{validationErrors.razonSocial}</div>
                )}
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="ple-form__section">
            <h4 className="ple-form__section-title">📅 Rango de Fechas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="form-group">
                <label htmlFor="fechaInicio" className="form-label">Fecha de Inicio *</label>
                <input
                  id="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                  disabled={loading}
                  className={`form-input ${validationErrors.fechaInicio ? 'error' : ''}`}
                />
                {validationErrors.fechaInicio && (
                  <div className="form-error">{validationErrors.fechaInicio}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="fechaFin" className="form-label">Fecha de Fin *</label>
                <input
                  id="fechaFin"
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                  disabled={loading}
                  className={`form-input ${validationErrors.fechaFin ? 'error' : ''}`}
                />
                {validationErrors.fechaFin && (
                  <div className="form-error">{validationErrors.fechaFin}</div>
                )}
              </div>
            </div>
          </div>

          {/* Opciones */}
          <div className="ple-form__section">
            <h4 className="ple-form__section-title">⚙️ Opciones</h4>
            <div className="ple-form__options">
              <div className="ple-form__checkbox">
                <input
                  id="incluirCierreEjercicio"
                  type="checkbox"
                  checked={formData.incluirCierreEjercicio}
                  onChange={(e) => handleInputChange('incluirCierreEjercicio', e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="incluirCierreEjercicio" className="ple-form__checkbox-label">
                  Incluir asientos de cierre de ejercicio
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="observaciones" className="form-label">Observaciones</label>
                <textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  disabled={loading}
                  maxLength={500}
                  rows={3}
                  className="form-input"
                  placeholder="Observaciones adicionales para el PLE..."
                />
                <div className="ple-form__char-count">
                  {formData.observaciones?.length || 0}/500 caracteres
                </div>
              </div>
            </div>
          </div>

          {/* Botón de envío */}
          <div className="ple-form__submit">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary ple-form__submit-btn"
            >
              {loading ? (
                <>
                  <div className="loading-spinner animate-spin" />
                  Generando PLE...
                </>
              ) : (
                <>
                  ▶️ Generar Archivo PLE
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PLEFormGeneracion;
