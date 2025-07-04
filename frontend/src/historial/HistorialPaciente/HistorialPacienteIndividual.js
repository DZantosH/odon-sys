import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { buildApiUrl } from '../../config/config.js';
import { useAuth } from '../../services/AuthContext.js';
import ConfirmacionModalEstudio, { useConfirmacionEstudio } from '../../components/ConfirmacionModalEstudio.jsx';
import RadiografiasSection from './RadiografiasSection.js';
import CitasHistorialSection from './CitasHistorialSection.js';
import ConsultaActual from './ConsultaActual.js';
import '../../css/HistorialPacienteIndividual.css';
import { cargarHistorialPaciente, debugHistorialPaciente } from '../../services/historialService';
import { FotoActualizadaModal } from '../../components/modals/ModalSystem';
import EstudiosLaboratorioSection from '../../components/EstudiosLaboratorioSection';
import DentalLoading from '../../components/DentalLoading';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    
    if (!formData.tipo_estudio.trim()) {
      alert('⚠️ Por favor selecciona un tipo de estudio');
      return;
    }

    await onSubmit();
  };

  const handleInputChange = useCallback((field, value) => {
    onFormChange(field, value);
  }, [onFormChange]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>🔬 Solicitar Nuevo Estudio de Laboratorio</h2>
          <button 
            onClick={onClose}
            className="close-btn"
            disabled={submitLoading}
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
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

              <div className="form-group">
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

              <div className="form-group">
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

              <div className="form-group">
                <label htmlFor="ayunas">
                  <input
                    type="checkbox"
                    id="ayunas"
                    checked={formData.ayunas_requerido}
                    onChange={(e) => handleInputChange('ayunas_requerido', e.target.checked)}
                    disabled={submitLoading}
                  />
                  🍽️ Requiere Ayunas
                </label>
              </div>

              <div className="form-group form-group-full">
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

              <div className="form-group form-group-full">
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

              <div className="form-group form-group-full">
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

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={onClose}
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
                {submitLoading ? '⏳ Solicitando...' : '✅ Solicitar Estudio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

const HistorialPacienteIndividual = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate(); // ✅ CORREGIDO: Hook importado correctamente
  const location = useLocation(); // ✅ CORREGIDO: Hook importado correctamente
  const { user } = useAuth();
  const { confirmacion, mostrarConfirmacion, ocultarConfirmacion } = useConfirmacionEstudio();

  // RECIBIR DATOS PASADOS DESDE LA NAVEGACIÓN
  const pacienteDesdeBuscador = location.state?.paciente;
  
  // Estados principales
  const [paciente, setPaciente] = useState(pacienteDesdeBuscador || null);
  const [historial, setHistorial] = useState([]);
  const [historialSeleccionado, setHistorialSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('historial'); // ✅ CORREGIDO: useState definido correctamente

  // Estados para las nuevas secciones
  const [estudiosLaboratorio, setEstudiosLaboratorio] = useState([]);
  const [radiografias, setRadiografias] = useState([]);
  const [citasHistorial, setCitasHistorial] = useState([]);
  const [loadingRadiografias, setLoadingRadiografias] = useState(false);
  const [loadingEstudios, setLoadingEstudios] = useState(false);
  const [loadingCitas, setLoadingCitas] = useState(false);

  // Estados para modales de estudios
  const [submitLoading, setSubmitLoading] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [modalFotoOpen, setModalFotoOpen] = useState(false);

  // ✅ ESTADOS PARA LOADING DENTAL - AGREGAR ESTOS
const [showDentalLoading, setShowDentalLoading] = useState(false);
const [loadingMessage, setLoadingMessage] = useState("Preparando consulta...");
const [loadingSubmessage, setLoadingSubmessage] = useState("Cargando información del paciente");

  console.log('🆔 pacienteId:', pacienteId, 'tipo:', typeof pacienteId);
  console.log('📊 Vista activa:', vistaActiva);
  
  const idInvalido = !pacienteId || pacienteId === 'undefined';

useEffect(() => {
  console.log('🔍 [DEBUG] useEffect ejecutándose...');
  const estadoNavegacion = location.state;
  console.log('🔍 [DEBUG] Estado de navegación COMPLETO:', estadoNavegacion);
  console.log('🔍 [DEBUG] location.state:', location.state);
  console.log('🔍 [DEBUG] origen:', estadoNavegacion?.origen);
  console.log('🔍 [DEBUG] consultaIniciada:', estadoNavegacion?.consultaIniciada);
  
  if (estadoNavegacion) {
    console.log('🧭 Navegación detectada desde:', estadoNavegacion.origen);
    console.log('📋 Estado de navegación:', estadoNavegacion);
    
    // MOSTRAR LOADING DENTAL SI VIENE DE CITAS DEL DÍA
    if (estadoNavegacion.origen === 'citas-del-dia' && estadoNavegacion.consultaIniciada) {
      console.log('🦷 Mostrando loading dental para consulta iniciada');
      setShowDentalLoading(true);
      setLoadingMessage("Iniciando consulta odontológica");
      setLoadingSubmessage(`Preparando historial de ${estadoNavegacion.paciente?.nombre || 'paciente'}`);
    } else {
      console.log('❌ [DEBUG] No se cumple la condición para loading dental');
      console.log('❌ [DEBUG] origen es "citas-del-dia"?', estadoNavegacion.origen === 'citas-del-dia');
      console.log('❌ [DEBUG] consultaIniciada es true?', estadoNavegacion.consultaIniciada === true);
    }
    
    // CAMBIAR VISTA INICIAL DESPUÉS DEL LOADING DENTAL
    if (estadoNavegacion.vistaInicial) {
      console.log('🎯 Cambiando a vista inicial:', estadoNavegacion.vistaInicial);
      setTimeout(() => {
        setVistaActiva(estadoNavegacion.vistaInicial);
      }, estadoNavegacion.consultaIniciada ? 3500 : 0);
    }
    
    if (estadoNavegacion.consultaIniciada) {
      console.log('🩺 Consulta iniciada - configurando experiencia de bienvenida');
    }
  } else {
    console.log('❌ [DEBUG] No hay estado de navegación');
  }
}, [location.state]);

  // ✅ FUNCIÓN PARA MANEJAR NAVEGACIÓN DE REGRESO - AGREGADA
  const handleRegresarAPanel = useCallback(() => {
    const estadoNavegacion = location.state;
    
    if (estadoNavegacion?.origen === 'citas-del-dia') {
      navigate('/panel-principal');
    } else {
      navigate('/pacientes');
    }
  }, [navigate, location.state]);

  // ✅ FUNCIÓN PARA COMPLETAR LOADING DENTAL
const handleDentalLoadingComplete = useCallback(() => {
  console.log('✅ Loading dental completado');
  setShowDentalLoading(false);
}, []);

  // === FUNCIONES DE UTILIDAD ===
  
  const generarIniciales = (paciente) => {
    if (!paciente) return 'MG';
    
    const nombre = paciente.nombre || '';
    const apellidoPaterno = paciente.apellido_paterno || '';
    
    return (nombre.charAt(0) + apellidoPaterno.charAt(0)).toUpperCase() || 'PA';
  };

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  const cargarRadiografias = useCallback(async () => {
    try {
      setLoadingRadiografias(true);
      console.log('📸 Cargando radiografías para paciente:', pacienteId);
      
      const response = await fetch(buildApiUrl(`/radiografias/paciente/${pacienteId}`), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        const radiografiasOrdenadas = data.sort((a, b) => 
          new Date(b.fecha_solicitud || b.fecha_estudio) - new Date(a.fecha_solicitud || a.fecha_estudio)
        );
        setRadiografias(radiografiasOrdenadas);
        console.log('✅ Radiografías cargadas:', radiografiasOrdenadas.length);
      } else if (response.status === 404) {
        console.log('ℹ️ No hay radiografías para este paciente');
        setRadiografias([]);
      } else {
        console.warn('⚠️ Error al cargar radiografías:', response.status);
        setRadiografias([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar radiografías:', error);
      setRadiografias([]);
    } finally {
      setLoadingRadiografias(false);
    }
  }, [pacienteId, getAuthHeaders]);

  const cargarEstudiosLaboratorio = useCallback(async () => {
    try {
      setLoadingEstudios(true);
      console.log('🔬 Cargando estudios de laboratorio para paciente:', pacienteId);
      
      const response = await fetch(buildApiUrl(`/estudios-laboratorio/paciente/${pacienteId}`), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        const estudiosOrdenados = data.sort((a, b) => 
          new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud)
        );
        setEstudiosLaboratorio(estudiosOrdenados);
        console.log('✅ Estudios cargados desde API:', estudiosOrdenados.length);
      } else if (response.status === 404) {
        console.log('ℹ️ No hay estudios de laboratorio para este paciente');
        setEstudiosLaboratorio([]);
      } else {
        console.warn('⚠️ Error al cargar estudios:', response.status);
        setEstudiosLaboratorio([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar estudios:', error);
      setEstudiosLaboratorio([]);
    } finally {
      setLoadingEstudios(false);
    }
  }, [pacienteId, getAuthHeaders]);

  const cargarCitasHistorial = useCallback(async () => {
    try {
      setLoadingCitas(true);
      console.log('📅 Cargando historial de citas para paciente:', pacienteId);
      
      try {
        const updateResponse = await fetch(buildApiUrl('/citas/actualizar-estados'), {
          method: 'POST',
          headers: getAuthHeaders()
        });
        
        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log('🤖 Estados actualizados automáticamente:', updateResult);
        }
      } catch (autoUpdateError) {
        console.warn('⚠️ Error en auto-actualización:', autoUpdateError);
      }
      
      const response = await fetch(buildApiUrl(`/citas?paciente_id=${pacienteId}`), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('📡 Respuesta completa de citas:', responseData);
        
        const citasData = responseData.data || responseData.citas || responseData;
        
        if (Array.isArray(citasData)) {
          const citasOrdenadas = citasData.sort((a, b) => {
            const fechaA = new Date(`${a.fecha_cita} ${a.hora_cita || '00:00'}`);
            const fechaB = new Date(`${b.fecha_cita} ${b.hora_cita || '00:00'}`);
            return fechaB - fechaA;
          });
          
          setCitasHistorial(citasOrdenadas);
          console.log('✅ Citas cargadas:', citasOrdenadas.length);
        } else {
          console.warn('⚠️ Formato de respuesta inesperado:', responseData);
          setCitasHistorial([]);
        }
      } else if (response.status === 404) {
        console.log('ℹ️ No hay citas para este paciente');
        setCitasHistorial([]);
      } else {
        console.warn('⚠️ Error al cargar citas:', response.status);
        setCitasHistorial([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar citas:', error);
      setCitasHistorial([]);
    } finally {
      setLoadingCitas(false);
    }
  }, [pacienteId, getAuthHeaders]);

  useEffect(() => {
    if (vistaActiva !== 'citas' || citasHistorial.length === 0) return;
    
    const intervalo = setInterval(() => {
      console.log('⏰ Verificando estados de citas automáticamente...');
      cargarCitasHistorial();
    }, 60000);
    
    return () => clearInterval(intervalo);
  }, [vistaActiva, citasHistorial.length, cargarCitasHistorial]);

const cargarHistorialClinico = useCallback(async () => {
  try {
    console.log('📋 === CARGANDO HISTORIAL CLÍNICO ===');
    console.log('🆔 Paciente ID:', pacienteId, 'tipo:', typeof pacienteId);
    
    if (!pacienteId || pacienteId === 'undefined') {
      console.error('❌ ID de paciente inválido:', pacienteId);
      setHistorial([]);
      return;
    }

    // ✅ USAR EL SERVICIO CORREGIDO
    const historialArray = await cargarHistorialPaciente(pacienteId);
    
    console.log('📊 Historiales cargados:', historialArray.length);
    
    if (historialArray.length > 0) {
      console.log('✅ ¡HISTORIALES ENCONTRADOS!');
      console.log('📋 Primer historial:', historialArray[0]);
      
      // Ordenar por fecha
      historialArray.sort((a, b) => {
        const fechaA = new Date(a.fecha_consulta || a.created_at);
        const fechaB = new Date(b.fecha_consulta || b.created_at);
        return fechaB - fechaA;
      });
      
      setHistorial(historialArray);
      setHistorialSeleccionado(historialArray[0]);
    } else {
      console.log('⚠️ No se encontraron historiales');
      setHistorial([]);
      
      // ✅ EJECUTAR DEBUG PARA VER QUÉ PASA
      const debug = await debugHistorialPaciente(pacienteId);
      if (debug) {
        console.log('🔍 Info de debug:', debug);
      }
    }
    
  } catch (error) {
    console.error('❌ Error al cargar historial clínico:', error);
    setHistorial([]);
  }
}, [pacienteId]);

// ✅ AGREGAR FUNCIÓN DE DEBUG EN EL BOTÓN "Debug Info"
const handleDebugInfo = async () => {
  console.log('🔍 === EJECUTANDO DEBUG ===');
  
  const debug = await debugHistorialPaciente(pacienteId);
  
  if (debug) {
    const mensaje = `
🔍 DEBUG HISTORIAL PACIENTE ${pacienteId}

👤 Paciente existe: ${debug.paciente.existe ? 'SÍ' : 'NO'}
📋 Historiales en BD: ${debug.historial_clinico.count}

${debug.historial_clinico.count === 0 ? 
  '❌ PROBLEMA: No hay historiales en la base de datos\n💡 SOLUCIÓN: Completar un nuevo historial clínico' :
  '✅ DATOS ENCONTRADOS en la base de datos\n📋 Frontend debería mostrar estos historiales'
}

🔗 Endpoints disponibles:
• Guardar: ${debug.endpoints_disponibles.guardar}
• Obtener: ${debug.endpoints_disponibles.obtener}
• Debug: ${debug.endpoints_disponibles.debug}

📊 Datos en BD:
${JSON.stringify(debug.historial_clinico.data, null, 2)}
    `;
    
    alert(mensaje);
    console.log('🔍 Debug completo:', debug);
  } else {
    alert('❌ No se pudo obtener información de debug');
  }
};

  // ✅ AGREGAR DEPENDENCIAS FALTANTES AL useEffect
  useEffect(() => {
    const cargarDatos = async () => {
      if (!pacienteId || pacienteId === 'undefined') {
        console.log('❌ ID de paciente inválido:', pacienteId);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Iniciando carga de datos para paciente:', pacienteId);
        
        console.log('🔍 Cargando datos del paciente desde API...');
        
        const pacienteResponse = await fetch(buildApiUrl(`/pacientes/${pacienteId}`), {
          headers: getAuthHeaders()
        });
        
        console.log('📡 Respuesta API paciente:', pacienteResponse.status);
        
        if (pacienteResponse.ok) {
          const pacienteData = await pacienteResponse.json();
          
          console.log('🔍 === DATOS DESDE API ===');
          console.log('📋 Paciente completo:', JSON.stringify(pacienteData, null, 2));
          console.log('🏠 calle_numero:', pacienteData.calle_numero);
          console.log('🆔 numero_seguridad_social:', pacienteData.numero_seguridad_social);
          console.log('📋 matricula:', pacienteData.matricula);
          console.log('🔍 === FIN DEBUG API ===');
          
          setPaciente(pacienteData);
        } else {
          console.log('⚠️ Error al cargar datos del paciente');
          if (pacienteDesdeBuscador) {
            setPaciente(pacienteDesdeBuscador);
          }
        }
        
        await cargarHistorialClinico();
        
        await Promise.all([
          cargarRadiografias(),
          cargarEstudiosLaboratorio(),
          cargarCitasHistorial()
        ]);
        
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [
    pacienteId, 
    pacienteDesdeBuscador, // ✅ AGREGADO
    getAuthHeaders, 
    cargarHistorialClinico, 
    cargarRadiografias, 
    cargarEstudiosLaboratorio, 
    cargarCitasHistorial
  ]);

  // Resto de las funciones permanecen igual...
  const formatearFecha = useCallback((fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const formatearFechaHora = useCallback((fecha, hora) => {
    if (!fecha) return 'No especificada';
    const fechaFormateada = formatearFecha(fecha);
    return hora ? `${fechaFormateada} a las ${hora}` : fechaFormateada;
  }, [formatearFecha]);

  // ✅ RESTO DEL COMPONENTE PERMANECE IGUAL...
  // (Las demás funciones están correctas, solo necesitaban las correcciones de arriba)

  // Función para subir foto del avatar
  const subirFotoAvatar = useCallback(async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('⚠️ Solo se permiten imágenes');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('⚠️ Archivo muy grande (máx 5MB)');
      return;
    }

    try {
      setSubiendoFoto(true);
      
      console.log('📸 Subiendo archivo:', file.name);
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch(buildApiUrl(`/pacientes/${pacienteId}/avatar`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      console.log('📡 Respuesta:', response.status);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error ${response.status}: ${error}`);
      }

      const resultado = await response.json();
      console.log('✅ Resultado:', resultado);

      setPaciente(prev => ({
        ...prev,
        foto_avatar: resultado.data?.foto_avatar,
        tiene_avatar: true
      }));

      setModalFotoOpen(true);

    } catch (error) {
      console.error('❌ Error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSubiendoFoto(false);
    }
  }, [pacienteId]);

  const handleAvatarChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      subirFotoAvatar(file);
    }
    event.target.value = '';
  }, [subirFotoAvatar]);

  // Resto del componente...
  const renderAvatar = () => {
    console.log('🖼️ Renderizando avatar:', {
      foto_avatar: paciente?.foto_avatar,
      subiendoFoto: subiendoFoto
    });

    return (
      <div className="avatar-container">
        <div 
          className={`avatar-paciente ${subiendoFoto ? 'uploading' : ''}`}
          onClick={() => {
            if (!subiendoFoto) {
              document.getElementById('avatar-file-input').click();
            }
          }}
          title={subiendoFoto ? "Subiendo foto..." : "Haz clic para cambiar la foto del avatar"}
        >
          {subiendoFoto ? (
            <div className="spinner-avatar">⏳ Subiendo...</div>
          ) : paciente?.foto_avatar ? (
            <img 
              src={`/uploads/avatars/${paciente.foto_avatar.split('/').pop()}?t=${Date.now()}`}
              alt={`Avatar de ${paciente.nombre}`}
              className="avatar-imagen"
              onError={(e) => {
                console.error('❌ Error cargando imagen:', e.target.src);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          <div 
            className="avatar-iniciales"
            style={{ 
              display: paciente?.foto_avatar && !subiendoFoto ? 'none' : 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {generarIniciales(paciente)}
          </div>
          
          {!subiendoFoto && <div className="avatar-estado-online"></div>}
        </div>

        <input
          type="file"
          id="avatar-file-input"
          className="avatar-file-input"
          accept="image/*"
          onChange={handleAvatarChange}
          disabled={subiendoFoto}
          style={{ display: 'none' }}
        />
      </div>
    );
  };

  const calcularEdad = useCallback((fechaNacimiento) => {
    if (!fechaNacimiento) return 'No especificada';
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }, []);

  // Función para renderizar el header minimalista
  const renderHeaderMinimalista = () => {
    if (!paciente) {
      return (
        <div className="header-paciente-minimalista">
          <button 
            onClick={handleRegresarAPanel} // ✅ CORREGIDO: Usar función de navegación
            className="btn-regresar-minimalista"
          >
            ← Regresar
          </button>
          <div className="header-minimalista-content">
            <div className="loading">Cargando información del paciente...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="header-paciente-minimalista">
        <button 
          onClick={handleRegresarAPanel} // ✅ CORREGIDO: Usar función de navegación
          className="btn-regresar-minimalista"
        >
          ← Regresar
        </button>

        <div className="header-minimalista-content">
          {renderAvatar()}

          <div className="info-paciente-minimalista">
            <h1 className="nombre-paciente-principal">
              {`${paciente.nombre || 'Sin nombre'} ${paciente.apellido_paterno || ''} ${paciente.apellido_materno || ''}`.trim()}
            </h1>

            <div className="detalles-paciente-grid-expandido">
              <div className="detalle-item-minimalista">
                <span className="detalle-icono">🎂</span>
                <div className="detalle-contenido">
                  <span className="detalle-label">Edad</span>
                  <span className="detalle-valor">
                    {paciente.fecha_nacimiento ? `${calcularEdad(paciente.fecha_nacimiento)} años` : 'No especificada'}
                  </span>
                </div>
              </div>

              <div className="detalle-item-minimalista">
                <span className="detalle-icono">👤</span>
                <div className="detalle-contenido">
                  <span className="detalle-label">Sexo</span>
                  <span className="detalle-valor">
                    {paciente.sexo === 'M' ? 'Masculino' : 
                     paciente.sexo === 'F' ? 'Femenino' : 
                     'No especificado'}
                  </span>
                </div>
              </div>

              <div className="detalle-item-minimalista">
                <span className="detalle-icono">📅</span>
                <div className="detalle-contenido">
                  <span className="detalle-label">Fecha de Nacimiento</span>
                  <span className="detalle-valor">
                    {paciente.fecha_nacimiento ? formatearFecha(paciente.fecha_nacimiento) : 'No especificada'}
                  </span>
                </div>
              </div>

              <div className="detalle-item-minimalista">
                <span className="detalle-icono">📧</span>
                <div className="detalle-contenido">
                  <span className="detalle-label">Email</span>
                  <span className="detalle-valor">
                    {paciente.correo_electronico || 'No proporcionado'}
                  </span>
                </div>
              </div>

              <div className="detalle-item-minimalista">
                <span className="detalle-icono">📞</span>
                <div className="detalle-contenido">
                  <span className="detalle-label">Teléfono</span>
                  <span className="detalle-valor">
                    {paciente.telefono || 'No proporcionado'}
                  </span>
                </div>
              </div>

              <div className="detalle-item-minimalista">
                <span className="detalle-icono">🏠</span>
                <div className="detalle-contenido">
                  <span className="detalle-label">Dirección</span>
                  <span className="detalle-valor">
                    {paciente.calle_numero || paciente.direccion || 'No proporcionada'}
                  </span>
                </div>
              </div>

              <div className="detalle-item-minimalista">
                <span className="detalle-icono">🆔</span>
                <div className="detalle-contenido">
                  <span className="detalle-label">Seguridad Social</span>
                  <span className="detalle-valor">
                    {paciente.numero_seguridad_social || 'No proporcionado'}
                  </span>
                </div>
              </div>

              <div className="detalle-item-minimalista">
                <span className="detalle-icono">📋</span>
                <div className="detalle-contenido">
                  <span className="detalle-label">Matrícula</span>
                  <span className="detalle-valor">
                    {paciente.matricula || 'No asignada'}
                  </span>
                </div>
              </div>

              <div className="detalle-item-minimalista">
                <span className="detalle-icono">💳</span>
                <div className="detalle-contenido">
                  <span className="detalle-label">ID Paciente</span>
                  <span className="detalle-valor">#{paciente.id || 'Sin ID'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="estadisticas-paciente">
            <div className="estadistica-card">
              <span className="estadistica-numero">{historial?.length || 0}</span>
              <span className="estadistica-label">CONSULTAS</span>
            </div>
            
            <div className="estadistica-card">
              <span className="estadistica-numero">{radiografias?.length || 0}</span>
              <span className="estadistica-label">RADIOGRAFÍAS</span>
            </div>
            
            <div className="estadistica-card">
              <span className="estadistica-numero">{estudiosLaboratorio?.length || 0}</span>
              <span className="estadistica-label">ESTUDIOS</span>
            </div>
            
            <div className="estadistica-card">
              <span className="estadistica-numero">{citasHistorial?.length || 0}</span>
              <span className="estadistica-label">CITAS</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Función para solicitar nuevo estudio
const solicitarNuevoEstudio = useCallback(async (formData) => {
  try {
    setSubmitLoading(true);
    
    if (!formData.tipo_estudio.trim()) {
      throw new Error('El tipo de estudio es requerido');
    }

    if (!pacienteId) {
      throw new Error('ID de paciente no válido');
    }

    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    const response = await fetch(buildApiUrl('/estudios-laboratorio'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...formData,
        paciente_id: parseInt(pacienteId),
        doctor_id: user.id,
        fecha_solicitud: new Date().toISOString().split('T')[0],
        estado: 'pendiente'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const nuevoEstudio = await response.json();
    console.log('✅ Estudio solicitado exitosamente:', nuevoEstudio);

    await cargarEstudiosLaboratorio();

    if (mostrarConfirmacion) {
      await mostrarConfirmacion({
        type: 'success',
        title: '¡Estudio Solicitado!',
        message: `El estudio "${nuevoEstudio.tipo_estudio}" ha sido solicitado exitosamente para el paciente.`,
        details: {
          tipo_estudio: nuevoEstudio.tipo_estudio,
          laboratorio: formData.laboratorio_recomendado || 'No especificado',
          urgencia: formData.urgencia,
          fecha: new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          estado: 'Pendiente'
        },
        confirmText: 'Aceptar',
        cancelText: 'Ver Detalles',
        showCancel: true
      });
    }

    return true; // ✅ IMPORTANTE: Retornar true en caso de éxito

  } catch (error) {
    console.error('❌ Error al solicitar estudio:', error);
    
    if (mostrarConfirmacion) {
      await mostrarConfirmacion({
        type: 'error',
        title: '❌ Error al Solicitar Estudio',
        message: error.message,
        confirmText: 'Entendido',
        showCancel: false
      });
    }

    return false; // ✅ IMPORTANTE: Retornar false en caso de error
  } finally {
    setSubmitLoading(false);
  }
}, [pacienteId, user?.id, getAuthHeaders, cargarEstudiosLaboratorio, mostrarConfirmacion]);

  // Función para actualizar estado de citas
  const actualizarEstadoCita = useCallback(async (citaId, nuevoEstado) => {
    try {
      console.log('🔄 Actualizando estado de cita:', citaId, 'a:', nuevoEstado);
      
      setCitasHistorial(prevCitas => 
        prevCitas.map(cita => 
          cita.id === citaId 
            ? { ...cita, estado: nuevoEstado }
            : cita
        )
      );
      
      await cargarCitasHistorial();
      
      console.log('✅ Estado de cita actualizado exitosamente');
    } catch (error) {
      console.error('❌ Error al actualizar estado de cita:', error);
      await cargarCitasHistorial();
    }
  }, [cargarCitasHistorial]);

  // Función para solicitar nueva radiografía
  const solicitarNuevaRadiografia = useCallback(async (formData) => {
    try {
      console.log('📸 Solicitando nueva radiografía:', formData);

      if (!formData.tipo_radiografia.trim()) {
        throw new Error('El tipo de radiografía es requerido');
      }

      if (!pacienteId) {
        throw new Error('ID de paciente no válido');
      }

      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(buildApiUrl('/radiografias'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          paciente_id: parseInt(pacienteId),
          doctor_id: user.id,
          fecha_solicitud: new Date().toISOString().split('T')[0],
          estado: 'pendiente'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const nuevaRadiografia = await response.json();
      console.log('✅ Radiografía solicitada exitosamente:', nuevaRadiografia);

      await cargarRadiografias();

      if (mostrarConfirmacion) {
        await mostrarConfirmacion({
          type: 'success',
          title: '¡Radiografía Solicitada!',
          message: `La radiografía "${nuevaRadiografia.tipo_radiografia}" ha sido solicitada exitosamente.`,
          details: {
            tipo_estudio: nuevaRadiografia.tipo_radiografia,
            zona: formData.zona_anatomica || 'No especificada',
            urgencia: formData.urgencia,
            fecha: new Date().toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            estado: 'Pendiente'
          },
          confirmText: 'Aceptar',
          cancelText: 'Ver Detalles',
          showCancel: true
        });
      } else {
        alert(`✅ Radiografía "${nuevaRadiografia.tipo_radiografia}" solicitada exitosamente`);
      }

      return true;

    } catch (error) {
      console.error('❌ Error al solicitar radiografía:', error);
      
      if (mostrarConfirmacion) {
        await mostrarConfirmacion({
          type: 'error',
          title: '❌ Error al Solicitar Radiografía',
          message: error.message,
          confirmText: 'Entendido',
          showCancel: false
        });
      } else {
        alert(`❌ Error al solicitar radiografía: ${error.message}`);
      }

      return false;
    }
  }, [pacienteId, user?.id, getAuthHeaders, cargarRadiografias, mostrarConfirmacion]);

  // Función para renderizar historial clínico
  const renderHistorialClinico = () => {
    if (historial.length === 0) {
      return (
        <div className="historial-vacio-container">
          <div className="historial-vacio-icono">📋</div>
          <h2 className="historial-vacio-titulo">Sin Historial Clínico</h2>
          <p className="historial-vacio-descripcion">
            Este paciente aún no tiene registros de historial clínico visible. Los historiales aparecerán aquí una vez que se realicen consultas.
          </p>
          
          <div className="debug-actions" style={{ marginBottom: '20px' }}>
            <button 
              onClick={cargarHistorialClinico}
              className="btn-secundario"
              style={{ marginRight: '10px' }}
            >
              🔄 Recargar Historial
            </button>
            <button 
              onClick={() => {
                console.log('🔍 Estado actual:', {
                  pacienteId,
                  historial,
                  paciente,
                  token: localStorage.getItem('token') ? 'Presente' : 'Ausente'
                });
              }}
              className="btn-secundario"
            >
              🔍 Debug Info
            </button>
          </div>
          
          <div className="historial-vacio-acciones">
            <button 
              onClick={() => {
                console.log('🚀 Iniciando historial clínico para paciente:', pacienteId);
                console.log('📋 Datos del paciente:', paciente);
                
                navigate(`/historial-clinico/${pacienteId}`, {
                  state: { 
                    paciente: paciente,
                    origen: 'historial-individual',
                    timestamp: Date.now()
                  }
                });
              }} 
              className="btn-action-primary"
            >
              📋 Empezar Historial Clinico
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="historial-layout">
        <div className="sidebar-historial">
          <div className="sidebar-header">
            <h3>📋 Historiales Clínicos ({historial.length})</h3>
            <button 
              className="btn-generar-pdf"
              onClick={handleGenerarPDF}
              disabled={!historialSeleccionado}
              title={historialSeleccionado ? "Generar PDF del historial completo" : "Selecciona un historial para generar PDF"}
            >
              📄 {historialSeleccionado ? 'Generar PDF' : 'PDF'}
            </button>
          </div>
          
          <div className="lista-historiales">
            {historial.map((registro) => (
              <div
                key={registro.id}
                className={`item-historial ${historialSeleccionado?.id === registro.id ? 'activo' : ''}`}
                onClick={() => setHistorialSeleccionado(registro)}
              >
                <div className="fecha-historial">
                  {formatearFecha(registro.fecha_consulta)}
                </div>
                <div className="doctor-historial">
                  Dr. {registro.doctor_nombre}
                </div>
                <div className="tipo-cita">
                  {registro.tipo_cita || 'Consulta'}
                </div>
                <div className="estado-historial">
                  <span className={`estado ${registro.estado}`}>
                    {registro.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="contenido-historial">
          {historialSeleccionado ? (
            <>
              <div className="header-historial-seleccionado">
                <h2>Historial del {formatearFecha(historialSeleccionado.fecha_consulta)}</h2>
                <div className="info-consulta">
                  <span>👨‍⚕️ Dr. {historialSeleccionado.doctor_nombre}</span>
                  <span>📅 {historialSeleccionado.tipo_cita}</span>
                  <span className={`estado ${historialSeleccionado.estado}`}>
                    {historialSeleccionado.estado}
                  </span>
                </div>
              </div>

              <div className="nav-vistas">
                <button
                  className={vistaActiva === 'resumen' ? 'activo' : ''}
                  onClick={() => setVistaActiva('resumen')}
                >
                  📄 Resumen
                </button>
                <button
                  className={vistaActiva === 'antecedentes' ? 'activo' : ''}
                  onClick={() => setVistaActiva('antecedentes')}
                >
                  👨‍👩‍👧‍👦 Antecedentes
                </button>
                <button
                  className={vistaActiva === 'examenes' ? 'activo' : ''}
                  onClick={() => setVistaActiva('examenes')}
                >
                  🔍 Exámenes
                </button>
                <button
                  className={vistaActiva === 'completo' ? 'activo' : ''}
                  onClick={() => setVistaActiva('completo')}
                >
                  📋 Vista Completa
                </button>
              </div>

              <div className="contenido-vista">
                {renderContenidoHistorialOriginal()}
              </div>
            </>
          ) : (
            <div className="sin-historial-seleccionado">
              <div className="mensaje-seleccionar">
                <div className="icono-seleccionar">👈</div>
                <h3>Selecciona un historial</h3>
                <p>Elige una consulta de la lista lateral para ver los detalles completos del historial clínico.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Función para renderizar el contenido original del historial
 // CORRECCIÓN PARA LOS ERRORES DE SINTAXIS
// Busca la función renderContenidoHistorialOriginal y reemplázala COMPLETA por esta versión corregida:

const renderContenidoHistorialOriginal = () => {
  if (!historialSeleccionado) return null;

  // ✅ FUNCIÓN PARA PARSEAR DATOS JSON
  const parsearDatosJSON = (datos, fallback = {}) => {
    try {
      if (typeof datos === 'string' && datos.startsWith('{')) {
        return JSON.parse(datos);
      }
      if (typeof datos === 'object' && datos !== null) {
        return datos;
      }
      return fallback;
    } catch (error) {
      console.warn('Error parseando JSON:', error);
      return fallback;
    }
  };

  // ✅ FUNCIÓN MEJORADA PARA MOTIVO DE CONSULTA
  const renderMotivoConsulta = () => {
    const motivoData = parsearDatosJSON(historialSeleccionado.motivo_consulta, {});

    return (
      <div className="seccion-historial">
        <h3>🗣️ Motivo de Consulta</h3>
        <div className="contenido-seccion">
          
          {motivoData.motivo_principal && (
            <div className="campo">
              <strong>Motivo Principal:</strong>
              <p>{motivoData.motivo_principal}</p>
            </div>
          )}

          {(motivoData.descripcion && !motivoData.motivo_principal) && (
            <div className="campo">
              <strong>Descripción:</strong>
              <p>{motivoData.descripcion}</p>
            </div>
          )}

          {!motivoData.motivo_principal && !motivoData.descripcion && historialSeleccionado.motivo_consulta_texto && (
            <div className="campo">
              <strong>Descripción:</strong>
              <p>{historialSeleccionado.motivo_consulta_texto}</p>
            </div>
          )}

          {motivoData.padecimiento_actual && (
            <div className="campo">
              <strong>Padecimiento Actual:</strong>
              <p>{motivoData.padecimiento_actual}</p>
            </div>
          )}

          {(motivoData.inicio_sintomas || motivoData.tipo_dolor || motivoData.intensidad_dolor || motivoData.urgencia || motivoData.evolucion) && (
            <div className="sintomas-grid">
              {motivoData.inicio_sintomas && (
                <div className="campo-inline">
                  <strong>Inicio:</strong>
                  <span>{motivoData.inicio_sintomas}</span>
                </div>
              )}

              {motivoData.tipo_dolor && (
                <div className="campo-inline">
                  <strong>Tipo de dolor:</strong>
                  <span>{motivoData.tipo_dolor}</span>
                </div>
              )}

              {motivoData.intensidad_dolor && (
                <div className="campo-inline">
                  <strong>Intensidad:</strong>
                  <span>{motivoData.intensidad_dolor}/10</span>
                </div>
              )}

              {motivoData.urgencia && (
                <div className="campo-inline">
                  <strong>Urgencia:</strong>
                  <span className={`urgencia-${motivoData.urgencia}`}>
                    {motivoData.urgencia === 'alta' ? '🔴 Alta' : 
                     motivoData.urgencia === 'media' ? '🟡 Media' : 
                     motivoData.urgencia === 'baja' ? '🟢 Baja' : motivoData.urgencia}
                  </span>
                </div>
              )}

              {motivoData.evolucion && (
                <div className="campo-inline">
                  <strong>Evolución:</strong>
                  <span>{motivoData.evolucion}</span>
                </div>
              )}
            </div>
          )}

          {motivoData.factores_desencadenantes && Array.isArray(motivoData.factores_desencadenantes) && (
            <div className="campo">
              <strong>Factores Desencadenantes:</strong>
              <ul className="lista-sintomas">
                {motivoData.factores_desencadenantes.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </div>
          )}

          {motivoData.sintomas_asociados && Array.isArray(motivoData.sintomas_asociados) && (
            <div className="campo">
              <strong>Síntomas Asociados:</strong>
              <ul className="lista-sintomas">
                {motivoData.sintomas_asociados.map((sintoma, index) => (
                  <li key={index}>{sintoma}</li>
                ))}
              </ul>
            </div>
          )}

          {motivoData.tratamientos_previos && (
            <div className="campo">
              <strong>Tratamientos Previos:</strong>
              <p>{motivoData.tratamientos_previos}</p>
              {motivoData.efectividad_tratamiento && (
                <p><em>Efectividad: {motivoData.efectividad_tratamiento}</em></p>
              )}
            </div>
          )}

        </div>
      </div>
    );
  };

  // ✅ FUNCIÓN PARA ANTECEDENTES
  const renderAntecedentes = () => {
    const antecedentesHF = parsearDatosJSON(historialSeleccionado.antecedentes_heredo_familiares, {});
    const antecedentesNP = parsearDatosJSON(historialSeleccionado.antecedentes_personales_no_patologicos, {});
    const antecedentesPP = parsearDatosJSON(historialSeleccionado.antecedentes_personales_patologicos, {});

    return (
      <div className="antecedentes-section">
        {Object.keys(antecedentesHF).length > 0 && (
          <div className="seccion-historial">
            <h3>👨‍👩‍👧‍👦 Antecedentes Heredo-Familiares</h3>
            <div className="contenido-seccion">
              <div className="antecedentes-grid">
                {antecedentesHF.padre && (
                  <div className="antecedente-item">
                    <strong>👨 Padre:</strong>
                    <span>{Array.isArray(antecedentesHF.padre) ? antecedentesHF.padre.join(', ') : antecedentesHF.padre}</span>
                  </div>
                )}
                {antecedentesHF.madre && (
                  <div className="antecedente-item">
                    <strong>👩 Madre:</strong>
                    <span>{Array.isArray(antecedentesHF.madre) ? antecedentesHF.madre.join(', ') : antecedentesHF.madre}</span>
                  </div>
                )}
                {antecedentesHF.hermanos && (
                  <div className="antecedente-item">
                    <strong>👫 Hermanos:</strong>
                    <span>{Array.isArray(antecedentesHF.hermanos) ? antecedentesHF.hermanos.join(', ') : antecedentesHF.hermanos}</span>
                  </div>
                )}
                {antecedentesHF.abuelos_paternos && (
                  <div className="antecedente-item">
                    <strong>👴👵 Abuelos Paternos:</strong>
                    <span>{Array.isArray(antecedentesHF.abuelos_paternos) ? antecedentesHF.abuelos_paternos.join(', ') : antecedentesHF.abuelos_paternos}</span>
                  </div>
                )}
                {antecedentesHF.abuelos_maternos && (
                  <div className="antecedente-item">
                    <strong>👴👵 Abuelos Maternos:</strong>
                    <span>{Array.isArray(antecedentesHF.abuelos_maternos) ? antecedentesHF.abuelos_maternos.join(', ') : antecedentesHF.abuelos_maternos}</span>
                  </div>
                )}
                {antecedentesHF.tios && (
                  <div className="antecedente-item">
                    <strong>👨‍👩‍👧‍👦 Tíos:</strong>
                    <span>{Array.isArray(antecedentesHF.tios) ? antecedentesHF.tios.join(', ') : antecedentesHF.tios}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {Object.keys(antecedentesNP).length > 0 && (
          <div className="seccion-historial">
            <h3>🏃‍♂️ Antecedentes Personales No Patológicos</h3>
            <div className="contenido-seccion">
              <div className="antecedentes-grid">
                {antecedentesNP.higiene_personal && (
                  <div className="antecedente-item">
                    <strong>🧼 Higiene Personal:</strong>
                    <span>{antecedentesNP.higiene_personal}</span>
                  </div>
                )}
                {antecedentesNP.ejercicio && (
                  <div className="antecedente-item">
                    <strong>🏃‍♂️ Ejercicio:</strong>
                    <span>{antecedentesNP.ejercicio}</span>
                  </div>
                )}
                {antecedentesNP.alimentacion && (
                  <div className="antecedente-item">
                    <strong>🍎 Alimentación:</strong>
                    <span>{antecedentesNP.alimentacion}</span>
                  </div>
                )}
                {antecedentesNP.tabaquismo !== undefined && (
                  <div className="antecedente-item">
                    <strong>🚬 Tabaquismo:</strong>
                    <span>{antecedentesNP.tabaquismo ? 'Sí' : 'No'}</span>
                  </div>
                )}
                {antecedentesNP.alcoholismo !== undefined && (
                  <div className="antecedente-item">
                    <strong>🍺 Alcoholismo:</strong>
                    <span>{antecedentesNP.alcoholismo ? 'Sí' : 'No'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {Object.keys(antecedentesPP).length > 0 && (
          <div className="seccion-historial">
            <h3>🏥 Antecedentes Personales Patológicos</h3>
            <div className="contenido-seccion">
              <div className="signos-vitales">
                {antecedentesPP.temperatura && (
                  <div className="signo-vital">
                    <strong>🌡️ Temperatura:</strong>
                    <span>{antecedentesPP.temperatura}°C</span>
                  </div>
                )}
                {antecedentesPP.tension_arterial_sistolica && antecedentesPP.tension_arterial_diastolica && (
                  <div className="signo-vital">
                    <strong>💗 Tensión Arterial:</strong>
                    <span>{antecedentesPP.tension_arterial_sistolica}/{antecedentesPP.tension_arterial_diastolica} mmHg</span>
                  </div>
                )}
                {antecedentesPP.frecuencia_cardiaca && (
                  <div className="signo-vital">
                    <strong>💓 Frecuencia Cardíaca:</strong>
                    <span>{antecedentesPP.frecuencia_cardiaca} lpm</span>
                  </div>
                )}
                {antecedentesPP.frecuencia_respiratoria && (
                  <div className="signo-vital">
                    <strong>🫁 Frecuencia Respiratoria:</strong>
                    <span>{antecedentesPP.frecuencia_respiratoria} rpm</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ✅ FUNCIÓN PARA EXÁMENES
  const renderExamenes = () => {
    const examenExtrabucal = parsearDatosJSON(historialSeleccionado.examen_extrabucal, {});
    const examenIntrabucal = parsearDatosJSON(historialSeleccionado.examen_intrabucal, {});

    return (
      <div className="examenes-section">
        {Object.keys(examenExtrabucal).length > 0 && (
          <div className="seccion-historial">
            <h3>👤 Examen Extrabucal</h3>
            <div className="contenido-seccion">
              <div className="examen-grid">
                {examenExtrabucal.craneo && (
                  <div className="examen-item">
                    <strong>🧠 Cráneo:</strong>
                    <span>{examenExtrabucal.craneo}</span>
                  </div>
                )}
                {examenExtrabucal.biotipo_facial && (
                  <div className="examen-item">
                    <strong>👤 Biotipo Facial:</strong>
                    <span>{examenExtrabucal.biotipo_facial}</span>
                  </div>
                )}
                {examenExtrabucal.perfil && (
                  <div className="examen-item">
                    <strong>📏 Perfil:</strong>
                    <span>{examenExtrabucal.perfil}</span>
                  </div>
                )}
                {examenExtrabucal.apertura_maxima && (
                  <div className="examen-item">
                    <strong>📏 Apertura Máxima:</strong>
                    <span>{examenExtrabucal.apertura_maxima} mm</span>
                  </div>
                )}
                {examenExtrabucal.lateralidad_derecha && (
                  <div className="examen-item">
                    <strong>➡️ Lateralidad Derecha:</strong>
                    <span>{examenExtrabucal.lateralidad_derecha} mm</span>
                  </div>
                )}
                {examenExtrabucal.lateralidad_izquierda && (
                  <div className="examen-item">
                    <strong>⬅️ Lateralidad Izquierda:</strong>
                    <span>{examenExtrabucal.lateralidad_izquierda} mm</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {Object.keys(examenIntrabucal).length > 0 && (
          <div className="seccion-historial">
            <h3>🦷 Examen Intrabucal</h3>
            <div className="contenido-seccion">
              <div className="examen-grid">
                {examenIntrabucal.higiene_bucal && (
                  <div className="examen-item">
                    <strong>🪥 Higiene Bucal:</strong>
                    <span>{examenIntrabucal.higiene_bucal}</span>
                  </div>
                )}
                {examenIntrabucal.molar_derecha && (
                  <div className="examen-item">
                    <strong>🦷 Molar Derecha:</strong>
                    <span>{examenIntrabucal.molar_derecha}</span>
                  </div>
                )}
                {examenIntrabucal.molar_izquierda && (
                  <div className="examen-item">
                    <strong>🦷 Molar Izquierda:</strong>
                    <span>{examenIntrabucal.molar_izquierda}</span>
                  </div>
                )}
                {examenIntrabucal.encias && (
                  <div className="examen-item">
                    <strong>🟣 Encías:</strong>
                    <span>{examenIntrabucal.encias}</span>
                  </div>
                )}
                {examenIntrabucal.lengua && (
                  <div className="examen-item">
                    <strong>👅 Lengua:</strong>
                    <span>{examenIntrabucal.lengua}</span>
                  </div>
                )}
                {examenIntrabucal.paladar && (
                  <div className="examen-item">
                    <strong>🏠 Paladar:</strong>
                    <span>{examenIntrabucal.paladar}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ✅ FUNCIÓN PARA DIAGNÓSTICO Y TRATAMIENTO
  const renderDiagnosticoTratamiento = () => {
  // ✅ FUNCIÓN PARA FORMATEAR PLAN DE TRATAMIENTO
  const formatearPlanTratamiento = (plan) => {
    try {
      let planData = plan;
      
      // Si es string JSON, parsearlo
      if (typeof plan === 'string' && plan.startsWith('{')) {
        planData = JSON.parse(plan);
      }
      
      // Si no es objeto, devolverlo como string
      if (typeof planData !== 'object' || planData === null) {
        return <p>{plan}</p>;
      }
      
      return (
        <div className="plan-estructurado">
          {/* Inmediato */}
          {planData.inmediato && (
            <div className="plan-seccion">
              <h4>🚀 Tratamiento Inmediato:</h4>
              <p>{planData.inmediato}</p>
            </div>
          )}
          
          {/* Seguimiento */}
          {planData.seguimiento && (
            <div className="plan-seccion">
              <h4>📅 Seguimiento:</h4>
              <p>{planData.seguimiento}</p>
            </div>
          )}
          
          {/* Recomendaciones */}
          {planData.recomendaciones && (
            <div className="plan-seccion">
              <h4>💡 Recomendaciones:</h4>
              {Array.isArray(planData.recomendaciones) ? (
                <ul className="lista-recomendaciones">
                  {planData.recomendaciones.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <p>{planData.recomendaciones}</p>
              )}
            </div>
          )}
          
          {/* Corto Plazo */}
          {planData.corto_plazo && (
            <div className="plan-seccion">
              <h4>📝 Corto Plazo:</h4>
              {Array.isArray(planData.corto_plazo) ? (
                <ul className="lista-plan">
                  {planData.corto_plazo.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{planData.corto_plazo}</p>
              )}
            </div>
          )}
          
          {/* Mediano Plazo */}
          {planData.mediano_plazo && (
            <div className="plan-seccion">
              <h4>📈 Mediano Plazo:</h4>
              {Array.isArray(planData.mediano_plazo) ? (
                <ul className="lista-plan">
                  {planData.mediano_plazo.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{planData.mediano_plazo}</p>
              )}
            </div>
          )}
          
          {/* Largo Plazo */}
          {planData.largo_plazo && (
            <div className="plan-seccion">
              <h4>🎯 Largo Plazo:</h4>
              {Array.isArray(planData.largo_plazo) ? (
                <ul className="lista-plan">
                  {planData.largo_plazo.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{planData.largo_plazo}</p>
              )}
            </div>
          )}
          
          {/* Medicamentos Prescritos */}
          {planData.medicamentos_prescritos && (
            <div className="plan-seccion">
              <h4>💊 Medicamentos Prescritos:</h4>
              {Array.isArray(planData.medicamentos_prescritos) ? (
                <div className="medicamentos-grid">
                  {planData.medicamentos_prescritos.map((med, index) => (
                    <div key={index} className="medicamento-item">
                      <strong>{med.medicamento}</strong>
                      <span>Dosis: {med.dosis}</span>
                      {med.indicaciones && <em>Indicaciones: {med.indicaciones}</em>}
                    </div>
                  ))}
                </div>
              ) : (
                <p>{planData.medicamentos_prescritos}</p>
              )}
            </div>
          )}
          
          {/* Proxima Cita */}
          {planData.proxima_cita && (
            <div className="plan-seccion">
              <h4>📅 Próxima Cita:</h4>
              <p>{planData.proxima_cita}</p>
            </div>
          )}
          
          {/* Observaciones */}
          {planData.observaciones && (
            <div className="plan-seccion">
              <h4>📋 Observaciones:</h4>
              <p>{planData.observaciones}</p>
            </div>
          )}
        </div>
      );
      
    } catch (error) {
      console.warn('Error formateando plan de tratamiento:', error);
      return <p>{plan}</p>;
    }
  };

  return (
    <div className="seccion-historial">
      <h3>🩺 Diagnóstico y Tratamiento</h3>
      <div className="contenido-seccion">
        {historialSeleccionado.diagnostico && (
          <div className="campo diagnostico-campo">
            <strong>🔍 Diagnóstico:</strong>
            <p>{historialSeleccionado.diagnostico}</p>
          </div>
        )}
        
        {historialSeleccionado.tratamiento && (
          <div className="campo tratamiento-campo">
            <strong>💊 Tratamiento:</strong>
            <p>{historialSeleccionado.tratamiento}</p>
          </div>
        )}
        
        {historialSeleccionado.plan_tratamiento && (
          <div className="campo plan-tratamiento-campo">
            <strong>📋 Plan de Tratamiento:</strong>
            <div className="plan-content">
              {formatearPlanTratamiento(historialSeleccionado.plan_tratamiento)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

  // ✅ SWITCH CASE CORREGIDO
  switch (vistaActiva) {
    case 'resumen':
      return (
        <div className="vista-resumen">
          {renderMotivoConsulta()}
          {renderDiagnosticoTratamiento()}
        </div>
      );
      
    case 'antecedentes':
      return (
        <div className="vista-antecedentes">
          {renderAntecedentes()}
        </div>
      );
      
    case 'examenes':
      return (
        <div className="vista-examenes">
          {renderExamenes()}
        </div>
      );
      
    case 'completo':
      return (
        <div className="vista-completa">
          <div className="historial-completo-header">
            <h2>📋 Historial Clínico Completo</h2>
            <p>Consulta del {formatearFecha(historialSeleccionado.fecha_consulta)} - Dr. {historialSeleccionado.doctor_nombre}</p>
          </div>
          
          {renderMotivoConsulta()}
          {renderAntecedentes()}
          {renderExamenes()}
          {renderDiagnosticoTratamiento()}
        </div>
      );
      
    default:
      return (
        <div className="vista-no-encontrada">
          <h3>❌ Vista no encontrada</h3>
          <p>La vista seleccionada no está disponible.</p>
        </div>
      );
  }
};

  const onConsultaFinalizada = useCallback(async () => {
    console.log('🏁 Consulta finalizada, actualizando datos...');
    
    try {
      await Promise.all([
        cargarHistorialClinico(),
        cargarCitasHistorial(),
      ]);
      
      console.log('✅ Datos actualizados después de finalizar consulta');
    } catch (error) {
      console.error('❌ Error al actualizar datos tras consulta:', error);
    }
  }, [cargarHistorialClinico, cargarCitasHistorial]);

// ✅ REEMPLAZA LA FUNCIÓN generarPDFHistorial COMPLETA por esta versión extendida:
const generarPDFHistorial = useCallback(async () => {
  try {
    console.log('📄 Generando PDF completo del historial clínico...');
    
    if (!historialSeleccionado) {
      alert('⚠️ Por favor selecciona un historial para generar el PDF');
      return;
    }

    // ✅ CONFIGURACIÓN OPTIMIZADA DEL PDF
    const doc = new jsPDF('p', 'mm', 'a4');
    let yPosition = 25;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width - (margin * 2);

    // ✅ COLORES PROFESIONALES
    const colorPrimario = [41, 128, 185]; // Azul profesional
    const colorSecundario = [52, 73, 94]; // Gris oscuro
    const colorTexto = [44, 62, 80]; // Gris muy oscuro
    const colorLinea = [189, 195, 199]; // Gris claro

    // ✅ FUNCIONES AUXILIARES MEJORADAS
    const verificarNuevaPagina = (espacioNecesario = 35) => {
      if (yPosition + espacioNecesario > pageHeight - 30) {
        doc.addPage();
        yPosition = 25;
        return true;
      }
      return false;
    };

    const agregarTituloSeccion = (titulo, numeracion = '') => {
      verificarNuevaPagina(40);
      
      // Fondo para el título
      doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      doc.rect(margin, yPosition - 5, pageWidth, 12, 'F');
      
      // Texto del título
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      
      const tituloCompleto = numeracion ? `${numeracion}. ${titulo}` : titulo;
      const lineasTitulo = doc.splitTextToSize(tituloCompleto, pageWidth - 10);
      
      let alturaTotal = 0;
      lineasTitulo.forEach((linea, index) => {
        doc.text(linea, margin + 5, yPosition + 2 + (index * 6));
        alturaTotal += 6;
      });
      
      yPosition += Math.max(12, alturaTotal + 5);
      yPosition += 8;
      
      // Reset color
      doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
      doc.setFont('helvetica', 'normal');
    };

    const agregarCampo = (etiqueta, valor, negrita = false) => {
      if (!valor || valor === 'No especificado' || valor === 'undefined' || valor === 'null') return;
      
      verificarNuevaPagina(15);
      
      // Etiqueta
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
      doc.text(`${etiqueta}:`, margin, yPosition);
      
      // Valor
      doc.setFont(negrita ? 'bold' : 'normal');
      doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
      
      const valorTexto = String(valor);
      const lineasValor = doc.splitTextToSize(valorTexto, pageWidth - 50);
      
      lineasValor.forEach((linea, index) => {
        const xPos = index === 0 ? margin + 45 : margin + 5;
        const yPos = yPosition + (index * 5);
        
        if (index > 0) verificarNuevaPagina(10);
        doc.text(linea, xPos, yPos);
        
        if (index === lineasValor.length - 1) {
          yPosition = yPos + 8;
        }
      });
    };

    const agregarSubseccion = (titulo) => {
      verificarNuevaPagina(20);
      
      // Línea decorativa
      doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, margin + 30, yPosition);
      
      yPosition += 5;
      
      // Título de subsección
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      doc.text(titulo, margin, yPosition);
      yPosition += 10;
      
      // Reset
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
    };

    const parsearDatosJSON = (datos) => {
      try {
        if (typeof datos === 'string' && datos.startsWith('{')) {
          return JSON.parse(datos);
        }
        if (typeof datos === 'object' && datos !== null) {
          return datos;
        }
        return {};
      } catch (error) {
        console.warn('Error parseando JSON:', error);
        return {};
      }
    };

    const limpiarTexto = (texto) => {
      if (!texto) return '';
      return String(texto)
        .replace(/[^\w\s\-\.,:;()\[\]áéíóúñüÁÉÍÓÚÑÜ]/g, '')
        .trim();
    };

    // ✅ ENCABEZADO PROFESIONAL
    // Logo/Marca de agua (simulado)
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
    doc.circle(margin + 10, yPosition, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('H', margin + 7, yPosition + 3);

    // Título principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
    doc.text('HISTORIAL CLINICO ODONTOLOGICO', margin + 25, yPosition + 3);
    
    yPosition += 20;

    // Información del encabezado en caja
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, yPosition, pageWidth, 25, 'F');
    doc.setDrawColor(colorLinea[0], colorLinea[1], colorLinea[2]);
    doc.rect(margin, yPosition, pageWidth, 25);

    const nombreCompleto = limpiarTexto(`${paciente?.nombre || ''} ${paciente?.apellido_paterno || ''} ${paciente?.apellido_materno || ''}`).trim();
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
    doc.text(`PACIENTE: ${nombreCompleto}`, margin + 5, yPosition + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de Consulta: ${formatearFecha(historialSeleccionado.fecha_consulta)}`, margin + 5, yPosition + 15);
    doc.text(`Doctor Responsable: Dr. ${limpiarTexto(historialSeleccionado.doctor_nombre)}`, margin + 5, yPosition + 22);
    
    yPosition += 35;

    // ✅ SECCIÓN 1: INFORMACIÓN PERSONAL
    agregarTituloSeccion('INFORMACION PERSONAL DEL PACIENTE', '1');
    
    const datosPersonales = parsearDatosJSON(historialSeleccionado.datos_personales);
    
    agregarCampo('Nombre completo', nombreCompleto);
    agregarCampo('Sexo', paciente?.sexo === 'M' ? 'Masculino' : paciente?.sexo === 'F' ? 'Femenino' : 'No especificado');
    agregarCampo('Fecha de nacimiento', formatearFecha(paciente?.fecha_nacimiento || datosPersonales.fecha_nacimiento));
    agregarCampo('Edad', `${calcularEdad(paciente?.fecha_nacimiento || datosPersonales.fecha_nacimiento)} años`);
    agregarCampo('Telefono', limpiarTexto(paciente?.telefono || datosPersonales.telefono));
    agregarCampo('Correo electronico', limpiarTexto(paciente?.correo_electronico || datosPersonales.email));
    agregarCampo('Direccion', limpiarTexto(paciente?.calle_numero || datosPersonales.direccion));
    agregarCampo('Numero de seguridad social', limpiarTexto(paciente?.numero_seguridad_social || datosPersonales.numero_seguridad_social));
    
    yPosition += 10;

    // ✅ SECCIÓN 2: FICHA DE IDENTIFICACIÓN
    const fichaIdentificacion = parsearDatosJSON(historialSeleccionado.ficha_identificacion);
    if (Object.keys(fichaIdentificacion).length > 0) {
      agregarTituloSeccion('FICHA DE IDENTIFICACION', '2');
      
      agregarCampo('Edad', fichaIdentificacion.edad ? `${fichaIdentificacion.edad} años` : '');
      agregarCampo('Estado civil', limpiarTexto(fichaIdentificacion.estado_civil));
      agregarCampo('Ocupacion', limpiarTexto(fichaIdentificacion.ocupacion));
      agregarCampo('Escolaridad', limpiarTexto(fichaIdentificacion.escolaridad));
      agregarCampo('Lugar de trabajo', limpiarTexto(fichaIdentificacion.lugar_trabajo));
      
      if (fichaIdentificacion.contacto_emergencia) {
        agregarSubseccion('Contacto de Emergencia');
        agregarCampo('Nombre', limpiarTexto(fichaIdentificacion.contacto_emergencia.nombre));
        agregarCampo('Parentesco', limpiarTexto(fichaIdentificacion.contacto_emergencia.parentesco));
        agregarCampo('Telefono', limpiarTexto(fichaIdentificacion.contacto_emergencia.telefono));
      }
      
      yPosition += 10;
    }

    // ✅ SECCIÓN 3: MOTIVO DE CONSULTA
    const motivoConsulta = parsearDatosJSON(historialSeleccionado.motivo_consulta);
    if (Object.keys(motivoConsulta).length > 0 || historialSeleccionado.motivo_consulta_texto) {
      agregarTituloSeccion('MOTIVO DE CONSULTA', '3');
      
      agregarCampo('Motivo principal', limpiarTexto(motivoConsulta.motivo_principal || historialSeleccionado.motivo_consulta_texto));
      agregarCampo('Padecimiento actual', limpiarTexto(motivoConsulta.padecimiento_actual));
      agregarCampo('Inicio de sintomas', limpiarTexto(motivoConsulta.inicio_sintomas));
      agregarCampo('Tipo de dolor', limpiarTexto(motivoConsulta.tipo_dolor));
      agregarCampo('Intensidad del dolor', motivoConsulta.intensidad_dolor ? `${motivoConsulta.intensidad_dolor}/10` : '');
      agregarCampo('Urgencia', limpiarTexto(motivoConsulta.urgencia));
      agregarCampo('Evolucion', limpiarTexto(motivoConsulta.evolucion));
      agregarCampo('Tratamientos previos', limpiarTexto(motivoConsulta.tratamientos_previos));
      
      if (motivoConsulta.factores_desencadenantes && Array.isArray(motivoConsulta.factores_desencadenantes)) {
        agregarCampo('Factores desencadenantes', limpiarTexto(motivoConsulta.factores_desencadenantes.join(', ')));
      }
      
      if (motivoConsulta.sintomas_asociados && Array.isArray(motivoConsulta.sintomas_asociados)) {
        agregarCampo('Sintomas asociados', limpiarTexto(motivoConsulta.sintomas_asociados.join(', ')));
      }
      
      yPosition += 10;
    }

    // ✅ SECCIÓN 4: ANTECEDENTES HEREDO-FAMILIARES
    const antecedentesHF = parsearDatosJSON(historialSeleccionado.antecedentes_heredo_familiares);
    if (Object.keys(antecedentesHF).length > 0) {
      agregarTituloSeccion('ANTECEDENTES HEREDO-FAMILIARES', '4');
      
      if (antecedentesHF.padre) {
        agregarSubseccion('Antecedentes Paternos');
        if (typeof antecedentesHF.padre === 'object') {
          agregarCampo('Estado', antecedentesHF.padre.vivo ? 'Vivo' : 'Fallecido');
          agregarCampo('Edad', limpiarTexto(antecedentesHF.padre.edad));
          agregarCampo('Enfermedades', limpiarTexto(Array.isArray(antecedentesHF.padre.enfermedades) ? 
                      antecedentesHF.padre.enfermedades.join(', ') : antecedentesHF.padre.enfermedades));
        } else {
          agregarCampo('Antecedentes', limpiarTexto(Array.isArray(antecedentesHF.padre) ? 
                      antecedentesHF.padre.join(', ') : antecedentesHF.padre));
        }
      }
      
      if (antecedentesHF.madre) {
        agregarSubseccion('Antecedentes Maternos');
        if (typeof antecedentesHF.madre === 'object') {
          agregarCampo('Estado', antecedentesHF.madre.vivo ? 'Vivo' : 'Fallecido');
          agregarCampo('Edad', limpiarTexto(antecedentesHF.madre.edad));
          agregarCampo('Enfermedades', limpiarTexto(Array.isArray(antecedentesHF.madre.enfermedades) ? 
                      antecedentesHF.madre.enfermedades.join(', ') : antecedentesHF.madre.enfermedades));
        } else {
          agregarCampo('Antecedentes', limpiarTexto(Array.isArray(antecedentesHF.madre) ? 
                      antecedentesHF.madre.join(', ') : antecedentesHF.madre));
        }
      }
      
      if (antecedentesHF.hermanos) {
        agregarSubseccion('Hermanos');
        if (typeof antecedentesHF.hermanos === 'object') {
          agregarCampo('Numero de hermanos', limpiarTexto(antecedentesHF.hermanos.numero));
          agregarCampo('Enfermedades relevantes', limpiarTexto(Array.isArray(antecedentesHF.hermanos.enfermedades_relevantes) ? 
                      antecedentesHF.hermanos.enfermedades_relevantes.join(', ') : antecedentesHF.hermanos.enfermedades_relevantes));
        } else {
          agregarCampo('Antecedentes', limpiarTexto(Array.isArray(antecedentesHF.hermanos) ? 
                      antecedentesHF.hermanos.join(', ') : antecedentesHF.hermanos));
        }
      }
      
      if (antecedentesHF.abuelos_paternos) {
        agregarCampo('Abuelos paternos', limpiarTexto(Array.isArray(antecedentesHF.abuelos_paternos) ? 
                    antecedentesHF.abuelos_paternos.join(', ') : antecedentesHF.abuelos_paternos));
      }
      
      if (antecedentesHF.abuelos_maternos) {
        agregarCampo('Abuelos maternos', limpiarTexto(Array.isArray(antecedentesHF.abuelos_maternos) ? 
                    antecedentesHF.abuelos_maternos.join(', ') : antecedentesHF.abuelos_maternos));
      }
      
      yPosition += 10;
    }

    // ✅ SECCIÓN 5: ANTECEDENTES PERSONALES NO PATOLÓGICOS
    const antecedentesNP = parsearDatosJSON(historialSeleccionado.antecedentes_personales_no_patologicos);
    if (Object.keys(antecedentesNP).length > 0) {
      agregarTituloSeccion('ANTECEDENTES PERSONALES NO PATOLOGICOS', '5');
      
      if (antecedentesNP.habitos) {
        agregarSubseccion('Habitos');
        const habitos = antecedentesNP.habitos;
        
        if (habitos.tabaquismo) {
          agregarCampo('Tabaquismo', habitos.tabaquismo.fuma ? 'Si' : 'No');
          if (habitos.tabaquismo.cigarrillos_dia) {
            agregarCampo('Cigarrillos por dia', limpiarTexto(habitos.tabaquismo.cigarrillos_dia));
          }
        }
        
        if (habitos.alcoholismo) {
          agregarCampo('Consume alcohol', habitos.alcoholismo.consume ? 'Si' : 'No');
          agregarCampo('Frecuencia', limpiarTexto(habitos.alcoholismo.frecuencia));
          agregarCampo('Tipo de bebida', limpiarTexto(habitos.alcoholismo.tipo_bebida));
        }
        
        if (habitos.drogas !== undefined) {
          agregarCampo('Drogas', habitos.drogas ? 'Si' : 'No');
        }
      }
      
      if (antecedentesNP.higiene_bucal) {
        agregarSubseccion('Higiene Bucal');
        const higiene = antecedentesNP.higiene_bucal;
        agregarCampo('Frecuencia de cepillado', limpiarTexto(higiene.cepillado_frecuencia));
        agregarCampo('Tipo de cepillo', limpiarTexto(higiene.tipo_cepillo));
        agregarCampo('Usa hilo dental', higiene.hilo_dental ? 'Si' : 'No');
        agregarCampo('Enjuague bucal', higiene.enjuague_bucal ? 'Si' : 'No');
      }
      
      yPosition += 10;
    }

    // ✅ SECCIÓN 6: ANTECEDENTES PERSONALES PATOLÓGICOS
    const antecedentesPP = parsearDatosJSON(historialSeleccionado.antecedentes_personales_patologicos);
    if (Object.keys(antecedentesPP).length > 0) {
      agregarTituloSeccion('ANTECEDENTES PERSONALES PATOLOGICOS', '6');
      
      agregarSubseccion('Signos Vitales');
      agregarCampo('Temperatura', antecedentesPP.temperatura ? `${antecedentesPP.temperatura} C` : '');
      if (antecedentesPP.tension_arterial_sistolica && antecedentesPP.tension_arterial_diastolica) {
        agregarCampo('Tension arterial', `${antecedentesPP.tension_arterial_sistolica}/${antecedentesPP.tension_arterial_diastolica} mmHg`);
      }
      agregarCampo('Frecuencia cardiaca', antecedentesPP.frecuencia_cardiaca ? `${antecedentesPP.frecuencia_cardiaca} lpm` : '');
      agregarCampo('Frecuencia respiratoria', antecedentesPP.frecuencia_respiratoria ? `${antecedentesPP.frecuencia_respiratoria} rpm` : '');
      
      if (antecedentesPP.somatometria) {
        agregarSubseccion('Somatometria');
        const somato = antecedentesPP.somatometria;
        agregarCampo('Peso', limpiarTexto(somato.peso));
        agregarCampo('Talla', limpiarTexto(somato.talla));
        agregarCampo('IMC', limpiarTexto(somato.imc));
      }
      
      yPosition += 10;
    }

    // ✅ SECCIÓN 7: EXAMEN EXTRABUCAL
    const examenExtrabucal = parsearDatosJSON(historialSeleccionado.examen_extrabucal);
    if (Object.keys(examenExtrabucal).length > 0) {
      agregarTituloSeccion('EXAMEN EXTRABUCAL', '7');
      
      agregarCampo('Aspecto general', limpiarTexto(examenExtrabucal.aspecto_general));
      agregarCampo('Craneo', limpiarTexto(examenExtrabucal.craneo));
      agregarCampo('Biotipo facial', limpiarTexto(examenExtrabucal.biotipo_facial));
      agregarCampo('Perfil', limpiarTexto(examenExtrabucal.perfil));
      
      if (examenExtrabucal.apertura_maxima) {
        agregarSubseccion('Articulacion Temporomandibular');
        agregarCampo('Apertura maxima', `${examenExtrabucal.apertura_maxima} mm`);
        agregarCampo('Lateralidad derecha', examenExtrabucal.lateralidad_derecha ? `${examenExtrabucal.lateralidad_derecha} mm` : '');
        agregarCampo('Lateralidad izquierda', examenExtrabucal.lateralidad_izquierda ? `${examenExtrabucal.lateralidad_izquierda} mm` : '');
      }
      
      yPosition += 10;
    }

    // ✅ SECCIÓN 8: EXAMEN INTRABUCAL
    const examenIntrabucal = parsearDatosJSON(historialSeleccionado.examen_intrabucal);
    if (Object.keys(examenIntrabucal).length > 0) {
      agregarTituloSeccion('EXAMEN INTRABUCAL', '8');
      
      agregarCampo('Higiene bucal', limpiarTexto(examenIntrabucal.higiene_bucal));
      agregarCampo('Encias', limpiarTexto(examenIntrabucal.encias));
      agregarCampo('Lengua', limpiarTexto(examenIntrabucal.lengua));
      agregarCampo('Paladar', limpiarTexto(examenIntrabucal.paladar));
      agregarCampo('Molar derecha', limpiarTexto(examenIntrabucal.molar_derecha));
      agregarCampo('Molar izquierda', limpiarTexto(examenIntrabucal.molar_izquierda));
      
      yPosition += 10;
    }

    // ✅ DIAGNÓSTICO Y TRATAMIENTO
    agregarTituloSeccion('DIAGNOSTICO Y TRATAMIENTO', '9');
    
    agregarCampo('Diagnostico', limpiarTexto(historialSeleccionado.diagnostico) || 'No especificado', true);
    agregarCampo('Tratamiento realizado', limpiarTexto(historialSeleccionado.tratamiento) || 'No especificado');
    
    if (historialSeleccionado.plan_tratamiento) {
      const planData = parsearDatosJSON(historialSeleccionado.plan_tratamiento);
      
      if (Object.keys(planData).length > 0) {
        agregarSubseccion('Plan de Tratamiento');
        
        if (planData.inmediato) {
          agregarCampo('Tratamiento inmediato', limpiarTexto(planData.inmediato));
        }
        if (planData.seguimiento) {
          agregarCampo('Seguimiento', limpiarTexto(planData.seguimiento));
        }
        if (planData.recomendaciones) {
          const recomendaciones = Array.isArray(planData.recomendaciones) ? 
            planData.recomendaciones.join(', ') : planData.recomendaciones;
          agregarCampo('Recomendaciones', limpiarTexto(recomendaciones));
        }
      }
    }

    // ✅ PIE DE PÁGINA PROFESIONAL
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Línea superior del pie
      doc.setDrawColor(colorLinea[0], colorLinea[1], colorLinea[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, doc.internal.pageSize.height - 20, margin + pageWidth, doc.internal.pageSize.height - 20);
      
      // Información del pie
      doc.setFontSize(8);
      doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
      doc.setFont('helvetica', 'normal');
      
      doc.text(`Pagina ${i} de ${totalPages}`, doc.internal.pageSize.width - margin, doc.internal.pageSize.height - 12, { align: 'right' });
      doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, margin, doc.internal.pageSize.height - 12);
      doc.text('Sistema Odontologico - Historial Clinico', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 12, { align: 'center' });
    }

    // ✅ GUARDAR PDF
    const nombrePaciente = limpiarTexto(`${paciente?.nombre || 'Paciente'}_${paciente?.apellido_paterno || ''}`).replace(/\s+/g, '_');
    const fechaConsulta = historialSeleccionado.fecha_consulta?.replace(/-/g, '') || 'SinFecha';
    const nombreArchivo = `Historial_${nombrePaciente}_${fechaConsulta}.pdf`;
    
    doc.save(nombreArchivo);
    
    console.log('✅ PDF profesional generado exitosamente:', nombreArchivo);
    alert(`✅ PDF del historial clínico generado exitosamente!\n\nArchivo: ${nombreArchivo}\n\nDiseño profesional y limpio aplicado.`);

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    alert(`❌ Error al generar PDF: ${error.message}`);
  }
}, [historialSeleccionado, paciente, formatearFecha, calcularEdad]);

// ✅ FUNCIÓN PARA EL BOTÓN PDF
const handleGenerarPDF = useCallback(() => {
  if (!historialSeleccionado) {
    alert('⚠️ Por favor selecciona un historial para generar el PDF');
    return;
  }
  
  generarPDFHistorial();
}, [generarPDFHistorial, historialSeleccionado]);

  // Función principal para renderizar contenido según vista activa
  const renderContenidoPrincipal = () => {
  switch (vistaActiva) {
    case 'estudios':
      return (
        <EstudiosLaboratorioSection
          estudiosLaboratorio={estudiosLaboratorio}
          loadingEstudios={loadingEstudios}
          formatearFecha={formatearFecha}
          buildApiUrl={buildApiUrl}
          onSolicitarNuevo={solicitarNuevoEstudio}
          onRecargar={cargarEstudiosLaboratorio}
        />
      );
      
    case 'radiografias':
      return (
        <RadiografiasSection
          radiografias={radiografias}
          loadingRadiografias={loadingRadiografias}
          onSolicitarNueva={solicitarNuevaRadiografia}
          formatearFecha={formatearFecha}
          buildApiUrl={buildApiUrl}
        />
      );
      
    case 'historial':
      return renderHistorialClinico();
      
    case 'citas':
      return (
        <CitasHistorialSection
          citas={citasHistorial}
          loadingCitas={loadingCitas}
          formatearFecha={formatearFecha}
          formatearFechaHora={formatearFechaHora}
          buildApiUrl={buildApiUrl}
          onActualizarEstado={actualizarEstadoCita}
          getAuthHeaders={getAuthHeaders}
          setCitasHistorial={setCitasHistorial}
        />
      );
      
    case 'consulta-actual':
      return (
        <ConsultaActual
          paciente={paciente}
          user={user}
          buildApiUrl={buildApiUrl}
          getAuthHeaders={getAuthHeaders}
          mostrarConfirmacion={mostrarConfirmacion}
          onConsultaFinalizada={onConsultaFinalizada}
        />
      );
      
    default:
      return renderHistorialClinico();
  }
};

// === VALIDACIONES Y ESTADOS DE CARGA MODIFICADOS ===
// Busca esta sección al final de tu archivo HistorialPacienteIndividual.js
// (aproximadamente líneas 1800-1850) y reemplázala por este código:

  // === VALIDACIONES Y ESTADOS DE CARGA ===
  if (idInvalido) {
    return (
      <div className="historial-container">
        <div className="error">
          <h2>❌ Error</h2>
          <p>ID de paciente inválido: {pacienteId}</p>
          <button onClick={handleRegresarAPanel} className="btn-regresar">
            Regresar
          </button>
        </div>
      </div>
    );
  }

  // ✅ LOADING DENTAL UNIFICADO PARA TODO
  if (showDentalLoading || loading) {
    const mensaje = showDentalLoading 
      ? loadingMessage 
      : "Cargando información del paciente";
      
    const submensaje = showDentalLoading 
      ? loadingSubmessage 
      : "Accediendo al historial médico";
      
    return (
      <DentalLoading
        isLoading={showDentalLoading || loading}
        message={mensaje}
        submessage={submensaje}
        duration={showDentalLoading ? 3000 : 5000}
        onComplete={showDentalLoading ? handleDentalLoadingComplete : () => {}}
      />
    );
  }

  if (error) {
    return (
      <div className="historial-container">
        <div className="error">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={handleRegresarAPanel} className="btn-regresar">
            Regresar
          </button>
        </div>
      </div>
    );
  }

  // === RENDER PRINCIPAL ===
  return (
    <div className="historial-container">
      {/* Header del paciente minimalista */}
      {renderHeaderMinimalista()}

      {/* Navegación principal */}
      <div className="navegacion-principal">
        <button
          className={`nav-tab ${vistaActiva === 'estudios' ? 'activo' : ''}`}
          onClick={() => setVistaActiva('estudios')}
          data-count={estudiosLaboratorio.length}
          title="Ver estudios de laboratorio"
        >
          🔬 Estudios de Laboratorio
        </button>
        <button
          className={`nav-tab ${vistaActiva === 'radiografias' ? 'activo' : ''}`}
          onClick={() => setVistaActiva('radiografias')}
          data-count={radiografias.length}
          title="Ver radiografías"
        >
          📸 Radiografías
        </button>
        <button
          className={`nav-tab ${vistaActiva === 'historial' ? 'activo' : ''}`}
          onClick={() => setVistaActiva('historial')}
          data-count={historial.length}
          title="Ver historial clínico"
        >
          📋 Historial Clínico
        </button>
        <button
          className={`nav-tab ${vistaActiva === 'citas' ? 'activo' : ''}`}
          onClick={() => setVistaActiva('citas')}
          data-count={citasHistorial.length}
          title="Ver historial de citas"
        >
          📅 Historial de Citas
        </button>
        <button
          className={`nav-tab ${vistaActiva === 'consulta-actual' ? 'activo' : ''}`}
          onClick={() => setVistaActiva('consulta-actual')}
          title="Consulta actual"
        >
          🩺 Consulta Actual
        </button>
      </div>

      {/* Contenido principal */}
      <div className="contenido-principal">
        {renderContenidoPrincipal()}
      </div>

      {/* Modal de confirmación */}
      <ConfirmacionModalEstudio 
        confirmacion={confirmacion}
        onClose={ocultarConfirmacion}
      />

      {/* Modal de foto actualizada */}
      <FotoActualizadaModal
        isOpen={modalFotoOpen}
        onClose={() => setModalFotoOpen(false)}
        titulo="✅ Foto actualizada correctamente"
        mensaje="La imagen del avatar se ha subido exitosamente al sistema."
        confirmText="Perfecto"
        tipo="success"
      />
    </div>
  );
};

export default HistorialPacienteIndividual;