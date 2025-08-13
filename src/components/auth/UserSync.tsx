import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { apiService } from '../../services/api';

interface User {
  id: string;
  clerk_id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

const UserSync: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [backendUser, setBackendUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'not-synced' | 'synced' | 'syncing'>('not-synced');

  // Auto-sincronización cuando el usuario se carga
  useEffect(() => {
    if (isLoaded && user) {
      autoSyncUser();
    }
  }, [isLoaded, user]);

  // Función para auto-sincronización
  const autoSyncUser = async () => {
    if (!user) return;

    try {
      console.log('🔄 Verificando sincronización automática...');
      
      // Primero verificar si el usuario ya existe
      const response = await apiService.users.getByClerkId(user.id);
      
      if (response.data) {
        // Usuario ya existe
        setBackendUser(response.data);
        setSyncStatus('synced');
        console.log('✅ Usuario ya existe en BD');
      } else {
        // Usuario no existe, sincronizar automáticamente
        console.log('🔄 Usuario no existe, sincronizando automáticamente...');
        await syncCurrentUser(false);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Usuario no encontrado, sincronizar automáticamente
        console.log('🔄 Usuario no encontrado (404), sincronizando automáticamente...');
        await syncCurrentUser(false);
      } else {
        console.error('❌ Error en auto-sync:', error);
        setError(`Error en auto-sincronización: ${error.message}`);
      }
    }
  };

  // Función para sincronizar usuario actual
  const syncCurrentUser = async (isManual: boolean = false) => {
    if (!user) return;

    try {
      if (isManual) {
        setLoading(true);
      }
      setSyncStatus('syncing');
      setError(null);

      const userData = {
        clerk_id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        profile_image_url: user.imageUrl
      };

      console.log('Sincronizando usuario:', userData);

      const response = await apiService.users.sync(userData);
      setBackendUser(response.data);
      setSyncStatus('synced');
      
      if (isManual) {
        console.log('✅ Usuario sincronizado manualmente:', response.data);
      } else {
        console.log('✅ Usuario sincronizado automáticamente:', response.data);
      }
      
      // Actualizar lista de usuarios
      await loadAllUsers();
      
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Error al sincronizar usuario');
      setSyncStatus('not-synced');
      console.error('Error al sincronizar:', err);
    } finally {
      if (isManual) {
        setLoading(false);
      }
    }
  };

  // Función para cargar todos los usuarios
  const loadAllUsers = async () => {
    try {
      const response = await apiService.users.getAll();
      setAllUsers(response.data);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  // Verificar si el usuario ya está sincronizado
  useEffect(() => {
    const checkUserSync = async () => {
      if (!user?.id) return;

      try {
        const response = await apiService.users.getByClerkId(user.id);
        setBackendUser(response.data);
        setSyncStatus('synced');
      } catch (err) {
        // Usuario no encontrado, necesita sincronización
        setSyncStatus('not-synced');
      }
    };

    if (isLoaded && user) {
      checkUserSync();
      loadAllUsers();
    }
  }, [user, isLoaded]);

  if (!isLoaded) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>;
  }

  if (!user) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>No hay usuario autenticado</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔄 Sincronización de Usuarios</h2>
      
      {/* Estado del usuario actual */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        background: syncStatus === 'synced' ? '#f0fdf4' : '#fef3f2'
      }}>
        <h3>Usuario Actual</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
          <div><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</div>
          <div><strong>Nombre:</strong> {user.firstName} {user.lastName}</div>
          <div><strong>Username:</strong> {user.username || 'No definido'}</div>
          <div><strong>Clerk ID:</strong> {user.id}</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>Estado de Sincronización:</strong>{' '}
          {syncStatus === 'synced' && <span style={{ color: '#16a34a' }}>✅ Sincronizado</span>}
          {syncStatus === 'not-synced' && <span style={{ color: '#dc2626' }}>❌ No sincronizado</span>}
          {syncStatus === 'syncing' && <span style={{ color: '#f59e0b' }}>🔄 Sincronizando...</span>}
        </div>

        {syncStatus === 'not-synced' && (
          <button
            onClick={() => syncCurrentUser(true)}
            disabled={loading}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            {loading ? 'Sincronizando...' : 'Sincronizar Usuario'}
          </button>
        )}

        {syncStatus === 'synced' && (
          <button
            onClick={() => syncCurrentUser(true)}
            disabled={loading}
            style={{
              background: '#16a34a',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            {loading ? 'Actualizando...' : 'Actualizar Datos'}
          </button>
        )}

        <button
          onClick={loadAllUsers}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Recargar Lista
        </button>

        {error && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '6px',
            color: '#dc2626'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Lista de todos los usuarios */}
      <div style={{ marginTop: '30px' }}>
        <h3>👥 Usuarios Registrados ({allUsers.length})</h3>
        
        {allUsers.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
            No hay usuarios registrados en la base de datos
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {allUsers.map((dbUser) => (
              <div 
                key={dbUser.id} 
                style={{ 
                  padding: '15px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  background: dbUser.clerk_id === user.id ? '#f0f9ff' : '#f9fafb'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div><strong>Email:</strong> {dbUser.email}</div>
                  <div><strong>Nombre:</strong> {dbUser.first_name} {dbUser.last_name}</div>
                  <div><strong>Username:</strong> {dbUser.username || 'No definido'}</div>
                  <div><strong>Estado:</strong> {dbUser.is_active ? '✅ Activo' : '❌ Inactivo'}</div>
                  <div><strong>Registrado:</strong> {new Date(dbUser.created_at).toLocaleDateString()}</div>
                  <div><strong>Último login:</strong> {dbUser.last_sign_in_at ? new Date(dbUser.last_sign_in_at).toLocaleDateString() : 'Nunca'}</div>
                </div>
                {dbUser.clerk_id === user.id && (
                  <div style={{ marginTop: '10px', padding: '5px 10px', background: '#dbeafe', borderRadius: '4px', fontSize: '12px' }}>
                    🎯 Este eres tú
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSync;
