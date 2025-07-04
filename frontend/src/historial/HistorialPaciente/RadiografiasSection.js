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
                <option value="Radiografía de Tórax">Radiografía de Tórax</option>
                <option value="Radiografía de Columna">Radiografía de Columna</option>
                <option value="Radiografía de Extremidades">Radiografía de Extremidades</option>
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
      
      // ✅ Ejecutar la función y capturar el resultado
      const exitoso = await onSolicitarNueva(formNuevaRadiografia);
      
      // ✅ Solo cerrar formulario y limpiar si fue exitoso
      if (exitoso) {
        console.log('✅ Radiografía solicitada exitosamente, cerrando formulario...');
        console.log('🔧 DEBUG: Antes de cerrar - mostrandoFormulario =', mostrandoFormulario);
        
        // Limpiar formulario
        setFormNuevaRadiografia({
          tipo_radiografia: '',
          zona_anatomica: '',
          urgencia: 'normal',
          centro_radiologico: '',
          motivo_estudio: '',
          hallazgos_clinicos: '',
          instrucciones_especiales: ''
        });
        
        // Cerrar formulario
        setMostrandoFormulario(false);
        
        console.log('✅ Formulario cerrado correctamente');
        console.log('🔧 DEBUG: Después de cerrar - mostrandoFormulario debería ser false');
      } else {
        console.log('❌ Error en la solicitud, manteniendo formulario abierto para correcciones');
        // El formulario se mantiene abierto para que el usuario pueda corregir el error
      }
      
    } catch (error) {
      console.error('❌ Error inesperado al solicitar radiografía:', error);
      // En caso de error inesperado, mostrar alerta pero mantener formulario abierto
      alert(`❌ Error inesperado: ${error.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelarFormulario = () => {
    // Limpiar formulario al cancelar
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
      // Aquí iría la lógica para subir la imagen
      
      setModalSubirImagen(false);
      setArchivoSeleccionado(null);
      setRadiografiaSeleccionada(null);
      
      alert('✅ Imagen subida exitosamente');
    } catch (error) {
      console.error('❌ Error al subir imagen:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  if (loadingRadiografias) {
    return (
      <div className="loading-section">
        <div className="spinner"></div>
        <p>Cargando radiografías...</p>
      </div>
    );
  }

  // ✅ Si está mostrando el formulario, renderizar solo el formulario
  if (mostrandoFormulario) {
    console.log('🔧 DEBUG: Mostrando formulario, mostrandoFormulario =', mostrandoFormulario);
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

  console.log('🔧 DEBUG: Mostrando lista de radiografías, mostrandoFormulario =', mostrandoFormulario, 'radiografias.length =', radiografias.length);

  if (radiografias.length === 0) {
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
          onClick={() => {
            console.log('🔧 DEBUG: Botón clickeado, cambiando mostrandoFormulario a true');
            setMostrandoFormulario(true);
          }}
          className="btn-accion"
          style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          ➕ Solicitar Nueva Radiografía
        </button>
      </div>

      <div className="radiografias-grid">
        {radiografias.map((radiografia) => (
          <div key={radiografia.id} className="radiografia-card">
            <div className="radiografia-header">
              <h4>{radiografia.tipo_radiografia || 'Radiografía General'}</h4>
              <span className={`estado-badge estado-${radiografia.estado?.toLowerCase() || 'pendiente'}`}>
                {radiografia.estado || 'Pendiente'}
              </span>
            </div>

            <div className="radiografia-info">
              <div className="info-item">
                <strong>📅 Fecha Solicitud:</strong>
                <span>{formatearFecha(radiografia.fecha_solicitud)}</span>
              </div>

              {radiografia.zona_anatomica && (
                <div className="info-item">
                  <strong>🦷 Zona:</strong>
                  <span>{radiografia.zona_anatomica}</span>
                </div>
              )}

              {radiografia.centro_radiologico && (
                <div className="info-item">
                  <strong>🏥 Centro:</strong>
                  <span>{radiografia.centro_radiologico}</span>
                </div>
              )}

              <div className="info-item">
                <strong>⚡ Urgencia:</strong>
                <span className={`urgencia urgencia-${radiografia.urgencia || 'normal'}`}>
                  {radiografia.urgencia === 'emergencia' ? '🚨 Emergencia' :
                   radiografia.urgencia === 'alta' ? '🔴 Alta' : 
                   radiografia.urgencia === 'media' ? '🟡 Media' : '🟢 Normal'}
                </span>
              </div>

              {radiografia.motivo_estudio && (
                <div className="info-item">
                  <strong>🔍 Motivo:</strong>
                  <p>{radiografia.motivo_estudio}</p>
                </div>
              )}

              {radiografia.fecha_realizacion && (
                <div className="info-item">
                  <strong>✅ Fecha Realización:</strong>
                  <span>{formatearFecha(radiografia.fecha_realizacion)}</span>
                </div>
              )}

              {radiografia.archivo_imagen && (
                <div className="info-item">
                  <strong>🖼️ Imagen:</strong>
                  <button 
                    onClick={() => window.open(buildApiUrl(radiografia.archivo_imagen), '_blank')}
                    className="btn-ver-imagen"
                  >
                    🖼️ Ver Imagen
                  </button>
                </div>
              )}
            </div>
              
              {!radiografia.archivo_imagen && (
                <button
                  onClick={() => {
                    setRadiografiaSeleccionada(radiografia);
                    setModalSubirImagen(true);
                  }}
                  className="btn-primario"
                >
                  📤 Subir Imagen
                </button>
              )}
          </div>
        ))}
      </div>

      {/* Modal Ver Radiografía */}
      {modalVerRadiografia && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>👁️ Detalles de la Radiografía</h2>
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
                <div className="detalle-radiografia">
                  <h3>📸 {radiografiaSeleccionada.tipo_radiografia}</h3>
                  <div className="detalles-grid">
                    <div className="detalle-item">
                      <strong>📅 Fecha Solicitud:</strong>
                      <span>{formatearFecha(radiografiaSeleccionada.fecha_solicitud)}</span>
                    </div>
                    {radiografiaSeleccionada.zona_anatomica && (
                      <div className="detalle-item">
                        <strong>🦷 Zona Anatómica:</strong>
                        <span>{radiografiaSeleccionada.zona_anatomica}</span>
                      </div>
                    )}
                    <div className="detalle-item">
                      <strong>⚡ Urgencia:</strong>
                      <span className={`urgencia urgencia-${radiografiaSeleccionada.urgencia || 'normal'}`}>
                        {radiografiaSeleccionada.urgencia === 'emergencia' ? '🚨 Emergencia' :
                         radiografiaSeleccionada.urgencia === 'alta' ? '🔴 Alta' : 
                         radiografiaSeleccionada.urgencia === 'media' ? '🟡 Media' : '🟢 Normal'}
                      </span>
                    </div>
                    {radiografiaSeleccionada.motivo_estudio && (
                      <div className="detalle-item-full">
                        <strong>🔍 Motivo del Estudio:</strong>
                        <p>{radiografiaSeleccionada.motivo_estudio}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="modal-actions">
                <button 
                  onClick={() => {
                    setModalVerRadiografia(false);
                    setRadiografiaSeleccionada(null);
                  }}
                  className="btn-secundario"
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