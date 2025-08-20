import pool from '@/lib/db';

/**
 * Obtiene todas las evaluaciones de la base de datos con los datos del operador evaluado.
 * Opcionalmente, filtra por el ID del Team Leader o del Operador.
 * @param {object} filtros - Opcional. { idTeamLeader: number, idOperador: number }
 * @returns {Promise<Array>} Un array de objetos con los datos de las evaluaciones.
 */
export const getEvaluacionesByRole = async (filtros) => {
  let query = `
    SELECT 
      e.idEvaluacion,
      e.fechaHora,
      e.duracion,
      e.puntuacionActitud,
      e.puntuacionEstructura,
      e.puntuacionProtocolos,
      e.observaciones,
      e.estado,
      e.idEvaluado,
      ue.nombre AS nombreEvaluado,
      ue.apellido AS apellidoEvaluado
    FROM Evaluacion e
    JOIN Usuario ue ON ue.idUsuario = e.idEvaluado
  `;
  let params = [];
  
  // Lógica de filtro basada en el rol
  if (filtros.idTeamLeader) {
    query += ' WHERE ue.idTeamLeader = ?';
    params.push(filtros.idTeamLeader);
  } else if (filtros.idOperador) {
    query += ' WHERE ue.idUsuario = ?';
    params.push(filtros.idOperador);
  }
  
  query += ' ORDER BY e.fechaHora DESC';

  try {
    const [rows] = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error en DAL al obtener datos del dashboard:', error);
    throw new Error('Error de base de datos');
  }
};

export const actualizarEstadoEvaluacion = async (idEvaluacion, nuevoEstado) => {
    const query = 'UPDATE Evaluacion SET estado = ? WHERE idEvaluacion = ?';
    await pool.query(query, [nuevoEstado, idEvaluacion]);
};