import React, { useState, useMemo } from 'react';
import type { AsientoContable, DetalleAsiento } from '../../../types/libroDiario';
import FormularioAsiento from './FormularioAsiento';
import EstadisticasAsientos from './EstadisticasAsientos';

export type EstadoAsiento = 'borrador' | 'confirmado' | 'anulado';
export type OrdenColumna = 'fecha' | 'numero' | 'descripcion' | 'debe' | 'haber';
export type DireccionOrden = 'asc' | 'desc';

interface AsientosManagerProps {
  libroId: string;
  asientos: AsientoContable[];
  onCrearAsiento?: (asiento: Omit<AsientoContable, 'id'>) => Promise<void>;
  onEditarAsiento?: (id: string, asiento: Partial<AsientoContable>) => Promise<void>;
  onEliminarAsiento?: (id: string) => Promise<void>;
  onExportarExcel?: () => Promise<void>;
  onExportarPDF?: () => Promise<void>;
  isLoading?: boolean;
}

const AsientosManager: React.FC<AsientosManagerProps> = ({
  libroId,
  asientos,
  onCrearAsiento,
  onEditarAsiento,
  onEliminarAsiento,
  onExportarExcel,
  onExportarPDF,
  isLoading = false
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [asientoEditando, setAsientoEditando] = useState<AsientoContable | null>(null);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoAsiento | ''>('');
  const [filtroCuenta, setFiltroCuenta] = useState('');
  const [orden, setOrden] = useState<{ columna: OrdenColumna; direccion: DireccionOrden }>({
    columna: 'fecha',
    direccion: 'desc'
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Filtrar y ordenar asientos con useMemo para optimización
  const asientosFiltrados = useMemo(() => {
    let resultado = asientos.filter(asiento => {
      const cumpleFecha = !filtroFecha || asiento.fecha >= filtroFecha;
      const cumpleFechaHasta = !filtroFechaHasta || asiento.fecha <= filtroFechaHasta;
      const cumpleDescripcion = !filtroDescripcion || 
        asiento.descripcion.toLowerCase().includes(filtroDescripcion.toLowerCase());
      const cumpleEstado = !filtroEstado || asiento.estado === filtroEstado;
      const cumpleCuenta = !filtroCuenta || 
        asiento.detalles.some(detalle => 
          detalle.codigoCuenta.includes(filtroCuenta) ||
          detalle.denominacionCuenta.toLowerCase().includes(filtroCuenta.toLowerCase())
        );
      
      return cumpleFecha && cumpleFechaHasta && cumpleDescripcion && cumpleEstado && cumpleCuenta;
    });

    // Ordenamiento
    resultado.sort((a, b) => {
      let valorA: string | number = '';
      let valorB: string | number = '';

      switch (orden.columna) {
        case 'fecha':
          valorA = a.fecha;
          valorB = b.fecha;
          break;
        case 'numero':
          valorA = a.numero;
          valorB = b.numero;
          break;
        case 'descripcion':
          valorA = a.descripcion.toLowerCase();
          valorB = b.descripcion.toLowerCase();
          break;
        case 'debe':
          valorA = a.detalles.reduce((sum, d) => sum + (d.debe || 0), 0);
          valorB = b.detalles.reduce((sum, d) => sum + (d.debe || 0), 0);
          break;
        case 'haber':
          valorA = a.detalles.reduce((sum, d) => sum + (d.haber || 0), 0);
          valorB = b.detalles.reduce((sum, d) => sum + (d.haber || 0), 0);
          break;
      }

      if (valorA < valorB) return orden.direccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return orden.direccion === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [asientos, filtroFecha, filtroFechaHasta, filtroDescripcion, filtroEstado, filtroCuenta, orden]);

  // Paginación
  const totalPaginas = Math.ceil(asientosFiltrados.length / itemsPorPagina);
  const asientosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return asientosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [asientosFiltrados, paginaActual, itemsPorPagina]);

  const handleCrearAsiento = () => {
    setAsientoEditando(null);
    setMostrarFormulario(true);
  };

  const handleEditarAsiento = (asiento: AsientoContable) => {
    setAsientoEditando(asiento);
    setMostrarFormulario(true);
  };

  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
    setAsientoEditando(null);
  };

  const calcularTotales = () => {
    return asientosFiltrados.reduce((acc, asiento) => {
      asiento.detalles.forEach((detalle: DetalleAsiento) => {
        acc.totalDebe += detalle.debe || 0;
        acc.totalHaber += detalle.haber || 0;
      });
      return acc;
    }, { totalDebe: 0, totalHaber: 0 });
  };

  const totales = calcularTotales();
  const isBalanceado = Math.abs(totales.totalDebe - totales.totalHaber) < 0.01;

  const handleOrdenar = (columna: OrdenColumna) => {
    setOrden(prev => ({
      columna,
      direccion: prev.columna === columna && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExportar = async (tipo: 'excel' | 'pdf') => {
    try {
      if (tipo === 'excel' && onExportarExcel) {
        await onExportarExcel();
      } else if (tipo === 'pdf' && onExportarPDF) {
        await onExportarPDF();
      }
    } catch (error) {
      console.error(`Error al exportar a ${tipo}:`, error);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px' }}>
      {/* Header con filtros y acciones */}
      <div style={{
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <div>
            <h3 style={{ 
              margin: '0 0 8px 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📝</span>
              Gestión de Asientos Contables
            </h3>
            <p style={{ 
              margin: '0',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              {asientosFiltrados.length} asiento(s) encontrado(s)
            </p>
          </div>

          <button
            onClick={handleCrearAsiento}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
            }}
          >
            <span>➕</span>
            Crear Asiento
          </button>
        </div>

        {/* Estadísticas */}
        {asientos.length > 0 && (
          <EstadisticasAsientos 
            asientos={asientos}
            periodo={new Date().getFullYear().toString()}
          />
        )}

        {/* Filtros */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px' 
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '6px'
            }}>
              📅 Fecha desde:
            </label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '6px'
            }}>
              📅 Fecha hasta:
            </label>
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={(e) => setFiltroFechaHasta(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '6px'
            }}>
              🔍 Buscar descripción:
            </label>
            <input
              type="text"
              placeholder="Buscar en descripciones..."
              value={filtroDescripcion}
              onChange={(e) => setFiltroDescripcion(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '6px'
            }}>
              🏷️ Estado:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoAsiento | '')}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                background: 'white',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="">Todos los estados</option>
              <option value="borrador">📝 Borrador</option>
              <option value="confirmado">✅ Confirmado</option>
              <option value="anulado">❌ Anulado</option>
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '6px'
            }}>
              💼 Buscar cuenta:
            </label>
            <input
              type="text"
              placeholder="Código o nombre de cuenta..."
              value={filtroCuenta}
              onChange={(e) => setFiltroCuenta(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Botones de acción y exportación */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setFiltroFecha('');
                setFiltroFechaHasta('');
                setFiltroDescripcion('');
                setFiltroEstado('');
                setFiltroCuenta('');
                setPaginaActual(1);
              }}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              🔄 Limpiar Filtros
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onExportarExcel && (
              <button
                onClick={() => handleExportar('excel')}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  opacity: isLoading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📊 Exportar Excel
              </button>
            )}
            
            {onExportarPDF && (
              <button
                onClick={() => handleExportar('pdf')}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  opacity: isLoading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📄 Exportar PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resumen de totales */}
      <div style={{
        background: isBalanceado 
          ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
          : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        border: `2px solid ${isBalanceado ? '#16a34a' : '#dc2626'}`
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '16px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#059669',
              marginBottom: '4px'
            }}>
              S/ {totales.totalDebe.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#065f46' }}>Total Debe</div>
          </div>
          
          <div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#dc2626',
              marginBottom: '4px'
            }}>
              S/ {totales.totalHaber.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#991b1b' }}>Total Haber</div>
          </div>
          
          <div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: isBalanceado ? '#16a34a' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              {isBalanceado ? '✅' : '⚠️'}
              {isBalanceado ? 'Balanceado' : 'Desbalanceado'}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: isBalanceado ? '#15803d' : '#991b1b'
            }}>
              Estado
            </div>
          </div>
        </div>
      </div>

      {/* Barra de ordenamiento */}
      {asientosFiltrados.length > 0 && !isLoading && (
        <div style={{
          background: '#f9fafb',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#374151' 
          }}>
            📊 Ordenar por:
          </span>
          
          {(['fecha', 'numero', 'descripcion', 'debe', 'haber'] as OrdenColumna[]).map((columna) => (
            <button
              key={columna}
              onClick={() => handleOrdenar(columna)}
              style={{
                background: orden.columna === columna ? '#3b82f6' : 'white',
                color: orden.columna === columna ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              {columna === 'fecha' && '📅'}
              {columna === 'numero' && '🔢'}
              {columna === 'descripcion' && '📝'}
              {columna === 'debe' && '💰'}
              {columna === 'haber' && '💵'}
              {columna.charAt(0).toUpperCase() + columna.slice(1)}
              {orden.columna === columna && (
                <span style={{ fontSize: '10px' }}>
                  {orden.direccion === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lista de asientos */}
      {isLoading ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>
            Cargando asientos...
          </h3>
          <p style={{ margin: '0', fontSize: '14px' }}>
            Por favor espera mientras se cargan los datos
          </p>
        </div>
      ) : asientosFiltrados.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '2px dashed #d1d5db'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>
            No hay asientos contables
          </h3>
          <p style={{ margin: '0', fontSize: '14px' }}>
            {asientos.length === 0 
              ? 'Comienza creando tu primer asiento contable'
              : 'No se encontraron asientos con los filtros aplicados'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Lista de asientos paginados */}
          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            {asientosPaginados.map((asiento) => (
              <AsientoCard
                key={asiento.id}
                asiento={asiento}
                onEditar={() => handleEditarAsiento(asiento)}
                onEliminar={onEliminarAsiento ? () => onEliminarAsiento(asiento.id) : undefined}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginTop: '24px',
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                disabled={paginaActual === 1}
                style={{
                  background: paginaActual === 1 ? '#e5e7eb' : '#3b82f6',
                  color: paginaActual === 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ◀ Anterior
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {Array.from({ length: Math.min(5, totalPaginas) }, () => {
                  let numerosPagina = [];
                  if (totalPaginas <= 5) {
                    numerosPagina = Array.from({ length: totalPaginas }, (_, j) => j + 1);
                  } else {
                    const inicio = Math.max(1, paginaActual - 2);
                    const fin = Math.min(totalPaginas, inicio + 4);
                    numerosPagina = Array.from({ length: fin - inicio + 1 }, (_, j) => inicio + j);
                  }
                  
                  return numerosPagina.map(num => (
                    <button
                      key={num}
                      onClick={() => setPaginaActual(num)}
                      style={{
                        background: paginaActual === num ? '#3b82f6' : 'white',
                        color: paginaActual === num ? 'white' : '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: paginaActual === num ? '600' : '500',
                        minWidth: '40px'
                      }}
                    >
                      {num}
                    </button>
                  ));
                })}
              </div>

              <button
                onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                disabled={paginaActual === totalPaginas}
                style={{
                  background: paginaActual === totalPaginas ? '#e5e7eb' : '#3b82f6',
                  color: paginaActual === totalPaginas ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Siguiente ▶
              </button>

              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                marginLeft: '16px'
              }}>
                Página {paginaActual} de {totalPaginas} ({asientosFiltrados.length} asientos)
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <FormularioAsiento
          libroId={libroId}
          asientoEditando={asientoEditando}
          onGuardar={async (datos) => {
            if (asientoEditando && onEditarAsiento) {
              await onEditarAsiento(asientoEditando.id, datos);
            } else if (onCrearAsiento) {
              await onCrearAsiento(datos);
            }
            handleCerrarFormulario();
          }}
          onCerrar={handleCerrarFormulario}
        />
      )}
    </div>
  );
};

// Componente para mostrar cada asiento
interface AsientoCardProps {
  asiento: AsientoContable;
  onEditar: () => void;
  onEliminar?: () => void;
}

const AsientoCard: React.FC<AsientoCardProps> = ({ asiento, onEditar, onEliminar }) => {
  const [expandido, setExpandido] = useState(false);

  const totales = asiento.detalles.reduce((acc: { debe: number; haber: number }, detalle: DetalleAsiento) => {
    acc.debe += detalle.debe || 0;
    acc.haber += detalle.haber || 0;
    return acc;
  }, { debe: 0, haber: 0 });

  const isBalanceado = Math.abs(totales.debe - totales.haber) < 0.01;
  
  const getEstadoInfo = (estado?: string) => {
    switch (estado) {
      case 'confirmado':
        return { emoji: '✅', texto: 'Confirmado', color: '#166534', bg: '#dcfce7' };
      case 'anulado':
        return { emoji: '❌', texto: 'Anulado', color: '#dc2626', bg: '#fee2e2' };
      default:
        return { emoji: '📝', texto: 'Borrador', color: '#f59e0b', bg: '#fef3c7' };
    }
  };

  const estadoInfo = getEstadoInfo(asiento.estado);

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      background: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease'
    }}>
      {/* Header del asiento */}
      <div 
        style={{
          padding: '16px',
          borderBottom: '1px solid #f3f4f6',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => setExpandido(!expandido)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#111827'
            }}>
              {asiento.numero}
            </span>
            <span style={{ 
              fontSize: '14px', 
              color: '#6b7280'
            }}>
              📅 {asiento.fecha}
            </span>
            <span style={{ 
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: estadoInfo.bg,
              color: estadoInfo.color
            }}>
              {estadoInfo.emoji} {estadoInfo.texto}
            </span>
            <span style={{ 
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: isBalanceado ? '#dcfce7' : '#fee2e2',
              color: isBalanceado ? '#166534' : '#dc2626'
            }}>
              {isBalanceado ? '✅ Balanceado' : '⚠️ Desbalanceado'}
            </span>
          </div>
          <p style={{ 
            margin: '0',
            color: '#374151',
            fontSize: '14px'
          }}>
            {asiento.descripcion}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right', marginRight: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
              D: S/ {totales.debe.toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>
              H: S/ {totales.haber.toFixed(2)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditar();
              }}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✏️ Editar
            </button>
            {onEliminar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('¿Estás seguro de eliminar este asiento?')) {
                    onEliminar();
                  }
                }}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🗑️ Eliminar
              </button>
            )}
          </div>

          <span style={{ 
            fontSize: '18px',
            color: '#6b7280',
            transition: 'transform 0.2s ease',
            transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* Detalles expandidos */}
      {expandido && (
        <div style={{ padding: '16px' }}>
          <h4 style={{ 
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            Detalles del Asiento:
          </h4>
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Cuenta
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Denominación
                  </th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>
                    Debe
                  </th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>
                    Haber
                  </th>
                </tr>
              </thead>
              <tbody>
                {asiento.detalles.map((detalle: DetalleAsiento, index: number) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                      {detalle.codigoCuenta}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                      {detalle.denominacionCuenta}
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      textAlign: 'right', 
                      borderBottom: '1px solid #f3f4f6',
                      color: detalle.debe ? '#059669' : '#9ca3af'
                    }}>
                      {detalle.debe ? `S/ ${detalle.debe.toFixed(2)}` : '-'}
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      textAlign: 'right', 
                      borderBottom: '1px solid #f3f4f6',
                      color: detalle.haber ? '#dc2626' : '#9ca3af'
                    }}>
                      {detalle.haber ? `S/ ${detalle.haber.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsientosManager;
