import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { rol, idUsuario } = await request.json();

    let query = `
      SELECT 
        e.fechaHora,
        e.puntuacionActitud,
        e.puntuacionEstructura,
        e.puntuacionProtocolos,
        e.observaciones,
        ue.nombre AS nombreEvaluado,
        ue.apellido AS apellidoEvaluado,
        c.nombre AS nombreCampaña
      FROM Evaluacion e
      JOIN Usuario ue ON ue.idUsuario = e.idEvaluado
      JOIN Campaña c ON c.idCampaña = e.idCampaña
    `;
    
    let params = [];

    if (rol === 'Operador') {
      query += ' WHERE ue.idUsuario = ?';
      params.push(idUsuario);
    } else if (rol === 'TeamLeader') {
      query += ' WHERE ue.idTeamLeader = ?';
      params.push(idUsuario);
    }

    const [rows] = await pool.query(query, params);

    return Response.json({ success: true, evaluaciones: rows });
  } catch (error) {
    console.error('Error en /api/reports:', error);
    return Response.json({ success: false, error: 'Error al obtener reportes' }, { status: 500 });
  }
}
