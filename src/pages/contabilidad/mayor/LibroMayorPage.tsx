import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../../components/MainLayout';
import { mayorApi } from '../../../services/mayorApi';
import type { 
  MayorMovimiento, 
  MayorFilters, 
  MayorSummary,
  CuentaContable 
} from '../../../types/mayor';

const LibroMayorPage: React.FC = () => {
  const [movimientos, setMovimientos] = useState<MayorMovimiento[]>([]);
  const [summary, setSummary] = useState<MayorSummary | null>(null);
  const [filters, setFilters] = useState<MayorFilters>({});
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para la interfaz
  const [showFilters, setShowFilters] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  useEffect(() => {
    loadCuentas();
  }, []);

  useEffect(() => {
    if (filters.cuenta_codigo || filters.fecha_inicio) {
      loadMovimientos();
      loadSummary();
    }
  }, [filters]);

  const loadCuentas = async () => {
    try {
      const data = await mayorApi.getCuentasDisponibles();
      setCuentas(data);
    } catch (err) {
      console.error('Error al cargar cuentas:', err);
    }
  };

  const loadMovimientos = async () => {
    try {
      setLoading(true);
      const data = await mayorApi.getMovimientos(filters);
      setMovimientos(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar movimientos del Libro Mayor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await mayorApi.getSummary(filters);
      setSummary(data);
    } catch (err) {
      console.error('Error al cargar resumen:', err);
    }
  };

  const handleFilterChange = (newFilters: MayorFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleExportExcel = async () => {
    try {
      const blob = await mayorApi.exportExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `libro_mayor_${filters.cuenta_codigo || 'todas'}_${new Date().toISOString().substring(0, 10)}.xlsx`;
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
      title="📊 Libro Mayor" 
      subtitle="Movimientos por cuenta contable y saldos acumulados"
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
            Libro Mayor
          </span>
        </nav>

        {/* Resumen de cuenta seleccionada */}
        {summary && (
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '1rem'
            }}>
              {summary.cuenta_codigo} - {summary.cuenta_nombre}
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Saldo Inicial</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                  {formatCurrency(summary.saldo_inicial)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Debe</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#dc2626' }}>
                  {formatCurrency(summary.total_debe)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Haber</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#059669' }}>
                  {formatCurrency(summary.total_haber)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Saldo Final</div>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  color: summary.saldo_final >= 0 ? '#059669' : '#dc2626'
                }}>
                  {formatCurrency(summary.saldo_final)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Movimientos</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                  {summary.cantidad_movimientos}
                </div>
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
              disabled={!filters.cuenta_codigo}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: '1px solid #2563eb',
                borderRadius: '0.375rem',
                background: filters.cuenta_codigo ? '#2563eb' : '#d1d5db',
                color: 'white',
                fontSize: '0.875rem',
                cursor: filters.cuenta_codigo ? 'pointer' : 'not-allowed'
              }}
            >
              📊 Exportar Excel
            </button>
          </div>
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Cuenta Contable *
                </label>
                <select
                  value={filters.cuenta_codigo || ''}
                  onChange={(e) => handleFilterChange({ cuenta_codigo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">Seleccione una cuenta</option>
                  {cuentas.map((cuenta) => (
                    <option key={cuenta.codigo} value={cuenta.codigo}>
                      {cuenta.codigo} - {cuenta.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
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
                  Incluir Subcuentas
                </label>
                <input
                  type="checkbox"
                  checked={filters.incluir_subcuentas || false}
                  onChange={(e) => handleFilterChange({ incluir_subcuentas: e.target.checked })}
                  style={{
                    marginTop: '0.5rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setFilters({ cuenta_codigo: filters.cuenta_codigo })}
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
                Limpiar Fechas
              </button>
            </div>
          </div>
        )}

        {/* Tabla de movimientos */}
        <div style={{
          background: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {!filters.cuenta_codigo ? (
            <div style={{ 
              padding: '3rem', 
              textAlign: 'center', 
              color: '#6b7280' 
            }}>
              Seleccione una cuenta contable para ver los movimientos
            </div>
          ) : loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              Cargando movimientos del Libro Mayor...
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
          ) : movimientos.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              No se encontraron movimientos para los filtros seleccionados
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
                      Asiento
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Glosa
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Tercero
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Debe
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Haber
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Saldo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((movimiento, index) => (
                    <tr key={movimiento.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {formatDate(movimiento.fecha)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: '500' }}>
                          {movimiento.numero_asiento}
                        </div>
                        {movimiento.documento_tipo && (
                          <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                            {movimiento.documento_tipo} {movimiento.documento_numero}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {movimiento.glosa}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {movimiento.tercero_nombre && (
                          <div>
                            <div style={{ fontWeight: '500' }}>{movimiento.tercero_nombre}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                              {movimiento.tercero_documento}
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        fontSize: '0.875rem', 
                        textAlign: 'right',
                        color: movimiento.debe > 0 ? '#dc2626' : '#6b7280'
                      }}>
                        {movimiento.debe > 0 ? formatCurrency(movimiento.debe) : '-'}
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        fontSize: '0.875rem', 
                        textAlign: 'right',
                        color: movimiento.haber > 0 ? '#059669' : '#6b7280'
                      }}>
                        {movimiento.haber > 0 ? formatCurrency(movimiento.haber) : '-'}
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        fontSize: '0.875rem', 
                        textAlign: 'right',
                        fontWeight: '600',
                        color: movimiento.saldo_acumulado >= 0 ? '#059669' : '#dc2626'
                      }}>
                        {formatCurrency(movimiento.saldo_acumulado)}
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

export default LibroMayorPage;
