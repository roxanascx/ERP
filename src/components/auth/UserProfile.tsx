import React from 'react';
import { UserButton, useAuth, useUser, SignOutButton } from '@clerk/clerk-react';

const UserProfile: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isSignedIn || !user) {
    return null;
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px',
      padding: '10px 15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: {
                  width: '40px',
                  height: '40px'
                }
              }
            }}
          />
          <div>
            <div style={{ 
              fontWeight: '600', 
              fontSize: '14px',
              color: '#1f2937'
            }}>
              {user.firstName} {user.lastName}
            </div>
            <div style={{ 
              fontSize: '12px',
              color: '#6b7280'
            }}>
              {user.primaryEmailAddress?.emailAddress}
            </div>
          </div>
        </div>
        
        {/* Botón de Cerrar Sesión Personalizado */}
        <SignOutButton>
          <button 
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </SignOutButton>
      </div>
    </div>
  );
};

export default UserProfile;
