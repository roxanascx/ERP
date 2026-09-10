import React from 'react';
import PLEExportManager from '../components/contabilidad/libroDiario/PLEExportManager';
import type { LibroDiario } from '../types/libroDiario';

// Datos de prueba del libro que sabemos que funciona
const libroTest = {
  id: '68ad1d3165e64f28cc8a8766',
  empresaId: '10426346082',
  ruc: '20123456789',
  razonSocial: 'Empresa de Prueba S.A.C.',
  periodo: '2025',
  descripcion: 'enero 2025',
  estado: 'borrador',
  moneda: 'PEN',
  tipoLibro: '5.1',
  asientos: [
    {
      id: '68adb51bde9be47ac85ba275',
      numeroCorrelativo: '706-1',
      fecha: '2025-08-26',
      glosa: 'Pago de servicios públicos (luz, agua, teléfono)',
      debe: 150.0,
      haber: 0.0
    }
  ],
  totalDebe: 350.0,
  totalHaber: 350.0,
  fechaCreacion: '2025-08-26T02:34:25.749000',
  fechaModificacion: '2025-08-26T13:42:48.499000'
} as any as LibroDiario;

const PLETestPage: React.FC = () => {
  const [mostrarModal, setMostrarModal] = React.useState(false);

  const datos = [
    { label: 'ID', value: libroTest.id },
    { label: 'RUC', value: libroTest.ruc },
    { label: 'Periodo', value: libroTest.periodo },
    { label: 'Asientos', value: String(libroTest.asientos.length) },
    { label: 'Total debe', value: String(libroTest.totalDebe) },
    { label: 'Total haber', value: String(libroTest.totalHaber) },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Prueba de exportacion PLE
        </h1>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Libro de prueba</h2>
          <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {datos.map((d) => (
              <div key={d.label} className="flex gap-2">
                <dt className="text-slate-500">{d.label}:</dt>
                <dd className="font-medium text-slate-800">{d.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <button
          type="button"
          onClick={() => setMostrarModal(true)}
          className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Probar exportacion PLE SUNAT
        </button>

        {mostrarModal && (
          <PLEExportManager
            libro={libroTest}
            onClose={() => setMostrarModal(false)}
            onSuccess={(respuesta) => {
              window.alert(`Exito: ${respuesta.archivo_nombre ?? 'archivo generado'}`);
              setMostrarModal(false);
            }}
            onError={(error) => window.alert(`Error: ${error}`)}
          />
        )}
      </div>
    </div>
  );
};

export default PLETestPage;
