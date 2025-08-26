import React, { useState } from 'react';

interface NuevoLibroData {
  descripcion: string;
  periodo: string;
  estado: 'borrador' | 'finalizado' | 'enviado';
}

interface CrearLibroModalProps {
  onGuardar: (datos: NuevoLibroData) => Promise<void>;
  onCerrar: () => void;
  loading?: boolean;
}

const CrearLibroModal: React.FC<CrearLibroModalProps> = ({
  onGuardar,
  onCerrar,
  loading = false
}) => {
  const [nuevoLibro, setNuevoLibro] = useState<NuevoLibroData>({
    descripcion: '',
    periodo: new Date().getFullYear().toString(),
    estado: 'borrador'
  });

  const [errores, setErrores] = useState<Partial<NuevoLibroData>>({});
  const [guardando, setGuardando] = useState(false);

  const handleInputChange = (campo: keyof NuevoLibroData, valor: string) => {
    setNuevoLibro(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    // Limpiar error del campo modificado
    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: undefined
      }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Partial<NuevoLibroData> = {};

    if (!nuevoLibro.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es requerida';
    }

    if (!nuevoLibro.periodo.trim()) {
      nuevosErrores.periodo = 'El período es requerido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      await onGuardar(nuevoLibro);
      // El modal se cerrará desde el componente padre
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setGuardando(false);
    }
  };

  const isLoading = loading || guardando;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px 12px 0 0',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ 
                margin: '0 0 8px 0',
                fontSize: '1.5rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '1.5rem' }}>📖</span>
                Crear Nuevo Libro Diario
              </h3>
              <p style={{ 
                margin: '0',
                opacity: 0.9,
                fontSize: '14px'
              }}>
                Complete la información del nuevo libro contable
              </p>
            </div>
            <button 
              onClick={onCerrar}
              disabled={isLoading}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                padding: '8px 12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              📝 Descripción del Libro:
            </label>
            <input
              type="text"
              value={nuevoLibro.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Ej: Libro Diario Enero 2024"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                border: errores.descripcion ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                backgroundColor: isLoading ? '#f9fafb' : 'white'
              }}
            />
            {errores.descripcion && (
              <p style={{ 
                margin: '6px 0 0 0',
                fontSize: '12px',
                color: '#ef4444'
              }}>
                {errores.descripcion}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              📅 Período:
            </label>
            <input
              type="text"
              value={nuevoLibro.periodo}
              onChange={(e) => handleInputChange('periodo', e.target.value)}
              placeholder="Ej: 2024 o 2024-01"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                border: errores.periodo ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                backgroundColor: isLoading ? '#f9fafb' : 'white'
              }}
            />
            {errores.periodo && (
              <p style={{ 
                margin: '6px 0 0 0',
                fontSize: '12px',
                color: '#ef4444'
              }}>
                {errores.periodo}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              🏷️ Estado Inicial:
            </label>
            <select
              value={nuevoLibro.estado}
              onChange={(e) => handleInputChange('estado', e.target.value as NuevoLibroData['estado'])}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                backgroundColor: isLoading ? '#f9fafb' : 'white'
              }}
            >
              <option value="borrador">📝 Borrador</option>
              <option value="finalizado">✅ Finalizado</option>
              <option value="enviado">📤 Enviado</option>
            </select>
          </div>

          {/* Botones */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={onCerrar}
              disabled={isLoading}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: isLoading ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: isLoading ? 'none' : '0 2px 4px rgba(59, 130, 246, 0.3)'
              }}
            >
              {isLoading ? (
                <>
                  <span style={{ 
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Creando...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Crear Libro
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CSS para la animación de loading */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CrearLibroModal;
