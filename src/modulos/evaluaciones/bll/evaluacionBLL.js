import {
  getOperadoresDAL,
  getCampaniasDAL,
  getTeamLeaderDAL,
  saveEvaluacionDAL,
} from '../dal/evaluacionDAL';

export const guardarNuevaEvaluacion = async (data) => {
  if (!data.idEvaluado) throw new Error("Seleccione Operador");
  if (!data.fechaHora) throw new Error("Ingrese Fecha y Hora");
  if (!data.duracion) throw new Error("Ingrese Duración de Llamada");
  if (!data.idCampaña) throw new Error("Seleccione Campaña");
  if (!data.puntuacionActitud) throw new Error("Seleccione Actitud");
  if (!data.puntuacionEstructura) throw new Error("Seleccione Estructura");
  if (!data.puntuacionProtocolos) throw new Error("Seleccione Protocolo");

  await saveEvaluacionDAL(data);
};

export const obtenerOperadores = async () => {
  const operadores = await getOperadoresDAL();
  return operadores.map(op => ({
    id: op.id,
    nombreCompleto: `${op.nombre} ${op.apellido}`
  }));
};

export const obtenerCampanias = async () => {
  const campanias = await getCampaniasDAL();
  return campanias.map(c => ({
    id: c.id,
    nombre: c.nombre
  }));
};

export const obtenerTeamLeader = async (idOperador) => {
  const leader = await getTeamLeaderDAL(idOperador);
  if (!leader || (!leader.nombreTL && !leader.apellidoTL)) {
    return 'No asignado';
  }
  return `${leader.nombreTL} ${leader.apellidoTL}`;
};
