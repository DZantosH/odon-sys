import React, { useState, useEffect } from 'react';

const ModalEditarPacienteTemporal = ({ isOpen, onClose, paciente, onPacienteActualizado }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    telefono: '',
    email: '',
    direccion: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    observaciones_medicas: '',
    alergias: '',
    medicamentos_actuales: '',
    convertir_permanente: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar datos del paciente cuando se abre el modal
  useEffect(() => {
    if (isOpen && paciente) {
      // Separar el nombre completo en partes
      const nombres = paciente.nombre_completo ? paciente.nombre_completo.split(' ') : [''];
      
      setFormData({
        nombre: nombres[0] || '',
        apellido_paterno: nombres[1] || '',
        apellido_materno: nombres.slice(2).join(' ') || '',
        fecha_nacimiento: '',
        telefono: paciente.telefono || '',
        email: '',
        direccion: '',
        contacto_emergencia: '',
        telefono_emergencia: '',
        observaciones_medicas: paciente.observaciones || '',
        alergias: '',
        medicamentos_actuales: '',
        convertir_permanente: false
      });
      setError('');
      setSuccess('');
    }
  }, [isOpen, paciente]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar mensajes
    if (error) setError('');
    if (success) setSuccess('');
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.apellido_paterno.trim()) {
      setError('El apellido paterno es requerido');
      return false;
    }
    if (formData.convertir_permanente && !formData.fecha_nacimiento) {
      setError('La fecha de nacimiento es requerida para pacientes permanentes');
      return false;
    }
    if (formData.email && !formData.email.includes('@')) {
      setError('El email no tiene un formato válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      if (formData.convertir_permanente) {
        // Convertir a paciente permanente
        const pacienteData = {
          nombre: formData.nombre.trim(),
          apellido_paterno: formData.apellido_paterno.trim(),
          apellido_materno: formData.apellido_materno.trim(),
          fecha_nacimiento: formData.fecha_nacimiento,
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          contacto_emergencia: formData.contacto_emergencia,
          telefono_emergencia: formData.telefono_emergencia,
          observaciones_medicas: formData.observaciones_medicas,
          alergias: formData.alergias,
          medicamentos_actuales: formData.medicamentos_actuales,
          paciente_temporal_id: paciente.id // Para actualizar las citas existentes
        };

        console.log('Convirtiendo paciente temporal a permanente:', pacienteData);

        const response = await fetch('/api/pacientes/convertir-temporal', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pacienteData)
        });

        const result = await response.json();

        if (response.ok) {
          setSuccess(`Paciente convertido exitosamente. ID: ${result.pacienteId}`);
          
          // Notificar al componente padre
          if (onPacienteActualizado) {
            onPacienteActualizado({
              ...result,
              accion: 'convertido'
            });
          }

          // Cerrar modal después de un delay
          setTimeout(() => {
            onClose();
          }, 2000);

        } else {
          setError(result.message || 'Error al convertir el paciente');
        }

      } else {
        // Solo actualizar información del paciente temporal
        const updateData = {
          nombre_completo: `${formData.nombre} ${formData.apellido_paterno} ${formData.apellido_materno}`.trim(),
          telefono: formData.telefono,
          observaciones: formData.observaciones_medicas
        };

        console.log('Actualizando paciente temporal:', updateData);

        const response = await fetch(`/api/pacientes-temporales/${paciente.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        const result = await response.json();

        if (response.ok) {
          setSuccess('Información del paciente actualizada exitosamente');
          
          // Notificar al componente padre
          if (onPacienteActualizado) {
            onPacienteActualizado({
              ...result,
              accion: 'actualizado'
            });
          }

          // Cerrar modal después de un delay
          setTimeout(() => {
            onClose();
          }, 1500);

        } else {
          setError(result.message || 'Error al actualizar el paciente');
        }
      }

    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-paciente-overlay">
      <div className="modal-paciente-container">
        {/* Header */}
        <div className="modal-paciente-header">
          <div className="modal-paciente-info">
            <h3>
              {formData.convertir_permanente ? '👤 Convertir a Paciente Permanente' : '✏️ Editar Paciente Temporal'}
            </h3>
            <p className="modal-paciente-subtitulo">
              {paciente?.nombre_completo || 'Paciente'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="modal-paciente-close-btn"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="modal-paciente-content">
          {/* Mensajes de estado */}
          {error && (
            <div className="modal-paciente-error">
              ⚠️ {error}
            </div>
          )}
          
          {success && (
            <div className="modal-paciente-success">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="modal-paciente-form">
            {/* Checkbox para convertir a permanente */}
            <div className="form-group">
              <label className="modal-checkbox-label">
                <input
                  type="checkbox"
                  name="convertir_permanente"
                  checked={formData.convertir_permanente}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span className="checkbox-text">
                  🔄 Convertir a paciente permanente (no se eliminará automáticamente)
                </span>
              </label>
            </div>

            {/* Información básica */}
            <div className="modal-seccion">
              <h4 className="modal-seccion-titulo">📋 Información Personal</h4>
              
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="field-label">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label className="field-label">Apellido Paterno *</label>
                  <input
                    type="text"
                    name="apellido_paterno"
                    value={formData.apellido_paterno}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="field-label">Apellido Materno</label>
                  <input
                    type="text"
                    name="apellido_materno"
                    value={formData.apellido_materno}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label className="field-label">
                    Fecha de Nacimiento {formData.convertir_permanente && '*'}
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    className="form-control"
                    required={formData.convertir_permanente}
                    disabled={loading}
                  />
                  {formData.fecha_nacimiento && (
                    <small className="edad-calculada">
                      Edad: {calcularEdad(formData.fecha_nacimiento)} años
                    </small>
                  )}
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="modal-seccion">
              <h4 className="modal-seccion-titulo">📞 Información de Contacto</h4>
              
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="field-label">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label className="field-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contacto de emergencia - Solo si es permanente */}
            {formData.convertir_permanente && (
              <div className="modal-seccion">
                <h4 className="modal-seccion-titulo">🚨 Contacto de Emergencia</h4>
                
                <div className="modal-grid-2">
                  <div className="form-group">
                    <label className="field-label">Nombre del Contacto</label>
                    <input
                      type="text"
                      name="contacto_emergencia"
                      value={formData.contacto_emergencia}
                      onChange={handleInputChange}
                      className="form-control"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="field-label">Teléfono de Emergencia</label>
                    <input
                      type="tel"
                      name="telefono_emergencia"
                      value={formData.telefono_emergencia}
                      onChange={handleInputChange}
                      className="form-control"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Información médica */}
            <div className="modal-seccion">
              <h4 className="modal-seccion-titulo">🏥 Información Médica</h4>
              
              <div className="form-group">
                <label className="field-label">Observaciones Médicas</label>
                <textarea
                  name="observaciones_medicas"
                  value={formData.observaciones_medicas}
                  onChange={handleInputChange}
                  rows="3"
                  className="form-control"
                  disabled={loading}
                />
              </div>

              {formData.convertir_permanente && (
                <>
                  <div className="form-group">
                    <label className="field-label">Alergias</label>
                    <textarea
                      name="alergias"
                      value={formData.alergias}
                      onChange={handleInputChange}
                      rows="2"
                      className="form-control"
                      placeholder="Ej: Penicilina, Polen, etc."
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="field-label">Medicamentos Actuales</label>
                    <textarea
                      name="medicamentos_actuales"
                      value={formData.medicamentos_actuales}
                      onChange={handleInputChange}
                      rows="2"
                      className="form-control"
                      placeholder="Ej: Ibuprofeno 400mg cada 8h, etc."
                      disabled={loading}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Botones */}
            <div className="modal-paciente-buttons">
              <button
                type="button"
                onClick={handleClose}
                className="btn-modal-cancel"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-modal-submit"
                disabled={loading}
              >
                {loading ? 'Procesando...' : 
                 formData.convertir_permanente ? 'Convertir a Permanente' : 'Actualizar Información'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarPacienteTemporal;