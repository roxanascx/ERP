import React, { useState } from 'react';
import { usePlantillasAsiento, type PlantillaAsiento } from '../../../hooks/usePlantillasAsiento';
import type { DetalleAsiento } from '../../../types/libroDiario';

interface SelectorPlantillasProps {
  onSeleccionarPlantilla: (detalles: DetalleAsiento[], descripcion: string) => void;
  onCerrar: () => void;
}

const SelectorPlantillas: React.FC<SelectorPlantillasProps> = ({
  onSeleccionarPlantilla,
  onCerrar
}) => {
  const { 
    plantillas, 
    categorias, 
    obtenerPlantillasPorCategoria 
  } = usePlantillasAsiento();
  
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const plantillasFiltradas = React.useMemo(() => {
    let resultado = categoriaSeleccionada 
      ? obtenerPlantillasPorCategoria(categoriaSeleccionada)
      : plantillas;

    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase().trim();
      resultado = resultado.filter(plantilla => 
        plantilla.nombre.toLowerCase().includes(termino) ||
        plantilla.descripcion.toLowerCase().includes(termino)
      );
    }

    return resultado;
  }, [categoriaSeleccionada, searchTerm, plantillas, obtenerPlantillasPorCategoria]);

  const handleSeleccionar = (plantilla: PlantillaAsiento) => {
    // ✅ CORREGIDO: Solo usar códigos de cuenta, descripción se resuelve dinámicamente
    const detallesLimpios = plantilla.detalles.map(detalle => ({
      codigoCuenta: detalle.codigoCuenta,
      denominacionCuenta: '', // Vacío para forzar búsqueda dinámica
      debe: 0,
      haber: 0
    }));
    
    onSeleccionarPlantilla(detallesLimpios, plantilla.descripcion);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '1.5rem', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '24px' }}>📋</span>
                Plantillas de Asientos
              </h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                Selecciona una plantilla predefinida para agilizar la creación del asiento
              </p>
            </div>
            
            <button
              onClick={onCerrar}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '8px',
                borderRadius: '50%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
          {/* Barra de búsqueda */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar plantillas..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Filtros por categoría */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCategoriaSeleccionada('')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                background: !categoriaSeleccionada 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                  : '#f3f4f6',
                color: !categoriaSeleccionada ? 'white' : '#6b7280',
                transition: 'all 0.2s'
              }}
            >
              📄 Todas
            </button>
            
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                onClick={() => setCategoriaSeleccionada(categoria.id)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: categoriaSeleccionada === categoria.id 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                    : '#f3f4f6',
                  color: categoriaSeleccionada === categoria.id ? 'white' : '#6b7280',
                  transition: 'all 0.2s'
                }}
              >
                {categoria.icono} {categoria.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de plantillas */}
        <div style={{ 
          padding: '24px', 
          maxHeight: 'calc(80vh - 200px)', 
          overflowY: 'auto' 
        }}>
          {plantillasFiltradas.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.125rem' }}>
                No se encontraron plantillas
              </h4>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Intenta con otros términos de búsqueda o cambia la categoría
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {plantillasFiltradas.map(plantilla => (
                <div
                  key={plantilla.id}
                  onClick={() => handleSeleccionar(plantilla)}
                  style={{
                    padding: '20px',
                    border: '2px solid #f1f5f9',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#f1f5f9';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Header de la plantilla */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      {plantilla.icono}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h5 style={{
                        margin: '0 0 4px 0',
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: '#1f2937'
                      }}>
                        {plantilla.nombre}
                      </h5>
                      <p style={{
                        margin: 0,
                        fontSize: '13px',
                        color: '#6b7280'
                      }}>
                        {plantilla.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Vista previa de cuentas */}
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      Cuentas incluidas ({plantilla.detalles.length}):
                    </div>
                    {plantilla.detalles.slice(0, 3).map((detalle, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px',
                        fontSize: '12px'
                      }}>
                        <span style={{ fontWeight: '600', color: '#374151' }}>
                          {detalle.codigoCuenta}
                        </span>
                        <span style={{ color: '#6b7280', flex: 1, marginLeft: '8px' }}>
                          {detalle.denominacionCuenta}
                        </span>
                      </div>
                    ))}
                    {plantilla.detalles.length > 3 && (
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginTop: '8px'
                      }}>
                        +{plantilla.detalles.length - 3} cuentas más...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            💡 <strong>Tip:</strong> Las plantillas son un punto de partida. Puedes modificar los importes después.
          </div>
          <button
            onClick={onCerrar}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectorPlantillas;
