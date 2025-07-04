// src/services/AuthContext.js - Versión final combinada
// Mantiene todas las funcionalidades + solución de persistencia correcta

import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔥 CARGAR DATOS AL INICIAR - LÓGICA MEJORADA
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('🔍 === INICIALIZANDO AUTENTICACIÓN ===');
        
        // 🔑 LÓGICA HÍBRIDA MEJORADA:
        // - localStorage: almacena datos persistentes
        // - sessionStorage: marca de "navegador abierto"
        
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('userData');
        const browserOpen = sessionStorage.getItem('browserOpen');
        
        console.log('📊 Estado del almacenamiento:');
        console.log('- Token en localStorage:', !!savedToken);
        console.log('- Usuario en localStorage:', !!savedUser);
        console.log('- Marca browserOpen:', browserOpen);

        if (savedToken && savedUser) {
          if (browserOpen === 'true') {
            // 🟢 CASO 1: Hay datos Y el navegador sigue abierto
            // = Recarga de página (F5) o navegación interna
            try {
              const parsedUser = JSON.parse(savedUser);
              setToken(savedToken);
              setUser(parsedUser);
              setIsAuthenticated(true);
              
              // Renovar marca de navegador abierto
              sessionStorage.setItem('browserOpen', 'true');
              sessionStorage.setItem('sessionActive', 'true');
              sessionStorage.setItem('lastActivity', Date.now().toString());
              
              console.log('✅ SESIÓN RESTAURADA - Usuario:', parsedUser.nombre);
              console.log('✅ Motivo: Recarga de página o navegación interna');
            } catch (parseError) {
              console.error('❌ Error parseando datos de usuario:', parseError);
              clearAllData();
            }
          } else {
            // 🔴 CASO 2: Hay datos PERO no hay marca de navegador abierto
            // = Navegador fue cerrado completamente y reabierto
            console.log('🔓 NAVEGADOR FUE CERRADO - Limpiando datos antiguos');
            console.log('🗑️ Eliminando datos de localStorage...');
            clearAllData();
            
            // Establecer marca para futuras sesiones
            sessionStorage.setItem('browserOpen', 'true');
          }
        } else {
          // 🔵 CASO 3: No hay datos guardados
          // = Primera vez o logout previo
          console.log('ℹ️ No hay datos de sesión - Primera vez o logout previo');
          
          // Establecer marca para esta sesión
          sessionStorage.setItem('browserOpen', 'true');
        }
        
        console.log('🔍 === FIN INICIALIZACIÓN ===');
        
      } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        clearAllData();
      } finally {
        setLoading(false);
      }
    };

    // Función auxiliar para limpiar todos los datos
    const clearAllData = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      sessionStorage.removeItem('sessionActive');
      sessionStorage.removeItem('lastActivity');
      sessionStorage.removeItem('tabHiddenAt');
      sessionStorage.removeItem('windowBlurredAt');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    };

    initializeAuth();
  }, []);

  // 🔑 MANTENER SESIÓN ACTIVA - FUNCIONALIDAD ORIGINAL MEJORADA
  useEffect(() => {
    if (!user) return;

    console.log('🟢 Configurando mantener sesión activa para:', user.nombre);

    // Marcar sesión como activa
    sessionStorage.setItem('sessionActive', 'true');
    sessionStorage.setItem('browserOpen', 'true'); // 🔥 AGREGAR MARCA DE NAVEGADOR

    // Renovar marca de sesión cada 10 segundos
    const keepAliveInterval = setInterval(() => {
      sessionStorage.setItem('sessionActive', 'true');
      sessionStorage.setItem('browserOpen', 'true'); // 🔥 RENOVAR MARCA
      sessionStorage.setItem('lastActivity', Date.now().toString());
    }, 10000);

    // Renovar con actividad del usuario
    const renewSession = () => {
      sessionStorage.setItem('sessionActive', 'true');
      sessionStorage.setItem('browserOpen', 'true'); // 🔥 RENOVAR MARCA
      sessionStorage.setItem('lastActivity', Date.now().toString());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'focus'];
    events.forEach(event => {
      document.addEventListener(event, renewSession, { passive: true });
    });

    return () => {
      clearInterval(keepAliveInterval);
      events.forEach(event => {
        document.removeEventListener(event, renewSession);
      });
    };
  }, [user]);

  // 🔑 DETECTAR CIERRE DE PESTAÑA/NAVEGADOR - FUNCIONALIDAD ORIGINAL MEJORADA
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('⚠️ Pestaña/navegador cerrándose...');
      
      // 🔥 NUEVO: Al cerrar la ÚLTIMA pestaña, quitar marca de navegador abierto
      // sessionStorage se limpia automáticamente al cerrar todas las pestañas
      // localStorage se mantiene para futuras verificaciones
    };

    const handleUnload = () => {
      console.log('🔄 Evento unload ejecutado');
      // sessionStorage se limpia automáticamente
    };

    // 🔑 DETECTAR cuando la pestaña se oculta (cambio de pestaña o minimizar)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ Pestaña oculta');
        sessionStorage.setItem('tabHiddenAt', Date.now().toString());
      } else {
        console.log('👁️ Pestaña visible');
        const hiddenAt = sessionStorage.getItem('tabHiddenAt');
        if (hiddenAt) {
          const timeHidden = Date.now() - parseInt(hiddenAt);
          console.log(`⏱️ Pestaña estuvo oculta por ${Math.round(timeHidden / 1000)} segundos`);
          
          // 🔥 TIEMPO REDUCIDO: Si estuvo oculta más de 5 minutos, cerrar sesión
          if (timeHidden > 5 * 60 * 1000) {
            console.log('🔓 Pestaña oculta demasiado tiempo (>5min) - cerrando sesión');
            logout();
            return;
          }
        }
        sessionStorage.removeItem('tabHiddenAt');
        // Reactivar sesión al volver
        sessionStorage.setItem('sessionActive', 'true');
        sessionStorage.setItem('browserOpen', 'true'); // 🔥 RENOVAR MARCA
      }
    };

    // 🔑 DETECTAR pérdida de foco de la ventana
    const handleWindowBlur = () => {
      console.log('🪟 Ventana perdió foco');
      sessionStorage.setItem('windowBlurredAt', Date.now().toString());
    };

    const handleWindowFocus = () => {
      console.log('🪟 Ventana recuperó foco');
      const blurredAt = sessionStorage.getItem('windowBlurredAt');
      if (blurredAt) {
        const timeBlurred = Date.now() - parseInt(blurredAt);
        console.log(`⏱️ Ventana sin foco por ${Math.round(timeBlurred / 1000)} segundos`);
        
        // 🔥 TIEMPO REDUCIDO: Si estuvo sin foco más de 10 minutos, cerrar sesión
        if (timeBlurred > 10 * 60 * 1000) {
          console.log('🔓 Ventana sin foco demasiado tiempo (>10min) - cerrando sesión');
          logout();
          return;
        }
      }
      sessionStorage.removeItem('windowBlurredAt');
      // Reactivar sesión al volver
      sessionStorage.setItem('sessionActive', 'true');
      sessionStorage.setItem('browserOpen', 'true'); // 🔥 RENOVAR MARCA
    };

    // Agregar event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // 🔑 VERIFICACIÓN PERIÓDICA DE SESIÓN - FUNCIONALIDAD ORIGINAL MEJORADA
  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      const sessionActive = sessionStorage.getItem('sessionActive');
      const browserOpen = sessionStorage.getItem('browserOpen'); // 🔥 NUEVA VERIFICACIÓN
      const lastActivity = sessionStorage.getItem('lastActivity');
      
      // Verificar marca de navegador abierto
      if (!browserOpen || browserOpen !== 'true') {
        console.log('🔓 Marca de navegador abierto perdida - cerrando sesión');
        logout();
        return;
      }
      
      if (!sessionActive || sessionActive !== 'true') {
        console.log('🔓 Sesión no activa - cerrando automáticamente');
        logout();
        return;
      }

      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity);
        // 🔥 TIEMPO REDUCIDO: 20 minutos sin actividad
        if (timeSinceActivity > 20 * 60 * 1000) {
          console.log('🔓 Sin actividad por más de 20 minutos - cerrando sesión');
          logout();
          return;
        }
      }
    };

    // Verificar cada 30 segundos
    const checkInterval = setInterval(checkSession, 30000);

    return () => clearInterval(checkInterval);
  }, [user]);

  // 🔑 FUNCIÓN DE LOGIN - FUNCIONALIDAD ORIGINAL MEJORADA
  const login = async (email, password) => {
    try {
      console.log('🔐 Iniciando sesión para:', email);
      
      const credentials = {
        email: email,
        password: password
      };
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        
        // 🔥 ALMACENAMIENTO HÍBRIDO MEJORADO:
        // localStorage: datos persistentes
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // sessionStorage: marcas de sesión activa
        sessionStorage.setItem('browserOpen', 'true');       // 🔥 MARCA DE NAVEGADOR ABIERTO
        sessionStorage.setItem('sessionActive', 'true');     // Marca de sesión activa
        sessionStorage.setItem('lastActivity', Date.now().toString()); // Última actividad
        
        console.log('✅ === LOGIN EXITOSO ===');
        console.log('👤 Usuario:', data.user.nombre);
        console.log('🎭 Rol:', data.user.rol);
        console.log('💾 Datos en localStorage: token + userData');
        console.log('🔄 Marcas en sessionStorage: browserOpen + sessionActive + lastActivity');
        console.log('✅ === FIN LOGIN ===');
        
        return { success: true, user: data.user };
      } else {
        console.error('❌ Error en login:', data.error || data.message);
        return { success: false, error: data.error || data.message || 'Error de autenticación' };
      }
    } catch (error) {
      console.error('❌ Error de conexión en login:', error);
      return { success: false, error: 'Error de conexión. Verifique su internet.' };
    }
  };

  // 🔑 FUNCIÓN DE LOGOUT - FUNCIONALIDAD ORIGINAL MEJORADA
  const logout = () => {
    console.log('🔓 === CERRANDO SESIÓN ===');
    console.log('👤 Usuario actual:', user?.nombre || 'N/A');
    
    // Limpiar estado de React
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // 🔥 LIMPIAR TODO EL ALMACENAMIENTO
    // localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    // sessionStorage  
    sessionStorage.removeItem('browserOpen');        // 🔥 QUITAR MARCA DE NAVEGADOR
    sessionStorage.removeItem('sessionActive');
    sessionStorage.removeItem('lastActivity');
    sessionStorage.removeItem('tabHiddenAt');
    sessionStorage.removeItem('windowBlurredAt');
    
    console.log('🗑️ localStorage limpiado: token, userData');
    console.log('🗑️ sessionStorage limpiado: browserOpen, sessionActive, lastActivity, etc.');
    console.log('✅ === LOGOUT COMPLETADO ===');
  };

  // 🔑 FUNCIONES ORIGINALES MANTENIDAS
  
  // Función para verificar si el token sigue siendo válido
  const verifyToken = async () => {
    if (!token) return false;

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return true;
      } else {
        console.log('🔓 Token inválido - cerrando sesión automáticamente');
        logout();
        return false;
      }
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      return false;
    }
  };

  // Función para actualizar datos del usuario
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    console.log('📝 Datos de usuario actualizados:', userData);
  };

  // Función para obtener headers con token
  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Función para hacer peticiones autenticadas
  const authFetch = async (url, options = {}) => {
    const authOptions = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, authOptions);
      
      // Si el token expiró, cerrar sesión
      if (response.status === 401) {
        console.log('🔓 Token expirado (401) - cerrando sesión');
        logout();
        throw new Error('Sesión expirada');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error en petición autenticada:', error);
      throw error;
    }
  };

  // 🔥 NUEVA FUNCIÓN: Verificar estado de la sesión
  const getSessionStatus = () => {
    return {
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      browserOpen: sessionStorage.getItem('browserOpen') === 'true',
      sessionActive: sessionStorage.getItem('sessionActive') === 'true',
      lastActivity: sessionStorage.getItem('lastActivity'),
      timeToExpire: user ? calculateTimeToExpire() : null
    };
  };

  // Función auxiliar para calcular tiempo hasta expiración
  const calculateTimeToExpire = () => {
    const lastActivity = sessionStorage.getItem('lastActivity');
    if (!lastActivity) return null;
    
    const timeSinceActivity = Date.now() - parseInt(lastActivity);
    const timeToExpire = (20 * 60 * 1000) - timeSinceActivity; // 20 minutos
    
    return timeToExpire > 0 ? timeToExpire : 0;
  };

  // Valor del contexto - FUNCIONALIDAD ORIGINAL + NUEVAS FUNCIONES
  const contextValue = {
    // Estado original
    user,
    token,
    loading,
    isAuthenticated,
    
    // Funciones originales
    login,
    logout,
    verifyToken,
    updateUser,
    getAuthHeaders,
    authFetch,
    
    // 🔥 NUEVAS FUNCIONES
    getSessionStatus,
    
    // Datos adicionales del usuario (originales)
    userName: user?.nombre || 'Usuario',
    userRole: user?.rol || 'user',
    userId: user?.id || null,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔑 COMPONENTE DE PROTECCIÓN - FUNCIONALIDAD ORIGINAL MEJORADA
export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>🔄 Verificando sesión...</div>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔒 Acceso denegado - redirigiendo a login');
    // Redirigir al login
    window.location.href = '/login';
    return null;
  }

  if (requiredRole && user?.rol !== requiredRole) {
    console.log('🚫 Acceso denegado - rol insuficiente. Requerido:', requiredRole, 'Actual:', user?.rol);
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h2>🚫 Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
        <p style={{ opacity: 0.7 }}>Rol requerido: {requiredRole}</p>
        <p style={{ opacity: 0.7 }}>Tu rol: {user?.rol}</p>
      </div>
    );
  }

  return children;
};

export default AuthContext;