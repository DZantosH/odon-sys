import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/config.js';
import { useAuth } from '../services/AuthContext';
import ModalEditarPaciente from '../components/ModalEditarPaciente';
import ModalRegistrarPaciente from '../components/ModalRegistrarPaciente';
import { ConfirmModal } from '../components/modals/ModalSystem';
import '../css/Pacientes.css';

const Pacientes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ordenPor, setOrdenPor] = useState('nombre');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para los modales
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [accionEnProceso, setAccionEnProceso] = useState(null);

  // Estados para modal de confirmación
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pacienteParaConvertir, setPacienteParaConvertir] = useState(null);

  // Función para obtener headers con autenticación
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Función para generar matrícula profesional (solo cuando se convierte a activo)
  const generarMatriculaNueva = useCallback((pacienteId) => {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const año = hoy.getFullYear().toString().slice(-2);
    
    return `PAC${dia}${mes}${año}/${pacienteId}`;
  }, []);

  const calcularEdad = useCallback((fechaNacimiento) => {
    if (!fechaNacimiento || fechaNacimiento === '1900-01-01') return 'N/A';
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad > 0 ? edad : 'N/A';
  }, []);

  // FUNCIÓN MEJORADA PARA CARGAR PACIENTES
  const cargarPacientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const apiUrl = buildApiUrl('/pacientes');
      const headers = getAuthHeaders();
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers
      });
          
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response text:', errorText);
        
        let errorMessage = 'Error al cargar pacientes';
        
        if (response.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (response.status === 403) {
          errorMessage = 'No tienes permisos para ver la lista de pacientes.';
        } else if (response.status === 404) {
          errorMessage = 'Endpoint de pacientes no encontrado.';
        } else if (response.status === 500) {
          errorMessage = 'Error interno del servidor.';
        } else {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();      
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos incorrecto: se esperaba un array');
      }
      
      // PROCESAR DATOS INCLUYENDO TODOS LOS CAMPOS NUEVOS
      const pacientesProcesados = data.map((paciente, index) => {
        
        const pacienteProcesado = {
          // Campos básicos
          ...paciente,
          edad: calcularEdad(paciente.fecha_nacimiento),
          es_temporal: paciente.estado === 'Temporal',
          tipo_paciente: paciente.estado === 'Temporal' ? 'Temporal' : 'Activo',
          matricula: paciente.matricula || null,
          
          // AGREGAR CAMPOS NUEVOS EXPLÍCITAMENTE
          fecha_nacimiento: paciente.fecha_nacimiento || null,
          lugar_nacimiento: paciente.lugar_nacimiento || null,
          lugar_procedencia: paciente.lugar_procedencia || null,
          grupo_etnico: paciente.grupo_etnico || null,
          religion: paciente.religion || null,
          rfc: paciente.rfc || null,
          numero_seguridad_social: paciente.numero_seguridad_social || null,
          derecho_habiente: Boolean(paciente.derecho_habiente),
          nombre_institucion: paciente.nombre_institucion || null,
          observaciones_internas: paciente.observaciones_internas || null,
          
          // MAPEAR DIRECCIÓN CORRECTAMENTE
          direccion: paciente.calle_numero || null, // Para el formulario
          calle_numero: paciente.calle_numero || null // Para la BD
        };
        
        return pacienteProcesado;
      });
            
      setPacientes(pacientesProcesados);
      setPacientesFiltrados(pacientesProcesados);
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error stack:', error.stack);
      setError(error.message || 'Error desconocido al cargar pacientes');
    } finally {
      setLoading(false);
    }
  }, [calcularEdad, user]);

  // FUNCIÓN PARA CONVERTIR PACIENTE TEMPORAL A PERMANENTE
const convertirPacientePermanente = async (paciente) => {
  try {
    setAccionEnProceso(`converting-${paciente.id}`);
    
    // Generar nueva matrícula para el paciente que se convierte a activo
    const nuevaMatricula = generarMatriculaNueva(paciente.id);
    
    const apiUrl = buildApiUrl(`/pacientes/${paciente.id}/convertir-activo`);
    
    // Enviar datos para la conversión incluyendo la nueva matrícula
    const datosConversion = {
      estado: 'Activo',
      matricula: nuevaMatricula,
      nombre: paciente.nombre,
      apellido_paterno: paciente.apellido_paterno,
      apellido_materno: paciente.apellido_materno,
      fecha_nacimiento: paciente.fecha_nacimiento,
      telefono: paciente.telefono,
      sexo: paciente.sexo
    };
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datosConversion)
    });
          
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en conversión:', errorText);
      throw new Error(`Error al convertir paciente: ${response.statusText}`);
    }
    
    const resultado = await response.json();
    
    // ❌ ELIMINAR ALERT DE ÉXITO
    // alert(`✅ Paciente convertido exitosamente!...`);
    console.log('✅ Paciente convertido exitosamente:', resultado);
    
    // Recargar lista de pacientes
    await cargarPacientes();
    
  } catch (error) {
    console.error('❌ Error al convertir paciente:', error);
    // ❌ ELIMINAR ALERT DE ERROR TAMBIÉN
    // alert(`❌ Error al convertir paciente: ${error.message}`);
  } finally {
    setAccionEnProceso(null);
  }
};

  // FUNCIÓN PARA ABRIR MODAL DE EDITAR PACIENTE
 const handleEditarPaciente = async (paciente) => {
  // Si ya tiene todos los campos, lo usamos directamente
  if (paciente.rfc && paciente.religion && paciente.numero_seguridad_social !== undefined) {
    setPacienteSeleccionado(paciente);
    setModalEditarOpen(true);
    return;
  }

  // 🔄 Cargar desde la API si faltan campos
  try {
    const response = await fetch(buildApiUrl(`/pacientes/${paciente.id}`), {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const pacienteCompleto = await response.json();
      setPacienteSeleccionado(pacienteCompleto);
      setModalEditarOpen(true);
    } else {
      // ❌ ELIMINAR ALERT
      // alert('❌ Error al obtener datos completos del paciente');
      console.error('❌ Error al obtener datos completos del paciente');
    }
  } catch (error) {
    console.error('❌ Error al cargar paciente:', error);
    // ❌ ELIMINAR ALERT
    // alert('❌ Error de conexión al obtener datos del paciente');
  }
};

  // Funciones para modal de confirmación
  const handleConvertirClick = (paciente) => {
    setPacienteParaConvertir(paciente);
    setConfirmModalOpen(true);
  };

  const confirmarConversion = () => {
    if (pacienteParaConvertir) {
      convertirPacientePermanente(pacienteParaConvertir);
    }
    setConfirmModalOpen(false);
    setPacienteParaConvertir(null);
  };

  const cancelarConversion = () => {
    setConfirmModalOpen(false);
    setPacienteParaConvertir(null);
  };

  // 🔄 FUNCIÓN CORREGIDA PARA MANEJAR ACTUALIZACIÓN DE PACIENTE
  const handlePacienteActualizado = useCallback(async (resultado) => {    
    try {
      if (resultado.success) {
        
        // Mostrar mensaje de éxito detallado
        const mensaje = [
          '✅ ¡Paciente actualizado exitosamente!',
          '',
          `📋 ID: ${resultado.id}`,
          `🔧 Campos actualizados: ${resultado.campos_actualizados?.length || 0}`,
          `📝 Detalles: ${resultado.campos_actualizados?.join(', ') || 'N/A'}`,
          '',
          '🔄 La lista se actualizará automáticamente...'
        ].join('\n');
                
        // PROCESO DE ACTUALIZACIÓN MEJORADO
        
        // 1. Cerrar modal inmediatamente
        setModalEditarOpen(false);
        setPacienteSeleccionado(null);
        
        // 2. Limpiar filtros para asegurar que se vea el paciente actualizado
        setBusqueda('');
        setOrdenPor('nombre'); // Resetear a orden por defecto
        
        // 3. Forzar recarga con un pequeño delay
        setTimeout(async () => {
          
          try {
            await cargarPacientes();
            
          } catch (errorRecarga) {
          console.error('❌ Error al recargar pacientes:', errorRecarga);
        }
      }, 200);
        
      } else {        
        const mensajeError = [
          '❌ Error al actualizar paciente:',
          '',
          resultado.error || 'Error desconocido',
          '',
          resultado.details || '',
          '',
          '🔍 Revisa los datos e intenta nuevamente.'
        ].join('\n');
        
        alert(mensajeError);
      }
      
    } catch (error) {
    }
    
}, [cargarPacientes]);

  // FUNCIÓN CORREGIDA PARA VER HISTORIAL CLÍNICO
  const verHistorialClinico = useCallback((pacienteId) => {
    
    // BUSCAR LOS DATOS ACTUALIZADOS DEL PACIENTE
    const pacienteActualizado = pacientes.find(p => p.id === pacienteId);
    
    if (!pacienteActualizado) {
      alert('Error: No se pudieron cargar los datos del paciente');
      return;
    }
    
    const targetUrl = `/pacientes/${pacienteId}/historial`;
    
    // CAMBIO PRINCIPAL: USAR NAVIGATE CON STATE EN LUGAR DE window.location.href
    try {
      
      navigate(targetUrl, {
        state: {
          paciente: pacienteActualizado,  // Pasar datos actualizados
          origen: 'lista-pacientes',
          timestamp: Date.now()
        }
      });
            
    } catch (error) {
      console.error('❌ Error en navegación con datos:', error);
      
      // Fallback: navegación directa SIN datos (como backup)
      try {
        window.location.href = targetUrl;
      } catch (error2) {
        alert('Error al navegar al historial del paciente');
      }
    }
      }, [navigate, pacientes]);

  // Función para filtrar y ordenar pacientes
const filtrarYOrdenarPacientes = useCallback(() => {
  let resultado = [...pacientes];

  // Aplicar filtro de búsqueda
  if (busqueda.trim()) {
    const terminoBusqueda = busqueda.toLowerCase().trim();
    resultado = resultado.filter(paciente => {
      const nombreCompleto = `${paciente.nombre || ''} ${paciente.apellido_paterno || ''} ${paciente.apellido_materno || ''}`.toLowerCase();
      
      return (
        nombreCompleto.includes(terminoBusqueda) ||
        (paciente.telefono && paciente.telefono.includes(terminoBusqueda)) ||
        (paciente.rfc && paciente.rfc.toLowerCase().includes(terminoBusqueda)) ||
        (paciente.matricula && paciente.matricula.toLowerCase().includes(terminoBusqueda))
      );
    });
  }

      // ✅ APLICAR ORDENAMIENTO CORREGIDO
  resultado.sort((a, b) => {
    switch (ordenPor) {
      case 'nombre':
        // ✅ Ordenar por nombre alfabéticamente (A-Z)
        const nombreA = (a.nombre || '').toLowerCase().trim();
        const nombreB = (b.nombre || '').toLowerCase().trim();
        return nombreA.localeCompare(nombreB, 'es', { numeric: true });

      case 'apellido':
        // ✅ Ordenar por apellido paterno alfabéticamente (A-Z)
        const apellidoA = (a.apellido_paterno || '').toLowerCase().trim();
        const apellidoB = (b.apellido_paterno || '').toLowerCase().trim();
        return apellidoA.localeCompare(apellidoB, 'es', { numeric: true });

      case 'edad':
        // ✅ Ordenar por edad de menor a mayor
        const edadA = typeof a.edad === 'number' ? a.edad : 
                     (a.edad === 'N/A' ? 999 : parseInt(a.edad) || 0);
        const edadB = typeof b.edad === 'number' ? b.edad : 
                     (b.edad === 'N/A' ? 999 : parseInt(b.edad) || 0);
        
        // Los N/A van al final
        if (a.edad === 'N/A' && b.edad !== 'N/A') return 1;
        if (b.edad === 'N/A' && a.edad !== 'N/A') return -1;
        if (a.edad === 'N/A' && b.edad === 'N/A') return 0;
        
        return edadA - edadB;

      case 'matricula':
        // ✅ Ordenar por matrícula - último dígito de menor a mayor
        
        // Función para extraer el último dígito de la matrícula
        const getUltimoDigitoMatricula = (matricula) => {
          if (!matricula) return 999; // Sin matrícula van al final
          
          // Buscar patrón like "PAC190725/3" y extraer el último número
          const match = matricula.match(/\/(\d+)$/);
          if (match) {
            return parseInt(match[1]);
          }
          
          // Si no encuentra el patrón, intentar extraer el último dígito
          const ultimoDigito = matricula.match(/(\d)(?!.*\d)/);
          return ultimoDigito ? parseInt(ultimoDigito[1]) : 999;
        };
        
        const digitoA = getUltimoDigitoMatricula(a.matricula);
        const digitoB = getUltimoDigitoMatricula(b.matricula);
        
        // Sin matrícula van al final
        if (!a.matricula && !b.matricula) return 0;
        if (!a.matricula) return 1;
        if (!b.matricula) return -1;
        
        return digitoA - digitoB;

      case 'tipo':
        // ✅ Ordenar por tipo: Activos primero, luego Temporales
        const tipoA = a.tipo_paciente || (a.es_temporal ? 'Temporal' : 'Activo');
        const tipoB = b.tipo_paciente || (b.es_temporal ? 'Temporal' : 'Activo');
        
        // Activos primero (A viene antes que T)
        if (tipoA === 'Activo' && tipoB === 'Temporal') return -1;
        if (tipoA === 'Temporal' && tipoB === 'Activo') return 1;
        
        // Si son del mismo tipo, ordenar alfabéticamente por nombre
        const nombreA2 = (a.nombre || '').toLowerCase().trim();
        const nombreB2 = (b.nombre || '').toLowerCase().trim();
        return nombreA2.localeCompare(nombreB2, 'es', { numeric: true });

      default:
        return 0;
    }
  });

    setPacientesFiltrados(resultado);
}, [busqueda, pacientes, ordenPor]);

  // useEffect para cargar datos iniciales
  useEffect(() => {
    cargarPacientes();
  }, [cargarPacientes]);

  // useEffect para filtrado y ordenamiento
  useEffect(() => {
    filtrarYOrdenarPacientes();
  }, [filtrarYOrdenarPacientes]);

  const handleBusquedaChange = useCallback((e) => {
    setBusqueda(e.target.value);
  }, []);

  const handleOrdenChange = useCallback((e) => {
    setOrdenPor(e.target.value);
  }, []);

  if (loading) {
    return (
      <div className="pacientes-container-moderno">
        <div className="loading-moderno">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Cargando pacientes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pacientes-container-moderno">
        <div className="error-moderno">
          <h3>❌ Error al cargar pacientes</h3>
          <p>{error}</p>
          <button onClick={cargarPacientes} className="btn-retry-moderno">
            🔄 Reintentar
          </button>
          
          {/* Debug info adicional */}
          <details className="debug-info">
            <summary>Información de depuración</summary>
            <div className="debug-details">
              <p><strong>Usuario:</strong> {user?.nombre || 'No logueado'}</p>
              <p><strong>Rol:</strong> {user?.rol || 'Sin rol'}</p>
              <p><strong>Token presente:</strong> {localStorage.getItem('token') ? 'Sí' : 'No'}</p>
              <p><strong>URL de la API:</strong> {buildApiUrl('/pacientes')}</p>
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="pacientes-container-moderno">
      {/* Header con botón de regresar y registrar paciente */}
      <div className="pacientes-header-moderno">
        <div className="header-left">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-regresar-panel"
            title="Regresar al Panel Principal"
          >
            ← Regresar al Panel
          </button>
          <h1>Pacientes</h1>
        </div>
        
        {/* Sección derecha con botón registrar y estadísticas */}
        <div className="header-right">
          <button
            onClick={() => setModalRegistrarOpen(true)}
            className="btn-registrar-paciente"
            title="Registrar nuevo paciente"
          >
            👤 Registrar Paciente
          </button>
          
          {/* Estadísticas rápidas en el header */}
          <div className="estadisticas-header">
            <div className="estadistica-item estadistica-total">
              <span>Total: {pacientes.length}</span>
            </div>
            
            {pacientes.filter(p => p.es_temporal).length > 0 && (
              <div className="estadistica-item estadistica-temporales">
                <span>Temporales: {pacientes.filter(p => p.es_temporal).length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="controles-pacientes">
        {/* Campo de búsqueda */}
        <div className="busqueda-container-moderno">
          <div className="busqueda-icon">🔍</div>
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, teléfono o matrícula..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className="busqueda-input-moderno"
          />
        </div>

        {/* Selector de ordenamiento */}
        <div className="orden-container">
          <select
            value={ordenPor}
            onChange={handleOrdenChange}
            className="orden-select"
          >
            <option value="nombre">📝 Ordenar por nombre (A-Z)</option>
            <option value="apellido">📝 Ordenar por apellido (A-Z)</option>
            <option value="edad">🎂 Ordenar por edad (menor a mayor)</option>
            <option value="matricula">🆔 Ordenar por matrícula (número menor a mayor)</option>
            <option value="tipo">👥 Ordenar por tipo (Activos → Temporales)</option>
          </select>
        </div>
      </div>

      {/* Tabla de pacientes */}
      <div className="tabla-container">
        {/* Header de la tabla */}
        <div className="tabla-header">
          <div>Nombre</div>
          <div>Apellido Paterno</div>
          <div>Apellido Materno</div>
          <div>Edad</div>
          <div>Teléfono</div>
          <div>Matrícula</div>
          <div>Tipo de Paciente</div>
          <div className="header-centrado">Historial</div>
          <div className="header-centrado">Editar</div>
          <div className="header-centrado">Convertir</div>
        </div>

        {/* Área de scroll para las filas */}
        <div className="tabla-scroll">
          {/* Filas de pacientes */}
          {pacientesFiltrados.length > 0 ? (
            pacientesFiltrados.map((paciente, index) => (
              <div
                key={`paciente-${paciente.id}`}
                className="tabla-fila"
              >
                <div className="celda-nombre">
                  {paciente.nombre || 'N/A'}
                </div>
                
                <div className="celda-apellido">
                  {paciente.apellido_paterno || 'N/A'}
                </div>
                
                <div className="celda-apellido">
                  {paciente.apellido_materno || 'N/A'}
                </div>
                
                <div className="celda-edad">
                  {paciente.edad === 'N/A' ? 'N/A' : `${paciente.edad} años`}
                </div>
                
                <div className="celda-telefono">
                  {paciente.telefono || 'N/A'}
                </div>
                
                <div className="celda-matricula">
                  {paciente.matricula || (
                    <span className="sin-matricula">Sin matrícula</span>
                  )}
                </div>
                
                <div className="celda-tipo">
                  <span className={`badge-tipo ${paciente.tipo_paciente === 'Temporal' ? 'badge-temporal' : 'badge-activo'}`}>
                    {paciente.tipo_paciente}
                  </span>
                </div>
                
                {/* Botones de acción */}
                <div className="celda-accion celda-centrada">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      verHistorialClinico(paciente.id);
                    }}
                    className="btn-historial"
                    title="Ver Historial Clínico"
                  >
                    📋 Ver
                  </button>
                </div>
                
                <div className="celda-accion celda-centrada">
                  <button
                    onClick={() => handleEditarPaciente(paciente)}
                    className="btn-editar"
                    title="Editar Paciente"
                  >
                    ✏️ Editar
                  </button>
                </div>
                
                <div className="celda-accion celda-centrada">
                  {paciente.es_temporal ? (
                    <button
                      onClick={() => handleConvertirClick(paciente)}
                      disabled={accionEnProceso === `converting-${paciente.id}`}
                      className={`btn-convertir ${accionEnProceso === `converting-${paciente.id}` ? 'btn-converting' : ''}`}
                      title="Convertir a paciente permanente"
                    >
                      {accionEnProceso === `converting-${paciente.id}` ? '⏳ ...' : '🔄 Activar'}
                    </button>
                  ) : (
                    <span className="no-accion">-</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="tabla-vacia">
              {busqueda 
                ? `No se encontraron pacientes que coincidan con "${busqueda}"`
                : 'No hay pacientes registrados'
              }
            </div>
          )}
        </div>
      </div>

      {/* Footer con estadísticas */}
      {pacientes.length > 0 && (
        <div className="footer-estadisticas">
          <div className="estadisticas-texto">
            Mostrando {pacientesFiltrados.length} de {pacientes.length} pacientes
            {busqueda && ` (filtrado por: "${busqueda}")`}
          </div>
          <div className="estadisticas-detalle">
            {pacientes.filter(p => !p.es_temporal).length} activos, {' '}
            {pacientes.filter(p => p.es_temporal).length} temporales
            {pacientes.filter(p => p.es_temporal).length > 0 && (
              <span className="temporales-expiran"> (expiran en 24h)</span>
            )}
          </div>
        </div>
      )}

      {/* Modal para editar paciente */}
      <ModalEditarPaciente
  isOpen={modalEditarOpen}
  onClose={() => setModalEditarOpen(false)}
  paciente={pacienteSeleccionado}
  onPacienteActualizado={handlePacienteActualizado}
/>

      {/* Modal para registrar nuevo paciente */}
      <ModalRegistrarPaciente
        isOpen={modalRegistrarOpen}
        onClose={() => {
          setModalRegistrarOpen(false);
        }}
        onPacienteCreado={(nuevoPaciente) => {
          cargarPacientes();
          setModalRegistrarOpen(false);
        }}
      />

      {/* Modal de confirmación para convertir paciente */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={cancelarConversion}
        onConfirm={confirmarConversion}
        title="Confirmar conversión de paciente"
        message={pacienteParaConvertir ? 
          `¿Estás seguro de convertir a "${pacienteParaConvertir.nombre} ${pacienteParaConvertir.apellido_paterno}" en paciente permanente?\n\nEsta acción no se puede deshacer y el paciente pasará de temporal a activo.` 
          : ''
        }
        confirmText="Aceptar"
        cancelText="Cancelar"
        type="warning"
        position="top-left"
      />
    </div>
  );
};

export default Pacientes;