import React from 'react';
import type { AsientoContable, LibroDiario } from '../../../types/libroDiario';
import FormularioAsiento from './FormularioAsiento';
import EstadisticasAsientos from './EstadisticasAsientos';
import PLEExportManager from './PLEExportManager';
import { useAsientosLogic, type EstadoAsiento } from './AsientosLogic';

interface AsientosManagerProps {
  libroId: string;
  libro?: LibroDiario;
  asientos: AsientoContable[];
  onCrearAsiento?: (asiento: Omit<AsientoContable, 'id'>) => Promise<void>;
  onEditarAsiento?: (id: string, asiento: Partial<AsientoContable>) => Promise<void>;
  onEliminarAsiento?: (id: string) => Promise<void>;
  onExportarExcel?: () => Promise<void>;
  onExportarPDF?: () => Promise<void>;
  isLoading?: boolean;
}

const AsientosManager: React.FC<AsientosManagerProps> = (props) => {
  const {
    libroId,
    libro,
    isLoading = false
  } = props;

  // Usar el hook de lógica
  const logic = useAsientosLogic(props);

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
              {logic.asientosFiltrados.length} asiento(s) encontrado(s)
            </p>
          </div>
          
          <button
            onClick={logic.handleCrearAsiento}
            disabled={isLoading}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: isLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
            }}
          >
            ➕ Crear Asiento
          </button>
        </div>

        {/* Filtros */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              📅 Fecha desde:
            </label>
            <input
              type="date"
              value={logic.filtroFecha}
              onChange={(e) => logic.setFiltroFecha(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              📅 Fecha hasta:
            </label>
            <input
              type="date"
              value={logic.filtroFechaHasta}
              onChange={(e) => logic.setFiltroFechaHasta(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              🔍 Buscar descripción:
            </label>
            <input
              type="text"
              placeholder="Buscar en descripciones..."
              value={logic.filtroDescripcion}
              onChange={(e) => logic.setFiltroDescripcion(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              🏷️ Estado:
            </label>
            <select
              value={logic.filtroEstado}
              onChange={(e) => logic.setFiltroEstado(e.target.value as EstadoAsiento | '')}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            >
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="confirmado">Confirmado</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              💰 Buscar cuenta:
            </label>
            <input
              type="text"
              placeholder="Código o nombre de cuenta..."
              value={logic.filtroCuenta}
              onChange={(e) => logic.setFiltroCuenta(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={logic.limpiarFiltros}
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

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {props.onExportarExcel && (
              <button
                onClick={() => logic.handleExportar('excel')}
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
            
            {props.onExportarPDF && (
              <button
                onClick={() => logic.handleExportar('pdf')}
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
            
            {/* Botón PLE SUNAT */}
            {libro && (
              <button
                onClick={() => {
                  console.log('Clic en PLE SUNAT');
                  logic.setMostrarPLEManager(true);
                }}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
                🇵🇪 PLE SUNAT
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resumen de totales */}
      <div style={{
        background: logic.isBalanceado 
          ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
          : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        border: `2px solid ${logic.isBalanceado ? '#16a34a' : '#dc2626'}`
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '16px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
              S/ {logic.totales.totalDebe.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Debe</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
              S/ {logic.totales.totalHaber.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Haber</div>
          </div>
          <div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: logic.isBalanceado ? '#16a34a' : '#dc2626' 
            }}>
              {logic.isBalanceado ? '✅ Balanceado' : '❌ Desbalanceado'}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Estado</div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <EstadisticasAsientos asientos={logic.asientosFiltrados} />

      {/* Tabla de asientos */}
      <div style={{
        marginTop: '24px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ 
                padding: '12px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                cursor: 'pointer'
              }}
              onClick={() => logic.handleOrdenar('fecha')}>
                📅 Fecha {logic.orden.columna === 'fecha' && (logic.orden.direccion === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                cursor: 'pointer'
              }}
              onClick={() => logic.handleOrdenar('numero')}>
                🔢 Número {logic.orden.columna === 'numero' && (logic.orden.direccion === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                cursor: 'pointer'
              }}
              onClick={() => logic.handleOrdenar('descripcion')}>
                📝 Descripción {logic.orden.columna === 'descripcion' && (logic.orden.direccion === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'right', 
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                cursor: 'pointer'
              }}
              onClick={() => logic.handleOrdenar('debe')}>
                💚 Debe {logic.orden.columna === 'debe' && (logic.orden.direccion === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'right', 
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                cursor: 'pointer'
              }}
              onClick={() => logic.handleOrdenar('haber')}>
                ❤️ Haber {logic.orden.columna === 'haber' && (logic.orden.direccion === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'center', 
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                ⚙️ Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {logic.asientosPaginados.map((asiento) => {
              const totalDebe = asiento.detalles.reduce((sum, d) => sum + (d.debe || 0), 0);
              const totalHaber = asiento.detalles.reduce((sum, d) => sum + (d.haber || 0), 0);
              
              return (
                <tr key={asiento.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {new Date(asiento.fecha).toLocaleDateString('es-PE')}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                    {asiento.numero}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <div style={{ maxWidth: '300px' }}>
                      <div style={{ fontWeight: '500', color: '#111827' }}>
                        {asiento.descripcion}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {asiento.detalles.length} cuenta(s)
                      </div>
                    </div>
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right', 
                    fontSize: '14px',
                    fontWeight: '500',
                    color: totalDebe > 0 ? '#059669' : '#9ca3af'
                  }}>
                    {totalDebe > 0 ? `S/ ${totalDebe.toFixed(2)}` : '-'}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right', 
                    fontSize: '14px',
                    fontWeight: '500',
                    color: totalHaber > 0 ? '#dc2626' : '#9ca3af'
                  }}>
                    {totalHaber > 0 ? `S/ ${totalHaber.toFixed(2)}` : '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        onClick={() => logic.handleEditarAsiento(asiento)}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => logic.handleEliminarAsiento(asiento.id)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {logic.totalPaginas > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '20px'
        }}>
          <button
            onClick={() => logic.cambiarPagina(logic.paginaActual - 1)}
            disabled={logic.paginaActual === 1}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              cursor: logic.paginaActual === 1 ? 'not-allowed' : 'pointer',
              opacity: logic.paginaActual === 1 ? 0.5 : 1
            }}
          >
            ← Anterior
          </button>
          
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            Página {logic.paginaActual} de {logic.totalPaginas}
          </span>
          
          <button
            onClick={() => logic.cambiarPagina(logic.paginaActual + 1)}
            disabled={logic.paginaActual === logic.totalPaginas}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              cursor: logic.paginaActual === logic.totalPaginas ? 'not-allowed' : 'pointer',
              opacity: logic.paginaActual === logic.totalPaginas ? 0.5 : 1
            }}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal Formulario Asiento */}
      {logic.mostrarFormulario && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <FormularioAsiento
              libroId={libroId}
              asientoEditando={logic.asientoEditando}
              onGuardar={async (asiento) => {
                if (logic.asientoEditando && props.onEditarAsiento) {
                  await props.onEditarAsiento(logic.asientoEditando.id, asiento);
                } else if (props.onCrearAsiento) {
                  await props.onCrearAsiento(asiento);
                }
                logic.handleCerrarFormulario();
              }}
              onCerrar={logic.handleCerrarFormulario}
            />
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {logic.toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: logic.toast.type === 'success' ? '#10b981' : logic.toast.type === 'error' ? '#ef4444' : '#3b82f6',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 1001,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {logic.toast.message}
        </div>
      )}

      {/* Modal PLE SUNAT */}
      {logic.mostrarPLEManager && libro && (
        <PLEExportManager
          libro={libro}
          onClose={() => logic.setMostrarPLEManager(false)}
          onSuccess={(mensaje) => logic.showToast(mensaje, 'success')}
          onError={(error) => logic.showToast(error, 'error')}
        />
      )}
    </div>
  );
};

export default AsientosManager;
