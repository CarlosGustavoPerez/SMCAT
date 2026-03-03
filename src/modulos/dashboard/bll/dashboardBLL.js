// src/modulos/dashboard/bll/dashboardBLL.js
import { 
  actualizarEstadoEvaluacion, 
  getEvaluacionesByRole, 
  getOperadoresDeTeamLeader, 
  getTodosLosOperadores, 
  getOperadoresAgrupadosPorTeamLeader,
  getUmbralesDesempenoDAL
} from '../dal/dashboardDAL'; 
import pool from '@/lib/db';

export const getEvaluacionesByRoleBLL = async (filtros) => { 
  const data = await getEvaluacionesByRole(filtros); 
  return data; 
}; 

export const getOperadoresByTeamLeaderBLL = async (idTeamLeader) => { 
  const operadores = await getOperadoresDeTeamLeader(idTeamLeader); 
  return operadores; 
}; 

export const getTodosLosOperadoresBLL = async () => { 
    const operadores = await getTodosLosOperadores(); 
    return operadores; 
}; 

export const getOperadoresAgrupadosPorTeamLeaderBLL = async () => {
  const data = await getOperadoresAgrupadosPorTeamLeader();
  return data;
};

export const cambiarEstadoDeEvaluacion = async (idEvaluacion, nuevoEstado, idUsuarioAccion) => { 
  const estadosValidos = ['CERRADA CON CONFORMIDAD', 'CERRADA SIN CONFORMIDAD']; 
  if (!estadosValidos.includes(nuevoEstado)) { 
    throw new Error('Estado inválido. No se puede actualizar.'); 
  } 

  await actualizarEstadoEvaluacion(idEvaluacion, nuevoEstado, idUsuarioAccion); 
};

export const getUmbralesBLL = async () => {
    const umbrales = await getUmbralesDesempenoDAL(pool);
    return umbrales.map(u => ({
        ...u,
        color: u.nombre_nivel === 'Óptimo' ? 'green' : 
               u.nombre_nivel === 'Precaución' ? 'yellow' : 
               'red'
    }));
};

/**
 * Obtiene los datos de desempeño según el rol del usuario.
 * - Analista sin TL seleccionado: devuelve lista de TeamLeaders con promedios.
 * - Analista con TL seleccionado o TeamLeader: devuelve operadores del equipo.
 * En ambos casos incluye los umbrales con su color resuelto.
 */
export const getDesempenoBLL = async ({ grupos, idUsuario, filtro }) => {
    const esAnalista = grupos.some(g => g.nombreGrupo === 'Analista');
    const esTeamLeader = grupos.some(g => g.nombreGrupo === 'TeamLeader');

    const umbrales = await getUmbralesBLL();

    if (esAnalista && !filtro?.idTeamLeader) {
        const teamLeaders = await getOperadoresAgrupadosPorTeamLeader();
        return { teamLeaders, operadores: [], umbrales };
    }

    const idTL = filtro?.idTeamLeader || (esTeamLeader ? idUsuario : null);
    if (!idTL) throw new Error('Filtro inválido.');

    const operadoresRaw = await getOperadoresDeTeamLeader(idTL);
    const operadores = operadoresRaw.map(op => ({
        ...op,
        promedio: parseFloat(op.promedio) || 0,
        llamadas: parseInt(op.llamadas) || 0,
    }));

    return { teamLeaders: [], operadores, umbrales };
};