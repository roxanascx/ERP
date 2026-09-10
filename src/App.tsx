import AppRouter from './AppRouter';
import ErrorBoundary from './components/routing/ErrorBoundary';
import { EmpresaProvider } from './contexts/EmpresaContext';

/**
 * La validacion de VITE_CLERK_PUBLISHABLE_KEY vive en main.tsx, donde se monta
 * el ClerkProvider. Aqui estaba duplicada.
 *
 * EmpresaProvider va por encima del router para que la empresa activa se
 * consulte una sola vez por sesion, en vez de una vez por hook montado.
 */
function App() {
  return (
    <ErrorBoundary>
      <EmpresaProvider>
        <AppRouter />
      </EmpresaProvider>
    </ErrorBoundary>
  );
}

export default App;
