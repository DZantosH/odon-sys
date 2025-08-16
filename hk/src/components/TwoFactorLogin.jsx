// hk/src/components/TwoFactorLogin.jsx
import React, { useState } from 'react';
import { Shield, Key, Smartphone, AlertCircle, ArrowLeft } from 'lucide-react';

const TwoFactorLogin = ({ user, onSuccess, onBack }) => {
  const [pin, setPin] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-detectar URL base
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError('El PIN debe tener exactamente 6 dígitos');
      return;
    }
    
    if (totpCode.length !== 6 || !/^\d{6}$/.test(totpCode)) {
      setError('El código de autenticación debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          pin,
          totpCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Almacenar token y llamar onSuccess
        localStorage.setItem('token', data.token);
        onSuccess(data);
      } else {
        setError(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verificación 2FA</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu PIN y código de autenticación
          </p>
          
          {/* Info del usuario */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Usuario:</span> {user.nombre}
            </p>
            <p className="text-sm text-blue-600">{user.email}</p>
          </div>
        </div>

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-lg p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Error de verificación</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* PIN */}
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    PIN de Administrador (6 dígitos)
                  </div>
                </label>
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  maxLength="6"
                  required
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setPin(value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  disabled={loading}
                />
              </div>

              {/* Código TOTP */}
              <div>
                <label htmlFor="totpCode" className="block text-sm font-medium text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Código de Google Authenticator (6 dígitos)
                  </div>
                </label>
                <input
                  id="totpCode"
                  name="totpCode"
                  type="text"
                  maxLength="6"
                  required
                  value={totpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setTotpCode(value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Ingresa el código actual de tu app de autenticación
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={loading}
                  className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </button>
                
                <button
                  type="submit"
                  disabled={loading || pin.length !== 6 || totpCode.length !== 6}
                  className="flex-2 flex justify-center items-center gap-3 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Verificar y Acceder
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Información adicional */}
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-yellow-700 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Información importante</span>
            </div>
            <p className="text-xs text-yellow-600">
              Ambos códigos son requeridos para acceder al panel administrativo.
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              El código de autenticación cambia cada 30 segundos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorLogin;