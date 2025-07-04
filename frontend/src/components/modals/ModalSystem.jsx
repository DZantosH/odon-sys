// components/modals/ModalSystem.jsx
import React, { useState, useEffect } from 'react';
import '../../css/ModalSystem.css';

// 🎨 COMPONENTE BASE PARA TODOS LOS MODALES
const BaseModal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  children, 
  size = 'medium',
  position = 'center',
  showCloseButton = true,
  backdrop = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  if (!isVisible) return null;

  const modalClasses = [
    'custom-modal',
    `modal-${size}`,
    `modal-${position}`,
    isOpen ? 'modal-open' : 'modal-closing',
    className
  ].join(' ');

  return (
    <>
      {backdrop && (
        <div 
          className={`modal-backdrop ${isOpen ? 'backdrop-open' : 'backdrop-closing'}`}
          onClick={handleOverlayClick}
        />
      )}
      <div className={modalClasses}>
        {(title || showCloseButton) && (
          <div className="modal-header">
            {icon && <div className="modal-icon">{icon}</div>}
            {title && <h3 className="modal-title">{title}</h3>}
            {showCloseButton && (
              <button className="modal-close-btn" onClick={onClose}>
                ✕
              </button>
            )}
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </>
  );
};

// 🔔 MODAL DE CONFIRMACIÓN ELEGANTE
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción",
  message = "¿Estás seguro de que deseas continuar?",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  type = "question",
  icon,
  showIcon = true,
  position = "center"
}) => {
  const typeIcons = {
    question: "❓",
    warning: "⚠️",
    danger: "🚨",
    info: "ℹ️",
    success: "✅"
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const positionClass = position === "top-left" ? "modal-top-left" : 
                       position === "top-right" ? "modal-top-right" : 
                       "modal-center";

  return (
    <>
      <div 
        className="modal-backdrop backdrop-open modern-backdrop"
        onClick={handleOverlayClick}
      />
      <div className={`modern-confirm-modal modal-open ${positionClass}`}>
        <div className="modern-confirm-content">
          {showIcon && (
            <div className="modern-confirm-icon">
              {icon || typeIcons[type]}
            </div>
          )}
          <h3 className="modern-confirm-title">{title}</h3>
          <p className="modern-confirm-message">{message}</p>
          <div className="modern-confirm-actions">
            <button 
              className={`modern-btn-confirm modern-btn-${type}`}
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
            <button 
              className="modern-btn-cancel"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// 🔄 MODAL DE ESTADO ACTUALIZADO - SUPERIOR DERECHA
export const EstadoActualizadoModal = ({ 
  isOpen, 
  onClose, 
  nuevoEstado = "Completada",
  autoClose = true,
  autoCloseDelay = 4000 
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('estado-backdrop')) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  // Función para obtener el icono según el estado
  const getEstadoIcono = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completada': return '✅';
      case 'confirmada': return '✅';
      case 'en_proceso': return '🔄';
      case 'programada': return '📅';
      case 'cancelada': return '❌';
      case 'no_asistio': return '🚫';
      default: return '✅';
    }
  };

  return (
    <>
      <div 
        className="estado-backdrop"
        onClick={handleOverlayClick}
      />
      <div className={`estado-actualizado-modal ${isClosing ? 'modal-closing' : 'modal-open'}`}>
        <div className="estado-actualizado-content">
          <div className="estado-header">
            <div className="estado-icon">{getEstadoIcono(nuevoEstado)}</div>
            <div className="estado-text">
              <div className="estado-title">Estado actualizado exitosamente</div>
              <div className="estado-message">
                El estado de la cita ha sido actualizado a <strong>{nuevoEstado}</strong>
              </div>
            </div>
            <button className="estado-close" onClick={handleClose}>
              ✕
            </button>
          </div>
          
          {autoClose && (
            <div className="estado-progress-container">
              <div 
                className="estado-progress-bar"
                style={{
                  animation: `progressBar ${autoCloseDelay}ms linear`
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// 📸 MODAL DE FOTO ACTUALIZADA
export const FotoActualizadaModal = ({ 
  isOpen, 
  onClose,
  titulo = "Foto actualizada correctamente",
  mensaje = "La imagen se ha subido exitosamente al sistema.",
  confirmText = "Aceptar",
  tipo = "success"
}) => {
  const tipoIconos = {
    success: "✅",
    info: "ℹ️", 
    warning: "⚠️"
  };

  const handleConfirm = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="modal-backdrop backdrop-open modern-backdrop"
        onClick={handleOverlayClick}
      />
      <div className="modern-confirm-modal modal-open modal-top-right">
        <div className="modern-confirm-content">
          <div className="modern-confirm-icon">
            {tipoIconos[tipo]}
          </div>
          <h3 className="modern-confirm-title">{titulo}</h3>
          <p className="modern-confirm-message">{mensaje}</p>
          <div className="modern-confirm-actions">
            <button 
              className={`modern-btn-confirm modern-btn-${tipo}`}
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// 📋 MODAL DE INFORMACIÓN
export const InfoModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  details = [],
  icon = "ℹ️",
  buttonText = "Entendido"
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      size="medium"
      position="center"
    >
      <div className="info-modal-content">
        <p className="info-message">{message}</p>
        {details.length > 0 && (
          <div className="info-details">
            <ul>
              {details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="info-actions">
          <button className="btn-info" onClick={onClose}>
            {buttonText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

// 🚨 MODAL DE ERROR
export const ErrorModal = ({ 
  isOpen, 
  onClose, 
  title = "Error",
  error, 
  details,
  onRetry
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon="❌"
      size="medium"
      position="center"
    >
      <div className="error-modal-content">
        <p className="error-message">{error}</p>
        {details && (
          <div className="error-details">
            <p><strong>Detalles técnicos:</strong></p>
            <pre>{details}</pre>
          </div>
        )}
        <div className="error-actions">
          {onRetry && (
            <button className="btn-retry" onClick={onRetry}>
              🔄 Reintentar
            </button>
          )}
          <button className="btn-close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

// 📝 MODAL DE FORMULARIO
export const FormModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSubmit,
  submitText = "Guardar",
  cancelText = "Cancelar",
  icon = "📝",
  size = "large"
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      size={size}
      position="center"
    >
      <form onSubmit={handleSubmit} className="form-modal-content">
        <div className="form-modal-body">
          {children}
        </div>
        <div className="form-modal-actions">
          <button type="submit" className="btn-submit">
            {submitText}
          </button>
          <button type="button" className="btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

// 🗑️ MODAL COMPACTO PARA CANCELAR CITAS - SUPERIOR IZQUIERDA
export const CancelCitaModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  citaData = {}
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="modal-backdrop backdrop-open modern-backdrop"
        onClick={handleOverlayClick}
      />
      <div className="compact-cancel-modal modal-open modal-top-left">
        <div className="compact-cancel-content">
          {/* Header compacto */}
          <div className="compact-header">
            <div className="compact-icon">🗑️</div>
            <div className="compact-title">Cancelar Cita</div>
            <button className="compact-close" onClick={onClose}>✕</button>
          </div>

          {/* Mensaje de advertencia compacto */}
          <div className="compact-warning">
            <div className="warning-text">
              <strong>⚠️ ¿Estás seguro?</strong>
              <span>Esta acción no se puede deshacer</span>
            </div>
          </div>

          {/* Información básica de la cita */}
          <div className="compact-info">
            <div className="info-row">
              <span className="info-icon">👤</span>
              <span className="info-text">{citaData.pacienteNombre || 'Paciente'}</span>
            </div>
            <div className="info-row">
              <span className="info-icon">📅</span>
              <span className="info-text">
                {citaData.fechaCita ? new Date(citaData.fechaCita).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : 'Sin fecha'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-icon">🕐</span>
              <span className="info-text">{citaData.horaCita || 'Sin hora'}</span>
            </div>
          </div>

          {/* Botones compactos */}
          <div className="compact-actions">
            <button 
              className="btn-compact-cancel"
              onClick={handleConfirm}
            >
              🗑️ Cancelar
            </button>
            <button 
              className="btn-compact-keep"
              onClick={onClose}
            >
              ✋ Mantener
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// 🎯 MODAL MODERNO DE CONSULTA - SUPERIOR IZQUIERDA
export const ConsultaModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Consulta iniciada para Carlos Rios",
  message = "¿Deseas ir al historial clínico para continuar con la consulta?",
  confirmText = "Aceptar",
  cancelText = "Cancelar"
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="modal-backdrop backdrop-open modern-backdrop"
        onClick={handleOverlayClick}
      />
      <div className="consulta-modal modal-open modal-top-left">
        <div className="consulta-modal-content">
          <div className="consulta-modal-header">
            <div className="consulta-modal-icon">
              🦷
            </div>
            <div className="consulta-modal-text">
              <h3 className="consulta-modal-title">{title}</h3>
              <p className="consulta-modal-message">{message}</p>
            </div>
            <button className="consulta-modal-close" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="consulta-modal-actions">
            <button 
              className="consulta-btn-confirm"
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
            <button 
              className="consulta-btn-cancel"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// 🎉 MODAL DE NOTIFICACIÓN DE ÉXITO - SUPERIOR DERECHA
export const SuccessNotificationModal = ({ 
  isOpen, 
  onClose, 
  title = "¡Operación exitosa!",
  message = "La acción se ha completado correctamente",
  autoClose = true,
  autoCloseDelay = 3000,
  showCloseButton = true,
  icon = "✅"
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('success-backdrop')) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="success-backdrop"
        onClick={handleOverlayClick}
      />
      <div className={`success-notification-modal ${isClosing ? 'modal-closing' : 'modal-open'}`}>
        <div className="success-notification-content">
          <div className="success-header">
            <div className="success-icon">{icon}</div>
            <div className="success-text">
              <div className="success-title">{title}</div>
              <div className="success-message">{message}</div>
            </div>
            {showCloseButton && (
              <button className="success-close" onClick={handleClose}>
                ✕
              </button>
            )}
          </div>
          
          {autoClose && (
            <div className="success-progress-container">
              <div 
                className="success-progress-bar"
                style={{
                  animation: `progressBar ${autoCloseDelay}ms linear`
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// 🗑️ MODAL ESPECIALIZADO PARA CONFIRMACIÓN DE CITA CANCELADA
export const CitaCanceladaSuccessModal = ({ 
  isOpen, 
  onClose, 
  citaData = {},
  autoClose = true,
  autoCloseDelay = 4000 
}) => {
  const message = citaData.pacienteNombre 
    ? `La cita de ${citaData.pacienteNombre} ha sido cancelada`
    : "La cita ha sido cancelada exitosamente";

  return (
    <SuccessNotificationModal
      isOpen={isOpen}
      onClose={onClose}
      title="🗑️ Cita cancelada exitosamente"
      message={message}
      autoClose={autoClose}
      autoCloseDelay={autoCloseDelay}
      icon="🗑️"
    />
  );
};

// 📅 MODAL SIMPLE DE CONFIRMACIÓN DE CITA AGENDADA - SUPERIOR DERECHA
export const CitaAgendadaSuccessModal = ({ 
  isOpen, 
  onClose, 
  autoClose = true,
  autoCloseDelay = 3000 
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('success-backdrop')) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop sutil */}
      <div 
        className="success-backdrop"
        onClick={handleOverlayClick}
      />
      
      {/* Modal simplificado */}
      <div className={`simple-success-modal ${isClosing ? 'modal-closing' : 'modal-open'}`}>
        <div className="simple-success-content">
          {/* Icono y mensaje */}
          <div className="simple-success-header">
            <div className="simple-success-icon">✅</div>
            <div className="simple-success-text">
              <div className="simple-success-title">¡Cita creada exitosamente!</div>
            </div>
            <button className="simple-success-close" onClick={handleClose}>
              ✕
            </button>
          </div>
          
          {/* Barra de progreso si es auto-close */}
          {autoClose && (
            <div className="simple-success-progress-container">
              <div 
                className="simple-success-progress-bar"
                style={{
                  animation: `progressBar ${autoCloseDelay}ms linear`
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// 🎣 HOOK PERSONALIZADO PARA MANEJAR MODALES
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState({});

  const openModal = (data = {}) => {
    setModalData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalData({});
  };

  return {
    isOpen,
    modalData,
    openModal,
    closeModal
  };
};

// 🎯 HOOK PARA MANEJAR NOTIFICACIONES DE ÉXITO
export const useSuccessNotification = () => {
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    icon: '✅'
  });

  const showSuccess = (title, message, icon = '✅') => {
    setNotification({
      isOpen: true,
      title,
      message,
      icon
    });
  };

  const hideSuccess = () => {
    setNotification(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  return {
    notification,
    showSuccess,
    hideSuccess
  };
};

// 🚀 FUNCIONES HELPER PARA USO RÁPIDO
export const showConfirm = (options) => {
  return new Promise((resolve) => {
    resolve(window.confirm(options.message));
  });
};

export const showAlert = (message, type = 'info') => {
  console.log(`${type.toUpperCase()}: ${message}`);
};

export default BaseModal;