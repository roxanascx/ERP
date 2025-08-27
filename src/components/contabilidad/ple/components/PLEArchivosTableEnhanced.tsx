import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download,
  Eye,
  Search,
  Filter,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Trash2,
  MoreVertical,
  Archive
} from "lucide-react";

export interface PLEArchivoEnhanced {
  id: string;
  nombre: string;
  ruc: string;
  razon_social: string;
  ejercicio: number;
  mes: number;
  fecha_generacion: string;
  tamaño: number;
  formato: 'TXT' | 'ZIP';
  estado: 'generado' | 'procesando' | 'error' | 'validado';
  registros_total: number;
  registros_validos: number;
  registros_con_errores: number;
  url_descarga?: string;
  observaciones?: string;
}

interface PLEArchivosTableEnhancedProps {
  archivos: PLEArchivoEnhanced[];
  onRefresh: () => void;
  loading: boolean;
  onDescargar?: (archivo: PLEArchivoEnhanced) => void;
  onVer?: (archivo: PLEArchivoEnhanced) => void;
  onEliminar?: (archivo: PLEArchivoEnhanced) => void;
}

const PLEArchivosTableEnhanced: React.FC<PLEArchivosTableEnhancedProps> = ({
  archivos,
  onRefresh,
  loading,
  onDescargar,
  onVer,
  onEliminar
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [sortBy, setSortBy] = useState<'fecha' | 'nombre' | 'tamaño'>('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrar archivos
  const archivosFiltrados = archivos.filter(archivo => {
    const matchSearch = archivo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       archivo.ruc.includes(searchTerm) ||
                       archivo.razon_social.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchFilter = filterEstado === '' || archivo.estado === filterEstado;
    
    return matchSearch && matchFilter;
  });

  // Ordenar archivos
  const archivosOrdenados = [...archivosFiltrados].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case 'fecha':
        compareValue = new Date(a.fecha_generacion).getTime() - new Date(b.fecha_generacion).getTime();
        break;
      case 'nombre':
        compareValue = a.nombre.localeCompare(b.nombre);
        break;
      case 'tamaño':
        compareValue = a.tamaño - b.tamaño;
        break;
    }
    
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado: string) => {
    const configs = {
      generado: { color: '#10b981', bg: '#ecfdf5', text: 'Generado' },
      procesando: { color: '#f59e0b', bg: '#fffbeb', text: 'Procesando' },
      error: { color: '#ef4444', bg: '#fef2f2', text: 'Error' },
      validado: { color: '#3b82f6', bg: '#eff6ff', text: 'Validado' }
    };

    const config = configs[estado as keyof typeof configs] || configs.generado;

    return (
      <Badge 
        style={{
          backgroundColor: config.bg,
          color: config.color,
          border: `1px solid ${config.color}20`
        }}
      >
        {config.text}
      </Badge>
    );
  };

  const getEstadoIcon = (estado: string) => {
    const iconProps = { size: 16 };
    
    switch (estado) {
      case 'generado':
        return <CheckCircle {...iconProps} style={{ color: '#10b981' }} />;
      case 'procesando':
        return <Clock {...iconProps} style={{ color: '#f59e0b' }} />;
      case 'error':
        return <AlertCircle {...iconProps} style={{ color: '#ef4444' }} />;
      case 'validado':
        return <CheckCircle {...iconProps} style={{ color: '#3b82f6' }} />;
      default:
        return <FileText {...iconProps} />;
    }
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div>
      <Card style={{
        border: 'none',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <CardHeader style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Archive size={24} />
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: 0
                }}>
                  Archivos PLE Generados
                </h2>
                <p style={{
                  fontSize: '14px',
                  margin: '4px 0 0 0',
                  opacity: 0.9
                }}>
                  {archivos.length} archivo{archivos.length !== 1 ? 's' : ''} disponible{archivos.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <Button
              onClick={onRefresh}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} style={{
                animation: loading ? 'spin 1s linear infinite' : 'none'
              }} />
              Actualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent style={{ padding: '24px' }}>
          {/* Controles de búsqueda y filtros */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }} />
              <Input
                type="text"
                placeholder="Buscar por nombre, RUC o razón social..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: '40px'
                }}
              />
            </div>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                fontSize: '14px'
              }}
            >
              <option value="">Todos los estados</option>
              <option value="generado">Generado</option>
              <option value="procesando">Procesando</option>
              <option value="error">Error</option>
              <option value="validado">Validado</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                fontSize: '14px'
              }}
            >
              <option value="fecha-desc">Más reciente primero</option>
              <option value="fecha-asc">Más antiguo primero</option>
              <option value="nombre-asc">Nombre A-Z</option>
              <option value="nombre-desc">Nombre Z-A</option>
              <option value="tamaño-desc">Mayor tamaño</option>
              <option value="tamaño-asc">Menor tamaño</option>
            </select>
          </div>

          {/* Lista de archivos */}
          {archivosOrdenados.length === 0 ? (
            <Alert style={{
              border: '1px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <FileText size={16} />
              <AlertDescription>
                {searchTerm || filterEstado ? 
                  'No se encontraron archivos que coincidan con los filtros aplicados.' :
                  'No hay archivos PLE generados todavía. Genere su primer archivo en la pestaña "Generar PLE".'
                }
              </AlertDescription>
            </Alert>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {archivosOrdenados.map((archivo) => (
                <Card key={archivo.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}>
                  <CardContent style={{ padding: '20px' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '16px',
                      alignItems: 'start'
                    }}>
                      {/* Información principal */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          {getEstadoIcon(archivo.estado)}
                          <div>
                            <h3 style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              margin: 0,
                              color: '#111827'
                            }}>
                              {archivo.nombre}
                            </h3>
                            <p style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              margin: '2px 0 0 0'
                            }}>
                              {archivo.razon_social} • RUC: {archivo.ruc}
                            </p>
                          </div>
                        </div>

                        {/* Metadatos */}
                        <div style={{
                          display: 'flex',
                          gap: '20px',
                          flexWrap: 'wrap',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            color: '#6b7280'
                          }}>
                            <Calendar size={14} />
                            {meses[archivo.mes - 1]} {archivo.ejercicio}
                          </div>

                          <div style={{
                            fontSize: '13px',
                            color: '#6b7280'
                          }}>
                            {formatFileSize(archivo.tamaño)} • {archivo.formato}
                          </div>

                          <div style={{
                            fontSize: '13px',
                            color: '#6b7280'
                          }}>
                            {formatDate(archivo.fecha_generacion)}
                          </div>

                          {getEstadoBadge(archivo.estado)}
                        </div>

                        {/* Estadísticas de registros */}
                        {archivo.registros_total > 0 && (
                          <div style={{
                            display: 'flex',
                            gap: '16px',
                            marginTop: '8px',
                            padding: '8px 12px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            fontSize: '13px'
                          }}>
                            <span style={{ color: '#374151' }}>
                              <strong>{archivo.registros_total}</strong> registros
                            </span>
                            
                            {archivo.registros_validos > 0 && (
                              <span style={{ color: '#059669' }}>
                                <strong>{archivo.registros_validos}</strong> válidos
                              </span>
                            )}
                            
                            {archivo.registros_con_errores > 0 && (
                              <span style={{ color: '#dc2626' }}>
                                <strong>{archivo.registros_con_errores}</strong> con errores
                              </span>
                            )}
                          </div>
                        )}

                        {/* Observaciones */}
                        {archivo.observaciones && (
                          <div style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            fontStyle: 'italic',
                            marginTop: '4px'
                          }}>
                            {archivo.observaciones}
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        alignItems: 'flex-end'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '8px'
                        }}>
                          {onVer && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onVer(archivo)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Eye size={14} />
                              Ver
                            </Button>
                          )}

                          {onDescargar && archivo.url_descarga && archivo.estado === 'generado' && (
                            <Button
                              size="sm"
                              onClick={() => onDescargar(archivo)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#059669',
                                border: 'none'
                              }}
                            >
                              <Download size={14} />
                              Descargar
                            </Button>
                          )}
                        </div>

                        {onEliminar && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEliminar(archivo)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#dc2626',
                              borderColor: '#dc2626'
                            }}
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default PLEArchivosTableEnhanced;
