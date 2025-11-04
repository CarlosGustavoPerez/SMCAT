import {
  getOperadoresDAL,
  getCampaniasDAL,
  getTeamLeaderDAL,
  saveEvaluacionDAL,
  getTrazabilidadEvaluacionDAL,
  getAllTrazabilidadDAL,
  getUniqueEvaluadoresDAL, 
  getUniqueEvaluadosDAL, 
  getUniqueUsersForActionDAL,
  getUniqueEvaluacionIdsDAL
} from '../dal/evaluacionDAL';

export const guardarNuevaEvaluacion = async (data, idUsuarioSupervisor) => { 
    // === Validaciones de Negocio (Se mantienen) ===
    if (!data.idEvaluado) throw new Error("Seleccione Operador");
    if (!data.fechaHora) throw new Error("Ingrese Fecha y Hora");
    if (!data.duracion) throw new Error("Ingrese Duración de Llamada");
    if (!data.idCampaña) throw new Error("Seleccione Campaña");
    if (!data.puntuacionActitud) throw new Error("Seleccione Actitud");
    if (!data.puntuacionEstructura) throw new Error("Seleccione Estructura");
    if (!data.puntuacionProtocolos) throw new Error("Seleccione Protocolo");
    
    // === Nueva Validación para Trazabilidad ===
    if (!idUsuarioSupervisor) throw new Error("ID de supervisor/evaluador requerido para la auditoría.");
    
    await saveEvaluacionDAL(data, idUsuarioSupervisor); 
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
export const getTrazabilidadEvaluacionBLL = async (idEvaluacion) => {
    if (!idEvaluacion || isNaN(idEvaluacion) || idEvaluacion <= 0) {
        throw new Error('ID de Evaluación inválido. Debe ser un número positivo.');
    }
    try {
        const historial = await getTrazabilidadEvaluacionDAL(idEvaluacion);
        const historialFormateado = historial.map(evento => ({
            ...evento,
            nombreCompleto: evento.nombre_usuario && evento.apellido_usuario ? `${evento.nombre_usuario} ${evento.apellido_usuario}` : `ID: ${evento.id_usuario_accion}`,
        }));
        return historialFormateado;
    } catch (error) {
        console.error('Error en BLL al obtener trazabilidad:', error.message);
        throw new Error(`Error de negocio: ${error.message}`);
    }
};
export const getAllTrazabilidadBLL = async () => {
    try {
        const historial = await getAllTrazabilidadDAL();
        
        const historialFormateado = historial.map(evento => ({
            ...evento,
            // Asegura que el nombre del actor esté disponible para los filtros del FE
            actor: evento.nombre_usuario_accion && evento.apellido_usuario_accion 
           ? `${evento.nombre_usuario_accion} ${evento.apellido_usuario_accion}` 
           : `ID: ${evento.id_usuario_accion}`,
            nombreEvaluador: evento.nombre_evaluador && evento.apellido_evaluador
                     ? `${evento.nombre_evaluador} ${evento.apellido_evaluador}`
                     : `ID: ${evento.idEvaluador}`,

            // Nombre completo del Evaluado
            nombreEvaluado: evento.nombre_evaluado && evento.apellido_evaluado
                            ? `${evento.nombre_evaluado} ${evento.apellido_evaluado}`
                            : `ID: ${evento.idEvaluado}`,
        }));
        
        return historialFormateado;
    } catch (error) {
        console.error('Error en BLL al obtener todo el historial:', error.message);
        throw new Error(`Error de negocio: ${error.message}`);
    }
};
export const getFiltroOptionsBLL = async () => {
    try {
        // Ejecutamos las tres consultas DAL en paralelo
        const [evaluadores, evaluados, usuariosAccion, idsEvaluacion] = await Promise.all([
            getUniqueEvaluadoresDAL(),
            getUniqueEvaluadosDAL(),
            getUniqueUsersForActionDAL(),
            getUniqueEvaluacionIdsDAL()
        ]);

        // Función de ayuda para formatear el nombre completo
        const format = (list) => list.map(u => ({
            id: u.idUsuario,
            nombreCompleto: `${u.nombre} ${u.apellido}`,
        }));

        // Devolvemos las listas separadas y formateadas
        return {
            evaluadores: format(evaluadores),
            evaluados: format(evaluados),
            usuariosAccion: format(usuariosAccion),
            idsEvaluacion: idsEvaluacion.map(e => e.idEvaluacion)
        };
    } catch (error) {
        console.error('Error en BLL al obtener opciones de filtro:', error.message);
        throw new Error(`Error de negocio: ${error.message}`);
    }
};