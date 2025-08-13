// pages/PanelPrincipal.js - CÓDIGO CORREGIDO CON BOTÓN REPROGRAMAR

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import AgendarCitasSidebar from '../components/AgendarCitasSidebar';
import CalendarioDinamico from '../components/CalendarioDinamico';
import DentalLoading from '../components/DentalLoading';
import ReagendarCita from '../components/ReagendarCita'; // ✅ NUEVO IMPORT
import { useAuth } from '../services/AuthContext';
import { esAdministrador } from '../utils/horarioUtils';
import {
  ConfirmModal,
  EstadoActualizadoModal,
  SuccessNotificationModal,
  CitaCanceladaSuccessModal,
  CitaAgendadaSuccessModal,
  useModal,
  useSuccessNotification
} from '../components/modals/ModalSystem';
import {
  CancelCitaModal,
  ConsultaModal,
  useAlerta
} from '../components/modals/AlertaSystem';
import '../css/PanelPrincipal.css';

const PanelPrincipal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAgendarCitas, setShowAgendarCitas] = useState(false);
  
  // ✅ NUEVO ESTADO PARA MODAL DE REAGENDAR
  const [showReagendarCita, setShowReagendarCita] = useState(false);
  const [citaParaReagendar, setCitaParaReagendar] = useState(null);
  
  const [citasHoy, setCitasHoy] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [showTransitionLoading, setShowTransitionLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const cancelarModal = useModal();

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    citaData: {}
  });

  const [modalCitaAgendada, setModalCitaAgendada] = useState({
    isOpen: false,
    citaData: {}
  });

  const [consultaModal, setConsultaModal] = useState({
    isOpen: false,
    citaData: {},
    pacienteNombre: ''
  });

  // ✅ VERIFICAR SI ES ADMINISTRADOR
  useEffect(() => {
    const verificarRolAdmin = () => {
      try {
        const esAdminUtil = esAdministrador();
        const rolUsuario = user?.rol || user?.role || user?.tipo_usuario || '';
        const esAdminContext = rolUsuario.toLowerCase() === 'administrador' || 
                              rolUsuario.toLowerCase() === 'admin';
        const esAdminFinal = esAdminUtil || esAdminContext;
        
        console.log('🔍 [VERIFICACIÓN ADMIN] ===========================');
        console.log('👤 Usuario actual:', user?.nombre || 'N/A');
        console.log('🏷️ Rol del usuario:', rolUsuario);
        console.log('✅ Es admin (util):', esAdminUtil);
        console.log('✅ Es admin (context):', esAdminContext);
        console.log('🎯 Es admin (final):', esAdminFinal);
        console.log('===============================================');
        
        setIsAdmin(esAdminFinal);
        
      } catch (error) {
        console.error('❌ Error verificando rol de administrador:', error);
        setIsAdmin(false);
      }
    };

    verificarRolAdmin();
  }, [user]);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

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

  // ✅ NUEVA FUNCIÓN PARA ABRIR MODAL DE REAGENDAR
  const handleReagendarCita = (cita) => {
    console.log('🔄 [REAGENDAR CITA] ===========================');
    console.log('📋 Cita a reagendar:', cita);
    
    setCitaParaReagendar(cita);
    setShowReagendarCita(true);
  };

  // ✅ NUEVA FUNCIÓN PARA CERRAR MODAL DE REAGENDAR
  const handleCerrarReagendar = () => {
    setShowReagendarCita(false);
    setCitaParaReagendar(null);
  };

  // ✅ NUEVA FUNCIÓN PARA MANEJAR CITA REAGENDADA EXITOSAMENTE
  const handleCitaReagendada = (citaActualizada) => {
    console.log('✅ [CITA REAGENDADA] Cita actualizada exitosamente:', citaActualizada);
    
    // Recargar las citas del día
    cargarDatosDashboard();
    
    // Mostrar modal de éxito
    setModalCitaAgendada({
      isOpen: true,
      citaData: citaActualizada
    });
  };

  const handleAbrirPanelControl = () => {
    console.log('⚙️ [PANEL CONTROL] Abriendo panel administrativo...');
    console.log('👤 Usuario:', user?.nombre);
    console.log('🏷️ Rol:', user?.rol);
    console.log('✅ Es administrador:', isAdmin);
    
    const panelControlUrl = 'http://localhost:3001';
    window.open(panelControlUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCitaAgendada = (citaData) => {
    cargarDatosDashboard();
      
    if (citaData) {
      console.log('📅 [CITA AGENDADA] Cita creada exitosamente');
      
      setTimeout(() => {
        setModalCitaAgendada({
          isOpen: true,
          citaData: {}
        });
      }, 500);
    }
  };

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

  const confirmarCancelarCita = async () => {
    try {
      const { citaId, pacienteNombre } = cancelarModal.modalData;
      
      console.log('🗑️ Cancelando cita ID:', citaId, 'Paciente:', pacienteNombre);
      
      const response = await fetch(`/api/citas/${citaId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        console.log('✅ Cita cancelada exitosamente');
        
        setSuccessModal({
          isOpen: true,
          citaData: {
            pacienteNombre: pacienteNombre,
            fechaCita: cancelarModal.modalData.fechaCita,
            horaCita: cancelarModal.modalData.horaCita
          }
        });
        
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

  const handleCloseSuccessModal = () => {
    setSuccessModal({
      isOpen: false,
      citaData: {}
    });
  };

  const handleCloseModalCitaAgendada = () => {
    setModalCitaAgendada({
      isOpen: false,
      citaData: {}
    });
  };

  const handleIniciarConsulta = async (cita) => {
    try {
      console.log('🩺 [INICIAR CONSULTA] ===========================');
      
      const pacienteNombre = cita.paciente_nombre_completo || 
                           `${cita.paciente_nombre || ''} ${cita.paciente_apellido || ''}`.trim() ||
                           cita.nombre_paciente || 'Paciente';
      
      console.log('👤 Nombre del paciente:', pacienteNombre);
      
      setConsultaModal({
        isOpen: true,
        citaData: cita,
        pacienteNombre: pacienteNombre
      });
      
    } catch (error) {
      console.error('❌ Error al preparar consulta:', error);
      alert('❌ Error al preparar la consulta. Intente nuevamente.');
    }
  };

  const handleConfirmarIrHistorial = async () => {
    const { citaData } = consultaModal;
    
    try {
      console.log('🔄 Actualizando estado de cita a En_Proceso...');
      console.log('📋 Datos de la cita:', citaData);
      
      const response = await fetch(`/api/citas/${citaData.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          estado: 'En_Proceso',
          notas: `Paciente llegó - Consulta iniciada el ${new Date().toLocaleString('es-MX')}`
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado de la cita');
      }

      console.log('✅ Estado de cita actualizado a En_Proceso');
      
      cargarDatosDashboard();
      
      console.log('🦷 Iniciando transición con loading dental...');
      
      setConsultaModal({
        isOpen: false,
        citaData: {},
        pacienteNombre: ''
      });
      
      setShowTransitionLoading(true);
      
      const pacienteData = {
        id: citaData.paciente_id,
        nombre: citaData.paciente_nombre || '',
        apellido_paterno: citaData.paciente_apellido || citaData.paciente_apellido_paterno || '',
        apellido_materno: citaData.paciente_apellido_materno || '',
        telefono: citaData.paciente_telefono || '',
        correo_electronico: citaData.paciente_email || ''
      };
      
      console.log('👤 Datos del paciente preparados:', pacienteData);
      console.log('🔗 URL destino:', `/pacientes/${citaData.paciente_id}/historial`);
      
      setTimeout(() => {
        console.log('🎯 Navegando a historial con consulta activa...');
        
        const navigationState = {
          paciente: pacienteData,
          origen: 'citas-del-dia',
          vistaInicial: 'consulta-actual',
          consultaIniciada: true,
          citaId: citaData.id,
          cita: citaData,
          timestamp: Date.now()
        };
        
        console.log('📦 Estado de navegación:', navigationState);
        
        navigate(`/pacientes/${citaData.paciente_id}/historial`, {
          state: navigationState,
          replace: true
        });
        
        setTimeout(() => {
          setShowTransitionLoading(false);
          console.log('✅ Navegación ejecutada correctamente');
        }, 500);
        
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error al confirmar consulta:', error);
      alert(`❌ Error al iniciar la consulta: ${error.message}`);
      
      setShowTransitionLoading(false);
    }
  };

  const handleTransitionLoadingComplete = () => {
    setShowTransitionLoading(false);
  };

  const handleCerrarConsultaModal = () => {
    console.log('❌ Usuario canceló el inicio de consulta');
    
    setConsultaModal({
      isOpen: false,
      citaData: {},
      pacienteNombre: ''
    });
    
    console.log('✅ Cita mantiene su estado original');
  };

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

              {isAdmin && (
                <button 
                  onClick={handleAbrirPanelControl} 
                  className="nav-action-card nav-action-admin"
                  title="Panel de Control Administrativo (Puerto 3001)"
                >
                  <div className="nav-action-icon">⚙️</div>
                  <div className="nav-action-content">
                    <span className="nav-action-title">Panel de Control</span>
                    <span className="nav-action-subtitle">Administración</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="main-content">
            <div className="panels-row">
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
                            
                            {/* ✅ NUEVO BOTÓN REPROGRAMAR */}
                            <button 
                              className="action-btn action-btn-reschedule" 
                              title="Reprogramar cita"
                              onClick={() => handleReagendarCita(cita)}
                              style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: 'white',
                                border: 'none'
                              }}
                            >
                              <span>🔄</span>
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

          <AgendarCitasSidebar 
            isOpen={showAgendarCitas}
            onClose={handleCerrarSidebar}
            onCitaCreated={handleCitaAgendada}
          />

          {/* ✅ NUEVO COMPONENTE DE REAGENDAR */}
          <ReagendarCita
            isOpen={showReagendarCita}
            onClose={handleCerrarReagendar}
            citaData={citaParaReagendar}
            onCitaReagendada={handleCitaReagendada}
          />
        </div>
      </div>

      <CancelCitaModal
        isOpen={cancelarModal.isOpen}
        onClose={cancelarModal.closeModal}
        onConfirm={confirmarCancelarCita}
        citaData={cancelarModal.modalData}
      />

      <CitaCanceladaSuccessModal
        isOpen={successModal.isOpen}
        onClose={handleCloseSuccessModal}
        citaData={successModal.citaData}
        autoClose={true}
        autoCloseDelay={4000}
      />

      <CitaAgendadaSuccessModal
        isOpen={modalCitaAgendada.isOpen}
        onClose={handleCloseModalCitaAgendada}
        autoClose={true}
        autoCloseDelay={3000}
      />

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