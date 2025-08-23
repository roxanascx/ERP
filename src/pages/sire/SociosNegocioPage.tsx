// Página principal de Socios de Negocio
import React, { useState, useEffect } from 'react';
import { useSociosNegocio } from '../../hooks';
import type { SocioFilters } from '../../services/sociosNegocioApi';

// Componentes
const SociosNegocioStats: React.FC = () => {
  const { stats, loading } = useSociosNegocio();

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Socios',
      value: stats.total_socios,
      icon: '👥',
      color: 'text-blue-600'
    },
    {
      title: 'Proveedores',
      value: stats.total_proveedores,
      icon: '🏭',
      color: 'text-green-600'
    },
    {
      title: 'Clientes',
      value: stats.total_clientes,
      icon: '🛒',
      color: 'text-purple-600'
    },
    {
      title: 'Con RUC',
      value: stats.total_con_ruc,
      icon: '📄',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SociosNegocioFilters: React.FC<{
  filters: SocioFilters;
  onFiltersChange: (filters: SocioFilters) => void;
  onSearch: (query: string) => void;
}> = ({ filters, onFiltersChange, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Búsqueda */}
        <div className="md:col-span-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
        </div>

        {/* Filtro Tipo Socio */}
        <div className="md:col-span-2">
          <select
            value={filters.tipo_socio || ''}
            onChange={(e) => onFiltersChange({ ...filters, tipo_socio: e.target.value as any || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="proveedor">Proveedores</option>
            <option value="cliente">Clientes</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>

        {/* Filtro Tipo Documento */}
        <div className="md:col-span-2">
          <select
            value={filters.tipo_documento || ''}
            onChange={(e) => onFiltersChange({ ...filters, tipo_documento: e.target.value as any || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los documentos</option>
            <option value="RUC">RUC</option>
            <option value="DNI">DNI</option>
            <option value="CE">CE</option>
          </select>
        </div>

        {/* Filtro Estado */}
        <div className="md:col-span-2">
          <select
            value={filters.activo !== undefined ? (filters.activo ? 'true' : 'false') : ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              activo: e.target.value === '' ? undefined : e.target.value === 'true' 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        {/* Botón Limpiar */}
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onFiltersChange({});
            }}
            className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};

const SociosNegocioList: React.FC<{
  isSearchMode?: boolean;
}> = ({ isSearchMode = false }) => {
  const { socios, loading, error, pagination, loadSocios, loadMoreSocios } = useSociosNegocio();

  useEffect(() => {
    loadSocios();
  }, [loadSocios]);

  const getTipoSocioColor = (tipo: string) => {
    switch (tipo) {
      case 'proveedor': return 'bg-green-100 text-green-800';
      case 'cliente': return 'bg-blue-100 text-blue-800';
      case 'ambos': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoDocumentoColor = (tipo: string) => {
    switch (tipo) {
      case 'RUC': return 'bg-orange-100 text-orange-800';
      case 'DNI': return 'bg-teal-100 text-teal-800';
      case 'CE': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="text-red-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar socios</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Socios {isSearchMode && '(Búsqueda)'}
          </h3>
          <span className="text-sm text-gray-500">
            {pagination.total} {pagination.total === 1 ? 'socio' : 'socios'}
          </span>
        </div>
      </div>

      {socios.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isSearchMode ? 'No se encontraron resultados' : 'No hay socios registrados'}
          </h3>
          <p className="text-gray-500">
            {isSearchMode 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Comienza agregando tu primer socio de negocio'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SUNAT
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {socios.map((socio) => (
                  <tr key={socio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {socio.razon_social}
                        </div>
                        {socio.nombre_comercial && (
                          <div className="text-sm text-gray-500">
                            {socio.nombre_comercial}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoDocumentoColor(socio.tipo_documento)}`}>
                          {socio.tipo_documento}
                        </span>
                        <span className="text-sm text-gray-900">{socio.numero_documento}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoSocioColor(socio.tipo_socio)}`}>
                        {socio.tipo_socio.charAt(0).toUpperCase() + socio.tipo_socio.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        socio.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {socio.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {socio.tipo_documento === 'RUC' ? (
                          socio.datos_sunat_disponibles ? (
                            <div className="flex items-center text-green-600">
                              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs">Sincronizado</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-4a1 1 0 100-2 1 1 0 000 2zm-1-5a1 1 0 112 0v2a1 1 0 11-2 0V9z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs">No sincronizado</span>
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-gray-400">No aplica</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Editar
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination.hasMore && (
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={loadMoreSocios}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const SociosNegocioPage: React.FC = () => {
  const [filters, setFilters] = useState<SocioFilters>({});
  const [isSearchMode, setIsSearchMode] = useState(false);
  const { loadSocios, searchSocios } = useSociosNegocio();

  const handleFiltersChange = (newFilters: SocioFilters) => {
    setFilters(newFilters);
    setIsSearchMode(false);
    loadSocios(newFilters);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setIsSearchMode(true);
      searchSocios({ ...filters, q: query.trim() });
    } else {
      setIsSearchMode(false);
      loadSocios(filters);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Socios de Negocio</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona proveedores, clientes y socios comerciales
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                + Agregar desde RUC
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                + Nuevo Socio
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <SociosNegocioStats />

        {/* Filtros */}
        <SociosNegocioFilters 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
        />

        {/* Lista */}
        <SociosNegocioList 
          isSearchMode={isSearchMode}
        />
      </div>
    </div>
  );
};

export default SociosNegocioPage;
