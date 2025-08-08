import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, User, Heart, Home, Hospital, UserCheck, Smile, Layers, Download, Calendar, Stethoscope, AlertCircle } from 'lucide-react';

const HistorialClinicoCompletoViewer = ({ historialData = null, pacienteData = null }) => {
  const [seccionesExpandidas, setSeccionesExpandidas] = useState({
    identificacion: true,
    motivo: true,
    heredoFamiliares: true,
    noPatologicos: true,
    patologicos: true,
    extrabucal: true,
    intrabucal: true,
    oclusion: true,
    diagnostico: true
  });

  // Función para parsear datos JSON de manera segura
  const parsearDatosJSON = (datos) => {
    try {
      if (typeof datos === 'string' && datos.startsWith('{')) {
        return JSON.parse(datos);
      }
      if (typeof datos === 'object' && datos !== null) {
        return datos;
      }
      return {};
    } catch (error) {
      console.warn('Error parseando JSON:', error);
      return {};
    }
  };

  // Datos de ejemplo para demostración
  const datosEjemplo = historialData || {
    fecha_consulta: '2025-08-02',
    doctor_nombre: 'Naomi Mendez',
    estado: 'completado',
    tipo_consulta: 'Consulta General',
    ficha_identificacion: {
      nombre: 'Aide',
      apellidoPaterno: 'Barrera',
      apellidoMaterno: 'Arreguin',
      sexo: 'Femenino',
      fechaNacimiento: '1977-01-15',
      rfc: 'ABAR676675',
      telefono: '5532436023',
      email: 'aidecitama@gmail.com'
    },
    motivo_consulta: {
      motivo: 'Revisión general',
      escalaDolor: 0,
      nivelUrgencia: 'normal',
      duracionSintomas: '2 semanas',
      tratamientoPrevio: 'Ninguno'
    },
    antecedentes_heredo_familiares: {
      antecedentes: [
        { parentesco: 'Padre', padecimientos: 'Diabetes Mellitus', edad: '65', vivo: true },
        { parentesco: 'Madre', padecimientos: 'Hipertensión', edad: '62', vivo: true }
      ],
      enfermedades_relevantes: {
        diabetes: true,
        hipertension: true,
        cancer: false
      }
    },
    antecedentes_personales_no_patologicos: {
      servicios_publicos: {
        drenaje: true,
        agua: true,
        luz: true,
        telefono: true
      },
      higiene: {
        general: 'Buena',
        bucal: 'Regular'
      }
    },
    antecedentes_personales_patologicos: {
      padecimientos: [
        { padecimiento: 'Gastritis', edad: '35', control_medico: 'Sí', complicaciones: 'Ninguna' }
      ],
      signos_vitales: {
        temperatura: '36.5',
        tension_arterial_sistolica: '120',
        tension_arterial_diastolica: '80',
        frecuencia_cardiaca: '72'
      }
    },
    examen_extrabucal: {
      cabeza: {
        craneo: 'Mesocéfalo',
        biotipo_facial: 'Dolicofacial',
        perfil: 'Recto'
      },
      atm: {
        alteracion: 'Sin alteraciones',
        apertura_maxima: '45mm'
      }
    },
    examen_intrabucal: {
      estructuras: {
        labios: 'Normales',
        lengua: 'Normal',
        paladar_duro: 'Sin alteraciones',
        encias: 'Leve inflamación'
      },
      higiene_bucal: {
        general: 'Buena',
        indice_placa: '15%'
      }
    },
    oclusion: {
      clasificacion_angle: {
        relacion_molar_derecho: 'Clase I',
        relacion_molar_izquierdo: 'Clase I',
        sobremordida_vertical: '2mm',
        sobremordida_horizontal: '2mm'
      }
    },
    diagnostico: 'Diagnóstico registrado en historial clínico',
    tratamiento: 'Plan de tratamiento documentado en historial',
    plan_tratamiento: {
      inmediato: 'Profilaxis dental',
      mediano_plazo: 'Control en 6 meses',
      recomendaciones: ['Mejorar técnica de cepillado', 'Uso de hilo dental diario']
    }
  };

  const datos = datosEjemplo;
  
  // Parsear los datos si vienen como strings JSON
  const fichaIdentificacion = parsearDatosJSON(datos.ficha_identificacion);
  const motivoConsulta = parsearDatosJSON(datos.motivo_consulta);
  const antecedentesHF = parsearDatosJSON(datos.antecedentes_heredo_familiares);
  const antecedentesNP = parsearDatosJSON(datos.antecedentes_personales_no_patologicos);
  const antecedentesPP = parsearDatosJSON(datos.antecedentes_personales_patologicos);
  const examenExtrabucal = parsearDatosJSON(datos.examen_extrabucal);
  const examenIntrabucal = parsearDatosJSON(datos.examen_intrabucal);
  const oclusion = parsearDatosJSON(datos.oclusion);
  const planTratamiento = parsearDatosJSON(datos.plan_tratamiento);

  const toggleSeccion = (seccion) => {
    setSeccionesExpandidas(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'No especificada';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const SeccionHeader = ({ titulo, icono: Icon, expanded, onClick, badge }) => (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <h3 className="text-lg font-semibold">{titulo}</h3>
        {badge && (
          <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
            {badge}
          </span>
        )}
      </div>
      {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </div>
  );

  const InfoRow = ({ label, value, highlight = false }) => (
    <div className={`grid grid-cols-3 gap-4 py-2 px-4 ${highlight ? 'bg-gray-50' : ''}`}>
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="col-span-2 text-gray-900">{value || 'No especificado'}</span>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Header Principal */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Historial Clínico Completo
              </h1>
              <p className="text-purple-100">Vista detallada de todas las secciones del historial</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Generar PDF
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
              <User className="w-4 h-4" />
              {fichaIdentificacion.nombre} {fichaIdentificacion.apellidoPaterno} {fichaIdentificacion.apellidoMaterno}
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
              <Calendar className="w-4 h-4" />
              {formatearFecha(datos.fecha_consulta)}
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
              <Stethoscope className="w-4 h-4" />
              Dr. {datos.doctor_nombre}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              datos.estado === 'completado' ? 'bg-green-500/30' : 'bg-yellow-500/30'
            }`}>
              {datos.estado === 'completado' ? '✅' : '⏳'} {datos.estado?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* SECCIÓN 1: Ficha de Identificación */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <SeccionHeader 
            titulo="1. Ficha de Identificación"
            icono={User}
            expanded={seccionesExpandidas.identificacion}
            onClick={() => toggleSeccion('identificacion')}
            badge="Datos Personales"
          />
          {seccionesExpandidas.identificacion && (
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <InfoRow label="Nombre completo" value={`${fichaIdentificacion.nombre} ${fichaIdentificacion.apellidoPaterno} ${fichaIdentificacion.apellidoMaterno}`} highlight />
                  <InfoRow label="Sexo" value={fichaIdentificacion.sexo} />
                  <InfoRow label="Fecha de nacimiento" value={formatearFecha(fichaIdentificacion.fechaNacimiento)} highlight />
                  <InfoRow label="Edad" value={`${calcularEdad(fichaIdentificacion.fechaNacimiento)} años`} />
                </div>
                <div className="space-y-2">
                  <InfoRow label="RFC" value={fichaIdentificacion.rfc} highlight />
                  <InfoRow label="Teléfono" value={fichaIdentificacion.telefono} />
                  <InfoRow label="Email" value={fichaIdentificacion.email} highlight />
                  <InfoRow label="Tipo de consulta" value={datos.tipo_consulta} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECCIÓN 2: Motivo de Consulta */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <SeccionHeader 
            titulo="2. Motivo de Consulta"
            icono={AlertCircle}
            expanded={seccionesExpandidas.motivo}
            onClick={() => toggleSeccion('motivo')}
            badge="Principal"
          />
          {seccionesExpandidas.motivo && (
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="font-medium text-blue-900">Motivo principal:</p>
                <p className="text-blue-800 mt-1">{motivoConsulta.motivo || 'No especificado'}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <InfoRow label="Escala de dolor" value={`${motivoConsulta.escalaDolor || 0}/10`} />
                <InfoRow label="Nivel de urgencia" value={motivoConsulta.nivelUrgencia} />
                <InfoRow label="Duración de síntomas" value={motivoConsulta.duracionSintomas} />
                <InfoRow label="Tratamiento previo" value={motivoConsulta.tratamientoPrevio} />
              </div>
            </div>
          )}
        </div>

        {/* SECCIÓN 3: Antecedentes Heredo-Familiares */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <SeccionHeader 
            titulo="3. Antecedentes Heredo-Familiares"
            icono={Heart}
            expanded={seccionesExpandidas.heredoFamiliares}
            onClick={() => toggleSeccion('heredoFamiliares')}
            badge="Genético"
          />
          {seccionesExpandidas.heredoFamiliares && (
            <div className="p-6 space-y-4">
              {antecedentesHF.antecedentes && antecedentesHF.antecedentes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Antecedentes familiares:</h4>
                  {antecedentesHF.antecedentes.map((ant, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{ant.parentesco}:</span>
                          <span className="ml-2">{ant.padecimientos || 'Sin padecimientos'}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {ant.vivo ? '✅ Vivo' : '❌ Fallecido'} 
                          {ant.edad && ` (${ant.edad} años)`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {antecedentesHF.enfermedades_relevantes && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Enfermedades hereditarias relevantes:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(antecedentesHF.enfermedades_relevantes).map(([key, value]) => (
                      <div key={key} className={`px-3 py-1 rounded-full text-sm ${
                        value ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {value ? '✓' : '✗'} {key.charAt(0).toUpperCase() + key.slice(1)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECCIÓN 4: Antecedentes Personales No Patológicos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <SeccionHeader 
            titulo="4. Antecedentes Personales No Patológicos"
            icono={Home}
            expanded={seccionesExpandidas.noPatologicos}
            onClick={() => toggleSeccion('noPatologicos')}
            badge="Estilo de Vida"
          />
          {seccionesExpandidas.noPatologicos && (
            <div className="p-6 space-y-4">
              {antecedentesNP.servicios_publicos && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Servicios públicos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(antecedentesNP.servicios_publicos).map(([servicio, tiene]) => (
                      <span key={servicio} className={`px-3 py-1 rounded-full text-sm ${
                        tiene === true ? 'bg-green-100 text-green-700' : 
                        tiene === false ? 'bg-red-100 text-red-700' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {tiene === true ? '✓' : tiene === false ? '✗' : ''} 
                        {servicio.charAt(0).toUpperCase() + servicio.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {antecedentesNP.higiene && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <InfoRow label="Higiene general" value={antecedentesNP.higiene.general} />
                  <InfoRow label="Higiene bucal" value={antecedentesNP.higiene.bucal} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECCIÓN 5: Antecedentes Personales Patológicos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <SeccionHeader 
            titulo="5. Antecedentes Personales Patológicos"
            icono={Hospital}
            expanded={seccionesExpandidas.patologicos}
            onClick={() => toggleSeccion('patologicos')}
            badge="Médico"
          />
          {seccionesExpandidas.patologicos && (
            <div className="p-6 space-y-4">
              {antecedentesPP.padecimientos && antecedentesPP.padecimientos.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Padecimientos anteriores:</h4>
                  {antecedentesPP.padecimientos.map((pad, index) => (
                    pad.padecimiento && (
                      <div key={index} className="bg-yellow-50 p-3 rounded-lg mb-2">
                        <div className="font-medium">{pad.padecimiento}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Edad: {pad.edad || 'N/A'} | 
                          Control médico: {pad.control_medico || 'N/A'} | 
                          Complicaciones: {pad.complicaciones || 'Ninguna'}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
              
              {antecedentesPP.signos_vitales && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Signos vitales:</h4>
                  <div className="grid md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                    <InfoRow label="Temperatura" value={`${antecedentesPP.signos_vitales.temperatura || 'N/A'}°C`} />
                    <InfoRow label="T.A." value={`${antecedentesPP.signos_vitales.tension_arterial_sistolica || 'N/A'}/${antecedentesPP.signos_vitales.tension_arterial_diastolica || 'N/A'} mmHg`} />
                    <InfoRow label="F.C." value={`${antecedentesPP.signos_vitales.frecuencia_cardiaca || 'N/A'} lpm`} />
                    <InfoRow label="F.R." value={`${antecedentesPP.signos_vitales.frecuencia_respiratoria || 'N/A'} rpm`} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECCIÓN 6: Examen Extrabucal */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <SeccionHeader 
            titulo="6. Examen Extrabucal"
            icono={UserCheck}
            expanded={seccionesExpandidas.extrabucal}
            onClick={() => toggleSeccion('extrabucal')}
            badge="Evaluación"
          />
          {seccionesExpandidas.extrabucal && (
            <div className="p-6 space-y-4">
              {examenExtrabucal.cabeza && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Cabeza:</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <InfoRow label="Cráneo" value={examenExtrabucal.cabeza.craneo} />
                    <InfoRow label="Biotipo facial" value={examenExtrabucal.cabeza.biotipo_facial} />
                    <InfoRow label="Perfil" value={examenExtrabucal.cabeza.perfil} />
                  </div>
                </div>
              )}
              
              {examenExtrabucal.atm && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">ATM:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoRow label="Alteración" value={examenExtrabucal.atm.alteracion} />
                    <InfoRow label="Apertura máxima" value={examenExtrabucal.atm.apertura_maxima} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECCIÓN 7: Examen Intrabucal */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <SeccionHeader 
            titulo="7. Examen Intrabucal"
            icono={Smile}
            expanded={seccionesExpandidas.intrabucal}
            onClick={() => toggleSeccion('intrabucal')}
            badge="Evaluación"
          />
          {seccionesExpandidas.intrabucal && (
            <div className="p-6 space-y-4">
              {examenIntrabucal.estructuras && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Estructuras:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoRow label="Labios" value={examenIntrabucal.estructuras.labios} />
                    <InfoRow label="Lengua" value={examenIntrabucal.estructuras.lengua} />
                    <InfoRow label="Paladar duro" value={examenIntrabucal.estructuras.paladar_duro} />
                    <InfoRow label="Encías" value={examenIntrabucal.estructuras.encias} />
                  </div>
                </div>
              )}
              
              {examenIntrabucal.higiene_bucal && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Higiene bucal:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoRow label="Estado general" value={examenIntrabucal.higiene_bucal.general} />
                    <InfoRow label="Índice de placa" value={examenIntrabucal.higiene_bucal.indice_placa} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECCIÓN 8: Oclusión */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <SeccionHeader 
            titulo="8. Oclusión"
            icono={Layers}
            expanded={seccionesExpandidas.oclusion}
            onClick={() => toggleSeccion('oclusion')}
            badge="Dental"
          />
          {seccionesExpandidas.oclusion && (
            <div className="p-6 space-y-4">
              {oclusion.clasificacion_angle && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Clasificación de Angle:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoRow label="Relación molar derecho" value={oclusion.clasificacion_angle.relacion_molar_derecho} />
                    <InfoRow label="Relación molar izquierdo" value={oclusion.clasificacion_angle.relacion_molar_izquierdo} />
                    <InfoRow label="Sobremordida vertical" value={oclusion.clasificacion_angle.sobremordida_vertical} />
                    <InfoRow label="Sobremordida horizontal" value={oclusion.clasificacion_angle.sobremordida_horizontal} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECCIÓN 9: Diagnóstico y Tratamiento */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <SeccionHeader 
            titulo="9. Diagnóstico y Plan de Tratamiento"
            icono={Stethoscope}
            expanded={seccionesExpandidas.diagnostico}
            onClick={() => toggleSeccion('diagnostico')}
            badge="Final"
          />
          {seccionesExpandidas.diagnostico && (
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <p className="font-medium text-green-900">Diagnóstico:</p>
                <p className="text-green-800 mt-1">{datos.diagnostico || 'No especificado'}</p>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="font-medium text-blue-900">Tratamiento realizado:</p>
                <p className="text-blue-800 mt-1">{datos.tratamiento || 'No especificado'}</p>
              </div>
              
              {planTratamiento && (
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                  <p className="font-medium text-purple-900 mb-2">Plan de tratamiento:</p>
                  {planTratamiento.inmediato && (
                    <div className="mb-2">
                      <span className="font-medium">Inmediato:</span> {planTratamiento.inmediato}
                    </div>
                  )}
                  {planTratamiento.mediano_plazo && (
                    <div className="mb-2">
                      <span className="font-medium">Mediano plazo:</span> {planTratamiento.mediano_plazo}
                    </div>
                  )}
                  {planTratamiento.recomendaciones && Array.isArray(planTratamiento.recomendaciones) && (
                    <div>
                      <span className="font-medium">Recomendaciones:</span>
                      <ul className="list-disc list-inside mt-1">
                        {planTratamiento.recomendaciones.map((rec, index) => (
                          <li key={index} className="text-purple-800">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con información adicional */}
        <div className="bg-gray-100 rounded-lg p-4 text-center text-sm text-gray-600">
          <p>💡 Este historial clínico contiene toda la información recopilada durante la consulta</p>
          <p className="mt-1">Para generar un PDF completo, utiliza el botón "Generar PDF" en la parte superior</p>
        </div>
      </div>
    </div>
  );
};

export default HistorialClinicoCompletoViewer;