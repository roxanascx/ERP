import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  Building2,
  FileText,
  Info,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  Download
} from "lucide-react";

export interface PLEGeneracionDataEnhanced {
  ruc: string;
  ejercicio: number;
  mes: number;
  razon_social: string;
  formato?: 'TXT' | 'ZIP';
  incluir_cabecera?: boolean;
  validar_antes_generar?: boolean;
  observaciones?: string;
}

interface PLEFormErrors {
  ruc?: string;
  ejercicio?: string;
  mes?: string;
  razon_social?: string;
  formato?: string;
  observaciones?: string;
}

interface PLEFormGeneracionEnhancedProps {
  onGenerar: (data: PLEGeneracionDataEnhanced) => Promise<void>;
  loading: boolean;
}

const PLEFormGeneracionEnhanced: React.FC<PLEFormGeneracionEnhancedProps> = ({
  onGenerar,
  loading
}) => {
  const [formData, setFormData] = useState<PLEGeneracionDataEnhanced>({
    ruc: '',
    ejercicio: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    razon_social: '',
    formato: 'ZIP',
    incluir_cabecera: true,
    validar_antes_generar: true,
    observaciones: ''
  });

  const [errors, setErrors] = useState<PLEFormErrors>({});
  const [preview, setPreview] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Generar preview del nombre de archivo
  useEffect(() => {
    if (formData.ruc && formData.ejercicio && formData.mes) {
      const mesStr = formData.mes.toString().padStart(2, '0');
      const nombreArchivo = `LE${formData.ruc}${formData.ejercicio}${mesStr}00140100001111.${formData.formato?.toLowerCase() || 'txt'}`;
      setPreview(nombreArchivo);
    }
  }, [formData.ruc, formData.ejercicio, formData.mes, formData.formato]);

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  const validateForm = (): boolean => {
    const newErrors: PLEFormErrors = {};

    if (!formData.ruc) {
      newErrors.ruc = 'RUC es obligatorio';
    } else if (!/^\d{11}$/.test(formData.ruc)) {
      newErrors.ruc = 'RUC debe tener 11 dígitos';
    }

    if (!formData.razon_social) {
      newErrors.razon_social = 'Razón social es obligatoria';
    }

    if (formData.ejercicio < 2000 || formData.ejercicio > new Date().getFullYear()) {
      newErrors.ejercicio = 'Ejercicio inválido';
    }

    if (formData.mes < 1 || formData.mes > 12) {
      newErrors.mes = 'Mes inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onGenerar(formData);
    } catch (error) {
      console.error('Error en generación:', error);
    }
  };

  const handleInputChange = (field: keyof PLEGeneracionDataEnhanced, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo modificado
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <Card style={{
        border: 'none',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <CardHeader style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FileText size={24} />
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                margin: 0
              }}>
                Generar Archivo PLE
              </h2>
              <p style={{
                fontSize: '14px',
                margin: '4px 0 0 0',
                opacity: 0.9
              }}>
                Complete los datos para generar el archivo PLE conforme a SUNAT
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Información de la empresa */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <Building2 size={18} style={{ color: '#6366f1' }} />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#374151'
                }}>
                  Información de la Empresa
                </h3>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '16px'
              }}>
                <div>
                  <Label htmlFor="ruc" style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    RUC *
                  </Label>
                  <Input
                    id="ruc"
                    type="text"
                    placeholder="20123456789"
                    value={formData.ruc}
                    onChange={(e) => handleInputChange('ruc', e.target.value)}
                    style={{
                      marginTop: '4px',
                      border: errors.ruc ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                    maxLength={11}
                  />
                  {errors.ruc && (
                    <p style={{
                      fontSize: '12px',
                      color: '#ef4444',
                      margin: '4px 0 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <AlertTriangle size={12} />
                      {errors.ruc}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="razon_social" style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Razón Social *
                  </Label>
                  <Input
                    id="razon_social"
                    type="text"
                    placeholder="EMPRESA SAC"
                    value={formData.razon_social}
                    onChange={(e) => handleInputChange('razon_social', e.target.value)}
                    style={{
                      marginTop: '4px',
                      border: errors.razon_social ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  />
                  {errors.razon_social && (
                    <p style={{
                      fontSize: '12px',
                      color: '#ef4444',
                      margin: '4px 0 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <AlertTriangle size={12} />
                      {errors.razon_social}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Período */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <Calendar size={18} style={{ color: '#6366f1' }} />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#374151'
                }}>
                  Período
                </h3>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <Label htmlFor="ejercicio" style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Ejercicio *
                  </Label>
                  <Input
                    id="ejercicio"
                    type="number"
                    min="2000"
                    max={new Date().getFullYear()}
                    value={formData.ejercicio}
                    onChange={(e) => handleInputChange('ejercicio', parseInt(e.target.value))}
                    style={{
                      marginTop: '4px',
                      border: errors.ejercicio ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  />
                  {errors.ejercicio && (
                    <p style={{
                      fontSize: '12px',
                      color: '#ef4444',
                      margin: '4px 0 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <AlertTriangle size={12} />
                      {errors.ejercicio}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="mes" style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Mes *
                  </Label>
                  <Select
                    value={formData.mes.toString()}
                    onValueChange={(value) => handleInputChange('mes', parseInt(value))}
                  >
                    <SelectTrigger style={{
                      marginTop: '4px',
                      border: errors.mes ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map(mes => (
                        <SelectItem key={mes.value} value={mes.value.toString()}>
                          {mes.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.mes && (
                    <p style={{
                      fontSize: '12px',
                      color: '#ef4444',
                      margin: '4px 0 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <AlertTriangle size={12} />
                      {errors.mes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Opciones de generación */}
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 16px 0',
                color: '#374151'
              }}>
                Opciones de Generación
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <Label htmlFor="formato" style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Formato de salida
                  </Label>
                  <Select
                    value={formData.formato}
                    onValueChange={(value: string) => handleInputChange('formato', value as 'TXT' | 'ZIP')}
                  >
                    <SelectTrigger style={{ marginTop: '4px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TXT">TXT (Texto plano)</SelectItem>
                      <SelectItem value="ZIP">ZIP (Comprimido)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Opciones avanzadas */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="checkbox"
                    id="incluir_cabecera"
                    checked={formData.incluir_cabecera}
                    onChange={(e) => handleInputChange('incluir_cabecera', e.target.checked)}
                  />
                  <Label htmlFor="incluir_cabecera" style={{
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Incluir cabecera de información
                  </Label>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="checkbox"
                    id="validar_antes_generar"
                    checked={formData.validar_antes_generar}
                    onChange={(e) => handleInputChange('validar_antes_generar', e.target.checked)}
                  />
                  <Label htmlFor="validar_antes_generar" style={{
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Validar datos antes de generar
                  </Label>
                </div>
              </div>

              {/* Observaciones */}
              <div style={{ marginTop: '16px' }}>
                <Label htmlFor="observaciones" style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Observaciones (opcional)
                </Label>
                <Textarea
                  id="observaciones"
                  placeholder="Comentarios o notas adicionales..."
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  style={{
                    marginTop: '4px',
                    minHeight: '80px'
                  }}
                  maxLength={500}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '4px 0 0 0',
                  textAlign: 'right'
                }}>
                  {formData.observaciones?.length || 0}/500 caracteres
                </p>
              </div>
            </div>

            {/* Preview del archivo */}
            {preview && (
              <Alert style={{
                border: '1px solid #dbeafe',
                background: '#eff6ff'
              }}>
                <Info size={16} style={{ color: '#2563eb' }} />
                <AlertDescription>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ color: '#1d4ed8' }}>
                        Nombre del archivo:
                      </strong>
                      <br />
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        background: '#dbeafe',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: '#1e40af'
                      }}>
                        {preview}
                      </span>
                    </div>
                    <Badge variant="secondary" style={{
                      background: '#dbeafe',
                      color: '#1d4ed8'
                    }}>
                      PLE 14.1
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Botones de acción */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Eye size={16} />
                Vista Previa
              </Button>

              <Button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  border: 'none',
                  minWidth: '140px'
                }}
              >
                {loading ? (
                  <Loader2 size={16} style={{
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <Download size={16} />
                )}
                {loading ? 'Generando...' : 'Generar PLE'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PLEFormGeneracionEnhanced;
