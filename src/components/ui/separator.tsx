import React from 'react';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

export const Separator: React.FC<SeparatorProps> = ({ 
  orientation = 'horizontal', 
  className = '',
  style = {} 
}) => {
  const defaultStyle: React.CSSProperties = {
    backgroundColor: '#e5e7eb',
    border: 'none',
    ...style
  };

  if (orientation === 'horizontal') {
    return (
      <hr 
        className={className}
        style={{
          height: '1px',
          width: '100%',
          margin: '16px 0',
          ...defaultStyle
        }}
      />
    );
  }

  return (
    <div 
      className={className}
      style={{
        width: '1px',
        height: '100%',
        ...defaultStyle
      }}
    />
  );
};

export default Separator;
