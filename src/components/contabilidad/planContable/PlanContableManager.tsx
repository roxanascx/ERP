import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Settings,
  Upload,
  X,
} from 'lucide-react';
import { ContabilidadApiService } from '../../../services/contabilidadApi';
import Modal from '../../common/Modal';
import { cn } from '../../../lib/cn';

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

const EXTENSIONES = ['.txt', '.xlsx', '.xls'];

const PlanContableManager: React.FC<PlanContableManagerProps> = ({
  empresaId,
  planActual,
  onPlanChanged,
  onImportSuccess,
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

  // Los mensajes se retiran solos a los 5 segundos.
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!error || showImportModal) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error, showImportModal]);

  const downloadTemplate = async (format: 'txt' | 'excel') => {
    setLoading(true);
    setError(null);
    try {
      if (format === 'txt') await ContabilidadApiService.downloadTemplate();
      else await ContabilidadApiService.downloadTemplateExcel();
      setSuccess(`Plantilla ${format.toUpperCase()} descargada correctamente`);
    } catch (err: any) {
      setError(err.message || 'Error descargando la plantilla');
    } finally {
      setLoading(false);
    }
  };

  const postArchivo = async <T,>(endpoint: string, file: File): Promise<T> => {
    const formData = new FormData();
    formData.append('empresa_id', empresaId);
    formData.append('file', file);

    const response = await fetch(endpoint, { method: 'POST', body: formData });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error procesando el archivo');
    }
    return response.json();
  };

  const handleFileSelect = async (file: File) => {
    if (!EXTENSIONES.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setError('Solo se permiten archivos .txt, .xlsx o .xls');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setValidationResult(null);

    setLoading(true);
    try {
      const result = await postArchivo<ValidationResult>(
        '/api/v1/accounting/plan/validate',
        file
      );
      setValidationResult(result);
      if (!result.is_valid) {
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

    setLoading(true);
    setError(null);
    try {
      const result = await postArchivo<ImportResult>('/api/v1/accounting/plan/import', selectedFile);

      if (result.success) {
        setSuccess(
          `Plan contable importado: ${result.imported_count} cuentas procesadas.`
        );
        cerrarImportacion();
        onImportSuccess();
        onPlanChanged('personalizado');
      } else {
        setError('Error durante la importación');
      }
    } catch (err: any) {
      setError(err.message || 'Error importando el archivo');
    } finally {
      setLoading(false);
    }
  };

  const cerrarImportacion = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setValidationResult(null);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Cabecera colapsable */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-3 border-0 bg-transparent px-4 py-3.5 text-left hover:bg-slate-50"
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50">
          <Settings className="size-4.5 text-indigo-600" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Gestión del plan contable</p>
          <p className="text-xs text-slate-500">
            Plan {planActual === 'estandar' ? 'estándar' : 'personalizado'} · plantillas e
            importación
          </p>
        </div>
        <ChevronDown
          className={cn('size-5 shrink-0 text-slate-400 transition-transform', isExpanded && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {isExpanded && (
        <div className="space-y-5 border-t border-slate-200 p-4 sm:p-5">
          {/* Tipo de plan */}
          <div>
            <label
              htmlFor="tipo-plan"
              className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase"
            >
              Tipo de plan contable
            </label>
            <select
              id="tipo-plan"
              value={planActual}
              onChange={(e) => onPlanChanged(e.target.value as 'estandar' | 'personalizado')}
              className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="estandar">Plan contable estándar</option>
              <option value="personalizado">Plan contable personalizado</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => downloadTemplate('txt')}
              disabled={loading}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5 text-left hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <FileText className="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">Plantilla TXT</span>
                <span className="block text-xs text-slate-500">Formato de texto plano</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => downloadTemplate('excel')}
              disabled={loading}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5 text-left hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <FileSpreadsheet
                className="mt-0.5 size-5 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">Plantilla Excel</span>
                <span className="block text-xs text-slate-500">Con formato y ejemplos</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              disabled={loading}
              className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3.5 text-left hover:bg-blue-100 disabled:opacity-50"
            >
              <Upload className="mt-0.5 size-5 shrink-0 text-blue-600" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-blue-900">Importar plan</span>
                <span className="block text-xs text-blue-700">Sube tu propio catálogo</span>
              </span>
            </button>
          </div>

          {/* Mensajes */}
          {success && (
            <p
              role="status"
              className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {success}
            </p>
          )}

          {error && !showImportModal && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>
      )}

      {/* Modal de importación */}
      <Modal
        isOpen={showImportModal}
        onClose={cerrarImportacion}
        title="Importar plan contable"
        description="Se creará una copia de seguridad del plan actual antes de reemplazarlo."
        footer={
          <>
            <button
              type="button"
              onClick={cerrarImportacion}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={loading || !validationResult?.is_valid}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Importar
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Zona de arrastre */}
          <div
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const files = Array.from(e.dataTransfer.files);
              if (files.length > 0) void handleFileSelect(files[0]);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            className={cn(
              'rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50'
            )}
          >
            <Upload className="mx-auto mb-3 size-8 text-slate-400" aria-hidden="true" />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="size-4 text-slate-500" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-800">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setValidationResult(null);
                  }}
                  aria-label="Quitar archivo"
                  className="grid size-6 place-items-center rounded border-0 bg-transparent p-0 text-slate-400 hover:text-slate-700"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <>
                <p className="mb-1 text-sm font-medium text-slate-700">
                  Arrastra tu archivo aquí
                </p>
                <p className="mb-4 text-xs text-slate-500">Formatos: .txt, .xlsx o .xls</p>
              </>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download className="size-4" aria-hidden="true" />
              Elegir archivo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept={EXTENSIONES.join(',')}
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileSelect(file);
              }}
            />
          </div>

          {loading && !validationResult && (
            <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Validando archivo…
            </p>
          )}

          {/* Resultado de la validación */}
          {validationResult && (
            <div
              className={cn(
                'rounded-lg border px-4 py-3',
                validationResult.is_valid
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              )}
            >
              <p
                className={cn(
                  'mb-2 flex items-center gap-2 text-sm font-semibold',
                  validationResult.is_valid ? 'text-green-800' : 'text-red-800'
                )}
              >
                {validationResult.is_valid ? (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                ) : (
                  <AlertCircle className="size-4" aria-hidden="true" />
                )}
                {validationResult.is_valid ? 'Archivo válido' : 'Archivo con errores'}
              </p>

              <dl className="mb-2 flex gap-6 text-sm text-slate-700">
                <div>
                  <dt className="text-xs text-slate-500">Líneas</dt>
                  <dd className="font-semibold tabular-nums">{validationResult.total_lines}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Cuentas válidas</dt>
                  <dd className="font-semibold tabular-nums">{validationResult.valid_accounts}</dd>
                </div>
              </dl>

              {validationResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-xs font-semibold text-red-800">Errores:</p>
                  <ul className="list-disc space-y-0.5 pl-5 text-sm text-red-700">
                    {validationResult.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                    {validationResult.errors.length > 5 && (
                      <li className="text-red-600 italic">
                        …y {validationResult.errors.length - 5} más
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {validationResult.warnings.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-xs font-semibold text-amber-800">Avisos:</p>
                  <ul className="list-disc space-y-0.5 pl-5 text-sm text-amber-700">
                    {validationResult.warnings.slice(0, 3).map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && showImportModal && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PlanContableManager;
