import React from 'react';

interface SearchHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
}

export const SearchHighlight: React.FC<SearchHighlightProps> = ({ 
  text, 
  searchTerm, 
  className = '' 
}) => {
  if (!searchTerm || !text) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (regex.test(part)) {
          return (
            <mark
              key={index}
              style={{
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '0.125rem 0.25rem',
                borderRadius: '0.25rem',
                fontWeight: '600'
              }}
            >
              {part}
            </mark>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default SearchHighlight;
