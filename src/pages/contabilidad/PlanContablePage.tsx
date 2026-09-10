import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { ContabilidadProvider } from '../../contexts/ContabilidadContext';
import PlanContableTable from '../../components/contabilidad/planContable/PlanContableTable';
import EstadisticasCard from '../../components/contabilidad/planContable/EstadisticasCard';
import FiltrosContabilidad, {
  type Filtros,
} from '../../components/contabilidad/planContable/FiltrosContabilidad';
import CuentaModal from '../../components/contabilidad/planContable/CuentaModal';
import PlanContableManager from '../../components/contabilidad/planContable/PlanContableManager';
import ContabilidadApiService from '../../services/contabilidadApi';
import useEmpresaActual from '../../hooks/useEmpresaActual';
import type {
  CuentaContable,
  CuentaContableCreate,
  EstadisticasPlanContable,
} from '../../types/contabilidad';

const PlanContablePage: React.FC = () => (
  <ContabilidadProvider>
    <PlanContablePageContent />
  </ContabilidadProvider>
);

const PlanContablePageContent: React.FC = () => {
  const { empresa } = useEmpresaActual();

  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPlanContable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tipoPlanActivo, setTipoPlanActivo] = useState<'estandar' | 'personalizado'>('estandar');

  // Antes esto era la constante 'empresa_demo', asi que la pantalla consultaba
  // siempre una empresa inexistente en vez de la que el usuario tiene activa.
  const empresaId = empresa?.ruc ?? '';

  const [filtros, setFiltros] = useState<Filtros>({
    busqueda: '',
    clase_contable: undefined,
    nivel: undefined,
    solo_activas: true,
  });

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cuentaEditando, setCuentaEditando] = useState<CuentaContable | undefined>(undefined);
  const [modoModal, setModoModal] = useState<'crear' | 'editar'>('crear');

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  // ---------------------------------------------------------------------------
  // Carga de datos
  // ---------------------------------------------------------------------------

  const cargarDatos = useCallback(async () => {
    if (!empresaId) return;

    setLoading(true);
    setError(null);
    try {
      const [cuentasData, estadisticasData] = await Promise.all([
        ContabilidadApiService.getCuentas({
          activos_solo: filtros.solo_activas,
          empresa_id: empresaId,
          tipo_plan: tipoPlanActivo,
        }),
        ContabilidadApiService.getEstadisticas(),
      ]);

      setCuentas(cuentasData);
      setEstadisticas(estadisticasData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error cargando datos del plan contable');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId, tipoPlanActivo]);

  const cargarCuentas = useCallback(async () => {
    if (!empresaId) return;

    setError(null);
    try {
      const params: Record<string, unknown> = {
        activos_solo: filtros.solo_activas,
        empresa_id: empresaId,
        tipo_plan: tipoPlanActivo,
      };

      if (filtros.clase_contable) params.clase_contable = filtros.clase_contable;
      if (filtros.nivel) params.nivel = filtros.nivel;
      if (filtros.busqueda?.trim()) params.busqueda = filtros.busqueda.trim();

      setCuentas(await ContabilidadApiService.getCuentas(params as any));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error cargando cuentas');
    }
  }, [empresaId, tipoPlanActivo, filtros]);

  useEffect(() => {
    void cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  // Las busquedas de texto esperan 300 ms; el resto de filtros se aplican ya.
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (filtros.busqueda.trim()) {
      timeoutRef.current = setTimeout(() => void cargarCuentas(), 300);
    } else {
      void cargarCuentas();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  // ---------------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------------

  const refrescarEstadisticas = async () => {
    setEstadisticas(await ContabilidadApiService.getEstadisticas());
  };

  const handlePlanChanged = (nuevoTipoPlan: 'estandar' | 'personalizado') => {
    setTipoPlanActivo(nuevoTipoPlan);
  };

  const handleEliminarCuenta = async (cuenta: CuentaContable) => {
    const confirmado = window.confirm(
      `¿Desactivar la cuenta ${cuenta.codigo} — ${cuenta.descripcion}?`
    );
    if (!confirmado) return;

    try {
      await ContabilidadApiService.deleteCuenta(cuenta.codigo);
      setCuentas((prev) =>
        prev.map((c) => (c.codigo === cuenta.codigo ? { ...c, activa: false } : c))
      );
      await refrescarEstadisticas();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error eliminando la cuenta');
    }
  };

  const handleToggleActivarCuenta = async (cuenta: CuentaContable) => {
    const accion = cuenta.activa ? 'desactivar' : 'activar';
    if (!window.confirm(`¿${accion[0].toUpperCase()}${accion.slice(1)} la cuenta ${cuenta.codigo}?`)) {
      return;
    }

    try {
      const cuentaActualizada = await ContabilidadApiService.updateCuenta(cuenta.codigo, {
        activa: !cuenta.activa,
      });
      setCuentas((prev) => prev.map((c) => (c.codigo === cuenta.codigo ? cuentaActualizada : c)));
      await refrescarEstadisticas();
    } catch (err: any) {
      setError(err.response?.data?.detail || `Error al ${accion} la cuenta`);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCuentaEditando(undefined);
  };

  const handleSubmitCuenta = async (datosFormulario: Partial<CuentaContable>) => {
    try {
      if (modoModal === 'crear') {
        const datosCreacion: CuentaContableCreate = {
          codigo: datosFormulario.codigo!,
          descripcion: datosFormulario.descripcion!,
          nivel: datosFormulario.nivel!,
          clase_contable: datosFormulario.clase_contable!,
          grupo: datosFormulario.grupo,
          subgrupo: datosFormulario.subgrupo,
          cuenta_padre: datosFormulario.cuenta_padre,
          es_hoja: datosFormulario.es_hoja,
          acepta_movimiento: datosFormulario.acepta_movimiento,
          naturaleza: datosFormulario.naturaleza,
          moneda: datosFormulario.moneda,
          activa: datosFormulario.activa,
        };
        const nuevaCuenta = await ContabilidadApiService.createCuenta(datosCreacion);
        setCuentas((prev) => [...prev, nuevaCuenta]);
      } else if (modoModal === 'editar' && cuentaEditando) {
        const cuentaActualizada = await ContabilidadApiService.updateCuenta(
          cuentaEditando.codigo,
          datosFormulario
        );
        setCuentas((prev) =>
          prev.map((c) => (c.codigo === cuentaEditando.codigo ? cuentaActualizada : c))
        );
      }

      await refrescarEstadisticas();
      cerrarModal();
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Error guardando cuenta');
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" role="status">
        <Loader2 className="size-6 animate-spin text-blue-600" aria-hidden="true" />
        <span className="ml-3 text-sm text-slate-500">Cargando plan contable…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
          <p className="flex-1 text-sm font-medium text-red-800">{error}</p>
          <button
            type="button"
            onClick={cargarDatos}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Reintentar
          </button>
        </div>
      )}

      {estadisticas && <EstadisticasCard estadisticas={estadisticas} />}

      <PlanContableManager
        empresaId={empresaId}
        planActual={tipoPlanActivo}
        onPlanChanged={handlePlanChanged}
        onImportSuccess={cargarDatos}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <FiltrosContabilidad
          filtros={filtros}
          onFiltrosChange={setFiltros}
          onCrearCuenta={() => {
            setModoModal('crear');
            setCuentaEditando(undefined);
            setModalAbierto(true);
          }}
          totalCuentas={cuentas.length}
        />
      </div>

      <PlanContableTable
        cuentas={cuentas}
        loading={false}
        searchTerm={filtros.busqueda}
        onEditarCuenta={(cuenta) => {
          setModoModal('editar');
          setCuentaEditando(cuenta);
          setModalAbierto(true);
        }}
        onEliminarCuenta={handleEliminarCuenta}
        onToggleActivarCuenta={handleToggleActivarCuenta}
        onCuentaSelect={() => {}}
      />

      <CuentaModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onSubmit={handleSubmitCuenta}
        cuenta={cuentaEditando}
        modo={modoModal}
      />
    </div>
  );
};

export default PlanContablePage;
