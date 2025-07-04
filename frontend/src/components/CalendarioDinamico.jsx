import React, { useState, useEffect, useCallback } from 'react';
import '../css/PanelPrincipal.css';
import useAutoUpdateCitas from '../hooks/useAutoUpdateCitas';

const CalendarioDinamico = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [citasPorDia, setCitasPorDia] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCitasDelDia, setShowCitasDelDia] = useState(false);
  const [citasDelDiaSeleccionado, setCitasDelDiaSeleccionado] = useState([]);

  // Usar el hook pero solo necesitamos ultimaActualizacion para recargar datos
  const { ultimaActualizacion } = useAutoUpdateCitas();
  
  const monthNames = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  const dayNames = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const buildApiUrlLocal = (endpoint) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const fullUrl = `${baseUrl}${endpoint}`;
    return fullUrl;
  };

  // Función para limpiar observaciones de logs automáticos
  const limpiarObservaciones = (observaciones) => {
    if (!observaciones) return '';
    
    // Filtrar líneas que contienen logs automáticos del sistema
    const lineasLimpias = observaciones
      .split('\n')
      .filter(linea => {
        // Filtrar líneas que contengan patrones de logs automáticos
        const patronesAFiltrar = [
          '[CORRECCIÓN MANUAL]',
          'Estado corregido de',
          'Paciente llegó - Consulta iniciada el',
          '[AUTO-UPDATE]',
          'Cita actualizada automáticamente'
        ];
        
        return !patronesAFiltrar.some(patron => linea.includes(patron));
      })
      .join('\n')
      .trim();
    
    return lineasLimpias;
  };

  const cargarCitasDelMes = useCallback(async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
            
      const response = await fetch(buildApiUrlLocal(`/citas/mes/${year}/${month}`), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();        
        const hoy = new Date();
        const fechaHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const conteosPorDia = {};
        
        data.forEach((cita, index) => {
          const fechaCita = cita.fecha_cita;
          let dia = null;
          let fechaCitaObj = null;
          
          try {
            if (typeof fechaCita === 'string' && fechaCita.includes('-')) {
              const partes = fechaCita.split('-');
              const añoCita = parseInt(partes[0]);
              const mesCita = parseInt(partes[1]);
              const diaCita = parseInt(partes[2]);
              
              fechaCitaObj = new Date(añoCita, mesCita - 1, diaCita);
              
              if (añoCita === year && mesCita === month) {
                dia = diaCita;
              }
            } else if (fechaCita instanceof Date) {
              fechaCitaObj = new Date(fechaCita);
              if (fechaCitaObj.getFullYear() === year && (fechaCitaObj.getMonth() + 1) === month) {
                dia = fechaCitaObj.getDate();
              }
            } else {
              fechaCitaObj = new Date(fechaCita);
              
              if (!isNaN(fechaCitaObj.getTime()) && 
                  fechaCitaObj.getFullYear() === year && 
                  (fechaCitaObj.getMonth() + 1) === month) {
                dia = fechaCitaObj.getDate();
              }
            }
            
            if (dia && !isNaN(dia) && dia >= 1 && dia <= 31 && fechaCitaObj) {
              if (fechaCitaObj >= fechaHoy) {
                conteosPorDia[dia] = (conteosPorDia[dia] || 0) + 1;
              }
            }
            
          } catch (error) {
            console.error('❌ Error parseando fecha:', fechaCita, error);
          }
        });
        
        setCitasPorDia(conteosPorDia);
      } else {
        console.error('❌ Error al cargar citas del mes:', response.status);
        setCitasPorDia({});
      }
    } catch (error) {
      console.error('❌ Error al cargar citas del mes:', error);
      setCitasPorDia({});
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  const cargarCitasDelDia = async (fecha) => {
    try {
      const fechaFormatted = fecha.toISOString().split('T')[0];
      
      const response = await fetch(buildApiUrlLocal(`/citas/fecha/${fechaFormatted}`), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        let citas = result.data || result || [];
        
        // ✅ CAMBIO: Solo filtrar citas de días pasados (no del día actual)
        const ahora = new Date();
        const fechaSeleccionada = new Date(fecha);
        
        // Solo filtrar si la fecha seleccionada es anterior al día de hoy
        if (fechaSeleccionada < new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())) {
          citas = [];
        } else {
          // ✅ NUEVO: Si es hoy o una fecha futura, mostrar TODAS las citas sin filtrar por hora
          // No aplicamos filtro de hora para el calendario - mostramos todas las citas del día
          console.log(`📅 [CALENDARIO] Mostrando todas las citas del ${fechaFormatted}:`, citas.length);
        }
        
        setCitasDelDiaSeleccionado(citas);
      } else {
        setCitasDelDiaSeleccionado([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar citas del día:', error);
      setCitasDelDiaSeleccionado([]);
    }
  };

  useEffect(() => {
    cargarCitasDelMes();
  }, [cargarCitasDelMes, ultimaActualizacion]); // Agregar ultimaActualizacion como dependencia

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendar = [];
    
    dayNames.forEach(day => {
      calendar.push(
        <div key={day} className="modal-calendario-day modal-calendario-header">
          {day}
        </div>
      );
    });
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(
        <div key={`empty-${i}`} className="modal-calendario-day modal-calendario-empty"></div>
      );
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentDay(year, month, day);
      const cantidadCitas = citasPorDia[day] || 0;
      const estadoColor = getEstadoColor(cantidadCitas);
      
      let clases = ['modal-calendario-day', 'modal-calendario-clickable'];
      
      if (isToday) {
        clases.push('modal-calendario-today');
      }
      
      if (estadoColor && estadoColor !== 'modal-calendario-estado-vacio') {
        clases.push(estadoColor);
      }
      
      const clasesFinales = clases.join(' ');
      
      calendar.push(
        <div 
          key={day} 
          className={clasesFinales}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDayClick(year, month, day);
          }}
        >
          <span className="modal-calendario-day-number">
            {day}
          </span>
          {cantidadCitas > 0 && (
            <span className="modal-calendario-citas-count">
              {cantidadCitas}
            </span>
          )}
        </div>
      );
    }
    
    return calendar;
  };

  const isCurrentDay = (year, month, day) => {
    const today = new Date();
    return year === today.getFullYear() && 
           month === today.getMonth() && 
           day === today.getDate();
  };

  const getEstadoColor = (cantidadCitas) => {
    if (cantidadCitas >= 7) return 'modal-calendario-estado-completo';
    if (cantidadCitas >= 5) return 'modal-calendario-estado-ocupado';
    if (cantidadCitas >= 3) return 'modal-calendario-estado-medio';
    if (cantidadCitas >= 1) return 'modal-calendario-estado-libre';
    return 'modal-calendario-estado-vacio';
  };

  const handleDayClick = async (year, month, day) => {
    try {
      const fechaSeleccionada = new Date(year, month, day);
      setSelectedDate(fechaSeleccionada);
      await cargarCitasDelDia(fechaSeleccionada);
      setShowCitasDelDia(true);
    } catch (error) {
      console.error('❌ Error en handleDayClick:', error);
    }
  };

  const navegarMes = (direccion) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direccion);
    setCurrentDate(newDate);
  };

  const navegarAnio = (direccion) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + direccion);
    setCurrentDate(newDate);
  };

  const irAHoy = () => {
    setCurrentDate(new Date());
  };

  const formatearFecha = (fecha) => {
    const opciones = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  };

  const formatearHora = (hora) => {
    return hora ? hora.substring(0, 5) : '';
  };

  return (
    <>
      <div className="modal-calendario-container">
        <div className="modal-calendario-header">
          <div className="modal-calendario-nav-controls">
            <button 
              onClick={() => navegarAnio(-1)} 
              className="modal-calendario-nav-btn modal-calendario-nav-year"
            >
              ←← {currentDate.getFullYear() - 1}
            </button>
            <button 
              onClick={() => navegarMes(-1)} 
              className="modal-calendario-nav-btn"
            >
              ← {monthNames[currentDate.getMonth() - 1] || monthNames[11]}
            </button>
          </div>
          
          <div className="modal-calendario-current-month-year">
            <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button onClick={irAHoy} className="modal-calendario-btn-today">
              Ir a Hoy
            </button>
          </div>
          
          <div className="modal-calendario-nav-controls">
            <button 
              onClick={() => navegarMes(1)} 
              className="modal-calendario-nav-btn"
            >
              {monthNames[currentDate.getMonth() + 1] || monthNames[0]} →
            </button>
            <button 
              onClick={() => navegarAnio(1)} 
              className="modal-calendario-nav-btn modal-calendario-nav-year"
            >
              {currentDate.getFullYear() + 1} →→
            </button>
          </div>
        </div>

        <div className="modal-calendario-leyenda">
          <div className="modal-calendario-leyenda-item">
            <div className="modal-calendario-color-muestra modal-calendario-color-muestra-vacio"></div>
            <span>Sin citas</span>
          </div>
          <div className="modal-calendario-leyenda-item">
            <div className="modal-calendario-color-muestra modal-calendario-color-muestra-libre"></div>
            <span>1-2 citas</span>
          </div>
          <div className="modal-calendario-leyenda-item">
            <div className="modal-calendario-color-muestra modal-calendario-color-muestra-medio"></div>
            <span>3-4 citas</span>
          </div>
          <div className="modal-calendario-leyenda-item">
            <div className="modal-calendario-color-muestra modal-calendario-color-muestra-ocupado"></div>
            <span>5-6 citas</span>
          </div>
          <div className="modal-calendario-leyenda-item">
            <div className="modal-calendario-color-muestra modal-calendario-color-muestra-completo"></div>
            <span>7+ citas</span>
          </div>
        </div>

        <div className="modal-calendario-grid-dynamic">
          {loading ? (
            <div className="modal-calendario-loading">
              <div className="modal-calendario-loading-spinner-small"></div>
              Cargando calendario...
            </div>
          ) : (
            generateCalendar()
          )}
        </div>
      </div>

      {showCitasDelDia && selectedDate && (
        <div 
          className="modal-calendario-citas-modal-overlay" 
          onClick={() => setShowCitasDelDia(false)}
        >
          <div 
            className="modal-calendario-citas-modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-calendario-citas-modal-header">
              <h2>Citas del {formatearFecha(selectedDate)}</h2>
              <button 
                onClick={() => setShowCitasDelDia(false)}
                className="modal-calendario-citas-modal-close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-calendario-citas-modal-body">
              {citasDelDiaSeleccionado.length === 0 ? (
                <div className="modal-calendario-citas-no-citas-hoy">
                  <p>No hay citas programadas para este día</p>
                </div>
              ) : (
                <div className="modal-calendario-citas-list">
                  <p className="modal-calendario-citas-total-citas-texto">
                    Total de citas: {citasDelDiaSeleccionado.length}
                  </p>
                  {citasDelDiaSeleccionado.map((cita, index) => (
                    <div key={cita.id || index} className="modal-calendario-citas-cita-card">
                      <div className="modal-calendario-citas-cita-header">
                        <div className="modal-calendario-citas-cita-hora">
                          {formatearHora(cita.hora_cita)}
                        </div>
                        <div className="modal-calendario-citas-cita-paciente">
                          {cita.paciente_nombre_completo || cita.paciente_nombre || 'Paciente no especificado'}
                        </div>
                        <div className="modal-calendario-citas-cita-tipo">
                          {cita.tipo_consulta_nombre || cita.tipo_consulta}
                        </div>
                      </div>
                      
                      {cita.doctor_nombre_completo && (
                        <div className="modal-calendario-citas-info-doctor">
                          <strong>Doctor:</strong> {cita.doctor_nombre_completo}
                        </div>
                      )}
                      
                      <div className="modal-calendario-citas-info-estado">
                        <strong>Estado:</strong> 
                        <span className={`modal-calendario-citas-estado-badge modal-calendario-citas-estado-${cita.estado?.toLowerCase().replace(' ', '-').replace('_', '-')}`}>
                          {cita.estado}
                        </span>
                      </div>
                      
                      {/* ✅ SOLUCIÓN: Filtrar observaciones automáticas */}
                      {cita.observaciones && limpiarObservaciones(cita.observaciones) && (
                        <div className="modal-calendario-citas-info-observaciones">
                          <strong>Observaciones:</strong> {limpiarObservaciones(cita.observaciones)}
                        </div>
                      )}
                      
                      {cita.precio && (
                        <div className="modal-calendario-citas-info-precio">
                          <strong>Precio:</strong> ${cita.precio}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarioDinamico;