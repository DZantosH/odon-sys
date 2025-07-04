import React, { useState, useEffect } from 'react';
import '../../css/ConsultaActual.css';


const ConsultaActual = ({ 
  paciente, 
  user, 
  buildApiUrl, 
  getAuthHeaders, 
  mostrarConfirmacion,
  onConsultaFinalizada 
}) => {
  const [consultaData, setConsultaData] = useState({
    motivo_consulta: '',
    diagnostico: '',
    tratamiento: '',
    precio: 0.00 // 🆕 NUEVO CAMPO DE PRECIO
  });

  const [loading, setLoading] = useState(false);
  const [consultaEnProceso, setConsultaEnProceso] = useState(false);
  const [citaActual, setCitaActual] = useState(null);
  const [esConsultaEmergencia, setEsConsultaEmergencia] = useState(false);

  // Verificar si hay una cita en proceso hoy
useEffect(() => {
  verificarCitaEnProceso(); // ✅ Nombre consistente
}, [paciente?.id]);

const verificarCitaEnProceso = async () => {
  try {
    if (!paciente?.id) return;

    const hoy = new Date().toISOString().split('T')[0];
    const response = await fetch(buildApiUrl(`/citas?paciente_id=${paciente.id}&fecha=${hoy}`), {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      const citasHoy = data.data || data.citas || data;
      
      const citaEnProceso = citasHoy.find(cita => 
        ['Confirmada', 'En_Proceso'].includes(cita.estado)
      );

      if (citaEnProceso) {
        setCitaActual(citaEnProceso);
        setConsultaEnProceso(citaEnProceso.estado === 'En_Proceso');
        
        // ✅ SOLUCIÓN ENCONTRADA: Usar tipo_cita que contiene "Consulta General"
        const motivoConsulta = citaEnProceso.tipo_cita || 
                              citaEnProceso.tipo_consulta_descripcion || 
                              citaEnProceso.tipo_consulta ||
                              citaEnProceso.observaciones || 
                              'Consulta General';
        
        console.log('✅ Motivo de consulta encontrado:', motivoConsulta);
        console.log('📋 Campo usado: tipo_cita =', citaEnProceso.tipo_cita);
        
        // Cargar datos completos
        setConsultaData(prev => ({
          ...prev,
          motivo_consulta: motivoConsulta,
          precio: parseFloat(citaEnProceso.precio || 0)
        }));

        console.log('💰 Precio cargado:', parseFloat(citaEnProceso.precio || 0));
        console.log('🩺 Datos de consulta establecidos:', {
          motivo: motivoConsulta,
          precio: parseFloat(citaEnProceso.precio || 0)
        });
      }
    }
  } catch (error) {
    console.error('Error al verificar cita en proceso:', error);
  }
};

// Si el problema persiste, agrega este console.log para debuggear:
console.log('Datos de consulta actuales:', consultaData);
console.log('Motivo de consulta:', consultaData.motivo_consulta);
console.log('Cita actual:', citaActual);

  const handleInputChange = (field, value) => {
    setConsultaData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🆕 FUNCIÓN ESPECÍFICA PARA MANEJAR EL PRECIO
  const handlePrecioChange = (value) => {
    // Convertir a número y validar que sea positivo
    const precio = parseFloat(value) || 0;
    setConsultaData(prev => ({
      ...prev,
      precio: Math.max(0, precio) // No permitir precios negativos
    }));
  };

  const iniciarConsulta = async () => {
    try {
      if (citaActual) {
        // Cambiar estado de cita a "En_Proceso"
        await fetch(buildApiUrl(`/citas/${citaActual.id}/estado`), {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ estado: 'En_Proceso' })
        });
      }

      setConsultaEnProceso(true);
      
      await mostrarConfirmacion({
        type: 'success',
        title: '🩺 Consulta Iniciada',
        message: 'La consulta ha comenzado. Puedes registrar la información del paciente.',
        confirmText: 'Entendido',
        showCancel: false
      });

    } catch (error) {
      console.error('Error al iniciar consulta:', error);
      await mostrarConfirmacion({
        type: 'error',
        title: '❌ Error',
        message: 'No se pudo iniciar la consulta. Intenta nuevamente.',
        confirmText: 'Entendido',
        showCancel: false
      });
    }
  };

  const iniciarConsultaEmergencia = () => {
    console.log('🚨 Iniciando consulta de emergencia...');
    setEsConsultaEmergencia(true);
    setConsultaEnProceso(true);
    setConsultaData({
      motivo_consulta: '',
      diagnostico: '',
      tratamiento: '',
      precio: 500.00 // 🆕 PRECIO DEFAULT PARA EMERGENCIAS
    });
  };

  const finalizarConsulta = async () => {
    // Validaciones básicas
    if (!consultaData.diagnostico.trim()) {
      await mostrarConfirmacion({
        type: 'warning',
        title: '⚠️ Diagnóstico Requerido',
        message: 'Es necesario ingresar un diagnóstico para finalizar la consulta.',
        confirmText: 'Entendido',
        showCancel: false
      });
      return;
    }

    if (!consultaData.tratamiento.trim()) {
      await mostrarConfirmacion({
        type: 'warning',
        title: '⚠️ Tratamiento Requerido',
        message: 'Es necesario ingresar el tratamiento para finalizar la consulta.',
        confirmText: 'Entendido',
        showCancel: false
      });
      return;
    }

    // 🆕 VALIDACIÓN DE PRECIO
    if (consultaData.precio < 0) {
      await mostrarConfirmacion({
        type: 'warning',
        title: '⚠️ Precio Inválido',
        message: 'El precio no puede ser negativo. Ingresa un precio válido.',
        confirmText: 'Entendido',
        showCancel: false
      });
      return;
    }

    // Confirmar finalización con detalles del precio
    const confirmacion = await mostrarConfirmacion({
      type: 'question',
      title: '🏁 Finalizar Consulta',
      message: '¿Estás seguro de que deseas finalizar esta consulta? Esta acción no se puede deshacer.',
      details: {
        paciente: `${paciente.nombre} ${paciente.apellido_paterno}`,
        precio: `$${consultaData.precio.toFixed(2)}`,
        tipo: esConsultaEmergencia ? 'Consulta de Emergencia' : 'Consulta Programada',
        fecha: new Date().toLocaleDateString('es-MX')
      },
      confirmText: 'Sí, Finalizar',
      cancelText: 'Continuar Editando',
      showCancel: true
    });

    if (!confirmacion) return;

    try {
      setLoading(true);

      // Si es consulta de emergencia, crear cita primero
      let citaParaHistorial = citaActual;
      
      if (esConsultaEmergencia && !citaActual) {
        const citaEmergencia = {
          paciente_id: paciente.id,
          doctor_id: user.id,
          fecha_cita: new Date().toISOString().split('T')[0],
          hora_cita: new Date().toTimeString().substring(0, 5),
          tipo_cita: 'Emergencia',
          tipo_consulta: 'Consulta de Emergencia',
          estado: 'Completada',
          observaciones: consultaData.motivo_consulta || 'Consulta de emergencia',
          precio: consultaData.precio, // 🆕 INCLUIR PRECIO EN LA CITA
          motivo_consulta: consultaData.motivo_consulta, // 🆕 DATOS CLÍNICOS EN LA CITA
          diagnostico: consultaData.diagnostico,
          tratamiento: consultaData.tratamiento
        };

        const citaResponse = await fetch(buildApiUrl('/citas'), {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(citaEmergencia)
        });

        if (citaResponse.ok) {
          citaParaHistorial = await citaResponse.json();
        }
      } else if (citaActual) {
        // 🆕 ACTUALIZAR CITA EXISTENTE CON DATOS CLÍNICOS Y PRECIO
        const actualizacionCita = {
          estado: 'Completada',
          precio: consultaData.precio,
          motivo_consulta: consultaData.motivo_consulta,
          diagnostico: consultaData.diagnostico,
          tratamiento: consultaData.tratamiento
        };

        await fetch(buildApiUrl(`/citas/${citaActual.id}`), {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(actualizacionCita)
        });
      }

      // Guardar historial clínico
      const historialData = {
        paciente_id: paciente.id,
        doctor_id: user.id,
        cita_id: citaParaHistorial?.id || null,
        fecha_consulta: new Date().toISOString().split('T')[0],
        estado: 'completado',
        datos_personales: JSON.stringify({
          nombre_completo: `${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}`.trim(),
          fecha_nacimiento: paciente.fecha_nacimiento,
          lugar_nacimiento: paciente.lugar_nacimiento || 'No especificado',
          creado_en_desarrollo: true
        }),
        ficha_identificacion: JSON.stringify({
          edad: paciente.edad || Math.floor((new Date() - new Date(paciente.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000)),
          sexo: paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : paciente.sexo,
          estado_civil: 'No especificado',
          ocupacion: 'No especificado'
        }),
        motivo_consulta: JSON.stringify({
          descripcion: consultaData.motivo_consulta || 'Consulta general',
          dolor: false,
          urgencia: esConsultaEmergencia ? 'emergencia' : 'normal',
          duracion: 'No especificada'
        }),
        diagnostico: consultaData.diagnostico,
        tratamiento: consultaData.tratamiento,
        precio_consulta: consultaData.precio, // 🆕 GUARDAR PRECIO EN HISTORIAL
        creado_por: user.id,
        actualizado_por: user.id,
        ip_creacion: '127.0.0.1',
        user_agent: 'Sistema-Consulta-Actual'
      };

      const historialResponse = await fetch(buildApiUrl('/historiales-clinicos'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(historialData)
      });

      if (!historialResponse.ok) {
        const errorData = await historialResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar historial clínico');
      }

      // Limpiar formulario y estados
      setConsultaData({
        motivo_consulta: '',
        diagnostico: '',
        tratamiento: '',
        precio: 0.00
      });

      setConsultaEnProceso(false);
      setCitaActual(null);
      setEsConsultaEmergencia(false);

      await mostrarConfirmacion({
        type: 'success',
        title: '✅ Consulta Finalizada',
        message: 'La consulta se ha guardado exitosamente en el historial clínico del paciente.',
        details: {
          fecha: new Date().toLocaleDateString('es-MX'),
          diagnostico: consultaData.diagnostico,
          tratamiento: consultaData.tratamiento,
          precio: `$${consultaData.precio.toFixed(2)}`,
          tipo: esConsultaEmergencia ? 'Consulta de Emergencia' : 'Consulta Programada'
        },
        confirmText: 'Perfecto',
        showCancel: false
      });

      // Callback para actualizar datos en el componente padre
      if (onConsultaFinalizada) {
        onConsultaFinalizada();
      }

    } catch (error) {
      console.error('Error al finalizar consulta:', error);
      await mostrarConfirmacion({
        type: 'error',
        title: '❌ Error al Finalizar',
        message: `No se pudo guardar la consulta: ${error.message}`,
        confirmText: 'Entendido',
        showCancel: false
      });
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return '';
    return hora.substring(0, 5);
  };

  // Estado: Sin cita programada
  if (!citaActual && !consultaEnProceso) {
    return (
      <div className="consulta-actual-container">
        <div className="consulta-header-compacto">
          <div className="titulo-consulta">
            <span className="icono-estado">🕐</span>
            Esperando Paciente
          </div>
          <div className="fecha-consulta">
            {formatearFecha(new Date())}
          </div>
        </div>

        <div className="contenido-consulta">
          <div className="sin-consulta">
            <div className="icono-consulta">⏰</div>
            <h3>Sin Consulta Activa</h3>
            <p>No hay una consulta en proceso en este momento. Puedes verificar si hay citas programadas o iniciar una consulta de emergencia.</p>
            
            <div className="acciones-sin-consulta">
              <button 
                onClick={verificarCitaEnProceso}
                className="btn-secundario"
              >
                🔄 Verificar Citas
              </button>
              <button 
                onClick={iniciarConsultaEmergencia}
                className="btn-primario"
              >
                🚨 Consulta de Emergencia
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Cita confirmada pero consulta no iniciada
  if (citaActual && !consultaEnProceso) {
    return (
      <div className="consulta-actual-container">
        <div className="consulta-header-compacto">
          <div className="titulo-consulta">
            <span className="icono-estado">📋</span>
            Consulta Programada
          </div>
          <div className="badges-estado">
            <span className="fecha-consulta">
              {formatearFecha(citaActual.fecha_cita)} - {formatearHora(citaActual.hora_cita)}
            </span>
          </div>
        </div>

        <div className="contenido-consulta">
          <div className="cita-pendiente">
            <div className="info-cita">
              <h3>📋 Información de la Cita</h3>
              <div className="detalles-cita">
                <div className="detalle-item">
                  <strong>🩺 Tipo de Consulta</strong>
                  <span>{citaActual.tipo_cita || 'Consulta General'}</span>
                </div>
                <div className="detalle-item">
                  <strong>💰 Costo</strong>
                  <span>${parseFloat(citaActual.precio || 0).toFixed(2)}</span>
                </div>
                {citaActual.observaciones && (
                  <div className="detalle-item">
                    <strong>📝 Motivo de la Cita</strong>
                    <span>{citaActual.observaciones}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="acciones-cita">
              <button 
                onClick={iniciarConsulta}
                className="btn-iniciar-consulta"
              >
                ▶️ Iniciar Consulta
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Consulta en proceso (programada o emergencia)
  return (
    <div className="consulta-actual-container">
      <div className="consulta-header-compacto">
        <div className="titulo-consulta">
          <span className="icono-estado">🩺</span>
          Consulta en Proceso
        </div>
        <div className="badges-estado">
          <span className="badge-activo">🟢 En Consulta</span>
          {esConsultaEmergencia && <span className="badge-emergencia">🚨 EMERGENCIA</span>}
          <span className="precio-actual">💰 ${consultaData.precio.toFixed(2)}</span>
          <span className="fecha-consulta">
            {formatearFecha(new Date())}
          </span>
        </div>
      </div>

      <div className="contenido-consulta">
        <div className="formulario-consulta-pantalla-completa">
          <form onSubmit={(e) => e.preventDefault()}>
            
        {/* Motivo de Consulta - SECCIÓN CORREGIDA */}
<div className="campo-consulta">
  <label htmlFor="motivo">
    <span className="icono-campo">🗣️</span>
    Motivo de Consulta
  </label>
  
  {/* MOSTRAR EL VALOR CORRECTO */}
  <div className="motivo-consulta-display">
    {consultaData.motivo_consulta ? (
      <div className="motivo-texto">
        {consultaData.motivo_consulta}
      </div>
    ) : (
      <div className="motivo-placeholder">
        No se ha especificado motivo de consulta
      </div>
    )}
  </div>

  {/* TEXTAREA PARA EDITAR (si es necesario) */}
  <textarea
    id="motivo"
    value={consultaData.motivo_consulta}
    onChange={(e) => handleInputChange('motivo_consulta', e.target.value)}
    placeholder={esConsultaEmergencia 
      ? "¿Por qué vino el paciente sin cita? (dolor urgente, emergencia dental, accidente, etc.)" 
      : "Motivo por el cual el paciente programó esta consulta..."
    }
    rows="4"
    className="textarea-consulta"
  />
</div>

            {/* Diagnóstico */}
            <div className="campo-consulta">
              <label htmlFor="diagnostico">
                <span className="icono-campo">🔍</span>
                Diagnóstico *
              </label>
              <textarea
                id="diagnostico"
                value={consultaData.diagnostico}
                onChange={(e) => handleInputChange('diagnostico', e.target.value)}
                placeholder="Diagnóstico médico odontológico basado en la evaluación clínica del paciente..."
                rows="5"
                className="textarea-consulta"
                required
              />
            </div>

            {/* Tratamiento */}
            <div className="campo-consulta">
              <label htmlFor="tratamiento">
                <span className="icono-campo">💊</span>
                Tratamiento *
              </label>
              <textarea
                id="tratamiento"
                value={consultaData.tratamiento}
                onChange={(e) => handleInputChange('tratamiento', e.target.value)}
                placeholder="Tratamiento indicado: procedimientos realizados, medicamentos recetados, cuidados especiales, recomendaciones..."
                rows="5"
                className="textarea-consulta"
                required
              />
            </div>

            {/* 🆕 CAMPO DE PRECIO */}
            <div className="campo-consulta campo-precio">
              <label htmlFor="precio">
                <span className="icono-campo">💰</span>
                Precio de la Consulta
                {esConsultaEmergencia && <span className="etiqueta-emergencia">*</span>}
              </label>
              <div className="input-precio-container">
                <span className="simbolo-peso">$</span>
                <input
                  type="number"
                  id="precio"
                  value={consultaData.precio}
                  onChange={(e) => handlePrecioChange(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="input-precio"
                />
                <div className="precio-sugerencias">
                  {esConsultaEmergencia ? (
                    <>
                      <button type="button" onClick={() => handlePrecioChange(300)} className="btn-precio-sugerencia">$300</button>
                      <button type="button" onClick={() => handlePrecioChange(500)} className="btn-precio-sugerencia">$500</button>
                      <button type="button" onClick={() => handlePrecioChange(800)} className="btn-precio-sugerencia">$800</button>
                      <button type="button" onClick={() => handlePrecioChange(1000)} className="btn-precio-sugerencia">$1000</button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => handlePrecioChange(200)} className="btn-precio-sugerencia">$200</button>
                      <button type="button" onClick={() => handlePrecioChange(350)} className="btn-precio-sugerencia">$350</button>
                      <button type="button" onClick={() => handlePrecioChange(500)} className="btn-precio-sugerencia">$500</button>
                      <button type="button" onClick={() => handlePrecioChange(750)} className="btn-precio-sugerencia">$750</button>
                    </>
                  )}
                </div>
              </div>
              <small className="precio-ayuda">
                {esConsultaEmergencia 
                  ? "Ajusta el precio según la complejidad de la emergencia" 
                  : "Puedes modificar el precio original de la cita si es necesario"
                }
              </small>
            </div>

          </form>

          {/* Acciones */}
          <div className="acciones-consulta-simple">
            <button 
              onClick={finalizarConsulta}
              className={`btn-finalizar-grande ${loading ? 'loading' : ''}`}
              disabled={loading || !consultaData.diagnostico.trim() || !consultaData.tratamiento.trim()}
            >
              {loading ? '⏳ Guardando...' : `🏁 Finalizar Consulta - $${consultaData.precio.toFixed(2)}`}
            </button>
          </div>

          {/* Indicadores de campos requeridos */}
          <div className="campos-requeridos">
            <small>* Diagnóstico y Tratamiento son requeridos para finalizar la consulta</small>
            {esConsultaEmergencia && <small>* Para emergencias, ajusta el precio según la complejidad</small>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultaActual;