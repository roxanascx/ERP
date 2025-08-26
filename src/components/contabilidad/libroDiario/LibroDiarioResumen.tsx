import React from 'react';
import type { ResumenLibroDiario } from '../../../types/libroDiario';
import './LibroDiarioResumen.css';

interface LibroDiarioResumenProps {
  resumen: ResumenLibroDiario;
  onRefresh: () => void;
}

const LibroDiarioResumen: React.FC<LibroDiarioResumenProps> = ({
  resumen,
  onRefresh
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-PE').format(num);
  };

  const calcularBalance = (): number => {
    return resumen.totalDebe - resumen.totalHaber;
  };

  const isBalanceado = (): boolean => {
    return Math.abs(calcularBalance()) < 0.01;
  };

  return (
    <div className="libro-diario-resumen">
      <div className="resumen-header">
        <h3>📊 Resumen del Período</h3>
        <button
          className="btn-refresh"
          onClick={onRefresh}
          title="Actualizar resumen"
        >
          🔄
        </button>
      </div>

      <div className="resumen-grid">
        {/* Total de libros */}
        <div className="resumen-card">
          <div className="card-icon">📚</div>
          <div className="card-content">
            <div className="card-label">Total Libros</div>
            <div className="card-value primary">{formatNumber(resumen.totalLibros)}</div>
          </div>
        </div>

        {/* Total de asientos */}
        <div className="resumen-card">
          <div className="card-icon">📝</div>
          <div className="card-content">
            <div className="card-label">Total Asientos</div>
            <div className="card-value primary">{formatNumber(resumen.totalAsientos)}</div>
          </div>
        </div>

        {/* Total debe */}
        <div className="resumen-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Total Debe</div>
            <div className="card-value debe">{formatCurrency(resumen.totalDebe)}</div>
          </div>
        </div>

        {/* Total haber */}
        <div className="resumen-card">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <div className="card-label">Total Haber</div>
            <div className="card-value haber">{formatCurrency(resumen.totalHaber)}</div>
          </div>
        </div>

        {/* Balance */}
        <div className={`resumen-card balance ${isBalanceado() ? 'balanceado' : 'desbalanceado'}`}>
          <div className="card-icon">{isBalanceado() ? '✅' : '⚠️'}</div>
          <div className="card-content">
            <div className="card-label">Balance</div>
            <div className={`card-value ${isBalanceado() ? 'balanceado' : 'desbalanceado'}`}>
              {formatCurrency(Math.abs(calcularBalance()))}
            </div>
            <div className="balance-status">
              {isBalanceado() ? 'Balanceado' : 'Desbalanceado'}
            </div>
          </div>
        </div>

        {/* Asientos por estado */}
        <div className="resumen-card estados">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <div className="card-label">Estados</div>
            <div className="estados-breakdown">
              <div className="estado-item">
                <span className="estado-label">Borrador:</span>
                <span className="estado-value">{formatNumber(resumen.asientosPorEstado.borrador || 0)}</span>
              </div>
              <div className="estado-item">
                <span className="estado-label">Finalizado:</span>
                <span className="estado-value">{formatNumber(resumen.asientosPorEstado.finalizado || 0)}</span>
              </div>
              <div className="estado-item">
                <span className="estado-label">Enviado:</span>
                <span className="estado-value">{formatNumber(resumen.asientosPorEstado.enviado || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="resumen-footer">
        <div className="info-item">
          <span className="info-label">Último libro:</span>
          <span className="info-value">
            {resumen.ultimoLibro ? resumen.ultimoLibro.descripcion : 'N/A'}
          </span>
        </div>
        
        {resumen.ultimoLibro && (
          <div className="info-item">
            <span className="info-label">Fecha:</span>
            <span className="info-value">
              {new Date(resumen.ultimoLibro.fechaCreacion).toLocaleDateString('es-PE')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibroDiarioResumen;
