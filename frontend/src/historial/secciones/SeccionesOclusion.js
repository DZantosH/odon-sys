import React, { useState, useCallback } from 'react';
import '../../css/HistorialFormularios.css'; // Agregar esta línea

const SeccionesOclusion = ({ datos: externalData, onChange: externalOnChange, errores = {} }) => {
  // Estado local por defecto - Estructura según PDF
  const [localData, setLocalData] = useState({
    // 16. Oclusión con subcategorías
    oclusion: {
      // 16. Odontograma principal
      odontograma: {
        dientes_presentes: {},
        dientes_ausentes: {},
        observaciones_generales: ''
      },
      
      // 16.1 Armonía de los maxilares
      armonia_maxilares: {
        amplitud_arco_superior: '',
        boveda_palatina: '',
        amplitud_arco_inferior: '',
        descripcion_armonia: ''
      },
      
      // 16.2 Simetría del arco
      simetria_arco: {
        relacion_antero_posterior_derecho: '',
        relacion_antero_posterior_izquierdo: '',
        relacion_buco_lingual_derecho: '',
        relacion_buco_lingual_izquierdo: ''
      },
      
      // 16.3 Maloclusiones - Clasificación de Angle
      clasificacion_angle: {
        relacion_molar_derecho: '',
        relacion_molar_izquierdo: '',
        relacion_canina_derecho: '',
        relacion_canina_izquierdo: '',
        
        // Relación dental
        sobremordida_vertical: '',
        sobremordida_horizontal: '',
        borde_a_borde: '',
        mordida_abierta: '',
        mordida_cruzada_anterior: '',
        mordida_cruzada_posterior: '',
        linea_media_maxilar: '',
        linea_media_mandibular: '',
        diastemas: '',
        apiñamiento: '',
        facetas_desgaste: '',
        
        // Alteraciones dentales
        alteraciones_dentales: []
      }
    },
    
    // 17. Examen de higiene oral (O'Leary)
    examen_higiene_oral: {
    numero_total_dientes: '',
    superficies_placa: {},
    total_superficies_revisadas: '',
    ipdb_porcentaje: '',
    observaciones_oleary: ''
  },
    
    // 18. Encías
    encias: {
      alteraciones_gingivales: [],
      localizaciones_afectadas: ''
    },
    
    // 19. Examen dental
    examen_dental: {
      dientes_evaluados: {},
      hallazgos_dentales: '',
      procedimientos_realizados: ''
    },
    
    // 20. Periodontograma
    periodontograma: {
      lesiones_gingivales: {},
      estados_periodonto: {},
      observaciones_periodonto: ''
    },
    
    // 21. Modelos de estudio
    modelos_estudio: {
      hallazgos: ''
    }
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

  // Función para manejar cambios super anidados (ej: oclusion.armonia_maxilares.campo)
  const handleSuperNestedChange = useCallback((mainSection, subSection, field, value) => {
    const newData = {
      ...data[mainSection],
      [subSection]: {
        ...data[mainSection]?.[subSection],
        [field]: value
      }
    };
    handleChange(mainSection, newData);
  }, [data, handleChange]);

  // Definiciones de dientes según numeración FDI
  const dientesSuperiorDerecho = [18, 17, 16, 15, 14, 13, 12, 11];
  const dientesSuperiorIzquierdo = [21, 22, 23, 24, 25, 26, 27, 28];
  const dientesInferiorDerecho = [48, 47, 46, 45, 44, 43, 42, 41];
  const dientesInferiorIzquierdo = [31, 32, 33, 34, 35, 36, 37, 38];

  // Funciones para alteraciones dentales
  const agregarAlteracionDental = () => {
    const nuevasAlteraciones = [...(data.oclusion?.clasificacion_angle?.alteraciones_dentales || []), {
      diente: '',
      descripcion: ''
    }];
    handleSuperNestedChange('oclusion', 'clasificacion_angle', 'alteraciones_dentales', nuevasAlteraciones);
  };

  const eliminarAlteracionDental = (index) => {
    const nuevasAlteraciones = (data.oclusion?.clasificacion_angle?.alteraciones_dentales || []).filter((_, i) => i !== index);
    handleSuperNestedChange('oclusion', 'clasificacion_angle', 'alteraciones_dentales', nuevasAlteraciones);
  };

  const actualizarAlteracionDental = (index, campo, valor) => {
    const nuevasAlteraciones = [...(data.oclusion?.clasificacion_angle?.alteraciones_dentales || [])];
    nuevasAlteraciones[index] = { ...nuevasAlteraciones[index], [campo]: valor };
    handleSuperNestedChange('oclusion', 'clasificacion_angle', 'alteraciones_dentales', nuevasAlteraciones);
  };

  // Funciones para alteraciones gingivales
  const agregarAlteracionGingival = () => {
    const nuevasAlteraciones = [...(data.encias?.alteraciones_gingivales || []), {
      localizacion: '',
      descripcion: ''
    }];
    handleNestedChange('encias', 'alteraciones_gingivales', nuevasAlteraciones);
  };

  const eliminarAlteracionGingival = (index) => {
    const nuevasAlteraciones = (data.encias?.alteraciones_gingivales || []).filter((_, i) => i !== index);
    handleNestedChange('encias', 'alteraciones_gingivales', nuevasAlteraciones);
  };

  const actualizarAlteracionGingival = (index, campo, valor) => {
    const nuevasAlteraciones = [...(data.encias?.alteraciones_gingivales || [])];
    nuevasAlteraciones[index] = { ...nuevasAlteraciones[index], [campo]: valor };
    handleNestedChange('encias', 'alteraciones_gingivales', nuevasAlteraciones);
  };

  // Funciones para manejar el odontograma
  const toggleDienteEstado = (numeroDiente) => {
    const estadoActual = data.oclusion?.odontograma?.dientes_presentes?.[numeroDiente] || 'presente';
    const nuevoEstado = estadoActual === 'presente' ? 'ausente' : 'presente';
    
    const nuevosPresentes = { ...data.oclusion?.odontograma?.dientes_presentes };
    nuevosPresentes[numeroDiente] = nuevoEstado;
    
    handleSuperNestedChange('oclusion', 'odontograma', 'dientes_presentes', nuevosPresentes);
  };

  // Funciones para manejar el índice O'Leary
  const toggleSuperficiePlaca = (numeroSuperficie) => {
    const superficiesActuales = data.examen_higiene_oral?.superficies_placa || {};
    const nuevasSuperficies = {
      ...superficiesActuales,
      [numeroSuperficie]: !superficiesActuales[numeroSuperficie]
    };
    
    handleNestedChange('examen_higiene_oral', 'superficies_placa', nuevasSuperficies);
  };

  const calcularSuperficiesConPlaca = () => {
    const superficies = data.examen_higiene_oral?.superficies_placa || {};
    return Object.values(superficies).filter(Boolean).length;
  };

  const calcularIPDB = () => {
    const conPlaca = calcularSuperficiesConPlaca();
    const totalRevisadas = parseInt(data.examen_higiene_oral?.total_superficies_revisadas) || 128;
    
    if (totalRevisadas === 0) return '0%';
    
    const porcentaje = ((conPlaca / totalRevisadas) * 100).toFixed(1);
    return `${porcentaje}%`;
  };

  // Funciones para manejar el examen dental
const toggleEstadoDienteExamen = (numeroDiente, tipoMarca) => {
  const estadosActuales = data.examen_dental?.estados_dientes || {};
  const estadoDiente = estadosActuales[numeroDiente] || {};
  
  // Toggle del tipo de marca específico
  const nuevoEstado = {
    ...estadoDiente,
    [tipoMarca]: !estadoDiente[tipoMarca]
  };
  
  const nuevosEstados = {
    ...estadosActuales,
    [numeroDiente]: nuevoEstado
  };
  
  handleNestedChange('examen_dental', 'estados_dientes', nuevosEstados);
};

const getDienteExamenEstado = (numeroDiente, tipoMarca) => {
  return data.examen_dental?.estados_dientes?.[numeroDiente]?.[tipoMarca] || false;
};

// Funciones para manejar el periodontograma
const toggleEstadoPeriodonto = (numeroDiente, tipoLesion) => {
  const estadosActuales = data.periodontograma?.estados_periodonto || {};
  const estadoDiente = estadosActuales[numeroDiente] || {};
  
  // Toggle del tipo de lesión específico
  const nuevoEstado = {
    ...estadoDiente,
    [tipoLesion]: !estadoDiente[tipoLesion]
  };
  
  const nuevosEstados = {
    ...estadosActuales,
    [numeroDiente]: nuevoEstado
  };
  
  handleNestedChange('periodontograma', 'estados_periodonto', nuevosEstados);
};

const getPeriodontogramaEstado = (numeroDiente, tipoLesion) => {
  return data.periodontograma?.estados_periodonto?.[numeroDiente]?.[tipoLesion] || false;
};

const getColorRaizPeriodonto = (numeroDiente) => {
  const gingival = getPeriodontogramaEstado(numeroDiente, 'gingival');
  const periodontal = getPeriodontogramaEstado(numeroDiente, 'periodontal');
  
  if (gingival && periodontal) {
    return 'gingival-periodontal'; // Ambos
  } else if (gingival) {
    return 'gingival';
  } else if (periodontal) {
    return 'periodontal';
  } else {
    return '';
  }
};

// Funciones para manejar toque largo en móviles
const [touchStartTime, setTouchStartTime] = useState(0);
const [touchTimer, setTouchTimer] = useState(null);
const [isLongPress, setIsLongPress] = useState(false);

const handleTouchStart = useCallback((callback) => {
  return (e) => {
    const startTime = Date.now();
    setTouchStartTime(startTime);
    setIsLongPress(false);
    
    const timer = setTimeout(() => {
      setIsLongPress(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      // Ejecutar acción secundaria (equivalente a Ctrl+Click)
      callback(true);
    }, 500);
    
    setTouchTimer(timer);
  };
}, []);

const handleTouchEnd = useCallback((callback) => {
  return (e) => {
    e.preventDefault();
    
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
    
    const endTime = Date.now();
    const pressDuration = endTime - touchStartTime;
    
    // Si fue toque corto y no fue toque largo
    if (pressDuration < 500 && !isLongPress) {
      callback(false); // Acción principal
    }
    
    setIsLongPress(false);
  };
}, [touchTimer, touchStartTime, isLongPress]);

const handleClick = (callback, isSecondaryAction = false) => {
  return (e) => {
    // En desktop, usar Ctrl+Click para acción secundaria
    if (e.type === 'click') {
      e.preventDefault();
      if (isSecondaryAction && e.ctrlKey) {
        callback(true);
      } else if (!isSecondaryAction && !e.ctrlKey) {
        callback(false);
      }
    }
  };
};

// Función unificada para manejar interacciones
const createInteractionHandler = (callback) => {
  return {
    onTouchStart: handleTouchStart(callback, true),
    onTouchEnd: handleTouchEnd(callback, true),
    onClick: handleClick(callback, true),
    onContextMenu: (e) => e.preventDefault() // Evitar menú contextual
  };
};

  // Componente para renderizar un diente en el odontograma
  const DienteOdontograma = ({ numero, lado, posicion }) => {
    const estado = data.oclusion?.odontograma?.dientes_presentes?.[numero] || 'presente';
    const esPresente = estado === 'presente';
    
    return (
      <div 
        className={`diente-odontograma ${esPresente ? 'presente' : 'ausente'}`}
        onClick={() => toggleDienteEstado(numero)}
        title={`Diente ${numero} - ${esPresente ? 'Presente' : 'Ausente'}`}
      >
        <span className="numero-diente">{numero}</span>
        <div className={`indicador-estado ${esPresente ? 'presente' : 'ausente'}`}></div>
      </div>
    );
  };

  return (
    <div className="secciones-oclusion-container">
      {/* 16. Oclusión - Odontograma Principal */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">16. Oclusión</h4>
          <span className="intrabucal-badge dental">ODONTOGRAMA</span>
        </div>
        
        <div className="intrabucal-form-group">
          <p className="intrabucal-section-description">
            Señale con una diagonal azul los dientes presentes y con una roja los ausentes
          </p>
          
          {/* Odontograma Visual */}
          <div className="odontograma-container">
            {/* Arcada Superior */}
            <div className="arcada-superior">
              <div className="arcada-titulo">
                <span>ARCADA SUPERIOR</span>
              </div>
              
              <div className="cuadrantes-superiores">
                {/* Superior Derecho */}
                <div className="cuadrante superior-derecho">
                  <div className="cuadrante-titulo">C. Superior Derecho</div>
                  <div className="dientes-container">
                    {dientesSuperiorDerecho.map(numero => (
                      <DienteOdontograma key={numero} numero={numero} lado="derecho" posicion="superior" />
                    ))}
                  </div>
                </div>
                
                {/* Superior Izquierdo */}
                <div className="cuadrante superior-izquierdo">
                  <div className="cuadrante-titulo">C. Superior Izquierdo</div>
                  <div className="dientes-container">
                    {dientesSuperiorIzquierdo.map(numero => (
                      <DienteOdontograma key={numero} numero={numero} lado="izquierdo" posicion="superior" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Arcada Inferior */}
            <div className="arcada-inferior">
              <div className="cuadrantes-inferiores">
                {/* Inferior Derecho */}
                <div className="cuadrante inferior-derecho">
                  <div className="dientes-container">
                    {dientesInferiorDerecho.map(numero => (
                      <DienteOdontograma key={numero} numero={numero} lado="derecho" posicion="inferior" />
                    ))}
                  </div>
                  <div className="cuadrante-titulo">C. Inferior Derecho</div>
                </div>
                
                {/* Inferior Izquierdo */}
                <div className="cuadrante inferior-izquierdo">
                  <div className="dientes-container">
                    {dientesInferiorIzquierdo.map(numero => (
                      <DienteOdontograma key={numero} numero={numero} lado="izquierdo" posicion="inferior" />
                    ))}
                  </div>
                  <div className="cuadrante-titulo">C. Inferior Izquierdo</div>
                </div>
              </div>
              
              <div className="arcada-titulo">
                <span>ARCADA INFERIOR</span>
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="leyenda-odontograma">
            <div className="leyenda-item">
              <div className="indicador-presente"></div>
              <span>Presente</span>
            </div>
            <div className="leyenda-item">
              <div className="indicador-ausente"></div>
              <span>Ausente</span>
            </div>
          </div>

          {/* Observaciones del Odontograma */}
          <div className="intrabucal-field">
            <label className="intrabucal-label">Observaciones generales del odontograma</label>
            <textarea
              className="intrabucal-textarea"
              value={data.oclusion?.odontograma?.observaciones_generales || ''}
              onChange={(e) => handleSuperNestedChange('oclusion', 'odontograma', 'observaciones_generales', e.target.value)}
              placeholder="Describir hallazgos relevantes en el odontograma..."
            />
          </div>
        </div>
      </div>

      {/* 16.1 Armonía de los maxilares */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">16.1 Armonía de los Maxilares</h4>
          <span className="intrabucal-badge evaluacion">ANÁLISIS</span>
        </div>
        
        <div className="intrabucal-form-group">
          <p className="intrabucal-section-description">
            Evaluación de la forma y dimensiones de los arcos dentarios
          </p>

          <div className="intrabucal-grid-3">
            {/* Amplitud del arco dentario Superior */}
            <div className="intrabucal-field">
              <label className="intrabucal-label">Amplitud del arco dentario Superior</label>
              <select
                className="intrabucal-select"
                value={data.oclusion?.armonia_maxilares?.amplitud_arco_superior || ''}
                onChange={(e) => handleSuperNestedChange('oclusion', 'armonia_maxilares', 'amplitud_arco_superior', e.target.value)}
              >
                <option value="">Seleccionar...</option>
                <option value="Amplio (cuadrado)">Amplio (cuadrado)</option>
                <option value="Normal (oval)">Normal (oval)</option>
                <option value="Estrecho (triangular)">Estrecho (triangular)</option>
              </select>
            </div>

            {/* Bóveda palatina */}
            <div className="intrabucal-field">
              <label className="intrabucal-label">Bóveda palatina</label>
              <select
                className="intrabucal-select"
                value={data.oclusion?.armonia_maxilares?.boveda_palatina || ''}
                onChange={(e) => handleSuperNestedChange('oclusion', 'armonia_maxilares', 'boveda_palatina', e.target.value)}
              >
                <option value="">Seleccionar...</option>
                <option value="Plana">Plana</option>
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            {/* Amplitud del arco dentario inferior */}
            <div className="intrabucal-field">
              <label className="intrabucal-label">Amplitud del arco dentario inferior</label>
              <select
                className="intrabucal-select"
                value={data.oclusion?.armonia_maxilares?.amplitud_arco_inferior || ''}
                onChange={(e) => handleSuperNestedChange('oclusion', 'armonia_maxilares', 'amplitud_arco_inferior', e.target.value)}
              >
                <option value="">Seleccionar...</option>
                <option value="Amplio (cuadrado)">Amplio (cuadrado)</option>
                <option value="Normal (oval)">Normal (oval)</option>
                <option value="Estrecho (triangular)">Estrecho (triangular)</option>
              </select>
            </div>
          </div>

          {/* Descripción de la armonía */}
          <div className="intrabucal-field">
            <label className="intrabucal-label">Descripción de la armonía de los maxilares</label>
            <textarea
              className="intrabucal-textarea"
              value={data.oclusion?.armonia_maxilares?.descripcion_armonia || ''}
              onChange={(e) => handleSuperNestedChange('oclusion', 'armonia_maxilares', 'descripcion_armonia', e.target.value)}
              placeholder="Describir la armonía general de los maxilares..."
            />
          </div>
        </div>
      </div>

      {/* 16.2 Simetría del arco */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">16.2 Simetría del Arco</h4>
          <span className="intrabucal-badge dental">MEDIDAS</span>
        </div>
        
        <div className="intrabucal-form-group">
          <p className="intrabucal-section-description">
            Mediciones de las relaciones espaciales del arco dentario
          </p>

          <div className="intrabucal-grid-2">
            {/* Relación antero-posterior */}
            <div className="intrabucal-subsection">
              <h5 className="intrabucal-subsection-title">Relación antero-posterior</h5>
              <div className="intrabucal-grid-2">
                <div className="intrabucal-field">
                  <label className="intrabucal-label">Derecho (mm)</label>
                  <input
                    type="text"
                    className="intrabucal-input"
                    value={data.oclusion?.simetria_arco?.relacion_antero_posterior_derecho || ''}
                    onChange={(e) => handleSuperNestedChange('oclusion', 'simetria_arco', 'relacion_antero_posterior_derecho', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="intrabucal-field">
                  <label className="intrabucal-label">Izquierdo (mm)</label>
                  <input
                    type="text"
                    className="intrabucal-input"
                    value={data.oclusion?.simetria_arco?.relacion_antero_posterior_izquierdo || ''}
                    onChange={(e) => handleSuperNestedChange('oclusion', 'simetria_arco', 'relacion_antero_posterior_izquierdo', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Relación buco lingual */}
            <div className="intrabucal-subsection">
              <h5 className="intrabucal-subsection-title">Relación buco lingual</h5>
              <div className="intrabucal-grid-2">
                <div className="intrabucal-field">
                  <label className="intrabucal-label">Derecho (mm)</label>
                  <input
                    type="text"
                    className="intrabucal-input"
                    value={data.oclusion?.simetria_arco?.relacion_buco_lingual_derecho || ''}
                    onChange={(e) => handleSuperNestedChange('oclusion', 'simetria_arco', 'relacion_buco_lingual_derecho', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="intrabucal-field">
                  <label className="intrabucal-label">Izquierdo (mm)</label>
                  <input
                    type="text"
                    className="intrabucal-input"
                    value={data.oclusion?.simetria_arco?.relacion_buco_lingual_izquierdo || ''}
                    onChange={(e) => handleSuperNestedChange('oclusion', 'simetria_arco', 'relacion_buco_lingual_izquierdo', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 16.3 Maloclusiones - Clasificación de Angle */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">16.3 Maloclusiones - Clasificación de Angle</h4>
          <span className="intrabucal-badge dental">ANGLE</span>
        </div>
        
        <div className="intrabucal-form-group">
          <p className="intrabucal-section-description">
            Evaluación de la oclusión según la clasificación de Angle y relaciones dentales
          </p>

          {/* Clasificación de Angle */}
          <div className="intrabucal-subsection">
            <h5 className="intrabucal-subsection-title">Clasificación de Angle</h5>
            <div className="intrabucal-grid-2">
              {/* Relación Molar */}
              <div className="intrabucal-angle-section">
                <h6 className="intrabucal-angle-title">Relación Molar</h6>
                <div className="intrabucal-grid-2">
                  <div className="intrabucal-field">
                    <label className="intrabucal-label">Derecho</label>
                    <select
                      className="intrabucal-select"
                      value={data.oclusion?.clasificacion_angle?.relacion_molar_derecho || ''}
                      onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'relacion_molar_derecho', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Clase I">Clase I</option>
                      <option value="Clase II">Clase II</option>
                      <option value="Clase III">Clase III</option>
                    </select>
                  </div>
                  <div className="intrabucal-field">
                    <label className="intrabucal-label">Izquierdo</label>
                    <select
                      className="intrabucal-select"
                      value={data.oclusion?.clasificacion_angle?.relacion_molar_izquierdo || ''}
                      onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'relacion_molar_izquierdo', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Clase I">Clase I</option>
                      <option value="Clase II">Clase II</option>
                      <option value="Clase III">Clase III</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Relación Canina */}
              <div className="intrabucal-angle-section">
                <h6 className="intrabucal-angle-title">Relación Canina</h6>
                <div className="intrabucal-grid-2">
                  <div className="intrabucal-field">
                    <label className="intrabucal-label">Derecho</label>
                    <select
                      className="intrabucal-select"
                      value={data.oclusion?.clasificacion_angle?.relacion_canina_derecho || ''}
                      onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'relacion_canina_derecho', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Clase I">Clase I</option>
                      <option value="Clase II">Clase II</option>
                      <option value="Clase III">Clase III</option>
                    </select>
                  </div>
                  <div className="intrabucal-field">
                    <label className="intrabucal-label">Izquierdo</label>
                    <select
                      className="intrabucal-select"
                      value={data.oclusion?.clasificacion_angle?.relacion_canina_izquierdo || ''}
                      onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'relacion_canina_izquierdo', e.target.value)}
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

          {/* Relación dental */}
          <div className="intrabucal-subsection">
            <h5 className="intrabucal-subsection-title">Relación dental</h5>
            <div className="intrabucal-grid-3">
              <div className="intrabucal-field">
                <label className="intrabucal-label">Sobre-mordida vertical (Over Bite)</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.clasificacion_angle?.sobremordida_vertical || ''}
                  onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'sobremordida_vertical', e.target.value)}
                  placeholder="Describir..."
                />
              </div>
              <div className="intrabucal-field">
                <label className="intrabucal-label">Sobre-mordida Horizontal (Over Jet)</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.clasificacion_angle?.sobremordida_horizontal || ''}
                  onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'sobremordida_horizontal', e.target.value)}
                  placeholder="Describir..."
                />
              </div>
              <div className="intrabucal-field">
                <label className="intrabucal-label">Borde a borde</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.clasificacion_angle?.borde_a_borde || ''}
                  onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'borde_a_borde', e.target.value)}
                  placeholder="Describir..."
                />
              </div>
              <div className="intrabucal-field">
                <label className="intrabucal-label">Mordida abierta</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.clasificacion_angle?.mordida_abierta || ''}
                  onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'mordida_abierta', e.target.value)}
                  placeholder="Describir..."
                />
              </div>
              <div className="intrabucal-field">
                <label className="intrabucal-label">Mordida cruzada anterior</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.clasificacion_angle?.mordida_cruzada_anterior || ''}
                  onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'mordida_cruzada_anterior', e.target.value)}
                  placeholder="Describir..."
                />
              </div>
              <div className="intrabucal-field">
                <label className="intrabucal-label">Mordida cruzada posterior</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.clasificacion_angle?.mordida_cruzada_posterior || ''}
                  onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'mordida_cruzada_posterior', e.target.value)}
                  placeholder="Describir..."
                />
              </div>

              <div className="intrabucal-field">
                <label className="intrabucal-label">Relación de la línea media maxilar</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.clasificacion_angle?.linea_media_maxilar || ''}
                  onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'linea_media_maxilar', e.target.value)}
                  placeholder="Describir..."
                />
              </div>
              <div className="intrabucal-field">
                <label className="intrabucal-label">Relación de la línea media mandibular</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.clasificacion_angle?.linea_media_mandibular || ''}
                  onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'linea_media_mandibular', e.target.value)}
                  placeholder="Describir..."
                />
              </div>
              <div className="intrabucal-field">
                <label className="intrabucal-label">Diastemas</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.clasificacion_angle?.diastemas || ''}
                  onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'diastemas', e.target.value)}
                  placeholder="Describir..."
                />
              </div>
              <div className="intrabucal-field">
                <label className="intrabucal-label">Apiñamiento</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.clasificacion_angle?.apiñamiento || ''}
                  onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'apiñamiento', e.target.value)}
                  placeholder="Describir..."
                />
              </div>
              <div className="intrabucal-field">
                <label className="intrabucal-label">Facetas de desgaste</label>
                <input
                  type="text"
                  className="intrabucal-input"
                  value={data.oclusion?.clasificacion_angle?.facetas_desgaste || ''}
                  onChange={(e) => handleSuperNestedChange('oclusion', 'clasificacion_angle', 'facetas_desgaste', e.target.value)}
                  placeholder="Describir..."
                />
              </div>
            </div>
          </div>

          {/* 16.4 Alteraciones dentales */}
          <div className="intrabucal-subsection">
            <div className="intrabucal-alteraciones-header">
              <h5 className="intrabucal-alteraciones-title">16.4 Alteraciones dentales (Forma, tamaño, número, estructura, color, posición, erupción)</h5>
              <button
                type="button"
                onClick={agregarAlteracionDental}
                className="intrabucal-btn-add"
              >
                + Agregar alteración
              </button>
            </div>

            {(data.oclusion?.clasificacion_angle?.alteraciones_dentales || []).map((alteracion, index) => (
              <div key={index} className="intrabucal-alteracion-item">
                <div className="intrabucal-alteracion-header">
                  <h6 className="intrabucal-alteracion-title">Alteración {index + 1}</h6>
                  <button
                    type="button"
                    onClick={() => eliminarAlteracionDental(index)}
                    className="intrabucal-btn-remove"
                  >
                    Eliminar
                  </button>
                </div>
                
                <div className="intrabucal-alteracion-fields">
                  <div className="intrabucal-small-field">
                    <label className="intrabucal-small-label">Diente(s)</label>
                    <input
                      type="text"
                      className="intrabucal-small-input"
                      value={alteracion.diente || ''}
                      onChange={(e) => actualizarAlteracionDental(index, 'diente', e.target.value)}
                      placeholder="Ej: 11, 21, etc."
                    />
                  </div>
                  
                  <div className="intrabucal-small-field">
                    <label className="intrabucal-small-label">Descripción</label>
                    <input
                      type="text"
                      className="intrabucal-small-input"
                      value={alteracion.descripcion || ''}
                      onChange={(e) => actualizarAlteracionDental(index, 'descripcion', e.target.value)}
                      placeholder="Describir alteración dental..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

{/* 17. Examen de higiene oral (O'Leary) */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">17. Examen de Higiene Oral (O'Leary)</h4>
          <span className="intrabucal-badge higiene">ÍNDICE</span>
        </div>
        
        <div className="intrabucal-form-group">
          <p className="intrabucal-section-description">
            Índice de placa dentobacteriana según O'Leary - Haga clic en cada superficie para marcar presencia/ausencia de placa
          </p>
          
          {/* Simulación INTERACTIVA del índice O'Leary */}
          <div className="oleary-container">
            <h6 className="oleary-titulo">ÍNDICE DE PLACA DENTOBACTERIANA</h6>
            
            <div className="oleary-grid">
              {/* Superficies interactivas con placa */}
              {Array.from({length: 32}, (_, i) => {
                const numeroSuperficie = i + 1;
                const tieneePlaca = data.examen_higiene_oral?.superficies_placa?.[numeroSuperficie] || false;
                
                return (
                  <div 
                    key={i} 
                    className={`oleary-diente ${tieneePlaca ? 'con-placa' : 'sin-placa'}`}
                    onClick={() => toggleSuperficiePlaca(numeroSuperficie)}
                    title={`Superficie ${numeroSuperficie} - ${tieneePlaca ? 'Con placa' : 'Sin placa'}`}
                    style={{ cursor: 'pointer' }}
                  >
                    {numeroSuperficie}
                  </div>
                );
              })}
            </div>
            
            <div className="oleary-leyenda">
              <div className="leyenda-item">
                <div className="indicador-con-placa"></div>
                <span>Con placa</span>
              </div>
              <div className="leyenda-item">
                <div className="indicador-sin-placa"></div>
                <span>Sin placa</span>
              </div>
            </div>
          </div>

          {/* Campos de datos del índice */}
          <div className="intrabucal-grid-4">
            <div className="intrabucal-field">
              <label className="intrabucal-label">No. Total de dientes</label>
              <input
                type="number"
                className="intrabucal-input"
                value={data.examen_higiene_oral?.numero_total_dientes || ''}
                onChange={(e) => handleNestedChange('examen_higiene_oral', 'numero_total_dientes', e.target.value)}
                placeholder="32"
              />
            </div>
            <div className="intrabucal-field">
              <label className="intrabucal-label">Superficies con placa</label>
              <input
                type="number"
                className="intrabucal-input"
                value={calcularSuperficiesConPlaca()}
                readOnly
                style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}
              />
            </div>
            <div className="intrabucal-field">
              <label className="intrabucal-label">Total de superficies revisadas</label>
              <input
                type="number"
                className="intrabucal-input"
                value={data.examen_higiene_oral?.total_superficies_revisadas || ''}
                onChange={(e) => handleNestedChange('examen_higiene_oral', 'total_superficies_revisadas', e.target.value)}
                placeholder="128"
              />
            </div>
            <div className="intrabucal-field">
              <label className="intrabucal-label">IPDB %</label>
              <input
                type="text"
                className="intrabucal-input ipdb-resultado"
                value={calcularIPDB()}
                readOnly
                style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}
              />
            </div>
          </div>

          <div className="intrabucal-field">
            <label className="intrabucal-label">Observaciones del examen de higiene oral</label>
            <textarea
              className="intrabucal-textarea"
              value={data.examen_higiene_oral?.observaciones_oleary || ''}
              onChange={(e) => handleNestedChange('examen_higiene_oral', 'observaciones_oleary', e.target.value)}
              placeholder="Observaciones sobre el índice de placa y higiene oral..."
            />
          </div>
        </div>
      </div>

      {/* 18. Encías (alteraciones gingivales papilares y de la inserción) */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">18. Encías</h4>
          <span className="intrabucal-badge encias">GINGIVALES</span>
        </div>
        
        <div className="intrabucal-form-group">
          <p className="intrabucal-section-description">
            Alteraciones gingivales papilares y de la inserción
          </p>

          <div className="intrabucal-subsection">
            <div className="intrabucal-alteraciones-header">
              <h5 className="intrabucal-alteraciones-title">Alteraciones gingivales</h5>
              <button
                type="button"
                onClick={agregarAlteracionGingival}
                className="intrabucal-btn-add"
              >
                + Agregar alteración
              </button>
            </div>

            {(data.encias?.alteraciones_gingivales || []).map((alteracion, index) => (
              <div key={index} className="intrabucal-alteracion-item">
                <div className="intrabucal-alteracion-header">
                  <h6 className="intrabucal-alteracion-title">Alteración gingival {index + 1}</h6>
                  <button
                    type="button"
                    onClick={() => eliminarAlteracionGingival(index)}
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
                      onChange={(e) => actualizarAlteracionGingival(index, 'localizacion', e.target.value)}
                      placeholder="Ej: Encía marginal superior anterior"
                    />
                  </div>
                  
                  <div className="intrabucal-small-field">
                    <label className="intrabucal-small-label">Descripción de la alteración</label>
                    <input
                      type="text"
                      className="intrabucal-small-input"
                      value={alteracion.descripcion || ''}
                      onChange={(e) => actualizarAlteracionGingival(index, 'descripcion', e.target.value)}
                      placeholder="Describir alteración gingival..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="intrabucal-field">
            <label className="intrabucal-label">Localizaciones afectadas (resumen)</label>
            <textarea
              className="intrabucal-textarea"
              value={data.encias?.localizaciones_afectadas || ''}
              onChange={(e) => handleNestedChange('encias', 'localizaciones_afectadas', e.target.value)}
              placeholder="Resumen de las localizaciones gingivales afectadas..."
            />
          </div>
        </div>
      </div>

      {/* 19. Examen dental */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">19. Examen Dental</h4>
          <span className="intrabucal-badge dental">DENTAL</span>
        </div>
        
        <div className="intrabucal-form-group">
          <p className="intrabucal-section-description">
            Haga clic en las superficies de cada diente para marcar caries (rojo) u obturaciones (azul)
          </p>

          {/* Representación visual INTERACTIVA del examen dental */}
          <div className="examen-dental-container">
            <div className="examen-dental-titulo">Registro de Hallazgos Dentales</div>
            
            <div className="dental-grid superior">
              {/* Arcada superior */}
              {dientesSuperiorDerecho.concat(dientesSuperiorIzquierdo).map(numero => (
                <div key={numero} className="diente-examen">
                  <span className="numero-diente-examen">{numero}</span>
                  {/* Superficies interactivas del diente */}
                  <div className="marcas-examen">
                    <div 
                      className={`marca superficie-mesial ${getDienteExamenEstado(numero, 'mesial_caries') ? 'caries' : ''} ${getDienteExamenEstado(numero, 'mesial_obturacion') ? 'obturacion' : ''}`}
                      onTouchStart={handleTouchStart((isSecondary) => {
                        if (isSecondary) {
                          toggleEstadoDienteExamen(numero, 'mesial_obturacion');
                        } else {
                          toggleEstadoDienteExamen(numero, 'mesial_caries');
                        }
                      })}
                      onTouchEnd={handleTouchEnd((isSecondary) => {
                        if (isSecondary) {
                          toggleEstadoDienteExamen(numero, 'mesial_obturacion');
                        } else {
                          toggleEstadoDienteExamen(numero, 'mesial_caries');
                        }
                      })}
                      onClick={(e) => {
                        e.preventDefault();
                        if (e.ctrlKey) {
                          toggleEstadoDienteExamen(numero, 'mesial_obturacion');
                        } else {
                          toggleEstadoDienteExamen(numero, 'mesial_caries');
                        }
                      }}
                      title="Mesial - Toque: Caries | Toque largo: Obturación"
                    ></div>
                    <div 
                      className={`marca superficie-distal ${getDienteExamenEstado(numero, 'distal_caries') ? 'caries' : ''} ${getDienteExamenEstado(numero, 'distal_obturacion') ? 'obturacion' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (e.ctrlKey) {
                          toggleEstadoDienteExamen(numero, 'distal_obturacion');
                        } else {
                          toggleEstadoDienteExamen(numero, 'distal_caries');
                        }
                      }}
                      title="Distal - Click: Caries | Ctrl+Click: Obturación"
                    ></div>
                    <div 
                      className={`marca superficie-vestibular ${getDienteExamenEstado(numero, 'vestibular_caries') ? 'caries' : ''} ${getDienteExamenEstado(numero, 'vestibular_obturacion') ? 'obturacion' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (e.ctrlKey) {
                          toggleEstadoDienteExamen(numero, 'vestibular_obturacion');
                        } else {
                          toggleEstadoDienteExamen(numero, 'vestibular_caries');
                        }
                      }}
                      title="Vestibular - Click: Caries | Ctrl+Click: Obturación"
                    ></div>
                    <div 
                      className={`marca superficie-lingual ${getDienteExamenEstado(numero, 'lingual_caries') ? 'caries' : ''} ${getDienteExamenEstado(numero, 'lingual_obturacion') ? 'obturacion' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (e.ctrlKey) {
                          toggleEstadoDienteExamen(numero, 'lingual_obturacion');
                        } else {
                          toggleEstadoDienteExamen(numero, 'lingual_caries');
                        }
                      }}
                      title="Lingual - Click: Caries | Ctrl+Click: Obturación"
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="dental-grid inferior">
              {/* Arcada inferior */}
              {dientesInferiorDerecho.concat(dientesInferiorIzquierdo).map(numero => (
                <div key={numero} className="diente-examen">
                  <span className="numero-diente-examen">{numero}</span>
                  <div className="marcas-examen">
                    <div 
                      className={`marca superficie-mesial ${getDienteExamenEstado(numero, 'mesial_caries') ? 'caries' : ''} ${getDienteExamenEstado(numero, 'mesial_obturacion') ? 'obturacion' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (e.ctrlKey) {
                          toggleEstadoDienteExamen(numero, 'mesial_obturacion');
                        } else {
                          toggleEstadoDienteExamen(numero, 'mesial_caries');
                        }
                      }}
                      title="Mesial - Click: Caries | Ctrl+Click: Obturación"
                    ></div>
                    <div 
                      className={`marca superficie-distal ${getDienteExamenEstado(numero, 'distal_caries') ? 'caries' : ''} ${getDienteExamenEstado(numero, 'distal_obturacion') ? 'obturacion' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (e.ctrlKey) {
                          toggleEstadoDienteExamen(numero, 'distal_obturacion');
                        } else {
                          toggleEstadoDienteExamen(numero, 'distal_caries');
                        }
                      }}
                      title="Distal - Click: Caries | Ctrl+Click: Obturación"
                    ></div>
                    <div 
                      className={`marca superficie-vestibular ${getDienteExamenEstado(numero, 'vestibular_caries') ? 'caries' : ''} ${getDienteExamenEstado(numero, 'vestibular_obturacion') ? 'obturacion' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (e.ctrlKey) {
                          toggleEstadoDienteExamen(numero, 'vestibular_obturacion');
                        } else {
                          toggleEstadoDienteExamen(numero, 'vestibular_caries');
                        }
                      }}
                      title="Vestibular - Click: Caries | Ctrl+Click: Obturación"
                    ></div>
                    <div 
                      className={`marca superficie-lingual ${getDienteExamenEstado(numero, 'lingual_caries') ? 'caries' : ''} ${getDienteExamenEstado(numero, 'lingual_obturacion') ? 'obturacion' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (e.ctrlKey) {
                          toggleEstadoDienteExamen(numero, 'lingual_obturacion');
                        } else {
                          toggleEstadoDienteExamen(numero, 'lingual_caries');
                        }
                      }}
                      title="Lingual - Click: Caries | Ctrl+Click: Obturación"
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leyenda del examen dental */}
            <div className="leyenda-examen-dental">
              <div className="leyenda-item">
                <div className="indicador-caries"></div>
                <span>Caries (Click normal)</span>
              </div>
              <div className="leyenda-item">
                <div className="indicador-obturacion"></div>
                <span>Obturación (Ctrl + Click)</span>
              </div>
            </div>
            
            {/* Instrucciones */}
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <strong>Instrucciones:</strong> Click normal = Caries | Ctrl + Click = Obturación
            </div>
          </div>

          <div className="intrabucal-field">
            <label className="intrabucal-label">Hallazgos del examen dental</label>
            <textarea
              className="intrabucal-textarea"
              value={data.examen_dental?.hallazgos_dentales || ''}
              onChange={(e) => handleNestedChange('examen_dental', 'hallazgos_dentales', e.target.value)}
              placeholder="Describir hallazgos del examen dental: caries, obturaciones, fracturas, etc..."
            />
          </div>

          <div className="intrabucal-field">
            <label className="intrabucal-label">Procedimientos realizados</label>
            <textarea
              className="intrabucal-textarea"
              value={data.examen_dental?.procedimientos_realizados || ''}
              onChange={(e) => handleNestedChange('examen_dental', 'procedimientos_realizados', e.target.value)}
              placeholder="Describir procedimientos realizados durante el examen..."
            />
          </div>
        </div>
      </div>

      {/* 20. Periodontograma */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">20. Periodontograma</h4>
          <span className="intrabucal-badge periodonto">PERIODONTO</span>
        </div>
        
        <div className="intrabucal-form-group">
          <p className="intrabucal-section-description">
            Haga clic en las raíces para marcar lesiones gingivales (rojo) o periodontales (azul). Ctrl+Click para periodontales.
          </p>

          {/* Representación visual INTERACTIVA del periodontograma */}
          <div className="periodontograma-container">
            <div className="periodontograma-titulo">Periodontograma</div>
            
            {/* Representación esquemática de dientes con raíces INTERACTIVAS */}
            <div className="periodonto-visual">
              {/* Arcada superior */}
              <div className="periodonto-superior">
                {Array.from({length: 16}, (_, i) => {
                  const numeroDiente = 18 - i > 10 ? 18 - i : 21 + (i - 8);
                  const colorRaiz = getColorRaizPeriodonto(numeroDiente);
                  
                  return (
                    <div key={i} className="diente-periodonto">
                      {/* Corona */}
                      <div className="corona-periodonto">
                        {numeroDiente}
                      </div>
                      {/* Raíz con indicadores periodontales INTERACTIVA */}
                    <div 
                      className={`raiz-periodonto superior ${colorRaiz} interactiva`}
                      onTouchStart={handleTouchStart((isSecondary) => {
                        if (isSecondary) {
                          toggleEstadoPeriodonto(numeroDiente, 'periodontal');
                        } else {
                          toggleEstadoPeriodonto(numeroDiente, 'gingival');
                        }
                      })}
                      onTouchEnd={handleTouchEnd((isSecondary) => {
                        if (isSecondary) {
                          toggleEstadoPeriodonto(numeroDiente, 'periodontal');
                        } else {
                          toggleEstadoPeriodonto(numeroDiente, 'gingival');
                        }
                      })}
                      onClick={(e) => {
                        e.preventDefault();
                        if (e.ctrlKey) {
                          toggleEstadoPeriodonto(numeroDiente, 'periodontal');
                        } else {
                          toggleEstadoPeriodonto(numeroDiente, 'gingival');
                        }
                      }}
                      title={`Diente ${numeroDiente} - Toque: Gingival | Toque largo: Periodontal`}
                    ></div>
                    </div>
                  );
                })}
              </div>

              {/* Arcada inferior */}
              <div className="periodonto-inferior">
                {Array.from({length: 16}, (_, i) => {
                  const numeroDiente = 48 - i > 40 ? 48 - i : 31 + (i - 8);
                  const colorRaiz = getColorRaizPeriodonto(numeroDiente);
                  
                  return (
                    <div key={i} className="diente-periodonto">
                      {/* Raíz con indicadores periodontales INTERACTIVA */}
                      <div 
                        className={`raiz-periodonto inferior ${colorRaiz} interactiva`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (e.ctrlKey) {
                            toggleEstadoPeriodonto(numeroDiente, 'periodontal');
                          } else {
                            toggleEstadoPeriodonto(numeroDiente, 'gingival');
                          }
                        }}
                        title={`Diente ${numeroDiente} - Click: Gingival | Ctrl+Click: Periodontal`}
                      ></div>
                      {/* Corona */}
                      <div className="corona-periodonto">
                        {numeroDiente}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leyenda del periodontograma */}
            <div className="leyenda-periodonto">
              <div className="leyenda-item">
                <div className="indicador-gingival"></div>
                <span>Lesiones gingivales (Click normal)</span>
              </div>
              <div className="leyenda-item">
                <div className="indicador-periodontal"></div>
                <span>Lesiones periodontales (Ctrl + Click)</span>
              </div>
              <div className="leyenda-item">
                <div className="indicador-mixto"></div>
                <span>Ambas lesiones</span>
              </div>
            </div>
            
            {/* Instrucciones */}
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <strong>Instrucciones:</strong> Click normal = Lesión gingival | Ctrl + Click = Lesión periodontal
            </div>
          </div>

          <div className="intrabucal-field">
            <label className="intrabucal-label">Observaciones del periodontograma</label>
            <textarea
              className="intrabucal-textarea"
              value={data.periodontograma?.observaciones_periodonto || ''}
              onChange={(e) => handleNestedChange('periodontograma', 'observaciones_periodonto', e.target.value)}
              placeholder="Describir hallazgos periodontales: profundidad de sondaje, sangrado, movilidad, etc..."
            />
          </div>
        </div>
      </div>

      {/* 21. Modelos de estudio */}
      <div className="intrabucal-section-card">
        <div className="intrabucal-card-header">
          <h4 className="intrabucal-card-title">21. Modelos de Estudio</h4>
          <span className="intrabucal-badge modelos">ANÁLISIS</span>
        </div>
        
        <div className="intrabucal-form-group">
          <p className="intrabucal-section-description">
            Anexar análisis de modelos - Hallazgos relevantes del estudio
          </p>

          {/* Campo principal para hallazgos */}
          <div className="intrabucal-field">
            <label className="intrabucal-label">Hallazgos de los modelos de estudio</label>
            <textarea
              className="intrabucal-textarea"
              value={data.modelos_estudio?.hallazgos || ''}
              onChange={(e) => handleNestedChange('modelos_estudio', 'hallazgos', e.target.value)}
              placeholder="Describir hallazgos relevantes del análisis de modelos de estudio..."
            />
          </div>

          {/* Información adicional sobre modelos */}
          <div className="modelos-info-container">
            <h6 className="modelos-info-titulo">📋 Información sobre Modelos de Estudio</h6>
            <p className="modelos-info-texto">
              Los modelos de estudio proporcionan información detallada sobre la morfología dental, 
              relaciones oclusales, y permiten realizar mediciones precisas para el plan de tratamiento. 
              Incluir análisis de simetría, espacios disponibles, y discrepancias de Bolton si corresponde.
            </p>
          </div>
        </div>
      </div>

      {/* Nota informativa final */}
      <div className="intrabucal-info-note">
        <div className="intrabucal-info-icon">ℹ️</div>
        <div className="intrabucal-info-content">
          <h6>Información importante - Secciones de Oclusión Completadas</h6>
          <p>
            Se han completado todas las secciones relacionadas con oclusión y exámenes complementarios:
          </p>
          <ul>
            <li><strong>16. Oclusión:</strong> Odontograma interactivo con subcategorías numeradas</li>
            <li><strong>16.1 Armonía de maxilares:</strong> Análisis de forma y dimensiones</li>
            <li><strong>16.2 Simetría del arco:</strong> Mediciones espaciales</li>
            <li><strong>16.3 Clasificación de Angle:</strong> Evaluación oclusal completa</li>
            <li><strong>16.4 Alteraciones dentales:</strong> Registro detallado</li>
            <li><strong>17. Examen de higiene oral (O'Leary):</strong> Índice de placa</li>
            <li><strong>18. Encías:</strong> Alteraciones gingivales</li>
            <li><strong>19. Examen dental:</strong> Registro de lesiones</li>
            <li><strong>20. Periodontograma:</strong> Evaluación periodontal</li>
            <li><strong>21. Modelos de estudio:</strong> Análisis complementario</li>
          </ul>
          <p className="instrucciones-uso">
            <strong>Instrucciones:</strong> 
            • Haga clic en los dientes del odontograma para marcarlos como presentes (azul) o ausentes (rojo)
            <br />
            • Complete todas las secciones para un registro clínico integral
            <br />
            • Las subcategorías 16.1-16.4 mantienen la numeración según el formato PDF oficial
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeccionesOclusion;