import React, { useState, useCallback } from 'react';
// import './ExamenIntrabucal.css'; // <- Importa el CSS aquí
import Odontograma from '../../components/Odontograma';
import Odontograma3D from '../../components/Odontograma3D'; // <- Nuevo componente 3D

const ExamenIntrabucal = ({ datos: externalData, onChange: externalOnChange, errores = {} }) => {
  // Estado local por defecto
  const [localData, setLocalData] = useState({
    estructuras: {
      labios: '',
      carrillos: '',
      musculos_pterigoideo_interno: '',
      musculos_pterigoideo_externo: '',
      frenillos: '',
      vestibulos: '',
      fondo_surco: '',
      lengua: '',
      piso_boca: '',
      paladar_duro: '',
      paladar_blando: '',
      uvula: '',
      pilares: '',
      amigdalas: '',
      orofaringe: ''
    },
    higiene_bucal: {
      general: '',
      indice_placa: '',
      calculo: '',
      halitosis: ''
    },
    encias: {
      color: '',
      textura: '',
      forma: '',
      consistencia: '',
      sangrado: '',
      alteraciones: []
    },
    oclusion: {
      linea_media: '',
      relacion_canina_derecha: '',
      relacion_canina_izquierda: '',
      relacion_molar_derecha: '',
      relacion_molar_izquierda: '',
      overjet: '',
      overbite: '',
      mordida_cruzada: '',
      mordida_abierta: '',
      apiñamiento: '',
      diastemas: ''
    },
    odontograma: {},
    odontograma_3d: {}, // <- Nuevo estado para odontograma 3D
    periodontograma: {},
    hallazgos_adicionales: ''
  });

  // Usar datos externos si están disponibles
  const data = externalData || localData;

  // Función de cambio adaptada
  const handleChange = useCallback((field, value) => {
    if (externalOnChange) {
      externalOnChange(field, value);
    } else {
      setLocalData(prev => ({
        ...prev,
        [field]: value
      }));
      console.log('Campo actualizado:', field, value);
    }
  }, [externalOnChange]);

  // Función para manejar cambios anidados
  const handleNestedChange = useCallback((section, field, value) => {
    const newData = {
      ...data[section],
      [field]: value
    };
    handleChange(section, newData);
  }, [data, handleChange]);

  // Función para manejar cambios en el odontograma 3D
  const handleOdontograma3DChange = useCallback((toothStates) => {
    handleChange('odontograma_3d', toothStates);
    console.log('Odontograma 3D actualizado:', toothStates);
  }, [handleChange]);

  // Estructuras intrabucales
  const estructurasIntrabucales = [
    { key: 'labios', label: 'Labios', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'carrillos', label: 'Carrillos', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'musculos_pterigoideo_interno', label: 'Músculos pterigoideo interno', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'musculos_pterigoideo_externo', label: 'Músculos pterigoideo externo', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'frenillos', label: 'Frenillos', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'vestibulos', label: 'Vestíbulos', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'fondo_surco', label: 'Fondo de surco', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'lengua', label: 'Lengua', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'piso_boca', label: 'Piso de boca', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'paladar_duro', label: 'Paladar duro', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'paladar_blando', label: 'Paladar blando', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'uvula', label: 'Úvula', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'pilares', label: 'Pilares', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'amigdalas', label: 'Amígdalas', placeholder: 'Describir alteraciones o "Normal"' },
    { key: 'orofaringe', label: 'Orofaringe', placeholder: 'Describir alteraciones o "Normal"' }
  ];

  // Opciones para encías
  const opcionesEncias = {
    color: ['Rosa coral', 'Rojo', 'Azulado', 'Pálido', 'Pigmentado'],
    textura: ['Lisa', 'Rugosa', 'Granular', 'Punteado'],
    forma: ['Festoneada', 'Rectangular', 'Triangular', 'Irregular'],
    consistencia: ['Firme', 'Blanda', 'Edematosa', 'Fibrosa'],
    sangrado: ['Ausente', 'Espontáneo', 'Al sondaje', 'Al cepillado']
  };

  // Función para agregar alteración gingival
  const agregarAlteracion = () => {
    const nuevasAlteraciones = [...(data.encias?.alteraciones || []), {
      localizacion: '',
      descripcion: '',
      tamaño: '',
      color: '',
      consistencia: ''
    }];
    handleNestedChange('encias', 'alteraciones', nuevasAlteraciones);
  };

  // Función para eliminar alteración
  const eliminarAlteracion = (index) => {
    const nuevasAlteraciones = (data.encias?.alteraciones || []).filter((_, i) => i !== index);
    handleNestedChange('encias', 'alteraciones', nuevasAlteraciones);
  };

  // Función para actualizar alteración
  const actualizarAlteracion = (index, campo, valor) => {
    const nuevasAlteraciones = [...(data.encias?.alteraciones || [])];
    nuevasAlteraciones[index] = { ...nuevasAlteraciones[index], [campo]: valor };
    handleNestedChange('encias', 'alteraciones', nuevasAlteraciones);
  };

  return (
    <div className="examen-intrabucal-container">
      
      {/* Header de la sección */}
      <div className="intrabucal-header">
        <h3>IV. EXAMEN INTRABUCAL</h3>
        <p className="header-subtitle">
          Evaluación sistemática de estructuras intrabucales y diagnóstico dental
        </p>
      </div>

      {/* 1. Estructuras Intrabucales */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">Estructuras Intrabucales</h4>
          <span className="intrabucal-badge evaluacion">EVALUACIÓN</span>
        </div>
        
        <div className="intrabucal-form-group">
          <p className="intrabucal-section-description">
            Describe las alteraciones que se presentan en cada estructura
          </p>
          
          <div className="intrabucal-grid-2">
            {estructurasIntrabucales.map(estructura => (
              <div key={estructura.key} className="intrabucal-field">
                <label className="intrabucal-label">{estructura.label}</label>
                <textarea
                  className="intrabucal-textarea"
                  value={data.estructuras?.[estructura.key] || ''}
                  onChange={(e) => handleNestedChange('estructuras', estructura.key, e.target.value)}
                  placeholder={estructura.placeholder}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Higiene Bucal */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">Higiene Bucal</h4>
          <span className="intrabucal-badge higiene">HIGIENE</span>
        </div>
        
        <div className="intrabucal-form-group">
          <div className="intrabucal-grid-4">
            <div className="intrabucal-field">
              <label className="intrabucal-label">Estado general</label>
              <select
                className="intrabucal-select"
                value={data.higiene_bucal?.general || ''}
                onChange={(e) => handleNestedChange('higiene_bucal', 'general', e.target.value)}
              >
                <option value="">Seleccionar...</option>
                <option value="Excelente">Excelente</option>
                <option value="Buena">Buena</option>
                <option value="Regular">Regular</option>
                <option value="Deficiente">Deficiente</option>
                <option value="Mala">Mala</option>
              </select>
            </div>
            
            <div className="intrabucal-field">
              <label className="intrabucal-label">Índice de placa (%)</label>
              <input
                type="text"
                className="intrabucal-input"
                value={data.higiene_bucal?.indice_placa || ''}
                onChange={(e) => handleNestedChange('higiene_bucal', 'indice_placa', e.target.value)}
                placeholder="Ej: 35%"
              />
            </div>
            
            <div className="intrabucal-field">
              <label className="intrabucal-label">Cálculo</label>
              <select
                className="intrabucal-select"
                value={data.higiene_bucal?.calculo || ''}
                onChange={(e) => handleNestedChange('higiene_bucal', 'calculo', e.target.value)}
              >
                <option value="">Seleccionar...</option>
                <option value="Ausente">Ausente</option>
                <option value="Leve">Leve</option>
                <option value="Moderado">Moderado</option>
                <option value="Abundante">Abundante</option>
              </select>
            </div>
            
            <div className="intrabucal-field">
              <label className="intrabucal-label">Halitosis</label>
              <select
                className="intrabucal-select"
                value={data.higiene_bucal?.halitosis || ''}
                onChange={(e) => handleNestedChange('higiene_bucal', 'halitosis', e.target.value)}
              >
                <option value="">Seleccionar...</option>
                <option value="Ausente">Ausente</option>
                <option value="Leve">Leve</option>
                <option value="Moderada">Moderada</option>
                <option value="Intensa">Intensa</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Encías */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">Encías</h4>
          <span className="intrabucal-badge encias">ENCÍAS</span>
        </div>
        
        <div className="intrabucal-form-group">
          {/* Características gingivales */}
          <div className="intrabucal-grid-3">
            {Object.entries(opcionesEncias).map(([campo, opciones]) => (
              <div key={campo} className="intrabucal-field">
                <label className="intrabucal-label">
                  {campo.replace('_', ' ').charAt(0).toUpperCase() + campo.replace('_', ' ').slice(1)}
                </label>
                <select
                  className="intrabucal-select"
                  value={data.encias?.[campo] || ''}
                  onChange={(e) => handleNestedChange('encias', campo, e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {opciones.map(opcion => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Alteraciones gingivales */}
          <div className="intrabucal-subsection">
            <div className="intrabucal-alteraciones-header">
              <h5 className="intrabucal-alteraciones-title">Alteraciones gingivales</h5>
              <button
                type="button"
                onClick={agregarAlteracion}
                className="intrabucal-btn-add"
              >
                + Agregar alteración
              </button>
            </div>

            {(data.encias?.alteraciones || []).map((alteracion, index) => (
              <div key={index} className="intrabucal-alteracion-item">
                <div className="intrabucal-alteracion-header">
                  <h6 className="intrabucal-alteracion-title">Alteración {index + 1}</h6>
                  <button
                    type="button"
                    onClick={() => eliminarAlteracion(index)}
                    className="intrabucal-btn-remove"
                  >
                    Eliminar
                  </button>
                </div>
                
                <div className="intrabucal-alteracion-fields">
                  <div className="intrabucal-small-field">
                    <label className="intrabucal-small-label">Localización</label>
                    <input
                      type="text"
                      className="intrabucal-small-input"
                      value={alteracion.localizacion || ''}
                      onChange={(e) => actualizarAlteracion(index, 'localizacion', e.target.value)}
                      placeholder="Ej: Encía marginal superior anterior"
                    />
                  </div>
                  
                  <div className="intrabucal-small-field">
                    <label className="intrabucal-small-label">Descripción</label>
                    <input
                      type="text"
                      className="intrabucal-small-input"
                      value={alteracion.descripcion || ''}
                      onChange={(e) => actualizarAlteracion(index, 'descripcion', e.target.value)}
                      placeholder="Ej: Inflamación, úlcera, hiperplasia"
                    />
                  </div>
                  
                  <div className="intrabucal-small-field">
                    <label className="intrabucal-small-label">Tamaño</label>
                    <input
                      type="text"
                      className="intrabucal-small-input"
                      value={alteracion.tamaño || ''}
                      onChange={(e) => actualizarAlteracion(index, 'tamaño', e.target.value)}
                      placeholder="Ej: 5mm x 3mm"
                    />
                  </div>
                  
                  <div className="intrabucal-small-field">
                    <label className="intrabucal-small-label">Color</label>
                    <input
                      type="text"
                      className="intrabucal-small-input"
                      value={alteracion.color || ''}
                      onChange={(e) => actualizarAlteracion(index, 'color', e.target.value)}
                      placeholder="Ej: Rojizo, blanquecino"
                    />
                  </div>
                  
                  <div className="intrabucal-small-field">
                    <label className="intrabucal-small-label">Consistencia</label>
                    <input
                      type="text"
                      className="intrabucal-small-input"
                      value={alteracion.consistencia || ''}
                      onChange={(e) => actualizarAlteracion(index, 'consistencia', e.target.value)}
                      placeholder="Ej: Blanda, dura, fluctuante"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Oclusión */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">Oclusión</h4>
          <span className="intrabucal-badge dental">DENTAL</span>
        </div>
        
        <div className="intrabucal-form-group">
          {/* Clasificación de Angle */}
          <div className="intrabucal-subsection">
            <h5 className="intrabucal-subsection-title">Clasificación de Angle</h5>
            
            <div className="intrabucal-angle-grid">
              {/* Relación molar */}
              <div className="intrabucal-angle-section">
                <h6 className="intrabucal-angle-title">Relación Molar</h6>
                
                <div className="intrabucal-angle-sides">
                  <div className="intrabucal-angle-field">
                    <label className="intrabucal-angle-label">Lado derecho</label>
                    <select
                      className="intrabucal-angle-select"
                      value={data.oclusion?.relacion_molar_derecha || ''}
                      onChange={(e) => handleNestedChange('oclusion', 'relacion_molar_derecha', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Clase I">Clase I</option>
                      <option value="Clase II">Clase II</option>
                      <option value="Clase III">Clase III</option>
                    </select>
                  </div>
                  
                  <div className="intrabucal-angle-field">
                    <label className="intrabucal-angle-label">Lado izquierdo</label>
                    <select
                      className="intrabucal-angle-select"
                      value={data.oclusion?.relacion_molar_izquierda || ''}
                      onChange={(e) => handleNestedChange('oclusion', 'relacion_molar_izquierda', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Clase I">Clase I</option>
                      <option value="Clase II">Clase II</option>
                      <option value="Clase III">Clase III</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Relación canina */}
              <div className="intrabucal-angle-section">
                <h6 className="intrabucal-angle-title">Relación Canina</h6>
                
                <div className="intrabucal-angle-sides">
                  <div className="intrabucal-angle-field">
                    <label className="intrabucal-angle-label">Lado derecho</label>
                    <select
                      className="intrabucal-angle-select"
                      value={data.oclusion?.relacion_canina_derecha || ''}
                      onChange={(e) => handleNestedChange('oclusion', 'relacion_canina_derecha', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Clase I">Clase I</option>
                      <option value="Clase II">Clase II</option>
                      <option value="Clase III">Clase III</option>
                    </select>
                  </div>
                  
                  <div className="intrabucal-angle-field">
                    <label className="intrabucal-angle-label">Lado izquierdo</label>
                    <select
                      className="intrabucal-angle-select"
                      value={data.oclusion?.relacion_canina_izquierda || ''}
                      onChange={(e) => handleNestedChange('oclusion', 'relacion_canina_izquierda', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Clase I">Clase I</option>
                      <option value="Clase II">Clase II</option>
                      <option value="Clase III">Clase III</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medidas oclusales */}
          <div className="intrabucal-subsection">
            <h5 className="intrabucal-subsection-title">Medidas oclusales</h5>
            
            <div className="intrabucal-grid-3">
              <div className="intrabucal-field">
                <label className="intrabucal-label">Línea media</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.linea_media || ''}
                  onChange={(e) => handleNestedChange('oclusion', 'linea_media', e.target.value)}
                  placeholder="Ej: Centrada, desviada 2mm der"
                />
              </div>
              
              <div className="intrabucal-field">
                <label className="intrabucal-label">Overjet (mm)</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.overjet || ''}
                  onChange={(e) => handleNestedChange('oclusion', 'overjet', e.target.value)}
                  placeholder="Ej: 2.5"
                />
              </div>
              
              <div className="intrabucal-field">
                <label className="intrabucal-label">Overbite (mm)</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.overbite || ''}
                  onChange={(e) => handleNestedChange('oclusion', 'overbite', e.target.value)}
                  placeholder="Ej: 3.0"
                />
              </div>
            </div>
          </div>

          {/* Alteraciones oclusales */}
          <div className="intrabucal-subsection">
            <h5 className="intrabucal-subsection-title">Alteraciones oclusales</h5>
            
            <div className="intrabucal-grid-4">
              <div className="intrabucal-field">
                <label className="intrabucal-label">Mordida cruzada</label>
                <textarea
                  className="intrabucal-textarea"
                  value={data.oclusion?.mordida_cruzada || ''}
                  onChange={(e) => handleNestedChange('oclusion', 'mordida_cruzada', e.target.value)}
                  placeholder="Describir localización..."
                  style={{ minHeight: '60px' }}
                />
              </div>
              
              <div className="intrabucal-field">
                <label className="intrabucal-label">Mordida abierta</label>
                <textarea
                  className="intrabucal-textarea"
                  value={data.oclusion?.mordida_abierta || ''}
                  onChange={(e) => handleNestedChange('oclusion', 'mordida_abierta', e.target.value)}
                  placeholder="Describir localización..."
                  style={{ minHeight: '60px' }}
                />
              </div>
              
              <div className="intrabucal-field">
                <label className="intrabucal-label">Apiñamiento</label>
                <textarea
                  className="intrabucal-textarea"
                  value={data.oclusion?.apiñamiento || ''}
                  onChange={(e) => handleNestedChange('oclusion', 'apiñamiento', e.target.value)}
                  placeholder="Describir grado y localización..."
                  style={{ minHeight: '60px' }}
                />
              </div>
              
              <div className="intrabucal-field">
                <label className="intrabucal-label">Diastemas</label>
                <textarea
                  className="intrabucal-textarea"
                  value={data.oclusion?.diastemas || ''}
                  onChange={(e) => handleNestedChange('oclusion', 'diastemas', e.target.value)}
                  placeholder="Describir localización y tamaño..."
                  style={{ minHeight: '60px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Hallazgos adicionales */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">Hallazgos adicionales</h4>
          <span className="intrabucal-badge periodonto">PERIODONTO</span>
        </div>
        
        <div className="intrabucal-form-group">
          <label className="intrabucal-label">
            Observaciones generales y hallazgos relevantes
          </label>
          <textarea
            className="intrabucal-textarea"
            value={data.hallazgos_adicionales || ''}
            onChange={(e) => handleChange('hallazgos_adicionales', e.target.value)}
            placeholder="Describir hallazgos adicionales, observaciones especiales, patologías encontradas, etc..."
            style={{ minHeight: '120px' }}
          />
        </div>
      </div>

      {/* Odontograma 2D Tradicional */}
      <div className="form-section-card">
        <div className="card-header">
          <h4>Odontograma Interactivo</h4>
          <span className="card-badge evaluacion-badge">Visual</span>
        </div>

        <div className="form-group-enhanced">
          <Odontograma pacienteId={data.id_paciente} />
        </div>
      </div>

      {/* Vista 3D Interactiva - AQUÍ SE INTEGRA EL ODONTOGRAMA 3D */}
      <div className="form-section-card">
        <div className="card-header">
          <h4>Vista 3D Interactiva</h4>
          <span className="card-badge evaluacion-badge">3D</span>
        </div>
        
        <div className="form-group-enhanced">
          <div style={{ height: '600px', width: '100%', position: 'relative' }}>
            <Odontograma3D 
              pacienteId={data.id_paciente}
              initialStates={data.odontograma_3d || {}}
              onStateChange={handleOdontograma3DChange}
            />
          </div>
          
          {/* Información adicional del odontograma 3D */}
          <div className="odontograma-3d-info" style={{ 
            marginTop: '15px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h6 style={{ margin: '0 0 10px 0', color: '#495057' }}>
              Información del Odontograma 3D
            </h6>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div>
                <strong>Total de dientes evaluados:</strong> {Object.keys(data.odontograma_3d || {}).length}
              </div>
              <div>
                <strong>Dientes con caries:</strong> {
                  Object.values(data.odontograma_3d || {}).filter(state => state === 'caries').length
                }
              </div>
              <div>
                <strong>Dientes obturados:</strong> {
                  Object.values(data.odontograma_3d || {}).filter(state => state === 'filled').length
                }
              </div>
              <div>
                <strong>Dientes ausentes:</strong> {
                  Object.values(data.odontograma_3d || {}).filter(state => state === 'missing').length
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="intrabucal-info-note">
        <div className="intrabucal-info-icon">ℹ️</div>
        <div className="intrabucal-info-content">
          <h6>Información importante</h6>
          <p>
            Complete detalladamente cada sección del examen intrabucal. Esta información es fundamental 
            para el diagnóstico y plan de tratamiento. Utilice terminología clínica precisa y describa 
            específicamente la localización y características de cualquier hallazgo patológico.
          </p>
          <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
            <strong>Odontograma 3D:</strong> Haga clic en los dientes para aplicar diferentes estados. 
            Use el mouse para rotar la vista y la rueda para hacer zoom. Los datos se guardan automáticamente.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ExamenIntrabucal;