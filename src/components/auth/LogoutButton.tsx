import React from 'react';
import { SignOutButton } from '@clerk/clerk-react';
import { LogOut } from 'lucide-react';
import { cn } from '../../lib/cn';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const VARIANTS: Record<NonNullable<LogoutButtonProps['variant']>, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-slate-500 text-white hover:bg-slate-600',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const SIZES: Record<NonNullable<LogoutButtonProps['size']>, string> = {
  small: 'px-3 py-1.5 text-xs',
  medium: 'px-4 py-2 text-sm',
  large: 'px-6 py-3 text-base',
};

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'danger',
  size = 'medium',
  showIcon = true,
}) => (
  <SignOutButton>
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border-0 font-medium transition-colors',
        VARIANTS[variant],
        SIZES[size]
      )}
    >
      {showIcon && <LogOut className="size-4" aria-hidden="true" />}
      Cerrar sesión
    </button>
  </SignOutButton>
);

export default LogoutButton;
