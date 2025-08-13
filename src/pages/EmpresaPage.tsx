import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  EmpresaList, 
  EmpresaForm, 
  SireConfig,
  type Empresa,
  type EmpresaCreate,
  type EmpresaUpdate,
  type SireConfigType
} from '../components/empresa';
import { useEmpresa } from '../hooks/useEmpresa';

const EmpresaPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    empresas,
    empresaActual,
    loading,
    error,
    hasError,
    crearEmpresa,
    actualizarEmpresa,
    eliminarEmpresa,
    seleccionarEmpresa,
    configurarSire,
    limpiarError
  } = useEmpresa();

  // Estados para datos
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);
  const [empresaConfigSire, setEmpresaConfigSire] = useState<Empresa | null>(null);

  // Estados para modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSireModal, setShowSireModal] = useState(false);

  // ============================================
  // MANEJADORES DE EVENTOS
  // ============================================

  const handleCreateNew = () => {
    setEmpresaEditando(null);
    setShowCreateModal(true);
    limpiarError();
  };

  const handleEditEmpresa = (empresa: Empresa) => {
    setEmpresaEditando(empresa);
    setShowEditModal(true);
    limpiarError();
  };

  const handleConfigSire = (empresa: Empresa) => {
    setEmpresaConfigSire(empresa);
    setShowSireModal(true);
    limpiarError();
  };

  const handleSelectEmpresa = async (empresa: Empresa) => {
    try {
      const success = await seleccionarEmpresa(empresa.ruc);
      if (success) {
        // Tiempo optimizado para navegación fluida
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 400);
      }
    } catch (error) {
      console.error('Error al seleccionar empresa:', error);
    }
  };

  const handleDeleteEmpresa = async (ruc: string) => {
    const success = await eliminarEmpresa(ruc);
    if (success) {
      console.log(`Empresa ${ruc} eliminada`);
    }
  };

  // ============================================
  // MANEJADORES DE FORMULARIOS
  // ============================================

  const handleSubmitCreate = async (data: EmpresaCreate | EmpresaUpdate) => {
    try {
      const createData = data as EmpresaCreate;
      const nuevaEmpresa = await crearEmpresa(createData);
      if (nuevaEmpresa) {
        setShowCreateModal(false);
        // Opcional: seleccionar automáticamente la nueva empresa
        await seleccionarEmpresa(nuevaEmpresa.ruc);
      }
    } catch (error) {
      // El error ya se maneja en el hook useEmpresa
      console.error('Error en handleSubmitCreate:', error);
    }
  };

  const handleSubmitUpdate = async (data: EmpresaCreate | EmpresaUpdate) => {
    if (!empresaEditando) return;
    
    try {
      const updateData = data as EmpresaUpdate;
      const empresaActualizada = await actualizarEmpresa(empresaEditando.ruc, updateData);
      if (empresaActualizada) {
        setShowEditModal(false);
        setEmpresaEditando(null);
      }
    } catch (error) {
      // El error ya se maneja en el hook useEmpresa
      console.error('Error en handleSubmitUpdate:', error);
    }
  };

  const handleSubmitSireConfig = async (config: SireConfigType) => {
    if (!empresaConfigSire) return;
    
    const success = await configurarSire(empresaConfigSire.ruc, config);
    if (success) {
      setShowSireModal(false);
      setEmpresaConfigSire(null);
    }
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowCreateModal(false);
    setShowSireModal(false);
    setEmpresaEditando(null);
    setEmpresaConfigSire(null);
    limpiarError();
  };

  // ============================================
  // COMPONENTE MODAL
  // ============================================
  
  const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'clamp(16px, 4vw, 20px)'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: 'min(600px, 90vw)',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}>
          {/* Header del Modal */}
          <div style={{
            padding: 'clamp(16px, 4vw, 24px)',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: 'clamp(12px, 3vw, 16px) clamp(12px, 3vw, 16px) 0 0'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: 'clamp(18px, 4vw, 20px)',
              fontWeight: '600',
              color: '#374151'
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                color: '#6B7280',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6B7280';
              }}
            >
              ×
            </button>
          </div>
          
          {/* Contenido del Modal */}
          <div style={{ padding: 'clamp(16px, 4vw, 24px)' }}>
            {children}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDERIZADO CONDICIONAL
  // ============================================

  const renderContent = () => {
    // Siempre mostrar la lista
    return (
      <EmpresaList
        empresas={empresas}
        empresaActual={empresaActual}
        loading={loading}
        error={error}
        onSelectEmpresa={handleSelectEmpresa}
        onEditEmpresa={handleEditEmpresa}
        onDeleteEmpresa={handleDeleteEmpresa}
        onConfigSire={handleConfigSire}
        onCreateNew={handleCreateNew}
      />
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #FDF2F8 0%, #FCF7F8 25%, #FEFEFE 50%, #F8FAFC 75%, #F1F5F9 100%)',
      padding: 'clamp(16px, 4vw, 20px)',
      boxSizing: 'border-box',
      overflow: 'auto',
      position: 'relative'
    }}>
      {/* Overlay sutil para mayor profundidad */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.02) 0%, rgba(220, 38, 38, 0.01) 70%, rgba(185, 28, 28, 0.005) 100%)',
        pointerEvents: 'none'
      }}></div>
      {/* Header mejorado - Pantalla completa */}
      <div style={{
        maxWidth: '100%',
        width: '100%',
        margin: '0 auto clamp(20px, 5vw, 32px) auto',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{
          fontSize: 'clamp(28px, 7vw, 36px)',
          fontWeight: '700',
          margin: '0 0 clamp(8px, 2vw, 12px) 0',
          letterSpacing: '-0.025em',
          color: '#DC2626', // Color de respaldo
          background: 'linear-gradient(135deg, #BE123C 0%, #DC2626 50%, #EF4444 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 1px 2px rgba(220, 38, 38, 0.1))'
        }}>
          🏢 Gestión de Empresas
        </h1>
        <p style={{
          fontSize: 'clamp(16px, 4vw, 18px)',
          margin: 0,
          fontWeight: '500',
          color: '#64748B'
        }}>
          Selecciona una empresa para acceder al sistema
        </p>
      </div>

      {/* Mostrar errores globales */}
      {hasError && (
        <div style={{
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto clamp(16px, 4vw, 20px) auto',
          padding: 'clamp(12px, 3vw, 16px)',
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          border: '2px solid #fca5a5',
          borderRadius: 'clamp(8px, 2vw, 12px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
          boxSizing: 'border-box'
        }}>
          <span style={{ 
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            fontWeight: '600'
          }}>
            ❌ {error}
          </span>
          <button
            onClick={limpiarError}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 'clamp(16px, 4vw, 18px)',
              cursor: 'pointer',
              color: '#991b1b',
              padding: '4px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✖️
          </button>
        </div>
      )}

      {/* Contenido principal - Lista de empresas */}
      <div style={{
        maxWidth: '100%',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {renderContent()}
      </div>

      {/* Modales */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        title="✨ Crear Nueva Empresa"
      >
        <EmpresaForm
          onSubmit={handleSubmitCreate}
          onCancel={handleCloseModals}
          loading={loading}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        title={`✏️ Editar Empresa: ${empresaEditando?.ruc || ''}`}
      >
        {empresaEditando && (
          <EmpresaForm
            empresa={empresaEditando}
            onSubmit={handleSubmitUpdate}
            onCancel={handleCloseModals}
            loading={loading}
          />
        )}
      </Modal>

      <Modal
        isOpen={showSireModal}
        onClose={handleCloseModals}
        title={`🔐 Configurar SIRE: ${empresaConfigSire?.ruc || ''}`}
      >
        {empresaConfigSire && (
          <SireConfig
            empresa={empresaConfigSire}
            onSave={handleSubmitSireConfig}
            onCancel={handleCloseModals}
            loading={loading}
          />
        )}
      </Modal>
    </div>
  );
};

export default EmpresaPage;
