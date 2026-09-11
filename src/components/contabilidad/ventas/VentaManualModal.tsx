/**
 * Alta de un comprobante de venta a mano.
 *
 * El registro de ventas se alimenta sobre todo del SIRE, pero hay comprobantes
 * que todavia no estan en SUNAT o que simplemente hay que capturar. Este
 * formulario cubre ese caso.
 *
 * Dos decisiones que explican como esta armado:
 *
 * 1. El PLE 140000 tiene 34 campos y pedirlos todos seria inutilizable. Se
 *    piden los que el usuario conoce y el resto va en cero, que es su valor
 *    real en una venta corriente.
 * 2. En vez de una casilla por cada base imponible, se elige la **naturaleza**
 *    de la operacion. Es lo mismo que mira el sistema para decidir el
 *    subdiario, asi que el comprobante nace clasificado igual que si hubiera
 *    entrado por el SIRE.
 */

import React, { useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import type {
  RegistroVentaRequest,
  TipoComprobanteVenta,
  TipoDocumentoCliente,
} from '../../../types/ventas';
import { cn } from '../../../lib/cn';

const control = cn(
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
  'placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
);
const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase';

/** Tasa vigente del IGV. Solo se aplica a la base gravada. */
const TASA_IGV = 0.18;

type Naturaleza = 'GRAVADA' | 'EXONERADA' | 'INAFECTA' | 'EXPORTACION';

const NATURALEZAS: { valor: Naturaleza; etiqueta: string; ayuda: string }[] = [
  { valor: 'GRAVADA', etiqueta: 'Gravada', ayuda: 'con IGV' },
  { valor: 'EXONERADA', etiqueta: 'Exonerada', ayuda: 'sin IGV' },
  { valor: 'INAFECTA', etiqueta: 'Inafecta', ayuda: 'sin IGV' },
  { valor: 'EXPORTACION', etiqueta: 'Exportación', ayuda: 'sin IGV' },
];

const TIPOS_COMPROBANTE: { valor: TipoComprobanteVenta; etiqueta: string }[] = [
  { valor: '01', etiqueta: '01 · Factura' },
  { valor: '03', etiqueta: '03 · Boleta' },
  { valor: '07', etiqueta: '07 · Nota de crédito' },
  { valor: '08', etiqueta: '08 · Nota de débito' },
];

const TIPOS_DOCUMENTO: { valor: TipoDocumentoCliente; etiqueta: string }[] = [
  { valor: '6', etiqueta: 'RUC' },
  { valor: '1', etiqueta: 'DNI' },
  { valor: '4', etiqueta: 'Carnet de extranjería' },
  { valor: '7', etiqueta: 'Pasaporte' },
  { valor: '0', etiqueta: 'Sin documento' },
];

const soles = (n: number): string =>
  `S/ ${(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const redondear = (n: number): number => Math.round(n * 100) / 100;

interface Props {
  periodo: string;
  onCancelar: () => void;
  onGuardar: (venta: RegistroVentaRequest) => Promise<void>;
}

const VentaManualModal: React.FC<Props> = ({ periodo, onCancelar, onGuardar }) => {
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumentoCliente>('6');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [razonSocial, setRazonSocial] = useState('');

  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobanteVenta>('01');
  const [serie, setSerie] = useState('');
  const [numero, setNumero] = useState('');
  const [fecha, setFecha] = useState('');

  const [naturaleza, setNaturaleza] = useState<Naturaleza>('GRAVADA');
  const [baseTexto, setBaseTexto] = useState('');
  // El IGV se calcula, pero se puede corregir: el del comprobante manda sobre
  // el que salga de multiplicar, que puede diferir en centimos.
  const [igvEditado, setIgvEditado] = useState<string | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = redondear(Number(baseTexto) || 0);

  const igv = useMemo(() => {
    if (naturaleza !== 'GRAVADA') return 0;
    if (igvEditado !== null) return redondear(Number(igvEditado) || 0);
    return redondear(base * TASA_IGV);
  }, [base, naturaleza, igvEditado]);

  const total = redondear(base + igv);

  const faltan =
    !numeroDocumento.trim() || !razonSocial.trim() || !numero.trim() || !fecha || base <= 0;

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (faltan || guardando) return;

    setGuardando(true);
    setError(null);

    // El backend valida que las bases mas los tributos cuadren con el total,
    // por eso el total sale de la suma y no de una casilla aparte.
    const venta: RegistroVentaRequest = {
      tipo_documento_cliente: tipoDocumento,
      numero_documento_cliente: numeroDocumento.trim(),
      razon_social_cliente: razonSocial.trim(),

      tipo_comprobante: tipoComprobante,
      serie_comprobante: serie.trim() || undefined,
      numero_comprobante: numero.trim(),
      fecha_emision: fecha,

      valor_facturado_exportacion: naturaleza === 'EXPORTACION' ? base : 0,
      base_imponible_gravada: naturaleza === 'GRAVADA' ? base : 0,
      descuento_base_imponible: 0,
      igv_ipm: igv,
      descuento_igv_ipm: 0,
      importe_exonerado: naturaleza === 'EXONERADA' ? base : 0,
      importe_inafecto: naturaleza === 'INAFECTA' ? base : 0,
      isc: 0,
      base_imponible_ivap: 0,
      ivap: 0,
      otros_tributos_cargos: 0,
      importe_total: total,

      codigo_moneda: 'PEN',
      tipo_cambio: 1,
      otros_conceptos_tributos: 0,
      base_imponible_icbper: 0,
      icbper: 0,

      indicador_error: '0',
      estado_operacion: 1,
    };

    try {
      await onGuardar(venta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el comprobante');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="venta-manual-titulo"
    >
      <form
        onSubmit={enviar}
        className="my-8 w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="venta-manual-titulo" className="text-base font-semibold text-slate-900">
              Nuevo comprobante de venta
            </h2>
            <p className="text-sm text-slate-500">
              Se registra en el periodo <span className="font-mono">{periodo}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelar}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 px-5 py-5">
          {/* Cliente */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-slate-900">Cliente</legend>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="vm-tipodoc" className={labelClass}>
                  Documento
                </label>
                <select
                  id="vm-tipodoc"
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value as TipoDocumentoCliente)}
                  className={control}
                >
                  {TIPOS_DOCUMENTO.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.etiqueta}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vm-numdoc" className={labelClass}>
                  Número
                </label>
                <input
                  id="vm-numdoc"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  placeholder="20123456789"
                  className={cn(control, 'font-mono')}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="vm-razon" className={labelClass}>
                  Razón social
                </label>
                <input
                  id="vm-razon"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="EMPRESA EJEMPLO S.A.C."
                  className={control}
                />
              </div>
            </div>
          </fieldset>

          {/* Comprobante */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-slate-900">Comprobante</legend>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="vm-tipo" className={labelClass}>
                  Tipo
                </label>
                <select
                  id="vm-tipo"
                  value={tipoComprobante}
                  onChange={(e) => setTipoComprobante(e.target.value as TipoComprobanteVenta)}
                  className={control}
                >
                  {TIPOS_COMPROBANTE.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.etiqueta}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vm-serie" className={labelClass}>
                  Serie
                </label>
                <input
                  id="vm-serie"
                  value={serie}
                  onChange={(e) => setSerie(e.target.value.toUpperCase())}
                  placeholder="F001"
                  className={cn(control, 'font-mono')}
                />
              </div>

              <div>
                <label htmlFor="vm-numero" className={labelClass}>
                  Número
                </label>
                <input
                  id="vm-numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="123"
                  className={cn(control, 'font-mono')}
                />
              </div>

              <div>
                <label htmlFor="vm-fecha" className={labelClass}>
                  Fecha de emisión
                </label>
                <input
                  id="vm-fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className={control}
                />
              </div>
            </div>
          </fieldset>

          {/* Importes */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-slate-900">Importes</legend>

            <div className="mb-4 flex flex-wrap gap-2">
              {NATURALEZAS.map((n) => (
                <button
                  key={n.valor}
                  type="button"
                  onClick={() => {
                    setNaturaleza(n.valor);
                    setIgvEditado(null);
                  }}
                  aria-pressed={naturaleza === n.valor}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    naturaleza === n.valor
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {n.etiqueta}
                  <span className="ml-1.5 text-xs font-normal text-slate-500">{n.ayuda}</span>
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="vm-base" className={labelClass}>
                  Importe sin IGV
                </label>
                <input
                  id="vm-base"
                  type="number"
                  step="0.01"
                  min="0"
                  value={baseTexto}
                  onChange={(e) => setBaseTexto(e.target.value)}
                  placeholder="0.00"
                  className={cn(control, 'tabular-nums')}
                />
              </div>

              <div>
                <label htmlFor="vm-igv" className={labelClass}>
                  IGV
                </label>
                <input
                  id="vm-igv"
                  type="number"
                  step="0.01"
                  min="0"
                  value={naturaleza === 'GRAVADA' ? (igvEditado ?? String(igv)) : '0'}
                  onChange={(e) => setIgvEditado(e.target.value)}
                  disabled={naturaleza !== 'GRAVADA'}
                  className={cn(
                    control,
                    'tabular-nums disabled:bg-slate-100 disabled:text-slate-400'
                  )}
                />
              </div>

              <div>
                <p className={labelClass}>Total</p>
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold tabular-nums text-slate-900">
                  {soles(total)}
                </p>
              </div>
            </div>
          </fieldset>

          {error && (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={faltan || guardando}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {guardando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Guardar comprobante
          </button>
        </div>
      </form>
    </div>
  );
};

export default VentaManualModal;
