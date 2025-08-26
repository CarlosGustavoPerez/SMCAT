import pool from '@/lib/db';

/**
 * Obtiene las evaluaciones de la base de datos con los filtros y permisos aplicados.
 * @param {object} filtros - Objeto con los filtros, rol y ID del usuario.
 * @returns {Promise<Array>} Un array de objetos con las evaluaciones.
 */
export const obtenerEvaluacionesDB = async (filtros) => {
  let query = `
    SELECT 
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
    WHERE 1 = 1
  `;

  const params = [];

  // Filtros opcionales
  if (filtros.dateFrom) {
    query += ' AND e.fechaHora >= ?';
    params.push(filtros.dateFrom + ' 00:00:00');
  }
  if (filtros.dateTo) {
    query += ' AND e.fechaHora <= ?';
    params.push(filtros.dateTo + ' 23:59:59');
  }
  if (filtros.operator) {
    query += ' AND CONCAT(ue.nombre, " ", ue.apellido) LIKE ?';
    params.push('%' + filtros.operator.replace('-', ' ') + '%');
  }
  if (filtros.campaign) {
    // La tabla de campañas no está en el JOIN por ahora, se mantendrá sin funcionalidad.
    // Para que funcione, se necesita un JOIN a la tabla de campañas.
    // query += ' AND c.nombre = ?';
    // params.push(filtros.campaign);
  }
  
  // Lógica de permisos de rol aplicada directamente en la consulta
  if (filtros.rol === 'TeamLeader') {
      // Filtra por las evaluaciones de los operadores que dependen del Team Leader
      query += ' AND ue.idTeamLeader = ?';
      params.push(filtros.idUsuario);
  } else if (filtros.rol === 'Operador') {
      // Filtra por las evaluaciones del propio operador
      query += ' AND ue.idUsuario = ?';
      params.push(filtros.idUsuario);
  }

  query += ' ORDER BY e.fechaHora DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Obtiene la lista de operadores únicos de la base de datos, con filtros por rol.
 * @param {object} filtros - Objeto con el rol y ID del usuario para filtrar.
 * @returns {Promise<Array>} Un array de objetos con los operadores.
 */
export const obtenerOperadoresDB = async (filtros) => {
  let query = `
    SELECT DISTINCT ue.idUsuario, ue.nombre, ue.apellido
    FROM Evaluacion e
    JOIN Usuario ue ON ue.idUsuario = e.idEvaluado
    WHERE 1 = 1
  `;
  const params = [];

  // Lógica de permisos de rol aplicada directamente en la consulta
  if (filtros.rol === 'TeamLeader') {
      // Filtra por los operadores que dependen del Team Leader
      query += ' AND ue.idTeamLeader = ?';
      params.push(filtros.idUsuario);
  } else if (filtros.rol === 'Operador') {
      // Si el usuario es un Operador, solo muestra su propio nombre en la lista
      query += ' AND ue.idUsuario = ?';
      params.push(filtros.idUsuario);
  }

  const [rows] = await pool.query(query, params);
  return rows;
};
