import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { LogoutButton } from '../components/auth';

/** Banco de pruebas de LogoutButton. Solo se enruta en desarrollo. */
const Card: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h3 className="mb-1 text-sm font-semibold text-slate-900">{title}</h3>
    {description && <p className="mb-4 text-sm text-slate-500">{description}</p>}
    {children}
  </section>
);

const TestLogoutPage: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isSignedIn || !user) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-lg font-semibold text-slate-700">
          Debes iniciar sesión para ver esta página
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center text-2xl font-bold tracking-tight text-slate-900">
          Variantes de «Cerrar sesión»
        </h1>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card title="Danger (rojo)" description="Estilo de advertencia.">
            <LogoutButton variant="danger" size="medium" />
          </Card>

          <Card title="Primary (azul)" description="Estilo principal.">
            <LogoutButton variant="primary" size="medium" />
          </Card>

          <Card title="Secondary (gris)" description="Estilo secundario.">
            <LogoutButton variant="secondary" size="medium" />
          </Card>

          <Card title="Sin icono" description="Solo texto.">
            <LogoutButton variant="danger" size="medium" showIcon={false} />
          </Card>

          <Card title="Tamaños" description="Pequeño, mediano y grande.">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="mb-2 text-xs text-slate-500">Pequeño</p>
                <LogoutButton variant="danger" size="small" />
              </div>
              <div>
                <p className="mb-2 text-xs text-slate-500">Mediano</p>
                <LogoutButton variant="danger" size="medium" />
              </div>
              <div>
                <p className="mb-2 text-xs text-slate-500">Grande</p>
                <LogoutButton variant="danger" size="large" />
              </div>
            </div>
          </Card>

          <Card title="Sesión actual">
            <dl className="space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="text-slate-500">Usuario:</dt>
                <dd className="font-medium text-slate-800">{user.fullName ?? '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-slate-500">Email:</dt>
                <dd className="font-medium text-slate-800">
                  {user.primaryEmailAddress?.emailAddress ?? '—'}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestLogoutPage;
