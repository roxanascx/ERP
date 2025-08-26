import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Cargando...', 
  size = 'medium',
  className = ''
}) => {
  return (
    <div className={`loading-spinner-container ${size} ${className}`}>
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      {message && (
        <div className="loading-message">{message}</div>
      )}
    </div>
  );
};

export default LoadingSpinner;
