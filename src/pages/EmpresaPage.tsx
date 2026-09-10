import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Building2, X } from 'lucide-react';
import {
  EmpresaList,
  EmpresaForm,
  SireConfig,
  type Empresa,
  type EmpresaCreate,
  type EmpresaUpdate,
  type SireConfigType,
} from '../components/empresa';
import Modal from '../components/common/Modal';
import { useEmpresa } from '../hooks/useEmpresa';
import EmpresaApiService from '../services/empresaApi';

/**
 * Selector de empresa: la pantalla entre el login y el dashboard.
 *
 * No monta MainLayout a proposito: todavia no hay empresa activa, asi que un
 * sidebar que apunta a modulos inaccesibles solo estorbaria.
 *
 * Antes esta pantalla mostraba la cabecera "Gestión de Empresas" DOS veces:
 * una como titulo de pagina y otra dentro de la tarjeta de contadores.
 */

// ---------------------------------------------------------------------------
// Pagina
// ---------------------------------------------------------------------------

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
    limpiarError,
  } = useEmpresa();

  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);
  const [empresaConfigSire, setEmpresaConfigSire] = useState<Empresa | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSireModal, setShowSireModal] = useState(false);

  // ============================================
  // MANEJADORES
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

  const handleConfigSire = async (empresa: Empresa) => {
    try {
      // El detalle completo trae las credenciales que el listado no incluye.
      const empresaCompleta = await EmpresaApiService.getEmpresaByRuc(empresa.ruc);
      setEmpresaConfigSire(empresaCompleta);
      setShowSireModal(true);
      limpiarError();
    } catch {
      // El error queda en el estado del hook.
    }
  };

  const handleSelectEmpresa = async (empresa: Empresa) => {
    // `seleccionarEmpresa` ya deja el contexto actualizado antes de resolver,
    // asi que se puede navegar de inmediato. Antes habia un setTimeout de
    // 400 ms que no esperaba a nada: solo hacia parecer lenta la seleccion.
    const success = await seleccionarEmpresa(empresa.ruc);
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleDeleteEmpresa = async (ruc: string) => {
    await eliminarEmpresa(ruc);
  };

  const handleSubmitCreate = async (data: EmpresaCreate | EmpresaUpdate) => {
    const nuevaEmpresa = await crearEmpresa(data as EmpresaCreate);
    if (!nuevaEmpresa) return;

    setShowCreateModal(false);
    // Mismo destino que al seleccionar una empresa existente. Antes se
    // seleccionaba pero el usuario se quedaba aqui, asi que habia dos caminos
    // distintos para el mismo resultado.
    const success = await seleccionarEmpresa(nuevaEmpresa.ruc);
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleSubmitUpdate = async (data: EmpresaCreate | EmpresaUpdate) => {
    if (!empresaEditando) return;
    const empresaActualizada = await actualizarEmpresa(empresaEditando.ruc, data as EmpresaUpdate);
    if (empresaActualizada) {
      setShowEditModal(false);
      setEmpresaEditando(null);
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
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Cabecera (una sola) */}
        <header className="mb-8 flex items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
            <Building2 className="size-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Selecciona una empresa
            </h1>
            <p className="text-sm text-slate-500">
              Elige con qué empresa quieres trabajar para entrar al sistema.
            </p>
          </div>
        </header>

        {/* Errores globales */}
        {hasError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
            <p className="flex-1 text-sm font-medium text-red-800">{error}</p>
            <button
              type="button"
              onClick={limpiarError}
              aria-label="Descartar error"
              className="grid size-7 shrink-0 place-items-center rounded border-0 bg-transparent p-0 text-red-500 hover:bg-red-100 hover:text-red-700"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}

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
      </div>

      {/* Modales */}
      <Modal isOpen={showCreateModal} onClose={handleCloseModals} title="Nueva empresa">
        <EmpresaForm onSubmit={handleSubmitCreate} onCancel={handleCloseModals} loading={loading} />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        title={`Editar empresa ${empresaEditando?.ruc ?? ''}`}
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
        title={`Configurar SIRE · ${empresaConfigSire?.ruc ?? ''}`}
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
