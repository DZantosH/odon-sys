const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { pool } = require('../config/database');
const router = express.Router();

// ✅ VERIFICAR QUE POOL ESTÉ DISPONIBLE AL CARGAR EL MÓDULO
console.log('🔌 [CITAS] Verificando conexión pool:', pool ? '✅ Disponible' : '❌ No disponible');

// Middleware para verificar acceso
const verifyAccess = (req, res, next) => {
  const userRole = req.user?.rol;
  if (userRole === 'Administrador' || userRole === 'Doctor' || userRole === 'Secretaria') {
    next();
  } else {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requiere rol autorizado' 
    });
  }
};

// Middleware para verificar pool antes de cada request
const verifyPool = (req, res, next) => {
  if (!pool) {
    console.error('❌ [POOL] Pool de conexiones no disponible');
    return res.status(500).json({
      success: false,
      message: 'Error de configuración de base de datos',
      error: 'Pool de conexiones no disponible'
    });
  }
  next();
};

// 🆕 OBTENER CITAS DE HOY - ENDPOINT FALTANTE
router.get('/hoy', verifyToken, verifyAccess, verifyPool, async (req, res) => {
  try {
    console.log('📅 [CITAS HOY] ========================================');
    console.log('📅 [CITAS HOY] GET /citas/hoy - Obteniendo citas de hoy');
    console.log('📅 [CITAS HOY] Usuario:', req.user?.nombre, 'Rol:', req.user?.rol);
    
    const hoy = new Date().toISOString().split('T')[0];
    console.log('📆 [CITAS HOY] Fecha de hoy:', hoy);
    
    const query = `
      SELECT 
        c.id,
        c.fecha_cita,
        c.hora_cita,
        c.tipo_consulta,
        c.estado,
        c.observaciones,
        c.precio,
        
        -- Información del paciente
        COALESCE(
          CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')),
          c.nombre_paciente
        ) as paciente_nombre,
        
        p.telefono as paciente_telefono,
        p.matricula as paciente_matricula,
        
        -- Información del doctor
        CONCAT(u.nombre, ' ', u.apellido_paterno) as doctor_nombre,
        u.especialidad as doctor_especialidad,
        
        -- Información del tipo de consulta
        tc.nombre as tipo_consulta_nombre,
        tc.descripcion as tipo_consulta_descripcion
        
      FROM citas c
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      LEFT JOIN usuarios u ON c.doctor_id = u.id
      LEFT JOIN tipos_consulta tc ON c.tipo_consulta_id = tc.id
      WHERE c.fecha_cita = ?
      ORDER BY c.hora_cita ASC
    `;
    
    console.log('🔍 [CITAS HOY] Ejecutando query para citas de hoy...');
    const [citas] = await pool.execute(query, [hoy]);
    
    console.log('✅ [CITAS HOY] Citas encontradas:', citas.length);
    
    // Log de ejemplo para debug
    if (citas.length > 0) {
      console.log('📝 [CITAS HOY] Primera cita:', {
        id: citas[0].id,
        paciente: citas[0].paciente_nombre,
        hora: citas[0].hora_cita,
        tipo: citas[0].tipo_consulta
      });
    } else {
      console.log('📝 [CITAS HOY] No hay citas programadas para hoy');
    }
    
    const response = {
      success: true,
      fecha: hoy,
      total: citas.length,
      citas: citas
    };
    
    console.log('📤 [CITAS HOY] Enviando respuesta con', citas.length, 'citas');
    console.log('📅 [CITAS HOY] ========================================');
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ [CITAS HOY] ERROR COMPLETO:', error);
    console.error('❌ [CITAS HOY] Stack trace:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

// 📅 CREAR NUEVA CITA
router.post('/', verifyToken, verifyAccess, verifyPool, [
  body('nombre_paciente').notEmpty().withMessage('Nombre del paciente es requerido'),
  body('edad_paciente').optional().isInt({ min: 1, max: 150 }).withMessage('Edad debe ser entre 1 y 150 años'),
  body('fecha_consulta').isDate().withMessage('Fecha válida requerida'),
  body('horario_consulta').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horario válido requerido'),
  body('doctor_id').isInt({ min: 1 }).withMessage('Doctor válido requerido')
], async (req, res) => {
  try {
    console.log('📅 [CITAS] ========================================');
    console.log('📅 [CITAS] POST /citas - Creando nueva cita');
    console.log('📅 [CITAS] Usuario:', req.user?.nombre, 'Rol:', req.user?.rol);
    console.log('📅 [CITAS] Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ [CITAS] Errores de validación:', errors.array());
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: 'Datos de entrada inválidos'
      });
    }

    const {
      paciente_id,
      nombre_paciente,
      edad_paciente,
      telefono_temporal,
      tipo_consulta,
      tipo_consulta_id,
      fecha_consulta,
      horario_consulta,
      doctor_id,
      observaciones,
      precio,
      es_temporal
    } = req.body;

    let pacienteIdFinal = paciente_id;
    let pacienteTemporal = false;
    
    // Crear paciente temporal si es necesario
    if (!paciente_id || es_temporal) {
      console.log('🆕 [CITAS] Creando paciente temporal');
      
      const nombrePartes = nombre_paciente.trim().split(' ');
      const nombre = nombrePartes[0] || '';
      const apellidoPaterno = nombrePartes.slice(1).join(' ') || 'Temporal';
      
      // Calcular fecha de nacimiento si se proporciona edad
      let fechaNacimientoStr = null;
      if (edad_paciente) {
        const fechaNacimientoAprox = new Date();
        fechaNacimientoAprox.setFullYear(fechaNacimientoAprox.getFullYear() - edad_paciente);
        fechaNacimientoStr = fechaNacimientoAprox.toISOString().split('T')[0];
      }
      
      try {
        const insertPacienteQuery = `
          INSERT INTO pacientes (
            nombre, apellido_paterno, apellido_materno, fecha_nacimiento,
            sexo, telefono, estado, activo, creado_por
          ) VALUES (?, ?, NULL, ?, 'M', ?, 'Temporal', 1, ?)
        `;
        
        const [resultPaciente] = await pool.execute(insertPacienteQuery, [
          nombre,
          apellidoPaterno,
          fechaNacimientoStr,
          telefono_temporal || null,
          req.user?.id || null
        ]);
        
        pacienteIdFinal = resultPaciente.insertId;
        pacienteTemporal = true;
        
        console.log('✅ [CITAS] Paciente temporal creado con ID:', pacienteIdFinal);
      } catch (pacienteError) {
        console.error('❌ [CITAS] Error al crear paciente temporal:', pacienteError);
        return res.status(500).json({
          success: false,
          message: 'Error al crear paciente temporal'
        });
      }
    }

    // Verificar doctor
    const [doctorCheck] = await pool.execute(
      'SELECT id, nombre, apellido_paterno FROM usuarios WHERE id = ? AND rol = "Doctor" AND activo = 1',
      [doctor_id]
    );

    if (doctorCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado o inactivo'
      });
    }

    const doctor = doctorCheck[0];

    // Verificar disponibilidad de horario
    const [conflictoHorario] = await pool.execute(`
      SELECT id FROM citas 
      WHERE doctor_id = ? AND fecha_cita = ? AND hora_cita = ? 
      AND estado NOT IN ('Cancelada', 'No_Asistio')
    `, [doctor_id, fecha_consulta, horario_consulta]);

    if (conflictoHorario.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El doctor ya tiene una cita programada en ese horario'
      });
    }

    // Insertar cita
    const insertQuery = `
      INSERT INTO citas (
        paciente_id, doctor_id, fecha_cita, hora_cita, 
        tipo_cita, tipo_consulta_id, estado, observaciones, precio,
        fecha_creacion
      ) VALUES (?, ?, ?, ?, ?, ?, 'Programada', ?, ?, NOW())
    `;

    // Preparar observaciones
    let observacionesFinales = observaciones || '';
    if (edad_paciente) {
      const infoEdad = `Edad: ${edad_paciente} años`;
      observacionesFinales = observacionesFinales ? 
        `${observacionesFinales}\n${infoEdad}` : 
        infoEdad;
    }

    const insertValues = [
      pacienteIdFinal,
      doctor_id,
      fecha_consulta,
      horario_consulta,
      tipo_consulta || 'Consulta',
      tipo_consulta_id || null,
      observacionesFinales.trim(),
      parseFloat(precio) || 0
    ];

    console.log('🔧 [CITAS] Insertando cita...');
    const [result] = await pool.execute(insertQuery, insertValues);
    
    console.log('✅ [CITAS] Cita creada exitosamente con ID:', result.insertId);

    const response = {
      success: true,
      message: 'Cita agendada exitosamente',
      citaId: result.insertId,
      paciente_id: pacienteIdFinal,
      paciente: nombre_paciente,
      edad: edad_paciente,
      doctor: `Dr. ${doctor.nombre} ${doctor.apellido_paterno}`,
      fecha: fecha_consulta,
      hora: horario_consulta,
      tipo: tipo_consulta,
      precio: parseFloat(precio) || 0.00,
      pacienteTemporal: pacienteTemporal
    };

    console.log('📤 [CITAS] Enviando respuesta exitosa');
    res.status(201).json(response);

  } catch (error) {
    console.error('❌ [CITAS] ERROR COMPLETO:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear la cita',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

// 📅 OBTENER HISTORIAL DE CITAS POR PACIENTE
router.get('/paciente/:pacienteId', verifyToken, verifyAccess, verifyPool, async (req, res) => {
  try {
    const { pacienteId } = req.params;
    console.log('📅 [HISTORIAL-CITAS] Obteniendo historial para paciente:', pacienteId);
    
    if (!pacienteId || isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }
    
    const query = `
      SELECT 
        c.id,
        c.fecha_cita,
        c.hora_cita,
        c.tipo_cita,
        c.estado,
        c.observaciones,
        c.precio,
        c.fecha_creacion,
        c.fecha_actualizacion,
        
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) as doctor_nombre_completo,
        u.especialidad as doctor_especialidad,
        
        tc.nombre as tipo_consulta_nombre,
        tc.descripcion as tipo_consulta_descripcion,
        tc.precio as tipo_consulta_precio,
        
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as paciente_nombre_completo
        
      FROM citas c
      LEFT JOIN usuarios u ON c.doctor_id = u.id
      LEFT JOIN tipos_consulta tc ON c.tipo_consulta_id = tc.id
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.paciente_id = ?
      ORDER BY c.fecha_cita DESC, c.hora_cita DESC
    `;
    
    console.log('🔍 [HISTORIAL-CITAS] Ejecutando query...');
    const [citas] = await pool.execute(query, [pacienteId]);
    
    console.log('✅ [HISTORIAL-CITAS] Citas encontradas:', citas.length);
    
    res.json({
      success: true,
      data: citas,
      paciente_id: parseInt(pacienteId),
      total: citas.length,
      estadisticas: {
        completadas: citas.filter(c => c.estado?.toLowerCase() === 'completada').length,
        programadas: citas.filter(c => ['programada', 'confirmada'].includes(c.estado?.toLowerCase())).length,
        canceladas: citas.filter(c => ['cancelada', 'no_asistio'].includes(c.estado?.toLowerCase())).length
      }
    });
    
  } catch (error) {
    console.error('❌ [HISTORIAL-CITAS] Error completo:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de citas',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

// 📋 OBTENER CITAS
router.get('/', verifyToken, verifyAccess, verifyPool, async (req, res) => {
  try {
    console.log('📋 [CITAS] GET /citas - Obteniendo citas');
    
    const { fecha, doctor_id, paciente_id } = req.query;
    
    let query = `
      SELECT 
        c.*,
        COALESCE(
          CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')),
          c.nombre_paciente
        ) as paciente_nombre_completo,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as doctor_nombre_completo,
        tc.nombre as tipo_consulta_nombre,
        tc.descripcion as tipo_consulta_descripcion
      FROM citas c
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      LEFT JOIN usuarios u ON c.doctor_id = u.id
      LEFT JOIN tipos_consulta tc ON c.tipo_consulta_id = tc.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (fecha) {
      query += ' AND c.fecha_cita = ?';
      queryParams.push(fecha);
    }
    
    if (doctor_id) {
      query += ' AND c.doctor_id = ?';
      queryParams.push(doctor_id);
    }
    
    if (paciente_id) {
      query += ' AND c.paciente_id = ?';
      queryParams.push(paciente_id);
    }
    
    query += ' ORDER BY c.fecha_cita DESC, c.hora_cita ASC';
    
    const [citas] = await pool.execute(query, queryParams);
    
    console.log('✅ [CITAS] Citas encontradas:', citas.length);
    
    res.json({
      success: true,
      data: citas,
      total: citas.length
    });
    
  } catch (error) {
    console.error('❌ [CITAS] Error al obtener citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas'
    });
  }
});

// 📅 OBTENER CITAS DEL MES PARA CALENDARIO
router.get('/mes/:year/:month', verifyToken, verifyAccess, verifyPool, async (req, res) => {
  try {
    const { year, month } = req.params;
    console.log(`📅 [CALENDARIO] Obteniendo citas para ${month}/${year}`);
    
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);
    
    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        message: 'Año y mes deben ser números válidos'
      });
    }
    
    const primerDia = `${year}-${month.padStart(2, '0')}-01`;
    const ultimoDiaDelMes = new Date(yearInt, monthInt, 0).getDate();
    const ultimoDia = `${year}-${month.padStart(2, '0')}-${ultimoDiaDelMes.toString().padStart(2, '0')}`;
    
    const query = `
      SELECT 
        c.id,
        c.fecha_cita,
        c.hora_cita,
        c.tipo_cita,
        c.estado,
        c.observaciones,
        c.precio,
        COALESCE(
          CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')),
          c.nombre_paciente
        ) as paciente_nombre,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as doctor_nombre,
        tc.nombre as tipo_consulta_nombre
      FROM citas c
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      LEFT JOIN usuarios u ON c.doctor_id = u.id
      LEFT JOIN tipos_consulta tc ON c.tipo_consulta_id = tc.id
      WHERE c.fecha_cita >= ? AND c.fecha_cita <= ?
      AND c.estado NOT IN ('Cancelada', 'No_Asistio')
      ORDER BY c.fecha_cita, c.hora_cita
    `;
    
    const [citas] = await pool.execute(query, [primerDia, ultimoDia]);
    
    console.log(`✅ [CALENDARIO] Encontradas ${citas.length} citas válidas`);
    
    res.json(citas);
    
  } catch (error) {
    console.error('❌ [CALENDARIO] ERROR COMPLETO:', error);
    
    res.status(500).json({
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno',
      success: false
    });
  }
});

// 📅 OBTENER CITAS POR FECHA ESPECÍFICA - ✅ CORREGIDO
router.get('/fecha/:fecha', verifyToken, verifyAccess, verifyPool, async (req, res) => {
  try {
    const { fecha } = req.params;
    console.log('📅 [CITAS] Obteniendo citas para fecha:', fecha);
    
    const query = `
      SELECT 
        c.id,
        c.paciente_id,
        c.fecha_cita,
        c.hora_cita,
        c.tipo_consulta,
        c.estado,
        c.observaciones,
        c.precio,
        c.doctor_id,
        c.tipo_consulta_id,
        
        p.nombre as paciente_nombre,
        p.apellido_paterno as paciente_apellido,
        p.apellido_materno as paciente_apellido_materno,
        p.telefono as paciente_telefono,
        p.correo_electronico as paciente_email,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as paciente_nombre_completo,
        
        d.nombre as doctor_nombre,
        d.apellido_paterno as doctor_apellido,
        d.apellido_materno as doctor_apellido_materno,
        CONCAT(d.nombre, ' ', d.apellido_paterno, ' ', COALESCE(d.apellido_materno, '')) as doctor_nombre_completo,
        
        tc.nombre as tipo_consulta_nombre,
        tc.precio as tipo_consulta_precio
        
      FROM citas c
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      LEFT JOIN usuarios d ON c.doctor_id = d.id  
      LEFT JOIN tipos_consulta tc ON c.tipo_consulta_id = tc.id
      WHERE DATE(c.fecha_cita) = ?
      ORDER BY c.hora_cita ASC
    `;
    
    console.log('🔍 [DEBUG] Ejecutando consulta SQL con pool');
    const [citas] = await pool.execute(query, [fecha]);
    
    console.log('✅ [CITAS] Citas encontradas para', fecha, ':', citas.length);
    
    res.json({
      success: true,
      data: citas,
      count: citas.length,
      fecha: fecha
    });
    
  } catch (error) {
    console.error('❌ [CITAS] Error al obtener citas por fecha:', error);
    console.error('❌ [CITAS] Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas',
      error: error.message
    });
  }
});

// 🔄 ACTUALIZAR ESTADO DE CITA
router.put('/:id/estado', verifyToken, verifyAccess, verifyPool, [
  body('estado').isIn(['Programada', 'Confirmada', 'En_Proceso', 'Completada', 'Cancelada', 'No_Asistio'])
    .withMessage('Estado inválido')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    
    const [result] = await pool.execute(
      'UPDATE citas SET estado = ?, fecha_actualizacion = NOW() WHERE id = ?',
      [estado, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }
    
    console.log('✅ [CITAS] Estado actualizado para cita ID:', id, 'Nuevo estado:', estado);
    
    res.json({
      success: true,
      message: 'Estado de cita actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ [CITAS] Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de cita'
    });
  }
});

// POST /api/citas/verificar-vencidas - ✅ COMPLETAMENTE CORREGIDO
router.post('/verificar-vencidas', verifyToken, verifyAccess, verifyPool, async (req, res) => {
  try {
    console.log('🔄 [VERIFICAR-VENCIDAS] Iniciando verificación...');
    
    const ahora = new Date();
    const haceMasDeUnaHora = new Date(ahora.getTime() - (60 * 60 * 1000));
    
    // ✅ CAMBIO: NO MODIFICAR observaciones, solo actualizar estado
    const query = `
      UPDATE citas 
      SET estado = 'No_Asistio', 
          fecha_actualizacion = NOW()
      WHERE estado IN ('Programada', 'Confirmada')
      AND CONCAT(fecha_cita, ' ', hora_cita) < ?
      AND fecha_cita = CURDATE()
    `;
    
    const fechaLimite = haceMasDeUnaHora.toISOString().slice(0, 19).replace('T', ' ');
    
    const [result] = await pool.execute(query, [fechaLimite]);
    
    console.log(`🔄 [VERIFICAR-VENCIDAS] ${result.affectedRows} citas actualizadas`);
    
    res.json({
      success: true,
      citasActualizadas: result.affectedRows,
      mensaje: `${result.affectedRows} citas actualizadas automáticamente`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [VERIFICAR-VENCIDAS] Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error al verificar citas vencidas',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// 🧪 ENDPOINTS DE DEBUG - ✅ CORREGIDOS
router.get('/debug/test-connection', verifyToken, verifyAccess, verifyPool, async (req, res) => {
  try {
    console.log('🧪 [DEBUG] Probando conexión a BD...');
    
    const [result] = await pool.execute('SELECT COUNT(*) as total FROM citas WHERE DATE(fecha_cita) = ?', ['2025-06-26']);
    
    console.log('✅ [DEBUG] Conexión exitosa, citas del 26/06:', result[0].total);
    
    res.json({
      success: true,
      message: 'Conexión exitosa',
      citas_26_junio: result[0].total,
      fecha_actual: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [DEBUG] Error de conexión:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/debug/citas-raw', verifyToken, verifyAccess, verifyPool, async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Obteniendo citas raw...');
    
    const [citas] = await pool.execute(`
      SELECT 
        c.id,
        c.paciente_id,
        c.fecha_cita,
        c.hora_cita,
        c.estado,
        p.nombre,
        p.apellido_paterno
      FROM citas c
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      WHERE DATE(c.fecha_cita) = '2025-06-26'
      LIMIT 5
    `);
    
    console.log('📋 [DEBUG] Citas raw encontradas:', citas.length);
    
    res.json({
      success: true,
      data: citas,
      count: citas.length
    });
    
  } catch (error) {
    console.error('❌ [DEBUG] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🗑️ CANCELAR CITA
router.delete('/:id', verifyToken, verifyAccess, verifyPool, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'UPDATE citas SET estado = "Cancelada", fecha_actualizacion = NOW() WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }
    
    console.log('✅ [CITAS] Cita cancelada ID:', id);
    
    res.json({
      success: true,
      message: 'Cita cancelada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ [CITAS] Error al cancelar cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar cita'
    });
  }
});

// 🤖 FUNCIÓN PARA ACTUALIZAR ESTADOS AUTOMÁTICAMENTE
const actualizarEstadosAutomaticos = async () => {
  try {
    const ahora = new Date();
    const hace2Horas = new Date(ahora.getTime() - (2 * 60 * 60 * 1000));
    
    console.log('🤖 [AUTO-UPDATE] Verificando citas para marcar como "No Asistió"...');
    
    // ✅ CAMBIO: NO MODIFICAR observaciones, solo actualizar estado
    const queryNoAsistio = `
      UPDATE citas 
      SET estado = 'No_Asistio', 
          fecha_actualizacion = NOW()
      WHERE estado IN ('Programada', 'Confirmada')
      AND fecha_cita = CURDATE()
      AND CONCAT(fecha_cita, ' ', hora_cita) < ?
    `;
    
    const fechaLimite = hace2Horas.toISOString().slice(0, 19).replace('T', ' ');
    
    const [result] = await pool.execute(queryNoAsistio, [fechaLimite]);
    
    if (result.affectedRows > 0) {
      console.log(`✅ [AUTO-UPDATE] ${result.affectedRows} citas marcadas como "No Asistió" automáticamente`);
      
      const [citasActualizadas] = await pool.execute(`
        SELECT 
          c.id, c.fecha_cita, c.hora_cita, c.estado,
          COALESCE(
            CONCAT(p.nombre, ' ', p.apellido_paterno),
            c.nombre_paciente
          ) as paciente_nombre
        FROM citas c
        LEFT JOIN pacientes p ON c.paciente_id = p.id
        WHERE c.estado = 'No_Asistio' 
        AND c.fecha_actualizacion >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        ORDER BY c.fecha_actualizacion DESC
        LIMIT 10
      `);
      
      console.log('📋 [AUTO-UPDATE] Citas marcadas como "No Asistió":');
      citasActualizadas.forEach((cita, index) => {
        console.log(`   ${index + 1}. ID: ${cita.id} - ${cita.paciente_nombre} - ${cita.fecha_cita} ${cita.hora_cita}`);
      });
    } else {
      console.log('ℹ️ [AUTO-UPDATE] No hay citas que requieran actualización a "No Asistió"');
    }
    
    return { 
      citasNoAsistio: result.affectedRows,
      fecha_actualizacion: new Date().toISOString(),
      criterios: {
        fecha_limite: fechaLimite,
        retraso_minimo: '2 horas'
      }
    };
    
  } catch (error) {
    console.error('❌ [AUTO-UPDATE] Error completo:', error);
    return { 
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};


// 🔄 ENDPOINT PARA ACTUALIZACIÓN MANUAL
router.post('/actualizar-estados', verifyToken, verifyAccess, verifyPool, async (req, res) => {
  try {
    console.log('🔄 [ENDPOINT-AUTO-UPDATE] Ejecutando actualización de estados...');
    
    const resultado = await actualizarEstadosAutomaticos();
    
    const response = {
      success: true,
      message: 'Estados de citas actualizados automáticamente',
      resultado: resultado,
      timestamp: new Date().toISOString(),
      usuario: req.user?.nombre
    };
    
    console.log('📤 [ENDPOINT-AUTO-UPDATE] Enviando respuesta:', response);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ [ENDPOINT-AUTO-UPDATE] ERROR COMPLETO:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estados de citas',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// 🔍 ENDPOINT PARA VERIFICAR ESTADOS (DEBUGGING)
router.get('/verificar-estados', verifyToken, verifyAccess, verifyPool, async (req, res) => {
  try {
    console.log('🔍 [VERIFICAR-ESTADOS] Verificando estados de citas...');
    
    const ahora = new Date();
    const fechaActual = ahora.toISOString().split('T')[0];
    const horaActual = ahora.toTimeString().split(' ')[0].substring(0, 5);
    
    const [citasPendientes] = await pool.execute(`
      SELECT 
        c.id, c.fecha_cita, c.hora_cita, c.estado,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as paciente_nombre,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as doctor_nombre
      FROM citas c
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      LEFT JOIN usuarios u ON c.doctor_id = u.id
      WHERE c.estado IN ('Programada', 'Confirmada', 'En_Proceso')
      AND (
        c.fecha_cita < ? 
        OR (c.fecha_cita = ? AND c.hora_cita <= ?)
      )
      ORDER BY c.fecha_cita DESC, c.hora_cita DESC
      LIMIT 20
    `, [fechaActual, fechaActual, horaActual]);
    
    const [estadisticas] = await pool.execute(`
      SELECT 
        estado,
        COUNT(*) as cantidad,
        DATE(fecha_cita) as fecha
      FROM citas 
      WHERE fecha_cita >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY estado, DATE(fecha_cita)
      ORDER BY fecha DESC, estado
    `);
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      criterios_actualizacion: {
        fecha_actual: fechaActual,
        hora_actual: horaActual
      },
      citas_que_deberian_estar_completadas: citasPendientes,
      estadisticas_ultimos_7_dias: estadisticas,
      total_pendientes_actualizacion: citasPendientes.length
    };
    
    console.log('✅ [VERIFICAR-ESTADOS] Respuesta preparada:', {
      citasPendientes: citasPendientes.length,
      estadisticas: estadisticas.length
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ [VERIFICAR-ESTADOS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar estados',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

// 🔄 ACTUALIZAR CITA COMPLETA (REAGENDAR)
router.put('/:id', verifyToken, verifyAccess, verifyPool, [
  body('fecha_cita').optional().isDate().withMessage('Fecha válida requerida'),
  body('hora_cita').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horario válido requerido'),
  body('estado').optional().isIn(['Programada', 'Confirmada', 'En_Proceso', 'Completada', 'Cancelada', 'No_Asistio', 'Reagendada'])
    .withMessage('Estado inválido')
], async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔄 [CITAS] PUT /citas/:id - Actualizando cita ID:', id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: 'Datos de entrada inválidos'
      });
    }

    // Verificar que la cita existe
    const [citaExistente] = await pool.execute(
      'SELECT * FROM citas WHERE id = ?',
      [id]
    );

    if (citaExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    const cita = citaExistente[0];
    const {
      fecha_cita,
      hora_cita,
      estado,
      observaciones,
      tipo_consulta_id,
      precio,
      notas
    } = req.body;

    // Verificar disponibilidad de horario si se cambia fecha/hora
    if ((fecha_cita && fecha_cita !== cita.fecha_cita) || 
        (hora_cita && hora_cita !== cita.hora_cita)) {
      
      const nuevaFecha = fecha_cita || cita.fecha_cita;
      const nuevaHora = hora_cita || cita.hora_cita;
      
      const [conflictoHorario] = await pool.execute(`
        SELECT id, nombre_paciente FROM citas 
        WHERE doctor_id = ? AND fecha_cita = ? AND hora_cita = ? 
        AND id != ? AND estado NOT IN ('Cancelada', 'No_Asistio')
      `, [cita.doctor_id, nuevaFecha, nuevaHora, id]);

      if (conflictoHorario.length > 0) {
        return res.status(409).json({
          success: false,
          message: `El doctor ya tiene una cita programada en ese horario`,
          conflicto: conflictoHorario[0]
        });
      }
    }

    // Preparar campos para actualizar
    const camposActualizar = [];
    const valoresActualizar = [];

    if (fecha_cita && fecha_cita !== cita.fecha_cita) {
      camposActualizar.push('fecha_cita = ?');
      valoresActualizar.push(fecha_cita);
    }

    if (hora_cita && hora_cita !== cita.hora_cita) {
      camposActualizar.push('hora_cita = ?');
      valoresActualizar.push(hora_cita);
    }

    if (estado && estado !== cita.estado) {
      camposActualizar.push('estado = ?');
      valoresActualizar.push(estado);
    }

    if (tipo_consulta_id && tipo_consulta_id !== cita.tipo_consulta_id) {
      camposActualizar.push('tipo_consulta_id = ?');
      valoresActualizar.push(tipo_consulta_id);
    }

    if (precio !== undefined && parseFloat(precio) !== parseFloat(cita.precio)) {
      camposActualizar.push('precio = ?');
      valoresActualizar.push(parseFloat(precio));
    }

    // Combinar observaciones existentes con nuevas notas
    if (observaciones || notas) {
      const observacionesActuales = cita.observaciones || '';
      const notasNuevas = observaciones || notas || '';
      
      let observacionesFinales = observacionesActuales;
      
      if (notasNuevas && !observacionesActuales.includes(notasNuevas)) {
        const timestamp = new Date().toLocaleString('es-MX');
        observacionesFinales = observacionesActuales 
          ? `${observacionesActuales}\n\n[${timestamp}] ${notasNuevas}`
          : `[${timestamp}] ${notasNuevas}`;
      }
      
      if (observacionesFinales !== observacionesActuales) {
        camposActualizar.push('observaciones = ?');
        valoresActualizar.push(observacionesFinales);
      }
    }

    // Siempre actualizar fecha de modificación
    camposActualizar.push('fecha_actualizacion = NOW()');

    if (camposActualizar.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    // Ejecutar actualización
    const updateQuery = `UPDATE citas SET ${camposActualizar.join(', ')} WHERE id = ?`;
    valoresActualizar.push(id);

    const [result] = await pool.execute(updateQuery, valoresActualizar);
    
    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo actualizar la cita'
      });
    }

    // Obtener cita actualizada para respuesta
    const [citaActualizada] = await pool.execute(`
      SELECT 
        c.*,
        COALESCE(
          CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')),
          c.nombre_paciente
        ) as paciente_nombre_completo,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as doctor_nombre_completo,
        tc.nombre as tipo_consulta_nombre
      FROM citas c
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      LEFT JOIN usuarios u ON c.doctor_id = u.id
      LEFT JOIN tipos_consulta tc ON c.tipo_consulta_id = tc.id
      WHERE c.id = ?
    `, [id]);

    const citaFinal = citaActualizada[0];
    
    console.log('✅ [CITAS] Cita actualizada exitosamente:', citaFinal.id);

    const response = {
      success: true,
      message: 'Cita actualizada exitosamente',
      data: citaFinal,
      cambios_realizados: {
        fecha_anterior: cita.fecha_cita,
        fecha_nueva: citaFinal.fecha_cita,
        hora_anterior: cita.hora_cita,
        hora_nueva: citaFinal.hora_cita,
        estado_anterior: cita.estado,
        estado_nuevo: citaFinal.estado
      }
    };
    
    res.json(response);

  } catch (error) {
    console.error('❌ [CITAS] ERROR al actualizar:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar la cita',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

console.log('🚀 [CITAS] Módulo de citas cargado correctamente con pool verificado');

module.exports = router;