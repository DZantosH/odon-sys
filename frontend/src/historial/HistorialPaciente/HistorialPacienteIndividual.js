import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { buildApiUrl } from '../../config/config.js';
import { useAuth } from '../../services/AuthContext.js';
import ConfirmacionModalEstudio, { useConfirmacionEstudio } from '../../components/modals/confirmacion/ConfirmacionModalEstudio.jsx';
import RadiografiasSection from './RadiografiasSection.js';
import CitasHistorialSection from './CitasHistorialSection.js';
import ConsultaActual from './ConsultaActual.js';
import '../../css/HistorialPacienteIndividual.css';
import { cargarHistorialPaciente, debugHistorialPaciente } from '../../services/historialService';
import { FotoActualizadaModal } from '../../components/modals/ModalSystem';
import EstudiosLaboratorioSection from './EstudiosLaboratorioSection';
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
  const navigate = useNavigate();
  const location = useLocation();
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
  const [vistaActiva, setVistaActiva] = useState('resumen');

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

  // Estados para loading dental
  const [showDentalLoading, setShowDentalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Preparando consulta...");
  const [loadingSubmessage, setLoadingSubmessage] = useState("Cargando información del paciente");

  console.log('🆔 pacienteId:', pacienteId, 'tipo:', typeof pacienteId);
  console.log('📊 Vista activa:', vistaActiva);
  
  const idInvalido = !pacienteId || pacienteId === 'undefined';

  // Efecto para detectar navegación
useEffect(() => {
  console.log('🔍 [DEBUG] useEffect ejecutándose...');
  const estadoNavegacion = location.state;
  console.log('🔍 [DEBUG] Estado de navegación COMPLETO:', estadoNavegacion);
  
  if (estadoNavegacion) {
    console.log('🧭 Navegación detectada desde:', estadoNavegacion.origen);
    
    // MOSTRAR LOADING DENTAL SI VIENE DE CITAS DEL DÍA
    if (estadoNavegacion.origen === 'citas-del-dia' && estadoNavegacion.consultaIniciada) {
      console.log('🦷 Mostrando loading dental para consulta iniciada');
      setShowDentalLoading(true);
      setLoadingMessage("Iniciando consulta odontológica");
      setLoadingSubmessage(`Preparando historial de ${estadoNavegacion.paciente?.nombre || 'paciente'}`);
    }
    
    // CAMBIAR VISTA INICIAL DESPUÉS DEL LOADING DENTAL - SIN BUCLES
    if (estadoNavegacion.vistaInicial) {
      console.log('🎯 Cambiando a vista inicial:', estadoNavegacion.vistaInicial);
      
      // Mapear 'historial' a 'resumen' directamente
      let vistaFinal = estadoNavegacion.vistaInicial;
      if (vistaFinal === 'historial') {
        vistaFinal = 'resumen';
      }
      
      setTimeout(() => {
        setVistaActiva(vistaFinal);
      }, estadoNavegacion.consultaIniciada ? 3500 : 0);
    }
    
    if (estadoNavegacion.consultaIniciada) {
      console.log('🩺 Consulta iniciada - configurando experiencia de bienvenida');
    }
  }
}, [location.state]);

  // Función para manejar navegación de regreso
  const handleRegresarAPanel = useCallback(() => {
    const estadoNavegacion = location.state;
    
    if (estadoNavegacion?.origen === 'citas-del-dia') {
      navigate('/panel-principal');
    } else {
      navigate('/pacientes');
    }
  }, [navigate, location.state]);

  // Función para completar loading dental
  const handleDentalLoadingComplete = useCallback(() => {
    console.log('✅ Loading dental completado');
    setShowDentalLoading(false);
  }, []);

  // Funciones de utilidad
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

  // Función para limpiar texto
  const limpiarTexto = (texto) => {
    if (!texto || texto === 'undefined' || texto === 'null') return '';
    return String(texto).trim();
  };

  // Función para cargar radiografías
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

  // Función para cargar estudios de laboratorio (CORREGIDA)
const cargarEstudiosLaboratorio = useCallback(async () => {
  try {
    setLoadingEstudios(true);
    console.log('🔬 Cargando estudios de laboratorio para paciente:', pacienteId);
    
    const response = await fetch(buildApiUrl(`/estudios-laboratorio/paciente/${pacienteId}`), {
      headers: getAuthHeaders()
    });
    
    console.log('📡 Respuesta API estudios:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Respuesta completa de estudios:', data);
      
      // Manejar tanto formato nuevo como viejo
      const estudiosData = data.success ? data.data : data;
      
      if (Array.isArray(estudiosData)) {
        const estudiosOrdenados = estudiosData.sort((a, b) => 
          new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud)
        );
        setEstudiosLaboratorio(estudiosOrdenados);
        console.log('✅ Estudios cargados exitosamente:', estudiosOrdenados.length);
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', data);
        setEstudiosLaboratorio([]);
      }
    } else if (response.status === 404) {
      console.log('ℹ️ No hay estudios de laboratorio para este paciente');
      setEstudiosLaboratorio([]);
    } else {
      console.warn('⚠️ Error al cargar estudios:', response.status);
      const errorData = await response.json().catch(() => ({}));
      console.warn('❌ Detalle del error:', errorData);
      setEstudiosLaboratorio([]);
    }
  } catch (error) {
    console.error('❌ Error al cargar estudios:', error);
    setEstudiosLaboratorio([]);
  } finally {
    setLoadingEstudios(false);
  }
}, [pacienteId, getAuthHeaders]);

  // Función para cargar citas del historial
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
  

  // Función para cargar historial clínico
  const cargarHistorialClinico = useCallback(async () => {
    try {
      console.log('📋 === CARGANDO HISTORIAL CLÍNICO ===');
      console.log('🆔 Paciente ID:', pacienteId, 'tipo:', typeof pacienteId);
      
      if (!pacienteId || pacienteId === 'undefined') {
        console.error('❌ ID de paciente inválido:', pacienteId);
        setHistorial([]);
        return;
      }

      // Usar el servicio corregido
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
        
        // Ejecutar debug para ver qué pasa
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

  const guardarDiagnosticoTratamiento = useCallback(async () => {
  try {
    const diagnosticoInput = document.getElementById('diagnostico-input');
    const tratamientoInput = document.getElementById('tratamiento-input');
    
    const diagnostico = diagnosticoInput?.value?.trim();
    const tratamiento = tratamientoInput?.value?.trim();
    
    if (!diagnostico && !tratamiento) {
      alert('⚠️ Por favor complete al menos el diagnóstico o el tratamiento');
      return;
    }
    
    if (!historialSeleccionado?.id) {
      alert('❌ Error: No se puede identificar el historial a actualizar');
      return;
    }
    
    console.log('💾 Guardando diagnóstico y tratamiento...');
    
    const response = await fetch(buildApiUrl(`/historiales-clinicos/${historialSeleccionado.id}/diagnostico-tratamiento`), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        diagnostico: diagnostico || null,
        tratamiento: tratamiento || null,
        updated_by: user?.id
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    const resultado = await response.json();
    console.log('✅ Diagnóstico y tratamiento guardados:', resultado);
    
    // Actualizar el historial seleccionado con los nuevos datos
    setHistorialSeleccionado(prev => ({
      ...prev,
      diagnostico: diagnostico,
      tratamiento: tratamiento,
      updated_at: new Date().toISOString()
    }));
    
    // Recargar el historial completo para mantener consistencia
    await cargarHistorialClinico();
    
    // Mostrar confirmación visual
    diagnosticoInput.classList.add('success');
    tratamientoInput.classList.add('success');
    
    setTimeout(() => {
      diagnosticoInput?.classList.remove('success');
      tratamientoInput?.classList.remove('success');
    }, 2000);
    
    if (mostrarConfirmacion) {
      await mostrarConfirmacion({
        type: 'success',
        title: '✅ Diagnóstico y Tratamiento Guardados',
        message: 'La información ha sido actualizada exitosamente en el historial clínico.',
        details: {
          diagnostico: diagnostico || 'No especificado',
          tratamiento: tratamiento || 'No especificado',
          fecha_actualizacion: new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        },
        confirmText: 'Perfecto',
        showCancel: false
      });
    } else {
      alert('✅ Diagnóstico y tratamiento guardados exitosamente');
    }
    
  } catch (error) {
    console.error('❌ Error al guardar diagnóstico y tratamiento:', error);
    
    // Mostrar error visual
    const diagnosticoInput = document.getElementById('diagnostico-input');
    const tratamientoInput = document.getElementById('tratamiento-input');
    
    diagnosticoInput?.classList.add('error');
    tratamientoInput?.classList.add('error');
    
    setTimeout(() => {
      diagnosticoInput?.classList.remove('error');
      tratamientoInput?.classList.remove('error');
    }, 3000);
    
    if (mostrarConfirmacion) {
      await mostrarConfirmacion({
        type: 'error',
        title: '❌ Error al Guardar',
        message: `No se pudo guardar el diagnóstico y tratamiento: ${error.message}`,
        confirmText: 'Entendido',
        showCancel: false
      });
    } else {
      alert(`❌ Error al guardar: ${error.message}`);
    }
  }
}, [historialSeleccionado?.id, user?.id, buildApiUrl, getAuthHeaders, cargarHistorialClinico, mostrarConfirmacion]);

  // Efecto para auto-actualizar citas
  useEffect(() => {
    if (vistaActiva !== 'citas' || citasHistorial.length === 0) return;
    
    const intervalo = setInterval(() => {
      console.log('⏰ Verificando estados de citas automáticamente...');
      cargarCitasHistorial();
    }, 60000);
    
    return () => clearInterval(intervalo);
  }, [vistaActiva, citasHistorial.length, cargarCitasHistorial]);

  // Efecto principal para cargar datos
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
      
      // ELIMINAR ESTA PARTE QUE CAUSABA EL BUCLE:
      // if (vistaActiva === 'historial') {
      //   setVistaActiva('resumen');
      // }
      
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
  pacienteDesdeBuscador,
  getAuthHeaders, 
  cargarHistorialClinico, 
  cargarRadiografias, 
  cargarEstudiosLaboratorio, 
  cargarCitasHistorial
  // ELIMINAR vistaActiva de las dependencias
]);


  // Función para parsear datos JSON de manera segura
  const parsearDatosJSON = useCallback((datos, fallback = {}) => {
    try {
      if (!datos) return fallback;
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
  }, []);

  // Función para renderizar campo con validación
  const renderCampo = useCallback((etiqueta, valor, tipo = 'texto') => {
    const valorLimpio = limpiarTexto(valor);
    if (!valorLimpio) return null;

    return (
      <div className="campo-historial" key={etiqueta}>
        <strong className="campo-etiqueta">{etiqueta}:</strong>
        <span className="campo-valor">{valorLimpio}</span>
      </div>
    );
  }, []);

  // Función para renderizar lista
  const renderLista = useCallback((etiqueta, items) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    
    return (
      <div className="campo-historial" key={etiqueta}>
        <strong className="campo-etiqueta">{etiqueta}:</strong>
        <ul className="lista-valores">
          {items.map((item, index) => (
            <li key={index}>{limpiarTexto(item)}</li>
          ))}
        </ul>
      </div>
    );
  }, []);

  // Función para renderizar sección
  const renderSeccion = useCallback((titulo, contenido, icono = '📋') => {
    if (!contenido || (Array.isArray(contenido) && contenido.length === 0)) return null;

    return (
      <div className="seccion-historial-completa" key={titulo}>
        <h3 className="titulo-seccion-completa">
          <span className="icono-seccion">{icono}</span>
          {titulo}
        </h3>
        <div className="contenido-seccion-completa">
          {contenido}
        </div>
      </div>
    );
  }, []);

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

  // Función para renderizar avatar
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

  // Función para renderizar el header minimalista
  const renderHeaderMinimalista = () => {
    if (!paciente) {
      return (
        <div className="header-paciente-minimalista">
          <button 
            onClick={handleRegresarAPanel}
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
          onClick={handleRegresarAPanel}
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

// Función para solicitar nuevo estudio (ACTUALIZADA)
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

    console.log('📝 Enviando solicitud de estudio:', {
      ...formData,
      paciente_id: parseInt(pacienteId),
      doctor_id: user.id
    });

    const response = await fetch(buildApiUrl('/estudios-laboratorio'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...formData,
        paciente_id: parseInt(pacienteId),
        doctor_id: user.id,
        fecha_solicitud: new Date().toISOString().split('T')[0],
        estado: 'solicitado'
      })
    });

    console.log('📡 Respuesta del servidor:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error del servidor:', errorData);
      throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const resultado = await response.json();
    console.log('✅ Estudio solicitado exitosamente:', resultado);

    // Recargar estudios inmediatamente
    await cargarEstudiosLaboratorio();

    if (mostrarConfirmacion) {
      await mostrarConfirmacion({
        type: 'success',
        title: '¡Estudio Solicitado!',
        message: `El estudio "${resultado.data?.tipo_estudio || formData.tipo_estudio}" ha sido solicitado exitosamente para el paciente.`,
        details: {
          tipo_estudio: resultado.data?.tipo_estudio || formData.tipo_estudio,
          laboratorio: formData.laboratorio_recomendado || 'No especificado',
          urgencia: formData.urgencia,
          fecha: new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          estado: 'Solicitado'
        },
        confirmText: 'Aceptar',
        cancelText: 'Ver Detalles',
        showCancel: true
      });
    }

    return true;

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

    return false;
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

  // Callback cuando se finaliza consulta
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
        

        <div className="contenido-historial">
          {historialSeleccionado ? (
            <>
              <div className="header-historial-seleccionado">
                <h2>Historial del {formatearFecha(historialSeleccionado.fecha_consulta)}</h2>
                <div className="info-consulta">
                  <span>👨‍⚕️ Dr. {historialSeleccionado.doctor_nombre}</span>
                  <span>📅 {historialSeleccionado.tipo_cita}</span>
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
                <button
                  className={vistaActiva === 'completo' ? 'activo' : ''}
                  onClick={() => {
                    const pdfUrl = `/pdfs/historial_${pacienteId}.pdf`; // Ajusta a tu backend
                    window.open(pdfUrl, "_blank");
                  }}
                >
                  📕 Abrir PDF
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

  // Función principal para renderizar el contenido del historial según la vista
const renderContenidoHistorialOriginal = () => {
  if (!historialSeleccionado) return null;

  // Parsear datos
  const datosPersonales = parsearDatosJSON(historialSeleccionado.datos_personales);
  const fichaIdentificacionData = parsearDatosJSON(historialSeleccionado.ficha_identificacion);
  const motivoConsultaData = parsearDatosJSON(historialSeleccionado.motivo_consulta);
  const antecedentesHFData = parsearDatosJSON(historialSeleccionado.antecedentes_heredo_familiares);
  const antecedentesNPData = parsearDatosJSON(historialSeleccionado.antecedentes_personales_no_patologicos);
  const antecedentesPPData = parsearDatosJSON(historialSeleccionado.antecedentes_personales_patologicos);
  const examenExtrabucalData = parsearDatosJSON(historialSeleccionado.examen_extrabucal);
  const examenIntrabucalData = parsearDatosJSON(historialSeleccionado.examen_intrabucal);
  const oclusionData = parsearDatosJSON(historialSeleccionado.oclusion);


    // Función para renderizar plan de tratamiento
    const renderPlanTratamiento = (plan) => {
      try {
        let planData = plan;
        
        if (typeof plan === 'string' && plan.startsWith('{')) {
          planData = JSON.parse(plan);
        }
        
        if (typeof planData !== 'object' || planData === null) {
          return <p>{plan}</p>;
        }
        
        return (
          <div className="plan-estructurado">
            {planData.inmediato && (
              <div className="plan-seccion">
                <h4>🚀 Tratamiento Inmediato:</h4>
                <p>{planData.inmediato}</p>
              </div>
            )}
            
            {planData.seguimiento && (
              <div className="plan-seccion">
                <h4>📅 Seguimiento:</h4>
                <p>{planData.seguimiento}</p>
              </div>
            )}
            
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
            
            {planData.proxima_cita && (
              <div className="plan-seccion">
                <h4>📅 Próxima Cita:</h4>
                <p>{planData.proxima_cita}</p>
              </div>
            )}
            
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

    // Switch principal para renderizar según la vista activa
 switch (vistaActiva) {
    case 'resumen':
  return (
    <div className="vista-resumen-completa">
      {/* Motivo de Consulta */}
      {(Object.keys(motivoConsultaData).length > 0 || historialSeleccionado.motivo_consulta_texto) && 
        renderSeccion('🗣️ Motivo de Consulta', [
          renderCampo('Motivo Principal', motivoConsultaData.motivo_principal || historialSeleccionado.motivo_consulta_texto),
          renderCampo('Padecimiento Actual', motivoConsultaData.padecimiento_actual),
          renderCampo('Intensidad del Dolor', motivoConsultaData.intensidad_dolor ? `${motivoConsultaData.intensidad_dolor}/10` : ''),
          renderCampo('Urgencia', motivoConsultaData.urgencia),
          renderCampo('Evolución', motivoConsultaData.evolucion),
          renderLista('Síntomas Asociados', motivoConsultaData.sintomas_asociados)
        ])
      }
      
      {/* Diagnóstico y Tratamiento - MODIFICADO */}
      <div className="seccion-historial-completa">
        <h3 className="titulo-seccion-completa">
          <span className="icono-seccion">🩺</span>
          Diagnóstico y Tratamiento
        </h3>
        <div className="contenido-seccion-completa">
          <div className="diagnostico-tratamiento-editable">
            <div className="campo-diagnostico">
              <label htmlFor="diagnostico-input">
                <strong>Diagnóstico:</strong>
              </label>
              <textarea
                id="diagnostico-input"
                className="input-diagnostico"
                placeholder="Escriba el diagnóstico del paciente..."
                defaultValue={historialSeleccionado.diagnostico || ''}
                rows="3"
              />
            </div>
            
            <div className="campo-tratamiento">
              <label htmlFor="tratamiento-input">
                <strong>Tratamiento:</strong>
              </label>
              <textarea
                id="tratamiento-input"
                className="input-tratamiento"
                placeholder="Escriba el tratamiento recomendado..."
                defaultValue={historialSeleccionado.tratamiento || ''}
                rows="4"
              />
            </div>
            
            <div className="acciones-diagnostico">
              <button 
                className="btn-guardar-diagnostico"
                onClick={() => guardarDiagnosticoTratamiento()}
              >
                💾 Guardar Diagnóstico y Tratamiento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

      case 'antecedentes':
        return (
          <div className="vista-antecedentes-completa">
            {/* Antecedentes Heredo-Familiares */}
            {Object.keys(antecedentesHFData).length > 0 && 
              renderSeccion('👨‍👩‍👧‍👦 Antecedentes Heredo-Familiares', [
                // Antecedentes por familiares
                antecedentesHFData.antecedentes && Array.isArray(antecedentesHFData.antecedentes) && 
                antecedentesHFData.antecedentes.map((familiar, index) => (
                  familiar.padecimientos && (
                    <div key={index} className="familiar-antecedente">
                      <strong>{familiar.parentesco}:</strong>
                      <span>{familiar.padecimientos}</span>
                      {familiar.edad && <em> (Edad: {familiar.edad})</em>}
                      <span className={`estado-familiar ${familiar.vivo ? 'vivo' : 'finado'}`}>
                        {familiar.vivo ? ' - Vivo' : ' - Finado'}
                      </span>
                    </div>
                  )
                )),
                
                // Enfermedades relevantes
                antecedentesHFData.enfermedades_relevantes && Object.entries(antecedentesHFData.enfermedades_relevantes).map(([enfermedad, presente]) => 
                  presente && renderCampo(enfermedad.replace('_', ' ').toUpperCase(), 'Presente')
                )
              ])
            }

            {/* Antecedentes Personales No Patológicos */}
            {Object.keys(antecedentesNPData).length > 0 && 
              renderSeccion('🏃‍♂️ Antecedentes Personales No Patológicos', [
                // Servicios Públicos
                antecedentesNPData.servicios_publicos && renderSeccion('🏘️ Servicios Públicos', 
                  Object.entries(antecedentesNPData.servicios_publicos).map(([servicio, tiene]) => 
                    typeof tiene === 'boolean' && renderCampo(servicio.replace('_', ' ').toUpperCase(), tiene ? 'Sí' : 'No')
                  ).filter(Boolean)
                ),

                // Higiene
                antecedentesNPData.higiene && [
                  renderCampo('Higiene General', antecedentesNPData.higiene.general),
                  renderCampo('Higiene Bucal', antecedentesNPData.higiene.bucal)
                ],

                // Hábitos Alimentarios
                antecedentesNPData.alimentarios && renderSeccion('🍽️ Hábitos Alimentarios', [
                  renderCampo('Comidas por día', antecedentesNPData.alimentarios.comidas_por_dia),
                  renderCampo('Cantidad de agua (litros)', antecedentesNPData.alimentarios.cantidad_agua),
                  renderCampo('Desayuno', antecedentesNPData.alimentarios.desayuno),
                  renderCampo('Comida', antecedentesNPData.alimentarios.comida),
                  renderCampo('Cena', antecedentesNPData.alimentarios.cena),
                  renderCampo('Entre comidas', antecedentesNPData.alimentarios.entre_comidas)
                ]),

                // Hábitos Perniciosos
                antecedentesNPData.habitos_perniciosos && renderSeccion('⚠️ Hábitos Perniciosos', [
                  // Alcoholismo
                  antecedentesNPData.habitos_perniciosos.alcoholismo && [
                    renderCampo('Alcoholismo', antecedentesNPData.habitos_perniciosos.alcoholismo.tiene ? 'Sí' : 'No'),
                    antecedentesNPData.habitos_perniciosos.alcoholismo.tiene && [
                      renderCampo('Frecuencia', antecedentesNPData.habitos_perniciosos.alcoholismo.frecuencia),
                      renderCampo('Cantidad', antecedentesNPData.habitos_perniciosos.alcoholismo.cantidad),
                      renderCampo('Tipo', antecedentesNPData.habitos_perniciosos.alcoholismo.tipo)
                    ]
                  ],
                  
                  // Tabaquismo
                  antecedentesNPData.habitos_perniciosos.tabaquismo && [
                    renderCampo('Tabaquismo', antecedentesNPData.habitos_perniciosos.tabaquismo.tiene ? 'Sí' : 'No'),
                    antecedentesNPData.habitos_perniciosos.tabaquismo.tiene && [
                      renderCampo('Frecuencia', antecedentesNPData.habitos_perniciosos.tabaquismo.frecuencia),
                      renderCampo('Tiempo fumando', antecedentesNPData.habitos_perniciosos.tabaquismo.cantidad),
                      renderCampo('Tipo de tabaco', antecedentesNPData.habitos_perniciosos.tabaquismo.tipo)
                    ]
                  ],

                  // Hábitos Orales
                  antecedentesNPData.habitos_perniciosos.habitos_orales && Object.entries(antecedentesNPData.habitos_perniciosos.habitos_orales).map(([habito, presente]) => 
                    presente && habito !== 'otros' && renderCampo(habito.replace('_', ' ').toUpperCase(), 'Presente')
                  )
                ])
              ])
            }

            {/* Antecedentes Personales Patológicos */}
            {Object.keys(antecedentesPPData).length > 0 && 
              renderSeccion('🏥 Antecedentes Personales Patológicos', [
                // Padecimientos
                antecedentesPPData.padecimientos && Array.isArray(antecedentesPPData.padecimientos) &&
                antecedentesPPData.padecimientos.filter(p => p.padecimiento).map((padecimiento, index) => (
                  <div key={index} className="padecimiento-item">
                    <strong>{padecimiento.padecimiento}</strong>
                    {padecimiento.edad && <span> (Edad: {padecimiento.edad})</span>}
                    {padecimiento.control_medico && <div>Control médico: {padecimiento.control_medico}</div>}
                    {padecimiento.complicaciones && <div>Complicaciones: {padecimiento.complicaciones}</div>}
                  </div>
                )),

                // Somatometría
                antecedentesPPData.somatometria && renderSeccion('📏 Somatometría', [
                  renderCampo('Peso', antecedentesPPData.somatometria.peso ? `${antecedentesPPData.somatometria.peso} kg` : ''),
                  renderCampo('Talla', antecedentesPPData.somatometria.talla ? `${antecedentesPPData.somatometria.talla} cm` : ''),
                  renderCampo('IMC', antecedentesPPData.somatometria.imc)
                ]),

                // Signos Vitales
                antecedentesPPData.signos_vitales && renderSeccion('💓 Signos Vitales', [
                  renderCampo('Temperatura', antecedentesPPData.signos_vitales.temperatura ? `${antecedentesPPData.signos_vitales.temperatura}°C` : ''),
                  renderCampo('Tensión Arterial', 
                    antecedentesPPData.signos_vitales.tension_arterial_sistolica && antecedentesPPData.signos_vitales.tension_arterial_diastolica ?
                    `${antecedentesPPData.signos_vitales.tension_arterial_sistolica}/${antecedentesPPData.signos_vitales.tension_arterial_diastolica} mmHg` : ''
                  ),
                  renderCampo('Frecuencia Cardíaca', antecedentesPPData.signos_vitales.frecuencia_cardiaca ? `${antecedentesPPData.signos_vitales.frecuencia_cardiaca} lpm` : ''),
                  renderCampo('Frecuencia Respiratoria', antecedentesPPData.signos_vitales.frecuencia_respiratoria ? `${antecedentesPPData.signos_vitales.frecuencia_respiratoria} rpm` : '')
                ])
              ])
            }
          </div>
        );

        case 'examenes':
        return (
          <div className="vista-examenes-completa">
            {/* Examen Extrabucal */}
            {Object.keys(examenExtrabucalData).length > 0 && 
              renderSeccion('👤 Examen Extrabucal', [
                // Cabeza
                examenExtrabucalData.cabeza && renderSeccion('🧠 Cabeza', [
                  renderCampo('Cráneo', examenExtrabucalData.cabeza.craneo),
                  renderCampo('Biotipo Facial', examenExtrabucalData.cabeza.biotipo_facial),
                  renderCampo('Perfil', examenExtrabucalData.cabeza.perfil)
                ]),

                // ATM
                examenExtrabucalData.atm && renderSeccion('🦴 Articulación Temporomandibular', [
                  renderCampo('Alteraciones', examenExtrabucalData.atm.alteracion),
                  renderCampo('Apertura Máxima', examenExtrabucalData.atm.apertura_maxima ? `${examenExtrabucalData.atm.apertura_maxima} mm` : ''),
                  renderCampo('Lateralidad Derecha', examenExtrabucalData.atm.lateralidad_derecha ? `${examenExtrabucalData.atm.lateralidad_derecha} mm` : ''),
                  renderCampo('Lateralidad Izquierda', examenExtrabucalData.atm.lateralidad_izquierda ? `${examenExtrabucalData.atm.lateralidad_izquierda} mm` : ''),
                  renderCampo('Masticación Bilateral', examenExtrabucalData.atm.masticacion_bilateral !== undefined ? 
                    (examenExtrabucalData.atm.masticacion_bilateral ? 'Sí' : 'No') : ''),
                  renderCampo('Descripción', examenExtrabucalData.atm.descripcion_masticacion)
                ]),

                // Músculos del Cuello
                examenExtrabucalData.musculos_cuello && renderSeccion('💪 Músculos del Cuello', 
                  Object.entries(examenExtrabucalData.musculos_cuello).map(([musculo, descripcion]) => 
                    renderCampo(musculo.replace('_', ' ').toUpperCase(), descripcion)
                  ).filter(Boolean)
                )
              ])
            }

            {/* Examen Intrabucal */}
            {Object.keys(examenIntrabucalData).length > 0 && 
              renderSeccion('🦷 Examen Intrabucal', [
                // Estructuras Intrabucales
                examenIntrabucalData.estructuras && renderSeccion('🔍 Estructuras Intrabucales', 
                  Object.entries(examenIntrabucalData.estructuras).map(([estructura, descripcion]) => 
                    renderCampo(estructura.replace('_', ' ').toUpperCase(), descripcion)
                  ).filter(Boolean)
                ),

                // Higiene Bucal
                examenIntrabucalData.higiene_bucal && renderSeccion('🪥 Higiene Bucal', [
                  renderCampo('Estado General', examenIntrabucalData.higiene_bucal.general),
                  renderCampo('Índice de Placa', examenIntrabucalData.higiene_bucal.indice_placa),
                  renderCampo('Cálculo', examenIntrabucalData.higiene_bucal.calculo),
                  renderCampo('Halitosis', examenIntrabucalData.higiene_bucal.halitosis)
                ]),

                // Encías
                examenIntrabucalData.encias && renderSeccion('🟣 Encías', [
                  renderCampo('Color', examenIntrabucalData.encias.color),
                  renderCampo('Textura', examenIntrabucalData.encias.textura),
                  renderCampo('Forma', examenIntrabucalData.encias.forma),
                  renderCampo('Consistencia', examenIntrabucalData.encias.consistencia),
                  renderCampo('Sangrado', examenIntrabucalData.encias.sangrado),
                  
                  // Alteraciones gingivales
                  examenIntrabucalData.encias.alteraciones && Array.isArray(examenIntrabucalData.encias.alteraciones) &&
                  examenIntrabucalData.encias.alteraciones.map((alteracion, index) => (
                    <div key={index} className="alteracion-gingival">
                      <strong>Alteración {index + 1}:</strong>
                      <div>Localización: {alteracion.localizacion}</div>
                      <div>Descripción: {alteracion.descripcion}</div>
                      {alteracion.tamaño && <div>Tamaño: {alteracion.tamaño}</div>}
                      {alteracion.color && <div>Color: {alteracion.color}</div>}
                      {alteracion.consistencia && <div>Consistencia: {alteracion.consistencia}</div>}
                    </div>
                  ))
                ])
              ])
            }

            {/* Oclusión */}
            {Object.keys(oclusionData).length > 0 && 
              renderSeccion('🦷 Oclusión y Odontograma', [
                // Clasificación de Angle
                oclusionData.clasificacion_angle && renderSeccion('📐 Clasificación de Angle', [
                  renderCampo('Relación Molar Derecho', oclusionData.clasificacion_angle.relacion_molar_derecho),
                  renderCampo('Relación Molar Izquierdo', oclusionData.clasificacion_angle.relacion_molar_izquierdo),
                  renderCampo('Relación Canina Derecho', oclusionData.clasificacion_angle.relacion_canina_derecho),
                  renderCampo('Relación Canina Izquierdo', oclusionData.clasificacion_angle.relacion_canina_izquierdo),
                  renderCampo('Sobremordida Vertical', oclusionData.clasificacion_angle.sobremordida_vertical),
                  renderCampo('Sobremordida Horizontal', oclusionData.clasificacion_angle.sobremordida_horizontal),
                  renderCampo('Línea Media Maxilar', oclusionData.clasificacion_angle.linea_media_maxilar),
                  renderCampo('Línea Media Mandibular', oclusionData.clasificacion_angle.linea_media_mandibular),
                  renderCampo('Diastemas', oclusionData.clasificacion_angle.diastemas),
                  renderCampo('Apiñamiento', oclusionData.clasificacion_angle.apiñamiento)
                ]),

                // Armonía de Maxilares
                oclusionData.armonia_maxilares && renderSeccion('🏛️ Armonía de Maxilares', [
                  renderCampo('Amplitud Arco Superior', oclusionData.armonia_maxilares.amplitud_arco_superior),
                  renderCampo('Bóveda Palatina', oclusionData.armonia_maxilares.boveda_palatina),
                  renderCampo('Amplitud Arco Inferior', oclusionData.armonia_maxilares.amplitud_arco_inferior),
                  renderCampo('Descripción', oclusionData.armonia_maxilares.descripcion_armonia)
                ]),

                // Odontograma
                oclusionData.odontograma && renderSeccion('🦷 Odontograma', [
                  renderCampo('Observaciones Generales', oclusionData.odontograma.observaciones_generales),
                  
                  // Dientes presentes/ausentes
                  oclusionData.odontograma.dientes_presentes && Object.entries(oclusionData.odontograma.dientes_presentes).length > 0 && (
                    <div className="dientes-estado">
                      <h4>Estado de Dientes:</h4>
                      {Object.entries(oclusionData.odontograma.dientes_presentes).map(([diente, estado]) => (
                        <span key={diente} className={`diente-estado ${estado}`}>
                          Diente {diente}: {estado}
                        </span>
                      ))}
                    </div>
                  )
                ])
              ])
            }
          </div>
        );

      case 'completo':
  return (
    <div className="vista-completa-historial">
      {/* ELIMINADO: .historial-completo-header */}
      
      {/* INFORMACIÓN PERSONAL */}
      {(Object.keys(datosPersonales).length > 0 || Object.keys(fichaIdentificacionData).length > 0) && 
        renderSeccion('👤 Información Personal', [
          renderCampo('Nombre Completo', datosPersonales.nombre || fichaIdentificacionData.nombre),
          renderCampo('Apellido Paterno', datosPersonales.apellidoPaterno || fichaIdentificacionData.apellidoPaterno),
          renderCampo('Apellido Materno', datosPersonales.apellidoMaterno || fichaIdentificacionData.apellidoMaterno),
          renderCampo('Sexo', datosPersonales.sexo || fichaIdentificacionData.sexo),
          renderCampo('Fecha de Nacimiento', datosPersonales.fechaNacimiento || fichaIdentificacionData.fechaNacimiento),
          renderCampo('RFC', datosPersonales.rfc || fichaIdentificacionData.rfc),
          renderCampo('Teléfono', datosPersonales.telefono || fichaIdentificacionData.telefono),
          renderCampo('Email', datosPersonales.email || fichaIdentificacionData.email)
        ])
      }

      {/* MOTIVO DE CONSULTA */}
      {(Object.keys(motivoConsultaData).length > 0 || historialSeleccionado.motivo_consulta_texto) && 
        renderSeccion('🗣️ Motivo de Consulta', [
          renderCampo('Motivo Principal', motivoConsultaData.motivo || motivoConsultaData.motivo_principal || historialSeleccionado.motivo_consulta_texto),
          renderCampo('Escala de Dolor', motivoConsultaData.escalaDolor ? `${motivoConsultaData.escalaDolor}/10` : ''),
          renderCampo('Nivel de Urgencia', motivoConsultaData.nivelUrgencia),
          renderCampo('Duración de Síntomas', motivoConsultaData.duracionSintomas),
          renderCampo('Tratamiento Previo', motivoConsultaData.tratamientoPrevio),
          renderCampo('Padecimiento Actual', motivoConsultaData.padecimiento_actual),
          renderCampo('Evolución', motivoConsultaData.evolucion)
        ])
      }

      {/* Resto del contenido sin cambios... */}
      {/* ANTECEDENTES HEREDO-FAMILIARES */}
      {Object.keys(antecedentesHFData).length > 0 && 
        renderSeccion('👨‍👩‍👧‍👦 Antecedentes Heredo-Familiares', [
          antecedentesHFData.antecedentes && Array.isArray(antecedentesHFData.antecedentes) && 
          antecedentesHFData.antecedentes.filter(f => f.padecimientos).map((familiar, index) => (
            <div key={index} className="familiar-antecedente">
              <strong>{familiar.parentesco}:</strong> {familiar.padecimientos}
              {familiar.edad && ` (${familiar.edad} años)`}
              <span className={`estado ${familiar.vivo ? 'vivo' : 'finado'}`}>
                {familiar.vivo ? ' - Vivo' : ' - Finado'}
              </span>
            </div>
          ))
        ])
      }

            {/* ANTECEDENTES PERSONALES NO PATOLÓGICOS */}
            {Object.keys(antecedentesNPData).length > 0 && 
              renderSeccion('🏃‍♂️ Antecedentes Personales No Patológicos', [
                // Servicios públicos
                antecedentesNPData.servicios_publicos && Object.entries(antecedentesNPData.servicios_publicos).map(([servicio, valor]) => 
                  typeof valor === 'boolean' && renderCampo(servicio.replace('_', ' '), valor ? 'Sí' : 'No')
                ),
                
                // Higiene
                antecedentesNPData.higiene && [
                  renderCampo('Higiene General', antecedentesNPData.higiene.general),
                  renderCampo('Higiene Bucal', antecedentesNPData.higiene.bucal)
                ]
              ])
            }

            {/* ANTECEDENTES PERSONALES PATOLÓGICOS */}
            {Object.keys(antecedentesPPData).length > 0 && 
              renderSeccion('🏥 Antecedentes Personales Patológicos', [
                // Signos vitales
                antecedentesPPData.signos_vitales && [
                  renderCampo('Temperatura', antecedentesPPData.signos_vitales.temperatura ? `${antecedentesPPData.signos_vitales.temperatura}°C` : ''),
                  renderCampo('Tensión Arterial', 
                    antecedentesPPData.signos_vitales.tension_arterial_sistolica && antecedentesPPData.signos_vitales.tension_arterial_diastolica ?
                    `${antecedentesPPData.signos_vitales.tension_arterial_sistolica}/${antecedentesPPData.signos_vitales.tension_arterial_diastolica} mmHg` : ''
                  ),
                  renderCampo('Frecuencia Cardíaca', antecedentesPPData.signos_vitales.frecuencia_cardiaca ? `${antecedentesPPData.signos_vitales.frecuencia_cardiaca} lpm` : ''),
                  renderCampo('Frecuencia Respiratoria', antecedentesPPData.signos_vitales.frecuencia_respiratoria ? `${antecedentesPPData.signos_vitales.frecuencia_respiratoria} rpm` : '')
                ]
              ])
            }

            {/* EXAMEN EXTRABUCAL */}
            {Object.keys(examenExtrabucalData).length > 0 && 
              renderSeccion('👤 Examen Extrabucal', [
                examenExtrabucalData.cabeza && [
                  renderCampo('Cráneo', examenExtrabucalData.cabeza.craneo),
                  renderCampo('Biotipo Facial', examenExtrabucalData.cabeza.biotipo_facial),
                  renderCampo('Perfil', examenExtrabucalData.cabeza.perfil)
                ]
              ])
            }

            {/* EXAMEN INTRABUCAL */}
            {Object.keys(examenIntrabucalData).length > 0 && 
              renderSeccion('🦷 Examen Intrabucal', [
                examenIntrabucalData.estructuras && Object.entries(examenIntrabucalData.estructuras).map(([estructura, desc]) => 
                  renderCampo(estructura.replace('_', ' '), desc)
                ),
                
                examenIntrabucalData.higiene_bucal && renderCampo('Higiene Bucal General', examenIntrabucalData.higiene_bucal.general)
              ])
            }

            {/* OCLUSIÓN */}
            {Object.keys(oclusionData).length > 0 && 
              renderSeccion('🦷 Oclusión y Odontograma', [
                // Clasificación de Angle
                oclusionData.clasificacion_angle && [
                  renderCampo('Relación Molar Derecho', oclusionData.clasificacion_angle.relacion_molar_derecho),
                  renderCampo('Relación Molar Izquierdo', oclusionData.clasificacion_angle.relacion_molar_izquierdo),
                  renderCampo('Relación Canina Derecho', oclusionData.clasificacion_angle.relacion_canina_derecho),
                  renderCampo('Relación Canina Izquierdo', oclusionData.clasificacion_angle.relacion_canina_izquierdo)
                ],
                
                // Armonía de maxilares
                oclusionData.armonia_maxilares && [
                  renderCampo('Amplitud Arco Superior', oclusionData.armonia_maxilares.amplitud_arco_superior),
                  renderCampo('Bóveda Palatina', oclusionData.armonia_maxilares.boveda_palatina),
                  renderCampo('Amplitud Arco Inferior', oclusionData.armonia_maxilares.amplitud_arco_inferior)
                ],
                
                // Odontograma
                oclusionData.odontograma && renderCampo('Observaciones Odontograma', oclusionData.odontograma.observaciones_generales)
              ])
            }

            {/* DIAGNÓSTICO Y TRATAMIENTO */}
            {renderSeccion('🩺 Diagnóstico y Tratamiento', [
              renderCampo('Diagnóstico', historialSeleccionado.diagnostico),
              renderCampo('Tratamiento Realizado', historialSeleccionado.tratamiento),
              
              // Plan de tratamiento
              historialSeleccionado.plan_tratamiento && (() => {
                const planData = parsearDatosJSON(historialSeleccionado.plan_tratamiento);
                return [
                  renderCampo('Plan Inmediato', planData.inmediato),
                  renderCampo('Seguimiento', planData.seguimiento),
                  renderCampo('Próxima Cita', planData.proxima_cita),
                  renderLista('Recomendaciones', planData.recomendaciones),
                  
                  // Medicamentos prescritos
                  planData.medicamentos_prescritos && Array.isArray(planData.medicamentos_prescritos) && (
                    <div className="medicamentos-prescritos" key="medicamentos">
                      <strong>💊 Medicamentos Prescritos:</strong>
                      <div className="medicamentos-lista">
                        {planData.medicamentos_prescritos.map((med, index) => (
                          <div key={index} className="medicamento-item">
                            <strong>{med.medicamento}</strong>
                            <div>Dosis: {med.dosis}</div>
                            {med.indicaciones && <div>Indicaciones: {med.indicaciones}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ];
              })()
            ])}

            {/* INFORMACIÓN ADICIONAL */}
            <div className="informacion-adicional">
              <div className="metadatos-historial">
                <h4>📊 Información del Historial</h4>
                <div className="metadatos-grid">
                  <div className="metadato-item">
                    <strong>Estado:</strong>
                    <span className={`estado-badge ${historialSeleccionado.estado}`}>
                      {historialSeleccionado.estado?.toUpperCase()}
                    </span>
                  </div>
                  <div className="metadato-item">
                    <strong>Versión:</strong>
                    <span>{historialSeleccionado.version || '1.0'}</span>
                  </div>
                  <div className="metadato-item">
                    <strong>Fecha de Creación:</strong>
                    <span>{formatearFecha(historialSeleccionado.created_at)}</span>
                  </div>
                  <div className="metadato-item">
                    <strong>Última Actualización:</strong>
                    <span>{formatearFecha(historialSeleccionado.updated_at)}</span>
                  </div>
                  {historialSeleccionado.pdf_filename && (
                    <div className="metadato-item">
                      <strong>PDF Generado:</strong>
                      <span>✅ Disponible</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

       default:
      return (
        <div className="vista-no-encontrada">
          <h3>❌ Vista no encontrada</h3>
          <p>La vista "{vistaActiva}" no está disponible.</p>
          <button 
            onClick={() => setVistaActiva('resumen')} 
            className="btn-vista-completa"
          >
            Ver Resumen
          </button>
        </div>
      );
  }
};

  // Función mejorada para generar PDF del historial completo
  const generarPDFHistorial = useCallback(async () => {
    try {
      console.log('📄 Generando PDF completo del historial clínico...');
      
      if (!historialSeleccionado) {
        alert('⚠️ Por favor selecciona un historial para generar el PDF');
        return;
      }

      // Configuración optimizada del PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      let yPosition = 25;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.width - (margin * 2);

      // Colores profesionales
      const colorPrimario = [41, 128, 185]; // Azul profesional
      const colorSecundario = [52, 73, 94]; // Gris oscuro
      const colorTexto = [44, 62, 80]; // Gris muy oscuro
      const colorLinea = [189, 195, 199]; // Gris claro

      // Funciones auxiliares mejoradas
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

      // Parsear datos del historial seleccionado
      const datosPersonales = parsearDatosJSON(historialSeleccionado.datos_personales);
      const fichaIdentificacionData = parsearDatosJSON(historialSeleccionado.ficha_identificacion);
      const motivoConsultaData = parsearDatosJSON(historialSeleccionado.motivo_consulta);
      const antecedentesHFData = parsearDatosJSON(historialSeleccionado.antecedentes_heredo_familiares);
      const antecedentesNPData = parsearDatosJSON(historialSeleccionado.antecedentes_personales_no_patologicos);
      const antecedentesPPData = parsearDatosJSON(historialSeleccionado.antecedentes_personales_patologicos);
      const examenExtrabucalData = parsearDatosJSON(historialSeleccionado.examen_extrabucal);
      const examenIntrabucalData = parsearDatosJSON(historialSeleccionado.examen_intrabucal);
      const oclusionData = parsearDatosJSON(historialSeleccionado.oclusion);

      // Encabezado profesional
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

      // Secciones del historial
      // 1. Información Personal
      agregarTituloSeccion('INFORMACION PERSONAL DEL PACIENTE', '1');
      agregarCampo('Nombre completo', nombreCompleto);
      agregarCampo('Sexo', paciente?.sexo === 'M' ? 'Masculino' : paciente?.sexo === 'F' ? 'Femenino' : 'No especificado');
      agregarCampo('Fecha de nacimiento', formatearFecha(paciente?.fecha_nacimiento || datosPersonales.fecha_nacimiento));
      agregarCampo('Edad', `${calcularEdad(paciente?.fecha_nacimiento || datosPersonales.fecha_nacimiento)} años`);
      agregarCampo('Telefono', limpiarTexto(paciente?.telefono || datosPersonales.telefono));
      agregarCampo('Correo electronico', limpiarTexto(paciente?.correo_electronico || datosPersonales.email));
      agregarCampo('Direccion', limpiarTexto(paciente?.calle_numero || datosPersonales.direccion));
      agregarCampo('Numero de seguridad social', limpiarTexto(paciente?.numero_seguridad_social || datosPersonales.numero_seguridad_social));
      yPosition += 10;

      // 2. Ficha de Identificación
      if (Object.keys(fichaIdentificacionData).length > 0) {
        agregarTituloSeccion('FICHA DE IDENTIFICACION', '2');
        agregarCampo('Edad', fichaIdentificacionData.edad ? `${fichaIdentificacionData.edad} años` : '');
        agregarCampo('Estado civil', limpiarTexto(fichaIdentificacionData.estado_civil));
        agregarCampo('Ocupacion', limpiarTexto(fichaIdentificacionData.ocupacion));
        agregarCampo('Escolaridad', limpiarTexto(fichaIdentificacionData.escolaridad));
        agregarCampo('Lugar de trabajo', limpiarTexto(fichaIdentificacionData.lugar_trabajo));
        
        if (fichaIdentificacionData.contacto_emergencia) {
          agregarSubseccion('Contacto de Emergencia');
          agregarCampo('Nombre', limpiarTexto(fichaIdentificacionData.contacto_emergencia.nombre));
          agregarCampo('Parentesco', limpiarTexto(fichaIdentificacionData.contacto_emergencia.parentesco));
          agregarCampo('Telefono', limpiarTexto(fichaIdentificacionData.contacto_emergencia.telefono));
        }
        yPosition += 10;
      }

      // 3. Motivo de Consulta
      if (Object.keys(motivoConsultaData).length > 0 || historialSeleccionado.motivo_consulta_texto) {
        agregarTituloSeccion('MOTIVO DE CONSULTA', '3');
        agregarCampo('Motivo principal', limpiarTexto(motivoConsultaData.motivo_principal || historialSeleccionado.motivo_consulta_texto));
        agregarCampo('Padecimiento actual', limpiarTexto(motivoConsultaData.padecimiento_actual));
        agregarCampo('Inicio de sintomas', limpiarTexto(motivoConsultaData.inicio_sintomas));
        agregarCampo('Tipo de dolor', limpiarTexto(motivoConsultaData.tipo_dolor));
        agregarCampo('Intensidad del dolor', motivoConsultaData.intensidad_dolor ? `${motivoConsultaData.intensidad_dolor}/10` : '');
        agregarCampo('Urgencia', limpiarTexto(motivoConsultaData.urgencia));
        agregarCampo('Evolucion', limpiarTexto(motivoConsultaData.evolucion));
        agregarCampo('Tratamientos previos', limpiarTexto(motivoConsultaData.tratamientos_previos));
        
        if (motivoConsultaData.factores_desencadenantes && Array.isArray(motivoConsultaData.factores_desencadenantes)) {
          agregarCampo('Factores desencadenantes', limpiarTexto(motivoConsultaData.factores_desencadenantes.join(', ')));
        }
        
        if (motivoConsultaData.sintomas_asociados && Array.isArray(motivoConsultaData.sintomas_asociados)) {
          agregarCampo('Sintomas asociados', limpiarTexto(motivoConsultaData.sintomas_asociados.join(', ')));
        }
        yPosition += 10;
      }

      // 4. Antecedentes Heredo-Familiares
      if (Object.keys(antecedentesHFData).length > 0) {
        agregarTituloSeccion('ANTECEDENTES HEREDO-FAMILIARES', '4');
        
        if (antecedentesHFData.padre) {
          agregarSubseccion('Antecedentes Paternos');
          if (typeof antecedentesHFData.padre === 'object') {
            agregarCampo('Estado', antecedentesHFData.padre.vivo ? 'Vivo' : 'Fallecido');
            agregarCampo('Edad', limpiarTexto(antecedentesHFData.padre.edad));
            agregarCampo('Enfermedades', limpiarTexto(Array.isArray(antecedentesHFData.padre.enfermedades) ? 
                        antecedentesHFData.padre.enfermedades.join(', ') : antecedentesHFData.padre.enfermedades));
          } else {
            agregarCampo('Antecedentes', limpiarTexto(Array.isArray(antecedentesHFData.padre) ? 
                        antecedentesHFData.padre.join(', ') : antecedentesHFData.padre));
          }
        }
        
        if (antecedentesHFData.madre) {
          agregarSubseccion('Antecedentes Maternos');
          if (typeof antecedentesHFData.madre === 'object') {
            agregarCampo('Estado', antecedentesHFData.madre.vivo ? 'Vivo' : 'Fallecido');
            agregarCampo('Edad', limpiarTexto(antecedentesHFData.madre.edad));
            agregarCampo('Enfermedades', limpiarTexto(Array.isArray(antecedentesHFData.madre.enfermedades) ? 
                        antecedentesHFData.madre.enfermedades.join(', ') : antecedentesHFData.madre.enfermedades));
          } else {
            agregarCampo('Antecedentes', limpiarTexto(Array.isArray(antecedentesHFData.madre) ? 
                        antecedentesHFData.madre.join(', ') : antecedentesHFData.madre));
          }
        }
        yPosition += 10;
      }

      // Continuar con las demás secciones...
      // 5. Antecedentes Personales No Patológicos
      if (Object.keys(antecedentesNPData).length > 0) {
        agregarTituloSeccion('ANTECEDENTES PERSONALES NO PATOLOGICOS', '5');
        
        if (antecedentesNPData.habitos) {
          agregarSubseccion('Habitos');
          const habitos = antecedentesNPData.habitos;
          
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
        }
        yPosition += 10;
      }

      // 6. Diagnóstico y Tratamiento
      agregarTituloSeccion('DIAGNOSTICO Y TRATAMIENTO', '6');
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

      // Pie de página profesional
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

      // Guardar PDF
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
  }, [historialSeleccionado, paciente, formatearFecha, calcularEdad, parsearDatosJSON]);

  // Función para el botón PDF
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
            estudiosLaboratorio={estudiosLaboratorio}  // ✅ CORREGIDO: nombre correcto de la prop
            loadingEstudios={loadingEstudios}
            onSolicitarNuevo={solicitarNuevoEstudio}
            onRecargar={cargarEstudiosLaboratorio}    // ✅ AGREGADO: función para recargar
            formatearFecha={formatearFecha}
            buildApiUrl={buildApiUrl}
            getAuthHeaders={getAuthHeaders}
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
            getAuthHeaders={getAuthHeaders}
          />
        );
        
      case 'resumen':
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

  // Validaciones y estados de carga
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

  // Loading dental unificado para todo
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

  // Render principal
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