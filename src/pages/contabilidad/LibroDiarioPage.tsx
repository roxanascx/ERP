import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { LibroDiario, FiltrosLibroDiario, ResumenLibroDiario, AsientoContable } from '../../types/libroDiario';
import LibroDiarioApiService from '../../services/libroDiarioApi';
import useEmpresaActual from '../../hooks/useEmpresaActual';

// Componentes modulares
import LibroDiarioHeader from '../../components/contabilidad/libroDiario/LibroDiarioHeader';
import LibroDiarioTable from '../../components/contabilidad/libroDiario/LibroDiarioTable';
import LibroDiarioResumen from '../../components/contabilidad/libroDiario/LibroDiarioResumen';
import LibroDiarioDetalle from '../../components/contabilidad/libroDiario/LibroDiarioDetalle';
import CrearLibroModal from '../../components/contabilidad/libroDiario/CrearLibroModal';
import AsientosManager from '../../components/contabilidad/libroDiario/AsientosManager';

const LibroDiarioPage: React.FC = () => {
  const { empresaId } = useParams<{ empresaId: string }>();
  const { empresa, loading: empresaLoading } = useEmpresaActual();
  
  // Usar la empresa actual si no se proporciona en los parámetros o si es 'empresa_demo'
  const empresaIdFinal = (empresaId && empresaId !== 'empresa_demo') ? empresaId : empresa?.ruc || null;
  
  // Estados principales
  const [libros, setLibros] = useState<LibroDiario[]>([]);
  const [resumen, setResumen] = useState<ResumenLibroDiario | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosLibroDiario>({
    periodo: new Date().getFullYear().toString(),
    estado: 'borrador'
  });
  
  // Estados UI
  const [vistaActual, setVistaActual] = useState<'lista' | 'detalle' | 'asientos'>('lista');
  const [libroSeleccionado, setLibroSeleccionado] = useState<LibroDiario | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [mostrandoModal, setMostrandoModal] = useState(false);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (empresaIdFinal) {
      cargarLibrosDiario();
      cargarResumen();
    }
  }, [empresaIdFinal, filtros]);

  const cargarLibrosDiario = async () => {
    if (!empresaIdFinal) return;
    
    setLoading(true);
    try {
      const librosData = await LibroDiarioApiService.obtenerLibrosPorEmpresa(empresaIdFinal, filtros);
      setLibros(librosData);
    } catch (error) {
      console.error('Error al cargar libros diario:', error);
      showToast('Error al cargar los libros diario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarResumen = async () => {
    if (!empresaIdFinal) return;
    
    try {
      const resumenData = await LibroDiarioApiService.obtenerResumen(empresaIdFinal, filtros.periodo);
      setResumen(resumenData);
    } catch (error) {
      console.error('Error al cargar resumen:', error);
      showToast('Error al cargar el resumen', 'error');
    }
  };

  // Handlers
  const handleFiltrosChange = (nuevosFiltros: FiltrosLibroDiario) => {
    setFiltros(nuevosFiltros);
  };

  const handleExportar = (formato: 'excel' | 'pdf') => {
    showToast(`Exportando a ${formato.toUpperCase()}...`, 'info');
    // Implementación futura
  };

  const handleSeleccionarLibro = (libro: LibroDiario) => {
    setLibroSeleccionado(libro);
    setVistaActual('detalle');
  };

  const handleVerAsientos = (libro: LibroDiario) => {
    setLibroSeleccionado(libro);
    setVistaActual('asientos');
  };

  const handleEliminarLibro = async (libroId: string) => {
    if (!confirm('¿Está seguro de eliminar este libro diario?')) return;
    
    try {
      await LibroDiarioApiService.eliminarLibroDiario(libroId);
      showToast('Libro diario eliminado correctamente', 'success');
      cargarLibrosDiario();
      if (libroSeleccionado?.id === libroId) {
        setLibroSeleccionado(null);
        setVistaActual('lista');
      }
    } catch (error) {
      console.error('Error al eliminar libro:', error);
      showToast('Error al eliminar el libro diario', 'error');
    }
  };

  const handleCrearLibro = async (datosLibro: {
    descripcion: string;
    periodo: string;
    estado: 'borrador' | 'finalizado' | 'enviado';
  }) => {
    if (!empresaIdFinal || !empresa) return;

    try {
      await LibroDiarioApiService.crearLibroDiario({
        ...datosLibro,
        empresaId: empresaIdFinal,
        ruc: empresa.ruc,
        razonSocial: empresa.razon_social,
        asientos: [],
        totalDebe: 0,
        totalHaber: 0,
        moneda: 'PEN',
        tipoLibro: '5.1'
      });
      
      showToast('Libro diario creado correctamente', 'success');
      setMostrandoModal(false);
      cargarLibrosDiario();
      cargarResumen();
    } catch (error) {
      console.error('Error al crear libro:', error);
      showToast('Error al crear el libro diario', 'error');
    }
  };

  const handleCrearAsiento = async (asiento: Omit<AsientoContable, 'id'>) => {
    if (!libroSeleccionado?.id) {
      showToast('No hay libro seleccionado', 'error');
      return;
    }

    try {
      const nuevoAsiento = await LibroDiarioApiService.agregarAsiento(libroSeleccionado.id, asiento);
      
      // Actualizar el libro seleccionado con el nuevo asiento
      setLibroSeleccionado(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          asientos: [...(prev.asientos || []), nuevoAsiento]
        };
      });

      showToast('Asiento creado exitosamente', 'success');
    } catch (error) {
      console.error('Error al crear asiento:', error);
      showToast('Error al crear el asiento', 'error');
    }
  };

  const handleEditarAsiento = async (id: string, asiento: Partial<AsientoContable>) => {
    if (!libroSeleccionado?.id) {
      showToast('No hay libro seleccionado', 'error');
      return;
    }

    try {
      const asientoActualizado = await LibroDiarioApiService.actualizarAsiento(
        libroSeleccionado.id, 
        id, 
        asiento
      );
      
      // Actualizar el libro seleccionado con el asiento editado
      setLibroSeleccionado(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          asientos: prev.asientos?.map(a => a.id === id ? asientoActualizado : a) || []
        };
      });

      showToast('Asiento actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error al actualizar asiento:', error);
      showToast('Error al actualizar el asiento', 'error');
    }
  };

  const handleEliminarAsiento = async (id: string) => {
    if (!libroSeleccionado?.id) {
      showToast('No hay libro seleccionado', 'error');
      return;
    }

    try {
      await LibroDiarioApiService.eliminarAsiento(libroSeleccionado.id, id);
      
      // Actualizar el libro seleccionado removiendo el asiento
      setLibroSeleccionado(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          asientos: prev.asientos?.filter(a => a.id !== id) || []
        };
      });

      showToast('Asiento eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar asiento:', error);
      showToast('Error al eliminar el asiento', 'error');
    }
  };

  const volverALista = () => {
    setVistaActual('lista');
    setLibroSeleccionado(null);
  };

  // Loading de empresa
  if (empresaLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          Cargando información de la empresa...
        </div>
      </div>
    );
  }

  // Error si no hay empresa
  if (!empresa || !empresaIdFinal) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px',
        color: '#dc2626'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px 0' }}>Error: Empresa no encontrada</h3>
          <p style={{ margin: 0, color: '#6b7280' }}>
            No se pudo cargar la información de la empresa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Toast de notificaciones */}
        {toast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            background: toast.type === 'success' ? '#10b981' :
                       toast.type === 'error' ? '#ef4444' : '#3b82f6',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            {toast.message}
          </div>
        )}

        {/* Vista Lista de Libros */}
        {vistaActual === 'lista' && (
          <>
            <LibroDiarioHeader
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              onCrearLibro={() => setMostrandoModal(true)}
              onExportar={handleExportar}
              loading={loading}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', marginTop: '20px' }}>
              <LibroDiarioTable
                libros={libros}
                onSeleccionar={handleSeleccionarLibro}
                onVerAsientos={handleVerAsientos}
                onEliminar={handleEliminarLibro}
              />

              <LibroDiarioResumen
                resumen={resumen || {
                  totalLibros: 0,
                  totalAsientos: 0,
                  totalDebe: 0,
                  totalHaber: 0,
                  asientosPorEstado: {
                    borrador: 0,
                    finalizado: 0,
                    enviado: 0
                  },
                  diferencia: 0,
                  balanceado: true,
                  periodos: [],
                  ultimaModificacion: new Date().toISOString()
                }}
                onRefresh={cargarLibrosDiario}
              />
            </div>
          </>
        )}

        {/* Vista Detalle de Libro */}
        {vistaActual === 'detalle' && libroSeleccionado && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={volverALista}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ← Volver a la lista
              </button>
            </div>

            <LibroDiarioDetalle
              libro={libroSeleccionado}
              onClose={volverALista}
              onAgregarAsiento={() => setVistaActual('asientos')}
            />
          </div>
        )}

        {/* Vista Gestión de Asientos */}
        {vistaActual === 'asientos' && libroSeleccionado && (
          <div>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
              <button
                onClick={volverALista}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ← Volver a la lista
              </button>
              <button
                onClick={() => setVistaActual('detalle')}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📖 Ver detalle del libro
              </button>
            </div>

            <AsientosManager
              libroId={libroSeleccionado.id!}
              asientos={libroSeleccionado.asientos || []}
              onCrearAsiento={handleCrearAsiento}
              onEditarAsiento={handleEditarAsiento}
              onEliminarAsiento={handleEliminarAsiento}
            />
          </div>
        )}

        {/* Modal Crear Libro */}
        {mostrandoModal && (
          <CrearLibroModal
            onGuardar={handleCrearLibro}
            onCerrar={() => setMostrandoModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default LibroDiarioPage;
