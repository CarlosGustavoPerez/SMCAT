import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { rol, idUsuario } = await request.json();

    let query = `
      SELECT DISTINCT ue.idUsuario, ue.nombre, ue.apellido
      FROM Evaluacion e
      JOIN Usuario ue ON ue.idUsuario = e.idEvaluado
      WHERE 1 = 1
    `;
    const params = [];

    if (rol === 'Operador') {
      query += ' AND ue.idUsuario = ?';
      params.push(idUsuario);
    } else if (rol === 'TeamLeader') {
      query += ' AND ue.idTeamLeader = ?';
      params.push(idUsuario);
    }

    const [rows] = await pool.query(query, params);

    return Response.json({ success: true, operadores: rows });
  } catch (error) {
    console.error('Error al obtener operadores:', error);
    return Response.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
