import React from 'react';
import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react';

const LoginButton: React.FC = () => {
  const { isSignedIn } = useAuth();

  // Con sesion iniciada no hay nada que ofrecer.
  if (isSignedIn) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <SignInButton mode="modal">
        <button
          type="button"
          className="rounded-lg border-0 bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
        >
          Iniciar sesión
        </button>
      </SignInButton>

      <SignUpButton mode="modal">
        <button
          type="button"
          className="rounded-lg border-2 border-blue-600 bg-transparent px-6 py-3 text-base font-medium text-blue-600 transition-colors hover:bg-blue-50"
        >
          Registrarse
        </button>
      </SignUpButton>
    </div>
  );
};

export default LoginButton;
