import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import axios from 'axios';
import { toast } from 'react-toastify';

const piezasAdulto = Array.from({ length: 32 }, (_, i) => i + 11)
  .filter(num => !(num % 10 > 8));
const piezasInfantil = Array.from({ length: 20 }, (_, i) => i + 51)
  .filter(num => !(num % 10 > 5));

const coloresPorEstado = {
  Sano: '#2ecc71',
  Cariado: '#e74c3c',
  Obturado: '#3498db',
  Ausente: '#7f8c8d',
  Corona: '#f1c40f',
  Endodoncia: '#9b59b6',
  Implante: '#16a085',
  Sellante: '#f39c12'
};

const OdontogramaCanvas = ({ pacienteId }) => {
  const [odontograma, setOdontograma] = useState({});

  const cargarDatos = async () => {
    try {
      const res = await axios.get(`/api/odontograma/${pacienteId}`);
      const datos = {};
      res.data.forEach(item => {
        datos[item.pieza_dental] = item.estado;
      });
      setOdontograma(datos);
    } catch (err) {
      toast.error('Error al cargar odontograma');
    }
  };

  const guardarEstado = async (pieza, nuevoEstado) => {
    try {
      await axios.post(`/api/odontograma`, {
        paciente_id: pacienteId,
        pieza_dental: pieza,
        estado: nuevoEstado
      });
      setOdontograma(prev => ({ ...prev, [pieza]: nuevoEstado }));
      toast.success(`Estado de pieza ${pieza} actualizado`);
    } catch (err) {
      toast.error('Error al guardar estado');
    }
  };

  useEffect(() => {
    if (pacienteId) cargarDatos();
  }, [pacienteId]);

  const renderPieza = (pieza, idx, filaY) => {
    const estado = odontograma[pieza] || 'Sano';
    const color = coloresPorEstado[estado] || '#bdc3c7';
    return (
      <React.Fragment key={pieza}>
        <Rect
          x={50 + idx * 30}
          y={filaY}
          width={25}
          height={25}
          fill={color}
          stroke="black"
          strokeWidth={1}
          onClick={() => {
            const nuevo = prompt(
              `Estado para pieza ${pieza}: (Sano, Cariado, Obturado, Ausente, Corona, Endodoncia, Implante, Sellante)`,
              estado
            );
            if (nuevo && Object.keys(coloresPorEstado).includes(nuevo)) {
              guardarEstado(pieza, nuevo);
            } else {
              toast.warning('Estado inválido');
            }
          }}
        />
        <Text x={50 + idx * 30} y={filaY + 28} text={pieza.toString()} fontSize={10} />
      </React.Fragment>
    );
  };

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #ccc', padding: '10px' }}>
      <h3>Odontograma del Paciente</h3>
      <Stage width={1100} height={130}>
        <Layer>
          {piezasAdulto.slice(0, 16).map((pieza, i) => renderPieza(pieza, i, 10))}
          {piezasAdulto.slice(16).map((pieza, i) => renderPieza(pieza, i, 60))}
        </Layer>
      </Stage>
      <h4>Infantil</h4>
      <Stage width={800} height={80}>
        <Layer>
          {piezasInfantil.slice(0, 10).map((pieza, i) => renderPieza(pieza, i, 10))}
          {piezasInfantil.slice(10).map((pieza, i) => renderPieza(pieza, i, 40))}
        </Layer>
      </Stage>
    </div>
  );
};

export default OdontogramaCanvas;
