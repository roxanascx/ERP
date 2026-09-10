import React from 'react';
import { RotateCcw, TriangleAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Captura excepciones de render para que un fallo en una tabla no deje la
 * aplicacion en blanco. React solo soporta error boundaries como clase.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Punto unico para enchufar Sentry / logging en el futuro.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-red-50">
            <TriangleAlert className="size-6 text-red-600" aria-hidden="true" />
          </div>

          <h1 className="mb-2 text-xl font-bold text-slate-900">Algo falló en esta pantalla</h1>
          <p className="mb-5 text-sm leading-relaxed text-slate-500">
            El resto de la aplicación sigue funcionando. Puedes reintentar o volver al inicio.
          </p>

          <pre className="mb-5 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-red-700">
            {error.message}
          </pre>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reintentar
            </button>
            <a
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 no-underline hover:bg-slate-50 hover:no-underline"
            >
              Ir al inicio
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
