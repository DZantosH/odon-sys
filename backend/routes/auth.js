const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database'); // Importar pool directamente

const router = express.Router();

// Login
router.post('/login', [
    body('email').isEmail().withMessage('Email válido requerido'),
    body('password').isLength({ min: 1 }).withMessage('Contraseña requerida') // Cambié de 6 a 1 para pruebas
], async (req, res) => {
    console.log('=== LOGIN REQUEST ===');
    console.log('Body:', req.body);
    
    try {
        // Validar entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        console.log('Email:', email);
        console.log('Password received:', password);
        
        // Buscar usuario usando mysql2/promise
        const query = 'SELECT * FROM usuarios WHERE email = ? AND activo = 1';
        const [results] = await pool.execute(query, [email]);

        console.log('Users found:', results.length);

        if (results.length === 0) {
            console.log('No user found');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = results[0];
        console.log('User found:', user.email);
        console.log('Password in DB:', user.password);
        
        // TEMPORAL: Verificar contraseña sin hash
        const dbPassword = user.password ? user.password.toString().trim() : '';
        const receivedPassword = password ? password.toString().trim() : '';
        
        console.log('Comparing passwords:');
        console.log('DB Password:', `"${dbPassword}"`);
        console.log('Received Password:', `"${receivedPassword}"`);
        
        const isValidPassword = (dbPassword === receivedPassword);
        console.log('Final password match:', isValidPassword);
        
        if (!isValidPassword) {
            console.log('Invalid password - sending 401');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        console.log('Password is valid, generating token...');

        // Generar token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                rol: user.rol,
                nombre: user.nombre
            },
            process.env.JWT_SECRET || 'clave-secreta-temporal',
            { expiresIn: '8h' }
        );

        console.log('Token generated successfully');
        console.log('Sending successful response...');

        // Responder con token y datos del usuario
        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido_paterno: user.apellido_paterno,
                apellido_materno: user.apellido_materno,
                email: user.email,
                rol: user.rol,
                telefono: user.telefono
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔑 NUEVO: LOGOUT
router.post('/logout', async (req, res) => {
    try {
        const { action = 'manual', timestamp } = req.body;
        const authHeader = req.headers.authorization;
        
        let userId = null;

        // Intentar extraer información del token si está presente
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave-secreta-temporal');
                userId = decoded.id;
            } catch (jwtError) {
                console.log('Token inválido en logout:', jwtError.message);
            }
        }

        console.log(`🔓 Logout ${action} - Usuario ID: ${userId}`);

        res.json({
            success: true,
            message: 'Logout registrado exitosamente',
            action,
            timestamp: timestamp || new Date().toISOString()
        });

    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar logout'
        });
    }
});

// Verificar token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave-secreta-temporal');
        
        const query = 'SELECT id, nombre, apellido_paterno, apellido_materno, email, rol, telefono FROM usuarios WHERE id = ? AND activo = 1';
        const [results] = await pool.execute(query, [decoded.id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            valid: true,
            user: results[0]
        });

    } catch (error) {
        console.error('Error verificando token:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
});

// 🔑 NUEVO: Verificar sesión (específico para el cierre automático)
router.get('/verify-session', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave-secreta-temporal');

        // Verificar que el usuario sigue activo
        const [usuarios] = await pool.execute(
            'SELECT * FROM usuarios WHERE id = ? AND activo = 1',
            [decoded.id]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }

        const usuario = usuarios[0];
        const { password: _, ...usuarioSeguro } = usuario;

        res.json({
            success: true,
            message: 'Sesión válida',
            user: usuarioSeguro,
            tokenExpiry: decoded.exp * 1000 // Convertir a milliseconds
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        console.error('Error verificando sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// 🔑 NUEVO: Extender sesión
router.post('/extend-session', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave-secreta-temporal');

        // Generar nuevo token con tiempo extendido
        const newToken = jwt.sign(
            { 
                id: decoded.id, 
                email: decoded.email,
                rol: decoded.rol,
                nombre: decoded.nombre
            },
            process.env.JWT_SECRET || 'clave-secreta-temporal',
            { expiresIn: '8h' }
        );

        console.log(`🔄 Sesión extendida para usuario ID: ${decoded.id}`);

        res.json({
            success: true,
            message: 'Sesión extendida exitosamente',
            token: newToken,
            expiresAt: (jwt.decode(newToken).exp) * 1000
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado, inicie sesión nuevamente'
            });
        }

        console.error('Error extendiendo sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Cambiar contraseña
router.put('/change-password', [
    body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nueva contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave-secreta-temporal');
        const { currentPassword, newPassword } = req.body;

        // Obtener usuario actual
        const query = 'SELECT password FROM usuarios WHERE id = ?';
        const [results] = await pool.execute(query, [decoded.id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = results[0];
        
        // Verificar contraseña actual (temporal sin hash)
        const isValidPassword = (currentPassword === user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        // Actualizar contraseña (temporal sin hash)
        const updateQuery = 'UPDATE usuarios SET password = ? WHERE id = ?';
        await pool.execute(updateQuery, [newPassword, decoded.id]);

        res.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔑 NUEVO: Endpoint de prueba para el sistema de sesiones
router.get('/session-test', (req, res) => {
    res.json({
        message: 'Sistema de sesiones funcionando',
        timestamp: new Date().toISOString(),
        endpoints: {
            login: 'POST /api/auth/login',
            logout: 'POST /api/auth/logout',
            verify: 'GET /api/auth/verify',
            verify_session: 'GET /api/auth/verify-session',
            extend_session: 'POST /api/auth/extend-session',
            change_password: 'PUT /api/auth/change-password'
        },
        features: {
            jwt_tokens: true,
            session_tracking: true,
            auto_logout: true,
            session_extension: true,
            browser_close_detection: true
        }
    });
});

module.exports = router;