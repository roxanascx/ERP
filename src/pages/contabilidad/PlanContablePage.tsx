import React, { useState, useEffect, useRef } from 'react';
import { ContabilidadProvider } from '../../contexts/ContabilidadContext';
import PlanContableTable from '../../components/contabilidad/PlanContableTable';
import EstadisticasCard from '../../components/contabilidad/EstadisticasCard';
import FiltrosContabilidad from '../../components/contabilidad/FiltrosContabilidad';
import ContabilidadApiService from '../../services/contabilidadApi';
import type { CuentaContable, EstadisticasPlanContable } from '../../types/contabilidad';

const PlanContablePage: React.FC = () => {
  return (
    <ContabilidadProvider>
      <PlanContablePageContent />
    </ContabilidadProvider>
  );
};

const PlanContablePageContent: React.FC = () => {
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPlanContable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    clase_contable: undefined as number | undefined,
    nivel: undefined as number | undefined,
    solo_activas: true
  });

  // Referencias para debouncing
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  // Aplicar filtros con debouncing para búsquedas
  useEffect(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si es la carga inicial, cargar inmediatamente
    if (isInitialLoad.current) {
      cargarCuentas();
      isInitialLoad.current = false;
      return;
    }

    // Para búsquedas de texto, aplicar debouncing de 300ms
    if (filtros.busqueda.trim()) {
      timeoutRef.current = setTimeout(() => {
        cargarCuentas();
      }, 300);
    } else {
      // Para otros filtros, aplicar inmediatamente
      cargarCuentas();
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [filtros]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [cuentasData, estadisticasData] = await Promise.all([
        ContabilidadApiService.getCuentas({ activos_solo: filtros.solo_activas }),
        ContabilidadApiService.getEstadisticas()
      ]);
      
      setCuentas(cuentasData);
      setEstadisticas(estadisticasData);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.response?.data?.detail || 'Error cargando datos del plan contable');
    } finally {
      setLoading(false);
    }
  };

  const cargarCuentas = async () => {
    try {
      setError(null);
      
      // Usar una sola llamada con todos los filtros
      const cuentasData = await ContabilidadApiService.getCuentas({
        activos_solo: filtros.solo_activas,
        clase_contable: filtros.clase_contable,
        nivel: filtros.nivel,
        busqueda: filtros.busqueda.trim() || undefined
      });
      
      setCuentas(cuentasData);
    } catch (err: any) {
      console.error('Error cargando cuentas:', err);
      setError(err.response?.data?.detail || 'Error aplicando filtros');
    }
  };

  const handleEliminarCuenta = async (cuenta: CuentaContable) => {
    try {
      await ContabilidadApiService.deleteCuenta(cuenta.codigo);
      setCuentas(prev => prev.map(c =>
        c.codigo === cuenta.codigo ? { ...c, activa: false } : c
      ));
      
      // Recargar estadísticas
      const nuevasEstadisticas = await ContabilidadApiService.getEstadisticas();
      setEstadisticas(nuevasEstadisticas);
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Error eliminando cuenta');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '24rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            marginTop: '1rem',
            color: '#6b7280'
          }}>
            Cargando plan contable...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(254, 242, 242, 1)',
        border: '1px solid rgba(252, 165, 165, 1)',
        borderRadius: '0.375rem',
        padding: '1rem'
      }}>
        <div style={{ display: 'flex' }}>
          <div style={{ marginLeft: '0.75rem' }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#991b1b'
            }}>
              Error
            </h3>
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#b91c1c'
            }}>
              <p>{error}</p>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={cargarDatos}
                style={{
                  background: 'rgba(254, 242, 242, 1)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#991b1b',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(252, 165, 165, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(254, 242, 242, 1)';
                }}
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)',
      backgroundSize: '400% 400%',
      animation: 'subtleShift 20s ease infinite'
    }}>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div style={{
          borderRadius: '1rem',
          padding: '2rem',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                margin: 0,
                background: 'linear-gradient(135deg, #111827 0%, #6b7280 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                📋 Plan Contable
              </h2>
              <p style={{
                marginTop: '0.5rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Gestión del catálogo de cuentas contables • 
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                  color: '#1e40af'
                }}>
                  {cuentas.length} cuentas encontradas
                </span>
              </p>
            </div>
          </div>
          
          {/* Estadísticas */}
          {estadisticas && (
            <EstadisticasCard estadisticas={estadisticas} />
          )}
        </div>

        {/* Filtros y controles */}
        <div style={{
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(10px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.85) 100%)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
        }}>
          <FiltrosContabilidad
            filtros={filtros}
            onFiltrosChange={setFiltros}
            onCrearCuenta={() => {/* Modal será manejado por el componente */}}
            totalCuentas={cuentas.length}
          />
        </div>

        {/* Tabla principal */}
        <div style={{
          borderRadius: '1rem',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        }}>
          <PlanContableTable
            cuentas={cuentas}
            loading={loading}
            onEditarCuenta={(cuenta: CuentaContable) => console.log('Editar cuenta:', cuenta)}
            onEliminarCuenta={handleEliminarCuenta}
            cuentaSeleccionada={undefined}
            onCuentaSelect={(cuenta: CuentaContable) => console.log('Cuenta seleccionada:', cuenta)}
          />
        </div>

        {/* Modal será renderizado por PlanContableTable cuando sea necesario */}
      </div>
      
      {/* Modern CSS Animations */}
      <style>{`
        @keyframes subtleShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default PlanContablePage;
