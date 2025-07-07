import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { dateFrom, dateTo, operator, campaign, rol, idUsuario } = await request.json();

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

    // Filtros por rol
    if (rol === 'Operador') {
      query += ' AND ue.idUsuario = ?';
      params.push(idUsuario);
    } else if (rol === 'TeamLeader') {
      query += ' AND ue.idTeamLeader = ?';
      params.push(idUsuario);
    }

    // Filtros opcionales
    if (dateFrom) {
      query += ' AND e.fechaHora >= ?';
      params.push(dateFrom + ' 00:00:00');
    }
    if (dateTo) {
      query += ' AND e.fechaHora <= ?';
      params.push(dateTo + ' 23:59:59');
    }
    if (operator) {
      query += ' AND CONCAT(ue.nombre, " ", ue.apellido) LIKE ?';
      params.push('%' + operator.replace('-', ' ') + '%');
    }
    if (campaign) {
      query += ' AND c.nombre = ?';
      params.push(campaign);
    }

    query += ' ORDER BY e.fechaHora DESC';

    const [rows] = await pool.query(query, params);

    return Response.json({ success: true, evaluaciones: rows });
  } catch (error) {
    console.error('Error en reportes:', error);
    return Response.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
