// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database'); // ← IMPORTACIÓN CORREGIDA

// Ruta de prueba simple
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Panel administrativo funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// GET - Obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        id,
        nombre,
        email,
        telefono,
        rol,
        activo,
        fecha_creacion as fecha_registro
      FROM usuarios
      ORDER BY fecha_creacion DESC
    `);

    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de usuarios'
    });
  }
});

// POST - Crear nuevo usuario
router.post('/users', async (req, res) => {
  try {
    const { nombre, email, telefono, rol, password, activo = true } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios deben ser completados'
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

    // Crear usuario
    const [result] = await pool.execute(`
      INSERT INTO usuarios (nombre, email, telefono, rol, password, activo, fecha_creacion) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [nombre, email, telefono || null, rol, hashedPassword, activo]);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT - Actualizar usuario
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, rol, password, activo } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios deben ser completados'
      });
    }

    let updateQuery = `
      UPDATE usuarios 
      SET nombre = ?, email = ?, telefono = ?, rol = ?, activo = ?
    `;
    let updateParams = [nombre, email, telefono || null, rol, activo];

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

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
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
      'SELECT id, activo FROM usuarios WHERE id = ?',
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

    res.json({
      success: true,
      message: `Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
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

    // Por seguridad, solo desactivar
    await pool.execute(
      'UPDATE usuarios SET activo = false WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

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
    
    // Versión simplificada que debería funcionar con tu estructura de base de datos
    const [systemLogs] = await pool.execute(`
      SELECT 
        'cita' as tipo_movimiento,
        CONCAT('Cita ', c.estado, ' - ', p.nombre, ' ', p.apellido_paterno) as descripcion,
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
      
      UNION ALL
      
      SELECT 
        'historial' as tipo_movimiento,
        CONCAT('Historial clínico actualizado - ', p.nombre, ' ', COALESCE(p.apellido_paterno, '')) as descripcion,
        u.nombre as usuario,
        h.updated_at as fecha_hora,
        CASE 
          WHEN h.estado = 'completado' THEN 'success'
          WHEN h.estado = 'borrador' THEN 'warning'
          ELSE 'info'
        END as tipo_alerta
      FROM historial_clinico h
      LEFT JOIN pacientes p ON h.paciente_id = p.id
      LEFT JOIN usuarios u ON h.doctor_id = u.id
      WHERE h.updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND h.updated_at IS NOT NULL
      
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

// GET - Obtener todos los productos del inventario
router.get('/inventario', async (req, res) => {
  try {
    console.log('📦 Consultando inventario...');
    
    const [productos] = await pool.execute(`
      SELECT 
        id,
        nombre_producto,
        categoria,
        codigo_producto,
        stock_actual,
        stock_minimo,
        stock_maximo,
        precio_unitario,
        unidad_medida,
        proveedor,
        fecha_vencimiento,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM inventario 
      WHERE activo = 1
      ORDER BY nombre_producto ASC
    `);
    
    console.log('✅ Productos encontrados:', productos.length);
    res.json(productos);

  } catch (error) {
    console.error('❌ Error al obtener inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inventario',
      error: error.message
    });
  }
});

// GET - Obtener estadísticas del inventario
router.get('/inventario/stats', async (req, res) => {
  try {
    console.log('📊 Consultando estadísticas de inventario...');
    
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_productos,
        SUM(CASE WHEN stock_actual <= stock_minimo THEN 1 ELSE 0 END) as productos_bajo_stock,
        SUM(CASE WHEN stock_actual = 0 THEN 1 ELSE 0 END) as productos_agotados,
        ROUND(SUM(stock_actual * precio_unitario), 2) as valor_total_inventario
      FROM inventario 
      WHERE activo = 1
    `);
    
    console.log('✅ Estadísticas calculadas:', stats[0]);
    res.json(stats[0] || {
      total_productos: 0,
      productos_bajo_stock: 0,
      productos_agotados: 0,
      valor_total_inventario: 0
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// POST - Crear nuevo producto
router.post('/inventario', async (req, res) => {
  try {
    const {
      nombre_producto,
      categoria,
      codigo_producto,
      stock_actual,
      stock_minimo,
      stock_maximo,
      precio_unitario,
      unidad_medida,
      proveedor,
      fecha_vencimiento,
      descripcion
    } = req.body;

    // Validaciones básicas
    if (!nombre_producto || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Nombre del producto y categoría son obligatorios'
      });
    }

    // Verificar si el código de producto ya existe
    if (codigo_producto) {
      const [existingProduct] = await pool.execute(
        'SELECT id FROM inventario WHERE codigo_producto = ? AND activo = 1',
        [codigo_producto]
      );

      if (existingProduct.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un producto con este código'
        });
      }
    }

// ============================================
// RUTAS DE Inventario
// ============================================

    // Crear producto
    const [result] = await pool.execute(`
      INSERT INTO inventario (
        nombre_producto, categoria, codigo_producto, stock_actual, stock_minimo, 
        stock_maximo, precio_unitario, unidad_medida, proveedor, fecha_vencimiento, 
        descripcion, activo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `, [
      nombre_producto, categoria, codigo_producto || null, 
      stock_actual || 0, stock_minimo || 0, stock_maximo || 0,
      precio_unitario || 0, unidad_medida || 'unidad', 
      proveedor || null, fecha_vencimiento || null, descripcion || null
    ]);

    // Registrar movimiento inicial si hay stock
    if (stock_actual && stock_actual > 0) {
      await pool.execute(`
        INSERT INTO movimientos_inventario (
          producto_id, tipo_movimiento, cantidad, precio_unitario, 
          motivo, usuario_id, fecha_movimiento
        ) VALUES (?, 'entrada', ?, ?, 'Stock inicial', ?, NOW())
      `, [result.insertId, stock_actual, precio_unitario || 0, req.user?.id || null]);
    }

    console.log('✅ Producto creado con ID:', result.insertId);
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      productId: result.insertId
    });

  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT - Actualizar producto
router.put('/inventario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre_producto,
      categoria,
      codigo_producto,
      stock_actual,
      stock_minimo,
      stock_maximo,
      precio_unitario,
      unidad_medida,
      proveedor,
      fecha_vencimiento,
      descripcion
    } = req.body;

    // Validaciones básicas
    if (!nombre_producto || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Nombre del producto y categoría son obligatorios'
      });
    }

    // Verificar si el producto existe
    const [existingProduct] = await pool.execute(
      'SELECT * FROM inventario WHERE id = ? AND activo = 1',
      [id]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar código duplicado (excluyendo el producto actual)
    if (codigo_producto) {
      const [duplicateCode] = await pool.execute(
        'SELECT id FROM inventario WHERE codigo_producto = ? AND id != ? AND activo = 1',
        [codigo_producto, id]
      );

      if (duplicateCode.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro producto con este código'
        });
      }
    }

    // Detectar cambio en stock para registrar movimiento
    const stockAnterior = existingProduct[0].stock_actual;
    const stockNuevo = stock_actual || 0;
    
    // Actualizar producto
    await pool.execute(`
      UPDATE inventario 
      SET nombre_producto = ?, categoria = ?, codigo_producto = ?, stock_actual = ?, 
          stock_minimo = ?, stock_maximo = ?, precio_unitario = ?, unidad_medida = ?, 
          proveedor = ?, fecha_vencimiento = ?, descripcion = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      nombre_producto, categoria, codigo_producto || null, stockNuevo,
      stock_minimo || 0, stock_maximo || 0, precio_unitario || 0,
      unidad_medida || 'unidad', proveedor || null, fecha_vencimiento || null,
      descripcion || null, id
    ]);

    // Registrar movimiento si cambió el stock
    if (stockAnterior !== stockNuevo) {
      const diferencia = stockNuevo - stockAnterior;
      const tipoMovimiento = diferencia > 0 ? 'entrada' : 'salida';
      const cantidad = Math.abs(diferencia);
      
      await pool.execute(`
        INSERT INTO movimientos_inventario (
          producto_id, tipo_movimiento, cantidad, precio_unitario,
          motivo, usuario_id, fecha_movimiento
        ) VALUES (?, ?, ?, ?, 'Ajuste por edición', ?, NOW())
      `, [id, tipoMovimiento, cantidad, precio_unitario || 0, req.user?.id || null]);
    }

    console.log('✅ Producto actualizado:', id);
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE - Eliminar producto (soft delete)
router.delete('/inventario/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el producto existe
    const [existingProduct] = await pool.execute(
      'SELECT id FROM inventario WHERE id = ? AND activo = 1',
      [id]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Soft delete
    await pool.execute(
      'UPDATE inventario SET activo = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    console.log('✅ Producto eliminado (soft delete):', id);
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST - Registrar movimiento de inventario
router.post('/inventario/:id/movimiento', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipo_movimiento,
      cantidad,
      precio_unitario,
      motivo,
      documento_referencia
    } = req.body;

    // Validaciones
    if (!tipo_movimiento || !cantidad || !motivo) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de movimiento, cantidad y motivo son obligatorios'
      });
    }

    if (cantidad <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser mayor a 0'
      });
    }

    // Obtener producto actual
    const [producto] = await pool.execute(
      'SELECT * FROM inventario WHERE id = ? AND activo = 1',
      [id]
    );

    if (producto.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const stockActual = producto[0].stock_actual;
    let nuevoStock = stockActual;

    // Calcular nuevo stock según el tipo de movimiento
    switch (tipo_movimiento) {
      case 'entrada':
        nuevoStock = stockActual + cantidad;
        break;
      case 'salida':
        nuevoStock = Math.max(0, stockActual - cantidad);
        if (stockActual < cantidad) {
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente. Stock actual: ${stockActual}`
          });
        }
        break;
      case 'ajuste':
        nuevoStock = cantidad;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de movimiento no válido'
        });
    }

    // Iniciar transacción
    await pool.execute('START TRANSACTION');

    try {
      // Registrar movimiento
      await pool.execute(`
        INSERT INTO movimientos_inventario (
          producto_id, tipo_movimiento, cantidad, precio_unitario,
          motivo, documento_referencia, usuario_id, fecha_movimiento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        id, tipo_movimiento, cantidad, precio_unitario || 0,
        motivo, documento_referencia || null, req.user?.id || null
      ]);

      // Actualizar stock del producto
      await pool.execute(`
        UPDATE inventario 
        SET stock_actual = ?, updated_at = NOW() 
        WHERE id = ?
      `, [nuevoStock, id]);

      // Confirmar transacción
      await pool.execute('COMMIT');

      console.log(`✅ Movimiento registrado: ${tipo_movimiento} de ${cantidad} unidades para producto ${id}`);
      res.json({
        success: true,
        message: 'Movimiento registrado exitosamente',
        stock_anterior: stockActual,
        stock_nuevo: nuevoStock
      });

    } catch (error) {
      // Revertir transacción en caso de error
      await pool.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Error al registrar movimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET - Obtener historial de movimientos de un producto
router.get('/inventario/:id/movimientos', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const [movimientos] = await pool.execute(`
      SELECT 
        m.*,
        u.nombre as usuario_nombre,
        i.nombre_producto
      FROM movimientos_inventario m
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN inventario i ON m.producto_id = i.id
      WHERE m.producto_id = ?
      ORDER BY m.fecha_movimiento DESC
      LIMIT ?
    `, [id, parseInt(limit)]);

    res.json(movimientos);

  } catch (error) {
    console.error('❌ Error al obtener movimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos'
    });
  }
});

// GET - Obtener todos los movimientos de inventario (para reportes)
router.get('/inventario/movimientos/todos', async (req, res) => {
  try {
    const { 
      fecha_inicio, 
      fecha_fin, 
      tipo_movimiento, 
      producto_id,
      limit = 100 
    } = req.query;

    let whereConditions = [];
    let params = [];

    if (fecha_inicio) {
      whereConditions.push('DATE(m.fecha_movimiento) >= ?');
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      whereConditions.push('DATE(m.fecha_movimiento) <= ?');
      params.push(fecha_fin);
    }

    if (tipo_movimiento) {
      whereConditions.push('m.tipo_movimiento = ?');
      params.push(tipo_movimiento);
    }

    if (producto_id) {
      whereConditions.push('m.producto_id = ?');
      params.push(producto_id);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    params.push(parseInt(limit));

    const [movimientos] = await pool.execute(`
      SELECT 
        m.*,
        u.nombre as usuario_nombre,
        i.nombre_producto,
        i.categoria,
        i.unidad_medida
      FROM movimientos_inventario m
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN inventario i ON m.producto_id = i.id
      ${whereClause}
      ORDER BY m.fecha_movimiento DESC
      LIMIT ?
    `, params);

    res.json(movimientos);

  } catch (error) {
    console.error('❌ Error al obtener todos los movimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos'
    });
  }
});

// ============================================
// RUTAS DE FINANZAS
// ============================================

// GET - Estadísticas financieras
router.get('/finanzas/stats', async (req, res) => {
  try {
    const { filtro = 'mes_actual', fecha_inicio, fecha_fin } = req.query;
    
    let whereClause = '';
    let params = [];
    
    // Determinar el rango de fechas según el filtro
    switch (filtro) {
      case 'mes_actual':
        whereClause = 'WHERE MONTH(fecha_servicio) = MONTH(CURDATE()) AND YEAR(fecha_servicio) = YEAR(CURDATE())';
        break;
      case 'trimestre':
        whereClause = 'WHERE fecha_servicio >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
        break;
      case 'semestre':
        whereClause = 'WHERE fecha_servicio >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)';
        break;
      case 'año':
        whereClause = 'WHERE YEAR(fecha_servicio) = YEAR(CURDATE())';
        break;
      case 'personalizado':
        if (fecha_inicio && fecha_fin) {
          whereClause = 'WHERE fecha_servicio >= ? AND fecha_servicio <= ?';
          params = [fecha_inicio + '-01', fecha_fin + '-31'];
        }
        break;
    }

    // Estadísticas de ingresos
    const [ingresosStats] = await pool.execute(`
      SELECT 
        COALESCE(SUM(monto), 0) as total_ingresos,
        COUNT(*) as total_transacciones,
        COALESCE(AVG(monto), 0) as promedio_transaccion
      FROM ingresos 
      ${whereClause} AND estado = 'pagado'
    `, params);

    // Estadísticas de gastos
    const [gastosStats] = await pool.execute(`
      SELECT 
        COALESCE(SUM(monto), 0) as total_gastos,
        COUNT(*) as total_gastos_count
      FROM gastos 
      ${whereClause.replace('fecha_servicio', 'fecha_gasto')}
    `, params);

    // Estadísticas de citas para el período
    const [citasStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_citas,
        COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as citas_completadas
      FROM citas 
      ${whereClause.replace('fecha_servicio', 'fecha_cita')}
    `, params);

    // Calcular métricas
    const ingresosMes = ingresosStats[0]?.total_ingresos || 0;
    const gastosMes = gastosStats[0]?.total_gastos || 0;
    const utilidadMes = ingresosMes - gastosMes;
    const totalCitasMes = citasStats[0]?.citas_completadas || 0;
    const promedioPorCita = totalCitasMes > 0 ? ingresosMes / totalCitasMes : 0;

    // Crecimiento mensual (comparar con mes anterior)
    let crecimientoMensual = 0;
    if (filtro === 'mes_actual') {
      const [mesAnterior] = await pool.execute(`
        SELECT COALESCE(SUM(monto), 0) as ingresos_mes_anterior
        FROM ingresos 
        WHERE MONTH(fecha_servicio) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
        AND YEAR(fecha_servicio) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND estado = 'pagado'
      `);
      
      const ingresosMesAnterior = mesAnterior[0]?.ingresos_mes_anterior || 0;
      if (ingresosMesAnterior > 0) {
        crecimientoMensual = ((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100;
      }
    }

    res.json({
      ingresos_mes: ingresosMes,
      gastos_mes: gastosMes,
      utilidad_mes: utilidadMes,
      total_citas_mes: totalCitasMes,
      promedio_por_cita: promedioPorCita,
      crecimiento_mensual: crecimientoMensual
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas financieras:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas financieras'
    });
  }
});

// GET - Obtener ingresos
router.get('/finanzas/ingresos', async (req, res) => {
  try {
    const { 
      filtro = 'mes_actual', 
      fecha_inicio, 
      fecha_fin, 
      search = '',
      limit = 100 
    } = req.query;
    
    let whereConditions = ['estado = "pagado"'];
    let params = [];

    // Filtros de fecha
    switch (filtro) {
      case 'mes_actual':
        whereConditions.push('MONTH(fecha_servicio) = MONTH(CURDATE()) AND YEAR(fecha_servicio) = YEAR(CURDATE())');
        break;
      case 'trimestre':
        whereConditions.push('fecha_servicio >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)');
        break;
      case 'semestre':
        whereConditions.push('fecha_servicio >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)');
        break;
      case 'año':
        whereConditions.push('YEAR(fecha_servicio) = YEAR(CURDATE())');
        break;
      case 'personalizado':
        if (fecha_inicio && fecha_fin) {
          whereConditions.push('fecha_servicio >= ? AND fecha_servicio <= ?');
          params.push(fecha_inicio + '-01', fecha_fin + '-31');
        }
        break;
    }

    // Filtro de búsqueda
    if (search) {
      whereConditions.push('(tipo_servicio LIKE ? OR descripcion LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    params.push(parseInt(limit));

    const [ingresos] = await pool.execute(`
      SELECT 
        i.*,
        p.nombre as paciente_nombre,
        p.apellido_paterno,
        p.apellido_materno
      FROM ingresos i
      LEFT JOIN pacientes p ON i.paciente_id = p.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY i.fecha_servicio DESC, i.created_at DESC
      LIMIT ?
    `, params);

    res.json(ingresos);

  } catch (error) {
    console.error('❌ Error al obtener ingresos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ingresos'
    });
  }
});

// POST - Crear nuevo ingreso
router.post('/finanzas/ingresos', async (req, res) => {
  try {
    const {
      paciente_id,
      cita_id,
      tipo_servicio,
      descripcion,
      monto,
      metodo_pago,
      fecha_servicio,
      notas
    } = req.body;

    // Validaciones
    if (!tipo_servicio || !monto || monto <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de servicio y monto son obligatorios'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO ingresos (
        paciente_id, cita_id, tipo_servicio, descripcion, monto, 
        metodo_pago, estado, fecha_servicio, fecha_pago, notas, 
        usuario_registro, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pagado', ?, ?, ?, ?, NOW(), NOW())
    `, [
      paciente_id || null,
      cita_id || null,
      tipo_servicio,
      descripcion || null,
      monto,
      metodo_pago || 'efectivo',
      fecha_servicio || new Date().toISOString().split('T')[0],
      fecha_servicio || new Date().toISOString().split('T')[0],
      notas || null,
      req.user?.id || null
    ]);

    console.log('✅ Ingreso creado con ID:', result.insertId);
    res.status(201).json({
      success: true,
      message: 'Ingreso registrado exitosamente',
      ingresoId: result.insertId
    });

  } catch (error) {
    console.error('❌ Error al crear ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT - Actualizar ingreso
router.put('/finanzas/ingresos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      paciente_id,
      cita_id,
      tipo_servicio,
      descripcion,
      monto,
      metodo_pago,
      fecha_servicio,
      notas
    } = req.body;

    // Validaciones
    if (!tipo_servicio || !monto || monto <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de servicio y monto son obligatorios'
      });
    }

    // Verificar que el ingreso existe
    const [existing] = await pool.execute(
      'SELECT id FROM ingresos WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ingreso no encontrado'
      });
    }

    await pool.execute(`
      UPDATE ingresos 
      SET paciente_id = ?, cita_id = ?, tipo_servicio = ?, descripcion = ?, 
          monto = ?, metodo_pago = ?, fecha_servicio = ?, notas = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      paciente_id || null,
      cita_id || null,
      tipo_servicio,
      descripcion || null,
      monto,
      metodo_pago || 'efectivo',
      fecha_servicio,
      notas || null,
      id
    ]);

    console.log('✅ Ingreso actualizado:', id);
    res.json({
      success: true,
      message: 'Ingreso actualizado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al actualizar ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE - Eliminar ingreso
router.delete('/finanzas/ingresos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el ingreso existe
    const [existing] = await pool.execute(
      'SELECT id FROM ingresos WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ingreso no encontrado'
      });
    }

    // Cambiar estado a cancelado en lugar de eliminar
    await pool.execute(
      'UPDATE ingresos SET estado = "cancelado", updated_at = NOW() WHERE id = ?',
      [id]
    );

    console.log('✅ Ingreso cancelado:', id);
    res.json({
      success: true,
      message: 'Ingreso cancelado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET - Obtener gastos
router.get('/finanzas/gastos', async (req, res) => {
  try {
    const { 
      filtro = 'mes_actual', 
      fecha_inicio, 
      fecha_fin, 
      search = '',
      categoria = '',
      limit = 100 
    } = req.query;
    
    let whereConditions = ['1=1'];
    let params = [];

    // Filtros de fecha
    switch (filtro) {
      case 'mes_actual':
        whereConditions.push('MONTH(fecha_gasto) = MONTH(CURDATE()) AND YEAR(fecha_gasto) = YEAR(CURDATE())');
        break;
      case 'trimestre':
        whereConditions.push('fecha_gasto >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)');
        break;
      case 'semestre':
        whereConditions.push('fecha_gasto >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)');
        break;
      case 'año':
        whereConditions.push('YEAR(fecha_gasto) = YEAR(CURDATE())');
        break;
      case 'personalizado':
        if (fecha_inicio && fecha_fin) {
          whereConditions.push('fecha_gasto >= ? AND fecha_gasto <= ?');
          params.push(fecha_inicio + '-01', fecha_fin + '-31');
        }
        break;
    }

    // Filtro de búsqueda
    if (search) {
      whereConditions.push('(descripcion LIKE ? OR proveedor LIKE ? OR categoria LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Filtro por categoría
    if (categoria) {
      whereConditions.push('categoria = ?');
      params.push(categoria);
    }

    params.push(parseInt(limit));

    const [gastos] = await pool.execute(`
      SELECT 
        g.*,
        u.nombre as usuario_nombre
      FROM gastos g
      LEFT JOIN usuarios u ON g.usuario_registro = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY g.fecha_gasto DESC, g.created_at DESC
      LIMIT ?
    `, params);

    res.json(gastos);

  } catch (error) {
    console.error('❌ Error al obtener gastos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener gastos'
    });
  }
});

// POST - Crear nuevo gasto
router.post('/finanzas/gastos', async (req, res) => {
  try {
    const {
      categoria,
      subcategoria,
      descripcion,
      monto,
      metodo_pago,
      proveedor,
      numero_factura,
      fecha_gasto,
      es_recurrente
    } = req.body;

    // Validaciones
    if (!categoria || !descripcion || !monto || monto <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Categoría, descripción y monto son obligatorios'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO gastos (
        categoria, subcategoria, descripcion, monto, metodo_pago, 
        proveedor, numero_factura, fecha_gasto, es_recurrente, 
        usuario_registro, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      categoria,
      subcategoria || null,
      descripcion,
      monto,
      metodo_pago || 'efectivo',
      proveedor || null,
      numero_factura || null,
      fecha_gasto || new Date().toISOString().split('T')[0],
      es_recurrente || false,
      req.user?.id || null
    ]);

    console.log('✅ Gasto creado con ID:', result.insertId);
    res.status(201).json({
      success: true,
      message: 'Gasto registrado exitosamente',
      gastoId: result.insertId
    });

  } catch (error) {
    console.error('❌ Error al crear gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT - Actualizar gasto
router.put('/finanzas/gastos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoria,
      subcategoria,
      descripcion,
      monto,
      metodo_pago,
      proveedor,
      numero_factura,
      fecha_gasto,
      es_recurrente
    } = req.body;

    // Validaciones
    if (!categoria || !descripcion || !monto || monto <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Categoría, descripción y monto son obligatorios'
      });
    }

    // Verificar que el gasto existe
    const [existing] = await pool.execute(
      'SELECT id FROM gastos WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }

    await pool.execute(`
      UPDATE gastos 
      SET categoria = ?, subcategoria = ?, descripcion = ?, monto = ?, 
          metodo_pago = ?, proveedor = ?, numero_factura = ?, fecha_gasto = ?, 
          es_recurrente = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      categoria,
      subcategoria || null,
      descripcion,
      monto,
      metodo_pago || 'efectivo',
      proveedor || null,
      numero_factura || null,
      fecha_gasto,
      es_recurrente || false,
      id
    ]);

    console.log('✅ Gasto actualizado:', id);
    res.json({
      success: true,
      message: 'Gasto actualizado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al actualizar gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE - Eliminar gasto
router.delete('/finanzas/gastos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el gasto existe
    const [existing] = await pool.execute(
      'SELECT id FROM gastos WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }

    // Eliminar el gasto
    await pool.execute('DELETE FROM gastos WHERE id = ?', [id]);

    console.log('✅ Gasto eliminado:', id);
    res.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET - Reporte financiero detallado
router.get('/finanzas/reporte', async (req, res) => {
  try {
    const { 
      filtro = 'mes_actual', 
      fecha_inicio, 
      fecha_fin, 
      formato = 'json' 
    } = req.query;
    
    let whereClause = '';
    let params = [];
    
    // Determinar el rango de fechas según el filtro
    switch (filtro) {
      case 'mes_actual':
        whereClause = 'WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())';
        break;
      case 'trimestre':
        whereClause = 'WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
        break;
      case 'semestre':
        whereClause = 'WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)';
        break;
      case 'año':
        whereClause = 'WHERE YEAR(fecha) = YEAR(CURDATE())';
        break;
      case 'personalizado':
        if (fecha_inicio && fecha_fin) {
          whereClause = 'WHERE fecha >= ? AND fecha <= ?';
          params = [fecha_inicio + '-01', fecha_fin + '-31'];
        }
        break;
    }

    // Reporte consolidado por método de pago
    const [metodosPago] = await pool.execute(`
      SELECT 
        metodo_pago,
        SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
        SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as total_gastos,
        COUNT(CASE WHEN tipo = 'ingreso' THEN 1 END) as cantidad_ingresos,
        COUNT(CASE WHEN tipo = 'gasto' THEN 1 END) as cantidad_gastos
      FROM (
        SELECT metodo_pago, monto, fecha_servicio as fecha, 'ingreso' as tipo FROM ingresos WHERE estado = 'pagado'
        UNION ALL
        SELECT metodo_pago, monto, fecha_gasto as fecha, 'gasto' as tipo FROM gastos
      ) t
      ${whereClause}
      GROUP BY metodo_pago
      ORDER BY total_ingresos DESC
    `, params);

    // Reporte por categorías de gastos
    const [categoriasGastos] = await pool.execute(`
      SELECT 
        categoria,
        SUM(monto) as total,
        COUNT(*) as cantidad,
        AVG(monto) as promedio
      FROM gastos 
      ${whereClause.replace('fecha', 'fecha_gasto')}
      GROUP BY categoria
      ORDER BY total DESC
    `, params);

    // Reporte por tipos de servicio (ingresos)
    const [tiposServicio] = await pool.execute(`
      SELECT 
        tipo_servicio,
        SUM(monto) as total,
        COUNT(*) as cantidad,
        AVG(monto) as promedio
      FROM ingresos 
      ${whereClause.replace('fecha', 'fecha_servicio')} 
      AND estado = 'pagado'
      GROUP BY tipo_servicio
      ORDER BY total DESC
    `, params);

    // Flujo de efectivo mensual
    const [flujoMensual] = await pool.execute(`
      SELECT 
        DATE_FORMAT(fecha, '%Y-%m') as mes,
        SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as ingresos,
        SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as gastos,
        SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) as flujo_neto
      FROM (
        SELECT monto, fecha_servicio as fecha, 'ingreso' as tipo FROM ingresos WHERE estado = 'pagado'
        UNION ALL
        SELECT monto, fecha_gasto as fecha, 'gasto' as tipo FROM gastos
      ) t
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      ORDER BY mes DESC
      LIMIT 12
    `);

    const reporte = {
      periodo: {
        filtro,
        fecha_inicio: fecha_inicio || 'N/A',
        fecha_fin: fecha_fin || 'N/A',
        generado_en: new Date().toISOString()
      },
      resumen_metodos_pago: metodosPago,
      categorias_gastos: categoriasGastos,
      tipos_servicio: tiposServicio,
      flujo_mensual: flujoMensual.reverse() // Mostrar cronológicamente
    };

    // Si se solicita formato específico
    if (formato === 'csv') {
      // Aquí podrías implementar exportación a CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_financiero.csv"');
      // Implementar conversión a CSV...
      return res.json({ message: 'Exportación CSV en desarrollo' });
    }

    res.json(reporte);

  } catch (error) {
    console.error('❌ Error al generar reporte financiero:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte financiero'
    });
  }
});

module.exports = router;