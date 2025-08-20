import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { EmpresaCardProps } from '../../types/empresa';

const EmpresaCard: React.FC<EmpresaCardProps> = ({
  empresa,
  onSelect,
  onEdit,
  onDelete,
  onConfigSire,
  isSelected = false
}) => {
  const navigate = useNavigate();
  
  const handleSelect = () => {
    if (onSelect) {
      onSelect(empresa);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(empresa);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm(`¿Estás seguro de eliminar la empresa ${empresa.razon_social}?`)) {
      onDelete(empresa.ruc);
    }
  };

  const handleConfigSire = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onConfigSire) {
      onConfigSire(empresa);
    }
  };

  const cardStyles: React.CSSProperties = {
    border: isSelected ? '2px solid #007bff' : '1px solid #e0e0e0',
    borderRadius: 'clamp(8px, 2vw, 12px)',
    padding: 'clamp(12px, 3vw, 20px)',
    margin: 'clamp(8px, 2vw, 12px) 0',
    backgroundColor: isSelected ? '#f8f9ff' : 'white',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isSelected 
      ? '0 8px 25px rgba(0,123,255,0.15), 0 3px 6px rgba(0,123,255,0.1)' 
      : '0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    minHeight: 'clamp(200px, 25vh, 300px)',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(8px, 2vw, 12px)',
    marginBottom: 'clamp(12px, 3vw, 16px)',
  };

  const titleRowStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    flexWrap: 'wrap',
  };

  const titleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: 'clamp(16px, 4vw, 20px)',
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: '-0.025em',
    lineHeight: '1.2',
  };

  const badgeContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'clamp(4px, 1vw, 8px)',
    alignItems: 'center',
  };

  const actionButtonsStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'clamp(8px, 2vw, 12px)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    padding: 'clamp(8px, 2vw, 12px) 0',
  };

  return (
    <>
      <div 
        onClick={handleSelect} 
        style={cardStyles}
        title={isSelected ? "Empresa seleccionada - Haz clic en INGRESAR para ir al Dashboard" : "Haz clic para seleccionar esta empresa"}
      >
        {/* Header con RUC y badges */}
        <div style={headerStyles}>
          <div style={titleRowStyles}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <h3 style={titleStyles}>
                {empresa.ruc}
              </h3>
              <div style={badgeContainerStyles}>
                <span 
                  style={{
                    fontSize: 'clamp(10px, 2vw, 12px)',
                    padding: '2px clamp(6px, 1.5vw, 10px)',
                    borderRadius: 'clamp(10px, 2vw, 14px)',
                    backgroundColor: empresa.activa ? '#d1f2eb' : '#fadbd8',
                    color: empresa.activa ? '#0e6b47' : '#a93226',
                    fontWeight: '600',
                    border: `1px solid ${empresa.activa ? '#a3e4d7' : '#f1948a'}`,
                  }}
                >
                  {empresa.activa ? '✅ Activa' : '❌ Inactiva'}
                </span>
                {empresa.sire_activo && (
                  <span 
                    style={{
                      fontSize: 'clamp(10px, 2vw, 12px)',
                      padding: '2px clamp(6px, 1.5vw, 10px)',
                      borderRadius: 'clamp(10px, 2vw, 14px)',
                      backgroundColor: '#d6f2ff',
                      color: '#0066cc',
                      fontWeight: '600',
                      border: '1px solid #a6d8ff',
                    }}
                  >
                    🔐 SIRE
                  </span>
                )}
                {isSelected && (
                  <span 
                    className="current-badge"
                    style={{
                      fontSize: 'clamp(10px, 2vw, 12px)',
                      padding: '2px clamp(6px, 1.5vw, 10px)',
                      borderRadius: 'clamp(10px, 2vw, 14px)',
                      backgroundColor: '#007bff',
                      color: 'white',
                      fontWeight: '600',
                      boxShadow: '0 2px 4px rgba(0,123,255,0.3)',
                    }}
                  >
                    ✨ EMPRESA ACTUAL
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información principal */}
        <div style={{ 
          marginBottom: 'clamp(12px, 3vw, 16px)',
          flex: '1',
        }}>
          <h4 style={{ 
            margin: '0 0 clamp(8px, 2vw, 12px) 0', 
            fontSize: 'clamp(14px, 3vw, 18px)', 
            color: '#2c3e50',
            fontWeight: '600',
            lineHeight: '1.3',
          }}>
            {empresa.razon_social}
          </h4>
          
          {/* Información de contacto */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 'clamp(6px, 1.5vw, 8px)', 
            fontSize: 'clamp(12px, 2.5vw, 14px)', 
            color: '#5a6c7d',
          }}>
            {empresa.direccion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📍</span>
                <span style={{ wordBreak: 'break-word' }}>{empresa.direccion}</span>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 'clamp(12px, 3vw, 16px)',
            }}>
              {empresa.telefono && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  📞 {empresa.telefono}
                </span>
              )}
              {empresa.email && (
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  wordBreak: 'break-word',
                }}>
                  📧 {empresa.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Información SIRE */}
        {empresa.sire_activo && (
          <div style={{
            marginBottom: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(10px, 2.5vw, 14px)',
            backgroundColor: '#f8f9ff',
            borderRadius: 'clamp(4px, 1vw, 6px)',
            border: '1px solid #e3e6ff'
          }}>
            <div style={{ 
              fontSize: 'clamp(12px, 2.5vw, 14px)', 
              fontWeight: '600', 
              color: '#333',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              🔐 Configuración SIRE
            </div>
            <div style={{ 
              fontSize: 'clamp(10px, 2vw, 12px)', 
              color: '#666',
              lineHeight: '1.4',
            }}>
              <div>Client ID: {empresa.sire_client_id}</div>
              <div>Usuario: {empresa.sunat_usuario}</div>
              <div style={{ 
                marginTop: '4px', 
                color: '#28a745', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                ✅ SIRE Configurado y Activo
              </div>
            </div>
          </div>
        )}

        {/* Notas internas */}
        {empresa.notas_internas && (
          <div style={{
            marginBottom: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(8px, 2vw, 12px)',
            backgroundColor: '#fff8e1',
            borderRadius: 'clamp(4px, 1vw, 6px)',
            border: '1px solid #ffecb3',
            fontSize: 'clamp(10px, 2vw, 12px)',
            color: '#f57f17',
            lineHeight: '1.4',
          }}>
            <strong>📝 Notas:</strong> {empresa.notas_internas}
          </div>
        )}

        {/* Botones de acción */}
        <div style={actionButtonsStyles}>
          {/* Botón principal para ingresar al Dashboard - Diseño circular profesional */}
          <button
            onClick={async (e) => {
              e.stopPropagation();
              
              if (isSelected) {
                // Si ya está seleccionada, ir directamente al dashboard
                navigate('/dashboard');
              } else {
                // Si no está seleccionada, usar la función onSelect que maneja la selección y navegación
                if (onSelect) {
                  onSelect(empresa);
                }
              }
            }}
            className={isSelected ? 'entrance-button' : 'select-button'}
            style={{
              // Diseño circular sin rectángulo
              width: 'clamp(50px, 12vw, 64px)',
              height: 'clamp(50px, 12vw, 64px)',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              color: isSelected ? '#10b981' : '#3b82f6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: 'clamp(20px, 5vw, 28px)',
              // Sombra sutil
              filter: `drop-shadow(0 4px 12px ${isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)'})`,
              // Fondo con gradiente suave
              background: isSelected 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
              backdropFilter: 'blur(10px)',
              // Borde sutil
              boxShadow: isSelected 
                ? 'inset 0 0 0 2px rgba(16, 185, 129, 0.2), 0 4px 12px rgba(16, 185, 129, 0.15)'
                : 'inset 0 0 0 2px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(59, 130, 246, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
              e.currentTarget.style.filter = `drop-shadow(0 8px 20px ${isSelected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)'})`;
              e.currentTarget.style.boxShadow = isSelected 
                ? 'inset 0 0 0 2px rgba(16, 185, 129, 0.4), 0 8px 20px rgba(16, 185, 129, 0.25)'
                : 'inset 0 0 0 2px rgba(59, 130, 246, 0.4), 0 8px 20px rgba(59, 130, 246, 0.25)';
              
              // Animar el icono
              const icon = e.currentTarget.querySelector('.door-icon');
              if (icon) {
                (icon as HTMLElement).style.transform = 'scale(1.1) rotate(10deg)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.filter = `drop-shadow(0 4px 12px ${isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)'})`;
              e.currentTarget.style.boxShadow = isSelected 
                ? 'inset 0 0 0 2px rgba(16, 185, 129, 0.2), 0 4px 12px rgba(16, 185, 129, 0.15)'
                : 'inset 0 0 0 2px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(59, 130, 246, 0.15)';
              
              // Restaurar el icono
              const icon = e.currentTarget.querySelector('.door-icon');
              if (icon) {
                (icon as HTMLElement).style.transform = 'scale(1) rotate(0deg)';
              }
            }}
            title={isSelected ? "Ingresar al Dashboard" : "Seleccionar empresa e ingresar al Dashboard"}
          >
            <span 
              className="door-icon"
              style={{ 
                fontSize: 'inherit',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                textShadow: `0 0 10px ${isSelected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
              }}
            >
              {isSelected ? '🚀' : '🚪'}
            </span>
          </button>
          
          {onEdit && (
            <button
              onClick={handleEdit}
              style={{
                width: 'clamp(40px, 10vw, 48px)',
                height: 'clamp(40px, 10vw, 48px)',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#6c757d',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(16px, 4vw, 20px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'linear-gradient(135deg, rgba(108, 117, 125, 0.1) 0%, rgba(108, 117, 125, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: 'inset 0 0 0 1px rgba(108, 117, 125, 0.2), 0 2px 8px rgba(108, 117, 125, 0.1)',
                filter: 'drop-shadow(0 2px 6px rgba(108, 117, 125, 0.15))',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) translateY(-1px)';
                e.currentTarget.style.filter = 'drop-shadow(0 4px 12px rgba(108, 117, 125, 0.25))';
                e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(108, 117, 125, 0.3), 0 4px 12px rgba(108, 117, 125, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.filter = 'drop-shadow(0 2px 6px rgba(108, 117, 125, 0.15))';
                e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(108, 117, 125, 0.2), 0 2px 8px rgba(108, 117, 125, 0.1)';
              }}
              title="Editar empresa"
            >
              ✏️
            </button>
          )}
          {onConfigSire && (
            <button
              onClick={handleConfigSire}
              style={{
                width: 'clamp(40px, 10vw, 48px)',
                height: 'clamp(40px, 10vw, 48px)',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: empresa.sire_activo ? '#28a745' : '#007bff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(16px, 4vw, 20px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: empresa.sire_activo 
                  ? 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(0, 123, 255, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: empresa.sire_activo 
                  ? 'inset 0 0 0 1px rgba(40, 167, 69, 0.2), 0 2px 8px rgba(40, 167, 69, 0.1)'
                  : 'inset 0 0 0 1px rgba(0, 123, 255, 0.2), 0 2px 8px rgba(0, 123, 255, 0.1)',
                filter: empresa.sire_activo 
                  ? 'drop-shadow(0 2px 6px rgba(40, 167, 69, 0.15))'
                  : 'drop-shadow(0 2px 6px rgba(0, 123, 255, 0.15))',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) translateY(-1px)';
                e.currentTarget.style.filter = empresa.sire_activo 
                  ? 'drop-shadow(0 4px 12px rgba(40, 167, 69, 0.25))'
                  : 'drop-shadow(0 4px 12px rgba(0, 123, 255, 0.25))';
                e.currentTarget.style.boxShadow = empresa.sire_activo 
                  ? 'inset 0 0 0 1px rgba(40, 167, 69, 0.3), 0 4px 12px rgba(40, 167, 69, 0.15)'
                  : 'inset 0 0 0 1px rgba(0, 123, 255, 0.3), 0 4px 12px rgba(0, 123, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.filter = empresa.sire_activo 
                  ? 'drop-shadow(0 2px 6px rgba(40, 167, 69, 0.15))'
                  : 'drop-shadow(0 2px 6px rgba(0, 123, 255, 0.15))';
                e.currentTarget.style.boxShadow = empresa.sire_activo 
                  ? 'inset 0 0 0 1px rgba(40, 167, 69, 0.2), 0 2px 8px rgba(40, 167, 69, 0.1)'
                  : 'inset 0 0 0 1px rgba(0, 123, 255, 0.2), 0 2px 8px rgba(0, 123, 255, 0.1)';
              }}
              title={empresa.sire_activo ? "Modificar configuración SIRE" : "Configurar SIRE"}
            >
              🔐
            </button>
          )}
          {onDelete && empresa.activa && (
            <button
              onClick={handleDelete}
              style={{
                width: 'clamp(40px, 10vw, 48px)',
                height: 'clamp(40px, 10vw, 48px)',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#dc3545',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(16px, 4vw, 20px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: 'inset 0 0 0 1px rgba(220, 53, 69, 0.2), 0 2px 8px rgba(220, 53, 69, 0.1)',
                filter: 'drop-shadow(0 2px 6px rgba(220, 53, 69, 0.15))',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) translateY(-1px)';
                e.currentTarget.style.filter = 'drop-shadow(0 4px 12px rgba(220, 53, 69, 0.25))';
                e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(220, 53, 69, 0.3), 0 4px 12px rgba(220, 53, 69, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.filter = 'drop-shadow(0 2px 6px rgba(220, 53, 69, 0.15))';
                e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(220, 53, 69, 0.2), 0 2px 8px rgba(220, 53, 69, 0.1)';
              }}
              title="Eliminar empresa"
            >
              🗑️
            </button>
          )}
        </div>

        {/* Footer con fechas */}
        <div style={{
          marginTop: 'clamp(12px, 3vw, 16px)',
          paddingTop: 'clamp(8px, 2vw, 12px)',
          borderTop: '1px solid #e9ecef',
          fontSize: 'clamp(9px, 1.8vw, 11px)',
          color: '#adb5bd',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
        }}>
          <span>
            Creada: {empresa.fecha_registro ? 
              new Date(empresa.fecha_registro).toLocaleDateString() : 
              'N/A'
            }
          </span>
          <span style={{ textAlign: 'right' }}>
            Actualizada: {empresa.fecha_actualizacion ? 
              new Date(empresa.fecha_actualizacion).toLocaleDateString() : 
              'N/A'
            }
          </span>
        </div>
      </div>

      {/* Media Queries con CSS-in-JS */}
      <style>
        {`
          @media (max-width: 768px) {
            .empresa-card {
              margin: 8px 0 !important;
              padding: 12px !important;
            }
          }
          
          @media (max-width: 480px) {
            .empresa-card {
              margin: 6px 0 !important;
              padding: 10px !important;
            }
          }

          /* Efecto de brillo para el botón de entrada */
          @keyframes shine {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          /* Efecto de pulso suave para el botón principal */
          @keyframes pulse-glow {
            0%, 100% { 
              box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(59, 130, 246, 0.15);
            }
            50% { 
              box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.3), 0 6px 16px rgba(59, 130, 246, 0.2);
            }
          }

          @keyframes pulse-glow-green {
            0%, 100% { 
              box-shadow: inset 0 0 0 2px rgba(16, 185, 129, 0.2), 0 4px 12px rgba(16, 185, 129, 0.15);
            }
            50% { 
              box-shadow: inset 0 0 0 2px rgba(16, 185, 129, 0.3), 0 6px 16px rgba(16, 185, 129, 0.2);
            }
          }

          /* Pulso para el badge de empresa actual */
          @keyframes pulse-badge {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 2px 4px rgba(0,123,255,0.3);
            }
            50% { 
              transform: scale(1.05);
              box-shadow: 0 4px 8px rgba(0,123,255,0.5);
            }
          }

          .entrance-button {
            animation: pulse-glow-green 3s infinite;
          }

          .select-button {
            animation: pulse-glow 3s infinite;
          }

          .current-badge {
            animation: pulse-badge 2s infinite;
          }
        `}
      </style>
    </>
  );
};

export default EmpresaCard;
        
       
