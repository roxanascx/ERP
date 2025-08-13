import React from 'react';
import { SignOutButton } from '@clerk/clerk-react';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'danger', 
  size = 'medium',
  showIcon = true 
}) => {
  
  const getButtonStyles = () => {
    const baseStyles = {
      border: 'none',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit'
    };

    // Tamaños
    const sizeStyles = {
      small: { padding: '6px 12px', fontSize: '12px' },
      medium: { padding: '8px 16px', fontSize: '14px' },
      large: { padding: '12px 24px', fontSize: '16px' }
    };

    // Variantes de color
    const variantStyles = {
      primary: {
        background: '#3b82f6',
        color: 'white',
        hoverBackground: '#2563eb'
      },
      secondary: {
        background: '#6b7280',
        color: 'white',
        hoverBackground: '#4b5563'
      },
      danger: {
        background: '#ef4444',
        color: 'white',
        hoverBackground: '#dc2626'
      }
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      background: variantStyles[variant].background,
      color: variantStyles[variant].color
    };
  };

  const buttonStyles = getButtonStyles();
  const variantConfig = {
    primary: { hoverBg: '#2563eb' },
    secondary: { hoverBg: '#4b5563' },
    danger: { hoverBg: '#dc2626' }
  };

  return (
    <SignOutButton>
      <button 
        style={buttonStyles}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = variantConfig[variant].hoverBg;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = buttonStyles.background;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {showIcon && '🚪'} 
        Cerrar Sesión
      </button>
    </SignOutButton>
  );
};

export default LogoutButton;
