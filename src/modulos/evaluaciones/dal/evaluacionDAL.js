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

export const saveEvaluacionDAL = async (data, idUsuarioActual) => { 
  const connection = await pool.getConnection(); 
  try {
      await connection.beginTransaction();

      // 1. Ejecutar el INSERT en la tabla principal (Evaluacion)
      // El Trigger se disparará automáticamente.
      const sql = `
          INSERT INTO Evaluacion 
          (fechaHora, duracion, puntuacionActitud, puntuacionEstructura, puntuacionProtocolos, observaciones, idEvaluador, idEvaluado, idCampaña, estado) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE DE REVISION')
      `;
      const [result] = await connection.query(sql, [
          data.fechaHora,
          data.duracion,
          data.puntuacionActitud || null,
          data.puntuacionEstructura || null,
          data.puntuacionProtocolos || null,
          data.observaciones || null,
          data.idEvaluador,
          data.idEvaluado,
          data.idCampaña,
      ]);

      await connection.commit();
      return result; 
  } catch (error) {
      await connection.rollback();
      // Cambiar el mensaje de error para reflejar que el fallo puede ser del Trigger
      console.error("Error en saveEvaluacionDAL o Trigger de MySQL:", error); 
      throw error;
  } finally {
      connection.release();
  }
};
export const getTrazabilidadEvaluacionDAL = async (idEvaluacion) => {
    const query = `
        SELECT 
            AUD.id_auditoria,
            AUD.accion,
            AUD.timestamp,
            AUD.id_usuario_accion,
            U.nombre AS nombre_usuario,
            U.apellido AS apellido_usuario,
            AUD.idEvaluacion,
            AUD.idEvaluador,
            AUD.idEvaluado,
            AUD.estado
        FROM 
            Evaluacion_AUD AUD
        LEFT JOIN 
            Usuario U ON AUD.id_usuario_accion = U.idUsuario
        WHERE 
            AUD.idEvaluacion = ?
        ORDER BY 
            AUD.timestamp ASC;
    `;

    let connection;
    try {
        connection = await pool.getConnection(); 
        const [rows] = await connection.query(query, [idEvaluacion]); 
        return rows; 
    } catch (error) {
        console.error('Error en DAL al obtener trazabilidad:', error);
        throw new Error('Error de base de datos al obtener el historial de trazabilidad.');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
export const getAllTrazabilidadDAL = async () => {
    const query = `
      SELECT 
          AUD.*,
          
          -- Usuario que realizó la acción de auditoría (Realizado por)
          UA.nombre AS nombre_usuario_accion,
          UA.apellido AS apellido_usuario_accion,
          
          -- Nombre del Evaluador (Quien realizó la evaluación)
          EVL.nombre AS nombre_evaluador,
          EVL.apellido AS apellido_evaluador,
          
          -- Nombre del Evaluado (Operador/Agente)
          EVD.nombre AS nombre_evaluado,
          EVD.apellido AS apellido_evaluado
          
      FROM 
          Evaluacion_AUD AUD
          
      -- 1. JOIN para el Usuario que hace la Acción (UA)
      LEFT JOIN 
          Usuario UA ON AUD.id_usuario_accion = UA.idUsuario
          
      -- 2. JOIN para el Evaluador (EVL)
      LEFT JOIN 
          Usuario EVL ON AUD.idEvaluador = EVL.idUsuario
          
      -- 3. JOIN para el Evaluado (EVD)
      LEFT JOIN 
          Usuario EVD ON AUD.idEvaluado = EVD.idUsuario
          
      ORDER BY 
          AUD.timestamp DESC;
  `;

    let connection;
    try {
        connection = await pool.getConnection(); 
        const [rows] = await connection.query(query); 
        return rows; 
    } catch (error) {
        console.error('Error en DAL al obtener todos los registros de trazabilidad:', error);
        throw new Error('Error de base de datos al obtener el historial completo.');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
const getUsersByRoleIds = async (roleColumn) => {
    // 1. Obtener IDs únicos para el rol específico
    const queryIds = `
        SELECT DISTINCT ${roleColumn} AS idUsuario FROM Evaluacion_AUD
        WHERE ${roleColumn} IS NOT NULL AND ${roleColumn} > 0
    `;

    // 2. Consulta principal que une los IDs únicos con la tabla Usuario para obtener los nombres
    const query = `
        SELECT 
            T.idUsuario,
            U.nombre,
            U.apellido
        FROM 
            ( ${queryIds} ) T
        JOIN
            Usuario U ON T.idUsuario = U.idUsuario
        ORDER BY
            U.nombre ASC;
    `;

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(query);
        return rows;
    } catch (error) {
        console.error(`Error en DAL al obtener usuarios por rol (${roleColumn}):`, error);
        throw new Error('Error de base de datos al obtener opciones de filtro.');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
export const getUniqueEvaluadoresDAL = () => getUsersByRoleIds('idEvaluador');
export const getUniqueEvaluadosDAL = () => getUsersByRoleIds('idEvaluado');
export const getUniqueUsersForActionDAL = () => getUsersByRoleIds('id_usuario_accion');

export const getUniqueEvaluacionIdsDAL = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        const query = `
            SELECT DISTINCT idEvaluacion
            FROM Evaluacion_AUD
            ORDER BY idEvaluacion ASC;
        `;
        const [rows] = await connection.query(query);
        return rows;
    } catch (error) {
        console.error('Error en DAL al obtener IDs de evaluación únicos para filtros:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};
