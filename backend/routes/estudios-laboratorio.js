const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // ✅ CAMBIAR DE 'estudios-laboratorio' A 'estudios'
    const uploadPath = path.join(__dirname, '../uploads/estudios');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `estudio-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  }
});

// === OBTENER ESTUDIOS DE UN PACIENTE ===
router.get('/paciente/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    console.log('📋 Obteniendo estudios para paciente:', pacienteId);
    
    const query = `
      SELECT 
        id,
        paciente_id,
        doctor_id,
        tipo_estudio,
        descripcion,
        urgencia,
        laboratorio_recomendado,
        notas_medicas,
        ayunas_requerido,
        preparacion_especial,
        fecha_solicitud,
        fecha_realizacion,
        estado,
        archivo_resultado,
        created_at,
        updated_at
      FROM estudios_laboratorio 
      WHERE paciente_id = ? 
      ORDER BY fecha_solicitud DESC
    `;
    
    const [estudios] = await req.app.locals.db.execute(query, [pacienteId]);
    
    console.log(`✅ Encontrados ${estudios.length} estudios`);
    
    res.json(estudios);
    
  } catch (error) {
    console.error('❌ Error al obtener estudios:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// === CREAR NUEVO ESTUDIO ===
router.post('/', async (req, res) => {
  try {
    const {
      paciente_id,
      doctor_id,
      tipo_estudio,
      descripcion,
      urgencia = 'normal',
      laboratorio_recomendado,
      notas_medicas,
      ayunas_requerido = false,
      preparacion_especial,
      fecha_solicitud
    } = req.body;
    
    console.log('📝 Creando nuevo estudio:', req.body);
    
    // Validaciones
    if (!paciente_id || !tipo_estudio) {
      return res.status(400).json({
        error: 'Datos faltantes',
        message: 'paciente_id y tipo_estudio son requeridos'
      });
    }
    
    const query = `
      INSERT INTO estudios_laboratorio (
        paciente_id,
        doctor_id,
        tipo_estudio,
        descripcion,
        urgencia,
        laboratorio_recomendado,
        notas_medicas,
        ayunas_requerido,
        preparacion_especial,
        fecha_solicitud,
        estado,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW(), NOW())
    `;
    
    const [result] = await req.app.locals.db.execute(query, [
      paciente_id,
      doctor_id,
      tipo_estudio,
      descripcion,
      urgencia,
      laboratorio_recomendado,
      notas_medicas,
      ayunas_requerido ? 1 : 0,
      preparacion_especial,
      fecha_solicitud || new Date().toISOString().split('T')[0]
    ]);
    
    // Obtener el estudio creado
    const [nuevoEstudioRows] = await req.app.locals.db.execute(
      'SELECT * FROM estudios_laboratorio WHERE id = ?',
      [result.insertId]
    );
    const nuevoEstudio = nuevoEstudioRows[0];
    
    console.log('✅ Estudio creado:', nuevoEstudio);
    
    res.status(201).json(nuevoEstudio);
    
  } catch (error) {
    console.error('❌ Error al crear estudio:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// === SUBIR RESULTADO PDF ===
router.post('/:estudioId/resultado', upload.single('archivo'), async (req, res) => {
  try {
    const { estudioId } = req.params;
    const { fecha_realizacion } = req.body;
    
    console.log('📤 Subiendo resultado para estudio:', estudioId);
    console.log('📄 Archivo:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        error: 'Archivo requerido',
        message: 'Debes subir un archivo PDF'
      });
    }
    
    // Verificar que el estudio existe
    const [estudioRows] = await req.app.locals.db.execute(
      'SELECT * FROM estudios_laboratorio WHERE id = ?',
      [estudioId]
    );
    const estudio = estudioRows[0];
    
    if (!estudio) {
      // Eliminar archivo subido si el estudio no existe
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(404).json({
        error: 'Estudio no encontrado'
      });
    }
    
    // Construir URL del archivo
const archivoUrl = `/uploads/estudios/${req.file.filename}`;    
    // Actualizar estudio con el resultado
    const updateQuery = `
      UPDATE estudios_laboratorio 
      SET 
        archivo_resultado = ?,
        fecha_realizacion = ?,
        estado = 'completado',
        updated_at = NOW()
      WHERE id = ?
    `;
    
    await req.app.locals.db.execute(updateQuery, [
      archivoUrl,
      fecha_realizacion || new Date().toISOString().split('T')[0],
      estudioId
    ]);
    
    // Obtener estudio actualizado
    const [estudioActualizadoRows] = await req.app.locals.db.execute(
      'SELECT * FROM estudios_laboratorio WHERE id = ?',
      [estudioId]
    );
    const estudioActualizado = estudioActualizadoRows[0];
    
    console.log('✅ Resultado subido:', estudioActualizado);
    
    res.json({
      message: 'Resultado subido exitosamente',
      estudio: estudioActualizado,
      archivo: {
        nombre: req.file.originalname,
        ruta: archivoUrl,
        tamaño: req.file.size
      }
    });
    
  } catch (error) {
    console.error('❌ Error al subir resultado:', error);
    
    // Limpiar archivo en caso de error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// === OBTENER ESTUDIO ESPECÍFICO ===
router.get('/:estudioId', async (req, res) => {
  try {
    const { estudioId } = req.params;
    
    const [estudioRows] = await req.app.locals.db.execute(
      `SELECT 
        el.*,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as paciente_nombre,
        u.nombre as doctor_nombre
      FROM estudios_laboratorio el
      LEFT JOIN pacientes p ON el.paciente_id = p.id
      LEFT JOIN usuarios u ON el.doctor_id = u.id
      WHERE el.id = ?`,
      [estudioId]
    );
    const estudio = estudioRows[0];
    
    if (!estudio) {
      return res.status(404).json({
        error: 'Estudio no encontrado'
      });
    }
    
    res.json(estudio);
    
  } catch (error) {
    console.error('❌ Error al obtener estudio:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// === ACTUALIZAR ESTUDIO ===
router.put('/:estudioId', async (req, res) => {
  try {
    const { estudioId } = req.params;
    const {
      tipo_estudio,
      descripcion,
      urgencia,
      laboratorio_recomendado,
      notas_medicas,
      ayunas_requerido,
      preparacion_especial,
      estado
    } = req.body;
    
    console.log('✏️ Actualizando estudio:', estudioId, req.body);
    
    const query = `
      UPDATE estudios_laboratorio 
      SET 
        tipo_estudio = COALESCE(?, tipo_estudio),
        descripcion = COALESCE(?, descripcion),
        urgencia = COALESCE(?, urgencia),
        laboratorio_recomendado = COALESCE(?, laboratorio_recomendado),
        notas_medicas = COALESCE(?, notas_medicas),
        ayunas_requerido = COALESCE(?, ayunas_requerido),
        preparacion_especial = COALESCE(?, preparacion_especial),
        estado = COALESCE(?, estado),
        updated_at = NOW()
      WHERE id = ?
    `;
    
    const [result] = await req.app.locals.db.execute(query, [
      tipo_estudio,
      descripcion,
      urgencia,
      laboratorio_recomendado,
      notas_medicas,
      ayunas_requerido !== undefined ? (ayunas_requerido ? 1 : 0) : null,
      preparacion_especial,
      estado,
      estudioId
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Estudio no encontrado'
      });
    }
    
    // Obtener estudio actualizado
    const [estudioActualizadoRows] = await req.app.locals.db.execute(
      'SELECT * FROM estudios_laboratorio WHERE id = ?',
      [estudioId]
    );
    const estudioActualizado = estudioActualizadoRows[0];
    
    console.log('✅ Estudio actualizado:', estudioActualizado);
    
    res.json(estudioActualizado);
    
  } catch (error) {
    console.error('❌ Error al actualizar estudio:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// === ELIMINAR ESTUDIO ===
router.delete('/:estudioId', async (req, res) => {
  try {
    const { estudioId } = req.params;
    
    console.log('🗑️ Eliminando estudio:', estudioId);
    
    // Obtener estudio para eliminar archivo si existe
    const [estudioRows] = await req.app.locals.db.execute(
      'SELECT * FROM estudios_laboratorio WHERE id = ?',
      [estudioId]
    );
    const estudio = estudioRows[0];
    
    if (!estudio) {
      return res.status(404).json({
        error: 'Estudio no encontrado'
      });
    }
    
    // Eliminar archivo si existe
    if (estudio.archivo_resultado) {
      const archivoPath = path.join(__dirname, '..', estudio.archivo_resultado);
      await fs.unlink(archivoPath).catch(console.error);
    }
    
    // Eliminar registro de la base de datos
    await req.app.locals.db.execute('DELETE FROM estudios_laboratorio WHERE id = ?', [estudioId]);
    
    console.log('✅ Estudio eliminado');
    
    res.json({ message: 'Estudio eliminado exitosamente' });
    
  } catch (error) {
    console.error('❌ Error al eliminar estudio:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// === OBTENER ESTADÍSTICAS ===
router.get('/stats/resumen', async (req, res) => {
  try {
    const [statsRows] = await req.app.locals.db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
        SUM(CASE WHEN urgencia = 'alta' THEN 1 ELSE 0 END) as urgentes
      FROM estudios_laboratorio
    `);
    
    res.json(statsRows[0]);
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

module.exports = router;