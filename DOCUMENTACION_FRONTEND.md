# 📊 ERP Sistema - Documentación Frontend

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Tecnologías y Dependencias](#tecnologías-y-dependencias)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Configuración e Instalación](#configuración-e-instalación)
5. [Arquitectura y Patrones](#arquitectura-y-patrones)
6. [Módulos Principales](#módulos-principales)
7. [Componentes](#componentes)
8. [Servicios y APIs](#servicios-y-apis)
9. [Hooks Personalizados](#hooks-personalizados)
10. [Tipos TypeScript](#tipos-typescript)
11. [Estilos y UI](#estilos-y-ui)
12. [Rutas y Navegación](#rutas-y-navegación)
13. [Estado y Gestión de Datos](#estado-y-gestión-de-datos)
14. [Deployment](#deployment)
15. [Troubleshooting](#troubleshooting)

---

## 🚀 Descripción General

**ERP Sistema Frontend** es una aplicación web moderna desarrollada con **React 19** y **TypeScript**, diseñada para la gestión empresarial completa. La aplicación se enfoca en la administración de empresas, integración con SIRE (Sistema de Identificación de Registro Electoral) de SUNAT, y gestión de comprobantes electrónicos.

### Características Principales

- ✅ **Autenticación Segura** con Clerk
- 🏢 **Gestión Multiempresa** 
- 📊 **Integración SIRE/RVIE** (Registro de Ventas e Ingresos Electrónico)
- 📄 **Gestión de Comprobantes** 
- 🎨 **UI/UX Moderna** y responsiva
- 🔒 **Control de Acceso** por rutas protegidas
- 📱 **Responsive Design**

---

## 🛠 Tecnologías y Dependencias

### Tecnologías Core

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.1.1 | Framework UI principal |
| **TypeScript** | 5.8.3 | Tipado estático |
| **Vite** | 7.1.2 | Build tool y dev server |
| **React Router DOM** | 7.8.0 | Navegación y rutas |

### Bibliotecas Principales

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| **@clerk/clerk-react** | 5.41.0 | Autenticación y gestión de usuarios |
| **axios** | 1.11.0 | Cliente HTTP para APIs |
| **React DOM** | 19.1.1 | Renderizado DOM |

### Herramientas de Desarrollo

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **ESLint** | 9.33.0 | Linting y calidad de código |
| **@vitejs/plugin-react-swc** | 4.0.0 | Compilador React optimizado |
| **typescript-eslint** | 8.39.1 | Reglas ESLint para TypeScript |

---

## 📁 Estructura del Proyecto

```
frontend/
├── 📄 package.json              # Configuración npm y dependencias
├── 📄 vite.config.ts           # Configuración de Vite
├── 📄 tsconfig.json            # Configuración TypeScript
├── 📄 eslint.config.js         # Configuración ESLint
├── 📄 index.html               # Template HTML principal
├── 📄 .env.example             # Variables de entorno ejemplo
├── 📄 .env.local               # Variables de entorno locales
├── 📄 vercel.json              # Configuración deployment Vercel
├── 📄 README.md                # Documentación básica
├── 📄 .gitignore               # Archivos ignorados por Git
│
├── 📁 public/                  # Archivos estáticos
│   └── 📄 vite.svg            # Logo de Vite
│
└── 📁 src/                     # Código fuente principal
    ├── 📄 main.tsx             # Punto de entrada de la app
    ├── 📄 App.tsx              # Componente raíz
    ├── 📄 AppRouter.tsx        # Configuración de rutas
    ├── 📄 index.css            # Estilos globales
    ├── 📄 App.css              # Estilos del componente App
    ├── 📄 vite-env.d.ts        # Tipos para Vite
    │
    ├── 📁 assets/              # Recursos estáticos
    │   └── 📄 react.svg        # Logo de React
    │
    ├── 📁 components/          # Componentes reutilizables
    │   ├── 📄 BackendStatus.tsx
    │   ├── 📄 EmpresaProtectedRoute.tsx
    │   ├── 📄 Modal.tsx
    │   ├── 📁 auth/            # Autenticación
    │   ├── 📁 empresa/         # Gestión de empresas
    │   └── 📁 sire/            # Integración SIRE
    │
    ├── 📁 hooks/               # Custom hooks
    │   ├── 📄 useApi.ts
    │   ├── 📄 useEmpresa.ts
    │   ├── 📄 useRvie.ts
    │   └── 📄 ...más hooks
    │
    ├── 📁 pages/               # Páginas principales
    │   ├── 📄 HomePage.tsx
    │   ├── 📄 DashboardPage.tsx
    │   ├── 📄 EmpresaPage.tsx
    │   ├── 📄 SirePage.tsx
    │   └── 📁 sire/            # Páginas SIRE
    │
    ├── 📁 services/            # Servicios y APIs
    │   ├── 📄 api.ts
    │   ├── 📄 empresaApi.ts
    │   ├── 📄 sire.ts
    │   └── 📄 ...más servicios
    │
    └── 📁 types/               # Definiciones TypeScript
        ├── 📄 api.ts
        ├── 📄 empresa.ts
        ├── 📄 sire.ts
        └── 📄 ...más tipos
```

---

## ⚙️ Configuración e Instalación

### 1. Prerrequisitos

- **Node.js** 18+ 
- **npm** o **yarn**
- Cuenta en **Clerk** (para autenticación)
- Backend ERP ejecutándose

### 2. Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

### 3. Variables de Entorno

Crear archivo `.env.local`:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_tu_clave_aqui

# API Backend URL
VITE_API_URL=http://localhost:8000

# Environment
VITE_ENVIRONMENT=development
```

### 4. Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Producción
npm run build        # Compilar para producción
npm run preview      # Previsualizar build

# Calidad de código
npm run lint         # Ejecutar ESLint
```

---

## 🏗 Arquitectura y Patrones

### Patrón de Arquitectura

La aplicación sigue un patrón **Component-Based Architecture** con las siguientes capas:

```
┌─────────────────────────┐
│     Presentation        │  ← Páginas y Componentes UI
├─────────────────────────┤
│     Business Logic      │  ← Hooks y Estado Local
├─────────────────────────┤
│     Data Access         │  ← Servicios y APIs
├─────────────────────────┤
│     External Services   │  ← Backend, Clerk, etc.
└─────────────────────────┘
```

### Principios de Diseño

- **Single Responsibility**: Cada componente tiene una responsabilidad específica
- **Composition over Inheritance**: Uso de composición de componentes
- **Separation of Concerns**: Separación clara entre UI, lógica y datos
- **DRY (Don't Repeat Yourself)**: Reutilización mediante hooks y componentes
- **Type Safety**: TypeScript en toda la aplicación

---

## 📦 Módulos Principales

### 1. 🔐 Módulo de Autenticación (`auth/`)

**Responsabilidad**: Gestión de autenticación de usuarios

**Componentes**:
- `LoginButton.tsx` - Botones de login/registro
- `LogoutButton.tsx` - Botón de logout
- `UserProfile.tsx` - Perfil del usuario
- `UserSync.tsx` - Sincronización con backend

**Características**:
- Integración con Clerk
- Sincronización automática de usuarios
- Gestión de sesiones
- Protección de rutas

### 2. 🏢 Módulo de Empresas (`empresa/`)

**Responsabilidad**: Gestión completa de empresas

**Componentes**:
- `EmpresaList.tsx` - Lista de empresas
- `EmpresaCard.tsx` - Tarjeta individual de empresa
- `EmpresaForm.tsx` - Formulario CRUD
- `SireConfig.tsx` - Configuración SIRE

**Funcionalidades**:
- CRUD completo de empresas
- Configuración de credenciales SIRE
- Selección de empresa activa
- Validación de datos

### 3. 📊 Módulo SIRE (`sire/`)

**Responsabilidad**: Integración con servicios SUNAT

**Componentes**:
- `RviePanel.tsx` - Panel principal RVIE
- `RvieOperaciones.tsx` - Gestión de operaciones
- `RvieTickets.tsx` - Gestión de tickets
- `RvieVentas.tsx` - Registro de ventas
- `SireAutoAuthTest.tsx` - Pruebas de autenticación

**Funcionalidades**:
- Descarga de comprobantes
- Gestión de propuestas RVIE
- Consulta de tickets
- Autenticación automática con SUNAT

---

## 🧩 Componentes

### Componentes de Layout

#### `EmpresaProtectedRoute.tsx`
```typescript
// Protege rutas que requieren empresa seleccionada
interface EmpresaProtectedRouteProps {
  children: React.ReactNode;
}
```

**Funcionalidad**:
- Verifica que hay una empresa seleccionada
- Redirige a `/empresas` si no hay empresa
- Muestra loader durante verificación

#### `BackendStatus.tsx`
```typescript
// Muestra el estado de conexión con el backend
interface BackendStatusProps {
  compact?: boolean;
}
```

**Funcionalidad**:
- Verifica conectividad con API
- Muestra indicadores visuales
- Información de salud del sistema

#### `Modal.tsx`
```typescript
// Componente modal reutilizable
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}
```

### Componentes de Autenticación

#### `LoginButton.tsx`
- Integración con Clerk SignIn/SignUp
- Estilos personalizados
- Modo modal

#### `UserProfile.tsx`
- Información del usuario actual
- Avatar y datos básicos
- Enlaces a configuración

### Componentes de Empresa

#### `EmpresaCard.tsx`
```typescript
interface EmpresaCardProps {
  empresa: Empresa;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onConfigSire: () => void;
}
```

**Características**:
- Vista compacta de empresa
- Indicadores de estado
- Acciones rápidas
- Diseño responsivo

#### `EmpresaForm.tsx`
```typescript
interface EmpresaFormProps {
  empresa?: Empresa;
  onSubmit: (empresa: Empresa) => void;
  onCancel: () => void;
  loading?: boolean;
}
```

**Funcionalidades**:
- Formulario completo de empresa
- Validación en tiempo real
- Soporte para edición/creación
- Gestión de credenciales SIRE

### Componentes SIRE

#### `RviePanel.tsx`
**Panel principal** para gestión RVIE con pestañas:
- Operaciones
- Tickets  
- Ventas

**Características**:
- Navegación por pestañas
- Estado compartido
- Actualización automática

---

## 🔗 Servicios y APIs

### Servicio Principal (`api.ts`)

```typescript
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Interceptors**:
- Request: Agregar headers de autenticación
- Response: Manejo de errores globales

**Servicios Disponibles**:

#### Health Check
```typescript
healthCheck: () => apiClient.get('/health')
testDatabase: () => apiClient.get('/test-db')
getApiInfo: () => apiClient.get('/')
```

#### Usuarios
```typescript
users: {
  getAll: (skip?, limit?) => Promise<User[]>
  getByClerkId: (clerkId) => Promise<User>
  sync: (userData) => Promise<User>
  getCurrentUser: (clerkUserId) => Promise<User>
  update: (clerkId, userData) => Promise<User>
  delete: (clerkId) => Promise<void>
}
```

### Servicio de Empresas (`empresaApi.ts`)

```typescript
export const empresaApi = {
  // CRUD operations
  getAll: () => Promise<Empresa[]>
  getByRuc: (ruc: string) => Promise<Empresa>
  create: (empresa: Empresa) => Promise<Empresa>
  update: (ruc: string, empresa: Empresa) => Promise<Empresa>
  delete: (ruc: string) => Promise<void>
  
  // SIRE operations
  testSireConnection: (ruc: string) => Promise<any>
  updateSireConfig: (ruc: string, config: any) => Promise<Empresa>
}
```

### Servicio SIRE (`sire.ts`)

**Autenticación**:
```typescript
auth: {
  getToken: (empresa: Empresa) => Promise<TokenResponse>
  refreshToken: (refreshToken: string) => Promise<TokenResponse>
}
```

**RVIE Operations**:
```typescript
rvie: {
  descargarPropuesta: (request: RvieDescargarPropuestaRequest) => Promise<any>
  aceptarPropuesta: (request: RvieAceptarPropuestaRequest) => Promise<any>
  consultarTickets: (empresa: Empresa, params: any) => Promise<any>
}
```

**Comprobantes**:
```typescript
comprobantes: {
  consultar: (empresa: Empresa, params: any) => Promise<any>
  descargar: (empresa: Empresa, params: any) => Promise<any>
}
```

---

## 🎣 Hooks Personalizados

### `useApi.ts`

```typescript
export const useBackendStatus = (): ApiResponse => {
  const [data, setData] = useState<BackendConnectionStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Verificación automática del estado del backend
}
```

### `useEmpresa.ts`

```typescript
export const useEmpresa = () => {
  // Estado de empresas
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaActual, setEmpresaActual] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Operaciones CRUD
  const cargarEmpresas = async () => { /* ... */ }
  const seleccionarEmpresa = (empresa: Empresa) => { /* ... */ }
  const crearEmpresa = async (empresa: Empresa) => { /* ... */ }
  const actualizarEmpresa = async (ruc: string, empresa: Empresa) => { /* ... */ }
  const eliminarEmpresa = async (ruc: string) => { /* ... */ }
  
  return {
    empresas,
    empresaActual,
    loading,
    error,
    cargarEmpresas,
    seleccionarEmpresa,
    crearEmpresa,
    actualizarEmpresa,
    eliminarEmpresa
  };
}
```

### `useRvie.ts`

```typescript
export const useRvie = (empresa: Empresa) => {
  // Estados específicos de RVIE
  const [operaciones, setOperaciones] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ventas, setVentas] = useState<any[]>([]);
  
  // Operaciones RVIE
  const descargarPropuesta = async (params: RvieDescargarPropuestaRequest) => { /* ... */ }
  const aceptarPropuesta = async (params: RvieAceptarPropuestaRequest) => { /* ... */ }
  const consultarTickets = async (filtros: any) => { /* ... */ }
  
  return {
    operaciones,
    tickets,
    ventas,
    descargarPropuesta,
    aceptarPropuesta,
    consultarTickets,
    loading,
    error
  };
}
```

### `useSireAutoAuth.ts`

```typescript
export const useSireAutoAuth = (empresa: Empresa) => {
  // Autenticación automática con SIRE
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const authenticate = async () => { /* ... */ }
  const refreshToken = async () => { /* ... */ }
  
  return {
    token,
    isAuthenticated,
    authenticate,
    refreshToken,
    loading,
    error
  };
}
```

---

## 📝 Tipos TypeScript

### Tipos de API (`api.ts`)

```typescript
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface BackendConnectionStatus {
  apiInfo: ApiInfoResponse | null;
  healthCheck: HealthCheckResponse | null;
  testDb: TestDatabaseResponse | null;
  status: 'connected' | 'disconnected';
}
```

### Tipos de Empresa (`empresa.ts`)

```typescript
export interface Empresa {
  id?: string;
  ruc: string;
  razon_social: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activa: boolean;
  
  // Credenciales SIRE
  sire_client_id?: string;
  sire_client_secret?: string;
  sunat_usuario?: string;
  sunat_clave?: string;
  sire_activo: boolean;
  
  // Timestamps
  fecha_registro?: string;
  fecha_actualizacion?: string;
}

export const tieneSire = (empresa: Empresa): boolean => {
  return !!(
    empresa.sire_activo &&
    empresa.sire_client_id &&
    empresa.sire_client_secret &&
    empresa.sunat_usuario &&
    empresa.sunat_clave
  );
};
```

### Tipos SIRE (`sire.ts`)

```typescript
export interface RvieDescargarPropuestaRequest {
  ruc: string;
  año: string;
  mes: string;
  fechaGeneracion?: string;
}

export interface RvieAceptarPropuestaRequest {
  ruc: string;
  año: string;
  mes: string;
  observacion?: string;
}

export interface TicketConsultaParams {
  ruc: string;
  fechaInicio: string;
  fechaFin: string;
  estado?: string;
}
```

---

## 🎨 Estilos y UI

### Filosofía de Diseño

La aplicación utiliza **CSS-in-JS** mediante objetos de estilo inline para:
- **Consistencia**: Estilos contenidos en componentes
- **Mantenibilidad**: Cambios localizados
- **TypeScript**: Tipado de estilos
- **Performance**: Sin CSS global innecesario

### Sistema de Design

#### Colores Principales
```typescript
const colors = {
  primary: '#3b82f6',      // Azul principal
  secondary: '#6366f1',    // Violeta
  success: '#10b981',      // Verde
  warning: '#f59e0b',      // Amarillo
  error: '#ef4444',        // Rojo
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    900: '#111827'
  }
}
```

#### Tipografía
```typescript
const typography = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px'
  }
}
```

#### Espaciado
```typescript
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px'
}
```

### Responsive Design

La aplicación utiliza:
- **CSS Grid** y **Flexbox** para layouts
- **clamp()** para tipografía responsive
- **Media queries** en JavaScript
- **Viewport units** para pantallas completas

### Componentes UI Reutilizables

#### Botones
```typescript
const buttonStyles = {
  base: {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none'
  },
  primary: {
    background: '#3b82f6',
    color: 'white'
  },
  secondary: {
    background: 'transparent',
    color: '#3b82f6',
    border: '2px solid #3b82f6'
  }
}
```

#### Cards
```typescript
const cardStyles = {
  background: 'white',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb'
}
```

---

## 🗺 Rutas y Navegación

### Estructura de Rutas

```typescript
// AppRouter.tsx
<Routes>
  {/* Ruta principal */}
  <Route path="/" element={isSignedIn ? <Navigate to="/empresas" /> : <HomePage />} />
  
  {/* Dashboard */}
  <Route path="/dashboard" element={
    <EmpresaProtectedRoute>
      <DashboardPage />
    </EmpresaProtectedRoute>
  } />
  
  {/* Empresas */}
  <Route path="/empresas" element={<EmpresaPage />} />
  
  {/* SIRE */}
  <Route path="/sire" element={
    <EmpresaProtectedRoute>
      <SireHomePage />
    </EmpresaProtectedRoute>
  } />
  
  {/* RVIE */}
  <Route path="/sire/rvie" element={<RvieHomePage />} />
  <Route path="/sire/rvie/operaciones" element={<RvieOperacionesPage />} />
  <Route path="/sire/rvie/tickets" element={<RvieTicketsPage />} />
  <Route path="/sire/rvie/ventas" element={<RvieVentasPage />} />
</Routes>
```

### Protección de Rutas

#### Autenticación
```typescript
// Verificación con Clerk
const { isLoaded, isSignedIn } = useUser();

// Redirigir si no está autenticado
{isSignedIn ? <ProtectedComponent /> : <Navigate to="/" />}
```

#### Empresa Requerida
```typescript
// EmpresaProtectedRoute.tsx
const empresaActual = localStorage.getItem('empresaActual');
if (!empresaActual) {
  return <Navigate to="/empresas" replace />;
}
```

### Navegación Programática

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navegar a una ruta
navigate('/empresas');

// Navegar con reemplazo
navigate('/dashboard', { replace: true });

// Navegar con estado
navigate('/sire', { state: { empresa: empresaActual } });
```

---

## 📊 Estado y Gestión de Datos

### Estrategia de Estado

La aplicación utiliza **Local State Management** con:

1. **React useState** - Estado local de componentes
2. **Custom Hooks** - Lógica de estado reutilizable  
3. **LocalStorage** - Persistencia de datos
4. **Clerk** - Estado de autenticación

### Flujo de Datos

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Component     │───▶│   Custom Hook   │───▶│   API Service   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       │
         │                       │                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local State   │◄───│  LocalStorage   │◄───│     Backend     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Gestión de Estado por Módulo

#### Autenticación (Clerk)
```typescript
const { user, isSignedIn, isLoaded } = useUser();
```

#### Empresas
```typescript
// Hook personalizado
const {
  empresas,
  empresaActual,
  loading,
  error,
  cargarEmpresas,
  seleccionarEmpresa
} = useEmpresa();

// Persistencia
localStorage.setItem('empresaActual', JSON.stringify(empresa));
```

#### SIRE/RVIE
```typescript
const {
  operaciones,
  tickets,
  ventas,
  descargarPropuesta,
  loading
} = useRvie(empresa);
```

### Sincronización de Datos

#### Sincronización con Backend
```typescript
// Patrón de sincronización
const syncData = async () => {
  try {
    setLoading(true);
    const response = await apiService.getData();
    setData(response.data);
    setError(null);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

#### Invalidación de Cache
```typescript
// Actualización después de mutaciones
const updateEmpresa = async (empresa) => {
  await empresaApi.update(empresa.ruc, empresa);
  await cargarEmpresas(); // Recargar lista
};
```

---

## 🚀 Deployment

### Configuración para Vercel

#### `vercel.json`
```json
{
  "functions": {
    "app/main.py": {
      "runtime": "python3.9"
    }
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

#### Variables de Entorno en Vercel
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_API_URL=https://tu-backend.onrender.com
VITE_ENVIRONMENT=production
```

### Build para Producción

```bash
# Compilar para producción
npm run build

# Verificar build localmente
npm run preview
```

### Optimizaciones

#### Code Splitting
```typescript
// Lazy loading de páginas
const SirePage = lazy(() => import('./pages/SirePage'));
```

#### Tree Shaking
- Importaciones específicas
- Análisis de bundle con Vite

#### Compresión
- Gzip automático en Vercel
- Optimización de assets

---

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error de Autenticación Clerk

**Síntoma**: `Missing Publishable Key`

**Solución**:
```bash
# Verificar .env.local
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Reiniciar servidor de desarrollo
npm run dev
```

#### 2. Error de Conexión API

**Síntoma**: `Network Error` o `CORS`

**Verificar**:
- Backend está ejecutándose
- URL correcta en `VITE_API_URL`
- Configuración CORS en backend

**Solución**:
```typescript
// En api.ts - agregar timeout
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### 3. Empresa no Seleccionada

**Síntoma**: Redirección constante a `/empresas`

**Verificar**:
```typescript
// En localStorage
const empresaActual = localStorage.getItem('empresaActual');
console.log('Empresa actual:', empresaActual);
```

**Solución**:
```typescript
// Limpiar y reseleccionar
localStorage.removeItem('empresaActual');
// Volver a seleccionar empresa
```

#### 4. Errores de TypeScript

**Síntoma**: Errores de tipado

**Solución**:
```bash
# Verificar configuración
npx tsc --noEmit

# Regenerar types
rm -rf node_modules/@types
npm install
```

### Debugging

#### Herramientas Recomendadas
- **React Developer Tools**
- **Redux DevTools** (si se usa Redux)
- **Network Tab** en DevTools
- **Console logs** estratégicos

#### Logs de Debug
```typescript
// Habilitar logs en desarrollo
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

---

## 📚 Referencias

### Documentación Oficial
- [React 19 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com/)
- [Clerk Documentation](https://clerk.com/docs)

### APIs Relacionadas
- [SUNAT SIRE API](https://www.sunat.gob.pe/legislacion/superin/2019/anexo-RS-031-2019-SUNAT.pdf)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

## 🤝 Contribución

### Estándares de Código

1. **TypeScript**: Tipado estricto
2. **ESLint**: Seguir configuración del proyecto
3. **Componentes Funcionales**: Usar hooks
4. **Naming Conventions**:
   - Componentes: `PascalCase`
   - Hooks: `camelCase` con prefijo `use`
   - Archivos: `camelCase.tsx`

### Workflow de Desarrollo

1. **Feature Branch**: Crear rama desde `main`
2. **Development**: Implementar funcionalidad
3. **Testing**: Probar manualmente
4. **Code Review**: Revisión por pares
5. **Merge**: Integrar a `main`

---

## 📄 Licencia

Este proyecto es parte del sistema ERP interno. Todos los derechos reservados.

---

**Documentación generada el**: 19 de Agosto, 2025  
**Versión de la aplicación**: 0.0.0  
**Última actualización**: 19/08/2025
