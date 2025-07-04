import React, { useState, useRef, useEffect } from 'react';
import '../css/Odontograma3D.css';

// Estados dentales
const TOOTH_STATES = {
  healthy: { color: '#fafafa', label: 'Sano', code: 'S' },
  caries: { color: '#8B4513', label: 'Caries', code: 'C' },
  filled: { color: '#C0C0C0', label: 'Obturado', code: 'O' },
  crowned: { color: '#FFD700', label: 'Corona', code: 'CR' },
  missing: { color: '#ff0000', label: 'Ausente', code: 'A' },
  root: { color: '#8B0000', label: 'Resto Radicular', code: 'RR' },
  extracted: { color: '#ff4444', label: 'Extraído', code: 'E' },
  implant: { color: '#4169e1', label: 'Implante', code: 'I' }
};

// Caras dentales
const TOOTH_FACES = {
  vestibular: { label: 'Vestibular', color: '#4CAF50', abbr: 'V' },
  lingual: { label: 'Lingual', color: '#2196F3', abbr: 'L' },
  mesial: { label: 'Mesial', color: '#FF9800', abbr: 'M' },
  distal: { label: 'Distal', color: '#9C27B0', abbr: 'D' },
  incisal: { label: 'Incisal', color: '#F44336', abbr: 'I' },
  oclusal: { label: 'Oclusal', color: '#795548', abbr: 'O' }
};

// Tercios dentales
const TOOTH_THIRDS = {
  cervical: { label: 'Cervical', color: '#E91E63', abbr: 'C' },
  medio: { label: 'Medio', color: '#673AB7', abbr: 'M' },
  incisal: { label: 'Incisal/Oclusal', color: '#3F51B5', abbr: 'I' }
};

// Numeración dental FDI
const TOOTH_NUMBERS = {
  upper: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  lower: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
};

// Componente del SVG del odontograma
function OdontogramaSVG({ 
  toothStates, 
  selectedTooth, 
  selectedFace, 
  selectedThird, 
  onToothSelect 
}) {
  const svgRef = useRef();

  // Función para obtener el color del diente basado en su estado
  const getToothColor = (toothNumber) => {
    const key = `${toothNumber}-${selectedFace}-${selectedThird}`;
    const state = toothStates[key];
    
    if (selectedTooth === toothNumber) {
      return '#ffeb3b'; // Amarillo para seleccionado
    }
    
    if (state) {
      return TOOTH_STATES[state]?.color || '#fafafa';
    }
    
    return '#fafafa'; // Color natural del diente
  };

  // Función para obtener el color del borde basado en la cara seleccionada
  const getBorderColor = (toothNumber) => {
    if (selectedTooth === toothNumber) {
      return TOOTH_FACES[selectedFace]?.color || '#4CAF50';
    }
    return '#323232'; // Color normal
  };

  // Función para obtener el stroke width basado en el tercio
  const getStrokeWidth = (toothNumber) => {
    if (selectedTooth === toothNumber) {
      switch (selectedThird) {
        case 'cervical': return '4';
        case 'medio': return '6';
        case 'incisal': return '8';
        default: return '2';
      }
    }
    return '1';
  };

  const handleToothClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const toothElement = event.target.closest('.tooth');
    if (toothElement) {
      const toothNumber = parseInt(toothElement.getAttribute('data-title'));
      if (toothNumber && onToothSelect) {
        onToothSelect(toothNumber, selectedFace, selectedThird);
      }
    }
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      // Actualizar colores de todos los dientes
      const toothElements = svg.querySelectorAll('.tooth');
      toothElements.forEach(toothElement => {
        const toothNumber = parseInt(toothElement.getAttribute('data-title'));
        const fillElements = toothElement.querySelectorAll('.fil0');
        const borderElements = toothElement.querySelectorAll('.fil1');
        
        fillElements.forEach(el => {
          el.style.fill = getToothColor(toothNumber);
        });
        
        borderElements.forEach(el => {
          el.style.stroke = getBorderColor(toothNumber);
          el.style.strokeWidth = getStrokeWidth(toothNumber);
          el.style.fill = '#323232';
        });
      });
    }
  }, [toothStates, selectedTooth, selectedFace, selectedThird]);

  return (
    <div className="tooth-wrapper">
      <svg 
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg" 
        xmlSpace="preserve" 
        width="49mm" 
        height="91mm" 
        version="1.0" 
        className="odontograma-svg"
        viewBox="0 0 490000 910000"
        onClick={handleToothClick}
      >
        <g>
          {/* Solo algunos dientes para empezar - PARTE 1 */}
          <g className="tooth" data-title="41">
            <path className="fil0" d="M205603 881634c0,0 -4002,-26465 14578,-36881 11976,-6712 14489,3687 16768,16055 2077,11280 5621,13100 4838,29798 -495,10561 -36017,10073 -36184,-8972z"/>
            <path className="fil1" d="M203278 881857c-306,-2254 -3373,-28413 15762,-39144 7317,-4096 11884,-2787 15046,1543 2696,3704 3965,9674 5156,16131 652,3541 1484,6194 2267,8685 1677,5347 3148,10039 2606,21630 -203,4368 -4206,7267 -9714,8477l-10 0c-2485,542 -5328,760 -8240,614 -2893,-147 -5892,-655 -8704,-1550 -7644,-2438 -13998,-7706 -14169,-16386z"/>
          </g>

          <g className="tooth" data-title="42">
            <path className="fil0" d="M162568 867874c0,0 8249,-28892 29201,-31253 13504,-1523 10759,10003 8089,22160 -2436,11090 809,15647 -6318,30577 -4506,9445 -38136,-4042 -30972,-21484z"/>
            <path className="fil1" d="M160349 867158c424,-1437 9178,-30381 31163,-32856 8801,-991 12093,2644 12763,8589 493,4405 -738,10017 -2007,15800l-128 583c-820,3734 -970,6727 -1113,9639 -287,5808 -567,11373 -5375,21449l-9 0c-1927,4031 -7133,5135 -13088,4015 -2606,-489 -5399,-1409 -8093,-2674 -2684,-1263 -5306,-2887 -7582,-4801l-3 6c-5979,-5023 -9621,-11990 -6528,-19750z"/>
          </g>

          <g className="tooth" data-title="31">
            <path className="fil0" d="M284398 881634c0,0 4002,-26465 -14578,-36881 -11976,-6712 -14489,3687 -16768,16055 -2077,11280 -5621,13100 -4838,29798 495,10561 36017,10073 36184,-8972z"/>
            <path className="fil1" d="M286723 881857c306,-2254 3373,-28413 -15762,-39144 -7317,-4096 -11884,-2787 -15046,1543 -2696,3704 -3965,9674 -5156,16131 -652,3541 -1484,6194 -2267,8685 -1677,5347 -3148,10039 -2606,21630 203,4368 4206,7267 9714,8477l10 0c2485,542 5328,760 8240,614 2893,-147 5892,-655 8704,-1550 7644,-2438 13998,-7706 14169,-16386z"/>
          </g>

          <g className="tooth" data-title="32">
            <path className="fil0" d="M327433 867874c0,0 -8249,-28892 -29201,-31253 -13504,-1523 -10759,10003 -8089,22160 2436,11090 -809,15647 6318,30577 4506,9445 38136,-4042 30972,-21484z"/>
            <path className="fil1" d="M329652 867158c-424,-1437 -9178,-30381 -31163,-32856 -8801,-991 -12093,2644 -12763,8589 -493,4405 738,10017 2007,15800l128 583c820,3734 970,6727 1113,9639 287,5808 567,11373 5375,21449l9 0c1927,4031 7133,5135 13088,4015 2606,-489 5399,-1409 8093,-2674 2684,-1263 5306,-2887 7582,-4801l3 6c5979,-5023 9621,-11990 6528,-19750z"/>
          </g>

          {/* Dientes superiores - solo algunos */}
          <g className="tooth" data-title="21">
            <path className="fil0" d="M179895 34342c0,0 -6800,41193 24776,57406 20353,10448 24623,-5739 28496,-24990 3530,-17558 9553,-20391 8221,-46381 -840,-16438 -61209,-15680 -61493,13965z"/>
            <path className="fil1" d="M233067 24830c664,542 764,1527 222,2191 -543,664 -1528,764 -2192,222 -31,-25 -10441,-9699 -37988,2279 -785,339 -1705,-19 -2045,-805 -340,-785 19,-1705 805,-2045 29358,-12763 41164,-1870 41198,-1842z"/>
          </g>

          <g className="tooth" data-title="11">
            <path className="fil0" d="M310104 34342c0,0 6800,41193 -24776,57406 -20353,10448 -24623,-5739 -28496,-24990 -3530,-17558 -9553,-20391 -8221,-46381 840,-16438 61209,-15680 61493,13965z"/>
            <path className="fil1" d="M256932 24830c-664,542 -764,1527 -222,2191 543,664 1528,764 2192,222 31,-25 10441,-9699 37988,2279 785,339 1705,-19 2045,-805 340,-785 -19,-1705 -805,-2045 -29358,-12763 -41164,-1870 -41198,-1842z"/>
          </g>
        </g>

        {/* Números de dientes */}
        {selectedTooth && (
          <text 
            x="245000" 
            y="500000" 
            className="tooth-number-text"
          >
            {selectedTooth}
          </text>
        )}
      </svg>

      {/* Indicador de diente seleccionado */}
      {selectedTooth && (
        <div 
          className="tooth-indicator" 
          style={{
            background: TOOTH_FACES[selectedFace]?.color || '#4CAF50'
          }}
        >
          #{selectedTooth}
        </div>
      )}
    </div>
  );
}

// Componente principal - SIMPLIFICADO
const Odontograma3D = ({ 
  pacienteId, 
  initialStates = {}, 
  onStateChange,
  readOnly = false 
}) => {
  const [toothStates, setToothStates] = useState(initialStates);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [currentAction, setCurrentAction] = useState('healthy');
  const [selectedFace, setSelectedFace] = useState('vestibular');
  const [selectedThird, setSelectedThird] = useState('medio');

  useEffect(() => {
    setToothStates(initialStates);
  }, [initialStates]);

  const handleToothSelect = (toothNumber, faceType, third) => {
    if (readOnly) return;
    
    setSelectedTooth(toothNumber);
    const key = `${toothNumber}-${faceType}-${third}`;
    const newStates = {
      ...toothStates,
      [key]: currentAction
    };
    setToothStates(newStates);
    
    if (onStateChange) {
      onStateChange(newStates);
    }
  };

  const clearAll = () => {
    if (readOnly) return;
    setToothStates({});
    setSelectedTooth(null);
    if (onStateChange) {
      onStateChange({});
    }
  };

  return (
    <div className="odontograma-container">
      <div className="odontograma-main">
        
        {/* Panel de control SIMPLE */}
        <div className="control-panel">
          <h4>🦷 Odontograma 2D</h4>
          
          {!readOnly && (
            <>
              <div>
                <label>Estado dental:</label>
                <select 
                  value={currentAction} 
                  onChange={(e) => setCurrentAction(e.target.value)}
                >
                  {Object.entries(TOOTH_STATES).map(([key, state]) => (
                    <option key={key} value={key}>
                      {state.label} ({state.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Cara dental:</label>
                <select 
                  value={selectedFace} 
                  onChange={(e) => setSelectedFace(e.target.value)}
                >
                  {Object.entries(TOOTH_FACES).map(([key, face]) => (
                    <option key={key} value={key}>
                      {face.label} ({face.abbr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Tercio dental:</label>
                <select 
                  value={selectedThird} 
                  onChange={(e) => setSelectedThird(e.target.value)}
                >
                  {Object.entries(TOOTH_THIRDS).map(([key, third]) => (
                    <option key={key} value={key}>
                      {third.label} ({third.abbr})
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={clearAll}>
                🗑️ Limpiar
              </button>
            </>
          )}

          {selectedTooth && (
            <div className="selected-tooth-info">
              <div>Diente #{selectedTooth}</div>
              <div>Cara: {TOOTH_FACES[selectedFace]?.label}</div>
              <div>Tercio: {TOOTH_THIRDS[selectedThird]?.label}</div>
            </div>
          )}
        </div>

        {/* SVG del odontograma centrado */}
        <div className="svg-container">
          <OdontogramaSVG 
            toothStates={toothStates}
            selectedTooth={selectedTooth}
            selectedFace={selectedFace}
            selectedThird={selectedThird}
            onToothSelect={handleToothSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default Odontograma3D;