// backend/routes/radiografias.js - VERSIÓN CORREGIDA para mysql2/promise
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database'); // Importar el pool correctamente
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/radiografias/');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `radiografia-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|dcm|dicom/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype === 'application/dicom' || 
                     file.mimetype === 'application/pdf';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes, PDFs y archivos DICOM'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

// GET /api/radiografias/paciente/:id - Obtener radiografías de un paciente
router.get('/paciente/:id', async (req, res) => {
  try {
    const pacienteId = req.params.id;
    console.log('📸 Obteniendo radiografías para paciente:', pacienteId);

    const query = `
      SELECT 
        r.*,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as doctor_nombre
      FROM radiografias r
      LEFT JOIN usuarios u ON r.doctor_id = u.id
      WHERE r.paciente_id = ? AND r.activo = 1
      ORDER BY 
        CASE 
          WHEN r.fecha_solicitud IS NOT NULL THEN r.fecha_solicitud
          WHEN r.created_at IS NOT NULL THEN DATE(r.created_at)
          ELSE r.fecha_creacion
        END DESC
    `;

    const [results] = await pool.execute(query, [pacienteId]);
    
    console.log('✅ Radiografías encontradas:', results.length);
    res.json(results);

  } catch (error) {
    console.error('❌ Error al obtener radiografías:', error);
    res.status(500).json({
      error: 'Error al obtener radiografías',
      message: error.message
    });
  }
});

// POST /api/radiografias - Crear nueva solicitud de radiografía
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creando nueva radiografía:', req.body);

    const {
      paciente_id,
      doctor_id,
      tipo_radiografia,
      zona_anatomica,
      urgencia = 'normal',
      centro_radiologico,
      motivo_estudio,
      hallazgos_clinicos,
      instrucciones_especiales,
      fecha_solicitud
    } = req.body;

    // Validaciones
    if (!paciente_id || !doctor_id || !tipo_radiografia) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'paciente_id, doctor_id y tipo_radiografia son requeridos'
      });
    }

    const query = `
      INSERT INTO radiografias (
        paciente_id,
        doctor_id,
        tipo_radiografia,
        zona_anatomica,
        urgencia,
        centro_radiologico,
        motivo_estudio,
        hallazgos_clinicos,
        instrucciones_especiales,
        fecha_solicitud,
        estado,
        activo,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', 1, NOW(), NOW())
    `;

    const [result] = await pool.execute(query, [
      paciente_id,
      doctor_id,
      tipo_radiografia,
      zona_anatomica,
      urgencia,
      centro_radiologico,
      motivo_estudio,
      hallazgos_clinicos,
      instrucciones_especiales,
      fecha_solicitud || new Date().toISOString().split('T')[0]
    ]);

    // Obtener la radiografía creada
    const selectQuery = 'SELECT * FROM radiografias WHERE id = ?';
    const [selectResults] = await pool.execute(selectQuery, [result.insertId]);

    console.log('✅ Radiografía creada exitosamente:', result.insertId);
    res.status(201).json(selectResults[0]);

  } catch (error) {
    console.error('❌ Error al crear radiografía:', error);
    res.status(500).json({
      error: 'Error al crear radiografía',
      message: error.message
    });
  }
});

// POST /api/radiografias/:id/imagen - Subir imagen de radiografía
router.post('/:id/imagen', upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'archivo', maxCount: 1 }
]), async (req, res) => {
  try {
    const radiografiaId = req.params.id;
    
    const file = req.files?.imagen?.[0] || req.files?.archivo?.[0];
    
    console.log('📤 Intentando subir imagen para radiografía:', radiografiaId);
    console.log('📁 Archivo recibido:', file ? file.filename : 'No hay archivo');
    console.log('📋 Files object:', req.files);
    console.log('📋 Body recibido:', req.body);
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó imagen',
        message: 'Debe seleccionar un archivo de imagen'
      });
    }

    const archivoPath = `/uploads/radiografias/${file.filename}`;
    const fechaRealizacion = req.body.fecha_realizacion || new Date().toISOString().split('T')[0];

    console.log('💾 Guardando en BD:', {
      archivo: archivoPath,
      fecha: fechaRealizacion,
      radiografia_id: radiografiaId
    });

    const query = `
      UPDATE radiografias 
      SET 
        archivo_imagen = ?,
        fecha_realizacion = ?,
        estado = 'completada',
        updated_at = NOW()
      WHERE id = ? AND activo = 1
    `;

    const [result] = await pool.execute(query, [archivoPath, fechaRealizacion, radiografiaId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Radiografía no encontrada',
        message: `No se encontró la radiografía con ID ${radiografiaId}`
      });
    }

    // Obtener la radiografía actualizada
    const selectQuery = 'SELECT * FROM radiografias WHERE id = ?';
    const [selectResults] = await pool.execute(selectQuery, [radiografiaId]);

    console.log('✅ Imagen subida y BD actualizada exitosamente');
    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      radiografia: selectResults[0],
      archivo: archivoPath,
      archivo_url: `${req.protocol}://${req.get('host')}${archivoPath}`
    });

  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      error: 'Error al subir imagen',
      message: error.message
    });
  }
});

// ✅ NUEVO: POST /api/radiografias/:id/archivo - Endpoint alternativo
router.post('/:id/archivo', upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'archivo', maxCount: 1 }
]), async (req, res) => {
  try {
    const radiografiaId = req.params.id;
    
    const file = req.files?.imagen?.[0] || req.files?.archivo?.[0];
    
    console.log('📤 [ARCHIVO] Intentando subir archivo para radiografía:', radiografiaId);
    console.log('📁 [ARCHIVO] Archivo recibido:', file ? file.filename : 'No hay archivo');
    console.log('📋 [ARCHIVO] Files object:', req.files);
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó archivo',
        message: 'Debe seleccionar un archivo'
      });
    }

    const archivoPath = `/uploads/radiografias/${file.filename}`;
    const fechaRealizacion = req.body.fecha_realizacion || new Date().toISOString().split('T')[0];

    const query = `
      UPDATE radiografias 
      SET 
        archivo_imagen = ?,
        fecha_realizacion = ?,
        estado = 'completada',
        updated_at = NOW()
      WHERE id = ? AND activo = 1
    `;

    const [result] = await pool.execute(query, [archivoPath, fechaRealizacion, radiografiaId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Radiografía no encontrada',
        message: `No se encontró la radiografía con ID ${radiografiaId}`
      });
    }

    // Obtener la radiografía actualizada
    const selectQuery = 'SELECT * FROM radiografias WHERE id = ?';
    const [selectResults] = await pool.execute(selectQuery, [radiografiaId]);

    console.log('✅ [ARCHIVO] Archivo subido y BD actualizada exitosamente');
    res.json({
      success: true,
      message: 'Archivo subido exitosamente',
      radiografia: selectResults[0],
      archivo: archivoPath,
      archivo_url: `${req.protocol}://${req.get('host')}${archivoPath}`
    });

  } catch (error) {
    console.error('❌ [ARCHIVO] Error al subir archivo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al subir archivo',
      message: error.message
    });
  }
});

// GET /api/radiografias/:id - Obtener una radiografía específica
router.get('/:id', async (req, res) => {
  try {
    const radiografiaId = req.params.id;

    const query = `
      SELECT 
        r.*,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as doctor_nombre,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as paciente_nombre
      FROM radiografias r
      LEFT JOIN usuarios u ON r.doctor_id = u.id
      LEFT JOIN pacientes p ON r.paciente_id = p.id
      WHERE r.id = ? AND r.activo = 1
    `;

    const [results] = await pool.execute(query, [radiografiaId]);

    if (results.length === 0) {
      return res.status(404).json({
        error: 'Radiografía no encontrada',
        message: `No se encontró la radiografía con ID ${radiografiaId}`
      });
    }

    res.json(results[0]);

  } catch (error) {
    console.error('❌ Error al obtener radiografía:', error);
    res.status(500).json({
      error: 'Error al obtener radiografía',
      message: error.message
    });
  }
});

// PUT /api/radiografias/:id - Actualizar radiografía
router.put('/:id', async (req, res) => {
  try {
    const radiografiaId = req.params.id;
    const updates = req.body;

    console.log('🔄 Actualizando radiografía:', radiografiaId, updates);

    // Construir query dinámico
    const allowedFields = [
      'tipo_radiografia', 'zona_anatomica', 'urgencia', 'centro_radiologico',
      'motivo_estudio', 'hallazgos_clinicos', 'instrucciones_especiales',
      'estado', 'fecha_programada', 'fecha_realizacion', 'observaciones'
    ];

    const updateFields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No hay campos válidos para actualizar'
      });
    }

    updateFields.push('updated_at = NOW()');
    values.push(radiografiaId);

    const query = `UPDATE radiografias SET ${updateFields.join(', ')} WHERE id = ? AND activo = 1`;

    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Radiografía no encontrada'
      });
    }

    // Obtener la radiografía actualizada
    const selectQuery = 'SELECT * FROM radiografias WHERE id = ?';
    const [selectResults] = await pool.execute(selectQuery, [radiografiaId]);

    console.log('✅ Radiografía actualizada exitosamente');
    res.json(selectResults[0]);

  } catch (error) {
    console.error('❌ Error al actualizar radiografía:', error);
    res.status(500).json({
      error: 'Error al actualizar radiografía',
      message: error.message
    });
  }
});

// DELETE /api/radiografias/:id - Eliminar radiografía (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const radiografiaId = req.params.id;

    console.log('🗑️ Eliminando radiografía:', radiografiaId);

    // Soft delete - marcar como inactivo
    const query = 'UPDATE radiografias SET activo = 0, updated_at = NOW() WHERE id = ?';

    const [result] = await pool.execute(query, [radiografiaId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Radiografía no encontrada'
      });
    }

    console.log('✅ Radiografía eliminada exitosamente (soft delete)');
    res.json({ message: 'Radiografía eliminada exitosamente' });

  } catch (error) {
    console.error('❌ Error al eliminar radiografía:', error);
    res.status(500).json({
      error: 'Error al eliminar radiografía',
      message: error.message
    });
  }
});

module.exports = router;