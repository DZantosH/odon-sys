import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import '../css/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulación de delay para mostrar loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error);
      console.error('Error de login:', result.error);
    } else {
    }
    
    setLoading(false);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className={`login-page-modern ${mounted ? 'loaded' : ''}`}>
      {/* Fondo animado */}
      <div className="login-bg-animated">
        <div className="bg-bubble bg-bubble-1"></div>
        <div className="bg-bubble bg-bubble-2"></div>
        <div className="bg-bubble bg-bubble-3"></div>
        <div className="bg-bubble bg-bubble-4"></div>
        <div className="bg-bubble bg-bubble-5"></div>
      </div>

      {/* Contenedor principal */}
      <div className="login-container-modern">
        {/* Panel izquierdo - Branding */}
        <div className="login-brand-panel">
          <div className="brand-content">
            <div className="brand-logo">
              <div className="logo-icon">
                🦷
              </div>
              <h1 className="brand-title">Odon-SISTEMA</h1>
              <p className="brand-subtitle">Sistema de Gestión Odontológica</p>
            </div>
            
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">💫</span>
                <span className="feature-text">Cada sonrisa transformada es una vida mejorada</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌟</span>
                <span className="feature-text">Excelencia clínica en cada tratamiento</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">❤️</span>
                <span className="feature-text">Cuidando la salud bucal con pasión</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span className="feature-text">Tecnología avanzada al servicio del paciente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="login-form-panel">
          <div className="form-container-modern">
            <div className="form-header">
              <h2 className="form-title">Bienvenido de vuelta</h2>
              <p className="form-subtitle">Ingresa tus credenciales para acceder al sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form-modern">
              {/* Campo Email */}
              <div className={`input-group-modern ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
                <div className="input-wrapper-modern">
                  <span className="input-icon-modern">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    className="input-modern"
                    required
                  />
                  <label className="input-label-modern">Correo electrónico</label>
                  {formData.email && (
                    <span className={`input-validation ${isValidEmail(formData.email) ? 'valid' : 'invalid'}`}>
                      {isValidEmail(formData.email) ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              </div>

              {/* Campo Password */}
              <div className={`input-group-modern ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'filled' : ''}`}>
                <div className="input-wrapper-modern">
                  <span className="input-icon-modern">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <circle cx="12" cy="16" r="1"></circle>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    className="input-modern"
                    required
                  />
                  <label className="input-label-modern">Contraseña</label>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Opciones adicionales */}
              <div className="form-options">
                <label className="checkbox-modern">
                  <input type="checkbox" />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">Recordarme</span>
                </label>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="error-message-modern">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{error}</span>
                </div>
              )}

              {/* Botón de submit */}
              <button 
                type="submit" 
                className={`submit-btn-modern ${loading ? 'loading' : ''}`}
                disabled={loading || !formData.email || !formData.password}
              >
                <span className="btn-text">
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </span>
                {loading && <span className="btn-spinner"></span>}
                {!loading && (
                  <span className="btn-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12,5 19,12 12,19"></polyline>
                    </svg>
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;