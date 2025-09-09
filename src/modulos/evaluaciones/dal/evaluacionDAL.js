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

// Ahora, la función recibe el objeto de datos 'data' directamente del BLL
export const saveEvaluacionDAL = async (data) => {
  const result = await pool.query(
    `INSERT INTO Evaluacion 
     (fechaHora, duracion, puntuacionActitud, puntuacionEstructura, puntuacionProtocolos, observaciones, idEvaluador, idEvaluado, idCampaña, estado) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE DE REVISION')`,
    [
      data.fechaHora,
      data.duracion,
      data.puntuacionActitud,
      data.puntuacionEstructura,
      data.puntuacionProtocolos,
      data.observaciones || null,
      data.idEvaluador,
      data.idEvaluado,
      data.idCampaña,
    ]
  );
  return result;
};
