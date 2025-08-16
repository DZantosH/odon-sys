// admin-panel/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import TwoFactorLogin from './components/TwoFactorLogin';
import TwoFactorSetup from './components/TwoFactorSetup';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Finanzas from './pages/Finanzas';
import Inventario from './pages/Inventario';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authStep, setAuthStep] = useState('login'); // 'login', '2fa', 'setup', 'authenticated'
  const [pendingUser, setPendingUser] = useState(null);

  // Auto-detectar URL base
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Verificar que el usuario sea administrador
        if (userData.user.rol === 'Administrador') {
          setUser(userData.user);
          setIsAuthenticated(true);
          setAuthStep('authenticated');
        } else {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setAuthStep('login');
        }
      } else {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setAuthStep('login');
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setAuthStep('login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Verificar que el usuario sea administrador
        if (data.user.rol !== 'Administrador') {
          throw new Error('Acceso denegado. Se requieren permisos de administrador.');
        }

        // Verificar si tiene 2FA configurado
        const twoFactorResponse = await fetch(`${API_URL}/auth/2fa-status`, {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });

        if (twoFactorResponse.ok) {
          const twoFactorData = await twoFactorResponse.json();
          
          if (twoFactorData.isFullyConfigured) {
            // Usuario tiene 2FA configurado, ir a verificación
            setPendingUser(data.user);
            setAuthStep('2fa');
            return { success: true, requiresTwoFactor: true };
          } else {
            // Usuario necesita configurar 2FA
            localStorage.setItem('token', data.token);
            setUser(data.user);
            setAuthStep('setup');
            return { success: true, requiresSetup: true };
          }
        } else {
          // Error al verificar estado 2FA, pero login fue exitoso
          localStorage.setItem('token', data.token);
          setUser(data.user);
          setAuthStep('setup');
          return { success: true, requiresSetup: true };
        }
      } else {
        throw new Error(data.message || 'Error en el login');
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: error.message || 'Error al iniciar sesión' 
      };
    }
  };

  const handle2FASuccess = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    setAuthStep('authenticated');
    setPendingUser(null);
  };

  const handle2FASetupComplete = () => {
    setIsAuthenticated(true);
    setAuthStep('authenticated');
  };

  const handleBackToLogin = () => {
    setPendingUser(null);
    setAuthStep('login');
    localStorage.removeItem('token');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setAuthStep('login');
    setPendingUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  // Mostrar login inicial
  if (authStep === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  // Mostrar verificación 2FA
  if (authStep === '2fa' && pendingUser) {
    return (
      <TwoFactorLogin 
        user={pendingUser}
        onSuccess={handle2FASuccess}
        onBack={handleBackToLogin}
      />
    );
  }

  // Mostrar configuración 2FA
  if (authStep === 'setup' && user) {
    return (
      <TwoFactorSetup 
        user={user}
        onComplete={handle2FASetupComplete}
        onCancel={handleLogout}
      />
    );
  }

  // Usuario autenticado con 2FA
  if (authStep === 'authenticated' && isAuthenticated) {
    return (
      <Router>
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/finanzas" element={<Finanzas />} />
            <Route path="/inventario" element={<Inventario />} />
            
            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    );
  }

  // Fallback
  return <Login onLogin={handleLogin} />;
}

export default App;