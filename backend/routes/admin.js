// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { verifyAdminAuth } = require('../middleware/auth');

// 🔒 APLICAR MIDDLEWARE DE AUTENTICACIÓN A TODAS LAS RUTAS
router.use(verifyAdminAuth);

// ============================================
// RUTAS DE PRUEBA Y SISTEMA
// ============================================

// Ruta de prueba simple
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Panel administrativo funcionando correctamente',
    user: {
      id: req.user.id,
      email: req.user.email,
      rol: req.user.rol
    },
    timestamp: new Date().toISOString()
  });
});

// GET - Información del sistema y versión
router.get('/system/info', (req, res) => {
  res.json({
    success: true,
    system: {
      name: 'OdontoSys Admin Panel',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'MySQL',
      node_version: process.version
    },
    user: {
      id: req.user.id,
      email: req.user.email,
      rol: req.user.rol,
      authenticated_at: new Date().toISOString()
    },
    permissions: {
      users: true,
      stats: true,
      inventory: true,
      system_info: true
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================
// RUTAS DE USUARIOS
// ============================================

// GET - Obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    console.log('🔍 Consultando usuarios para admin:', req.user.email);
    
    const [users] = await pool.execute(`
      SELECT 
        id,
        nombre,
        CONCAT(apellido_paterno, COALESCE(CONCAT(' ', apellido_materno), '')) as apellido_completo,
        email,
        telefono,
        rol,
        activo,
        fecha_creacion as fecha_registro
      FROM usuarios
      ORDER BY fecha_creacion DESC
    `);

    console.log('✅ Usuarios encontrados:', users.length);
    res.json(users);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de usuarios',
      error: error.message
    });
  }
});

// POST - Crear nuevo usuario
router.post('/users', async (req, res) => {
  try {
    console.log('🔄 Creando nuevo usuario:', req.body);
    
    const { nombre, email, telefono, rol, password, activo = true } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email, contraseña y rol son obligatorios'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es válido'
      });
    }

    // Validar rol
    const rolesValidos = ['Administrador', 'Doctor', 'Secretaria'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol no válido. Debe ser: Administrador, Doctor o Secretaria'
      });
    }

    // Verificar si el email ya existe
    const [existingUsers] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Separar nombre completo en nombre y apellidos
    const nombrePartes = nombre.trim().split(' ');
    const nombrePrimero = nombrePartes[0];
    const apellidoPaterno = nombrePartes[1] || '';
    const apellidoMaterno = nombrePartes.slice(2).join(' ') || null;

    // Crear usuario
    const [result] = await pool.execute(`
      INSERT INTO usuarios (
        nombre, 
        apellido_paterno, 
        apellido_materno,
        email, 
        telefono, 
        rol, 
        password, 
        activo, 
        fecha_creacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      nombrePrimero, 
      apellidoPaterno,
      apellidoMaterno,
      email, 
      telefono || null, 
      rol, 
      hashedPassword, 
      activo
    ]);

    console.log('✅ Usuario creado exitosamente:', {
      id: result.insertId,
      email,
      rol,
      creado_por: req.user.email
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      userId: result.insertId,
      user: {
        id: result.insertId,
        nombre: nombrePrimero,
        apellido_paterno: apellidoPaterno,
        email,
        rol,
        activo
      }
    });

  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT - Actualizar usuario
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, rol, password, activo } = req.body;

    console.log('🔄 Actualizando usuario:', id, req.body);

    // Validaciones básicas
    if (!nombre || !email || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y rol son obligatorios'
      });
    }

    // Verificar que el usuario existe
    const [existingUser] = await pool.execute(
      'SELECT id, email FROM usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar email duplicado (excluyendo el usuario actual)
    const [duplicateEmail] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, id]
    );

    if (duplicateEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe otro usuario con este email'
      });
    }

    // Separar nombre completo
    const nombrePartes = nombre.trim().split(' ');
    const nombrePrimero = nombrePartes[0];
    const apellidoPaterno = nombrePartes[1] || '';
    const apellidoMaterno = nombrePartes.slice(2).join(' ') || null;

    let updateQuery = `
      UPDATE usuarios 
      SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, 
          email = ?, telefono = ?, rol = ?, activo = ?
    `;
    let updateParams = [
      nombrePrimero, apellidoPaterno, apellidoMaterno,
      email, telefono || null, rol, activo
    ];

    // Si hay nueva contraseña, incluirla
    if (password && password.trim() !== '') {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateQuery += `, password = ?`;
      updateParams.push(hashedPassword);
    }

    updateQuery += ` WHERE id = ?`;
    updateParams.push(id);

    await pool.execute(updateQuery, updateParams);

    console.log('✅ Usuario actualizado:', id);

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PATCH - Cambiar estado del usuario
router.patch('/users/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener estado actual del usuario
    const [users] = await pool.execute(
      'SELECT id, activo, email FROM usuarios WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const newStatus = !users[0].activo;

    // Actualizar estado
    await pool.execute(
      'UPDATE usuarios SET activo = ? WHERE id = ?',
      [newStatus, id]
    );

    console.log('✅ Estado de usuario cambiado:', {
      id,
      email: users[0].email,
      nuevo_estado: newStatus
    });

    res.json({
      success: true,
      message: `Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
      newStatus
    });

  } catch (error) {
    console.error('❌ Error al cambiar estado del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE - Eliminar usuario
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que no se esté eliminando a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    // Verificar que el usuario existe
    const [existingUser] = await pool.execute(
      'SELECT id, email FROM usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Por seguridad, solo desactivar en lugar de eliminar
    await pool.execute(
      'UPDATE usuarios SET activo = false WHERE id = ?',
      [id]
    );

    console.log('✅ Usuario desactivado (soft delete):', {
      id,
      email: existingUser[0].email,
      eliminado_por: req.user.email
    });

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// ============================================
// RUTAS DE ESTADÍSTICAS
// ============================================

// GET - Estadísticas generales del sistema  
router.get('/stats/overview', async (req, res) => {
  try {
    console.log('📊 Iniciando consulta de estadísticas...');
    
    // Estadísticas de usuarios
    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_usuarios,
        SUM(CASE WHEN rol = 'Administrador' THEN 1 ELSE 0 END) as administradores,
        SUM(CASE WHEN rol = 'Doctor' THEN 1 ELSE 0 END) as doctores,
        SUM(CASE WHEN rol = 'Secretaria' THEN 1 ELSE 0 END) as secretarias,
        SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as usuarios_activos
      FROM usuarios
    `);
    console.log('✅ Usuarios:', userStats[0]);

    // Estadísticas de pacientes
    const [patientStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_pacientes,
        COUNT(CASE WHEN DATE(fecha_creacion) = CURDATE() THEN 1 END) as pacientes_hoy,
        COUNT(CASE WHEN DATE(fecha_creacion) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as pacientes_mes
      FROM pacientes WHERE activo = 1
    `);
    console.log('✅ Pacientes:', patientStats[0]);

    // Estadísticas de citas
    const [appointmentStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_citas,
        COUNT(CASE WHEN DATE(fecha_cita) = CURDATE() THEN 1 END) as citas_hoy,
        COUNT(CASE WHEN DATE(fecha_cita) >= CURDATE() AND estado IN ('Confirmada', 'Programada') THEN 1 END) as citas_pendientes
      FROM citas
    `);
    console.log('✅ Citas:', appointmentStats[0]);

    // Estadísticas de historiales clínicos
    const [clinicalStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT paciente_id) as pacientes_con_historial,
        COUNT(*) as total_consultas,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as consultas_mes
      FROM historial_clinico
    `);
    console.log('✅ Historiales:', clinicalStats[0]);

    const response = {
      usuarios: userStats[0] || { total_usuarios: 0, administradores: 0, doctores: 0, secretarias: 0, usuarios_activos: 0 },
      pacientes: patientStats[0] || { total_pacientes: 0, pacientes_hoy: 0, pacientes_mes: 0 },
      citas: appointmentStats[0] || { total_citas: 0, citas_hoy: 0, citas_pendientes: 0 },
      historiales: clinicalStats[0] || { pacientes_con_historial: 0, total_consultas: 0, consultas_mes: 0 }
    };

    console.log('📊 Estadísticas finales:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del sistema',
      error: error.message
    });
  }
});

// ============================================
// RUTAS DE ALERTAS E INVENTARIO
// ============================================

// GET - Alertas de inventario (stock bajo)
router.get('/alerts/inventory', async (req, res) => {
  try {
    console.log('📦 Consultando alertas de inventario...');
    
    const [stockAlerts] = await pool.execute(`
      SELECT 
        id,
        nombre_producto,
        categoria,
        stock_actual,
        stock_minimo,
        unidad_medida,
        CASE 
          WHEN stock_actual = 0 THEN 'Sin stock'
          WHEN stock_actual <= stock_minimo THEN 'Stock crítico'
          WHEN stock_actual <= (stock_minimo * 1.5) THEN 'Stock bajo'
          ELSE 'Normal'
        END as nivel_alerta,
        CASE 
          WHEN stock_actual = 0 THEN 'danger'
          WHEN stock_actual <= stock_minimo THEN 'warning'
          WHEN stock_actual <= (stock_minimo * 1.5) THEN 'info'
          ELSE 'success'
        END as tipo_alerta
      FROM inventario 
      WHERE activo = 1 
        AND stock_actual <= (stock_minimo * 1.5)
      ORDER BY 
        CASE 
          WHEN stock_actual = 0 THEN 1
          WHEN stock_actual <= stock_minimo THEN 2
          ELSE 3
        END,
        stock_actual ASC
      LIMIT 10
    `);
    
    console.log('✅ Alertas de inventario:', stockAlerts);
    res.json(stockAlerts);

  } catch (error) {
    console.error('❌ Error al obtener alertas de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas de inventario',
      error: error.message
    });
  }
});

// GET - Alertas de movimientos del sistema (log de actividad)
router.get('/alerts/movements', async (req, res) => {
  try {
    console.log('📋 Consultando alertas de movimientos...');
    
    // Versión simplificada que funcionará con tu estructura de base de datos
    const [systemLogs] = await pool.execute(`
      SELECT 
        'cita' as tipo_movimiento,
        CONCAT('Cita ', c.estado, ' - ', p.nombre, ' ', COALESCE(p.apellido_paterno, '')) as descripcion,
        u.nombre as usuario,
        c.fecha_actualizacion as fecha_hora,
        CASE 
          WHEN c.estado = 'Completada' THEN 'success'
          WHEN c.estado = 'Cancelada' THEN 'danger'
          WHEN c.estado = 'En_Proceso' THEN 'warning'
          ELSE 'info'
        END as tipo_alerta
      FROM citas c
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      LEFT JOIN usuarios u ON c.doctor_id = u.id
      WHERE c.fecha_actualizacion >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND c.fecha_actualizacion IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'paciente' as tipo_movimiento,
        CONCAT('Paciente registrado - ', p.nombre, ' ', COALESCE(p.apellido_paterno, '')) as descripcion,
        COALESCE(uc.nombre, 'Sistema') as usuario,
        p.fecha_creacion as fecha_hora,
        'info' as tipo_alerta
      FROM pacientes p
      LEFT JOIN usuarios uc ON p.creado_por = uc.id
      WHERE p.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND p.fecha_creacion IS NOT NULL
      
      ORDER BY fecha_hora DESC
      LIMIT 10
    `);
    
    console.log('✅ Alertas de movimientos:', systemLogs.length, 'registros');
    res.json(systemLogs);

  } catch (error) {
    console.error('❌ Error detallado al obtener alertas de movimientos:', error.message);
    console.error('❌ Stack completo:', error.stack);
    
    // En caso de error, devolver array vacío en lugar de error 500
    res.json([]);
  }
});

module.exports = router;