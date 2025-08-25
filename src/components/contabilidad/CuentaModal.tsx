import React, { useState, useEffect } from 'react';
import type { CuentaContable } from '../../types/contabilidad';

interface CuentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cuenta: Partial<CuentaContable>) => Promise<void>;
  cuenta?: CuentaContable;
  cuentasPadre: CuentaContable[];
  modo: 'crear' | 'editar';
}

const CuentaModal: React.FC<CuentaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cuenta,
  cuentasPadre,
  modo
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    nivel: 1,
    clase_contable: 1,
    grupo: '',
    subgrupo: '',
    cuenta_padre: '',
    es_hoja: true,
    acepta_movimiento: true,
    naturaleza: 'DEUDORA' as 'DEUDORA' | 'ACREEDORA',
    moneda: 'MN' as 'MN' | 'ME',
    activa: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Opciones para los select
  const clasesContables = [
    { value: 1, label: '1 - ACTIVO DISPONIBLE Y EXIGIBLE' },
    { value: 2, label: '2 - ACTIVO REALIZABLE' },
    { value: 3, label: '3 - ACTIVO INMOVILIZADO' },
    { value: 4, label: '4 - PASIVO' },
    { value: 5, label: '5 - PATRIMONIO NETO' },
    { value: 6, label: '6 - GASTOS POR NATURALEZA' },
    { value: 7, label: '7 - VENTAS' },
    { value: 8, label: '8 - SALDOS INTERMEDIARIOS' },
    { value: 9, label: '9 - CONTABILIDAD ANALÍTICA' }
  ];

  const niveles = [
    { value: 1, label: '1 - CLASE' },
    { value: 2, label: '2 - GRUPO' },
    { value: 3, label: '3 - SUBGRUPO' },
    { value: 4, label: '4 - CUENTA' },
    { value: 5, label: '5 - SUBCUENTA' },
    { value: 6, label: '6 - DIVISIONARIA' },
    { value: 7, label: '7 - SUBDIVISIONARIA' },
    { value: 8, label: '8 - AUXILIAR' }
  ];

  const naturalezas = [
    { value: 'DEUDORA', label: 'Deudora' },
    { value: 'ACREEDORA', label: 'Acreedora' }
  ];

  const monedas = [
    { value: 'MN', label: 'Moneda Nacional (PEN)' },
    { value: 'ME', label: 'Moneda Extranjera (USD)' }
  ];

  // Cargar datos si es edición
  useEffect(() => {
    if (cuenta && modo === 'editar') {
      setFormData({
        codigo: cuenta.codigo,
        descripcion: cuenta.descripcion,
        nivel: cuenta.nivel,
        clase_contable: cuenta.clase_contable,
        grupo: cuenta.grupo || '',
        subgrupo: cuenta.subgrupo || '',
        cuenta_padre: cuenta.cuenta_padre || '',
        es_hoja: cuenta.es_hoja,
        acepta_movimiento: cuenta.acepta_movimiento,
        naturaleza: cuenta.naturaleza,
        moneda: cuenta.moneda,
        activa: cuenta.activa
      });
    } else {
      // Reset para modo crear
      setFormData({
        codigo: '',
        descripcion: '',
        nivel: 1,
        clase_contable: 1,
        grupo: '',
        subgrupo: '',
        cuenta_padre: '',
        es_hoja: true,
        acepta_movimiento: true,
        naturaleza: 'DEUDORA',
        moneda: 'MN',
        activa: true
      });
    }
    setErrors({});
  }, [cuenta, modo, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es obligatorio';
    } else if (!/^[0-9]+$/.test(formData.codigo)) {
      newErrors.codigo = 'El código debe contener solo números';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    if (formData.nivel < 1 || formData.nivel > 8) {
      newErrors.nivel = 'El nivel debe estar entre 1 y 8';
    }

    if (formData.clase_contable < 1 || formData.clase_contable > 9) {
      newErrors.clase_contable = 'La clase contable debe estar entre 1 y 9';
    }

    // Validar que el código corresponda al nivel
    const longitudEsperada = formData.nivel;
    if (formData.codigo.length !== longitudEsperada) {
      newErrors.codigo = `Para el nivel ${formData.nivel}, el código debe tener ${longitudEsperada} dígito(s)`;
    }

    // Validar que coincida con la clase contable
    if (formData.codigo.length > 0 && parseInt(formData.codigo[0]) !== formData.clase_contable) {
      newErrors.codigo = `El primer dígito debe ser ${formData.clase_contable} para la clase contable seleccionada`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar cuenta:', error);
      setErrors({ submit: 'Error al guardar la cuenta. Intente nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {modo === 'crear' ? 'Nueva Cuenta Contable' : 'Editar Cuenta Contable'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Formulario */}
              <div className="space-y-6">
                {/* Código y Descripción */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código *
                    </label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => handleInputChange('codigo', e.target.value)}
                      disabled={modo === 'editar'}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.codigo ? 'border-red-300' : 'border-gray-300'
                      } ${modo === 'editar' ? 'bg-gray-100' : ''}`}
                      placeholder="Ej: 1011"
                    />
                    {errors.codigo && (
                      <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nivel *
                    </label>
                    <select
                      value={formData.nivel}
                      onChange={(e) => handleInputChange('nivel', parseInt(e.target.value))}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nivel ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      {niveles.map(nivel => (
                        <option key={nivel.value} value={nivel.value}>
                          {nivel.label}
                        </option>
                      ))}
                    </select>
                    {errors.nivel && (
                      <p className="mt-1 text-sm text-red-600">{errors.nivel}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.descripcion ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Descripción de la cuenta"
                  />
                  {errors.descripcion && (
                    <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
                  )}
                </div>

                {/* Clase Contable y Cuenta Padre */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clase Contable *
                    </label>
                    <select
                      value={formData.clase_contable}
                      onChange={(e) => handleInputChange('clase_contable', parseInt(e.target.value))}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.clase_contable ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      {clasesContables.map(clase => (
                        <option key={clase.value} value={clase.value}>
                          {clase.label}
                        </option>
                      ))}
                    </select>
                    {errors.clase_contable && (
                      <p className="mt-1 text-sm text-red-600">{errors.clase_contable}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuenta Padre
                    </label>
                    <select
                      value={formData.cuenta_padre}
                      onChange={(e) => handleInputChange('cuenta_padre', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sin cuenta padre</option>
                      {cuentasPadre
                        .filter(c => c.codigo !== formData.codigo) // Evitar auto-referencia
                        .map(cuenta => (
                          <option key={cuenta.codigo} value={cuenta.codigo}>
                            {cuenta.codigo} - {cuenta.descripcion}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Naturaleza y Moneda */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Naturaleza *
                    </label>
                    <select
                      value={formData.naturaleza}
                      onChange={(e) => handleInputChange('naturaleza', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {naturalezas.map(nat => (
                        <option key={nat.value} value={nat.value}>
                          {nat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moneda *
                    </label>
                    <select
                      value={formData.moneda}
                      onChange={(e) => handleInputChange('moneda', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {monedas.map(mon => (
                        <option key={mon.value} value={mon.value}>
                          {mon.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.es_hoja}
                      onChange={(e) => handleInputChange('es_hoja', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Es cuenta hoja (no tiene subcuentas)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.acepta_movimiento}
                      onChange={(e) => handleInputChange('acepta_movimiento', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Acepta movimientos contables
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.activa}
                      onChange={(e) => handleInputChange('activa', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Cuenta activa
                    </label>
                  </div>
                </div>

                {/* Error general */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  modo === 'crear' ? 'Crear Cuenta' : 'Guardar Cambios'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CuentaModal;
