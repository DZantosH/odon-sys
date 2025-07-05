import React, { useState, useCallback } from 'react';
import { EstudioDetallesModal, SubirResultadoModal, SuccessNotificationModal, ConfirmModal } from '../../components/modals/ModalSystem';
import '../../css/EstudiosLaboratorioSection.css';

// Modal para solicitar nuevo estudio
const ModalNuevoEstudio = React.memo(({
  isOpen, 
  onClose, 
  formData, 
  onFormChange, 
  onSubmit, 
  submitLoading 
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Formulario enviado');
    console.log('📋 Datos del formulario:', formData);
    
    if (!formData.tipo_estudio.trim()) {
      console.error('❌ Tipo de estudio vacío:', formData.tipo_estudio);
      alert('⚠️ Por favor selecciona un tipo de estudio');
      return;
    }

    console.log('✅ Validación pasada, ejecutando onSubmit...');
    await onSubmit();
  };

  const handleInputChange = useCallback((field, value) => {
    onFormChange(field, value);
  }, [onFormChange]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-estudio">
      <div className="modal-content-estudio">
        <div className="modal-header-estudio">
          <h2>🔬 Solicitar Nuevo Estudio de Laboratorio</h2>
          <button 
            onClick={onClose}
            className="close-btn-estudio"
            disabled={submitLoading}
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="modal-body-estudio">
          <form onSubmit={handleSubmit}>
            <div className="form-grid-estudio">
              <div className="form-group-estudio">
                <label htmlFor="tipo-estudio">🔬 Tipo de Estudio</label>
                <select
                  id="tipo-estudio"
                  value={formData.tipo_estudio}
                  onChange={(e) => handleInputChange('tipo_estudio', e.target.value)}
                  required
                  disabled={submitLoading}
                >
                  <option value="">Seleccionar tipo...</option>
                  <option value="Biometría Hemática">Biometría Hemática</option>
                  <option value="Química Sanguínea">Química Sanguínea</option>
                  <option value="Perfil Lipídico">Perfil Lipídico</option>
                  <option value="Examen General de Orina">Examen General de Orina</option>
                  <option value="Perfil Tiroideo">Perfil Tiroideo</option>
                  <option value="Perfil Hepático">Perfil Hepático</option>
                  <option value="Perfil Renal">Perfil Renal</option>
                  <option value="Hemoglobina Glucosilada">Hemoglobina Glucosilada</option>
                  <option value="Antígeno Prostático">Antígeno Prostático</option>
                  <option value="Marcadores Tumorales">Marcadores Tumorales</option>
                  <option value="Cultivo y Antibiograma">Cultivo y Antibiograma</option>
                  <option value="Electroforesis de Proteínas">Electroforesis de Proteínas</option>
                  <option value="Coprológico">Coprológico</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="form-group-estudio">
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
                </select>
              </div>

              <div className="form-group-estudio">
                <label htmlFor="laboratorio">🏥 Laboratorio Recomendado</label>
                <input
                  type="text"
                  id="laboratorio"
                  value={formData.laboratorio_recomendado}
                  onChange={(e) => handleInputChange('laboratorio_recomendado', e.target.value)}
                  placeholder="Ej: Laboratorio Clínico XYZ"
                  disabled={submitLoading}
                />
              </div>

              <div className="form-group-estudio checkbox-group">
                <label htmlFor="ayunas" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="ayunas"
                    checked={formData.ayunas_requerido}
                    onChange={(e) => handleInputChange('ayunas_requerido', e.target.checked)}
                    disabled={submitLoading}
                  />
                  <span className="checkmark"></span>
                  🍽️ Requiere Ayunas
                </label>
              </div>

              <div className="form-group-estudio form-group-full">
                <label htmlFor="descripcion">📝 Descripción Detallada</label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder="Describe qué estudios específicos necesitas..."
                  rows="3"
                  disabled={submitLoading}
                />
              </div>

              <div className="form-group-estudio form-group-full">
                <label htmlFor="preparacion">🔧 Preparación Especial</label>
                <textarea
                  id="preparacion"
                  value={formData.preparacion_especial}
                  onChange={(e) => handleInputChange('preparacion_especial', e.target.value)}
                  placeholder="Instrucciones especiales para el paciente..."
                  rows="2"
                  disabled={submitLoading}
                />
              </div>

              <div className="form-group-estudio form-group-full">
                <label htmlFor="notas">📋 Notas Médicas</label>
                <textarea
                  id="notas"
                  value={formData.notas_medicas}
                  onChange={(e) => handleInputChange('notas_medicas', e.target.value)}
                  placeholder="Notas adicionales o justificación médica..."
                  rows="2"
                  disabled={submitLoading}
                />
              </div>
            </div>

            <div className="modal-actions-estudio">
              <button 
                type="button" 
                onClick={onClose}
                className="btn-cancelar-estudio"
                disabled={submitLoading}
              >
                ❌ Cancelar
              </button>
              <button 
                type="submit" 
                className={`btn-solicitar-estudio ${submitLoading ? 'loading' : ''}`}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <span className="spinner-btn"></span>
                    ⏳ Solicitando...
                  </>
                ) : (
                  '✅ Solicitar Estudio'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

// ===== COMPONENTE PRINCIPAL CON VISTA SIMPLIFICADA =====
const EstudiosLaboratorioSection = ({
  estudiosLaboratorio = [],
  loadingEstudios = false,
  formatearFecha,
  buildApiUrl,
  onSolicitarNuevo,
  onRecargar,
  getAuthHeaders
}) => {
  // Estados para modales del formulario personalizado
  const [modalNuevoEstudioOpen, setModalNuevoEstudioOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Estados para modales del sistema unificado
  const [modalVerEstudioOpen, setModalVerEstudioOpen] = useState(false);
  const [modalSubirResultadoOpen, setModalSubirResultadoOpen] = useState(false);
  const [estudioSeleccionado, setEstudioSeleccionado] = useState(null);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  
  // Estados para notificaciones
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');
  
  // Estados para modal de confirmación
  const [modalConfirmacionOpen, setModalConfirmacionOpen] = useState(false);
  const [datosConfirmacion, setDatosConfirmacion] = useState({});

  // Estados para el formulario de nuevo estudio
  const [formNuevoEstudio, setFormNuevoEstudio] = useState({
    tipo_estudio: '',
    descripcion: '',
    urgencia: 'normal',
    laboratorio_recomendado: '',
    notas_medicas: '',
    ayunas_requerido: false,
    preparacion_especial: ''
  });

  const handleFormChange = useCallback((field, value) => {
    setFormNuevoEstudio(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSolicitarNuevo = async () => {
    try {
      console.log('🚀 Iniciando solicitud de estudio...');
      console.log('📋 Form data:', formNuevoEstudio);
      
      setSubmitLoading(true);
      
      if (!formNuevoEstudio.tipo_estudio?.trim()) {
        alert('⚠️ Por favor selecciona un tipo de estudio');
        return;
      }

      console.log('✅ Validación pasada, llamando a onSolicitarNuevo...');
      
      const resultado = await onSolicitarNuevo(formNuevoEstudio);
      
      console.log('📡 Resultado de onSolicitarNuevo:', resultado);
      
      if (resultado !== false) {
        console.log('✅ Estudio solicitado exitosamente');
        
        setModalNuevoEstudioOpen(false);
        
        // Mostrar notificación de éxito con el sistema unificado
        setSuccessTitle('¡Estudio Solicitado Exitosamente!');
        setSuccessMessage(`El estudio "${formNuevoEstudio.tipo_estudio}" ha sido registrado correctamente en el sistema.`);
        setShowSuccessNotification(true);
        
        // Resetear formulario
        setFormNuevoEstudio({
          tipo_estudio: '',
          descripcion: '',
          urgencia: 'normal',
          laboratorio_recomendado: '',
          notas_medicas: '',
          ayunas_requerido: false,
          preparacion_especial: ''
        });
        
        if (onRecargar) {
          console.log('🔄 Recargando lista de estudios...');
          await onRecargar();
        }
      } else {
        console.error('❌ Error: onSolicitarNuevo retornó false');
      }
    } catch (error) {
      console.error('❌ Error en handleSolicitarNuevo:', error);
      alert('❌ Error al solicitar estudio: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubirResultado = async (estudio, archivo) => {
    try {
      setSubiendoArchivo(true);
      
      console.log('📤 Subiendo archivo:', archivo.name, 'para estudio:', estudio.id);
      
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('estudio_id', estudio.id);
      formData.append('fecha_realizacion', new Date().toISOString().split('T')[0]);

      const response = await fetch(buildApiUrl(`/estudios-laboratorio/${estudio.id}/resultado`), {
        method: 'POST',
        headers: getAuthHeaders ? {
          'Authorization': getAuthHeaders().Authorization
        } : {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir archivo');
      }

      const resultado = await response.json();
      console.log('✅ Archivo subido:', resultado);
      
      setModalSubirResultadoOpen(false);
      
      // Mostrar notificación de éxito
      setSuccessTitle('¡Resultado Subido Exitosamente!');
      setSuccessMessage(`El archivo "${archivo.name}" se ha subido correctamente para el estudio "${estudio.tipo_estudio}".`);
      setShowSuccessNotification(true);
      
      if (onRecargar) {
        await onRecargar();
      }
      
    } catch (error) {
      console.error('❌ Error al subir archivo:', error);
      alert(`❌ Error al subir archivo: ${error.message}`);
    } finally {
      setSubiendoArchivo(false);
    }
  };

  const abrirModalSubirResultado = (estudio) => {
    setEstudioSeleccionado(estudio);
    setModalSubirResultadoOpen(true);
  };

  const abrirModalVerEstudio = (estudio) => {
    setEstudioSeleccionado(estudio);
    setModalVerEstudioOpen(true);
  };

  // Render del estado de carga
  if (loadingEstudios) {
    return (
      <div className="loading-section-estudios">
        <div className="spinner-estudios"></div>
        <p>Cargando estudios de laboratorio...</p>
      </div>
    );
  }

  // Render cuando no hay estudios
  if (estudiosLaboratorio.length === 0) {
    return (
      <div className="seccion-vacia-estudios">
        <div className="icono-vacio-estudios">🔬</div>
        <h3>Sin Estudios de Laboratorio</h3>
        <p>Este paciente no tiene estudios de laboratorio registrados. Puedes solicitar el primer estudio haciendo clic en el botón de abajo.</p>
        
        <button 
          onClick={() => setModalNuevoEstudioOpen(true)}
          className="btn-primera-accion-estudios"
        >
          🔬 Solicitar Primer Estudio
        </button>

        <ModalNuevoEstudio
          isOpen={modalNuevoEstudioOpen}
          onClose={() => setModalNuevoEstudioOpen(false)}
          formData={formNuevoEstudio}
          onFormChange={handleFormChange}
          onSubmit={handleSolicitarNuevo}
          submitLoading={submitLoading}
        />

        {/* Notificación de éxito */}
        <SuccessNotificationModal
          isOpen={showSuccessNotification}
          onClose={() => setShowSuccessNotification(false)}
          title={successTitle}
          message={successMessage}
          autoClose={true}
          autoCloseDelay={4000}
          icon="🔬"
        />
      </div>
    );
  }

  // ===== RENDER PRINCIPAL CON VISTA SIMPLIFICADA =====
  return (
    <div className="seccion-completa-estudios">
      <div className="seccion-header-estudios">
        <h2>🔬 Estudios de Laboratorio ({estudiosLaboratorio.length})</h2>
        <div className="header-actions-estudios">
          <button 
            onClick={() => onRecargar && onRecargar()}
            className="btn-recargar-estudios"
            disabled={loadingEstudios}
            title="Recargar estudios"
          >
            🔄 Recargar
          </button>
          <button 
            onClick={() => setModalNuevoEstudioOpen(true)}
            className="btn-accion-estudios"
          >
            ➕ Solicitar Nuevo Estudio
          </button>
        </div>
      </div>

      {/* ===== LISTA SIMPLIFICADA ===== */}
      <div className="estudios-lista-simple">
        {estudiosLaboratorio.map((estudio) => (
          <div key={estudio.id} className="estudio-item-simple">
            
            {/* INFORMACIÓN BÁSICA - SOLO LO ESENCIAL */}
            <div className="estudio-info-basica">
              <div className="estudio-nombre">
                <h4>{estudio.tipo_estudio || 'Estudio General'}</h4>
                <span className={`estado-simple estado-${estudio.estado?.toLowerCase() || 'pendiente'}`}>
                  {estudio.estado || 'PENDIENTE'}
                </span>
              </div>
              
              <div className="estudio-fecha">
                <span className="fecha-label">📅 FECHA SOLICITUD:</span>
                <span className="fecha-valor">{formatearFecha(estudio.fecha_solicitud)}</span>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="estudio-acciones-simple">
              <button 
                onClick={() => abrirModalVerEstudio(estudio)}
                className="btn-ver-detalles-simple"
              >
                🔍 Ver Detalles
              </button>
              
              {estudio.archivo_resultado && (
                <a 
                  href={buildApiUrl(estudio.archivo_resultado)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-ver-resultado-simple"
                >
                  📄 Ver Resultado
                </a>
              )}
              
              {!estudio.archivo_resultado && (
                <button
                  onClick={() => abrirModalSubirResultado(estudio)}
                  className="btn-subir-resultado-simple"
                >
                  📤 Subir Resultado
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* MODAL PERSONALIZADO PARA NUEVO ESTUDIO */}
      <ModalNuevoEstudio
        isOpen={modalNuevoEstudioOpen}
        onClose={() => setModalNuevoEstudioOpen(false)}
        formData={formNuevoEstudio}
        onFormChange={handleFormChange}
        onSubmit={handleSolicitarNuevo}
        submitLoading={submitLoading}
      />

      {/* MODALES DEL SISTEMA UNIFICADO */}
      <EstudioDetallesModal
        isOpen={modalVerEstudioOpen}
        onClose={() => setModalVerEstudioOpen(false)}
        estudio={estudioSeleccionado}
        formatearFecha={formatearFecha}
        buildApiUrl={buildApiUrl}
      />

      <SubirResultadoModal
        isOpen={modalSubirResultadoOpen}
        onClose={() => setModalSubirResultadoOpen(false)}
        estudio={estudioSeleccionado}
        formatearFecha={formatearFecha}
        onSubirResultado={handleSubirResultado}
      />

      {/* NOTIFICACIONES DE ÉXITO */}
      <SuccessNotificationModal
        isOpen={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title={successTitle}
        message={successMessage}
        autoClose={true}
        autoCloseDelay={4000}
        icon="✅"
      />
    </div>
  );
};

ModalNuevoEstudio.displayName = 'ModalNuevoEstudio';

export default EstudiosLaboratorioSection;