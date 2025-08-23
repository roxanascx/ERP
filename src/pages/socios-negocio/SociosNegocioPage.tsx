import React, { useState, useEffect } from 'react';
import { useSociosNegocio, useEmpresa } from '../../hooks';
import SociosNegocioTable from '../../components/socios-negocio/SociosNegocioTable';
import SocioFormModal from '../../components/socios-negocio/SocioFormModal';
import MainLayout from '../../components/MainLayout';
import type { SocioNegocio } from '../../services/sociosNegocioApi';

// Componente de estadísticas
const SociosNegocioStats: React.FC<{ stats: any }> = ({ stats }) => {
  const statsStyle = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '24px'
    },
    card: {
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      textAlign: 'center' as const
    },
    icon: {
      fontSize: '24px',
      marginBottom: '8px'
    },
    value: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '0'
    },
    label: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '4px 0 0 0'
    }
  };

  return (
    <div style={statsStyle.container}>
      <div style={statsStyle.card}>
        <div style={statsStyle.icon}>👥</div>
        <p style={statsStyle.value}>{stats?.total || 0}</p>
        <p style={statsStyle.label}>Total Socios</p>
      </div>
      <div style={statsStyle.card}>
        <div style={statsStyle.icon}>🛒</div>
        <p style={statsStyle.value}>{stats?.clientes || 0}</p>
        <p style={statsStyle.label}>Clientes</p>
      </div>
      <div style={statsStyle.card}>
        <div style={statsStyle.icon}>🏭</div>
        <p style={statsStyle.value}>{stats?.proveedores || 0}</p>
        <p style={statsStyle.label}>Proveedores</p>
      </div>
      <div style={statsStyle.card}>
        <div style={statsStyle.icon}>✅</div>
        <p style={statsStyle.value}>{stats?.activos || 0}</p>
        <p style={statsStyle.label}>Activos</p>
      </div>
    </div>
  );
};

// Componente de filtros
const SociosNegocioFilters: React.FC<{
  onSearchChange: (search: string) => void;
  onTipoSocioChange: (tipo: string) => void;
  onTipoDocumentoChange: (tipo: string) => void;
  onEstadoChange: (estado: string) => void;
  onClearFilters: () => void;
}> = ({
  onSearchChange,
  onTipoSocioChange,
  onTipoDocumentoChange,
  onEstadoChange,
  onClearFilters
}) => {
  const filtersStyle = {
    container: {
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
      gap: '16px',
      alignItems: 'end'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    },
    select: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      outline: 'none'
    },
    clearButton: {
      padding: '10px 16px',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    }
  };

  return (
    <div style={filtersStyle.container}>
      <div style={filtersStyle.row}>
        <div style={filtersStyle.inputGroup}>
          <label style={filtersStyle.label}>Buscar</label>
          <input
            type="text"
            placeholder="Buscar por nombre, documento..."
            style={filtersStyle.input}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
        </div>

        <div style={filtersStyle.inputGroup}>
          <label style={filtersStyle.label}>Tipo Socio</label>
          <select
            style={filtersStyle.select}
            onChange={(e) => onTipoSocioChange(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="cliente">Cliente</option>
            <option value="proveedor">Proveedor</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>

        <div style={filtersStyle.inputGroup}>
          <label style={filtersStyle.label}>Documento</label>
          <select
            style={filtersStyle.select}
            onChange={(e) => onTipoDocumentoChange(e.target.value)}
          >
            <option value="">Todos los documentos</option>
            <option value="RUC">RUC</option>
            <option value="DNI">DNI</option>
            <option value="CE">Carnet de Extranjería</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>
        </div>

        <div style={filtersStyle.inputGroup}>
          <label style={filtersStyle.label}>Estado</label>
          <select
            style={filtersStyle.select}
            onChange={(e) => onEstadoChange(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <button
          style={filtersStyle.clearButton}
          onClick={onClearFilters}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
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
    loadStats
  } = useSociosNegocio();

  const { empresaActual, cargarEmpresaActual } = useEmpresa();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSocio, setEditingSocio] = useState<SocioNegocio | null>(null);
  const [filteredSocios, setFilteredSocios] = useState<SocioNegocio[]>([]);

  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    tipoSocio: '',
    tipoDocumento: '',
    estado: ''
  });

  useEffect(() => {
    cargarEmpresaActual(); // Asegurar que la empresa esté cargada
  }, []);

  // Cargar socios cuando la empresa esté disponible
  useEffect(() => {
    if (empresaActual?.ruc) {
      loadSocios();
      loadStats();
    }
  }, [empresaActual?.ruc, loadSocios, loadStats]);

  // Función para validar empresa antes de abrir modal
  const handleOpenModal = () => {
    if (!empresaActual) {
      alert('⚠️ Debe seleccionar una empresa antes de crear un socio de negocio.');
      return;
    }
    
    setEditingSocio(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    let filtered = socios;

    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(socio => 
        socio.razon_social.toLowerCase().includes(searchLower) ||
        socio.numero_documento.includes(searchLower) ||
        (socio.nombre_comercial && socio.nombre_comercial.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por tipo de socio
    if (filters.tipoSocio) {
      filtered = filtered.filter(socio => socio.tipo_socio === filters.tipoSocio);
    }

    // Filtro por tipo de documento
    if (filters.tipoDocumento) {
      filtered = filtered.filter(socio => socio.tipo_documento === filters.tipoDocumento);
    }

    // Filtro por estado
    if (filters.estado) {
      const isActive = filters.estado === 'activo';
      filtered = filtered.filter(socio => socio.activo === isActive);
    }

    setFilteredSocios(filtered);
  }, [socios, filters]);

  const pageStyles = {
    container: {
      maxWidth: '100%'
    },
    actions: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap' as const,
      marginBottom: '24px'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonPrimary: {
      backgroundColor: '#3b82f6',
      color: '#ffffff'
    },
    buttonSecondary: {
      backgroundColor: '#10b981',
      color: '#ffffff'
    }
  };

  const handleCreateSocio = async (socioData: any) => {
    try {
      await createSocio(socioData);
      await loadSocios();
      await loadStats();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al crear socio:', error);
    }
  };

  const handleEditSocio = (socio: SocioNegocio) => {
    setEditingSocio(socio);
    setIsModalOpen(true);
  };

  const handleUpdateSocio = async (socioData: any) => {
    if (!editingSocio) return;
    
    try {
      await updateSocio(editingSocio.id, socioData);
      await loadSocios();
      await loadStats();
      setIsModalOpen(false);
      setEditingSocio(null);
    } catch (error) {
      console.error('Error al actualizar socio:', error);
    }
  };

  const handleDeleteSocio = async (socioId: string) => {
    try {
      await deleteSocio(socioId);
      await loadSocios();
      await loadStats();
    } catch (error) {
      console.error('Error al eliminar socio:', error);
    }
  };

  const handleModalSubmit = editingSocio ? handleUpdateSocio : handleCreateSocio;

  const handleClearFilters = () => {
    setFilters({
      search: '',
      tipoSocio: '',
      tipoDocumento: '',
      estado: ''
    });
  };

  return (
    <MainLayout
      title="Socios de Negocio"
      subtitle="Gestiona proveedores, clientes y socios comerciales"
    >
      <div style={pageStyles.container}>
        
        <div style={pageStyles.actions}>
          <button
            style={{
              ...pageStyles.button,
              ...pageStyles.buttonSecondary
            }}
            onClick={handleOpenModal}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            + Agregar desde RUC
          </button>
          
          <button
            style={{
              ...pageStyles.button,
              ...pageStyles.buttonPrimary
            }}
            onClick={handleOpenModal}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            + Nuevo Socio
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <SociosNegocioStats stats={stats} />

      {/* Filtros */}
      <SociosNegocioFilters
        onSearchChange={(search) => setFilters(prev => ({ ...prev, search }))}
        onTipoSocioChange={(tipoSocio) => setFilters(prev => ({ ...prev, tipoSocio }))}
        onTipoDocumentoChange={(tipoDocumento) => setFilters(prev => ({ ...prev, tipoDocumento }))}
        onEstadoChange={(estado) => setFilters(prev => ({ ...prev, estado }))}
        onClearFilters={handleClearFilters}
      />

      {/* Tabla de socios */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#1f2937', 
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          👥 Lista de Socios
          <span style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            fontWeight: 'normal' 
          }}>
            ({filteredSocios.length} {filteredSocios.length === 1 ? 'socio' : 'socios'})
          </span>
        </h2>
        
        <SociosNegocioTable
          socios={filteredSocios}
          onEdit={handleEditSocio}
          onDelete={handleDeleteSocio}
          loading={loading}
        />
      </div>

      {/* Modal */}
      <SocioFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSocio(null);
        }}
        onSubmit={handleModalSubmit}
        socio={editingSocio}
      />
    </MainLayout>
  );
};

export default SociosNegocioPage;
