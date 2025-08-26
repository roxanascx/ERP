import React from 'react';
import type { AsientoContable } from '../../../types/libroDiario';
import ExportacionService from '../../../services/exportacionService';

interface EstadisticasAsientosProps {
  asientos: AsientoContable[];
  periodo?: string;
  className?: string;
}

const EstadisticasAsientos: React.FC<EstadisticasAsientosProps> = ({ 
  asientos, 
  periodo,
  className = '' 
}) => {
  const resumen = ExportacionService.calcularResumenAsientos(asientos);
  const porcentajeBalanceados = asientos.length > 0 
    ? ((resumen.asientosBalanceados / asientos.length) * 100).toFixed(1)
    : '0';

  return (
    <div className={className} style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          color: '#1e293b'
        }}>
          📊 Estadísticas del Libro Diario
        </h3>
        {periodo && (
          <span style={{
            background: '#3b82f6',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {periodo}
          </span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px'
      }}>
        {/* Total de Asientos */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#3b82f6',
            marginBottom: '4px'
          }}>
            {resumen.totalAsientos}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Asientos
          </div>
        </div>

        {/* Total de Líneas */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#8b5cf6',
            marginBottom: '4px'
          }}>
            {resumen.totalLineas}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Líneas
          </div>
        </div>

        {/* Total Debe */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#059669',
            marginBottom: '4px'
          }}>
            S/ {resumen.totalDebe.toFixed(2)}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Total Debe
          </div>
        </div>

        {/* Total Haber */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#dc2626',
            marginBottom: '4px'
          }}>
            S/ {resumen.totalHaber.toFixed(2)}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Total Haber
          </div>
        </div>

        {/* Balanceados */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#16a34a',
            marginBottom: '4px'
          }}>
            {resumen.asientosBalanceados}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            ✅ Balanceados
          </div>
        </div>

        {/* Calidad */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: parseFloat(porcentajeBalanceados) >= 95 ? '#16a34a' : 
                  parseFloat(porcentajeBalanceados) >= 80 ? '#f59e0b' : '#dc2626',
            marginBottom: '4px'
          }}>
            {porcentajeBalanceados}%
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Calidad
          </div>
        </div>
      </div>

      {/* Estados */}
      {Object.keys(resumen.estadisticasPorEstado).length > 0 && (
        <div style={{
          marginTop: '16px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {Object.entries(resumen.estadisticasPorEstado).map(([estado, cantidad]) => (
            <div
              key={estado}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              <span>
                {estado === 'confirmado' ? '✅' : 
                 estado === 'anulado' ? '❌' : '📝'}
              </span>
              <span style={{ color: '#374151' }}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}: {cantidad}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EstadisticasAsientos;
