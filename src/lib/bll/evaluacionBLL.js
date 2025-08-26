import {
  getOperadoresDAL,
  getCampaniasDAL,
  getTeamLeaderDAL,
  saveEvaluacionDAL,
} from '../dal/evaluacionDAL';

// La entidad de negocio 'Evaluacion' ya no se necesita aquí, ya que pasaremos el objeto de datos directamente.

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

  // 2. Llamar a la DAL para guardar el objeto de datos completo
  // Pasamos el objeto 'data' directamente para evitar cualquier pérdida de valores
  // en la entidad de negocio.
  await saveEvaluacionDAL(data);
};

// BLL: Lógica para obtener operadores
export const obtenerOperadores = async () => {
  const operadores = await getOperadoresDAL();
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
