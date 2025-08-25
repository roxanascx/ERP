import React from 'react';
import type { EstadisticasPlanContable } from '../../../types/contabilidad';

interface EstadisticasCardProps {
  estadisticas: EstadisticasPlanContable;
}

const EstadisticasCard: React.FC<EstadisticasCardProps> = ({ estadisticas }) => {
  const porcentajeActivas = estadisticas.total_cuentas > 0 
    ? Math.round((estadisticas.cuentas_activas / estadisticas.total_cuentas) * 100)
    : 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    }}>
      {/* Total de cuentas */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        borderRadius: '0.5rem',
        padding: '1rem',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{
              color: 'rgba(219, 234, 254, 1)',
              fontSize: '0.875rem',
              fontWeight: '500',
              margin: 0
            }}>
              Total Cuentas
            </p>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: '0.25rem 0 0 0'
            }}>
              {estadisticas.total_cuentas.toLocaleString()}
            </p>
          </div>
          <div style={{ color: 'rgba(191, 219, 254, 1)' }}>
            <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Cuentas activas */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '0.5rem',
        padding: '1rem',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{
              color: 'rgba(209, 250, 229, 1)',
              fontSize: '0.875rem',
              fontWeight: '500',
              margin: 0
            }}>
              Activas
            </p>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: '0.25rem 0 0 0'
            }}>
              {estadisticas.cuentas_activas.toLocaleString()}
            </p>
            <p style={{
              color: 'rgba(167, 243, 208, 1)',
              fontSize: '0.75rem',
              margin: '0.25rem 0 0 0'
            }}>
              {porcentajeActivas}% del total
            </p>
          </div>
          <div style={{ color: 'rgba(167, 243, 208, 1)' }}>
            <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Cuentas inactivas */}
      <div style={{
        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        borderRadius: '0.5rem',
        padding: '1rem',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{
              color: 'rgba(229, 231, 235, 1)',
              fontSize: '0.875rem',
              fontWeight: '500',
              margin: 0
            }}>
              Inactivas
            </p>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: '0.25rem 0 0 0'
            }}>
              {estadisticas.cuentas_inactivas.toLocaleString()}
            </p>
            <p style={{
              color: 'rgba(209, 213, 219, 1)',
              fontSize: '0.75rem',
              margin: '0.25rem 0 0 0'
            }}>
              {100 - porcentajeActivas}% del total
            </p>
          </div>
          <div style={{ color: 'rgba(209, 213, 219, 1)' }}>
            <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        </div>
      </div>

      {/* Clases contables */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        borderRadius: '0.5rem',
        padding: '1rem',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{
              color: 'rgba(221, 214, 254, 1)',
              fontSize: '0.875rem',
              fontWeight: '500',
              margin: 0
            }}>
              Clases
            </p>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: '0.25rem 0 0 0'
            }}>
              {estadisticas.por_clase.length}
            </p>
            <p style={{
              color: 'rgba(196, 181, 253, 1)',
              fontSize: '0.75rem',
              margin: '0.25rem 0 0 0'
            }}>
              Niveles jerárquicos
            </p>
          </div>
          <div style={{ color: 'rgba(196, 181, 253, 1)' }}>
            <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasCard;
