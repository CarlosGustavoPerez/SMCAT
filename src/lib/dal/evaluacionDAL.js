import pool from '@/lib/db';

export const getOperadoresDAL = async () => {
  const [rows] = await pool.query(
    `SELECT idUsuario as id, nombre, apellido FROM Usuario WHERE rol = 'Operador'`
  );
  return rows;
};

export const getCampaniasDAL = async () => {
  const [rows] = await pool.query(`SELECT idCampaña as id, nombre FROM Campaña`);
  return rows;
};

export const getTeamLeaderDAL = async (idOperador) => {
  const [rows] = await pool.query(
    `SELECT t.nombre AS nombreTL, t.apellido AS apellidoTL
     FROM Usuario u LEFT JOIN Usuario t ON u.idTeamLeader = t.idUsuario
     WHERE u.idUsuario = ?`,
    [idOperador]
  );
  return rows[0] || null;
};

export const actualizarEstadoEvaluacion = async (idEvaluacion, nuevoEstado) => {
  const result = await pool.query(
    `INSERT INTO Evaluacion 
      (fechaHora, duracion, puntuacionActitud, puntuacionEstructura, puntuacionProtocolos, observaciones, idEvaluador, idEvaluado, idCampaña, estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE DE REVISION')`,
    [
      evaluacion.fechaHora,
      evaluacion.duracion,
      evaluacion.puntuacionActitud,
      evaluacion.puntuacionEstructura,
      evaluacion.puntuacionProtocolos,
      evaluacion.observaciones || null,
      evaluacion.idEvaluador,
      evaluacion.idEvaluado,
      evaluacion.idCampaña,
    ]
  );
  return result;
};