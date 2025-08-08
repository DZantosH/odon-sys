const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { pool, testConnection } = require('./config/database');
require('dotenv').config();
const { verifyToken } = require('./middleware/auth');


const app = express();
const PORT = process.env.PORT || 5000;

// ========== CREAR DIRECTORIOS DE UPLOADS ==========
const createUploadDirectories = () => {
    const directories = [
        'uploads',
        'uploads/avatars',
        'uploads/radiografias',
        'uploads/estudios',
        'uploads/documentos'
    ];
    
    directories.forEach(dir => {
        const fullPath = path.join(__dirname, dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    });
};

// Crear directorios al inicio
createUploadDirectories();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', (req, res, next) => {
  next();
});

// ===== ENDPOINT PROTEGIDO PARA ARCHIVOS DE ESTUDIOS =====
app.get('/api/uploads/estudios/:filename', verifyToken, (req, res) => {
  try {
    const { filename } = req.params;

     // ✅ AGREGAR HEADERS CORS EXPLÍCITAMENTE
    res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'http://98.82.131.153'] 
      : 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    console.log('🔒 Acceso protegido a archivo de estudio:', filename);
    console.log('👤 Usuario autenticado:', req.user.email);
    
     // Validar formato del filename por seguridad
    if (!/^estudio-\d+-\d+\.(pdf|jpg|jpeg|png)$/.test(filename)) {
      console.log('❌ Formato de archivo inválido:', filename);
      return res.status(400).json({
        success: false,
        error: 'Formato de archivo no válido'
      });
    }
    
    const filePath = path.join(__dirname, 'uploads', 'estudios', filename);
    console.log('📂 Ruta del archivo:', filePath);
    
   // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.log('❌ Archivo no encontrado:', filePath);
      
      // Listar archivos disponibles para debugging
      const dirPath = path.join(__dirname, 'uploads', 'estudios');
      try {
        const files = fs.readdirSync(dirPath);
        console.log('📋 Archivos disponibles:', files.slice(0, 10));
      } catch (err) {
        console.log('📋 No se pudo leer directorio de estudios:', err.message);
      }
      
      return res.status(404).json({
        success: false,
        error: 'Archivo no encontrado',
        filename,
        path: filePath
      });
    }

    // Establecer headers apropiados según el tipo de archivo
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Headers de seguridad y cache
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache privado por 1 hora
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    console.log('✅ Sirviendo archivo protegido:', {
      filename,
      mimeType,
      size: fs.statSync(filePath).size,
      usuario: req.user.email
    });
    
    // Enviar el archivo
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('❌ Error sirviendo archivo protegido:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));
app.use('/uploads/radiografias', express.static(path.join(__dirname, 'uploads/radiografias')));

// ✅ AGREGAR HANDLER PARA OPTIONS (preflight)
app.options('/api/uploads/estudios/:filename', (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'http://98.82.131.153'] 
    : 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// En server.js, agregar DESPUÉS del endpoint de estudios:

// ===== ENDPOINT PROTEGIDO PARA ARCHIVOS DE RADIOGRAFÍAS =====
app.get('/api/uploads/radiografias/:filename', verifyToken, (req, res) => {
  try {
    const { filename } = req.params;
    
    // Headers CORS
    res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'http://98.82.131.153'] 
      : 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    console.log('🔒 Acceso protegido a archivo de radiografía:', filename);
    console.log('👤 Usuario autenticado:', req.user.email);
    
    // Validar formato del filename por seguridad
    if (!/^radiografia-\d+-\d+\.(pdf|jpg|jpeg|png|gif|dcm|dicom)$/.test(filename)) {
      console.log('❌ Formato de archivo inválido:', filename);
      return res.status(400).json({
        success: false,
        error: 'Formato de archivo no válido'
      });
    }
    
    const filePath = path.join(__dirname, 'uploads', 'radiografias', filename);
    console.log('📂 Ruta del archivo:', filePath);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.log('❌ Archivo no encontrado:', filePath);
      
      // Listar archivos disponibles para debugging
      const dirPath = path.join(__dirname, 'uploads', 'radiografias');
      try {
        const files = fs.readdirSync(dirPath);
        console.log('📋 Archivos disponibles en radiografías:', files.slice(0, 10));
      } catch (err) {
        console.log('📋 No se pudo leer directorio de radiografías:', err.message);
      }
      
      return res.status(404).json({
        success: false,
        error: 'Archivo no encontrado',
        filename,
        path: filePath
      });
    }

    // Establecer headers apropiados según el tipo de archivo
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.dcm': 'application/dicom',
      '.dicom': 'application/dicom'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Headers de seguridad y cache
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    console.log('✅ Sirviendo archivo de radiografía protegido:', {
      filename,
      mimeType,
      size: fs.statSync(filePath).size,
      usuario: req.user.email
    });
    
    // Enviar el archivo
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('❌ Error sirviendo archivo de radiografía protegido:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Handler para OPTIONS (preflight) de radiografías
app.options('/api/uploads/radiografias/:filename', (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'http://98.82.131.153'] 
    : 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});


// ========== MIDDLEWARE PRINCIPAL ==========
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL || 'http://98.82.131.153'] 
        : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ========== BODY PARSERS (CORREGIDOS) ==========
app.use(express.json({ 
    limit: '10mb',
    strict: true
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== ARCHIVOS ESTÁTICOS MEJORADO ==========
// Middleware principal para archivos estáticos
app.use('/uploads', (req, res, next) => {
    console.log('📁 Solicitud de archivo estático:', req.path);
    console.log('📂 Archivo completo:', path.join(__dirname, 'uploads', req.path));
    next();
}, express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        console.log('✅ Sirviendo archivo:', filePath);
        
        // Establecer headers apropiados según el tipo de archivo
        const ext = path.extname(filePath).toLowerCase();
        
        // Headers para imágenes
        if (['.jpg', '.jpeg'].includes(ext)) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (ext === '.png') {
            res.setHeader('Content-Type', 'image/png');
        } else if (ext === '.gif') {
            res.setHeader('Content-Type', 'image/gif');
        } else if (ext === '.webp') {
            res.setHeader('Content-Type', 'image/webp');
        } else if (ext === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf');
        }
        
        // Cache por 1 hora para imágenes, 30 minutos para PDFs
        const cacheTime = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? 3600 : 1800;
        res.setHeader('Cache-Control', `public, max-age=${cacheTime}`);
        
        // Headers de seguridad
        res.setHeader('X-Content-Type-Options', 'nosniff');
    }
}));

// ✅ NUEVO: Endpoint específico para archivos con mejor manejo de errores
app.get('/uploads/:tipo/:filename', (req, res) => {
    const { tipo, filename } = req.params;
    
    console.log('🔍 Solicitud de archivo específico:', { tipo, filename });
    
    // Validar tipo de archivo permitido
    const tiposPermitidos = ['radiografias', 'avatars', 'estudios', 'documentos'];
    if (!tiposPermitidos.includes(tipo)) {
        console.log('❌ Tipo de archivo no válido:', tipo);
        return res.status(400).json({
            success: false,
            error: 'Tipo de archivo no válido',
            tiposPermitidos
        });
    }
    
    const filePath = path.join(__dirname, 'uploads', tipo, filename);
    console.log('📂 Ruta completa del archivo:', filePath);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
        console.log('❌ Archivo no encontrado:', filePath);
        
        // Listar archivos disponibles en el directorio para debugging
        const dirPath = path.join(__dirname, 'uploads', tipo);
        try {
            const files = fs.readdirSync(dirPath);
            console.log(`📋 Archivos disponibles en ${tipo}:`, files);
        } catch (err) {
            console.log(`📋 No se pudo leer directorio ${tipo}:`, err.message);
        }
        
        return res.status(404).json({
            success: false,
            error: 'Archivo no encontrado',
            path: `/uploads/${tipo}/${filename}`,
            message: `El archivo ${filename} no existe en ${tipo}`,
            tipo,
            filename,
            fullPath: filePath
        });
    }

    // Establecer headers apropiados según el tipo de archivo
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg', 
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.dcm': 'application/dicom'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    
    console.log('✅ Sirviendo archivo exitosamente:', {
        filename,
        tipo,
        mimeType,
        size: fs.statSync(filePath).size
    });
    
    // Enviar el archivo
    res.sendFile(filePath);
});



// Middleware específico para avatars con logging
app.use('/uploads/avatars', (req, res, next) => {
    next();
}, express.static(path.join(__dirname, 'uploads/avatars'), {
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        
        if (['.jpg', '.jpeg'].includes(ext)) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (ext === '.png') {
            res.setHeader('Content-Type', 'image/png');
        } else if (ext === '.gif') {
            res.setHeader('Content-Type', 'image/gif');
        } else if (ext === '.webp') {
            res.setHeader('Content-Type', 'image/webp');
        }
        
        // Cache por 2 horas para avatars
        res.setHeader('Cache-Control', 'public, max-age=7200');
        res.setHeader('X-Content-Type-Options', 'nosniff');
    }
}));

// Middleware específico para radiografías
app.use('/uploads/radiografias', express.static(path.join(__dirname, 'uploads/radiografias'), {
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        
        if (['.jpg', '.jpeg'].includes(ext)) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (ext === '.png') {
            res.setHeader('Content-Type', 'image/png');
        } else if (ext === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf');
        }
        
        // Cache por 1 hora para radiografías
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('X-Content-Type-Options', 'nosniff');
    }
}));

// Middleware específico para estudios de laboratorio
app.use('/uploads/estudios', express.static(path.join(__dirname, 'uploads/estudios'), {
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        
        if (ext === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf');
        }
        
        // Cache por 1 hora para estudios
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('X-Content-Type-Options', 'nosniff');
    }
}));

// ========== MIDDLEWARE DE LOGGING DETALLADO ==========
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.path;
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    console.log(`📡 ${timestamp} - ${method} ${url} - ${userAgent}`);
    
    // Solo logear el body en desarrollo y si no es muy grande
    if (process.env.NODE_ENV === 'development' && req.body && Object.keys(req.body).length > 0) {
        try {
            const bodyStr = JSON.stringify(req.body);
            if (bodyStr.length < 500) {
            } else {
            }
        } catch (e) {
        }
    }
    
    next();
});

// ========== MIDDLEWARE DE VALIDACIÓN CONTENT-TYPE ==========
app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.get('Content-Type');
        
        // Excluir rutas de upload que usan multipart/form-data
        const isUploadRoute = req.path.includes('/avatar') || 
                            req.path.includes('/radiografias') || 
                            req.path.includes('/estudios') ||
                            (contentType && contentType.includes('multipart/form-data'));
        
        if (!isUploadRoute && (!contentType || !contentType.includes('application/json'))) {
            console.warn('⚠️ Content-Type incorrecto:', {
                method: req.method,
                url: req.url,
                contentType: contentType,
                expected: 'application/json'
            });
        }
    }
    
    next();
});

// ========== CONEXIÓN BD GLOBAL ==========
app.locals.pool = pool;
app.locals.db = pool;

// ========== IMPORTAR MIDDLEWARE DE HORARIO ==========
const { verificarHorarioAcceso } = require('./middleware/horarioAcceso');

// ========== IMPORTAR RUTAS ==========
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const pacientesRoutes = require('./routes/pacientes');
const citasRoutes = require('./routes/citas');
const tiposConsultaRoutes = require('./routes/tiposConsulta'); // ← Verificar esta línea
const radiografiasRoutes = require('./routes/radiografias');
const consultasRoutes = require('./routes/consultas');
const estudiosLaboratorioRoutes = require('./routes/estudios-laboratorio');
const historialRoutes = require('./routes/historial');
const consultasActualesRoutes = require('./routes/consultas-actuales');
const odontogramaRoutes = require('./routes/odontograma');


console.log('  • /api/tipos-consulta'); // ← Esta debe aparecer

// ========== CONFIGURAR RUTAS ==========
// ⚠️ IMPORTANTE: LOGIN SIN RESTRICCIÓN DE HORARIO
app.use('/api/auth', authRoutes);

// ✅ RUTAS CON RESTRICCIÓN DE HORARIO
app.use('/api/usuarios', verificarHorarioAcceso, usuariosRoutes);
app.use('/api/pacientes', verificarHorarioAcceso, pacientesRoutes);
app.use('/api/citas', verificarHorarioAcceso, citasRoutes);
app.use('/api/tipos-consulta', verificarHorarioAcceso, tiposConsultaRoutes); // ← Verificar esta línea
app.use('/api/radiografias', verificarHorarioAcceso, radiografiasRoutes);
app.use('/api/consultas', verificarHorarioAcceso, consultasRoutes);
app.use('/api/estudios-laboratorio', verificarHorarioAcceso, estudiosLaboratorioRoutes);
app.use('/api/consultas-actuales', verificarHorarioAcceso, consultasActualesRoutes);
app.use('/api/odontograma', verificarHorarioAcceso, odontogramaRoutes);
app.use('/api/historial', historialRoutes);

// ========== ENDPOINTS DE DEBUG SIN RESTRICCIÓN ==========
app.all('/api/debug', (req, res) => {
    res.json({
        success: true,
        debug: {
            method: req.method,
            headers: req.headers,
            body: req.body,
            query: req.query,
            params: req.params,
            contentType: req.get('Content-Type'),
            contentLength: req.get('Content-Length'),
            userAgent: req.get('User-Agent')
        },
        timestamp: new Date().toISOString()
    });
});

app.post('/api/test-json', (req, res) => {
    res.json({
        success: true,
        message: 'JSON recibido correctamente',
        received: req.body,
        type: typeof req.body,
        keys: Object.keys(req.body || {})
    });
});




// ========== RUTAS DE PRUEBA SIN RESTRICCIÓN ==========
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API funcionando correctamente', 
        timestamp: new Date().toISOString(),
        version: '1.1.0',
        horario_sistema: {
            activo: true,
            restriccion: '00:00-08:00 solo administradores',
            horario_doctores: '08:00-23:59'
        },
        features: {
            auth: true,
            usuarios: true,
            pacientes: true,
            citas: true,
            tiposConsulta: true,
            radiografias: true,
            consultasActuales: true,
            estudiosLaboratorio: true,
            historialCompleto: true,
            historialPOST: true,
            jsonErrorHandling: true,
            avatarUpload: true,
            fileUpload: true,
            staticFiles: true,
            horarioControl: true // 🆕 NUEVO
        },
        capabilities: {
            uploads_enabled: true,
            uploads_path: '/uploads',
            avatar_uploads: '/uploads/avatars',
            radiografia_uploads: '/uploads/radiografias',
            estudios_uploads: '/uploads/estudios',
            max_file_size: '10MB',
            supported_formats: ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'PDF'],
            real_time_consultations: true,
            medical_records: true,
            patient_tracking: true,
            json_validation: true,
            avatar_management: true,
            file_cache: true,
            schedule_control: true // 🆕 NUEVO
        }
    });
});

// Resto de rutas de prueba (sin cambios, pero sin restricción de horario)...
// [Mantener todas las rutas de prueba como estaban]

// ========== MANEJO DE ERRORES MEJORADO ==========
app.use((err, req, res, next) => {
    console.error('❌ Error stack completo:', err.stack);
    console.error('❌ Error detalles:', {
        message: err.message,
        code: err.code,
        errno: err.errno,
        sqlMessage: err.sqlMessage,
        sqlState: err.sqlState,
        type: err.type,
        status: err.status
    });
    
    // Error de JSON parsing
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('❌ Error de JSON parsing detectado:');
        console.error('📡 URL:', req.method, req.url);
        console.error('📋 Headers:', JSON.stringify(req.headers, null, 2));
        console.error('💾 Error:', err.message);
        
        return res.status(400).json({
            success: false,
            error: 'JSON malformado',
            message: 'El formato del JSON enviado no es válido',
            details: {
                error: err.message,
                tip: 'Verifique que los datos se envíen como JSON válido',
                ejemplo: '{"campo": "valor"}',
                recibido: `Error: ${err.message.substring(0, 100)}...`
            },
            timestamp: new Date().toISOString()
        });
    }

    // Error de validación de datos
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            error: 'Datos mal formateados',
            message: 'Los datos enviados no pueden ser procesados',
            details: err.message,
            timestamp: new Date().toISOString()
        });
    }

    // Error de límite de tamaño
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            error: 'Datos demasiado grandes',
            message: 'El tamaño de los datos excede el límite permitido (10MB)',
            timestamp: new Date().toISOString()
        });
    }
    
    // ERRORES ESPECÍFICOS DE MULTER (AVATARS Y ARCHIVOS)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
            success: false,
            error: 'El archivo es demasiado grande. Máximo permitido: 5MB para avatars, 10MB para otros archivos',
            code: 'FILE_TOO_LARGE'
        });
    }
    
    if (err.message && err.message.includes('Tipo de archivo no válido')) {
        return res.status(400).json({ 
            success: false,
            error: err.message,
            code: 'INVALID_FILE_TYPE',
            allowed_types: 'JPG, PNG, GIF, WEBP para avatars; PDF para estudios'
        });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
            success: false,
            error: 'Campo de archivo inesperado. Use "avatar" para avatars, "radiografia" para radiografías, "archivo" para estudios',
            code: 'UNEXPECTED_FIELD'
        });
    }
    
    // ERRORES DE ARCHIVOS NO ENCONTRADOS
    if (err.code === 'ENOENT' && err.path) {
        return res.status(404).json({
            success: false,
            error: 'Archivo no encontrado',
            code: 'FILE_NOT_FOUND',
            details: process.env.NODE_ENV === 'development' ? err.path : undefined
        });
    }
    
    // Errores de base de datos
    if (err.code && err.code.startsWith('ER_')) {
        return res.status(500).json({
            success: false,
            error: 'Error de base de datos',
            code: 'DATABASE_ERROR',
            details: process.env.NODE_ENV === 'development' ? err.sqlMessage : undefined
        });
    }
    
    // Error genérico
    res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString()
    });
});

// ========== RUTAS NO ENCONTRADAS ==========
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado',
        path: req.originalUrl,
        method: req.method,
        available_endpoints: [
            'GET /api/test',
            'GET /api/test/historial',
            'GET /api/test/radiografias',
            'GET /api/test/consultas',
            'GET /api/test/estudios',
            'GET /api/test/database',
            'GET /api/test/avatars',
            'GET /api/test/static-files',
            'GET /api/system/info',
            'POST /api/auth/login (SIN restricción)',
            'GET /api/pacientes (CON restricción)',
            'POST /api/pacientes/:id/avatar (CON restricción)',
            'DELETE /api/pacientes/:id/avatar (CON restricción)',
            'GET /api/citas (CON restricción)',
            'GET /api/historial/:id (CON restricción)',
            'POST /api/historiales-clinicos (CON restricción)',
            'POST /api/historiales (CON restricción)',
            'POST /api/test-json (SIN restricción)',
            'ALL /api/debug (SIN restricción)',
            'GET /uploads/avatars/:filename',
            'GET /uploads/radiografias/:filename',
            'GET /uploads/estudios/:filename'
        ],
        horario_info: {
            login: 'Disponible 24/7',
            rutas_protegidas: 'Administradores: 24/7, Doctores: 08:00-23:59',
            rutas_debug: 'Disponibles 24/7'
        },
        timestamp: new Date().toISOString()
    });
});

// ========== INICIO DEL SERVIDOR ==========
const startServer = async () => {
    try {
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos. Cerrando servidor...');
            process.exit(1);
        }
                
        // Verificar estructura de tablas críticas
        const criticalTables = ['usuarios', 'pacientes', 'citas', 'estudios_laboratorio'];
        for (const table of criticalTables) {
            try {
                await pool.execute(`SELECT 1 FROM ${table} LIMIT 1`);
            } catch (error) {
                console.warn(`⚠️ Problema con tabla ${table}:`, error.message);
            }
        }
        
        // Verificar que los directorios de uploads existan
        const uploadDirs = [
            'uploads',
            'uploads/avatars',
            'uploads/radiografias', 
            'uploads/estudios',
            'uploads/documentos'
        ];
        
        uploadDirs.forEach(dir => {
            const fullPath = path.join(__dirname, dir);
            if (fs.existsSync(fullPath)) {
            } else {
                try {
                    fs.mkdirSync(fullPath, { recursive: true });
                } catch (error) {
                    console.error(`❌ Error creando directorio ${dir}:`, error.message);
                }
            }
        });
        
        // Verificar permisos de escritura en directorios
        uploadDirs.forEach(dir => {
            const fullPath = path.join(__dirname, dir);
            try {
                fs.accessSync(fullPath, fs.constants.W_OK);
            } catch (error) {
            }
        });
        
        app.listen(PORT, () => {
        
        });
        
    } catch (error) {
        process.exit(1);
    }
};

// ========== MANEJO DE SEÑALES ==========
process.on('SIGINT', async () => {
    try {
        await pool.end();
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    try {
        await pool.end();
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
});

// Iniciar el servidor
startServer();