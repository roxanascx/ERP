/**
 * Alta y modificacion de un subdiario.
 *
 * Sigue la forma de la pantalla de mantenimiento del software contable: datos
 * de cabecera arriba y, debajo, las casillas de "Considerar subdiario para",
 * que son independientes entre si. Caja y Bancos llevan ademas su propio
 * desplegable de modo.
 *
 * Las cuentas aparecen segun para que sirva el subdiario: las de venta si esta
 * marcado "Asiento de Ventas" y las de compra si lo esta "Asiento de Compras".
 * Un subdiario marcado para los dos ve los dos bloques.
 */

import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { TextField, SelectField, CheckboxField } from '../common/FormField';
import {
  ETIQUETA_NATURALEZA,
  ETIQUETA_NATURALEZA_COMPRA,
  type NaturalezaCompra,
  type NaturalezaVenta,
  type Subdiario,
} from '../../services/subdiariosApi';

interface Props {
  abierto: boolean;
  subdiario: Subdiario | null;
  onCerrar: () => void;
  onGuardar: (datos: Partial<Subdiario>) => Promise<void>;
}

const NATURALEZAS: NaturalezaVenta[] = [
  'EXPORTACION',
  'GRAVADA',
  'EXONERADA',
  'INAFECTA',
  'MIXTO',
  'GRAVADA_IGV_10',
];

/** Las naturalezas de venta que trasladan IGV y por tanto necesitan la cuenta 40. */
const LLEVAN_IGV: NaturalezaVenta[] = ['GRAVADA', 'GRAVADA_IGV_10', 'MIXTO'];

const NATURALEZAS_COMPRA: NaturalezaCompra[] = [
  'GRAVADA',
  'NO_GRAVADA',
  'MIXTA',
  'IMPORTACION',
  'GRAVADA_Y_NO_GRAVADA',
  'SIN_DERECHO_CREDITO',
  'GRAVADA_IGV_10',
];

/**
 * Las naturalezas de compra que dan derecho a credito fiscal.
 *
 * Las que faltan no lo llevan por motivos distintos: en NO_GRAVADA no hay IGV,
 * y en SIN_DERECHO_CREDITO si lo hay pero la ley no deja usarlo, asi que se
 * suma al costo. En ninguno de los dos casos hace falta la cuenta 40.
 */
const LLEVAN_CREDITO_FISCAL: NaturalezaCompra[] = [
  'GRAVADA',
  'GRAVADA_IGV_10',
  'MIXTA',
  'IMPORTACION',
  'GRAVADA_Y_NO_GRAVADA',
];

const VACIO: Partial<Subdiario> = {
  codigo: '',
  nombre: '',
  detalle: '',
  sucursal: '0001',
  asiento_compras: false,
  asiento_ventas: false,
  asiento_honorarios: false,
  asiento_cheque: false,
  asiento_caja: false,
  asiento_bancos: false,
  asiento_canje_aplicacion: false,
  activo: true,
  cuentas: {},
};

export const SubdiarioModal: React.FC<Props> = ({
  abierto,
  subdiario,
  onCerrar,
  onGuardar,
}) => {
  const [datos, setDatos] = useState<Partial<Subdiario>>(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esNuevo = !subdiario;

  useEffect(() => {
    setDatos(subdiario ? { ...subdiario } : { ...VACIO });
    setError(null);
  }, [subdiario, abierto]);

  const set = (campo: keyof Subdiario, valor: unknown) =>
    setDatos((d) => ({ ...d, [campo]: valor }));

  const setCuenta = (campo: keyof NonNullable<Subdiario['cuentas']>, valor: string) =>
    setDatos((d) => ({ ...d, cuentas: { ...(d.cuentas || {}), [campo]: valor } }));

  const guardar = async () => {
    if (!datos.codigo || datos.codigo.length !== 2 || !/^\d{2}$/.test(datos.codigo)) {
      setError('El codigo debe ser numerico de dos digitos');
      return;
    }
    if (!datos.nombre?.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      await onGuardar(datos);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const naturaleza = datos.naturaleza as NaturalezaVenta | undefined;
  const necesitaIgv = naturaleza ? LLEVAN_IGV.includes(naturaleza) : false;

  const naturalezaCompra = datos.naturaleza_compra as NaturalezaCompra | undefined;
  const necesitaCredito = naturalezaCompra
    ? LLEVAN_CREDITO_FISCAL.includes(naturalezaCompra)
    : false;

  return (
    <Modal
      isOpen={abierto}
      onClose={onCerrar}
      title={esNuevo ? 'Nuevo subdiario' : `Subdiario ${subdiario?.codigo}`}
      description="Clasifica las operaciones por su origen y determina que asiento producen"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Salir
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {guardando ? 'Grabando…' : 'Grabar'}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* --- Cabecera --- */}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Subdiario"
            name="subdiario"
            value={datos.codigo || ''}
            onChange={(e) => set('codigo', e.target.value.replace(/\D/g, '').slice(0, 2))}
            disabled={!esNuevo}
            placeholder="06"
            hint={esNuevo ? 'Dos digitos' : 'El codigo no se puede cambiar'}
          />
          <TextField
            label="Sucursal"
            name="sucursal"
            value={datos.sucursal || ''}
            onChange={(e) => set('sucursal', e.target.value)}
          />
        </div>

        <TextField
          label="Nombre"
          name="nombre"
          value={datos.nombre || ''}
          onChange={(e) => set('nombre', e.target.value.toUpperCase())}
          placeholder="REGISTRO VENTAS - EXONERADAS"
        />

        <TextField
          label="Detalle"
          name="detalle"
          value={datos.detalle || ''}
          onChange={(e) => set('detalle', e.target.value)}
        />

        {/* --- Considerar subdiario para --- */}
        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-700">
            Considerar subdiario para
          </legend>

          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <CheckboxField
              label="Asiento de Compras"
              name="asiento-de-compras"
              checked={!!datos.asiento_compras}
              onChange={(e) => set('asiento_compras', e.target.checked)}
            />
            <CheckboxField
              label="Asiento de Cheque"
              name="asiento-de-cheque"
              checked={!!datos.asiento_cheque}
              onChange={(e) => set('asiento_cheque', e.target.checked)}
            />
            <CheckboxField
              label="Asiento de Ventas"
              name="asiento-de-ventas"
              checked={!!datos.asiento_ventas}
              onChange={(e) => set('asiento_ventas', e.target.checked)}
            />

            <div className="flex items-center gap-2">
              <CheckboxField
                label="Asiento de Caja"
                name="asiento-de-caja"
                checked={!!datos.asiento_caja}
                onChange={(e) => set('asiento_caja', e.target.checked)}
              />
              {datos.asiento_caja && (
                <select
                  value={datos.modo_caja || 'A'}
                  onChange={(e) => set('modo_caja', e.target.value)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="A">Ambos</option>
                  <option value="I">Ingreso</option>
                  <option value="E">Egreso</option>
                </select>
              )}
            </div>

            <CheckboxField
              label="Asiento de Honorarios"
              name="asiento-de-honorarios"
              checked={!!datos.asiento_honorarios}
              onChange={(e) => set('asiento_honorarios', e.target.checked)}
            />

            <div className="flex items-center gap-2">
              <CheckboxField
                label="Asiento de Bancos"
                name="asiento-de-bancos"
                checked={!!datos.asiento_bancos}
                onChange={(e) => set('asiento_bancos', e.target.checked)}
              />
              {datos.asiento_bancos && (
                <select
                  value={datos.modo_bancos || 'I'}
                  onChange={(e) => set('modo_bancos', e.target.value)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="I">Ingreso</option>
                  <option value="E">Egreso</option>
                  <option value="A">Ambos</option>
                </select>
              )}
            </div>

            <CheckboxField
              label="Asiento de Canje/Aplicacion"
              name="asiento-de-canje-aplicacion"
              checked={!!datos.asiento_canje_aplicacion}
              onChange={(e) => set('asiento_canje_aplicacion', e.target.checked)}
            />
          </div>
        </fieldset>

        {/* --- Solo para compras: naturaleza y cuentas --- */}
        {datos.asiento_compras && (
          <fieldset className="rounded-lg border border-sky-200 bg-sky-50/40 p-4">
            <legend className="px-1 text-sm font-semibold text-sky-800">
              Contabilizacion de compras
            </legend>

            <SelectField
              label="Naturaleza tributaria"
              name="naturaleza-tributaria-compra"
              value={naturalezaCompra || ''}
              onChange={(e) => set('naturaleza_compra', e.target.value || null)}
              hint="Es lo que permite clasificar solos los comprobantes que llegan de SIRE"
            >
              <option value="">Sin clasificar</option>
              {NATURALEZAS_COMPRA.map((n) => (
                <option key={n} value={n}>
                  {ETIQUETA_NATURALEZA_COMPRA[n]}
                </option>
              ))}
            </SelectField>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <TextField
                label="Cuenta de gasto (60 o 63)"
                name="cuenta-de-gasto"
                value={datos.cuentas?.cuenta_gasto || ''}
                onChange={(e) => setCuenta('cuenta_gasto', e.target.value)}
                placeholder="60111101"
                hint="Va al Debe. 60 para bienes, 63 para servicios"
              />
              <TextField
                label="Cuenta de IGV (40)"
                name="cuenta-de-igv-credito"
                value={datos.cuentas?.cuenta_igv || ''}
                onChange={(e) => setCuenta('cuenta_igv', e.target.value)}
                placeholder="40111101"
                disabled={!necesitaCredito}
                hint={
                  necesitaCredito
                    ? 'Va al Debe: es credito fiscal'
                    : 'Sin credito fiscal: el IGV va al costo'
                }
              />
              <TextField
                label="Cuenta por pagar (42)"
                name="cuenta-por-pagar"
                value={datos.cuentas?.cuenta_pago || ''}
                onChange={(e) => setCuenta('cuenta_pago', e.target.value)}
                placeholder="42121101"
                hint="Va al Haber, por el total"
              />
            </div>

            <p className="mt-3 text-xs text-sky-900">
              {necesitaCredito
                ? 'Asiento: 60/63 y 40 al Debe, 42 al Haber por el total.'
                : 'Asiento: 60/63 al Debe por el total y 42 al Haber. El IGV, si lo hay, se queda en el costo.'}
            </p>
          </fieldset>
        )}

        {/* --- Solo para ventas: naturaleza y cuentas --- */}
        {datos.asiento_ventas && (
          <fieldset className="rounded-lg border border-violet-200 bg-violet-50/40 p-4">
            <legend className="px-1 text-sm font-semibold text-violet-800">
              Contabilizacion de ventas
            </legend>

            <SelectField
              label="Naturaleza tributaria"
              name="naturaleza-tributaria"
              value={naturaleza || ''}
              onChange={(e) => set('naturaleza', e.target.value || null)}
              hint="Es lo que permite clasificar solos los comprobantes que llegan de SIRE"
            >
              <option value="">Sin clasificar</option>
              {NATURALEZAS.map((n) => (
                <option key={n} value={n}>
                  {ETIQUETA_NATURALEZA[n]}
                </option>
              ))}
            </SelectField>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <TextField
                label="Cuenta de cobro (12)"
                name="cuenta-de-cobro-12"
                value={datos.cuentas?.cuenta_cobro || ''}
                onChange={(e) => setCuenta('cuenta_cobro', e.target.value)}
                placeholder="121101"
                hint="Va al Debe"
              />
              <TextField
                label="Cuenta de ingreso (70)"
                name="cuenta-de-ingreso-70"
                value={datos.cuentas?.cuenta_ingreso || ''}
                onChange={(e) => setCuenta('cuenta_ingreso', e.target.value)}
                placeholder="701101"
                hint="Va al Haber"
              />
              <TextField
                label="Cuenta de IGV (40)"
                name="cuenta-de-igv-40"
                value={datos.cuentas?.cuenta_igv || ''}
                onChange={(e) => setCuenta('cuenta_igv', e.target.value)}
                placeholder="401111"
                disabled={!necesitaIgv}
                hint={necesitaIgv ? 'Va al Haber' : 'No aplica en esta naturaleza'}
              />
            </div>
          </fieldset>
        )}

        <CheckboxField
          label="Activo"
          name="activo"
          checked={datos.activo !== false}
          onChange={(e) => set('activo', e.target.checked)}
        />

        {error && (
          <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {subdiario?.creado_en && (
          <p className="text-xs text-slate-400">
            Creado {new Date(subdiario.creado_en).toLocaleString('es-PE')}
            {subdiario.creado_por ? ` por ${subdiario.creado_por}` : ''}
            {subdiario.modificado_en
              ? ` · Modificado ${new Date(subdiario.modificado_en).toLocaleString('es-PE')}`
              : ''}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default SubdiarioModal;
