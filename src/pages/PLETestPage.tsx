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
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>🧪 Prueba de Exportación PLE</h1>
      
      <div style={{ 
        background: '#f9fafb', 
        padding: '16px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>📄 Información del Libro de Prueba</h3>
        <p><strong>ID:</strong> {libroTest.id}</p>
        <p><strong>RUC:</strong> {libroTest.ruc}</p>
        <p><strong>Período:</strong> {libroTest.periodo}</p>
        <p><strong>Asientos:</strong> {libroTest.asientos.length}</p>
        <p><strong>Total Debe:</strong> {libroTest.totalDebe}</p>
        <p><strong>Total Haber:</strong> {libroTest.totalHaber}</p>
      </div>
      
      <button
        onClick={() => setMostrarModal(true)}
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        🇵🇪 Probar Exportación PLE SUNAT
      </button>
      
      {mostrarModal && (
        <PLEExportManager
          libro={libroTest}
          onClose={() => setMostrarModal(false)}
          onSuccess={(mensaje) => {
            alert(`✅ Éxito: ${mensaje}`);
            setMostrarModal(false);
          }}
          onError={(error) => {
            alert(`❌ Error: ${error}`);
          }}
        />
      )}
    </div>
  );
};

export default PLETestPage;
