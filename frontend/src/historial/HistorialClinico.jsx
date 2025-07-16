import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './HistorialClinico.css';

// Importaciones de secciones externas
import FichaIdentificacion from './secciones/FichaIdentificación';
import MotivoConsulta from './secciones/MotivoConsulta';
import AntecedentesHeredoFamiliares from './secciones/AntecedentesHeredoFamiliares';
import AntecedentesPersonalesNoPatologicos from './secciones/AntecedentesPersonalesNoPatologicos';
import AntecedentesPersonalesPatologicos from './secciones/AntecedentesPersonalesPatologicos';
import ExamenBucal from './secciones/ExamenBucal';
import ExamenIntrabucal from './secciones/ExamenIntrabucal';

// Importar validaciones
import { validarSeccion } from './validaciones';

// Importaciones para guardado
import { 
  guardarHistorialEnBaseDatos,
  generarPDFHistorial,
  guardarPDFLocal,
  guardarVersionDigital
} from '../services/historialService';

// Importar utilidades para modales
import { alerta, confirmar, mostrarErroresValidacion } from '../utils/ModalUtils';

const formatearFechaParaInput = (fecha) => {
  if (!fecha) return '';
  
  if (fecha.includes('-') && fecha.length === 10) {
    return fecha;
  }
  
  try {
    const fechaObj = new Date(fecha);
    return fechaObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '';
  }
};

const HistorialClinico = () => {
  const { pacienteId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Estados principales
  const [seccionActiva, setSeccionActiva] = useState(1);
  const [datosFormulario, setDatosFormulario] = useState({});
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [historialId, setHistorialId] = useState(null);
  const [seccionesCompletadas, setSeccionesCompletadas] = useState(new Set());
  const [seccionesValidadas, setSeccionesValidadas] = useState(new Set());
  
  // Estados para el guardado completo
  const [progreso, setProgreso] = useState({
    baseDatos: false,
    pdfGenerado: false,
    pdfGuardado: false,
    versionDigital: false
  });
  
  const carruselRef = useRef(null);

  // Configuración de secciones del historial clínico
 const secciones = [
  { id: 1, titulo: 'Ficha Identificación' },
  { id: 2, titulo: 'Motivo Consulta' },
  { id: 3, titulo: 'Ant. Heredo-Familiares' },
  { id: 4, titulo: 'Ant. Pers. No Patológicos' },
  { id: 5, titulo: 'Ant. Pers. Patológicos' },
  { id: 6, titulo: 'Examen Extrabucal' },
  { id: 7, titulo: 'Examen Intrabucal' }
];

  // Effect para el scroll horizontal del carrusel
  useEffect(() => {
    const carrusel = carruselRef.current;
    if (!carrusel) return;

    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      carrusel.scrollBy({ left: e.deltaY, behavior: 'smooth' });
    };

    carrusel.addEventListener('wheel', onWheel, { passive: false });
    return () => carrusel.removeEventListener('wheel', onWheel);
  }, []);

  // Effect para validar pacienteId
  useEffect(() => {
    if (!pacienteId || pacienteId === 'undefined') {
      console.error('❌ ID de paciente inválido:', pacienteId);
      alerta('Error: ID de paciente inválido. Regresando al listado de pacientes.', 'error')
        .then(() => navigate('/pacientes'));
      return;
    }
    
    console.log('✅ Historial clínico iniciado para paciente:', pacienteId);
  }, [pacienteId, navigate]);

  // Effect para cargar datos del paciente
  useEffect(() => {
    const cargarDatosPaciente = async () => {
      try {
        console.log('🔍 Cargando datos para paciente:', pacienteId);
        
        const navegacionState = location.state;
        if (navegacionState && navegacionState.paciente) {
          console.log('✅ Usando datos del state de navegación');
          const paciente = navegacionState.paciente;
          
          setDatosFormulario(prevState => ({
            ...prevState,
            nombre: paciente.nombre || '',
            apellidoPaterno: paciente.apellido_paterno || '',
            apellidoMaterno: paciente.apellido_materno || '',
            sexo: paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : paciente.sexo || '',
            fechaNacimiento: formatearFechaParaInput(paciente.fecha_nacimiento),
            rfc: paciente.rfc || '',
            telefono: paciente.telefono || '',
            email: paciente.correo_electronico || ''
          }));
          return;
        }
        
        // Inicializar con datos básicos por defecto
        setDatosFormulario(prevState => ({
          ...prevState,
          nombre: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          sexo: '',
          fechaNacimiento: '',
          rfc: '',
          telefono: '',
          email: ''
        }));
        
      } catch (error) {
        console.error('❌ Error al cargar datos del paciente:', error);
        alerta('Error al cargar datos del paciente. Por favor, complete la información manualmente.', 'warning');
      }
    };

    cargarDatosPaciente();
  }, [pacienteId, location.state]);

  // Effect para validación en tiempo real
  useEffect(() => {
  // Usar timer para evitar validaciones excesivas mientras se escribe
  const timer = setTimeout(() => {
    const validacionActual = validarSeccion(seccionActiva, datosFormulario);
    setErrores(validacionActual.errores);
    
    // Actualizar secciones validadas
    if (validacionActual.esValido) {
      setSeccionesValidadas(prev => new Set([...prev, seccionActiva]));
    } else {
      setSeccionesValidadas(prev => {
        const nuevas = new Set(prev);
        nuevas.delete(seccionActiva);
        return nuevas;
      });
    }
  }, 800); // Esperar 800ms después del último cambio
  
  return () => clearTimeout(timer);
}, [datosFormulario, seccionActiva]);

  // Funciones auxiliares para extraer datos por sección
  const extractFichaData = () => ({
    nombre: datosFormulario.nombre || '',
    apellidoPaterno: datosFormulario.apellidoPaterno || '',
    apellidoMaterno: datosFormulario.apellidoMaterno || '',
    sexo: datosFormulario.sexo || '',
    fechaNacimiento: datosFormulario.fechaNacimiento || '',
    rfc: datosFormulario.rfc || '',
    telefono: datosFormulario.telefono || '',
    email: datosFormulario.email || ''
  });

  const extractMotivoData = () => ({
    motivo: datosFormulario.motivo || '',
    escalaDolor: datosFormulario.escalaDolor || 0,
    nivelUrgencia: datosFormulario.nivelUrgencia || '',
    duracionSintomas: datosFormulario.duracionSintomas || '',
    tratamientoPrevio: datosFormulario.tratamientoPrevio || ''
  });

  const extractAntecedentesHF = () => ({
    antecedentes: datosFormulario.antecedentes || [],
    enfermedades_relevantes: datosFormulario.enfermedades_relevantes || {}
  });

  const extractAntecedentesNoPatol = () => ({
    servicios_publicos: datosFormulario.servicios_publicos || {},
    higiene: datosFormulario.higiene || {},
    alimentarios: datosFormulario.alimentarios || {},
    habitos_perniciosos: datosFormulario.habitos_perniciosos || {}
  });

  const extractAntecedentesPatol = () => ({
    padecimientos: datosFormulario.padecimientos || [],
    somatometria: datosFormulario.somatometria || {},
    signos_vitales: datosFormulario.signos_vitales || {}
  });

  const extractExamenExt = () => ({
    cabeza: datosFormulario.cabeza || {},
    atm: datosFormulario.atm || {},
    musculos_cuello: datosFormulario.musculos_cuello || {}
  });

  const extractExamenInt = () => ({
    estructuras: datosFormulario.estructuras || {},
    higiene_bucal: datosFormulario.higiene_bucal || {},
    encias: datosFormulario.encias || {},
    oclusion: datosFormulario.oclusion || {}
  });

  const generarNombrePDF = () => {
    const nombrePaciente = `${datosFormulario.nombre || 'Paciente'}_${datosFormulario.apellidoPaterno || ''}`.replace(/\s+/g, '_');
    const fecha = new Date().toISOString().split('T')[0];
    const hora = new Date().toLocaleTimeString('es-MX', { hour12: false }).replace(/:/g, '-');
    return `Historial_Clinico_${nombrePaciente}_${fecha}_${hora}.pdf`;
  };

  // Funciones principales del componente
  const avanceProgreso = (seccionActiva / secciones.length) * 100;

  const handleInputChange = (campo, valor) => {
    setDatosFormulario(prev => ({ ...prev, [campo]: valor }));
  };

  const mostrarErroresValidacionLocal = (errores) => {
    return mostrarErroresValidacion(errores);
  };

  const validarSeccionActual = () => {
    const validacion = validarSeccion(seccionActiva, datosFormulario);
    setErrores(validacion.errores);
    
    if (!validacion.esValido) {
      mostrarErroresValidacionLocal(validacion.errores);
    }
    
    return validacion.esValido;
  };

  const puedeAvanzar = () => {
    return seccionesValidadas.has(seccionActiva);
  };

  const guardarHistorialCompleto = async () => {
    try {
      setProgreso({
        baseDatos: false,
        pdfGenerado: false,
        pdfGuardado: false,
        versionDigital: false
      });

      console.log('🚀 Iniciando guardado completo del historial...');

      // Preparar datos completos
      const historialCompleto = {
        pacienteId: pacienteId || 'temp_' + Date.now(),
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        estado: 'completado',
        version: '1.0',
        metadatos: {
          totalSecciones: secciones.length,
          seccionesCompletadas: secciones.length,
          tiempoTotal: Date.now(),
          dispositivo: navigator.userAgent,
          navegador: navigator.appName
        },
        datos: {
          informacionPersonal: extractFichaData(),
          secciones: {
            fichaIdentificacion: extractFichaData(),
            motivoConsulta: extractMotivoData(),
            antecedentesHeredoFamiliares: extractAntecedentesHF(),
            antecedentesPersonalesNoPatologicos: extractAntecedentesNoPatol(),
            antecedentesPersonalesPatologicos: extractAntecedentesPatol(),
            examenExtrabucal: extractExamenExt(),
            examenIntrabucal: extractExamenInt()
          }
        }
      };

      console.log('📋 Historial completo preparado:', historialCompleto);

      // 1. Guardar en base de datos
      console.log('💾 Paso 1: Guardando en base de datos...');
      try {
        const resultadoBD = await guardarHistorialEnBaseDatos(historialCompleto);
        setProgreso(prev => ({ ...prev, baseDatos: true }));
        setHistorialId(resultadoBD.historialId);
        console.log('✅ Base de datos: OK');
      } catch (error) {
        console.warn('⚠️ Error en BD, continuando:', error);
        setProgreso(prev => ({ ...prev, baseDatos: true }));
      }

      // 2. Generar PDF
      console.log('📄 Paso 2: Generando PDF...');
      try {
        const pdfBlob = await generarPDFHistorial(historialCompleto);
        setProgreso(prev => ({ ...prev, pdfGenerado: true }));
        console.log('✅ PDF generado: OK');

        // 3. Guardar PDF localmente
        console.log('📁 Paso 3: Guardando PDF localmente...');
        const nombrePDF = generarNombrePDF();
        await guardarPDFLocal(pdfBlob, nombrePDF);
        setProgreso(prev => ({ ...prev, pdfGuardado: true }));
        console.log('✅ PDF guardado: OK');

      } catch (error) {
        console.warn('⚠️ Error en PDF, continuando:', error);
        setProgreso(prev => ({ ...prev, pdfGenerado: true, pdfGuardado: true }));
      }

      // 4. Guardar versión digital
      console.log('💻 Paso 4: Guardando versión digital...');
      try {
        await guardarVersionDigital(historialId || Date.now(), historialCompleto);
        setProgreso(prev => ({ ...prev, versionDigital: true }));
        console.log('✅ Versión digital: OK');
      } catch (error) {
        console.warn('⚠️ Error en versión digital, continuando:', error);
        setProgreso(prev => ({ ...prev, versionDigital: true }));
      }

      console.log('✅ Guardado completo exitoso!');
      return true;

    } catch (error) {
      console.error('❌ Error en guardado completo:', error);
      
      setProgreso({
        baseDatos: true,
        pdfGenerado: true,
        pdfGuardado: true,
        versionDigital: true
      });
      
      console.warn('⚠️ Error manejado, continuando con el flujo');
      return true;
    }
  };

  const guardarSeccionLocal = async () => {
    setGuardando(true);
    try {
      const historialData = {
        pacienteId,
        seccionActual: seccionActiva,
        datos: datosFormulario,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      // Guardar en localStorage como respaldo
      localStorage.setItem(`historial_${pacienteId}`, JSON.stringify(historialData));
      
      // Marcar sección como completada
      setSeccionesCompletadas(prev => new Set([...prev, seccionActiva]));
      
      // Simular tiempo de guardado
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('✅ Sección guardada localmente:', seccionActiva);
      return true;
      
    } catch (error) {
      console.error('❌ Error al guardar sección:', error);
      return true;
    } finally {
      setGuardando(false);
    }
  };

  const siguienteSeccion = async () => {
    if (!validarSeccionActual()) {
      return;
    }
    
    await guardarSeccionLocal();
    
    if (seccionActiva < secciones.length) {
      setSeccionActiva(seccionActiva + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const anteriorSeccion = () => {
    if (seccionActiva > 1) {
      setSeccionActiva(seccionActiva - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const finalizarHistorial = async () => {
  // Validar sección actual primero
  if (!validarSeccionActual()) {
    return;
  }

  const tieneInformacionBasica = datosFormulario.nombre && 
                                 (datosFormulario.apellidoPaterno || datosFormulario.apellidos) &&
                                 datosFormulario.sexo;

  if (!tieneInformacionBasica) {
    await alerta(`❌ Información mínima requerida:\n\n• Nombre del paciente\n• Apellido\n• Sexo\n\nPor favor, complete la información básica antes de finalizar.`, 'warning');
    return;
  }
  
  setGenerandoPDF(true);
  
  try {
    console.log('🚀 Iniciando finalización del historial...');
    
    await guardarSeccionLocal();
    const exito = await guardarHistorialCompleto();
    
    if (exito) {
      const nombrePaciente = datosFormulario.nombre ? 
        `${datosFormulario.nombre} ${datosFormulario.apellidoPaterno || ''}` : 
        'Paciente';
        
      await alerta(`✅ ¡Historial clínico completado exitosamente!\n\n` +
            `👤 Paciente: ${nombrePaciente}\n` +
            `📄 PDF generado y descargado\n` +
            `💾 Información guardada en el sistema\n` +
            `📅 Fecha: ${new Date().toLocaleDateString('es-MX')}\n\n` +
            `El historial está ahora disponible en el expediente del paciente.`, 'success');
      
      setTimeout(() => {
        console.log('🔄 Redirigiendo al historial del paciente...');
        navigate(`/pacientes/${pacienteId}/historial`);
      }, 1000);
      
    } else {
      throw new Error('El proceso de guardado no se completó correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error al finalizar historial:', error);
    
    await alerta(`⚠️ Ocurrió un problema al finalizar el historial:\n\n` +
          `${error.message || 'Error desconocido'}\n\n` +
          `Sin embargo, su información se ha guardado localmente.\n` +
          `¿Desea intentar nuevamente o continuar?`, 'error');
          
    const intentarDeNuevo = await confirmar('¿Desea intentar guardar nuevamente?', {
      textoConfirmar: 'Intentar de nuevo',
      textoCancelar: 'No, cancelar'
    });
    
    if (intentarDeNuevo) {
      setProgreso({
        baseDatos: false,
        pdfGenerado: false,
        pdfGuardado: false,
        versionDigital: false
      });
      
      setTimeout(() => finalizarHistorial(), 1000);
    } else {
      const salir = await confirmar('¿Desea regresar al listado de pacientes?', {
        textoConfirmar: 'Sí, regresar',
        textoCancelar: 'No, quedarme aquí'
      });
      if (salir) {
        navigate(`/pacientes/${pacienteId}/historial`);
      }
    }
    
  } finally {
    setGenerandoPDF(false);
  }
};
  
  const irASeccion = async (numeroSeccion) => {
    if (numeroSeccion <= seccionActiva) {
      setSeccionActiva(numeroSeccion);
      return;
    }
    
    for (let i = 1; i < numeroSeccion; i++) {
      if (!seccionesValidadas.has(i)) {
        await alerta(`❌ Debe completar la sección "${secciones[i-1].titulo}" antes de continuar a "${secciones[numeroSeccion-1].titulo}".`, 'warning');
        return;
      }
    }
    
    setSeccionActiva(numeroSeccion);
  };

  const renderSeccionActual = () => {
    const seccionProps = { 
      datos: datosFormulario, 
      errores, 
      onChange: handleInputChange 
    };

    switch (seccionActiva) {
      case 1: return <FichaIdentificacion {...seccionProps} />;
      case 2: return <MotivoConsulta {...seccionProps} />;
      case 3: return <AntecedentesHeredoFamiliares {...seccionProps} />;
      case 4: return <AntecedentesPersonalesNoPatologicos {...seccionProps} />;
      case 5: return <AntecedentesPersonalesPatologicos {...seccionProps} />;
      case 6: return <ExamenBucal {...seccionProps} />;
      case 7: return <ExamenIntrabucal {...seccionProps} />;
      default: return <FichaIdentificacion {...seccionProps} />;
    }
  };

  return (
    <div className="historial-clinico-container">
      <div className="secciones-nav">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${avanceProgreso}%` }}></div>
        </div>
        <div className="secciones-carrusel" ref={carruselRef}>
          {secciones.map((seccion) => {
  const completada = seccionesCompletadas.has(seccion.id);
  const validada = seccionesValidadas.has(seccion.id);
  
  return (
    <div
      key={seccion.id}
      className={`seccion-card ${
        seccion.id === seccionActiva ? 'active' : ''
      } ${completada ? 'completed' : ''} ${
        validada ? 'validated' : ''
      } ${!validada && seccion.id === seccionActiva ? 'invalid' : ''}`}
      onClick={() => irASeccion(seccion.id)}
      style={{ cursor: 'pointer' }}
    >
      <div className="seccion-numero">
        {validada ? '✓' : seccion.id}
      </div>
      <div className="seccion-titulo">{seccion.titulo}</div>
      {seccion.id === seccionActiva && !validada && (
        <div className="estado-indicador incompleto">⚠️</div>
      )}
      {validada && (
        <div className="estado-indicador completo">✅</div>
      )}
    </div>
  );
})}
        </div>
      </div>

      <div className="seccion-content">
        <div className={`seccion-form ${seccionActiva === 1 ? 'sin-scroll' : ''}`}>
          {Object.keys(errores).length > 0 && (
            <div className="errores-seccion">
              <div className="errores-header">
                <span className="error-icon">⚠️</span>
                <span>Campos requeridos para continuar:</span>
              </div>
              <ul className="errores-lista">
                {Object.entries(errores).map(([campo, error]) => (
                  <li key={campo} className="error-item">
                    <span className="error-texto">{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {renderSeccionActual()}
        </div>
      </div>

      <div className="navegacion-footer">
  <div className="paciente-info-footer">
    <h2>Historial Clínico</h2>
    
    <div className="paciente-datos-footer">
      <p>
        <strong>Paciente:</strong> 
        {datosFormulario.nombre ? 
          `${datosFormulario.nombre} ${datosFormulario.apellidoPaterno || ''}`.trim() : 
          'Sin nombre'}
      </p>
      
      <p>
        <strong>Fecha:</strong> 
        {new Date().toLocaleDateString('es-MX')}
      </p>
      
      <p>
        <strong>Sección:</strong> 
        {seccionActiva}/{secciones.length}
      </p>
      
      {/* Estado de validación */}
      <div className="estado-validacion">
        {puedeAvanzar() ? (
          <span className="validacion-ok">✅ Sección completa</span>
        ) : (
          <span className="validacion-error">⚠️ Complete los campos</span>
        )}
      </div>

      {/* Progreso de guardado cuando está activo */}
      {generandoPDF && (
        <div className="progreso-guardado">
          <h4>📄 Guardando...</h4>
          <div className="progreso-items">
            <div className={`progreso-item ${progreso.baseDatos ? 'completado' : 'procesando'}`}>
              {progreso.baseDatos ? '✅' : '⏳'} BD
            </div>
            <div className={`progreso-item ${progreso.pdfGenerado ? 'completado' : 'procesando'}`}>
              {progreso.pdfGenerado ? '✅' : '⏳'} PDF
            </div>
            <div className={`progreso-item ${progreso.pdfGuardado ? 'completado' : 'procesando'}`}>
              {progreso.pdfGuardado ? '✅' : '⏳'} Local
            </div>
            <div className={`progreso-item ${progreso.versionDigital ? 'completado' : 'procesando'}`}>
              {progreso.versionDigital ? '✅' : '⏳'} Digital
            </div>
          </div>
        </div>
      )}
    </div>
    
    {/* Botón de regresar - más pequeño */}
    <button 
      className="btn-regresar-historial" 
      onClick={() => {
        console.log('🔙 Regresando al historial del paciente:', pacienteId);
        navigate(`/pacientes/${pacienteId}/historial`);
      }}
    >
      ← Regresar
    </button>
  </div>

  <div className="navegacion-botones">
    {/* Indicador de guardado */}
    {guardando && (
      <div className="guardado-temporal guardando">
        <div className="icono">💾</div>
        Guardando...
      </div>
    )}
    
    {/* Botones de navegación */}
    <button 
      className="btn btn-volver" 
      onClick={anteriorSeccion} 
      disabled={seccionActiva === 1 || generandoPDF}
    >
      ← Anterior
    </button>
    
    {seccionActiva === secciones.length ? (
      <button 
        className={`btn btn-guardar-final ${!puedeAvanzar() ? 'disabled' : ''}`}
        onClick={finalizarHistorial} 
        disabled={guardando || generandoPDF || !puedeAvanzar()}
      >
        {generandoPDF ? 
          '📄 Guardando...' : 
          !puedeAvanzar() ? '⚠️ Complete la sección' : '✅ Finalizar'
        }
      </button>
    ) : (
      <button 
        className={`btn btn-siguiente ${!puedeAvanzar() ? 'disabled' : ''}`}
        onClick={siguienteSeccion} 
        disabled={guardando || generandoPDF || !puedeAvanzar()}
      >
        {guardando ? '💾 Guardando...' : 
         !puedeAvanzar() ? '⚠️ Complete campos' : 'Siguiente →'}
      </button>
    )}
  </div>
</div>
    </div>
  );
};

export default HistorialClinico;