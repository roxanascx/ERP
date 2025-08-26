import { useState, useEffect } from 'react';
import type { DetalleAsiento } from '../types/libroDiario';

export interface PlantillaAsiento {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: 'ventas' | 'compras' | 'gastos' | 'personal' | 'financiero' | 'inventario' | 'otros';
  detalles: DetalleAsiento[];
  icono: string;
}

const PLANTILLAS_PREDEFINIDAS: PlantillaAsiento[] = [
  {
    id: 'venta-contado',
    nombre: 'Venta al Contado',
    descripcion: 'Registro de venta con cobranza inmediata',
    categoria: 'ventas',
    icono: '💰',
    detalles: [
      { codigoCuenta: '101101', denominacionCuenta: 'Caja', descripcion: 'Por cobranza de venta', debe: 0, haber: 0 },
      { codigoCuenta: '401111', denominacionCuenta: 'IGV por pagar', descripcion: 'IGV de la venta', debe: 0, haber: 0 },
      { codigoCuenta: '701101', denominacionCuenta: 'Ventas', descripcion: 'Venta de mercadería', debe: 0, haber: 0 }
    ]
  },
  {
    id: 'venta-credito',
    nombre: 'Venta al Crédito',
    descripcion: 'Registro de venta con cobranza diferida',
    categoria: 'ventas',
    icono: '🧾',
    detalles: [
      { codigoCuenta: '121101', denominacionCuenta: 'Facturas por cobrar', descripcion: 'Por venta al crédito', debe: 0, haber: 0 },
      { codigoCuenta: '401111', denominacionCuenta: 'IGV por pagar', descripcion: 'IGV de la venta', debe: 0, haber: 0 },
      { codigoCuenta: '701101', denominacionCuenta: 'Ventas', descripcion: 'Venta de mercadería', debe: 0, haber: 0 }
    ]
  },
  {
    id: 'compra-contado',
    nombre: 'Compra al Contado',
    descripcion: 'Registro de compra con pago inmediato',
    categoria: 'compras',
    icono: '🛒',
    detalles: [
      { codigoCuenta: '601101', denominacionCuenta: 'Mercaderías', descripcion: 'Por compra de mercadería', debe: 0, haber: 0 },
      { codigoCuenta: '401111', denominacionCuenta: 'IGV crédito fiscal', descripcion: 'IGV de la compra', debe: 0, haber: 0 },
      { codigoCuenta: '101101', denominacionCuenta: 'Caja', descripcion: 'Por pago de compra', debe: 0, haber: 0 }
    ]
  },
  {
    id: 'compra-credito',
    nombre: 'Compra al Crédito',
    descripcion: 'Registro de compra con pago diferido',
    categoria: 'compras',
    icono: '📋',
    detalles: [
      { codigoCuenta: '601101', denominacionCuenta: 'Mercaderías', descripcion: 'Por compra de mercadería', debe: 0, haber: 0 },
      { codigoCuenta: '401111', denominacionCuenta: 'IGV crédito fiscal', descripcion: 'IGV de la compra', debe: 0, haber: 0 },
      { codigoCuenta: '421101', denominacionCuenta: 'Proveedores', descripcion: 'Por compra al crédito', debe: 0, haber: 0 }
    ]
  },
  {
    id: 'pago-sueldos',
    nombre: 'Pago de Sueldos',
    descripcion: 'Registro del pago de planilla de sueldos',
    categoria: 'personal',
    icono: '👥',
    detalles: [
      { codigoCuenta: '621101', denominacionCuenta: 'Sueldos', descripcion: 'Por planilla de sueldos', debe: 0, haber: 0 },
      { codigoCuenta: '403101', denominacionCuenta: 'Essalud por pagar', descripcion: 'Aporte Essalud', debe: 0, haber: 0 },
      { codigoCuenta: '403201', denominacionCuenta: 'ONP por pagar', descripcion: 'Aporte ONP', debe: 0, haber: 0 },
      { codigoCuenta: '101201', denominacionCuenta: 'Bancos', descripcion: 'Por pago de planilla', debe: 0, haber: 0 }
    ]
  },
  {
    id: 'deposito-banco',
    nombre: 'Depósito a Banco',
    descripcion: 'Traslado de efectivo de caja a cuenta bancaria',
    categoria: 'financiero',
    icono: '🏦',
    detalles: [
      { codigoCuenta: '101201', denominacionCuenta: 'Bancos', descripcion: 'Por depósito en cuenta corriente', debe: 0, haber: 0 },
      { codigoCuenta: '101101', denominacionCuenta: 'Caja', descripcion: 'Por traslado a banco', debe: 0, haber: 0 }
    ]
  },
  {
    id: 'gasto-servicios',
    nombre: 'Gasto en Servicios',
    descripcion: 'Pago de servicios públicos (luz, agua, teléfono)',
    categoria: 'gastos',
    icono: '⚡',
    detalles: [
      { codigoCuenta: '636101', denominacionCuenta: 'Servicios públicos', descripcion: 'Por pago de servicios', debe: 0, haber: 0 },
      { codigoCuenta: '401111', denominacionCuenta: 'IGV crédito fiscal', descripcion: 'IGV de servicios', debe: 0, haber: 0 },
      { codigoCuenta: '101101', denominacionCuenta: 'Caja', descripcion: 'Por pago en efectivo', debe: 0, haber: 0 }
    ]
  }
];

export const usePlantillasAsiento = () => {
  const [plantillas, setPlantillas] = useState<PlantillaAsiento[]>([]);
  const [plantillasPersonalizadas, setPlantillasPersonalizadas] = useState<PlantillaAsiento[]>([]);

  useEffect(() => {
    // Cargar plantillas predefinidas
    setPlantillas(PLANTILLAS_PREDEFINIDAS);
    
    // Cargar plantillas personalizadas del localStorage
    const plantillasGuardadas = localStorage.getItem('plantillas-asientos-personalizadas');
    if (plantillasGuardadas) {
      try {
        const plantillasParseadas = JSON.parse(plantillasGuardadas);
        setPlantillasPersonalizadas(plantillasParseadas);
      } catch (error) {
        console.error('Error al cargar plantillas personalizadas:', error);
      }
    }
  }, []);

  const obtenerPlantillasPorCategoria = (categoria?: string) => {
    const todasLasPlantillas = [...plantillas, ...plantillasPersonalizadas];
    if (!categoria) return todasLasPlantillas;
    return todasLasPlantillas.filter(p => p.categoria === categoria);
  };

  const agregarPlantillaPersonalizada = (plantilla: Omit<PlantillaAsiento, 'id'>) => {
    const nuevaPlantilla: PlantillaAsiento = {
      ...plantilla,
      id: `custom-${Date.now()}`
    };
    
    const nuevasPlantillas = [...plantillasPersonalizadas, nuevaPlantilla];
    setPlantillasPersonalizadas(nuevasPlantillas);
    
    // Guardar en localStorage
    localStorage.setItem('plantillas-asientos-personalizadas', JSON.stringify(nuevasPlantillas));
    
    return nuevaPlantilla;
  };

  const eliminarPlantillaPersonalizada = (id: string) => {
    const nuevasPlantillas = plantillasPersonalizadas.filter(p => p.id !== id);
    setPlantillasPersonalizadas(nuevasPlantillas);
    localStorage.setItem('plantillas-asientos-personalizadas', JSON.stringify(nuevasPlantillas));
  };

  const obtenerPlantillaPorId = (id: string): PlantillaAsiento | undefined => {
    return [...plantillas, ...plantillasPersonalizadas].find(p => p.id === id);
  };

  const categorias = [
    { id: 'ventas', nombre: 'Ventas', icono: '💰' },
    { id: 'compras', nombre: 'Compras', icono: '🛒' },
    { id: 'gastos', nombre: 'Gastos', icono: '💸' },
    { id: 'personal', nombre: 'Personal', icono: '👥' },
    { id: 'financiero', nombre: 'Financiero', icono: '🏦' },
    { id: 'inventario', nombre: 'Inventario', icono: '📦' },
    { id: 'otros', nombre: 'Otros', icono: '📄' }
  ];

  return {
    plantillas: [...plantillas, ...plantillasPersonalizadas],
    plantillasPredefinidas: plantillas,
    plantillasPersonalizadas,
    categorias,
    obtenerPlantillasPorCategoria,
    obtenerPlantillaPorId,
    agregarPlantillaPersonalizada,
    eliminarPlantillaPersonalizada
  };
};

export default usePlantillasAsiento;
