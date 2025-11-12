import pool from '@/lib/db';

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
    LEFT JOIN OperadorTeamLeader otl ON ue.idUsuario = otl.idUsuario
    WHERE 1 = 1
  `;

  const params = [];

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
  }
  
  if (filtros.rol === 'TeamLeader') {
      query += ' AND otl.idTeamLeader = ?';
      params.push(filtros.idUsuario);
  } else if (filtros.rol === 'Operador') {
      query += ' AND ue.idUsuario = ?';
      params.push(filtros.idUsuario);
  }

  query += ' ORDER BY e.fechaHora DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

export const obtenerOperadoresDB = async (filtros) => {
  let query = `
    SELECT DISTINCT ue.idUsuario, ue.nombre, ue.apellido
    FROM Evaluacion e
    JOIN Usuario ue ON ue.idUsuario = e.idEvaluado
    LEFT JOIN OperadorTeamLeader otl ON ue.idUsuario = otl.idUsuario
    WHERE 1 = 1
  `;
  const params = [];

  if (filtros.rol === 'TeamLeader') {
      query += ' AND otl.idTeamLeader = ?';
      params.push(filtros.idUsuario);
  } else if (filtros.rol === 'Operador') {
      query += ' AND ue.idUsuario = ?';
      params.push(filtros.idUsuario);
  }

  const [rows] = await pool.query(query, params);
  return rows;
};