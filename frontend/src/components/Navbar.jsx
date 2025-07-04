import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { FaTooth, FaBell, FaQuestionCircle, FaUserCircle, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import BaseModal from '../components/modals/ModalSystem'; // ✅ IMPORTAR EL MODAL BASE PARA CONTROL DE POSICIÓN
import '../css/PanelPrincipal.css';

const Navbar = () => {
  const [horaActual, setHoraActual] = useState('');
  const [fechaActual, setFechaActual] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ✅ ESTADO PARA MODAL
  const navigate = useNavigate();

  useEffect(() => {
    const actualizarHora = () => {
      const cdmxNow = DateTime.now().setZone('America/Mexico_City');

      const hora = cdmxNow.toFormat('HH:mm'); // formato 24h
      const fecha = cdmxNow.setLocale('es').toFormat("cccc, dd 'de' LLLL 'de' yyyy");

      setHoraActual(hora);
      setFechaActual(capitalizeWords(fecha));
    };

    actualizarHora();
    const intervalo = setInterval(actualizarHora, 1000);

    return () => clearInterval(intervalo);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const capitalizeWords = (str) =>
    str.replace(/\b\w/g, (c) => c.toUpperCase());

  // NUEVA FUNCIÓN: Abrir Manual de Usuario
  const handleAbrirManualUsuario = () => {
    // Navegar usando React Router en lugar de window.open
    navigate('/ManualUsuario');
  };

  // Toggle menú de usuario
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Funciones del menú de usuario
  const handleProfile = () => {
    console.log('Abrir perfil de usuario');
    setShowUserMenu(false);
    // Navegar al perfil usando React Router
    navigate('/perfil');
  };

  const handleSettings = () => {
    console.log('Abrir configuración');
    setShowUserMenu(false);
    // Navegar a configuración usando React Router
    navigate('/configuracion');
  };

  // ✅ FUNCIÓN SIMPLIFICADA PARA ABRIR MODAL
  const handleLogoutClick = () => {
    setShowUserMenu(false); // Cerrar menú desplegable
    setShowLogoutModal(true); // Abrir modal moderno
  };

  // ✅ FUNCIÓN PARA CONFIRMAR LOGOUT
  const confirmarLogout = () => {
    try {
      console.log('🔓 Iniciando proceso de logout...');
      
      // 1. Limpiar TODOS los datos de autenticación
      const keysToRemove = [
        'token', 
        'userData', 
        'user', 
        'authToken', 
        'accessToken',
        'refreshToken',
        'userSession',
        'loginData'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // 2. Limpiar completamente el storage (opcional pero más seguro)
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('⚠️ No se pudo limpiar completamente el storage:', storageError);
      }
      
      console.log('✅ Datos de sesión limpiados exitosamente');
      
      // 3. Forzar redirección inmediata al login/home
      console.log('🔄 Redirigiendo al login...');
      
      // Determinar la URL de login
      const loginUrl = window.location.origin + '/'; // Ruta raíz
      
      // Usar replace para evitar que el usuario pueda volver atrás
      window.location.replace(loginUrl);
      
    } catch (error) {
      console.error('❌ Error durante el logout:', error);
      
      // Fallback de emergencia: limpiar todo y recargar
      try {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
        // Último recurso: solo recargar la página
        window.location.reload();
      }
    }
  };

  return (
    <>
      <div className="navbar">
        <div className="navbar-left">
          <div className="navbar-brand">
            <span className="brand-icon">🦷</span>
            <div className="brand-info">
              <div className="brand-name">Odont-SISTEMA</div>
              <div className="brand-subtitle">Sistema Odontológico</div>
            </div>
          </div>
          
          <div className="navbar-divider"></div>
          
          <div className="navbar-page">
            <span className="page-icon">📊</span>
            <span className="page-title">Panel de Control</span>
          </div>
        </div>

        <div className="navbar-center">
          <div className="datetime-info">
            <div className="time-display">
              <span className="time-icon">🕐</span>
              <span className="time-text">{horaActual}</span>
            </div>
            <div className="date-display">{fechaActual}</div>
          </div>
        </div>

        <div className="navbar-right">
          <div className="navbar-actions">
            <button className="action-btn notifications-btn" title="Notificaciones">
              <span>🔔</span>
              <div className="notification-badge">3</div>
            </button>
            {/* BOTÓN DE AYUDA CON FUNCIONALIDAD */}
            <button 
              className="action-btn help-btn" 
              onClick={handleAbrirManualUsuario}
              title="Manual de Usuario - Ayuda"
            >
              <span>❓</span>
            </button>
          </div>

          {/* MENÚ DE USUARIO CON DROPDOWN FUNCIONAL */}
          <div className="user-menu-container">
            <div 
              className={`user-menu-trigger ${showUserMenu ? 'active' : ''}`}
              onClick={toggleUserMenu}
            >
              <div className="user-avatar">B</div>
              <div className="user-info">
                <span className="user-name">Brandon</span>
                <span className="user-role">ADMINISTRADOR</span>
              </div>
              <FaChevronDown className={`dropdown-arrow ${showUserMenu ? 'rotated' : ''}`} />
            </div>

            {/* DROPDOWN MENU */}
            {showUserMenu && (
              <div className="user-dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar">B</div>
                    <div className="dropdown-details">
                      <span className="dropdown-name">Brandon</span>
                      <span className="dropdown-email">brandon@odontologia.com</span>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <div className="dropdown-items">
                  <button className="dropdown-item" onClick={handleProfile}>
                    <FaUserCircle className="dropdown-icon" />
                    <span>Mi Perfil</span>
                  </button>
                  
                  <button className="dropdown-item" onClick={handleSettings}>
                    <FaCog className="dropdown-icon" />
                    <span>Configuración</span>
                  </button>
                  
                  <div className="dropdown-divider"></div>
                  
                  {/* ✅ BOTÓN ACTUALIZADO PARA USAR MODAL */}
                  <button className="dropdown-item logout-item" onClick={handleLogoutClick}>
                    <FaSignOutAlt className="dropdown-icon" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ MODAL MODERNO DE CONFIRMACIÓN DE LOGOUT - POSICIÓN TOP-LEFT */}
      <BaseModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="¿Estás seguro que deseas cerrar sesión?"
        icon="🚪"
        position="top-left"
        size="medium"
      >
        <div className="modern-confirm-content" style={{ padding: '0' }}>
          <p className="modern-confirm-message" style={{ 
            margin: '0 0 24px 0',
            fontSize: '1rem',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            Se cerrará tu sesión actual y tendrás que volver a iniciar sesión para acceder al sistema.
          </p>
          
          <div className="modern-confirm-actions" style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <button 
              className="modern-btn-confirm modern-btn-warning"
              onClick={confirmarLogout}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.95rem',
                minWidth: '120px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
            >
              🚪 Sí, cerrar sesión
            </button>
            <button 
              className="modern-btn-cancel"
              onClick={() => setShowLogoutModal(false)}
              style={{
                background: 'white',
                color: '#6b7280',
                border: '2px solid #e5e7eb',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.95rem',
                minWidth: '100px'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </BaseModal>
    </>
  );
};

export default Navbar;