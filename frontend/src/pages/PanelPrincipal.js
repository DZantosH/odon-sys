// pages/PanelPrincipal.js - CÓDIGO CORREGIDO

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import AgendarCitasSidebar from '../components/AgendarCitasSidebar';
import CalendarioDinamico from '../components/CalendarioDinamico';
import DentalLoading from '../components/DentalLoading';
// ✅ IMPORTACIONES CORREGIDAS
import { 
  CancelCitaModal, 
  CitaCanceladaSuccessModal,
  CitaAgendadaSuccessModal,
  ConsultaModal,
  useModal 
} from '../components/modals/ModalSystem';
import '../css/PanelPrincipal.css';

const PanelPrincipal = () => {
  const navigate = useNavigate();
  const [showAgendarCitas, setShowAgendarCitas] = useState(false);
  const [citasHoy, setCitasHoy] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [showTransitionLoading, setShowTransitionLoading] = useState(false);


  // ✅ HOOK ÚNICO PARA MODAL DE CANCELAR
  const cancelarModal = useModal();

  // ✅ ESTADO PARA MODAL DE ÉXITO DE CITA CANCELADA
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    citaData: {}
  });

  // ✅ ESTADO PARA MODAL DE ÉXITO DE CITA AGENDADA
  const [modalCitaAgendada, setModalCitaAgendada] = useState({
    isOpen: false,
    citaData: {}
  });

  // ✅ ESTADO PARA MODAL DE CONSULTA (CORREGIDO)
  const [consultaModal, setConsultaModal] = useState({
    isOpen: false,
    citaData: {},
    pacienteNombre: ''
  });

  // ✅ AGREGAR DEPENDENCIA A useEffect
  useEffect(() => {
    cargarDatosDashboard();
  }, []); // Dependencia vacía está bien aquí

  // FUNCIÓN PARA OBTENER HEADERS DE AUTENTICACIÓN
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const cargarDatosDashboard = async () => {
    await cargarCitasHoy();
  };

  const cargarCitasHoy = async () => {
    try {
      setLoadingCitas(true);
      
      const ahora = new Date();
      const año = ahora.getFullYear();
      const mes = String(ahora.getMonth() + 1).padStart(2, '0');
      const dia = String(ahora.getDate()).padStart(2, '0');
      const fechaHoy = `${año}-${mes}-${dia}`;
      
      console.log('📅 [CITAS HOY] Cargando citas para:', fechaHoy);

      const response = await fetch(`/api/citas/fecha/${fechaHoy}`, {
        headers: getAuthHeaders()
      });
            
      if (response.ok) {
        const result = await response.json();
        let citasData = result.data || result || [];
        
        if (!Array.isArray(citasData)) {
          citasData = [];
        }
        
        // Filtrar citas canceladas y no asistidas del panel
        const citasFiltradas = citasData.filter(cita => {
          return cita.estado !== 'Cancelada' && cita.estado !== 'No_Asistio';
        });
        
        console.log('✅ [CITAS HOY] Citas válidas para mostrar en panel:', citasFiltradas.length);
        setCitasHoy(citasFiltradas);
      } else {
        console.error('❌ [CITAS HOY] Error al cargar citas:', response.status);
        setCitasHoy([]);
      }
    } catch (error) {
      console.error('❌ [CITAS HOY] Error:', error);
      setCitasHoy([]);
    } finally {
      setLoadingCitas(false);
    }
  };

  const handleAgendarCita = () => {
    setShowAgendarCitas(true);
  };

  const handleCerrarSidebar = () => {
    setShowAgendarCitas(false);
  };

  // ✅ FUNCIÓN ACTUALIZADA PARA MANEJAR CITA AGENDADA
  const handleCitaAgendada = (citaData) => {
    // Recargar dashboard
    cargarDatosDashboard();
      
    // Preparar datos para el modal
    if (citaData) {
      console.log('📅 [CITA AGENDADA] Cita creada exitosamente');
      
      // ✅ MOSTRAR MODAL SIMPLE DESPUÉS DE UN PEQUEÑO DELAY
      setTimeout(() => {
        setModalCitaAgendada({
          isOpen: true,
          citaData: {} // No necesitamos pasar datos específicos
        });
      }, 500); // Delay para que se cierre el sidebar primero
    }
  };

  // FUNCIÓN PARA ABRIR MODAL DE CANCELAR CITA
  const handleCancelarCita = (cita) => {
    console.log('🗑️ Abriendo modal para cancelar cita:', cita);
    cancelarModal.openModal({
      citaId: cita.id,
      pacienteNombre: cita.paciente_nombre_completo || 
                     `${cita.paciente_nombre || ''} ${cita.paciente_apellido || ''}`.trim() ||
                     cita.nombre_paciente || 'Paciente',
      fechaCita: cita.fecha_cita,
      horaCita: cita.hora_cita,
      tipoCita: cita.tipo_consulta_nombre || cita.tipo_consulta || 'Consulta',
      precio: cita.precio
    });
  };

  // FUNCIÓN PARA CONFIRMAR CANCELACIÓN DE CITA
  const confirmarCancelarCita = async () => {
    try {
      const { citaId, pacienteNombre } = cancelarModal.modalData;
      
      console.log('🗑️ Cancelando cita ID:', citaId, 'Paciente:', pacienteNombre);
      
      // Llamar al endpoint para cancelar la cita
      const response = await fetch(`/api/citas/${citaId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        console.log('✅ Cita cancelada exitosamente');
        
        // ✅ MOSTRAR MODAL DE ÉXITO
        setSuccessModal({
          isOpen: true,
          citaData: {
            pacienteNombre: pacienteNombre,
            fechaCita: cancelarModal.modalData.fechaCita,
            horaCita: cancelarModal.modalData.horaCita
          }
        });
        
        // Recargar las citas
        cargarDatosDashboard();
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cancelar la cita');
      }
      
    } catch (error) {
      console.error('❌ Error al cancelar cita:', error);
      alert(`❌ Error al cancelar la cita\n\nDetalles: ${error.message}`);
    }
  };

  // FUNCIÓN PARA CERRAR MODAL DE ÉXITO DE CITA CANCELADA
  const handleCloseSuccessModal = () => {
    setSuccessModal({
      isOpen: false,
      citaData: {}
    });
  };

  // ✅ FUNCIÓN PARA CERRAR MODAL DE ÉXITO DE CITA AGENDADA
  const handleCloseModalCitaAgendada = () => {
    setModalCitaAgendada({
      isOpen: false,
      citaData: {}
    });
  };

  // ✅ FUNCIÓN ACTUALIZADA PARA INICIAR CONSULTA CON MODAL
  const handleIniciarConsulta = async (cita) => {
    try {
      console.log('🩺 [INICIAR CONSULTA] ===========================');
      
      // Actualizar estado de la cita
      const response = await fetch(`/api/citas/${cita.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          estado: 'En_Proceso',
          notas: `Paciente llegó - Consulta iniciada el ${new Date().toLocaleString('es-MX')}`
        })
      });

      if (response.ok) {
        console.log('✅ Estado de cita actualizado a En_Proceso');
        
        // Recargar citas para mostrar el cambio
        cargarDatosDashboard();
        
        const pacienteNombre = cita.paciente_nombre_completo || 
                             `${cita.paciente_nombre || ''} ${cita.paciente_apellido || ''}`.trim() ||
                             cita.nombre_paciente || 'Paciente';
        
        console.log('👤 Nombre del paciente:', pacienteNombre);
        
        // ✅ MOSTRAR MODAL DE CONSULTA EN LUGAR DE CONFIRM NATIVO
        setConsultaModal({
          isOpen: true,
          citaData: cita,
          pacienteNombre: pacienteNombre
        });
        
      } else {
        throw new Error('Error al actualizar estado de la cita');
      }
    } catch (error) {
      console.error('❌ Error al iniciar consulta:', error);
      alert('❌ Error al iniciar la consulta. Intente nuevamente.');
    }
  };

 // ✅ FUNCIÓN MODIFICADA PARA CONFIRMAR IR AL HISTORIAL CON LOADING DENTAL
  const handleConfirmarIrHistorial = () => {
    const { citaData } = consultaModal;
    
    console.log('🦷 Iniciando transición con loading dental...');
    
    // Cerrar modal de consulta
    setConsultaModal({
      isOpen: false,
      citaData: {},
      pacienteNombre: ''
    });
    
    // ✅ MOSTRAR LOADING DENTAL DURANTE TRANSICIÓN
    setShowTransitionLoading(true);
    
    // Preparar datos del paciente
    const pacienteData = {
      id: citaData.paciente_id,
      nombre: citaData.paciente_nombre || '',
      apellido_paterno: citaData.paciente_apellido || citaData.paciente_apellido_paterno || '',
      apellido_materno: citaData.paciente_apellido_materno || '',
      telefono: citaData.paciente_telefono || '',
      correo_electronico: citaData.paciente_email || ''
    };
    
    // ✅ NAVEGAR DESPUÉS DEL LOADING DENTAL
    setTimeout(() => {
  console.log('🎯 Navegando a historial con consulta activa...');
  
  navigate(`/pacientes/${citaData.paciente_id}/historial`, {
    state: {
      paciente: pacienteData,
      origen: 'citas-del-dia',
      vistaInicial: 'consulta-actual',
      consultaIniciada: true,
      citaId: citaData.id,
      cita: citaData,
      timestamp: Date.now()
    }
  });
  
  // ✅ MOVER ESTA LÍNEA DESPUÉS DE LA NAVEGACIÓN
  setTimeout(() => {
    setShowTransitionLoading(false);
  }, 500);
  
  console.log('✅ Navegación ejecutada correctamente');
}, 3000);
  };

  // ✅ FUNCIÓN PARA COMPLETAR LOADING DE TRANSICIÓN
  const handleTransitionLoadingComplete = () => {
    setShowTransitionLoading(false);
  };


  // ✅ FUNCIÓN PARA CERRAR MODAL DE CONSULTA
  const handleCerrarConsultaModal = () => {
    setConsultaModal({
      isOpen: false,
      citaData: {},
      pacienteNombre: ''
    });
  };

  // FUNCIÓN PARA CONTINUAR CONSULTA
  const handleContinuarConsulta = (cita) => {
    console.log('🔄 [CONTINUAR CONSULTA] ===========================');
    console.log('📋 Cita:', cita);
    
    const pacienteData = {
      id: cita.paciente_id,
      nombre: cita.paciente_nombre || '',
      apellido_paterno: cita.paciente_apellido || cita.paciente_apellido_paterno || '',
      apellido_materno: cita.paciente_apellido_materno || '',
      telefono: cita.paciente_telefono || '',
      correo_electronico: cita.paciente_email || ''
    };
    
    console.log('🎯 Navegando para continuar consulta...');
    
    navigate(`/pacientes/${cita.paciente_id}/historial`, {
      state: {
        paciente: pacienteData,
        origen: 'citas-del-dia',
        vistaInicial: 'consulta-actual',
        consultaEnProceso: true,
        citaId: cita.id,
        cita: cita,
        timestamp: Date.now()
      }
    });
  };

  const getEstadoIcon = (estado) => {
    const iconos = {
      'Programada': '⏳',
      'Confirmada': '✅',
      'Completada': '🟢',
      'Cancelada': '❌',
      'En_Proceso': '🔄',
      'No_Asistio': '⭕',
      'Reagendada': '📅'
    };
    return iconos[estado] || '📅';
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'Programada': '#f59e0b',
      'Confirmada': '#3b82f6',
      'Completada': '#10b981',
      'Cancelada': '#ef4444',
      'En_Proceso': '#8b5cf6',
      'No_Asistio': '#6b7280',
      'Reagendada': '#8b5cf6'
    };
    return colores[estado] || '#6b7280';
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.slice(0, 5);
  };

  return (
    <>
    {/* ✅ LOADING DENTAL PARA TRANSICIÓN A CONSULTA */}
      {showTransitionLoading && (
        <DentalLoading
          isLoading={showTransitionLoading}
          message="Iniciando consulta odontológica"
          submessage={`Preparando historial de ${consultaModal.pacienteNombre}`}
          duration={3000}
          onComplete={handleTransitionLoadingComplete}
        />
      )}

      <div className="panel-principal-wrapper">
        <Navbar />

        <div className="panel-principal-container">
          {/* Barra de Navegación Rápida */}
          <div className="quick-navigation">
            <div className="nav-actions">
              <Link to="/pacientes" className="nav-action-card">
                <div className="nav-action-icon">👥</div>
                <div className="nav-action-content">
                  <span className="nav-action-title">Pacientes</span>
                  <span className="nav-action-subtitle">Gestionar pacientes</span>
                </div>
              </Link>
              
              <button onClick={handleAgendarCita} className="nav-action-card">
                <div className="nav-action-icon">📅</div>
                <div className="nav-action-content">
                  <span className="nav-action-title">Agendar Cita</span>
                  <span className="nav-action-subtitle">Nueva cita</span>
                </div>
              </button>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="main-content">
            <div className="panels-row">
              {/* Panel de Citas de Hoy */}
              <div className="content-panel citas-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <span className="panel-icon">🗓️</span>
                    <span>Citas de Hoy</span>
                  </div>
                  <div className="panel-actions">
                    <button 
                      onClick={cargarCitasHoy} 
                      className="refresh-btn"
                      title="Actualizar citas"
                    >
                      <span>🔄</span>
                    </button>
                  </div>
                </div>
                
                <div className="panel-content">
                  {loadingCitas ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p className="loading-text">Cargando citas del día...</p>
                    </div>
                  ) : citasHoy.length > 0 ? (
                    <div className="citas-list">
                      {citasHoy.map((cita) => (
                        <div key={cita.id} className="cita-card">
                          <div className="cita-time">
                            <span className="time-text">{formatTime(cita.hora_cita)}</span>
                          </div>
                          
                          <div className="cita-info">
                            <div className="cita-patient">
                              <span className="patient-name">
                                {cita.paciente_nombre_completo || 
                                 `${cita.paciente_nombre || ''} ${cita.paciente_apellido || ''}`.trim() ||
                                 cita.nombre_paciente ||
                                 'Paciente no especificado'}
                              </span>
                              <span className="cita-type">
                                {cita.tipo_consulta_nombre || cita.tipo_consulta || cita.tipo_cita || 'Consulta'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="cita-status">
                            <span 
                              className="status-badge"
                              style={{ 
                                backgroundColor: `${getEstadoColor(cita.estado)}20`,
                                color: getEstadoColor(cita.estado),
                                border: `1px solid ${getEstadoColor(cita.estado)}40`
                              }}
                            >
                              {getEstadoIcon(cita.estado)} {cita.estado}
                            </span>
                          </div>
                          
                          <div className="cita-actions">
                            {/* BOTÓN CANCELAR CITA */}
                            <button 
                              className="action-btn action-btn-delete" 
                              title="Cancelar cita"
                              onClick={() => handleCancelarCita(cita)}
                              style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                border: 'none'
                              }}
                            >
                              <span>🗑️</span>
                            </button>
                            
                            {/* BOTONES DE CONSULTA */}
                            {cita.estado === 'Programada' || cita.estado === 'Confirmada' ? (
                              <button 
                                className="action-btn action-btn-start" 
                                title="Paciente llegó - Iniciar consulta"
                                onClick={() => handleIniciarConsulta(cita)}
                                style={{
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: 'white',
                                  border: 'none'
                                }}
                              >
                                <span>👤</span>
                              </button>
                            ) : cita.estado === 'En_Proceso' ? (
                              <button 
                                className="action-btn action-btn-continue" 
                                title="Continuar consulta"
                                onClick={() => handleContinuarConsulta(cita)}
                                style={{
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                  color: 'white',
                                  border: 'none'
                                }}
                              >
                                <span>🩺</span>
                              </button>
                            ) : (
                              <button 
                                className="action-btn action-btn-complete" 
                                title="Consulta completada"
                                disabled
                                style={{
                                  background: '#9ca3af',
                                  color: 'white',
                                  border: 'none',
                                  cursor: 'not-allowed'
                                }}
                              >
                                <span>✅</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">📅</div>
                      <div className="empty-state-title">No hay citas programadas</div>
                      <div className="empty-state-subtitle">
                        Parece que tienes un día libre. ¡Perfecto para ponerte al día!
                      </div>
                      <button 
                        onClick={handleAgendarCita}
                        className="empty-state-action"
                      >
                        <span>➕</span>
                        <span>Agendar Nueva Cita</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel del Calendario */}
              <div className="content-panel calendar-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <span className="panel-icon">📆</span>
                    <span>Calendario</span>
                  </div>
                  <div className="panel-actions">
                    <button 
                      onClick={() => window.location.reload()} 
                      className="refresh-btn"
                      title="Actualizar calendario"
                    >
                      <span>🔄</span>
                    </button>
                  </div>
                </div>
                
                <div className="panel-content">
                  <div className="calendar-content">
                    <CalendarioDinamico />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar para agendar citas */}
          <AgendarCitasSidebar 
            isOpen={showAgendarCitas}
            onClose={handleCerrarSidebar}
            onCitaCreated={handleCitaAgendada}
          />
        </div>
      </div>

      {/* MODAL PARA CANCELAR CITAS */}
      <CancelCitaModal
        isOpen={cancelarModal.isOpen}
        onClose={cancelarModal.closeModal}
        onConfirm={confirmarCancelarCita}
        citaData={cancelarModal.modalData}
      />

      {/* MODAL DE ÉXITO PARA CITA CANCELADA */}
      <CitaCanceladaSuccessModal
        isOpen={successModal.isOpen}
        onClose={handleCloseSuccessModal}
        citaData={successModal.citaData}
        autoClose={true}
        autoCloseDelay={4000}
      />

      {/* 🎉 MODAL SIMPLE DE ÉXITO PARA CITA AGENDADA */}
      <CitaAgendadaSuccessModal
        isOpen={modalCitaAgendada.isOpen}
        onClose={handleCloseModalCitaAgendada}
        autoClose={true}
        autoCloseDelay={3000}
      />

      {/* ✅ MODAL DE CONSULTA - POSICIÓN SUPERIOR IZQUIERDA */}
      <ConsultaModal
        isOpen={consultaModal.isOpen}
        onClose={handleCerrarConsultaModal}
        onConfirm={handleConfirmarIrHistorial}
        title={`Consulta iniciada para ${consultaModal.pacienteNombre}`}
        message="¿Desea ir al historial clínico para continuar con la consulta?"
        confirmText="Aceptar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default PanelPrincipal;