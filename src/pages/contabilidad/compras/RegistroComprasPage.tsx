import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../../components/MainLayout';
import useEmpresaActual from '../../../hooks/useEmpresaActual';
import ComprasFormModal from '../../../components/contabilidad/compras/ComprasFormModal';
import { comprasApi } from '../../../services/comprasApi';
import type { 
  RegistroCompraResponse, 
  ComprasFilters, 
  ComprasStats 
} from '../../../services/comprasApi';

const RegistroComprasPage: React.FC = () => {
  const [compras, setCompras] = useState<RegistroCompraResponse[]>([]);
  const [filters, setFilters] = useState<ComprasFilters>({});
  const [stats, setStats] = useState<ComprasStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Obtener empresa actual
  const { empresa } = useEmpresaActual();

  // Estados para la interfaz
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompras, setSelectedCompras] = useState<string[]>([]);
  
  // Estados para el modal de formulario
  const [showModal, setShowModal] = useState(false);
  const [editingCompra, setEditingCompra] = useState<RegistroCompraResponse | null>(null);

  useEffect(() => {
    if (empresa?.id) {
      // Configurar filtro de empresa automáticamente
      const empresaFilters = { ...filters, empresa_id: empresa.id };
      setFilters(empresaFilters);
      loadCompras(empresaFilters);
      loadStats(empresaFilters);
    }
  }, [empresa]);

  useEffect(() => {
    if (empresa?.id && Object.keys(filters).length > 0) {
      loadCompras();
      loadStats();
    }
  }, [filters]);

  const loadCompras = async (customFilters?: ComprasFilters) => {
    try {
      setLoading(true);
      if (!empresa?.id) {
        setError('No se ha seleccionado una empresa');
        return;
      }
      
      const activeFilters = customFilters || filters;
      console.log('🔍 FRONTEND DEBUG: Cargando compras con filtros:', {
        empresaId: empresa.id,
        activeFilters
      });
      
      // Usar el endpoint por empresa que retorna datos paginados
      const data = await comprasApi.getByEmpresa(empresa.id, activeFilters);
      console.log('✅ FRONTEND DEBUG: Datos recibidos:', data);
      setCompras(data);
      setError(null);
    } catch (err) {
      console.error('❌ FRONTEND DEBUG: Error al cargar compras:', err);
      setError('Error al cargar las compras');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (customFilters?: ComprasFilters) => {
    try {
      if (!empresa?.id) return;
      
      const activeFilters = customFilters || filters;
      // Usar el período actual o el del filtro
      const periodo = activeFilters.periodo || new Date().toISOString().substring(0, 7).replace('-', '');
      
      // Usar el método legacy que convierte al formato esperado
      const statsData = await comprasApi.getResumenLegacy({
        empresa_id: empresa.id,
        periodo: periodo
      });
      
      setStats(statsData);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const handleFilterChange = (newFilters: ComprasFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleExportExcel = async () => {
    if (!empresa?.id) {
      setError('No se ha seleccionado una empresa');
      return;
    }

    try {
      const blob = await comprasApi.exportExcel({
        empresa_id: empresa.id,
        periodo: filters.periodo || new Date().toISOString().substring(0, 7).replace('-', ''),
        formato: 'excel'
      });
      
      await comprasApi.downloadFile(
        blob, 
        `registro_compras_${empresa.ruc}_${new Date().toISOString().substring(0, 10)}.xlsx`
      );
    } catch (err) {
      setError('Error al exportar a Excel');
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  // Funciones para el modal de formulario
  const handleNewCompra = () => {
    setEditingCompra(null);
    setShowModal(true);
  };

  const handleEditCompra = (compra: RegistroCompraResponse) => {
    setEditingCompra(compra);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompra(null);
  };

  const handleModalSuccess = () => {
    // Recargar datos después de crear/editar
    if (empresa?.id) {
      loadCompras();
      loadStats();
    }
  };

  const handleDeleteCompra = async (compraId: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      return;
    }

    try {
      await comprasApi.delete(compraId);
      // Recargar datos después de eliminar
      if (empresa?.id) {
        loadCompras();
        loadStats();
      }
    } catch (error: any) {
      setError('Error al eliminar el registro');
      console.error(error);
    }
  };

  return (
    <MainLayout 
      title="🛒 Registro de Compras" 
      subtitle="Registro de facturas y documentos de compras según PLE 080000"
    >
      <div style={{ padding: '1.5rem' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: '1.5rem' }}>
          <Link 
            to="/contabilidad" 
            style={{ 
              color: '#6b7280', 
              textDecoration: 'none', 
              fontSize: '0.875rem' 
            }}
          >
            Contabilidad
          </Link>
          <span style={{ margin: '0 0.5rem', color: '#6b7280' }}>/</span>
          <span style={{ color: '#111827', fontSize: '0.875rem', fontWeight: '600' }}>
            Registro de Compras
          </span>
        </nav>

        {/* Estadísticas rápidas */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Registros</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                {stats.total_registros.toLocaleString()}
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Base Imponible</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                {formatCurrency(stats.suma_base_imponible)}
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>IGV Total</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                {formatCurrency(stats.suma_igv)}
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Compras</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                {formatCurrency(stats.suma_importe_total)}
              </div>
            </div>
          </div>
        )}

        {/* Barra de herramientas */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          background: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                background: showFilters ? '#f3f4f6' : 'white',
                color: '#374151',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              🔍 Filtros
            </button>
            
            <button
              onClick={handleExportExcel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: '1px solid #059669',
                borderRadius: '0.375rem',
                background: '#059669',
                color: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              📊 Exportar Excel
            </button>
          </div>

          <button
            onClick={handleNewCompra}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              background: '#ea580c',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ➕ Nueva Compra
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={filters.fecha_inicio || ''}
                  onChange={(e) => handleFilterChange({ fecha_inicio: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={filters.fecha_fin || ''}
                  onChange={(e) => handleFilterChange({ fecha_fin: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  RUC/DNI Proveedor
                </label>
                <input
                  type="text"
                  placeholder="20123456789"
                  value={filters.numero_documento_proveedor || ''}
                  onChange={(e) => handleFilterChange({ numero_documento_proveedor: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Razón Social Proveedor
                </label>
                <input
                  type="text"
                  placeholder="Nombre del proveedor"
                  value={filters.razon_social_proveedor || ''}
                  onChange={(e) => handleFilterChange({ razon_social_proveedor: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Tipo Comprobante
                </label>
                <select
                  value={filters.tipo_comprobante || ''}
                  onChange={(e) => handleFilterChange({ tipo_comprobante: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">Todos</option>
                  <option value="01">01 - Factura</option>
                  <option value="03">03 - Boleta</option>
                  <option value="07">07 - Nota Crédito</option>
                  <option value="08">08 - Nota Débito</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setFilters({})}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  background: 'white',
                  color: '#374151',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Tabla de compras */}
        <div style={{
          background: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              Cargando registros de compras...
            </div>
          ) : error ? (
            <div style={{ 
              padding: '3rem', 
              textAlign: 'center', 
              color: '#dc2626',
              background: '#fef2f2' 
            }}>
              {error}
            </div>
          ) : compras.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              No se encontraron registros de compras
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Fecha
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Comprobante
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Proveedor
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Base Imponible
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      IGV
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Total
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Estado
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map((compra, index) => (
                    <tr key={compra.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {formatDate(compra.fecha_comprobante)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {compra.tipo_comprobante} - {compra.serie_comprobante ? `${compra.serie_comprobante}-` : ''}{compra.numero_comprobante}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{compra.razon_social_proveedor}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                            {compra.numero_documento_proveedor}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right' }}>
                        {formatCurrency(compra.base_imponible_gravada)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right' }}>
                        {formatCurrency(compra.igv)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: '600' }}>
                        {formatCurrency(compra.importe_total)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          background: compra.estado_operacion === '1' ? '#d1fae5' : 
                                     compra.estado_operacion === '2' ? '#fee2e2' : '#fef3c7',
                          color: compra.estado_operacion === '1' ? '#065f46' :
                                compra.estado_operacion === '2' ? '#991b1b' : '#92400e'
                        }}>
                          {compra.estado_operacion === '1' ? 'Registrado' :
                           compra.estado_operacion === '2' ? 'Anulado' : 'Modificado'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEditCompra(compra)}
                            title="Ver detalles"
                            style={{
                              padding: '0.25rem 0.5rem',
                              border: '1px solid #3b82f6',
                              borderRadius: '0.25rem',
                              background: '#3b82f6',
                              color: 'white',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            👁️ Ver
                          </button>
                          <button
                            onClick={() => handleEditCompra(compra)}
                            title="Editar registro"
                            style={{
                              padding: '0.25rem 0.5rem',
                              border: '1px solid #f59e0b',
                              borderRadius: '0.25rem',
                              background: '#f59e0b',
                              color: 'white',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDeleteCompra(compra.id)}
                            title="Eliminar registro"
                            style={{
                              padding: '0.25rem 0.5rem',
                              border: '1px solid #ef4444',
                              borderRadius: '0.25rem',
                              background: '#ef4444',
                              color: 'white',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulario */}
      {empresa?.id && (
        <ComprasFormModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
          editingCompra={editingCompra}
          empresaId={empresa.id}
        />
      )}
    </MainLayout>
  );
};

export default RegistroComprasPage;
