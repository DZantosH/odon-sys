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
  if (!texto || texto === 'undefined' || texto === 'null' || texto === 'No especificado') {
    return '';
  }
  
  const textoLimpio = String(texto).trim();
  return textoLimpio.length > 0 ? textoLimpio : '';
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


 // FUNCIÓN AUXILIAR PARA PARSEAR DATOS JSON MEJORADA
const parsearDatosJSON = useCallback((datos, fallback = {}) => {
  try {
    console.log('🔍 Parseando datos:', datos);
    
    if (!datos) {
      console.log('⚠️ Datos vacíos o nulos');
      return fallback;
    }
    
    // Si ya es un objeto
    if (typeof datos === 'object' && datos !== null) {
      console.log('✅ Datos ya son objeto:', datos);
      return datos;
    }
    
    // Si es string, intentar parsear
    if (typeof datos === 'string') {
      const datosTrimmed = datos.trim();
      
      // Si empieza con { o [, es JSON
      if (datosTrimmed.startsWith('{') || datosTrimmed.startsWith('[')) {
        const parsed = JSON.parse(datosTrimmed);
        console.log('✅ JSON parseado exitosamente:', parsed);
        return parsed;
      }
      
      // Si es un string simple, retornarlo como objeto con una propiedad
      console.log('📝 String simple convertido a objeto');
      return { texto: datosTrimmed };
    }
    
    console.log('⚠️ Tipo de dato no reconocido:', typeof datos);
    return fallback;
    
  } catch (error) {
    console.warn('❌ Error parseando JSON:', error, 'Datos originales:', datos);
    
    // Si falla el parsing pero tenemos un string, intentar devolverlo como texto simple
    if (typeof datos === 'string' && datos.trim().length > 0) {
      return { texto: datos.trim() };
    }
    
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

// FUNCIÓN MEJORADA PARA RENDERIZAR EL HISTORIAL CLÍNICO COMPLETO
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
    <div className="historial-layout-optimizado">
      {/* CONTENIDO PRINCIPAL SIN SIDEBAR */}
      <div className="contenido-historial-optimizado">
        {historialSeleccionado ? (
          <>
            {/* HEADER OPTIMIZADO CON INFORMACIÓN Y ACCIONES */}
           <div className="header-historial-optimizado">
          <div className="info-historial-header">
            <h2>Historial del {formatearFecha(historialSeleccionado.fecha_consulta)}</h2>
                <div className="info-consulta-compacta">
                  <span>👨‍⚕️ Dr. {historialSeleccionado.doctor_nombre}</span>
                  <span>📅 {historialSeleccionado.tipo_cita}</span>
                  <span>🆔 #{historialSeleccionado.id}</span>
                  <span className={`estado-badge ${historialSeleccionado.estado || 'completado'}`}>
                    {historialSeleccionado.estado === 'completado' ? '✅ Completado' : 
                     historialSeleccionado.estado === 'en_proceso' ? '⏳ En proceso' : 
                     '📝 Borrador'}
                  </span>
                </div>
              </div>
              
              {/* ACCIONES DEL HISTORIAL */}
              <div className="acciones-historial-header">
                <button 
                  className="btn-generar-pdf-header"
                  onClick={handleGenerarPDF}
                  disabled={!historialSeleccionado}
                  title="Generar PDF del historial seleccionado"
                >
                  📄 Generar PDF
                </button>
                
              </div>
            </div>

            {/* NAVEGACIÓN DE VISTAS MEJORADA CON BOTONES INTEGRADOS */}
            <div className="nav-vistas-completo-optimizado">
              <div className="nav-buttons-left">
                <button
                  className={`nav-vista-btn ${vistaActiva === 'resumen' ? 'activo' : ''}`}
                  onClick={() => setVistaActiva('resumen')}
                >
                  📄 Resumen Ejecutivo
                </button>
                <button
                  className={`nav-vista-btn ${vistaActiva === 'identificacion' ? 'activo' : ''}`}
                  onClick={() => setVistaActiva('identificacion')}
                >
                  🆔 Identificación
                </button>
                <button
                  className={`nav-vista-btn ${vistaActiva === 'motivo' ? 'activo' : ''}`}
                  onClick={() => setVistaActiva('motivo')}
                >
                  🗣️ Motivo Consulta
                </button>
                <button
                  className={`nav-vista-btn ${vistaActiva === 'antecedentes' ? 'activo' : ''}`}
                  onClick={() => setVistaActiva('antecedentes')}
                >
                  👨‍👩‍👧‍👦 Antecedentes
                </button>
                <button
                  className={`nav-vista-btn ${vistaActiva === 'examenes' ? 'activo' : ''}`}
                  onClick={() => setVistaActiva('examenes')}
                >
                  🔍 Exámenes
                </button>
                <button
                  className={`nav-vista-btn ${vistaActiva === 'oclusion' ? 'activo' : ''}`}
                  onClick={() => setVistaActiva('oclusion')}
                >
                  🦷 Oclusión
                </button>
                <button
                  className={`nav-vista-btn ${vistaActiva === 'completo' ? 'activo' : ''}`}
                  onClick={() => setVistaActiva('completo')}
                >
                  📋 Vista Completa
                </button>
              </div>
            </div>

            <div className="contenido-vista">
              {renderContenidoHistorialCompleto()}
            </div>
          </>
        ) : (
          <div className="sin-historial-seleccionado">
            <div className="mensaje-seleccionar">
              <div className="icono-seleccionar">📋</div>
              <h3>Selecciona un historial</h3>
              <p>Usa el selector de arriba para elegir una consulta y ver los detalles completos del historial clínico.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// FUNCIÓN PRINCIPAL PARA RENDERIZAR CONTENIDO COMPLETO
const renderContenidoHistorialCompleto = () => {
  if (!historialSeleccionado) return null;

  // Parsear TODOS los datos del historial seleccionado
  const datosPersonales = parsearDatosJSON(historialSeleccionado.datos_personales);
  const fichaIdentificacion = parsearDatosJSON(historialSeleccionado.ficha_identificacion);
  const motivoConsulta = parsearDatosJSON(historialSeleccionado.motivo_consulta);
  const antecedentesHF = parsearDatosJSON(historialSeleccionado.antecedentes_heredo_familiares);
  const antecedentesNP = parsearDatosJSON(historialSeleccionado.antecedentes_personales_no_patologicos);
  const antecedentesPP = parsearDatosJSON(historialSeleccionado.antecedentes_personales_patologicos);
  const examenExtrabucal = parsearDatosJSON(historialSeleccionado.examen_extrabucal);
  const examenIntrabucal = parsearDatosJSON(historialSeleccionado.examen_intrabucal);
  const oclusion = parsearDatosJSON(historialSeleccionado.oclusion);

  switch (vistaActiva) {
    case 'resumen':
      return renderVistaResumen();
    
    case 'identificacion':
      return renderVistaIdentificacion(fichaIdentificacion, datosPersonales);
    
    case 'motivo':
      return renderVistaMotivoConsulta(motivoConsulta);
    
    case 'antecedentes':
      return renderVistaAntecedentes(antecedentesHF, antecedentesNP, antecedentesPP);
    
    case 'examenes':
      return renderVistaExamenes(examenExtrabucal, examenIntrabucal);
    
    case 'oclusion':
      return renderVistaOclusion(oclusion);
    
    case 'completo':
      return renderVistaCompleta();
    
    default:
      return renderVistaResumen();
  }
};

// VISTA DE RESUMEN EJECUTIVO
const renderVistaResumen = () => {
  return (
    <div className="vista-resumen-ejecutivo">
      {/* MOTIVO PRINCIPAL */}
      <div className="seccion-resumen">
        <h3>🗣️ Motivo de Consulta</h3>
        <div className="motivo-principal">
          {historialSeleccionado.motivo_consulta_texto || 'No especificado'}
        </div>
      </div>

      {/* DIAGNÓSTICO Y TRATAMIENTO */}
      <div className="seccion-resumen diagnostico-resumen">
        <h3>🩺 Diagnóstico y Tratamiento</h3>
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

      {/* RESUMEN DE HALLAZGOS */}
      <div className="seccion-resumen">
        <h3>🔍 Hallazgos Principales</h3>
        <div className="hallazgos-grid">
          <div className="hallazgo-card">
            <h4>🦷 Examen Dental</h4>
            <p>Revisar sección de oclusión para detalles completos</p>
          </div>
          <div className="hallazgo-card">
            <h4>🔬 Estudios Pendientes</h4>
            <p>{estudiosLaboratorio.length} estudios registrados</p>
          </div>
          <div className="hallazgo-card">
            <h4>📸 Radiografías</h4>
            <p>{radiografias.length} estudios radiográficos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// VISTA DE IDENTIFICACIÓN
const renderVistaIdentificacion = (fichaIdentificacion, datosPersonales) => {
  return (
    <div className="vista-identificacion-completa">
      <h2>🆔 Ficha de Identificación</h2>
      
      {/* DATOS PERSONALES */}
      <div className="seccion-historial-completa">
        <h3 className="titulo-seccion-completa">
          <span className="icono-seccion">👤</span>
          Datos Personales
        </h3>
        <div className="contenido-seccion-completa">
          {renderCampo('Nombre completo', `${fichaIdentificacion.nombre || datosPersonales.nombre || ''} ${fichaIdentificacion.apellidoPaterno || datosPersonales.apellidoPaterno || ''} ${fichaIdentificacion.apellidoMaterno || datosPersonales.apellidoMaterno || ''}`)}
          {renderCampo('Sexo', fichaIdentificacion.sexo || datosPersonales.sexo)}
          {renderCampo('Fecha de nacimiento', formatearFecha(fichaIdentificacion.fechaNacimiento || datosPersonales.fechaNacimiento))}
          {renderCampo('RFC', fichaIdentificacion.rfc || datosPersonales.rfc)}
          {renderCampo('Teléfono', fichaIdentificacion.telefono || datosPersonales.telefono)}
          {renderCampo('Email', fichaIdentificacion.email || datosPersonales.email)}
        </div>
      </div>
    </div>
  );
};

// VISTA DE MOTIVO DE CONSULTA
const renderVistaMotivoConsulta = (motivoConsulta) => {
  return (
    <div className="vista-motivo-consulta-completa">
      <h2>🗣️ Motivo de Consulta</h2>
      
      <div className="seccion-historial-completa">
        <h3 className="titulo-seccion-completa">
          <span className="icono-seccion">📝</span>
          Descripción del Problema
        </h3>
        <div className="contenido-seccion-completa">
          {renderCampo('Motivo principal', motivoConsulta.motivo || historialSeleccionado.motivo_consulta_texto)}
          {renderCampo('Escala de dolor (0-10)', motivoConsulta.escalaDolor)}
          {renderCampo('Nivel de urgencia', motivoConsulta.nivelUrgencia)}
          {renderCampo('Duración de síntomas', motivoConsulta.duracionSintomas)}
          {renderCampo('Tratamiento previo', motivoConsulta.tratamientoPrevio)}
        </div>
      </div>
    </div>
  );
};

// VISTA DE ANTECEDENTES
const renderVistaAntecedentes = (antecedentesHF, antecedentesNP, antecedentesPP) => {
  return (
    <div className="vista-antecedentes-completa">
      <h2>👨‍👩‍👧‍👦 Antecedentes Médicos</h2>
      
      {/* ANTECEDENTES HEREDO-FAMILIARES */}
      {Object.keys(antecedentesHF).length > 0 && (
        <div className="seccion-historial-completa">
          <h3 className="titulo-seccion-completa">
            <span className="icono-seccion">👨‍👩‍👧‍👦</span>
            Antecedentes Heredo-Familiares
          </h3>
          <div className="contenido-seccion-completa">
            {antecedentesHF.antecedentes && Array.isArray(antecedentesHF.antecedentes) && 
              antecedentesHF.antecedentes.map((familiar, index) => (
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
              ))
            }
          </div>
        </div>
      )}

      {/* ANTECEDENTES PERSONALES NO PATOLÓGICOS */}
      {Object.keys(antecedentesNP).length > 0 && (
        <div className="seccion-historial-completa">
          <h3 className="titulo-seccion-completa">
            <span className="icono-seccion">🏃‍♂️</span>
            Antecedentes Personales No Patológicos
          </h3>
          <div className="contenido-seccion-completa">
            {/* Servicios Públicos */}
            {antecedentesNP.servicios_publicos && (
              <div className="subseccion">
                <h4>🏘️ Servicios Públicos</h4>
                {Object.entries(antecedentesNP.servicios_publicos).map(([servicio, tiene]) => 
                  typeof tiene === 'boolean' && renderCampo(servicio.replace('_', ' ').toUpperCase(), tiene ? 'Sí' : 'No')
                )}
              </div>
            )}

            {/* Hábitos */}
            {antecedentesNP.habitos_perniciosos && (
              <div className="subseccion">
                <h4>⚠️ Hábitos</h4>
                {/* Alcoholismo */}
                {antecedentesNP.habitos_perniciosos.alcoholismo && (
                  <div className="habito-detalle">
                    <strong>🍺 Alcoholismo:</strong> {antecedentesNP.habitos_perniciosos.alcoholismo.tiene ? 'Sí' : 'No'}
                    {antecedentesNP.habitos_perniciosos.alcoholismo.tiene && (
                      <div className="detalles-habito">
                        <p>Frecuencia: {antecedentesNP.habitos_perniciosos.alcoholismo.frecuencia}</p>
                        <p>Cantidad: {antecedentesNP.habitos_perniciosos.alcoholismo.cantidad}</p>
                        <p>Tipo: {antecedentesNP.habitos_perniciosos.alcoholismo.tipo}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tabaquismo */}
                {antecedentesNP.habitos_perniciosos.tabaquismo && (
                  <div className="habito-detalle">
                    <strong>🚬 Tabaquismo:</strong> {antecedentesNP.habitos_perniciosos.tabaquismo.tiene ? 'Sí' : 'No'}
                    {antecedentesNP.habitos_perniciosos.tabaquismo.tiene && (
                      <div className="detalles-habito">
                        <p>Frecuencia: {antecedentesNP.habitos_perniciosos.tabaquismo.frecuencia}</p>
                        <p>Tiempo fumando: {antecedentesNP.habitos_perniciosos.tabaquismo.cantidad}</p>
                        <p>Tipo: {antecedentesNP.habitos_perniciosos.tabaquismo.tipo}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANTECEDENTES PERSONALES PATOLÓGICOS */}
      {Object.keys(antecedentesPP).length > 0 && (
        <div className="seccion-historial-completa">
          <h3 className="titulo-seccion-completa">
            <span className="icono-seccion">🏥</span>
            Antecedentes Personales Patológicos
          </h3>
          <div className="contenido-seccion-completa">
            {/* Padecimientos */}
            {antecedentesPP.padecimientos && Array.isArray(antecedentesPP.padecimientos) && (
              <div className="subseccion">
                <h4>🏥 Padecimientos Anteriores</h4>
                {antecedentesPP.padecimientos.filter(p => p.padecimiento).map((padecimiento, index) => (
                  <div key={index} className="padecimiento-item">
                    <strong>{padecimiento.padecimiento}</strong>
                    {padecimiento.edad && <span> (Edad: {padecimiento.edad})</span>}
                    {padecimiento.control_medico && <div>Control médico: {padecimiento.control_medico}</div>}
                    {padecimiento.complicaciones && <div>Complicaciones: {padecimiento.complicaciones}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Somatometría */}
            {antecedentesPP.somatometria && (
              <div className="subseccion">
                <h4>📏 Somatometría</h4>
                {renderCampo('Peso', antecedentesPP.somatometria.peso ? `${antecedentesPP.somatometria.peso} kg` : '')}
                {renderCampo('Talla', antecedentesPP.somatometria.talla ? `${antecedentesPP.somatometria.talla} cm` : '')}
                {renderCampo('IMC', antecedentesPP.somatometria.imc)}
              </div>
            )}

            {/* Signos Vitales */}
            {antecedentesPP.signos_vitales && (
              <div className="subseccion">
                <h4>💓 Signos Vitales</h4>
                {renderCampo('Temperatura', antecedentesPP.signos_vitales.temperatura ? `${antecedentesPP.signos_vitales.temperatura}°C` : '')}
                {renderCampo('Tensión Arterial', 
                  antecedentesPP.signos_vitales.tension_arterial_sistolica && antecedentesPP.signos_vitales.tension_arterial_diastolica ?
                  `${antecedentesPP.signos_vitales.tension_arterial_sistolica}/${antecedentesPP.signos_vitales.tension_arterial_diastolica} mmHg` : ''
                )}
                {renderCampo('Frecuencia Cardíaca', antecedentesPP.signos_vitales.frecuencia_cardiaca ? `${antecedentesPP.signos_vitales.frecuencia_cardiaca} lpm` : '')}
                {renderCampo('Frecuencia Respiratoria', antecedentesPP.signos_vitales.frecuencia_respiratoria ? `${antecedentesPP.signos_vitales.frecuencia_respiratoria} rpm` : '')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// VISTA DE EXÁMENES
const renderVistaExamenes = (examenExtrabucal, examenIntrabucal) => {
  return (
    <div className="vista-examenes-completa">
      <h2>🔍 Exámenes Clínicos</h2>
      
      {/* EXAMEN EXTRABUCAL */}
      {Object.keys(examenExtrabucal).length > 0 && (
        <div className="seccion-historial-completa">
          <h3 className="titulo-seccion-completa">
            <span className="icono-seccion">👤</span>
            Examen Extrabucal
          </h3>
          <div className="contenido-seccion-completa">
            {/* Cabeza */}
            {examenExtrabucal.cabeza && (
              <div className="subseccion">
                <h4>🧠 Cabeza</h4>
                {renderCampo('Cráneo', examenExtrabucal.cabeza.craneo)}
                {renderCampo('Biotipo Facial', examenExtrabucal.cabeza.biotipo_facial)}
                {renderCampo('Perfil', examenExtrabucal.cabeza.perfil)}
              </div>
            )}

            {/* ATM */}
            {examenExtrabucal.atm && (
              <div className="subseccion">
                <h4>🦴 Articulación Temporomandibular</h4>
                {renderCampo('Alteraciones', examenExtrabucal.atm.alteracion)}
                {renderCampo('Apertura Máxima', examenExtrabucal.atm.apertura_maxima ? `${examenExtrabucal.atm.apertura_maxima} mm` : '')}
                {renderCampo('Lateralidad Derecha', examenExtrabucal.atm.lateralidad_derecha ? `${examenExtrabucal.atm.lateralidad_derecha} mm` : '')}
                {renderCampo('Lateralidad Izquierda', examenExtrabucal.atm.lateralidad_izquierda ? `${examenExtrabucal.atm.lateralidad_izquierda} mm` : '')}
                {renderCampo('Masticación Bilateral', examenExtrabucal.atm.masticacion_bilateral !== undefined ? 
                  (examenExtrabucal.atm.masticacion_bilateral ? 'Sí' : 'No') : '')}
                {renderCampo('Descripción', examenExtrabucal.atm.descripcion_masticacion)}
              </div>
            )}

            {/* Músculos del Cuello */}
            {examenExtrabucal.musculos_cuello && (
              <div className="subseccion">
                <h4>💪 Músculos del Cuello</h4>
                {Object.entries(examenExtrabucal.musculos_cuello).map(([musculo, descripcion]) => 
                  renderCampo(musculo.replace('_', ' ').toUpperCase(), descripcion)
                ).filter(Boolean)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXAMEN INTRABUCAL */}
      {Object.keys(examenIntrabucal).length > 0 && (
        <div className="seccion-historial-completa">
          <h3 className="titulo-seccion-completa">
            <span className="icono-seccion">🦷</span>
            Examen Intrabucal
          </h3>
          <div className="contenido-seccion-completa">
            {/* Estructuras Intrabucales */}
            {examenIntrabucal.estructuras && (
              <div className="subseccion">
                <h4>🔍 Estructuras Intrabucales</h4>
                {Object.entries(examenIntrabucal.estructuras).map(([estructura, descripcion]) => 
                  renderCampo(estructura.replace('_', ' ').toUpperCase(), descripcion)
                ).filter(Boolean)}
              </div>
            )}

            {/* Higiene Bucal */}
            {examenIntrabucal.higiene_bucal && (
              <div className="subseccion">
                <h4>🪥 Higiene Bucal</h4>
                {renderCampo('Estado General', examenIntrabucal.higiene_bucal.general)}
                {renderCampo('Índice de Placa', examenIntrabucal.higiene_bucal.indice_placa)}
                {renderCampo('Cálculo', examenIntrabucal.higiene_bucal.calculo)}
                {renderCampo('Halitosis', examenIntrabucal.higiene_bucal.halitosis)}
              </div>
            )}

            {/* Encías */}
            {examenIntrabucal.encias && (
              <div className="subseccion">
                <h4>🟣 Encías</h4>
                {renderCampo('Color', examenIntrabucal.encias.color)}
                {renderCampo('Textura', examenIntrabucal.encias.textura)}
                {renderCampo('Forma', examenIntrabucal.encias.forma)}
                {renderCampo('Consistencia', examenIntrabucal.encias.consistencia)}
                {renderCampo('Sangrado', examenIntrabucal.encias.sangrado)}
                
                {/* Alteraciones gingivales */}
                {examenIntrabucal.encias.alteraciones && Array.isArray(examenIntrabucal.encias.alteraciones) &&
                  examenIntrabucal.encias.alteraciones.map((alteracion, index) => (
                    <div key={index} className="alteracion-gingival">
                      <strong>Alteración {index + 1}:</strong>
                      <div>Localización: {alteracion.localizacion}</div>
                      <div>Descripción: {alteracion.descripcion}</div>
                      {alteracion.tamaño && <div>Tamaño: {alteracion.tamaño}</div>}
                      {alteracion.color && <div>Color: {alteracion.color}</div>}
                      {alteracion.consistencia && <div>Consistencia: {alteracion.consistencia}</div>}
                    </div>
                  ))
                }
              </div>
            )}

            {/* Hallazgos adicionales */}
            {examenIntrabucal.hallazgos_adicionales && (
              <div className="subseccion">
                <h4>📋 Hallazgos Adicionales</h4>
                {renderCampo('Observaciones', examenIntrabucal.hallazgos_adicionales)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// VISTA DE OCLUSIÓN COMPLETA
const renderVistaOclusion = (oclusion) => {
  return (
    <div className="vista-oclusion-completa">
      <h2>🦷 Análisis de Oclusión</h2>
      
      {Object.keys(oclusion).length > 0 && (
        <>
          {/* ODONTOGRAMA */}
          {oclusion.odontograma && (
            <div className="seccion-historial-completa">
              <h3 className="titulo-seccion-completa">
                <span className="icono-seccion">🦷</span>
                Odontograma
              </h3>
              <div className="contenido-seccion-completa">
                {renderCampo('Observaciones Generales', oclusion.odontograma.observaciones_generales)}
                
                {/* Estado de Dientes */}
                {oclusion.odontograma.dientes_presentes && Object.entries(oclusion.odontograma.dientes_presentes).length > 0 && (
                  <div className="dientes-estado-container">
                    <h4>Estado de Dientes:</h4>
                    <div className="dientes-estado-grid">
                      {Object.entries(oclusion.odontograma.dientes_presentes).map(([diente, estado]) => (
                        <span key={diente} className={`diente-estado ${estado}`}>
                          Diente {diente}: {estado === 'presente' ? '✅ Presente' : '❌ Ausente'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ARMONÍA DE MAXILARES */}
          {oclusion.armonia_maxilares && (
            <div className="seccion-historial-completa">
              <h3 className="titulo-seccion-completa">
                <span className="icono-seccion">🏛️</span>
                Armonía de Maxilares
              </h3>
              <div className="contenido-seccion-completa">
                {renderCampo('Amplitud Arco Superior', oclusion.armonia_maxilares.amplitud_arco_superior)}
                {renderCampo('Bóveda Palatina', oclusion.armonia_maxilares.boveda_palatina)}
                {renderCampo('Amplitud Arco Inferior', oclusion.armonia_maxilares.amplitud_arco_inferior)}
                {renderCampo('Descripción de Armonía', oclusion.armonia_maxilares.descripcion_armonia)}
              </div>
            </div>
          )}

          {/* SIMETRÍA DEL ARCO */}
          {oclusion.simetria_arco && (
            <div className="seccion-historial-completa">
              <h3 className="titulo-seccion-completa">
                <span className="icono-seccion">📐</span>
                Simetría del Arco
              </h3>
              <div className="contenido-seccion-completa">
                <div className="mediciones-simetria">
                  <h4>Relación Antero-Posterior:</h4>
                  {renderCampo('Derecho', oclusion.simetria_arco.relacion_antero_posterior_derecho ? `${oclusion.simetria_arco.relacion_antero_posterior_derecho} mm` : '')}
                  {renderCampo('Izquierdo', oclusion.simetria_arco.relacion_antero_posterior_izquierdo ? `${oclusion.simetria_arco.relacion_antero_posterior_izquierdo} mm` : '')}
                  
                  <h4>Relación Buco-Lingual:</h4>
                  {renderCampo('Derecho', oclusion.simetria_arco.relacion_buco_lingual_derecho ? `${oclusion.simetria_arco.relacion_buco_lingual_derecho} mm` : '')}
                  {renderCampo('Izquierdo', oclusion.simetria_arco.relacion_buco_lingual_izquierdo ? `${oclusion.simetria_arco.relacion_buco_lingual_izquierdo} mm` : '')}
                </div>
              </div>
            </div>
          )}

          {/* CLASIFICACIÓN DE ANGLE */}
          {oclusion.clasificacion_angle && (
            <div className="seccion-historial-completa">
              <h3 className="titulo-seccion-completa">
                <span className="icono-seccion">📊</span>
                Clasificación de Angle
              </h3>
              <div className="contenido-seccion-completa">
                <div className="clasificacion-angle-grid">
                  <div className="relacion-molar">
                    <h4>Relación Molar:</h4>
                    {renderCampo('Derecho', oclusion.clasificacion_angle.relacion_molar_derecho)}
                    {renderCampo('Izquierdo', oclusion.clasificacion_angle.relacion_molar_izquierdo)}
                  </div>
                  
                  <div className="relacion-canina">
                    <h4>Relación Canina:</h4>
                    {renderCampo('Derecho', oclusion.clasificacion_angle.relacion_canina_derecho)}
                    {renderCampo('Izquierdo', oclusion.clasificacion_angle.relacion_canina_izquierdo)}
                  </div>
                </div>

                <div className="relacion-dental">
                  <h4>Relación Dental:</h4>
                  {renderCampo('Sobremordida Vertical (Over Bite)', oclusion.clasificacion_angle.sobremordida_vertical)}
                  {renderCampo('Sobremordida Horizontal (Over Jet)', oclusion.clasificacion_angle.sobremordida_horizontal)}
                  {renderCampo('Borde a Borde', oclusion.clasificacion_angle.borde_a_borde)}
                  {renderCampo('Mordida Abierta', oclusion.clasificacion_angle.mordida_abierta)}
                  {renderCampo('Mordida Cruzada Anterior', oclusion.clasificacion_angle.mordida_cruzada_anterior)}
                  {renderCampo('Mordida Cruzada Posterior', oclusion.clasificacion_angle.mordida_cruzada_posterior)}
                  {renderCampo('Línea Media Maxilar', oclusion.clasificacion_angle.linea_media_maxilar)}
                  {renderCampo('Línea Media Mandibular', oclusion.clasificacion_angle.linea_media_mandibular)}
                  {renderCampo('Diastemas', oclusion.clasificacion_angle.diastemas)}
                  {renderCampo('Apiñamiento', oclusion.clasificacion_angle.apiñamiento)}
                  {renderCampo('Facetas de Desgaste', oclusion.clasificacion_angle.facetas_desgaste)}
                </div>

                {/* Alteraciones Dentales */}
                {oclusion.clasificacion_angle.alteraciones_dentales && Array.isArray(oclusion.clasificacion_angle.alteraciones_dentales) && (
                  <div className="alteraciones-dentales">
                    <h4>Alteraciones Dentales:</h4>
                    {oclusion.clasificacion_angle.alteraciones_dentales.map((alteracion, index) => (
                      <div key={index} className="alteracion-dental-item">
                        <strong>Diente {alteracion.diente}:</strong> {alteracion.descripcion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EXAMEN DE HIGIENE ORAL (O'LEARY) */}
          {oclusion.examen_higiene_oral && (
            <div className="seccion-historial-completa">
              <h3 className="titulo-seccion-completa">
                <span className="icono-seccion">🦷</span>
                Examen de Higiene Oral (O'Leary)
              </h3>
              <div className="contenido-seccion-completa">
                {renderCampo('Número Total de Dientes', oclusion.examen_higiene_oral.numero_total_dientes)}
                {renderCampo('Total Superficies Revisadas', oclusion.examen_higiene_oral.total_superficies_revisadas)}
                {renderCampo('IPDB (%)', oclusion.examen_higiene_oral.ipdb_porcentaje)}
                {renderCampo('Observaciones', oclusion.examen_higiene_oral.observaciones_oleary)}
              </div>
            </div>
          )}

          {/* ENCÍAS DETALLADAS */}
          {oclusion.encias_detallado && (
            <div className="seccion-historial-completa">
              <h3 className="titulo-seccion-completa">
                <span className="icono-seccion">🟣</span>
                Análisis Detallado de Encías
              </h3>
              <div className="contenido-seccion-completa">
                {renderCampo('Localizaciones Afectadas', oclusion.encias_detallado.localizaciones_afectadas)}
                
                {/* Alteraciones gingivales detalladas */}
                {oclusion.encias_detallado.alteraciones_gingivales && Array.isArray(oclusion.encias_detallado.alteraciones_gingivales) && (
                  <div className="alteraciones-gingivales-detalladas">
                    <h4>Alteraciones Gingivales:</h4>
                    {oclusion.encias_detallado.alteraciones_gingivales.map((alteracion, index) => (
                      <div key={index} className="alteracion-gingival-detallada">
                        <strong>Alteración {index + 1}:</strong>
                        <div>Localización: {alteracion.localizacion}</div>
                        <div>Descripción: {alteracion.descripcion}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EXAMEN DENTAL */}
          {oclusion.examen_dental && (
            <div className="seccion-historial-completa">
              <h3 className="titulo-seccion-completa">
                <span className="icono-seccion">🔍</span>
                Examen Dental Detallado
              </h3>
              <div className="contenido-seccion-completa">
                {renderCampo('Hallazgos Dentales', oclusion.examen_dental.hallazgos_dentales)}
                {renderCampo('Procedimientos Realizados', oclusion.examen_dental.procedimientos_realizados)}
                
                {/* Estados de dientes evaluados */}
                {oclusion.examen_dental.estados_dientes && Object.keys(oclusion.examen_dental.estados_dientes).length > 0 && (
                  <div className="estados-dientes-evaluados">
                    <h4>Estados de Dientes Evaluados:</h4>
                    <div className="dientes-evaluados-grid">
                      {Object.entries(oclusion.examen_dental.estados_dientes).map(([diente, estados]) => (
                        <div key={diente} className="diente-evaluado">
                          <strong>Diente {diente}:</strong>
                          <div className="estados-superficie">
                            {Object.entries(estados).map(([superficie, presente]) => 
                              presente && (
                                <span key={superficie} className={`superficie-estado ${superficie.includes('caries') ? 'caries' : 'obturacion'}`}>
                                  {superficie.replace('_', ' ').toUpperCase()}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PERIODONTOGRAMA */}
          {oclusion.periodontograma && (
            <div className="seccion-historial-completa">
              <h3 className="titulo-seccion-completa">
                <span className="icono-seccion">📊</span>
                Periodontograma
              </h3>
              <div className="contenido-seccion-completa">
                {renderCampo('Observaciones del Periodonto', oclusion.periodontograma.observaciones_periodonto)}
                
                {/* Estados del periodonto */}
                {oclusion.periodontograma.estados_periodonto && Object.keys(oclusion.periodontograma.estados_periodonto).length > 0 && (
                  <div className="estados-periodonto">
                    <h4>Estados del Periodonto:</h4>
                    <div className="periodonto-grid">
                      {Object.entries(oclusion.periodontograma.estados_periodonto).map(([diente, lesiones]) => (
                        <div key={diente} className="diente-periodonto">
                          <strong>Diente {diente}:</strong>
                          <div className="lesiones-periodonto">
                            {Object.entries(lesiones).map(([lesion, presente]) => 
                              presente && (
                                <span key={lesion} className={`lesion-${lesion}`}>
                                  {lesion === 'gingival' ? '🔴 Gingival' : '🔵 Periodontal'}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODELOS DE ESTUDIO */}
          {oclusion.modelos_estudio && (
            <div className="seccion-historial-completa">
              <h3 className="titulo-seccion-completa">
                <span className="icono-seccion">🏗️</span>
                Modelos de Estudio
              </h3>
              <div className="contenido-seccion-completa">
                {renderCampo('Hallazgos de Modelos', oclusion.modelos_estudio.hallazgos)}
              </div>
            </div>
          )}
        </>
      )}

      {Object.keys(oclusion).length === 0 && (
        <div className="sin-datos-oclusion">
          <h3>ℹ️ Sin Datos de Oclusión</h3>
          <p>No se encontraron datos de análisis de oclusión para este historial.</p>
        </div>
      )}
    </div>
  );
};

// VISTA COMPLETA - TODAS LAS SECCIONES
const renderVistaCompleta = () => {
  return (
    <div className="vista-completa-historial">
      {/* TODAS LAS VISTAS EN UNA SOLA PÁGINA */}
      <div className="contenido-completo-secuencial">
        {renderVistaIdentificacion(
          parsearDatosJSON(historialSeleccionado.ficha_identificacion),
          parsearDatosJSON(historialSeleccionado.datos_personales)
        )}
        
        {renderVistaMotivoConsulta(
          parsearDatosJSON(historialSeleccionado.motivo_consulta)
        )}
        
        {renderVistaAntecedentes(
          parsearDatosJSON(historialSeleccionado.antecedentes_heredo_familiares),
          parsearDatosJSON(historialSeleccionado.antecedentes_personales_no_patologicos),
          parsearDatosJSON(historialSeleccionado.antecedentes_personales_patologicos)
        )}
        
        {renderVistaExamenes(
          parsearDatosJSON(historialSeleccionado.examen_extrabucal),
          parsearDatosJSON(historialSeleccionado.examen_intrabucal)
        )}
        
        {renderVistaOclusion(
          parsearDatosJSON(historialSeleccionado.oclusion)
        )}

        {/* DIAGNÓSTICO Y TRATAMIENTO FINAL */}
        <div className="seccion-historial-completa diagnostico-final">
          <h3 className="titulo-seccion-completa">
            <span className="icono-seccion">🩺</span>
            Diagnóstico y Tratamiento Final
          </h3>
          <div className="contenido-seccion-completa">
            <div className="diagnostico-tratamiento-readonly">
              <div className="campo-readonly">
                <strong>Diagnóstico:</strong>
                <div className="valor-readonly">
                  {historialSeleccionado.diagnostico || 'No especificado'}
                </div>
              </div>
              
              <div className="campo-readonly">
                <strong>Tratamiento:</strong>
                <div className="valor-readonly">
                  {historialSeleccionado.tratamiento || 'No especificado'}
                </div>
              </div>

              {/* Plan de tratamiento si existe */}
              {historialSeleccionado.plan_tratamiento && (
                <div className="campo-readonly">
                  <strong>Plan de Tratamiento:</strong>
                  <div className="valor-readonly">
                    {(() => {
                      const planData = parsearDatosJSON(historialSeleccionado.plan_tratamiento);
                      if (typeof planData === 'object' && planData !== null) {
                        return (
                          <div className="plan-estructurado-readonly">
                            {planData.inmediato && <p><strong>Inmediato:</strong> {planData.inmediato}</p>}
                            {planData.seguimiento && <p><strong>Seguimiento:</strong> {planData.seguimiento}</p>}
                            {planData.proxima_cita && <p><strong>Próxima Cita:</strong> {planData.proxima_cita}</p>}
                            {planData.recomendaciones && (
                              <div>
                                <strong>Recomendaciones:</strong>
                                {Array.isArray(planData.recomendaciones) ? (
                                  <ul>
                                    {planData.recomendaciones.map((rec, index) => (
                                      <li key={index}>{rec}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>{planData.recomendaciones}</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return <p>{historialSeleccionado.plan_tratamiento}</p>;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* METADATOS DEL HISTORIAL (SOLO AL FINAL) */}
        <div className="seccion-historial-completa metadatos">
          <h3 className="titulo-seccion-completa">
            <span className="icono-seccion">📊</span>
            Información del Registro
          </h3>
          <div className="contenido-seccion-completa">
            <div className="metadatos-grid">
              <div className="metadato-item">
                <strong>Fecha de Consulta:</strong>
                <span>{formatearFecha(historialSeleccionado.fecha_consulta)}</span>
              </div>
              <div className="metadato-item">
                <strong>Doctor Responsable:</strong>
                <span>Dr. {historialSeleccionado.doctor_nombre}</span>
              </div>
              <div className="metadato-item">
                <strong>ID Historial:</strong>
                <span>#{historialSeleccionado.id}</span>
              </div>
              <div className="metadato-item">
                <strong>Estado:</strong>
                <span className={`estado-badge ${historialSeleccionado.estado}`}>
                  {historialSeleccionado.estado?.toUpperCase()}
                </span>
              </div>
              <div className="metadato-item">
                <strong>Fecha de Creación:</strong>
                <span>{formatearFecha(historialSeleccionado.created_at)}</span>
              </div>
              <div className="metadato-item">
                <strong>Última Actualización:</strong>
                <span>{formatearFecha(historialSeleccionado.updated_at)}</span>
              </div>
              <div className="metadato-item">
                <strong>Versión:</strong>
                <span>{historialSeleccionado.version || '1.0'}</span>
              </div>
              {historialSeleccionado.pdf_filename && (
                <div className="metadato-item">
                  <strong>PDF Disponible:</strong>
                  <span>✅ {historialSeleccionado.pdf_filename}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// FUNCIÓN CORREGIDA PARA GENERAR PDF COMPLETO DEL HISTORIAL
const generarPDFHistorial = useCallback(async () => {
  try {
    console.log('📄 Generando PDF completo del historial clínico...');
    console.log('🔍 Datos del historial seleccionado:', historialSeleccionado);
    
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
    const colorPrimario = [41, 128, 185];
    const colorSecundario = [52, 73, 94];
    const colorTexto = [44, 62, 80];
    const colorLinea = [189, 195, 199];

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
      // Función de limpieza mejorada
      const limpiarValor = (val) => {
        if (!val || val === 'undefined' || val === 'null' || val === 'No especificado') return null;
        const textoLimpio = String(val).trim();
        return textoLimpio.length > 0 ? textoLimpio : null;
      };

      const valorLimpio = limpiarValor(valor);
      if (!valorLimpio) return;
      
      verificarNuevaPagina(15);
      
      // Etiqueta
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
      doc.text(`${etiqueta}:`, margin, yPosition);
      
      // Valor
      doc.setFont(negrita ? 'bold' : 'normal');
      doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
      
      const lineasValor = doc.splitTextToSize(valorLimpio, pageWidth - 50);
      
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

    // Parsear TODOS los datos del historial seleccionado
    console.log('🔍 Parseando datos del historial...');
    const datosPersonales = parsearDatosJSON(historialSeleccionado.datos_personales) || {};
    const fichaIdentificacionData = parsearDatosJSON(historialSeleccionado.ficha_identificacion) || {};
    const motivoConsultaData = parsearDatosJSON(historialSeleccionado.motivo_consulta) || {};
    const antecedentesHFData = parsearDatosJSON(historialSeleccionado.antecedentes_heredo_familiares) || {};
    const antecedentesNPData = parsearDatosJSON(historialSeleccionado.antecedentes_personales_no_patologicos) || {};
    const antecedentesPPData = parsearDatosJSON(historialSeleccionado.antecedentes_personales_patologicos) || {};
    const examenExtrabucalData = parsearDatosJSON(historialSeleccionado.examen_extrabucal) || {};
    const examenIntrabucalData = parsearDatosJSON(historialSeleccionado.examen_intrabucal) || {};
    const oclusionData = parsearDatosJSON(historialSeleccionado.oclusion) || {};

    console.log('📊 Datos parseados:', {
      datosPersonales,
      fichaIdentificacionData,
      motivoConsultaData,
      antecedentesHFData,
      antecedentesNPData,
      antecedentesPPData,
      examenExtrabucalData,
      examenIntrabucalData,
      oclusionData
    });

    // Encabezado profesional
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

    // 1. INFORMACIÓN PERSONAL DEL PACIENTE
    agregarTituloSeccion('INFORMACION PERSONAL DEL PACIENTE', '1');
    
    // Datos del paciente principal
    agregarCampo('Nombre completo', nombreCompleto);
    agregarCampo('Sexo', paciente?.sexo === 'M' ? 'Masculino' : paciente?.sexo === 'F' ? 'Femenino' : 'No especificado');
    agregarCampo('Fecha de nacimiento', formatearFecha(paciente?.fecha_nacimiento));
    agregarCampo('Edad', `${calcularEdad(paciente?.fecha_nacimiento)} años`);
    agregarCampo('Telefono', paciente?.telefono);
    agregarCampo('Correo electronico', paciente?.correo_electronico);
    agregarCampo('Direccion', paciente?.calle_numero || paciente?.direccion);
    agregarCampo('Numero de seguridad social', paciente?.numero_seguridad_social);
    
    // Datos adicionales de la ficha de identificación
    if (Object.keys(fichaIdentificacionData).length > 0) {
      agregarCampo('RFC', fichaIdentificacionData.rfc);
      agregarCampo('Estado civil', fichaIdentificacionData.estado_civil);
      agregarCampo('Ocupacion', fichaIdentificacionData.ocupacion);
      agregarCampo('Escolaridad', fichaIdentificacionData.escolaridad);
      agregarCampo('Lugar de trabajo', fichaIdentificacionData.lugar_trabajo);
      
      if (fichaIdentificacionData.contacto_emergencia) {
        agregarSubseccion('Contacto de Emergencia');
        agregarCampo('Nombre del contacto', fichaIdentificacionData.contacto_emergencia.nombre);
        agregarCampo('Parentesco', fichaIdentificacionData.contacto_emergencia.parentesco);
        agregarCampo('Telefono del contacto', fichaIdentificacionData.contacto_emergencia.telefono);
      }
    }
    yPosition += 10;

    // 2. MOTIVO DE CONSULTA
    agregarTituloSeccion('MOTIVO DE CONSULTA', '2');
    
    // Motivo principal del historial
    agregarCampo('Motivo principal', historialSeleccionado.motivo_consulta_texto);
    
    // Datos detallados del motivo de consulta
    if (Object.keys(motivoConsultaData).length > 0) {
      agregarCampo('Padecimiento actual', motivoConsultaData.padecimiento_actual);
      agregarCampo('Inicio de sintomas', motivoConsultaData.inicio_sintomas);
      agregarCampo('Tipo de dolor', motivoConsultaData.tipo_dolor);
      agregarCampo('Intensidad del dolor', motivoConsultaData.intensidad_dolor ? `${motivoConsultaData.intensidad_dolor}/10` : '');
      agregarCampo('Urgencia', motivoConsultaData.urgencia);
      agregarCampo('Evolucion', motivoConsultaData.evolucion);
      agregarCampo('Tratamientos previos', motivoConsultaData.tratamientos_previos);
      
      if (motivoConsultaData.factores_desencadenantes && Array.isArray(motivoConsultaData.factores_desencadenantes)) {
        agregarCampo('Factores desencadenantes', motivoConsultaData.factores_desencadenantes.join(', '));
      }
      
      if (motivoConsultaData.sintomas_asociados && Array.isArray(motivoConsultaData.sintomas_asociados)) {
        agregarCampo('Sintomas asociados', motivoConsultaData.sintomas_asociados.join(', '));
      }
    }
    yPosition += 10;

    // 3. ANTECEDENTES HEREDO-FAMILIARES
    if (Object.keys(antecedentesHFData).length > 0) {
      agregarTituloSeccion('ANTECEDENTES HEREDO-FAMILIARES', '3');
      
      if (antecedentesHFData.padre) {
        agregarSubseccion('Antecedentes Paternos');
        if (typeof antecedentesHFData.padre === 'object') {
          agregarCampo('Estado del padre', antecedentesHFData.padre.vivo ? 'Vivo' : 'Fallecido');
          agregarCampo('Edad del padre', antecedentesHFData.padre.edad);
          agregarCampo('Enfermedades del padre', Array.isArray(antecedentesHFData.padre.enfermedades) ? 
                      antecedentesHFData.padre.enfermedades.join(', ') : antecedentesHFData.padre.enfermedades);
        } else {
          agregarCampo('Antecedentes paternos', Array.isArray(antecedentesHFData.padre) ? 
                      antecedentesHFData.padre.join(', ') : antecedentesHFData.padre);
        }
      }
      
      if (antecedentesHFData.madre) {
        agregarSubseccion('Antecedentes Maternos');
        if (typeof antecedentesHFData.madre === 'object') {
          agregarCampo('Estado de la madre', antecedentesHFData.madre.vivo ? 'Vivo' : 'Fallecido');
          agregarCampo('Edad de la madre', antecedentesHFData.madre.edad);
          agregarCampo('Enfermedades de la madre', Array.isArray(antecedentesHFData.madre.enfermedades) ? 
                      antecedentesHFData.madre.enfermedades.join(', ') : antecedentesHFData.madre.enfermedades);
        } else {
          agregarCampo('Antecedentes maternos', Array.isArray(antecedentesHFData.madre) ? 
                      antecedentesHFData.madre.join(', ') : antecedentesHFData.madre);
        }
      }

      if (antecedentesHFData.antecedentes && Array.isArray(antecedentesHFData.antecedentes)) {
        agregarSubseccion('Otros Antecedentes Familiares');
        antecedentesHFData.antecedentes.forEach((familiar, index) => {
          if (familiar.parentesco && familiar.padecimientos) {
            agregarCampo(`${familiar.parentesco}`, 
              `${familiar.padecimientos}${familiar.edad ? ` (Edad: ${familiar.edad})` : ''}${familiar.vivo !== undefined ? (familiar.vivo ? ' - Vivo' : ' - Finado') : ''}`);
          }
        });
      }
      yPosition += 10;
    }

    // 4. ANTECEDENTES PERSONALES NO PATOLÓGICOS
    if (Object.keys(antecedentesNPData).length > 0) {
      agregarTituloSeccion('ANTECEDENTES PERSONALES NO PATOLOGICOS', '4');
      
      // Servicios públicos
      if (antecedentesNPData.servicios_publicos) {
        agregarSubseccion('Servicios Publicos');
        Object.entries(antecedentesNPData.servicios_publicos).forEach(([servicio, tiene]) => {
          if (typeof tiene === 'boolean') {
            agregarCampo(servicio.replace('_', ' ').toUpperCase(), tiene ? 'Sí' : 'No');
          }
        });
      }

      // Hábitos
      if (antecedentesNPData.habitos_perniciosos) {
        agregarSubseccion('Habitos');
        
        if (antecedentesNPData.habitos_perniciosos.tabaquismo) {
          const tabaquismo = antecedentesNPData.habitos_perniciosos.tabaquismo;
          agregarCampo('Tabaquismo', tabaquismo.tiene ? 'Sí' : 'No');
          if (tabaquismo.tiene) {
            agregarCampo('Frecuencia de tabaquismo', tabaquismo.frecuencia);
            agregarCampo('Cantidad de cigarrillos', tabaquismo.cantidad);
            agregarCampo('Tipo de tabaco', tabaquismo.tipo);
          }
        }
        
        if (antecedentesNPData.habitos_perniciosos.alcoholismo) {
          const alcoholismo = antecedentesNPData.habitos_perniciosos.alcoholismo;
          agregarCampo('Alcoholismo', alcoholismo.tiene ? 'Sí' : 'No');
          if (alcoholismo.tiene) {
            agregarCampo('Frecuencia de consumo', alcoholismo.frecuencia);
            agregarCampo('Cantidad de alcohol', alcoholismo.cantidad);
            agregarCampo('Tipo de bebida', alcoholismo.tipo);
          }
        }
      }
      yPosition += 10;
    }

    // 5. ANTECEDENTES PERSONALES PATOLÓGICOS
    if (Object.keys(antecedentesPPData).length > 0) {
      agregarTituloSeccion('ANTECEDENTES PERSONALES PATOLOGICOS', '5');
      
      // Padecimientos
      if (antecedentesPPData.padecimientos && Array.isArray(antecedentesPPData.padecimientos)) {
        agregarSubseccion('Padecimientos Anteriores');
        antecedentesPPData.padecimientos.filter(p => p.padecimiento).forEach((padecimiento, index) => {
          agregarCampo(`Padecimiento ${index + 1}`, 
            `${padecimiento.padecimiento}${padecimiento.edad ? ` (Edad: ${padecimiento.edad})` : ''}${padecimiento.control_medico ? ` - Control: ${padecimiento.control_medico}` : ''}${padecimiento.complicaciones ? ` - Complicaciones: ${padecimiento.complicaciones}` : ''}`);
        });
      }

      // Somatometría
      if (antecedentesPPData.somatometria) {
        agregarSubseccion('Somatometria');
        agregarCampo('Peso', antecedentesPPData.somatometria.peso ? `${antecedentesPPData.somatometria.peso} kg` : '');
        agregarCampo('Talla', antecedentesPPData.somatometria.talla ? `${antecedentesPPData.somatometria.talla} cm` : '');
        agregarCampo('IMC', antecedentesPPData.somatometria.imc);
      }

      // Signos vitales
      if (antecedentesPPData.signos_vitales) {
        agregarSubseccion('Signos Vitales');
        agregarCampo('Temperatura', antecedentesPPData.signos_vitales.temperatura ? `${antecedentesPPData.signos_vitales.temperatura}°C` : '');
        agregarCampo('Tension Arterial', 
          antecedentesPPData.signos_vitales.tension_arterial_sistolica && antecedentesPPData.signos_vitales.tension_arterial_diastolica ?
          `${antecedentesPPData.signos_vitales.tension_arterial_sistolica}/${antecedentesPPData.signos_vitales.tension_arterial_diastolica} mmHg` : '');
        agregarCampo('Frecuencia Cardiaca', antecedentesPPData.signos_vitales.frecuencia_cardiaca ? `${antecedentesPPData.signos_vitales.frecuencia_cardiaca} lpm` : '');
        agregarCampo('Frecuencia Respiratoria', antecedentesPPData.signos_vitales.frecuencia_respiratoria ? `${antecedentesPPData.signos_vitales.frecuencia_respiratoria} rpm` : '');
      }
      yPosition += 10;
    }

    // 6. EXAMEN EXTRABUCAL
    if (Object.keys(examenExtrabucalData).length > 0) {
      agregarTituloSeccion('EXAMEN EXTRABUCAL', '6');
      
      if (examenExtrabucalData.cabeza) {
        agregarSubseccion('Cabeza');
        agregarCampo('Craneo', examenExtrabucalData.cabeza.craneo);
        agregarCampo('Biotipo Facial', examenExtrabucalData.cabeza.biotipo_facial);
        agregarCampo('Perfil', examenExtrabucalData.cabeza.perfil);
      }

      if (examenExtrabucalData.atm) {
        agregarSubseccion('Articulacion Temporomandibular');
        agregarCampo('Alteraciones', examenExtrabucalData.atm.alteracion);
        agregarCampo('Apertura Maxima', examenExtrabucalData.atm.apertura_maxima ? `${examenExtrabucalData.atm.apertura_maxima} mm` : '');
        agregarCampo('Lateralidad Derecha', examenExtrabucalData.atm.lateralidad_derecha ? `${examenExtrabucalData.atm.lateralidad_derecha} mm` : '');
        agregarCampo('Lateralidad Izquierda', examenExtrabucalData.atm.lateralidad_izquierda ? `${examenExtrabucalData.atm.lateralidad_izquierda} mm` : '');
        agregarCampo('Masticacion Bilateral', examenExtrabucalData.atm.masticacion_bilateral !== undefined ? 
          (examenExtrabucalData.atm.masticacion_bilateral ? 'Sí' : 'No') : '');
        agregarCampo('Descripcion de masticacion', examenExtrabucalData.atm.descripcion_masticacion);
      }

      if (examenExtrabucalData.musculos_cuello) {
        agregarSubseccion('Musculos del Cuello');
        Object.entries(examenExtrabucalData.musculos_cuello).forEach(([musculo, descripcion]) => {
          agregarCampo(musculo.replace('_', ' ').toUpperCase(), descripcion);
        });
      }
      yPosition += 10;
    }

    // 7. EXAMEN INTRABUCAL
    if (Object.keys(examenIntrabucalData).length > 0) {
      agregarTituloSeccion('EXAMEN INTRABUCAL', '7');
      
      if (examenIntrabucalData.estructuras) {
        agregarSubseccion('Estructuras Intrabucales');
        Object.entries(examenIntrabucalData.estructuras).forEach(([estructura, descripcion]) => {
          agregarCampo(estructura.replace('_', ' ').toUpperCase(), descripcion);
        });
      }

      if (examenIntrabucalData.higiene_bucal) {
        agregarSubseccion('Higiene Bucal');
        agregarCampo('Estado General', examenIntrabucalData.higiene_bucal.general);
        agregarCampo('Indice de Placa', examenIntrabucalData.higiene_bucal.indice_placa);
        agregarCampo('Calculo', examenIntrabucalData.higiene_bucal.calculo);
        agregarCampo('Halitosis', examenIntrabucalData.higiene_bucal.halitosis);
      }

      if (examenIntrabucalData.encias) {
        agregarSubseccion('Encias');
        agregarCampo('Color', examenIntrabucalData.encias.color);
        agregarCampo('Textura', examenIntrabucalData.encias.textura);
        agregarCampo('Forma', examenIntrabucalData.encias.forma);
        agregarCampo('Consistencia', examenIntrabucalData.encias.consistencia);
        agregarCampo('Sangrado', examenIntrabucalData.encias.sangrado);
        
        if (examenIntrabucalData.encias.alteraciones && Array.isArray(examenIntrabucalData.encias.alteraciones)) {
          examenIntrabucalData.encias.alteraciones.forEach((alteracion, index) => {
            agregarCampo(`Alteracion gingival ${index + 1}`, 
              `Localización: ${alteracion.localizacion} - Descripción: ${alteracion.descripcion}${alteracion.tamaño ? ` - Tamaño: ${alteracion.tamaño}` : ''}${alteracion.color ? ` - Color: ${alteracion.color}` : ''}${alteracion.consistencia ? ` - Consistencia: ${alteracion.consistencia}` : ''}`);
          });
        }
      }

      agregarCampo('Hallazgos adicionales', examenIntrabucalData.hallazgos_adicionales);
      yPosition += 10;
    }

    // 8. ANÁLISIS DE OCLUSIÓN
    if (Object.keys(oclusionData).length > 0) {
      agregarTituloSeccion('ANALISIS DE OCLUSION', '8');
      
      if (oclusionData.odontograma) {
        agregarSubseccion('Odontograma');
        agregarCampo('Observaciones Generales', oclusionData.odontograma.observaciones_generales);
        
        if (oclusionData.odontograma.dientes_presentes && Object.keys(oclusionData.odontograma.dientes_presentes).length > 0) {
          const dientesPresentes = [];
          const dientesAusentes = [];
          
          Object.entries(oclusionData.odontograma.dientes_presentes).forEach(([diente, estado]) => {
            if (estado === 'presente') {
              dientesPresentes.push(diente);
            } else {
              dientesAusentes.push(diente);
            }
          });
          
          if (dientesPresentes.length > 0) {
            agregarCampo('Dientes Presentes', dientesPresentes.join(', '));
          }
          if (dientesAusentes.length > 0) {
            agregarCampo('Dientes Ausentes', dientesAusentes.join(', '));
          }
        }
      }

      if (oclusionData.armonia_maxilares) {
        agregarSubseccion('Armonia de Maxilares');
        agregarCampo('Amplitud Arco Superior', oclusionData.armonia_maxilares.amplitud_arco_superior);
        agregarCampo('Boveda Palatina', oclusionData.armonia_maxilares.boveda_palatina);
        agregarCampo('Amplitud Arco Inferior', oclusionData.armonia_maxilares.amplitud_arco_inferior);
        agregarCampo('Descripcion de Armonia', oclusionData.armonia_maxilares.descripcion_armonia);
      }

      if (oclusionData.clasificacion_angle) {
        agregarSubseccion('Clasificacion de Angle');
        agregarCampo('Relacion Molar Derecho', oclusionData.clasificacion_angle.relacion_molar_derecho);
        agregarCampo('Relacion Molar Izquierdo', oclusionData.clasificacion_angle.relacion_molar_izquierdo);
        agregarCampo('Relacion Canina Derecho', oclusionData.clasificacion_angle.relacion_canina_derecho);
        agregarCampo('Relacion Canina Izquierdo', oclusionData.clasificacion_angle.relacion_canina_izquierdo);
        agregarCampo('Sobremordida Vertical', oclusionData.clasificacion_angle.sobremordida_vertical);
        agregarCampo('Sobremordida Horizontal', oclusionData.clasificacion_angle.sobremordida_horizontal);
        agregarCampo('Borde a Borde', oclusionData.clasificacion_angle.borde_a_borde);
        agregarCampo('Mordida Abierta', oclusionData.clasificacion_angle.mordida_abierta);
        agregarCampo('Mordida Cruzada Posterior', oclusionData.clasificacion_angle.mordida_cruzada_posterior);
        agregarCampo('Linea Media Maxilar', oclusionData.clasificacion_angle.linea_media_maxilar);
        agregarCampo('Linea Media Mandibular', oclusionData.clasificacion_angle.linea_media_mandibular);
        agregarCampo('Diastemas', oclusionData.clasificacion_angle.diastemas);
        agregarCampo('Apiñamiento', oclusionData.clasificacion_angle.apiñamiento);
        agregarCampo('Facetas de Desgaste', oclusionData.clasificacion_angle.facetas_desgaste);
        
        if (oclusionData.clasificacion_angle.alteraciones_dentales && Array.isArray(oclusionData.clasificacion_angle.alteraciones_dentales)) {
          oclusionData.clasificacion_angle.alteraciones_dentales.forEach((alteracion, index) => {
            agregarCampo(`Alteracion Dental ${index + 1}`, `Diente ${alteracion.diente}: ${alteracion.descripcion}`);
          });
        }
      }

      if (oclusionData.examen_higiene_oral) {
        agregarSubseccion('Examen de Higiene Oral (O\'Leary)');
        agregarCampo('Numero Total de Dientes', oclusionData.examen_higiene_oral.numero_total_dientes);
        agregarCampo('Total Superficies Revisadas', oclusionData.examen_higiene_oral.total_superficies_revisadas);
        agregarCampo('IPDB (%)', oclusionData.examen_higiene_oral.ipdb_porcentaje);
        agregarCampo('Observaciones O\'Leary', oclusionData.examen_higiene_oral.observaciones_oleary);
      }

      if (oclusionData.examen_dental) {
        agregarSubseccion('Examen Dental Detallado');
        agregarCampo('Hallazgos Dentales', oclusionData.examen_dental.hallazgos_dentales);
        agregarCampo('Procedimientos Realizados', oclusionData.examen_dental.procedimientos_realizados);
        
        if (oclusionData.examen_dental.estados_dientes && Object.keys(oclusionData.examen_dental.estados_dientes).length > 0) {
          Object.entries(oclusionData.examen_dental.estados_dientes).forEach(([diente, estados]) => {
            const estadosActivos = [];
            Object.entries(estados).forEach(([superficie, presente]) => {
              if (presente) {
                estadosActivos.push(superficie.replace('_', ' ').toUpperCase());
              }
            });
            if (estadosActivos.length > 0) {
              agregarCampo(`Diente ${diente}`, estadosActivos.join(', '));
            }
          });
        }
      }

      if (oclusionData.periodontograma) {
        agregarSubseccion('Periodontograma');
        agregarCampo('Observaciones del Periodonto', oclusionData.periodontograma.observaciones_periodonto);
        
        if (oclusionData.periodontograma.estados_periodonto && Object.keys(oclusionData.periodontograma.estados_periodonto).length > 0) {
          Object.entries(oclusionData.periodontograma.estados_periodonto).forEach(([diente, lesiones]) => {
            const lesionesActivas = [];
            Object.entries(lesiones).forEach(([lesion, presente]) => {
              if (presente) {
                lesionesActivas.push(lesion === 'gingival' ? 'Lesión Gingival' : 'Lesión Periodontal');
              }
            });
            if (lesionesActivas.length > 0) {
              agregarCampo(`Periodonto Diente ${diente}`, lesionesActivas.join(', '));
            }
          });
        }
      }

      if (oclusionData.modelos_estudio) {
        agregarSubseccion('Modelos de Estudio');
        agregarCampo('Hallazgos de Modelos', oclusionData.modelos_estudio.hallazgos);
      }
      yPosition += 10;
    }

    // 9. DIAGNÓSTICO Y TRATAMIENTO
    agregarTituloSeccion('DIAGNOSTICO Y TRATAMIENTO', '9');
    agregarCampo('Diagnostico', historialSeleccionado.diagnostico || 'No especificado', true);
    agregarCampo('Tratamiento realizado', historialSeleccionado.tratamiento || 'No especificado');
    
    if (historialSeleccionado.plan_tratamiento) {
      const planData = parsearDatosJSON(historialSeleccionado.plan_tratamiento);
      
      if (Object.keys(planData).length > 0) {
        agregarSubseccion('Plan de Tratamiento');
        
        if (planData.inmediato) {
          agregarCampo('Tratamiento inmediato', planData.inmediato);
        }
        if (planData.seguimiento) {
          agregarCampo('Seguimiento', planData.seguimiento);
        }
        if (planData.proxima_cita) {
          agregarCampo('Proxima Cita', planData.proxima_cita);
        }
        if (planData.recomendaciones) {
          const recomendaciones = Array.isArray(planData.recomendaciones) ? 
            planData.recomendaciones.join(', ') : planData.recomendaciones;
          agregarCampo('Recomendaciones', recomendaciones);
        }
      }
    }
    yPosition += 10;

    // 10. INFORMACIÓN DEL REGISTRO
    agregarTituloSeccion('INFORMACION DEL REGISTRO', '10');
    agregarCampo('Fecha de Creacion', formatearFecha(historialSeleccionado.created_at));
    agregarCampo('Ultima Actualizacion', formatearFecha(historialSeleccionado.updated_at));
    agregarCampo('Version del Historial', historialSeleccionado.version || '1.0');
    agregarCampo('Estado del Historial', historialSeleccionado.estado?.toUpperCase() || 'COMPLETADO');

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
    alert(`✅ PDF del historial clínico generado exitosamente!\n\nArchivo: ${nombreArchivo}\n\nTodaslas secciones han sido incluidas en el PDF.`);

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