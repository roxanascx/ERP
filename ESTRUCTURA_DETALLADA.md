# 📋 ERP Frontend - Estructura Detallada de Archivos

## 🗂 Estructura Completa con Descripción

```
frontend/
├── 📄 package.json                     # Configuración npm, dependencias y scripts
├── 📄 vite.config.ts                   # Configuración del bundler Vite
├── 📄 tsconfig.json                    # Configuración TypeScript principal
├── 📄 tsconfig.app.json                # Configuración TS específica para la app
├── 📄 tsconfig.node.json               # Configuración TS para herramientas Node
├── 📄 eslint.config.js                 # Configuración de linting ESLint
├── 📄 index.html                       # Template HTML principal de Vite
├── 📄 .env.example                     # Ejemplo de variables de entorno
├── 📄 .env.local                       # Variables de entorno para desarrollo local
├── 📄 vercel.json                      # Configuración de deployment en Vercel
├── 📄 README.md                        # Documentación básica del proyecto
├── 📄 .gitignore                       # Archivos y carpetas ignorados por Git
│
├── 📁 public/                          # Recursos estáticos servidos directamente
│   └── 📄 vite.svg                     # Logo/icono de Vite (favicon)
│
└── 📁 src/                            # 🎯 CÓDIGO FUENTE PRINCIPAL
    ├── 📄 main.tsx                     # 🚀 Punto de entrada - inicializa React y Clerk
    ├── 📄 App.tsx                      # 🎪 Componente raíz - contiene AppRouter
    ├── 📄 AppRouter.tsx                # 🗺 Configuración de rutas y navegación
    ├── 📄 index.css                    # 🎨 Estilos globales CSS
    ├── 📄 App.css                      # 🎨 Estilos específicos del componente App
    ├── 📄 vite-env.d.ts               # 📝 Tipos TypeScript para Vite
    │
    ├── 📁 assets/                      # 🖼 Recursos estáticos internos
    │   └── 📄 react.svg               # Logo oficial de React
    │
    ├── 📁 components/                  # 🧩 COMPONENTES REUTILIZABLES
    │   ├── 📄 BackendStatus.tsx        # 📡 Indicador estado conexión backend
    │   ├── 📄 EmpresaProtectedRoute.tsx # 🔒 HOC protección rutas empresa
    │   ├── 📄 Modal.tsx                # 🪟 Componente modal genérico
    │   │
    │   ├── 📁 auth/                    # 🔐 MÓDULO AUTENTICACIÓN
    │   │   ├── 📄 index.ts             # 📦 Barrel export para auth
    │   │   ├── 📄 LoginButton.tsx      # 🔑 Botón login/registro Clerk
    │   │   ├── 📄 LogoutButton.tsx     # 🚪 Botón cerrar sesión
    │   │   ├── 📄 UserProfile.tsx      # 👤 Perfil usuario actual
    │   │   └── 📄 UserSync.tsx         # 🔄 Sincronización usuario-backend
    │   │
    │   ├── 📁 empresa/                 # 🏢 MÓDULO GESTIÓN EMPRESAS
    │   │   ├── 📄 index.ts             # 📦 Barrel export para empresa
    │   │   ├── 📄 EmpresaCard.tsx      # 🎴 Tarjeta individual empresa
    │   │   ├── 📄 EmpresaForm.tsx      # 📝 Formulario CRUD empresa
    │   │   ├── 📄 EmpresaList.tsx      # 📋 Lista grid de empresas
    │   │   └── 📄 SireConfig.tsx       # ⚙️ Configuración credenciales SIRE
    │   │
    │   └── 📁 sire/                    # 📊 MÓDULO INTEGRACIÓN SIRE/SUNAT
    │       ├── 📄 index.ts             # 📦 Barrel export para SIRE
    │       ├── 📄 SireAutoAuthTest.tsx # 🧪 Pruebas autenticación SIRE
    │       │
    │       └── 📁 rvie/                # 📈 SUBMÓDULO RVIE (Registro Ventas)
    │           ├── 📄 RviePanel.css    # 🎨 Estilos específicos RVIE
    │           ├── 📄 RviePanel.tsx    # 🎛 Panel principal gestión RVIE
    │           │
    │           └── 📁 components/      # 🧩 Componentes internos RVIE
    │               ├── 📄 index.ts     # 📦 Barrel export RVIE components
    │               ├── 📄 rvie-components.css # 🎨 Estilos componentes RVIE
    │               ├── 📄 rvie-luxury.css     # 🎨 Estilos tema premium RVIE
    │               ├── 📄 RvieOperaciones.tsx # ⚙️ Gestión operaciones RVIE
    │               ├── 📄 RvieTickets.tsx     # 🎫 Gestión tickets RVIE
    │               └── 📄 RvieVentas.tsx      # 💰 Registro ventas RVIE
    │
    ├── 📁 hooks/                       # 🎣 CUSTOM HOOKS (Lógica Reutilizable)
    │   ├── 📄 useApi.ts                # 🔌 Hook estado conexión backend
    │   ├── 📄 useEmpresa.ts            # 🏢 Hook gestión estado empresas
    │   ├── 📄 useEmpresaValidation.ts  # ✅ Hook validación datos empresa
    │   ├── 📄 useRvie.ts               # 📊 Hook operaciones RVIE/SIRE
    │   ├── 📄 useRvieTickets.ts        # 🎫 Hook específico tickets RVIE
    │   ├── 📄 useSireAutoAuth.ts       # 🔐 Hook autenticación automática SIRE
    │   └── 📄 useTickets.ts            # 🎫 Hook genérico gestión tickets
    │
    ├── 📁 pages/                       # 📄 PÁGINAS PRINCIPALES (Rutas)
    │   ├── 📄 index.ts                 # 📦 Barrel export páginas principales
    │   ├── 📄 HomePage.tsx             # 🏠 Landing page/bienvenida
    │   ├── 📄 DashboardPage.tsx        # 📊 Dashboard principal usuario
    │   ├── 📄 EmpresaPage.tsx          # 🏢 Página gestión empresas
    │   ├── 📄 SirePage.tsx             # 📋 Página SIRE legacy (compatibilidad)
    │   ├── 📄 TestLogoutPage.tsx       # 🧪 Página prueba funcionalidad logout
    │   │
    │   └── 📁 sire/                    # 📊 PÁGINAS ESPECÍFICAS SIRE
    │       ├── 📄 index.ts             # 📦 Barrel export páginas SIRE
    │       ├── 📄 SireHomePage.tsx     # 🏠 Home/dashboard SIRE
    │       │
    │       └── 📁 rvie/                # 📈 PÁGINAS ESPECÍFICAS RVIE
    │           ├── 📄 RvieHomePage.tsx        # 🏠 Dashboard RVIE
    │           ├── 📄 RvieOperacionesPage.tsx # ⚙️ Página operaciones RVIE
    │           ├── 📄 RvieTicketsPage.tsx     # 🎫 Página tickets RVIE
    │           └── 📄 RvieVentasPage.tsx      # 💰 Página ventas RVIE
    │
    ├── 📁 services/                    # 🔧 SERVICIOS (Comunicación APIs)
    │   ├── 📄 api.ts                   # 🌐 Cliente Axios principal + interceptors
    │   ├── 📄 empresaApi.ts            # 🏢 API específica gestión empresas
    │   ├── 📄 rvieTicketService.ts     # 🎫 Servicio específico tickets RVIE
    │   ├── 📄 sire.ts                  # 📊 API integración SIRE/SUNAT
    │   └── 📄 ticketService.ts         # 🎫 Servicio genérico tickets
    │
    └── 📁 types/                       # 📝 DEFINICIONES TYPESCRIPT
        ├── 📄 api.ts                   # 🌐 Tipos respuestas API backend
        ├── 📄 empresa.ts               # 🏢 Tipos entidad Empresa + helpers
        ├── 📄 rvieTickets.ts           # 🎫 Tipos específicos tickets RVIE
        ├── 📄 sire.ts                  # 📊 Tipos integración SIRE/SUNAT
        └── 📄 tickets.ts               # 🎫 Tipos genéricos tickets
```

---

## 📋 Descripción Detallada por Archivo

### 🚀 Archivos de Configuración Raíz

#### `package.json`
```json
{
  "name": "frontend",
  "scripts": {
    "dev": "vite",           // Servidor desarrollo
    "build": "tsc -b && vite build", // Build producción
    "lint": "eslint .",      // Linting código
    "preview": "vite preview" // Preview build local
  }
}
```
**Propósito**: Define dependencias, scripts y metadatos del proyecto npm.

#### `vite.config.ts`
```typescript
export default defineConfig({
  plugins: [react()],       // Plugin React SWC para mejor performance
})
```
**Propósito**: Configuración del bundler Vite (sucesor de Webpack).

#### `tsconfig.json`
**Propósito**: Configuración principal TypeScript con reglas estrictas.

#### `eslint.config.js`
**Propósito**: Reglas de linting para mantener calidad de código.

#### `vercel.json`
**Propósito**: Configuración específica para deployment en Vercel.

---

### 🎯 Archivos Core (`src/`)

#### `main.tsx` - 🚀 Punto de Entrada
```typescript
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>,
)
```
**Responsabilidades**:
- Inicializar React 19
- Configurar ClerkProvider para autenticación
- Inyectar App principal

#### `App.tsx` - 🎪 Componente Raíz
```typescript
function App() {
  return <AppRouter />;
}
```
**Responsabilidades**:
- Validar variables de entorno
- Contener AppRouter principal

#### `AppRouter.tsx` - 🗺 Configuración de Rutas
```typescript
const AppRouter: React.FC = () => {
  const { isLoaded, isSignedIn } = useUser();
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={...} />
        <Route path="/empresas" element={...} />
        {/* ...más rutas */}
      </Routes>
    </Router>
  );
};
```
**Responsabilidades**:
- Gestionar todas las rutas de la aplicación
- Implementar protección de rutas
- Manejar estados de carga de Clerk
- Redireccionamientos condicionales

---

### 🧩 Componentes (`components/`)

#### Componentes de Layout

##### `EmpresaProtectedRoute.tsx` - 🔒 Protección de Rutas
```typescript
const EmpresaProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const empresaActual = localStorage.getItem('empresaActual');
  
  if (!empresaActual) {
    return <Navigate to="/empresas" replace />;
  }
  
  return <>{children}</>;
};
```
**Propósito**: HOC que protege rutas que requieren empresa seleccionada.

##### `BackendStatus.tsx` - 📡 Indicador de Estado
```typescript
const BackendStatus: React.FC = () => {
  const { data, loading, error } = useBackendStatus();
  
  return (
    <div style={{ /* indicadores visuales */ }}>
      {/* Estado de conexión con backend */}
    </div>
  );
};
```
**Propósito**: Mostrar estado de conectividad con el backend.

##### `Modal.tsx` - 🪟 Modal Genérico
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}
```
**Propósito**: Componente modal reutilizable con overlay y animaciones.

#### Módulo Auth (`auth/`)

##### `LoginButton.tsx` - 🔑 Autenticación
```typescript
const LoginButton: React.FC = () => {
  return (
    <div>
      <SignInButton mode="modal">
        <button>Iniciar Sesión</button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button>Registrarse</button>
      </SignUpButton>
    </div>
  );
};
```
**Propósito**: Botones integrados con Clerk para login/registro.

##### `UserProfile.tsx` - 👤 Perfil de Usuario
**Propósito**: Mostrar información del usuario actual y opciones de configuración.

##### `UserSync.tsx` - 🔄 Sincronización
**Propósito**: Sincronizar datos de usuario entre Clerk y backend.

#### Módulo Empresa (`empresa/`)

##### `EmpresaList.tsx` - 📋 Lista de Empresas
```typescript
interface EmpresaListProps {
  empresas: Empresa[];
  empresaActual: Empresa | null;
  loading: boolean;
  error: string | null;
  onSelectEmpresa: (empresa: Empresa) => void;
  onEditEmpresa: (empresa: Empresa) => void;
  onDeleteEmpresa: (ruc: string) => void;
  onConfigSire: (empresa: Empresa) => void;
  onCreateNew: () => void;
}
```
**Propósito**: Grid responsivo con todas las empresas, estadísticas y acciones.

##### `EmpresaCard.tsx` - 🎴 Tarjeta de Empresa
**Propósito**: Componente individual para mostrar información resumida de empresa.

##### `EmpresaForm.tsx` - 📝 Formulario CRUD
**Propósito**: Formulario completo para crear/editar empresas con validación.

##### `SireConfig.tsx` - ⚙️ Configuración SIRE
**Propósito**: Formulario específico para configurar credenciales SIRE/SUNAT.

#### Módulo SIRE (`sire/`)

##### `RviePanel.tsx` - 🎛 Panel Principal RVIE
```typescript
interface RviePanelProps {
  company: Empresa;
  onClose?: () => void;
}
```
**Propósito**: Componente principal con navegación por pestañas para gestión RVIE.

##### Componentes RVIE (`rvie/components/`)

###### `RvieOperaciones.tsx` - ⚙️ Operaciones
**Propósito**: Gestión de operaciones RVIE (descargar/aceptar propuestas).

###### `RvieTickets.tsx` - 🎫 Tickets  
**Propósito**: Consulta y gestión de tickets RVIE.

###### `RvieVentas.tsx` - 💰 Ventas
**Propósito**: Visualización y gestión del registro de ventas.

---

### 🎣 Hooks Personalizados (`hooks/`)

#### `useApi.ts` - 🔌 Estado Backend
```typescript
export const useBackendStatus = (): ApiResponse => {
  // Verificación automática del estado del backend
  // Retorna: { data, loading, error }
}
```
**Propósito**: Hook para verificar conectividad y estado del backend.

#### `useEmpresa.ts` - 🏢 Gestión Empresas
```typescript
export const useEmpresa = () => {
  // CRUD completo de empresas
  // Gestión de empresa actual
  // Persistencia en localStorage
}
```
**Propósito**: Hook central para toda la lógica de gestión de empresas.

#### `useRvie.ts` - 📊 Operaciones RVIE
```typescript
export const useRvie = (empresa: Empresa) => {
  // Operaciones específicas RVIE
  // Estados de operaciones, tickets, ventas
  // Integración con APIs SIRE
}
```
**Propósito**: Hook especializado para operaciones RVIE/SIRE.

#### `useSireAutoAuth.ts` - 🔐 Autenticación SIRE
```typescript
export const useSireAutoAuth = (empresa: Empresa) => {
  // Autenticación automática con SIRE
  // Gestión de tokens
  // Refresh automático
}
```
**Propósito**: Manejo de autenticación y tokens SIRE.

---

### 📄 Páginas (`pages/`)

#### Páginas Principales

##### `HomePage.tsx` - 🏠 Landing Page
**Propósito**: Página de bienvenida para usuarios no autenticados.

##### `DashboardPage.tsx` - 📊 Dashboard
**Propósito**: Dashboard principal con resumen y acceso rápido.

##### `EmpresaPage.tsx` - 🏢 Gestión Empresas
**Propósito**: Página completa para gestionar empresas del usuario.

#### Páginas SIRE (`sire/`)

##### `SireHomePage.tsx` - 🏠 Home SIRE
**Propósito**: Dashboard específico para funcionalidades SIRE.

##### Páginas RVIE (`rvie/`)

###### `RvieHomePage.tsx` - 🏠 Dashboard RVIE
**Propósito**: Panel principal con resumen de estado RVIE.

###### `RvieOperacionesPage.tsx` - ⚙️ Operaciones
**Propósito**: Página dedicada a operaciones RVIE (propuestas, descargas).

###### `RvieTicketsPage.tsx` - 🎫 Tickets
**Propósito**: Gestión completa de tickets RVIE.

###### `RvieVentasPage.tsx` - 💰 Ventas
**Propósito**: Visualización y análisis del registro de ventas.

---

### 🔧 Servicios (`services/`)

#### `api.ts` - 🌐 Cliente Principal
```typescript
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptors para auth y error handling
```
**Propósito**: Cliente Axios principal con interceptors y configuración base.

#### `empresaApi.ts` - 🏢 API Empresas
```typescript
export const empresaApi = {
  getAll: () => Promise<Empresa[]>,
  create: (empresa: Empresa) => Promise<Empresa>,
  update: (ruc: string, empresa: Empresa) => Promise<Empresa>,
  // ...más operaciones CRUD
}
```
**Propósito**: API específica para operaciones de empresas.

#### `sire.ts` - 📊 API SIRE
```typescript
export const sireApi = {
  auth: {
    getToken: (empresa: Empresa) => Promise<TokenResponse>,
    // ...
  },
  rvie: {
    descargarPropuesta: (request) => Promise<any>,
    // ...
  }
}
```
**Propósito**: API para integración con servicios SIRE/SUNAT.

---

### 📝 Tipos TypeScript (`types/`)

#### `api.ts` - 🌐 Tipos API
```typescript
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}
```
**Propósito**: Tipos para respuestas del backend y estados de conexión.

#### `empresa.ts` - 🏢 Tipos Empresa
```typescript
export interface Empresa {
  id?: string;
  ruc: string;
  razon_social: string;
  // ...campos empresa
  sire_client_id?: string;
  sire_client_secret?: string;
  // ...credenciales SIRE
}

export const tieneSire = (empresa: Empresa): boolean => {
  // Helper function para verificar configuración SIRE
}
```
**Propósito**: Tipos y helpers para entidad Empresa.

#### `sire.ts` - 📊 Tipos SIRE
```typescript
export interface RvieDescargarPropuestaRequest {
  ruc: string;
  año: string;
  mes: string;
  fechaGeneracion?: string;
}
```
**Propósito**: Tipos específicos para operaciones SIRE/RVIE.

---

## 🔄 Flujo de Datos por Archivo

### 1. Inicialización
```
main.tsx → App.tsx → AppRouter.tsx
```

### 2. Autenticación
```
Clerk → UserSync.tsx → api.ts → backend
```

### 3. Gestión Empresas
```
EmpresaPage.tsx → useEmpresa.ts → empresaApi.ts → backend
                ↓
            localStorage (persistencia)
```

### 4. Operaciones SIRE
```
RviePanel.tsx → useRvie.ts → sire.ts → SUNAT APIs
              ↓
          RvieOperaciones.tsx / RvieTickets.tsx / RvieVentas.tsx
```

---

## 📊 Métricas del Proyecto

### Estadísticas de Archivos
- **Total archivos**: ~45
- **Componentes React**: ~20
- **Custom Hooks**: 7
- **Páginas**: 8
- **Servicios**: 5
- **Tipos TypeScript**: 5

### Líneas de Código (aproximado)
- **TypeScript/TSX**: ~3000 líneas
- **CSS**: ~500 líneas
- **Configuración**: ~200 líneas

### Complejidad
- **Nivel**: Intermedio-Avanzado
- **Patrones**: Hooks, HOCs, Composition
- **Integraciones**: Clerk, Axios, SIRE APIs
- **TypeScript**: Tipado estricto

---

Este documento proporciona una visión completa y detallada de cada archivo en el frontend del sistema ERP, facilitando la comprensión de la arquitectura y el mantenimiento del código.
