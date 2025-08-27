import React, { useState, useEffect } from 'react';
import type { AsientoContable, DetalleAsiento } from '../../../types/libroDiario';
import type { CuentaContable } from '../../../types/contabilidad';
import { ContabilidadApiService } from '../../../services/contabilidadApi';
import CuentaCodigoDetalle from './CuentaCodigoDetalle';
import SelectorPlantillas from './SelectorPlantillas';
// ❌ ELIMINADO: import EjemplosAsientos ya no es necesario

interface FormularioAsientoProps {
  libroId: string;
  asientoEditando?: AsientoContable | null;
  asientosExistentes?: AsientoContable[];
  onGuardar: (asiento: Omit<AsientoContable, 'id'>) => Promise<void>;
  onCerrar: () => void;
}

const FormularioAsiento: React.FC<FormularioAsientoProps> = ({
  libroId,
  asientoEditando,
  asientosExistentes = [],
  onGuardar,
  onCerrar
}) => {
  console.log('🏗️ FormularioAsiento - Renderizando con props:', {
    libroId,
    asientoEditando: asientoEditando?.numero || 'NUEVO',
    asientosExistentesCount: asientosExistentes.length,
    asientosExistentesNumeros: asientosExistentes.map(a => a.numero)
  });

  const [formData, setFormData] = useState({
    numero: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    detalles: [
      { codigoCuenta: '', denominacionCuenta: '', debe: 0, haber: 0 },
      { codigoCuenta: '', denominacionCuenta: '', debe: 0, haber: 0 }
    ] as DetalleAsiento[]
  });

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [mostrarPlantillas, setMostrarPlantillas] = useState(false);
  // ❌ ELIMINADO: mostrarEjemplos ya no es necesario
  const [cuentasDisponibles, setCuentasDisponibles] = useState<CuentaContable[]>([]);

  // Función para calcular el siguiente número correlativo
  const calcularSiguienteNumero = (): string => {
    console.log('🔢 Calculando siguiente número correlativo');
    console.log('📋 Asientos existentes recibidos:', asientosExistentes?.length || 0);
    
    // Verificar si hay asientos existentes
    if (!asientosExistentes || asientosExistentes.length === 0) {
      console.log('✅ No hay asientos existentes, iniciando desde 0001');
      return '0001';
    }

    // Obtener todos los números de asientos existentes y procesarlos
    const numerosValidos = asientosExistentes
      .map(asiento => {
        console.log('🔍 Procesando asiento:', { numero: asiento.numero });
        return asiento.numero;
      })
      .filter(numero => {
        // Filtrar solo números válidos (pueden tener ceros a la izquierda)
        const esNumerico = /^\d+$/.test(numero);
        console.log(`🔎 Número "${numero}" es válido:`, esNumerico);
        return esNumerico;
      })
      .map(numero => parseInt(numero, 10))
      .filter(numero => !isNaN(numero) && numero > 0) // Excluir números inválidos o cero
      .sort((a, b) => a - b); // Ordenar de menor a mayor

    console.log('📊 Números válidos encontrados:', numerosValidos);

    // Si no hay números válidos, empezar desde 0001
    if (numerosValidos.length === 0) {
      console.log('✅ No hay números válidos, iniciando desde 0001');
      return '0001';
    }

    // Encontrar el número más alto y sumar 1
    const numeroMasAlto = Math.max(...numerosValidos);
    const siguienteNumero = numeroMasAlto + 1;
    const numeroFormateado = siguienteNumero.toString().padStart(4, '0');

    console.log(`✅ Siguiente número calculado: ${numeroFormateado}`);
    console.log(`📈 Basado en número más alto existente: ${numeroMasAlto}`);

    return numeroFormateado;
  };

  useEffect(() => {
    console.log('🔄 useEffect - Inicializando formulario');
    console.log('📝 Modo edición:', !!asientoEditando);
    console.log('📋 Asientos existentes:', asientosExistentes?.length || 0);
    console.log('🔍 Lista de asientos existentes:', asientosExistentes?.map(a => ({ numero: a.numero, id: a.id })) || []);
    
    if (asientoEditando) {
      console.log('✏️ Cargando datos para edición:', asientoEditando.numero);
      setFormData({
        numero: asientoEditando.numero,
        fecha: asientoEditando.fecha,
        descripcion: asientoEditando.descripcion,
        detalles: asientoEditando.detalles.length > 0 
          ? asientoEditando.detalles 
          : [
              { codigoCuenta: '', denominacionCuenta: '', debe: 0, haber: 0 },
              { codigoCuenta: '', denominacionCuenta: '', debe: 0, haber: 0 }
            ]
      });
    } else {
      console.log('➕ Creando nuevo asiento - calculando número correlativo');
      
      // Generar número correlativo automático
      const siguienteNumero = calcularSiguienteNumero();
      console.log(`🎯 Número asignado al nuevo asiento: ${siguienteNumero}`);
      
      setFormData(prev => ({ 
        ...prev, 
        numero: siguienteNumero,
        // Resetear otros campos para nuevo asiento
        descripcion: '',
        detalles: [
          { codigoCuenta: '', denominacionCuenta: '', debe: 0, haber: 0 },
          { codigoCuenta: '', denominacionCuenta: '', debe: 0, haber: 0 }
        ]
      }));
    }
  }, [asientoEditando, asientosExistentes]);

  // Cargar cuentas disponibles
  useEffect(() => {
    const cargarCuentas = async () => {
      try {
        // Usar la misma lógica que PlanContablePage para obtener datos reales
        const params = {
          activos_solo: true,
          empresa_id: 'empresa_demo', // En una app real, esto vendría del contexto
          tipo_plan: 'estandar' as const
        };
        
        const cuentasData = await ContabilidadApiService.getCuentas(params);
        
        // Filtrar solo cuentas que permiten movimientos
        const cuentasHoja = cuentasData.filter(cuenta => 
          cuenta.acepta_movimiento !== false && cuenta.es_hoja !== false
        );
        
        setCuentasDisponibles(cuentasHoja);
        console.log(`✅ Cuentas cargadas: ${cuentasHoja.length} disponibles para asientos`);
        
      } catch (error) {
        console.error('❌ Error cargando cuentas:', error);
        
        // Fallback: intentar sin parámetros específicos
        try {
          const cuentasData = await ContabilidadApiService.getCuentas({ activos_solo: true });
          const cuentasHoja = cuentasData.filter(cuenta => 
            cuenta.acepta_movimiento !== false && cuenta.es_hoja !== false
          );
          setCuentasDisponibles(cuentasHoja);
          console.log(`✅ Fallback exitoso: ${cuentasHoja.length} cuentas`);
        } catch (fallbackError) {
          console.error('❌ Fallback falló:', fallbackError);
          setCuentasDisponibles([]);
        }
      }
    };

    cargarCuentas();
  }, []);

  const agregarDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        { codigoCuenta: '', denominacionCuenta: '', debe: 0, haber: 0 }
      ]
    }));
  };

  const eliminarDetalle = (index: number) => {
    if (formData.detalles.length <= 2) return; // Mínimo 2 detalles
    
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const actualizarDetalle = (index: number, campo: keyof DetalleAsiento, valor: any) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map((detalle, i) => 
        i === index ? { ...detalle, [campo]: valor } : detalle
      )
    }));
  };

  const actualizarCuentaDetalle = (index: number, cuenta: CuentaContable) => {
    console.log('Actualizando cuenta detalle:', { index, cuenta });
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map((detalle, i) => 
        i === index ? { 
          ...detalle, 
          codigoCuenta: cuenta.codigo,
          denominacionCuenta: cuenta.descripcion 
        } : detalle
      )
    }));
  };

  const actualizarCodigoCuenta = (index: number, codigo: string) => {
    // Buscar la cuenta automáticamente
    const cuentaEncontrada = cuentasDisponibles.find(cuenta => cuenta.codigo === codigo);
    console.log('Buscando cuenta por código:', { codigo, cuentaEncontrada });
    
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map((detalle, i) => 
        i === index ? { 
          ...detalle, 
          codigoCuenta: codigo,
          denominacionCuenta: cuentaEncontrada ? cuentaEncontrada.descripcion : ''
        } : detalle
      )
    }));
  };

  const aplicarPlantilla = (detalles: DetalleAsiento[], descripcion: string) => {
    // ✅ MEJORADO: Resolver descripciones dinámicamente usando cuentas disponibles
    const detallesConDescripciones = detalles.map(detalle => {
      const cuentaEncontrada = cuentasDisponibles.find(cuenta => cuenta.codigo === detalle.codigoCuenta);
      console.log('🔄 Resolviendo cuenta de plantilla:', { 
        codigo: detalle.codigoCuenta, 
        encontrada: !!cuentaEncontrada,
        descripcion: cuentaEncontrada?.descripcion 
      });
      
      return {
        ...detalle,
        denominacionCuenta: cuentaEncontrada ? cuentaEncontrada.descripcion : ''
      };
    });
    
    setFormData(prev => ({
      ...prev,
      detalles: detallesConDescripciones,
      descripcion: descripcion
    }));
    setMostrarPlantillas(false);
  };

  const validarFormulario = (): string[] => {
    const errores: string[] = [];

    if (!formData.numero) errores.push('Número es requerido');
    if (!formData.fecha) errores.push('Fecha es requerida');
    if (!formData.descripcion) errores.push('Descripción es requerida');
    if (formData.detalles.length < 2) errores.push('Debe tener al menos 2 detalles');

    // Validar que el número no esté duplicado (solo si no estamos editando)
    if (!asientoEditando && asientosExistentes) {
      const numeroExistente = asientosExistentes.find(asiento => asiento.numero === formData.numero);
      if (numeroExistente) {
        errores.push(`El número ${formData.numero} ya existe. Use un número diferente.`);
      }
    }

    // Validar que el número sea un formato válido
    if (formData.numero && !/^\d{4}$/.test(formData.numero)) {
      errores.push('El número debe tener exactamente 4 dígitos (ej: 0001)');
    }

    // Validar cada detalle
    formData.detalles.forEach((detalle, index) => {
      if (!detalle.codigoCuenta) errores.push(`Detalle ${index + 1}: Código de cuenta es requerido`);
      if (!detalle.denominacionCuenta) errores.push(`Detalle ${index + 1}: Denominación es requerida`);
      
      const debe = detalle.debe || 0;
      const haber = detalle.haber || 0;
      
      if (debe === 0 && haber === 0) {
        errores.push(`Detalle ${index + 1}: Debe especificar un valor en Debe o Haber`);
      }
      
      if (debe > 0 && haber > 0) {
        errores.push(`Detalle ${index + 1}: No puede tener valores en Debe y Haber al mismo tiempo`);
      }
      
      if (debe < 0 || haber < 0) {
        errores.push(`Detalle ${index + 1}: Los valores no pueden ser negativos`);
      }
    });

    // Validar balance
    const totalDebe = formData.detalles.reduce((sum, d) => sum + (d.debe || 0), 0);
    const totalHaber = formData.detalles.reduce((sum, d) => sum + (d.haber || 0), 0);
    
    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      errores.push('El asiento debe estar balanceado (Total Debe = Total Haber)');
    }

    return errores;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const erroresValidacion = validarFormulario();
    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setLoading(true);
    setErrores([]);

    try {
      await onGuardar({
        numero: formData.numero,
        fecha: formData.fecha,
        descripcion: formData.descripcion,
        detalles: formData.detalles,
        empresaId: '', // Se completará en el backend
        libroId
      });
    } catch (error) {
      setErrores([`Error al guardar: ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotales = () => {
    const totalDebe = formData.detalles.reduce((sum, d) => sum + (d.debe || 0), 0);
    const totalHaber = formData.detalles.reduce((sum, d) => sum + (d.haber || 0), 0);
    return { totalDebe, totalHaber, balanceado: Math.abs(totalDebe - totalHaber) < 0.01 };
  };

  const totales = calcularTotales();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 10
        }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: '600' }}>
              {asientoEditando ? '✏️ Editar Asiento' : '➕ Nuevo Asiento'}
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              Libro ID: {libroId}
            </p>
          </div>
          
          <button
            onClick={onCerrar}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Datos Generales */}
          <div style={{ padding: '32px' }}>
            <div style={{ 
              margin: '0 0 24px 0', 
              fontSize: '1.25rem', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#1f2937'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📋</span>
                Datos Generales del Asiento
              </div>
              
              {/* Botones de plantillas y ejemplos */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setMostrarPlantillas(true)}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🚀</span>
                  Usar Plantilla
                </button>

                {/* ❌ ELIMINADO: Botón de ejemplos removido según requerimientos */}
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <span style={{ fontSize: '16px' }}>🔢</span>
                  Número de Asiento:
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      fontFamily: 'monospace',
                      backgroundColor: asientoEditando ? 'white' : '#f8fafc'
                    }}
                    placeholder={asientoEditando ? "Número del asiento" : "Auto-generado: 0001, 0002, 0003..."}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    readOnly={!asientoEditando} // Solo editable cuando se está editando un asiento existente
                  />
                  {!asientoEditando && (
                    <button
                      type="button"
                      onClick={() => {
                        const nuevoNumero = calcularSiguienteNumero();
                        setFormData(prev => ({ ...prev, numero: nuevoNumero }));
                        console.log('🔄 Número regenerado:', nuevoNumero);
                      }}
                      style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        minWidth: 'auto',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      title="Regenerar número automáticamente"
                    >
                      🔄
                    </button>
                  )}
                </div>
                {!asientoEditando && (
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px',
                    fontStyle: 'italic'
                  }}>
                    ✨ Número correlativo generado automáticamente. Haga clic en 🔄 para regenerar.
                  </div>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <span style={{ fontSize: '16px' }}>📅</span>
                  Fecha del Asiento:
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <span style={{ fontSize: '16px' }}>📝</span>
                  Descripción General (Glosa):
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="Ej: Compra de mercadería según factura 001-123 del proveedor ABC S.A.C."
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>

          {/* Detalles del Asiento */}
          <div style={{ padding: '0 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>💰</span>
                Detalles del Asiento Contable
              </h4>
              <div style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                borderRadius: '20px',
                fontSize: '14px',
                color: '#64748b',
                fontWeight: '600',
                border: '1px solid #e2e8f0'
              }}>
                📋 {formData.detalles.length} línea{formData.detalles.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Instrucciones breves */}
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #93c5fd',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#1e40af'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', marginBottom: '4px' }}>
                <span>💡</span>
                Instrucciones:
              </div>
              <ul style={{ margin: '0', paddingLeft: '16px', lineHeight: '1.4' }}>
                <li><strong>Código:</strong> Ingresa el código de cuenta (ej: 101101)</li>
                <li><strong>Denominación:</strong> Se autocompletará automáticamente con el nombre de la cuenta</li>
                <li><strong>Debe/Haber:</strong> Ingresa el importe solo en una columna por línea</li>
              </ul>
            </div>

            {/* Header de la tabla */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '400px 120px 120px 60px',
              gap: '12px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: '8px',
              marginBottom: '12px',
              fontWeight: '600',
              fontSize: '14px',
              color: '#374151',
              border: '1px solid #e2e8f0'
            }}>
              <div>🏦 Código + Denominación</div>
              <div style={{ textAlign: 'center' }}>💰 Debe</div>
              <div style={{ textAlign: 'center' }}>💳 Haber</div>
              <div style={{ textAlign: 'center' }}>🗑️</div>
            </div>

            {/* Líneas de detalle */}
            {formData.detalles.map((detalle, index) => (
              <div key={index} style={{
                display: 'grid',
                gridTemplateColumns: '400px 120px 120px 60px',
                gap: '12px',
                padding: '12px 16px',
                background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                borderRadius: '8px',
                marginBottom: '8px',
                alignItems: 'start',
                border: '1px solid #f1f5f9',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#f1f5f9';
              }}
              >
                {/* Número de línea */}
                <div style={{
                  position: 'absolute',
                  left: '-12px',
                  top: '12px',
                  width: '24px',
                  height: '24px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                }}>
                  {index + 1}
                </div>

                {/* Componente de código y denominación */}
                <div>
                  <CuentaCodigoDetalle
                    codigo={detalle.codigoCuenta}
                    denominacion={detalle.denominacionCuenta}
                    onCodigoChange={(codigo) => actualizarCodigoCuenta(index, codigo)}
                    onCuentaSelect={(cuenta) => actualizarCuentaDetalle(index, cuenta)}
                    placeholder="Ej: 101101"
                    error={!detalle.codigoCuenta && formData.detalles.some(d => d.codigoCuenta)}
                    cuentasDisponibles={cuentasDisponibles}
                    lineaId={`L${index + 1}`}
                  />
                </div>

                {/* Campo Debe */}
                <div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    Debe
                  </div>
                  <input
                    type="number"
                    value={detalle.debe || ''}
                    onChange={(e) => {
                      const valor = parseFloat(e.target.value) || 0;
                      actualizarDetalle(index, 'debe', valor);
                      // Limpiar haber si se ingresa debe
                      if (valor > 0) {
                        actualizarDetalle(index, 'haber', 0);
                      }
                    }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `2px solid ${detalle.debe && detalle.debe > 0 ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      textAlign: 'right',
                      outline: 'none',
                      background: detalle.debe && detalle.debe > 0 ? '#f0fdf4' : 'white'
                    }}
                  />
                </div>

                {/* Campo Haber */}
                <div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    Haber
                  </div>
                  <input
                    type="number"
                    value={detalle.haber || ''}
                    onChange={(e) => {
                      const valor = parseFloat(e.target.value) || 0;
                      actualizarDetalle(index, 'haber', valor);
                      // Limpiar debe si se ingresa haber
                      if (valor > 0) {
                        actualizarDetalle(index, 'debe', 0);
                      }
                    }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `2px solid ${detalle.haber && detalle.haber > 0 ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      textAlign: 'right',
                      outline: 'none',
                      background: detalle.haber && detalle.haber > 0 ? '#fef2f2' : 'white'
                    }}
                  />
                </div>

                {/* Botón eliminar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => eliminarDetalle(index)}
                    disabled={formData.detalles.length <= 2}
                    style={{
                      width: '36px',
                      height: '36px',
                      background: formData.detalles.length <= 2 
                        ? 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' 
                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: formData.detalles.length <= 2 ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: formData.detalles.length <= 2 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: formData.detalles.length > 2 ? '0 2px 4px rgba(239, 68, 68, 0.3)' : 'none'
                    }}
                    title={formData.detalles.length <= 2 ? 'Mínimo 2 líneas requeridas' : 'Eliminar línea'}
                    onMouseEnter={(e) => {
                      if (formData.detalles.length > 2) {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = formData.detalles.length > 2 
                        ? '0 2px 4px rgba(239, 68, 68, 0.3)' 
                        : 'none';
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {/* Botón para agregar línea */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '24px'
            }}>
              <button
                type="button"
                onClick={agregarDetalle}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                <span style={{ fontSize: '16px' }}>➕</span>
                Agregar Nueva Línea
              </button>
            </div>

            {/* Totales mejorados */}
            <div style={{
              marginTop: '24px',
              padding: '24px',
              background: totales.balanceado 
                ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' 
                : 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
              border: `3px solid ${totales.balanceado ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '12px',
              boxShadow: totales.balanceado 
                ? '0 8px 25px rgba(16, 185, 129, 0.15)' 
                : '0 8px 25px rgba(239, 68, 68, 0.15)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                alignItems: 'center'
              }}>
                {/* Total Debe */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '20px' }}>💰</span>
                    <span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '600' }}>
                      Total Debe
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#059669',
                    fontFamily: 'monospace'
                  }}>
                    S/ {totales.totalDebe.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Total Haber */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '20px' }}>💳</span>
                    <span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '600' }}>
                      Total Haber
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#dc2626',
                    fontFamily: 'monospace'
                  }}>
                    S/ {totales.totalHaber.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Estado del Balance */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '20px' }}>⚖️</span>
                    <span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '600' }}>
                      Estado
                    </span>
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: '700',
                    background: totales.balanceado 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    boxShadow: totales.balanceado 
                      ? '0 4px 12px rgba(16, 185, 129, 0.3)' 
                      : '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}>
                    <span style={{ fontSize: '18px' }}>
                      {totales.balanceado ? '✅' : '⚠️'}
                    </span>
                    {totales.balanceado ? 'BALANCEADO' : 'DESBALANCEADO'}
                  </div>
                </div>

                {/* Diferencia (solo si está desbalanceado) */}
                {!totales.balanceado && (
                  <div style={{ textAlign: 'center', gridColumn: '1 / -1' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid #fecaca'
                    }}>
                      <span style={{ fontSize: '16px' }}>📊</span>
                      <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>
                        Diferencia: S/ {Math.abs(totales.totalDebe - totales.totalHaber).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Errores */}
          {errores.length > 0 && (
            <div style={{ margin: '0 24px 24px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>❌ Errores de Validación:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {errores.map((error, index) => (
                  <li key={index} style={{ color: '#dc2626', fontSize: '14px' }}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer con botones */}
          <div style={{
            padding: '24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            position: 'sticky',
            bottom: 0,
            background: 'white'
          }}>
            <button
              type="button"
              onClick={onCerrar}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading || !totales.balanceado}
              style={{
                background: loading || !totales.balanceado ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                cursor: loading || !totales.balanceado ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? '⏳' : '💾'} 
              {loading ? 'Guardando...' : (asientoEditando ? 'Actualizar' : 'Crear Asiento')}
            </button>
          </div>
        </form>
      </div>
      
      {/* Selector de plantillas */}
      {mostrarPlantillas && (
        <SelectorPlantillas
          onSeleccionarPlantilla={aplicarPlantilla}
          onCerrar={() => setMostrarPlantillas(false)}
        />
      )}

      {/* ❌ ELIMINADO: Modal de ejemplos removido según requerimientos */}
    </div>
  );
};

export default FormularioAsiento;
