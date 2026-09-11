import {
  BarChart3,
  BookOpen,
  Building,
  Building2,
  Coins,
  Download,
  FileBarChart,
  Handshake,
  Landmark,
  LayoutDashboard,
  LineChart,
  Package,
  Scale,
  Settings,
  ShoppingCart,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/**
 * ============================================================================
 * FUENTE UNICA DE VERDAD DE LA NAVEGACION
 * ============================================================================
 *
 * Antes de este archivo, el menu de la aplicacion estaba definido en 3 sitios
 * distintos que ya habian divergido entre si:
 *
 *   1. MainLayout.tsx          -> array `sidebarItems`
 *   2. ContabilidadLayout.tsx  -> array `contabilidadItems` (rutas inexistentes)
 *   3. ContabilidadPage.tsx    -> array `librosContables` (tabs + tarjetas)
 *
 * Ahora todo se define aqui. Si una ruta no existe en este archivo, no deberia
 * existir en el sidebar.
 */

export interface NavItem {
  /** Identificador estable, independiente de la ruta */
  id: string;
  label: string;
  /**
   * Componente de icono (lucide-react), no un emoji. Los emojis se renderizan
   * distinto en cada sistema operativo, no heredan `currentColor` y no se
   * pueden escalar con el resto de la tipografia.
   */
  icon: LucideIcon;
  path: string;
  /** false = visible pero deshabilitado (modulo aun no construido) */
  enabled: boolean;
  badge?: string;
  /** Descripcion corta, usada en las tarjetas del Dashboard */
  descripcion?: string;
}

/** Modulo de contabilidad: NavItem + metadatos para las tarjetas del indice */
export interface ModuloContable extends NavItem {
  descripcion: string;
  /**
   * Acento del modulo, como clases Tailwind. Se declaran completas (no
   * construidas por concatenacion) porque Tailwind escanea el codigo fuente
   * en busca de clases literales.
   */
  accent: {
    /** Fondo suave del icono */
    soft: string;
    /** Color de texto del icono */
    text: string;
    /** Fondo del boton principal */
    solid: string;
    /** Borde de la tarjeta al pasar el raton */
    ring: string;
  };
}

export interface PageMeta {
  title: string;
  subtitle: string;
}

// ============================================================================
// NAVEGACION PRINCIPAL (sidebar)
// ============================================================================
// Los modulos operativos van primero; los pendientes quedan agrupados al final
// para que el usuario no tenga que atravesar items muertos.

export const MAIN_NAV: NavItem[] = [
  {
    id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard',
    enabled: true, descripcion: 'Resumen general de la operación',
  },
  {
    id: 'socios', label: 'Socios de Negocio', icon: Handshake, path: '/socios-negocio',
    enabled: true, descripcion: 'Proveedores y clientes unificados',
  },
  {
    id: 'sire', label: 'SIRE', icon: FileBarChart, path: '/sire',
    enabled: true, descripcion: 'Reportes SUNAT',
  },
  {
    id: 'contabilidad', label: 'Contabilidad', icon: Wallet, path: '/contabilidad',
    enabled: true, descripcion: 'Gestión financiera y libros contables',
  },
  {
    id: 'proveedores', label: 'Proveedores', icon: Building2, path: '/proveedores',
    enabled: false, descripcion: 'Gestión de proveedores',
  },
  {
    id: 'clientes', label: 'Clientes', icon: Users, path: '/clientes',
    enabled: false, descripcion: 'Cartera de clientes',
  },
  {
    id: 'inventario', label: 'Inventario', icon: Package, path: '/inventario',
    enabled: false, descripcion: 'Control de almacén',
  },
  {
    id: 'empleados', label: 'Empleados', icon: UserRound, path: '/empleados',
    enabled: false, descripcion: 'Recursos humanos',
  },
  {
    id: 'reportes', label: 'Reportes', icon: TrendingUp, path: '/reportes',
    enabled: false, descripcion: 'Análisis y estadísticas',
  },
  {
    id: 'configuracion', label: 'Configuración', icon: Settings, path: '/configuracion',
    enabled: true, descripcion: 'Subdiarios y parámetros del sistema',
  },
];

// ============================================================================
// MODULOS DE CONTABILIDAD (tabs + tarjetas de /contabilidad)
// ============================================================================
// `path` ya no se construye con el RUC: LibroDiarioPage resuelve la empresa
// desde useEmpresaActual cuando el parametro de ruta no viene.

export const CONTABILIDAD_MODULES: ModuloContable[] = [
  {
    id: 'plan-contable',
    label: 'Plan Contable',
    icon: BookOpen,
    path: '/contabilidad/plan-contable',
    enabled: true,
    descripcion: 'Catálogo general de cuentas contables según normativa peruana',
    accent: {
      soft: 'bg-emerald-50',
      text: 'text-emerald-600',
      solid: 'bg-emerald-600 hover:bg-emerald-700',
      ring: 'hover:border-emerald-300',
    },
  },
  {
    id: 'libro-diario',
    label: 'Libro Diario',
    icon: BookOpen,
    path: '/contabilidad/libro-diario',
    enabled: true,
    descripcion: 'Registro cronológico de todas las operaciones contables',
    accent: {
      soft: 'bg-red-50',
      text: 'text-red-600',
      solid: 'bg-red-600 hover:bg-red-700',
      ring: 'hover:border-red-300',
    },
  },
  {
    id: 'registro-compras',
    label: 'Registro de Compras',
    icon: ShoppingCart,
    path: '/contabilidad/registro-compras',
    enabled: true,
    descripcion: 'Registro de facturas y documentos de compras según PLE 080000',
    accent: {
      soft: 'bg-orange-50',
      text: 'text-orange-600',
      solid: 'bg-orange-600 hover:bg-orange-700',
      ring: 'hover:border-orange-300',
    },
  },
  {
    id: 'registro-ventas',
    label: 'Registro de Ventas',
    icon: Coins,
    path: '/contabilidad/registro-ventas',
    enabled: true,
    descripcion: 'Registro de comprobantes de venta según PLE 140000',
    accent: {
      soft: 'bg-green-50',
      text: 'text-green-600',
      solid: 'bg-green-600 hover:bg-green-700',
      ring: 'hover:border-green-300',
    },
  },
  {
    id: 'ventas-sire',
    label: 'Ventas desde SIRE',
    icon: Download,
    path: '/contabilidad/ventas-sire',
    enabled: true,
    descripcion: 'Importa las ventas de SUNAT y generalas en el libro diario',
    accent: {
      soft: 'bg-violet-50',
      text: 'text-violet-600',
      solid: 'bg-violet-600 hover:bg-violet-700',
      ring: 'hover:border-violet-300',
    },
  },
  {
    id: 'libro-mayor',
    label: 'Libro Mayor',
    icon: BarChart3,
    path: '/contabilidad/libro-mayor',
    enabled: true,
    descripcion: 'Movimientos por cuenta contable y saldos acumulados',
    accent: {
      soft: 'bg-blue-50',
      text: 'text-blue-600',
      solid: 'bg-blue-600 hover:bg-blue-700',
      ring: 'hover:border-blue-300',
    },
  },
  {
    id: 'ple',
    label: 'PLE SUNAT',
    icon: Landmark,
    path: '/contabilidad/ple',
    enabled: true,
    badge: 'V3',
    descripcion: 'Generación y validación de libros electrónicos para SUNAT',
    accent: {
      soft: 'bg-teal-50',
      text: 'text-teal-600',
      solid: 'bg-teal-600 hover:bg-teal-700',
      ring: 'hover:border-teal-300',
    },
  },
  {
    id: 'balance-comprobacion',
    label: 'Balance de Comprobación',
    icon: Scale,
    path: '/contabilidad/balance-comprobacion',
    enabled: false,
    descripcion: 'Estado de saldos deudores y acreedores del período',
    accent: {
      soft: 'bg-violet-50',
      text: 'text-violet-600',
      solid: 'bg-violet-600 hover:bg-violet-700',
      ring: 'hover:border-violet-300',
    },
  },
  {
    id: 'estados-financieros',
    label: 'Estados Financieros',
    icon: LineChart,
    path: '/contabilidad/estados-financieros',
    enabled: false,
    descripcion: 'Balance general, estado de resultados y flujo de efectivo',
    accent: {
      soft: 'bg-purple-50',
      text: 'text-purple-600',
      solid: 'bg-purple-600 hover:bg-purple-700',
      ring: 'hover:border-purple-300',
    },
  },
  {
    id: 'activos-fijos',
    label: 'Activos Fijos',
    icon: Building,
    path: '/contabilidad/activos-fijos',
    enabled: false,
    descripcion: 'Gestión de bienes de capital y depreciación',
    accent: {
      soft: 'bg-cyan-50',
      text: 'text-cyan-600',
      solid: 'bg-cyan-600 hover:bg-cyan-700',
      ring: 'hover:border-cyan-300',
    },
  },
];

// ============================================================================
// MODULOS SIRE
// ============================================================================
// Mismo patron que CONTABILIDAD_MODULES: antes cada pantalla de SIRE llevaba
// sus tarjetas escritas a mano con sus propios colores.

export const SIRE_MODULES: ModuloContable[] = [
  {
    id: 'rvie',
    label: 'RVIE',
    icon: Coins,
    path: '/sire/rvie',
    enabled: true,
    descripcion: 'Registro de Ventas e Ingresos Electrónico: propuestas SUNAT, aceptación y reemplazos',
    accent: {
      soft: 'bg-blue-50',
      text: 'text-blue-600',
      solid: 'bg-blue-600 hover:bg-blue-700',
      ring: 'hover:border-blue-300',
    },
  },
  {
    id: 'rce',
    label: 'RCE',
    icon: ShoppingCart,
    path: '/sire/rce',
    enabled: true,
    descripcion: 'Registro de Compras Electrónico: gestión, validación y reportes de compras',
    accent: {
      soft: 'bg-emerald-50',
      text: 'text-emerald-600',
      solid: 'bg-emerald-600 hover:bg-emerald-700',
      ring: 'hover:border-emerald-300',
    },
  },
];

/** Sub-modulos de RVIE (tarjetas de /sire/rvie) */
export const RVIE_MODULES: ModuloContable[] = [
  {
    id: 'rvie-operaciones',
    label: 'Operaciones',
    icon: Landmark,
    path: '/sire/rvie/operaciones',
    enabled: true,
    descripcion: 'Descarga y aceptación de propuestas de SUNAT',
    accent: {
      soft: 'bg-blue-50',
      text: 'text-blue-600',
      solid: 'bg-blue-600 hover:bg-blue-700',
      ring: 'hover:border-blue-300',
    },
  },
  {
    id: 'rvie-tickets',
    label: 'Tickets',
    icon: FileBarChart,
    path: '/sire/rvie/tickets',
    enabled: true,
    descripcion: 'Seguimiento de los tickets generados en SUNAT',
    accent: {
      soft: 'bg-violet-50',
      text: 'text-violet-600',
      solid: 'bg-violet-600 hover:bg-violet-700',
      ring: 'hover:border-violet-300',
    },
  },
  {
    id: 'rvie-ventas',
    label: 'Ventas',
    icon: Coins,
    path: '/sire/rvie/ventas',
    enabled: true,
    descripcion: 'Comprobantes de venta descargados del periodo',
    accent: {
      soft: 'bg-green-50',
      text: 'text-green-600',
      solid: 'bg-green-600 hover:bg-green-700',
      ring: 'hover:border-green-300',
    },
  },
];

/** Sub-modulos de RCE (tarjetas de /sire/rce) */
export const RCE_MODULES: ModuloContable[] = [
  {
    id: 'rce-operaciones',
    label: 'Operaciones',
    icon: Landmark,
    path: '/sire/rce/operaciones',
    enabled: true,
    descripcion: 'Descarga de propuestas y gestión de comprobantes de compra',
    accent: {
      soft: 'bg-emerald-50',
      text: 'text-emerald-600',
      solid: 'bg-emerald-600 hover:bg-emerald-700',
      ring: 'hover:border-emerald-300',
    },
  },
  {
    id: 'rce-tickets',
    label: 'Tickets',
    icon: FileBarChart,
    path: '/sire/rce/tickets',
    enabled: true,
    descripcion: 'Seguimiento de los tickets generados en SUNAT',
    accent: {
      soft: 'bg-violet-50',
      text: 'text-violet-600',
      solid: 'bg-violet-600 hover:bg-violet-700',
      ring: 'hover:border-violet-300',
    },
  },
  {
    id: 'rce-resumen',
    label: 'Resumen',
    icon: BarChart3,
    path: '/sire/rce/resumen',
    enabled: true,
    descripcion: 'Totales y comprobantes del periodo consultado',
    accent: {
      soft: 'bg-blue-50',
      text: 'text-blue-600',
      solid: 'bg-blue-600 hover:bg-blue-700',
      ring: 'hover:border-blue-300',
    },
  },
];

// ============================================================================
// TITULOS DE PAGINA
// ============================================================================
// Antes cada pagina pasaba `title`/`subtitle` como props a su propia instancia
// de MainLayout. Al convertir el layout en route layout, el titulo se resuelve
// desde la ruta.

export const DEFAULT_PAGE_META: PageMeta = {
  title: 'ERP Sistema',
  subtitle: 'Panel de control y gestión empresarial',
};

const PAGE_META: Record<string, PageMeta> = {
  '/configuracion': {
    title: 'Configuración',
    subtitle: 'Subdiarios contables y parámetros del sistema',
  },
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Resumen general de la operación',
  },
  '/socios-negocio': {
    title: 'Socios de Negocio',
    subtitle: 'Gestiona proveedores, clientes y socios comerciales',
  },
  '/sire': {
    title: 'SIRE',
    subtitle: 'Sistema de Información de Reportes Electrónicos de SUNAT',
  },
  '/sire/rvie': {
    title: 'RVIE',
    subtitle: 'Registro de Ventas e Ingresos Electrónico',
  },
  '/sire/rvie/operaciones': {
    title: 'RVIE · Operaciones',
    subtitle: 'Descarga y aceptación de propuestas de SUNAT',
  },
  '/sire/rvie/tickets': {
    title: 'RVIE · Tickets',
    subtitle: 'Seguimiento de los tickets generados en SUNAT',
  },
  '/sire/rvie/ventas': {
    title: 'RVIE · Ventas',
    subtitle: 'Comprobantes de venta descargados del periodo',
  },
  '/sire/rce': {
    title: 'RCE',
    subtitle: 'Registro de Compras Electrónico',
  },
  '/sire/rce/operaciones': {
    title: 'RCE · Operaciones',
    subtitle: 'Descarga de propuestas y gestión de comprobantes de compra',
  },
  '/sire/rce/tickets': {
    title: 'RCE · Tickets',
    subtitle: 'Seguimiento de los tickets generados en SUNAT',
  },
  '/sire/rce/resumen': {
    title: 'RCE · Resumen',
    subtitle: 'Totales y comprobantes del periodo consultado',
  },
  '/contabilidad': {
    title: 'Contabilidad',
    subtitle: 'Gestión financiera y libros contables',
  },
  '/contabilidad/plan-contable': {
    title: 'Plan Contable',
    subtitle: 'Catálogo general de cuentas contables según normativa peruana',
  },
  '/contabilidad/libro-diario': {
    title: 'Libro Diario',
    subtitle: 'Registro cronológico de todas las operaciones contables',
  },
  '/contabilidad/registro-compras': {
    title: 'Registro de Compras',
    subtitle: 'Registro de facturas y documentos de compras según PLE 080000',
  },
  '/contabilidad/ventas-sire': {
    title: 'Ventas desde SIRE',
    subtitle: 'Importa los comprobantes de SUNAT y generalos en el libro diario',
  },
  '/contabilidad/registro-ventas': {
    title: 'Registro de Ventas',
    subtitle: 'Registro de comprobantes de venta según PLE 140000',
  },
  '/contabilidad/libro-mayor': {
    title: 'Libro Mayor',
    subtitle: 'Movimientos por cuenta contable y saldos acumulados',
  },
  '/contabilidad/ple': {
    title: 'PLE - Programa de Libros Electrónicos',
    subtitle: 'Generación de archivos PLE para SUNAT V3',
  },
};

/**
 * Resuelve el titulo de la cabecera para una ruta.
 * Busca coincidencia exacta y, si no la hay, el prefijo mas largo
 * (para que /contabilidad/libro-diario/20612969125 herede su titulo).
 */
export function resolvePageMeta(pathname: string): PageMeta {
  const exact = PAGE_META[pathname];
  if (exact) return exact;

  const prefix = Object.keys(PAGE_META)
    .filter((p) => pathname.startsWith(`${p}/`))
    .sort((a, b) => b.length - a.length)[0];

  return prefix ? PAGE_META[prefix] : DEFAULT_PAGE_META;
}

export interface Crumb {
  label: string;
  path: string;
}

/**
 * Construye las migas de pan recorriendo los segmentos de la ruta y quedandose
 * con los que tienen titulo declarado. Los titulos compuestos ("RVIE · Tickets")
 * se acortan a su ultima parte, que es lo que se quiere en una miga.
 *
 * Antes cada pantalla de SIRE escribia sus migas a mano con <button> y
 * navigate(), dentro de un bloque de cabecera de ~75 lineas que ademas repetia
 * el titulo que ya muestra MainLayout.
 */
export function buildBreadcrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [];
  let acc = '';

  for (const segment of pathname.split('/').filter(Boolean)) {
    acc += `/${segment}`;
    const meta = PAGE_META[acc];
    if (!meta) continue;

    const parts = meta.title.split('·');
    crumbs.push({ label: parts[parts.length - 1].trim(), path: acc });
  }

  return crumbs;
}

/**
 * Determina si un item de navegacion esta activo.
 * Unifica las tres implementaciones divergentes de `isActiveRoute` que existian.
 */
export function isActivePath(pathname: string, itemPath: string): boolean {
  if (pathname === itemPath) return true;
  return pathname.startsWith(`${itemPath}/`);
}
