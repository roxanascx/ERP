import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import useEmpresaActual from '../../hooks/useEmpresaActual';
import type { LibroContableConfig } from '../../types/contabilidad';

const ContabilidadPage: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('plan-contable');
  const location = useLocation();
  const { empresa } = useEmpresaActual();
  
  // Verificar si estamos en una subruta
  const isSubRoute = location.pathname !== '/contabilidad';

  // Configuración de libros contables disponibles
  const librosContables: LibroContableConfig[] = [
    {
      modulo: 'plan-contable',
      titulo: 'Plan Contable',
      descripcion: 'Catálogo general de cuentas contables según normativa peruana',
      icono: '📋',
      color: '#059669',
      ruta: '/contabilidad/plan-contable',
      implementado: true
    },
    {
      modulo: 'libro-diario',
      titulo: 'Libro Diario',
      descripcion: 'Registro cronológico de todas las operaciones contables',
      icono: '📖',
      color: '#dc2626',
      ruta: `/contabilidad/libro-diario/${empresa?.ruc || 'empresa_demo'}`,
      implementado: true
    },
      {
      modulo: 'ple',
      titulo: 'PLE SUNAT',
      descripcion: 'Programa de Libros Electrónicos - Generación y validación conforme SUNAT V3',
      icono: '🏛️',
      color: '#4f46e5',
      ruta: '/contabilidad/ple',
      implementado: true
    },
    {
      modulo: 'libro-mayor',
      titulo: 'Libro Mayor',
      descripcion: 'Movimientos por cuenta contable y saldos acumulados',
      icono: '📊',
      color: '#2563eb',
      ruta: '/contabilidad/libro-mayor',
      implementado: false
    },
    {
      modulo: 'balance-comprobacion',
      titulo: 'Balance de Comprobación',
      descripcion: 'Estado de saldos deudores y acreedores del período',
      icono: '⚖️',
      color: '#7c3aed',
      ruta: '/contabilidad/balance-comprobacion',
      implementado: false
    },
    {
      modulo: 'estados-financieros',
      titulo: 'Estados Financieros',
      descripcion: 'Balance general, estado de resultados y flujo de efectivo',
      icono: '📈',
      color: '#ea580c',
      ruta: '/contabilidad/estados-financieros',
      implementado: false
    },
    {
      modulo: 'activos-fijos',
      titulo: 'Activos Fijos',
      descripcion: 'Gestión de bienes de capital y depreciación',
      icono: '🏢',
      color: '#8b5cf6',
      ruta: '/contabilidad/activos-fijos',
      implementado: false
    }
  ];

  return (
    <MainLayout 
      title="💰 Contabilidad" 
      subtitle="Gestión financiera y libros contables"
    >
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)',
        backgroundSize: '400% 400%',
        animation: 'subtleShift 20s ease infinite'
      }}>
        {/* Mostrar subrutas si existe */}
        {isSubRoute ? (
          <Outlet />
        ) : (
          /* Grid de módulos - mostrar solo en la ruta base */
          <div style={{ padding: '1rem' }}>
            {/* Navigation Tabs compacto */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
              borderRadius: '0.75rem',
              padding: '0 1rem',
              marginBottom: '1rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
            }}>
              <nav style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }} aria-label="Tabs">
                {librosContables.map((libro) => (
                  <Link
                    key={libro.modulo}
                    to={libro.implementado ? libro.ruta : '#'}
                    style={{
                      padding: '0.5rem 0.25rem',
                      borderBottom: activeModule === libro.modulo ? '2px solid #3b82f6' : '2px solid transparent',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      color: activeModule === libro.modulo ? '#3b82f6' : '#6b7280',
                      textDecoration: 'none',
                      opacity: !libro.implementado ? '0.5' : '1',
                      cursor: !libro.implementado ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                    onMouseEnter={(e) => {
                      if (libro.implementado && activeModule !== libro.modulo) {
                        e.currentTarget.style.color = '#374151';
                        e.currentTarget.style.borderBottom = '2px solid #d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (libro.implementado && activeModule !== libro.modulo) {
                        e.currentTarget.style.color = '#6b7280';
                        e.currentTarget.style.borderBottom = '2px solid transparent';
                      }
                    }}
                    onClick={() => libro.implementado && setActiveModule(libro.modulo)}
                  >
                    <span style={{ fontSize: '1rem' }}>{libro.icono}</span>
                    <span>{libro.titulo}</span>
                    {!libro.implementado && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                        color: '#6b7280',
                        border: '1px solid #d1d5db'
                      }}>
                        Próximamente
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Grid de módulos compacto */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem'
            }}>
              {librosContables.map((libro) => (
                <div
                  key={libro.modulo}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.98)',
                    border: `2px solid ${libro.implementado ? libro.color + '40' : '#e5e7eb'}`,
                    boxShadow: libro.implementado 
                      ? `0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px ${libro.color}20`
                      : '0 2px 8px rgba(0, 0, 0, 0.06)',
                    opacity: libro.implementado ? 1 : 0.7,
                    cursor: libro.implementado ? 'pointer' : 'not-allowed'
                  }}
                  onMouseEnter={(e) => {
                    if (libro.implementado) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px ${libro.color}30`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (libro.implementado) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px ${libro.color}20`;
                    }
                  }}
                >
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          fontSize: '2rem',
                          transition: 'transform 0.3s ease',
                          filter: `drop-shadow(0 2px 4px ${libro.color}40)`
                        }}>
                          {libro.icono}
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: '#111827',
                            marginBottom: '0.25rem'
                          }}>
                            {libro.titulo}
                          </h3>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: libro.implementado 
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)'
                              : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                            color: libro.implementado ? '#15803d' : '#6b7280',
                            border: libro.implementado ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid #d1d5db'
                          }}>
                            {libro.implementado ? '✓ Disponible' : '⏳ Pendiente'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.8rem',
                      marginBottom: '1rem',
                      lineHeight: '1.5'
                    }}>
                      {libro.descripcion}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {libro.implementado ? (
                        <Link
                          to={libro.ruta}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.5rem 0.8rem',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            borderRadius: '0.5rem',
                            color: 'white',
                            textDecoration: 'none',
                            background: `linear-gradient(135deg, ${libro.color} 0%, ${libro.color}CC 100%)`,
                            boxShadow: `0 2px 8px ${libro.color}40`,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          Abrir módulo
                          <svg style={{ marginLeft: '0.5rem', marginRight: '-0.125rem', width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.625rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          borderRadius: '0.75rem',
                          color: '#6b7280',
                          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                          border: '1px solid #d1d5db'
                        }}>
                          En desarrollo
                          <svg style={{ marginLeft: '0.5rem', marginRight: '-0.125rem', width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ContabilidadPage;
