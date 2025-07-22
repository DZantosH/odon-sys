const getEnvironmentConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  return {
    // ✅ CORREGIDO: URL específica para cada entorno
    API_BASE_URL: isLocalhost 
      ? 'http://localhost:5000/api' 
      : 'http://98.82.131.153:5000/api',
    ENVIRONMENT: isLocalhost ? 'development' : 'production',
    APP_URL: `${protocol}//${hostname}${port ? ':' + port : ''}`,
  };
};

export const CONFIG = getEnvironmentConfig();

export const {
  API_BASE_URL,
  ENVIRONMENT,
  APP_URL
} = CONFIG;

export const buildApiUrl = (endpoint) => {
  // ✅ CORREGIDO: Sin process.env, usar CONFIG directamente
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('🔗 buildApiUrl generó:', fullUrl);
  return fullUrl;
};

// 🆕 CONFIGURACIÓN ADICIONAL PARA RADIOGRAFÍAS
export const RADIOGRAFIAS_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  TIPOS_RADIOGRAFIA: [
    'Panorámica',
    'Periapical', 
    'Bite-wing',
    'Lateral',
    'Oclusal'
  ]
};

// 🆕 FUNCIÓN PARA OBTENER HEADERS DE AUTENTICACIÓN
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// 🆕 FUNCIÓN PARA OBTENER HEADERS PARA UPLOAD DE ARCHIVOS
export const getFileUploadHeaders = () => {
  const token = localStorage.getItem('token');
  
  return {
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// 🆕 FUNCIÓN PARA VALIDAR ARCHIVOS DE RADIOGRAFÍAS
export const validateRadiografiaFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No se ha seleccionado ningún archivo');
    return errors;
  }
  
  if (file.size > RADIOGRAFIAS_CONFIG.MAX_FILE_SIZE) {
    errors.push(`El archivo es demasiado grande. Máximo permitido: ${RADIOGRAFIAS_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  if (!RADIOGRAFIAS_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    errors.push(`Tipo de archivo no permitido. Solo se permiten: ${RADIOGRAFIAS_CONFIG.ALLOWED_TYPES.join(', ')}`);
  }
  
  return errors;
};

// 🆕 FUNCIÓN PARA FORMATEAR FECHA
export const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  
  try {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
};

// 🆕 FUNCIÓN PARA CALCULAR EDAD
export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento || fechaNacimiento === '1900-01-01') return 'N/A';
  
  try {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad > 0 ? edad : 'N/A';
  } catch (error) {
    console.error('Error al calcular edad:', error);
    return 'N/A';
  }
};

if (ENVIRONMENT === 'development') {
  console.log('🔧 Auto-detected config:', CONFIG);
  console.log('📸 Radiografías config:', RADIOGRAFIAS_CONFIG);
}