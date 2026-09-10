import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Info,
  Loader2,
  Plus,
  RotateCw,
  Sparkles,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import type { AsientoContable, DetalleAsiento } from '../../../types/libroDiario';
import type { CuentaContable } from '../../../types/contabilidad';
import { ContabilidadApiService } from '../../../services/contabilidadApi';
import CuentaCodigoDetalle from './CuentaCodigoDetalle';
import SelectorPlantillas from './SelectorPlantillas';
import useEmpresaActual from '../../../hooks/useEmpresaActual';
import { fieldControl } from '../../common/FormField';
import { cn } from '../../../lib/cn';
// ❌ ELIMINADO: import EjemplosAsientos ya no es necesario

interface FormularioAsientoProps {
  libroId: string;
  asientoEditando?: AsientoContable | null;
  asientosExistentes?: AsientoContable[];
  onGuardar: (asiento: Omit<AsientoContable, 'id'>) => Promise<void>;
  onCerrar: () => void;
}

const soles = (n: number): string =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const FormularioAsiento: React.FC<FormularioAsientoProps> = ({
  libroId,
  asientoEditando,
  asientosExistentes = [],
  onGuardar,
  onCerrar
}) => {

  const { empresa } = useEmpresaActual();
  const empresaId = empresa?.ruc ?? '';

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
    
    // Verificar si hay asientos existentes
    if (!asientosExistentes || asientosExistentes.length === 0) {
      return '0001';
    }

    // Obtener todos los números de asientos existentes y procesarlos
    const numerosValidos = asientosExistentes
      .map(asiento => {
        return asiento.numero;
      })
      .filter(numero => {
        // Filtrar solo números válidos (pueden tener ceros a la izquierda)
        const esNumerico = /^\d+$/.test(numero);
        return esNumerico;
      })
      .map(numero => parseInt(numero, 10))
      .filter(numero => !isNaN(numero) && numero > 0) // Excluir números inválidos o cero
      .sort((a, b) => a - b); // Ordenar de menor a mayor


    // Si no hay números válidos, empezar desde 0001
    if (numerosValidos.length === 0) {
      return '0001';
    }

    // Encontrar el número más alto y sumar 1
    const numeroMasAlto = Math.max(...numerosValidos);
    const siguienteNumero = numeroMasAlto + 1;
    const numeroFormateado = siguienteNumero.toString().padStart(4, '0');


    return numeroFormateado;
  };

  useEffect(() => {
    
    if (asientoEditando) {
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
      
      // Generar número correlativo automático
      const siguienteNumero = calcularSiguienteNumero();
      
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
          // Antes era la constante 'empresa_demo': se cargaba el plan contable
          // de una empresa inexistente, asi que el selector salia vacio.
          empresa_id: empresaId,
          tipo_plan: 'estandar' as const
        };
        
        const cuentasData = await ContabilidadApiService.getCuentas(params);
        
        // Filtrar solo cuentas que permiten movimientos
        const cuentasHoja = cuentasData.filter(cuenta => 
          cuenta.acepta_movimiento !== false && cuenta.es_hoja !== false
        );
        
        setCuentasDisponibles(cuentasHoja);
        
      } catch (error) {
        console.error('❌ Error cargando cuentas:', error);
        
        // Fallback: intentar sin parámetros específicos
        try {
          const cuentasData = await ContabilidadApiService.getCuentas({ activos_solo: true });
          const cuentasHoja = cuentasData.filter(cuenta => 
            cuenta.acepta_movimiento !== false && cuenta.es_hoja !== false
          );
          setCuentasDisponibles(cuentasHoja);
        } catch (fallbackError) {
          console.error('❌ Fallback falló:', fallbackError);
          setCuentasDisponibles([]);
        }
      }
    };

    // Depende de la empresa: al cambiarla hay que recargar su plan contable.
    if (empresaId) cargarCuentas();
  }, [empresaId]);

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
  const diferencia = Math.abs(totales.totalDebe - totales.totalHaber);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ---------------------------------------------------------------- */}
        {/* Datos generales                                                   */}
        {/* ---------------------------------------------------------------- */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Datos generales</h3>
            <button
              type="button"
              onClick={() => setMostrarPlantillas(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Usar plantilla
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="fa-numero" className="mb-1.5 block text-sm font-medium text-slate-700">
                Número de asiento
              </label>
              <div className="flex gap-2">
                <input
                  id="fa-numero"
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData((prev) => ({ ...prev, numero: e.target.value }))}
                  placeholder={asientoEditando ? 'Número del asiento' : 'Auto: 0001, 0002…'}
                  readOnly={!asientoEditando}
                  className={cn(fieldControl(false), 'font-mono', !asientoEditando && 'bg-slate-50')}
                />
                {!asientoEditando && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, numero: calcularSiguienteNumero() }))
                    }
                    title="Regenerar número automáticamente"
                    aria-label="Regenerar número"
                    className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white p-0 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  >
                    <RotateCw className="size-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              {!asientoEditando && (
                <p className="mt-1.5 text-xs text-slate-500">
                  Correlativo generado automáticamente.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="fa-fecha" className="mb-1.5 block text-sm font-medium text-slate-700">
                Fecha del asiento
              </label>
              <input
                id="fa-fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
                className={fieldControl(false)}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="fa-descripcion"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Descripción general (glosa)
              </label>
              <textarea
                id="fa-descripcion"
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Describe la operación registrada en este asiento"
                className={cn(fieldControl(false), 'resize-y')}
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Detalle                                                           */}
        {/* ---------------------------------------------------------------- */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Detalle del asiento</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 tabular-nums">
              {formData.detalles.length} línea{formData.detalles.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <Info className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
            <ul className="space-y-0.5 text-xs text-blue-900">
              <li>
                <strong>Código:</strong> escribe el código de cuenta (ej. 101101).
              </li>
              <li>
                <strong>Denominación:</strong> se autocompleta con el nombre de la cuenta.
              </li>
              <li>
                <strong>Debe / Haber:</strong> el importe va solo en una de las dos columnas.
              </li>
            </ul>
          </div>

          {/* Cabecera de columnas (solo en pantallas anchas) */}
          <div className="hidden gap-3 px-3 lg:grid lg:grid-cols-[2.5rem_minmax(0,1fr)_9rem_9rem_2.5rem]">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">#</span>
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Cuenta
            </span>
            <span className="text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Debe
            </span>
            <span className="text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Haber
            </span>
            <span className="sr-only">Acciones</span>
          </div>

          <ul className="space-y-3">
            {formData.detalles.map((detalle, index) => (
              <li
                key={index}
                className="grid items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[2.5rem_minmax(0,1fr)_9rem_9rem_2.5rem]"
              >
                <span className="grid size-8 place-items-center rounded-full bg-white text-xs font-bold text-slate-500 tabular-nums">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <CuentaCodigoDetalle
                    codigo={detalle.codigoCuenta}
                    denominacion={detalle.denominacionCuenta}
                    onCodigoChange={(codigo) => actualizarCodigoCuenta(index, codigo)}
                    onCuentaSelect={(cuenta) => actualizarCuentaDetalle(index, cuenta)}
                    placeholder="Ej: 101101"
                    error={!detalle.codigoCuenta && formData.detalles.some((d) => d.codigoCuenta)}
                    cuentasDisponibles={cuentasDisponibles}
                    lineaId={`L${index + 1}`}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`fa-debe-${index}`}
                    className="mb-1 block text-xs font-medium text-slate-500 lg:sr-only"
                  >
                    Debe
                  </label>
                  <input
                    id={`fa-debe-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={detalle.debe || ''}
                    onChange={(e) => {
                      const valor = parseFloat(e.target.value) || 0;
                      actualizarDetalle(index, 'debe', valor);
                      // Una linea carga en el debe o en el haber, nunca en ambos.
                      if (valor > 0) actualizarDetalle(index, 'haber', 0);
                    }}
                    className={cn(fieldControl(false), 'text-right tabular-nums')}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`fa-haber-${index}`}
                    className="mb-1 block text-xs font-medium text-slate-500 lg:sr-only"
                  >
                    Haber
                  </label>
                  <input
                    id={`fa-haber-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={detalle.haber || ''}
                    onChange={(e) => {
                      const valor = parseFloat(e.target.value) || 0;
                      actualizarDetalle(index, 'haber', valor);
                      if (valor > 0) actualizarDetalle(index, 'debe', 0);
                    }}
                    className={cn(fieldControl(false), 'text-right tabular-nums')}
                  />
                </div>

                <div className="flex justify-end lg:pt-1">
                  <button
                    type="button"
                    onClick={() => eliminarDetalle(index)}
                    disabled={formData.detalles.length <= 2}
                    title={
                      formData.detalles.length <= 2
                        ? 'Un asiento necesita al menos 2 líneas'
                        : 'Eliminar línea'
                    }
                    aria-label={`Eliminar línea ${index + 1}`}
                    className="grid size-8 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={agregarDetalle}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <Plus className="size-4" aria-hidden="true" />
            Agregar línea
          </button>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Totales                                                           */}
        {/* ---------------------------------------------------------------- */}
        <section
          className={cn(
            'grid gap-4 rounded-xl border px-4 py-3.5 sm:grid-cols-3',
            totales.balanceado ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          )}
        >
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Total debe</p>
            <p className="text-lg font-bold text-blue-700 tabular-nums">
              {soles(totales.totalDebe)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Total haber</p>
            <p className="text-lg font-bold text-violet-700 tabular-nums">
              {soles(totales.totalHaber)}
            </p>
          </div>
          <div>
            <p
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase',
                totales.balanceado ? 'text-green-700' : 'text-red-700'
              )}
            >
              {totales.balanceado ? (
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
              ) : (
                <TriangleAlert className="size-3.5" aria-hidden="true" />
              )}
              {totales.balanceado ? 'Balanceado' : 'Diferencia'}
            </p>
            <p
              className={cn(
                'text-lg font-bold tabular-nums',
                totales.balanceado ? 'text-green-700' : 'text-red-700'
              )}
            >
              {totales.balanceado ? soles(totales.totalDebe) : soles(diferencia)}
            </p>
          </div>
        </section>

        {/* Errores de validación */}
        {errores.length > 0 && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-red-800">
              <TriangleAlert className="size-4" aria-hidden="true" />
              Revisa estos puntos
            </p>
            <ul className="list-disc space-y-0.5 pl-5 text-sm text-red-700">
              {errores.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !totales.balanceado}
            title={!totales.balanceado ? 'El asiento debe cuadrar antes de guardarse' : undefined}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Guardando…' : asientoEditando ? 'Actualizar asiento' : 'Crear asiento'}
          </button>
        </div>
      </form>

      {mostrarPlantillas && (
        <SelectorPlantillas
          onSeleccionarPlantilla={aplicarPlantilla}
          onCerrar={() => setMostrarPlantillas(false)}
        />
      )}
    </>
  );
};

export default FormularioAsiento;
