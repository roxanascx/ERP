/**
 * 📊 Tabla de Comprobantes RCE - Versión Optimizada con Cache
 */
import { useState, useEffect } from 'react';
import { rceComprobantesService, type RceComprobanteBD } from '../../../services/rceComprobantesService';

interface Props {
  ruc: string;
  periodo?: string;
  onDataChange?: () => void;
  onConsultarSunat?: () => void; // 🆕 Callback para navegar a consulta SUNAT
}

function RceComprobantesTable({ ruc, periodo, onConsultarSunat }: Props) {
  const [comprobantes, setComprobantes] = useState<RceComprobanteBD[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [sinDatos, setSinDatos] = useState(false); // 🆕 Estado para detectar BD vacía
  
  // 🚀 Contexto de datos compartido para cache (COMENTADO TEMPORALMENTE)
  // const { 
  //   comprobantesDetallados, 
  //   obtenerEstadoCache
  // } = useRceData();

  useEffect(() => {
    if (ruc) {
      loadComprobantes();
      loadStats();
    }
    
    // 🔄 Escuchar evento de actualización de datos
    const handleDataUpdate = () => {
      console.log('🔄 Datos actualizados, refrescando tabla BD...');
      loadComprobantes();
      loadStats();
    };
    
    window.addEventListener('rce-data-updated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('rce-data-updated', handleDataUpdate);
    };
  }, [ruc, periodo]);

  const loadComprobantes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await rceComprobantesService.consultarComprobantes(ruc, {
        periodo: periodo,
        por_pagina: 2000 // 🆕 Nuevo límite para mostrar más registros
      });
      
      console.log('🔍 DEBUG: Datos de comprobantes de BD:', response.comprobantes);
      if (response.comprobantes.length > 0) {
        console.log('📅 Primer comprobante fecha_emision:', response.comprobantes[0].fecha_emision);
      }
      
      setComprobantes(response.comprobantes || []);
      setSinDatos(response.comprobantes.length === 0); // 🆕 Detectar si BD está vacía
    } catch (err: any) {
      setError(err.message || 'Error al cargar comprobantes');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await rceComprobantesService.obtenerEstadisticas(ruc, periodo);
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      // Validar que la fecha no esté vacía o sea inválida
      if (!dateStr || dateStr === 'Invalid Date' || dateStr.trim() === '') {
        return 'Fecha no válida';
      }
      
      // Si viene en formato ISO (YYYY-MM-DD) o similar, crear fecha válida
      const fecha = new Date(dateStr);
      
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        // Intentar parsear formatos alternativos
        if (dateStr.includes('/')) {
          // Formato DD/MM/YYYY
          const partes = dateStr.split('/');
          if (partes.length === 3) {
            const fechaFormateada = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
            if (!isNaN(fechaFormateada.getTime())) {
              return fechaFormateada.toLocaleDateString('es-PE');
            }
          }
        }
        return 'Fecha inválida';
      }
      
      return fecha.toLocaleDateString('es-PE');
    } catch (error) {
      console.warn('Error formateando fecha:', dateStr, error);
      return 'Error en fecha';
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header con estadísticas */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '1rem',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#1f2937' }}>
            📊 Gestión Local de Comprobantes
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            RUC: {ruc} {periodo && `| Período: ${periodo}`}
          </p>
        </div>
        
        {stats && (
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#059669' }}>
                {stats.total_comprobantes || 0}
              </div>
              <div style={{ color: '#6b7280' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#dc2626' }}>
                {formatCurrency(stats.total_importe || 0)}
              </div>
              <div style={{ color: '#6b7280' }}>Importe</div>
            </div>
          </div>
        )}
      </div>

      {/* Alertas de estado */}
      {!periodo && (
        <div style={{
          padding: '0.75rem 1rem',
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          color: '#92400e',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          ⚠️ Seleccione un período para acceder a todas las funcionalidades
        </div>
      )}

      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          ❌ {error}
        </div>
      )}

      {loading && (
        <div style={{
          padding: '1rem',
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '6px',
          color: '#0369a1',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          ⏳ Procesando...
        </div>
      )}

      {/* Lista de comprobantes */}
      {comprobantes.length === 0 && !loading ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: sinDatos ? '#fef3c7' : '#f9fafb',
          border: sinDatos ? '2px solid #f59e0b' : '2px dashed #d1d5db',
          borderRadius: '8px',
          color: sinDatos ? '#92400e' : '#6b7280'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            {sinDatos ? '�' : '�📄'}
          </div>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>
            {sinDatos ? 'Base de datos lista para usar' : 'No hay comprobantes en la base de datos'}
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            {sinDatos 
              ? 'Esta es su gestión local de comprobantes. Para comenzar, consulte datos desde SUNAT.'
              : periodo 
                ? `No se encontraron comprobantes para el período ${periodo}`
                : 'No hay comprobantes almacenados'
            }
          </p>
          <p style={{ margin: '1rem 0 0 0', fontSize: '0.85rem', color: '#9ca3af' }}>
            💡 Ve a <strong>"Consultar SUNAT"</strong> para obtener y auto-guardar comprobantes desde SUNAT
          </p>
          
          {/* 🆕 Botón de acción rápida */}
          {sinDatos && onConsultarSunat && (
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={onConsultarSunat}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🔄 Consultar SUNAT Ahora
              </button>
            </div>
          )}
        </div>
      ) : comprobantes.length > 0 ? (
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            overflowX: 'auto',
            maxHeight: '500px',
            overflowY: 'auto'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
              minWidth: '1260px' // Aumentado para acomodar la columna #
            }}>
              <thead>
                <tr style={{ 
                  background: '#2563eb', // Azul como en la vista detallada
                  color: 'white',
                  borderBottom: '1px solid #1d4ed8',
                  position: 'sticky',
                  top: 0
                }}>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: 'white', width: '60px' }}>
                    #
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: 'white' }}>
                    RUC Proveedor
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: 'white' }}>
                    Razón Social
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: 'white' }}>
                    Tipo Doc.
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: 'white' }}>
                    Serie
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: 'white' }}>
                    Número
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: 'white' }}>
                    Fecha Emisión
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: 'white' }}>
                    Base Imponible
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: 'white' }}>
                    IGV
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: 'white' }}>
                    Valor No Gravado
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: 'white' }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {comprobantes.map((comp, index) => (
                  <tr 
                    key={comp.id || index}
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      background: index % 2 === 0 ? 'white' : '#f9fafb'
                    }}
                  >
                    {/* Número de fila */}
                    <td style={{ 
                      padding: '0.75rem', 
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#6b7280',
                      background: index % 2 === 0 ? '#f8fafc' : '#f1f5f9'
                    }}>
                      {index + 1}
                    </td>
                    
                    {/* RUC Proveedor */}
                    <td style={{ padding: '0.75rem', textAlign: 'left' }}>
                      {comp.ruc_proveedor}
                    </td>
                    
                    {/* Razón Social */}
                    <td style={{ padding: '0.75rem', textAlign: 'left' }}>
                      {comp.razon_social_proveedor}
                    </td>
                    
                    {/* Tipo Documento */}
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {comp.tipo_documento}
                    </td>
                    
                    {/* Serie */}
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {comp.serie_comprobante}
                    </td>
                    
                    {/* Número */}
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {comp.numero_comprobante}
                    </td>
                    
                    {/* Fecha Emisión */}
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {formatDate(comp.fecha_emision)}
                    </td>
                    
                    {/* Base Imponible */}
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {formatCurrency(comp.base_imponible_gravada)}
                    </td>
                    
                    {/* IGV */}
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {formatCurrency(comp.igv)}
                    </td>
                    
                    {/* Valor No Gravado */}
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {formatCurrency(comp.valor_adquisicion_no_gravada)}
                    </td>
                    
                    {/* Total */}
                    <td style={{ 
                      padding: '0.75rem', 
                      textAlign: 'right',
                      fontWeight: '500'
                    }}>
                      {formatCurrency(comp.importe_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default RceComprobantesTable;
