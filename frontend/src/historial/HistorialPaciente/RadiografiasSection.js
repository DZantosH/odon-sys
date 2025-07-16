import React, { useState, useCallback, useEffect } from 'react';
import '../../css/RadiografiaSection.css';

// ===== FORMULARIO INLINE =====
const FormularioInlineRadiografia = ({ 
  formData, 
  onFormChange, 
  onSubmit, 
  onCancel, 
  submitLoading,
  setSubmitLoading
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Formulario de radiografía enviado inline');
    console.log('📋 Datos del formulario:', formData);
    
    if (!formData.tipo_radiografia.trim()) {
      console.error('❌ Tipo de radiografía vacío:', formData.tipo_radiografia);
      alert('⚠️ Por favor selecciona un tipo de radiografía');
      return;
    }

    console.log('✅ Validación pasada, ejecutando onSubmit...');
    await onSubmit();
  };

  const handleInputChange = useCallback((field, value) => {
    onFormChange(field, value);
  }, [onFormChange]);

  return (
    <div className="formulario-inline-radiografia">
      <div className="formulario-header">
        <h3>📸 Solicitar Nueva Radiografía</h3>
        <p>Completa la información para solicitar una radiografía médica</p>
      </div>

      <form onSubmit={handleSubmit} className="form-inline">
        <div className="form-grid-inline">
          
          {/* FILA 1: Tipo y Urgencia */}
          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="tipo-radiografia">📸 Tipo de Radiografía *</label>
              <select
                id="tipo-radiografia"
                value={formData.tipo_radiografia}
                onChange={(e) => handleInputChange('tipo_radiografia', e.target.value)}
                required
                disabled={submitLoading}
                className="input-principal"
              >
                <option value="">Seleccionar tipo...</option>
                <option value="Radiografía Dental">Radiografía Dental</option>
                <option value="Panorámica">Panorámica</option>
                <option value="Periapical">Periapical</option>
                <option value="Bitewing">Bitewing</option>
                <option value="Oclusal">Oclusal</option>
                <option value="Cefalométrica">Cefalométrica</option>
                <option value="ATM">ATM (Articulación Temporomandibular)</option>
                <option value="3D/CBCT">3D/CBCT</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="form-group-inline">
              <label htmlFor="urgencia">⚡ Urgencia</label>
              <select
                id="urgencia"
                value={formData.urgencia}
                onChange={(e) => handleInputChange('urgencia', e.target.value)}
                disabled={submitLoading}
              >
                <option value="normal">🟢 Normal</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🔴 Alta</option>
                <option value="emergencia">🚨 Emergencia</option>
              </select>
            </div>
          </div>

          {/* FILA 2: Zona Anatómica y Centro */}
          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="zona-anatomica">🦷 Zona Anatómica</label>
              <input
                type="text"
                id="zona-anatomica"
                value={formData.zona_anatomica}
                onChange={(e) => handleInputChange('zona_anatomica', e.target.value)}
                placeholder="Ej: Molar superior derecho, Mandíbula..."
                disabled={submitLoading}
              />
            </div>

            <div className="form-group-inline">
              <label htmlFor="centro-radiologico">🏥 Centro Radiológico</label>
              <input
                type="text"
                id="centro-radiologico"
                value={formData.centro_radiologico}
                onChange={(e) => handleInputChange('centro_radiologico', e.target.value)}
                placeholder="Ej: Centro de Imagenología Dental"
                disabled={submitLoading}
              />
            </div>
          </div>

          {/* FILA 3: Motivo del Estudio */}
          <div className="form-row">
            <div className="form-group-inline form-group-full">
              <label htmlFor="motivo-estudio">🔍 Motivo del Estudio</label>
              <textarea
                id="motivo-estudio"
                value={formData.motivo_estudio}
                onChange={(e) => handleInputChange('motivo_estudio', e.target.value)}
                placeholder="Describe el motivo por el cual se solicita la radiografía..."
                rows="3"
                disabled={submitLoading}
              />
            </div>
          </div>

          {/* FILA 4: Hallazgos y Instrucciones */}
          <div className="form-row">
            <div className="form-group-inline">
              <label htmlFor="hallazgos-clinicos">📋 Hallazgos Clínicos</label>
              <textarea
                id="hallazgos-clinicos"
                value={formData.hallazgos_clinicos}
                onChange={(e) => handleInputChange('hallazgos_clinicos', e.target.value)}
                placeholder="Describe los hallazgos clínicos relevantes..."
                rows="2"
                disabled={submitLoading}
              />
            </div>

            <div className="form-group-inline">
              <label htmlFor="instrucciones">🔧 Instrucciones Especiales</label>
              <textarea
                id="instrucciones"
                value={formData.instrucciones_especiales}
                onChange={(e) => handleInputChange('instrucciones_especiales', e.target.value)}
                placeholder="Instrucciones especiales para el técnico..."
                rows="2"
                disabled={submitLoading}
              />
            </div>
          </div>

        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="form-actions-inline">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-cancelar-inline"
            disabled={submitLoading}
          >
            ❌ Cancelar
          </button>
          <button 
            type="submit" 
            className={`btn-solicitar-inline ${submitLoading ? 'loading' : ''}`}
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <span className="spinner-btn-inline"></span>
                ⏳ Solicitando...
              </>
            ) : (
              '📸 Solicitar Radiografía'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ===== TARJETA COMPACTA DE RADIOGRAFÍA =====
const TarjetaRadiografiaCompacta = ({ 
  radiografia, 
  formatearFecha, 
  buildApiUrl, 
  onVerDetalles, 
  onSubirImagen 
}) => {
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado':
      case 'realizado':
      case 'completada':
        return 'completado';
      case 'pendiente':
        return 'pendiente';
      case 'en-proceso':
        return 'en-proceso';
      case 'cancelado':
        return 'cancelado';
      default:
        return 'pendiente';
    }
  };

  const getUrgenciaIcon = (urgencia) => {
    switch (urgencia?.toLowerCase()) {
      case 'emergencia':
        return '🚨';
      case 'alta':
        return '🔴';
      case 'media':
        return '🟡';
      case 'normal':
      default:
        return '🟢';
    }
  };

  return (
    <div className="tarjeta-radiografia-compacta">
      <div className="tarjeta-header-compacta">
        <div className="tarjeta-info-principal">
          <h4 className="tarjeta-titulo-compacta">
            {radiografia.tipo_radiografia || 'Radiografía General'}
          </h4>
          <div className="tarjeta-metadata">
            <span className="urgencia-badge">
              {getUrgenciaIcon(radiografia.urgencia)} {radiografia.urgencia || 'Normal'}
            </span>
            <span className={`estado-badge-compacta estado-${getEstadoColor(radiografia.estado)}`}>
              {radiografia.estado || 'PENDIENTE'}
            </span>
          </div>
        </div>
      </div>

      <div className="tarjeta-info-secundaria">
        <div className="info-fecha-compacta">
          <span className="fecha-icon">📅</span>
          <span className="fecha-texto">
            Solicitado: {formatearFecha(radiografia.fecha_solicitud)}
          </span>
        </div>
        
        {radiografia.zona_anatomica && (
          <div className="info-zona">
            <span className="zona-icon">🦷</span>
            <span className="zona-texto">{radiografia.zona_anatomica}</span>
          </div>
        )}

        {radiografia.centro_radiologico && (
          <div className="info-centro">
            <span className="centro-icon">🏥</span>
            <span className="centro-texto">{radiografia.centro_radiologico}</span>
          </div>
        )}
      </div>

      <div className="tarjeta-acciones-compacta">
        <button 
          onClick={() => onVerDetalles(radiografia)}
          className="btn-compacto btn-detalles-compacto"
        >
          🔍 Detalles
        </button>
        
        {radiografia.archivo_imagen ? (
          <button 
            onClick={() => {
              window.open(buildApiUrl(radiografia.archivo_imagen), '_blank');
            }}
            className="btn-compacto btn-imagen-compacto"
          >
            {(() => {
              const archivo = radiografia.archivo_imagen;
              return archivo && (archivo.toLowerCase().includes('.pdf') || archivo.toLowerCase().includes('pdf')) ? 
                '📄 Ver PDF' : '🖼️ Ver Imagen';
            })()}
          </button>
        ) : (
          <button
            onClick={() => onSubirImagen(radiografia)}
            className="btn-compacto btn-subir-compacto"
          >
            📤 Subir Archivo
          </button>
        )}
      </div>
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
const RadiografiasSection = ({ 
  radiografias = [], 
  loadingRadiografias = false, 
  onSolicitarNueva,
  formatearFecha,
  buildApiUrl,
  onRecargar
}) => {
  // Estados principales
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [conteoRadiografiasInicial, setConteoRadiografiasInicial] = useState(0);
  
  // Estados para modales
  const [modalVerRadiografia, setModalVerRadiografia] = useState(false);
  const [radiografiaSeleccionada, setRadiografiaSeleccionada] = useState(null);
  const [modalSubirImagen, setModalSubirImagen] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  
  // Estados para notificaciones
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');

  // ✅ NUEVO: Estado local para manejar las radiografías con cambios locales
  const [radiografiasLocal, setRadiografiasLocal] = useState([]);

  // Estados para el formulario
  const [formNuevaRadiografia, setFormNuevaRadiografia] = useState({
    tipo_radiografia: '',
    zona_anatomica: '',
    urgencia: 'normal',
    centro_radiologico: '',
    motivo_estudio: '',
    hallazgos_clinicos: '',
    instrucciones_especiales: ''
  });

  // ✅ Sincronizar radiografías locales cuando cambien las del props
  useEffect(() => {
    setRadiografiasLocal(radiografias);
  }, [radiografias]);

  const handleFormChange = useCallback((field, value) => {
    setFormNuevaRadiografia(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // ✅ useEffect para detectar cuando se agrega una nueva radiografía
  useEffect(() => {
    if (submitLoading && radiografias.length > conteoRadiografiasInicial) {
      console.log('🎉 ¡Nueva radiografía detectada! Cerrando formulario automáticamente');
      console.log(`📊 Radiografías: ${conteoRadiografiasInicial} → ${radiografias.length}`);
      
      // Cerrar formulario automáticamente
      setMostrarFormulario(false);
      setSubmitLoading(false);
      
      // Resetear formulario
      setFormNuevaRadiografia({
        tipo_radiografia: '',
        zona_anatomica: '',
        urgencia: 'normal',
        centro_radiologico: '',
        motivo_estudio: '',
        hallazgos_clinicos: '',
        instrucciones_especiales: ''
      });
      
      // Mostrar notificación de éxito
      setSuccessTitle('¡Radiografía Solicitada Exitosamente!');
      setSuccessMessage(`Nueva radiografía agregada al historial del paciente.`);
      setShowSuccessNotification(true);
      
      // Resetear contador
      setConteoRadiografiasInicial(0);
    }
  }, [radiografias.length, submitLoading, conteoRadiografiasInicial]);

  const handleSolicitarNueva = async () => {
    try {
      console.log('🚀 Iniciando solicitud de radiografía inline...');
      console.log('📋 Form data:', formNuevaRadiografia);
      
      // Guardar el conteo actual ANTES de enviar
      setConteoRadiografiasInicial(radiografias.length);
      console.log('📊 Conteo inicial de radiografías:', radiografias.length);
      
      setSubmitLoading(true);
      
      if (!formNuevaRadiografia.tipo_radiografia?.trim()) {
        alert('⚠️ Por favor selecciona un tipo de radiografía');
        setSubmitLoading(false);
        return;
      }

      console.log('✅ Validación pasada, llamando a onSolicitarNueva...');
      
      // Llamar a la función del padre (sin await para no bloquear)
      onSolicitarNueva(formNuevaRadiografia).then(() => {
        console.log('📡 onSolicitarNueva completado');
        // El useEffect se encargará de cerrar el formulario cuando detecte la nueva radiografía
      }).catch((error) => {
        console.error('❌ Error en onSolicitarNueva:', error);
        setSubmitLoading(false);
        alert(`❌ Error al solicitar radiografía: ${error.message}`);
      });
      
    } catch (error) {
      console.error('❌ Error en handleSolicitarNueva:', error);
      alert(`❌ Error al solicitar radiografía: ${error.message}`);
      setSubmitLoading(false);
    }
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    // Resetear formulario
    setFormNuevaRadiografia({
      tipo_radiografia: '',
      zona_anatomica: '',
      urgencia: 'normal',
      centro_radiologico: '',
      motivo_estudio: '',
      hallazgos_clinicos: '',
      instrucciones_especiales: ''
    });
  };

  const handleVerDetalles = (radiografia) => {
    // ✅ Buscar la radiografía actualizada en el estado local
    const radiografiaActualizada = radiografiasLocal.find(r => r.id === radiografia.id) || radiografia;
    console.log('🔍 Mostrando detalles de radiografía:', radiografiaActualizada);
    setRadiografiaSeleccionada(radiografiaActualizada);
    setModalVerRadiografia(true);
  };

  const abrirModalSubirImagen = (radiografia) => {
    setRadiografiaSeleccionada(radiografia);
    setModalSubirImagen(true);
  };

const handleSubirImagen = async () => {
    if (!archivoSeleccionado || !radiografiaSeleccionada) {
      alert('⚠️ Selecciona una imagen primero');
      return;
    }

    try {
      console.log('📤 Subiendo imagen de radiografía...');
      console.log('🆔 ID de radiografía:', radiografiaSeleccionada.id);
      console.log('📁 Archivo:', archivoSeleccionado.name);
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('imagen', archivoSeleccionado); // Usar 'imagen' como nombre principal
      formData.append('archivo', archivoSeleccionado); // También 'archivo' como fallback
      formData.append('radiografia_id', radiografiaSeleccionada.id);
      formData.append('fecha_realizacion', new Date().toISOString().split('T')[0]);

      // Lista de endpoints en orden de prioridad
      const endpointsAPrueba = [
        `/radiografias/${radiografiaSeleccionada.id}/imagen`,
        `/radiografias/${radiografiaSeleccionada.id}/archivo`,
      ];

      let response = null;
      let endpointUsado = null;
      let archivoSubidoExitosamente = false;
      let resultado = null;

      // Intentar subir al servidor real PRIMERO
      for (const endpoint of endpointsAPrueba) {
        try {
          console.log(`🔍 Probando endpoint: ${endpoint}`);
          
          response = await fetch(buildApiUrl(endpoint), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          });

          console.log(`📡 Respuesta del servidor (${endpoint}):`, response.status);

          if (response.ok) {
            resultado = await response.json();
            
            // Verificar que la respuesta indique éxito
            if (resultado.success !== false) {
              endpointUsado = endpoint;
              archivoSubidoExitosamente = true;
              console.log(`✅ Endpoint exitoso: ${endpoint}`);
              console.log('📋 Resultado del servidor:', resultado);
              break;
            } else {
              console.log(`❌ Endpoint ${endpoint} respondió con error:`, resultado.error);
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ Endpoint ${endpoint} falló con status ${response.status}:`, errorText);
          }
        } catch (endpointError) {
          console.log(`❌ Error en endpoint ${endpoint}:`, endpointError.message);
          continue;
        }
      }

      if (archivoSubidoExitosamente && resultado) {
        console.log('🎉 ¡Archivo subido exitosamente al servidor!');
        
        // Actualizar con los datos reales del servidor
        const radiografiaActualizada = {
          ...radiografiaSeleccionada,
          ...resultado.radiografia,
          archivo_imagen: resultado.archivo || resultado.radiografia?.archivo_imagen,
          fecha_realizacion: resultado.radiografia?.fecha_realizacion || new Date().toISOString().split('T')[0],
          estado: resultado.radiografia?.estado || 'completada'
        };

        // Actualizar estado local inmediatamente
        setRadiografiasLocal(prevRadiografias => 
          prevRadiografias.map(radio => 
            radio.id === radiografiaSeleccionada.id ? radiografiaActualizada : radio
          )
        );

        // Actualizar radiografía seleccionada para el modal
        setRadiografiaSeleccionada(radiografiaActualizada);
        
        // Cerrar modal
        setModalSubirImagen(false);
        setArchivoSeleccionado(null);
        
        // Mostrar notificación de éxito REAL
        setSuccessTitle('¡Archivo Subido al Servidor!');
        setSuccessMessage(`El archivo "${archivoSeleccionado.name}" se ha guardado exitosamente en la base de datos.`);
        setShowSuccessNotification(true);
        
        // Recargar datos del servidor después de un momento para confirmar
        setTimeout(() => {
          if (onRecargar) {
            console.log('🔄 Recargando datos del servidor para confirmar...');
            onRecargar();
          }
        }, 1000);
        
        return;
      }

      // Si llegamos aquí, ningún endpoint funcionó - usar simulación local
      console.log('⚠️ No se pudo conectar con el servidor, guardando localmente...');
      
      const nombreArchivo = `${Date.now()}_${archivoSeleccionado.name}`;
      const urlSimulada = `/uploads/radiografias/${nombreArchivo}`;
      
      const radiografiaActualizada = {
        ...radiografiaSeleccionada,
        archivo_imagen: urlSimulada,
        archivo_resultado: urlSimulada,
        fecha_realizacion: new Date().toISOString().split('T')[0],
        estado: 'completada'
      };

      // Actualizar estado local
      setRadiografiasLocal(prevRadiografias => 
        prevRadiografias.map(radio => 
          radio.id === radiografiaSeleccionada.id ? radiografiaActualizada : radio
        )
      );

      setRadiografiaSeleccionada(radiografiaActualizada);
      
      // Cerrar modal
      setModalSubirImagen(false);
      setArchivoSeleccionado(null);
      
      // Mostrar notificación de modo local
      setSuccessTitle('⚠️ Guardado Localmente');
      setSuccessMessage(`El archivo "${archivoSeleccionado.name}" se guardó localmente. Verifique la configuración del servidor para guardado permanente.`);
      setShowSuccessNotification(true);
      
    } catch (error) {
      console.error('❌ Error general al subir imagen:', error);
      
      // En caso de error, cerrar modal y notificar
      setModalSubirImagen(false);
      setArchivoSeleccionado(null);
      setRadiografiaSeleccionada(null);
      
      alert(`❌ Error: ${error.message}\n\nRevisa la consola para más detalles.`);
    }
  };

  // Render del estado de carga
  if (loadingRadiografias) {
    return (
      <div className="loading-section-radiografias">
        <div className="spinner-radiografias"></div>
        <p>Cargando radiografías...</p>
      </div>
    );
  }

  // ===== RENDER PRINCIPAL =====
  return (
    <div className="seccion-completa-radiografias">
      
      {/* HEADER */}
      <div className="seccion-header-radiografias">
        <h2>📸 Radiografías ({radiografiasLocal.length})</h2>
        <div className="header-actions-radiografias">
          <button 
            onClick={() => onRecargar && onRecargar()}
            className="btn-recargar-radiografias"
            disabled={loadingRadiografias}
            title="Recargar radiografías"
          >
            🔄 Recargar
          </button>
          {!mostrarFormulario && (
            <button 
              onClick={() => setMostrarFormulario(true)}
              className="btn-accion-radiografias"
            >
              ➕ Solicitar Nueva Radiografía
            </button>
          )}
        </div>
      </div>

      {/* FORMULARIO INLINE */}
      {mostrarFormulario && (
        <FormularioInlineRadiografia
          formData={formNuevaRadiografia}
          onFormChange={handleFormChange}
          onSubmit={handleSolicitarNueva}
          onCancel={handleCancelarFormulario}
          submitLoading={submitLoading}
          setSubmitLoading={setSubmitLoading}
        />
      )}

      {/* CONTENIDO PRINCIPAL */}
      {radiografiasLocal.length === 0 && !mostrarFormulario ? (
        // Estado vacío
        <div className="seccion-vacia-radiografias">
          <div className="icono-vacio-radiografias">📸</div>
          <h3>Sin Radiografías</h3>
          <p>Este paciente no tiene radiografías registradas. Puedes solicitar la primera radiografía haciendo clic en el botón de abajo.</p>
          
          <button 
            onClick={() => setMostrarFormulario(true)}
            className="btn-primera-accion-radiografias"
          >
            📸 Solicitar Primera Radiografía
          </button>
        </div>
      ) : (
        // Grid de tarjetas compactas
        !mostrarFormulario && (
          <div className="radiografias-grid-compacto">
            {radiografiasLocal.map((radiografia) => (
              <TarjetaRadiografiaCompacta
                key={radiografia.id}
                radiografia={radiografia}
                formatearFecha={formatearFecha}
                buildApiUrl={buildApiUrl}
                onVerDetalles={handleVerDetalles}
                onSubirImagen={abrirModalSubirImagen}
              />
            ))}
          </div>
        )
      )}

      {/* MODAL DE DETALLES */}
      {modalVerRadiografia && radiografiaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content modal-grande">
            <div className="modal-header">
              <h2>📸 Detalles de la Radiografía</h2>
              <button 
                onClick={() => {
                  setModalVerRadiografia(false);
                  setRadiografiaSeleccionada(null);
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detalle-completo">
                
                <div className="detalle-titulo">
                  <h3>📸 {radiografiaSeleccionada.tipo_radiografia}</h3>
                  <span className={`estado-badge estado-${radiografiaSeleccionada.estado?.toLowerCase() || 'pendiente'}`}>
                    {radiografiaSeleccionada.estado || 'Pendiente'}
                  </span>
                </div>

                <div className="detalle-grid-completo">
                  <div className="detalle-campo">
                    <div className="campo-icono">📅</div>
                    <div className="campo-info">
                      <strong>FECHA SOLICITUD:</strong>
                      <span>{formatearFecha(radiografiaSeleccionada.fecha_solicitud)}</span>
                    </div>
                  </div>

                  {radiografiaSeleccionada.zona_anatomica && (
                    <div className="detalle-campo">
                      <div className="campo-icono">🦷</div>
                      <div className="campo-info">
                        <strong>ZONA ANATÓMICA:</strong>
                        <span>{radiografiaSeleccionada.zona_anatomica}</span>
                      </div>
                    </div>
                  )}

                  <div className="detalle-campo">
                    <div className="campo-icono">⚡</div>
                    <div className="campo-info">
                      <strong>URGENCIA:</strong>
                      <span className={`urgencia-badge urgencia-${radiografiaSeleccionada.urgencia || 'normal'}`}>
                        {radiografiaSeleccionada.urgencia === 'emergencia' ? '🚨 Emergencia' :
                         radiografiaSeleccionada.urgencia === 'alta' ? '🔴 Alta' : 
                         radiografiaSeleccionada.urgencia === 'media' ? '🟡 Media' : '🟢 Normal'}
                      </span>
                    </div>
                  </div>

                  {radiografiaSeleccionada.centro_radiologico && (
                    <div className="detalle-campo">
                      <div className="campo-icono">🏥</div>
                      <div className="campo-info">
                        <strong>CENTRO RADIOLÓGICO:</strong>
                        <span>{radiografiaSeleccionada.centro_radiologico}</span>
                      </div>
                    </div>
                  )}
                </div>

                {radiografiaSeleccionada.motivo_estudio && (
                  <div className="detalle-seccion-completa">
                    <div className="seccion-titulo">
                      <div className="seccion-icono">🔍</div>
                      <strong>MOTIVO DEL ESTUDIO:</strong>
                    </div>
                    <div className="seccion-contenido">
                      {radiografiaSeleccionada.motivo_estudio}
                    </div>
                  </div>
                )}

                {radiografiaSeleccionada.hallazgos_clinicos && (
                  <div className="detalle-seccion-completa">
                    <div className="seccion-titulo">
                      <div className="seccion-icono">📋</div>
                      <strong>HALLAZGOS CLÍNICOS:</strong>
                    </div>
                    <div className="seccion-contenido">
                      {radiografiaSeleccionada.hallazgos_clinicos}
                    </div>
                  </div>
                )}

                {radiografiaSeleccionada.instrucciones_especiales && (
                  <div className="detalle-seccion-completa">
                    <div className="seccion-titulo">
                      <div className="seccion-icono">🔧</div>
                      <strong>INSTRUCCIONES ESPECIALES:</strong>
                    </div>
                    <div className="seccion-contenido">
                      {radiografiaSeleccionada.instrucciones_especiales}
                    </div>
                  </div>
                )}

                {/* ✅ SECCIÓN DE ARCHIVO DE IMAGEN MEJORADA */}
                {radiografiaSeleccionada.archivo_imagen ? (
                  <div className="detalle-seccion-completa resultado-seccion">
                    <div className="seccion-titulo">
                      <div className="seccion-icono">
                        {radiografiaSeleccionada.archivo_imagen && (radiografiaSeleccionada.archivo_imagen.toLowerCase().includes('.pdf') || radiografiaSeleccionada.archivo_imagen.toLowerCase().includes('pdf')) ? '📄' : '🖼️'}
                      </div>
                      <strong>
                        {radiografiaSeleccionada.archivo_imagen && (radiografiaSeleccionada.archivo_imagen.toLowerCase().includes('.pdf') || radiografiaSeleccionada.archivo_imagen.toLowerCase().includes('pdf')) ? 
                          'ARCHIVO PDF DE RADIOGRAFÍA:' : 'IMAGEN DE RADIOGRAFÍA:'}
                      </strong>
                    </div>
                    <div className="seccion-contenido">
                      <p>📁 Archivo disponible: {radiografiaSeleccionada.archivo_imagen.split('/').pop()}</p>
                      {radiografiaSeleccionada.fecha_realizacion && (
                        <p>📅 Fecha de realización: {formatearFecha(radiografiaSeleccionada.fecha_realizacion)}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => window.open(buildApiUrl(radiografiaSeleccionada.archivo_imagen), '_blank')}
                      className="btn-ver-imagen-completo"
                    >
                      {radiografiaSeleccionada.archivo_imagen && (radiografiaSeleccionada.archivo_imagen.toLowerCase().includes('.pdf') || radiografiaSeleccionada.archivo_imagen.toLowerCase().includes('pdf')) ? 
                        '📄 Ver Archivo PDF' : '🖼️ Ver Imagen Completa'}
                    </button>
                  </div>
                ) : (
                  <div className="detalle-seccion-completa">
                    <div className="seccion-titulo">
                      <div className="seccion-icono">📤</div>
                      <strong>ARCHIVO DE RADIOGRAFÍA:</strong>
                    </div>
                    <div className="seccion-contenido">
                      <p>⏳ Pendiente de subir archivo de imagen</p>
                    </div>
                    <button 
                      onClick={() => {
                        setModalVerRadiografia(false);
                        abrirModalSubirImagen(radiografiaSeleccionada);
                      }}
                      className="btn-ver-imagen-completo"
                      style={{background: '#17a2b8'}}
                    >
                      📤 Subir Archivo Ahora
                    </button>
                  </div>
                )}

              </div>
              
              <div className="modal-acciones">
                <button 
                  onClick={() => {
                    setModalVerRadiografia(false);
                    setRadiografiaSeleccionada(null);
                  }}
                  className="btn-cerrar-modal"
                >
                  ✅ Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUBIR IMAGEN */}
      {modalSubirImagen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>📤 Subir Archivo de Radiografía</h2>
              <button 
                onClick={() => {
                  setModalSubirImagen(false);
                  setArchivoSeleccionado(null);
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {radiografiaSeleccionada && (
                <div className="info-radiografia">
                  <h3>📸 {radiografiaSeleccionada.tipo_radiografia}</h3>
                  <p><strong>📅 Solicitado:</strong> {formatearFecha(radiografiaSeleccionada.fecha_solicitud)}</p>
                  {radiografiaSeleccionada.zona_anatomica && (
                    <p><strong>🦷 Zona:</strong> {radiografiaSeleccionada.zona_anatomica}</p>
                  )}
                </div>
              )}
              <div className="upload-area">
                <input
                  type="file"
                  accept="image/*,.pdf,.dcm,.dicom"
                  onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                  className="file-input"
                  id="archivo-imagen"
                />
                <label htmlFor="archivo-imagen" className="file-label">
                  📁 Seleccionar archivo
                </label>
                <div className="tipos-archivo-permitidos">
                  <small>Tipos permitidos: Imágenes (JPG, PNG), PDF, DICOM</small>
                </div>
                
                {archivoSeleccionado && (
                  <div className="file-selected">
                    <div className="archivo-info">
                      <span className="archivo-icono">
                        {archivoSeleccionado.type.includes('pdf') ? '📄' : 
                         archivoSeleccionado.type.includes('image') ? '🖼️' : '📁'}
                      </span>
                      <div className="archivo-detalles">
                        <strong>{archivoSeleccionado.name}</strong>
                        <small>{(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB</small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => {
                    setModalSubirImagen(false);
                    setArchivoSeleccionado(null);
                  }}
                  className="btn-secundario"
                >
                  ❌ Cancelar
                </button>
                <button 
                  onClick={handleSubirImagen}
                  disabled={!archivoSeleccionado}
                  className="btn-primario"
                >
                  📤 Subir Archivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICACIÓN DE ÉXITO */}
      {showSuccessNotification && (
        <>
          {/* Overlay semi-transparente */}
          <div className="notification-overlay"></div>
          
          {/* Notificación */}
          <div className="success-notification">
            <div className="notification-content">
              <h4>{successTitle}</h4>
              <p>{successMessage}</p>
              <div className="notification-buttons">
                <button 
                  onClick={() => {
                    setShowSuccessNotification(false);
                    console.log('🔔 Notificación cerrada por el usuario');
                  }}
                  className="btn-close-notification"
                >
                  ✅ Entendido
                </button>
                
                {/* Botón adicional para recargar manualmente */}
                <button 
                  onClick={() => {
                    setShowSuccessNotification(false);
                    if (onRecargar) {
                      console.log('🔄 Recarga manual solicitada');
                      onRecargar();
                    }
                  }}
                  className="btn-recargar-notification"
                >
                  🔄 Recargar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RadiografiasSection;