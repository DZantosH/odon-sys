import React, { useState, useCallback } from 'react';

const FormularioNuevaRadiografia = React.memo(({
  formData,
  onFormChange,
  onSubmit,
  onCancel,
  submitLoading
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tipo_radiografia.trim()) {
      alert('⚠️ Por favor selecciona un tipo de radiografía');
      return;
    }

    await onSubmit();
  };

  const handleInputChange = useCallback((field, value) => {
    onFormChange(field, value);
  }, [onFormChange]);

  return (
    <div className="seccion-completa">
      <div className="seccion-header">
        <h2>📸 Solicitar Nueva Radiografía</h2>
        <button 
          onClick={onCancel}
          className="btn-secundario"
          disabled={submitLoading}
          type="button"
        >
          ❌ Cancelar
        </button>
      </div>

      <div className="formulario-container">
        <form onSubmit={handleSubmit} className="formulario-radiografia">
          <div className="form-grid">
            {/* Tipo de Radiografía */}
            <div className="form-group">
              <label htmlFor="tipo-radiografia">📸 Tipo de Radiografía</label>
              <select
                id="tipo-radiografia"
                value={formData.tipo_radiografia}
                onChange={(e) => handleInputChange('tipo_radiografia', e.target.value)}
                required
                disabled={submitLoading}
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

            {/* Zona Anatómica */}
            <div className="form-group">
              <label htmlFor="zona-anatomica">🦷 Zona Anatómica</label>
              <input
                type="text"
                id="zona-anatomica"
                value={formData.zona_anatomica}
                onChange={(e) => handleInputChange('zona_anatomica', e.target.value)}
                placeholder="Ej: Molar superior derecho, Mandíbula completa..."
                disabled={submitLoading}
              />
            </div>

            {/* Urgencia */}
            <div className="form-group">
              <label htmlFor="urgencia-radio">⚡ Urgencia</label>
              <select
                id="urgencia-radio"
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

            {/* Centro Radiológico */}
            <div className="form-group">
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

            {/* Motivo del Estudio */}
            <div className="form-group form-group-full">
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

            {/* Hallazgos Clínicos */}
            <div className="form-group form-group-full">
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

            {/* Instrucciones Especiales */}
            <div className="form-group form-group-full">
              <label htmlFor="instrucciones">🔧 Instrucciones Especiales</label>
              <textarea
                id="instrucciones"
                value={formData.instrucciones_especiales}
                onChange={(e) => handleInputChange('instrucciones_especiales', e.target.value)}
                placeholder="Instrucciones especiales para el técnico radiólogo..."
                rows="2"
                disabled={submitLoading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel}
              className="btn-secundario"
              disabled={submitLoading}
            >
              ❌ Cancelar
            </button>
            <button 
              type="submit" 
              className={`btn-primario ${submitLoading ? 'loading' : ''}`}
              disabled={submitLoading}
            >
              {submitLoading ? '⏳ Solicitando...' : '📸 Solicitar Radiografía'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

const RadiografiasSection = ({ 
  radiografias, 
  loadingRadiografias, 
  onSolicitarNueva,
  formatearFecha,
  buildApiUrl 
}) => {
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [modalVerRadiografia, setModalVerRadiografia] = useState(false);
  const [radiografiaSeleccionada, setRadiografiaSeleccionada] = useState(null);
  const [modalSubirImagen, setModalSubirImagen] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formNuevaRadiografia, setFormNuevaRadiografia] = useState({
    tipo_radiografia: '',
    zona_anatomica: '',
    urgencia: 'normal',
    centro_radiologico: '',
    motivo_estudio: '',
    hallazgos_clinicos: '',
    instrucciones_especiales: ''
  });

  const handleFormChange = useCallback((field, value) => {
    setFormNuevaRadiografia(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSolicitarRadiografia = async () => {
    try {
      setSubmitLoading(true);
      
      const exitoso = await onSolicitarNueva(formNuevaRadiografia);
      
      if (exitoso) {
        console.log('✅ Radiografía solicitada exitosamente, cerrando formulario...');
        
        setFormNuevaRadiografia({
          tipo_radiografia: '',
          zona_anatomica: '',
          urgencia: 'normal',
          centro_radiologico: '',
          motivo_estudio: '',
          hallazgos_clinicos: '',
          instrucciones_especiales: ''
        });
        
        setMostrandoFormulario(false);
      }
      
    } catch (error) {
      console.error('❌ Error inesperado al solicitar radiografía:', error);
      alert(`❌ Error inesperado: ${error.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelarFormulario = () => {
    setFormNuevaRadiografia({
      tipo_radiografia: '',
      zona_anatomica: '',
      urgencia: 'normal',
      centro_radiologico: '',
      motivo_estudio: '',
      hallazgos_clinicos: '',
      instrucciones_especiales: ''
    });
    setMostrandoFormulario(false);
  };

  const handleSubirImagen = async () => {
    if (!archivoSeleccionado || !radiografiaSeleccionada) {
      alert('⚠️ Selecciona una imagen primero');
      return;
    }

    try {
      console.log('📤 Subiendo imagen de radiografía...');
      
      setModalSubirImagen(false);
      setArchivoSeleccionado(null);
      setRadiografiaSeleccionada(null);
      
      alert('✅ Imagen subida exitosamente');
    } catch (error) {
      console.error('❌ Error al subir imagen:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleVerDetalles = (radiografia) => {
    setRadiografiaSeleccionada(radiografia);
    setModalVerRadiografia(true);
  };

  if (loadingRadiografias) {
    return (
      <div className="loading-section">
        <div className="spinner"></div>
        <p>Cargando radiografías...</p>
      </div>
    );
  }

  if (mostrandoFormulario) {
    return (
      <FormularioNuevaRadiografia
        formData={formNuevaRadiografia}
        onFormChange={handleFormChange}
        onSubmit={handleSolicitarRadiografia}
        onCancel={handleCancelarFormulario}
        submitLoading={submitLoading}
      />
    );
  }

  if (!radiografias || radiografias.length === 0) {
    return (
      <div className="seccion-vacia">
        <div className="icono-vacio">📸</div>
        <h3>Sin Radiografías</h3>
        <p>Este paciente no tiene radiografías registradas. Puedes solicitar la primera radiografía haciendo clic en el botón de abajo.</p>
        <button 
          onClick={() => setMostrandoFormulario(true)}
          className="btn-primera-accion"
        >
          📸 Solicitar Primera Radiografía
        </button>
      </div>
    );
  }

  return (
    <div className="seccion-completa">
      <div className="seccion-header">
        <h2>📸 Radiografías ({radiografias.length})</h2>
        <button 
          onClick={() => setMostrandoFormulario(true)}
          className="btn-accion"
          style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          ➕ Solicitar Nueva Radiografía
        </button>
      </div>

      {/* ===== VISTA SIMPLIFICADA ===== */}
      <div className="radiografias-lista-simple">
        {radiografias.map((radiografia) => (
          <div key={radiografia.id} className="radiografia-item-simple">
            
            {/* INFORMACIÓN BÁSICA - SOLO LO ESENCIAL */}
            <div className="radiografia-info-basica">
              <div className="radiografia-nombre">
                <h4>{radiografia.tipo_radiografia || 'Radiografía General'}</h4>
                <span className={`estado-simple estado-${radiografia.estado?.toLowerCase() || 'pendiente'}`}>
                  {radiografia.estado || 'PENDIENTE'}
                </span>
              </div>
              
              <div className="radiografia-fecha">
                <span className="fecha-label">📅 FECHA SOLICITUD:</span>
                <span className="fecha-valor">{formatearFecha(radiografia.fecha_solicitud)}</span>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="radiografia-acciones-simple">
              <button 
                onClick={() => handleVerDetalles(radiografia)}
                className="btn-ver-detalles-simple"
              >
                🔍 Ver Detalles
              </button>
              
              {radiografia.archivo_imagen ? (
                <button 
                  onClick={() => window.open(buildApiUrl(radiografia.archivo_imagen), '_blank')}
                  className="btn-ver-imagen-simple"
                >
                  🖼️ Ver Imagen
                </button>
              ) : (
                <button
                  onClick={() => {
                    setRadiografiaSeleccionada(radiografia);
                    setModalSubirImagen(true);
                  }}
                  className="btn-subir-imagen-simple"
                >
                  📤 Subir Imagen
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* MODAL CON TODOS LOS DETALLES */}
      {modalVerRadiografia && (
        <div className="modal-overlay">
          <div className="modal-content modal-grande">
            <div className="modal-header">
              <h2>👁️ Detalles Completos de la Radiografía</h2>
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
              {radiografiaSeleccionada && (
                <div className="detalle-completo">
                  
                  {/* TÍTULO DE LA RADIOGRAFÍA */}
                  <div className="detalle-titulo">
                    <h3>📸 {radiografiaSeleccionada.tipo_radiografia}</h3>
                    <span className={`estado-badge estado-${radiografiaSeleccionada.estado?.toLowerCase() || 'pendiente'}`}>
                      {radiografiaSeleccionada.estado || 'Pendiente'}
                    </span>
                  </div>

                  {/* INFORMACIÓN DETALLADA EN GRID */}
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

                    {radiografiaSeleccionada.fecha_realizacion && (
                      <div className="detalle-campo">
                        <div className="campo-icono">✅</div>
                        <div className="campo-info">
                          <strong>FECHA REALIZACIÓN:</strong>
                          <span>{formatearFecha(radiografiaSeleccionada.fecha_realizacion)}</span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* MOTIVO Y HALLAZGOS */}
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

                  {/* IMAGEN SI EXISTE */}
                  {radiografiaSeleccionada.archivo_imagen && (
                    <div className="detalle-seccion-completa resultado-seccion">
                      <div className="seccion-titulo">
                        <div className="seccion-icono">🖼️</div>
                        <strong>IMAGEN DE RADIOGRAFÍA:</strong>
                      </div>
                      <button 
                        onClick={() => window.open(buildApiUrl(radiografiaSeleccionada.archivo_imagen), '_blank')}
                        className="btn-ver-imagen-completo"
                      >
                        🖼️ Ver Imagen Completa
                      </button>
                    </div>
                  )}

                </div>
              )}
              
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

      {/* Modal Subir Imagen */}
      {modalSubirImagen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>📤 Subir Imagen de Radiografía</h2>
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
                </div>
              )}
              <div className="upload-area">
                <input
                  type="file"
                  accept="image/*,.dcm"
                  onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                  className="file-input"
                  id="archivo-imagen"
                />
                <label htmlFor="archivo-imagen" className="file-label">
                  🖼️ Seleccionar imagen (JPG, PNG, DICOM)
                </label>
                
                {archivoSeleccionado && (
                  <div className="file-selected">
                    ✅ Archivo seleccionado: {archivoSeleccionado.name}
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
                  📤 Subir Imagen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadiografiasSection;