// src/hooks/useAutoUpdateCitas.js
import { useState, useEffect } from 'react';

// Función que verifica y actualiza citas vencidas
const verificarYActualizarCitasVencidas = async () => {
  try {
    console.log('🔄 [AUTO-UPDATE] Verificando citas vencidas...');
    
    const response = await fetch('/api/citas/verificar-vencidas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ [AUTO-UPDATE] Citas actualizadas:', result.citasActualizadas);
      return result.citasActualizadas;
    } else {
      console.error('❌ [AUTO-UPDATE] Error al verificar citas:', response.status);
      return 0;
    }
  } catch (error) {
    console.error('❌ [AUTO-UPDATE] Error:', error);
    return 0;
  }
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

// Hook personalizado para usar en los componentes
const useAutoUpdateCitas = () => {
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  
  useEffect(() => {
    // Verificar inmediatamente al cargar
    verificarYActualizarCitasVencidas();
    
    // Configurar intervalo para verificar cada 5 minutos
    const intervalo = setInterval(async () => {
      const citasActualizadas = await verificarYActualizarCitasVencidas();
      if (citasActualizadas > 0) {
        setUltimaActualizacion(new Date());
        console.log(`🔄 [AUTO-UPDATE] ${citasActualizadas} citas actualizadas automáticamente`);
      }
    }, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(intervalo);
  }, []);
  
  return { ultimaActualizacion, verificarCitas: verificarYActualizarCitasVencidas };
};

export default useAutoUpdateCitas;