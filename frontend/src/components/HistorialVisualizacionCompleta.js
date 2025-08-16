import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './HistorialVisualizacionCompleta.css';

const HistorialVisualizacionCompleta = () => {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos del paciente
        const pacienteResponse = await fetch(`http://localhost:5000/api/pacientes/${id}`);
        if (!pacienteResponse.ok) throw new Error('Error al obtener paciente');
        const pacienteData = await pacienteResponse.json();
        
        // Obtener citas del paciente
        const citasResponse = await fetch(`http://localhost:5000/api/citas/paciente/${id}`);
        if (!citasResponse.ok) throw new Error('Error al obtener citas');
        const citasData = await citasResponse.json();
        
        setPaciente(pacienteData);
        setCitas(citasData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const renderSeccionPersonal = () => (
    <div className="seccion-pdf">
      <h2>INFORMACIÓN PERSONAL</h2>
      <div className="info-grid">
        <div className="info-item">
          <strong>Nombre:</strong> {paciente.nombre} {paciente.apellido}
        </div>
        <div className="info-item">
          <strong>Edad:</strong> {calcularEdad(paciente.fecha_nacimiento)} años
        </div>
        <div className="info-item">
          <strong>Fecha de Nacimiento:</strong> {formatearFecha(paciente.fecha_nacimiento)}
        </div>
        <div className="info-item">
          <strong>Teléfono:</strong> {paciente.telefono}
        </div>
        <div className="info-item">
          <strong>Email:</strong> {paciente.email}
        </div>
        <div className="info-item">
          <strong>Dirección:</strong> {paciente.direccion}
        </div>
      </div>
    </div>
  );

  const renderHistorialMedico = () => {
    const historialMedico = citas.find(cita => cita.historial_medico)?.historial_medico;
    if (!historialMedico) return null;

    const historial = typeof historialMedico === 'string' 
      ? JSON.parse(historialMedico) 
      : historialMedico;

    return (
      <div className="seccion-pdf">
        <h2>HISTORIAL MÉDICO</h2>
        
        {/* Condiciones Médicas */}
        {historial.condicionesMedicas && historial.condicionesMedicas.length > 0 && (
          <div className="subseccion">
            <h3>Condiciones Médicas:</h3>
            <ul>
              {historial.condicionesMedicas.map((condicion, index) => (
                <li key={index}>{condicion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Medicamentos */}
        {historial.medicamentos && historial.medicamentos.length > 0 && (
          <div className="subseccion">
            <h3>Medicamentos:</h3>
            <ul>
              {historial.medicamentos.map((medicamento, index) => (
                <li key={index}>{medicamento}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Alergias */}
        {historial.alergias && historial.alergias.length > 0 && (
          <div className="subseccion">
            <h3>Alergias:</h3>
            <ul>
              {historial.alergias.map((alergia, index) => (
                <li key={index}>{alergia}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Cirugías */}
        {historial.cirugias && historial.cirugias.length > 0 && (
          <div className="subseccion">
            <h3>Cirugías Previas:</h3>
            <ul>
              {historial.cirugias.map((cirugia, index) => (
                <li key={index}>{cirugia}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderOdontograma = () => {
    const citaConOdontograma = citas.find(cita => cita.odontograma);
    if (!citaConOdontograma) return null;

    const odontograma = typeof citaConOdontograma.odontograma === 'string'
      ? JSON.parse(citaConOdontograma.odontograma)
      : citaConOdontograma.odontograma;

    const dientesConEstado = Object.entries(odontograma).filter(([_, estado]) => 
      estado && estado !== 'sano'
    );

    if (dientesConEstado.length === 0) return null;

    return (
      <div className="seccion-pdf">
        <h2>ODONTOGRAMA</h2>
        <div className="odontograma-lista">
          {dientesConEstado.map(([diente, estado]) => (
            <div key={diente} className="diente-estado">
              <strong>Diente {diente}:</strong> {estado}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCitasDetalladas = () => {
    if (!citas || citas.length === 0) return null;

    return (
      <div className="seccion-pdf">
        <h2>HISTORIAL DE CITAS</h2>
        {citas.map((cita, index) => {
          // Parsear datos JSON si existen
          let consultaData = null;
          let tratamientoData = null;
          let motivoConsulta = '';

          if (cita.consulta) {
            try {
              consultaData = typeof cita.consulta === 'string' 
                ? JSON.parse(cita.consulta) 
                : cita.consulta;
            } catch (e) {
              console.error('Error parsing consulta:', e);
            }
          }

          if (cita.tratamiento) {
            try {
              tratamientoData = typeof cita.tratamiento === 'string'
                ? JSON.parse(cita.tratamiento)
                : cita.tratamiento;
            } catch (e) {
              console.error('Error parsing tratamiento:', e);
            }
          }

          // Obtener motivo de consulta
          if (consultaData?.motivoConsulta) {
            motivoConsulta = consultaData.motivoConsulta;
          } else if (cita.motivo) {
            motivoConsulta = cita.motivo;
          }

          return (
            <div key={cita.id} className="cita-detalle">
              <div className="cita-header">
                <h3>Cita #{index + 1} - {formatearFecha(cita.fecha)}</h3>
                <span className="cita-estado">{cita.estado}</span>
              </div>

              {/* Motivo de Consulta */}
              {motivoConsulta && (
                <div className="cita-seccion">
                  <h4>Motivo de Consulta:</h4>
                  <p>{motivoConsulta}</p>
                </div>
              )}

              {/* Examen Clínico */}
              {consultaData?.examenClinico && (
                <div className="cita-seccion">
                  <h4>Examen Clínico:</h4>
                  <p>{consultaData.examenClinico}</p>
                </div>
              )}

              {/* Diagnóstico */}
              {consultaData?.diagnostico && (
                <div className="cita-seccion">
                  <h4>Diagnóstico:</h4>
                  <p>{consultaData.diagnostico}</p>
                </div>
              )}

              {/* Plan de Tratamiento */}
              {consultaData?.planTratamiento && (
                <div className="cita-seccion">
                  <h4>Plan de Tratamiento:</h4>
                  <p>{consultaData.planTratamiento}</p>
                </div>
              )}

              {/* Tratamiento Realizado */}
              {tratamientoData && (
                <div className="cita-seccion">
                  <h4>Tratamiento Realizado:</h4>
                  
                  {tratamientoData.procedimientos && tratamientoData.procedimientos.length > 0 && (
                    <div className="subseccion-tratamiento">
                      <strong>Procedimientos:</strong>
                      <ul>
                        {tratamientoData.procedimientos.map((proc, idx) => (
                          <li key={idx}>
                            {proc.nombre} - {proc.diente ? `Diente ${proc.diente}` : 'General'}
                            {proc.costo && ` - $${proc.costo}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tratamientoData.observaciones && (
                    <div className="subseccion-tratamiento">
                      <strong>Observaciones:</strong>
                      <p>{tratamientoData.observaciones}</p>
                    </div>
                  )}

                  {tratamientoData.proximaCita && (
                    <div className="subseccion-tratamiento">
                      <strong>Próxima Cita:</strong>
                      <p>{formatearFecha(tratamientoData.proximaCita)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Recetas */}
              {cita.receta && (
                <div className="cita-seccion">
                  <h4>Receta Médica:</h4>
                  <div className="receta-content">
                    {typeof cita.receta === 'string' ? (
                      <p>{cita.receta}</p>
                    ) : (
                      <div>
                        {cita.receta.medicamentos && cita.receta.medicamentos.map((med, idx) => (
                          <div key={idx} className="medicamento-item">
                            <strong>{med.nombre}</strong>
                            <p>Dosis: {med.dosis}</p>
                            <p>Indicaciones: {med.indicaciones}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Costo Total */}
              {cita.costo && (
                <div className="cita-costo">
                  <strong>Costo Total: ${parseFloat(cita.costo).toFixed(2)}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderResumenFinanciero = () => {
    const citasConCosto = citas.filter(cita => cita.costo && parseFloat(cita.costo) > 0);
    if (citasConCosto.length === 0) return null;

    const totalGastado = citasConCosto.reduce((sum, cita) => sum + parseFloat(cita.costo), 0);

    return (
      <div className="seccion-pdf">
        <h2>RESUMEN FINANCIERO</h2>
        <div className="resumen-financiero">
          <div className="resumen-item">
            <strong>Total de Citas con Costo:</strong> {citasConCosto.length}
          </div>
          <div className="resumen-item">
            <strong>Total Gastado:</strong> ${totalGastado.toFixed(2)}
          </div>
          <div className="resumen-item">
            <strong>Costo Promedio por Cita:</strong> ${(totalGastado / citasConCosto.length).toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="historial-loading">
        <div className="spinner"></div>
        <p>Cargando historial completo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historial-error">
        <h2>Error al cargar el historial</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="historial-error">
        <h2>Paciente no encontrado</h2>
      </div>
    );
  }

  return (
    <div className="historial-completo">
      <div className="historial-header">
        <h1>HISTORIAL CLÍNICO COMPLETO</h1>
        <div className="header-info">
          <p>Paciente: {paciente.nombre} {paciente.apellido}</p>
          <p>Fecha de Generación: {formatearFecha(new Date())}</p>
        </div>
      </div>

      <div className="historial-content">
        {renderSeccionPersonal()}
        {renderHistorialMedico()}
        {renderOdontograma()}
        {renderCitasDetalladas()}
        {renderResumenFinanciero()}
      </div>

      <div className="historial-footer">
        <p>Este documento fue generado automáticamente por OdontoSys</p>
        <p>Fecha de generación: {new Date().toLocaleString('es-ES')}</p>
      </div>
    </div>
  );
};

export default HistorialVisualizacionCompleta;