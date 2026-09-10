import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { usePlantillasAsiento, type PlantillaAsiento } from '../../../hooks/usePlantillasAsiento';
import type { DetalleAsiento } from '../../../types/libroDiario';
import Modal from '../../common/Modal';
import EmptyState from '../../common/EmptyState';
import { cn } from '../../../lib/cn';

interface SelectorPlantillasProps {
  onSeleccionarPlantilla: (detalles: DetalleAsiento[], descripcion: string) => void;
  onCerrar: () => void;
}

/**
 * Catalogo de plantillas de asiento.
 * Usa el Modal compartido en vez de montar su propio overlay.
 */
const SelectorPlantillas: React.FC<SelectorPlantillasProps> = ({
  onSeleccionarPlantilla,
  onCerrar,
}) => {
  const { plantillas, categorias, obtenerPlantillasPorCategoria } = usePlantillasAsiento();

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const plantillasFiltradas = useMemo(() => {
    let resultado = categoriaSeleccionada
      ? obtenerPlantillasPorCategoria(categoriaSeleccionada)
      : plantillas;

    const termino = searchTerm.toLowerCase().trim();
    if (termino) {
      resultado = resultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(termino) ||
          p.descripcion.toLowerCase().includes(termino)
      );
    }

    return resultado;
  }, [categoriaSeleccionada, searchTerm, plantillas, obtenerPlantillasPorCategoria]);

  const handleSeleccionar = (plantilla: PlantillaAsiento) => {
    // La denominacion se deja vacia a proposito: la resuelve el formulario
    // consultando el plan contable, para que no quede desactualizada.
    const detallesLimpios: DetalleAsiento[] = plantilla.detalles.map((detalle) => ({
      codigoCuenta: detalle.codigoCuenta,
      denominacionCuenta: '',
      debe: 0,
      haber: 0,
    }));

    onSeleccionarPlantilla(detallesLimpios, plantilla.nombre);
    onCerrar();
  };

  return (
    <Modal
      isOpen
      onClose={onCerrar}
      size="lg"
      title="Plantillas de asiento"
      description="Elige una plantilla para precargar las cuentas del asiento."
    >
      <div className="space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar plantilla…"
            aria-label="Buscar plantilla"
            className={cn(
              'w-full rounded-lg border border-slate-300 bg-white py-2 pr-9 pl-9 text-sm text-slate-900',
              'placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
            )}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Limpiar búsqueda"
              className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded border-0 bg-transparent p-0 text-slate-400 hover:text-slate-700"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoriaSeleccionada('')}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors',
              categoriaSeleccionada === ''
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            Todas
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              onClick={() => setCategoriaSeleccionada(categoria.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                categoriaSeleccionada === categoria.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              <span aria-hidden="true">{categoria.icono}</span>
              {categoria.nombre}
            </button>
          ))}
        </div>

        {/* Listado */}
        {plantillasFiltradas.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No se encontraron plantillas"
            description="Prueba con otros términos de búsqueda o cambia de categoría."
          />
        ) : (
          <ul className="grid max-h-[55vh] gap-3 overflow-y-auto sm:grid-cols-2">
            {plantillasFiltradas.map((plantilla) => (
              <li key={plantilla.id}>
                <button
                  type="button"
                  onClick={() => handleSeleccionar(plantilla)}
                  className="flex h-full w-full flex-col rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/50"
                >
                  <div className="mb-2 flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      {plantilla.icono}
                    </span>
                    <div className="min-w-0">
                      <h5 className="text-sm font-semibold text-slate-900">{plantilla.nombre}</h5>
                      <p className="text-xs text-slate-500">{plantilla.descripcion}</p>
                    </div>
                  </div>

                  <div className="mt-auto rounded-md bg-slate-50 px-3 py-2">
                    <p className="mb-1 text-xs font-medium tracking-wide text-slate-500 uppercase">
                      Cuentas ({plantilla.detalles.length})
                    </p>
                    <ul className="space-y-0.5">
                      {plantilla.detalles.slice(0, 3).map((detalle, index) => (
                        <li key={index} className="flex gap-2 text-xs">
                          <span className="font-mono font-semibold text-slate-700">
                            {detalle.codigoCuenta}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-slate-500">
                            {detalle.denominacionCuenta}
                          </span>
                        </li>
                      ))}
                      {plantilla.detalles.length > 3 && (
                        <li className="text-xs text-slate-400 italic">
                          +{plantilla.detalles.length - 3} más
                        </li>
                      )}
                    </ul>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default SelectorPlantillas;
