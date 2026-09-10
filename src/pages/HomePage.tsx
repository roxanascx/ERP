import React from 'react';
import { BarChart3, Building2, TrendingUp, Wallet } from 'lucide-react';
import { LoginButton } from '../components/auth';

const CARACTERISTICAS = [
  { icon: Wallet, title: 'Contabilidad', desc: 'Libros contables y PLE para SUNAT' },
  { icon: BarChart3, title: 'SIRE', desc: 'Registros de compras y ventas electrónicos' },
  { icon: TrendingUp, title: 'Reportes', desc: 'Análisis y estadísticas del periodo' },
];

/**
 * Landing publica.
 * La rejilla de caracteristicas tenia el icono de "Reportes" fuera de su
 * tarjeta, lo que la convertia en un cuarto elemento y descuadraba la fila.
 */
const HomePage: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-500 to-purple-700 p-5">
    <div className="w-full max-w-2xl rounded-3xl bg-white p-8 text-center shadow-2xl sm:p-12">
      <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white">
        <Building2 className="size-8" aria-hidden="true" />
      </div>

      <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Sistema ERP
      </h1>

      <p className="mx-auto mb-10 max-w-md text-lg leading-relaxed text-slate-500">
        Gestión empresarial para contabilidad peruana: libros electrónicos, SIRE y socios de
        negocio.
      </p>

      <ul className="mb-12 grid gap-6 sm:grid-cols-3">
        {CARACTERISTICAS.map(({ icon: Icon, title, desc }) => (
          <li key={title}>
            <div className="mx-auto mb-2 grid size-11 place-items-center rounded-xl bg-slate-100">
              <Icon className="size-5 text-slate-600" aria-hidden="true" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
          </li>
        ))}
      </ul>

      <h2 className="mb-5 text-xl font-semibold text-slate-900">¿Listo para comenzar?</h2>
      <LoginButton />

      <p className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-400">
        © {new Date().getFullYear()} Sistema ERP · React + FastAPI + MongoDB
      </p>
    </div>
  </div>
);

export default HomePage;
