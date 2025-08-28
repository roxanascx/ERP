import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../../components/MainLayout';
import { ventasApi } from '../../../services/ventasApi';
import type { 
  RegistroVentaResponse, 
  VentasFilters, 
  VentasStats 
} from '../../../types/ventas';

const RegistroVentasPage: React.FC = () => {
  const [ventas, setVentas] = useState<RegistroVentaResponse[]>([]);
  const [filters, setFilters] = useState<VentasFilters>({});
  const [stats, setStats] = useState<VentasStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para la interfaz
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVentas, setSelectedVentas] = useState<string[]>([]);

  useEffect(() => {
    loadVentas();
    loadStats();
  }, [filters]);

  const loadVentas = async () => {
    try {
      setLoading(true);
      const data = await ventasApi.getAll(filters);
      setVentas(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las ventas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const statsData = await ventasApi.getStats(currentMonth);
      setStats(statsData);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const handleFilterChange = (newFilters: VentasFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleExportExcel = async () => {
    try {
      const blob = await ventasApi.exportExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registro_ventas_${new Date().toISOString().substring(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al exportar a Excel');
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

  return (
    <MainLayout 
      title="💰 Registro de Ventas" 
      subtitle="Registro de comprobantes de venta según PLE 140000"
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
            Registro de Ventas
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
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Ventas</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                {formatCurrency(stats.total_monto)}
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
                {formatCurrency(stats.total_igv)}
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Clientes</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                {stats.clientes_unicos}
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
                border: '1px solid #16a34a',
                borderRadius: '0.375rem',
                background: '#16a34a',
                color: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              📊 Exportar Excel
            </button>
          </div>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              background: '#16a34a',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ➕ Nueva Venta
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
                  Documento Cliente
                </label>
                <input
                  type="text"
                  placeholder="DNI o RUC"
                  value={filters.cliente_documento || ''}
                  onChange={(e) => handleFilterChange({ cliente_documento: e.target.value })}
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

        {/* Tabla de ventas */}
        <div style={{
          background: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              Cargando registros de ventas...
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
          ) : ventas.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              No se encontraron registros de ventas
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
                      Cliente
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
                  {ventas.map((venta, index) => (
                    <tr key={venta.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {formatDate(venta.fecha_emision)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {venta.tipo_comprobante} - {venta.serie_comprobante}-{venta.numero_comprobante}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{venta.apellidos_nombres_cliente}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                            {venta.numero_documento_cliente}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right' }}>
                        {formatCurrency(venta.base_imponible_gravada)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right' }}>
                        {formatCurrency(venta.igv_ipm)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: '600' }}>
                        {formatCurrency(venta.importe_total)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          background: venta.estado_operacion === '1' ? '#d1fae5' : 
                                     venta.estado_operacion === '2' ? '#fee2e2' : '#fef3c7',
                          color: venta.estado_operacion === '1' ? '#065f46' :
                                venta.estado_operacion === '2' ? '#991b1b' : '#92400e'
                        }}>
                          {venta.estado_operacion === '1' ? 'Registrado' :
                           venta.estado_operacion === '2' ? 'Anulado' : 'Modificado'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            style={{
                              padding: '0.25rem 0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.25rem',
                              background: 'white',
                              color: '#374151',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Ver
                          </button>
                          <button
                            style={{
                              padding: '0.25rem 0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.25rem',
                              background: 'white',
                              color: '#374151',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Editar
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
    </MainLayout>
  );
};

export default RegistroVentasPage;
