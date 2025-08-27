import React, { useState, useEffect } from 'react';
import type { PLEGeneracionData } from '../../../../services/pleApi';
import './PLEFormGeneracion.css';

interface PLEFormGeneracionProps {
  onGenerar: (data: PLEGeneracionData) => Promise<void>;
  loading?: boolean;
  empresaId?: string;
  libroSeleccionado?: string;
}

// Formulario interno con campos adicionales para UX
interface FormDataInternal {
  libro_diario_id: string;
  ejercicio: number;
  mes: number;
  ruc: string;
  razonSocial: string;
  fechaInicio: string;
  fechaFin: string;
  validar_antes_generar: boolean;
  incluir_metadatos: boolean;
  generar_zip: boolean;
  observaciones: string;
}

interface ValidationErrors {
  libro_diario_id?: string;
  ejercicio?: string;
  mes?: string;
  ruc?: string;
  razonSocial?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export const PLEFormGeneracion: React.FC<PLEFormGeneracionProps> = ({
  onGenerar,
  loading = false,
  empresaId,
  libroSeleccionado
}) => {
  const [formData, setFormData] = useState<FormDataInternal>({
    libro_diario_id: libroSeleccionado || '',
    ejercicio: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    ruc: '',
    razonSocial: '',
    fechaInicio: '',
    fechaFin: '',
    validar_antes_generar: true,
    incluir_metadatos: true,
    generar_zip: true,
    observaciones: ''
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Actualizar libro cuando cambie
  useEffect(() => {
    if (libroSeleccionado) {
      setFormData(prev => ({
        ...prev,
        libro_diario_id: libroSeleccionado
      }));
    }
  }, [libroSeleccionado]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.libro_diario_id.trim()) {
      errors.libro_diario_id = 'Debe seleccionar un libro diario';
    }

    if (!formData.ruc || formData.ruc.length !== 11) {
      errors.ruc = 'RUC debe tener 11 dígitos';
    }

    if (!formData.razonSocial.trim()) {
      errors.razonSocial = 'Razón social es requerida';
    }

    if (formData.ejercicio < 2000 || formData.ejercicio > new Date().getFullYear()) {
      errors.ejercicio = 'Ejercicio debe estar entre 2000 y el año actual';
    }

    if (formData.mes < 1 || formData.mes > 12) {
      errors.mes = 'Mes debe estar entre 1 y 12';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormDataInternal, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error específico cuando el usuario empiece a corregir
    const errorField = field as keyof ValidationErrors;
    if (validationErrors[errorField]) {
      setValidationErrors(prev => ({
        ...prev,
        [errorField]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Convertir al formato esperado por la API unificada
      const pleData: PLEGeneracionData = {
        libro_diario_id: formData.libro_diario_id,
        ejercicio: formData.ejercicio,
        mes: formData.mes,
        validar_antes_generar: formData.validar_antes_generar,
        incluir_metadatos: formData.incluir_metadatos,
        generar_zip: formData.generar_zip,
        observaciones: formData.observaciones || undefined
      };

      await onGenerar(pleData);
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
      fechaFin: `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`
    }));
  };

  return (
    <div className="ple-form-generacion">
      <div className="ple-form-header">
        <h3>📝 Generar Archivo PLE</h3>
        <p>Complete los datos para generar el archivo del Programa de Libros Electrónicos</p>
      </div>

      <form onSubmit={handleSubmit} className="ple-form">
        {/* Información del Libro */}
        <div className="form-section">
          <h4>📚 Libro Diario</h4>
          
          <div className="form-group">
            <label htmlFor="libro_diario_id">
              ID del Libro Diario *
            </label>
            <input
              id="libro_diario_id"
              type="text"
              value={formData.libro_diario_id}
              onChange={(e) => handleInputChange('libro_diario_id', e.target.value)}
              placeholder="Seleccione o ingrese ID del libro"
              className={`form-input ${validationErrors.libro_diario_id ? 'error' : ''}`}
              disabled={!!libroSeleccionado}
            />
            {validationErrors.libro_diario_id && (
              <div className="form-error">{validationErrors.libro_diario_id}</div>
            )}
          </div>
        </div>

        {/* Información de la Empresa */}
        <div className="form-section">
          <h4>🏢 Datos de la Empresa</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ruc">
                RUC *
              </label>
              <input
                id="ruc"
                type="text"
                value={formData.ruc}
                onChange={(e) => handleInputChange('ruc', e.target.value.replace(/\\D/g, ''))}
                maxLength={11}
                className={`form-input ${validationErrors.ruc ? 'error' : ''}`}
                placeholder="12345678901"
              />
              {validationErrors.ruc && (
                <div className="form-error">{validationErrors.ruc}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="razonSocial">
                Razón Social *
              </label>
              <input
                id="razonSocial"
                type="text"
                value={formData.razonSocial}
                onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                className={`form-input ${validationErrors.razonSocial ? 'error' : ''}`}
                placeholder="Nombre de la empresa"
              />
              {validationErrors.razonSocial && (
                <div className="form-error">{validationErrors.razonSocial}</div>
              )}
            </div>
          </div>
        </div>

        {/* Período Contable */}
        <div className="form-section">
          <h4>📅 Período Contable</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ejercicio">
                Ejercicio *
              </label>
              <input
                id="ejercicio"
                type="number"
                value={formData.ejercicio}
                onChange={(e) => handleInputChange('ejercicio', parseInt(e.target.value))}
                min={2000}
                max={new Date().getFullYear()}
                className={`form-input ${validationErrors.ejercicio ? 'error' : ''}`}
              />
              {validationErrors.ejercicio && (
                <div className="form-error">{validationErrors.ejercicio}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="mes">
                Mes *
              </label>
              <select
                id="mes"
                value={formData.mes}
                onChange={(e) => handleInputChange('mes', parseInt(e.target.value))}
                className={`form-input ${validationErrors.mes ? 'error' : ''}`}
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
              {validationErrors.mes && (
                <div className="form-error">{validationErrors.mes}</div>
              )}
            </div>
          </div>

          <div className="form-actions-inline">
            <button
              type="button"
              onClick={getCurrentPeriod}
              className="btn-secondary-small"
            >
              📅 Período Actual
            </button>
          </div>
        </div>

        {/* Opciones de Generación */}
        <div className="form-section">
          <h4>⚙️ Opciones de Generación</h4>
          
          <div className="form-checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.validar_antes_generar}
                onChange={(e) => handleInputChange('validar_antes_generar', e.target.checked)}
              />
              <span>✅ Validar antes de generar</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.incluir_metadatos}
                onChange={(e) => handleInputChange('incluir_metadatos', e.target.checked)}
              />
              <span>📋 Incluir metadatos</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.generar_zip}
                onChange={(e) => handleInputChange('generar_zip', e.target.checked)}
              />
              <span>🗜️ Generar archivo ZIP</span>
            </label>
          </div>
        </div>

        {/* Observaciones */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="observaciones">
              📝 Observaciones (Opcional)
            </label>
            <textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              className="form-textarea"
              placeholder="Comentarios adicionales sobre la generación..."
              rows={3}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generando PLE...
              </>
            ) : (
              <>
                🚀 Generar Archivo PLE
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info adicional */}
      <div className="ple-form-info">
        <div className="info-item">
          <strong>📄 Formato:</strong> SUNAT v3.0 (24 campos)
        </div>
        <div className="info-item">
          <strong>📦 Salida:</strong> {formData.generar_zip ? 'Archivo ZIP' : 'Archivo TXT'}
        </div>
        <div className="info-item">
          <strong>✅ Validación:</strong> {formData.validar_antes_generar ? 'Habilitada' : 'Deshabilitada'}
        </div>
      </div>
    </div>
  );
};
