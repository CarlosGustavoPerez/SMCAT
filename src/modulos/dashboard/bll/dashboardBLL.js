import { 
  actualizarEstadoEvaluacion, 
  getEvaluacionesByRole, 
  getOperadoresDeTeamLeader, 
  getTodosLosOperadores, 
  getOperadoresAgrupadosPorTeamLeader,
} from '../dal/dashboardDAL'; 

export const getEvaluacionesByRoleBLL = async (filtros) => { 
  console.log('Filtros en BLL:', filtros);
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

export const cambiarEstadoDeEvaluacion = async (idEvaluacion, nuevoEstado) => { 
  const estadosValidos = ['CERRADA CON CONFORMIDAD', 'CERRADA SIN CONFORMIDAD']; 
  if (!estadosValidos.includes(nuevoEstado)) { 
    throw new Error('Estado inválido. No se puede actualizar.'); 
  } 

  await actualizarEstadoEvaluacion(idEvaluacion, nuevoEstado); 
};
