// admin-panel/src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Users,
  DollarSign,
  Package,
  FileText,
  Settings,
  LogOut,
  Shield,
  Bell
} from 'lucide-react';
import '../css/Layout.css'; // ← Importamos el CSS

const Layout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Detectar tamaño de pantalla para responsive
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      
      if (width < 1024) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard' || location.pathname === '/',
      description: 'Vista general del sistema'
    },
    {
      name: 'Usuarios',
      href: '/users',
      icon: Users,
      current: location.pathname === '/users',
      description: 'Gestión de usuarios'
    },
    {
      name: 'Finanzas',
      href: '/finanzas',
      icon: DollarSign,
      current: location.pathname === '/finanzas',
      disabled: false,
      description: 'Gestión financiera'
    },
    {
      name: 'Inventario',
      href: '/inventario',
      icon: Package,
      current: location.pathname === '/inventario',
      description: 'Control de stock'
    },
    {
      name: 'Reportes',
      href: '/reports',
      icon: FileText,
      current: location.pathname === '/reports',
      disabled: true,
      description: 'Próximamente'
    },
    {
      name: 'Configuración',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
      disabled: true,
      description: 'Próximamente'
    }
  ];

  const handleLogout = () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      onLogout();
    }
  };

  const getCurrentPageTitle = () => {
    const currentItem = navigation.find(item => item.current);
    return currentItem ? currentItem.name : 'Panel Administrativo';
  };

  return (
    <div className="layout-container">
      {/* Overlay para mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <SidebarContent 
          navigation={navigation} 
          user={user} 
          onLogout={handleLogout}
          isMobile={isMobile}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      </div>

      {/* Contenido principal */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            {/* Lado izquierdo */}
            <div className="header-left">
              {/* Botón menú hamburguesa */}
              <button
                type="button"
                className="menu-button"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>

              {/* Título de página */}
              <div className="page-title">
                <h1>{getCurrentPageTitle()}</h1>
                <p className="page-date">
                  {new Date().toLocaleDateString('es-MX', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Lado derecho */}
            <div className="header-right">
              {/* Notificaciones */}
              <button className="notification-button">
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </button>

              {/* Info del usuario */}
              <div className="user-info">
                <div className="user-details">
                  <p className="user-name">{user?.nombre}</p>
                  <p className="user-role">
                    <Shield size={12} />
                    {user?.rol}
                  </p>
                </div>
                <div className="user-avatar">
                  {user?.nombre?.charAt(0)?.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, user, onLogout, isMobile, onCloseSidebar }) => {
  const handleNavClick = () => {
    if (isMobile) {
      onCloseSidebar();
    }
  };

  return (
    <div className="sidebar-content">
      {/* Header del sidebar */}
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo-icon">
            <Shield size={24} />
          </div>
          <div className="logo-text">
            <h2>OdontoSys</h2>
            <p>Panel Admin</p>
          </div>
        </div>
        
        {/* Botón cerrar en mobile */}
        {isMobile && (
          <button className="close-button" onClick={onCloseSidebar}>
            <X size={24} />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          
          if (item.disabled) {
            return (
              <div key={item.name} className="nav-item nav-item-disabled">
                <div className="nav-icon">
                  <Icon size={20} />
                </div>
                <div className="nav-text">
                  <p className="nav-name">{item.name}</p>
                  <p className="nav-description">{item.description}</p>
                </div>
                <span className="coming-soon-badge">Próximamente</span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={`nav-item ${item.current ? 'nav-item-active' : ''}`}
            >
              <div className="nav-icon">
                <Icon size={20} />
              </div>
              <div className="nav-text">
                <p className="nav-name">{item.name}</p>
                <p className="nav-description">{item.description}</p>
              </div>
              {item.current && <div className="active-indicator"></div>}
            </Link>
          );
        })}
      </nav>

      {/* Usuario y logout */}
      <div className="user-section">
        <div className="user-card">
          <div className="user-avatar-large">
            {user?.nombre?.charAt(0)?.toUpperCase()}
          </div>
          <div className="user-info-sidebar">
            <p className="user-name-sidebar">{user?.nombre}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
        
        <button onClick={onLogout} className="logout-button">
          <div className="logout-icon">
            <LogOut size={16} />
          </div>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Layout;