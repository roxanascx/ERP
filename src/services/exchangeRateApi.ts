import axios from 'axios';

export interface ServerExchangeRate {
  id?: string;
  fecha: string; // ISO
  moneda_origen: string;
  moneda_destino: string;
  compra?: number;
  venta?: number;
  oficial?: number | null;
}

const defaultBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
  ? import.meta.env.VITE_API_BASE
  : '/api/v1';

const api = axios.create({
  baseURL: defaultBase,
  timeout: 3000
});

export async function getCurrentExchangeRate(moneda_origen = 'USD', moneda_destino = 'PEN') {
  try {
  const resp = await api.get(`/consultas/tipos-cambio/actual`, {
      params: { moneda_origen, moneda_destino }
    });

    return resp.data as ServerExchangeRate;
  } catch (err) {
    // Bubble up error for caller to handle fallback
    throw err;
  }
}

export default { getCurrentExchangeRate };
