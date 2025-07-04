import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import axios from 'axios';
import { toast } from 'react-toastify';
import ModalSeleccionEstadoDiente from './modals/ModalSeleccionEstadoDiente';

const estadosColor = {
  Sano: '#2ecc71',
  Cariado: '#e74c3c',
  Obturado: '#3498db',
  Ausente: '#7f8c8d',
  Corona: '#f1c40f',
  Endodoncia: '#9b59b6',
  Implante: '#16a085',
  Sellante: '#f39c12',
};

const dientesPermanentes = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38
];

const dientesTemporales = [
  55, 54, 53, 52, 51,
  61, 62, 63, 64, 65,
  85, 84, 83, 82, 81,
  71, 72, 73, 74, 75
];

const Odontograma = ({ pacienteId }) => {
  const [datos, setDatos] = useState({});
  const [piezaSeleccionada, setPiezaSeleccionada] = useState(null);

  const fetchDatos = async () => {
    try {
      const res = await axios.get(`/api/odontograma/${pacienteId}`);
      if (res.data && res.data.length > 0 && res.data[0].datos) {
        const parsed = typeof res.data[0].datos === 'string'
          ? JSON.parse(res.data[0].datos)
          : res.data[0].datos;
        setDatos(parsed);
      }
    } catch (err) {
      toast.error('Error al cargar odontograma');
    }
  };

  const guardarDatos = async (nuevoEstado) => {
    try {
      await axios.post('/api/odontograma', {
        paciente_id: pacienteId,
        datos: nuevoEstado,
      });
    } catch (err) {
      toast.error('Error al guardar el estado');
    }
  };

  const handleSeleccionarEstado = (dataPieza) => {
    if (!piezaSeleccionada) return;
    const nuevo = {
      ...datos,
      [piezaSeleccionada]: {
        ...dataPieza
      }
    };
    setDatos(nuevo);
    guardarDatos(nuevo);
    setPiezaSeleccionada(null);
    toast.success(`Pieza ${piezaSeleccionada} actualizada`);
  };

  const handleCancelar = () => setPiezaSeleccionada(null);

  const renderDientes = (lista, yOffset) => {
    return lista.map((pieza, index) => {
      const piezaData = datos[pieza] || { estado: 'Sano' };
      const estado = piezaData.estado;
      const color = estadosColor[estado] || '#bdc3c7';
      const x = 40 + (index % 16) * 35;
      const y = yOffset;
      return (
        <React.Fragment key={pieza}>
          <Rect
            x={x}
            y={y}
            width={30}
            height={30}
            fill={color}
            stroke="black"
            strokeWidth={1}
            onClick={() => setPiezaSeleccionada(pieza)}
          />
          <Text
            x={x + 5}
            y={y + 33}
            text={pieza.toString()}
            fontSize={10}
            fill="black"
          />
        </React.Fragment>
      );
    });
  };

  useEffect(() => {
    if (pacienteId) fetchDatos();
  }, [pacienteId]);

  return (
    <div className="odontograma-container">
      <h3>Odontograma Interactivo</h3>
      <p>Haz clic en un diente para modificar su estado clínico.</p>

      <Stage width={700} height={200}>
        <Layer>
          {renderDientes(dientesPermanentes, 20)}
          {renderDientes(dientesTemporales, 80)}
        </Layer>
      </Stage>

      {piezaSeleccionada && (
        <ModalSeleccionEstadoDiente
          pieza={piezaSeleccionada}
          estadoActual={datos[piezaSeleccionada]}
          onSeleccionar={handleSeleccionarEstado}
          onCerrar={handleCancelar}
        />
      )}
    </div>
  );
};

export default Odontograma;
