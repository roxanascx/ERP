import React from 'react';
import { cn } from '../../lib/cn';

interface SearchHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
}

/** Escapa los metacaracteres para poder buscar el termino literal. */
const escaparRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Resalta las coincidencias de una busqueda dentro de un texto.
 *
 * Antes decidia que fragmento resaltar con `regex.test(part)` sobre una regex
 * con bandera `g`: al ser `test` sensible a `lastIndex`, devolvia true y false
 * alternativamente y se dejaban coincidencias sin resaltar. Ahora se compara
 * el fragmento con el termino directamente.
 */
export const SearchHighlight: React.FC<SearchHighlightProps> = ({
  text,
  searchTerm,
  className = '',
}) => {
  const termino = searchTerm?.trim();

  if (!termino || !text) {
    return <span className={className}>{text}</span>;
  }

  const partes = text.split(new RegExp(`(${escaparRegex(termino)})`, 'gi'));
  const terminoLower = termino.toLowerCase();

  return (
    <span className={className}>
      {partes.map((parte, index) =>
        parte.toLowerCase() === terminoLower ? (
          <mark
            key={index}
            className={cn('rounded bg-amber-100 px-0.5 font-semibold text-amber-900')}
          >
            {parte}
          </mark>
        ) : (
          <span key={index}>{parte}</span>
        )
      )}
    </span>
  );
};

export default SearchHighlight;
