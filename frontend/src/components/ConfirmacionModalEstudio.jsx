import React, { useState, useEffect } from 'react';

// Hook personalizado para manejar confirmaciones de estudios
export const useConfirmacionEstudio = () => {
  const [confirmacion, setConfirmacion] = useState({
    isOpen: false,
    config: {}
  });

  const mostrarConfirmacion = (config) => {
    return new Promise((resolve) => {
      setConfirmacion({
        isOpen: true,
        config: {
          ...config,
          onConfirm: () => {
            setConfirmacion({ isOpen: false, config: {} });
            resolve(true);
          },
          onCancel: () => {
            setConfirmacion({ isOpen: false, config: {} });
            resolve(false);
          }
        }
      });
    });
  };

  const ocultarConfirmacion = () => {
    setConfirmacion({ isOpen: false, config: {} });
  };

  return {
    confirmacion,
    mostrarConfirmacion,
    ocultarConfirmacion
  };
};

// Componente Modal de Confirmación para Estudios
const ConfirmacionModalEstudio = ({ isOpen, config }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        config.onCancel?.();
      }
      if (e.key === 'Enter' && isOpen) {
        config.onConfirm?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, config]);

  if (!isVisible) return null;

  const {
    type = 'success',
    title = '¡Operación Exitosa!',
    message = 'La operación se ha completado correctamente.',
    details = {},
    confirmText = 'Aceptar',
    cancelText = 'Ver Detalles',
    showCancel = true,
    icon = null,
    onConfirm = () => {},
    onCancel = () => {}
  } = config;

  // Iconos según el tipo
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" className="modal-icon">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 24 24" className="modal-icon">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" className="modal-icon">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        );
      case 'info':
        return (
          <svg viewBox="0 0 24 24" className="modal-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  // Colores según el tipo
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'confirmation-success';
      case 'warning':
        return 'confirmation-warning';
      case 'error':
        return 'confirmation-error';
      case 'info':
        return 'confirmation-info';
      default:
        return 'confirmation-success';
    }
  };

  return (
    <div className={`confirmation-overlay ${isOpen ? 'active' : ''}`}>
      <div className={`confirmation-modal ${getTypeStyles()}`}>
        {/* Botón de cerrar */}
        <button 
          className="confirmation-close" 
          onClick={onCancel}
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {/* Header con icono y título */}
        <div className="confirmation-header">
          <div className="confirmation-icon-container">
            {getIcon()}
          </div>
          <h2 className="confirmation-title">{title}</h2>
          <p className="confirmation-subtitle">
            {type === 'success' && 'La solicitud se ha procesado exitosamente'}
            {type === 'warning' && 'Requiere tu atención'}
            {type === 'error' && 'Ha ocurrido un problema'}
            {type === 'info' && 'Información importante'}
          </p>
        </div>

        {/* Cuerpo del modal */}
        <div className="confirmation-body">
          <p className="confirmation-message">{message}</p>
          
          {/* Detalles del estudio u operación */}
          {Object.keys(details).length > 0 && (
            <div className="confirmation-details">
              {details.tipo_estudio && (
                <div className="detail-row">
                  <span className="detail-label">Tipo de Estudio:</span>
                  <span className="detail-value">{details.tipo_estudio}</span>
                </div>
              )}
              {details.laboratorio && (
                <div className="detail-row">
                  <span className="detail-label">Laboratorio:</span>
                  <span className="detail-value">{details.laboratorio}</span>
                </div>
              )}
              {details.urgencia && (
                <div className="detail-row">
                  <span className="detail-label">Urgencia:</span>
                  <span className={`detail-value urgencia-${details.urgencia}`}>
                    {details.urgencia === 'alta' ? '🔴 Alta' : 
                     details.urgencia === 'media' ? '🟡 Media' : '🟢 Normal'}
                  </span>
                </div>
              )}
              {details.fecha && (
                <div className="detail-row">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{details.fecha}</span>
                </div>
              )}
              {details.estado && (
                <div className="detail-row">
                  <span className="detail-label">Estado:</span>
                  <span className="detail-value highlight">{details.estado}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Mensaje adicional */}
          {type === 'success' && (
            <p className="confirmation-extra">
              Se ha enviado la solicitud al laboratorio. El paciente recibirá las instrucciones por email.
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="confirmation-actions">
          {showCancel && (
            <button 
              className="confirmation-btn confirmation-btn-secondary" 
              onClick={onCancel}
            >
              <span>{cancelText}</span>
            </button>
          )}
          <button 
            className="confirmation-btn confirmation-btn-primary" 
            onClick={onConfirm}
            autoFocus
          >
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionModalEstudio;