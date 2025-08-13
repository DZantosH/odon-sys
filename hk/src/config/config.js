// admin-panel/src/config/config.js
// ===== AUTO-DETECCIÓN DE ENTORNO (igual que tu sistema actual) =====

const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.hostname === '0.0.0.0';

const isDevelopment = process.env.NODE_ENV === 'development' || isLocalhost;
const isProduction = !isDevelopment;

// Auto-detectar URLs del backend
const getBackendConfig = () => {
  if (isLocalhost) {
    // Desarrollo local
    return {
      API_URL: 'http://localhost:5000/api',
      UPLOADS_URL: 'http://localhost:5000/uploads',
      BASE_URL: 'http://localhost:5000'
    };
  } else {
    // Producción - usar el mismo protocolo y host
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const baseUrl = `${protocol}//${host}${port}`;
    
    return {
      API_URL: `${baseUrl}/api`,
      UPLOADS_URL: `${baseUrl}/uploads`,
      BASE_URL: baseUrl
    };
  }
};

const backendConfig = getBackendConfig();

export const config = {
  // URLs auto-detectadas
  ...backendConfig,
  
  // Información del entorno
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: isProduction,
  IS_LOCALHOST: isLocalhost,
  
  // Configuración de la aplicación
  APP_TITLE: process.env.REACT_APP_ADMIN_TITLE || 'Panel de Administración',
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  
  // Debug automático en desarrollo
  DEBUG: isDevelopment,
  
  // Información de la clínica
  CLINIC: {
    NAME: process.env.REACT_APP_CLINIC_NAME || 'Clínica Dental',
    PHONE: process.env.REACT_APP_CLINIC_PHONE || '',
  },
  
  // Configuración adaptiva según entorno
  REQUEST_TIMEOUT: isProduction ? 15000 : 5000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ITEMS_PER_PAGE: 20,
  
  // Rutas de la aplicación
  ROUTES: {
    LOGIN: '/login',
    DASHBOARD: '/',
    USERS: '/usuarios',
    PATIENTS: '/pacientes',
    FINANCES: '/finanzas',
    INVENTORY: '/inventario',
    REPORTS: '/reportes',
    SETTINGS: '/configuracion'
  }
};

// Función helper para construir URLs de API
export const buildApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${config.API_URL}/${cleanEndpoint}`;
};

// Función helper para construir URLs de uploads  
export const buildUploadUrl = (filename) => {
  if (!filename) return null;
  
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
  return `${config.UPLOADS_URL}/${cleanFilename}`;
};

// Función helper para headers de peticiones
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Función helper para logs en desarrollo
export const devLog = (...args) => {
  if (config.DEBUG) {
    console.log('[ADMIN]:', ...args);
  }
};

// Auto-información del entorno al cargar
if (config.DEBUG) {
  console.group('🔧 Panel Admin - Auto Config');
  console.log('🌍 Entorno:', isDevelopment ? 'DESARROLLO' : 'PRODUCCIÓN');
  console.log('🔗 API:', config.API_URL);
  console.log('📁 Uploads:', config.UPLOADS_URL);
  console.log('🖥️ Host:', window.location.hostname);
  console.log('⚡ Debug:', config.DEBUG);
  console.groupEnd();
}

export default config;