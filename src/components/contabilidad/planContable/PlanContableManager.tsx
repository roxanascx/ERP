import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { ContabilidadApiService } from '../../../services/contabilidadApi';

interface PlanContableManagerProps {
  empresaId: string;
  planActual: 'estandar' | 'personalizado';
  onPlanChanged: (tipoPlan: 'estandar' | 'personalizado') => void;
  onImportSuccess: () => void;
}

interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  total_lines: number;
  valid_accounts: number;
  preview_data: any[];
}

interface ImportResult {
  success: boolean;
  imported_count: number;
  errors: string[];
  warnings: string[];
  backup_created: boolean;
}

const PlanContableManager: React.FC<PlanContableManagerProps> = ({
  empresaId,
  planActual,
  onPlanChanged,
  onImportSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = async (format: 'txt' | 'excel' = 'txt') => {
    try {
      setLoading(true);
      setError(null);
      
      if (format === 'txt') {
        await ContabilidadApiService.downloadTemplate();
      } else {
        await ContabilidadApiService.downloadTemplateExcel();
      }
      
      setSuccess(`Plantilla ${format.toUpperCase()} descargada exitosamente`);
    } catch (err: any) {
      setError(err.message || 'Error descargando la plantilla');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = async (file: File): Promise<ValidationResult> => {
    const formData = new FormData();
    formData.append('empresa_id', empresaId);
    formData.append('file', file);
    
    const response = await fetch('/api/accounting/plan/validate', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error validando el archivo');
    }
    
    return await response.json();
  };

  const importFile = async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('empresa_id', empresaId);
    formData.append('file', file);
    
    const response = await fetch('/api/accounting/plan/import', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error importando el archivo');
    }
    
    return await response.json();
  };

  const handleFileSelect = async (file: File) => {
    const isValidFormat = file.name.endsWith('.txt') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    
    if (!isValidFormat) {
      setError('Solo se permiten archivos .txt, .xlsx o .xls');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    setValidationResult(null);
    
    try {
      setLoading(true);
      const result = await validateFile(file);
      setValidationResult(result);
      
      if (result && !result.is_valid) {
        setError(`El archivo tiene ${result.errors.length} errores. Revisa el formato.`);
      }
    } catch (err: any) {
      setError(err.message || 'Error validando el archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !validationResult?.is_valid) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await importFile(selectedFile);
      
      if (result.success) {
        setSuccess(`Plan contable importado exitosamente. ${result.imported_count} cuentas procesadas.`);
        setShowImportModal(false);
        setSelectedFile(null);
        setValidationResult(null);
        onImportSuccess();
        onPlanChanged('personalizado');
      } else {
        setError('Error durante la importación');
      }
    } catch (err: any) {
      setError(err.message || 'Error importando el plan contable');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  // Clear messages after 5 seconds
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  React.useEffect(() => {
    if (error && !showImportModal) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, showImportModal]);

  return (
    <div style={{
      borderRadius: '1rem',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      marginBottom: '2rem',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Header colapsable */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 2rem',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.7) 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings style={{ 
            color: '#6366f1',
            transition: 'transform 0.2s ease',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
          }} size={24} />
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 0.25rem 0'
            }}>
              Gestión del Plan Contable
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0
            }}>
              Tipo actual: <span style={{ 
                fontWeight: '500',
                color: planActual === 'estandar' ? '#059669' : '#7c3aed'
              }}>
                {planActual === 'estandar' ? 'Estándar' : 'Personalizado'}
              </span>
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isExpanded ? (
            <ChevronUp style={{ color: '#6b7280' }} size={20} />
          ) : (
            <ChevronDown style={{ color: '#6b7280' }} size={20} />
          )}
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div style={{
          padding: '2rem',
          animation: 'slideDown 0.3s ease-out'
        }}>
          {/* Plan Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Tipo de Plan Contable
            </label>
            <select
              value={planActual}
              onChange={(e) => onPlanChanged(e.target.value as 'estandar' | 'personalizado')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid rgba(209, 213, 219, 0.8)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                color: '#374151',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(209, 213, 219, 0.8)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="estandar">Plan Contable Estándar</option>
              <option value="personalizado">Plan Contable Personalizado</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {/* Descargar Plantilla TXT */}
            <button
              onClick={() => downloadTemplate('txt')}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              <Download size={16} />
              Plantilla TXT
            </button>

            {/* Descargar Plantilla Excel */}
            <button
              onClick={() => downloadTemplate('excel')}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
                }
              }}
            >
              <Download size={16} />
              Plantilla Excel
            </button>

            {/* Importar Plan */}
            <button
              onClick={() => setShowImportModal(true)}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                }
              }}
            >
              <Upload size={16} />
              Importar Plan
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'start',
              gap: '0.75rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.7) 100%)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              backdropFilter: 'blur(10px)'
            }}>
              <AlertCircle style={{ color: '#ef4444', flexShrink: 0, marginTop: '0.125rem' }} size={20} />
              <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>
            </div>
          )}

          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'start',
              gap: '0.75rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(220, 252, 231, 0.7) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              backdropFilter: 'blur(10px)'
            }}>
              <CheckCircle style={{ color: '#22c55e', flexShrink: 0, marginTop: '0.125rem' }} size={20} />
              <div style={{ color: '#16a34a', fontSize: '0.875rem' }}>{success}</div>
            </div>
          )}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '1rem',
            padding: '2rem',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Importar Plan Contable
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setValidationResult(null);
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  color: '#6b7280',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* File Drop Zone */}
            <div
              style={{
                border: `2px dashed ${dragActive ? '#6366f1' : '#d1d5db'}`,
                borderRadius: '0.75rem',
                padding: '3rem 2rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
                transition: 'all 0.2s ease',
                background: dragActive 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer'
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                style={{ display: 'none' }}
              />
              
              <FileText style={{
                color: dragActive ? '#6366f1' : '#9ca3af',
                margin: '0 auto 1rem',
                transition: 'color 0.2s ease'
              }} size={48} />
              
              <p style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                color: '#374151',
                margin: '0 0 0.5rem 0'
              }}>
                {selectedFile ? selectedFile.name : 'Arrastra tu archivo aquí'}
              </p>
              
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0
              }}>
                Formatos soportados: TXT, Excel (.xlsx, .xls)
              </p>
            </div>

            {/* Validation Results */}
            {validationResult && (
              <div style={{
                background: validationResult.is_valid
                  ? 'linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(220, 252, 231, 0.7) 100%)'
                  : 'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.7) 100%)',
                border: `1px solid ${validationResult.is_valid ? 'rgba(34, 197, 94, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  {validationResult.is_valid ? (
                    <CheckCircle style={{ color: '#22c55e' }} size={20} />
                  ) : (
                    <AlertCircle style={{ color: '#ef4444' }} size={20} />
                  )}
                  <span style={{
                    fontWeight: '500',
                    color: validationResult.is_valid ? '#16a34a' : '#dc2626'
                  }}>
                    {validationResult.is_valid ? 'Archivo válido' : 'Archivo con errores'}
                  </span>
                </div>
                
                <div style={{
                  fontSize: '0.875rem',
                  color: validationResult.is_valid ? '#16a34a' : '#dc2626'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    Total de líneas: {validationResult.total_lines}
                  </p>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    Cuentas válidas: {validationResult.valid_accounts}
                  </p>
                  
                  {validationResult.errors.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Errores:</p>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        {validationResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {validationResult.errors.length > 5 && (
                          <li>... y {validationResult.errors.length - 5} errores más</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {validationResult.warnings.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Advertencias:</p>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        {validationResult.warnings.slice(0, 3).map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                        {validationResult.warnings.length > 3 && (
                          <li>... y {validationResult.warnings.length - 3} advertencias más</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setValidationResult(null);
                  setError(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(107, 114, 128, 0.1)',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)';
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={handleImport}
                disabled={!selectedFile || !validationResult?.is_valid || loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: (!selectedFile || !validationResult?.is_valid || loading)
                    ? 'rgba(107, 114, 128, 0.3)'
                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: (!selectedFile || !validationResult?.is_valid || loading) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: (!selectedFile || !validationResult?.is_valid || loading) ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (selectedFile && validationResult?.is_valid && !loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFile && validationResult?.is_valid && !loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {loading ? 'Importando...' : 'Importar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PlanContableManager;
