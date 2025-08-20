import {
  getOperadoresDAL,
  getCampaniasDAL,
  getTeamLeaderDAL,
  saveEvaluacionDAL,
} from '../dal/evaluacionDAL';

// Importa la entidad de negocio para mapear los datos
import { Evaluacion } from '@/lib/be/Evaluacion';

// BLL: Lógica de negocio para guardar una evaluación
export const guardarNuevaEvaluacion = async (data) => {
  // 1. Validación de datos de entrada (lógica de negocio)
  if (!data.idEvaluado) throw new Error("Seleccione Operador");
  if (!data.fechaHora) throw new Error("Ingrese Fecha y Hora");
  if (!data.duracion) throw new Error("Ingrese Duración de Llamada");
  if (!data.idCampaña) throw new Error("Seleccione Campaña");
  if (!data.puntuacionActitud) throw new Error("Seleccione Actitud");
  if (!data.puntuacionEstructura) throw new Error("Seleccione Estructura");
  if (!data.puntuacionProtocolos) throw new Error("Seleccione Protocolo");

  // 2. Creación de la entidad de negocio (con los datos ya validados)
  // Se crea la entidad de negocio con los datos, sin lógica de validación
  const nuevaEvaluacion = new Evaluacion(
    null,
    data.fechaHora,
    data.duracion,
    data.puntuacionActitud,
    data.puntuacionEstructura,
    data.puntuacionProtocolos,
    data.observaciones,
    data.idEvaluador,
    data.idEvaluado,
    data.idCampaña
  );

  // 3. Llamar a la DAL para guardar la entidad
  await saveEvaluacionDAL(nuevaEvaluacion);
};

// BLL: Lógica para obtener operadores
export const obtenerOperadores = async () => {
  const operadores = await getOperadoresDAL();
  // Transformación de datos para la presentación
  return operadores.map(op => ({
    id: op.id,
    nombreCompleto: `${op.nombre} ${op.apellido}`
  }));
};

// BLL: Lógica para obtener campañas
export const obtenerCampanias = async () => {
  const campanias = await getCampaniasDAL();
  return campanias.map(c => ({
    id: c.id,
    nombre: c.nombre
  }));
};

// BLL: Lógica para obtener Team Leader
export const obtenerTeamLeader = async (idOperador) => {
  const leader = await getTeamLeaderDAL(idOperador);
  if (!leader || (!leader.nombreTL && !leader.apellidoTL)) {
    return 'No asignado';
  }
  return `${leader.nombreTL} ${leader.apellidoTL}`;
};