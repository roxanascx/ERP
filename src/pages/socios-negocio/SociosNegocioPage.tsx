import React, { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Plus, Search, Users, X } from 'lucide-react';
import { useSociosNegocio } from '../../hooks';
import { useEmpresaValidation } from '../../hooks/useEmpresaValidation';
import SociosNegocioTable from '../../components/socios-negocio/SociosNegocioTable';
import SocioFormModal from '../../components/socios-negocio/SocioFormModal';
import { StatCard, StatGrid } from '../../components/common/StatCard';
import type { SocioNegocio } from '../../services/sociosNegocioApi';
import { cn } from '../../lib/cn';

const control = cn(
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
  'placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
);
const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase';

interface Filtros {
  search: string;
  tipoSocio: string;
  tipoDocumento: string;
  estado: string;
}

const FILTROS_VACIOS: Filtros = {
  search: '',
  tipoSocio: '',
  tipoDocumento: '',
  estado: '',
};

const SociosNegocioPage: React.FC = () => {
  const {
    socios,
    stats,
    loading,
    createSocio,
    updateSocio,
    deleteSocio,
    loadSocios,
    loadStats,
  } = useSociosNegocio();

  const { empresaActual } = useEmpresaValidation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSocio, setEditingSocio] = useState<SocioNegocio | null>(null);
  const [filteredSocios, setFilteredSocios] = useState<SocioNegocio[]>([]);
  const [filters, setFilters] = useState<Filtros>(FILTROS_VACIOS);

  // Solo la lista: useSociosNegocio ya carga las estadisticas por su cuenta.
  useEffect(() => {
    if (!empresaActual?.ruc) return;
    void loadSocios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaActual?.ruc]);

  // Filtrado en cliente sobre la lista ya cargada.
  useEffect(() => {
    let filtered = socios;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (socio) =>
          socio.razon_social.toLowerCase().includes(q) ||
          socio.numero_documento.includes(q) ||
          socio.nombre_comercial?.toLowerCase().includes(q)
      );
    }

    if (filters.tipoSocio) {
      filtered = filtered.filter((socio) => socio.tipo_socio === filters.tipoSocio);
    }
    if (filters.tipoDocumento) {
      filtered = filtered.filter((socio) => socio.tipo_documento === filters.tipoDocumento);
    }
    if (filters.estado) {
      const activo = filters.estado === 'activo';
      filtered = filtered.filter((socio) => socio.activo === activo);
    }

    setFilteredSocios(filtered);
  }, [socios, filters]);

  // ---------------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------------

  const handleOpenModal = () => {
    if (!empresaActual) {
      window.alert('Debes seleccionar una empresa antes de crear un socio de negocio.');
      return;
    }
    setEditingSocio(null);
    setIsModalOpen(true);
  };

  const refrescar = async () => {
    await loadSocios();
    await loadStats();
  };

  const handleCreateSocio = async (socioData: any) => {
    await createSocio(socioData);
    await refrescar();
    setIsModalOpen(false);
  };

  const handleUpdateSocio = async (socioData: any) => {
    if (!editingSocio) return;
    await updateSocio(editingSocio.id, socioData);
    await refrescar();
    setIsModalOpen(false);
    setEditingSocio(null);
  };

  const handleDeleteSocio = async (socioId: string) => {
    try {
      await deleteSocio(socioId);
      await refrescar();
    } catch (error) {
      console.error('Error al eliminar socio:', error);
    }
  };

  const hayFiltros = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-5">
      {/* Las tarjetas leian stats.total / .clientes / .proveedores / .activos,
          nombres que no existen en SocioStatsResponse: mostraban siempre 0.
          Los campos reales llevan el prefijo `total_`. */}
      <StatGrid>
        <StatCard label="Total socios" value={stats?.total_socios ?? 0} icon={Users} tone="blue" />
        <StatCard label="Clientes" value={stats?.total_clientes ?? 0} icon={Users} tone="violet" />
        <StatCard
          label="Proveedores"
          value={stats?.total_proveedores ?? 0}
          icon={Building2}
          tone="amber"
        />
        <StatCard
          label="Activos"
          value={stats?.total_activos ?? 0}
          icon={CheckCircle2}
          tone="green"
        />
      </StatGrid>

      {/* Filtros y alta */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label htmlFor="sn-buscar" className={labelClass}>
              Buscar
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="sn-buscar"
                type="search"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Nombre o documento…"
                className={cn(control, 'pl-9')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="sn-tipo" className={labelClass}>
              Tipo de socio
            </label>
            <select
              id="sn-tipo"
              value={filters.tipoSocio}
              onChange={(e) => setFilters((prev) => ({ ...prev, tipoSocio: e.target.value }))}
              className={control}
            >
              <option value="">Todos los tipos</option>
              <option value="cliente">Cliente</option>
              <option value="proveedor">Proveedor</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>

          <div>
            <label htmlFor="sn-doc" className={labelClass}>
              Documento
            </label>
            <select
              id="sn-doc"
              value={filters.tipoDocumento}
              onChange={(e) => setFilters((prev) => ({ ...prev, tipoDocumento: e.target.value }))}
              className={control}
            >
              <option value="">Todos los documentos</option>
              <option value="RUC">RUC</option>
              <option value="DNI">DNI</option>
              <option value="CE">Carnet de extranjería</option>
            </select>
          </div>

          <div>
            <label htmlFor="sn-estado" className={labelClass}>
              Estado
            </label>
            <select
              id="sn-estado"
              value={filters.estado}
              onChange={(e) => setFilters((prev) => ({ ...prev, estado: e.target.value }))}
              className={control}
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hayFiltros && (
            <button
              type="button"
              onClick={() => setFilters(FILTROS_VACIOS)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <X className="size-4" aria-hidden="true" />
              Limpiar filtros
            </button>
          )}

          <span className="text-sm text-slate-500 tabular-nums">
            {filteredSocios.length} {filteredSocios.length === 1 ? 'socio' : 'socios'}
          </span>

          <button
            type="button"
            onClick={handleOpenModal}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nuevo socio
          </button>
        </div>
      </section>

      <SociosNegocioTable
        socios={filteredSocios}
        onEdit={(socio) => {
          setEditingSocio(socio);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteSocio}
        loading={loading}
      />

      <SocioFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSocio(null);
        }}
        onSubmit={editingSocio ? handleUpdateSocio : handleCreateSocio}
        socio={editingSocio}
      />
    </div>
  );
};

export default SociosNegocioPage;
