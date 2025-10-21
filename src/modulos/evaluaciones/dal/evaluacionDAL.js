import pool from '@/lib/db';

export const getOperadoresDAL = async () => {
  // 1. Buscar el ID del grupo 'Operador'
  const [grupoRows] = await pool.query(
    `SELECT idGrupo FROM Grupo WHERE nombreGrupo = ?`,
    ['Operador']
  );

  if (grupoRows.length === 0) {
    console.warn("Advertencia: No se encontró el grupo 'Operador' en la base de datos.");
    return []; // No hay grupo, no hay operadores que devolver
  }
  
  const OPERADOR_GROUP_ID = grupoRows[0].idGrupo;

  // 2. Usar el ID encontrado para obtener los usuarios
  const [rows] = await pool.query(
    `
    SELECT 
      u.idUsuario as id, 
      u.nombre, 
      u.apellido 
    FROM 
      Usuario u
    JOIN 
      UsuarioGrupo ug ON u.idUsuario = ug.idUsuario
    WHERE 
      ug.idGrupo = ?
    ORDER BY 
      u.apellido, u.nombre
    `,
    [OPERADOR_GROUP_ID]
  );
  return rows;
};

export const getCampaniasDAL = async () => {
  const [rows] = await pool.query(`SELECT idCampaña as id, nombre FROM Campaña`);
  return rows;
};

export const getTeamLeaderDAL = async (idOperador) => {
  const [rows] = await pool.query(
    `
    SELECT 
      t.nombre AS nombreTL, 
      t.apellido AS apellidoTL
    FROM 
      OperadorTeamLeader otl
    JOIN 
      Usuario t ON otl.idTeamLeader = t.idUsuario
    WHERE 
      otl.idUsuario = ?
    `,
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
