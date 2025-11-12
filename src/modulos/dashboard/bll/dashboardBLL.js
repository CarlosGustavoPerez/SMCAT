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
