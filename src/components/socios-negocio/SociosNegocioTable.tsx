import React from 'react';
import type { SocioNegocio } from '../../services/sociosNegocioApi';

interface SociosNegocioTableProps {
  socios: SocioNegocio[];
  onEdit: (socio: SocioNegocio) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const SociosNegocioTable: React.FC<SociosNegocioTableProps> = ({
  socios,
  onEdit,
  onDelete,
  loading = false
}) => {
  const tableStyles = {
    container: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      border: '1px solid #e5e7eb'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const
    },
    header: {
      backgroundColor: '#f8fafc',
      borderBottom: '2px solid #e5e7eb'
    },
    headerCell: {
      padding: '16px 12px',
      textAlign: 'left' as const,
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      borderRight: '1px solid #e5e7eb'
    },
    row: {
      borderBottom: '1px solid #f1f5f9',
      transition: 'background-color 0.2s ease'
    },
    rowHover: {
      backgroundColor: '#f8fafc'
    },
    cell: {
      padding: '12px',
      fontSize: '14px',
      color: '#374151',
      borderRight: '1px solid #f1f5f9'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize' as const
    },
    badgeCliente: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    badgeProveedor: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    badgeAmbos: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    actionButton: {
      padding: '6px 12px',
      margin: '0 2px',
      borderRadius: '4px',
      border: 'none',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    editButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    editButtonHover: {
      backgroundColor: '#2563eb'
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    deleteButtonHover: {
      backgroundColor: '#dc2626'
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '48px 24px',
      color: '#6b7280'
    },
    loadingState: {
      textAlign: 'center' as const,
      padding: '48px 24px',
      color: '#6b7280',
      fontSize: '14px'
    }
  };

  const getBadgeStyle = (tipoSocio: string) => {
    switch (tipoSocio.toLowerCase()) {
      case 'cliente':
        return { ...tableStyles.badge, ...tableStyles.badgeCliente };
      case 'proveedor':
        return { ...tableStyles.badge, ...tableStyles.badgeProveedor };
      case 'ambos':
        return { ...tableStyles.badge, ...tableStyles.badgeAmbos };
      default:
        return { ...tableStyles.badge, ...tableStyles.badgeCliente };
    }
  };

  const formatDocument = (tipoDoc: string, numeroDoc: string) => {
    return `${tipoDoc}: ${numeroDoc}`;
  };

  if (loading) {
    return (
      <div style={tableStyles.container}>
        <div style={tableStyles.loadingState}>
          <div>🔄 Cargando socios de negocio...</div>
        </div>
      </div>
    );
  }

  if (socios.length === 0) {
    return (
      <div style={tableStyles.container}>
        <div style={tableStyles.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#374151' }}>
            No hay socios registrados
          </h3>
          <p style={{ margin: '0', fontSize: '14px' }}>
            Comienza agregando tu primer socio de negocio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={tableStyles.container}>
      <table style={tableStyles.table}>
        <thead style={tableStyles.header}>
          <tr>
            <th style={tableStyles.headerCell}>Documento</th>
            <th style={tableStyles.headerCell}>Razón Social</th>
            <th style={tableStyles.headerCell}>Tipo</th>
            <th style={tableStyles.headerCell}>Email</th>
            <th style={tableStyles.headerCell}>Teléfono</th>
            <th style={tableStyles.headerCell}>Estado</th>
            <th style={{ ...tableStyles.headerCell, borderRight: 'none' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {socios.map((socio) => (
            <tr 
              key={socio.id} 
              style={tableStyles.row}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tableStyles.rowHover.backgroundColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <td style={tableStyles.cell}>
                {formatDocument(socio.tipo_documento, socio.numero_documento)}
              </td>
              <td style={tableStyles.cell}>
                <div style={{ fontWeight: '500' }}>{socio.razon_social}</div>
                {socio.nombre_comercial && (
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {socio.nombre_comercial}
                  </div>
                )}
              </td>
              <td style={tableStyles.cell}>
                <span style={getBadgeStyle(socio.tipo_socio)}>
                  {socio.tipo_socio}
                </span>
              </td>
              <td style={tableStyles.cell}>
                {socio.email || '-'}
              </td>
              <td style={tableStyles.cell}>
                {socio.telefono || '-'}
              </td>
              <td style={tableStyles.cell}>
                <span style={{
                  ...tableStyles.badge,
                  backgroundColor: socio.activo ? '#d1fae5' : '#fee2e2',
                  color: socio.activo ? '#065f46' : '#991b1b'
                }}>
                  {socio.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td style={{ ...tableStyles.cell, borderRight: 'none' }}>
                <button
                  style={{
                    ...tableStyles.actionButton,
                    ...tableStyles.editButton
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = tableStyles.editButtonHover.backgroundColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = tableStyles.editButton.backgroundColor;
                  }}
                  onClick={() => onEdit(socio)}
                >
                  ✏️ Editar
                </button>
                <button
                  style={{
                    ...tableStyles.actionButton,
                    ...tableStyles.deleteButton
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = tableStyles.deleteButtonHover.backgroundColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = tableStyles.deleteButton.backgroundColor;
                  }}
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de eliminar a ${socio.razon_social}?`)) {
                      onDelete(socio.id);
                    }
                  }}
                >
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SociosNegocioTable;
